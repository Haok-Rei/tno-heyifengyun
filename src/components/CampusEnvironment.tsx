import { HORIZON, INK, EDGE, BLACK, path, at, inset, geometry, FaceLines, Plate, Box, Observe, Bicycle, Bench, Barrier, SmallFigure, streetPoint, type Point, type Face, type Observation } from './campusPrimitives';
import CampusRouteDiorama from './CampusRouteDiorama';
import type { CampusBranch } from '../engine/campusArt';

// Ground edges and street furniture share the same horizon and vanishing points.
function streetLine(y:number) { return [streetPoint(-500,y),{x:800,y},streetPoint(1700,y)]; }
function acrossStreet(p:Point,targetY:number):Point {
  const own=p.x<800?-1200:2300,other=p.x<800?2300:-1200;
  const a=(targetY-HORIZON)/(800-own),b=(p.y-HORIZON)/(p.x-other);
  const x=(a*own-b*other)/(a-b);
  return {x,y:HORIZON+a*(x-own)};
}
export function CampusGround({observation}:{observation:Observation}) {
  const {route,mood}=observation.snapshot;
  const ruined=route==='jidi_riot'||route==='despair';
  const curb=streetLine(566), inner=streetLine(526), road=streetLine(582);
  const strip=[...curb,...inner.slice().reverse()];
  const crossLeft=streetPoint(390,603),crossRight=streetPoint(775,603);
  const crossings:Face=[crossLeft,crossRight,acrossStreet(crossRight,728),acrossStreet(crossLeft,728)];
  return <Observe zone="road" anchor={{x:610,y:635}} observation={observation}>
    <path d={path([{x:-500,y:340},{x:720,y:435},{x:1700,y:335},...inner.slice().reverse()],true)} fill="#070e11"/>
    <path d={path([...curb,{x:1700,y:700},{x:-500,y:700}],true)} fill="#060e12"/>
    <path d={path(strip,true)} fill="#0b1518" stroke={EDGE} strokeWidth=".7"/>
    <defs><clipPath id="campus-walkway"><path d={path(strip,true)}/></clipPath></defs>
    <g clipPath="url(#campus-walkway)" fill="none" stroke="#425c61" strokeWidth=".55">
      {[536,546,556].map(y=><path key={y} d={path(streetLine(y))}/>)}
      {Array.from({length:21},(_,i)=>{const p=streetPoint(-460+i*103,526);return <path key={i} d={path([p,acrossStreet(p,566)])}/>;})}
    </g>
    <path d={path(curb)} stroke={INK} strokeWidth="1" fill="none"/>
    <path d={path(road)} stroke={EDGE} strokeWidth=".7" fill="none"/>
    <path d={path(streetLine(662))} stroke="#aaab93" strokeWidth=".8" strokeDasharray="44 22" fill="none"/>
    {Array.from({length:7},(_,i)=><path key={i} d={path(inset(crossings,i/7,.03,.048,.94),true)} fill={ruined?'#34413c':'#7b8880'} opacity=".55"/>)}
    <ellipse cx="211" cy="617" rx="28" ry="9" fill={BLACK} stroke={INK} strokeWidth=".8"/>
    <ellipse cx="211" cy="617" rx="24" ry="6.5" fill="none" stroke={EDGE} strokeWidth=".6"/>
    <path d="M191 615l39 2m-36 3 33-1m-24-9v13m10-12v12" stroke={EDGE} strokeWidth=".55" fill="none"/>
    {(mood==='weary'||ruined)&&<g className="campus-puddle" fill="#101b1d" stroke="#667a7b" strokeWidth=".7"><path d="M83 573q57-11 105 2l-13 6-71 5-24-6Z"/><path d="M821 628q43-12 94-2l44 9-39 10-91-5Z"/></g>}
    {ruined&&Array.from({length:14},(_,i)=>{const x=160+(i*137)%900,y=595+(i*43)%94;return <path key={i} d={`M${x} ${y}l${i%2?11:-9}-4 5 9-13 1Z`} fill={BLACK} stroke={i%3===0?'#b19a7c':'#7b9697'} strokeWidth=".65"/>;})}
    {route==='gouxiong'&&<g fill="none" stroke="#b699ac" strokeWidth="1"><ellipse cx="933" cy="618" rx="40" ry="14"/><path d="M915 615v-4m32 1v4m-26 6q13 7 23 0"/></g>}
    {route==='wu'&&<path d={path(streetLine(600))+path(streetLine(607))} stroke="#b8a678" strokeWidth="1" fill="none"/>}
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
    {route==='uprising'&&<g><path className="heyi-cloth" d="M1090 336l7 1-2 45-7-8Z" fill="#301717" stroke="#c58c76" strokeWidth=".8"/><Plate face={geometry(1086,404,31,29,6).left} label="聯絡" rows={2} color="#c4b292"/><path d="M1057 312l13 2 3 18-15-3Zm2 5 9 2m-8 4 9 2M1120 294l14 2-4 17-15-2Zm0 5 9 1m-11 4 9 2" fill={BLACK} stroke="#b5a88c" strokeWidth=".6"/></g>}
    {route==='gouxiong'&&<g><path d="M1045 280l14 58m49-57 14 60" stroke={EDGE}/><Plate face={geometry(1068,357,29,27,5).left} label="社团" rows={0}/><Plate face={geometry(1140,359,29,27,5).left} label="演出" rows={0}/></g>}
    {month>=8&&month<=10&&!trimmed&&!damaged&&[0,1,2,3].map(i=><path key={i} className="heyi-falling-leaf" style={{animationDelay:`-${i*2.3}s`}} d={`M${1034+i*35} ${300+i%2*12}q7-6 11 0q-5 7-11 0`} fill={BLACK} stroke="#b89f74" strokeWidth=".8"/>)}
    {mood==='bright'&&<g fill="none" stroke="#98aa8a" strokeWidth=".7"><path d="M1055 470q-12-14-9-21m13 21q6-14 11-15m41 19q9-18 17-11m-14 11-4-19"/></g>}
  </Observe>;
}

