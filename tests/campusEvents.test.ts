import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ALL_SUB_TILES, type GameState } from '../src/types';
import { DEFAULT_LAW_SYSTEM } from '../src/data/laws';
import { advanceCampusEvents, availableCampusSituations, canDrawCampusDocument, drawCampusDocument } from '../src/engine/campusEvents';
import { advanceYangRebellions } from '../src/engine/yangRebellions';
import { deserializeGameState, serializeGameState } from '../src/engine/saveSystem';
import { getCommandState } from '../src/engine/commandSystem';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import CommandPanel from '../src/components/CommandPanel';
import EventPopup from '../src/components/EventPopup';

function fixture(): GameState {
  return {
    date: new Date(2023, 8, 1), isPaused: false, gameSpeed: 1,
    stats: { pp: 300, tpr: 1000, ss: 50, stab: 60, studentSanity: 65, allianceUnity: 50, partyCentralization: 50, radicalAnger: 0, capitalPenetration: 0 },
    modifiers: {}, leader: { name: '杨玉乐', title: '副校长', portrait: 'yang_yule', ideology: 'authoritarian' },
    flags: {}, currentFocusTree: 'treeB', lawSystem: { ...DEFAULT_LAW_SYSTEM },
    chronicle: [], nationalSpirits: [], advisors: [], ideologies: {}, activeFocus: null, completedFocuses: [], crises: [], decisionCooldowns: {}, activeEvent: null, activeStoryEvents: [], activeSuperEvent: null, activeMinigame: null, unlockedMinigames: [],
    mapLocations: Object.fromEntries([...new Set(ALL_SUB_TILES.map(t => t.buildingId))].map(id => [id, { id, name: id, studentControl: 50, defenseDays: 0 }])),
    yangYuleState: { fengFavor: 60, teacherSupport: 60, health: 80, thermosUsesThisWeek: 0, medicineUsesThisWeek: 0, dailyDecisionUsed: false, rebelLocations: {}, unlockedMechanics: { desk: true, health: true, map: true }, titleStage: 0 },
  } as GameState;
}
function later(s: GameState, n: number) { const date = new Date(s.date); date.setDate(date.getDate() + n); return { ...s, date, activeEvent: null }; }
function pick(s: GameState, id: string) {
  const candidates = availableCampusSituations(s, 'document'), index = candidates.findIndex(e => e.id === id);
  assert.ok(index >= 0, `${id} should be eligible`);
  return drawCampusDocument(s, () => (index + .1) / candidates.length);
}
function finish(s: GameState, option = 0) { return { ...s, ...s.activeEvent!.choices![option].effect!(s), activeEvent: null }; }

