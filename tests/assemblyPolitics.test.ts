import test from 'node:test';
import assert from 'node:assert/strict';
import type { GameState } from '../src/types';
import { INITIAL_ASSEMBLY, getCrossroadsOutcome, applyYangSettlement, transferSeats, assemblyCrisisKind, shouldTriggerAssemblyCrisis, expireAssemblyCrisis, cleanAssemblyCrises } from '../src/engine/assemblyPolitics';
import { nextOpeningGuidance } from '../src/engine/campaignGuidance';
import { getFocusNodes } from '../src/components/FocusTree';
import { getAvailableAdvisors } from '../src/data/advisors';
import { FLAVOR_EVENTS } from '../src/data/flavorEvents';
import { serializeGameState, deserializeGameState } from '../src/engine/saveSystem';
import { placeFocusTooltip } from '../src/engine/tooltipPosition';

function fixture(): GameState {
  return { date: new Date(2023, 9, 10), flags: { assembly_unlocked: true }, currentFocusTree: 'treeA',
    stats: { pp: 200, tpr: 500, stab: 60, ss: 60, studentSanity: 60, radicalAnger: 30, allianceUnity: 50, partyCentralization: 60, capitalPenetration: 10 },
    modifiers: { ppDaily: 0, stabDaily: 0, ssDaily: 0, tprDaily: 0, studentSanityDaily: 0, capitalPenetrationDaily: 0, radicalAngerDaily: 0, allianceUnityDaily: 0, partyCentralizationDaily: 0, powerBalanceDaily: 0 },
    nationalSpirits: [], advisors: [{ id: 'yang_yule', name: '杨玉乐', title: '教师', description: '', cost: 100, modifiers: {} }, null],
    leader: { name: '王照凯', title: '主席', portrait: 'wang_zhaokai', ideology: 'radical_socialism' },
    studentAssemblyFactions: { ...INITIAL_ASSEMBLY }, completedFocuses: [], crises: [], activeEvent: null, activeStoryEvents: [], activeSuperEvent: null, activeMinigame: null,
    decisionCooldowns: {}, unlockedMinigames: [], chronicle: [], mapLocations: {}, ideologies: {}, activeFocus: null, isPaused: true, gameSpeed: 1,
  } as GameState;
}
const total = (s: NonNullable<GameState['studentAssemblyFactions']>) => Object.values(s).reduce((n, v) => n + (v ?? 0), 0);

test('settlement focuses actually apply dismissal and redistribute seats once at completion', () => {
  const state = fixture();
  const trial = getFocusNodes('treeA').find(n => n.id === 'trial_yang')!;
  assert.equal(trial.onStart, undefined);
  const change = trial.onComplete!(state);
  assert.equal(change.advisors?.[0], null);
  assert.equal(change.studentAssemblyFactions?.orthodox, 36);
  assert.equal(total(change.studentAssemblyFactions!), 100);
  assert.equal(change.stats?.partyCentralization, 70);
  assert.equal(change.stats?.allianceUnity, 40);
  const done = { ...state, ...change };
  assert.equal(getAvailableAdvisors(done).some(a => a.id === 'yang_yule'), false);
  assert.deepEqual(FLAVOR_EVENTS.event_8_trial.effect!(done), {}, 'acknowledgement cannot repeat completed focus rewards');
  const compromise = getFocusNodes('treeA').find(n => n.id === 'secret_compromise')!.onComplete!(state);
  assert.equal(compromise.studentAssemblyFactions?.pan, 24);
  assert.equal(compromise.studentAssemblyFactions?.testTaker, 18);
  assert.equal(total(compromise.studentAssemblyFactions!), 100);
  assert.equal(compromise.stats?.allianceUnity, 65);
  assert.equal(compromise.stats?.partyCentralization, 50);
  assert.equal(compromise.advisors, undefined, 'compromise retains the existing adviser');
  assert.equal(state.studentAssemblyFactions?.orthodox, 30, 'source state must survive');
});

test('seat redistribution never fabricates seats when donors are exhausted', () => {
  const seats = { orthodox: 1, bear: 0, pan: 99, otherDem: 0, testTaker: 0 };
  const changed = transferSeats(seats, 'pan', 3, ['orthodox', 'bear']);
  assert.equal(changed.pan, 100);
  assert.equal(total(changed), 100);
  assert.ok(Object.values(changed).every(n => n >= 0));
});

test('crossroads preview and actual resolution agree at the new unity boundary and tied majorities', () => {
  const state = fixture();
  state.stats.allianceUnity = 55; state.stats.partyCentralization = 61;
  assert.equal(getCrossroadsOutcome(state), 'true_left');
  assert.equal(FLAVOR_EVENTS.event_10_crossroads.effect!(state).currentFocusTree, 'treeA_true_left');
  state.stats.allianceUnity = 54.9;
  assert.notEqual(getCrossroadsOutcome(state), 'true_left');
  state.stats.allianceUnity = 75; state.stats.partyCentralization = 25;
  state.studentAssemblyFactions = { orthodox: 20, bear: 20, pan: 31, otherDem: 14, testTaker: 15 };
  assert.equal(getCrossroadsOutcome(state), 'democracy');
  assert.equal(FLAVOR_EVENTS.event_10_crossroads.effect!(state).currentFocusTree, 'treeA_pan');
  state.stats.partyCentralization = 65;
  state.studentAssemblyFactions = { orthodox: 30, bear: 10, pan: 30, otherDem: 15, testTaker: 15 };
  assert.equal(getCrossroadsOutcome(state), 'union', 'a tie cannot count as an orthodox majority');
});