export function CampusEdges({observation}:{observation:Observation}) {
  const {route,mood}=observation.snapshot;
  const damaged=route==='despair'||route==='jidi_riot';
  const boundary=geometry(800,520,26,1300,900);
  const walls=[inset(boundary.left,0,0,.655,1),inset(boundary.right,.032,0,.968,1)];
  return <g className="campus-street-edges">
    <Observe zone="road" anchor={{x:30,y:482}} observation={observation}>
      {walls.map((wall,i)=><g key={i}>
        <path d={path(wall,true)} fill={BLACK} stroke={EDGE} strokeWidth=".8"/>
        <FaceLines face={wall} rows={2} columns={14} color="#425b5b"/>
        <path d={path([wall[0],wall[1]])} stroke={INK} strokeWidth="1"/>
        {damaged&&<path d={path([at(wall,.48,0),at(wall,.50,.4),at(wall,.49,.8)])} stroke="#968775" fill="none" strokeWidth=".7"/>}
      </g>)}
      {[-45,1320].map((x,i)=>{
        const y=streetPoint(x,495).y;
        const f=geometry(x,y,52,i?115:110,i?42:60),wall=i?f.left:f.right;
        return <g key={x}>
          <path d={path(wall,true)} fill={BLACK} stroke={EDGE} strokeWidth=".75"/>
          <FaceLines face={wall} rows={3} columns={7} color="#425b5b"/>
          <path d={path(f.roof,true)} fill="#101a1a" stroke="#929981" strokeWidth=".6"/>
          {!damaged&&[.12,.3,.48,.66,.84].map(u=>{
            const q=at(wall,u,0),height=16+(i?u:1-u)*8;
            return <g key={u}><path d={`M${q.x-8} ${q.y}q-8-8-3-${height/2}q-3-10 5-${height/2}q7-6 12 3q12-1 9 9q9 7-2 14`} stroke={mood==='bright'?'#81927b':'#60776b'} fill={BLACK} strokeWidth=".65"/><path d={`M${q.x} ${q.y}v-${height*.68}m0 5-5-4m5 9 7-5`} stroke={EDGE} fill="none" strokeWidth=".5"/></g>;
          })}
        </g>;
      })}
      <Bench x={-40} y={streetPoint(-40,548).y} broken={damaged}/>
      <Bicycle x={-115} y={streetPoint(-115,586).y} fallen={damaged}/>
      <Box x={1288} y={streetPoint(1288,553).y} h={62} left={48} right={14}>{f=><><Plate face={inset(f.left,.08,.09,.82,.76)} label={route==='wu'?'門禁':damaged?'停用':'公交'} rows={2} color="#a4b4a5"/><path d={path(inset(f.right,.15,.1,.65,.6),true)} stroke={EDGE} fill="none"/></>}</Box>
      <Bicycle x={1330} y={streetPoint(1330,604).y} fallen={damaged}/>
      {!damaged&&<SmallFigure x={1221} y={streetPoint(1221,574).y} role="teacher"/>}
      {route==='wu'&&<Barrier x={-77} y={streetPoint(-77,585).y} width={72}/>}
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
      <Box x={972} y={510} h={105} left={127} right={13}>{f=><Plate face={inset(f.left,.05,.08,.90,.85)} label={{opening:'校務公告',uprising:observation.snapshot.uprisingStage==='assembly'?'大會議程':observation.snapshot.uprisingStage==='committee'?'聯合公報':'革命告示',democracy:'議事日程',revolution:'臨時公報',reform:'課程徵集',haobang:'聯席會議',yang:'教師評審',jidi:'升學指標',jidi_riot:'緊急疏散',gouxiong:'社團活動',wu:'通行條例',despair:'停止開放'}[route]} color={observation.snapshot.accent}/>}</Box>
      <path d="M875 516v19m94-11v17" stroke={INK}/>
    </Observe>
  </g>;
}

export function CampusRouteObjects({observation,chapter,branch}:{observation:Observation;chapter:0|1|2;branch?:CampusBranch}) {
  return <Observe zone={observation.snapshot.route==='yang'?'teachers':'students'} anchor={{x:280,y:543}} observation={observation}><g className="campus-route-scene" data-route={observation.snapshot.route}><CampusRouteDiorama route={observation.snapshot.route} stage={observation.snapshot.uprisingStage} chapter={chapter} branch={branch}/></g></Observe>;
}
