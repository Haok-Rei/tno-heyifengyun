import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ALL_SUB_TILES, type GameState } from '../src/types';
import { DEFAULT_LAW_SYSTEM } from '../src/data/laws';
import { FLAVOR_EVENTS } from '../src/data/flavorEvents';
import { getFocusNodes } from '../src/components/FocusTree';
import { executeMapAction } from '../src/engine/mapActions';
import { advanceCommandDay, assignRecurringAction, consumeRoutePreparation, getCommandState, getPreparationPreview } from '../src/engine/commandSystem';
import { getChapterBrief, getLocalFieldwork, getOpeningChapter, getOpeningMemorySummary, snapshotOpeningEvent } from '../src/engine/openingCampaign';
import { enqueueEvent } from '../src/engine/eventQueue';
import { serializeGameState, deserializeGameState } from '../src/engine/saveSystem';
import OpeningCampaignBrief from '../src/components/OpeningCampaignBrief';
import CommandPanel from '../src/components/CommandPanel';

function fixture(): GameState {
  return {
    date: new Date(2023,8,18), isPaused: true, gameSpeed: 1, currentFocusTree: 'phase1',
    stats: {pp:300,tpr:1000,ss:50,stab:60,studentSanity:65,allianceUnity:50,partyCentralization:50,radicalAnger:40,capitalPenetration:0},
    flags: {}, completedFocuses: ['start_2023'], leader: {name:'封安宝',title:'校长',portrait:'feng_anbao',ideology:'authoritarian'},
    lawSystem: {...DEFAULT_LAW_SYSTEM}, nationalSpirits:[], advisors:[null,null,null], ideologies:{}, modifiers:{},
    activeFocus:null, activeEvent:null, activeStoryEvents:[], activeSuperEvent:null, activeMinigame:null, unlockedMinigames:[],
    decisionCooldowns:{},crises:[],chronicle:[],
    mapLocations:Object.fromEntries([...new Set(ALL_SUB_TILES.map(t=>t.buildingId))].map(id=>[id,{id,name:id,studentControl:50,defenseDays:0}])),
  } as GameState;
}
function advance(state: GameState, days: number) {
  const date = new Date(state.date);date.setDate(date.getDate()+days);
  return advanceCommandDay({...state,date});
}

test('chapter memory records successful manual and recurring actions without changing their original effects',()=>{
  const initial=fixture();const frozen=serializeGameState(initial);
  const assigned=assignRecurringAction(initial,'b3_tower','b3_under',2);
  const recurring=advance(assigned,2);
  const manual=executeMapAction({...initial,date:recurring.date},'b3_tower','b3_under').state;
  assert.deepEqual(recurring.stats,manual.stats);
  assert.deepEqual(recurring.flags,manual.flags);
  assert.deepEqual(recurring.mapLocations,manual.mapLocations);
  assert.deepEqual(getLocalFieldwork(recurring,'b3_tower'),{manual:0,workgroup:1});
  assert.deepEqual(getLocalFieldwork(manual,'b3_tower'),{manual:1,workgroup:0});
  assert.equal(serializeGameState(initial),frozen);
  assert.deepEqual(getLocalFieldwork(recurring,'aud_hall'),{manual:0,workgroup:0});
});

test('failed and cooling actions do not fabricate chapter history or spend extra resources',()=>{
  const initial=fixture();initial.stats.tpr=0;
  const failed=executeMapAction(initial,'b3_tower','b3_under');
  assert.equal(failed.executed,false);assert.equal(failed.state,initial);
  const delayed=advance(assignRecurringAction(initial,'b3_tower','b3_under',2),2);
  assert.equal(delayed.openingCampaign,undefined);
  assert.equal(delayed.command?.completed,0);
  const recovered=advance({...delayed,stats:{...delayed.stats,tpr:100}},1);
  assert.deepEqual(getLocalFieldwork(recovered,'b3_tower'),{manual:0,workgroup:1});
  const twice=executeMapAction(recovered,'b3_tower','b3_under');
  assert.equal(twice.state,recovered);assert.equal(twice.executed,false);
});

test('three chapter hints follow plot transitions and optional fieldwork never becomes a route prerequisite',()=>{
  const initial=fixture();assert.equal(getOpeningChapter(initial),'mobilization');
  const b3=getFocusNodes('phase1').find(n=>n.id==='charge_b3')!;
  assert.equal(b3.canStart?.({...initial,stats:{...initial.stats,radicalAnger:80}}),false);
  assert.equal(b3.canStart?.({...initial,stats:{...initial.stats,radicalAnger:81}}),true);
  const handover={...initial,flags:{rebellion_started:true},completedFocuses:['charge_b3']};
  assert.equal(getOpeningChapter(handover),'handover');
  const committee={...handover,currentFocusTree:'treeA',completedFocuses:['charge_b3','declare_indep','convene_assembly']};
  assert.equal(getOpeningChapter(committee),'committee');
  assert.match(getChapterBrief(committee)!.goal,/席位.*团结.*集权/);
  assert.equal(getOpeningChapter({...committee,currentFocusTree:'treeA_pan'}),null);
  assert.equal(getOpeningChapter({...committee,currentFocusTree:'treeA_true_left'}),null);
  assert.equal(getOpeningChapter({...committee,gameEnding:'great_awakening'}),null);
});

test('authored opening and committee focus durations, prerequisites and mutual exclusions retain the approved baseline',()=>{
  const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/opening-committee-baseline.json',import.meta.url),'utf8'));
  for(const tree of ['phase1','treeA']) assert.deepEqual(getFocusNodes(tree).map(node=>({
    id:node.id,days:node.days,requires:node.requires??[],mutuallyExclusive:node.mutuallyExclusive??[],
  })),baseline.trees[tree]);
});

