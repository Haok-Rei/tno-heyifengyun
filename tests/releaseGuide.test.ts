import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CURRENT_VERSION, RELEASE_GROUPS } from '../src/config/releases';
import { validateReleaseHistory } from '../scripts/check-release-history.mjs';
import { ROUTE_TREE } from '../src/data/routeGuide';
import { ENDING_BY_ID } from '../src/data/endings';
import { ALL_SUB_TILES, type GameState } from '../src/types';
import { currentGuideId, findGuideNode, guideIds, guidePath, guideExpansion, filterGuide, getRouteGuideStatus } from '../src/engine/routeGuidance';
import { CROSSROADS_RULES, getCrossroadsOutcome, CROSSROADS_LABELS } from '../src/engine/assemblyPolitics';
import { PHASE1_NODES, TREE_A_PAN_NODES } from '../src/components/FocusTree';

function state(tree = 'phase1'): GameState { return { currentFocusTree:tree, flags:{}, completedFocuses:[], crises:[], nationalSpirits:[], advisors:[], date:new Date(2023,8,1), leader:{name:'封安宝'}, stats:{radicalAnger:80,allianceUnity:55,partyCentralization:70,studentSanity:81}, studentAssemblyFactions:{orthodox:40,pan:30,bear:10,otherDem:10,testTaker:10} } as unknown as GameState; }
const json = (path: string) => JSON.parse(readFileSync(path,'utf8'));
test('release archive, build version and changelog stay synchronized',()=>{
  const archive=json('src/data/releaseHistory.json'),manifest=json('package.json'),lock=json('package-lock.json'),log=readFileSync('CHANGELOG.md','utf8');
  assert.ok(validateReleaseHistory(archive,manifest,lock,log)>20);
  assert.equal(CURRENT_VERSION,manifest.version);
  const bad=structuredClone(archive);bad.currentVersion='999.0.0';assert.throws(()=>validateReleaseHistory(bad,manifest,lock,log));
  const duplicate=structuredClone(archive);duplicate.groups[0].releases.push(duplicate.groups[0].releases[0]);assert.throws(()=>validateReleaseHistory(duplicate,manifest,lock,log));
});
test('historical themes preserve requested colors and unnumbered records',()=>{
  assert.equal(RELEASE_GROUPS.find(g=>g.id==='1.1')!.title,'丑陋的做题家');
  assert.equal(RELEASE_GROUPS.find(g=>g.id==='1.2')!.title,'特级教师');
  assert.equal(RELEASE_GROUPS.find(g=>g.id==='1.3')!.title,'合一之春');
  assert.equal(RELEASE_GROUPS.find(g=>g.id==='1.4')!.title,'及第之梦');
  assert.notEqual(RELEASE_GROUPS.find(g=>g.id==='8.6')!.title,'合一之春');
  assert.notEqual(RELEASE_GROUPS.find(g=>g.id==='6.0')!.title,'丑陋的做题家');
  assert.equal(RELEASE_GROUPS.find(g=>g.title==='丑陋的做题家')!.color,'#a7abb2');
  assert.equal(RELEASE_GROUPS.find(g=>g.title==='合一之春')!.color,'#83b4ee');
  assert.ok(RELEASE_GROUPS.some(g=>g.releases.some(r=>r.version===null)));
});
test('every current tree has a guide node, every listed ending is valid, and collapse closes descendants',()=>{
  const ids=guideIds(ROUTE_TREE);assert.equal(new Set(ids).size,ids.length);
  for(const id of ids){const node=findGuideNode(id)!;if(node.endingId)assert.ok(ENDING_BY_ID[node.endingId],id);}
  for(const tree of ['phase1','treeA','treeB','treeA_pan','treeA_pan_despair','treeA_true_left','treeA_haobang','treeA_lu_bohan','jidi_tree','gouxiong_tree','wu_tree','wu_tree_p2_feng','wu_tree_p2_spring','wu_tree_p2_coup']){
    const id=currentGuideId(state(tree));assert.ok(findGuideNode(id),tree);assert.equal(guidePath(id).at(-1),id);
  }
  assert.ok(Object.values(guideExpansion(ROUTE_TREE,false)).every(v=>v===false));
  assert.ok(filterGuide(ROUTE_TREE,'重拾民主'));assert.equal(filterGuide(ROUTE_TREE,'不存在的路线ABC'),undefined);
  assert.ok(filterGuide({id:'old-title',title:'旧称',type:'ending',endingId:'game_over_pan'},ENDING_BY_ID.game_over_pan.title));
});
test('B3 boundary, crossroads priority and live progress match actual game rules',()=>{
  const s=state(),focus=PHASE1_NODES.find(n=>n.id==='charge_b3')!;
  for(const anger of [80,80.1,100]){s.stats.radicalAnger=anger;assert.equal(getRouteGuideStatus(s).checks[0].met,focus.canStart!(s));}
  for(const [id,index] of [['route_pan',0],['route_true_left',1],['golden_path',2]] as const)assert.equal(findGuideNode(id)!.req,CROSSROADS_RULES[index]);
  s.currentFocusTree='treeA';assert.equal(getCrossroadsOutcome(s),'true_left');assert.ok(getRouteGuideStatus(s).tip.includes(CROSSROADS_LABELS.true_left));
  s.studentAssemblyFactions!.pan=35;s.stats.partyCentralization=20;s.stats.allianceUnity=80;assert.ok(getRouteGuideStatus(s).tip.includes(CROSSROADS_LABELS.democracy));
});
test('democracy guide uses actual tile control, bill prerequisites and 60-day election',()=>{
  const s=state('treeA_pan');s.completedFocuses=['expand_assembly','democratic_reforms'];
  for(const tile of ALL_SUB_TILES)s.flags['tile_ctrl_'+tile.id]=100;
  const focus=TREE_A_PAN_NODES.find(n=>n.id==='reclaim_democracy')!;
  s.flags['tile_ctrl_'+ALL_SUB_TILES[0].id]=99.96;
  assert.equal(getRouteGuideStatus(s).checks[0].met,focus.canStart!(s));assert.ok(getRouteGuideStatus(s).tip.includes('99.9%'));
  s.flags['tile_ctrl_'+ALL_SUB_TILES[0].id]=100;assert.equal(getRouteGuideStatus(s).checks[0].met,focus.canStart!(s));
  s.flags.map_struggle_ended=true;s.flags.passed_bills_count=3;s.parliamentState={powerBalance:30} as any;
  const victory=TREE_A_PAN_NODES.find(n=>n.id==='pan_ending')!;assert.equal(getRouteGuideStatus(s).checks.every(c=>c.met),victory.canStart!(s));
  s.electionState={isActive:true,daysLeft:45,totalDays:60} as any;assert.ok(getRouteGuideStatus(s).checks[0].value.includes('60天'));assert.equal(TREE_A_PAN_NODES.find(n=>n.id==='first_democratic_election')!.days,60);
  s.flags.map_struggle_ended=false;assert.ok(getRouteGuideStatus(s).tip.includes('每五日移动'));
});
