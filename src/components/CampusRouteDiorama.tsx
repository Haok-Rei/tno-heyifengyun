import { memo } from 'react';
import type { HeyiRoute,UprisingStage } from '../engine/heyiLight';
import type { CampusBranch } from '../engine/campusArt';
import { HORIZON, INK, EDGE, BLACK, path, at, inset, geometry, FaceLines, Plate, Box, Observe, Wheel, Bicycle, Bench, Table, Kiosk, Canopy, Cone, Barrier, Fire, SmallFigure, Flag, Chair, Van, Speaker, streetPoint, type Point, type Face, type Observation } from './campusPrimitives';

function RouteStreetSceneA({route,stage,chapter}:{route:HeyiRoute;stage?:UprisingStage;chapter:0|1|2}){
  // 阶段优先取 uprisingStage，否则取 chapter；非 uprising 路线只认 chapter。
  const up = route==='uprising' ? (stage==='barricades'?0:stage==='committee'?1:stage==='assembly'?2:chapter) : chapter;
  const ch = Math.max(0,Math.min(2,up)) as 0|1|2;
  const ink='#b9c6ba', edge='#60838b', dry='#bda47a', blood='#823b37', ivy='#7f8f83', violet='#8a7f93';
  const paperInk='#c9cec2';
  // 局部 helper：细线纸张堆
  const Stack=({x,y,n=5,w=30,skew=.12,color=ink}:{x:number;y:number;n?:number;w?:number;skew?:number;color?:string})=>(
    <g>{Array.from({length:n},(_,i)=>{
      const yy=y-i*2.2, xx=x+(i%2?2:-2), ww=w-(i%3)*3;
      return <g key={i}>
        <path d={`M${xx} ${yy}l${ww} ${-skew*6}l${ww*0.12} ${4+i%2}l${-ww} ${skew*6}Z`} fill={BLACK} stroke={color||ink} strokeWidth=".5"/>
        <path d={`M${xx+4} ${yy+1}l${ww*.7} -2`} stroke={edge} strokeWidth=".35" opacity=".7"/>
      </g>;} )}</g>);
  // 局部 helper：铰链
  // 线缆/绳
  const Cable=({d,color=edge,width=.6}:{d:string;color?:string;width?:number})=>(
    <path d={d} fill="none" stroke={color} strokeWidth={width}/>);
  // 手推车
  const Trolley=({x,y,loaded=true,color=ink}:{x:number;y:number;loaded?:boolean;color?:string})=>(
    <g transform={`translate(${x} ${y})`}>
      <path d="M-26 0  -34-30 12-34 20-2Z" fill={BLACK} stroke={color||ink} strokeWidth=".9"/>
      <path d="M-34-30 18-34M-28-8 14-12M-24-14 18-18M-20-20 18-24" stroke={edge} strokeWidth=".5" fill="none"/>
      <Wheel x={-22} y={2} r={7}/><Wheel x={12} y={2} r={7}/>
      <path d="M12-34l9-9M21-43V-52" stroke={color||ink} strokeWidth=".8" fill="none"/>
      {loaded&&<Stack x={-20} y={-28} n={4} w={24} color={color||ink}/>}
    </g>);
  // 讲台/箱
  const Podium=({x,y,label,color=ink}:{x:number;y:number;label?:string;color?:string})=>(
    <Box x={x} y={y} h={34} left={54} right={26} color={color||ink}>{f=><>
      {label?<Plate face={inset(f.left,.10,.15,.78,.58)} label={label} rows={0} color={color||ink}/>:<FaceLines face={f.left} rows={2}/>}
      <FaceLines face={f.right} rows={4}/></>}</Box>);
  switch(route){
    case 'opening': return <g className="campus-opening" data-ch={ch}>
      <Canopy x={252} y={559} label={ch===0?'早點':ch===1?'咨詢':'夜宵'} color="#b6aa89"/>
      <Table x={241} y={548} items="flowers"/>
      <Box x={171} y={540} h={42} left={40} right={17}>{f=><>
        <FaceLines face={f.left} rows={5}/>
        <ellipse cx="161" cy="498" rx="18" ry="5" fill={BLACK} stroke={ink}/>
        <Cable d="M153 492q-6-12 2-17q7-9 0-18m10 34q8-10 1-18" color={edge}/>
        {ch===0&&<path className="campus-steam" d="M150 492q-5-10 1-16m6 32q7-9 1-16" fill="none" stroke={edge}/>}
      </>}</Box>
      <Trolley x={90} y={591} loaded={ch<2} color={dry}/>
      <Bicycle x={123} y={585}/>{ch>0&&<Bicycle x={182} y={593}/>}
      <SmallFigure x={233} y={536} role="teacher"/>
      <SmallFigure x={286} y={564} pose={ch===2?'talk':'carry'}/>
      {ch>=1&&<Podium x={300} y={566} label={ch===1?'值班':'課程'} color={dry}/>}
      {ch===2&&<Chair x={272} y={560}/>}
      {ch===1&&<Stack x={248} y={545} n={3} w={20}/>}
      <g transform="translate(1110 574)"><Van x={0} y={0}/>
        {ch<2&&<SmallFigure x={-40} y={10} role="teacher"/>}{ch>0&&<SmallFigure x={-22} y={4} pose="carry"/>}
      </g>
      {ch===2&&<><Box x={1004} y={586} h={20} left={30} right={14} rows={3}/><SmallFigure x={1046} y={588} pose="carry"/></>}
      <Cable d="M82 618q20-3 40-2" color={edge}/>
    </g>;
    case 'uprising': return <g className="campus-uprising" data-stage={stage} data-ch={ch}>
      {/* 左：桌面/临时指挥/联络 */}
      {ch===0?<g>
        <Barrier x={196} y={594} width={110}/><Barrier x={300} y={600} width={90}/>
        <Table x={248} y={553} label="传单" items="papers"/>
        <Box x={176} y={578} h={30} left={40} right={20} rows={3}>{f=><Plate face={inset(f.left,.14,.2,.72,.58)} label="油印" rows={0} color={dry}/>}</Box>
        <Speaker x={312} y={563}/><Chair x={200} y={560}/>
        <SmallFigure x={236} y={536} pose="sit"/><SmallFigure x={278} y={572} role="steward" pose="talk"/>
        <Trolley x={98} y={604} loaded color={blood}/>
        <SmallFigure x={160} y={590} pose="carry"/>
        <Cable d="M322 500q8 6 0 14m4-18q14 9 0 22" color={dry}/>
      </g>:ch===1?<g>
        <Box x={206} y={566} h={58} left={70} right={26} rows={4}>{f=><>
          <Plate face={inset(f.left,.06,.08,.86,.66)} label="革委" color={dry} rows={2}/>
          <FaceLines face={f.right} rows={5}/>
          <path d={path(inset(f.left,.22,.4,.36,.22),true)} fill="none" stroke={edge}/>
        </>}</Box>
        <Table x={300} y={560} label="联络" items="papers"/>
        <Stack x={264} y={536} n={6} w={26}/><Stack x={290} y={528} n={3} w={18} skew={.05}/>
        <Chair x={236} y={556}/><SmallFigure x={248} y={530} pose="sit"/>
        <SmallFigure x={296} y={576} role="steward" pose="talk"/>
        <Bicycle x={114} y={588}/><SmallFigure x={158} y={588} pose="carry"/>
        <Cable d="M336 528q30 4 60 0" color={edge}/>
      </g>:<g>
        <Podium x={264} y={566} label="议案" color={dry}/>
        <Table x={196} y={556} label="登记" items="ballot"/>
        <Chair x={226} y={552}/><Chair x={304} y={558}/>
        <SmallFigure x={240} y={526} role="steward" pose="talk"/>
        <SmallFigure x={302} y={546} pose="talk"/>
        <SmallFigure x={172} y={564} pose="sit"/>
        <Flag x={124} y={566} color={blood}/>
        <Stack x={286} y={538} n={4} w={22}/>
        <Trolley x={94} y={608} loaded color={blood}/>
      </g>}
      {/* 右：登记/代表/值班 */}
      {ch===0?<g>
        <Table x={1133} y={565} label="各班联络" items="papers"/>
        <Chair x={1097} y={561}/><SmallFigure x={1110} y={548} role="steward" pose="sit"/>
        <SmallFigure x={1056} y={582} pose="talk"/><SmallFigure x={1088} y={588} role="teacher" pose="talk"/>
        <Flag x={1182} y={560} color={blood} small/>
        <Bench x={1056} y={542}/>
        <Stack x={1096} y={530} n={3} w={26}/>
      </g>:ch===1?<g>
        <Table x={1090} y={560} label="简报" items="printer"/>
        <Chair x={1130} y={566}/><Chair x={1050} y={552}/>
        <SmallFigure x={1066} y={546} role="teacher" pose="sit"/>
        <SmallFigure x={1114} y={576} pose="carry"/>
        <Box x={970} y={592} h={22} left={44} right={20} rows={4}/>
        <Cable d="M1006 590q26-6 52-2" color={edge}/>
      </g>:<g>
        <Table x={1130} y={558} label="代表登记" items="ballot"/>
        <Chair x={1082} y={552}/><Chair x={1160} y={566}/>
        <SmallFigure x={1100} y={542} role="teacher" pose="talk"/>
        <SmallFigure x={1150} y={570} pose="talk"/>
        <Flag x={1018} y={556} color={blood} small/>
        <Trolley x={980} y={604} loaded={false} color={dry}/>
      </g>}
      <path d="M199 636l27-2 10 4-28 3M1140 625l21 3-8 5-23-4" fill={BLACK} stroke={dry} strokeWidth=".6"/>
    </g>;
    case 'democracy': return <g className="campus-democracy" data-ch={ch}>
      {ch===0?<g>
        <Canopy x={286} y={568} label="學生議事" color="#9bbb9e"/>
        <Table x={258} y={555} items="papers" label="公開辯論"/>
        <Kiosk x={154} y={569} label="意見徵集" color="#a2c6b0"/>
        <SmallFigure x={208} y={552} pose="talk"/>
        <SmallFigure x={301} y={581} pose="carry"/>
        <Stack x={230} y={532} n={4} w={24}/>
        <Cable d="M292 438Q483 416 703 391" color="#8bac91"/>
      </g>:ch===1?<g>
        <Canopy x={286} y={568} label="投票" color="#9bbb9e"/>
        <Table x={258} y={555} items="ballot" label="封条"/>
        <Kiosk x={154} y={569} label="监票" color="#a2c6b0"/>
        {/* 排队：小而密集但不遮挡中门 */}
        {[208,232,254].map((x,i)=><SmallFigure key={x} x={x} y={562+i*2} pose={i===1?'talk':'stand'}/>)}
        <SmallFigure x={304} y={581} role="steward"/>
        <path d="M240 522q30 4 60 1" stroke="#bda47a" fill="none" strokeWidth=".7"/>
        <path d="M250 524v6m22-6v6m22-6v6" stroke="#bda47a" strokeWidth=".6"/>
      </g>:<g>
        <Canopy x={286} y={568} label="议事开放" color="#9bbb9e"/>
        <Table x={258} y={555} items="papers" label="社团登记"/>
        <Kiosk x={154} y={569} label="阅读" color="#a2c6b0"/>
        <Bench x={176} y={552}/>
        <SmallFigure x={212} y={546} pose="sit"/>
        <SmallFigure x={266} y={536} role="teacher" pose="talk"/>
        <Stack x={236} y={528} n={3} w={22}/>
      </g>}
      <Table x={1086} y={555} items="papers" label={ch===2?'议事桌':'议事记录'}/>
      <Chair x={1130} y={568}/><Chair x={1050} y={549}/>
      <Bench x={997} y={552}/>
      {ch>0&&<Bicycle x={1148} y={596}/>}
      <SmallFigure x={1060} y={568} role="teacher" pose="talk"/>
      <SmallFigure x={1103} y={568} pose={ch===0?'sit':'stand'}/>
      {ch===2&&<SmallFigure x={1168} y={572} role="steward"/>}
      {ch===1&&<path d="M1116 548a12 9 0 1 0 0 .1" fill="none" stroke="#bda47a"/>}
    </g>;
    case 'revolution': return <g className="campus-revolution" data-ch={ch}>
      {ch===0?<g>
        <Flag x={115} y={561}/><Flag x={292} y={570} small/>
        <Table x={237} y={552} items="printer" label="互助印刷"/>
        <Box x={186} y={587} h={27} left={47} right={22} rows={3}/>
        <Box x={124} y={581} h={22} left={40} right={20} rows={3}/>
        <SmallFigure x={236} y={537} role="steward" pose="carry"/>
        <SmallFigure x={313} y={574} pose="talk"/>
      </g>:ch===1?<g>
        <Flag x={115} y={561}/>
        <Table x={237} y={552} label="教辅公共印刷" items="printer"/>
        <Stack x={206} y={536} n={7} w={30}/><Stack x={238} y={528} n={4} w={22} skew={.06}/>
        <Trolley x={100} y={602} loaded color={dry}/>
        <SmallFigure x={172} y={588} pose="carry"/>
        <SmallFigure x={292} y={568} role="steward"/>
        <Cable d="M182 620q50-4 100 2" color={edge}/>
        <Box x={186} y={587} h={27} left={47} right={22} rows={3}/>
      </g>:<g>
        <Table x={262} y={560} label="公共书架" items="books"/>
        <Box x={186} y={560} h={44} left={70} right={26} rows={3}>{f=><>
          <FaceLines face={f.left} rows={2}/>
          {[.2,.35,.5,.65,.8].map(u=><path key={u} d={path([at(f.left,u,.06),at(f.left,u,.96)])} stroke={ivy} strokeWidth="1.6"/>)}
        </>}</Box>
        <Stack x={300} y={540} n={4} w={24}/>
        <SmallFigure x={226} y={548} pose="talk"/>
        <SmallFigure x={308} y={578} pose="carry"/>
        <Flag x={124} y={566} small/>
      </g>}
      <Kiosk x={976} y={558} label={ch===2?'成果':'临时公报'} color="#c49785"/>
      <Box x={1136} y={561} h={45} left={80} right={35} rows={4}>{f=><Plate face={inset(f.left,.12,.14,.73,.63)} label={ch===2?'修缮':'会场'} rows={0} color="#c49785"/>}</Box>
      {ch>0&&<Flag x={1136} y={517}/>}
      <SmallFigure x={1088} y={558} pose="talk"/><SmallFigure x={1123} y={518} role="teacher" pose="talk"/>
      {ch===2&&<><Bench x={1082} y={558}/><SmallFigure x={1114} y={556} pose="sit"/></>}
      <path d="M968 617l-57-9 14-5m-14 5 14 7M182 617l94-4-15-6m15 6-15 8" stroke="#bd8c79" strokeWidth="1" fill="none"/>
    </g>;
    case 'yang': return <g className="campus-yang" data-ch={ch}>
      {ch===0?<g>
        <Kiosk x={212} y={559} label="名师评审" color="#bdaa85"/>
        <Box x={298} y={558} h={104} left={71} right={24}>{f=><>
          <Plate face={inset(f.left,.08,.08,.84,.75)} label="荣誉栏" color="#c5b692" rows={0}/>
          <path d={path(inset(f.left,.20,.4,.23,.3),true)} fill="none" stroke={edge}/>
          <path d={path(inset(f.left,.56,.4,.23,.3),true)} fill="none" stroke={edge}/>
          <path d={path([at(f.left,.26,.8),at(f.left,.75,.8)])} stroke="#ab9a7e"/>
        </>}</Box>
        <SmallFigure x={258} y={574} role="teacher"/>
      </g>:ch===1?<g>
        <Box x={298} y={558} h={104} left={71} right={24}>{f=><>
          <Plate face={inset(f.left,.08,.08,.84,.75)} label="批阅" color="#c5b692" rows={3}/>
          <path d={path(inset(f.left,.20,.4,.23,.3),true)} fill="none" stroke={edge}/>
          <path d={path([at(f.left,.26,.8),at(f.left,.75,.8)])} stroke="#ab9a7e"/>
        </>}</Box>
        <Stack x={248} y={556} n={6} w={28}/><Stack x={278} y={546} n={4} w={22} skew={.06}/>
        <SmallFigure x={266} y={556} role="teacher" pose="sit"/>
        <SmallFigure x={316} y={588} role="steward" pose="talk"/>
      </g>:<g>
        <Kiosk x={212} y={559} label="医药" color="#bdaa85"/>
        <Box x={298} y={558} h={104} left={71} right={24}>{f=><>
          <Plate face={inset(f.left,.10,.10,.78,.60)} label="空椅" color="#c5b692" rows={0}/>
          <path d={path(inset(f.left,.30,.72,.42,.18),true)} fill="none" stroke={edge}/>
        </>}</Box>
        <Chair x={274} y={570}/>
        <SmallFigure x={252} y={560} pose="sit"/>
      </g>}
      <Table x={1087} y={556} items={ch===2?'medical':'papers'} label={ch===2?'巡诊':'审核材料'}/>
      <Van x={1163} y={594} official/>
      <SmallFigure x={1047} y={562} role="teacher" pose="carry"/>
      {ch<2?<><SmallFigure x={1011} y={568} role="teacher" pose="carry"/><SmallFigure x={972} y={574} role="teacher" pose="carry"/></>:<SmallFigure x={1016} y={574} pose="talk"/>}
      <SmallFigure x={1128} y={566} role="teacher" pose="sit"/>
      <Box x={923} y={583} h={14} left={31} right={16} rows={4}/>
      {ch===2&&<path d="M1120 606q-40 10-120 6" stroke={edge} fill="none" strokeWidth=".6"/>}
    </g>;
    case 'jidi': return <g className="campus-jidi" data-ch={ch}>
      {ch===0?<g>
        <Kiosk x={228} y={565} label="实时排名" color="#c4b17f" screen/>
        <Box x={312} y={565} h={64} left={44} right={20}>{f=><><Plate face={inset(f.left,.08,.12,.85,.62)} label="07:00" color="#c4b17f" rows={0} lit/><FaceLines face={f.right} rows={6}/></>}</Box>
        <Table x={160} y={552} items="books" label="试销"/>
        <SmallFigure x={206} y={554} pose="talk"/>
        <SmallFigure x={300} y={582} pose="carry"/>
      </g>:ch===1?<g>
        <Kiosk x={228} y={565} label="配送" color="#c4b17f" screen/>
        {[915,962,1009].map((x,i)=><g key={x}><Box x={x} y={573-i*5} h={37} left={27} right={15}/><path d={`M${x-10} ${553-i*5}h9m-9 4h9`} stroke="#b9ab89"/></g>)}
        {[612,624,636].map(y=><path key={y} d={path([streetPoint(152,y),streetPoint(800,y),streetPoint(846,y)])} stroke="#887f63" strokeWidth=".65" fill="none"/>)}
        <Van x={1002} y={592}/>
        <SmallFigure x={866} y={574} pose="carry"/><SmallFigure x={908} y={568} pose="carry"/>
        <Trolley x={188} y={600} loaded color={dry}/>
        <Box x={1096} y={609} h={31} left={70} right={28} rows={6}/>
      </g>:<g>
        <Kiosk x={228} y={565} label="门禁" color="#c4b17f" screen/>
        <Box x={312} y={565} h={64} left={44} right={20}>{f=><><Plate face={inset(f.left,.08,.12,.85,.62)} label="23:40" color="#c4b17f" rows={0} lit/><FaceLines face={f.right} rows={6}/></>}</Box>
        <Barrier x={180} y={596} width={80}/>
        {[915,962].map((x,i)=><g key={x}><Box x={x} y={573-i*5} h={37} left={27} right={15}/><Stack x={x-18} y={538-i*4} n={3} w={18}/></g>)}
        <SmallFigure x={1108} y={567} role="teacher" pose="carry"/>
        <SmallFigure x={866} y={574} pose="carry"/>
        <Cable d="M930 600q40 6 80 0" color={edge}/>
      </g>}
      <Kiosk x={1118} y={562} label={ch===2?'教材流水线':'升学指标'} color="#c4b17f" screen/>
      {ch<2&&<SmallFigure x={1108} y={567} role="teacher" pose="carry"/>}
      {ch===2&&<><Trolley x={1060} y={606} loaded color={dry}/><SmallFigure x={1040} y={588} pose="carry"/></>}
    </g>;
    default: return null;
  }
}

