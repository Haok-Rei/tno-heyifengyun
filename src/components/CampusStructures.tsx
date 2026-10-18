import {memo,useId,type CSSProperties} from 'react';
import {at,inset,facadeDepth,geometry,path,Observe,Plate,FaceLines,INK,EDGE,type Face,type Point,type Observation} from './campusPrimitives';
import {CampusFixtures} from './CampusFixtures';
import type {HeyiRoute} from '../engine/heyiLight';
import type {CampusBranch,CampusChapter} from '../engine/campusArt';
import profiles from '../data/campusArchitecture.json';

export interface CampusStructureProfile {
  id:string;route:HeyiRoute;chapter:CampusChapter;concept:string;
  body:{floors:2|3|4;leftBays:number;rightBays:number;height:number;leftReach:number;rightReach:number;roof:'parapet'|'gable'|'sawtooth'|'cornice'|'terrace';windows:'cross'|'tall'|'arch'|'ribbon'|'shutter';skin:'brick'|'stone'|'render'|'metal';arcade:boolean;balcony:boolean;entrance:'glass'|'arch'|'portico'|'shutter'|'boarded';clock:boolean};
  gate:{kind:'school'|'pavilion'|'industrial'|'colonnade'|'checkpoint'|'breached'|'sealed';columns:'square'|'brick'|'stone'|'steel';canopy:'flat'|'pitched'|'beam'|'none';open:boolean};
  guard:{kind:'office'|'arcaded'|'kiosk'|'checkpoint'|'ruined';windows:'cross'|'arch'|'shutter'};
  accent:string;lightDensity:number;landmark:'reading-arcade'|'printing-hall'|'dispatch-dock'|'screened-checkpoint'|'public-forum'|'sealed-wing'|'performance-stage'|'original';details:string[];
}

export function getStructureProfile(route:HeyiRoute,chapter:CampusChapter,branch:CampusBranch='standard'):CampusStructureProfile {
  const base=(profiles as CampusStructureProfile[]).find(p=>p.route===route&&p.chapter===chapter);
  if(!base)throw new Error(`Missing campus structure ${route}-${chapter}`);
  if(route!=='wu'||branch==='standard')return base;
  if(branch==='spring')return {...base,id:base.id+'-spring',body:{...base.body,roof:'terrace',windows:'cross',arcade:true,balcony:true,entrance:'glass'},gate:{kind:'pavilion',columns:'brick',canopy:'pitched',open:true},guard:{kind:'office',windows:'cross'},landmark:'reading-arcade'};
  if(branch==='institution')return {...base,id:base.id+'-institution',body:{...base.body,skin:'stone',roof:'cornice',windows:'tall',arcade:false,entrance:'portico'},gate:{kind:'colonnade',columns:'stone',canopy:'beam',open:true},guard:{kind:'office',windows:'cross'}};
  if(branch==='nkpd')return {...base,id:base.id+'-nkpd',body:{...base.body,skin:'brick',roof:'parapet',windows:'shutter',arcade:false,balcony:false,entrance:'boarded'},gate:{kind:'sealed',columns:'steel',canopy:'flat',open:false},guard:{kind:'checkpoint',windows:'shutter'},landmark:'sealed-wing'};
  return {...base,id:base.id+'-coup',body:{...base.body,skin:'metal',roof:'sawtooth',windows:'ribbon',arcade:false,balcony:false,entrance:'shutter'},gate:{kind:'checkpoint',columns:'steel',canopy:'beam',open:false},guard:{kind:'checkpoint',windows:'cross'},landmark:'screened-checkpoint'};
}

const line=(face:Face,points:[number,number][])=>path(points.map(([u,v])=>at(face,u,v)));
function arch(face:Face,growU=0,growV=0):string {
  // Sample the arch in its wall plane before projection. All arch stones share
  // this exact centre and spring line, including the expanded outside contour.
  const curve=Array.from({length:25},(_,i)=>{
    const a=Math.PI-i*Math.PI/24;
    return at(face,.5+Math.cos(a)*(.5+growU),.38-Math.sin(a)*(.38+growV));
  });
  return path([at(face,-growU,1+growV),...curve,at(face,1+growU,1+growV)],true);
}

/** A sill/tread projects away from the facade towards the camera. */
export function projectingStep(face:Face,distance:number,drop:number):Face {
  const a=at(face,0,1),b=at(face,1,1);
  const out=facadeDepth(face,-distance),h0=face[3].y-face[0].y,h1=face[2].y-face[1].y;
  const h=Math.max(h0,h1,1);
  return [a,b,{x:out[2].x,y:out[2].y+drop*h1/h},{x:out[3].x,y:out[3].y+drop*h0/h}];
}

function Sill({face}:{face:Face}) {
  const slab=projectingStep(inset(face,-.065,0,1.13,1.015),.002,0);
  const bottom=slab.map(p=>({x:p.x,y:p.y+2})) as Face;
  return <g fill="#081318" stroke="#9eafa2" strokeWidth=".65"><path d={path([slab[3],slab[2],bottom[2],bottom[3]],true)}/><path d={path(slab,true)}/><path d={path([bottom[3],bottom[2]])} stroke="#5d7f84" strokeWidth=".5"/></g>;
}

