import React from 'react';
import { ChronicleEntry, ChronicleType } from '../types';

interface ChronicleViewProps {
  entries: ChronicleEntry[];
  /** overlay=游戏内全屏覆盖；embed=结局页内嵌（不包 fixed 壳） */
  variant: 'overlay' | 'embed';
  /** 结局页形态时传入，渲染"终章"收尾块 */
  ending?: { id: string; title: string; routeTag?: string };
  onClose?: () => void;
}

const TYPE_CONFIG: Record<ChronicleType, { label: string; color: string; border: string; flicker?: boolean }> = {
  focus:   { label: '国策', color: 'text-tno-highlight', border: 'border-tno-highlight/60' },
  event:   { label: '事件', color: 'text-blue-400',      border: 'border-blue-400/60' },
  leader:  { label: '领袖', color: 'text-tno-red',       border: 'border-tno-red/60' },
  crisis:  { label: '危机', color: 'text-tno-red',       border: 'border-tno-red/60', flicker: true },
  route:   { label: '转折', color: 'text-purple-400',    border: 'border-purple-400/60' },
  ending:  { label: '终局', color: 'text-tno-green',     border: 'border-tno-green/60' },
};

function formatMonth(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

function formatDay(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function ChronicleView({ entries, variant, ending, onClose }: ChronicleViewProps) {
  const sorted = [...entries].sort((a, b) => a.date - b.date);
  const counts = sorted.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const spanDays = sorted.length >= 2
    ? Math.max(1, Math.round((sorted[sorted.length - 1].date - sorted[0].date) / 86400000))
    : 0;

  // 按月份分组
  const groups: Array<{ month: string; items: ChronicleEntry[] }> = [];
  for (const e of sorted) {
    const m = formatMonth(e.date);
    const last = groups[groups.length - 1];
    if (last && last.month === m) last.items.push(e);
    else groups.push({ month: m, items: [e] });
  }

  const body = (
    <div className={`flex flex-col w-full ${variant === 'embed' ? 'h-full' : 'max-h-[75vh]'}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-tno-border/60 pb-3 mb-3">
        <div>
          <h2 className="text-xl font-bold tracking-[0.2em] text-tno-highlight font-serif">合一风云 · 编年史</h2>
          <p className="text-xs text-tno-text/50 mt-1 tracking-widest">
            {spanDays > 0 ? `历时 ${spanDays} 天` : '历史的扉页'}
            {' · '}国策 {counts.focus ?? 0} · 事件 {counts.event ?? 0} · 领袖更迭 {counts.leader ?? 0}
            {' · '}危机 {counts.crisis ?? 0} · 转折 {counts.route ?? 0}
          </p>
        </div>
        {variant === 'overlay' && onClose && (
          <button
            onClick={onClose}
            className="text-tno-red text-2xl font-bold px-2 hover:bg-tno-red/20 cursor-pointer"
            title="关闭"
          >
            ✕
          </button>
        )}
      </div>

      {/* 正文 */}
      {groups.length === 0 ? (
        <p className="text-sm text-tno-text/50 font-serif py-8 text-center">尚未记录任何历史节点。</p>
      ) : (
        <div className="overflow-y-auto pr-2 flex-1">
          {groups.map(g => (
            <div key={g.month} className="mb-4">
              <div className="text-sm font-bold tracking-[0.3em] text-tno-highlight border-b border-tno-border/50 pb-1 mb-2 font-serif">
                {g.month}
              </div>
              <div className="border-l-2 border-tno-border/70 pl-4 ml-1 space-y-3">
                {g.items.map((e, i) => {
                  const cfg = TYPE_CONFIG[e.type];
                  return (
                    <div key={i} className={`relative ${e.importance === 3 ? 'bg-white/[0.04] -ml-4 pl-4 py-2' : ''}`}>
                      <span className={`absolute -left-[21px] top-1 w-3 h-3 ${cfg.border} border-2 bg-black ${e.type === 'leader' || e.type === 'crisis' ? 'rotate-45' : ''}`} />
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black border px-1.5 py-0.5 tracking-widest ${cfg.color} ${cfg.border} ${cfg.flicker ? 'crt-flicker' : ''}`}>
                          {cfg.label}
                        </span>
                        <span className="text-xs text-tno-text/50 font-mono">{formatDay(e.date)}</span>
                        {e.routeTag && <span className="text-[10px] text-tno-text/40 font-mono">〔{e.routeTag}〕</span>}
                      </div>
                      <div className={`font-serif ${e.importance === 3 ? 'text-[15px] text-tno-text font-bold' : 'text-sm text-tno-text/90'}`}>
                        {e.title}
                      </div>
                      {e.description && (
                        <div className="text-xs text-tno-text/70 whitespace-pre-wrap leading-relaxed mt-0.5">{e.description}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* 终章 */}
          {ending && (
            <div className="mt-4 border-2 border-tno-green/60 bg-tno-green/5 p-4 text-center">
              <div className="text-[10px] font-black tracking-[0.3em] text-tno-green mb-1">THE END · 终章</div>
              <div className="font-serif text-lg font-bold text-tno-green">{ending.title}</div>
              {ending.routeTag && <div className="text-xs text-tno-text/50 font-mono mt-1">〔{ending.routeTag}〕</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-8">
        <div className="max-w-3xl w-full h-[80vh] border border-cyan-300/45 bg-black/80 p-6 flex flex-col">
          {body}
        </div>
      </div>
    );
  }
  return body;
}
