import assert from 'node:assert/strict';
import test from 'node:test';
import type { GameState } from '../src/types';
import { advanceHeyiLight, getHeyiLightSnapshot, getHeyiLightTarget, getHeyiRoute } from '../src/engine/heyiLight';

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    currentFocusTree: 'phase1', completedFocuses: [], flags: {}, gameEnding: undefined,
    heyiLightValue: 50,
    stats: { pp: 50, stab: 50, ss: 50, tpr: 50, capitalPenetration: 0, radicalAnger: 50, allianceUnity: 50, partyCentralization: 50, studentSanity: 50 },
    ...overrides,
  } as GameState;
}

test('route observations change across democratic victory, authoritarian school, and Jidi riot', () => {
  const democratic = getHeyiLightSnapshot(makeState({ currentFocusTree: 'treeA_pan', gameEnding: 'game_over_pan', heyiLightValue: 78 }));
  const military = getHeyiLightSnapshot(makeState({ currentFocusTree: 'wu_tree_p2_coup', heyiLightValue: 24 }));
  const riot = getHeyiLightSnapshot(makeState({ currentFocusTree: 'jidi_tree', flags: { jidi_riot_active: true }, heyiLightValue: 9 }));
  assert.equal(democratic.route, 'democracy');
  assert.equal(democratic.democraticVictory, true);
  assert.equal(military.route, 'wu');
  assert.equal(riot.route, 'jidi_riot');
  assert.match(democratic.zones.students.description, /候选人/);
  assert.match(military.zones.building.description, /摄像头/);
  assert.match(riot.zones.building.description, /火/);
  assert.notEqual(democratic.accent, riot.accent);
  assert.equal(getHeyiLightSnapshot(makeState({ currentFocusTree: 'treeA_pan', gameEnding: 'game_over_pan', heyiLightValue: 35 })).democraticVictory, true);
  assert.equal(getHeyiRoute(makeState({ currentFocusTree: 'jidi_tree', flags: { jidi_riot_active: true }, gameEnding: 'game_over_jidi_1' })), 'jidi');
});

test('old saves begin at 50 and law differences move the target without abrupt jumps', () => {
  const oldSave = makeState({ heyiLightValue: undefined });
  assert.equal(getHeyiLightSnapshot(oldSave).value, 50);
  const strict = makeState({ lawSystem: { discipline: 'panopticon', schedule: 'hengshui_schedule', personnel: 'principal_decree', education: 'exam_above_all', assessment: 'daily_testing', clubs: 'clubs_frozen' } });
  const open = makeState({ lawSystem: { discipline: 'full_autonomy', schedule: 'free_schedule', personnel: 'student_assembly_hr', education: 'quality_education', assessment: 'project_assessment', clubs: 'student_clubs' } });
  assert.ok(getHeyiLightTarget(open) > getHeyiLightTarget(strict) + 15);
  assert.ok(Math.abs(advanceHeyiLight(open) - 50) <= 0.45);
  assert.ok(Math.abs(advanceHeyiLight(strict) - 50) <= 0.45);
});

test('the observation spirit is permanent flavor with no stat effects', () => {
  const state = makeState({ currentFocusTree: 'jidi_tree', heyiLightValue: 12 });
  const { spirit, mood, zones } = getHeyiLightSnapshot(state);
  assert.equal(spirit.id, 'heyi_light');
  assert.equal(spirit.type, 'neutral');
  assert.equal(spirit.effects, undefined);
  assert.equal(mood, 'ruin');
  assert.equal(Object.keys(zones).length, 8);
  assert.match(spirit.description, /合一值 12\/100/);
  assert.equal(getHeyiRoute(state), 'jidi');
});

test('regional spirit readings respond to both route and campus conditions', () => {
  const hopeful = getHeyiLightSnapshot(makeState({ currentFocusTree: 'treeA_pan', heyiLightValue: 82 }));
  const exhausted = getHeyiLightSnapshot(makeState({
    currentFocusTree: 'treeA_pan', heyiLightValue: 82,
    stats: { ...makeState().stats, studentSanity: 12, stab: 10 },
  }));
  const crackdown = getHeyiLightSnapshot(makeState({ currentFocusTree: 'wu_tree_p2_coup', heyiLightValue: 50 }));
  assert.equal(hopeful.zones.road.status, '干净整洁');
  assert.equal(hopeful.zones.road.tone, 'good');
  assert.equal(exhausted.zones.students.status, '行尸走肉');
  assert.equal(exhausted.zones.road.tone, 'danger');
  assert.equal(crackdown.zones.students.status, '噤若寒蝉');
  for (const entry of Object.values(crackdown.zones)) assert.equal([...entry.status].length, 4);
});

test('value and target remain finite and inside 0–100 with malformed legacy data', () => {
  const state = makeState({ heyiLightValue: Number.NaN, stats: { ...makeState().stats, stab: Number.NaN, ss: -500, studentSanity: 200 } });
  const next = advanceHeyiLight(state);
  assert.ok(Number.isFinite(next));
  assert.ok(next >= 0 && next <= 100);
  assert.ok(getHeyiLightTarget(state) >= 0 && getHeyiLightTarget(state) <= 100);
});