test('documents cannot be redrawn the same day; count increases only upon resolution', () => {
  const original = fixture(), s = pick(original, 'authorship');
  assert.equal(original.stats.pp, 300);
  assert.equal(s.stats.pp, 295);
  assert.equal(s.flags.yang_yule_decisions_clicked, undefined);
  const done = finish(s);
  assert.equal(done.flags.yang_yule_decisions_clicked, 1);
  assert.equal(drawCampusDocument(done), done);
  assert.deepEqual(s.activeEvent!.choices![0].effect!(done), {});
});
test('a normal Yang start has ten distinct files without forcing a crisis', () => {
  let s = fixture(); const descriptions = new Set<string>();
  for (let i = 0; i < 10; i++) {
    const selected = drawCampusDocument(s, () => 0);
    assert.notEqual(selected, s);
    descriptions.add(selected.activeEvent!.description);
    s = later(finish(selected), 1);
  }
  assert.equal(descriptions.size, 10);
  assert.equal(s.flags.yang_yule_decisions_clicked, 10);
});
test('an identical variant never repeats, even after family cooldown', () => {
  const done = finish(pick(fixture(), 'authorship'));
  assert.ok(!availableCampusSituations(later(done, 100), 'document').some(e => e.id === 'authorship'));
});
test('phase change gets new text and effects, while family cooldown survives transition', () => {
  const early = pick(fixture(), 'authorship'), done = finish(early);
  const review = { ...later(done, 15), yangYuleState: { ...done.yangYuleState!, titleStage: 2, titleProgress: 30 } };
  assert.ok(!availableCampusSituations({ ...review, date: later(done, 1).date }, 'document').some(e => e.id === 'authorship'));
  const late = pick(review, 'authorship');
  assert.notEqual(late.activeEvent!.description, early.activeEvent!.description);
  assert.match(late.activeEvent!.description, /评审组/);
  assert.equal(finish(late).yangYuleState!.titleProgress, 32);
});
test('laws, support, capital, season and actual person presence gate events', () => {
  const s = fixture(), ids = (state: GameState) => availableCampusSituations(state, 'document').map(e => e.id);
  assert.ok(!ids(s).includes('winter')); assert.ok(!ids(s).includes('health')); assert.ok(!ids(s).includes('tutoring'));
  assert.ok(ids({ ...s, date: new Date(2023, 11, 1) }).includes('winter'));
  assert.ok(ids({ ...s, stats: { ...s.stats, capitalPenetration: 40 } }).includes('textbooks'));
  assert.ok(ids({ ...s, stats: { ...s.stats, ss: 20 } }).includes('unrest'));
  assert.ok(!ids({ ...s, lawSystem: { ...DEFAULT_LAW_SYSTEM, discipline: 'full_autonomy' } }).includes('contraband'));
  assert.ok(!ids({ ...s, currentFocusTree: 'treeA_haobang', leader: { ...s.leader, name: '豪邦' } }).includes('thermos'));
});
test('campus affairs cover other routes without resurrecting stale Yang mechanics', () => {
  for (const tree of ['phase1', 'treeA', 'treeA_pan', 'treeA_true_left', 'treeA_haobang', 'treeA_lu_bohan', 'wu_tree', 'jidi_tree', 'gouxiong_tree']) {
    const s = { ...fixture(), currentFocusTree: tree, leader: { ...fixture().leader, name: '其他领袖' } };
    let rolls = 0;
    const drawn = advanceCampusEvents(s, () => ++rolls === 1 ? .01 : .99);
    assert.ok(drawn.activeEvent, tree);
    const done = finish(drawn);
    assert.equal(done.yangYuleState, s.yangYuleState);
    assert.equal(done.flags.yang_yule_decisions_clicked, undefined);
  }
});
test('daily events respect spacing, pending story, minigame and ending priorities', () => {
  const s = fixture(), drawn = advanceCampusEvents(s, () => 0), done = finish(drawn);
  assert.equal(advanceCampusEvents(later(done, 9), () => 0).activeEvent, null);
  for (const block of [{ activeEvent: drawn.activeEvent }, { activeStoryEvents: [drawn.activeEvent!] }, { gameEnding: 'game_over_school' }, { activeMinigame: 'siege' }]) {
    const blocked = { ...s, ...block } as GameState;
    assert.equal(advanceCampusEvents(blocked, () => 0), blocked);
    assert.equal(canDrawCampusDocument(blocked), false);
  }
});
test('exhausted file pool costs nothing', () => {
  let s = fixture();
  while (canDrawCampusDocument(s)) s = later(finish(drawCampusDocument(s, () => 0)), 1);
  const pp = s.stats.pp;
  assert.equal(drawCampusDocument(s), s); assert.equal(s.stats.pp, pp);
});
test('unaffordable ambient affairs can be deferred without awarding file credit', () => {
  const drawn = pick(fixture(), 'authorship');
  drawn.stats.pp = 0;
  const choice = drawn.activeEvent!.choices!.find(c => c.id === 'defer')!;
  const done = { ...drawn, ...choice.effect!(drawn) };
  assert.equal(done.stats.pp, 0); assert.equal(done.stats.ss, 49);
  assert.equal(done.flags.yang_yule_decisions_clicked, undefined);
  assert.equal(drawCampusDocument({ ...fixture(), stats: { ...fixture().stats, pp: 4 } }).stats.pp, 4);
});
test('saved pending event restores choices, disabled conditions and once-only resolution', () => {
  const drawn = pick(fixture(), 'authorship');
  const saved = deserializeGameState(serializeGameState(drawn))!;
  assert.equal(saved.activeEvent!.description, drawn.activeEvent!.description);
  assert.equal(typeof saved.activeEvent!.choices![0].effect, 'function');
  const done = finish(saved);
  assert.equal(done.flags.yang_yule_decisions_clicked, 1);
  assert.deepEqual(saved.activeEvent!.choices![0].effect!(done), {});
  assert.equal(availableCampusSituations(later(done, 50), 'document').some(e => e.id === 'authorship'), false);
});
test('field coordination consumes one reserve and advertises exactly its effects', () => {
  let s = fixture(); s = { ...s, command: { ...getCommandState(s), preparation: { yang: 2 } }, yangYuleState: { ...s.yangYuleState!, health: 40, titleStage: 2, titleProgress: 30 } };
  const drawn = pick(s, 'health');
  const saved = deserializeGameState(serializeGameState(drawn))!;
  const choice = saved.activeEvent!.choices!.find(c => c.id === 'field_coordination')!;
  const partial = choice.effect!(saved), done = { ...saved, ...partial };
  assert.equal(done.command!.preparation!.yang, 1);
  assert.equal(done.stats.ss, 54); assert.equal(done.stats.stab, 63);
  assert.equal(done.yangYuleState!.health, 40); assert.equal(done.yangYuleState!.titleProgress, 30);
  assert.deepEqual(choice.effect!(done), {});
  const depleted = { ...drawn, command: { ...drawn.command!, preparation: { yang: 0 } } };
  const restored = deserializeGameState(serializeGameState(depleted))!;
  assert.equal(restored.activeEvent!.choices!.find(c => c.id === 'field_coordination')!.disabled!(restored), true);
});
test('failure cooldown prevents immediate respawn and combines losses with bounded penalty', () => {
  const s = fixture(), ids = ALL_SUB_TILES.slice(0, 3).map(t => t.id);
  s.stats.ss = 10; s.stats.radicalAnger = 80;
  s.yangYuleState!.rebelLocations = Object.fromEntries(ids.map(id => [id, 1]));
  const result = advanceYangRebellions(s, () => 0);
  assert.deepEqual(result.failed, ids);
  for (const id of ids) { assert.equal(result.state.yangYuleState!.rebelCooldowns![id], 14); assert.equal(result.state.yangYuleState!.rebelLocations[id], undefined); }
  assert.equal(result.state.stats.stab, 42);
  assert.ok(Object.keys(result.state.yangYuleState!.rebelLocations).length <= 1);
  assert.equal(s.stats.stab, 60);
});
test('stable campuses and departed Yang routes do not spawn rebellion', () => {
  assert.equal(Object.keys(advanceYangRebellions(fixture(), () => 0).state.yangYuleState!.rebelLocations).length, 0);
  const other = { ...fixture(), currentFocusTree: 'treeA_haobang' };
  assert.equal(advanceYangRebellions(other, () => 0).state, other);
});
test('compact panel folds rules and event choices show unavailable states', () => {
  const panel = renderToStaticMarkup(React.createElement(CommandPanel, { state: fixture(), tileId: 'b3_tower', setGameState: () => {} }));
  assert.match(panel, /<details/); assert.match(panel, /协同规则/); assert.ok(!panel.includes('command-dispatch'));
  const drawn = pick(fixture(), 'authorship'); drawn.stats.pp = 0;
  const popup = renderToStaticMarkup(React.createElement(EventPopup, { event: drawn.activeEvent!, state: drawn, onConfirm: () => {} }));
  assert.match(popup, /disabled=""/);
});
