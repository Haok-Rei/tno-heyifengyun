import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_SUB_TILES, type GameState } from '../src/types';
import { syncAssemblyConflict } from '../src/engine/assemblyConflict';
import { cleanAssemblyCrises } from '../src/engine/assemblyPolitics';
import { enqueueEvent } from '../src/engine/eventQueue';
import { FLAVOR_EVENTS } from '../src/data/flavorEvents';
import { STORY_EVENTS } from '../src/data/storyEvents';
import { hasFocusRequirements } from '../src/engine/gameLoop';
import { getFocusNodes } from '../src/components/FocusTree';
import { availableMapActions, executeMapAction } from '../src/engine/mapActions';
import { assignRecurringAction } from '../src/engine/commandSystem';
import { serializeGameState, deserializeGameState } from '../src/engine/saveSystem';
import { nextOpeningGuidance } from '../src/engine/campaignGuidance';
import { isDarkCrossroadsReady, isSchoolCounterattackPressure } from '../src/engine/campusCounterattack';
import { startSiegeDefense, advanceSiegeDefense, canDeploySiegeOrder, deploySiegeOrder, SIEGE_WAVES, type SiegeOrder } from '../src/engine/siegeDefense';

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


test('9.6.1 collapse choices and event costs survive a save round trip', () => {
  const state = fixture();
  state.activeEvent = STORY_EVENTS.treeA_final_collapse_choice_event;
  state.activeStoryEvents = [FLAVOR_EVENTS.committee_counter_infiltration_event];
  const restored = deserializeGameState(serializeGameState(state))!;
  const [despair, wu] = restored.activeEvent!.choices!;
  assert.equal(despair.effect(restored).activeEvent?.id, 'despair_route_entry_event');
  assert.equal(wu.effect(restored).activeEvent?.id, 'wu_crackdown_entry_event');
  const front = despair.effect(restored).activeEvent!.effect!(restored);
  assert.equal(front.currentFocusTree, 'treeA_pan_despair');
  assert.equal(front.activeFocus, null);
  assert.equal(front.flags?.tile_ctrl_b3_tower, 70);
  const guard = restored.activeStoryEvents[0].choices![0];
  assert.equal(guard.disabled?.({...restored, stats: {...restored.stats, pp: 14}}), true);
  assert.equal(guard.disabled?.({...restored, stats: {...restored.stats, pp: 15}}), false);
  assert.equal(guard.effect(restored).stats?.pp, 285);
});

test('9.6.1 siege prerequisites and post-siege paths remain mutually exclusive', () => {
  const state = fixture();
  state.currentFocusTree = 'treeA_pan_despair';
  const nodes = getFocusNodes(state.currentFocusTree);
  const defend = nodes.find(n => n.id === 'defend_b3')!;
  assert.equal(defend.requires?.length, 3);
  assert.equal(hasFocusRequirements(defend, defend.requires!.slice(1)), false);
  assert.equal(hasFocusRequirements(defend, defend.requires!), true);
  const counter = nodes.find(n => n.id === 'counter_attack')!;
  const rooftop = nodes.find(n => n.id === 'despair_rooftop_broadcast')!;
  assert.equal(counter.canStart?.(state), false);
  assert.equal(rooftop.canStart?.(state), false);
  state.flags.despair_b3_held = true;
  assert.equal(counter.canStart?.(state), true);
  assert.equal(rooftop.canStart?.(state), false);
  state.flags.despair_b3_held = false;
  state.flags.despair_b3_breached = true;
  assert.equal(counter.canStart?.(state), false);
  assert.equal(rooftop.canStart?.(state), true);
  assert.equal(FLAVOR_EVENTS.despair_dawn_break_event.effect?.(state).gameEnding, 'game_over_victory');
  assert.equal(FLAVOR_EVENTS.despair_final_fall_event.effect?.(state).gameEnding, 'game_over_despair');
});

