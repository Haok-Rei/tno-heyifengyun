import React from 'react';
import { CAMPUS_FLAGS, getCampusFlagKey } from '../config/campusFlags';
import { Scale, Activity, Users, FileText, Pause, Play } from 'lucide-react';
import { GameState } from '../types';
import { calculateModifierBreakdown, ModifierEntry, BreakdownKey } from '../engine/gameLoop';

interface TopBarProps {
  state: GameState;
  togglePause: () => void;
  setGameSpeed: (speed: number) => void;
  onQuickSave: () => void;
  onQuickLoad: () => void;
  hasQuickSave: boolean;
}

const fmt = (v: number): string => {
  const r = Math.round(v * 100) / 100;
  return (r > 0 ? '+' : '') + r;
};

/** 单项资源的详细 tooltip：当前值 + 每日变化全部加成系数 */
function StatTooltip({ title, desc, current, unit, breakdown }: {
  title: string;
  desc: string;
  current: string;
  unit: string;
  breakdown: ModifierEntry[];
}) {
  const total = Math.round(breakdown.reduce((s, e) => s + e.value, 0) * 100) / 100;
  return (
    <div className="absolute top-full left-0 mt-1.5 bg-[#0a0a14] border border-[#8b0000]/30 p-3 hidden group-hover:block z-50 w-72 text-xs shadow-[0_0_20px_rgba(0,0,0,0.85)]">
      <div className="flex justify-between items-baseline mb-1 border-b border-[#8b0000]/20 pb-1.5">
        <span className="text-[#e2e8f0] font-bold tracking-wider">{title}</span>
        <span className="text-[#e2e8f0] font-black">{current}{unit}</span>
      </div>
      <div className="text-[10px] text-gray-500 mb-2">{desc}</div>
      <div className="flex justify-between py-0.5 border-b border-[#8b0000]/20">
        <span className="text-gray-400">每日变化合计</span>
        <span className={total >= 0 ? 'text-[#39FF14] font-bold' : 'text-red-400 font-bold'}>{fmt(total)}{unit === '%' ? '%/日' : '/日'}</span>
      </div>
      <div className="mt-1.5 space-y-0.5 max-h-48 overflow-y-auto pr-1">
        {breakdown.map((e, i) => (
          <div key={i} className="flex justify-between gap-2 leading-tight">
            <span className="text-gray-400 truncate">{e.source}</span>
            <span className={e.value >= 0 ? 'text-[#39FF14]/90 shrink-0' : 'text-red-400/90 shrink-0'}>{fmt(e.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TopBar({ state, togglePause, setGameSpeed, onQuickSave, onQuickLoad, hasQuickSave }: TopBarProps) {
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`;
  };

  const flag = CAMPUS_FLAGS[getCampusFlagKey(state)];
  const breakdown = React.useMemo(() => calculateModifierBreakdown(state), [state]);
  const byKey = (key: BreakdownKey) => breakdown.filter(e => e.key === key);

  return (
    <div className="resource-topbar flex items-center justify-between px-5 shrink-0 relative z-50">
      <div className="flex items-center gap-5">
        <div className="campus-flag" role="img" aria-label={flag.label} title={flag.label}>
          <img src={flag.src} alt="" draggable={false} />
        </div>
        {/* PP */}
        <div className="flex items-center gap-1.5 group relative cursor-help">
          <Scale className="w-3.5 h-3.5 text-[#ff4444]" />
          <span className="resource-label">政治</span>
          <span className={`text-sm font-black tracking-wider ${state.stats.pp < 0 ? 'text-red-400 animate-pulse' : 'text-[#e2e8f0]'}`}>
            {Math.floor(state.stats.pp)}
          </span>
          <StatTooltip
            title="政治点数 (PP)"
            desc="执行决议与地图行动的战略资源。稳定度高于50时产出增加，低于50时衰减。"
            current={state.stats.pp.toFixed(1)}
            unit=""
            breakdown={byKey('pp')}
          />
        </div>
        {/* STAB */}
        <div className="flex items-center gap-1.5 group relative cursor-help">
          <Activity className="w-3.5 h-3.5 text-[#e2e8f0]" />
          <span className="resource-label">稳定</span>
          <span className={`text-sm font-black tracking-wider ${state.stats.stab < 30 ? 'text-red-400 animate-pulse' : 'text-[#e2e8f0]'}`}>
            {Math.floor(state.stats.stab)}%
          </span>
          <StatTooltip
            title="稳定度"
            desc="系统容错上限。低于30%将触发吴福军最后通牒等连锁危机；TPR枯竭时每日额外 -5%。"
            current={state.stats.stab.toFixed(1)}
            unit="%"
            breakdown={byKey('stab')}
          />
        </div>

        {/* SS */}
        <div className="flex items-center gap-2 group relative cursor-help">
          <Users className="w-4 h-4 text-tno-text" />
          <span className="resource-label">支持</span>
          <span className="font-bold text-tno-text">
            {Math.floor(state.stats.ss)}%
          </span>
          <StatTooltip
            title="学生支持度 (SS)"
            desc="学生群体对当前路线的支持程度，影响事件处理后的反噬强度与稳定度联动。"
            current={state.stats.ss.toFixed(1)}
            unit="%"
            breakdown={byKey('ss')}
          />
        </div>

        {/* TPR */}
        <div className="flex items-center gap-2 group relative cursor-help">
          <FileText className="w-4 h-4 text-tno-text" />
          <span className="resource-label">卷子</span>
          <span className={`font-bold ${state.stats.tpr <= 0 ? 'text-tno-red crt-flicker' : 'text-tno-text'}`}>
            {Math.floor(state.stats.tpr)}
          </span>
          <StatTooltip
            title="卷子储备量 (TPR)"
            desc="试卷每天随考试强度消耗，大量库存也会损耗。归零后每日稳定度 -5%。"
            current={state.stats.tpr.toFixed(1)}
            unit=""
            breakdown={byKey('tpr')}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="resource-date text-tno-highlight font-bold tracking-widest">
          {formatDate(state.date)}
        </div>
        <div className="flex items-center gap-1 border border-tno-border p-1 bg-zinc-900/50">
          <button
            onClick={onQuickSave}
            className="px-2 py-0.5 text-xs font-bold text-cyan-200 hover:text-white hover:bg-cyan-500/20 transition-colors"
            title="即时存档 (F5)"
          >
            即存
          </button>
          <button
            onClick={onQuickLoad}
            disabled={!hasQuickSave}
            className={`px-2 py-0.5 text-xs font-bold transition-colors ${hasQuickSave ? 'text-emerald-200 hover:text-white hover:bg-emerald-500/20' : 'text-zinc-500 cursor-not-allowed'}`}
            title="读取即时存档 (F9)"
          >
            读档
          </button>
        </div>
        <div className="flex items-center gap-1 border border-tno-border p-1 bg-zinc-900/50">
          <button
            onClick={() => setGameSpeed(1)}
            className={`px-2 py-0.5 text-xs font-bold transition-colors ${state.gameSpeed === 1 ? 'bg-tno-highlight text-black' : 'text-tno-text hover:text-tno-highlight'}`}
          >
            &gt;
          </button>
          <button
            onClick={() => setGameSpeed(2)}
            className={`px-2 py-0.5 text-xs font-bold transition-colors ${state.gameSpeed === 2 ? 'bg-tno-highlight text-black' : 'text-tno-text hover:text-tno-highlight'}`}
          >
            &gt;&gt;
          </button>
          <button
            onClick={() => setGameSpeed(3)}
            className={`px-2 py-0.5 text-xs font-bold transition-colors ${state.gameSpeed === 3 ? 'bg-tno-highlight text-black' : 'text-tno-text hover:text-tno-highlight'}`}
          >
            &gt;&gt;&gt;
          </button>
        </div>
        <button
          onClick={togglePause}
          aria-label={state.isPaused ? '继续时间' : '暂停时间'}
          title="空格：暂停 / 继续"
          className="p-1 border border-tno-border hover:border-tno-highlight hover:text-tno-highlight transition-colors"
        >
          <span className="flex items-center gap-1 text-xs">{state.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}{state.isPaused ? '继续' : '暂停'}</span>
        </button>
      </div>
    </div>
  );
}