function ArchStones({face,growU=.065,growV=.065}:{face:Face;growU?:number;growV?:number}) {
  return <g fill="none" stroke="#8eaaa4" strokeWidth=".5">
    {Array.from({length:9},(_,i)=>{
      const angle=Math.PI*i/8;
      return <path key={i} d={line(face,[[.5+Math.cos(angle)*.5,.38-Math.sin(angle)*.38],[.5+Math.cos(angle)*(.5+growU),.38-Math.sin(angle)*(.38+growV)]])}/>;
    })}
    <path d={line(face,[[.465,-growV],[.475,.012],[.525,.012],[.535,-growV]])} stroke="#c0c1ab" strokeWidth=".7"/>
  </g>;
}

/** Masonry is laid on the wall first; openings then cut through the joints. */
function Masonry({face,skin}:{face:Face;skin:CampusStructureProfile['body']['skin']}) {
  if(skin==='render')return <path d={line(face,[[.015,.025],[.985,.025],[.985,.985],[.015,.985]])} fill="none" stroke="#405c64" strokeWidth=".45"/>;
  const rows=skin==='brick'?23:skin==='stone'?10:13,cols=skin==='brick'?22:skin==='stone'?10:9;
  let joints='';
  for(let r=0;r<rows;r++){
    joints+=line(face,[[0,r/rows],[1,r/rows]]);
    for(let c=0;c<cols;c++){
      const u=(c+(r%2)*.5)/cols;
      joints+=line(face,[[u,r/rows],[u,(r+1)/rows]]);
    }
  }
  return <path className="campus-masonry" d={joints} fill="none" stroke={skin==='metal'?'#44656c':'#647e78'} strokeWidth=".48" opacity={skin==='brick'?.66:.52}/>;
}

function FacadeCourses({face,floors,bays,skin}:{face:Face;floors:number;bays:number;skin:CampusStructureProfile['body']['skin']}) {
  return <g className="campus-facade-courses" fill="#081318" stroke="#8fa79e" strokeWidth=".55">
    {Array.from({length:floors-1},(_,r)=>{
      const v=.04+(r+1)*.95/floors-.025;
      return <g key={r}><path d={path(inset(face,0,v,1,.014),true)}/><path d={line(face,[[0,v+.022],[1,v+.022]])} stroke="#446970" fill="none"/></g>;
    })}
    {[0,.967].map(u=><g key={u}>
      <path d={path(inset(face,u,.035,.033,.95),true)} fill="#071115" stroke="#849d96" strokeWidth=".6"/>
      {Array.from({length:floors*3},(_,i)=><path key={i} d={line(face,[[u,.07+i*.90/(floors*3)],[u+.033,.07+i*.90/(floors*3)]])} stroke="#a4afa0" strokeWidth=".45"/>)}
      <path d={line(face,[[u+.008,.04],[u+.008,.98]])} stroke="#41636a" fill="none"/>
    </g>)}
    {skin==='stone'&&Array.from({length:bays-1},(_,i)=>{
      const u=(i+1)/bays-.012;
      return <g key={i}><path d={path(inset(face,u,.055,.024,.91),true)} stroke="#9dafa3"/><path d={line(face,[[u+.007,.06],[u+.007,.96]])} stroke="#405f65"/>{[.055,.935].map(v=><path key={v} d={path(inset(face,u-.009,v,.042,.018),true)} stroke="#b1b7a2"/>)}</g>;
    })}
    <path d={path(inset(face,0,.947,1,.048),true)} fill="#071115" stroke="#7e9790"/>
    <path d={line(face,[[0,.973],[1,.973]])} stroke="#3f6269"/>
    <path d={line(face,[[.043,.04],[.043,.933],[.055,.95],[.055,.984]])} fill="none" stroke="#adc0b4" strokeWidth=".8"/>
    {[.19,.43,.68,.90].map(v=><path key={v} d={line(face,[[.038,v],[.049,v],[.049,v+.012],[.038,v+.012]])} fill="none" stroke="#5b8589"/>) }
  </g>;
}