test('only committee and democratic routes get their respective political crisis, including legacy saves', () => {
  const state = fixture();
  assert.equal(assemblyCrisisKind(state), 'democratic_power_struggle');
  assert.equal(shouldTriggerAssemblyCrisis(state), true);
  state.stats.allianceUnity = 65;
  assert.equal(shouldTriggerAssemblyCrisis(state), false);
  state.stats.allianceUnity = 50;
  const legacy = { id: 'opposition_slander', title: '旧危机', description: '', daysLeft: 1 };
  for (const tree of ['treeA_true_left', 'treeA_haobang', 'treeA_lu_bohan', 'phase1', 'jidi_tree', 'treeB', 'wu_tree', 'gouxiong_tree']) {
    const old = { ...state, currentFocusTree: tree, crises: [legacy], activeEvent: { id: 'opposition_slander_event', title: '', description: '' },
      activeStoryEvents: [{id:'democratic_power_struggle_event',title:'',description:''},{id:'democratic_power_struggle_result',title:'',description:''}] };
    assert.equal(assemblyCrisisKind(old), null, tree);
    assert.equal(cleanAssemblyCrises(old).crises.length, 0);
    assert.equal(cleanAssemblyCrises(old).activeEvent, null);
    assert.equal(cleanAssemblyCrises(old).activeStoryEvents.length, 0);
    assert.equal(deserializeGameState(serializeGameState(old))?.crises.length, 0);
    assert.deepEqual(expireAssemblyCrisis(old, legacy.id), {});
  }
  assert.equal(assemblyCrisisKind({ ...state, currentFocusTree: 'treeA_pan' }), 'opposition_slander');
});

test('committee conflict has random bounded seats and both signs of unity change, with save-safe expiry', () => {
  const state = fixture();
  const low = expireAssemblyCrisis(state, 'democratic_power_struggle', () => 0);
  const high = expireAssemblyCrisis(state, 'democratic_power_struggle', () => .99999);
  assert.equal(low.studentAssemblyFactions!.pan - state.studentAssemblyFactions!.pan, 1);
  assert.equal(high.studentAssemblyFactions!.pan - state.studentAssemblyFactions!.pan, 3);
  assert.equal(low.stats!.allianceUnity - state.stats.allianceUnity, -3);
  assert.equal(high.stats!.allianceUnity - state.stats.allianceUnity, 3);
  assert.equal(high.stats!.partyCentralization, 55);
  assert.equal(total(high.studentAssemblyFactions!), 100);
  assert.equal(high.flags!.democratic_power_struggle_cooldown, 15);
  const loaded = deserializeGameState(serializeGameState({ ...state, crises: [{ id: 'democratic_power_struggle', title: '争权', description: '', daysLeft: 1 }] }))!;
  assert.equal(expireAssemblyCrisis(loaded, 'democratic_power_struggle', () => 0).studentAssemblyFactions?.pan, 21);
});

test('opening guidance is spaced, once-only, plot-gated, and never follows a route switch', () => {
  const state = { ...fixture(), currentFocusTree: 'phase1', completedFocuses: ['start_2023', 'dorm_talks', 'read_marx'] };
  assert.equal(nextOpeningGuidance(state), 'phase1_returned_petition');
  state.flags.phase1_returned_petition_seen = true;
  assert.equal(nextOpeningGuidance(state), 'phase1_recess_dispute');
  state.flags.opening_guidance_day = 38;
  assert.equal(nextOpeningGuidance(state), null);
  delete state.flags.opening_guidance_day;
  state.flags.phase1_recess_dispute_seen = true;
  assert.equal(nextOpeningGuidance(state), 'phase1_shared_leaflet');
  state.flags.phase1_shared_leaflet_seen = true;
  assert.equal(nextOpeningGuidance(state), null);
  assert.equal(nextOpeningGuidance({ ...state, currentFocusTree: 'treeA' }), null);
  assert.equal(nextOpeningGuidance({ ...state, stats: { ...state.stats, radicalAnger: 81 } }), null);
  state.flags = {};
  assert.equal(nextOpeningGuidance({ ...state, activeEvent: FLAVOR_EVENTS.phase1_start_2023 }), null);
  const beforeB3 = { ...state, stats: { ...state.stats, radicalAnger: 80 } };
  const changed = FLAVOR_EVENTS.phase1_shared_leaflet.effect!(beforeB3);
  assert.equal(getFocusNodes('phase1').find(n => n.id === 'charge_b3')!.canStart!({ ...beforeB3, ...changed }), true);
});

test('focus tooltip stays inside the viewport at bottom, side and oversized descriptions', () => {
  const viewport = { width: 800, height: 600 };
  const bottom = placeFocusTooltip({ left: 760, right: 790, top: 550, bottom: 590 }, 320, 300, viewport);
  assert.ok(bottom.top + 300 <= 588);
  assert.ok(bottom.left + 320 <= 788);
  const tall = placeFocusTooltip({ left: 0, right: 164, top: 100, bottom: 220 }, 320, 1600, viewport);
  assert.equal(tall.top, 12);
  assert.equal(tall.maxHeight, 576);
});
