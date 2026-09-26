import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { GameState, SubTile, ALL_SUB_TILES } from '../types';
import CommandPanel from './CommandPanel';
import { executeMapAction } from '../engine/mapActions';
import { getCommandRoute } from '../data/commandRoutes';
import { getCommandState, getSupplyNetwork, hasSupplyAccess } from '../engine/commandSystem';

interface CentralMapProps {
  state: GameState; setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  triggerError: () => void; isElectionUIOpen?: boolean; setIsElectionUIOpen?: (v: boolean) => void;
  selectedTileId: string | null;
  districtDockTarget: HTMLElement | null;
  onSelectTile: (id: string | null) => void;
}

function tc(state: GameState, tid: string) { return (state.flags['tile_ctrl_'+tid] as number|undefined) ?? ALL_SUB_TILES.find(t=>t.id===tid)?.studentControl ?? 50; }
function bc(state: GameState, bid: string) { const ts=ALL_SUB_TILES.filter(t=>t.buildingId===bid); return ts.length?Math.round(ts.reduce((s,t)=>s+tc(state,t.id),0)/ts.length):0; }

// TNO风格颜色映射
function ctrlColor(ctrl: number): string { if(ctrl>=70)return'#91bdc3';if(ctrl>=45)return'#b8aa87';if(ctrl>=25)return'#bb786b';return'#a94340'; }

// SVG区域映射
interface R { tid:string;bid:string;lb:string;x:number;y:number;w:number;h:number;rx?:number; }
const RGN:R[]=[
  {tid:'b3_a1a3',bid:'b3',lb:'A1-A3教学楼',x:400,y:190,w:250,h:75,rx:2},
  {tid:'b3_b1b2',bid:'b3',lb:'B1-B2教学楼',x:400,y:300,w:140,h:75,rx:2},
  {tid:'b3_tower',bid:'b3',lb:'B3教学楼主楼',x:580,y:300,w:70,h:75,rx:2},
  {tid:'admin_main',bid:'admin',lb:'行政楼主楼',x:420,y:70,w:100,h:75,rx:2},
  {tid:'admin_gym',bid:'admin',lb:'体育馆',x:400,y:420,w:110,h:75,rx:4},
  {tid:'dorm_1_4',bid:'b1b2',lb:'宿舍1-4栋',x:50,y:70,w:220,h:95,rx:2},
  {tid:'dorm_5_7',bid:'b1b2',lb:'宿舍5-7栋',x:50,y:170,w:160,h:95,rx:2},
  {tid:'aud_screen',bid:'auditorium',lb:'放映厅',x:540,y:420,w:50,h:75},
  {tid:'aud_back',bid:'auditorium',lb:'后台化妆间',x:560,y:500,w:60,h:28},
  {tid:'aud_hall',bid:'auditorium',lb:'礼堂大厅',x:590,y:420,w:50,h:75},
  {tid:'intl_dept',bid:'lab',lb:'国际部',x:180,y:380,w:90,h:55,rx:2},
  {tid:'lib_area',bid:'lab',lb:'图书馆',x:680,y:280,w:70,h:48,rx:2},
  {tid:'court_area',bid:'playground',lb:'篮球场',x:50,y:470,w:190,h:55,rx:2},
  {tid:'canteen',bid:'playground',lb:'食堂区',x:50,y:380,w:100,h:55,rx:2},
  {tid:'track_field',bid:'playground',lb:'田径场',x:670,y:370,w:90,h:145,rx:45},
];
const BN:Record<string,string>={b3:'B3教学区',admin:'行政楼区',b1b2:'生活宿舍区',auditorium:'艺术礼堂',lab:'实验/国际部',playground:'操场活动区'};
const SHORT_LABELS:Record<string,string>={b3_tower:'B3主楼',b3_a1a3:'A1—A3教学楼',b3_b1b2:'B1—B2教学楼',admin_main:'行政楼',aud_screen:'放映厅',aud_hall:'礼堂',aud_back:'礼堂后台'};

// 派系颜色
const FC:Record<string,string>={pan:'#3b82f6',orthodox:'#ef4444',bear:'#a855f7',testTaker:'#6b7280',conservativeDem:'#1e40af',jidiTutoring:'#eab308',otherDem:'#22c55e'};
const FN:Record<string,string>={pan:'泛民主派',orthodox:'正统派',bear:'狗熊派',testTaker:'做题派',conservativeDem:'保守民主派',jidiTutoring:'及第辅导派',otherDem:'其他民主派'};

// 按钮
const Btn=({n,c,d,on,ok,cd}:{n:string;c:string;d:string;on:()=>void;ok:boolean;cd?:boolean})=>(
  <button onClick={on} disabled={!ok||cd} className={`w-full text-left p-2 border text-xs ${ok&&!cd?'border-[#ff4444]/50 hover:bg-[#ff4444]/20 text-white':'border-gray-700 text-gray-500 cursor-not-allowed'} transition-colors`}>
    <div className="font-bold text-sm">{n}{cd&&<span className="text-red-400 text-[10px] ml-1">(今日已执行)</span>}</div>
    <div className="text-[11px] mt-0.5 opacity-70">{d} · {c}</div>
  </button>
);

