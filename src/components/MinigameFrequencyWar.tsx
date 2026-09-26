import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types';
import { Radio, Shield, Zap, AlertTriangle, Signal, Wifi, WifiOff } from 'lucide-react';
import { getCommandState } from '../engine/commandSystem';

interface MinigameFrequencyWarProps {
  state: GameState;
  onComplete: (result: FrequencyWarResult) => void;
  spendPP: (amount: number) => boolean;
}

export interface FrequencyWarResult {
  tier: 'critical' | 'success' | 'partial' | 'failure';
  avgFreq: number;
  adminCtrlBonus: number;
  eventId: string;
}

export default function MinigameFrequencyWar({ state, onComplete, spendPP }: MinigameFrequencyWarProps) {
  const fieldSupport = Math.min(3, getCommandState(state).preparation?.revolution || 0);
  const [timeLeft, setTimeLeft] = useState(35);
  const [started, setStarted] = useState(false);
  const [freqs, setFreqs] = useState(() => [40, 40, 40].map(value => value + fieldSupport * 5));
  const [interference, setInterference] = useState([0, 0, 0]);
  const [fwActive, setFwActive] = useState(false);
  const [fwUses, setFwUses] = useState(3);
  const [shake, setShake] = useState(false);
  const [jammed, setJammed] = useState(false);
  const loopRef = useRef<NodeJS.Timeout | null>(null);
  const jamTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    loopRef.current = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { clearInterval(loopRef.current!); return 0; }
        return p - 1;
      });
      // 干扰随机生成（难度随剩余时间增加）
      const diffMult = 1 + (35 - timeLeft) / 35;
      setInterference(prev => prev.map(v => {
        if (Math.random() < 0.35 * diffMult) return Math.min(100, v + Math.random() * 25 * diffMult);
        return Math.max(0, v - 4);
      }));
      // 干扰压降频率
      setFreqs(prev => prev.map((v, i) => Math.max(0, v - interference[i] * 0.12)));
    }, 1000);
    return () => clearInterval(loopRef.current!);
  }, [started, timeLeft]);

  // 保安队断电干扰（后期触发）
  useEffect(() => {
    if (started && timeLeft <= 15 && timeLeft > 0 && !jammed) {
      const jamTime = 5 + Math.floor(Math.random() * 8);
      jamTimerRef.current = setTimeout(() => {
        setJammed(true);
        setInterference(prev => prev.map(v => Math.min(100, v + 40)));
      }, jamTime * 1000);
    }
    return () => clearTimeout(jamTimerRef.current!);
  }, [started, timeLeft, jammed]);

  useEffect(() => { if (timeLeft === 0) checkResult(); }, [timeLeft]);

  const checkResult = () => {
    const avg = freqs.reduce((a, b) => a + b, 0) / 3;
    let tier: FrequencyWarResult['tier']; let ctrlB: number; let evt: string;
    if (avg >= 85) { tier = 'critical'; ctrlB = 20; evt = 'freq_critical'; }
    else if (avg >= 65) { tier = 'success'; ctrlB = 12; evt = 'freq_success'; }
    else if (avg >= 40) { tier = 'partial'; ctrlB = 4; evt = 'freq_partial'; }
    else { tier = 'failure'; ctrlB = -8; evt = 'freq_failure'; }
    onComplete({ tier, avgFreq: avg, adminCtrlBonus: ctrlB, eventId: evt });
  };

  const adjFreq = (i: number, delta: number) => {
    setFreqs(prev => { const n = [...prev]; n[i] = Math.max(0, Math.min(100, n[i] + delta)); return n; });
  };

  const doFirewall = () => {
    if (fwUses <= 0) { setShake(true); setTimeout(() => setShake(false), 400); return; }
    if (spendPP(15)) { setFwActive(true); setFwUses(p => p - 1); setInterference([0, 0, 0]); setTimeout(() => setFwActive(false), 2500); }
    else { setShake(true); setTimeout(() => setShake(false), 400); }
  };

  const doBoost = () => {
    if (spendPP(25)) { setFreqs(prev => prev.map(v => Math.min(100, v + 20))); setInterference(prev => prev.map(v => Math.min(100, v + 15))); }
    else { setShake(true); setTimeout(() => setShake(false), 400); }
  };

  return (
    <div className={`absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 ${shake ? 'shake' : ''}`}>
      <div className="bg-[#0a0a14] border-2 border-[#ff4444]/50 max-w-3xl w-full p-6 shadow-[0_0_60px_rgba(255,0,0,0.2)] relative overflow-hidden flex flex-col">
        {/* 扫描线 */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,68,68,0.1) 2px,rgba(255,68,68,0.1) 4px)'}}/>

        {!started && (
          <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-8 text-center">
            <Radio className="w-16 h-16 text-[#ff4444] mb-4 crt-flicker" />
            <h2 className="text-3xl font-black text-[#ff4444] mb-3 tracking-[0.3em]">夺 取 校 园 之 声</h2>
            <p className="text-white/70 mb-2 text-sm max-w-md">行政楼顶层广播站 · 35秒内劫持三个FM频段</p>
            {fieldSupport > 0 && <p className="text-emerald-300 text-xs mb-2">地下联络工作组筹备 {fieldSupport} 份 · 各频段初始值 +{fieldSupport * 5}</p>}
            <div className="text-white/50 text-xs mb-6 max-w-md space-y-1">
              <p>· 拖动滑块将频率维持在70-90绿色接管区</p>
              <p>· 吴福军保安队会发送干扰信号压低频率</p>
              <p>· 防火墙(15PP/3次)清除干扰 · 信号增强(25PP)全频段+20</p>
              <p className="text-[#ff4444] mt-2">⚠ 保安队将在后半程尝试切断电源</p>
            </div>
            <button onClick={() => setStarted(true)} className="bg-[#ff4444]/20 border-2 border-[#ff4444] text-[#ff4444] font-black py-3 px-10 text-lg hover:bg-[#ff4444] hover:text-black transition-all tracking-widest">开 始 行 动</button>
          </div>
        )}

        <div className="flex justify-between items-center mb-5 border-b border-[#ff4444]/30 pb-3">
          <div className="flex items-center gap-3">
            <Radio className="w-7 h-7 text-[#ff4444] crt-flicker" />
            <div><h2 className="text-xl font-black text-[#ff4444] tracking-[0.2em]">电波战：夺取校园之声</h2>
              <div className="text-[10px] text-white/40">行政楼广播站 · FM 88.0 / 93.0 / 98.0</div></div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-black ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-[#ff4444]'}`}>{timeLeft}s</div>
            <div className="text-[10px] text-white/40">PP: {Math.floor(state.stats.pp)} | 防火墙: {fwUses}次</div>
          </div>
        </div>

        {jammed && (
          <div className="mb-4 p-2 bg-red-900/30 border border-red-500/50 text-red-300 text-xs animate-pulse flex items-center gap-2">
            <WifiOff className="w-4 h-4" /> 保安队正在尝试切断电源！干扰信号大幅增强！
          </div>
        )}

        {fwActive && (
          <div className="mb-4 p-2 bg-green-900/20 border border-green-500/50 text-green-300 text-xs flex items-center gap-2">
            <Shield className="w-4 h-4" /> 防火墙激活 — 所有干扰已清除！
          </div>
        )}

        <div className="space-y-6 flex-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="relative">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-white/50">FM {88+i*5}.0 MHz</span>
                <span className={`font-bold ${freqs[i] >= 70 ? 'text-[#39FF14]' : freqs[i] >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>{Math.round(freqs[i])}%</span>
              </div>
              <div className="h-10 bg-[#0d1117] border border-[#1a2a3a] relative rounded-sm overflow-hidden">
                <div className="absolute top-0 bottom-0 left-[70%] right-[10%] bg-[#39FF14]/15 border-x border-[#39FF14]/40" />
                <div className="absolute top-0 bottom-0 left-0 right-[80%] bg-red-500/15 border-r border-red-500/40" />
                <input type="range" min="0" max="100" value={freqs[i]} onChange={e => adjFreq(i, Number(e.target.value) - freqs[i])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="absolute top-0 bottom-0 w-3 bg-[#ff4444] border border-white/30 pointer-events-none transition-all duration-75 shadow-[0_0_8px_rgba(255,0,0,0.5)]"
                  style={{ left: `calc(${freqs[i]}% - 6px)` }} />
              </div>
              {interference[i] > 0 && (
                <div className="absolute -right-16 top-1/2 -translate-y-1/2 text-red-400 flex items-center gap-1 text-[10px]">
                  <AlertTriangle className="w-3 h-3" />{Math.round(interference[i])}%
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-[#ff4444]/20 flex gap-3">
          <button onClick={doFirewall} disabled={fwUses <= 0}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border transition-all ${fwUses > 0 ? 'border-[#39FF14]/50 text-[#39FF14] hover:bg-[#39FF14]/10' : 'border-gray-700 text-gray-500 cursor-not-allowed'}`}>
            <Shield className="w-3.5 h-3.5" />防火墙 ({fwUses})
          </button>
          <button onClick={doBoost}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 transition-all">
            <Zap className="w-3.5 h-3.5" />信号增强 (25PP)
          </button>
          <div className="flex-1" />
          <button onClick={checkResult}
            className="px-6 py-2 text-xs font-black border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all tracking-wider">
            提前结束
          </button>
        </div>
      </div>
    </div>
  );
}