test('organization echoes use only genuine pre-uprising contacts and freeze without editing the original event',()=>{
  const initial=fixture();const original=FLAVOR_EVENTS.event_7_smolny;
  assert.equal(snapshotOpeningEvent(initial,original),original);
  const contacts=executeMapAction(initial,'b3_tower','b3_under').state;
  const event=snapshotOpeningEvent(contacts,original);
  assert.equal(event.description,original.description);assert.equal(event.effect,original.effect);
  assert.equal(event.openingEcho,FLAVOR_EVENTS.phase1_echo_handover.description);
  const clubs=executeMapAction(initial,'aud_hall','aud_coop').state;
  assert.equal(snapshotOpeningEvent(clubs,original).openingEcho,FLAVOR_EVENTS.phase1_echo_clubs.description);
  assert.equal(snapshotOpeningEvent(clubs,event),event);
  const postUprising=executeMapAction({...initial,currentFocusTree:'treeA',flags:{rebellion_started:true}},'b3_tower','b3_under').state;
  assert.equal(snapshotOpeningEvent(postUprising,original),original);
});

test('trial and compromise have different later teaching echoes but identical original focus and event effects',()=>{
  for(const [focusId,echoId] of [['trial_yang','committee_echo_trial'],['secret_compromise','committee_echo_compromise']] as const){
    const state=fixture();state.currentFocusTree='treeA';state.flags.rebellion_started=true;state.completedFocuses.push('convene_assembly');
    state.studentAssemblyFactions={orthodox:30,bear:20,pan:20,otherDem:15,testTaker:15};
    const partial=getFocusNodes('treeA').find(n=>n.id===focusId)!.onComplete!(state);
    const settled={...state,...partial};
    const event=snapshotOpeningEvent(settled,FLAVOR_EVENTS.event_9_rectify_order);
    assert.equal(event.openingEcho,FLAVOR_EVENTS[echoId].description);
    assert.deepEqual(event.effect!(settled),FLAVOR_EVENTS.event_9_rectify_order.effect!(settled));
    assert.equal(event.description,FLAVOR_EVENTS.event_9_rectify_order.description);
    assert.deepEqual(partial.activeEvent!.effect!(settled),{});
  }
});

test('chapter history and queued echoes survive saves and do not add events, pause changes or fabricated legacy history',()=>{
  let state=executeMapAction(fixture(),'b3_tower','b3_under').state;
  const event=snapshotOpeningEvent(state,FLAVOR_EVENTS.event_7_smolny);
  state={...state,...enqueueEvent(state,event)};
  const restored=deserializeGameState(serializeGameState(state))!;
  assert.deepEqual(restored.openingCampaign,state.openingCampaign);
  assert.equal(restored.activeEvent?.openingEcho,event.openingEcho);
  assert.equal(restored.activeStoryEvents.length,0);
  assert.equal(restored.isPaused,state.isPaused);
  assert.deepEqual(restored.activeEvent!.effect!(restored),event.effect!(restored));
  const legacy=deserializeGameState(serializeGameState(fixture()))!;
  assert.equal(legacy.openingCampaign,undefined);
  assert.deepEqual(getOpeningMemorySummary(legacy),[]);
});

test('chapter record stays out of other routes, while relevant memories remain available as history',()=>{
  const contacted=executeMapAction(fixture(),'aud_hall','aud_coop').state;
  const democracy={...contacted,currentFocusTree:'treeA_pan',flags:{rebellion_started:true,polling_stations_unlocked:true}};
  const advanced=executeMapAction(democracy,'aud_hall','campaign').state;
  assert.equal(advanced.openingCampaign,contacted.openingCampaign);
  assert.equal(getOpeningChapter(advanced),null);
  assert.match(getOpeningMemorySummary(advanced).join(' '),/手动1次/);
});

test('workgroup reward reports show actual capped gains and selectors do not consume stock',()=>{
  const state=fixture();state.currentFocusTree='treeA';state.flags.rebellion_started=true;
  state.stats.ss=99;
  state.command={version:2,nextId:1,lastTick:0,teams:[],reports:[],completed:0,preparation:{revolution:4}};
  const before=serializeGameState(state);
  assert.equal(getPreparationPreview(state).delta,1);
  assert.equal(getPreparationPreview(state).spent,3);
  assert.equal(serializeGameState(state),before);
  const used=consumeRoutePreparation(state,'revolution','minigame');
  assert.equal(used.state.stats.ss,100);assert.equal(used.spent,3);
  assert.match(used.outcome,/学生支持 \+1/);assert.match(used.outcome,/剩余 1\/6/);
  assert.equal(state.command.preparation?.revolution,4);
  const opening=fixture();opening.command={...state.command,preparation:{opening:6}};
  assert.equal(getPreparationPreview(opening).inherits,true);
  const transferred={...opening,currentFocusTree:'treeA',flags:{rebellion_started:true}};
  assert.equal(getCommandState(transferred).preparation?.revolution,3);
});

test('new guidance and workgroup art stay inside existing optional surfaces and explain concrete use',()=>{
  const state=executeMapAction(fixture(),'b3_tower','b3_under').state;
  const before=serializeGameState(state);
  const guide=renderToStaticMarkup(React.createElement(OpeningCampaignBrief,{state}));
  assert.match(guide,/当前章节引导/);assert.match(guide,/本章行动与前史/);
  assert.ok(!guide.includes('<details open'));
  const panel=renderToStaticMarkup(React.createElement(CommandPanel,{state,tileId:'b3_tower',setGameState:()=>{}}));
  assert.match(panel,/progressbar/);assert.match(panel,/起义后最多继承3份/);
  assert.match(panel,/本地行动/);
  assert.equal(serializeGameState(state),before);
});