export default function CentralMap({state,setGameState,triggerError,isElectionUIOpen,setIsElectionUIOpen,selectedTileId:sel,onSelectTile:setSel,districtDockTarget}:CentralMapProps){
  const [mapLayer,setMapLayer]=useState<'control'|'supply'|'orders'>('control');
  const route = getCommandRoute(state);
  const supplyNetwork = getSupplyNetwork(state);
  const teams = getCommandState(state).teams;
  const [zoom,setZoom]=useState(1); const [pan,setPan]=useState({x:0,y:0});
  const [isPan,setIsPan]=useState(false); const [ps,setPs]=useState({x:0,y:0});
  const today=state.date.toISOString().split('T')[0];

  const isReb=state.flags['rebellion_started']; const isGx=!!state.flags['gx_anarchy_phase'];
  const isLu=state.flags['lu_purge_map_phase']; const isCm=state.flags['haobang_commune_map_phase'];
  const isRf=state.flags['map_phase_ended'] && !isLu && !isCm; const isEnd=state.flags['map_struggle_ended'];
  const isYy=state.flags['yang_yule_route_started']; const isJd=state.flags['jidi_new_era_active'];
  // v8.5 吴福军镇压线：戒严校园阶段
  const isWu=state.flags['wu_crackdown_map_phase'] && !!state.flags['wu_route_active'];
  const isPoll=state.flags['polling_stations_unlocked']; const isEl=state.electionState?.isActive;
  const cd=(aid:string)=>state.flags[`map_action_${aid}_${sel}_last_date`]===today;
  // 做题改革：区域顽固度到建筑ID的映射
  const reformBidMap:Record<string,string>={B3:'b3',B1_B2:'b1b2',Admin:'admin',ArtHall:'auditorium',Lab:'lab',Playground:'playground'};
  const reformCtrl=(tid:string):number=>{
    const bid=ALL_SUB_TILES.find(t=>t.id===tid)?.buildingId||'';
    const rKey=Object.entries(reformBidMap).find(([,v])=>v===bid)?.[0]||'';
    const stub=(state.reformState?.regionalStubbornness||{})[rKey]??0;
    return Math.round(100-stub);
  };

  // 缩放拖拽
  const onWheel=useCallback((e:React.WheelEvent)=>{setZoom(z=>Math.max(0.5,Math.min(3,z-e.deltaY*0.001)));},[]);
  const onMDown=(e:React.MouseEvent)=>{if(e.button===1||e.altKey){setIsPan(true);setPs({x:e.clientX-pan.x,y:e.clientY-pan.y});}};
  const onMMove=(e:React.MouseEvent)=>{if(isPan)setPan({x:e.clientX-ps.x,y:e.clientY-ps.y});};
  const onMUp=()=>setIsPan(false);


  // 地图手动行动与工作组定期行动共用同一规则。
  const act=(tid:string,aid:string)=>setGameState(prev=>executeMapAction(prev,tid,aid).state);

  const rgnColor=(r:R):string=>{
    if(mapLayer==='supply')return supplyNetwork.has(r.tid)?'#a2c4bc':hasSupplyAccess(state,r.tid)?'#c9b481':'#665d59';
    if(mapLayer==='orders')return teams.some(t=>t.order?.tileId===r.tid)?route.color:'#56656a';
    const c=tc(state,r.tid);
    if(isGx){const o=String(state.flags['gx_map_owner_tile_'+r.tid]||'school');return o==='gouxiong'?'#ec4899':o==='left'?'#ef4444':'#6b7280';}
    if(isLu){const lv=Number(state.flags['lu_purge_zone_level_tile_'+r.tid]||0);return lv>=3?'#22c55e':lv>=2?'#f97316':lv>=1?'#ef4444':'#555';}
    if(isCm){const lv=Number(state.flags['haobang_commune_zone_level_tile_'+r.tid]||0);return lv>=3?'#22c55e':lv>=2?'#84cc16':lv>=1?'#a3e635':'#555';}
    // v8.5 吴福军戒严：残党细胞鲜红 / 校方秩序铁灰→琥珀→警戒红
    if(isWu){
      if(state.flags['wu_cell_'+r.tid]!==undefined)return'#ef4444';
      return c<=15?'#5a6a7a':c<=30?'#8a93a0':c<=50?'#c9a86a':'#d9534f';
    }
    // 杨玉乐维稳监控：叛乱红 / 稳定度灰棕渐变
    if(isYy){
      if(state.yangYuleState?.rebelLocations[r.tid])return'#ef4444';
      const yyStab=(state.yangYuleState?((state.yangYuleState.fengFavor+state.yangYuleState.teacherSupport)/2):50);
      return yyStab>=70?'#8b7355':yyStab>=45?'#a09070':yyStab>=25?'#b5a58c':'#c4b8a8';
    }
    if(isEnd)return'#87CEEB';
    // 及第模式：统一金色/红色
    if(state.flags['jidi_map_yellow'])return'#EAB308';if(state.flags['jidi_takeover_complete'])return'#ef4444';
    // 做题改革阶段：红色革命主题（与起义阶段区分）
    if(isRf)return c>=70?'#dc2626':c>=45?'#f87171':c>=25?'#fca5a5':'#fecaca';
    // 选举阶段：蓝色民主主题
    if(isPoll||isEl)return c>=70?'#3b82f6':c>=45?'#60a5fa':c>=25?'#93c5fd':'#bfdbfe';
    return ctrlColor(c);
  };

  const selTile=sel?ALL_SUB_TILES.find(t=>t.id===sel):null;
  const selRgn=sel?RGN.find(r=>r.tid===sel):null;
  const selCtrl=sel?tc(state,sel):0;
  const modeTitle=isGx?'无 政 府 战 区':isLu?'N K P D 清 洗 图':isCm?'学 生 公 社 建 设':isWu?'戒 严 校 园':isEl?'合一首届普选':isYy?'校园维稳监控':isEnd?'和平重建区':isRf?'做 题 改 革 阶 段':isPoll?'选 举 准 备 阶 段':'合 肥 一 中 滨 湖 校 区';
  const deployed = teams.filter(t=>t.order);
  const mapSubtitle = mapLayer==='control' ? 'CONTROL / 地区控制与争夺态势' : mapLayer==='supply' ? 'SUPPLY / 总部交通线与前沿可达范围' : 'DEPLOYMENT / 工作组定期任务与驻扎点';

  return(
    <div className="campus-map-layout">
      <div className="campus-map-stage">
      <div className="map-toolbar"><div><span className="eyebrow">{route.chapter} · {route.title}</span><strong>{modeTitle}</strong><small>{mapSubtitle}</small></div><div className="map-layers">{([{id:'control',label:'势力'},{id:'supply',label:'补给'},{id:'orders',label:'部署'}] as const).map(l=><button key={l.id} aria-pressed={mapLayer===l.id} className={mapLayer===l.id?'selected':''} onClick={()=>setMapLayer(l.id)}>{l.label}</button>)}</div></div>
      <div className={`map-viewport layer-${mapLayer}`} onWheel={onWheel} onMouseDown={onMDown} onMouseMove={onMMove} onMouseUp={onMUp} onMouseLeave={onMUp} style={{cursor:isPan?'grabbing':'default'}}>

      {/* SVG */}
      <svg width="100%" height="100%" viewBox="0 0 800 600"
        style={{transform:`scale(${zoom}) translate(${pan.x/zoom}px,${pan.y/zoom}px)`,transformOrigin:'center',transition:isPan?'none':'transform 0.15s'}}>
        <defs>
          <filter id="g1"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="g2"><feGaussianBlur stdDeviation="6"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <radialGradient id="gg"><stop offset="0%" stopColor="#39FF14" stopOpacity="0.3"/><stop offset="100%" stopColor="#39FF14" stopOpacity="0"/></radialGradient>
          <radialGradient id="rg"><stop offset="0%" stopColor="#ef4444" stopOpacity="0.4"/><stop offset="100%" stopColor="#ef4444" stopOpacity="0"/></radialGradient>
          <pattern id="isolationHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="8" stroke="#d86b61" strokeWidth="2" opacity=".4"/></pattern>
          <pattern id="deploymentGrid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="#547d83" strokeWidth=".7" opacity=".35"/></pattern>
        </defs>
        {/* 背景 */}
        <rect width="800" height="600" fill={mapLayer==='supply'?'#091a1a':mapLayer==='orders'?'#09151a':'#0c1014'}/>
        <rect x="18" y="18" width="764" height="564" fill={mapLayer==='supply'?'#102624':mapLayer==='orders'?'#101e22':'#161b1d'} stroke={mapLayer==='supply'?'#83b8a3':mapLayer==='orders'?'#6e9da2':'#707373'} strokeWidth="2" rx="4"/>
        <rect x="20" y="20" width="760" height="560" fill={mapLayer==='supply'?'#122521':mapLayer==='orders'?'#142126':'#1d2426'} stroke="#343b3d" strokeWidth="1" rx="3"/>
        {mapLayer==='orders'&&<rect x="20" y="20" width="760" height="560" fill="url(#deploymentGrid)"/>}
        {/* 网格 */}
        {Array.from({length:20}).map((_,i)=><line key={'h'+i} x1="20" y1={35+i*28} x2="780" y2={35+i*28} stroke="#1a2533" strokeWidth="0.4"/>)}
        {Array.from({length:27}).map((_,i)=><line key={'v'+i} x1={38+i*28} y1="20" x2={38+i*28} y2="580" stroke="#1a2533" strokeWidth="0.4"/>)}
        {/* 道路标注 */}
        <text x="400" y="13" textAnchor="middle" fontSize="10" fill="#3a4a5a" letterSpacing="0.35em">长 沙 路（北）</text>
        <text x="400" y="596" textAnchor="middle" fontSize="10" fill="#3a4a5a" letterSpacing="0.35em">洞 庭 湖 路（南）</text>
        <text x="7" y="300" textAnchor="middle" fontSize="10" fill="#3a4a5a" transform="rotate(-90 7 300)" letterSpacing="0.35em">西藏路（西）</text>
        <text x="793" y="300" textAnchor="middle" fontSize="10" fill="#3a4a5a" transform="rotate(90 793 300)" letterSpacing="0.35em">塘西河（东）</text>
        {/* 西藏路 */}
        <rect x="350" y="20" width="26" height="560" fill="#0f1822"/>
        <line x1="363" y1="20" x2="363" y2="580" stroke="#8b0000" strokeWidth="1" strokeDasharray="8,5" opacity="0.6"/>
        <text x="363" y="300" textAnchor="middle" fontSize="9" fill="#8b0000" opacity="0.8" transform="rotate(-90 363 300)" letterSpacing="0.3em">西 藏 路</text>
        <rect x="354" y="280" width="18" height="36" fill="#1e2d3d" rx="2" stroke="#3a5068" strokeWidth="1"/>
        <text x="363" y="303" textAnchor="middle" fontSize="7" fill="#5a7a9a">通道</text>
        {/* 区域标题 */}
        <text x="185" y="42" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#3a5068" letterSpacing="0.25em">生 活 区（西区）</text>
        <text x="585" y="42" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#3a5068" letterSpacing="0.25em">教 学 行 政 区（东区）</text>
        {/* 绿化广场 */}
        <rect x="400" y="70" width="250" height="90" fill="none" stroke="#153a25" strokeWidth="1" strokeDasharray="3,5"/>
        <text x="525" y="60" textAnchor="middle" fontSize="8" fill="#153a25">中心绿化</text>
        {/* 趣湖 */}
        <ellipse cx="700" cy="230" rx="28" ry="22" fill="#081420" stroke="#1a3550" strokeWidth="1.5"/>
        <text x="700" y="233" textAnchor="middle" fontSize="8" fill="#2a5580">趣湖</text>
        {/* 升旗台 */}
        <circle cx="470" cy="165" r="6" fill="#5a3010" stroke="#a06020" strokeWidth="1"/>
        <text x="470" y="183" textAnchor="middle" fontSize="7" fill="#a06020">升旗台</text>
        {/* 围墙 */}
        <rect x="19" y="19" width="762" height="562" fill="none" stroke="#1e2d3d" strokeWidth="0.5" strokeDasharray="2,4"/>

        {/* 校园道路、绿地与建筑轮廓保持空间可读性。 */}
        <path d="M35 280H325V350H765 M35 450H330 M385 395H765 M385 285H765 M290 45V550 M385 550H765" fill="none" stroke="#a2a3a0" strokeWidth="11" opacity=".16"/>
        <path d="M35 280H325V350H765 M35 450H330 M385 395H765 M385 285H765 M290 45V550" fill="none" stroke="#a4a78a" strokeWidth=".7" strokeDasharray="4 6" opacity=".35"/>
        {[{x:70,y:315},{x:130,y:320},{x:210,y:310},{x:310,y:110},{x:310,y:170},{x:555,y:104},{x:590,y:125},{x:715,y:110},{x:718,y:160}].map((p,i)=><g key={i} opacity=".45"><circle cx={p.x} cy={p.y} r="17" fill="#34473b"/><circle cx={p.x-6} cy={p.y+5} r="9" fill="#4b5f46"/><circle cx={p.x+8} cy={p.y-4} r="12" fill="#43583f"/></g>)}
        <text x="65" y="560" fill="#9ba59b" fontSize="9" letterSpacing="2">合肥一中 / 战区态势图</text>
        <path d="M742 68V43L737 53M742 43L747 53" stroke="#b6b7a1" fill="none" strokeWidth="1.5"/><text x="742" y="35" textAnchor="middle" fill="#b6b7a1" fontSize="10">N</text>
        {mapLayer==='supply' && RGN.flatMap(r => RGN.filter(b=>b.tid>r.tid&&(ALL_SUB_TILES.find(t=>t.id===r.tid)!.adjacentTo.includes(b.tid)||ALL_SUB_TILES.find(t=>t.id===b.tid)!.adjacentTo.includes(r.tid))).map(b=>{
          const id=b.tid;
          const linked=supplyNetwork.has(r.tid)&&supplyNetwork.has(id);
          return <line key={`${r.tid}-${id}`} x1={r.x+r.w/2} y1={r.y+r.h/2} x2={b.x+b.w/2} y2={b.y+b.h/2} stroke={linked?'#9ce7c5':'#9f665e'} strokeWidth={linked?6:1.5} strokeDasharray={linked?'9 5':'3 7'} opacity={linked?.7:.45} filter={linked?'url(#g1)':undefined}/>;
        }))}
        {mapLayer==='orders'&&deployed.map((team,i)=>{const dest=RGN.find(r=>r.tid===team.order?.tileId);const hq=RGN.find(r=>r.tid===route.hq);return dest&&hq?<path key={`route-${team.id}`} d={`M${hq.x+hq.w/2} ${hq.y+hq.h/2} Q400 ${90+i*22} ${dest.x+dest.w/2} ${dest.y+dest.h/2}`} fill="none" stroke={route.color} strokeWidth="2.5" strokeDasharray="10 5" opacity=".8"/>:null;})}

        {/* 绘制地块 */}
        {RGN.map(r=>{
          const ctrl=tc(state,r.tid); const color=rgnColor(r); const isSel=sel===r.tid;
          const isAdj=selTile?.adjacentTo.includes(r.tid); const isLow=ctrl<25;
          const status=mapLayer==='supply'?(supplyNetwork.has(r.tid)?'连通':hasSupplyAccess(state,r.tid)?'前沿':'断供'):mapLayer==='orders'?(deployed.some(t=>t.order?.tileId===r.tid)?'驻扎':'未部署'):`${Math.round(ctrl)}%`;
          return(
            <g key={r.tid} role="button" tabIndex={0} aria-label={`${r.lb}，学生控制${Math.round(ctrl)}%`} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();setSel(r.tid===sel?null:r.tid);}}} onClick={()=>setSel(r.tid===sel?null:r.tid)} style={{cursor:'pointer'}}>
              {/* 底色 */}
              <rect x={r.x+5} y={r.y+7} width={r.w} height={r.h} rx={r.rx??2} fill="#080e0f" opacity=".55"/>
              <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={r.rx??2} fill="#05080d" fillOpacity="0.7"
                stroke={isSel?'#eee3be':isAdj?'#aa9e78':'#7c8a80'} strokeWidth={isSel?2.5:isAdj?1.5:0.8}/>
              {/* 全块渐变填充 — 控制度越高颜色越浓，上限0.65避免光污染 */}
              <rect x={r.x+1} y={r.y+1} width={r.w-2} height={r.h-2} rx={Math.max(0,(r.rx??2)-1)}
                fill={color} fillOpacity={mapLayer==='control'?(isSel?.7:.47):mapLayer==='supply'?(isSel?.72:.52):(isSel?.68:.3)}/>
              {mapLayer==='supply'&&!hasSupplyAccess(state,r.tid)&&<rect x={r.x+1} y={r.y+1} width={r.w-2} height={r.h-2} rx={r.rx??2} fill="url(#isolationHatch)"/>}
              {mapLayer==='control'&&<g><rect x={r.x+6} y={r.y+r.h-9} width={Math.max(0,r.w-12)} height="3" fill="#11191a"/><rect x={r.x+6} y={r.y+r.h-9} width={Math.max(0,(r.w-12)*ctrl/100)} height="3" fill={color}/></g>}
              {mapLayer==='orders'&&deployed.some(t=>t.order?.tileId===r.tid)&&<rect x={r.x+2} y={r.y+2} width={r.w-4} height={r.h-4} rx={r.rx??2} fill="none" stroke={route.color} strokeWidth="3" strokeDasharray="5 3" filter="url(#g1)"/>}
              {/* 低控制红色脉冲 */}
              {isLow&&<rect x={r.x} y={r.y} width={r.w} height={r.h} rx={r.rx??2} fill="none" stroke="#a96760" strokeWidth="1" opacity="0.6"/>}
              {/* 选中光晕 */}
              {isSel&&<rect x={r.x-2} y={r.y-2} width={r.w+4} height={r.h+4} rx={(r.rx??2)+2} fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="4,2" filter="url(#g1)"/>}
              {/* 标签 */}
              <text x={r.x+r.w/2} y={r.y+r.h/2+(r.h<35?3:-6)} textAnchor="middle" fontSize={r.w<75?11:13} fontWeight="bold" fill="#d9dfd7" style={{textShadow:'0 1px 3px #000'}}>{SHORT_LABELS[r.tid]||r.lb}</text>
              {r.h>=35&&<text x={r.x+r.w/2} y={r.y+r.h/2+15} textAnchor="middle" fontSize={mapLayer==='control'?17:12} fontWeight="bold" fill={mapLayer==='supply'?'#d1eadd':mapLayer==='orders'?'#c9dce0':color}>
                {mapLayer==='control' ? `${isYy ? (state.yangYuleState ? Math.round((state.yangYuleState.fengFavor + state.yangYuleState.teacherSupport + state.stats.stab) / 3) : 50) : isRf ? reformCtrl(r.tid) : Math.round(ctrl)}%` : status}
              </text>}
              {route.hq===r.tid&&<g><rect x={r.x-5} y={r.y-11} width="28" height="15" fill="#c9b481"/><text x={r.x+9} y={r.y} textAnchor="middle" fill="#172022" fontSize="9" fontWeight="bold">HQ</text></g>}
              {teams.filter(t=>t.order?.tileId===r.tid).map(t=><g key={t.id}><rect x={r.x+r.w-32} y={r.y+r.h-9} width="39" height="19" fill="#cbb888" stroke="#293331"/><text x={r.x+r.w-12} y={r.y+r.h+4} textAnchor="middle" fill="#182020" fontSize="10" fontWeight="bold">{t.order!.reformRegion ? `${t.order!.remaining}天` : mapLayer==='orders'?`${t.order!.repeats}次`:'定期'}</text></g>)}
              {/* 防御标记 */}
              {((state.flags['tile_def_'+r.tid]as number)??0)>0&&(<>
                <rect x={r.x+r.w-20} y={r.y+3} width="16" height="13" fill="#000" rx="2" stroke="#39FF14" strokeWidth="1.2"/>
                <text x={r.x+r.w-12} y={r.y+13} textAnchor="middle" fontSize="8" fill="#39FF14" fontWeight="bold">防</text>
              </>)}
              {/* 邻接指示 */}
              {!isGx&&!isLu&&!isCm&&!isRf&&!isEnd&&ctrl>=60&&r.tid!==sel&&(
                <circle cx={r.x+r.w-6} cy={r.y+6} r="2" fill="#c0d4b2" opacity="0.7"/>
              )}
            </g>
          );
        })}

        {mapLayer==='orders'&&deployed.map((team,index)=>{const r=RGN.find(region=>region.tid===team.order?.tileId);return r?<g key={`unit-${team.id}`} pointerEvents="none"><circle cx={r.x+r.w/2} cy={r.y-11} r="14" fill={route.color} stroke="#e3e8db" strokeWidth="2" filter="url(#g1)"/><text x={r.x+r.w/2} y={r.y-7} textAnchor="middle" fill="#10191b" fontSize="12" fontWeight="bold">{index+1}</text></g>:null;})}
        {mapLayer==='orders'&&teams.some(t=>!t.order)&&<g pointerEvents="none"><rect x="265" y="548" width="270" height="24" fill="#102229" stroke="#558995"/><text x="400" y="564" textAnchor="middle" fill="#b4d0d1" fontSize="11" letterSpacing="1">预备工作组 {teams.filter(t=>!t.order).length} 支 · 点击地区派遣</text></g>}

      </svg>

      <aside className="map-side-note" aria-label="校园态势概览">
        <span>HEFEI / {mapLayer.toUpperCase()} MAP</span>
        <strong>{mapLayer==='control'?'校园态势':mapLayer==='supply'?'补给网络':'工作组部署'}</strong>
        {mapLayer==='control'?<><p>学生主导 <b>{RGN.filter(r => tc(state,r.tid) >= 70).length}</b> 区</p><p>控制争夺 <b>{RGN.filter(r => tc(state,r.tid) >= 25 && tc(state,r.tid) < 70).length}</b> 区</p><p>校方主导 <b>{RGN.filter(r => tc(state,r.tid) < 25).length}</b> 区</p></>:mapLayer==='supply'?<><p>总部连通 <b>{supplyNetwork.size}</b> 区</p><p>前沿可达 <b>{RGN.filter(r=>!supplyNetwork.has(r.tid)&&hasSupplyAccess(state,r.tid)).length}</b> 区</p><p>交通隔绝 <b>{RGN.filter(r=>!hasSupplyAccess(state,r.tid)).length}</b> 区</p></>:<><p>驻扎工作组 <b>{deployed.length}</b> 支</p><p>待命工作组 <b>{teams.filter(t=>!t.order).length}</b> 支</p><p>已执行任务 <b>{getCommandState(state).completed}</b> 次</p></>}
        <small>01 / 15 · BINHU CAMPUS</small>
      </aside>

      {/* 缩放控件 */}
      <div className="map-zoom-controls" role="group" aria-label="地图缩放">
        {[{l:'−',a:()=>setZoom(z=>Math.max(0.5,z-0.2))},{l:'⟳',a:()=>{setZoom(1);setPan({x:0,y:0});}},{l:'+',a:()=>setZoom(z=>Math.min(3,z+0.2))}].map((b,i)=>(
          <button key={i} onClick={e=>{e.stopPropagation();b.a();}} className="map-zoom-button" aria-label={['缩小地图','重置地图缩放','放大地图'][i]}>{b.l}</button>
        ))}
      </div>
      </div>
      <div className="map-legend">{(mapLayer==='supply' ? [['#a2c4bc','总部连通'],['#c9b481','邻接可达'],['#665d59','孤立地区']] : mapLayer==='orders' ? [[route.color,'工作组驻扎'],['#56656a','未部署']] : [['#91bdc3','学生主导'],['#b8aa87','争夺中'],['#a94340','校方主导']]).map(([color,label])=><span key={label}><i style={{background:color}}/>{label}</span>)}<span className="map-hint">点击地区部署 · Alt 拖动 · 滚轮缩放</span></div>
      </div>

      {/* 固定地区侧栏，与地图分列，不遮挡沙盘。 */}
      {selTile&&selRgn&&districtDockTarget&&createPortal(
        <div className="territory-dock">
          <div className="territory-heading">
            <div><h3>{selRgn.lb}</h3></div>
            <button onClick={()=>setSel(null)} aria-label="关闭地区面板">✕</button>
          </div>

          <div className="text-xs text-gray-400 mb-2">
            {BN[selTile.buildingId]} | 全建筑控制度 <span style={{color:ctrlColor(bc(state,selTile.buildingId))}} className="font-bold">{Math.round(bc(state,selTile.buildingId))}%</span>
          </div>

          {/* 邻接地块 */}
          <div className="mb-3 p-2 bg-[#0a0f18] border border-[#1a2a3a]">
            <div className="text-[11px] text-gray-500 mb-1">邻接地块（点击跳转）</div>
            {selTile.adjacentTo.map(aid=>{
              const adj=ALL_SUB_TILES.find(t=>t.id===aid);const ar=RGN.find(r=>r.tid===aid);
              if(!adj||!ar)return null;const ac=tc(state,aid);
              return(<div key={aid} className="flex justify-between text-xs py-0.5 cursor-pointer hover:text-[#ff4444] hover:bg-[#ff4444]/5 px-1 rounded" onClick={()=>setSel(aid)}>
                <span className="text-gray-400">{ar.lb}</span><span className="font-bold" style={{color:ctrlColor(ac)}}>{Math.round(ac)}%</span>
              </div>);
            })}
          </div>

          {/* 行动 */}
          <details className="legacy-actions" open><summary>地区行动与机构</summary><div className="space-y-1.5">
            {!isReb&&!isGx&&!isLu&&!isCm&&!isWu&&!isRf&&!isEnd&&!isYy&&!isJd&&!isEl&&!isPoll&&(<>
              {selTile.buildingId==='b3'&&<Btn n="地下串联" c="20 卷子" d="控制度+10，支持+2" on={()=>act(sel,'b3_under')} ok={state.stats.tpr>=20} cd={cd('b3_under')}/>}
              {selTile.buildingId==='auditorium'&&<Btn n="拉拢社团" c="20 PP" d="控制度+10，团结+5" on={()=>act(sel,'aud_coop')} ok={state.stats.pp>=20} cd={cd('aud_coop')}/>}
              {selTile.buildingId==='playground'&&<Btn n="组织体育活动" c="10 PP" d="控制度+10，理智+5" on={()=>act(sel,'pl_sports')} ok={state.stats.pp>=10} cd={cd('pl_sports')}/>}
            </>)}
            {isReb&&!isGx&&!isLu&&!isCm&&!isWu&&!isRf&&!isEnd&&!isYy&&!isJd&&!isEl&&!isPoll&&(<>
              <Btn n="增强控制" c="15 PP" d="控制度+12" on={()=>act(sel,'boost')} ok={state.stats.pp>=15} cd={cd('boost')}/>
              <Btn n="设置防御工事" c="30 PP" d="7天免疫AI渗透" on={()=>act(sel,'defend')} ok={state.stats.pp>=30} cd={cd('defend')}/>
              <Btn n="动员宣传" c="10 PP" d="控制度+8, SS+3" on={()=>act(sel,'rally')} ok={state.stats.pp>=10} cd={cd('rally')}/>

              {selTile.buildingId==='b3'&&<>
                <div className="text-[11px] text-[#39FF14] border-t border-[#39FF14]/20 pt-1.5 mt-1.5">— B3革命中枢 —</div>
                <Btn n="地下串联" c="20 TPR" d="控制度+10, SS+2" on={()=>act(sel,'b3_under')} ok={state.stats.tpr>=20} cd={cd('b3_under')}/>
                <Btn n="死守楼道" c="50 PP" d="14天防御" on={()=>act(sel,'b3_fort')} ok={state.stats.pp>=50} cd={cd('b3_fort')}/>
                <Btn n="散发传单" c="25 PP" d="控制度+8, 愤怒+5, SS+4" on={()=>act(sel,'b3_leaf')} ok={state.stats.pp>=25} cd={cd('b3_leaf')}/>
              </>}

              {selTile.buildingId==='admin'&&<>
                <div className="text-[11px] text-[#f97316] border-t border-[#f97316]/20 pt-1.5 mt-1.5">— 行政楼渗透 —</div>
                <Btn n="渗透行政" c="30 PP" d="控制度+5, 资本渗透+10" on={()=>act(sel,'adm_infil')} ok={state.stats.pp>=30} cd={cd('adm_infil')}/>
                <Btn n="黑入广播网" c="80 PP" d="风险:SS判定+20/稳-15" on={()=>act(sel,'adm_hack')} ok={state.stats.pp>=80} cd={cd('adm_hack')}/>
              </>}

              {selTile.buildingId==='b1b2'&&<>
                <div className="text-[11px] text-[#3B82F6] border-t border-[#3B82F6]/20 pt-1.5 mt-1.5">— 群众动员 —</div>
                <Btn n="发表演讲" c="20 PP" d="控制度+10, SS+5" on={()=>act(sel,'speech')} ok={state.stats.pp>=20} cd={cd('speech')}/>
                <Btn n="唤醒做题家" c="30 PP" d="转化20%控→SS" on={()=>act(sel,'b12_awk')} ok={state.stats.pp>=30} cd={cd('b12_awk')}/>
                <Btn n="倾销教辅" c="5 稳定度" d="+300 TPR, 稳-5" on={()=>act(sel,'b12_dump')} ok={state.stats.stab>=5} cd={cd('b12_dump')}/>
              </>}

              {selTile.buildingId==='auditorium'&&<>
                <div className="text-[11px] text-[#c084fc] border-t border-[#c084fc]/20 pt-1.5 mt-1.5">— 宣传阵地 —</div>
                <Btn n="拉拢社团" c="20 PP" d="控制度+10, 团结+5" on={()=>act(sel,'aud_coop')} ok={state.stats.pp>=20} cd={cd('aud_coop')}/>
                {state.completedFocuses.includes('expand_assembly')&&<Btn n="民主沙龙" c="40 PP" d="控制度+15, 团结+5" on={()=>act(sel,'aud_salon')} ok={state.stats.pp>=40} cd={cd('aud_salon')}/>}
              </>}

              {selTile.buildingId==='lab'&&<>
                <div className="text-[11px] text-[#06B6D4] border-t border-[#06B6D4]/20 pt-1.5 mt-1.5">— 技术情报 —</div>
                <Btn n="占领设施" c="20 PP" d="控制度+10, TPR+50" on={()=>act(sel,'lab_occ')} ok={state.stats.pp>=20} cd={cd('lab_occ')}/>
                <Btn n="印制传单" c="50 TPR" d="PP+20" on={()=>act(sel,'lab_print')} ok={state.stats.tpr>=50} cd={cd('lab_print')}/>
              </>}

              {selTile.buildingId==='playground'&&<>
                <div className="text-[11px] text-[#22c55e] border-t border-[#22c55e]/20 pt-1.5 mt-1.5">— 集会动员 —</div>
                <Btn n="组织体育活动" c="10 PP" d="控制度+10, 理智+5" on={()=>act(sel,'pl_sports')} ok={state.stats.pp>=10} cd={cd('pl_sports')}/>
                <Btn n="全校总罢操" c="30 PP+10稳" d="全图控+5, 稳-10" on={()=>act(sel,'pl_strike')} ok={state.stats.pp>=30&&state.stats.stab>=10} cd={cd('pl_strike')}/>
              </>}
            </>)}
            {!isReb&&!isGx&&!isLu&&!isCm&&!isWu&&!isRf&&!isEnd&&!isYy&&!isJd&&!isEl&&!isPoll&&<div className="text-red-400/70 text-center text-xs mt-4">起义前仅开放课间、社团与地下联络行动。</div>}
            {isGx&&(<div className="space-y-2 mt-2">
              <div className="text-pink-400 text-center text-xs border-b border-pink-400/20 pb-1">
                🐻 狗熊无政府战区 | 理智度: {state.gouxiongState?.sanity||0}/{state.gouxiongState?.maxSanity||100}
              </div>
              {state.flags[`gx_anarchy_action_tile_${sel}`]&&(<>
                <Btn n="放映番剧渗透" c="10 PP" d="控制度+8, 理智度+3, SS+2" on={()=>act(sel,'gx_anime')} ok={state.stats.pp>=10} cd={cd('gx_anime')}/>
                <Btn n="抽象烂梗轰炸" c="5 理智度" d="控制度+12, 40%几率夺取所有权" on={()=>act(sel,'gx_meme')} ok={(state.gouxiongState?.sanity||0)>=5} cd={cd('gx_meme')}/>
                <Btn n="突击夺权" c="15 PP" d="控制度+10, 30%几率夺取所有权" on={()=>act(sel,'gx_raid')} ok={state.stats.pp>=15} cd={cd('gx_raid')}/>
                {/* 进阶行动：根据解锁的旗标等级显示 */}
                {state.flags[`gx_anarchy_action_tile_${sel}_cutwire`]&&<Btn n="断电战术" c="15 PP" d="控制度+15, 50%几率夺取, 该校地块-5" on={()=>act(sel,'gx_cutwire')} ok={state.stats.pp>=15} cd={cd('gx_cutwire')}/>}
                {state.flags[`gx_anarchy_action_tile_${sel}_swarm`]&&<Btn n="蜂群快闪" c="8 理智度" d="控制度+18, 相邻敌占地块-8" on={()=>act(sel,'gx_swarm')} ok={(state.gouxiongState?.sanity||0)>=8} cd={cd('gx_swarm')}/>}
                {state.flags[`gx_anarchy_action_tile_${sel}_strike`]&&<Btn n="突袭占线" c="20 PP" d="控制度+20, 60%几率夺取所有权" on={()=>act(sel,'gx_strike')} ok={state.stats.pp>=20} cd={cd('gx_strike')}/>}
                {state.flags[`gx_anarchy_action_tile_${sel}_backdoor`]&&<Btn n="后门注入" c="12 PP" d="控制度+12, 40%几率夺取, 相邻同方+5" on={()=>act(sel,'gx_backdoor')} ok={state.stats.pp>=12} cd={cd('gx_backdoor')}/>}
              </>)}
              {!state.flags[`gx_anarchy_action_tile_${sel}`]&&<div className="text-pink-400 text-center text-sm mt-2">该地块尚未解锁 — 通过国策解锁区域行动</div>}
            </div>)}
            {isLu&&(<>
              {state.flags[`lu_purge_action_tile_${sel}`]&&<Btn n={`执行清洗 (Lv${Number(state.flags['lu_purge_zone_level_tile_'+sel]||0)}/3)`} c="20 PP" d="清洗度+1, 控制度+5" on={()=>act(sel,'lu_purge')} ok={state.stats.pp>=20&&Number(state.flags['lu_purge_zone_level_tile_'+sel]||0)<3} cd={cd('lu_purge')}/>}
              {!state.flags[`lu_purge_action_tile_${sel}`]&&<div className="text-red-400 text-center text-sm mt-6">该地块尚未授权清洗 — 需先完成分支国策</div>}
            </>)}
            {isCm&&(<>
              {state.flags[`haobang_commune_action_tile_${sel}`]&&<Btn n={`建设公社 (Lv${Number(state.flags['haobang_commune_zone_level_tile_'+sel]||0)}/3)`} c="25 PP" d="建设度+1, 控制度+8, SS+2" on={()=>act(sel,'cm_build')} ok={state.stats.pp>=25&&Number(state.flags['haobang_commune_zone_level_tile_'+sel]||0)<3} cd={cd('cm_build')}/>}
              {!state.flags[`haobang_commune_action_tile_${sel}`]&&<div className="text-green-400 text-center text-sm mt-6">该地块尚未解锁 — 需先完成分支国策</div>}
            </>)}
            {isWu&&(<div className="space-y-2 mt-2">
              <div className="text-[#c9a86a] text-center text-xs border-b border-[#c9a86a]/20 pb-1">
                🛡️ 戒严区 | 残党实力: {(state.wuState?.guerrillaStrength??0).toFixed(2)} | 戒严等级: Lv{state.wuState?.martialLawLevel||0}
              </div>
              {state.flags['wu_cell_'+sel]!==undefined&&<div className="text-red-400 text-xs text-center p-2 border border-red-500/20 bg-red-500/5 rounded">
                ⚠️ 残党细胞活跃中（第{state.flags['wu_cell_'+sel]}天）！5天内不清除将夺占该地块，并触发本区域造反事件
              </div>}
              <Btn n="巡逻扫荡" c="10 PP" d="校方控制+12, 残党-1, 愤怒+1" on={()=>act(sel,'wu_patrol')} ok={state.stats.pp>=10} cd={cd('wu_patrol')}/>
              <Btn n="设卡封锁" c="20 PP" d="清除残党细胞, 封锁5天, 愤怒+2" on={()=>act(sel,'wu_checkpoint')} ok={state.stats.pp>=20} cd={cd('wu_checkpoint')}/>
              <Btn n="情报收集" c="15 PP" d="清除残党细胞或残党-1" on={()=>act(sel,'wu_intel')} ok={state.stats.pp>=15} cd={cd('wu_intel')}/>
              {state.flags.wu_arrest_unlocked&&<Btn n="定点抓捕" c="25 PP" d="清除残党细胞, 残党-3, 愤怒+3" on={()=>act(sel,'wu_arrest')} ok={state.stats.pp>=25} cd={cd('wu_arrest')}/>}
              <div className="text-[#c9a86a]/50 text-[10px] text-center">愤怒: {(state.wuState?.studentAnger??0).toFixed(2)} | 野心: {(state.wuState?.wuAmbition??0).toFixed(2)} | 舆论: {(state.wuState?.publicOpinion??0).toFixed(2)}</div>
            </div>)}
            {isYy&&(<div className="space-y-2 mt-2">
              <div className="text-amber-400/80 text-center text-xs border-b border-amber-400/20 pb-1">
                🏫 校园维稳监控 | 健康: {state.yangYuleState?.health||0} | 信任: {state.yangYuleState?.fengFavor||0}%
              </div>
              {state.yangYuleState?.rebelLocations[sel] ? (
                <div className="text-red-400 text-xs text-center p-2 border border-red-500/20 bg-red-500/5 rounded">
                  ⚠️ 红蛤暴动中！剩余 {state.yangYuleState.rebelLocations[sel]} 天——在办公桌镇压
                </div>
              ) : (
                <div className="text-amber-400/50 text-xs text-center">
                  维稳度: {Math.round(((state.yangYuleState?.fengFavor||0)+(state.yangYuleState?.teacherSupport||0)+state.stats.stab)/3)}% | 无活跃暴动
                </div>
              )}
              <div className="text-amber-400/40 text-[10px] text-center">在办公桌界面查看全局维稳态势</div>
              <Btn n="教师驻点协调" c="20 PP" d="教师支持+3，信任+2，工作室成果+1，健康-1" on={()=>act(sel,'yy_coord')} ok={state.stats.pp>=20&&!!state.yangYuleState} cd={cd('yy_coord')}/>
            </div>)}
            {isRf&&(<div className="space-y-2 mt-2">
              <div className="text-[#ff6b6b] text-center text-xs border-b border-[#ff6b6b]/20 pb-1">— 做题改革阶段 —</div>
              <div className="text-[#ff6b6b]/70 text-center text-xs">地图争斗结束，转向政治建设</div>
            </div>)}
            {(isEl||isPoll)&&(<div className="space-y-2 mt-2">
              <div className={`text-xs border-b pb-1 text-center ${isEl?'text-blue-400 border-blue-400/20':'text-blue-300 border-blue-300/20'}`}>{isEl?'— 大选进行中 —':'— 选举准备阶段 —'}</div>
              <Btn n="查看民调" c="10 PP" d={`查看${selRgn.lb}的各派系民调数据`} on={()=>act(sel,'view_poll')} ok={state.stats.pp>=10} cd={cd('view_poll')}/>
              <Btn n="区域拉票" c="25 PP" d={`在${selRgn.lb}为${FN[state.electionState?.playerCandidate||'pan']||'候选人'}拉票(+30%)`} on={()=>act(sel,'campaign')} ok={state.stats.pp>=25} cd={cd('campaign')}/>
              {/* 显示民调数据 */}
              {state.flags['poll_viewed_'+sel]&&selTile&&(()=>{
                const bid=selTile.buildingId;
                const pd=state.mapLocations[bid]?.pollingData;
                if(!pd)return null;
                const sorted=Object.entries(pd).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
                return(<div className="mt-2 p-2 border border-blue-500/15 bg-blue-500/5 rounded">
                  <div className="text-[10px] text-blue-300/70 mb-1">{BN[bid]} 民调</div>
                  {sorted.map(([k,v])=>(
                    <div key={k} className="flex items-center gap-1.5 mb-0.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor:FC[k]||'#888'}}/>
                      <span className="text-[10px] text-white/70 flex-1">{FN[k]||k}</span>
                      <span className="text-[10px] text-white font-bold">{Math.round(v)}%</span>
                    </div>
                  ))}
                  <div className="text-[9px] text-white/30 mt-1">总票数: {state.mapLocations[bid]?.totalVotes||'?'} | 已投: {Object.values(state.mapLocations[bid]?.castVotes||{}).reduce((a:number,b:number)=>a+b,0)}</div>
                </div>);
              })()}
            </div>)}
            {isEnd&&(<div className="space-y-2 mt-2">
              <div className="text-[#87CEEB] text-center text-xs border-b border-[#87CEEB]/20 pb-1">— 和平重建阶段 —</div>
              <div className="text-[#87CEEB]/70 text-center text-xs">校园已和平控制，所有冲突结束</div>
            </div>)}
            {isJd&&<div className="space-y-2"><div className="text-yellow-400 text-center text-sm">及第模式 · 地区教学产线</div><Btn n="教学产线优化" c="20 PP" d="卷子+80，GDP+1，理智-2" on={()=>act(sel,'jd_optimize')} ok={state.stats.pp>=20&&!!state.jidiCorporateState} cd={cd('jd_optimize')}/></div>}
          </div></details>
          <CommandPanel state={state} tileId={sel!} setGameState={setGameState} />

          {selCtrl>=60&&selTile.adjacentTo.some(a=>tc(state,a)>=60)&&(
            <div className="mt-2 p-2 border border-[#39FF14]/15 bg-[#39FF14]/5 text-xs text-green-300">邻接加成激活 · 相邻高控制地块互相增益 +0.25%/日</div>
          )}
        </div>, districtDockTarget
      )}

      {/* 大选实时计票覆盖层 */}
      {isEl && isElectionUIOpen && state.electionState && (
        <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-sm flex items-center justify-center p-8" onClick={()=>setIsElectionUIOpen?.(false)}>
          <div className="bg-[#08080f] border-2 border-blue-500/30 max-w-lg w-full p-6 shadow-[0_0_60px_rgba(59,130,246,0.2)]" onClick={e=>e.stopPropagation()}>
            <h2 className="text-2xl font-black text-blue-400 text-center tracking-[0.3em] mb-4">合一首届大选 · 实时计票</h2>
            <div className="text-xs text-white/40 text-center mb-4">
              剩余 {state.electionState.daysLeft} 天 | 总任期 {state.electionState.totalDays} 天
            </div>
            {/* 候选人排名 */}
            {state.electionState.candidates.map(cand=>{
              const votes=state.electionState?.votes[cand]||0;
              const totalVotes=Object.values(state.electionState?.votes||{}).reduce((a:number,b:number)=>a+b,0)||1;
              const pct=Math.round((votes/totalVotes)*100);
              return (
                <div key={cand} className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{backgroundColor:FC[cand]||'#888'}}/>
                      <span className="text-sm font-bold text-white">{FN[cand]||cand}</span>
                    </div>
                    <span className="text-sm font-black text-white">{votes.toLocaleString()} 票 ({pct}%)</span>
                  </div>
                  <div className="h-4 bg-[#0d1117] border border-[#1a2a3a] rounded overflow-hidden">
                    <div className="h-full transition-all duration-500 rounded" style={{width:`${pct}%`,backgroundColor:FC[cand]||'#888'}}/>
                  </div>
                </div>
              );
            })}
            {/* 总计 */}
            <div className="mt-4 pt-3 border-t border-blue-500/20 text-xs text-white/50 text-center">
              累计投票: {Object.values(state.electionState.votes).reduce((a:number,b:number)=>a+b,0).toLocaleString()} 票
              | 全校区总合格选民: 约 {Object.values(state.mapLocations).reduce((a:number,l)=>a+(l.totalVotes||0),0).toLocaleString()}
            </div>
            <button onClick={()=>setIsElectionUIOpen?.(false)} className="mt-4 w-full py-2 border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 text-sm font-bold tracking-wider transition-colors">关闭计票</button>
          </div>
        </div>
      )}
    </div>
  );
}
