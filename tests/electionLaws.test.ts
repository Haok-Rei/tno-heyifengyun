import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEFAULT_LAW_SYSTEM, LAW_CATEGORIES } from '../src/data/laws';
import { applyFocusLawTransition, getRouteGovernment, lawChangeEvent } from '../src/engine/lawTransitions';
import { advanceCampaignTeams, startCampaignTeams } from '../src/engine/electionCampaign';
import { availableMapActions, executeMapAction } from '../src/engine/mapActions';
import { ALL_SUB_TILES, type GameState } from '../src/types';
import { STORY_EVENTS } from '../src/data/storyEvents';
import { getFocusNodes } from '../src/components/FocusTree';

function fixture(): GameState {
  return {
    date: new Date(2024, 4, 1), isPaused: false, gameSpeed: 1,
    stats: { pp: 200, tpr: 500, ss: 60, stab: 65, studentSanity: 65, allianceUnity: 60, partyCentralization: 40, radicalAnger: 20, capitalPenetration: 0 },
    modifiers: { ppDaily: 0, tprDaily: 0, ssDaily: 0, stabDaily: 0, studentSanityDaily: 0, allianceUnityDaily: 0, partyCentralizationDaily: 0, radicalAngerDaily: 0, capitalPenetrationDaily: 0, powerBalanceDaily: 0 },
    leader: { name: '潘仁越', title: '议长', portrait: 'pan_renyue', ideology: 'liberal' },
    flags: { polling_stations_unlocked: true, map_phase_ended: true }, currentFocusTree: 'treeA_pan', lawSystem: { ...DEFAULT_LAW_SYSTEM },
    chronicle: [], nationalSpirits: [], advisors: [], ideologies: {}, activeFocus: null, completedFocuses: [], crises: [], decisionCooldowns: {}, activeEvent: null, activeStoryEvents: [], activeSuperEvent: null, activeMinigame: null, unlockedMinigames: [],
    mapLocations: Object.fromEntries([...new Set(ALL_SUB_TILES.map(tile => tile.buildingId))].map(id => [id, { id, name: id, studentControl: 50, defenseDays: 0, pollingData: { pan: 20, orthodox: 20, bear: 20, conservativeDem: 20, testTaker: 20 }, totalVotes: 1000 }])),
  };
}

test('route milestones change only relevant laws and queue a readable notification', () => {
  const before = { ...DEFAULT_LAW_SYSTEM, clubs: 'clubs_open' };
  const after = applyFocusLawTransition(before, 'jidi_strict_discipline');
  assert.equal(after.discipline, 'hengshui');
  assert.equal(after.clubs, 'clubs_frozen');
  assert.equal(after.education, before.education);
  const notice = lawChangeEvent(before, after, '铁腕纪律', new Date(2024, 4, 1));
  assert.match(notice?.description ?? '', /定期开放 → 暂停社团/);
  assert.equal(lawChangeEvent(after, after, '重复', new Date()), null);
});

test('election runs sixty days and every party starts a distinct touring team', () => {
  const focus = getFocusNodes('treeA_pan').find(node => node.id === 'first_democratic_election');
  assert.equal(focus?.days, 60);
  const state = fixture();
  const effect = STORY_EVENTS.start_democratic_election_event.choices?.[0].effect?.(state);
  assert.equal(effect?.electionState?.daysLeft, 60);
  assert.equal(effect?.electionState?.campaignTeams?.length, 5);
  const election = effect?.electionState!;
  const locations = structuredClone(state.mapLocations);
  const updated = advanceCampaignTeams(election, locations);
  assert.ok((locations.b3.pollingData?.pan ?? 0) > 20);
  assert.equal(updated.campaignTeams?.[0].district, 'b3');
  updated.daysLeft = 55;
  const moved = advanceCampaignTeams(updated, locations);
  assert.equal(moved.campaignTeams?.[0].district, 'admin');
  assert.deepEqual(startCampaignTeams().map(team => team.candidate), election.candidates);
});

test('manual electioneering is weaker before election and remains usable after map struggle', () => {
  const state = fixture();
  assert.ok(availableMapActions(state, 'b3_tower').some(action => action.id === 'campaign'));
  const before = executeMapAction(state, 'b3_tower', 'campaign');
  assert.equal(before.executed, true);
  assert.ok((before.state.mapLocations.b3.pollingData?.pan ?? 0) < 25);
  const active = { ...state, electionState: { isActive: true, daysLeft: 60, totalDays: 60, candidates: [...startCampaignTeams().map(team => team.candidate)], playerCandidate: 'pan', votes: {}, campaignTeams: startCampaignTeams() } };
  const during = executeMapAction(active, 'b3_tower', 'campaign');
  assert.ok((during.state.mapLocations.b3.pollingData?.pan ?? 0) > (before.state.mapLocations.b3.pollingData?.pan ?? 0));
});


test('new route handovers set complete ideology shares and valid law levels without resets within a route', () => {
  const s = fixture();
  const before = { ...DEFAULT_LAW_SYSTEM, education: 'balanced' };
  const trees = ['treeA', 'treeA_pan_despair', 'wu_tree', 'wu_tree_p2_feng', 'wu_tree_p2_spring', 'wu_tree_p2_coup'];
  const snapshots = trees.map(tree => getRouteGovernment('phase1', tree, before)!);
  for (const { lawSystem, ideologies } of snapshots) {
    assert.equal(Object.values(ideologies).reduce((a,b)=>a+b,0),100);
    for (const category of LAW_CATEGORIES) assert.ok(category.levels.includes(lawSystem[category.id]));
  }
  assert.deepEqual(snapshots.map(p => p.ideologies.authoritarian), [12,20,58,55,38,72]);
  assert.equal(snapshots[1].ideologies.radical_socialism,31);
  assert.equal(snapshots[1].lawSystem.education,'balanced');
  assert.equal(snapshots[4].lawSystem.schedule,'standard_schedule');
  assert.equal(getRouteGovernment('wu_tree','wu_tree',before),undefined);
  assert.ok(lawChangeEvent(s.lawSystem, snapshots[1].lawSystem, '围城', s.date));
  assert.equal(applyFocusLawTransition(snapshots[0].lawSystem,'committee_student_charter').personnel,'student_assembly_hr');
});
