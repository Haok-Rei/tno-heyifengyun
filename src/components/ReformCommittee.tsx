import React, { useState } from 'react';
import { GameState } from '../types';
import { getCommandState, getTeamCapacity, reserveReformTeam } from '../engine/commandSystem';

interface ReformCommitteeProps {
  state: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onClose: () => void;
  triggerError: () => void;
}

export default function ReformCommittee({ state, setGameState, onClose, triggerError }: ReformCommitteeProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  if (!state.reformState) return null;

  const { progress, vanguardMembers, baseSuccessRate } = state.reformState;
  const regionalStubbornness = state.reformState.regionalStubbornness || {};
  const activeMissions = state.reformState.activeMissions || {};
  const command = getCommandState(state);
  const freeTeams = command.teams.slice(0, getTeamCapacity(state)).filter(team => !team.order).length;

  const handleDispatch = (regionId: string, actionId: string, costPP: number, costTPR: number, costMembers: number, days: number) => {
    if (state.stats.pp < costPP || state.stats.tpr < costTPR || vanguardMembers < costMembers || freeTeams < 1) {
      triggerError();
      return;
    }
    
    if (activeMissions[regionId]) {
      triggerError(); // Already a mission here
      return;
    }

    setGameState(prev => {
      if (!prev.reformState) return prev;
      const reserved = reserveReformTeam(prev, regionId, actionId, days);
      if (!reserved) return prev;
      const fieldSupport = Math.min(2, reserved.command?.preparation?.reform || 0);
      return {
        ...reserved,
        command: reserved.command ? { ...reserved.command, preparation: { ...reserved.command.preparation, reform: (reserved.command.preparation?.reform || 0) - fieldSupport } } : undefined,
        stats: {
          ...prev.stats,
          pp: prev.stats.pp - costPP,
          tpr: prev.stats.tpr - costTPR
        },
        reformState: {
          ...prev.reformState,
          vanguardMembers: prev.reformState.vanguardMembers - costMembers,
          activeMissions: {
            ...prev.reformState.activeMissions,
            [regionId]: { daysLeft: days, actionId, membersCommitted: costMembers, fieldSupport }
          }
        }
      };
    });
  };

  const getSuccessRate = (regionId: string) => {
    const stubbornness = regionalStubbornness[regionId] || 0;
    const rate = baseSuccessRate - stubbornness + (state.stats.partyCentralization * 0.2) - (state.stats.capitalPenetration * 0.15) + Math.min(2, command.preparation?.reform || 0) * 8;
    return Math.max(0, Math.min(100, Math.round(rate)));
  };

  const regions = [
    { id: 'B3', name: 'B3教学楼 (高三核心区)' },
    { id: 'B1_B2', name: 'B1/B2教学楼 (高一高二区)' },
    { id: 'Admin', name: '行政楼 (旧官僚与资本残余)' },
    { id: 'ArtHall', name: '艺术礼堂 (宣传阵地)' },
    { id: 'Lab', name: '实验楼 (技术与信息中心)' },
    { id: 'Playground', name: '操场 (集会区)' }
  ];

  return (
    <div className="reform-panel absolute inset-0 z-50 flex flex-col crt">
      <div className="flex justify-between items-center mb-6 border-b-2 border-tno-highlight pb-4">
        <h2 className="text-3xl font-bold text-tno-highlight tracking-widest">全面做题改革委员会</h2>
        <button onClick={onClose} className="text-tno-red hover:text-white text-2xl font-bold">✕</button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="col-span-2 bg-black border border-tno-panel p-3">
          <h3 className="text-lg font-bold mb-1 text-white tracking-widest">总题改进度</h3>
          <div className="reform-progress w-full h-10 bg-zinc-900 border-2 border-gray-600 relative overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <div 
              className={`absolute top-0 left-0 h-full transition-all duration-1000 ${progress < 30 ? 'bg-tno-red' : progress < 70 ? 'bg-yellow-500' : 'bg-tno-green'}`}
              style={{ width: `${progress}%` }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center font-black text-white text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-widest">
              {Math.round(progress)}%
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">达到100%即宣告“做题改革”彻底胜利。</p>
        </div>

        <div className="bg-black border border-tno-panel p-3 flex flex-col justify-center items-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.1)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <h3 className="text-md font-bold mb-1 text-gray-300 z-10">先锋党员</h3>
          <div className="text-3xl font-black text-emerald-300  z-10">{vanguardMembers}</div>
          <p className="text-[10px] text-gray-500 mt-1 z-10">先锋党员 · 可用工作组 {freeTeams}/{getTeamCapacity(state)}</p>
          <p className="text-[10px] text-emerald-300 mt-1 z-10">基层筹备 {command.preparation?.reform || 0}/6 · 每次任务最多投入 2 份</p>
        </div>

        <div className="bg-black border border-tno-panel p-3 flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]"></div>
          <h3 className="text-md font-bold mb-1 text-gray-300 z-10">卷豪态度</h3>
          <div className={`text-2xl font-black z-10 drop-shadow-md ${
            (state.reformState.juanhaoAttitude || 0) === 0 ? 'text-tno-red' :
            (state.reformState.juanhaoAttitude || 0) === 1 ? 'text-orange-500' :
            (state.reformState.juanhaoAttitude || 0) === 2 ? 'text-yellow-500' :
            (state.reformState.juanhaoAttitude || 0) === 3 ? 'text-green-400' :
            'text-emerald-300 animate-pulse'
          }`}>
            {['敌视', '迷茫', '动摇', '理解', '先锋'][state.reformState.juanhaoAttitude || 0]}
          </div>
          <p className="text-[10px] text-gray-500 mt-1 text-center z-10">
            {(state.reformState.juanhaoAttitude || 0) === 4 ? '坚定的同志' : 'B3任务影响态度'}
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
        <div className="col-span-1 border border-tno-panel bg-black/50 overflow-y-auto">
          <div className="p-2 bg-[#1d2c31] text-[#cfc0a1] font-bold text-center sticky top-0">派遣目标区域</div>
          {regions.map(r => {
            const isActive = !!activeMissions[r.id];
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRegion(r.id)}
                className={`w-full text-left p-4 border-b border-gray-800 hover:bg-gray-900 transition-colors ${selectedRegion === r.id ? 'bg-gray-800 border-l-4 border-l-tno-highlight' : ''}`}
              >
                <div className="font-bold text-blue-300">{r.name}</div>
                <div className="region-resistance" aria-hidden="true"><i style={{width: `${Math.max(0,Math.min(100,regionalStubbornness[r.id] || 0))}%`}} /></div>
                <div className="text-sm mt-1">做题派顽固度: <span className="text-red-400">{Math.round(regionalStubbornness[r.id] || 0)}%</span></div>
                {isActive && <div className="text-xs text-tno-highlight mt-1 animate-pulse">任务执行中... (剩余 {activeMissions[r.id].daysLeft} 天)</div>}
              </button>
            );
          })}
        </div>

        <div className="col-span-2 border border-tno-panel bg-black/50 p-6 overflow-y-auto">
          {selectedRegion ? (
            <>
              <div className="flex justify-between items-end mb-4 border-b border-gray-700 pb-2">
                <h3 className="text-2xl font-bold text-white">{regions.find(r => r.id === selectedRegion)?.name}</h3>
                <div className="group relative cursor-help flex items-center gap-2">
                  <span className="text-sm text-gray-400">预计成功率:</span>
                  <span className={`text-3xl font-black ${getSuccessRate(selectedRegion) < 30 ? 'text-tno-red' : getSuccessRate(selectedRegion) < 70 ? 'text-yellow-500' : 'text-emerald-300'}`}>
                    {getSuccessRate(selectedRegion)}%
                  </span>
                  <div className="absolute top-full right-0 mt-2 w-64 bg-black border border-tno-panel p-3 hidden group-hover:block z-50 shadow-xl text-xs text-gray-300">
                    <div className="font-bold text-white mb-2 border-b border-gray-700 pb-1">成功率计算公式</div>
                    <div className="flex justify-between mb-1"><span>基础成功率:</span><span className="text-white">{baseSuccessRate}%</span></div>
                    <div className="flex justify-between mb-1"><span>区域顽固度惩罚:</span><span className="text-tno-red">-{Math.round(regionalStubbornness[selectedRegion] || 0)}%</span></div>
                    <div className="flex justify-between mb-1"><span>党内集权加成:</span><span className="text-emerald-300">+{Math.round(state.stats.partyCentralization * 0.2)}%</span></div>
                    <div className="flex justify-between"><span>资本渗透惩罚:</span><span className="text-tno-red">-{Math.round(state.stats.capitalPenetration * 0.15)}%</span></div>
                    <div className="flex justify-between"><span>工作组地区筹备（派遣时消耗）:</span><span className="text-emerald-300">+{Math.min(2, command.preparation?.reform || 0) * 8}%</span></div>
                  </div>
                </div>
              </div>

              {activeMissions[selectedRegion] ? (
                <div className="text-center p-8 border border-tno-highlight bg-tno-highlight/10">
                  <h4 className="text-xl font-bold text-tno-highlight mb-2">工作队已部署</h4>
                  <p className="text-gray-300">任务正在执行中，请耐心等待结果。</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-gray-300 border-b border-gray-700 pb-2">可用行动</h4>
                  
                  {selectedRegion === 'B3' && (
                    <>
                      <ActionCard 
                        title="收缴私藏绝密押题卷" 
                        desc="高风险行动。成功可大幅增加总题改进度，失败则大幅增加激进愤怒度并损失党员。"
                        costPP={60} costTPR={200} costMembers={10} days={14}
                        onDispatch={() => handleDispatch('B3', 'confiscate_papers', 60, 200, 10, 14)}
                        canAfford={freeTeams > 0 && state.stats.pp >= 60 && state.stats.tpr >= 200 && vanguardMembers >= 10}
                      />
                      <ActionCard 
                        title="建立解题合作社" 
                        desc="将个人的做题经验集体化。"
                        costPP={40} costTPR={300} costMembers={5} days={14}
                        onDispatch={() => handleDispatch('B3', 'coop', 40, 300, 5, 14)}
                        canAfford={freeTeams > 0 && state.stats.pp >= 40 && state.stats.tpr >= 300 && vanguardMembers >= 5}
                      />
                      {state.reformState.unlockedB3Actions && (
                        <>
                          <ActionCard 
                            title="批判做题家特权" 
                            desc="直接打击核心区的特权思想，成功可大幅提升题改进度。"
                            costPP={80} costTPR={400} costMembers={15} days={21}
                            onDispatch={() => handleDispatch('B3', 'criticize_privilege', 80, 400, 15, 21)}
                            canAfford={freeTeams > 0 && state.stats.pp >= 80 && state.stats.tpr >= 400 && vanguardMembers >= 15}
                          />
                          <ActionCard 
                            title="推广互助学习法" 
                            desc="温和的改革措施，提升题改进度并降低顽固度。"
                            costPP={50} costTPR={500} costMembers={10} days={14}
                            onDispatch={() => handleDispatch('B3', 'mutual_learning', 50, 500, 10, 14)}
                            canAfford={freeTeams > 0 && state.stats.pp >= 50 && state.stats.tpr >= 500 && vanguardMembers >= 10}
                          />
                        </>
                      )}
                    </>
                  )}
                  {selectedRegion === 'B1_B2' && (
                    <>
                      <ActionCard 
                        title="新思想宣讲" 
                        desc="成功可稳定增加学生支持度并降低未来的做题派顽固度。"
                        costPP={30} costTPR={100} costMembers={5} days={10}
                        onDispatch={() => handleDispatch('B1_B2', 'speech', 30, 100, 5, 10)}
                        canAfford={freeTeams > 0 && state.stats.pp >= 30 && state.stats.tpr >= 100 && vanguardMembers >= 5}
                      />
                      <ActionCard 
                        title="废除早读站立内卷" 
                        desc="打破形式主义的内卷。"
                        costPP={40} costTPR={150} costMembers={5} days={14}
                        onDispatch={() => handleDispatch('B1_B2', 'abolish_stand', 40, 150, 5, 14)}
                        canAfford={freeTeams > 0 && state.stats.pp >= 40 && state.stats.tpr >= 150 && vanguardMembers >= 5}
                      />
                    </>
                  )}
                  {selectedRegion === 'Admin' && (
                    <>
                      <ActionCard 
                        title="审查及第教育账本" 
                        desc="成功可降低资本渗透度，并缴获大量试卷储备量作为战利品。"
                        costPP={80} costTPR={0} costMembers={15} days={21}
                        onDispatch={() => handleDispatch('Admin', 'audit', 80, 0, 15, 21)}
                        canAfford={freeTeams > 0 && state.stats.pp >= 80 && vanguardMembers >= 15}
                      />
                      <ActionCard 
                        title="清算暗箱交易" 
                        desc="彻底清除资本的毒瘤。"
                        costPP={100} costTPR={0} costMembers={20} days={21}
                        onDispatch={() => handleDispatch('Admin', 'purge_corruption', 100, 0, 20, 21)}
                        canAfford={freeTeams > 0 && state.stats.pp >= 100 && vanguardMembers >= 20}
                      />
                    </>
                  )}
                  {selectedRegion === 'ArtHall' && (
                    <>
                      <ActionCard 
                        title="排演红色先锋话剧" 
                        desc="消耗少量试卷，降低全校的做题派顽固度，提高联盟团结度。"
                        costPP={30} costTPR={200} costMembers={5} days={14}
                        onDispatch={() => handleDispatch('ArtHall', 'play', 30, 200, 5, 14)}
                        canAfford={freeTeams > 0 && state.stats.pp >= 30 && state.stats.tpr >= 200 && vanguardMembers >= 5}
                      />
                      <ActionCard 
                        title="大字报攻势" 
                        desc="发动群众的力量。"
                        costPP={35} costTPR={150} costMembers={5} days={7}
                        onDispatch={() => handleDispatch('ArtHall', 'posters', 35, 150, 5, 7)}
                        canAfford={freeTeams > 0 && state.stats.pp >= 35 && state.stats.tpr >= 150 && vanguardMembers >= 5}
                      />
                    </>
                  )}
                  {selectedRegion === 'Lab' && (
                    <>
                      <ActionCard 
                        title="接管油印机" 
                        desc="提升全校执行任务的成功率基数。"
                        costPP={50} costTPR={200} costMembers={10} days={14}
                        onDispatch={() => handleDispatch('Lab', 'takeover_printer', 50, 200, 10, 14)}
                        canAfford={freeTeams > 0 && state.stats.pp >= 50 && state.stats.tpr >= 200 && vanguardMembers >= 10}
                      />
                      <ActionCard 
                        title="破解衡水题库局域网" 
                        desc="获取核心资源。"
                        costPP={60} costTPR={0} costMembers={10} days={21}
                        onDispatch={() => handleDispatch('Lab', 'hack_network', 60, 0, 10, 21)}
                        canAfford={freeTeams > 0 && state.stats.pp >= 60 && vanguardMembers >= 10}
                      />
                    </>
                  )}
                  {selectedRegion === 'Playground' && (
                    <>
                      <ActionCard 
                        title="召开诉苦大会" 
                        desc="极端操作。大幅提升题改进度，但严重消耗学生理智度。"
                        costPP={60} costTPR={0} costMembers={15} days={14}
                        onDispatch={() => handleDispatch('Playground', 'complaint_meeting', 60, 0, 15, 14)}
                        canAfford={freeTeams > 0 && state.stats.pp >= 60 && vanguardMembers >= 15}
                      />
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              请在左侧选择一个区域以查看可用行动。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionCard({ title, desc, costPP, costTPR, costMembers, days, onDispatch, canAfford }: any) {
  return (
    <div className={`reform-action p-4 border ${canAfford ? 'border-gray-600 hover:border-tno-highlight bg-gray-900' : 'border-gray-800 bg-gray-950 opacity-60'} transition-colors`}>
      <div className="flex justify-between items-start mb-2">
        <h5 className="font-bold text-blue-200 text-lg">{title}</h5>
        <div className="text-xs font-mono text-gray-400">耗时: {days}天</div>
      </div>
      <p className="text-sm text-gray-400 mb-4">{desc}</p>
      <div className="flex justify-between items-center">
        <div className="flex space-x-4 text-xs">
          <span className={costPP > 0 ? 'text-orange-300' : 'text-gray-600'}>PP: -{costPP}</span>
          <span className={costTPR > 0 ? 'text-blue-300' : 'text-gray-600'}>TPR: -{costTPR}</span>
          <span className={costMembers > 0 ? 'text-green-300' : 'text-gray-600'}>党员: -{costMembers}</span>
        </div>
        <button 
          onClick={onDispatch}
          disabled={!canAfford}
          className={`px-4 py-1 text-sm font-bold ${canAfford ? 'bg-tno-highlight text-black hover:bg-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
        >
          派遣工作队
        </button>
      </div>
    </div>
  );
}