test('legacy siege results migrate without changing completed endings', () => {
  const state = fixture();
  state.currentFocusTree = 'treeA_pan_despair';
  state.completedFocuses = ['defend_b3'];
  const pending = deserializeGameState(serializeGameState(state))!;
  assert.equal(pending.activeMinigame, 'siege_b3');
  state.activeEvent = { id: 'b3_defeat', title: '旧结算', description: '', buttonText: '继续' };
  const intercepted = deserializeGameState(serializeGameState(state))!;
  assert.equal(intercepted.activeEvent?.id, 'despair_siege_breached_event');
  assert.equal(intercepted.flags.despair_b3_breached, true);
  state.gameEnding = 'game_over_anarchy';
  const ended = deserializeGameState(serializeGameState(state))!;
  assert.equal(ended.gameEnding, 'game_over_anarchy');
  assert.equal(ended.flags.despair_b3_breached, undefined);
});

test('the external siege accepts either committee settlement and Wu coup requires new preparation', () => {
  const committee = getFocusNodes('treeA').find(n => n.id === 'committee_external_siege')!;
  for (const completed of ['trial_yang','secret_compromise']) assert.equal(hasFocusRequirements(committee, [completed]), true);
  assert.equal(hasFocusRequirements(committee, []), false);
  const coup = getFocusNodes('wu_tree_p2_coup').find(n => n.id === 'wu_coup_december')!;
  const state = {...fixture(), currentFocusTree:'wu_tree_p2_coup', wuState:{wuAmbition:100,fengTrust:40}} as GameState;
  assert.equal(coup.canStart?.(state), false);
  state.completedFocuses = ['wu_coup_wiretap_office', 'wu_first_strike_right'];
  assert.equal(coup.canStart?.(state), true);
  assert.equal(hasFocusRequirements(coup, state.completedFocuses), true);
  state.wuState!.fengTrust = 39;
  assert.equal(coup.canStart?.(state), false);
});

test('9.6.3 opening requires all three student focuses and stages the uprising after completion',()=>{
  const focuses=getFocusNodes('phase1');
  const steel=focuses.find(focus=>focus.id==='steel_toad')!;
  assert.equal(steel.requires?.length,3);
  for(const id of steel.requires!) assert.equal(hasFocusRequirements(steel, steel.requires!.filter(req=>req!==id)),false);
  assert.equal(hasFocusRequirements(steel,steel.requires!),true);
  const b3=focuses.find(focus=>focus.id==='charge_b3')!;
  assert.equal(hasFocusRequirements(b3,steel.requires!),false);
  assert.equal(hasFocusRequirements(b3,['steel_toad']),true);
  const state=fixture();
  state.currentFocusTree='phase1';
  assert.equal(b3.onStart,undefined);
  const completed=b3.onComplete!(state);
  assert.equal(completed.activeEvent?.id,'phase1_before_charge');
  assert.equal(completed.activeStoryEvents,undefined);
  const intro=FLAVOR_EVENTS.phase1_before_charge.effect!({...state,...completed});
  assert.equal(intro.activeEvent?.id,'story_6');
  assert.equal(intro.currentFocusTree,undefined);
  const banner=STORY_EVENTS.story_6.effect!({...state,...completed,...intro});
  assert.equal(banner.activeSuperEvent,undefined);
  assert.equal(banner.activeEvent?.id,'strike_b3_success');
  const pact=FLAVOR_EVENTS.strike_b3_success.effect!({...state,...completed,...intro,...banner});
  assert.equal(pact.flags?.united_committee_established,true);
  assert.equal(pact.activeSuperEvent?.id,'b3_uprising');
  assert.equal(FLAVOR_EVENTS.strike_b3_success.effect!({...state,currentFocusTree:'treeA'}).activeSuperEvent,undefined);
  assert.equal(banner.currentFocusTree,undefined);
});

