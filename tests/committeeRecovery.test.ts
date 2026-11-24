import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_SUB_TILES, type GameState } from '../src/types';
import { syncAssemblyConflict } from '../src/engine/assemblyConflict';
import { cleanAssemblyCrises } from '../src/engine/assemblyPolitics';
import { enqueueEvent } from '../src/engine/eventQueue';
import { FLAVOR_EVENTS } from '../src/data/flavorEvents';
import { getFocusNodes } from '../src/components/FocusTree';
import { availableMapActions, executeMapAction } from '../src/engine/mapActions';
import { assignRecurringAction } from '../src/engine/commandSystem';
import { serializeGameState, deserializeGameState } from '../src/engine/saveSystem';
import { nextOpeningGuidance } from '../src/engine/campaignGuidance';

function fixture(): GameState {
  return { date:new Date(2023,9,12), currentFocusTree:'treeA', completedFocuses:['convene_assembly'],
    flags:{assembly_unlocked:true,rebellion_started:true}, stats:{pp:300,tpr:800,stab:70,ss:70,studentSanity:100,radicalAnger:40,allianceUnity:90,partyCentralization:35,capitalPenetration:0},
    studentAssemblyFactions:{orthodox:30,bear:20,pan:20,otherDem:15,testTaker:15}, nationalSpirits:[], advisors:[null,null,null],
    crises:[],activeEvent:null,activeStoryEvents:[],mapLocations:{},decisionCooldowns:{},leader:{name:'王照凯'},isPaused:true,
  } as unknown as GameState;
}

test('assembly unlock guarantees one initial dispute even at high sanity and consensus, then respects resolution',()=>{
  const s=fixture(); s.flags.democratic_power_struggle_cooldown=15;
  const begun=syncAssemblyConflict(s);
  assert.equal(begun.crises.filter(c=>c.id==='democratic_power_struggle').length,1);
  assert.equal(begun.activeEvent?.id,'democratic_power_struggle_event');
  const repeated=syncAssemblyConflict(begun);
  assert.equal(repeated.crises.length,1); assert.equal(repeated.activeStoryEvents.length,0);
  assert.equal(cleanAssemblyCrises(repeated).crises.length,1,'first day cannot silently erase the introduction');
  const tomorrow=syncAssemblyConflict({...repeated,date:new Date(2023,9,13)});
  assert.equal(syncAssemblyConflict(tomorrow).crises.length,0,'actual political consensus resolves subsequent days');
  const contested={...tomorrow,stats:{...tomorrow.stats,allianceUnity:60,partyCentralization:65},activeEvent:null};
  assert.equal(syncAssemblyConflict(contested).crises.length,0,'cooldown blocks recurrence');
  assert.equal(syncAssemblyConflict({...contested,flags:{...contested.flags,democratic_power_struggle_cooldown:0}}).crises.length,1);
});

test('focus feedback survives daily chatter and obsolete crisis removal promotes waiting stories while paused',()=>{
  const chatter=FLAVOR_EVENTS.phase1_returned_petition, trial=FLAVOR_EVENTS.event_8_trial;
  const q=enqueueEvent({activeEvent:chatter,activeStoryEvents:[]},trial,true);
  assert.equal(q.activeEvent?.id,trial.id); assert.deepEqual(q.activeStoryEvents.map(e=>e.id),[chatter.id]);
  assert.deepEqual(enqueueEvent(q,trial,true),q,'same event cannot duplicate in one queue');
  const repaired=cleanAssemblyCrises({...fixture(),currentFocusTree:'treeA_true_left',isPaused:true,
    activeEvent:{id:'opposition_slander_event',title:'旧提示',description:''}, activeStoryEvents:[trial,chatter]});
  assert.equal(repaired.activeEvent?.id,trial.id); assert.equal(repaired.activeStoryEvents[0].id,chatter.id); assert.equal(repaired.isPaused,true);
});

test('lost settlement acknowledgement restores from a save without redistributing seats again',()=>{
  const s=fixture();const change=getFocusNodes('treeA').find(n=>n.id==='trial_yang')!.onComplete!(s);
  const finished={...s,...change,activeEvent:null,completedFocuses:[...s.completedFocuses,'trial_yang']};
  const loaded=deserializeGameState(serializeGameState(finished))!;
  assert.equal(loaded.activeEvent?.id,'event_8_trial'); assert.deepEqual(loaded.activeEvent?.effect?.(loaded),{});
  const read={...loaded,activeEvent:null,activeStoryEvents:[],flags:{...loaded.flags,event_seen_event_8_trial:true}};
  assert.equal(syncAssemblyConflict(read).activeEvent,null);
  const cross=syncAssemblyConflict({...s,completedFocuses:[...s.completedFocuses,'crossroads_of_fate']});
  assert.equal(cross.activeEvent?.id,'event_10_crossroads');
});

