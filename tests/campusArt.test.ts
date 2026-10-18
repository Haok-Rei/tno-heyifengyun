import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import type {GameState} from '../src/types';
import {getCampusArtChapter,getCampusArtBranch,getCampusArtScene} from '../src/engine/campusArt';
import {getHeyiLightSnapshot,type HeyiRoute} from '../src/engine/heyiLight';
import {CampusArchitecturalEngraving,CampusRouteObjects} from '../src/components/CampusEnvironment';

const renderSvg=(element:ReturnType<typeof createElement>)=>renderToStaticMarkup(createElement('svg',null,element));

const state=(tree='phase1',changes:Partial<GameState>={})=>({date:new Date(2023,8,1),currentFocusTree:tree,completedFocuses:[],flags:{},heyiLightValue:50,stats:{pp:50,stab:50,ss:50,tpr:50,capitalPenetration:0,radicalAnger:50,allianceUnity:50,partyCentralization:50,studentSanity:50},...changes} as GameState);
const chapter=(s:GameState)=>getCampusArtChapter(s,getHeyiLightSnapshot(s));

test('campus artwork follows actual milestones and leaves game state untouched',()=>{
 const s=state('jidi_tree');const before=structuredClone(s);
 assert.equal(chapter(s),0);assert.deepEqual(s,before);
 assert.equal(chapter({...s,completedFocuses:['jidi_rnd_department']}),1);
 assert.equal(chapter({...s,completedFocuses:['jidi_monopoly']}),2);
 assert.equal(chapter(state('treeA',{completedFocuses:['convene_assembly']})),2);
 assert.equal(chapter(state('treeA_true_left',{completedFocuses:['start_reform']})),1);
 assert.equal(chapter(state('treeA_pan_despair',{completedFocuses:['defend_b3']})),1);
 assert.equal(chapter(state('treeA_pan_despair',{completedFocuses:['counter_attack']})),2);
 const reform=state('treeA_true_left',{flags:{reform_unlocked:true},reformState:{progress:50} as GameState['reformState']});
 const original=getHeyiLightSnapshot(reform),visual=getCampusArtScene(reform,original);
 assert.equal(original.route,'revolution');assert.equal(visual.route,'reform');assert.equal(getCampusArtChapter(reform,visual),1);
});

test('election booths require an active election; unlocked clubs remain open between elections',()=>{
 assert.equal(chapter(state('treeA_pan',{flags:{map_struggle_ended:true}})),0);
 assert.equal(chapter(state('treeA_pan',{completedFocuses:['bill_club_freedom']})),2);
 assert.equal(chapter(state('treeA_pan',{completedFocuses:['bill_club_freedom'],electionState:{isActive:true} as GameState['electionState']})),1);
 assert.equal(chapter(state('treeA_pan',{gameEnding:'game_over_pan'})),2);
});

test('all twelve scene families have distinct detailed drawings for three chapters',()=>{
 const snapshot=getHeyiLightSnapshot(state());
 const routes:HeyiRoute[]=['opening','uprising','democracy','revolution','reform','haobang','yang','jidi','jidi_riot','gouxiong','wu','despair'];
 for(const route of routes){
  const drawings=[0,1,2].map(ch=>renderSvg(createElement(CampusRouteObjects,{observation:{snapshot:{...snapshot,route,uprisingStage:ch===0?'barricades':ch===1?'committee':'assembly'},active:null,onZone:()=>{},onPointer:()=>{}},chapter:ch as 0|1|2})));
  assert.equal(new Set(drawings).size,3,route);
  for(const svg of drawings){assert.ok(svg.length>1800,route);assert.doesNotMatch(svg,/NaN|undefined|<script|foreignObject/);}
  const building=renderSvg(createElement(CampusArchitecturalEngraving,{route,chapter:1}));
  assert.doesNotMatch(building,/NaN|undefined/);assert.match(building,/pointer-events="none"/);assert.match(building,/clipPath/);
 }
});

test('different authoritarian outcomes have different institutions and scenery',()=>{
 const scene=getHeyiLightSnapshot(state('wu_tree'));
 const trees=['wu_tree_p2_spring','wu_tree_p2_feng','wu_tree_p2_coup','treeA_lu_bohan'];
 const images=trees.map(tree=>renderSvg(createElement(CampusRouteObjects,{observation:{snapshot:scene,active:null,onZone:()=>{},onPointer:()=>{}},chapter:2,branch:getCampusArtBranch(state(tree))})));
 assert.equal(new Set(images).size,4);assert.match(images[0],/整改清單/);assert.match(images[1],/模範校/);assert.match(images[2],/護校隊/);assert.match(images[3],/審查室/);
});
