import React, { useState } from 'react';
import { JidiCorporateState } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { X, TrendingUp, BookOpen, FlaskConical, Users, DollarSign, AlertTriangle, Terminal, Cpu, ShieldAlert } from 'lucide-react';
import { getJidiProductImageUrl } from '../config/assets';

interface JidiCorporateUIProps {
  state: JidiCorporateState;
  pp: number;
  flags: Record<string, boolean>;
  onClose: () => void;
  onStartRnd: (faction: 'jidi' | 'newOriental' | 'teachers', productName: string, eventId: string, image: string) => void;
  onChangeTestingIntensity: (intensity: number) => void;
  onRndAction: (actionType: string) => void;
  onProposeBill: (faction: 'jidi' | 'newOriental' | 'teachers' | 'disciplineCommittee', type: string) => void;
  onLobby: (faction: 'jidi' | 'newOriental' | 'teachers' | 'disciplineCommittee') => void;
  onSuppressRiot?: () => void;
  onAppeaseBureau?: () => void;
  onAppeaseStudents?: () => void;
  onEventTrigger?: (eventId: string) => void;
  tpr?: number;
}

export function JidiCorporateUI({
  state,
  pp,
  onClose,
  onStartRnd,
  onChangeTestingIntensity,
  onRndAction,
  onProposeBill,
  onLobby,
  onSuppressRiot,
  onAppeaseBureau,
  onAppeaseStudents,
  onEventTrigger,
  tpr,
  flags
}: JidiCorporateUIProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'rnd' | 'committee' | 'riot'>('overview');

  console.log('JidiCorporateUI state.lockedUI:', state.lockedUI);

  const LockdownOverlay = ({ text }: { text: string }) => (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,#ff0000_20px,#ff0000_40px)]"></div>
      <div className="relative border-4 border-red-600 text-red-600 font-black text-6xl md:text-8xl tracking-widest p-4 md:p-8 transform -rotate-12 shadow-[0_0_30px_rgba(255,0,0,0.5)] bg-black/80">
        {text}
        <div className="absolute inset-0 border-2 border-red-600 m-2 opacity-50"></div>
      </div>
      <div className="absolute top-1/4 left-[-10%] w-[120%] h-12 bg-yellow-400/80 transform rotate-6 flex items-center justify-around text-black font-bold text-xl overflow-hidden shadow-lg">
        {Array(10).fill('CAUTION - SEALED - ').map((t, i) => <span key={i}>{t}</span>)}
      </div>
      <div className="absolute bottom-1/4 left-[-10%] w-[120%] h-12 bg-yellow-400/80 transform -rotate-3 flex items-center justify-around text-black font-bold text-xl overflow-hidden shadow-lg">
        {Array(10).fill('DO NOT CROSS - ').map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </div>
  );

  const chartData = state.gdpHistory.map((val, index) => ({
    month: `M${index + 1}`,
    gdp: val
  }));

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 font-sans selection:bg-emerald-500/30">
      {/* CRT Scanline Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 opacity-20"></div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-[10%] w-full z-50 animate-[scanline_8s_linear_infinite] opacity-50"></div>
      
      <div className="bg-[#050505] border-2 border-emerald-900 w-full max-w-6xl h-[85vh] flex flex-col shadow-[0_0_80px_rgba(16,185,129,0.1)] relative overflow-hidden ring-1 ring-emerald-500/20 animate-[flicker_0.15s_infinite]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b-2 border-emerald-900 bg-emerald-950/20 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay"></div>
          <div className="flex items-center gap-3 relative z-10">
            <Terminal className="w-8 h-8 text-emerald-500 animate-pulse" />
            <div>
              <h2 className="text-2xl font-black text-emerald-400 tracking-[0.2em] uppercase drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">及第资本 // 校园资产管理终端</h2>
              <p className="text-xs text-emerald-600 font-mono tracking-widest mt-1">SYS.VER 2.0.4 // HEFEI NO.1 ENTERPRISE SCHOOL // AUTHORIZED PERSONNEL ONLY</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-emerald-900/50 text-emerald-600 hover:text-emerald-400 transition-colors border border-emerald-900/50 hover:border-emerald-500 relative z-10">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex border-b-2 border-emerald-900/50 bg-[#020202]">
          <button
            onClick={() => !state.lockedUI?.gdp && setActiveTab('overview')}
            className={`flex-1 py-4 text-sm font-black tracking-[0.2em] uppercase transition-all border-r border-emerald-900/30 relative group overflow-hidden ${activeTab === 'overview' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-emerald-950/40 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]' : 'text-emerald-800 hover:text-emerald-500 hover:bg-emerald-950/20'} ${state.lockedUI?.gdp ? 'cursor-not-allowed opacity-80' : ''}`}
          >
            <TrendingUp className="w-5 h-5 inline-block mr-3 mb-1" />
            宏观经济监控
            {state.lockedUI?.gdp && (
              <>
                <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center z-20 backdrop-blur-sm">
                  <div className="transform -rotate-12 border-4 border-red-500 text-red-500 font-black text-xl px-4 py-1 tracking-widest bg-black/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]">已被查封</div>
                </div>
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#eab308_0,#eab308_10px,#000_10px,#000_20px)] opacity-30 z-10"></div>
                <div className="absolute inset-0 hidden group-hover:flex items-center justify-center z-30 bg-black/90 text-red-500 text-xs font-mono p-2 text-center">
                  因涉嫌违规操作，该终端已被教育局纪委查封。
                </div>
              </>
            )}
          </button>
          {state.unlockedMechanics.rnd && (
            <button
              onClick={() => !state.lockedUI?.rnd && setActiveTab('rnd')}
              className={`flex-1 py-4 text-sm font-black tracking-[0.2em] uppercase transition-all border-r border-emerald-900/30 relative group overflow-hidden ${activeTab === 'rnd' ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-950/40 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' : 'text-blue-800 hover:text-blue-500 hover:bg-blue-950/20'} ${state.lockedUI?.rnd ? 'cursor-not-allowed opacity-80' : ''}`}
            >
              <Cpu className="w-5 h-5 inline-block mr-3 mb-1" />
              教辅研发中心
              {state.lockedUI?.rnd && (
                <>
                  <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center z-20 backdrop-blur-sm">
                    <div className="transform -rotate-12 border-4 border-red-500 text-red-500 font-black text-xl px-4 py-1 tracking-widest bg-black/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]">已被查封</div>
                  </div>
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#eab308_0,#eab308_10px,#000_10px,#000_20px)] opacity-30 z-10"></div>
                  <div className="absolute inset-0 hidden group-hover:flex items-center justify-center z-30 bg-black/90 text-red-500 text-xs font-mono p-2 text-center">
                    因涉嫌违规研发，该终端已被教育局纪委查封。
                  </div>
                </>
              )}
            </button>
          )}
          {state.unlockedMechanics.committee && (
            <button
              onClick={() => !state.lockedUI?.committee && setActiveTab('committee')}
              className={`flex-1 py-4 text-sm font-black tracking-[0.2em] uppercase transition-all border-r border-emerald-900/30 relative group overflow-hidden ${activeTab === 'committee' ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-950/40 shadow-[inset_0_0_20px_rgba(168,85,247,0.1)]' : 'text-purple-800 hover:text-purple-500 hover:bg-purple-950/20'} ${state.lockedUI?.committee ? 'cursor-not-allowed opacity-80' : ''}`}
            >
              <Users className="w-5 h-5 inline-block mr-3 mb-1" />
              联合管理委员会
              {state.lockedUI?.committee && (
                <>
                  <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center z-20 backdrop-blur-sm">
                    <div className="transform -rotate-12 border-4 border-red-500 text-red-500 font-black text-xl px-4 py-1 tracking-widest bg-black/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]">已被查封</div>
                  </div>
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,#eab308_0,#eab308_10px,#000_10px,#000_20px)] opacity-30 z-10"></div>
                  <div className="absolute inset-0 hidden group-hover:flex items-center justify-center z-30 bg-black/90 text-red-500 text-xs font-mono p-2 text-center">
                    因涉嫌违规操作，该终端已被教育局纪委查封。
                  </div>
                </>
              )}
            </button>
          )}
          {state.riotState && (
            <button
              onClick={() => setActiveTab('riot')}
              className={`flex-1 py-4 text-sm font-black tracking-[0.2em] uppercase transition-all ${activeTab === 'riot' ? 'text-red-400 border-b-2 border-red-500 bg-red-950/40 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]' : 'text-red-800 hover:text-red-500 hover:bg-red-950/20'}`}
            >
              <AlertTriangle className="w-5 h-5 inline-block mr-3 mb-1" />
              合一暴乱
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#050505] relative">
          {activeTab === 'overview' && (
            <>
              {state.lockedUI?.gdp && <LockdownOverlay text="查封" />}
              <div className={`space-y-6 relative h-full ${state.lockedUI?.gdp ? 'pointer-events-none opacity-50' : ''}`}>
              {state.bureauTarget?.active && (
                <div className="bg-red-950/20 border border-red-900/50 p-4 flex items-center justify-between relative overflow-hidden group">
                  <div className="absolute inset-0 bg-red-500/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-900/30 border border-red-800/50">
                      <ShieldAlert className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-red-500 font-bold tracking-widest uppercase text-sm mb-1">教育局营收指标警告</h4>
                      <p className="text-xs text-red-400/70 font-mono">目标产值: {state.bureauTarget.targetGdp.toFixed(2)}万 // 当前产值: {state.gdp.toFixed(2)}万</p>
                    </div>
                  </div>
                  <div className="text-right border-l border-red-900/50 pl-6">
                    <div className="text-3xl font-black text-red-500 font-mono tracking-tighter">{state.bureauTarget.daysLeft}</div>
                    <div className="text-[10px] text-red-600 uppercase tracking-widest">剩余天数</div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#0a0a0a] p-6 border border-emerald-900/30 relative">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500"></div>
                  
                  <h3 className="text-emerald-600/80 text-xs font-bold tracking-widest uppercase mb-4 flex items-center"><DollarSign className="w-3 h-3 mr-2" /> 校园总产值 (GDP)</h3>
                  <div className="text-5xl font-black text-emerald-400 font-mono tracking-tighter">{state.gdp.toFixed(2)}<span className="text-2xl text-emerald-600 ml-1">万</span></div>
                  <div className={`text-xs mt-4 font-mono flex items-center ${state.gdpGrowth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    <span className="inline-block w-2 h-2 rounded-full mr-2 bg-current animate-pulse"></span>
                    增长率: {state.gdpGrowth >= 0 ? '+' : ''}{(state.gdpGrowth * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="bg-[#0a0a0a] p-6 border border-blue-900/30 relative">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blue-500"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blue-500"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-500"></div>

                  <h3 className="text-blue-600/80 text-xs font-bold tracking-widest uppercase mb-4 flex items-center"><BookOpen className="w-3 h-3 mr-2" /> 预测一本率</h3>
                  <div className="text-5xl font-black text-blue-400 font-mono tracking-tighter">{(state.admissionRate * 100).toFixed(1)}<span className="text-2xl text-blue-600 ml-1">%</span></div>
                  <div className="text-xs mt-4 text-blue-600/60 font-mono uppercase">
                    // 影响派系信心与投资
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0a0a] p-6 border border-emerald-900/30 h-80 flex flex-col relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
                <h3 className="text-emerald-600/80 text-xs font-bold tracking-widest uppercase mb-6">产值走势分析</h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} />
                      <XAxis dataKey="month" stroke="#047857" tick={{ fill: '#047857', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={{ stroke: '#064e3b' }} />
                      <YAxis stroke="#047857" domain={['auto', 'auto']} tick={{ fill: '#047857', fontSize: 10, fontFamily: 'monospace' }} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#050505', borderColor: '#064e3b', borderRadius: 0, fontFamily: 'monospace', fontSize: '12px' }}
                        itemStyle={{ color: '#34d399' }}
                        labelStyle={{ color: '#047857', marginBottom: '4px' }}
                      />
                      {state.bureauTarget?.active && (
                        <ReferenceLine 
                          y={state.bureauTarget.targetGdp} 
                          stroke="#ef4444" 
                          strokeDasharray="3 3" 
                          label={{ position: 'insideTopLeft', value: `TARGET: ${state.bureauTarget.targetGdp.toFixed(2)}万`, fill: '#ef4444', fontSize: 10, fontFamily: 'monospace' }} 
                        />
                      )}
                      <Line type="monotone" dataKey="gdp" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#10b981', stroke: '#050505', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {flags['jidi_utopia_reached'] && (
                <div className="bg-[#0a0a0a] p-6 border border-purple-900/30 relative">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500"></div>
                  <h3 className="text-purple-500 font-bold tracking-widest uppercase text-sm mb-6 border-b border-purple-900/30 pb-4">资本运作：GDP套现</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => onEventTrigger && onEventTrigger('jidi_sell_gdp_for_stab')}
                      disabled={state.gdp < 100}
                      className="p-4 border border-purple-900/50 bg-purple-950/20 hover:bg-purple-900/40 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <h4 className="text-purple-400 font-bold mb-2">维稳资金注入</h4>
                      <p className="text-xs text-purple-300/70 mb-4">消耗 100万 GDP，换取 10 点稳定度。</p>
                      <div className="text-xs font-mono text-purple-500 group-hover:text-purple-300">
                        &gt; 立即执行
                      </div>
                    </button>
                    <button
                      onClick={() => onEventTrigger && onEventTrigger('jidi_sell_gdp_for_pp')}
                      disabled={state.gdp < 100}
                      className="p-4 border border-purple-900/50 bg-purple-950/20 hover:bg-purple-900/40 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <h4 className="text-purple-400 font-bold mb-2">政治献金</h4>
                      <p className="text-xs text-purple-300/70 mb-4">消耗 100万 GDP，换取 50 点政治点数。</p>
                      <div className="text-xs font-mono text-purple-500 group-hover:text-purple-300">
                        &gt; 立即执行
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
            </>
          )}

          {activeTab === 'rnd' && state.rndState && (
            <>
              {state.lockedUI?.rnd && <LockdownOverlay text="取缔" />}
              <div className={`space-y-6 relative h-full ${state.lockedUI?.rnd ? 'pointer-events-none opacity-50' : ''}`}>
              <div className="bg-[#0a0a0a] p-6 border border-blue-900/30 relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500"></div>
                <h3 className="text-blue-500 font-bold tracking-widest uppercase text-sm mb-6 border-b border-blue-900/30 pb-4">教辅产品研发周期</h3>
                
                {state.rndState.phase === 'idle' ? (
                  <div className="text-center py-8 border border-dashed border-blue-900/50 bg-blue-950/10">
                    <Cpu className="w-12 h-12 text-blue-800 mx-auto mb-4 opacity-50" />
                    <h4 className="text-sm font-mono text-blue-600/80 mb-8 uppercase tracking-widest">状态: 空闲 // 等待项目立项</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
                      <div className="space-y-6">
                        <h5 className="text-emerald-500 font-bold border-b border-emerald-900/50 pb-3 text-lg">及第资本</h5>
                        <button onClick={() => onStartRnd('jidi', '《考前绝密押题卷》', 'jidi_rnd_product_1', 'jidi_rnd_product_1')} className="w-full p-4 bg-[#050505] border border-emerald-700/50 hover:bg-emerald-950/30 hover:border-emerald-500 text-emerald-500 font-mono text-base tracking-widest transition-all text-left flex flex-col items-center justify-center gap-4 group rounded-md">
                          <div className="w-full overflow-hidden rounded">
                            <img src={getJidiProductImageUrl('jidi_rnd_product_1')} alt="product" className="w-full h-32 object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" referrerPolicy="no-referrer" />
                          </div>
                          <span className="font-bold text-center">研发《考前绝密押题卷》</span>
                        </button>
                        <button onClick={() => onStartRnd('jidi', '《及第青云·大数据题库》', 'jidi_rnd_product_2', 'jidi_rnd_product_2')} className="w-full p-4 bg-[#050505] border border-emerald-700/50 hover:bg-emerald-950/30 hover:border-emerald-500 text-emerald-500 font-mono text-base tracking-widest transition-all text-left flex flex-col items-center justify-center gap-4 group rounded-md">
                          <div className="w-full overflow-hidden rounded">
                            <img src={getJidiProductImageUrl('jidi_rnd_product_2')} alt="product" className="w-full h-32 object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" referrerPolicy="no-referrer" />
                          </div>
                          <span className="font-bold text-center">研发《及第青云·大数据题库》</span>
                        </button>
                        <button onClick={() => onStartRnd('jidi', '《“考神赋体”24小时极限冲刺套装》', 'jidi_rnd_product_3', 'jidi_rnd_product_3')} className="w-full p-4 bg-[#050505] border border-emerald-700/50 hover:bg-emerald-950/30 hover:border-emerald-500 text-emerald-500 font-mono text-base tracking-widest transition-all text-left flex flex-col items-center justify-center gap-4 group rounded-md">
                          <div className="w-full overflow-hidden rounded">
                            <img src={getJidiProductImageUrl('jidi_rnd_product_3')} alt="product" className="w-full h-32 object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" referrerPolicy="no-referrer" />
                          </div>
                          <span className="font-bold text-center">研发《“考神赋体”24小时极限冲刺套装》</span>
                        </button>
                      </div>
                      <div className="space-y-6">
                        <h5 className="text-orange-500 font-bold border-b border-orange-900/50 pb-3 text-lg">新东方资本</h5>
                        <button onClick={() => onStartRnd('newOriental', '《新高考五三魔改版》', 'newOriental_rnd_product_1', 'newOriental_rnd_product_1')} className="w-full p-4 bg-[#050505] border border-orange-700/50 hover:bg-orange-950/30 hover:border-orange-500 text-orange-500 font-mono text-base tracking-widest transition-all text-left flex flex-col items-center justify-center gap-4 group rounded-md">
                          <div className="w-full overflow-hidden rounded">
                            <img src={getJidiProductImageUrl('newOriental_rnd_product_1')} alt="product" className="w-full h-32 object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" referrerPolicy="no-referrer" />
                          </div>
                          <span className="font-bold text-center">研发《新高考五三魔改版》</span>
                        </button>
                        <button onClick={() => onStartRnd('newOriental', '《清北强基训练营内部讲义》', 'newOriental_rnd_product_2', 'newOriental_rnd_product_2')} className="w-full p-4 bg-[#050505] border border-orange-700/50 hover:bg-orange-950/30 hover:border-orange-500 text-orange-500 font-mono text-base tracking-widest transition-all text-left flex flex-col items-center justify-center gap-4 group rounded-md">
                          <div className="w-full overflow-hidden rounded">
                            <img src={getJidiProductImageUrl('newOriental_rnd_product_2')} alt="product" className="w-full h-32 object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" referrerPolicy="no-referrer" />
                          </div>
                          <span className="font-bold text-center">研发《清北强基训练营内部讲义》</span>
                        </button>
                        <button onClick={() => onStartRnd('newOriental', '《衡水模式刷题量化手册》', 'newOriental_rnd_product_3', 'newOriental_rnd_product_3')} className="w-full p-4 bg-[#050505] border border-orange-700/50 hover:bg-orange-950/30 hover:border-orange-500 text-orange-500 font-mono text-base tracking-widest transition-all text-left flex flex-col items-center justify-center gap-4 group rounded-md">
                          <div className="w-full overflow-hidden rounded">
                            <img src={getJidiProductImageUrl('newOriental_rnd_product_3')} alt="product" className="w-full h-32 object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" referrerPolicy="no-referrer" />
                          </div>
                          <span className="font-bold text-center">研发《衡水模式刷题量化手册》</span>
                        </button>
                      </div>
                      <div className="space-y-6">
                        <h5 className="text-blue-500 font-bold border-b border-blue-900/50 pb-3 text-lg">合一教师协会</h5>
                        <button onClick={() => onStartRnd('teachers', '《衡水体速成字帖》', 'teachers_rnd_product_1', 'teachers_rnd_product_1')} className="w-full p-4 bg-[#050505] border border-blue-700/50 hover:bg-blue-950/30 hover:border-blue-500 text-blue-500 font-mono text-base tracking-widest transition-all text-left flex flex-col items-center justify-center gap-4 group rounded-md">
                          <div className="w-full overflow-hidden rounded">
                            <img src={getJidiProductImageUrl('teachers_rnd_product_1')} alt="product" className="w-full h-32 object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" referrerPolicy="no-referrer" />
                          </div>
                          <span className="font-bold text-center">研发《衡水体速成字帖》</span>
                        </button>
                        <button onClick={() => onStartRnd('teachers', '《合肥一中感恩德育读本》', 'teachers_rnd_product_2', 'teachers_rnd_product_2')} className="w-full p-4 bg-[#050505] border border-blue-700/50 hover:bg-blue-950/30 hover:border-blue-500 text-blue-500 font-mono text-base tracking-widest transition-all text-left flex flex-col items-center justify-center gap-4 group rounded-md">
                          <div className="w-full overflow-hidden rounded">
                            <img src={getJidiProductImageUrl('teachers_rnd_product_2')} alt="product" className="w-full h-32 object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" referrerPolicy="no-referrer" />
                          </div>
                          <span className="font-bold text-center">研发《合肥一中感恩德育读本》</span>
                        </button>
                        <button onClick={() => onStartRnd('teachers', '《合一经典100题》', 'teachers_rnd_product_3', 'teachers_rnd_product_3')} className="w-full p-4 bg-[#050505] border border-blue-700/50 hover:bg-blue-950/30 hover:border-blue-500 text-blue-500 font-mono text-base tracking-widest transition-all text-left flex flex-col items-center justify-center gap-4 group rounded-md">
                          <div className="w-full overflow-hidden rounded">
                            <img src={getJidiProductImageUrl('teachers_rnd_product_3')} alt="product" className="w-full h-32 object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" referrerPolicy="no-referrer" />
                          </div>
                          <span className="font-bold text-center">研发《合一经典100题》</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between items-end mb-3 font-mono text-xs uppercase tracking-widest">
                        <span className="text-blue-600/80">当前阶段: 
                          <span className="text-blue-400 ml-2 font-bold">
                            {state.rndState.phase === 'initiation' && '第一阶段: 立项 (1-20天)'}
                            {state.rndState.phase === 'testing' && '第二阶段: 极限测试 (21-40天)'}
                            {state.rndState.phase === 'dumping' && '第三阶段: 市场倾销 (41-60天)'}
                          </span>
                        </span>
                        <span className="text-blue-500">进度: {state.rndState.daysInPhase}/20 天</span>
                      </div>
                      
                      <div className="w-full bg-[#050505] border border-blue-900/50 h-3 p-0.5">
                        <div className="bg-blue-500 h-full transition-all duration-500 relative overflow-hidden" style={{ width: `${(state.rndState.daysInPhase / 20) * 100}%` }}>
                          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[shimmer_1s_linear_infinite]"></div>
                        </div>
                      </div>
                    </div>

                    {state.rndState.currentProduct && (
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-[#050505] p-5 border-l-2 border-blue-800 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-blue-600/60 font-mono uppercase tracking-widest mb-1">产品名称</div>
                            <div className="text-lg font-bold text-blue-300 tracking-wider">{state.rndState.currentProduct.name}</div>
                          </div>
                          {state.rndState.currentProduct.image && (
                            <img src={getJidiProductImageUrl(state.rndState.currentProduct.image)} alt="product" className="w-16 h-12 object-cover opacity-80 border border-blue-900/50" referrerPolicy="no-referrer" />
                          )}
                        </div>
                        <div className="bg-[#050505] p-5 border-l-2 border-blue-800">
                          <div className="text-[10px] text-blue-600/60 font-mono uppercase tracking-widest mb-1">预计质量指数</div>
                          <div className="flex items-baseline gap-2">
                            <div className="text-2xl font-black text-blue-400 font-mono">{state.rndState.currentProduct.quality.toFixed(2)}</div>
                            <div className="text-xs text-blue-500/80 font-mono">
                              ({state.rndState.currentProduct.quality < 40 ? '较差' : state.rndState.currentProduct.quality < 60 ? '一般' : state.rndState.currentProduct.quality < 70 ? '还行' : state.rndState.currentProduct.quality < 80 ? '不错' : '绝伦'})
                            </div>
                          </div>
                        </div>
                        {state.rndState.phase === 'dumping' && (
                          <div className="bg-[#050505] p-5 border-l-2 border-emerald-800 col-span-2">
                            <div className="text-[10px] text-emerald-600/60 font-mono uppercase tracking-widest mb-1">销售倍率</div>
                            <div className="text-2xl font-black text-emerald-400 font-mono">{(state.rndState.currentProduct.salesMultiplier || 1.0).toFixed(2)}x</div>
                          </div>
                        )}
                      </div>
                    )}

                    {state.rndState.phase === 'initiation' && (
                      <div className="mt-8 p-6 bg-[#050505] border border-blue-900/50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/20"></div>
                        <h4 className="text-blue-500 font-bold tracking-widest uppercase text-base mb-4 flex items-center"><Cpu className="w-5 h-5 mr-2" /> 质量提升</h4>
                        <p className="text-sm text-blue-400/80 font-mono mb-6 max-w-2xl leading-relaxed">在测试阶段前投入资源以提升产品质量。每天限操作一次。</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <button 
                            onClick={() => onRndAction('improve_quality')}
                            disabled={state.rndState.hasInteractedToday || pp < 5 || (tpr || 0) < 50}
                            className={`w-full py-4 font-mono text-xs tracking-widest uppercase transition-all flex flex-col items-center justify-center gap-2 border ${state.rndState.hasInteractedToday || pp < 5 || (tpr || 0) < 50 ? 'bg-gray-900/50 border-gray-800 text-gray-600 cursor-not-allowed' : 'bg-blue-950/30 border-blue-800/50 hover:bg-blue-900/50 hover:border-blue-500 text-blue-400'}`}
                          >
                            <TrendingUp className="w-4 h-4" />
                            <span>投入资源优化内容</span>
                            <span className="text-[10px] opacity-70">消耗 5 PP, 50 TPR | 质量 +5</span>
                          </button>
                          
                          <button 
                            onClick={() => onRndAction('exploit_devs')}
                            disabled={state.rndState.hasInteractedToday || (tpr || 0) < 100}
                            className={`w-full py-4 font-mono text-xs tracking-widest uppercase transition-all flex flex-col items-center justify-center gap-2 border ${state.rndState.hasInteractedToday || (tpr || 0) < 100 ? 'bg-gray-900/50 border-gray-800 text-gray-600 cursor-not-allowed' : 'bg-purple-950/30 border-purple-800/50 hover:bg-purple-900/50 hover:border-purple-500 text-purple-400'}`}
                          >
                            <AlertTriangle className="w-4 h-4" />
                            <span>压榨研发人员</span>
                            <span className="text-[10px] opacity-70">消耗 100 TPR | 质量 +10, 理智 -2</span>
                          </button>

                          <button 
                            onClick={() => onRndAction('false_advertising')}
                            disabled={state.rndState.hasInteractedToday || pp < 10 || (tpr || 0) < 150}
                            className={`w-full py-4 font-mono text-xs tracking-widest uppercase transition-all flex flex-col items-center justify-center gap-2 border ${state.rndState.hasInteractedToday || pp < 10 || (tpr || 0) < 150 ? 'bg-gray-900/50 border-gray-800 text-gray-600 cursor-not-allowed' : 'bg-orange-950/30 border-orange-800/50 hover:bg-orange-900/50 hover:border-orange-500 text-orange-400'}`}
                          >
                            <TrendingUp className="w-4 h-4" />
                            <span>虚假宣传造势</span>
                            <span className="text-[10px] opacity-70">消耗 10 PP, 150 TPR | 销售倍率 +0.05</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {state.rndState.phase === 'testing' && (
                      <div className="mt-8 p-6 bg-[#050505] border border-red-900/50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/20"></div>
                        <h4 className="text-red-500 font-bold tracking-widest uppercase text-base mb-4 flex items-center"><AlertTriangle className="w-5 h-5 mr-2" /> 极限测试强度调节</h4>
                        <p className="text-sm text-red-400/80 font-mono mb-6 max-w-2xl leading-relaxed">警告：更高的测试强度能带来更好的质量，但会增加学生抗议的风险并加速理智消耗。调节冷却时间：5天。</p>
                        
                        <div className="flex items-center gap-6 bg-red-950/10 p-4 border border-red-900/30">
                          <span className="text-red-700 font-mono text-xs">MIN</span>
                          <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={state.rndState.testingIntensity}
                            onChange={(e) => onChangeTestingIntensity(parseInt(e.target.value))}
                            disabled={state.rndState.daysSinceLastIntensityChange < 5}
                            className="flex-1 h-1 bg-red-950 appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:cursor-pointer disabled:opacity-50"
                          />
                          <span className="text-red-500 font-mono font-bold text-lg w-12 text-right">LVL.{state.rndState.testingIntensity}</span>
                        </div>
                        {state.rndState.daysSinceLastIntensityChange < 5 && (
                          <p className="text-[10px] text-red-600 font-mono mt-3 uppercase tracking-widest">冷却中: 剩余 {5 - state.rndState.daysSinceLastIntensityChange} 天</p>
                        )}
                      </div>
                    )}

                    {state.rndState.phase === 'dumping' && (
                      <div className="mt-8 p-6 bg-[#050505] border border-emerald-900/50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20"></div>
                        <h4 className="text-emerald-500 font-bold tracking-widest uppercase text-base mb-4 flex items-center"><TrendingUp className="w-5 h-5 mr-2" /> 市场倾销</h4>
                        <p className="text-sm text-emerald-400/80 font-mono mb-6 max-w-2xl leading-relaxed">执行营销策略以最大化销售倍率。每天限操作一次。</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <button 
                            onClick={() => onRndAction('improve_sales')}
                            disabled={state.rndState.hasInteractedToday || pp < 5 || (tpr || 0) < 50}
                            className={`w-full py-4 font-mono text-xs tracking-widest uppercase transition-all flex flex-col items-center justify-center gap-2 border ${state.rndState.hasInteractedToday || pp < 5 || (tpr || 0) < 50 ? 'bg-gray-900/50 border-gray-800 text-gray-600 cursor-not-allowed' : 'bg-emerald-950/30 border-emerald-800/50 hover:bg-emerald-900/50 hover:border-emerald-500 text-emerald-400'}`}
                          >
                            <TrendingUp className="w-4 h-4" />
                            <span>加大营销力度</span>
                            <span className="text-[10px] opacity-70">消耗 5 PP, 50 TPR | 销售倍率 +0.1</span>
                          </button>

                          <button 
                            onClick={() => onRndAction('force_buy')}
                            disabled={state.rndState.hasInteractedToday || (tpr || 0) < 200}
                            className={`w-full py-4 font-mono text-xs tracking-widest uppercase transition-all flex flex-col items-center justify-center gap-2 border ${state.rndState.hasInteractedToday || (tpr || 0) < 200 ? 'bg-gray-900/50 border-gray-800 text-gray-600 cursor-not-allowed' : 'bg-red-950/30 border-red-800/50 hover:bg-red-900/50 hover:border-red-500 text-red-400'}`}
                          >
                            <AlertTriangle className="w-4 h-4" />
                            <span>强制学生购买</span>
                            <span className="text-[10px] opacity-70">消耗 200 TPR | 销售倍率 +0.2, 理智 -5</span>
                          </button>

                          <button 
                            onClick={() => onRndAction('bribe_bureau')}
                            disabled={state.rndState.hasInteractedToday || pp < 15 || (tpr || 0) < 100}
                            className={`w-full py-4 font-mono text-xs tracking-widest uppercase transition-all flex flex-col items-center justify-center gap-2 border ${state.rndState.hasInteractedToday || pp < 15 || (tpr || 0) < 100 ? 'bg-gray-900/50 border-gray-800 text-gray-600 cursor-not-allowed' : 'bg-yellow-950/30 border-yellow-800/50 hover:bg-yellow-900/50 hover:border-yellow-500 text-yellow-400'}`}
                          >
                            <DollarSign className="w-4 h-4" />
                            <span>贿赂教育局推广</span>
                            <span className="text-[10px] opacity-70">消耗 15 PP, 100 TPR | 销售倍率 +0.15, 局方愤怒 -5</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            </>
          )}

          {activeTab === 'committee' && state.committeeState && (
            <>
              {state.lockedUI?.committee && <LockdownOverlay text="冻结" />}
              <div className={`space-y-6 relative h-full ${state.lockedUI?.committee ? 'pointer-events-none opacity-50' : ''}`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0a0a0a] p-5 border-t-2 border-emerald-600 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-900/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <h4 className="text-emerald-600 text-xs font-bold tracking-widest uppercase mb-3">及第资本 // JIDI</h4>
                  <div className="text-4xl font-black text-emerald-400 font-mono">{state.committeeState.seats.jidi} <span className="text-base text-emerald-700 font-sans tracking-normal">席</span></div>
                  <div className="text-xs text-emerald-600/80 font-mono mt-2 uppercase">满意度: {state.committeeState.satisfaction.jidi}%</div>
                </div>
                <div className="bg-[#0a0a0a] p-5 border-t-2 border-orange-600 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-orange-900/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <h4 className="text-orange-600 text-xs font-bold tracking-widest uppercase mb-3">新东方资本 // NEW_ORIENTAL</h4>
                  <div className="text-4xl font-black text-orange-400 font-mono">{state.committeeState.seats.newOriental} <span className="text-base text-orange-700 font-sans tracking-normal">席</span></div>
                  <div className="text-xs text-orange-600/80 font-mono mt-2 uppercase">满意度: {state.committeeState.satisfaction.newOriental}%</div>
                </div>
                <div className="bg-[#0a0a0a] p-5 border-t-2 border-blue-600 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-900/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <h4 className="text-blue-600 text-xs font-bold tracking-widest uppercase mb-3">合一教师协会 // TEACHERS</h4>
                  <div className="text-4xl font-black text-blue-400 font-mono">{state.committeeState.seats.teachers} <span className="text-base text-blue-700 font-sans tracking-normal">席</span></div>
                  <div className="text-xs text-blue-600/80 font-mono mt-2 uppercase">满意度: {state.committeeState.satisfaction.teachers}%</div>
                </div>
                <div className="bg-[#0a0a0a] p-5 border-t-2 border-red-600 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-900/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <h4 className="text-red-600 text-xs font-bold tracking-widest uppercase mb-3">教育局纪委 // DISCIPLINE</h4>
                  <div className="text-4xl font-black text-red-400 font-mono">{state.committeeState.seats.disciplineCommittee} <span className="text-base text-red-700 font-sans tracking-normal">席</span></div>
                  <div className="text-xs text-red-600/80 font-mono mt-2 uppercase">满意度: {state.committeeState.satisfaction.disciplineCommittee}%</div>
                </div>
              </div>

              <div className="bg-[#0a0a0a] p-6 border border-purple-900/30 relative">
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-purple-500"></div>
                <h3 className="text-purple-500 font-bold tracking-widest uppercase text-sm mb-6 border-b border-purple-900/30 pb-4">立法与榨取法案</h3>
                
                {state.committeeState.activeBill ? (
                  <div className="bg-[#050505] p-6 border border-purple-800/50 relative">
                    <div className="absolute -left-px top-4 bottom-4 w-0.5 bg-purple-500"></div>
                    <h4 className="text-xl font-bold text-purple-300 mb-4 tracking-wider">{state.committeeState.activeBill.name}</h4>
                    <div className="flex justify-between text-sm font-mono text-purple-600/80 mb-6 uppercase tracking-widest">
                      <span>提案方: {
                        state.committeeState.activeBill.proposer === 'jidi' ? '及第资本' : 
                        state.committeeState.activeBill.proposer === 'newOriental' ? '新东方资本' : 
                        state.committeeState.activeBill.proposer === 'teachers' ? '合一教师协会' : '教育局纪委'
                      }</span>
                      <span className="text-purple-400">剩余时间: {state.committeeState.activeBill.daysLeft} 天</span>
                    </div>
                    
                    <div className="w-full bg-[#0a0a0a] border border-purple-900/50 h-8 relative p-0.5">
                      <div 
                        className="bg-purple-600 h-full transition-all duration-500" 
                        style={{ width: `${state.committeeState.activeBill.support}%` }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-widest">
                        支持率: {state.committeeState.activeBill.support.toFixed(1)}% // 需要: &gt;50%
                      </div>
                      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-red-500/50 z-10"></div>
                    </div>
                    
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button 
                        onClick={() => onLobby('newOriental')} 
                        disabled={state.committeeState.activeBill.lobbiedFactions.includes('newOriental')}
                        className={`py-3 px-4 border text-xs font-mono tracking-widest uppercase transition-all ${state.committeeState.activeBill.lobbiedFactions.includes('newOriental') ? 'bg-orange-950/10 border-orange-900/30 text-orange-800 cursor-not-allowed' : 'bg-[#050505] border-orange-700/50 text-orange-500 hover:bg-orange-950/30 hover:border-orange-500'}`}
                      >
                        {state.committeeState.activeBill.lobbiedFactions.includes('newOriental') ? '已游说：新东方' : '游说：新东方 [-10 PP]'}
                      </button>
                      <button 
                        onClick={() => onLobby('teachers')} 
                        disabled={state.committeeState.activeBill.lobbiedFactions.includes('teachers')}
                        className={`py-3 px-4 border text-xs font-mono tracking-widest uppercase transition-all ${state.committeeState.activeBill.lobbiedFactions.includes('teachers') ? 'bg-blue-950/10 border-blue-900/30 text-blue-800 cursor-not-allowed' : 'bg-[#050505] border-blue-700/50 text-blue-500 hover:bg-blue-950/30 hover:border-blue-500'}`}
                      >
                        {state.committeeState.activeBill.lobbiedFactions.includes('teachers') ? '已游说：教师协会' : '游说：教师协会 [-10 PP]'}
                      </button>
                      <button 
                        onClick={() => onLobby('disciplineCommittee')} 
                        disabled={state.committeeState.activeBill.lobbiedFactions.includes('disciplineCommittee')}
                        className={`py-3 px-4 border text-xs font-mono tracking-widest uppercase transition-all ${state.committeeState.activeBill.lobbiedFactions.includes('disciplineCommittee') ? 'bg-red-950/10 border-red-900/30 text-red-800 cursor-not-allowed' : 'bg-[#050505] border-red-700/50 text-red-500 hover:bg-red-950/30 hover:border-red-500'}`}
                      >
                        {state.committeeState.activeBill.lobbiedFactions.includes('disciplineCommittee') ? '已游说：纪委' : '游说：纪委 [-10 PP]'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={() => onProposeBill('jidi', 'extend_study')} className="p-5 bg-[#050505] hover:bg-emerald-950/20 border border-emerald-900/50 hover:border-emerald-500/50 text-left transition-all group">
                      <div className="text-[10px] font-mono text-emerald-500/80 mb-2 uppercase tracking-widest">提案方: 及第资本</div>
                      <div className="font-bold text-emerald-400 mb-2 group-hover:text-emerald-300">延长晚自习至零点法案</div>
                      <div className="text-xs text-emerald-400/90 font-mono leading-relaxed">效果: ++GDP, ++升学率, --学生理智, --教师满意度</div>
                    </button>
                    <button onClick={() => onProposeBill('jidi', 'reduce_food')} className="p-5 bg-[#050505] hover:bg-emerald-950/20 border border-emerald-900/50 hover:border-emerald-500/50 text-left transition-all group">
                      <div className="text-[10px] font-mono text-emerald-500/80 mb-2 uppercase tracking-widest">提案方: 及第资本</div>
                      <div className="font-bold text-emerald-400 mb-2 group-hover:text-emerald-300">食堂降本增效决议</div>
                      <div className="text-xs text-emerald-400/90 font-mono leading-relaxed">效果: +GDP, -学生理智</div>
                    </button>
                    <button onClick={() => onProposeBill('newOriental', 'ban_clubs')} className="p-5 bg-[#050505] hover:bg-orange-950/20 border border-orange-900/50 hover:border-orange-500/50 text-left transition-all group">
                      <div className="text-[10px] font-mono text-orange-500/80 mb-2 uppercase tracking-widest">提案方: 新东方资本</div>
                      <div className="font-bold text-orange-400 mb-2 group-hover:text-orange-300">取缔非应试社团令</div>
                      <div className="text-xs text-orange-400/90 font-mono leading-relaxed">效果: +升学率, +新东方满意度, --学生理智</div>
                    </button>
                    <button onClick={() => onProposeBill('newOriental', 'performance_bonus')} className="p-5 bg-[#050505] hover:bg-orange-950/20 border border-orange-900/50 hover:border-orange-500/50 text-left transition-all group">
                      <div className="text-[10px] font-mono text-orange-500/80 mb-2 uppercase tracking-widest">提案方: 新东方资本</div>
                      <div className="font-bold text-orange-400 mb-2 group-hover:text-orange-300">教师绩效奖金池</div>
                      <div className="text-xs text-orange-400/90 font-mono leading-relaxed">效果: +做题家产出, -GDP, +新东方满意度</div>
                    </button>
                    <button onClick={() => onProposeBill('teachers', 'protect_teachers')} className="p-5 bg-[#050505] hover:bg-blue-950/20 border border-blue-900/50 hover:border-blue-500/50 text-left transition-all group">
                      <div className="text-[10px] font-mono text-blue-500/80 mb-2 uppercase tracking-widest">提案方: 合一教师协会</div>
                      <div className="font-bold text-blue-400 mb-2 group-hover:text-blue-300">教师权益保护法</div>
                      <div className="text-xs text-blue-400/90 font-mono leading-relaxed">效果: -做题家产出, +稳定度, ++教师满意度, -及第满意度</div>
                    </button>
                    <button onClick={() => onProposeBill('disciplineCommittee', 'strict_patrols')} className="p-5 bg-[#050505] hover:bg-red-950/20 border border-red-900/50 hover:border-red-500/50 text-left transition-all group">
                      <div className="text-[10px] font-mono text-red-500/80 mb-2 uppercase tracking-widest">提案方: 教育局纪委</div>
                      <div className="font-bold text-red-400 mb-2 group-hover:text-red-300">高压巡逻常态化</div>
                      <div className="text-xs text-red-400/90 font-mono leading-relaxed">效果: +稳定度, -学生理智, +纪委满意度</div>
                    </button>
                  </div>
                )}
              </div>
            </div>
            </>
          )}

          {activeTab === 'riot' && state.riotState && (
            <div className="space-y-6">
              <div className="bg-red-950/20 border border-red-900/50 p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-10 mix-blend-overlay"></div>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse" />
                  <div>
                    <h3 className="text-2xl font-black text-red-500 tracking-widest uppercase">合一暴乱状态</h3>
                    <p className="text-red-400/70 font-mono text-sm">严重警告：学生暴乱正在进行中</p>
                  </div>
                </div>

                <div className="space-y-8 relative z-10">
                  <div>
                    <div className="flex justify-between text-sm mb-2 font-mono">
                      <span className="text-red-400">暴乱总进度</span>
                      <span className="text-red-500 font-bold">{state.riotState.progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-4 bg-black border border-red-900/50 overflow-hidden relative">
                      <div 
                        className="h-full bg-red-600 transition-all duration-500 relative"
                        style={{ width: `${Math.min(100, state.riotState.progress)}%` }}
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[shimmer_1s_linear_infinite]"></div>
                      </div>
                    </div>
                    <p className="text-sm text-red-400/70 mt-2 font-mono">当进度达到100%时，及第资本将被彻底驱逐。</p>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-[#050505] border border-orange-900/50 p-4">
                      <div className="flex justify-between text-sm mb-2 font-mono">
                        <span className="text-orange-400">学生愤怒值</span>
                        <span className="text-orange-500">{state.riotState.studentAnger.toFixed(1)}</span>
                      </div>
                      <div className="h-2 bg-black border border-orange-900/30 overflow-hidden">
                        <div className="h-full bg-orange-500 transition-all" style={{ width: `${Math.min(100, state.riotState.studentAnger)}%` }}></div>
                      </div>
                      <button 
                        onClick={onAppeaseStudents}
                        disabled={pp < 10}
                        className={`mt-4 w-full py-2 font-bold tracking-widest transition-all text-sm border
                          ${pp >= 10 
                            ? 'bg-orange-950/30 hover:bg-orange-900/50 border-orange-900/50 hover:border-orange-500 text-orange-400' 
                            : 'bg-gray-900/50 border-gray-800 text-gray-600 cursor-not-allowed'}`}
                      >
                        心理疏导 (10 PP, -GDP)
                      </button>
                    </div>

                    <div className="bg-[#050505] border border-red-900/50 p-4">
                      <div className="flex justify-between text-sm mb-2 font-mono">
                        <span className="text-red-400">暴力镇压</span>
                      </div>
                      <div className="text-sm text-red-500/80 mb-4">
                        出动保安队进行物理镇压。能有效降低暴乱进度，但会引起教育局纪委的强烈不满。
                      </div>
                      <button 
                        onClick={onSuppressRiot}
                        disabled={pp < 10}
                        className={`mt-auto w-full py-2 font-bold tracking-widest transition-all text-sm border
                          ${pp >= 10 
                            ? 'bg-red-950/30 hover:bg-red-900/50 border-red-900/50 hover:border-red-500 text-red-400' 
                            : 'bg-gray-900/50 border-gray-800 text-gray-600 cursor-not-allowed'}`}
                      >
                        暴力镇压 (10 PP)
                      </button>
                    </div>

                    <div className="bg-[#050505] border border-blue-900/50 p-4">
                      <div className="flex justify-between text-sm mb-2 font-mono">
                        <span className="text-blue-400">教育局纪委愤怒值</span>
                        <span className="text-blue-500">{state.riotState.bureauAnger.toFixed(1)}</span>
                      </div>
                      <div className="h-2 bg-black border border-blue-900/30 overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all" style={{ width: `${Math.min(100, state.riotState.bureauAnger)}%` }}></div>
                      </div>
                      <button 
                        onClick={onAppeaseBureau}
                        disabled={pp < 10}
                        className={`mt-4 w-full py-2 font-bold tracking-widest transition-all text-sm border
                          ${pp >= 10 
                            ? 'bg-blue-950/30 hover:bg-blue-900/50 border-blue-900/50 hover:border-blue-500 text-blue-400' 
                            : 'bg-gray-900/50 border-gray-800 text-gray-600 cursor-not-allowed'}`}
                      >
                        公关打点 (10 PP, -GDP)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Global styles for custom animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { background-position: 0 0; }
          100% { background-position: 20px 0; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        @keyframes flicker {
          0% { opacity: 0.98; }
          5% { opacity: 0.95; }
          10% { opacity: 0.99; }
          15% { opacity: 1; }
          50% { opacity: 0.98; }
          55% { opacity: 0.96; }
          60% { opacity: 1; }
          100% { opacity: 0.99; }
        }
      `}} />
    </div>
  );
}
