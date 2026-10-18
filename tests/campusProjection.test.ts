import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {at,inset,facadeDepth,geometry,type Point} from '../src/components/campusPrimitives';
import {projectingStep,CampusEntrance,getStructureProfile} from '../src/components/CampusStructures';
import {getHeyiLightSnapshot} from '../src/engine/heyiLight';
import type {GameState} from '../src/types';

const collinear=(a:Point,b:Point,c:Point)=>Math.abs((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x));
test('facade projection preserves diagonal lines and equal bays shrink into the distance',()=>{
  const f=geometry(720,435,360,640,440).left;
  assert.ok(collinear(at(f,.1,.1),at(f,.5,.5),at(f,.9,.9))<1e-7,'a physical diagonal must remain straight');
  const far=at(f,.125,.2).x-at(f,0,.2).x,near=at(f,1,.2).x-at(f,.875,.2).x;
  assert.ok(near>far*1.5,'nearby windows must be wider than distant windows');
  const sub=inset(f,.15,.2,.7,.6),a=at(sub,.3,.4),b=at(f,.15+.7*.3,.2+.6*.4);
  assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<1e-8,'nested window surrounds stay in the same wall plane');
  for(const face of [geometry(720,435,360,640,440).left,geometry(720,435,360,640,440).right]){
    const back=facadeDepth(face,.025),wallVP=face[0].x<720?{x:-1200,y:260}:{x:2300,y:260};
    assert.ok(collinear(back[0],back[1],wallVP)<1e-7,'back of the moulding must share the facade vanishing point');
    assert.ok(collinear(back[3],back[2],wallVP)<1e-7);
    const step=projectingStep(inset(face,.4,.2,.12,.15),.003,0);
    // A projecting sill uses the OTHER horizontal vanishing point, on either facade.
    const target=face[0].x<720?{x:2300,y:260}:{x:-1200,y:260};
    assert.ok(collinear(step[0],step[3],target)<1e-7);assert.ok(collinear(step[1],step[2],target)<1e-7);
  }
});

test('the distant gate column is shortened to meet its receding beam',()=>{
  const s={date:new Date(2023,8,1),currentFocusTree:'phase1',flags:{},completedFocuses:[],stats:{stab:50,ss:50}} as GameState;
  const snapshot=getHeyiLightSnapshot(s),profile=getStructureProfile('opening',0);
  const markup=renderToStaticMarkup(createElement(CampusEntrance,{profile,observation:{snapshot,active:null,onZone:()=>{},onPointer:()=>{}}}));
  const heights=[...markup.matchAll(/data-gate-post-height="([^"]+)"/g)].map(m=>Number(m[1]));
  assert.equal(heights.length,2);assert.ok(heights[0]<heights[1]-25);assert.ok(Math.abs(heights[1]-183)<1e-8);
});
