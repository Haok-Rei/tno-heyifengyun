import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ALL_SUB_TILES, type GameState } from '../src/types';
import { advanceCommandDay, assignRecurringAction, cancelOrder, consumeRoutePreparation, getCommandLinks, getCommandState, getOrderCadence, getSupplyNetwork, getTeamCapacity, reserveReformTeam } from '../src/engine/commandSystem';
import { availableMapActions, executeMapAction } from '../src/engine/mapActions';
import { getPaperUpkeep, getCampaignSummary, recordCampaignDay } from '../src/engine/campaignStats';
import { DEFAULT_LAW_SYSTEM, LAW_CATEGORIES } from '../src/data/laws';
import { ROUTE_OPERATIONS } from '../src/data/routeOperations';
import { getFocusNodes } from '../src/components/FocusTree';
import { DECISIONS } from '../src/components/RightSidebar';
import { deserializeGameState, serializeGameState } from '../src/engine/saveSystem';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import GameEndingScreen from '../src/components/GameEndingScreen';

function fixture(): GameState {
  return {
    date: new Date(2023,8,1), isPaused:false, gameSpeed:1,
    stats:{ pp:300, tpr:1000, ss:50, stab:60, studentSanity:65, allianceUnity:50, partyCentralization:50, radicalAnger:0, capitalPenetration:0 },
    modifiers:{ ppDaily:1, tprDaily:0, ssDaily:0, stabDaily:0, studentSanityDaily:0, allianceUnityDaily:0, partyCentralizationDaily:0, radicalAngerDaily:0, capitalPenetrationDaily:0, powerBalanceDaily:0 },
    leader:{ name:'封安保', title:'校长', portrait:'feng_anbao', ideology:'authoritarian' }, flags:{}, currentFocusTree:'phase1', lawSystem:{...DEFAULT_LAW_SYSTEM},
    chronicle:[], nationalSpirits:[], advisors:[], ideologies:{}, activeFocus:null, completedFocuses:[], crises:[], decisionCooldowns:{}, activeEvent:null, activeStoryEvents:[], activeSuperEvent:null, activeMinigame:null, unlockedMinigames:[],
    mapLocations:Object.fromEntries([...new Set(ALL_SUB_TILES.map(t=>t.buildingId))].map(id=>[id,{id,name:id,studentControl:50,defenseDays:0}]))
  };
}
function days(s:GameState,n:number):GameState { for(let i=0;i<n;i++){const date=new Date(s.date);date.setDate(date.getDate()+1);s=advanceCommandDay({...s,date});}return s; }

test('map and workgroup use the same action, price and cooldown',()=>{
  const s=fixture();
  const snapshot=JSON.stringify(s);
  const manual=executeMapAction(s,'track_field','pl_sports');
  assert.equal(manual.executed,true);
  assert.equal(manual.state.stats.pp,290);
  assert.equal(executeMapAction(manual.state,'track_field','pl_sports').executed,false);
  assert.equal(JSON.stringify(s),snapshot);
  const assigned=assignRecurringAction(s,'track_field','pl_sports',2);
  assert.equal(assigned.stats.pp,300);
  assert.equal(getCommandState(assigned).teams[0].order?.actionId,'pl_sports');
  const tick=days(assigned,2);
  assert.equal(tick.stats.pp,290);
  assert.equal(tick.flags.tile_ctrl_track_field,70);
  assert.equal(tick.command?.completed,1);
  assert.equal(tick.campaignStats?.clubEvents,1);
  assert.equal(advanceCommandDay(tick),tick);
});

test('workgroups retry when resources are insufficient and stop on route change',()=>{
  const s=fixture();s.stats.pp=0;
  const assigned=assignRecurringAction(s,'track_field','pl_sports',2);
  const failed=days(assigned,2);
  assert.equal(failed.stats.pp,0);
  assert.equal(failed.command?.teams[0].order?.repeats,0);
  const recovered=days({...failed,stats:{...failed.stats,pp:20}},1);
  assert.equal(recovered.stats.pp,10);
  const changed=days({...recovered,currentFocusTree:'treeB',leader:{...s.leader,name:'杨玉乐'}},1);
  assert.equal(changed.command?.teams[0].order,null);
});

