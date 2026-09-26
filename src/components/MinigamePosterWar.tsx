import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types';
import { Megaphone, Shield, Clock, Target } from 'lucide-react';
import { getCommandState } from '../engine/commandSystem';

interface Props { state: GameState; onComplete: (r: PosterResult) => void; spendPP: (n: number) => boolean; }
export interface PosterResult { tier: 'critical'|'success'|'partial'|'failure'; avgCoverage: number; adminCtrl: number; ssBonus: number; }

const AREAS = [
  { id: 'b3', name: 'B3教学楼', icon: '🏫' },
  { id: 'admin', name: '行政楼', icon: '🏛️' },
  { id: 'b1b2', name: 'B1/B2生活区', icon: '🏘️' },
  { id: 'auditorium', name: '艺术礼堂', icon: '🎭' },
  { id: 'lab', name: '实验楼', icon: '🔬' },
  { id: 'playground', name: '操场', icon: '🏟️' },
];

export default function MinigamePosterWar({ state, onComplete, spendPP }: Props) {
  const fieldSupport = Math.min(3, getCommandState(state).preparation?.revolution || 0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [started, setStarted] = useState(false);
  const [coverage, setCoverage] = useState<Record<string, number>>(() => ({ b3: 20, admin: 15, b1b2: 30, auditorium: 25, lab: 20, playground: 35 + fieldSupport * 5 }));
  const [securityTimer, setSecurityTimer] = useState(0); // counts up, triggers patrol at thresholds
  const [shake, setShake] = useState(false);
  const [lastPatrol, setLastPatrol] = useState('');
  const loopRef = useRef<NodeJS.Timeout|null>(null);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    loopRef.current = setInterval(() => {
      setTimeLeft(p => { if (p <= 1) { clearInterval(loopRef.current!); return 0; } return p - 1; });
      setSecurityTimer(p => {
        const next = p + 1;
        // 每2-3秒保安巡逻一次
        if (next >= 3 + Math.random() * 2) {
          const areaIds = Object.keys(coverage);
          const target = areaIds[Math.floor(Math.random() * areaIds.length)];
          setCoverage(cov => ({
            ...cov,
            [target]: Math.max(0, (cov[target] || 0) - (10 + Math.floor(Math.random() * 15))),
          }));
          setLastPatrol(AREAS.find(a => a.id === target)?.name || target);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(loopRef.current!);
  }, [started, timeLeft]);

  useEffect(() => { if (timeLeft === 0) finish(); }, [timeLeft]);

  const avgCov = () => {
    const vals: number[] = Object.values(coverage);
    return Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length);
  };

  const finish = () => {
    const avg = avgCov();
    let tier: PosterResult['tier']; let adminCtrl: number; let ssBonus: number;
    if (avg >= 85) { tier = 'critical'; adminCtrl = 20; ssBonus = 15; }
    else if (avg >= 65) { tier = 'success'; adminCtrl = 12; ssBonus = 8; }
    else if (avg >= 40) { tier = 'partial'; adminCtrl = 5; ssBonus = 3; }
    else { tier = 'failure'; adminCtrl = -10; ssBonus = -5; }
    onComplete({ tier, avgCoverage: avg, adminCtrl, ssBonus });
  };

  const pastePoster = (areaId: string) => {
    setCoverage(cov => ({ ...cov, [areaId]: Math.min(100, (cov[areaId] || 0) + 15) }));
    // 有概率触发保安注意
    if (Math.random() < 0.2) {
      setSecurityTimer(p => Math.max(0, p - 1)); // 加速巡逻
    }
  };

  const boostArea = (areaId: string) => {
    if (spendPP(8)) {
      setCoverage(cov => ({ ...cov, [areaId]: Math.min(100, (cov[areaId] || 0) + 30) }));
    } else {
      setShake(true); setTimeout(() => setShake(false), 400);
    }
  };

  const distractGuard = () => {
    if (spendPP(15)) {
      setSecurityTimer(-5); // 推迟下一次巡逻
      setLastPatrol('(被引开)');
    } else {
      setShake(true); setTimeout(() => setShake(false), 400);
    }
  };

  const covColor = (v: number) => v >= 70 ? '#39FF14' : v >= 45 ? '#fbbf24' : v >= 25 ? '#f97316' : '#ef4444';

  return (
    <div className={`absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 ${shake ? 'shake' : ''}`}>
      <div className="bg-[#0a0a14] border-2 border-[#f97316]/40 max-w-2xl w-full p-6 shadow-[0_0_60px_rgba(249,115,22,0.15)] relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(249,115,22,0.1) 2px,rgba(249,115,22,0.1) 4px)' }} />

        {!started && (
          <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-8 text-center">
            <Megaphone className="w-16 h-16 text-[#f97316] mb-4" />
            <h2 className="text-3xl font-black text-[#f97316] mb-3 tracking-[0.3em]">校 园 海 报 战</h2>
            {fieldSupport > 0 && <p className="text-emerald-300 text-xs mb-2">地下联络工作组筹备 {fieldSupport} 份 · 操场初始覆盖 +{fieldSupport * 5}</p>}
            <p className="text-white/70 mb-2 text-sm max-w-md">全校范围 · 30秒内在六大建筑区域张贴革命海报</p>
            <div className="text-white/50 text-xs mb-6 max-w-md space-y-1">
              <p>· 点击区域→免费张贴(+15%) · 集中张贴(8PP)→+30%</p>
              <p>· 保安每2-3秒巡逻一次，随机清理某区域10-25%海报</p>
              <p>· 引开保安(15PP)→推迟下一次巡逻</p>
              <p className="text-[#f97316] mt-2">全区域平均覆盖率决定最终奖励！</p>
            </div>
            <button onClick={() => setStarted(true)} className="bg-[#f97316]/20 border-2 border-[#f97316] text-[#f97316] font-black py-3 px-10 text-lg hover:bg-[#f97316] hover:text-black transition-all tracking-widest">开 始 张 贴</button>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-[#f97316]/30 pb-3">
          <div className="flex items-center gap-3">
            <Megaphone className="w-7 h-7 text-[#f97316]" />
            <div>
              <h2 className="text-xl font-black text-[#f97316] tracking-[0.2em]">校园海报战</h2>
              <div className="text-[10px] text-white/40">平均覆盖率 {avgCov()}% | 上次巡逻: {lastPatrol || '无'}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-black ${timeLeft <= 8 ? 'text-red-400 animate-pulse' : 'text-[#f97316]'}`}>{timeLeft}s</div>
            <div className="text-[10px] text-white/40">PP: {Math.floor(state.stats.pp)}</div>
          </div>
        </div>

        {/* 6 Area Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {AREAS.map(a => {
            const cv = coverage[a.id] || 0;
            return (
              <div key={a.id} className="relative">
                <button
                  onClick={() => pastePoster(a.id)}
                  className="w-full p-3 border rounded text-left transition-all hover:scale-[1.02]"
                  style={{ borderColor: covColor(cv) + '60', backgroundColor: covColor(cv) + '10' }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">{a.icon} {a.name}</span>
                    <span className="text-xs font-black" style={{ color: covColor(cv) }}>{Math.round(cv)}%</span>
                  </div>
                  <div className="h-2 bg-[#0d1117] rounded overflow-hidden">
                    <div className="h-full transition-all duration-300 rounded" style={{ width: `${cv}%`, backgroundColor: covColor(cv) }} />
                  </div>
                  <div className="flex justify-end mt-1">
                    <button onClick={(e) => { e.stopPropagation(); boostArea(a.id); }}
                      className="text-[10px] px-2 py-0.5 border border-[#f97316]/40 text-[#f97316]/70 hover:bg-[#f97316]/10 rounded">
                      +30% (8PP)
                    </button>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="mt-2 pt-4 border-t border-[#f97316]/20 flex gap-3">
          <button onClick={distractGuard} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 transition-all">
            <Shield className="w-3.5 h-3.5" />引开保安 (15PP)
          </button>
          <div className="flex-1" />
          <button onClick={finish} className="px-6 py-2 text-xs font-black border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all tracking-wider">收工</button>
        </div>

        {/* Security Timer Indicator */}
        <div className="mt-3 flex items-center gap-2 text-[10px] text-white/30">
          <Clock className="w-3 h-3" />
          <div className="flex-1 h-1.5 bg-[#0d1117] rounded overflow-hidden">
            <div className="h-full bg-red-500/40 rounded transition-all" style={{ width: `${(securityTimer / 5) * 100}%` }} />
          </div>
          <span>下次巡逻</span>
        </div>
      </div>
    </div>
  );
}
