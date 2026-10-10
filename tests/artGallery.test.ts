import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ARTWORKS } from '../src/data/artGallery';
import { ENDING_BY_ID } from '../src/data/endings';
import { LOADING_ART } from '../src/config/loadingArtwork';
import { getArtUnlocks, getEarnedArtwork, unlockEarnedArtwork, pickLoadingArtwork, createLoadingArtworkSequence, ART_UNLOCK_KEY, type ArtProgress } from '../src/engine/artGallery';

const progress = (changes: Partial<ArtProgress> = {}): ArtProgress => ({ currentFocusTree: 'phase1', completedFocuses: [], activeEvent: null, activeSuperEvent: null, chronicle: [], ...changes });
const names = (state: ArtProgress) => getEarnedArtwork(state).map(work => work.name);
function memoryStorage(seed: Record<string, string> = {}, rejectWrites = false) {
  const data = { ...seed };
  return { getItem: (key: string) => data[key] ?? null, setItem: (key: string, value: string) => { if (rejectWrites) throw new Error('quota exceeded'); data[key] = value; } };
}

test('catalog covers every bundled CG exactly once and uses real ending identifiers', () => {
  assert.deepEqual(ARTWORKS.map(work => work.name).sort(), Object.keys(LOADING_ART).sort());
  const focusIds = new Set([...readFileSync(new URL('../src/components/FocusTree.tsx', import.meta.url), 'utf8').matchAll(/\bid:\s*'([^']+)'\s*,\s*title:/g)].map(match => match[1]));
  for (const work of ARTWORKS) for (const id of work.focuses ?? []) assert.ok(focusIds.has(id), `${work.name}: unknown focus ${id}`);
  for (const work of ARTWORKS) for (const id of work.endings ?? []) assert.ok(ENDING_BY_ID[id], `${work.name}: unknown ending ${id}`);
});

test('gallery visits and obsolete viewed records never unlock unplayed routes', () => {
  const storage = memoryStorage({ heyi_art_room_viewed_v1: JSON.stringify(ARTWORKS.map(work => work.name)) });
  const unlocked = getArtUnlocks(storage);
  assert.deepEqual(Object.keys(unlocked), ARTWORKS.filter(work => work.scenery).map(work => work.name));
  assert.ok(!unlocked['行政楼']); assert.ok(!unlocked['合一之春2']);
  assert.deepEqual(names(progress()), ARTWORKS.filter(work => work.scenery || work.opening).map(work => work.name));
});

test('at least five scenery CGs are available on a new device before any campaign', () => {
  const storage = memoryStorage();
  const scenery = ARTWORKS.filter(work => work.scenery);
  assert.ok(scenery.length >= 5);
  for (const work of scenery) assert.ok(getArtUnlocks(storage)[work.name]);
  assert.equal(storage.getItem(ART_UNLOCK_KEY), null, 'initial scenery needs no storage write');
});

test('playing one branch never reveals another branch or its alternate ending', () => {
  const cases = [
    ['treeA_pan', '合一之春2', '合一文革'], ['treeA_true_left', '合一文革', '合一文革2'],
    ['treeA_lu_bohan', '合一文革2', '合一文革'], ['treeA_haobang', '合一之春', '合一之春2'],
    ['jidi_tree', '及第之梦', '内卷'], ['treeB', '特级教师', '特级'],
    ['gouxiong_tree', '裤熊逢春', '校园涂鸦1'], ['wu_tree_p2_feng', '清场', '封安宝时代'],
  ];
  for (const [tree, earned, locked] of cases) {
    const collected = names(progress({ currentFocusTree: tree }));
    assert.ok(collected.includes(earned), tree); assert.ok(!collected.includes(locked), `${tree} leaks ${locked}`);
  }
});

test('milestone art requires completed focus, actual event or its specific ending', () => {
  assert.ok(!names(progress({ currentFocusTree: 'treeA' })).includes('批斗'));
  assert.ok(names(progress({ completedFocuses: ['trial_yang'] })).includes('批斗'));
  assert.ok(names(progress({ completedFocuses: ['jidi_hidden_riot'] })).includes('内卷'));
  assert.ok(names(progress({ activeSuperEvent: { id: 'yang_yule_fail', title: '评定失败', quote: '', author: '' } })).includes('特级0'));
  const ruin = names(progress({ gameEnding: 'game_over_gouxiong' }));
  assert.ok(ruin.includes('校园涂鸦1')); assert.ok(!ruin.includes('校园涂鸦2'));
  assert.ok(!names(progress({ currentFocusTree: 'treeA_pan' })).includes('第一张选票'));
  assert.ok(names(progress({ completedFocuses: ['first_democratic_election'] })).includes('第一张选票'));
  assert.ok(!names(progress({ currentFocusTree: 'jidi_tree' })).includes('企业学校的黄昏'));
  assert.ok(names(progress({ completedFocuses: ['jidi_corporate_utopia'] })).includes('企业学校的黄昏'));
  assert.ok(!names(progress({ currentFocusTree: 'treeA_true_left' })).includes('课桌上的改革'));
  assert.ok(names(progress({ completedFocuses: ['reform_focus_3'] })).includes('课桌上的改革'));
});

test('old save route history and existing ending archive retain earned artwork', () => {
  assert.ok(names(progress({ chronicle: [{ date: 1, type: 'route', title: '路线转折', routeTag: '杨玉乐线' }] })).includes('特级教师'));
  const storage = memoryStorage({ tno_endings_unlock_v1: JSON.stringify({ unlocked: { game_over_jidi_1: 1234, game_over_gouxiong: 2345 } }) });
  const unlocked = getArtUnlocks(storage);
  assert.equal(unlocked['及第之梦'], 1234); assert.equal(unlocked['裤熊逢春'], 2345); assert.equal(unlocked['校园涂鸦1'], 2345);
  assert.equal(unlocked['内卷'], undefined); assert.equal(unlocked['校园涂鸦2'], undefined); assert.equal(unlocked['合一文革'], undefined);
});

test('unlock is once per device across saves, new games and repeated React effects', () => {
  const storage = memoryStorage();
  assert.equal(unlockEarnedArtwork(progress(), storage, 1000).length, 4);
  assert.equal(unlockEarnedArtwork(progress(), storage, 2000).length, 0);
  assert.deepEqual(unlockEarnedArtwork(progress({ currentFocusTree: 'treeB' }), storage, 3000).map(work => work.name), ['特级教师', '保温杯与红批']);
  assert.equal(unlockEarnedArtwork(progress(), storage, 4000).length, 0);
  assert.equal(getArtUnlocks(storage)['特级教师'], 3000);
});

test('unavailable/quota-full storage preserves session progress without duplicate popups', () => {
  const storage = memoryStorage({}, true);
  assert.equal(unlockEarnedArtwork(progress(), storage, 1000).length, 4);
  assert.equal(unlockEarnedArtwork(progress(), storage, 2000).length, 0);
  assert.equal(Object.keys(getArtUnlocks(storage)).length, ARTWORKS.filter(work => work.scenery || work.opening).length);
  const broken = memoryStorage({ [ART_UNLOCK_KEY]: 'not json' });
  assert.doesNotThrow(() => unlockEarnedArtwork(progress(), broken, 1000));
});

test('locked loading previews do not unlock art and the category boundary is 30 percent', () => {
  const storage = memoryStorage();
  const unlocked = getArtUnlocks(storage);
  for (const roll of [0, .1, .299999]) {
    let calls = 0;
    const work = pickLoadingArtwork(unlocked, () => calls++ === 0 ? roll : .5);
    assert.ok(!unlocked[work.name], `roll ${roll} should preview uncollected art`);
  }
  for (const roll of [.3, .7, .99999]) {
    let calls = 0;
    const work = pickLoadingArtwork(unlocked, () => calls++ === 0 ? roll : .5);
    assert.ok(unlocked[work.name], `roll ${roll} should show collected art`);
  }
  assert.equal(storage.getItem(ART_UNLOCK_KEY), null);
  assert.deepEqual(getArtUnlocks(storage), unlocked);
});

test('loading distribution is precisely 30 percent locked and 70 percent unlocked', () => {
  const unlocked = { ...getArtUnlocks(memoryStorage()), '特级教师': 123 };
  const counts = { locked: 0, unlocked: 0 };
  for (let i = 0; i < 10000; i++) {
    let calls = 0;
    const work = pickLoadingArtwork(unlocked, () => calls++ === 0 ? i / 10000 : .5);
    counts[unlocked[work.name] ? 'unlocked' : 'locked']++;
  }
  assert.deepEqual(counts, { locked: 3000, unlocked: 7000 });
});

test('loading falls back after full collection and avoids consecutive repeated artwork', () => {
  const all = Object.fromEntries(ARTWORKS.map(work => [work.name, 1]));
  const sequence = createLoadingArtworkSequence(all, 5, () => 0);
  assert.equal(sequence.length, 5);
  for (const [index, work] of sequence.entries()) {
    assert.ok(all[work.name]);
    if (index) assert.notEqual(work.name, sequence[index - 1].name);
  }
  // Scenery remains initially open even if a caller provides no persisted unlocks.
  assert.ok(pickLoadingArtwork({}, () => .5).scenery);
  const mixed = createLoadingArtworkSequence(getArtUnlocks(memoryStorage()), 5, () => .1);
  for (const [index, work] of mixed.entries()) {
    assert.ok(!work.scenery);
    if (index) assert.notEqual(work.name, mixed[index - 1].name);
  }
});
