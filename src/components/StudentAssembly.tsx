import React from 'react';
import { Hammer, Ghost, Scale, Users, BookOpen, Shield, GraduationCap, ThumbsUp, ThumbsDown } from 'lucide-react';
import { GameState } from '../types';
import { getCommandState } from '../engine/commandSystem';
import AssemblyBalance from './AssemblyBalance';

interface StudentAssemblyProps {
  state: GameState;
  onClose: () => void;
  onInteract: (faction: string, action: 'coopt' | 'suppress' | 'compromise' | 'special_true_left' | 'special_pan_dem_1' | 'special_pan_dem_2' | 'negotiate_orthodox' | 'negotiate_bear' | 'negotiate_pan' | 'negotiate_otherDem' | 'negotiate_testTaker' | 'negotiate_conservativeDem' | 'negotiate_jidiTutoring' | 'support_bill' | 'oppose_bill' | 'haobang_merge_bear' | 'haobang_merge_pan' | 'haobang_floor_coordination') => void;
}

export default function StudentAssembly({ state, onClose, onInteract }: StudentAssemblyProps) {
  const factions = state.studentAssemblyFactions || {
    orthodox: 30,
    bear: 20,
    pan: 20,
    otherDem: 15,
    testTaker: 15,
    conservativeDem: 0,
    jidiTutoring: 0
  };

  const isUpgraded = state.parliamentState?.isUpgraded;
  const isDeluxeAssembly = !!state.flags.haobang_assembly_deluxe_ui;
  const supportLabel = isDeluxeAssembly ? '对钢铁红蛤态度：' : '对潘仁越支持度：';
  const defaultPanSupport: Record<string, number> = {
    orthodox: 10,
    bear: 30,
    pan: 100,
    otherDem: 70,
    testTaker: 50,
    conservativeDem: 40,
    jidiTutoring: 20,
  };
  const defaultHaobangAttitude: Record<string, number> = {
    orthodox: 100,
    bear: 75,
    pan: 35,
    otherDem: 45,
    testTaker: 55,
    conservativeDem: 40,
    jidiTutoring: 15,
  };
  const supportMap = isDeluxeAssembly
    ? { ...defaultHaobangAttitude, ...(state.parliamentState?.haobangFactionAttitude || {}) }
    : { ...defaultPanSupport, ...(state.parliamentState?.factionSupport || {}) };

  const factionIcons: Record<string, React.ReactNode> = {
    orthodox: <Hammer className="w-5 h-5" />,
    bear: <Ghost className="w-5 h-5" />,
    pan: <Scale className="w-5 h-5" />,
    otherDem: <Users className="w-5 h-5" />,
    testTaker: <BookOpen className="w-5 h-5" />,
    conservativeDem: <Shield className="w-5 h-5" />,
    jidiTutoring: <GraduationCap className="w-5 h-5" />,
  };

  const factionDetails = [
    { id: 'orthodox', name: '钢铁红蛤正统派', count: factions.orthodox, color: 'bg-red-500', btnClass: 'border-red-500/50 bg-red-900/30 hover:bg-red-800/50 text-red-300', desc: '坚持原教旨主义，主张彻底的革命。', leader: isDeluxeAssembly ? '王照凯（已逝）' : '王照凯', support: supportMap.orthodox },
    { id: 'bear', name: '钢铁红蛤狗熊派', count: factions.bear, color: 'bg-fuchsia-500', btnClass: 'border-fuchsia-500/50 bg-fuchsia-900/30 hover:bg-fuchsia-800/50 text-fuchsia-300', desc: '二次元缝合怪，追求抽象与解构。', leader: '狗熊', support: supportMap.bear },
    { id: 'pan', name: '潘仁越民主派', count: factions.pan, color: 'bg-blue-500', btnClass: 'border-blue-500/50 bg-blue-900/30 hover:bg-blue-800/50 text-blue-300', desc: '温和的自由派，主张渐进式改革。', leader: '潘仁越', support: supportMap.pan },
    { id: 'otherDem', name: '非建制民主派', count: factions.otherDem, color: 'bg-cyan-500', btnClass: 'border-cyan-500/50 bg-cyan-900/30 hover:bg-cyan-800/50 text-cyan-300', desc: '松散的民主联盟，诉求多样。', leader: '无', support: supportMap.otherDem },
    { id: 'testTaker', name: isUpgraded ? '做题派岁月静好党' : '做题派', count: factions.testTaker, color: 'bg-gray-400', btnClass: 'border-gray-400/50 bg-gray-700/30 hover:bg-gray-600/50 text-gray-300', desc: isUpgraded ? '只关心成绩，希望尽快恢复秩序，岁月静好。' : '只关心成绩，希望尽快恢复秩序。', leader: '无', support: supportMap.testTaker },
  ];

  if (isUpgraded) {
    factionDetails.push(
      { id: 'conservativeDem', name: '保守民主派', count: factions.conservativeDem || 0, color: 'bg-indigo-600', btnClass: 'border-indigo-500/50 bg-indigo-900/30 hover:bg-indigo-800/50 text-indigo-300', desc: '支持有限民主，反对过度激进的改革。', leader: '徐志', support: supportMap.conservativeDem },
      { id: 'jidiTutoring', name: '及第补习派', count: factions.jidiTutoring || 0, color: 'bg-yellow-600', btnClass: 'border-yellow-500/50 bg-yellow-900/30 hover:bg-yellow-800/50 text-yellow-300', desc: '资本的代理人，主张教育市场化。', leader: '及第代表', support: supportMap.jidiTutoring }
    );
  }

  const leadingFaction = isUpgraded ? 'pan' : 'orthodox';
  const isPlayerBill = !state.parliamentState?.activeBill?.proposer || state.parliamentState.activeBill.proposer === leadingFaction;

  // Generate 100 dots based on counts
  const dots: { id: string; color: string }[] = [];
  factionDetails.forEach(f => {
    for (let i = 0; i < f.count; i++) {
      dots.push({ id: f.id, color: f.color });
    }
  });

  const hasTrueLeftSpecial = state.completedFocuses.includes('orthodox_dominance') || state.completedFocuses.includes('final_revolution');
  const hasPanDemSpecial = state.completedFocuses.includes('expand_assembly') || state.completedFocuses.includes('democratic_reforms');
  const canHaobangMergeBear = !!state.flags.haobang_bear_merge_ready && !state.flags.haobang_bear_merged;
  const canHaobangMergePan = !!state.flags.haobang_pan_merge_ready && !state.flags.haobang_pan_merged;
  const canHaobangCoordination = !!state.flags.haobang_assembly_upgrade_program;

  return (
    <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8">
      <div className={`assembly-panel bg-zinc-900 border-2 border-tno-border w-full ${isDeluxeAssembly ? 'max-w-6xl' : 'max-w-4xl'} max-h-full flex flex-col shadow-2xl`}>
        {/* Header */}
        <div className="p-4 border-b border-tno-border bg-black flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-widest text-tno-highlight">{isDeluxeAssembly ? '新学生代表大会' : (isUpgraded ? '合一学生议会' : '学生代表大会')}</h2>
          <button onClick={onClose} className="text-tno-red hover:text-white font-bold border border-tno-red px-4 py-1">
            关闭
          </button>
        </div>

        {isDeluxeAssembly && (
          <div className="px-4 py-2 border-b border-tno-border bg-gradient-to-r from-blue-900/20 via-cyan-900/20 to-emerald-900/20 text-xs text-tno-text/80 flex items-center justify-between">
            <span>豪邦路线升级议会：开放并席整编与跨派协调决议</span>
            <span className="text-tno-highlight">特别交互已启用</span>
          </div>
        )}



        {state.parliamentState?.activeBill && (
          <div className="p-4 border-b border-tno-border bg-blue-900/20">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-bold text-blue-400">正在表决：{state.parliamentState.activeBill.name}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  提案方: <span className="text-gray-200 font-medium">{
                    state.parliamentState.activeBill.proposer 
                      ? factionDetails.find(f => f.id === state.parliamentState!.activeBill!.proposer)?.name || '未知'
                      : '未知'
                  }</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">剩余表决时间</div>
                <div className={`text-2xl font-bold ${state.parliamentState.activeBill.daysLeft <= 3 ? 'text-red-400 animate-pulse' : 'text-blue-300'}`}>
                  {state.parliamentState.activeBill.daysLeft} 天
                </div>
              </div>
            </div>
            <div className="flex justify-between text-sm mb-2 mt-4">
              <span>当前赞同: {state.parliamentState.activeBill.baseApproval + state.parliamentState.activeBill.lobbiedApproval} / {state.parliamentState.activeBill.requiredApproval} 票</span>
            </div>
            <div className="w-full h-2 bg-gray-800 mb-4 relative">
              <div 
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${Math.min(100, state.parliamentState.activeBill.baseApproval + state.parliamentState.activeBill.lobbiedApproval)}%` }}
              />
              <div 
                className="absolute top-0 bottom-0 w-1 bg-yellow-400 z-10"
                style={{ left: `${state.parliamentState.activeBill.requiredApproval}%` }}
                title={`需要 ${state.parliamentState.activeBill.requiredApproval} 票通过`}
              />
            </div>
            {state.parliamentState.activeBill.interactionsRemaining > 0 && (
              <div className="mt-4 border-t border-tno-border/50 pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-tno-highlight">
                    {isPlayerBill ? '拉票交涉' : '议案表态'}
                  </span>
                  {isPlayerBill && (
                    <span className="text-xs text-gray-400">剩余次数: {state.parliamentState.activeBill.interactionsRemaining}</span>
                  )}
                </div>
                
                {isPlayerBill ? (
                  <div className="flex w-full gap-1">
                    {factionDetails.map(faction => {
                      if (faction.id === leadingFaction) return null;

                      const actionName = `negotiate_${faction.id}` as any;
                      const isDisabled = state.parliamentState!.activeBill!.interactedFactions.includes(faction.id) || state.parliamentState!.activeBill!.interactionsRemaining <= 0;

                      return (
                        <button
                          key={faction.id}
                          className={`relative group p-1 rounded-md border transition-all flex-1 flex flex-col items-center justify-center gap-1 min-w-0 ${
                            isDisabled 
                              ? 'opacity-50 cursor-not-allowed border-gray-600 bg-gray-800/50 text-gray-500' 
                              : faction.btnClass
                          }`}
                          onClick={() => onInteract(faction.id, actionName)}
                          disabled={isDisabled}
                        >
                          {factionIcons[faction.id]}
                          <span className="text-[10px] text-center leading-[1.1] break-words whitespace-normal w-full">{faction.name}</span>
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max z-50">
                            <div className="bg-black border border-tno-border p-2 shadow-xl text-xs">
                              <div className="font-bold text-white mb-1">{faction.name}</div>
                              <div className="text-gray-400">
                                {state.parliamentState!.activeBill!.interactedFactions.includes(faction.id) ? '已交涉' : 
                                 state.parliamentState!.activeBill!.interactionsRemaining <= 0 ? '交涉次数已用完' :
                                 `点击与${faction.name}交涉拉票`}
                              </div>
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-tno-border" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <button
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-900/50 hover:bg-green-800/50 border border-green-500/50 text-green-200 text-sm transition-colors disabled:opacity-50"
                      onClick={() => onInteract(leadingFaction, 'support_bill')}
                      disabled={state.stats.pp < 10 || state.parliamentState.activeBill.interactedFactions.includes('support_bill') || state.parliamentState.activeBill.interactedFactions.includes('oppose_bill')}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      支持该议案 (-10 PP)
                    </button>
                    <button
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-900/50 hover:bg-red-800/50 border border-red-500/50 text-red-200 text-sm transition-colors disabled:opacity-50"
                      onClick={() => onInteract(leadingFaction, 'oppose_bill')}
                      disabled={state.stats.pp < 10 || state.parliamentState.activeBill.interactedFactions.includes('support_bill') || state.parliamentState.activeBill.interactedFactions.includes('oppose_bill')}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      反对该议案 (-10 PP)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {!state.parliamentState?.activeBill && isUpgraded && (
          <div className="p-4 border-b border-tno-border bg-black/30 text-center text-gray-500 text-sm">
            议会当前处于休会期，等待新的议案提交。
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
          {/* Left: Parliament View */}
          <div className="flex-1 flex flex-col items-center">
            <h3 className="text-lg font-bold mb-4">议会席位分布（{dots.length}席）</h3>
            <div className="assembly-hemicycle">
              <svg viewBox="0 0 360 215" role="img" aria-label={`学生代表大会，${dots.length}席`}>
                {[62,87,112,137,162].map(r => <path key={r} d={`M${180-r} 180A${r} ${r} 0 0 1 ${180+r} 180`} stroke="#41565b" strokeWidth=".7" fill="none" />)}
                {(() => {
                  const colors: Record<string,string> = {orthodox:'#c67b72',bear:'#ad78a3',pan:'#7f9fc6',otherDem:'#72b5b8',testTaker:'#b1b6ae',conservativeDem:'#8988b3',jidiTutoring:'#c3a263'};
                  const seats: {x:number;y:number;angle:number}[]=[];
                  // Allocate the actual seat total across five curved rows; faction blocks follow angular order.
                  let remaining=dots.length;
                  [12,16,20,24,28].forEach((weight,row) => {
                    const count=row===4?remaining:Math.round(dots.length*weight/100); remaining-=count;
                    for(let j=0;j<count;j++) { const angle=Math.PI-(j+.5)*Math.PI/count; const r=62+row*25; seats.push({x:180+r*Math.cos(angle),y:180-r*Math.sin(angle),angle}); }
                  });
                  seats.sort((a,b)=>b.angle-a.angle);
                  return seats.map((seat,i)=><rect key={i} x={seat.x-3.4} y={seat.y-3.4} width="6.8" height="6.8" rx="1" fill={colors[dots[i].id]} stroke="#e0e0c7" strokeWidth=".4"><title>{factionDetails.find(f=>f.id===dots[i].id)?.name}</title></rect>);
                })()}
                <path d="M143 182h74l-8 17h-58Z" fill="#1e3035" stroke="#a2afa1" />
                <text x="180" y="194" textAnchor="middle" fontSize="8" fill="#d0c3a1" letterSpacing="3">主席台</text>
              </svg>
              <div className="assembly-legend">{factionDetails.filter(f=>f.count>0).map(f=><span key={f.id}><i className={f.color}/>{f.name} · {f.count}</span>)}</div>
            </div>

            {state.parliamentState?.powerBalanceUnlocked && (
              <div className="mt-6 w-full max-w-md bg-black/50 p-4 border border-tno-border">
                <div className="text-center font-bold text-tno-highlight mb-4 tracking-widest">权力平衡</div>
                <div className="relative w-full h-6 bg-gray-800 border border-tno-border flex">
                  {/* Stages */}
                  <div className="flex-1 border-r border-gray-600 group relative cursor-help">
                    <div className="absolute inset-0 hover:bg-white/10 transition-colors" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-tno-panel border border-tno-border p-2 hidden group-hover:block z-50 shadow-lg text-left">
                      <div className="font-bold text-blue-400 text-sm mb-1">极度素质教育 (0-19)</div>
                      <div className="text-xs text-tno-text/80">每日PP <span className="text-tno-green">+1</span></div>
                      <div className="text-xs text-tno-text/80">每日TPR <span className="text-tno-red">-10</span></div>
                      <div className="text-xs text-tno-text/80">每日学生理智值 <span className="text-tno-green">+0.5%</span></div>
                    </div>
                  </div>
                  <div className="flex-1 border-r border-gray-600 group relative cursor-help">
                    <div className="absolute inset-0 hover:bg-white/10 transition-colors" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-tno-panel border border-tno-border p-2 hidden group-hover:block z-50 shadow-lg text-left">
                      <div className="font-bold text-blue-300 text-sm mb-1">偏向素质教育 (20-39)</div>
                      <div className="text-xs text-tno-text/80">每日PP <span className="text-tno-green">+0.5</span></div>
                      <div className="text-xs text-tno-text/80">每日TPR <span className="text-tno-red">-5</span></div>
                    </div>
                  </div>
                  <div className="flex-1 border-r border-gray-600 group relative cursor-help">
                    <div className="absolute inset-0 hover:bg-white/10 transition-colors" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-tno-panel border border-tno-border p-2 hidden group-hover:block z-50 shadow-lg text-left">
                      <div className="font-bold text-gray-300 text-sm mb-1">平衡 (40-60)</div>
                      <div className="text-xs text-tno-text/80">无额外效果</div>
                    </div>
                  </div>
                  <div className="flex-1 border-r border-gray-600 group relative cursor-help">
                    <div className="absolute inset-0 hover:bg-white/10 transition-colors" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-tno-panel border border-tno-border p-2 hidden group-hover:block z-50 shadow-lg text-left">
                      <div className="font-bold text-yellow-500 text-sm mb-1">偏向应试教育 (61-80)</div>
                      <div className="text-xs text-tno-text/80">每日PP <span className="text-tno-red">-0.5</span></div>
                      <div className="text-xs text-tno-text/80">每日TPR <span className="text-tno-green">+10</span></div>
                    </div>
                  </div>
                  <div className="flex-1 group relative cursor-help">
                    <div className="absolute inset-0 hover:bg-white/10 transition-colors" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-tno-panel border border-tno-border p-2 hidden group-hover:block z-50 shadow-lg text-left">
                      <div className="font-bold text-red-500 text-sm mb-1">极度应试教育 (81-100)</div>
                      <div className="text-xs text-tno-text/80">每日PP <span className="text-tno-red">-1</span></div>
                      <div className="text-xs text-tno-text/80">每日TPR <span className="text-tno-green">+20</span></div>
                      <div className="text-xs text-tno-text/80">每日学生理智值 <span className="text-tno-red">-0.5%</span></div>
                    </div>
                  </div>

                  {/* Indicator */}
                  <div 
                    className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-500 -translate-x-1/2 z-10"
                    style={{ left: `${state.parliamentState.powerBalance}%` }}
                  />
                  
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-transparent to-red-500/30 pointer-events-none" />
                </div>
                <div className="flex justify-between text-xs mt-2 text-gray-400 font-bold">
                  <span className="text-blue-400">素质教育</span>
                  <span className="text-red-500">应试教育</span>
                </div>
              </div>
            )}

            <AssemblyBalance state={state} />

            {/* Special Actions */}
            {(hasTrueLeftSpecial || hasPanDemSpecial || canHaobangMergeBear || canHaobangMergePan || canHaobangCoordination) && (
              <div className="mt-6 w-full bg-black/40 border border-tno-border p-4">
                <h3 className="text-md font-bold mb-3 text-tno-highlight">特殊决议</h3>
                <div className="flex flex-col gap-2">
                  {hasTrueLeftSpecial && (
                    <button 
                      onClick={() => onInteract('orthodox', 'special_true_left')}
                      disabled={state.stats.pp < 20}
                      className="w-full text-left p-2 border border-tno-red text-tno-red hover:bg-tno-red hover:text-black disabled:opacity-50 transition-colors"
                    >
                      <div className="font-bold">斗私批修 (-20 PP)</div>
                      <div className="text-xs opacity-80">正统派席位 +2，其他派系席位 -2。党内集权度 +5，联盟团结度 -5。</div>
                    </button>
                  )}
                  {hasPanDemSpecial && (
                    <>
                      <button 
                        onClick={() => onInteract('pan', 'special_pan_dem_1')}
                        disabled={state.stats.pp < 25 || (state.decisionCooldowns['special_pan_dem_1'] || 0) > 0}
                        className="w-full text-left p-2 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-black disabled:opacity-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-bold">合一百团大战社团活动 (-25 PP)</div>
                          {(state.decisionCooldowns['special_pan_dem_1'] || 0) > 0 && (
                            <div className="text-xs text-tno-red font-bold">冷却中: {state.decisionCooldowns['special_pan_dem_1']} 天</div>
                          )}
                        </div>
                        <div className="text-xs opacity-80">潘仁越派席位 +2，正统派席位 -2。联盟团结度 +5，党内集权度 -5。</div>
                      </button>
                      <button 
                        onClick={() => onInteract('pan', 'special_pan_dem_2')}
                        disabled={state.stats.pp < 25 || (state.decisionCooldowns['special_pan_dem_2'] || 0) > 0}
                        className="w-full text-left p-2 border border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black disabled:opacity-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-bold">百花齐放 (-25 PP)</div>
                          {(state.decisionCooldowns['special_pan_dem_2'] || 0) > 0 && (
                            <div className="text-xs text-tno-red font-bold">冷却中: {state.decisionCooldowns['special_pan_dem_2']} 天</div>
                          )}
                        </div>
                        <div className="text-xs opacity-80">非建制民主派席位 +1，正统派席位 -1。联盟团结度 +10，党内集权度 -10。</div>
                      </button>
                    </>
                  )}
                  {(canHaobangMergeBear || canHaobangMergePan || canHaobangCoordination) && (
                    <>
                      <button 
                        onClick={() => onInteract('orthodox', 'haobang_merge_bear')}
                        disabled={state.stats.pp < 15 || !canHaobangMergeBear}
                        className="w-full text-left p-2 border border-fuchsia-500 text-fuchsia-400 hover:bg-fuchsia-500 hover:text-black disabled:opacity-50 transition-colors"
                      >
                        <div className="font-bold">并席整编：狗熊并红蛤 (-15 PP)</div>
                        <div className="text-xs opacity-80">将狗熊派席位并入钢铁红蛤，提升联盟团结度与稳定度。</div>
                      </button>
                      <button 
                        onClick={() => onInteract('pan', 'haobang_merge_pan')}
                        disabled={state.stats.pp < 20 || !canHaobangMergePan}
                        className="w-full text-left p-2 border border-blue-400 text-blue-300 hover:bg-blue-400 hover:text-black disabled:opacity-50 transition-colors"
                      >
                        <div className="font-bold">并席整编：潘并红蛤 (-20 PP)</div>
                        <div className="text-xs opacity-80">将潘派席位并入钢铁红蛤，显著提升路线统一度与学生支持度。</div>
                      </button>
                      <button 
                        onClick={() => onInteract('otherDem', 'haobang_floor_coordination')}
                        disabled={state.stats.pp < 10 || (state.decisionCooldowns['haobang_floor_coordination'] || 0) > 0 || !canHaobangCoordination}
                        className="w-full text-left p-2 border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black disabled:opacity-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-bold">跨派楼层协调 (-10 PP)</div>
                          {(state.decisionCooldowns['haobang_floor_coordination'] || 0) > 0 && (
                            <div className="text-xs text-tno-red font-bold">冷却中: {state.decisionCooldowns['haobang_floor_coordination']} 天</div>
                          )}
                        </div>
                        <div className="text-xs opacity-80">改善温和派与自治派关系，提升联盟团结度与议会支持环境。</div>
                        {(getCommandState(state).preparation?.commune || 0) > 0 && <div className="text-xs mt-1">地区工作组筹备：将投入 {Math.min(3, getCommandState(state).preparation?.commune || 0)} 份</div>}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Faction Interactions */}
          <div className="w-full md:w-96 flex flex-col gap-4">
            <h3 className="text-lg font-bold mb-2">派系互动</h3>
            {factionDetails.map(faction => (
              <div key={faction.id} className="bg-black/40 border border-tno-border p-3 flex flex-col gap-2 group relative">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${faction.color}`} />
                    <span className="font-bold">{faction.name}</span>
                  </div>
                  <span className="text-tno-highlight font-mono">{faction.count} 席</span>
                </div>
                <div className="text-xs text-tno-text/70 mb-2">{faction.desc}</div>
                
                {/* Hover Info */}
                {isUpgraded && (
                  <div className="hidden group-hover:block absolute z-50 left-0 top-full mt-1 w-full bg-zinc-900 border border-tno-border p-2 shadow-xl text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="text-tno-text/70">领导人：</span>
                      <span className="font-bold">{faction.leader}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-tno-text/70">{supportLabel}</span>
                      <span className={`font-bold ${faction.support >= 70 ? 'text-green-400' : faction.support >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {faction.support}%
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => onInteract(faction.id, 'coopt')}
                    disabled={state.stats.pp < 10}
                    className="text-xs py-1 px-2 border border-tno-border hover:bg-tno-highlight hover:text-black disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-tno-text transition-colors"
                    title="消耗 10 PP，联盟团结度 +10，党内集权度 -5"
                  >
                    拉拢 (-10 PP)
                  </button>
                  <button 
                    onClick={() => onInteract(faction.id, 'suppress')}
                    disabled={state.stats.pp < 15}
                    className="text-xs py-1 px-2 border border-tno-red text-tno-red hover:bg-tno-red hover:text-black disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-tno-red transition-colors"
                    title="消耗 15 PP，提升党内集权度，降低联盟团结度"
                  >
                    打压 (-15 PP)
                  </button>
                  <button 
                    onClick={() => onInteract(faction.id, 'compromise')}
                    className="text-xs py-1 px-2 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-black transition-colors"
                    title={`提升联盟团结度，但增加该派系席位（减少${isUpgraded ? '潘仁越派' : '正统派'}席位）`}
                  >
                    妥协
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