function Window({face,kind,lit,index,ruined=false}:{key?:number;face:Face;kind:CampusStructureProfile['body']['windows'];lit:boolean;index:number;ruined?:boolean}) {
  const clip=useId(),outer=inset(face,-.065,-.065,1.13,1.13);
  const recessed=facadeDepth(face,.0015);
  const inner=inset(recessed,.035,.04,.93,.92);
  const shape=(f:Face)=>kind==='arch'?arch(f):path(f,true);
  return <g className="campus-clear-window" data-window-kind={kind}>
    <defs><clipPath id={clip}><path d={shape(face)}/></clipPath></defs>
    <path d={kind==='arch'?arch(face,.065,.065):shape(outer)} fill="#0b191c" stroke="#a6b5a7" strokeWidth=".7"/>
    <path d={shape(face)} fill="#030a0e" stroke="#c1c9b9" strokeWidth=".8"/>
    <g clipPath={`url(#${clip})`}>
    <path d={path([face[0],face[3],recessed[3],recessed[0]],true)+path([face[1],face[2],recessed[2],recessed[1]],true)} fill="#102126" stroke="#78968e" strokeWidth=".45"/>
    <path d={shape(inner)} fill="#02090d" stroke="#607e84" strokeWidth=".5"/>
    </g>
    {kind==='arch'?<ArchStones face={face}/>:<>
      <path d={path(inset(face,-.095,-.10,1.19,.055),true)} fill="#0b191c" stroke="#b6bba4" strokeWidth=".65"/>
    </>}
    <g clipPath={`url(#${clip})`}>
    {lit&&kind!=='shutter'&&!ruined&&<path className="campus-window-glow" d={shape(inner)} fill="#b6a67b" fillOpacity=".12" style={{animationDelay:`-${index*1.73%19}s`,animationDuration:`${17+index%9}s`} as CSSProperties}/>}
    {kind==='shutter'?<>
      <path d={path(inner,true)} fill="#071115" stroke="#657e7e" strokeWidth=".5"/>
      {Array.from({length:7},(_,i)=><g key={i}><path d={line(inner,[[0,.08+i*.13],[1,.08+i*.13]])} stroke="#82938b" strokeWidth=".55"/><path d={line(inner,[[0,.105+i*.13],[1,.105+i*.13]])} stroke="#28494f" strokeWidth=".45"/></g>)}
      <path d={line(face,[[.04,.05],[.04,.96]])+line(face,[[.96,.05],[.96,.96]])+line(face,[[.40,.83],[.60,.83],[.60,.89],[.40,.89],[.40,.83]])} stroke="#a2a58c" strokeWidth=".65" fill="none"/>
    </>:<>
      <path d={line(inner,[[.48,0],[.48,1]])+line(inner,[[.53,0],[.53,1]])} stroke="#8fa9a3" strokeWidth=".55" fill="none"/>
      {(kind==='cross'||kind==='arch')&&<path d={line(inner,[[0,.46],[1,.46]])+line(inner,[[0,.50],[1,.50]])} stroke="#739697" strokeWidth=".55" fill="none"/>}
      {kind==='ribbon'&&[.25,.75].map(u=><path key={u} d={line(inner,[[u,0],[u,1]])} stroke="#739697" strokeWidth=".55"/>)}
      <path d={line(inner,[[.09,.17],[.09,.32]])+line(inner,[[.9,.64],[.9,.76]])+line(inner,[[.36,.54],[.43,.54]])} stroke="#a9b69e" strokeWidth=".65" fill="none"/>
      {!ruined&&<path d={line(inner,[[.12,.09],[.27,.18]])+line(inner,[[.65,.77],[.83,.86]])} stroke="#66858b" strokeWidth=".45" opacity=".65" fill="none"/>}
    </>}
    </g>
    <Sill face={face}/>
    {ruined&&<path d={line(face,[[.2,.05],[.55,.37],[.33,.66],[.75,.96]])} fill="none" stroke="#a58e77" strokeWidth=".75"/>}
  </g>;
}

