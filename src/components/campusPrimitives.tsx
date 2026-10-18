import type { ReactNode, PointerEvent } from 'react';
import type { HeyiLightSnapshot, HeyiZone } from '../engine/heyiLight';

export type Point = { x: number; y: number };
export type Face = [Point, Point, Point, Point];
export interface Observation {
  snapshot: HeyiLightSnapshot;
  active: HeyiZone | null;
  onZone: (zone: HeyiZone | null, anchor?: Point) => void;
  onPointer: (event: PointerEvent<SVGElement>, zone: HeyiZone) => void;
}
export const HORIZON = 260;
export const INK = '#b9c6ba', EDGE = '#60838b', BLACK = '#050d11';
export const path = (points: Point[], close = false) => 'M' + points.map(p => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join('L') + (close ? 'Z' : '');
export function at(face: Face, u: number, v: number): Point {
  // Project a plane, rather than bilinearly stretching its screen-space corners.
  // This preserves diagonal alignments and the foreshortening of equal facade bays.
  const [p0,p1,p2,p3]=face;
  const dx1=p1.x-p2.x,dx2=p3.x-p2.x,dy1=p1.y-p2.y,dy2=p3.y-p2.y;
  const sx=p0.x-p1.x+p2.x-p3.x,sy=p0.y-p1.y+p2.y-p3.y;
  const determinant=dx1*dy2-dx2*dy1;
  if(Math.abs(determinant)>.00001){
    const g=(sx*dy2-dx2*sy)/determinant,h=(dx1*sy-sx*dy1)/determinant;
    const divisor=1+g*u+h*v;
    if(Math.abs(divisor)>.00001)return {
      x:((p1.x-p0.x+g*p1.x)*u+(p3.x-p0.x+h*p3.x)*v+p0.x)/divisor,
      y:((p1.y-p0.y+g*p1.y)*u+(p3.y-p0.y+h*p3.y)*v+p0.y)/divisor,
    };
  }
  // Collapsed ground/foot faces are occasionally used for anchors.
  const top = { x: face[0].x + (face[1].x - face[0].x) * u, y: face[0].y + (face[1].y - face[0].y) * u };
  const bottom = { x: face[3].x + (face[2].x - face[3].x) * u, y: face[3].y + (face[2].y - face[3].y) * u };
  return { x: top.x + (bottom.x - top.x) * v, y: top.y + (bottom.y - top.y) * v };
}
export function inset(face: Face, u: number, v: number, w: number, h: number): Face {
  return [at(face,u,v),at(face,u+w,v),at(face,u+w,v+h),at(face,u,v+h)];
}
/** Translate a vertical facade along its normal while preserving BOTH vanishing points. */
export function facadeDepth(face:Face,depth:number):Face {
  const [a,b,c,d]=face;
  const start=Math.abs(b.y-a.y)>.00001?a:d,end=Math.abs(b.y-a.y)>.00001?b:c;
  const wallVP=Math.abs(end.y-start.y)>.00001?start.x+(HORIZON-start.y)*(end.x-start.x)/(end.y-start.y):-1200;
  const normalVP=Math.abs(wallVP+1200)<Math.abs(wallVP-2300)?2300:-1200;
  const ratio=Math.abs(c.y-b.y)>.00001?(d.y-a.y)/(c.y-b.y):1;
  // Equal physical offsets require a different screen displacement at each depth.
  const denominators=[1,ratio,ratio,1];
  return face.map((p,i)=>{
    const z=denominators[i],divisor=z+depth;
    if(Math.abs(divisor)<.00001)return p;
    return {x:(p.x*z+normalVP*depth)/divisor,y:(p.y*z+HORIZON*depth)/divisor};
  }) as Face;
}
export function geometry(x: number, y: number, height: number, left: number, right: number) {
  const top = {x,y:y-height}, bottom = {x,y};
  const retreat = (p:Point, distance:number, vp:number) => ({x:p.x+distance,y:p.y+(HORIZON-p.y)*distance/(vp-p.x)});
  const lt=retreat(top,-left,-1200), lb=retreat(bottom,-left,-1200), rt=retreat(top,right,2300), rb=retreat(bottom,right,2300);
  // Intersect the two receding roof edges, rather than approximating a parallelogram.
  const dx1=2300-lt.x,dy1=HORIZON-lt.y,dx2=-1200-rt.x,dy2=HORIZON-rt.y;
  const cross=dx1*dy2-dy1*dx2;
  const t=Math.abs(cross)<.001?0:((rt.x-lt.x)*dy2-(rt.y-lt.y)*dx2)/cross;
  const back={x:lt.x+dx1*t,y:lt.y+dy1*t};
  return { left:[lt,top,bottom,lb] as Face, right:[top,rt,rb,bottom] as Face, roof:[lt,top,rt,back] as Face };
}
export function FaceLines({face, rows=4, columns=0, color=EDGE}:{face:Face;rows?:number;columns?:number;color?:string}) {
  return <g fill="none" stroke={color} strokeWidth=".65">{Array.from({length:rows},(_,i)=><path key={'r'+i} d={path([at(face,0,(i+1)/(rows+1)),at(face,1,(i+1)/(rows+1))])}/>)}{Array.from({length:columns},(_,i)=><path key={'c'+i} d={path([at(face,(i+1)/(columns+1),0),at(face,(i+1)/(columns+1),1)])}/>)}</g>;
}
export function Plate({face,label,color=INK,rows=3,lit=false}:{key?:number;face:Face;label?:string;color?:string;rows?:number;lit?:boolean}) {
  const a=face[0], b=face[1], d=face[3];
  const width=b.x-a.x,height=(d.y-a.y+face[2].y-b.y)/2;
  const font=label==='合肥一中'?Math.min(39,height*.65):Math.min(16,Math.max(8,height*.38),Math.abs(width)/Math.max(1,(label?.length||1)*1.35));
  return <g>
    <path d={path(face,true)} fill={BLACK} stroke={color} strokeWidth=".9"/>
    <path d={path(inset(face,.035,.04,.93,.92),true)} fill="none" stroke={EDGE} strokeWidth=".55"/>
    {label&&<text transform={`matrix(1 ${(b.y-a.y)/(width||1)} 0 1 ${a.x} ${a.y})`} x={width/2} y={rows?height*.29:height*.49+font*.34} fill={color} fontFamily="SimSun, Songti SC, serif" fontSize={font} textAnchor="middle" letterSpacing={label==='合肥一中'?12:1.6}>{label}</text>}
    {Array.from({length:rows},(_,i)=><path key={i} d={path([at(face,.13,.44+i*.12),at(face,i%3===1?.72:.87,.44+i*.12)])} stroke={color} strokeWidth=".65" opacity=".7"/>)}
    {lit&&<path className="heyi-screen-pulse" d={path(inset(face,.07,.84,.86,.06),true)} fill={color} opacity=".5"/>}
    {[0,1].map(u=>[0,1].map(v=><circle key={`${u}-${v}`} cx={at(face,u*.94+.03,v*.94+.03).x} cy={at(face,u*.94+.03,v*.94+.03).y} r="1" fill={color}/>))}
  </g>;
}
export function Box({x,y,h,left,right,children,color=INK,rows=0}:{key?:number;x:number;y:number;h:number;left:number;right:number;children?:(faces:ReturnType<typeof geometry>)=>ReactNode;color?:string;rows?:number}) {
  const faces=geometry(x,y,h,left,right);
  return <g className="campus-object">
    <path d={path(faces.left,true)} fill={BLACK} stroke={color} strokeWidth="1"/>
    <path d={path(faces.right,true)} fill="#081216" stroke={EDGE} strokeWidth=".85"/>
    <path d={path(faces.roof,true)} fill="#0b171b" stroke={color} strokeWidth=".85"/>
    {rows>0&&<><FaceLines face={faces.left} rows={rows}/><FaceLines face={faces.right} rows={rows}/></>}
    <path d={`M${x} ${y-h}V${y}`} stroke={color} strokeWidth="1.15"/>
    {children?.(faces)}
  </g>;
}
export function Observe({zone,anchor,children,observation}:{zone:HeyiZone;anchor:Point;children:ReactNode;observation:Observation}) {
  const {active,snapshot,onZone,onPointer}=observation;
  return <g className={`campus-observation ${active===zone?'is-observed':''}`} data-zone={zone} role="button" tabIndex={0} aria-label={'观察'+snapshot.zones[zone].label}
    onPointerEnter={e=>onPointer(e,zone)} onPointerMove={e=>onPointer(e,zone)} onPointerLeave={()=>onZone(null)}
    onFocus={()=>onZone(zone,anchor)} onBlur={()=>onZone(null)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onZone(zone,anchor);}}}>{children}</g>;
}
export function Wheel({x,y,r=15}:{x:number;y:number;r?:number}) {
  return <g fill="none" stroke={INK} strokeWidth=".85"><ellipse cx={x} cy={y} rx={r} ry={r*.89}/><ellipse cx={x} cy={y} rx={r-2} ry={(r-2)*.89} stroke={EDGE}/>{[0,1,2,3].map(i=>{const a=i*Math.PI/4;return <path key={i} d={`M${x-Math.cos(a)*r} ${y-Math.sin(a)*r*.89}L${x+Math.cos(a)*r} ${y+Math.sin(a)*r*.89}`}/>})}<circle cx={x} cy={y} r="2"/></g>;
}
export function Bicycle({x,y,fallen=false}:{x:number;y:number;fallen?:boolean}) {
  return <g transform={`translate(${x} ${y}) ${fallen?'matrix(1 .06 -.5 .4 0 0)':''}`}>
    <Wheel x={0} y={0}/><Wheel x={65} y={-3}/>
    <path d="M0 0L29-29L65-3H0L22-20L46-23M29-29L25-37M20-37H36M60-40L68-37L65-3M28-29L60-30M45-2L28-29M44-2L49 3H55" fill="none" stroke="#8ba7a5" strokeWidth="1.15"/>
    <path d="M1-21Q-17-10-16 0M50-23Q72-25 81-4M-13-21H9V-14H-13ZM32-1L42 1" fill="none" stroke="#bbb79f" strokeWidth=".8"/>
  </g>;
}
export function Bench({x,y,broken=false}:{x:number;y:number;broken?:boolean}) {
  const box=geometry(x,y,35,105,26);
  return <g>
    <path d={path(box.left,true)} fill={BLACK} stroke={INK} strokeWidth=".9"/>
    <FaceLines face={box.left} rows={3} color="#a2a38d"/>
    <path d={path(geometry(x+2,y+12,10,108,28).roof,true)} fill="#0b1415" stroke={INK}/>
    <path d={`M${x-91} ${y+3}v18m85-7v21m-81-20 81 16`} stroke={EDGE} fill="none"/>
    {broken&&<path d={`M${x-68} ${y-28}l16 12-7 11 15 7m-22 5 23-5`} stroke="#bd8c70" strokeWidth="1.4" fill="none"/>}
  </g>;
}
export function Table({x,y,label,items='papers'}:{x:number;y:number;label?:string;items?:'papers'|'ballot'|'books'|'printer'|'flowers'|'medical'}) {
  const top=geometry(x,y,28,106,37),feet=geometry(x,y+25,0,106,37);
  return <g>
    <Box x={x} y={y} h={28} left={106} right={37}>{f=><>{label&&<Plate face={inset(f.left,.12,.10,.75,.67)} label={label} rows={0}/>}<FaceLines face={f.right} rows={2}/></>}</Box>
    {[{top:top.left,base:feet.left,u:.15},{top:top.left,base:feet.left,u:.94},{top:top.right,base:feet.right,u:.85}].map((leg,i)=><path key={i} d={path([at(leg.top,leg.u,1),at(leg.base,leg.u,1)])} stroke={INK} fill="none" strokeWidth="1.2"/>)}
    {items==='ballot'?<Box x={x-32} y={y-30} h={37} left={34} right={22} color="#adc7bd">{f=><><path d={path(inset(f.left,.12,.15,.76,.68),true)} fill="none" stroke={EDGE}/><path d={path([at(f.roof,.25,.5),at(f.roof,.8,.5)])} stroke="#cfbea1" strokeWidth="1.5"/><path d={path(inset(f.left,.4,.38,.35,.23),true)} fill="#d0c4a5" opacity=".25"/></>}</Box>:
      items==='printer'?<Box x={x-26} y={y-29} h={28} left={58} right={28}>{f=><><FaceLines face={f.left} rows={4}/><path d={path(inset(f.left,.13,.25,.7,.3),true)} fill="#121e21" stroke="#899f9a"/><path d={`M${x-50} ${y-61}l31 2 5 15-37-3Z`} fill={BLACK} stroke="#c8c1a2"/><Wheel x={x-5} y={y-40} r={9}/></>}</Box>:
      items==='flowers'?<g>{[0,1,2].map(i=><g key={i}><Box x={x-20-i*29} y={y-28+i*2} h={14} left={17} right={8}/><path d={`M${x-27-i*29} ${y-40+i*2}q-13-24-17-15m17 15q10-24 17-22m-17 22v-31`} fill="none" stroke="#a3b78b"/><circle cx={x-27-i*29} cy={y-71+i*2} r="3" fill="#bba181"/></g>)}</g>:
      items==='medical'?<Box x={x-26} y={y-29} h={25} left={45} right={17} color="#b6bbaa">{f=><><path d={path(inset(f.left,.42,.2,.12,.6),true)+path(inset(f.left,.22,.43,.52,.13),true)} fill="#b17d70"/><path d={`M${x-52} ${y-57}v-5h16v7`} fill="none" stroke={INK}/></>}</Box>:
      <g>{[0,1,2].map(i=><Box key={i} x={x-12-i*29} y={y-29+i*.8} h={items==='books'?16:5+i*2} left={26} right={14} rows={items==='books'?4:2}/>)}</g>}
  </g>;
}
export function Kiosk({x,y,label,color=INK,screen=false,broken=false}:{x:number;y:number;label:string;color?:string;screen?:boolean;broken?:boolean}) {
  return <g>
    <Box x={x} y={y} h={112} left={78} right={24} color={color}>{f=><><Plate face={inset(f.left,.09,.08,.82,.62)} label={label} color={color} rows={screen?4:3} lit={screen&&!broken}/><FaceLines face={inset(f.left,.07,.76,.84,.15)} rows={3}/><FaceLines face={f.right} rows={7}/>{screen&&<path d={path(inset(f.left,.28,.73,.45,.07),true)} fill="none" stroke={color}/>}<path d={path([at(f.right,.5,.15),at(f.right,.5,.65)])} fill="none" stroke={EDGE}/>{broken&&<path d={path([at(f.left,.15,.12),at(f.left,.57,.4),at(f.left,.4,.68),at(f.left,.78,.6)])} stroke="#b78472" strokeWidth="1.3" fill="none"/>}</>}</Box>
    <path d={`M${x-82} ${y+2}l82 12 32-7m-112-5v8l82 11 30-9v-7`} stroke={EDGE} fill="none"/>
  </g>;
}
export function Canopy({x,y,label,color=INK}:{x:number;y:number;label:string;color?:string}) {
  const f=geometry(x,y-113,25,140,51);
  const feet=geometry(x,y,0,140,51);
  return <g>
    <path d={path(f.roof,true)} fill={BLACK} stroke={color}/><path d={path(f.left,true)} fill="#0a1417" stroke={color}/><path d={path(f.right,true)} fill={BLACK} stroke={EDGE}/>
    <Plate face={inset(f.left,.1,.05,.8,.9)} label={label} color={color} rows={0}/>
    <path d={path([f.left[2],feet.left[2]])+path([f.left[3],feet.left[3]])+path([f.right[2],feet.right[2]])} fill="none" stroke={INK} strokeWidth="1.3"/>
    <path d={path([f.left[3],at(f.left,.97,1)])+path([at(f.right,.03,1),f.right[2]])} fill="none" stroke={EDGE} strokeWidth=".7"/>
  </g>;
}
export function Cone({x,y}:{key?:number;x:number;y:number}) {
  return <g><path d={`M${x-14} ${y}l19-6 20 5-21 7Z`} fill={BLACK} stroke={INK} strokeWidth=".7"/><path d={`M${x-7} ${y-1}l9-31 8 32Z`} fill={BLACK} stroke="#b69476" strokeWidth="1"/><path d={`M${x-3} ${y-15}h10m-7-9h3`} stroke="#cbc3a1" strokeWidth="2"/></g>;
}
export function Barrier({x,y,width=110,broken=false}:{x:number;y:number;width?:number;broken?:boolean}) {
  const f=geometry(x,y,45,width,25);
  return <g><path d={path(f.left,true)} fill={BLACK} stroke={INK}/><path d={path(f.right,true)} fill="#10191b" stroke={EDGE}/>{Array.from({length:7},(_,i)=><path key={i} d={path([at(f.left,i/7,.04),at(f.left,Math.min(1,i/7+.08),.96)])} stroke={i%2?'#687979':'#ad9975'} strokeWidth="4"/>)}<path d={path(f.roof,true)} fill={BLACK} stroke={INK}/>{broken&&<path d={`M${x-width/2} ${y-42}l12 13-17 13 10 18`} fill="none" stroke="#bd816f"/>}</g>;
}
export function Fire({x,y,scale=1}:{x:number;y:number;scale?:number}) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <g className="campus-fire"><path d="M-27 0Q-39-15-22-38Q-24-16-13-22Q-10-35-3-64Q0-42 13-30Q21-44 23-49Q39-22 25 0Z" fill="#301713" stroke="#cf8460" strokeWidth="1"/><path d="M-17 0Q-23-17-10-29Q-8-18-2-20Q0-28 7-39Q6-18 18-15Q28-11 17 0Z" fill="#a0472b" opacity=".65"/><path d="M-6 0C-12-8-4-12-1-21C1-12 8-9 7 0" fill="#d9ac69"/><path d="M-24-5c-7-11 4-16 4-26M-7-27c8-10 3-18 4-27M15-7c7-8 1-12 4-20" fill="none" stroke="#edbd7b" strokeWidth=".65"/><g fill="#c9a47b"><circle cx="-16" cy="-57" r="1"/><circle cx="14" cy="-75" r=".8"/><circle cx="3" cy="-89" r=".6"/></g></g>
    <g className="campus-smoke" fill="none" stroke="#62605b" strokeWidth="1.2" opacity=".7"><path d="M-6-47q-29-21-12-40q26-19 2-42q-14-20 6-43M10-57q32-25 14-45q-26-24-6-53"/><path d="M-9-74q-19-9-5-23m37-13q15-17-3-31" strokeWidth=".65"/></g>
  </g>;
}
export function SmallFigure({x,y,role='student',pose='stand'}:{key?:number;x:number;y:number;role?:'student'|'teacher'|'steward';pose?:'stand'|'talk'|'carry'|'sit'}) {
  return <g transform={`translate(${x} ${y})`} className={pose==='carry'?'campus-carrier':''} fill={BLACK} stroke={role==='teacher'?'#c3bea5':'#a5babb'} strokeWidth=".8">
    <path d="M-4-46q-3-5 1-8q6-4 9 1l1 8-5 4-5-2Z"/><path d="M-4-51q4-6 10-1M-2-44v4m5-2v3" fill="none"/>
    <path d="M-6-38l9-3 6 5-2 22-13 1Z"/><path d="M-4-35l5 4 5-5M0-31v14" fill="none"/>
    <path d={pose==='sit'?'M-4-13l15 5 3 8m-10-13 14 7-2 6':'M-3-13l-5 13h5l5-11 4 11h5L6-14'} fill="none"/>
    <path d={pose==='talk'?'M-5-37l-7 13 10 3m10-14 8-9 9 3':pose==='carry'?'M-5-36l-10 12 7 4m15-15 10 12-6 4':'M-6-36l-7 14 3 6m18-20 7 13-1 8'} fill="none"/>
    {pose==='carry'&&<path d="M-10-26h22v13H-10Zm3 5h16m-12-9v-4h7v4"/>}
    {role==='steward'&&<path d="M-8-32h6" stroke="#bc7669" strokeWidth="2"/>}
    {role==='student'&&<path d="M-6-36l-8 3 2 19 7 1" stroke={EDGE}/>}
  </g>;
}


