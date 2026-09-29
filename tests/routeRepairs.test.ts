import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { GameState, NationalSpirit } from '../src/types';
import { DEFAULT_LAW_SYSTEM } from '../src/data/laws';
import { availableYangDeskDocuments, canDrawYangDeskDocument, drawYangDeskDocument } from '../src/engine/yangDeskDocuments';
import { reconcileRouteSpirits } from '../src/engine/routeSpirits';
import { deserializeGameState, serializeGameState } from '../src/engine/saveSystem';

function fixture(tree = 'treeB'): GameState {
  return {
    date: new Date(2023, 8, 1), isPaused: false, gameSpeed: 1,
    currentFocusTree: tree, leader: { name: '杨玉乐', title: '副校长', portrait: 'yang_yule', ideology: 'authoritarian' },
    stats: { pp: 100, tpr: 500, ss: 50, stab: 60, studentSanity: 55, allianceUnity: 50, partyCentralization: 50, radicalAnger: 0, capitalPenetration: 0 },
    lawSystem: { ...DEFAULT_LAW_SYSTEM }, flags: {}, chronicle: [], nationalSpirits: [], advisors: [], ideologies: {},
    activeFocus: null, completedFocuses: [], crises: [], decisionCooldowns: {}, activeEvent: null, activeStoryEvents: [], activeSuperEvent: null, activeMinigame: null, unlockedMinigames: [], mapLocations: {},
    yangYuleState: { fengFavor: 50, teacherSupport: 60, health: 75, thermosUsesThisWeek: 0, medicineUsesThisWeek: 0, dailyDecisionUsed: false, rebelLocations: {}, unlockedMechanics: { desk: true, health: true, map: true }, titleStage: 0 },
  } as GameState;
}
const spirit = (id: string): NationalSpirit => ({ id, name: id, description: '', type: 'neutral' });

test('Yang desk restores its original story files without displacing campus affairs', () => {
  const start = fixture();
  assert.ok(availableYangDeskDocuments(start).length >= 10, 'ordinary Yang start should have a substantial original file pool');
  assert.ok(availableYangDeskDocuments(start).includes('yang_desk_contraband_list'));
  const original = drawYangDeskDocument(start, () => 0);
  assert.match(original.activeEvent!.id, /^yang_desk_/);
  assert.equal(original.stats.pp, 95);
  assert.equal(original.flags.yang_yule_decisions_clicked, 1);
  assert.equal(canDrawYangDeskDocument(original), false);
  const nextDay = { ...original, date: new Date(2023, 8, 2), activeEvent: null };
  assert.ok(!availableYangDeskDocuments(nextDay).includes(original.activeEvent!.id));
  const campus = drawYangDeskDocument(nextDay, () => .99);
  assert.match(campus.activeEvent!.id, /^campus:/);
});

test('Yang desk keeps plot, health and season gates and restores original event choices after save', () => {
  const start = fixture();
  assert.ok(!availableYangDeskDocuments(start).includes('yang_desk_midnight_call'));
  assert.ok(!availableYangDeskDocuments(start).includes('yang_desk_snow_day'));
  const late = { ...start, date: new Date(2023, 11, 1), stats: { ...start.stats, radicalAnger: 60 }, yangYuleState: { ...start.yangYuleState!, titleStage: 2, health: 35 } };
  const ids = availableYangDeskDocuments(late);
  for (const id of ['yang_desk_midnight_call', 'yang_desk_snow_day', 'yang_desk_health_scare', 'yang_desk_retirement_letter']) assert.ok(ids.includes(id), id);
  const drawn = drawYangDeskDocument(start, () => 0);
  const restored = deserializeGameState(serializeGameState(drawn))!;
  assert.equal(restored.activeEvent?.id, drawn.activeEvent?.id);
  assert.equal(typeof restored.activeEvent?.choices?.[0].effect, 'function');
});

test('route transitions remove incompatible spirits but retain shared history and law spirits', () => {
  const start = { ...fixture('jidi_tree'), nationalSpirits: [
    spirit('red_campus'), spirit('assembly_dynamics'), spirit('path_of_democracy'), spirit('haobang_legacy_guard'),
    spirit('jidi_corporate_rule'), spirit('jidi_minor_spirit_3'), spirit('law_spirit_schedule'), spirit('exam_pressure'),
  ] };
  const inJidi = reconcileRouteSpirits(start);
  assert.deepEqual(inJidi.nationalSpirits.map(s => s.id), ['jidi_corporate_rule', 'jidi_minor_spirit_3', 'law_spirit_schedule', 'exam_pressure']);
  const afterTakeover = reconcileRouteSpirits({ ...inJidi, currentFocusTree: 'gouxiong_tree' });
  assert.deepEqual(afterTakeover.nationalSpirits.map(s => s.id), ['law_spirit_schedule']);
});

test('related revolutionary paths preserve common spirits and remove abandoned branch spirits', () => {
  const state = { ...fixture('treeA_true_left'), nationalSpirits: [
    spirit('red_campus'), spirit('teacher_support'), spirit('wang_pan_pact'), spirit('path_of_democracy'), spirit('two_chariots_distrust'), spirit('haobang_assembly_charter'),
  ] };
  assert.deepEqual(reconcileRouteSpirits(state).nationalSpirits.map(s => s.id), ['red_campus', 'teacher_support', 'wang_pan_pact']);
  const democracy = reconcileRouteSpirits({ ...state, currentFocusTree: 'treeA_pan' });
  assert.ok(democracy.nationalSpirits.some(s => s.id === 'path_of_democracy'));
});

test('within a route, mutually exclusive endings discard the losing branch spirits', () => {
  const state = { ...fixture('wu_tree_p2_spring'), nationalSpirits: [
    spirit('wu_martial_law_spirit'), spirit('wu_rule_of_law_spirit'), spirit('wu_iron_curtain_spirit'), spirit('law_spirit_discipline'),
  ] };
  assert.deepEqual(reconcileRouteSpirits(state).nationalSpirits.map(s => s.id), ['wu_martial_law_spirit', 'law_spirit_discipline']);
  const desperate = { ...fixture('treeA_pan'), nationalSpirits: [spirit('desperate_defense'), spirit('red_campus')] };
  assert.deepEqual(reconcileRouteSpirits(desperate).nationalSpirits.map(s => s.id), ['red_campus']);
});

test('old saves shed spirits from abandoned routes on load', () => {
  const oldSave = { ...fixture('treeB'), nationalSpirits: [spirit('red_campus'), spirit('jidi_corporate_rule'), spirit('yang_yule_regime'), spirit('law_spirit_schedule')] };
  const restored = deserializeGameState(serializeGameState(oldSave))!;
  assert.deepEqual(restored.nationalSpirits.map(s => s.id), ['yang_yule_regime', 'law_spirit_schedule']);
});
