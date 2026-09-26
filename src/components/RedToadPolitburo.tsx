import React, { useState, useEffect } from 'react';
import { GameState, RedToadFaction } from '../types';
import { RED_TOAD_BILLS } from '../data/redToadBills';
import NeonEmblem from './NeonEmblem';
import { getFactionPortraitUrl } from '../config/assets';

interface RedToadPolitburoProps {
  state: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onClose: () => void;
}

export default function RedToadPolitburo({ state, setGameState, onClose }: RedToadPolitburoProps) {
  const [selectedFactionId, setSelectedFactionId] = useState<string>('authoritarian');
  
  const redToadState = state.redToadState;
  if (!redToadState) return null;

  const factions = Object.values(redToadState.factions);
  const currentFaction = redToadState.factions[selectedFactionId] || factions[0] || null;
  const isNkpdMode = !!state.flags.lu_nkpd_mode;
  const isDualPowerUnlocked = isNkpdMode && !!state.flags.lu_dual_power_unlocked;
  const isCompactNkpd = isDualPowerUnlocked && !!state.flags.lu_nkpd_compact_ui;
  const panelNoun = isNkpdMode ? '决议' : '法案';
  const nkpdBalance = typeof state.flags.lu_nkpd_power_balance === 'number' ? state.flags.lu_nkpd_power_balance : 50;
  const retiredFlagMap: Record<string, string> = {
    orthodox: 'faction_retired_orthodox',
    libertarian_socialist: 'faction_retired_libertarian_socialist',
    internet_philosopher: 'faction_retired_internet_philosopher',
    anarchist: 'faction_retired_anarchist',
    authoritarian: 'faction_retired_authoritarian',
  };
  const isFactionRetired = (factionId: string) => {
    if (state.flags.lu_bear_replaces_orthodox && factionId === 'orthodox') return false;
    return !!state.flags[retiredFlagMap[factionId]];
  };
  const luFaction = redToadState.factions.authoritarian || null;
  const bearFaction = Object.values(redToadState.factions).find(f => f.leader === '狗熊' || f.name.includes('狗熊')) || redToadState.factions.orthodox || null;
  const luPortrait = getFactionPortraitUrl(luFaction?.portrait || 'authoritarian', luFaction?.id || 'authoritarian');
  const bearPortrait = getFactionPortraitUrl(bearFaction?.portrait || 'gouxiong', bearFaction?.id || 'gouxiong');

  const getBalanceState = (value: number) => {
    if (value <= 35) return { text: '吕波汉主导', color: '#ff6666' };
    if (value >= 65) return { text: '狗熊主导', color: '#c084fc' };
    return { text: '脆弱平衡', color: '#f0d44a' };
  };

  const handleNkpdPowerShift = (side: 'lu' | 'bear') => {
    if (!isDualPowerUnlocked || state.stats.pp < 15) return;
    setGameState(prev => {
      const current = typeof prev.flags.lu_nkpd_power_balance === 'number' ? prev.flags.lu_nkpd_power_balance : 50;
      const delta = side === 'lu' ? -6 : 6;
      return {
        ...prev,
        stats: { ...prev.stats, pp: prev.stats.pp - 15 },
        flags: {
          ...prev.flags,
          lu_nkpd_power_balance: Math.max(0, Math.min(100, current + delta)),
        }
      };
    });
  };
  
  const activeBill = redToadState.activeBillId ? RED_TOAD_BILLS.find(b => b.id === redToadState.activeBillId) : null;

  // Calculate if bill passes based on influence and loyalty
  const calculateSupport = () => {
    let support = 0;
    factions.forEach(f => {
      // Factions with high loyalty are more likely to support, or we can just use influence * loyalty%
      support += f.influence * (f.loyalty / 100);
    });
    return support;
  };

  const currentSupport = calculateSupport();
  const willPass = activeBill ? currentSupport >= activeBill.supportThreshold : false;

  const handleSupport = () => {
    if (isFactionRetired(selectedFactionId)) return;
    if (state.stats.pp < 20) return;
    setGameState(prev => {
      if (!prev.redToadState) return prev;
      const newFactions = { ...prev.redToadState.factions };
      newFactions[selectedFactionId] = {
        ...newFactions[selectedFactionId],
        influence: Math.min(2000, newFactions[selectedFactionId].influence + 50),
        loyalty: Math.min(100, newFactions[selectedFactionId].loyalty + 10)
      };
      return {
        ...prev,
        stats: { ...prev.stats, pp: prev.stats.pp - 20 },
        redToadState: { ...prev.redToadState, factions: newFactions }
      };
    });
  };

  const handleSuppress = () => {
    if (isFactionRetired(selectedFactionId)) return;
    if (state.stats.pp < 20) return;
    setGameState(prev => {
      if (!prev.redToadState) return prev;
      const newFactions = { ...prev.redToadState.factions };
      newFactions[selectedFactionId] = {
        ...newFactions[selectedFactionId],
        influence: Math.max(0, newFactions[selectedFactionId].influence - 100),
        loyalty: Math.max(0, newFactions[selectedFactionId].loyalty - 20)
      };
      return {
        ...prev,
        stats: { ...prev.stats, pp: prev.stats.pp - 20 },
        redToadState: { ...prev.redToadState, factions: newFactions }
      };
    });
  };

  const handleVote = () => {
    if (!activeBill) return;
    setGameState(prev => {
      if (!prev.redToadState) return prev;
      let newState = { ...prev };
      if (willPass) {
        const partial = activeBill.onPass(newState);
        newState = { ...newState, ...partial, stats: { ...newState.stats, ...(partial.stats || {}) } };
      } else {
        const partial = activeBill.onFail(newState);
        newState = { ...newState, ...partial, stats: { ...newState.stats, ...(partial.stats || {}) } };
      }
      
      return {
        ...newState,
        redToadState: {
          ...newState.redToadState!,
          activeBillId: null,
          billCooldown: 15, // Next bill in 15 days
          historicalBills: [...(newState.redToadState!.historicalBills || []), activeBill.id],
          availableBills: []
        }
      };
    });
  };

  const handleSelectBill = (billId: string) => {
    setGameState(prev => {
      if (!prev.redToadState) return prev;
      
      const bill = RED_TOAD_BILLS.find(b => b.id === billId);
      let newFactions = { ...prev.redToadState.factions };
      
      if (bill?.initiator && newFactions[bill.initiator]) {
        newFactions[bill.initiator] = {
          ...newFactions[bill.initiator],
          execution: Math.max(0, newFactions[bill.initiator].execution - 30)
        };
      }

      return {
        ...prev,
        redToadState: {
          ...prev.redToadState,
          activeBillId: billId,
          factions: newFactions
        }
      };
    });
  };

  // Generate new bills if none active, cooldown is 0, and no available bills
  useEffect(() => {
    if (!redToadState.activeBillId && redToadState.billCooldown <= 0 && (!redToadState.availableBills || redToadState.availableBills.length === 0)) {
      const historical = redToadState.historicalBills || [];
      const possibleBills = RED_TOAD_BILLS.filter(b => !historical.includes(b.id));
      // Select up to 3 random bills
      const selectedBills: string[] = [];
      const billsToSelect = [...possibleBills];
      for (let i = 0; i < Math.min(3, possibleBills.length); i++) {
        const idx = Math.floor(Math.random() * billsToSelect.length);
        selectedBills.push(billsToSelect[idx].id);
        billsToSelect.splice(idx, 1);
      }
      
      if (selectedBills.length > 0) {
        setGameState(prev => {
          if (!prev.redToadState) return prev;
          return {
            ...prev,
            redToadState: { ...prev.redToadState, availableBills: selectedBills }
          };
        });
      }
    }
  }, [redToadState.activeBillId, redToadState.billCooldown, redToadState.availableBills, redToadState.historicalBills, setGameState]);

  useEffect(() => {
    if (!isCompactNkpd) return;
    const validIds = [luFaction?.id, bearFaction?.id].filter(Boolean) as string[];
    if (validIds.length === 0) return;
    if (!validIds.includes(selectedFactionId)) {
      setSelectedFactionId(validIds[0]);
    }
  }, [isCompactNkpd, bearFaction?.id, luFaction?.id, selectedFactionId]);

  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  const getLoyaltyInfo = (loyalty: number) => {
    if (loyalty >= 80) return { text: '绝对忠诚', color: '#4af0d4' };
    if (loyalty >= 60) return { text: '相对可靠', color: '#a8f04a' };
    if (loyalty >= 40) return { text: '摇摆不定', color: '#f0d44a' };
    if (loyalty >= 20) return { text: '不可预测', color: '#f08a4a' };
    return { text: '极度危险', color: '#ff4444' };
  };

  const getExecutionInfo = (execution: number) => {
    if (execution >= 80) return { text: '碾压级', color: '#ff4444' };
    if (execution >= 60) return { text: '稳健', color: '#f08a4a' };
    if (execution >= 40) return { text: '一般', color: '#f0d44a' };
    if (execution >= 20) return { text: '混乱', color: '#a8f04a' };
    return { text: '微弱', color: '#4af0d4' };
  };

  const getPanelTitle = (title: string) => (isNkpdMode ? title.replace(/法案/g, '决议') : title);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-6xl h-[85vh] bg-[#1a0f0f] border-2 border-[#d32f2f] shadow-[0_0_15px_rgba(211,47,47,0.3)] font-mono overflow-visible flex flex-col">
        
        {/* Scanlines Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)' }}></div>

        {/* Header */}
        <div className="relative z-[120] flex justify-between items-center p-4 border-b-2 border-[#d32f2f] bg-[#2d1313]">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-[#ff5252] tracking-[8px] drop-shadow-[0_0_5px_rgba(255,82,82,0.8)]">
              {isNkpdMode ? 'N K P D · 肃 反 委 员 会' : '合 一 联 合 革 委 会 · 政 治 局'}
            </h2>
            <div className="relative group z-[130]">
              <button className="w-8 h-8 rounded-full border-2 border-[#ff5252] text-[#ff5252] font-bold flex items-center justify-center hover:bg-[#ff5252] hover:text-black transition-colors">
                ?
              </button>
              <div className="absolute left-0 top-full mt-2 w-[30rem] max-w-[calc(100vw-4rem)] p-4 bg-black border border-[#ff5252] text-[#e0e0e0] text-sm hidden group-hover:block z-[200] shadow-[0_0_15px_rgba(255,82,82,0.5)]">
                <h3 className="text-[#ff5252] font-bold mb-2">政治局机制说明</h3>
                <ul className="list-disc pl-4 space-y-2">
                  <li><span className="text-[#4af0d4]">忠诚度</span>：影响党内总共识度。若忠诚派系不足3个，总共识度将下降。做题改革期间，各派忠诚度会随改革进度下降；题改完成后改为按稳定度下降（稳定度100时不下降）。</li>
                  <li><span className="text-[#ff4444]">执行力</span>：决定派系在政治局的影响力。若某派系忠诚度过低且执行力过高（&gt;70），将引发为期30天的派系危机，严重损害总共识度。</li>
                  <li><span className="text-[#f0d44a]">{panelNoun}发起</span>：通过倾向于某派系的{panelNoun}会显著降低该派系的执行力，可用于化解危机。</li>
                  <li><span className="text-[#ff5252]">总共识度</span>：决定国家精神“红蛤政治局”的增益或减益效果。肃反委员会模式下，退休派系将被打X并停止参与忠诚/执行博弈。</li>
                </ul>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-[#ff5252] hover:text-white font-bold text-xl px-4 py-1 border border-[#d32f2f] hover:bg-[#d32f2f]/20 transition-colors">
            关闭 [X]
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden z-10 p-4 gap-4">
          
          {/* Left Panel - Factions & Consensus */}
          <div className="flex-1 flex flex-col gap-4">
            
            {/* Factions Grid / NKPD Compact Head */}
            {isCompactNkpd ? (
              <div className="grid grid-cols-[1fr_320px_1fr] gap-3 items-stretch">
                <button
                  onClick={() => luFaction && setSelectedFactionId(luFaction.id)}
                  className={`p-3 border-2 bg-black/45 transition-all ${luFaction && selectedFactionId === luFaction.id ? 'scale-[1.02] shadow-lg' : 'hover:bg-black/60'}`}
                  style={{ borderColor: '#ff6666', boxShadow: luFaction && selectedFactionId === luFaction.id ? '0 0 12px rgba(255,102,102,0.5)' : 'none' }}
                >
                  <div className="text-sm font-bold text-[#ff9c9c] tracking-widest text-center">{luFaction?.name || '吕波汉派'}</div>
                  <div className="mt-2 h-28 w-[84px] mx-auto border border-[#ff6666]/60 bg-gradient-to-br from-[#2a1010] to-[#3f1616] overflow-hidden relative">
                    <img src={luPortrait} alt={luFaction?.leader || '吕波汉'} className="w-full h-full object-cover object-top opacity-80 mix-blend-luminosity" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-[#ff6666]/10"></div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-center text-xs text-[#ffd5d5] py-1">{luFaction?.leader || '吕波汉'}</div>
                  </div>
                  <div className="mt-2 text-xs text-[#ffb3b3] text-center">吕波汉权力极</div>
                </button>

                <div className="border-2 border-[#7b1c1c] bg-[#160808] p-3 flex flex-col justify-center">
                  <div className="text-xs text-center text-[#ff8a8a] mb-2 tracking-[0.2em]">N K P D 权 力 平 衡</div>
                  <div className="h-24 border border-[#7b1c1c] bg-black/60 relative overflow-hidden px-2 py-3">
                    <div className="absolute left-1 right-1 top-1/2 -translate-y-1/2 h-8 border border-[#7b1c1c] bg-[#120808]">
                      <div className="h-full bg-gradient-to-r from-[#ff5555] via-[#f0d44a] to-[#b86bff]" style={{ width: `${nkpdBalance}%` }}></div>
                    </div>
                    <div className="absolute top-2 left-2 text-[10px] text-[#ff8f8f]">吕波汉</div>
                    <div className="absolute top-2 right-2 text-[10px] text-[#d8b4fe]">狗熊</div>
                  </div>
                  <div className="mt-2 text-center text-xs" style={{ color: getBalanceState(nkpdBalance).color }}>{getBalanceState(nkpdBalance).text}（{nkpdBalance.toFixed(2)}）</div>
                </div>

                <button
                  onClick={() => bearFaction && setSelectedFactionId(bearFaction.id)}
                  className={`p-3 border-2 bg-black/45 transition-all ${bearFaction && selectedFactionId === bearFaction.id ? 'scale-[1.02] shadow-lg' : 'hover:bg-black/60'}`}
                  style={{ borderColor: '#c084fc', boxShadow: bearFaction && selectedFactionId === bearFaction.id ? '0 0 12px rgba(192,132,252,0.5)' : 'none' }}
                >
                  <div className="text-sm font-bold text-[#d8b4fe] tracking-widest text-center">{bearFaction?.name || '狗熊派'}</div>
                  <div className="mt-2 h-28 w-[84px] mx-auto border border-[#c084fc]/60 bg-gradient-to-br from-[#1a1022] to-[#2d153d] overflow-hidden relative">
                    <img src={bearPortrait} alt={bearFaction?.leader || '狗熊'} className="w-full h-full object-cover object-top opacity-80 mix-blend-luminosity" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-[#c084fc]/10"></div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-center text-xs text-[#f1e4ff] py-1">{bearFaction?.leader || '狗熊'}</div>
                  </div>
                  <div className="mt-2 text-xs text-[#d8b4fe] text-center">狗熊权力极</div>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {factions.map(faction => (
                  <button
                    key={faction.id}
                    onClick={() => setSelectedFactionId(faction.id)}
                    className={`flex flex-col items-center p-2 border-2 transition-all ${selectedFactionId === faction.id ? 'bg-[#1a1a1a] scale-105 shadow-lg' : 'bg-black/50 hover:bg-[#1a1a1a]'}`}
                    style={{ borderColor: faction.color, boxShadow: selectedFactionId === faction.id ? `0 0 10px ${faction.color}40` : 'none' }}
                  >
                    <div className="font-bold text-lg mb-2" style={{ color: faction.color }}>{faction.name}</div>
                    <div className="w-full aspect-[3/4] border border-opacity-50 relative mb-2 flex items-center justify-center overflow-hidden" style={{ borderColor: faction.color, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
                      {faction.portrait ? (
                        <img src={getFactionPortraitUrl(faction.portrait, faction.id)} alt={faction.leader} className="w-full h-full object-cover opacity-80 mix-blend-luminosity" style={{ filter: `drop-shadow(0 0 5px ${faction.color})` }} referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-xs" style={{ color: faction.color }}>{faction.view}</span>
                      )}
                      {isFactionRetired(faction.id) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-[#ff2a2a] text-5xl font-black">X</div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 text-center text-xs font-bold" style={{ color: faction.color }}>
                        {faction.leader}
                      </div>
                    </div>
                    <div className="text-sm text-[#e0e0e0]">势力: {faction.influence}/2000</div>
                    {isFactionRetired(faction.id) && <div className="text-[11px] text-[#ff6b6b] mt-1">已退休</div>}
                  </button>
                ))}
                {Array.from({ length: Math.max(0, 5 - factions.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex flex-col items-center p-2 border-2 border-[#333] bg-black/50 opacity-50">
                    <div className="font-bold text-lg mb-2 text-[#666]">[空缺]</div>
                    <div className="w-full aspect-[3/4] border border-[#333] relative mb-2 flex items-center justify-center">
                      <span className="text-xs text-[#666]">等待任命</span>
                    </div>
                    <div className="text-sm text-[#444]">---</div>
                  </div>
                ))}
              </div>
            )}

            {/* Consensus Bar */}
            <div className="mt-4 border-4 border-[#b71c1c] bg-[#1a0505] p-4 relative shadow-[0_0_15px_rgba(183,28,28,0.5)]">
              <div className="text-center text-[#ff5252] font-black text-2xl mb-3 tracking-widest drop-shadow-[0_0_5px_rgba(255,82,82,0.8)]">党 内 总 共 识 度: {redToadState.overallConsensus}</div>
              <div className="h-12 border-2 border-[#d32f2f] relative overflow-hidden bg-[#110000]">
                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#8b0000] via-[#d32f2f] to-[#ff5252] transition-all duration-500 shadow-[0_0_10px_rgba(255,82,82,0.8)]" style={{ width: `${redToadState.overallConsensus}%` }}></div>
                <div className="absolute inset-0 flex justify-between px-4 items-center pointer-events-none opacity-50">
                  <div className="w-1 h-full bg-black"></div>
                  <div className="w-1 h-full bg-black"></div>
                  <div className="w-1 h-full bg-black"></div>
                </div>
              </div>
            </div>

            {isDualPowerUnlocked && !isCompactNkpd && (
              <div className="mt-2 border border-[#7b1c1c] bg-[#150707] p-3">
                <div className="text-sm font-bold text-[#ff8a8a] mb-2">N K P D 权 力 平 衡（吕波汉 ← → 狗熊）</div>
                <div className="h-3 border border-[#7b1c1c] bg-black/60 relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#ff5555] via-[#f0d44a] to-[#b86bff]" style={{ width: `${nkpdBalance}%` }}></div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-[#d0baba]">
                  <span>吕波汉侧</span>
                  <span style={{ color: getBalanceState(nkpdBalance).color }}>{getBalanceState(nkpdBalance).text}（{nkpdBalance.toFixed(2)}）</span>
                  <span>狗熊侧</span>
                </div>
                <div className="mt-2 text-[11px] text-[#b78f8f]">领袖加成：平衡值每日向吕波汉侧移动 0.05。</div>
              </div>
            )}

            {isNkpdMode && (
              <div className="border border-[#7b1c1c] bg-black/35 p-3 text-xs text-[#caa]">
                <div className="text-[#ff8a8a] font-bold mb-1">大清洗协同状态</div>
                <div>地图行动累计：{state.flags.lu_purge_map_actions || 0} 次</div>
                <div>地区授权：
                  {(state.flags.lu_purge_action_b3 ? ' B3' : '')}
                  {(state.flags.lu_purge_action_admin ? ' 行政楼' : '')}
                  {(state.flags.lu_purge_action_b1b2 ? ' B1/B2' : '')}
                  {(state.flags.lu_purge_action_lab ? ' 实验楼' : '')}
                  {(state.flags.lu_purge_action_playground ? ' 操场' : '')}
                  {(state.flags.lu_purge_action_auditorium ? ' 礼堂' : '')}
                  {!state.flags.lu_purge_action_b3 && !state.flags.lu_purge_action_admin && !state.flags.lu_purge_action_b1b2 && !state.flags.lu_purge_action_lab && !state.flags.lu_purge_action_playground && !state.flags.lu_purge_action_auditorium ? ' 暂无' : ''}
                </div>
              </div>
            )}

            {/* Supreme Soviet Emblem */}
            <div className="flex-1 min-h-[260px] flex items-center justify-center relative mt-4 border border-[#7b1c1c] bg-[radial-gradient(circle_at_50%_50%,rgba(125,22,22,0.22),rgba(20,6,6,0.92))] p-3">
              <div className="absolute top-2 left-3 text-xs tracking-[0.3em] text-[#ff8a8a]/75">最 高 苏 维 埃</div>
              <div className="w-full h-full max-w-[920px] opacity-90">
                <NeonEmblem />
              </div>
            </div>
          </div>

          {/* Right Panel - Bills & Actions */}
          <div className="w-[320px] border-2 border-[#d32f2f] bg-[#1f0a0a] flex flex-col shadow-[inset_0_0_20px_rgba(211,47,47,0.2)]">
            
            {/* Tabs */}
            <div className="flex border-b border-[#d32f2f]">
              <button 
                onClick={() => setActiveTab('current')}
                className={`flex-1 py-2 font-bold transition-colors ${activeTab === 'current' ? 'bg-[#d32f2f] text-white' : 'text-[#ff5252] hover:bg-[#d32f2f]/20'}`}
              >
                当前{isNkpdMode ? '执行' : '表决'}{panelNoun}
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2 font-bold transition-colors ${activeTab === 'history' ? 'bg-[#d32f2f] text-white' : 'text-[#ff5252] hover:bg-[#d32f2f]/20'}`}
              >
                历史{panelNoun}
              </button>
            </div>

            {/* Active Bill or Selection */}
            <div className="p-4 border-b border-[#d32f2f] border-dashed flex-1 flex flex-col overflow-y-auto">
              {activeTab === 'history' ? (
                <div className="flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-[#ff5252] text-center mb-4 border-b border-[#d32f2f]/30 pb-2">已执行{panelNoun}</h3>
                  <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                    {redToadState.historicalBills && redToadState.historicalBills.length > 0 ? (
                      redToadState.historicalBills.map(billId => {
                        const bill = RED_TOAD_BILLS.find(b => b.id === billId);
                        if (!bill) return null;
                        return (
                          <div key={bill.id} className="w-full text-left p-3 border border-[#d32f2f]/30 bg-[#d32f2f]/10">
                            <div className="font-bold text-[#e0e0e0]">{getPanelTitle(bill.title)}</div>
                            <div className="text-xs text-[#a0b0b0] mt-1">{bill.description}</div>
                            <div className="text-xs text-[#ff5252] mt-2 font-bold text-right">{isNkpdMode ? '已执行' : '已表决'}</div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-[#ff5252]/50 mt-10">暂无历史{panelNoun}</div>
                    )}
                  </div>
                </div>
              ) : activeBill ? (
                <>
                  <h3 className="text-xl font-bold text-[#e0e0e0] text-center mb-4">{getPanelTitle(activeBill.title)}</h3>
                  {activeBill.initiator && <div className="text-xs text-[#ff5252] text-center mb-2">{isNkpdMode ? '提出组' : '发起方'}: {redToadState.factions[activeBill.initiator]?.name || activeBill.initiator}</div>}
                  <div className="text-sm text-[#a0b0b0] leading-relaxed space-y-2 flex-1">
                    <p>{activeBill.description}</p>
                    {activeBill.warning && <p className="text-[#ff5252] mt-4">{activeBill.warning}</p>}
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#d32f2f]/30">
                    <div className="text-xs text-[#e0e0e0] mb-1 flex justify-between">
                      <span>当前支持度: {Math.floor(currentSupport)}</span>
                      <span>需要: {activeBill.supportThreshold}</span>
                    </div>
                    <div className="h-2 bg-[#110000] border border-[#d32f2f]/50">
                      <div className="h-full bg-[#ff5252] transition-all" style={{ width: `${Math.min(100, (currentSupport / activeBill.supportThreshold) * 100)}%` }}></div>
                    </div>
                    <div className="text-center mt-2 text-sm font-bold" style={{ color: willPass ? '#ff5252' : '#b71c1c' }}>
                      {willPass ? '预计通过' : '预计否决'}
                    </div>
                  </div>
                </>
              ) : redToadState.billCooldown > 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="text-[#ff5252] text-4xl mb-4">⏳</div>
                  <div className="text-[#e0e0e0] font-bold text-lg mb-2">{isNkpdMode ? '肃反委员会整编中' : '政治局休会中'}</div>
                  <div className="text-[#a0b0b0] text-sm">距离下次{panelNoun}还有 {redToadState.billCooldown} 天</div>
                </div>
              ) : redToadState.availableBills && redToadState.availableBills.length > 0 ? (
                <div className="flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-[#ff5252] text-center mb-4 border-b border-[#d32f2f]/30 pb-2">选择{panelNoun}</h3>
                  <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                    {redToadState.availableBills.map(billId => {
                      const bill = RED_TOAD_BILLS.find(b => b.id === billId);
                      if (!bill) return null;
                      return (
                        <button
                          key={bill.id}
                          onClick={() => handleSelectBill(bill.id)}
                          className="w-full text-left p-3 border border-[#d32f2f]/50 hover:bg-[#d32f2f]/20 transition-colors group"
                        >
                          <div className="font-bold text-[#e0e0e0] group-hover:text-[#ff5252]">{getPanelTitle(bill.title)}</div>
                          {bill.initiator && <div className="text-xs text-[#ff5252] mt-1">{isNkpdMode ? '提出组' : '发起方'}: {redToadState.factions[bill.initiator]?.name || bill.initiator}</div>}
                          <div className="text-xs text-[#a0b0b0] mt-1 line-clamp-2">{bill.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-[#ff5252]/50">
                  暂无可用{panelNoun}
                </div>
              )}
            </div>

            {/* Faction Details & Actions */}
            <div className="p-4 bg-[#1a0f0f] flex flex-col gap-4 flex-1">
              {currentFaction ? (
                <>
                  <div className="text-center text-[#e0e0e0]">
                    当前选中: <span className="font-bold" style={{ color: currentFaction.color }}>{currentFaction.name} ({currentFaction.leader})</span>
                    {isFactionRetired(currentFaction.id) && <span className="ml-2 text-[#ff6b6b]">[已退休]</span>}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-[#e0e0e0] mb-1 flex justify-between">
                        <span>忠诚度: <span style={{ color: getLoyaltyInfo(currentFaction.loyalty).color }}>{getLoyaltyInfo(currentFaction.loyalty).text}</span></span>
                        <span>{currentFaction.loyalty}/100</span>
                      </div>
                      <div className="h-3 border" style={{ borderColor: currentFaction.color, backgroundColor: '#110000' }}>
                        <div className="h-full transition-all" style={{ width: `${currentFaction.loyalty}%`, backgroundColor: currentFaction.color }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-[#e0e0e0] mb-1 flex justify-between">
                        <span>执行力: <span style={{ color: getExecutionInfo(currentFaction.execution).color }}>{getExecutionInfo(currentFaction.execution).text}</span></span>
                        <span>{currentFaction.execution}/100</span>
                      </div>
                      <div className="h-3 border" style={{ borderColor: currentFaction.color, backgroundColor: '#221111' }}>
                        <div className="h-full transition-all" style={{ width: `${currentFaction.execution}%`, backgroundColor: currentFaction.color }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={handleSupport}
                      disabled={state.stats.pp < 20 || isFactionRetired(currentFaction.id)}
                      className="flex-1 py-2 border-2 border-[#d32f2f] text-[#ff5252] hover:bg-[#d32f2f] hover:text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={isFactionRetired(currentFaction.id) ? '该派系已退休，无法操作' : '消耗20政治点数，提升影响力和忠诚度'}
                    >
                      {isNkpdMode ? '+ 归档豁免' : '+ 支持派系'}
                    </button>
                    <button 
                      onClick={handleSuppress}
                      disabled={state.stats.pp < 20 || isFactionRetired(currentFaction.id)}
                      className="flex-1 py-2 border-2 border-[#d32f2f] text-[#ff5252] hover:bg-[#d32f2f] hover:text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={isFactionRetired(currentFaction.id) ? '该派系已退休，无法操作' : '消耗20政治点数，降低影响力，大幅降低忠诚度'}
                    >
                      {isNkpdMode ? '- 肃反整编' : '- 打压派系'}
                    </button>
                  </div>

                  {isDualPowerUnlocked && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleNkpdPowerShift('lu')}
                        disabled={state.stats.pp < 15}
                        className="py-2 border border-[#ff6666] text-[#ff8f8f] hover:bg-[#ff6666]/20 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        title="消耗15政治点数，权力平衡向吕波汉侧移动"
                      >
                        向吕波汉倾斜
                      </button>
                      <button
                        onClick={() => handleNkpdPowerShift('bear')}
                        disabled={state.stats.pp < 15}
                        className="py-2 border border-[#c084fc] text-[#d8b4fe] hover:bg-[#c084fc]/20 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        title="消耗15政治点数，权力平衡向狗熊侧移动"
                      >
                        向狗熊倾斜
                      </button>
                    </div>
                  )}

                  {activeTab === 'current' && (
                    <button 
                      onClick={handleVote}
                      disabled={!activeBill}
                      className="w-full py-3 mt-auto bg-[#d32f2f] text-white font-bold text-lg hover:bg-[#ff5252] transition-colors disabled:opacity-50 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(211,47,47,0.5)]"
                    >
                      {isNkpdMode ? '执 行 决 议' : '进 行 表 决'}
                    </button>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-[#ff5252]/50">
                  尚无派系加入政治局
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