function Roof({faces,profile}:{faces:ReturnType<typeof geometry>;profile:CampusStructureProfile}) {
  const {body}=profile;
  const roofPlanes=[faces.left,faces.right].map(f=>{
    const back=facadeDepth(f,.024);
    return [f[0],f[1],back[1],back[0]] as Face;
  });
  return <g className={'campus-roof campus-roof--'+body.roof} fill="#050d11" stroke="#bac5b6" strokeWidth=".85">
    {roofPlanes.map((f,i)=><path key={i} d={path(f,true)}/>)}
    {[faces.left,faces.right].map((f,i)=><g key={'trim'+i}>
      <path d={path(inset(f,-.004,-.012,1.008,.027),true)} fill="#0b181b" stroke="#b6c1ad" strokeWidth=".9"/>
      <path d={path(inset(f,-.009,.018,1.018,.017),true)} fill="#071216" stroke="#9eafa2" strokeWidth=".65"/>
      <path d={line(f,[[0,.045],[1,.045]])} fill="none" stroke="#5d8388" strokeWidth=".5"/>
      {Array.from({length:i?16:24},(_,j)=>{
        const u=j/(i?16:24);return <path key={j} d={line(f,[[u,-.012],[u,.012]])} stroke="#637d78" strokeWidth=".45"/>;
      })}
      {body.roof==='cornice'&&Array.from({length:i?20:28},(_,j)=>{
        const u=(j+.35)/(i?20:28);return <path key={j} d={path(inset(f,u,.037,.012,.017),true)} fill="#0a171a" stroke="#a4b09f" strokeWidth=".5"/>;
      })}
    </g>)}
    {body.roof==='gable'?<>
      {roofPlanes.map((f,i)=><g key={i}><path d={path([f[0],f[1],{x:f[1].x,y:f[1].y-22},{x:f[0].x,y:f[0].y-22}],true)} fill="#0a1519"/><path d={path([{x:f[0].x,y:f[0].y-22},{x:f[1].x,y:f[1].y-22},f[2],f[3]],true)} fill="#071318" stroke="#587e87"/></g>)}
      {[.2,.4,.6,.8].map(u=><path key={u} d={path([at(faces.left,u,0),{x:at(faces.left,u,0).x,y:at(faces.left,u,0).y-22}])} stroke="#536e73" strokeWidth=".45"/>)}
    </>:body.roof==='sawtooth'?<>
      {[faces.left,faces.right].map((f,side)=><g key={side}>{Array.from({length:side?5:7},(_,i)=>{
        const count=side?5:7,a=at(f,i/count,0),b=at(f,(i+.65)/count,0),c=at(f,(i+1)/count,0);
        const peak=at(f,(i+.65)/count,-.055),innerPeak=at(f,(i+.65)/count,-.043);
        return <g key={i}><path d={path([a,peak,c],true)} fill="#061216" stroke="#9ab1ac"/><path d={path([{x:a.x+4,y:a.y-1},innerPeak,{x:c.x-3,y:c.y-1}])} fill="none" stroke="#456e78" strokeWidth=".55"/>{[.25,.5,.75].map(t=><path key={t} d={path([{x:a.x+(peak.x-a.x)*t,y:a.y+(peak.y-a.y)*t},{x:a.x+(c.x-a.x)*t,y:a.y+(c.y-a.y)*t}])} stroke="#6c8b8b" strokeWidth=".45"/>)}</g>;
      })}</g>)}
    </>:<>
      {[faces.left,faces.right].map((f,side)=><path key={side} d={path([at(f,0,0),at(f,1,0),at(f,1,.033),at(f,0,.033)],true)} fill="#0a1418" stroke="#9fafa3" strokeWidth=".7"/>)}
      {body.roof==='cornice'&&[faces.left,faces.right].map((f,i)=><path key={i} d={line(f,[[0,.05],[1,.05]])} fill="none" stroke="#adad97" strokeWidth="1.2"/>)}
      {body.roof==='terrace'&&[faces.left,faces.right].map((f,i)=><g key={i}><path d={line(f,[[0,-.055],[1,-.055]])} fill="none"/>{Array.from({length:18},(_,j)=><path key={j} d={line(f,[[j/17,-.055],[j/17,0]])} strokeWidth=".6"/>)}</g>)}
    </>}
  </g>;
}

function Steps({face,count=3}:{face:Face;count?:number}) {
  const footprint=inset(face,-.10,0,1.20,1.015);
  const tips=Array.from({length:count},(_,i)=>projectingStep(footprint,.004*(i+1),(i+1)*1.4));
  return <g className="campus-projected-steps" fill="#081519" stroke="#99ab9d" strokeWidth=".65">
    {tips.map((step,i)=>{
      const back=i?tips[i-1]:[...footprint.slice(0,2),at(footprint,1,1),at(footprint,0,1)] as Face;
      return <g key={i}><path d={path([back[3],back[2],step[2],step[3]],true)}/><path d={path([step[3],step[2],{x:step[2].x,y:step[2].y+1.5},{x:step[3].x,y:step[3].y+1.5}],true)} fill="#040c10" stroke="#5e8083" strokeWidth=".5"/></g>;
    })}
  </g>;
}

