import {at,inset,path,geometry,FaceLines,type Face,type Point} from './campusPrimitives';
import type {CampusStructureProfile} from './CampusStructures';

const stroke='#a6b5a6',edge='#567d83';
const ln=(f:Face,p:[number,number][])=>path(p.map(([u,v])=>at(f,u,v)));

function Vent({anchor,large=false}:{anchor:Point;large?:boolean}) {
  const box=geometry(anchor.x,anchor.y-5,large?30:20,large?53:32,large?28:17);
  const curb=geometry(anchor.x,anchor.y-2,6,large?58:36,large?32:21);
  return <g className="campus-roof-vent" fill="#071115" stroke={stroke} strokeWidth=".7">
    <path d={path(curb.left,true)+path(curb.right,true)+path(curb.roof,true)}/>
    <path d={path(box.left,true)}/><path d={path(box.right,true)} stroke={edge}/><path d={path(box.roof,true)} fill="#0b181b"/>
    <FaceLines face={inset(box.left,.09,.14,.82,.73)} rows={large?7:4} color="#80988d"/>
    <path d={path(inset(box.right,.13,.12,.72,.74),true)} fill="none" stroke={edge} strokeWidth=".5"/>
    <path d={ln(box.roof,[[.12,.16],[.86,.16],[.86,.81],[.12,.81],[.12,.16]])} fill="none" stroke="#59776f" strokeWidth=".5"/>
    {large&&<path d={ln(box.right,[[.30,.15],[.30,.88]])+ln(box.right,[[.68,.15],[.68,.88]])} fill="none" stroke="#839c93" strokeWidth=".6"/>}
  </g>;
}

function ServiceLadder({face}:{face:Face}) {
  const f=inset(face,.968,.07,.026,.86);
  return <g className="campus-service-ladder" fill="none" stroke={stroke} strokeWidth=".65">
    <path d={ln(f,[[.02,0],[.02,1]])+ln(f,[[.98,0],[.98,1]])} strokeWidth=".85"/>
    {Array.from({length:19},(_,i)=><path key={i} d={ln(f,[[0,.03+i*.05],[1,.03+i*.05]])} stroke={i%3?edge:stroke} strokeWidth=".55"/>)}
    {[.04,.28,.53,.79].map(v=><g key={v}><path d={ln(f,[[-.25,v],[-.25,v+.02],[1.25,v+.02],[1.25,v]])} stroke={edge} strokeWidth=".5"/><path d={ln(f,[[0,v],[.2,v+.018],[.8,v+.018],[1,v]])} stroke="#91a69d" strokeWidth=".6"/></g>)}
    <path d={ln(f,[[.02,0],[.02,-.06],[.25,-.075]])+ln(f,[[.98,0],[.98,-.06],[1.20,-.075]])}/>
  </g>;
}

function Bracket({anchor,kind}:{anchor:Point;kind:'camera'|'horn'|'lamp'}) {
  const {x,y}=anchor;
  return <g transform={`translate(${x} ${y})`} fill="#061015" stroke={stroke} strokeWidth=".65">
    <path d="M-3-3H2V12H-3Zm5 10 13 3 3-3" fill="none" stroke={edge}/>
    {kind==='camera'?<>
      <path d="M13-4l21 3 5 5-3 8-23-4Zm0 0-5 5v7l5 0m23-4 6 2-1 6-5 0"/>
      <path d="M17-1l16 3m-18 7 17 2" fill="none" stroke={edge} strokeWidth=".5"/>
      <ellipse cx="38" cy="8" rx="2.1" ry="3" fill="#111e21"/>
    </>:kind==='horn'?<>
      <path d="M10 0l8-3 18-8v22L18 3l-8 1Z"/>
      <ellipse cx="36" cy="0" rx="4" ry="11" fill="#030b10" stroke={edge}/>
      <path d="M12 0h7m-1-3v6m5-8v10" fill="none" stroke="#81968e" strokeWidth=".45"/>
    </>:<>
      <path d="M12-10l10 2 5 6-20-3ZM9-5l1 8 14 2 2-7M12 4l11 2"/>
      <path d="M12-2l11 2" fill="none" stroke="#c3b58d" strokeWidth="1"/>
    </>}
  </g>;
}

function WallClock({face}:{face:Face}) {
  const c=at(face,.705,.718),r=8;
  const xSlope=(face[1].y-face[0].y)/(face[1].x-face[0].x);
  return <g transform={`matrix(1 ${xSlope} 0 1 ${c.x} ${c.y})`} fill="#040c10" stroke="#b1b59d" strokeWidth=".65">
    <circle r={r+2}/><circle r={r} stroke={edge}/>
    {Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return <path key={i} d={`M${Math.sin(a)*6} ${-Math.cos(a)*6}L${Math.sin(a)*7.5} ${-Math.cos(a)*7.5}`} fill="none" strokeWidth=".5"/>;})}
    <path d="M0-5V0L4 2" fill="none" stroke="#d1c3a0" strokeWidth=".85"/><circle r=".8" fill="#d1c3a0"/>
  </g>;
}

/** Reviewed DeepSeek fixture concepts, redrafted in the shared perspective system. */
export function CampusFixtures({faces,profile}:{faces:{left:Face;right:Face};profile:CampusStructureProfile}) {
  const {route,chapter,body}=profile;
  const industrial=route==='jidi',damaged=route==='despair'||route==='jidi_riot';
  return <g className="campus-building-fixtures" pointerEvents="none" aria-hidden="true">
    {!damaged&&<Vent anchor={at(faces.left,industrial?.32:.25,-.018)} large={industrial}/>}
    {industrial&&<><Vent anchor={at(faces.right,.63,-.024)} large/><ServiceLadder face={faces.right}/></>}
    {!damaged&&!industrial&&<g fill="none" stroke="#7f9d96" strokeWidth=".65">{[.17,.54].map(u=>{
      const p=at(faces.left,u,-.015);return <g key={u}><path d={`M${p.x} ${p.y}v-25m-6 25 6-11 6 12m-6-21 0-9`} /><path d={`M${p.x-3} ${p.y-7}h6`} strokeWidth=".45"/></g>;
    })}</g>}
    {body.clock&&<WallClock face={faces.left}/>}
    {(route==='yang'||route==='haobang')&&<Bracket anchor={at(faces.left,.845,.80)} kind="lamp"/>}
    {route==='wu'&&<Bracket anchor={at(faces.right,.018,.70)} kind="camera"/>}
    {route==='uprising'&&chapter===1&&<Bracket anchor={at(faces.left,.985,.47)} kind="horn"/>}
    {damaged&&<g fill="none" stroke="#a99c81" strokeWidth=".8">{[.715,.754,.802].map((u,i)=>{
      const p=at(faces.left,u,.015+i*.018),q=at(faces.left,u+.028,.072+i*.015);return <g key={u}><path d={path([p,q,{x:q.x+2,y:q.y-1},{x:p.x+2,y:p.y-1}])}/><path d={path([{x:p.x-5,y:p.y+2},{x:p.x+8,y:p.y+3}])} stroke={edge} strokeWidth=".5"/></g>;
    })}</g>}
  </g>;
}