test('focus, decision, law and supply turn a linked field action into route preparation',()=>{
  const s=fixture();
  assert.ok(getSupplyNetwork(s).has('b3_tower'));
  assert.ok(getSupplyNetwork(s).size <= ALL_SUB_TILES.length);
  assert.equal(getSupplyNetwork(s).has('gym_area'),false);
  s.completedFocuses=['dorm_talks'];
  s.decisionCooldowns.print_flyers=14;
  s.lawSystem={...DEFAULT_LAW_SYSTEM,clubs:'clubs_open'};
  assert.equal(getTeamCapacity(s),2);
  assert.equal(getOrderCadence(s,'b3_tower',4,0,'b3_under'),2);
  assert.equal(getCommandLinks(s,0,'b3_tower','b3_under').bonus,2);
  assert.equal(getCommandLinks(s,0,'track_field','pl_sports').bonus,0);
  const assigned=assignRecurringAction(s,'b3_tower','b3_under',4);
  const done=days(assigned,2);
  assert.equal(done.command?.completed,1);
  assert.equal(done.stats.pp,300);
  assert.equal(done.stats.ss,52);
  assert.equal(done.command?.preparation?.opening,2);
  assert.match(done.command!.reports[0].outcome,/2天后/);
  const decision=consumeRoutePreparation(done,'opening','decision');
  assert.equal(decision.spent,2);
  assert.equal(decision.state.stats.ss,56);
  assert.equal(decision.state.command?.preparation?.opening,0);
});

test('route preparation survives saves, stays with its route and supports the matching minigame',()=>{
  const s=fixture();s.currentFocusTree='treeA';s.flags.rebellion_started=true;
  const assigned=assignRecurringAction(s,'b3_tower','rally',2);
  const prepared=days(assigned,2);
  assert.equal(prepared.command?.preparation?.revolution,1);
  const loaded=deserializeGameState(serializeGameState(prepared))!;
  assert.equal(loaded.command?.preparation?.revolution,1);
  assert.equal(consumeRoutePreparation({...loaded,currentFocusTree:'treeA_pan'},'revolution','minigame').spent,0);
  const applied=consumeRoutePreparation(loaded,'revolution','minigame');
  assert.equal(applied.spent,1);
  assert.equal(applied.state.stats.ss,loaded.stats.ss+2);
  assert.equal(applied.state.command?.preparation?.revolution,0);
});

test('story route transitions carry a small amount of relevant field groundwork forward once',()=>{
  const s=fixture();
  s.command={version:2,nextId:1,lastTick:0,teams:[],reports:[],completed:0,preparation:{opening:5}};
  s.currentFocusTree='treeA';
  const revolutionary=getCommandState(s);
  assert.equal(revolutionary.preparation?.opening,0);
  assert.equal(revolutionary.preparation?.revolution,3);
  const reform={...s,currentFocusTree:'treeA_haobang',command:{...revolutionary,preparation:{reform:4}}};
  const commune=getCommandState(reform);
  assert.equal(commune.preparation?.reform,0);
  assert.equal(commune.preparation?.commune,3);
  assert.equal(consumeRoutePreparation(reform,'commune','minigame').spent,3);
});

test('each route operation refers to authored focus, law and decision content',()=>{
  const trees: Record<string,string>={opening:'phase1',revolution:'treeA',democracy:'treeA_pan',reform:'treeA_true_left',commune:'treeA_haobang',purge:'treeA_lu_bohan',wu:'wu_tree',yang:'treeB',jidi:'jidi_tree',gouxiong:'gouxiong_tree'};
  for(const [route,operation] of Object.entries(ROUTE_OPERATIONS)) {
    assert.ok(getFocusNodes(trees[route]).some(node=>node.id===operation.focus),`${route} focus exists`);
    const category=LAW_CATEGORIES.find(c=>c.id===operation.law);
    assert.ok(category && operation.lawLevels.every(level=>category.levels.includes(level)),`${route} law exists`);
    assert.ok(operation.actions.length,`${route} field action exists`);
    if(route!=='commune') assert.ok(DECISIONS.some(d=>d.id===operation.decision),`${route} decision exists`);
  }
  const purge=fixture();purge.currentFocusTree='treeA_lu_bohan';purge.completedFocuses=['great_purge_map_phase'];
  const decision=DECISIONS.find(d=>d.id==='purge_revisionists')!;
  assert.equal(decision.isVisible?.(purge),true);
  assert.equal(decision.canAfford?.(purge),true);
});

test('capacity changes with story and reform missions reserve the same team',()=>{
  const s=fixture();assert.equal(getTeamCapacity(s),1);
  s.currentFocusTree='treeA_true_left';
  s.reformState={progress:0,vanguardMembers:30,regionalStubbornness:{B3:60},activeMissions:{},baseSuccessRate:50};
  assert.equal(getTeamCapacity(s),3);
  const reserved=reserveReformTeam(s,'B3','coop',14)!;
  assert.equal(reserved.command?.teams[0].order?.reformRegion,'B3');
  assert.equal(cancelOrder(reserved,'team-1'),reserved);
  reserved.reformState!.activeMissions={B3:{daysLeft:1,actionId:'coop'}};
  const waiting=days(reserved,1);
  assert.equal(waiting.command?.teams[0].order?.remaining,1);
  const done=days({...waiting,reformState:{...waiting.reformState!,activeMissions:{}}},1);
  assert.equal(done.command?.teams[0].order,null);
});

