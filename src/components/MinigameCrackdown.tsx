import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types';
import { Siren, Shield, Clock, Eye } from 'lucide-react';
import { getCommandState } from '../engine/commandSystem';

interface Props { state: GameState; onComplete: (r: CrackdownResult) => void; spendPP: (n: number) => boolean; }
export interface CrackdownResult {
  tier: 'critical' | 'success' | 'partial' | 'failure';
  cleared: number;
  collateral: number;
  guerrillaReduction: number;
  angerChange: number;
}

/** 3x3 戒严网格：9个校园区域 */
const GRID = [
  { id: 'b3_a1a3', name: 'B3-A区' }, { id: 'b3_tower', name: 'B3主楼' }, { id: 'admin_main', name: '行政楼' },
  { id: 'dorm_1_4', name: '宿舍1-4栋' }, { id: 'aud_hall', name: '礼堂大厅' }, { id: 'canteen', name: '食堂区' },
  { id: 'lib_area', name: '图书馆' }, { id: 'court_area', name: '篮球场' }, { id: 'track_field', name: '田径场' },
];

type CellState = 'empty' | 'protest' | 'crowd';

export default function MinigameCrackdown({ state, onComplete, spendPP }: Props) {
  const fieldSupport = Math.min(3, getCommandState(state).preparation?.wu || 0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [started, setStarted] = useState(false);
  const [cells, setCells] = useState<CellState[]>(Array(9).fill('empty'));
  const [cleared, setCleared] = useState(() => fieldSupport * 2);
  const [collateral, setCollateral] = useState(0);
  const [spawnCooldown, setSpawnCooldown] = useState(0);
  const [shake, setShake] = useState(false);
  const [lastAction, setLastAction] = useState('');
  const loopRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    loopRef.current = setInterval(() => {
      setTimeLeft(p => { if (p <= 1) { clearInterval(loopRef.current!); return 0; } return p - 1; });
      setSpawnCooldown(p => {
        if (p <= 0) {
          // 刷新抗议点：空地上概率生成抗议点，少量围观群众
          setCells(prev => {
            const next = [...prev];
            const emptyIdx = next.map((c, i) => c === 'empty' ? i : -1).filter(i => i >= 0);
            if (emptyIdx.length > 0) {
              const roll = Math.random();
              const target = emptyIdx[Math.floor(Math.random() * emptyIdx.length)];
              if (roll < 0.75) {
                next[target] = 'protest';
                setLastAction(`${GRID[target].name} 出现聚集人群！`);
              } else {
                next[target] = 'crowd';
                setLastAction(`${GRID[target].name} 出现围观群众...`);
              }
            }
            return next;
          });
          return 1 + Math.random() * 1.5; // 每1-2.5秒刷新一波
        }
        return p - 0.1;
      });
    }, 100);
    return () => clearInterval(loopRef.current!);
  }, [started, timeLeft]);

  useEffect(() => { if (timeLeft === 0) finish(); }, [timeLeft]);

  const finish = () => {
    let tier: CrackdownResult['tier']; let guerrillaReduction: number; let angerChange: number;
    const effective = cleared - collateral * 2;
    if (effective >= 12) { tier = 'critical'; guerrillaReduction = 20; angerChange = 5; }
    else if (effective >= 8) { tier = 'success'; guerrillaReduction = 12; angerChange = 8; }
    else if (effective >= 4) { tier = 'partial'; guerrillaReduction = 5; angerChange = 10; }
    else { tier = 'failure'; guerrillaReduction = -10; angerChange = 12; }
    onComplete({ tier, cleared, collateral, guerrillaReduction, angerChange });
  };

  const clickCell = (idx: number) => {
    if (cells[idx] === 'empty') return;
    if (cells[idx] === 'protest') {
      setCleared(c => c + 1);
      setLastAction(`${GRID[idx].name} 聚集人群被驱散。`);
    } else {
      setCollateral(c => c + 1);
      setLastAction(`${GRID[idx].name} 误伤围观群众！（舆论受损）`);
    }
    setCells(prev => { const next = [...prev]; next[idx] = 'empty'; return next; });
  };

  const clearAll = () => {
    if (spendPP(20)) {
      let gained = 0;
      setCells(prev => {
        const next = [...prev];
        next.forEach((c, i) => { if (c === 'protest') { gained++; next[i] = 'empty'; } });
        return next;
      });
      setCleared(c => c + gained);
      setLastAction('全面清场！所有聚集人群被驱散。');
    } else {
      setShake(true); setTimeout(() => setShake(false), 400);
    }
  };

  const delayReinforce = () => {
    if (spendPP(15)) {
      setSpawnCooldown(p => p + 5);
      setLastAction('增援路线被卡死，抗议组织暂时停摆。');
    } else {
      setShake(true); setTimeout(() => setShake(false), 400);
    }
  };

  const cellStyle = (c: CellState): { border: string; bg: string; label: string } => {
    if (c === 'protest') return { border: 'border-[#ff4444]', bg: 'bg-[#ff4444]/15', label: '⚠ 聚集人群' };
    if (c === 'crowd') return { border: 'border-yellow-500', bg: 'bg-yellow-500/10', label: '围观群众' };
    return { border: 'border-[#333]', bg: 'bg-[#0d1117]', label: '' };
  };

  return (
    <div className={`absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 ${shake ? 'shake' : ''}`}>
      <div className="bg-[#0a0a14] border-2 border-[#ff4444]/50 max-w-2xl w-full p-6 shadow-[0_0_60px_rgba(255,68,68,0.2)] relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,68,68,0.12) 2px,rgba(255,68,68,0.12) 4px)' }} />

        {!started && (
          <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-8 text-center">
            <Siren className="w-16 h-16 text-[#ff4444] mb-4" />
            <h2 className="text-3xl font-black text-[#ff4444] mb-3 tracking-[0.3em]">午 夜 清 场</h2>
            <p className="text-white/70 mb-2 text-sm max-w-md">戒严行动 · 30秒内驱散校园各区域的聚集人群</p>
            {fieldSupport > 0 && <p className="text-emerald-300 text-xs mb-2">巡逻工作组筹备 {fieldSupport} 份 · 已锁定目标 +{fieldSupport * 2}</p>}
            <div className="text-white/50 text-xs mb-6 max-w-md space-y-1">
              <p>· 点击<span className="text-[#ff4444]">红色警戒区</span>→驱散人群（+清场数）</p>
              <p>· 小心<span className="text-yellow-400">黄色围观群众</span>！误伤会翻倍扣减战绩并损害舆论</p>
              <p>· 全面清场(20PP)→立即驱散全部聚集人群</p>
              <p>· 卡死增援路线(15PP)→暂停抗议组织刷新5秒</p>
              <p className="text-[#ff4444] mt-2">清场战绩 - 误伤×2 = 最终评定！</p>
            </div>
            <button onClick={() => setStarted(true)} className="bg-[#ff4444]/20 border-2 border-[#ff4444] text-[#ff4444] font-black py-3 px-10 text-lg hover:bg-[#ff4444] hover:text-black transition-all tracking-widest">开 始 清 场</button>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-[#ff4444]/30 pb-3">
          <div className="flex items-center gap-3">
            <Siren className="w-7 h-7 text-[#ff4444]" />
            <div>
              <h2 className="text-xl font-black text-[#ff4444] tracking-[0.2em]">午夜清场</h2>
              <div className="text-[10px] text-white/40">清场 {cleared} | 误伤 {collateral} | {lastAction || '等待集结...'}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-black ${timeLeft <= 8 ? 'text-red-400 animate-pulse' : 'text-[#ff4444]'}`}>{timeLeft}s</div>
            <div className="text-[10px] text-white/40">PP: {Math.floor(state.stats.pp)}</div>
          </div>
        </div>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {GRID.map((g, i) => {
            const s = cellStyle(cells[i]);
            return (
              <button
                key={g.id}
                onClick={() => clickCell(i)}
                className={`w-full p-3 border-2 rounded text-left transition-all hover:scale-[1.02] ${s.border} ${s.bg} ${cells[i] === 'empty' ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">{g.name}</span>
                </div>
                <div className={`text-[11px] mt-1 font-black ${cells[i] === 'protest' ? 'text-[#ff4444] crt-flicker' : cells[i] === 'crowd' ? 'text-yellow-400' : 'text-white/25'}`}>
                  {s.label || '平静'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-2 pt-4 border-t border-[#ff4444]/20 flex gap-3">
          <button onClick={clearAll} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-[#ff4444]/50 text-[#ff4444] hover:bg-[#ff4444]/10 transition-all">
            <Siren className="w-3.5 h-3.5" />全面清场 (20PP)
          </button>
          <button onClick={delayReinforce} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 transition-all">
            <Shield className="w-3.5 h-3.5" />卡死增援 (15PP)
          </button>
          <div className="flex-1" />
          <button onClick={finish} className="px-6 py-2 text-xs font-black border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all tracking-wider">收 队</button>
        </div>

        {/* Spawn Timer */}
        <div className="mt-3 flex items-center gap-2 text-[10px] text-white/30">
          <Clock className="w-3 h-3" />
          <div className="flex-1 h-1.5 bg-[#0d1117] rounded overflow-hidden">
            <div className="h-full bg-[#ff4444]/40 rounded transition-all" style={{ width: `${Math.max(0, Math.min(100, (1 - spawnCooldown / 2.5) * 100))}%` }} />
          </div>
          <span>抗议组织集结中</span>
          <Eye className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}