function RouteStreetSceneB({route,stage,chapter,branch='standard'}:{route:HeyiRoute;stage?:UprisingStage;chapter:0|1|2;branch?:CampusBranch}){
  // ---- local helpers (no imports, reuse existing drawing primitives) ----
  function SidewalkCart({x,y,tilt=0,load='papers'}:{x:number;y:number;tilt?:number;load?:'papers'|'books'|'empty'}){
    return <g transform={`translate(${x} ${y}) rotate(${tilt})`} stroke={INK} fill="none" strokeWidth=".8">
      <path d="M-40 0v-26h66v26" stroke={INK}/>
      <path d="M-40-26l-6 10h78l-6-10Z" stroke={EDGE}/>
      <path d="M-33 0v10m20-10v10m20-10v10m-46-10h58" stroke={EDGE}/>
      <path d="M24-20l18 8m-16-14 14 6" stroke={EDGE}/>
      {load==='papers'&&<g stroke="#b7ad90" strokeWidth=".6">{Array.from({length:5},(_,i)=><path key={i} d={`M${-31+i*11} ${-25}l7 -6 8 2-2 7-9 2Z`} fill="#0b1316"/>)}</g>}
      {load==='books'&&<g stroke="#a5a58b" strokeWidth=".6">{Array.from({length:4},(_,i)=><path key={i} d={`M${-28+i*13} ${-25}h11v9h-11Z`} fill="#0a1316"/>)}</g>}
      <circle cx="-26" cy="13" r="7" stroke={INK}/><circle cx="14" cy="13" r="7" stroke={INK}/>
    </g>;
  }
  function Crate({x,y,w=34,h=20,open=false}:{x:number;y:number;w?:number;h?:number;open?:boolean}){
    return <g stroke={INK} fill={BLACK} strokeWidth=".8">
      <path d={`M${x} ${y}l${-w*.5} -6 h${w} l${-w*.5} 6 Z`} stroke={EDGE}/>
      <path d={`M${x-w*.5} ${y-6}v${h}l${w} 0 v${-h}M${x-w*.5} ${y-6}l0 ${h}M${x+w*.5} ${y-6}l0 ${h}`} fill="none"/>
      <path d={`M${x-w*.5} ${y-6}l${w*.5} 6 l${w*.5} -6`} stroke={EDGE}/>
      {open&&<path d={`M${x-w*.5} ${y-6}l${w*.3} -8 l${w*.4} 6 Z`} stroke="#b9ad8f"/>}
    </g>;
  }
  function PaperBundle({x,y,w=22,h=8,n=3}:{x:number;y:number;w?:number;h?:number;n?:number}){
    return <g stroke="#b7ad90" strokeWidth=".55" fill="none">{Array.from({length:n},(_,i)=><path key={i} d={`M${x-w*.5+ (i%2)*2} ${y-i*h}l${w} ${i*.5} -${w*.12} ${-h} -${w} ${-i*.4}Z`}/>)}<path d={`M${x-w*.4} ${y-(n-1)*h+2}h${w*.8}`} stroke={EDGE}/></g>;
  }
  function StackBooks({x,y,n=4}:{x:number;y:number;n?:number}){
    return <g stroke="#a7ab92" strokeWidth=".55" fill="#0a1316">{Array.from({length:n},(_,i)=><path key={i} d={`M${x-12+(i%2)*2} ${y-i*5}l24 0 0 -4 -24 0 Z`}/>)}<path d={`M${x-9} ${y-n*5+2}l18 0`} stroke={EDGE}/></g>;
  }
  function WheelBarrel({x,y}:{x:number;y:number}){
    return <g stroke={INK} fill="none" strokeWidth=".8">
      <ellipse cx={x} cy={y} rx="17" ry="6" stroke={EDGE}/>
      <path d={`M${x-17} ${y}v-22l34 0 v22`} stroke={INK}/>
      <path d={`M${x-17} ${y-22}q17 -9 34 0`} stroke={EDGE}/>
      <path d={`M${x-9} ${y-10}h18m-18 5h18`} stroke="#879a97"/>
    </g>;
  }
  function BannerProp({x,y,label,color='#b89a80',h=44}:{x:number;y:number;label:string;color?:string;h?:number}){
    const face=geometry(x,y,h,66,20).left;
    return <g><path d={path(face,true)} fill={BLACK} stroke={color} strokeWidth=".9"/><Plate face={inset(face,.08,.12,.84,.62)} label={label} color={color} rows={0}/><path d={path([at(face,.1,.84),at(face,.9,.84)])} stroke={EDGE} strokeWidth=".6"/><path d={`M${x-30} ${y+3}v9m60-11v9`} stroke={EDGE}/></g>;
  }
  function DeskLamp({x,y}:{x:number;y:number}){
    return <g stroke={EDGE} fill="none" strokeWidth=".75"><path d={`M${x} ${y}v-14l9 -8`}/><path d={`M${x+5} ${y-22}l9 4 -7 8`} stroke="#bda47a"/><circle cx={x+9} cy={y-17} r="2" fill="#c9c5a1" stroke="none"/></g>;
  }
  function MetalShelf({x,y,w=62,h=58,n=3}:{x:number;y:number;w?:number;h?:number;n?:number}){
    return <g stroke={INK} fill="none" strokeWidth=".8">
      <path d={`M${x-w*.5} ${y}v${-h}h${w}v${h}`}/>
      {Array.from({length:n},(_,i)=><path key={i} d={`M${x-w*.5} ${y-h*(i+1)/n + h/n}h${w}`} stroke={EDGE}/>)}
      <path d={`M${x-w*.5+4} ${y-h}h${w-8}`} stroke="#87938a"/>
    </g>;
  }
  function FoldedCloth({x,y,tone='#a88f86'}:{x:number;y:number;tone?:string}){
    return <g stroke={tone} fill="none" strokeWidth=".6"><path d={`M${x} ${y}l13 -3 6 5 -12 4Z`}/><path d={`M${x+3} ${y+2}l10 -2`} stroke={EDGE}/></g>;
  }
  function AmbulanceStretcher({x,y}:{x:number;y:number}){
    return <g stroke={INK} fill="none" strokeWidth=".85">
      <path d={`M${x-26} ${y}l-8 16m58 -16 8 16m-62 -14h54`} stroke={EDGE}/>
      <path d={`M${x-22} ${y}h44l3 6h-50Z`} stroke="#9aa79a"/>
      <path d={`M${x-14} ${y+2}h29m-27 3h24`} stroke={EDGE}/>
      <path d={`M${x-2} ${y-4}v-4m4 4v-4`} stroke="#b58a7c"/>
    </g>;
  }
  function NoticeBoard({x,y,label,color='#b6a88b'}:{x:number;y:number;label:string;color?:string}){
    const face=geometry(x,y,92,58,22).left;
    return <g><path d={path(face,true)} fill={BLACK} stroke={color} strokeWidth=".9"/><path d={path(inset(face,.09,.07,.82,.68),true)} fill="#071015" stroke={EDGE} strokeWidth=".6"/>{Array.from({length:5},(_,i)=><path key={i} d={path(inset(face,.15,.13+.13*i,.6,.1),true)} fill="#0b1414" stroke="#87908a" strokeWidth=".5"/>)}<Plate face={inset(face,.12,.79,.7,.14)} label={label} color={color} rows={0}/><path d={`M${x-24} ${y+3}v10m50 -13v12`} stroke={EDGE}/></g>;
  }
  function WaterHose({x,y}:{x:number;y:number}){
    return <g className="diorama-hose" stroke="#6f8e93" fill="none" strokeWidth="3.4" strokeLinecap="round"><path d={`M${x} ${y}c-46 8 -94 0 -138 12s-96 18 -158 8`}/><path d={`M${x} ${y}c-30 14 -70 14 -104 30`} strokeWidth="2.4"/></g>;
  }
  function SealStamp({x,y}:{x:number;y:number}){
    return <g stroke="#b8916e" fill="none" strokeWidth=".8"><rect x={x} y={y} width="9" height="4" fill="#331c18"/><path d={`M${x+1} ${y+4}v7h7v-7m-7 3h7`}/></g>;
  }

  switch(route){
    // ---------------- HAOBANG: multi-faction negotiation / joint institute / ceremonial order -------------
    case 'haobang': {
      if(chapter===0) return <g className="diorama-haobang diorama-stage-0">
        <Canopy x={262} y={566} label="聯席登記" color="#bda47a"/>
        <Table x={244} y={552} items="papers" label="簽到"/>
        <PaperBundle x={258} y={544} n={4}/>
        <Chair x={198} y={551}/><Chair x={288} y={556}/>
        <SmallFigure x={222} y={540} role="steward" pose="sit"/>
        <SmallFigure x={300} y={570} role="teacher" pose="talk"/>
        <SmallFigure x={168} y={580} pose="talk"/>
        <Crate x={142} y={600} w={38} h={22} open/>
        <StackBooks x={152} y={596} n={3}/>
        <BannerProp x={1140} y={556} label="各方" color="#bda47a" h={40}/>
        <Table x={1062} y={556} items="books" label="草案"/>
        <Chair x={1120} y={564}/><Chair x={1180} y={558}/>
        <SmallFigure x={1096} y={550} role="teacher" pose="sit"/>
        <SmallFigure x={1152} y={572} role="teacher" pose="talk"/>
        <Flag x={1150} y={510} small/><Flag x={1006} y={528} color="#91b7ac" small/>
        <Box x={970} y={586} h={20} left={30} right={14} rows={4}/>
      </g>;
      if(chapter===1) return <g className="diorama-haobang diorama-stage-1">
        <Table x={252} y={556} items="papers" label="協議審閱"/>
        <PaperBundle x={268} y={548} n={6}/><SealStamp x={238} y={546}/><DeskLamp x={228} y={552}/>
        <Chair x={300} y={558}/><SmallFigure x={286} y={546} role="teacher" pose="sit"/>
        <NoticeBoard x={160} y={585} label="聯合機構"/>
        <SidewalkCart x={112} y={602} load="papers"/>
        <SmallFigure x={100} y={578} pose="carry"/>
        <Table x={1088} y={554} items="printer" label="油印"/>
        <Kiosk x={978} y={566} label="聯絡" color="#bba78a"/>
        <Chair x={1148} y={560}/>
        <SmallFigure x={1050} y={572} role="steward" pose="talk"/>
        <SmallFigure x={1128} y={540} role="teacher" pose="sit"/>
        <MetalShelf x={1158} y={588} w={40} h={30} n={2}/>
      </g>;
      return <g className="diorama-haobang diorama-stage-2">
        <Canopy x={270} y={564} label="禮儀秩序" color="#bda47a"/>
        <Table x={250} y={554} items="papers" label="文書"/>
        {[0,1,2].map(i=><Chair key={i} x={204+i*44} y={556+i*2}/>)}
        <SmallFigure x={222} y={542} role="teacher" pose="sit"/>
        <SmallFigure x={286} y={546} role="steward" pose="sit"/>
        <SmallFigure x={316} y={572} role="teacher" pose="talk"/>
        <MetalShelf x={150} y={596} w={46} h={34} n={3}/>
        <PaperBundle x={146} y={590} n={4}/>
        <Table x={1080} y={556} items="papers" label="公文流"/>
        {[0,1,2].map(i=><Box key={i} x={1064+i*22} y={538-i*2} h={10} left={18} right={9} rows={2}/>)}
        <Chair x={1142} y={562}/><SmallFigure x={1120} y={548} role="teacher" pose="sit"/>
        <BannerProp x={980} y={572} label="集中" color="#bda47a" h={36}/>
        <Flag x={1146} y={508} small/><Flag x={996} y={522} small/>
      </g>;
    }
    // ---------------- REFORM: club experiment / joint R&D / autonomous showcase -------------
    case 'reform': {
      if(chapter===0) return <g className="diorama-reform diorama-stage-0">
        <Table x={262} y={554} items="books" label="互助書架"/>
        <StackBooks x={276} y={546} n={5}/><StackBooks x={252} y={548} n={3}/>
        <Bench x={186} y={560}/>
        <Bicycle x={110} y={586}/>
        <SmallFigure x={230} y={542} pose="talk"/><SmallFigure x={302} y={572} pose="carry"/>
        <Box x={330} y={438} h={38} left={22} right={11} color="#abbb9c">{f=><><path d={path([at(f.left,.14,.18),at(f.left,.86,.18)])} stroke="#cbc7a2"/><Plate face={inset(f.left,.14,.34,.72,.48)} label="建議" rows={0}/></>}</Box>
        <Table x={1092} y={550} items="flowers" label="植物社"/>
        <Kiosk x={1176} y={552} label="新課程" color="#abb997"/>
        <Bench x={1008} y={556}/>
        <SmallFigure x={1100} y={540} role="teacher" pose="sit"/>
        <SmallFigure x={1046} y={552} pose="talk"/>
        <Bicycle x={962} y={592}/>
      </g>;
      if(chapter===1) return <g className="diorama-reform diorama-stage-1">
        <Table x={252} y={556} items="printer" label="公共印刷"/>
        <PaperBundle x={268} y={548} n={5}/><WheelBarrel x={214} y={572}/>
        <SmallFigure x={238} y={538} pose="carry"/><SmallFigure x={296} y={560} pose="talk"/>
        <Box x={150} y={576} h={26} left={46} right={22} rows={3}/>
        <SmallFigure x={128} y={592} role="steward" pose="talk"/>
        <Table x={1080} y={554} items="books" label="教輔"/>
        <MetalShelf x={1140} y={580} w={40} h={36} n={3}/>
        <SmallFigure x={1104} y={544} role="teacher" pose="talk"/>
        <SmallFigure x={1154} y={560} pose="carry"/>
        <Crate x={978} y={592} w={34} h={20}/>
        <Bicycle x={1010} y={600}/>
      </g>;
      return <g className="diorama-reform diorama-stage-2">
        <Canopy x={268} y={562} label="成果展" color="#aeb897"/>
        <Table x={252} y={552} items="books" label="自主"/>
        <MetalShelf x={196} y={588} w={42} h={38} n={3}/>
        <StackBooks x={194} y={580} n={4}/><StackBooks x={254} y={544} n={3}/>
        <SmallFigure x={230} y={538} role="teacher" pose="talk"/>
        <SmallFigure x={300} y={566} pose="talk"/>
        <Bench x={128} y={592}/>
        <Table x={1092} y={550} items="flowers" label="展台"/>
        <Kiosk x={1176} y={552} label="展覽" color="#aeb897"/>
        <SmallFigure x={1104} y={540} pose="sit"/>
        <SmallFigure x={1052} y={554} pose="carry"/>
        <Bicycle x={962} y={596}/><Bicycle x={1034} y={604}/>
        <Box x={330} y={438} h={38} left={22} right={11} color="#aeb897">{f=><Plate face={inset(f.left,.14,.32,.72,.5)} label="作品" rows={0}/>}</Box>
      </g>;
    }
    // ---------------- WU: registration checks / closed passage + patrol / branch ending -------------
    case 'wu': {
      if (branch==='spring') return <g className="diorama-wu diorama-wu--spring" data-ch={chapter}>
        <Canopy x={275} y={558} label="校務聽證" color="#9cad99"/><Table x={260} y={550} items="papers" label="公開記錄"/>
        <Chair x={190} y={554}/><Chair x={304} y={566}/><SmallFigure x={214} y={542} role="teacher" pose="sit"/><SmallFigure x={312} y={580} pose="talk"/>
        <Box x={129} y={588} h={18} left={49} right={21}>{f=><Plate face={inset(f.left,.1,.15,.8,.65)} label="封存" rows={0}/>}</Box>
        <NoticeBoard x={1002} y={566} label="整改清單" color="#a8b7a1"/><Bench x={1115} y={555}/><Bicycle x={1095} y={606}/>
        <SmallFigure x={1071} y={572} pose="sit"/><Table x={1167} y={574} items="books" label="歸還讀物"/>
      </g>;
      if (branch==='institution') return <g className="diorama-wu diorama-wu--institution" data-ch={chapter}>
        <Kiosk x={202} y={565} label="校規公示" color="#b6ac8c"/><Table x={312} y={554} items="papers" label="按章辦理"/><SmallFigure x={277} y={540} role="teacher" pose="sit"/>
        <Van x={1105} y={587} official/><BannerProp x={973} y={571} label="模範校" color="#bca87f"/><SmallFigure x={1053} y={584} role="steward"/>
        <Box x={1174} y={602} h={29} left={53} right={18} rows={3}/><PaperBundle x={1133} y={595} n={4}/>
      </g>;
      if (branch==='coup'||branch==='nkpd') return <g className={'diorama-wu diorama-wu--'+branch} data-ch={chapter}>
        <Canopy x={244} y={557} label={branch==='nkpd'?'檔案移交':'臨時通行'} color="#a3aaa0"/><Table x={230} y={553} items="papers" label="登記"/>
        <Barrier x={338} y={589} width={123}/><Barrier x={1170} y={586} width={146}/><Van x={1065} y={577} official/>
        <SmallFigure x={294} y={573} role="steward"/><SmallFigure x={1165} y={591} role="steward"/>
        <Box x={119} y={595} h={34} left={44} right={21} rows={4}>{f=><Plate face={inset(f.left,.12,.14,.76,.68)} label="保密" rows={0}/>}</Box>
        <Kiosk x={962} y={562} label={branch==='nkpd'?'審查室':'護校隊'} color="#9d9f91"/>
        <path className="diorama-search-sweep" d="M1118 384L646 643L812 646Z" fill="#bfc3a3" opacity=".035"/>
      </g>;
      if(chapter===0) return <g className="diorama-wu diorama-stage-0">
        <Canopy x={254} y={562} label="證件查驗" color="#a7b5af"/>
        <Table x={238} y={552} items="papers" label="登記"/>
        <PaperBundle x={252} y={544} n={3}/><SealStamp x={222} y={546}/>
        <SmallFigure x={216} y={540} role="teacher" pose="sit"/>
        <SmallFigure x={288} y={572} role="steward"/>
        <Barrier x={344} y={582}/>
        {[150,370].map((x,i)=><Cone key={x} x={x} y={592-i*2}/>)}
        <Kiosk x={968} y={560} label="巡查通報" color="#b3beb5"/>
        <Barrier x={1150} y={566} width={140}/>
        {[918,1002,1108].map((x,i)=><Cone key={x} x={x} y={592-i*5}/>)}
        <SmallFigure x={1058} y={570} role="steward"/>
        <path className="diorama-search-sweep" d="M1118 384L646 643L812 646Z" fill="#bfc3a3" opacity=".035"/>
        <path d="M1080 372l44 9-7 11-44-9Z" fill={BLACK} stroke={INK}/>
      </g>;
      if(chapter===1) return <g className="diorama-wu diorama-stage-1">
        <Kiosk x={244} y={560} label="封閉通道" color="#a7b5af" broken/>
        <Barrier x={322} y={580}/><Barrier x={322} y={600} broken/>
        <Cone x={186} y={592}/><Cone x={104} y={586}/>
        <SmallFigure x={284} y={566} role="steward"/>
        <SmallFigure x={214} y={544} role="teacher" pose="sit"/>
        <Table x={1080} y={554} items="papers" label="巡邏"/>
        <SmallFigure x={1046} y={562} role="steward" pose="carry"/>
        <SmallFigure x={1108} y={544} role="steward" pose="talk"/>
        <Barrier x={1148} y={570} width={134}/>
        {[966,1000,1034].map((x,i)=><Cone key={x} x={x} y={596-i*3}/>)}
        <BannerProp x={1180} y={548} label="通行" color="#a7b5af" h={34}/>
        <Bicycle x={952} y={604} fallen/>
      </g>;
      // branch-ending flavored, ambivalent (not all dead)
      return <g className="diorama-wu diorama-stage-2">
        <Kiosk x={236} y={562} label="門禁" color="#a7b5af" broken/>
        <Table x={244} y={552} items="medical" label="交接"/>
        <AmbulanceStretcher x={168} y={588}/>
        <SmallFigure x={208} y={540} role="teacher" pose="sit"/>
        <SmallFigure x={300} y={574} pose="carry"/>
        <FoldedCloth x={122} y={586} tone="#a89a86"/>
        <Barrier x={344} y={582} broken/>
        <Table x={1084} y={552} items="papers" label="名冊"/>
        <SmallFigure x={1050} y={562} role="teacher" pose="talk"/>
        <SmallFigure x={1104} y={546} role="teacher" pose="sit"/>
        <Chair x={1140} y={560}/>
        <NoticeBoard x={978} y={584} label="公告" color="#a7b5af"/>
        <BannerProp x={1186} y={544} label="恢復" color="#a7b5af" h={30}/>
        <path className="diorama-search-sweep" d="M1118 384L646 643L812 646Z" fill="#bfc3a3" opacity=".02"/>
      </g>;
    }
    // ---------------- GOUXIONG: club fair / stage & danmaku boards / absurd admin performance -------------
    case 'gouxiong': {
      if(chapter===0) return <g className="diorama-gouxiong diorama-stage-0">
        <Canopy x={278} y={552} label="社團" color="#b298b5"/>
        <Box x={276} y={534} h={58} left={104} right={17}>{f=><><Plate face={inset(f.left,.06,.07,.88,.5)} label="攤位" color="#b2a0b9" rows={0}/><path d={path(inset(f.left,.1,.62,.8,.24),true)} fill="none" stroke="#b4b19a"/></>}</Box>
        <Speaker x={126} y={560}/><Speaker x={322} y={574}/>
        <SmallFigure x={286} y={546} pose="talk"/><SmallFigure x={258} y={580} pose="talk"/>
        <SmallFigure x={306} y={590} pose="talk"/>
        <Bicycle x={112} y={600}/>
        <Table x={1110} y={556} items="books" label="同人"/>
        <StackBooks x={1124} y={548} n={3}/>
        <Kiosk x={980} y={558} label="投票" color="#b298b5" screen/>
        <SmallFigure x={1086} y={566} pose="carry"/><SmallFigure x={1042} y={578} pose="talk"/>
        <Bicycle x={1156} y={600}/>
        <path className="diorama-festoon" d="M112 428Q246 460 330 436" stroke="#b6a6b2" fill="none"/>
        {Array.from({length:9},(_,i)=><circle key={i} className={`diorama-bulb diorama-bulb-${i%3}`} cx={118+i*24} cy={428+Math.sin(i/8*Math.PI)*16} r="2"/>)}
      </g>;
      if(chapter===1) return <g className="diorama-gouxiong diorama-stage-1">
        <Box x={264} y={560} h={34} left={140} right={48} rows={2}/>
        <Canopy x={274} y={548} label="戲台" color="#b298b5"/>
        <SmallFigure x={238} y={540} pose="talk"/><SmallFigure x={300} y={554} pose="talk"/>
        <SmallFigure x={186} y={568} pose="talk"/>
        {/* danmaku boards */}
        {[0,1,2].map(i=><g key={i} className={`diorama-danmaku diorama-danmaku-${i}`}><rect x={196+i*38} y={472-i*10} width={26} height={10} fill="#0a1114" stroke="#b2a0b9" strokeWidth=".6"/><path d={`M${200+i*38} ${477-i*10}h18`} stroke="#a7b8ad"/></g>)}
        <Speaker x={152} y={566}/><Speaker x={330} y={576}/>
        <Table x={1102} y={552} items="books" label="戲曲"/>
        <Kiosk x={982} y={556} label="投票" color="#b298b5" screen/>
        <SmallFigure x={1082} y={544} pose="talk"/><SmallFigure x={1048} y={572} pose="talk"/><SmallFigure x={1146} y={560} pose="sit"/>
        <Chair x={1142} y={562}/>
        <g stroke="#a7b8ad" fill="none" strokeWidth=".6"><path d="M1012 508q22 -8 44 0m-44 6q22 -6 44 0"/></g>
        <Bicycle x={1004} y={596}/>
      </g>;
      return <g className="diorama-gouxiong diorama-stage-2">
        <Box x={268} y={548} h={62} left={132} right={26} rows={2}/>
        <Canopy x={282} y={542} label="行政演出" color="#b298b5"/>
        <Table x={252} y={548} items="papers" label="流程"/>
        <Chair x={216} y={556}/><Chair x={310} y={562}/>
        <SmallFigure x={236} y={534} role="steward" pose="sit"/>
        <SmallFigure x={298} y={548} role="teacher" pose="talk"/>
        <SmallFigure x={176} y={560} pose="talk"/>
        <Speaker x={128} y={566}/>
        <Table x={1096} y={552} items="papers" label="佈景"/>
        <Kiosk x={980} y={558} label="評分" color="#b298b5" screen/>
        <SmallFigure x={1052} y={544} role="teacher" pose="sit"/>
        <SmallFigure x={1122} y={572} pose="carry"/><SmallFigure x={1156} y={560} pose="talk"/>
        <g stroke="#a7b8ad" fill="none" strokeWidth=".6"><path d="M1012 508q22 -8 44 0m-44 6q22 -6 44 0"/></g>
        <path className="diorama-festoon" d="M112 428Q246 460 330 436" stroke="#b6a6b2" fill="none"/>
        {Array.from({length:9},(_,i)=><circle key={i} className={`diorama-bulb diorama-bulb-${i%3}`} cx={118+i*24} cy={428+Math.sin(i/8*Math.PI)*16} r="2"/>)}
      </g>;
    }
    // ---------------- DESPAIR: posters removed / vacant platform with paper drift / sealed windows & old desk -------------
    case 'despair': {
      if(chapter===0) return <g className="diorama-despair diorama-stage-0">
        <Kiosk x={238} y={560} label="停止開放" color="#a99583" broken/>
        <Box x={160} y={576} h={32} left={58} right={24} rows={4}/>
        <path d="M106 570l46 8-30 6-20-4M974 562l16 4-3 14-22-5" fill={BLACK} stroke="#a28d75" strokeWidth="1"/>
        <path className="diorama-peel" d="M244 470l-42 2 5 12-20 9 38 2 5 20 14-12Z" fill={BLACK} stroke="#ac9986" strokeWidth=".8"/>
        <Barrier x={340} y={582} broken/>
        <Bench x={1082} y={560} broken/>
        <Bicycle x={1014} y={606} fallen/>
        <Box x={1180} y={564} h={22} left={58} right={22} rows={3}/>
        {[600,612,624].map(y=><path key={y} d={path([streetPoint(140,y),streetPoint(800,y),streetPoint(850,y)])} stroke="#887f63" strokeWidth=".55" fill="none"/>)}
        <PaperBundle x={1098} y={606} n={4}/><PaperBundle x={1128} y={612} n={3}/>
      </g>;
      if(chapter===1) return <g className="diorama-despair diorama-stage-1">
        <Kiosk x={234} y={560} label="停止開放" color="#a99583" broken/>
        <Bench x={1080} y={562} broken/>
        <Bicycle x={1012} y={606} fallen/>
        <Barrier x={338} y={584} broken/><Barrier x={944} y={592} broken/>
        <NoticeBoard x={166} y={590} label="撤除" color="#a99583"/>
        {/* vacant platform: stacked drifting papers */}
        <Box x={1104} y={596} h={22} left={40} right={18} rows={3}/>
        {Array.from({length:7},(_,i)=><g key={i} className="diorama-paper-drift" style={{animationDelay:`-${i*1.2}s`}}><path d={`M${1084+i*13} ${584-(i%3)*9}l9 -2 2 5 -9 2Z`} fill={BLACK} stroke="#b7ad90" strokeWidth=".5"/></g>)}
        <path d="M1006 566l33 29 11-3-30-28Z" fill={BLACK} stroke="#a28d75"/>
        <SmallFigure x={300} y={590} pose="carry"/>
      </g>;
      return <g className="diorama-despair diorama-stage-2">
        <Kiosk x={236} y={560} label="封存" color="#a99583" broken/>
        <path className="diorama-seal-tape" d="M216 520l52 42M268 520l-52 42" stroke="#a28d75" strokeWidth="2" fill="none"/>
        <Box x={154} y={576} h={34} left={58} right={24} rows={4}/>
        <Table x={252} y={556} items="papers" label="封存"/>
        <Chair x={216} y={558}/><Chair x={296} y={562}/>
        <SmallFigure x={300} y={588} pose="carry"/>
        <Bench x={1082} y={562} broken/>
        <Bicycle x={1014} y={606} fallen/>
        <Table x={1096} y={552} items="papers" label="舊桌"/>
        <Chair x={1146} y={560}/>
        <Barrier x={940} y={592} broken/>
        <path d="M1006 566l33 29 11-3-30-28Z" fill={BLACK} stroke="#a28d75"/>
        {/* no figures on road center: empty pavement implied */}
      </g>;
    }
    // ---------------- JIDI_RIOT: tipped delivery cart & broken scoreboard / firehose rescue / embers & registry -------------
    case 'jidi_riot': {
      if(chapter===0) return <g className="diorama-riot diorama-stage-0">
        <Kiosk x={226} y={562} label="排名中斷" color="#a48b78" screen broken/>
        <SidewalkCart x={150} y={594} tilt={-14} load="empty"/>
        {[0,1,2].map(i=><path key={i} d={`M${158+i*14} ${566-i*3}l20 -3 4 7 -22 4Z`} fill={BLACK} stroke="#b7ad90" strokeWidth=".5"/>).map((el,i)=><g key={'f'+i} className='diorama-scatter' style={{animationDelay:`-${i*.8}s`}}>{el}</g>)}
        <Barrier x={330} y={580} broken/>
        <Bicycle x={96} y={602} fallen/>
        <Box x={1080} y={556} h={44} left={104} right={34} rows={4}/>
        <Fire x={1086} y={508} scale={.85}/>
        <Table x={974} y={578} items="medical" label="點名"/>
        <SmallFigure x={964} y={560} role="teacher" pose="talk"/>
        <SmallFigure x={1052} y={582} pose="carry"/>
        <SmallFigure x={290} y={592} pose="carry"/>
        <path d="M282 620l27-3 7 12-31 1ZM324 620l18 1-1 12-22-4ZM1090 592l32-6 4 16-37 4Z" fill={BLACK} stroke="#b8b8a2" strokeWidth=".8"/>
        <PaperBundle x={1096} y={606} n={3}/>
      </g>;
      if(chapter===1) return <g className="diorama-riot diorama-stage-1">
        <Kiosk x={222} y={562} label="排水中" color="#a48b78" screen broken/>
        <Barrier x={326} y={580} broken/><Bicycle x={92} y={600} fallen/>
        <WaterHose x={1180} y={548}/>
        <Fire x={1068} y={516} scale={.55}/>
        <Box x={1100} y={556} h={40} left={92} right={30} rows={4}/>
        <AmbulanceStretcher x={986} y={588}/>
        <Table x={930} y={574} items="medical" label="救護"/>
        <SmallFigure x={918} y={558} role="teacher" pose="talk"/>
        <SmallFigure x={1004} y={580} pose="carry"/><SmallFigure x={1060} y={566} pose="carry"/>
        <SmallFigure x={288} y={592} role="steward" pose="carry"/>
        <path className="diorama-water" d="M805 608l80 4m-23 8 61 2m-753-20 106 17" stroke="#75969b" fill="none"/>
        <path d="M1091 592l32-6 4 16-37 4Z" fill={BLACK} stroke="#b8b8a2" strokeWidth=".8"/>
      </g>;
      return <g className="diorama-riot diorama-stage-2">
        <Kiosk x={228} y={560} label="熄火" color="#a48b78" screen broken/>
        <SidewalkCart x={156} y={594} tilt={8} load="empty"/>
        <Barrier x={330} y={580} broken/><Barrier x={940} y={590} broken/>
        <Bicycle x={96} y={602} fallen/>
        <Fire x={1040} y={548} scale={.32}/>
        {Array.from({length:6},(_,i)=><path key={i} className="diorama-ember" style={{animationDelay:`-${i*.9}s`}} d={`M${1080+i*11} ${548-(i%3)*8}q3 -3 5 0`} stroke="#b7936a" fill="none" strokeWidth=".6"/>).map((el,i)=><g key={'e'+i}>{el}</g>)}
        <Table x={1092} y={552} items="medical" label="救護登記"/>
        <AmbulanceStretcher x={1000} y={592}/>
        <SmallFigure x={1112} y={540} role="teacher" pose="sit"/>
        <SmallFigure x={1044} y={568} role="teacher" pose="sit"/>
        <SmallFigure x={982} y={580} pose="carry"/>
        <Chair x={1140} y={560}/>
        <path d="M1091 592l32-6 4 16-37 4ZM324 620l18 1-1 12-22-4Z" fill={BLACK} stroke="#b8b8a2" strokeWidth=".8"/>
        <PaperBundle x={1096} y={596} n={3}/>
        <Box x={1128} y={590} h={18} left={34} right={16} rows={3}/>
      </g>;
    }
    default: return null;
  }
}

export default memo(function CampusRouteDiorama(props:{route:HeyiRoute;stage?:UprisingStage;chapter:0|1|2;branch?:CampusBranch}) {
 return ['opening','uprising','democracy','revolution','yang','jidi'].includes(props.route)?<RouteStreetSceneA {...props}/>:<RouteStreetSceneB {...props}/>;
});