function Entrance({face,kind,opening,stepCount=3}:{face:Face;kind:CampusStructureProfile['body']['entrance'];opening?:Face;stepCount?:number}) {
  const f=opening??inset(face,.59,.755,.23,.24),outer=inset(f,-.06,-.045,1.12,1.045);
  return <g className={'campus-entry campus-entry--'+kind}>
    <path d={kind==='arch'?arch(f,.06,.045):path(outer,true)} fill="#0a171b" stroke="#acb9a9" strokeWidth=".7"/>
    <path d={kind==='arch'?arch(f):path(f,true)} fill="#020a0e" stroke="#b8c4b6" strokeWidth="1"/>
    {kind==='arch'&&<ArchStones face={f} growU={.06} growV={.045}/>}
    {kind==='shutter'||kind==='boarded'?<>
      <FaceLines face={inset(f,.04,.03,.92,.94)} rows={kind==='shutter'?9:4} color="#87917e"/>
      {kind==='boarded'&&<path d={line(f,[[.02,.12],[.98,.85]])+line(f,[[.02,.86],[.98,.12]])} stroke="#ad9472" strokeWidth="3" fill="none"/>}
    </>:<>
      <path d={path(inset(f,.065,.12,.87,.84),true)} fill="#061216" stroke="#607e84" strokeWidth=".6"/>
      <path d={line(f,[[.5,.12],[.5,.96]])+line(f,[[.065,.30],[.935,.30]])+line(f,[[.065,.72],[.935,.72]])} stroke="#93a9a4" strokeWidth=".8" fill="none"/>
      {[.10,.55].map(u=><path key={u} d={path(inset(f,u,.76,.35,.15),true)} fill="#071114" stroke="#586e6e" strokeWidth=".55"/>)}
      <path d={line(f,[[.44,.38],[.44,.61]])+line(f,[[.56,.38],[.56,.61]])} stroke="#c7b58f" strokeWidth="1.1"/>
      <path d={line(f,[[.1,.35],[.24,.42]])+line(f,[[.60,.52],[.8,.62]])+line(f,[[.06,.38],[.1,.38],[.1,.44],[.06,.44]])+line(f,[[.9,.73],[.94,.73],[.94,.79],[.9,.79]])} fill="none" stroke="#6b8c90" strokeWidth=".55"/>
    </>}
    {kind==='portico'&&<>
      <path d={path(inset(f,-.18,-.14,1.36,.14),true)} fill="#0c171b" stroke="#bdc2ac" strokeWidth=".85"/>
      <path d={line(f,[[-.18,-.10],[1.18,-.10]])+line(f,[[-.15,-.03],[1.15,-.03]])} stroke="#6f8f8e" strokeWidth=".55" fill="none"/>
      {[-.12,1.00].map(u=><g key={u}><path d={path(inset(f,u,.02,.1,.98),true)} fill="#071115" stroke="#a1b2a4" strokeWidth=".75"/><path d={line(f,[[u+.03,.07],[u+.03,.94]])} fill="none" stroke="#42656a" strokeWidth=".55"/>{[.01,.94].map(v=><path key={v} d={path(inset(f,u-.025,v,.15,.055),true)} fill="#0b1719" stroke="#b3b9a2" strokeWidth=".65"/>)}</g>)}
    </>}
    <Steps face={f} count={stepCount}/>
  </g>;
}

function Arcade({face,bays}:{face:Face;bays:number}) {
  return <g className="campus-open-arcade">{Array.from({length:bays},(_,i)=>{
    const f=inset(face,(i+.13)/bays,.77,.74/bays,.222);
    return <g key={i}><path d={arch(f,.075,.09)} fill="#0a171a" stroke="#8fa697" strokeWidth=".65"/><path d={arch(f)} fill="#02090d" stroke="#c1c6b4" strokeWidth=".95"/><ArchStones face={f} growU={.075} growV={.09}/><path d={arch(inset(f,.08,.08,.84,.92))} fill="none" stroke="#3f626b" strokeWidth=".55"/>{[.0,.93].map(u=><path key={u} d={path(inset(f,u,.39,.07,.035),true)+path(inset(f,u-.015,.95,.10,.04),true)} fill="#0c191c" stroke="#a2b3a0" strokeWidth=".6"/>)}<path d={line(f,[[.08,.97],[.92,.97]])} stroke="#69828a" fill="none"/></g>;
  })}</g>;
}

function Landmark({face,kind,accent}:{face:Face;kind:CampusStructureProfile['landmark'];accent:string}) {
  const f=inset(face,.12,.74,.71,.25);
  if(kind==='dispatch-dock'||kind==='printing-hall')return <g className="campus-loading-bay">
    <path d={path(f,true)} fill="#030b0f" stroke="#aeb9aa"/><FaceLines face={inset(f,.06,.04,.88,.88)} rows={8} color="#667f83"/>
    <path d={path(inset(face,.07,.70,.8,.05),true)} fill="#0a1519" stroke="#aeb8a6"/>
    {[.14,.82].map(u=><path key={u} d={line(face,[[u,.73],[u,1.0]])} fill="none" stroke="#b9b59b" strokeWidth="1.4"/>)}
    <path d={line(face,[[.08,1.03],[.9,1.03]])+line(face,[[.12,1.06],[.94,1.06]])} stroke="#7f8e83" strokeWidth=".8" fill="none"/>
  </g>;
  if(kind==='performance-stage')return <g className="campus-performance-hall"><path d={arch(f)} fill="#050a0f" stroke="#b9aabd" strokeWidth="1.3"/><path d={path(inset(f,.06,.28,.15,.67),true)+path(inset(f,.79,.28,.15,.67),true)} fill="#151018" stroke={accent} strokeWidth=".7"/><path d={line(f,[[-.06,1.02],[1.06,1.02]])+line(f,[[-.1,1.07],[1.1,1.07]])} fill="none" stroke="#b0a58c" strokeWidth=".8"/></g>;
  if(kind==='sealed-wing')return <g className="campus-sealed-wing">{[.17,.36,.55,.74].map(u=>{
    const w=inset(face,u,.49,.12,.19);return <g key={u}><path d={path(w,true)} fill="#0a1215" stroke="#7d9290"/><path d={line(w,[[.04,.1],[.96,.9]])+line(w,[[.04,.9],[.96,.1]])} fill="none" stroke="#9d896e" strokeWidth="1.6"/></g>;
  })}</g>;
  return null;
}

