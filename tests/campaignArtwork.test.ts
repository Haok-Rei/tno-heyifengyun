import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ENDINGS } from '../src/data/endings';
import { ENDING_ARTWORK, ENDING_SCENE_NAMES } from '../src/config/endingArtwork';
import { ENDING_CG } from '../src/config/endingCgAssets';
import { getEndingImageUrl } from '../src/config/assets';
import { ARTWORKS } from '../src/data/artGallery';
import { getEarnedArtwork } from '../src/engine/artGallery';
import { HERO_ART, MECHANISM_ART } from '../src/config/campaignArtwork';
import { getEventArtwork, EVENT_ART_BINDINGS } from '../src/config/eventArtwork';
import focusLinks from '../src/config/campaignEventArt.json';
import { ROUTE_FOCUS_ART } from '../src/config/routeIconArtwork';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getFocusNodes } from '../src/components/FocusTree';
import { getFocusLayout } from '../src/components/focusLayout';
import HeyiLightSpirit, {getHeyiSpiritAppearance} from '../src/components/HeyiLightSpirit';
import type { GameState } from '../src/types';

test('all 26 implemented endings have distinct local scene CGs, including safe fallback',()=>{
  const implemented=ENDINGS.filter(e=>e.implemented);
  assert.equal(implemented.length,26);
  const sources=new Set<string>();
  for(const ending of implemented) {
    const src=getEndingImageUrl(ending.imageKey);
    assert.equal(src,ENDING_ARTWORK[ending.id],ending.id);
    assert.ok(ENDING_SCENE_NAMES[ending.id],ending.id);
    assert.ok(src&&!src.startsWith('http'),ending.id);
    assert.ok(existsSync(fileURLToPath(src)),ending.id);
    sources.add(src);
  }
  assert.equal(sources.size,implemented.length);
  assert.ok(!getEndingImageUrl('obsolete_save_ending').startsWith('http'));
  const yangSuccess=getEventArtwork({id:'yang_yule_success_event',title:'',description:''});
  assert.ok(yangSuccess&&yangSuccess.kind==='scene');
  assert.equal(getEndingImageUrl('game_over_yang_yule_success'),yangSuccess.src,'Yang success uses the award ceremony, not the failed-review scene');
});

test('large focus crests do not overlap across all authored trees and aligned columns stay aligned',()=>{
  for(const tree of ['phase1','treeA','treeA_pan','treeA_pan_despair','treeA_true_left','treeA_lu_bohan','treeA_haobang','treeB','jidi_tree','gouxiong_tree','wu_tree','wu_tree_p2_feng','wu_tree_p2_spring','wu_tree_p2_coup']) {
    const nodes=getFocusNodes(tree),layout=getFocusLayout(nodes);
    for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++) {
      if(nodes[i].x===nodes[j].x)assert.equal(layout.x(nodes[i]),layout.x(nodes[j]));
      if(Math.abs(layout.y(nodes[i])-layout.y(nodes[j]))<155) assert.ok(Math.abs(layout.x(nodes[i])-layout.x(nodes[j]))>=200,`${tree}: ${nodes[i].id}/${nodes[j].id}`);
    }
  }
});

test('Heyi Light spirit follows real route, stage, branch and mood without click targets or state mutation',()=>{
  const base={date:new Date(2023,8,1),currentFocusTree:'phase1',completedFocuses:[],flags:{},heyiLightValue:60,stats:{pp:50,stab:50,ss:50,tpr:1000,capitalPenetration:0,radicalAnger:50,allianceUnity:50,partyCentralization:50,studentSanity:50}} as GameState;
  const cases=[
    {},{currentFocusTree:'treeA'},{currentFocusTree:'treeA',completedFocuses:['convene_assembly']},
    {currentFocusTree:'treeA_pan'},{currentFocusTree:'treeA_pan',gameEnding:'game_over_pan'},
    {currentFocusTree:'treeA_true_left'},{currentFocusTree:'treeA_true_left',flags:{reform_unlocked:true},reformState:{progress:80}},
    {currentFocusTree:'treeA_haobang'},{currentFocusTree:'treeB'},{currentFocusTree:'jidi_tree'},
    {currentFocusTree:'jidi_tree',flags:{jidi_riot_active:true}}, {currentFocusTree:'gouxiong_tree'},
    {currentFocusTree:'wu_tree_p2_spring'},{currentFocusTree:'wu_tree_p2_coup'},{currentFocusTree:'wu_tree_p2_feng'},{currentFocusTree:'treeA_lu_bohan'},
    {currentFocusTree:'treeA_pan_despair',heyiLightValue:10},
  ];
  const keys=new Set<string>(),pictures=new Set<string>();
  for(const patch of cases) {
    const state={...base,...patch} as GameState,before=JSON.stringify(state);
    const appearance=getHeyiSpiritAppearance(state),markup=renderToStaticMarkup(createElement(HeyiLightSpirit,{state}));
    assert.ok(appearance.profile&&appearance.theme);
    assert.ok(!/role="button"|tabindex=|onclick=/.test(markup));
    assert.equal(JSON.stringify(state),before);
    keys.add(appearance.key);pictures.add(markup);
  }
  assert.equal(keys.size,cases.length);assert.equal(pictures.size,cases.length);
  const bleak=getHeyiSpiritAppearance({...base,heyiLightValue:10}),bright=getHeyiSpiritAppearance({...base,heyiLightValue:90});
  assert.equal(bleak.mood,'ruin');assert.equal(bright.mood,'bright');
});

test('new ending CG collection requires its exact ending, never just entering a route',()=>{
  const progress={currentFocusTree:'treeA_pan',completedFocuses:[],activeEvent:null,activeSuperEvent:null,gameEnding:null,chronicle:[]};
  for(const name of Object.keys(ENDING_CG)) {
    const artwork=ARTWORKS.find(work=>work.name===name)!;
    assert.ok(artwork&&artwork.endings?.length===1,name);
    assert.ok(!getEarnedArtwork(progress).includes(artwork),name);
    for(const ending of ENDINGS) assert.equal(getEarnedArtwork({...progress,gameEnding:ending.id}).includes(artwork),artwork.endings!.includes(ending.id),`${name} / ${ending.id}`);
  }
});

test('web panel derivatives are local WebP assets and focus links preserve dedicated portraits and scenes',()=>{
  assert.equal(Object.keys(HERO_ART).length,33);
  assert.equal(Object.keys(MECHANISM_ART).length,37);
  for(const src of [...Object.values(HERO_ART),...Object.values(MECHANISM_ART)]) {
    const bytes=readFileSync(fileURLToPath(src));
    assert.equal(bytes.subarray(8,12).toString(),'WEBP');
  }
  let paintings=0;
  for(const [eventId,focusId] of Object.entries(focusLinks)) {
    assert.ok(ROUTE_FOCUS_ART[focusId],focusId);
    const art=getEventArtwork({id:eventId,title:'',description:''});
    assert.ok(art,eventId);
    if(art.kind==='painted') { paintings++; assert.equal(art.focusId,focusId); assert.ok(!EVENT_ART_BINDINGS[eventId]?.portrait); }
  }
  assert.ok(paintings>=60,`${paintings} focus-linked paintings`);
});
