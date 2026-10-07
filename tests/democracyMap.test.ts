import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ALL_SUB_TILES, type GameState } from '../src/types';
import { DEFAULT_LAW_SYSTEM } from '../src/data/laws';
import { getFocusNodes } from '../src/components/FocusTree';
import CentralMap from '../src/components/CentralMap';
import { availableMapActions, executeMapAction } from '../src/engine/mapActions';
import { assignRecurringAction, advanceCommandDay, getCommandState, getTeamCapacity } from '../src/engine/commandSystem';
import { formatControl, getBuildingControl, getCampusControlProgress, getMapMode, getTileControl, syncMapLocations } from '../src/engine/mapState';
import { deserializeGameState, serializeGameState } from '../src/engine/saveSystem';

function fixture(tree = 'treeA_pan'): GameState {
  return {
    date:new Date(2023,9,12),isPaused:true,gameSpeed:1,currentFocusTree:tree,
    flags:{rebellion_started:true,united_committee_established:true},completedFocuses:['pan_takeover','expand_assembly','democratic_reforms'],
    stats:{pp:10000,tpr:10000,ss:65,stab:70,studentSanity:65,allianceUnity:75,partyCentralization:20,radicalAnger:85,capitalPenetration:0},
    modifiers:{ppDaily:1,tprDaily:0,ssDaily:0,stabDaily:0,studentSanityDaily:0,allianceUnityDaily:0,partyCentralizationDaily:0,radicalAngerDaily:0,capitalPenetrationDaily:0,powerBalanceDaily:0},
    leader:{name:'潘仁越',title:'学生议会议长',portrait:'pan_renyue',ideology:'liberal'},lawSystem:{...DEFAULT_LAW_SYSTEM},
    chronicle:[],nationalSpirits:[],advisors:[],ideologies:{},activeFocus:null,activeEvent:null,activeStoryEvents:[],activeSuperEvent:null,activeMinigame:null,unlockedMinigames:[],crises:[],decisionCooldowns:{},
    mapLocations:Object.fromEntries([...new Set(ALL_SUB_TILES.map(tile=>tile.buildingId))].map(id=>[id,{id,name:id,studentControl:50,defenseDays:0}])),
  };
}
function full(state=fixture()) { return syncMapLocations({...state,flags:{...state.flags,...Object.fromEntries(ALL_SUB_TILES.map(tile=>[`tile_ctrl_${tile.id}`,100]))}}); }
function nextDay(state:GameState) {const date=new Date(state.date);date.setDate(date.getDate()+1);return advanceCommandDay({...state,date});}

test('fractional control never displays 100 or unlocks either whole-campus focus',()=>{
  const state=full();state.flags.tile_ctrl_dorm_1_4=99.8;
  assert.equal(formatControl(getTileControl(state,'dorm_1_4')),'99.8');
  assert.equal(formatControl(99.999),'99.9');
  assert.equal(formatControl(100-1e-9),'100'); // numeric noise only, not a gameplay tolerance
  assert.equal(getCampusControlProgress(state).controlled,14);
  for(const [tree,id] of [['treeA_pan','reclaim_democracy'],['treeA_true_left','declare_victory']]){
    const focus=getFocusNodes(tree).find(node=>node.id===id)!;
    assert.equal(focus.canStart?.({...state,currentFocusTree:tree}),false);
    assert.equal(focus.canStart?.(full({...state,currentFocusTree:tree})),true);
    assert.ok(focus.requiresText?.length);
  }
  const markup=renderToStaticMarkup(React.createElement(CentralMap,{state,setGameState:()=>{},triggerError:()=>{},selectedTileId:null,districtDockTarget:null,onSelectTile:()=>{}}));
  assert.match(markup,/宿舍1-4栋，学生控制99\.8%/);
  assert.doesNotMatch(markup,/宿舍1-4栋，学生控制100%/);
});