export const CampusBuilding=memo(function CampusBuilding({profile,observation}:{profile:CampusStructureProfile;observation:Observation}) {
  const {body}=profile;
  const lowerWing=profile.landmark==='reading-arcade'?.76:profile.landmark==='public-forum'?.84:profile.landmark==='performance-stage'?.72:1;
  const main=geometry(720,435,body.height,body.leftReach,body.rightReach);
  const faces={...main,right:geometry(720,435,body.height*lowerWing,body.leftReach,body.rightReach).right};
  const ruined=profile.route==='jidi_riot'||profile.route==='despair';
  return <Observe zone="building" anchor={{x:720,y:230}} observation={observation}>
    <g className="campus-rebuilt-building" data-structure-id={profile.id} data-roof={body.roof} data-skin={body.skin}>
      {[faces.left,faces.right].map((face,side)=>{
        const bays=body.windows==='ribbon'?Math.max(3,Math.floor((side?body.rightBays:body.leftBays)/2)):(side?body.rightBays:body.leftBays);
        return <g key={side}>
          <path d={path(face,true)} fill={side?'#040c10':'#061014'} stroke="#b8c5b8" strokeWidth="1.1"/>
          <Masonry face={face} skin={body.skin}/>
          <FacadeCourses face={face} floors={side?Math.max(2,body.floors-(lowerWing<1?1:0)):body.floors} bays={bays} skin={body.skin}/>
          {Array.from({length:side?Math.max(2,body.floors-(lowerWing<1?1:0)):body.floors},(_,row)=>{
            const floors=side?Math.max(2,body.floors-(lowerWing<1?1:0)):body.floors;
            const floorTop=.04+row*.95/floors,span=.95/floors;
            if(body.arcade&&row===floors-1)return null;
            return <g key={row}><path d={line(face,[[0,floorTop],[1,floorTop]])} fill="none" stroke="#8ba39f" strokeWidth=".6"/>
              {Array.from({length:bays},(_,col)=>{
                if(row===floors-1&&(!side&&(col+.5)/bays>.55&&(col+.5)/bays<.86||side&&['dispatch-dock','printing-hall','performance-stage'].includes(profile.landmark)))return null;
                const index=row*bays+col+side*32;
                const long=body.windows==='ribbon';
                const win=inset(face,(col+(long?.10:.19))/bays,floorTop+span*.12,(long?.80:.62)/bays,span*(body.windows==='tall'?.73:.60));
                return <Window key={index} face={win} kind={body.windows} lit={(index*7%31)/31<profile.lightDensity} index={index} ruined={ruined&&index%4===0}/>;
              })}
            </g>;
          })}
          {body.arcade&&<Arcade face={face} bays={side?4:6}/>}
          {body.balcony&&<g className="campus-balcony"><path d={path(inset(face,.025,.69,.95,.035),true)} fill="#0a171b" stroke="#b9c1ae" strokeWidth=".8"/><path d={line(face,[[.025,.62],[.975,.62]])} stroke="#9faf9f" strokeWidth=".7" fill="none"/>{Array.from({length:21},(_,j)=><path key={j} d={line(face,[[.025+j*.95/20,.62],[.025+j*.95/20,.69]])} stroke="#78948f" strokeWidth=".55"/>)}</g>}
          <path d={line(face,[[0,.994],[1,.994]])} fill="none" stroke="#c1c3ad" strokeWidth="1"/>
        </g>;
      })}
      <Roof faces={faces} profile={profile}/>
      <Entrance face={faces.left} kind={body.entrance}/>
      <Landmark face={faces.right} kind={profile.landmark} accent={profile.accent}/>
      {ruined&&<g className="campus-structural-damage">
        <path d={path([at(faces.left,.68,0),at(faces.left,.71,.09),at(faces.left,.74,.035),at(faces.left,.76,.18),at(faces.left,.82,.06),at(faces.left,.86,0)],true)} fill="#020b10" stroke="#a0937a" strokeWidth=".85"/>
        {profile.chapter>=1&&<path d={path([at(faces.right,.2,.23),at(faces.right,.24,.31),at(faces.right,.2,.39),at(faces.right,.31,.44),at(faces.right,.37,.37),at(faces.right,.4,.27),at(faces.right,.32,.2)],true)} fill="#02090c" stroke="#a4957d" strokeWidth=".9"/>}
        {profile.chapter===2&&<path d={line(faces.right,[[.16,.24],[.43,.38]])+line(faces.right,[[.22,.46],[.4,.26]])} fill="none" stroke="#7d8f88" strokeWidth="1"/>}
      </g>}
      <CampusFixtures faces={faces} profile={profile}/>
      <path className={'campus-structure-outline '+(observation.active==='building'?'is-active':'')} d={path([faces.left[0],faces.left[1],faces.right[0],faces.right[1],faces.right[2],faces.right[3],faces.left[3]],true)} fill="none" pointerEvents="none"/>
    </g>
  </Observe>;
});

