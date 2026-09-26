import React, { useMemo, useState } from 'react';
import { GameState } from '../types';
import { Scale, Shield, Banknote, Gauge, Handshake } from 'lucide-react';
import { getCommandState } from '../engine/commandSystem';

interface NegotiationResult {
  success: boolean;
  concessionLevel: number;
  autonomy: number;
  immunity: number;
  budget: number;
}

interface MinigameNegotiationProps {
  state: GameState;
  onComplete: (result: NegotiationResult) => void;
  spendPP: (amount: number) => boolean;
}

export default function MinigameNegotiation({ state, onComplete, spendPP }: MinigameNegotiationProps) {
  const fieldSupport = Math.min(3, getCommandState(state).preparation?.commune || 0);
  const [progress, setProgress] = useState(() => fieldSupport * 8);
  const [turn, setTurn] = useState(1);
  const [autonomy, setAutonomy] = useState(35);
  const [immunity, setImmunity] = useState(30);
  const [budget, setBudget] = useState(25);
  const [pressure, setPressure] = useState(50);
  const [hasActionToday, setHasActionToday] = useState(false);
  const canAffordAnyAction = state.stats.pp >= 10;

  const concessionLevel = useMemo(() => Math.round((autonomy + immunity + budget) / 3), [autonomy, immunity, budget]);

  const applyRound = (style: 'hard' | 'balanced' | 'soft') => {
    if (hasActionToday) return;

    const ppCost = style === 'hard' ? 35 : style === 'balanced' ? 20 : 10;
    if (!spendPP(ppCost)) return;

    let delta = 0;
    if (style === 'hard') {
      delta = 18 + Math.max(0, (pressure - concessionLevel) / 10);
      setPressure(p => Math.max(0, p - 8));
    } else if (style === 'balanced') {
      delta = 14 + Math.max(0, (60 - Math.abs(pressure - concessionLevel)) / 20);
      setPressure(p => Math.max(0, p - 4));
    } else {
      delta = 10 + concessionLevel / 12;
      setPressure(p => Math.min(100, p + 4));
    }

    const nextProgress = Math.min(100, progress + delta);
    setProgress(nextProgress);
    setHasActionToday(true);

    if (nextProgress >= 100) {
      onComplete({
        success: true,
        concessionLevel,
        autonomy,
        immunity,
        budget,
      });
    }
  };

  const nextDay = () => {
    // Always allow day progression to avoid negotiation softlock.
    if (!hasActionToday && !canAffordAnyAction) {
      setPressure(p => Math.min(100, p + 8));
    } else if (!hasActionToday && canAffordAnyAction) {
      setPressure(p => Math.min(100, p + 5));
    }

    if (turn >= 8 && progress < 100) {
      onComplete({
        success: false,
        concessionLevel,
        autonomy,
        immunity,
        budget,
      });
      return;
    }

    setTurn(t => t + 1);
    setHasActionToday(false);
    if (hasActionToday) {
      setPressure(p => Math.min(100, p + 3));
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[82vh] border-2 border-[#b71c1c] bg-[#120707] text-[#f2d9d9] p-6 flex flex-col gap-4 shadow-[0_0_30px_rgba(183,28,28,0.35)]">
        <div className="flex items-center justify-between border-b border-[#7b1c1c] pb-3">
          <div className="flex items-center gap-3">
            <Handshake className="w-7 h-7 text-[#ff6e6e]" />
            <div>
              <h2 className="text-2xl font-bold tracking-widest text-[#ff8a8a]">极权派退党谈判</h2>
              <div className="text-xs text-[#c9a3a3]">自社派 与 极权派 特别条款博弈</div>
              {fieldSupport > 0 && <div className="text-xs text-emerald-300">基层工作队筹备 {fieldSupport} 份 · 谈判进度 +{fieldSupport * 8}%</div>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[#c9a3a3]">第 {turn}/8 日</div>
            <div className="text-xs text-[#a77]">今日{hasActionToday ? '已行动' : '未行动'}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard title="总谈判进度" value={`${Math.round(progress)}%`} icon={<Gauge className="w-4 h-4" />} color="#4af0d4" />
          <StatCard title="极权派压力值" value={`${Math.round(pressure)}%`} icon={<Shield className="w-4 h-4" />} color="#ff6e6e" />
          <StatCard title="妥协强度" value={`${concessionLevel}%`} icon={<Scale className="w-4 h-4" />} color="#f0d44a" />
        </div>

        <div className="h-4 border border-[#7b1c1c] bg-black/50 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#8b0000] to-[#ff5252]" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
          <ClauseSlider
            title="特别行动队自主权"
            value={autonomy}
            onChange={setAutonomy}
            hint="越高越易达成协议，但后续稳定风险更高"
          />
          <ClauseSlider
            title="追责豁免范围"
            value={immunity}
            onChange={setImmunity}
            hint="越高越容易成交，但政治代价更大"
          />
          <ClauseSlider
            title="组织经费切割"
            value={budget}
            onChange={setBudget}
            hint="越高越快推进，但会拖累后续行政能力"
          />
        </div>

        <div className="grid grid-cols-4 gap-3 items-end">
          <button onClick={() => applyRound('hard')} disabled={hasActionToday} className="border border-[#ff5252] bg-[#ff5252]/15 py-2 font-bold hover:bg-[#ff5252]/30 disabled:opacity-50">强硬施压 (-35PP)</button>
          <button onClick={() => applyRound('balanced')} disabled={hasActionToday} className="border border-[#f0d44a] bg-[#f0d44a]/15 py-2 font-bold hover:bg-[#f0d44a]/30 disabled:opacity-50">平衡协商 (-20PP)</button>
          <button onClick={() => applyRound('soft')} disabled={hasActionToday} className="border border-[#4af0d4] bg-[#4af0d4]/15 py-2 font-bold hover:bg-[#4af0d4]/30 disabled:opacity-50">让渡换稳 (-10PP)</button>
          <button onClick={nextDay} className="border border-[#b71c1c] bg-[#b71c1c]/20 py-2 font-bold hover:bg-[#b71c1c]/35">推进至下一日</button>
        </div>

        <div className="text-xs text-[#b78f8f] flex items-center gap-2">
          <Banknote className="w-4 h-4" />
          当前政治点数：{Math.floor(state.stats.pp)}。8日内谈判进度达到100%视为达成退党协议。
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="border border-[#7b1c1c] bg-black/40 p-3">
      <div className="text-xs text-[#c9a3a3] flex items-center gap-1">{icon}{title}</div>
      <div className="text-xl font-bold mt-1" style={{ color }}>{value}</div>
    </div>
  );
}

function ClauseSlider({ title, value, onChange, hint }: { title: string; value: number; onChange: (value: number) => void; hint: string }) {
  return (
    <div className="border border-[#7b1c1c] bg-black/35 p-3 flex flex-col gap-2">
      <div className="text-sm font-bold text-[#ffb0b0]">{title}</div>
      <input type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))} className="accent-[#ff6e6e]" />
      <div className="text-xs text-[#f0d44a]">当前：{value}%</div>
      <div className="text-xs text-[#9e7f7f] leading-relaxed">{hint}</div>
    </div>
  );
}