export function Flag({x,y,color='#ad7967',small=false}:{x:number;y:number;color?:string;small?:boolean}) {
  return <g transform={`translate(${x} ${y}) scale(${small?.65:1})`}><path d="M0 0V-106m-7 110 7-4 8 5m-8-1v7" stroke={INK} fill="none" strokeWidth="1"/><path className="heyi-cloth" d="M2-103Q29-112 60-94L59-57Q28-76 2-68Z" fill={BLACK} stroke={color} strokeWidth="1"/><path d="M8-98Q30-101 51-90M8-73Q31-83 51-63" stroke={color} opacity=".5" fill="none" strokeWidth=".6"/></g>;
}
export function Chair({x,y}:{key?:number;x:number;y:number}) {
  return <g fill="none" stroke={INK} strokeWidth=".8"><path d={`M${x} ${y}v-42l-25-4v37l25 9 17-6v-18M${x-25} ${y-9}v22m25-13v22m17-28v18M${x-25} ${y-9}l18-3 24 6`} /><path d={`M${x-22} ${y-39}l19 3m-19 4 19 3m-19 4 19 3`} stroke={EDGE}/></g>;
}
export function Van({x,y,official=false}:{x:number;y:number;official?:boolean}) {
  return <g transform={`translate(${x} ${y})`}>
    <path d="M-122-11V-62L-108-83L-13-72L36-37V-5L-2 5L-122-11Z" fill={BLACK} stroke={INK}/>
    <path d="M-113-59l93 12V-69l-86-10Z M-11-68L29-38L-10-46Z" fill="#081317" stroke={EDGE}/>
    <path d="M-11-45V-3M-121-28L-12-13L35-21M-70-73v66m-2-23 9 2M-5-33l12 2M-10-45l46 9" stroke={EDGE} strokeWidth=".8" fill="none"/>
    <Wheel x={-93} y={-6} r={13}/><Wheel x={9} y={-6} r={13}/>
    <path d="M-119-14l10 2m127-22 15 4m-158-61 104 13" stroke="#b8ac90" fill="none"/>
    {official?<><path d="M-63-53l26 3v21l-26-3Z" stroke="#bbaf8d" fill="none"/><path d="M-58-45l16 2m-17 5 16 2" stroke="#bbaf8d"/></>:<path d="M-104-43l70 9m-63 0 54 8" stroke="#809c9b" fill="none"/>}
  </g>;
}
export function Speaker({x,y}:{x:number;y:number}) {
  return <Box x={x} y={y} h={66} left={32} right={18}>{f=><>{[.3,.7].map(v=><ellipse key={v} cx={at(f.left,.5,v).x} cy={at(f.left,.5,v).y} rx="9" ry="11" fill="none" stroke={INK} strokeWidth=".8"/>)}<FaceLines face={f.right} rows={9}/></>}</Box>;
}

export function streetPoint(x:number,y:number):Point {
  const vp=x<800?-1200:2300;
  return {x,y:y+(HORIZON-y)*(x-800)/(vp-800)};
}