test('after crossroads true-left manual takeover and recurring workgroups remain available until declared victory',()=>{
  const s=fixture();s.stats.allianceUnity=60;s.stats.partyCentralization=65;
  const routed={...s,...FLAVOR_EVENTS.event_10_crossroads.effect!(s)};
  assert.equal(routed.currentFocusTree,'treeA_true_left');
  assert.ok(availableMapActions(routed,'b3_tower').some(a=>a.id==='boost'));
  assert.equal(executeMapAction(routed,'b3_tower','boost').executed,true);
  assert.ok(assignRecurringAction(routed,'b3_tower','boost',4).command?.teams.some(t=>t.order?.actionId==='boost'));
  const victory=getFocusNodes('treeA_true_left').find(n=>n.id==='declare_victory')!;
  assert.equal(victory.canStart!(routed),false);
  routed.flags={...routed.flags,...Object.fromEntries(ALL_SUB_TILES.map(t=>['tile_ctrl_'+t.id,100]))};
  assert.equal(victory.canStart!(routed),true);
  const declared={...routed,...victory.onComplete!(routed)};
  assert.deepEqual(availableMapActions(declared,'b3_tower'),[]);
});

test('opening scenes require their prior plot and cease as soon as B3 focus starts',()=>{
  const s={...fixture(),currentFocusTree:'phase1',flags:{},completedFocuses:['start_2023','read_marx']};
  assert.equal(nextOpeningGuidance(s),null,'reading alone cannot invent an earlier petition');
  s.completedFocuses.push('dorm_talks');assert.equal(nextOpeningGuidance(s),'phase1_returned_petition');
  s.flags={phase1_returned_petition_seen:true};assert.equal(nextOpeningGuidance(s),'phase1_shared_leaflet','without patrol, no patrol dispute');
  s.completedFocuses.push('wu_patrol');assert.equal(nextOpeningGuidance(s),'phase1_recess_dispute');
  assert.equal(nextOpeningGuidance({...s,activeFocus:{id:'charge_b3',daysLeft:4,totalDays:5}}),null);
  assert.ok(!FLAVOR_EVENTS.phase1_recess_dispute.effectsText?.join('').includes('仅出现一次'));
});

test('terminal crossroads branches present their story before ending, including after reload', () => {
  for (const [unity, central, ending] of [
    [30, 90, 'great_awakening'],
    [50, 20, 'pleasure_of_mediocrity'],
    [50, 50, 'gouxiong_usurpation'],
  ] as const) {
    const state = fixture();
    state.stats.allianceUnity = unity;
    state.stats.partyCentralization = central;
    const next = FLAVOR_EVENTS.event_10_crossroads.effect!(state);
    assert.equal(next.gameEnding, undefined);
    assert.equal(next.activeEvent?.id, 'crossroads_' + ending + '_event');
    const saved = deserializeGameState(serializeGameState({ ...state, ...next }))!;
    assert.equal(saved.activeEvent?.effect?.(saved).gameEnding, ending);
  }
});

test('despair options and one-time flags survive active and queued event saves', () => {
  const state = fixture();
  state.currentFocusTree = 'treeA_pan_despair';
  state.flags.pan_despair_days = 6;
  state.flags.pan_despair_chain_1_fired = true;
  state.activeEvent = FLAVOR_EVENTS.pan_despair_chain_1;
  state.activeStoryEvents = [FLAVOR_EVENTS.pan_despair_chain_2, FLAVOR_EVENTS.pan_despair_chain_3];
  const saved = deserializeGameState(serializeGameState(state))!;
  assert.equal(saved.flags.pan_despair_days, 6);
  assert.equal(saved.flags.pan_despair_chain_1_fired, true);
  for (const event of [saved.activeEvent!, ...saved.activeStoryEvents]) {
    const original = FLAVOR_EVENTS[event.id];
    assert.equal(event.choices?.length, 2);
    for (let i = 0; i < 2; i++) {
      assert.ok(event.choices?.[i].effect);
      assert.deepEqual(event.choices[i].effect!(saved), original.choices![i].effect!(saved));
    }
  }
});
