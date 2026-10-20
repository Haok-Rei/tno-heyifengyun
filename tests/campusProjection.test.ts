import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {at,inset,facadeDepth,geometry,type Point} from '../src/components/campusPrimitives';
import {projectingStep,CampusEntrance,getStructureProfile} from '../src/components/CampusStructures';
import {getHeyiLightSnapshot} from '../src/engine/heyiLight';
import type {GameState} from '../src/types';
import {campusMassing,storeyLines} from '../src/components/campusMassing';
import {windowLighting} from '../src/components/campusLighting';

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

test('arcaded wings share a continuous tall corner and common physical storeys',()=>{
  for(const route of ['democracy','reform','revolution','haobang','opening','wu'] as const)for(const chapter of [0,1,2] as const){
    const p=getStructureProfile(route,chapter),m=campusMassing(p);
    assert.deepEqual(m.faces.left[1],m.faces.right[0],p.id+' roof corner');assert.deepEqual(m.faces.left[2],m.faces.right[3],p.id+' foot corner');
    for(const v of storeyLines(p.body.floors)){const a=at(m.faces.left,1,v),b=at(m.faces.right,0,v);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<1e-8,p.id+' floor joint');}
    if(m.annex){
      const a=m.annex,cut=1/p.body.floors;
      assert.ok(Math.hypot(a.face[0].x-at(m.faces.right,1,cut).x,a.face[0].y-at(m.faces.right,1,cut).y)<1e-8);
      for(const v of storeyLines(a.floors)){
        const x=at(a.face,0,v),y=at(m.faces.right,1,cut+(1-cut)*v);
        assert.ok(Math.hypot(x.x-y.x,x.y-y.y)<1e-8,p.id+' annex floor joint');
      }
      assert.ok(m.returnWall,'a height step needs a visible end wall');
    }
  }
});

test('window light phases are stable and distributed across independent cycles',()=>{
  const phases=Array.from({length:40},(_,i)=>windowLighting(i));
  assert.deepEqual(windowLighting(11),windowLighting(11));
  assert.ok(new Set(phases.map(p=>p.duration)).size>12);
  const buckets=new Set(phases.map(p=>Math.floor((-p.delay/p.duration)*8)));
  assert.equal(buckets.size,8);assert.ok(phases.every(p=>p.duration>=24&&p.duration<=44&&p.delay<=0&&-p.delay<p.duration));
});

test('the distant gate column is shortened to meet its receding beam',()=>{
  const s={date:new Date(2023,8,1),currentFocusTree:'phase1',flags:{},completedFocuses:[],stats:{stab:50,ss:50}} as GameState;
  const snapshot=getHeyiLightSnapshot(s),profile=getStructureProfile('opening',0);
  const markup=renderToStaticMarkup(createElement(CampusEntrance,{profile,observation:{snapshot,active:null,onZone:()=>{},onPointer:()=>{}}}));
  const heights=[...markup.matchAll(/data-gate-post-height="([^"]+)"/g)].map(m=>Number(m[1]));
  assert.equal(heights.length,2);assert.ok(heights[0]<heights[1]-25);assert.ok(Math.abs(heights[1]-183)<1e-8);
});