export function CampusEntrance({profile,observation}:{profile:CampusStructureProfile;observation:Observation}) {
  const {gate}=profile;
  const tall=gate.kind==='colonnade'?205:gate.kind==='industrial'?171:gate.kind==='pavilion'?159:183;
  const spread=gate.kind==='industrial'?474:gate.kind==='colonnade'?458:440;
  const f=geometry(810,520,tall,spread,25).left;
  const header=inset(f,-.018,0,1.036,gate.canopy==='none'?.19:.24);
  const ruined=gate.kind==='breached';
  return <g className={'campus-rebuilt-gate campus-rebuilt-gate--'+gate.kind} data-gate-kind={gate.kind}>
    <Observe zone="gate" anchor={{x:650,y:440}} observation={observation}>
      <g className="campus-object">
        {[0,1].map(u=>{
          const p=at(f,u,1),top=at(f,u,0),height=p.y-top.y;
          const width=gate.columns==='stone'?30:22,post=geometry(p.x,p.y,height,width,19);
          const cap=geometry(p.x,p.y-height-2,7,width+4,23),base=geometry(p.x,p.y+2,10,width+5,24);
          return <g key={u} data-gate-post-height={height}>
            <path d={path(post.left,true)} fill="#061015" stroke={INK} strokeWidth=".9"/><path d={path(post.right,true)} fill="#040b10" stroke={EDGE} strokeWidth=".8"/>
            {gate.columns==='brick'||gate.columns==='stone'?<><Masonry face={post.left} skin={gate.columns==='brick'?'brick':'stone'}/><Masonry face={post.right} skin={gate.columns==='brick'?'brick':'stone'}/></>:<><path d={line(post.left,[[.18,.03],[.18,.97],[.8,.97],[.8,.03]])} stroke="#708d91" strokeWidth=".6" fill="none"/><path d={line(post.right,[[.2,.06],[.2,.95]])} stroke="#43656c" strokeWidth=".5" fill="none"/>{[.10,.29,.73,.91].map(v=><path key={v} d={path(inset(post.left,.1,v,.8,.022),true)} fill="#0b181c" stroke="#879d94" strokeWidth=".5"/>)}</>}
            {[cap,base].map((part,i)=><g key={i}><path d={path(part.left,true)} fill="#0c181b" stroke="#b3bda9" strokeWidth=".7"/><path d={path(part.right,true)} fill="#061216" stroke="#6b8b8e" strokeWidth=".6"/><path d={path(part.roof,true)} fill="#0a171b" stroke="#bcc4b0" strokeWidth=".75"/></g>)}
            <path d={line(post.left,[[.07,.055],[.07,.935]])} stroke="#456c72" strokeWidth=".55" fill="none"/>
          </g>;
        })}
        <path d={line(f,[[0,1],[1,1]])+line(f,[[0,1.025],[1,1.025]])} fill="none" stroke="#9aada3" strokeWidth=".8"/>
        {!gate.open&&!ruined?<g>
          <path d={path(inset(f,.04,.27,.9,.72),true)} fill="#030b10" fillOpacity=".12" stroke="#819b9b" strokeWidth=".8"/>
          <FaceLines face={inset(f,.04,.27,.9,.72)} columns={gate.kind==='sealed'?28:20} rows={2}/>
          <path d={line(f,[[.485,.27],[.485,.99]])+line(f,[[.515,.27],[.515,.99]])+line(f,[[.46,.63],[.48,.63],[.48,.72],[.46,.72]])+line(f,[[.52,.63],[.54,.63],[.54,.72],[.52,.72]])} fill="none" stroke="#b7b89d" strokeWidth=".8"/>
          {gate.kind==='sealed'&&[.35,.65].map(v=><path key={v} d={line(f,[[.04,v],[.94,v+.21]])} stroke="#a49273" strokeWidth="1.6" fill="none"/>)}
        </g>:ruined?<g><path d="M395 509l268 24-32 18-260-30Z" fill="#050d11" stroke="#9b9f89"/>{Array.from({length:17},(_,i)=><path key={i} d={`M${385+i*16} ${514+i*1.4}l12 24`} stroke="#6c878b" strokeWidth=".8"/>)}</g>:<g>
          {[.035,.885].map(u=>{const leaf=inset(f,u,.32,.08,.66);return <g key={u}><path d={path(leaf,true)} fill="#061115" fillOpacity=".22" stroke="#8aa3a1" strokeWidth=".8"/><FaceLines face={leaf} columns={5} rows={2}/><path d={line(leaf,[[.12,.10],[.88,.90]])} fill="none" stroke="#6a8a91" strokeWidth=".45"/></g>;})}
        </g>}
        {[.05,.94].map(u=>[.43,.84].map(v=><path key={u+'-'+v} d={path(inset(f,u,v,.025,.018),true)} fill="#08171b" stroke="#b1ae90" strokeWidth=".7"/>))}
        {gate.kind==='industrial'&&[.35,.50,.65].map(u=>{
          const p=at(f,u,1);return <g key={u}><path d={`M${p.x} ${p.y}v-32l14 2v34Z`} fill="#061115" stroke="#a7b29f" strokeWidth=".8"/><path d={`M${p.x+4} ${p.y-23}h7m-5 16h24`} stroke={profile.accent} strokeWidth="1"/></g>;
        })}
        {gate.kind==='checkpoint'&&<path d={line(f,[[.05,.63],[.95,.80]])} stroke="#bda27e" strokeWidth="3" fill="none"/>}
      </g>
    </Observe>
    <Observe zone="sign" anchor={{x:605,y:520-tall+21}} observation={observation}>
      <g className="campus-object">
        {gate.canopy==='pitched'?<path d={path([at(header,-.04,0),{x:at(header,.5,0).x,y:at(header,.5,0).y-21},at(header,1.04,0),at(header,1,.13),at(header,0,.13)],true)} fill="#09171b" stroke="#b7c5b7" strokeWidth="1"/>:gate.canopy!=='none'?<path d={path(inset(header,-.025,-.12,1.05,.18),true)} fill="#0a181b" stroke="#aeb9a8" strokeWidth=".85"/>:null}
        <path d={path(header,true)} fill="#030c10" stroke="#c4c9b9" strokeWidth="1.1"/>
        <path d={line(header,[[-.015,.06],[1.015,.06]])+line(header,[[-.015,.94],[1.015,.94]])} fill="none" stroke="#73948f" strokeWidth=".6"/>
        <path d={path(inset(header,-.024,1.01,1.048,.06),true)} fill="#09171a" stroke="#b1baa3" strokeWidth=".65"/>
        {Array.from({length:17},(_,i)=><path key={i} d={line(header,[[i/16,1.08],[i/16,1.16]])} fill="none" stroke="#7f9990" strokeWidth=".6"/>)}
        <Plate face={inset(header,.055,.12,.89,.77)} label="合肥一中" rows={0}/>
        {ruined&&<path d={line(header,[[.59,.02],[.65,.36],[.61,.65],[.68,.99]])} fill="none" stroke="#b18c70" strokeWidth="1.1"/>}
      </g>
    </Observe>
  </g>;
}

