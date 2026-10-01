import type { ReactNode, PointerEvent } from 'react';
import type { HeyiLightSnapshot, HeyiRoute, HeyiZone } from '../engine/heyiLight';

type Point = { x: number; y: number };
type Face = [Point, Point, Point, Point];
interface Observation {
  snapshot: HeyiLightSnapshot;
  active: HeyiZone | null;
  onZone: (zone: HeyiZone | null, anchor?: Point) => void;
  onPointer: (event: PointerEvent<SVGElement>, zone: HeyiZone) => void;
}
const HORIZON = 260;
const INK = '#b9c6ba', EDGE = '#60838b', BLACK = '#050d11';
const path = (points: Point[], close = false) => 'M' + points.map(p => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join('L') + (close ? 'Z' : '');
function at(face: Face, u: number, v: number): Point {
  const top = { x: face[0].x + (face[1].x - face[0].x) * u, y: face[0].y + (face[1].y - face[0].y) * u };
  const bottom = { x: face[3].x + (face[2].x - face[3].x) * u, y: face[3].y + (face[2].y - face[3].y) * u };
  return { x: top.x + (bottom.x - top.x) * v, y: top.y + (bottom.y - top.y) * v };
}
function inset(face: Face, u: number, v: number, w: number, h: number): Face {
  return [at(face,u,v),at(face,u+w,v),at(face,u+w,v+h),at(face,u,v+h)];
}
function geometry(x: number, y: number, height: number, left: number, right: number) {
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
function FaceLines({face, rows=4, columns=0, color=EDGE}:{face:Face;rows?:number;columns?:number;color?:string}) {
  return <g fill="none" stroke={color} strokeWidth=".65">{Array.from({length:rows},(_,i)=><path key={'r'+i} d={path([at(face,0,(i+1)/(rows+1)),at(face,1,(i+1)/(rows+1))])}/>)}{Array.from({length:columns},(_,i)=><path key={'c'+i} d={path([at(face,(i+1)/(columns+1),0),at(face,(i+1)/(columns+1),1)])}/>)}</g>;
}
function Plate({face,label,color=INK,rows=3,lit=false}:{key?:number;face:Face;label?:string;color?:string;rows?:number;lit?:boolean}) {
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
function Box({x,y,h,left,right,children,color=INK,rows=0}:{key?:number;x:number;y:number;h:number;left:number;right:number;children?:(faces:ReturnType<typeof geometry>)=>ReactNode;color?:string;rows?:number}) {
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
function Observe({zone,anchor,children,observation}:{zone:HeyiZone;anchor:Point;children:ReactNode;observation:Observation}) {
  const {active,snapshot,onZone,onPointer}=observation;
  return <g className={`campus-observation ${active===zone?'is-observed':''}`} data-zone={zone} role="button" tabIndex={0} aria-label={'观察'+snapshot.zones[zone].label}
    onPointerEnter={e=>onPointer(e,zone)} onPointerMove={e=>onPointer(e,zone)} onPointerLeave={()=>onZone(null)}
    onFocus={()=>onZone(zone,anchor)} onBlur={()=>onZone(null)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onZone(zone,anchor);}}}>{children}</g>;
}
function Wheel({x,y,r=15}:{x:number;y:number;r?:number}) {
  return <g fill="none" stroke={INK} strokeWidth=".85"><ellipse cx={x} cy={y} rx={r} ry={r*.89}/><ellipse cx={x} cy={y} rx={r-2} ry={(r-2)*.89} stroke={EDGE}/>{[0,1,2,3].map(i=>{const a=i*Math.PI/4;return <path key={i} d={`M${x-Math.cos(a)*r} ${y-Math.sin(a)*r*.89}L${x+Math.cos(a)*r} ${y+Math.sin(a)*r*.89}`}/>})}<circle cx={x} cy={y} r="2"/></g>;
}
function Bicycle({x,y,fallen=false}:{x:number;y:number;fallen?:boolean}) {
  return <g transform={`translate(${x} ${y}) ${fallen?'matrix(1 .06 -.5 .4 0 0)':''}`}>
    <Wheel x={0} y={0}/><Wheel x={65} y={-3}/>
    <path d="M0 0L29-29L65-3H0L22-20L46-23M29-29L25-37M20-37H36M60-40L68-37L65-3M28-29L60-30M45-2L28-29M44-2L49 3H55" fill="none" stroke="#8ba7a5" strokeWidth="1.15"/>
    <path d="M1-21Q-17-10-16 0M50-23Q72-25 81-4M-13-21H9V-14H-13ZM32-1L42 1" fill="none" stroke="#bbb79f" strokeWidth=".8"/>
  </g>;
}
function Bench({x,y,broken=false}:{x:number;y:number;broken?:boolean}) {
  const box=geometry(x,y,35,105,26);
  return <g>
    <path d={path(box.left,true)} fill={BLACK} stroke={INK} strokeWidth=".9"/>
    <FaceLines face={box.left} rows={3} color="#a2a38d"/>
    <path d={path(geometry(x+2,y+12,10,108,28).roof,true)} fill="#0b1415" stroke={INK}/>
    <path d={`M${x-91} ${y+3}v18m85-7v21m-81-20 81 16`} stroke={EDGE} fill="none"/>
    {broken&&<path d={`M${x-68} ${y-28}l16 12-7 11 15 7m-22 5 23-5`} stroke="#bd8c70" strokeWidth="1.4" fill="none"/>}
  </g>;
}
function Table({x,y,label,items='papers'}:{x:number;y:number;label?:string;items?:'papers'|'ballot'|'books'|'printer'|'flowers'|'medical'}) {
  return <g>
    <Box x={x} y={y} h={28} left={106} right={37}>{f=><>{label&&<Plate face={inset(f.left,.12,.10,.75,.67)} label={label} rows={0}/>}<FaceLines face={f.right} rows={2}/></>}</Box>
    <path d={`M${x-89} ${y-5}v31m82-7v20m34-28v17`} stroke={INK} fill="none" strokeWidth="1.2"/>
    {items==='ballot'?<Box x={x-32} y={y-30} h={37} left={34} right={22} color="#adc7bd">{f=><><path d={path(inset(f.left,.12,.15,.76,.68),true)} fill="none" stroke={EDGE}/><path d={path([at(f.roof,.25,.5),at(f.roof,.8,.5)])} stroke="#cfbea1" strokeWidth="1.5"/><path d={path(inset(f.left,.4,.38,.35,.23),true)} fill="#d0c4a5" opacity=".25"/></>}</Box>:
      items==='printer'?<Box x={x-26} y={y-29} h={28} left={58} right={28}>{f=><><FaceLines face={f.left} rows={4}/><path d={path(inset(f.left,.13,.25,.7,.3),true)} fill="#121e21" stroke="#899f9a"/><path d={`M${x-50} ${y-61}l31 2 5 15-37-3Z`} fill={BLACK} stroke="#c8c1a2"/><Wheel x={x-5} y={y-40} r={9}/></>}</Box>:
      items==='flowers'?<g>{[0,1,2].map(i=><g key={i}><Box x={x-20-i*29} y={y-28+i*2} h={14} left={17} right={8}/><path d={`M${x-27-i*29} ${y-40+i*2}q-13-24-17-15m17 15q10-24 17-22m-17 22v-31`} fill="none" stroke="#a3b78b"/><circle cx={x-27-i*29} cy={y-71+i*2} r="3" fill="#bba181"/></g>)}</g>:
      items==='medical'?<Box x={x-26} y={y-29} h={25} left={45} right={17} color="#b6bbaa">{f=><><path d={path(inset(f.left,.42,.2,.12,.6),true)+path(inset(f.left,.22,.43,.52,.13),true)} fill="#b17d70"/><path d={`M${x-52} ${y-57}v-5h16v7`} fill="none" stroke={INK}/></>}</Box>:
      <g>{[0,1,2].map(i=><Box key={i} x={x-12-i*29} y={y-29+i*.8} h={items==='books'?16:5+i*2} left={26} right={14} rows={items==='books'?4:2}/>)}</g>}
  </g>;
}
function Kiosk({x,y,label,color=INK,screen=false,broken=false}:{x:number;y:number;label:string;color?:string;screen?:boolean;broken?:boolean}) {
  return <g>
    <Box x={x} y={y} h={112} left={78} right={24} color={color}>{f=><><Plate face={inset(f.left,.09,.08,.82,.62)} label={label} color={color} rows={screen?4:3} lit={screen&&!broken}/><FaceLines face={inset(f.left,.07,.76,.84,.15)} rows={3}/><FaceLines face={f.right} rows={7}/>{screen&&<path d={path(inset(f.left,.28,.73,.45,.07),true)} fill="none" stroke={color}/>}<path d={path([at(f.right,.5,.15),at(f.right,.5,.65)])} fill="none" stroke={EDGE}/>{broken&&<path d={path([at(f.left,.15,.12),at(f.left,.57,.4),at(f.left,.4,.68),at(f.left,.78,.6)])} stroke="#b78472" strokeWidth="1.3" fill="none"/>}</>}</Box>
    <path d={`M${x-82} ${y+2}l82 12 32-7m-112-5v8l82 11 30-9v-7`} stroke={EDGE} fill="none"/>
  </g>;
}
function Canopy({x,y,label,color=INK}:{x:number;y:number;label:string;color?:string}) {
  const f=geometry(x,y-113,25,140,51);
  return <g>
    <path d={path(f.roof,true)} fill={BLACK} stroke={color}/><path d={path(f.left,true)} fill="#0a1417" stroke={color}/><path d={path(f.right,true)} fill={BLACK} stroke={EDGE}/>
    <Plate face={inset(f.left,.1,.05,.8,.9)} label={label} color={color} rows={0}/>
    <path d={`M${x} ${y-114}V${y+4}M${x-138} ${f.left[3].y}V${y-22}M${x+50} ${f.right[2].y}V${y-11}`} fill="none" stroke={INK} strokeWidth="1.3"/>
    <path d={`M${x-135} ${f.left[3].y+2}L${x} ${y-68}L${x+48} ${f.right[2].y+2}`} fill="none" stroke={EDGE} strokeWidth=".7"/>
  </g>;
}
function Cone({x,y}:{key?:number;x:number;y:number}) {
  return <g><path d={`M${x-14} ${y}l19-6 20 5-21 7Z`} fill={BLACK} stroke={INK} strokeWidth=".7"/><path d={`M${x-7} ${y-1}l9-31 8 32Z`} fill={BLACK} stroke="#b69476" strokeWidth="1"/><path d={`M${x-3} ${y-15}h10m-7-9h3`} stroke="#cbc3a1" strokeWidth="2"/></g>;
}
function Barrier({x,y,width=110,broken=false}:{x:number;y:number;width?:number;broken?:boolean}) {
  const f=geometry(x,y,45,width,25);
  return <g><path d={path(f.left,true)} fill={BLACK} stroke={INK}/><path d={path(f.right,true)} fill="#10191b" stroke={EDGE}/>{Array.from({length:7},(_,i)=><path key={i} d={path([at(f.left,i/7,.04),at(f.left,Math.min(1,i/7+.08),.96)])} stroke={i%2?'#687979':'#ad9975'} strokeWidth="4"/>)}<path d={path(f.roof,true)} fill={BLACK} stroke={INK}/>{broken&&<path d={`M${x-width/2} ${y-42}l12 13-17 13 10 18`} fill="none" stroke="#bd816f"/>}</g>;
}
function Fire({x,y,scale=1}:{x:number;y:number;scale?:number}) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <g className="campus-fire"><path d="M-27 0Q-39-15-22-38Q-24-16-13-22Q-10-35-3-64Q0-42 13-30Q21-44 23-49Q39-22 25 0Z" fill="#301713" stroke="#cf8460" strokeWidth="1"/><path d="M-17 0Q-23-17-10-29Q-8-18-2-20Q0-28 7-39Q6-18 18-15Q28-11 17 0Z" fill="#a0472b" opacity=".65"/><path d="M-6 0C-12-8-4-12-1-21C1-12 8-9 7 0" fill="#d9ac69"/><path d="M-24-5c-7-11 4-16 4-26M-7-27c8-10 3-18 4-27M15-7c7-8 1-12 4-20" fill="none" stroke="#edbd7b" strokeWidth=".65"/><g fill="#c9a47b"><circle cx="-16" cy="-57" r="1"/><circle cx="14" cy="-75" r=".8"/><circle cx="3" cy="-89" r=".6"/></g></g>
    <g className="campus-smoke" fill="none" stroke="#62605b" strokeWidth="1.2" opacity=".7"><path d="M-6-47q-29-21-12-40q26-19 2-42q-14-20 6-43M10-57q32-25 14-45q-26-24-6-53"/><path d="M-9-74q-19-9-5-23m37-13q15-17-3-31" strokeWidth=".65"/></g>
  </g>;
}
function SmallFigure({x,y,role='student',pose='stand'}:{x:number;y:number;role?:'student'|'teacher'|'steward';pose?:'stand'|'talk'|'carry'|'sit'}) {
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

export function CampusGround({observation}:{observation:Observation}) {
  const {route,mood}=observation.snapshot;
  const ruined=route==='jidi_riot'||route==='despair';
  return <Observe zone="road" anchor={{x:610,y:635}} observation={observation}>
    <path d="M-500 507L330 471L800 521L1700 434V700H-500Z" fill="#060e12" stroke={EDGE} strokeWidth=".85"/>
    <path d="M-500 519L331 485L801 536L1700 451M-500 531L331 497L801 549L1700 465" fill="none" stroke={INK} strokeWidth=".8"/>
    <path d="M-500 542L330 510L801 562L1700 481M-500 564L330 531L801 585L1700 501" stroke={EDGE} strokeWidth=".55" fill="none"/>
    {Array.from({length:23},(_,i)=>{const x=-350+i*90;return <path key={i} d={`M${x} ${x<330?528-x*.04:493+(x-330)*.11}l-8 15`} stroke="#597780" strokeWidth=".65" fill="none"/>;})}
    <path d="M-500 635L800 579L1700 657M-500 649L800 594L1700 673" stroke="#adad94" strokeWidth=".85" fill="none"/>
    {Array.from({length:7},(_,i)=>{const x=383+i*55; return <path key={i} d={`M${x} ${556+i*5.5}l22 2 48 102-29-2Z`} fill={ruined?'#263332':'#7b8880'} opacity=".55" stroke="#8a9e99" strokeWidth=".5"/>;})}
    <path d="M-100 692L330 541M955 700L801 560M1150 691L865 552" stroke="#355965" strokeWidth=".7" fill="none"/>
    <ellipse cx="211" cy="617" rx="28" ry="9" fill={BLACK} stroke={INK} strokeWidth=".8"/>
    <ellipse cx="211" cy="617" rx="24" ry="6.5" fill="none" stroke={EDGE} strokeWidth=".6"/>
    <path d="M191 615l39 2m-36 3 33-1m-24-9v13m10-12v12" stroke={EDGE} strokeWidth=".55" fill="none"/>
    {[118,290,888,1112].map((x,i)=><path key={x} d={`M${x} ${590+i%2*23}l17-3 9 5-18 5Z`} fill="none" stroke="#61777a" strokeWidth=".65"/>)}
    {(mood==='weary'||ruined)&&<g className="campus-puddle" fill="#101b1d" stroke="#667a7b" strokeWidth=".7"><path d="M83 573q57-11 105 2l-13 6-71 5-24-6Z"/><path d="M821 628q43-12 94-2l44 9-39 10-91-5Z"/><path d="M985 559l83-8 28 5-43 9Z"/></g>}
    {ruined&&Array.from({length:24},(_,i)=>{const x=160+(i*137)%900,y=569+(i*43)%117;return <path key={i} d={`M${x} ${y}l${i%2?11:-9}-4 5 9-13 1Z`} fill={BLACK} stroke={i%3===0?'#b19a7c':'#7b9697'} strokeWidth=".65"/>;})}
    {route==='gouxiong'&&<g fill="none" stroke="#b699ac" strokeWidth="1"><ellipse cx="933" cy="618" rx="40" ry="14"/><path d="M915 615v-4m32 1v4m-26 6q13 7 23 0M875 606l-16 4m149 9 17 6"/></g>}
    {route==='wu'&&<path d="M120 549L780 578L1150 542M145 556L780 585L1142 550" stroke="#b8a678" strokeWidth="1.2" fill="none"/>}
  </Observe>;
}

export function CampusGate({observation}:{observation:Observation}) {
  const {route,mood}=observation.snapshot;
  const ruined=route==='jidi_riot'||route==='despair';
  const closed=route==='wu'||route==='jidi'||route==='despair';
  const face=geometry(800,520,282,440,23).left;
  const top=inset(face,0,0,1,.25), gate=inset(face,.035,.27,.93,.70);
  return <g className="campus-gate">
    <Observe zone="sign" anchor={{x:600,y:276}} observation={observation}>
      <path d={path(top,true)} fill={BLACK} stroke={INK} strokeWidth="1.3"/>
      <path d={path(inset(top,.018,.06,.964,.88),true)} fill="none" stroke={EDGE} strokeWidth=".7"/>
      <path d={path([at(top,0,.03),{x:at(top,0,.03).x+9,y:at(top,0,.03).y-12},{x:at(top,1,.03).x+9,y:at(top,1,.03).y-12},at(top,1,.03)],true)} fill="#0b171b" stroke={INK}/>
      <Plate face={inset(top,.07,.09,.86,.83)} label="合肥一中" rows={0}/>
      {ruined&&<path d={path([at(top,.51,.01),at(top,.56,.38),at(top,.50,.62),at(top,.56,.96)])} stroke="#b58670" fill="none"/>}
      {route==='haobang'&&<g transform="translate(789 277)"><circle r="12" fill={BLACK} stroke="#ba8d75"/><path d="M-6 6L0-8L6 6M-7 2H7" fill="none" stroke="#ba8d75"/></g>}
    </Observe>
    <Observe zone="gate" anchor={{x:655,y:412}} observation={observation}>
      {[.0,.97].map((u,i)=>{const pt=at(face,u,0),base=at(face,u,1);return <Box key={i} x={pt.x+7} y={base.y+5} h={base.y-pt.y+5} left={17} right={17} rows={7}/>;})}
      <path d={path([at(face,0,1),at(face,1,1)])} fill="none" stroke={INK} strokeWidth="1.2"/>
      <path d={path([at(face,0,1.025),at(face,1,1.025)])} fill="none" stroke={EDGE} strokeWidth=".7"/>
      {(closed||(route==='opening'&&mood==='weary'))&&!ruined?<g>
        <path d={path(gate,true)} fill="#050d1199" stroke={INK} strokeWidth="1"/>
        <FaceLines face={gate} rows={3} columns={19}/>
        {Array.from({length:12},(_,i)=><path key={i} d={path([at(gate,i/12,.12),at(gate,(i+1)/12,.88)])+path([at(gate,i/12,.88),at(gate,(i+1)/12,.12)])} stroke={EDGE} strokeWidth=".7" fill="none"/>)}
        <path d={path([at(gate,.64,0),at(gate,.64,1)])} stroke="#c6c3aa" strokeWidth="1.3"/>
        <Plate face={inset(gate,.68,.35,.25,.2)} label={route==='wu'?'查验':'入口'} rows={0}/>
      </g>:ruined?<g>
        <path d="M389 488L695 523L651 549L361 512Z" fill={BLACK} stroke="#a08e7d"/>
        {Array.from({length:15},(_,i)=><path key={i} d={`M${378+i*19} ${496+i*2}l-6 25m7-24 15 29`} fill="none" stroke={EDGE} strokeWidth=".9"/>)}
        <path d="M773 329v183l-78 20 25-63 18-39-23-68Z" fill="none" stroke="#baa894"/>
        <path d="M728 437l-25-35m20 93-39 8M751 385l-25 26" stroke="#bb7d65" fill="none"/>
      </g>:<g>
        <path d="M372 317L395 319L426 452L374 468Z" fill={BLACK} stroke={INK}/>
        <path d="M780 325L796 328L790 511L740 490Z" fill={BLACK} stroke={INK}/>
        {Array.from({length:8},(_,i)=><path key={i} d={`M${374+i*3} ${319+i*.4}L${377+i*6} ${464-i*2}M${780+i*2} 333L${744+i*6} ${492+i*2}`} stroke={EDGE} strokeWidth=".8" fill="none"/>)}
      </g>}
      {route==='jidi'&&[536,612,688].map(x=><g key={x}><Box x={x} y={504+(x-536)*.09} h={38} left={30} right={14}/><path d={`M${x} 477l-29-7m29 7 22 4m-22-4v20`} stroke="#c3ac78" fill="none"/></g>)}
      {route==='wu'&&<path d="M777 383L494 420M760 381L488 413" stroke="#a69075" strokeWidth="1.1" fill="none"/>}
    </Observe>
  </g>;
}

export function CampusGuard({observation}:{observation:Observation}) {
  const {route}=observation.snapshot;const wreck=route==='jidi_riot';
  return <Observe zone="guard" anchor={{x:208,y:418}} observation={observation}>
    <Box x={306} y={494} h={166} left={222} right={35}>{f=><>
      <Plate face={inset(f.left,.04,.025,.92,.12)} label={route==='wu'?'勤务室':route==='revolution'?'保卫组':route==='gouxiong'?'值班管理员':'门卫室'} rows={0}/>
      {[.09,.53].map((u,i)=>{const win=inset(f.left,u,.25,.37,.43);return <g key={u}><path d={path(win,true)} fill={BLACK} stroke={INK}/><FaceLines face={win} rows={1} columns={1}/>{wreck?<path d={path([at(win,0,0),at(win,.52,.56),at(win,.28,1)])+path([at(win,1,0),at(win,.4,.55),at(win,1,1)])} stroke="#b78573" fill="none"/>:<><path className="heyi-window__light" d={path(inset(win,.03,.06,.44,.39),true)} fill={route==='wu'?'#93b2b4':'#aa9564'} opacity=".18"/><path d={path([at(win,.06,.78),at(win,.95,.78)])} stroke="#879e99"/><path d={path(inset(win,.18,.55,.44,.20),true)} fill="none" stroke={EDGE}/>{i===0&&route!=='despair'&&<SmallFigure x={at(win,.70,.78).x} y={at(win,.70,.78).y} role="teacher" pose="sit"/>}</>}</g>;})}
      <FaceLines face={inset(f.left,.04,.8,.93,.18)} rows={2}/>
      <Plate face={inset(f.right,.15,.22,.70,.70)} rows={2}/>
      <path d={path(inset(f.right,.32,.36,.22,.45),true)} fill="none" stroke={INK}/>
      <path d={path(inset(f.roof,.05,.2,.84,.1),true)} fill="none" stroke={EDGE}/>
    </>}</Box>
    <path d="M77 473L307 508L349 498M77 481L307 516L349 506" fill="none" stroke={INK} strokeWidth=".8"/>
    {route==='jidi'&&<Kiosk x={337} y={500} label="扫码" screen color="#c1ae7e"/>}
    {route==='wu'&&<g><path d="M321 310v-56l38 7M345 254l22 5-5 10-23-6Z" fill={BLACK} stroke={INK}/><circle cx="358" cy="263" r="2" fill="#b87468"/><Plate face={geometry(100,478,42,36,6).left} label="证件" rows={0}/></g>}
    {route==='despair'&&<path d="M99 375l70 75m-58-3 59-78" stroke="#ac8c73" strokeWidth="2"/>}
    {wreck&&<path d="M132 474l27 4 3 9-28-3m85-56 15 2-4 15-19-3" fill={BLACK} stroke="#a18e77"/>}
  </Observe>;
}

export function CampusTrees({observation,month}:{observation:Observation;month:number}) {
  const {route,mood}=observation.snapshot;const damaged=route==='jidi_riot'||route==='despair';const winter=month===11||month<2;const trimmed=route==='jidi'||route==='wu';
  return <Observe zone="trees" anchor={{x:1095,y:310}} observation={observation}>
    <path d="M1042 464l47-7 49 9-51 15Z" fill={BLACK} stroke={EDGE}/>
    <path d="M1081 463Q1091 417 1086 351L1085 298L1098 291L1100 369Q1098 430 1104 471Z" fill={BLACK} stroke={INK} strokeWidth="1"/>
    <g className="heyi-tree__crown" fill="none" stroke={INK} strokeWidth=".85">
      <path d="M1091 352L1062 312L1034 285M1091 343L1127 297L1169 270M1093 317L1082 275L1062 244M1096 313L1120 264L1138 233M1068 320L1038 315L1018 301M1124 300L1150 304L1172 297M1083 275L1044 267M1121 267L1159 249"/>
      {!winter&&!damaged&&<>
        <path d={trimmed?'M1037 280Q1015 251 1036 218Q1053 197 1096 197Q1148 191 1167 220Q1184 253 1163 280Q1135 297 1098 288Q1062 298 1037 280Z':'M1017 282Q995 272 1010 248Q990 228 1018 219Q1010 190 1038 190Q1031 167 1054 167Q1060 150 1083 158Q1100 140 1118 159Q1147 146 1152 171Q1178 168 1174 192Q1198 193 1185 216Q1210 232 1192 251Q1198 275 1178 282Q1173 303 1147 296Q1126 319 1106 305Q1087 319 1065 303Q1039 317 1029 293Q1015 300 1017 282Z'} fill={BLACK} stroke="#94aca0" strokeWidth=".8"/>
        <path d="M1030 272q17-15 36-4m-42-44q21-14 37-3m5-39q13 15 32 1m27 0q13-7 25 7m1 45q21-11 31 1m-66 56q13-16 27-4m-73-37q14-13 26-5" stroke="#5c807d" strokeWidth=".65" fill="none"/>
        {Array.from({length:trimmed?23:46},(_,i)=>{const angle=i*2.399963;const radius=trimmed?58:35+(i%5)*13;const x=1098+Math.cos(angle)*radius,y=trimmed?251+Math.sin(angle)*43:246+Math.sin(angle)*radius*.8;
          return <g key={i} transform={`rotate(${angle*180/Math.PI} ${x} ${y})`}><path d={`M${x-8} ${y}q6-6 15-1q-6 6-15 1Zm9 1q8-3 12 3q-9 2-12-3Zm-5 1q-8 1-10 7q8 0 10-7Z`} fill={BLACK} stroke={i%3===0?'#b3b697':'#638d89'} strokeWidth=".6"/><path d={`M${x-10} ${y+5}l19-8`} stroke={EDGE} strokeWidth=".45"/></g>;
        })}
      </>}
      {(winter||damaged)&&<path d="M1034 285l-21-28m22 29-1-24m26 49-21-3m29-21 9-16m-6-3-25-25m58 54 3-21m32-6 9-25m-9 25 23-3m-53-29-5-28m-11 9 10-12" stroke={damaged?'#a88e78':INK}/>} 
    </g>
    {route==='revolution'&&[1058,1128].map(x=><path key={x} className="heyi-cloth" d={`M${x} 288l4 1-3 38-7-9Z`} fill="#301717" stroke="#b67c6b" strokeWidth=".8"/>)}
    {route==='gouxiong'&&<g><path d="M1045 280l14 58m49-57 14 60" stroke={EDGE}/><Plate face={geometry(1068,357,29,27,5).left} label="社团" rows={0}/><Plate face={geometry(1140,359,29,27,5).left} label="演出" rows={0}/></g>}
    {month>=8&&month<=10&&!trimmed&&!damaged&&[0,1,2,3].map(i=><path key={i} className="heyi-falling-leaf" style={{animationDelay:`-${i*2.3}s`}} d={`M${1034+i*35} ${300+i%2*12}q7-6 11 0q-5 7-11 0`} fill={BLACK} stroke="#b89f74" strokeWidth=".8"/>)}
    {mood==='bright'&&<g fill="none" stroke="#98aa8a" strokeWidth=".7"><path d="M1055 470q-12-14-9-21m13 21q6-14 11-15m41 19q9-18 17-11m-14 11-4-19"/></g>}
  </Observe>;
}

export function CampusEdges({observation}:{observation:Observation}) {
  const {route,mood}=observation.snapshot;
  const damaged=route==='despair'||route==='jidi_riot';
  return <g className="campus-street-edges">
    <Observe zone="road" anchor={{x:30,y:482}} observation={observation}>
      {[-45,1320].map((x,i)=>{
        const f=geometry(x,469,68,i?118:150,i?75:85), wall=i?f.left:f.right;
        return <g key={x}>
          <path d={path(wall,true)} fill={BLACK} stroke={EDGE} strokeWidth=".85"/>
          <FaceLines face={wall} rows={5} columns={8} color="#425b5b"/>
          <path d={path([at(wall,0,0),at(wall,1,0)])} stroke={INK} strokeWidth="1.2"/>
          {[.1,.3,.5,.7,.9].map(u=>{
            const p=at(wall,u,0);return <g key={u}><path d={`M${p.x} ${p.y}v-24l-2-4 2-4 2 4-2 4m-2 15h4`} stroke="#849e94" fill="none" strokeWidth=".7"/>
              {!damaged&&<path d={`M${p.x-7} ${p.y+4}q-11-12-4-17q-8-9 3-13q2-10 10-4q12-1 10 10q10 9-4 15m-13-9 13 6m-9-13 6 9`} stroke={mood==='bright'?'#82967d':'#60776b'} fill="none" strokeWidth=".65"/>}</g>;
          })}
          <path d={path([at(wall,0,.08),at(wall,1,.08)])} stroke="#9d977c" strokeWidth=".5"/>
          {damaged&&<path d={path([at(wall,.4,0),at(wall,.48,.22),at(wall,.42,.53),at(wall,.53,.79)])} stroke="#968775" fill="none" strokeWidth=".85"/>}
        </g>;
      })}
      <Bench x={-30} y={497} broken={damaged}/><Bicycle x={-117} y={551} fallen={damaged}/>
      <path d="M-182 497l134-13 84 9M-181 503l134-13 85 10M1210 524l152-16 120 13M1210 531l152-16 120 13" fill="none" stroke={EDGE} strokeWidth=".7"/>
      {[-137,-63,1240,1320].map((x,i)=><g key={x}>
        <path d={`M${x} ${i<2?511:539}v-22l8-3v24m-8-18 8-2m-8 12 8-2`} fill="none" stroke="#a6a792" strokeWidth=".9"/>
      </g>)}
      <Box x={1288} y={519} h={70} left={56} right={18}>{f=><><Plate face={inset(f.left,.08,.09,.82,.76)} label={route==='wu'?'門禁':damaged?'停用':'公交'} rows={2} color="#a4b4a5"/><path d={path(inset(f.right,.15,.1,.65,.6),true)} stroke={EDGE} fill="none"/></>}</Box>
      <path d="M1275 521v13m-42-11v9" stroke={INK} fill="none"/>
      <Bicycle x={1320} y={570} fallen={damaged}/>
      {!damaged&&<SmallFigure x={1221} y={540} role="teacher"/>}
      {route==='wu'&&<Barrier x={-77} y={549} width={79}/>}
      {route==='gouxiong'&&<path d="M-171 430q74-16 156-10m1230 36q70 5 143-7" stroke="#ac93a6" fill="none" strokeWidth=".8"/>}
    </Observe>
  </g>;
}

export function StreetFurniture({observation}:{observation:Observation}) {
  const {route}=observation.snapshot;
  return <g>
    <Observe zone="road" anchor={{x:30,y:480}} observation={observation}>
      <path d="M29 538V295l6-11 98 13M35 299l96 8M27 374l37 4m-2-2v-49" fill="none" stroke={INK} strokeWidth="1"/>
      <path d="M27 534V296l5-10m-2 246V299M29 534l-7 5 15 1 6-6Z" fill="none" stroke={EDGE} strokeWidth=".65"/>
      <path d="M123 300l-8 19 30 3-7-20Z" fill={BLACK} stroke={EDGE} strokeWidth=".8"/>
      <path d="M120 306l15 2" fill="none" stroke={INK} strokeWidth=".7"/>
      <path d="M53 330l19 2v58l-19-2Z" fill={BLACK} stroke={INK} strokeWidth=".8"/>
      {[0,1,2].map(i=><ellipse key={i} className={i===2?'heyi-lamp__signal':''} cx="62" cy={343+i*17} rx="4.5" ry="5" fill={(route==='wu'||route==='jidi_riot')?i===0?'#995e54':BLACK:i===2?'#88a78c':BLACK} stroke={i===0?'#a27e74':i===1?'#b49f7d':'#8fa994'} strokeWidth=".65"/>)}
      <Box x={1040} y={528} h={41} left={32} right={18}>{f=><><FaceLines face={f.left} rows={7}/><path d={path(inset(f.roof,.12,.18,.68,.45),true)} fill="#01080c" stroke={INK}/></>}</Box>
      <Box x={972} y={510} h={105} left={127} right={13}>{f=><Plate face={inset(f.left,.05,.08,.90,.85)} label={{opening:'校務公告',democracy:'議事日程',revolution:'臨時公報',reform:'課程徵集',haobang:'聯席會議',yang:'教師評審',jidi:'升學指標',jidi_riot:'緊急疏散',gouxiong:'社團活動',wu:'通行條例',despair:'停止開放'}[route]} color={observation.snapshot.accent}/>}</Box>
      <path d="M875 516v19m94-11v17" stroke={INK}/>
    </Observe>
  </g>;
}

function Flag({x,y,color='#ad7967',small=false}:{x:number;y:number;color?:string;small?:boolean}) {
  return <g transform={`translate(${x} ${y}) scale(${small?.65:1})`}><path d="M0 0V-106m-7 110 7-4 8 5m-8-1v7" stroke={INK} fill="none" strokeWidth="1"/><path className="heyi-cloth" d="M2-103Q29-112 60-94L59-57Q28-76 2-68Z" fill={BLACK} stroke={color} strokeWidth="1"/><path d="M8-98Q30-101 51-90M8-73Q31-83 51-63" stroke={color} opacity=".5" fill="none" strokeWidth=".6"/></g>;
}
function Chair({x,y}:{x:number;y:number}) {
  return <g fill={BLACK} stroke={INK} strokeWidth=".8"><path d={`M${x} ${y}v-42l-25-4v37l25 9 17-6v-18M${x-25} ${y-9}v22m25-13v22m17-28v18M${x-25} ${y-9}l18-3 24 6`} /><path d={`M${x-22} ${y-39}l19 3m-19 4 19 3m-19 4 19 3`} stroke={EDGE}/></g>;
}
function Van({x,y,official=false}:{x:number;y:number;official?:boolean}) {
  return <g transform={`translate(${x} ${y})`}>
    <path d="M-122-11V-62L-108-83L-13-72L36-37V-5L-2 5L-122-11Z" fill={BLACK} stroke={INK}/>
    <path d="M-113-59l93 12V-69l-86-10Z M-11-68L29-38L-10-46Z" fill="#081317" stroke={EDGE}/>
    <path d="M-11-45V-3M-121-28L-12-13L35-21M-70-73v66m-2-23 9 2M-5-33l12 2M-10-45l46 9" stroke={EDGE} strokeWidth=".8" fill="none"/>
    <Wheel x={-93} y={-6} r={13}/><Wheel x={9} y={-6} r={13}/>
    <path d="M-119-14l10 2m127-22 15 4m-158-61 104 13" stroke="#b8ac90" fill="none"/>
    {official?<><path d="M-63-53l26 3v21l-26-3Z" stroke="#bbaf8d" fill="none"/><path d="M-58-45l16 2m-17 5 16 2" stroke="#bbaf8d"/></>:<path d="M-104-43l70 9m-63 0 54 8" stroke="#809c9b" fill="none"/>}
  </g>;
}
function Speaker({x,y}:{x:number;y:number}) {
  return <Box x={x} y={y} h={66} left={32} right={18}>{f=><>{[.3,.7].map(v=><ellipse key={v} cx={at(f.left,.5,v).x} cy={at(f.left,.5,v).y} rx="9" ry="11" fill="none" stroke={INK} strokeWidth=".8"/>)}<FaceLines face={f.right} rows={9}/></>}</Box>;
}
function RouteStreetScene({route}:{route:HeyiRoute}) {
  switch(route) {
    case 'opening': return <g>
      <Canopy x={252} y={559} label="早點" color="#b6aa89"/><Table x={241} y={548} items="flowers"/>
      <Box x={171} y={540} h={42} left={40} right={17}>{f=><><FaceLines face={f.left} rows={5}/><ellipse cx="161" cy="498" rx="18" ry="5" fill={BLACK} stroke={INK}/><path className="campus-steam" d="M153 492q-6-12 2-17q7-9 0-18m10 34q8-10 1-18" fill="none" stroke={EDGE}/></>}</Box>
      <Bicycle x={95} y={585}/><Bicycle x={175} y={593}/><Van x={1091} y={576}/>
      <SmallFigure x={233} y={536} role="teacher"/><SmallFigure x={286} y={564} pose="carry"/><SmallFigure x={1061} y={585} role="teacher"/>
    </g>;
    case 'democracy': return <g>
      <Canopy x={286} y={568} label="學生投票處" color="#9bbb9e"/><Table x={258} y={555} items="ballot" label="投票"/>
      <Kiosk x={154} y={569} label="候選人" color="#a2c6b0"/>
      <Table x={1086} y={555} items="papers" label="議事記錄"/><Chair x={1130} y={568}/><Chair x={1050} y={549}/>
      <Bench x={997} y={552}/><Bicycle x={1148} y={596}/>
      <SmallFigure x={208} y={552} pose="talk"/><SmallFigure x={301} y={581} pose="carry"/><SmallFigure x={1060} y={568} role="teacher" pose="talk"/><SmallFigure x={1103} y={568} pose="sit"/>
      <path d="M292 408Q483 386 703 361" stroke="#8bac91" fill="none" strokeWidth=".7"/>
    </g>;
    case 'revolution': return <g>
      <Flag x={115} y={561}/><Flag x={292} y={570} small/>
      <Table x={237} y={552} items="printer" label="地下印刷"/>
      <Kiosk x={976} y={558} label="臨時公報" color="#c49785"/>
      <Box x={1136} y={561} h={45} left={80} right={35} rows={4}>{f=><Plate face={inset(f.left,.12,.14,.73,.63)} label="會場" rows={0} color="#c49785"/>}</Box>
      <Flag x={1136} y={517}/><Box x={186} y={587} h={27} left={47} right={22} rows={3}/><Box x={124} y={581} h={22} left={40} right={20} rows={3}/>
      <SmallFigure x={236} y={537} role="steward" pose="carry"/><SmallFigure x={313} y={574} role="steward"/><SmallFigure x={1088} y={558} pose="talk"/><SmallFigure x={1123} y={518} role="teacher" pose="talk"/>
      <path d="M968 617l-57-9 14-5m-14 5 14 7M182 617l94-4-15-6m15 6-15 8" stroke="#bd8c79" strokeWidth="1" fill="none"/>
    </g>;
    case 'reform': return <g>
      <Table x={274} y={556} items="books" label="互助書架"/>
      <Box x={204} y={531} h={45} left={66} right={24}>{f=><><FaceLines face={f.left} rows={3}/>{[.2,.4,.6,.8].map(u=><path key={u} d={path([at(f.left,u,.07),at(f.left,u,.95)])} stroke="#a4ab93" strokeWidth="1.8"/>)}<FaceLines face={f.right} rows={3}/></>}</Box>
      <Bicycle x={118} y={581}/><Bicycle x={199} y={597}/><Bench x={1110} y={553}/>
      <Table x={1073} y={543} items="flowers" label="植物社"/>
      <Kiosk x={1177} y={548} label="新課程" color="#abb997"/>
      <SmallFigure x={308} y={575} pose="carry"/><SmallFigure x={228} y={542} pose="talk"/><SmallFigure x={1118} y={555} role="teacher" pose="sit"/><SmallFigure x={1046} y={554} pose="talk"/>
      <Box x={333} y={433} h={41} left={22} right={11} color="#abbb9c">{f=><><path d={path([at(f.left,.15,.16),at(f.left,.85,.16)])} stroke="#d0c9a4"/><Plate face={inset(f.left,.15,.33,.7,.50)} label="建議" rows={0}/></>}</Box>
    </g>;
    case 'haobang': return <g>
      <Canopy x={291} y={572} label="聯席會議登記" color="#b99c80"/><Table x={258} y={560} label="簽到"/><Kiosk x={147} y={563} label="輪值名單" color="#bba78a"/>
      <Table x={1098} y={559} items="papers" label="聯合聲明"/><Chair x={1128} y={571}/><Chair x={1048} y={552}/><Chair x={1153} y={552}/>
      <Flag x={1120} y={526} small/><Flag x={1023} y={540} color="#91b7ac" small/>
      <SmallFigure x={246} y={545} role="steward"/><SmallFigure x={303} y={575} role="teacher" pose="carry"/><SmallFigure x={1108} y={554} role="teacher" pose="sit"/><SmallFigure x={1052} y={559} pose="talk"/>
      <Box x={961} y={571} h={24} left={34} right={16} rows={5}/><Box x={995} y={565} h={22} left={30} right={15} rows={4}/>
    </g>;
    case 'yang': return <g>
      <Kiosk x={212} y={559} label="名師評審" color="#bdaa85"/>
      <Box x={298} y={558} h={104} left={71} right={24}>{f=><><Plate face={inset(f.left,.08,.08,.84,.75)} label="榮譽欄" rows={0} color="#c5b692"/><path d={path(inset(f.left,.20,.4,.23,.3),true)} fill="none" stroke={EDGE}/><path d={path(inset(f.left,.56,.4,.23,.3),true)} fill="none" stroke={EDGE}/><path d={path([at(f.left,.26,.8),at(f.left,.75,.8)])} stroke="#ab9a7e"/></>}</Box>
      <Table x={1087} y={556} items="papers" label="審核材料"/><Van x={1163} y={594} official/>
      <SmallFigure x={1047} y={562} role="teacher" pose="carry"/><SmallFigure x={1011} y={568} role="teacher" pose="carry"/><SmallFigure x={972} y={574} role="teacher" pose="carry"/>
      <SmallFigure x={258} y={574} role="teacher"/><SmallFigure x={1128} y={566} role="teacher" pose="sit"/>
      <Box x={923} y={583} h={14} left={31} right={16} rows={4}/><path d="M252 624l91 8-12 9-94-9Z" fill={BLACK} stroke="#a4a991" strokeWidth=".8"/>
    </g>;
    case 'jidi': return <g>
      <Kiosk x={228} y={565} label="實時排名" color="#c4b17f" screen/>
      <Kiosk x={1118} y={562} label="升學指標" color="#c4b17f" screen/>
      <Box x={312} y={565} h={64} left={44} right={20}>{f=><><Plate face={inset(f.left,.08,.12,.85,.62)} label="07:00" color="#c4b17f" rows={0} lit/><FaceLines face={f.right} rows={6}/></>}</Box>
      {[915,962,1009].map((x,i)=><g key={x}><Box x={x} y={573-i*5} h={37} left={27} right={15}/><path d={`M${x-10} ${553-i*5}h9m-9 4h9`} stroke="#b9ab89"/></g>)}
      <path d="M152 600l680 36M157 589l680 36M162 578l680 36" stroke="#887f63" strokeWidth=".65" fill="none"/>
      <SmallFigure x={1108} y={567} role="teacher" pose="carry"/><SmallFigure x={866} y={574} pose="carry"/><SmallFigure x={908} y={568} pose="carry"/>
      <Box x={1096} y={609} h={31} left={70} right={28} rows={6}/>
    </g>;
    case 'jidi_riot': return <g>
      <Kiosk x={223} y={565} label="排名中斷" color="#a48b78" screen broken/>
      <Barrier x={325} y={581} broken/><Bicycle x={92} y={600} fallen/>
      <Box x={1084} y={561} h={44} left={106} right={35} rows={4}/>
      <Fire x={1090} y={516} scale={.9}/><Fire x={212} y={566} scale={.55}/>
      <Table x={974} y={580} items="medical" label="點名"/>
      <SmallFigure x={963} y={563} role="teacher" pose="talk"/><SmallFigure x={1052} y={584} pose="carry"/><SmallFigure x={289} y={594} pose="carry"/>
      <path d="M1154 580Q1081 618 901 610Q810 606 800 571M1154 584Q1081 622 901 614Q805 611 798 573" stroke="#8aabaf" strokeWidth="1.1" fill="none"/>
      <path d="M282 621l27-3 7 12-31 1ZM324 620l18 1-1 12-22-4ZM1091 594l32-6 4 16-37 4Z" fill={BLACK} stroke="#b8b8a2" strokeWidth=".8"/>
      <path className="campus-water" d="M805 609l80 4m-23 8 61 2m-763-22 106 17" stroke="#75969b" fill="none"/>
    </g>;
    case 'gouxiong': return <g>
      <Box x={279} y={570} h={22} left={150} right={55} rows={2}/>
      <Canopy x={281} y={548} label="校園放映" color="#b298b5"/>
      <Speaker x={124} y={560}/><Speaker x={324} y={575}/>
      <Box x={273} y={537} h={62} left={106} right={17}>{f=><><Plate face={inset(f.left,.06,.07,.88,.86)} label="LIVE" color="#b2a0b9" rows={0} lit/><path d={path([at(f.left,.25,.47),at(f.left,.45,.68),at(f.left,.80,.30)])} stroke="#b4b19a" fill="none"/></>}</Box>
      <Table x={1114} y={560} items="books" label="同人展"/><Kiosk x={979} y={556} label="活動投票" color="#b298b5" screen/>
      <Bicycle x={1154} y={600}/><SmallFigure x={287} y={546} pose="talk"/><SmallFigure x={259} y={580} pose="talk"/><SmallFigure x={302} y={590} pose="talk"/><SmallFigure x={1084} y={567} pose="carry"/>
      <path d="M111 423Q246 458 331 433" stroke="#b6a6b2" fill="none"/>
      {Array.from({length:9},(_,i)=><circle key={i} className="campus-festoon" style={{animationDelay:`-${i*.7}s`}} cx={118+i*24} cy={426+Math.sin(i/8*Math.PI)*17} r="2" fill={i%3===0?'#c4b886':i%3===1?'#a4b8ac':'#ad99b8'}/>)}
    </g>;
    case 'wu': return <g>
      <Canopy x={259} y={564} label="證件查驗" color="#a7b5af"/><Table x={236} y={555} label="登記"/>
      <Barrier x={352} y={582}/><Barrier x={1160} y={565} width={145}/>
      {[145,365,917,998,1108].map((x,i)=><Cone key={x} x={x} y={591-i*7}/>)}
      <Kiosk x={964} y={558} label="巡查通報" color="#b3beb5"/>
      <SmallFigure x={286} y={577} role="steward"/><SmallFigure x={211} y={552} role="teacher" pose="sit"/><SmallFigure x={1060} y={570} role="steward"/>
      <path d="M1120 518V384l-39-8M1075 369l44 9-7 11-44-9Z" fill={BLACK} stroke={INK}/>
      <path className="campus-search-beam" d="M1084 384L642 643L812 646Z" fill="#bfc3a3" opacity=".04"/>
      <path d="M271 487l25 3m-26 5 24 3m-25 5 23 3" stroke="#bfc5b3"/>
    </g>;
    case 'despair': return <g>
      <Kiosk x={235} y={564} label="停止開放" color="#a99583" broken/>
      <Bench x={1082} y={562} broken/><Bicycle x={1014} y={605} fallen/>
      <Barrier x={336} y={584} broken/><Barrier x={942} y={592} broken/>
      <Box x={154} y={578} h={35} left={60} right={24} rows={4}/><Box x={1182} y={566} h={24} left={62} right={23} rows={3}/>
      <path d="M103 573l49 6-32 6-22-3M1087 567l33 29 11-3-30-28M970 565l17 4-4 15-22-5" fill={BLACK} stroke="#a28d75" strokeWidth="1"/>
      <path className="heyi-cloth" d="M246 472l-44 2 5 12-20 9 40 2 5 20 15-12Z" fill={BLACK} stroke="#ac9986" strokeWidth=".8"/>
      <SmallFigure x={300} y={589} pose="carry"/>
    </g>;
  }
}
export function CampusRouteObjects({observation}:{observation:Observation}) {
  return <Observe zone={observation.snapshot.route==='yang'?'teachers':'students'} anchor={{x:280,y:543}} observation={observation}><g className="campus-route-scene" data-route={observation.snapshot.route}><RouteStreetScene route={observation.snapshot.route}/></g></Observe>;
}

export function CampusBuildingDetails({route}:{route:HeyiRoute}) {
  const f=geometry(720,435,360,640,440);
  const titles:Record<HeyiRoute,string>={opening:'新學期',democracy:'學生代表選舉',revolution:'臨時委員會',reform:'互助學習與課程改革',haobang:'各派聯席會議',yang:'教學與職稱評審',jidi:'升學衝刺',jidi_riot:'緊急疏散',gouxiong:'校園文化週',wu:'校園秩序公報',despair:'暫停使用'};
  const colors:Record<HeyiRoute,string>={opening:'#afa98e',democracy:'#9dbaa7',revolution:'#b97e6f',reform:'#afbb94',haobang:'#bca483',yang:'#bdaa8b',jidi:'#c6b580',jidi_riot:'#c38e73',gouxiong:'#b4a0b8',wu:'#aab9b7',despair:'#aa998a'};
  const color=colors[route];
  return <g className="campus-building-details">
    <Plate face={inset(f.left,.10,.251,.66,.10)} label={titles[route]} rows={0} color={color}/>
    {route==='jidi'&&<><Plate face={inset(f.right,.13,.53,.67,.17)} label="C9 / 985" color={color} rows={3} lit/>{Array.from({length:12},(_,i)=><path key={i} d={path([at(f.right,.15+i*.053,.74),at(f.right,.15+i*.053,.87)])} stroke={color} strokeWidth={i%3?1:2.5}/>)}</>}
    {route==='yang'&&<g><Plate face={inset(f.left,.09,.035,.085,.20)} rows={0} color="#c4bda2"/><path className="heyi-window__light" d={path(inset(f.left,.10,.055,.066,.16),true)} fill="#b19967" opacity=".35"/><path d={path([at(f.left,.105,.163),at(f.left,.156,.163)])} stroke="#bcb394"/><path d={path([at(f.left,.117,.159),at(f.left,.117,.122),at(f.left,.142,.122),at(f.left,.142,.159)])} fill="none" stroke={EDGE}/></g>}
    {route==='wu'&&[.10,.8].map((u,i)=>{const p=at(i?f.right:f.left,u,.47);return <g key={i}><path d={`M${p.x} ${p.y}v-11l20 4M${p.x+14} ${p.y-13}l18 4-3 7-18-4Z`} fill={BLACK} stroke={INK} strokeWidth=".8"/><circle cx={p.x+29} cy={p.y-5} r="1.5" fill="#a87164"/></g>;})}
    {(route==='despair'||route==='jidi_riot')&&[f.left,f.right].map((face,side)=><g key={side}>
      {[0,1,2,3,4].map(i=>{const u=.15+i*.15,v=side?.53:.54;return <g key={i}><path d={path(inset(face,u,v,.08,.15),true)} fill="#02080b" stroke="#8e8e7c" strokeWidth=".65"/>{route==='despair'?<><path d={path([at(face,u,v+.015),at(face,u+.08,v+.14)])} stroke="#9e8a72" strokeWidth="2"/><path d={path([at(face,u,v+.13),at(face,u+.08,v+.02)])} stroke="#9e8a72" strokeWidth="1.6"/></>:<path d={path([at(face,u+.01,v),at(face,u+.05,v+.07),at(face,u+.01,v+.12)])} stroke="#a68d79" fill="none"/>}</g>;})}
    </g>)}
    {route==='revolution'&&<><Flag x={218} y={123} small/><Flag x={879} y={97} small/><path d={path([at(f.left,.09,.04),at(f.left,.2,.04),at(f.left,.16,.22),at(f.left,.12,.19)],true)} fill={BLACK} stroke={color}/></>}
    {route==='haobang'&&[.33,.43,.53].map((u,i)=><path key={i} d={path([at(f.left,u,.355),at(f.left,u+.03,.355),at(f.left,u+.018,.435),at(f.left,u,.423)],true)} fill={BLACK} stroke={i===1?'#94aba1':color} strokeWidth=".8"/>)}
    {route==='democracy'&&[.17,.35,.53,.71].map(u=><Plate key={u} face={inset(f.right,u,.30,.12,.12)} rows={3} color={color}/>)}
    {route==='reform'&&<Plate face={inset(f.right,.14,.54,.65,.11)} label="實驗室開放" rows={0} color={color}/>}
    {route==='gouxiong'&&<g><path d={path([at(f.left,.05,.04),at(f.left,.95,.04)])} stroke={color} strokeWidth=".7"/>{[.1,.2,.3,.4,.5,.6,.7,.8,.9].map((u,i)=>{const p=at(f.left,u,.04);return <circle key={u} className="campus-festoon" style={{animationDelay:`-${i*.8}s`}} cx={p.x} cy={p.y+5} r="1.7" fill={color}/>;})}</g>}
    {route==='jidi_riot'&&<><Fire x={540} y={236} scale={1.15}/><Fire x={999} y={358} scale={.7}/><path d={path([at(f.left,.31,.35),at(f.left,.38,.35),at(f.left,.40,.41),at(f.left,.33,.49)])} stroke="#9d7863" fill="none" strokeWidth="1.4"/></>}
  </g>;
}