test('manual actions reach genuine complete control without lowering focus conditions or costs',()=>{
  let state=fixture();state.flags={...state.flags,...Object.fromEntries(ALL_SUB_TILES.map(tile=>[`tile_ctrl_${tile.id}`,52]))};
  const beforePP=state.stats.pp;
  for(let run=0;run<4;run++){
    for(const tile of ALL_SUB_TILES){const result=executeMapAction(state,tile.id,'boost');assert.equal(result.executed,true);state=result.state;}
    state={...state,date:new Date(state.date.getTime()+86400000)};
  }
  assert.equal(state.stats.pp,beforePP-15*15*4);
  assert.equal(getCampusControlProgress(state).remaining.length,0);
  for(const location of Object.values(state.mapLocations))assert.equal(location.studentControl,100);
  assert.equal(getFocusNodes('treeA_pan').find(node=>node.id==='reclaim_democracy')!.canStart?.(state),true);
});

test('historic route flags cannot replace democratic or other current-route actions',()=>{
  const pollution={gx_anarchy_phase:true,lu_purge_map_phase:true,haobang_commune_map_phase:true,wu_crackdown_map_phase:true,wu_route_active:true,yang_yule_route_started:true,jidi_new_era_active:true,map_phase_ended:true};
  const democracy={...fixture(),flags:{...fixture().flags,...pollution}};
  assert.equal(getMapMode(democracy),'struggle');
  assert.ok(availableMapActions(democracy,'aud_hall').some(action=>action.id==='aud_salon'));
  assert.equal(executeMapAction(democracy,'aud_hall','aud_salon').executed,true);
  const opening={...fixture('phase1'),flags:{...pollution,rebellion_started:false}};
  assert.equal(getMapMode(opening),'opening');
  assert.deepEqual(availableMapActions(opening,'b3_tower').map(action=>action.id),['b3_under']);
  for(const [tree,mode,actionId,flag] of [
    ['treeB','yang','yy_coord',''],['jidi_tree','jidi','jd_optimize',''],['wu_tree','wu','wu_patrol',''],
    ['gouxiong_tree','gouxiong','gx_anime','gx_anarchy_action_tile_aud_hall'],
    ['treeA_lu_bohan','purge','lu_purge','lu_purge_action_tile_aud_hall'],
    ['treeA_haobang','commune','cm_build','haobang_commune_action_tile_aud_hall'],
  ]){
    const state={...fixture(tree),flags:{...pollution,rebellion_started:true,polling_stations_unlocked:true,...(flag?{[flag]:true}:{})}};
    assert.equal(getMapMode(state),mode,tree);
    assert.ok(availableMapActions(state,'aud_hall').some(action=>action.id===actionId),tree);
    assert.ok(!availableMapActions(state,'aud_hall').some(action=>action.id==='campaign'),tree);
  }
});

test('old-route orders release immediately while paused and do not execute or report twice',()=>{
  let previous={...fixture('treeA'),completedFocuses:Array.from({length:15},(_,index)=>`prior_${index}`)};
  for(const tile of ['b3_tower','aud_hall','track_field'])previous=assignRecurringAction(previous,tile,'boost',2);
  assert.equal(getCommandState(previous).teams.filter(team=>team.order).length,3);
  const changed={...previous,currentFocusTree:'treeA_pan',completedFocuses:['expand_assembly']};
  const command=getCommandState(changed);
  assert.equal(command.teams.filter(team=>team.order).length,0);
  assert.ok(command.teams.slice(0,getTeamCapacity(changed)).every(team=>!team.order));
  assert.equal(previous.command!.teams.filter(team=>team.order).length,3); // no mutation of old state
  const assigned=assignRecurringAction(changed,'aud_hall','aud_salon',4);
  assert.equal(assigned.command?.teams[0].order?.route,'democracy');
  assert.equal(assigned.command?.reports.filter(report=>report.title==='工作组撤回').length,3);
  const tick=nextDay(nextDay(nextDay(assigned)));
  assert.equal(tick.stats.pp,changed.stats.pp-40);
  assert.equal(tick.command?.completed,1);
  assert.equal(tick.command?.reports.filter(report=>report.title==='工作组撤回').length,3);
  assert.equal(advanceCommandDay(tick),tick);
  const loaded=deserializeGameState(serializeGameState(tick))!;
  assert.equal(loaded.command?.reports.filter(report=>report.title==='工作组撤回').length,3);
});