export function CampusGatehouse({profile,observation}:{profile:CampusStructureProfile;observation:Observation}) {
  const {guard}=profile;
  const height=guard.kind==='kiosk'?123:guard.kind==='arcaded'?163:147;
  const f=geometry(311,500,height,guard.kind==='checkpoint'?210:199,32);
  const names={office:'門衛室',arcaded:'接待室',kiosk:'訪客登記',checkpoint:'值勤室',ruined:'門衛室'};
  return <Observe zone="guard" anchor={{x:220,y:430}} observation={observation}>
    <g className={'campus-object campus-rebuilt-guard campus-rebuilt-guard--'+guard.kind}>
      <path d={path(f.left,true)} fill="#050f13" stroke="#b9c5b7" strokeWidth="1"/>
      <path d={path(f.right,true)} fill="#030b10" stroke="#709198" strokeWidth=".8"/>
      <path d={path(f.roof,true)} fill="#0a171a" stroke="#a2b4a7" strokeWidth=".85"/>
      <Masonry face={f.left} skin={guard.kind==='arcaded'?'brick':guard.kind==='checkpoint'?'stone':'render'}/>
      {[f.left,f.right].map((face,i)=><g key={i}><path d={path(inset(face,-.015,-.025,1.03,.045),true)} fill="#0b191b" stroke="#b5c0ac" strokeWidth=".8"/><path d={line(face,[[0,.055],[1,.055]])+line(face,[[0,.94],[1,.94]])+line(face,[[0,.97],[1,.97]])} fill="none" stroke="#6e8b88" strokeWidth=".6"/></g>)}
      <Plate face={inset(f.left,.04,.035,.91,.14)} label={names[guard.kind]} rows={0}/>
      {[.085,.51].map((u,i)=><Window key={u} face={inset(f.left,u,.25,.35,.37)} kind={guard.windows==='arch'?'arch':guard.windows==='shutter'?'shutter':'cross'} lit={i===0&&guard.kind!=='ruined'} index={i+90} ruined={guard.kind==='ruined'}/>)}
      <Entrance face={f.right} opening={inset(f.right,.12,.23,.76,.76)} kind={guard.kind==='ruined'?'boarded':'glass'} stepCount={1}/>
      <path d={line(f.left,[[.025,.20],[.025,.88],[.04,.93],[.04,.985]])} fill="none" stroke="#9eafa2" strokeWidth=".7"/>
      {guard.kind==='arcaded'&&<path d={path(inset(f.left,-.045,.19,1.09,.055),true)} fill="#091619" stroke="#b5b69f"/>}
      {guard.kind==='checkpoint'&&<path d={line(f.left,[[.06,.69],[.95,.69]])+line(f.left,[[.06,.74],[.95,.74]])} fill="none" stroke="#b5a17e" strokeWidth=".9"/>}
      {guard.kind==='ruined'&&<path d={line(f.left,[[.2,.1],[.28,.32],[.24,.6],[.4,.74],[.34,1]])} fill="none" stroke="#a08f7a" strokeWidth="1"/>}
    </g>
  </Observe>;
}