test('story gates and route-specific map actions cannot be bypassed',()=>{
  const s=fixture();
  assert.deepEqual(availableMapActions(s,'admin_main'),[]);
  assert.equal(assignRecurringAction(s,'admin_main','adm_hack',2),s);
  s.currentFocusTree='treeA_haobang';
  assert.deepEqual(availableMapActions(s,'b3_tower'),[]);
  s.flags.haobang_commune_action_tile_b3_tower=true;
  assert.equal(availableMapActions(s,'b3_tower')[0].id,'cm_build');
  const built=days(assignRecurringAction(s,'b3_tower','cm_build',2),2);
  assert.equal(built.flags.haobang_commune_zone_level_tile_b3_tower,1);
});

test('every active route has a meaningful team assignment path',()=>{
  const cases: Array<[string,string,string,string]> = [
    ['treeA','b3_tower','rebellion_started','boost'],
    ['treeA_pan','b3_tower','polling_stations_unlocked','campaign'],
    ['treeA_haobang','b3_tower','haobang_commune_action_tile_b3_tower','cm_build'],
    ['treeA_lu_bohan','b3_tower','lu_purge_action_tile_b3_tower','lu_purge'],
    ['wu_tree','admin_main','wu_crackdown_map_phase','wu_patrol'],
    ['treeB','admin_main','yang_yule_route_started','yy_coord'],
    ['jidi_tree','admin_main','jidi_new_era_active','jd_optimize'],
    ['gouxiong_tree','aud_hall','gx_anarchy_action_tile_aud_hall','gx_anime'],
  ];
  for(const [tree,tile,flag,actionId] of cases) {
    const s=fixture();s.currentFocusTree=tree;s.flags[flag]=true;
    assert.ok(availableMapActions(s,tile).some(a=>a.id===actionId),`${tree} should expose ${actionId}`);
    assert.notEqual(assignRecurringAction(s,tile,actionId,4),s,`${tree} should accept a workgroup`);
  }
  const reform=fixture();reform.currentFocusTree='treeA_true_left';reform.reformState={progress:0,vanguardMembers:15,regionalStubbornness:{B3:60},activeMissions:{},baseSuccessRate:50};
  assert.ok(reserveReformTeam(reform,'B3','coop',14));
});

test('save/load preserves recurring order and current route state',()=>{
  const s=assignRecurringAction(fixture(),'track_field','pl_sports',4);
  const loaded=deserializeGameState(serializeGameState(s))!;
  assert.equal(loaded.command?.teams[0].order?.interval,4);
  assert.equal(days(loaded,4).command?.completed,1);
  assert.equal(deserializeGameState('{"date":"invalid"}'),null);
});

test('old independent orders are cleared and prepaid PP is restored on load',()=>{
  const s=fixture();s.stats.pp=280;
  const old=JSON.parse(serializeGameState(s));
  old.command={version:1,nextId:2,lastTick:0,teams:[{id:'alpha',order:{id:1,costPP:20,kind:'special'}}],reports:[],completed:0};
  const migrated=deserializeGameState(JSON.stringify(old))!;
  assert.equal(migrated.stats.pp,300);
  assert.equal(migrated.command,undefined);
});

test('paper upkeep increases with stock; ending summary uses accumulated metrics',()=>{
  const s=fixture();
  assert.ok(getPaperUpkeep(s)>0);
  const surplus= {...s,stats:{...s.stats,tpr:5000}};
  assert.ok(getPaperUpkeep(surplus)>getPaperUpkeep(s)+70);
  const day=recordCampaignDay(s,{...s,date:new Date(2023,8,2),stats:{...s.stats,tpr:995}},getPaperUpkeep(s));
  assert.equal(day.campaignStats?.days,1);
  assert.ok(day.campaignStats!.papersUsed>0);
  const summary=getCampaignSummary(day);
  assert.equal(summary.c9,0);
  assert.equal(summary.university985,0);
});

test('ending screen shows a compact campus ledger rather than the entire chronicle',()=>{
  const s=fixture();s.date=new Date(2024,8,1);s.gameEnding='game_over_school';s.campaignStats={days:365,papersUsed:1840,papersPrinted:2170,clubEvents:24,learningScoreTotal:24000};
  s.chronicle=[{date:s.date.getTime(),type:'event',title:'A long chronicle entry',description:'Do not print every entry here',importance:1}];
  const html=renderToStaticMarkup(React.createElement(GameEndingScreen,{state:s,onRestart:()=>{},onReturnToMainMenu:()=>{}}));
  assert.match(html,/本局校园年鉴/);
  assert.match(html,/1,840/);
  assert.match(html,/24/);
  assert.doesNotMatch(html,/A long chronicle entry/);
});