test('9.6.3 interrupted legacy B3 saves resume without replaying settled routes',()=>{
  const state=fixture();
  state.currentFocusTree='phase1';
  state.completedFocuses=['steel_toad'];
  state.activeFocus={id:'charge_b3',daysLeft:2,totalDays:5};
  state.activeEvent=STORY_EVENTS.story_6;
  const mid=deserializeGameState(serializeGameState(state))!;
  assert.equal(mid.activeEvent?.id,undefined);
  assert.equal(mid.activeFocus?.daysLeft,2);

  state.currentFocusTree='treeA';
  state.completedFocuses=[];
  state.activeFocus=null;
  state.activeEvent=null;
  state.flags.story_6_triggered=true;
  state.flags.event_seen_story_6=true;
  const recovered=deserializeGameState(serializeGameState(state))!;
  assert.equal(recovered.activeEvent?.id,'strike_b3_success');
  assert.equal(recovered.activeSuperEvent?.id,undefined);
  assert.equal(FLAVOR_EVENTS.strike_b3_success.effect!(recovered).activeSuperEvent?.id,'b3_uprising');
  assert.equal(recovered.flags.focus_completed_date_charge_b3,state.date.getTime());
  state.completedFocuses=['declare_indep'];
  assert.equal(deserializeGameState(serializeGameState(state))?.activeSuperEvent?.id,undefined);
});

test('9.6.3 dark crossroads requires simultaneous military, stability and supply or support pressure',()=>{
  const fragile={tpr:140,ss:70,stab:34.9};
  assert.equal(isDarkCrossroadsReady(18,4,fragile),true);
  assert.equal(isDarkCrossroadsReady(17,4,fragile),false);
  assert.equal(isDarkCrossroadsReady(18,3,fragile),false);
  assert.equal(isDarkCrossroadsReady(18,4,{...fragile,stab:35}),false);
  assert.equal(isDarkCrossroadsReady(18,4,{...fragile,tpr:141,ss:32}),false);
  assert.equal(isDarkCrossroadsReady(18,4,{...fragile,tpr:141,ss:31.9}),true);
  assert.equal(isSchoolCounterattackPressure(fragile),false);
  assert.equal(isSchoolCounterattackPressure({...fragile,ss:31.9}),true);
  assert.equal(isSchoolCounterattackPressure({...fragile,tpr:141,ss:31.9}),false);
});

test('9.6.3 rotating free units can win the decisive siege and stacking pickets cannot',()=>{
  const rotations: Array<Array<[number,SiegeOrder]>> = [
    [[0,'debater'],[1,'debater'],[2,'debater']],
    [[3,'debater'],[0,'picket']],
    [[0,'debater'],[1,'debater'],[2,'debater']],
    [[3,'debater'],[4,'debater']],
    [[0,'debater'],[1,'debater'],[2,'debater']],
    [[3,'debater'],[4,'debater']],
    [[0,'debater'],[1,'debater'],[2,'debater']],
    [[3,'debater'],[2,'picket']],
  ];
  let mixed=startSiegeDefense(0,false);
  assert.equal(canDeploySiegeOrder(mixed,0,'barricade',49),false);
  assert.equal(canDeploySiegeOrder(mixed,0,'barricade',50),true);
  for(const assignments of rotations){
    for(const [floor,order] of assignments){
      assert.ok(canDeploySiegeOrder(mixed,floor,order,0));
      mixed=deploySiegeOrder(mixed,floor,order);
    }
    mixed=advanceSiegeDefense(mixed);
  }
  assert.equal(mixed.result,'held');
  let pickets=startSiegeDefense(3,true);
  while(!pickets.result){
    const wave=SIEGE_WAVES[pickets.round];
    const highest=pickets.floors.map((slot,i)=>slot.pressure+wave[i]).reduce((a,b,i,all)=>b>all[a]?i:a,0);
    pickets=deploySiegeOrder(pickets,highest,'picket');
    assert.equal(canDeploySiegeOrder(pickets,(highest+1)%5,'picket',0),false);
    pickets=advanceSiegeDefense(pickets);
  }
  assert.equal(pickets.result,'breached');
});
