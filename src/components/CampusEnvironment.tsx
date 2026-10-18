import { HORIZON, INK, EDGE, BLACK, path, at, inset, geometry, FaceLines, Plate, Box, Observe, Wheel, Bicycle, Bench, Table, Kiosk, Canopy, Cone, Barrier, Fire, SmallFigure, Flag, Chair, Van, Speaker, streetPoint, type Point, type Face, type Observation } from './campusPrimitives';
import CampusRouteDiorama from './CampusRouteDiorama';
export { default as CampusArchitecturalEngraving } from './CampusArchitecture';
import type { HeyiLightSnapshot, HeyiRoute, HeyiZone, UprisingStage } from '../engine/heyiLight';
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
      {route==='uprising'&&<g className="campus-uprising-gate"><Flag x={373} y={326} color="#ca8673" small/><Flag x={797} y={320} color="#ca8673" small/></g>}
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
      {route==='uprising'&&<Plate face={inset(face,.65,.77,.24,.15)} label="各班聯絡" rows={1} color="#c5a989"/>}
    </Observe>
  </g>;
}

export function CampusGuard({observation}:{observation:Observation}) {
  const {route}=observation.snapshot;const wreck=route==='jidi_riot';
  return <Observe zone="guard" anchor={{x:208,y:418}} observation={observation}>
    <Box x={306} y={494} h={166} left={222} right={35}>{f=><>
      <Plate face={inset(f.left,.04,.025,.92,.12)} label={route==='wu'?'勤务室':route==='uprising'?'糾察崗':route==='revolution'?'保卫组':route==='gouxiong'?'值班管理员':'门卫室'} rows={0}/>
      {[.09,.53].map((u,i)=>{const win=inset(f.left,u,.25,.37,.43);return <g key={u}><path d={path(win,true)} fill={BLACK} stroke={INK}/><FaceLines face={win} rows={1} columns={1}/>{wreck?<path d={path([at(win,0,0),at(win,.52,.56),at(win,.28,1)])+path([at(win,1,0),at(win,.4,.55),at(win,1,1)])} stroke="#b78573" fill="none"/>:<><path className="heyi-window__light" d={path(inset(win,.03,.06,.44,.39),true)} fill={route==='wu'?'#93b2b4':'#aa9564'} opacity=".18"/><path d={path([at(win,.06,.78),at(win,.95,.78)])} stroke="#879e99"/><path d={path(inset(win,.18,.55,.44,.20),true)} fill="none" stroke={EDGE}/>{i===0&&route!=='despair'&&<SmallFigure x={at(win,.70,.78).x} y={at(win,.70,.78).y} role="teacher" pose="sit"/>}</>}</g>;})}
      <FaceLines face={inset(f.left,.04,.8,.93,.18)} rows={2}/>
      <Plate face={inset(f.right,.15,.22,.70,.70)} rows={2}/>
      <path d={path(inset(f.right,.32,.36,.22,.45),true)} fill="none" stroke={INK}/>
      <path d={path(inset(f.roof,.05,.2,.84,.1),true)} fill="none" stroke={EDGE}/>
    </>}</Box>
    <path d="M84 468L306 507L341 503M84 475L306 515L341 510" fill="none" stroke={INK} strokeWidth=".8"/>
    {route==='jidi'&&<Kiosk x={337} y={500} label="扫码" screen color="#c1ae7e"/>}
    {route==='wu'&&<g><path d="M321 310v-56l38 7" fill="none" stroke={INK}/><path d="M345 254l22 5-5 10-23-6Z" fill={BLACK} stroke={INK}/><circle cx="358" cy="263" r="2" fill="#b87468"/><Plate face={geometry(100,478,42,36,6).left} label="证件" rows={0}/></g>}
    {route==='despair'&&<path d="M99 375l70 75m-58-3 59-78" stroke="#ac8c73" strokeWidth="2"/>}
    {wreck&&<path d="M132 474l27 4 3 9-28-3m85-56 15 2-4 15-19-3" fill={BLACK} stroke="#a18e77"/>}
    {route==='uprising'&&<><Plate face={geometry(342,489,60,30,7).left} label="輪值" color="#c5a989" rows={3}/><SmallFigure x={338} y={513} role="steward" pose="talk"/></>}
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

export function CampusBuildingDetails({route,stage}:{route:HeyiRoute;stage?:UprisingStage}) {
  const f=geometry(720,435,360,640,440);
  const titles:Record<HeyiRoute,string>={opening:'新學期',uprising:stage==='assembly'?'學生代表大會':stage==='committee'?'聯合革命委員會':'B3臨時聯絡處',democracy:'學生代表選舉',revolution:'臨時委員會',reform:'互助學習與課程改革',haobang:'各派聯席會議',yang:'教學與職稱評審',jidi:'升學衝刺',jidi_riot:'緊急疏散',gouxiong:'校園文化週',wu:'校園秩序公報',despair:'暫停使用'};
  const colors:Record<HeyiRoute,string>={opening:'#afa98e',uprising:'#cb9d81',democracy:'#9dbaa7',revolution:'#b97e6f',reform:'#afbb94',haobang:'#bca483',yang:'#bdaa8b',jidi:'#c6b580',jidi_riot:'#c38e73',gouxiong:'#b4a0b8',wu:'#aab9b7',despair:'#aa998a'};
  const color=colors[route];
  return <g className="campus-building-details" data-route={route}>
    <Plate face={inset(f.left,.10,.239,.66,.049)} label={titles[route]} rows={0} color={color}/>
    {route==='uprising'&&<>
      <Plate face={inset(f.left,.13,.474,.72,.052)} label="團結各班　保衛校園" rows={0} color="#bd7d6c"/>
      <Plate face={inset(f.right,.13,.474,.71,.052)} label={stage==='assembly'?'代表在此開會':'广播與聯絡'} rows={0} color={color}/>
      <Flag x={714} y={91} color="#cf8d79" small/>
      {[[f.left,.84],[f.right,.12]].map(([face,u],i)=>{const p=at(face as Face,u as number,.475);return <g key={i}><path d={`M${p.x} ${p.y}l-3-12m3 1 18 3-1 8-18-3Z`} fill={BLACK} stroke={INK} strokeWidth=".7"/><path className="campus-broadcast" d={`M${p.x+20} ${p.y-9}q7 5 0 11m4-15q12 9 0 19`} stroke={color} fill="none" strokeWidth=".7"/></g>;})}
      {[6,3].map((col,i)=>{const win=inset(f.left,1-(col+.8)/9,.055,.62/9,.165),p=at(win,.5,1.35),clip=`uprising-window-${i}`;return <g key={col}>
        <defs><clipPath id={clip}><path d={path(inset(win,.025,.025,.95,.95),true)}/></clipPath></defs>
        <g clipPath={`url(#${clip})`}><SmallFigure x={p.x} y={p.y} role={i?'teacher':'steward'} pose="talk"/></g>
        <path d={path([at(win,.5,0),at(win,.5,1)])+path([at(win,0,.5),at(win,1,.5)])} stroke="#739a9f" strokeWidth=".7" fill="none"/>
      </g>;})}
    </>}
    {route==='jidi'&&<><Plate face={inset(f.right,.13,.53,.67,.17)} label="C9 / 985" color={color} rows={3} lit/>{Array.from({length:12},(_,i)=><path key={i} d={path([at(f.right,.15+i*.053,.74),at(f.right,.15+i*.053,.87)])} stroke={color} strokeWidth={i%3?1:2.5}/>)}</>}
    {route==='yang'&&(()=>{const win=inset(f.left,1-7.8/9,.055,.62/9,.165);return <g>
      <path d={path(win,true)} fill="#03090d" stroke="#c4bda2" strokeWidth="1"/>
      <path className="heyi-window__light" d={path(inset(win,.04,.04,.92,.92),true)} fill="#b19967" opacity=".35"/>
      <path d={path([at(win,.5,0),at(win,.5,1)])+path([at(win,0,.5),at(win,1,.5)])} stroke={EDGE} fill="none"/>
      <path d={path([at(win,.12,.79),at(win,.87,.79)])} stroke="#bcb394"/>
      <path d={path(inset(win,.32,.48,.34,.29),true)} fill={BLACK} stroke={EDGE}/>
    </g>;})()}
    {route==='wu'&&[.10,.8].map((u,i)=>{const p=at(i?f.right:f.left,u,.47);return <g key={i}><path d={`M${p.x} ${p.y}v-11l20 4M${p.x+14} ${p.y-13}l18 4-3 7-18-4Z`} fill={BLACK} stroke={INK} strokeWidth=".8"/><circle cx={p.x+29} cy={p.y-5} r="1.5" fill="#a87164"/></g>;})}
    {(route==='despair'||route==='jidi_riot')&&[f.left,f.right].map((face,side)=><g key={side}>
      {Array.from({length:side?6:9},(_,i)=>{const n=side?6:9,u=side?(i+.18)/n:1-(i+.80)/n,v=.055+2*.242,w=.62/n,h=.165;const win=inset(face,u,v,w,h);return <g key={i}>
        <path d={path(inset(face,u-.014,v-.008,w+.028,h+.038),true)} fill="#060e12"/>
        <path d={path(win,true)} fill="#02080b" stroke="#8e9a8c" strokeWidth=".8"/>
        <path d={path([at(win,.5,0),at(win,.5,1)])} stroke={EDGE} strokeWidth=".6"/>
        {route==='despair'?<><path d={path([at(win,.04,.06),at(win,.96,.94)])} stroke="#9e8a72" strokeWidth="2"/><path d={path([at(win,.04,.88),at(win,.96,.10)])} stroke="#9e8a72" strokeWidth="1.6"/></>:<path d={path([at(win,.07,0),at(win,.52,.44),at(win,.21,.73),at(win,.66,1)])} stroke="#a68d79" fill="none"/>}
        <path d={path([at(win,-.1,1.08),at(win,1.1,1.08)])} stroke="#8e9a8c" strokeWidth=".7"/>
      </g>;})}
    </g>)}
    {route==='revolution'&&<><Flag x={218} y={123} small/><Flag x={879} y={97} small/><path d={path([at(f.left,.09,.04),at(f.left,.2,.04),at(f.left,.16,.22),at(f.left,.12,.19)],true)} fill={BLACK} stroke={color}/></>}
    {route==='haobang'&&[.33,.43,.53].map((u,i)=><path key={i} d={path([at(f.left,u,.355),at(f.left,u+.03,.355),at(f.left,u+.018,.435),at(f.left,u,.423)],true)} fill={BLACK} stroke={i===1?'#94aba1':color} strokeWidth=".8"/>)}
    {route==='democracy'&&[.17,.35,.53,.71].map(u=><Plate key={u} face={inset(f.right,u,.30,.12,.12)} rows={3} color={color}/>)}
    {route==='reform'&&<Plate face={inset(f.right,.14,.54,.65,.11)} label="實驗室開放" rows={0} color={color}/>}
    {route==='gouxiong'&&<g><path d={path([at(f.left,.05,.04),at(f.left,.95,.04)])} stroke={color} strokeWidth=".7"/>{[.1,.2,.3,.4,.5,.6,.7,.8,.9].map((u,i)=>{const p=at(f.left,u,.04);return <circle key={u} className="campus-festoon" style={{animationDelay:`-${i*.8}s`}} cx={p.x} cy={p.y+5} r="1.7" fill={color}/>;})}</g>}
    {route==='jidi_riot'&&<><Fire x={540} y={236} scale={1.15}/><Fire x={999} y={358} scale={.7}/><path d={path([at(f.left,.31,.35),at(f.left,.38,.35),at(f.left,.40,.41),at(f.left,.33,.49)])} stroke="#9d7863" fill="none" strokeWidth="1.4"/></>}
  </g>;
}