test('same-route stage changes revoke obsolete tasks immediately but lack of resources only suspends them',()=>{
  const assigned=assignRecurringAction(fixture(),'aud_hall','aud_salon',2);
  const poor={...assigned,stats:{...assigned.stats,pp:0}};
  assert.ok(getCommandState(poor).teams[0].order);
  const waiting=nextDay(nextDay(poor));
  assert.equal(waiting.command?.teams[0].order?.repeats,0);
  const election={...assigned,flags:{...assigned.flags,polling_stations_unlocked:true,map_struggle_ended:true}};
  assert.deepEqual(availableMapActions(election,'aud_hall').map(action=>action.id),['campaign']);
  assert.equal(getCommandState(election).teams.filter(team=>team.order).length,0);
  assert.equal(executeMapAction(election,'aud_hall','aud_salon').executed,false);
  const peaceful={...assigned,flags:{...assigned.flags,map_struggle_ended:true}};
  assert.equal(availableMapActions(peaceful,'aud_hall').length,0);
  assert.equal(getCommandState(peaceful).teams.filter(team=>team.order).length,0);
  assert.equal(advanceCommandDay({...peaceful,command:{...peaceful.command!,lastTick:Math.floor(Date.UTC(2023,9,12)/86400000)}}).command?.teams[0].order,null);
});

test('legacy building-only saves preserve control and modern sparse saves never invent occupation',()=>{
  const legacy=fixture();for(const location of Object.values(legacy.mapLocations))location.studentControl=100;
  const loaded=deserializeGameState(serializeGameState(legacy))!;
  assert.equal(getCampusControlProgress(loaded).controlled,15);
  assert.equal(loaded.stats.pp,legacy.stats.pp);
  assert.equal(loaded.completedFocuses.length,legacy.completedFocuses.length);
  const partial={...legacy,flags:{...legacy.flags,tile_ctrl_b3_tower:99.8}};
  const modern=deserializeGameState(serializeGameState(partial))!;
  assert.equal(getTileControl(modern,'b3_tower'),99.8);
  assert.equal(getTileControl(modern,'b3_a1a3'),50);
  assert.equal(getCampusControlProgress(modern).controlled,0);
  const queued=assignRecurringAction({...fixture('treeA'),completedFocuses:[]},'b3_tower','boost',2);
  const switched=deserializeGameState(serializeGameState({...queued,currentFocusTree:'treeA_pan'}))!;
  assert.equal(switched.command?.teams[0].order,null);
});

test('democratic collapse returns to district struggle rather than keeping obsolete election tasks',()=>{
  const election={...fixture(),flags:{...fixture().flags,polling_stations_unlocked:true,map_struggle_ended:true},mapLocations:structuredClone(fixture().mapLocations)};
  for(const location of Object.values(election.mapLocations))location.pollingData={pan:50,orthodox:50};
  const campaigning=assignRecurringAction(election,'aud_hall','campaign',2);
  const despair={...campaigning,currentFocusTree:'treeA_pan_despair',completedFocuses:[]};
  assert.equal(getMapMode(despair),'struggle');
  assert.ok(availableMapActions(despair,'aud_hall').some(action=>action.id==='boost'));
  assert.equal(executeMapAction(despair,'aud_hall','campaign').executed,false);
  assert.equal(getCommandState(despair).teams.filter(team=>team.order).length,0);
});

test('building aggregates use actual tile values and whole-school actions update every region once',()=>{
  let state=full();state.flags.tile_ctrl_dorm_1_4=99.8;
  state=syncMapLocations(state);
  assert.equal(getBuildingControl(state,'b1b2'),99.9);
  assert.equal(state.mapLocations.b1b2.studentControl,99.9);
  const struck=executeMapAction(state,'track_field','pl_strike');
  assert.equal(struck.executed,true);
  assert.equal(getCampusControlProgress(struck.state).controlled,15);
  assert.equal(executeMapAction(struck.state,'track_field','pl_strike').executed,false);
  assert.equal(state.flags.tile_ctrl_dorm_1_4,99.8);
});
