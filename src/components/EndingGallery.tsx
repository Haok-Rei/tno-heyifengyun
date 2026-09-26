import React, { useMemo, useState } from 'react';
import { ENDINGS, IMPLEMENTED_ENDING_COUNT, EndingDetails } from '../data/endings';
import {
  getEndingUnlockState,
  getUnseenEndings,
  markEndingSeen,
  getLastChronicle,
} from '../engine/endingGallery';
import { getEndingImageUrl } from '../config/assets';
import ChronicleView from './ChronicleView';

interface EndingGalleryProps {
  onBack: () => void;
}

export default function EndingGallery({ onBack }: EndingGalleryProps) {
  const [selected, setSelected] = useState<EndingDetails | null>(null);
  const [showLastChronicle, setShowLastChronicle] = useState(false);
  const unlockState = useMemo(() => getEndingUnlockState(), []);
  const unseen = useMemo(() => new Set(getUnseenEndings()), []);
  const lastChronicle = useMemo(() => getLastChronicle(), []);

  const unlockedCount = ENDINGS.filter(e => e.implemented && unlockState.unlocked[e.id]).length;

  const handleOpen = (e: EndingDetails) => {
    if (!e.implemented || !unlockState.unlocked[e.id]) return;
    markEndingSeen(e.id);
    setSelected(e);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-tno-bg crt">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,255,255,0.06)_0%,transparent_55%),radial-gradient(circle_at_50%_100%,rgba(255,51,51,0.05)_0%,transparent_50%)]" />

      <div className="relative z-20 flex h-full flex-col px-4 py-6 md:px-10">
        {/* 头部 */}
        <div className="flex items-start justify-between border-b border-cyan-300/30 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-[0.2em] text-tno-highlight font-serif">
              结局档案
            </h1>
            <p className="text-xs text-tno-text/50 mt-1 tracking-[0.3em] uppercase">Ending Archive · 历史收藏馆</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-tno-highlight">
              {unlockedCount}<span className="text-sm text-tno-text/50 font-bold"> / {IMPLEMENTED_ENDING_COUNT}</span>
            </div>
            <div className="text-[10px] text-tno-text/50 tracking-widest mt-0.5">已解锁结局</div>
          </div>
        </div>

        {/* 最近一局 */}
        {lastChronicle && (
          <div className="mt-4 border border-cyan-300/45 bg-black/55 backdrop-blur-sm">
            <button
              onClick={() => setShowLastChronicle(v => !v)}
              className="w-full flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-cyan-500/10"
            >
              <div className="text-left">
                <div className="text-sm font-bold tracking-[0.15em] text-cyan-200">
                  最近一局：{lastChronicle.endingTitle}
                  <span className="ml-2 text-[10px] text-tno-text/50 font-mono">〔{lastChronicle.routeTag}〕</span>
                </div>
                <div className="text-xs text-tno-text/50 mt-0.5 font-mono">
                  {new Date(lastChronicle.completedAt).toLocaleString()} · 共 {lastChronicle.entries.length} 个历史节点
                </div>
              </div>
              <span className="text-tno-highlight text-lg">{showLastChronicle ? '▲' : '▼'}</span>
            </button>
            {showLastChronicle && (
              <div className="border-t border-cyan-300/30 p-5 max-h-[45vh] overflow-y-auto">
                <ChronicleView
                  variant="embed"
                  entries={lastChronicle.entries}
                  ending={{ id: lastChronicle.endingId, title: lastChronicle.endingTitle, routeTag: lastChronicle.routeTag }}
                />
              </div>
            )}
          </div>
        )}

        {/* 卡片网格 */}
        <div className="mt-5 flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {ENDINGS.map(e => {
              const isUnlocked = e.implemented && !!unlockState.unlocked[e.id];
              const isNew = isUnlocked && unseen.has(e.id);
              return (
                <div
                  key={e.id}
                  onClick={() => handleOpen(e)}
                  className={`group relative overflow-hidden border bg-black/45 transition-all duration-300 ${
                    isUnlocked
                      ? 'border-cyan-300/60 cursor-pointer hover:-translate-y-1 hover:border-pink-300/80 shadow-[0_0_0_1px_rgba(0,255,255,0.12),0_10px_32px_rgba(0,0,0,0.65)]'
                      : 'border-tno-border/70'
                  } ${isNew ? 'animate-gallery-reveal' : ''}`}
                >
                  {/* 图片区 */}
                  <div className="relative h-36 md:h-44 overflow-hidden">
                    {isUnlocked ? (
                      <img
                        src={getEndingImageUrl(e.imageKey)}
                        alt={e.title}
                        className="w-full h-full object-cover brightness-[0.66] saturate-[1.05] transition-all duration-500 group-hover:scale-[1.05] group-hover:brightness-95"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                        <span className="text-2xl md:text-3xl font-black text-zinc-600 tracking-[0.3em] select-none">???</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(2,6,12,0.96)_0%,rgba(2,6,12,0.35)_45%,rgba(2,6,12,0.08)_100%)]" />
                    {isNew && (
                      <span className="absolute top-1 right-1 z-10 bg-tno-red text-black text-[10px] font-black px-1.5 py-0.5 tracking-widest crt-flicker">
                        NEW
                      </span>
                    )}
                    {!e.implemented && (
                      <span className="absolute top-1 left-1 z-10 bg-zinc-700 text-zinc-300 text-[10px] px-1.5 py-0.5 tracking-widest">
                        未实装
                      </span>
                    )}
                  </div>
                  {/* 底部条 */}
                  <div className="p-2.5 md:p-3">
                    <div className={`text-sm font-bold tracking-wider truncate ${isUnlocked ? 'text-cyan-100' : 'text-zinc-600'}`}>
                      {isUnlocked ? e.title : '？？？'}
                    </div>
                    <div className="text-[10px] text-tno-text/45 font-mono mt-0.5 tracking-widest">
                      {e.routeTag}
                      {isUnlocked && unlockState.unlocked[e.id] && (
                        <span className="ml-2">{new Date(unlockState.unlocked[e.id]).toLocaleDateString()} 解锁</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 返回 */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={onBack}
            className="border border-cyan-200 bg-black/70 px-8 py-2 text-sm font-bold tracking-[0.12em] text-cyan-100 hover:border-pink-300 hover:bg-pink-500/20 hover:text-white transition-all cursor-pointer"
          >
            返回主菜单
          </button>
        </div>
      </div>

      {/* 详情弹层 */}
      {selected && (
        <div
          className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={() => setSelected(null)}
        >
          <div
            className={`max-w-2xl w-full border-2 ${selected.borderColor} bg-zinc-950 p-6 relative max-h-[85vh] overflow-y-auto`}
            onClick={ev => ev.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 text-tno-text/60 hover:text-tno-red text-xl font-bold px-2 cursor-pointer"
            >
              ✕
            </button>
            <h2 className={`text-3xl font-bold ${selected.color} tracking-widest font-serif`}>{selected.title}</h2>
            <p className="text-sm text-tno-text/60 mt-1 tracking-wider">{selected.subtitle}</p>
            <div className="text-[10px] text-tno-text/40 font-mono mt-1 tracking-widest">
              〔{selected.routeTag}〕 · {new Date(unlockState.unlocked[selected.id] ?? 0).toLocaleDateString()} 解锁
            </div>
            <div className={`w-full h-48 border ${selected.borderColor} mt-4 relative overflow-hidden`}>
              <img src={getEndingImageUrl(selected.imageKey)} alt={selected.title} className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
              <div className={`absolute inset-0 ${selected.bgColor} mix-blend-overlay`} />
            </div>
            <p className="text-sm text-tno-text leading-relaxed mt-4 whitespace-pre-wrap font-serif">
              {selected.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
