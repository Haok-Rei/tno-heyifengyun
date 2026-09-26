import React, { useEffect } from 'react';
import { GameState } from '../types';
import { getEndingImageUrl, getLeaderPortraitUrl } from '../config/assets';
import { ENDING_BY_ID, UNKNOWN_ENDING, IMPLEMENTED_ENDING_COUNT } from '../data/endings';
import { unlockEnding, saveLastChronicle, getEndingUnlockState } from '../engine/endingGallery';
import { getCampaignSummary } from '../engine/campaignStats';

interface GameEndingScreenProps {
  state: GameState;
  onRestart: () => void;
  onReturnToMainMenu: () => void;
}

/** v8.9 结局收集进度条：显示画廊总解锁数与本结局路线收集情况 */
function EndingProgress({ currentEndingId, routeTag }: { currentEndingId: string; routeTag: string }) {
  const [unlockState, setUnlockState] = React.useState(() => getEndingUnlockState());
  // 挂载落库后刷新一次计数
  useEffect(() => {
    setUnlockState(getEndingUnlockState());
  }, [currentEndingId]);

  const unlockedCount = Object.keys(unlockState.unlocked).filter(id => ENDING_BY_ID[id]?.implemented).length;
  const routeEndings = Object.values(ENDING_BY_ID).filter(e => e.routeTag === routeTag);
  const routeUnlocked = routeEndings.filter(e => unlockState.unlocked[e.id]).length;
  const pct = Math.min(100, Math.round((unlockedCount / IMPLEMENTED_ENDING_COUNT) * 100));

  return (
    <div className="w-full max-w-2xl mb-12 text-left">
      <div className="border border-tno-border bg-black/50 p-4">
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="text-tno-highlight font-bold">结局收集</h3>
          <span className="text-xs text-tno-text/60 font-mono">{unlockedCount} / {IMPLEMENTED_ENDING_COUNT}</span>
        </div>
        <div className="w-full h-2 bg-zinc-900 border border-tno-border">
          <div className="h-full bg-tno-highlight transition-all duration-1000" style={{ width: `${pct}%` }}></div>
        </div>
        <div className="mt-2 text-[11px] text-tno-text/70">
          已解锁全部结局的 <span className="text-tno-highlight font-bold">{pct}%</span>
          {routeEndings.length > 0 && (
            <span className="ml-3">· 本路线「{routeTag}」已收集 {routeUnlocked} / {routeEndings.length} 个结局</span>
          )}
        </div>
        {unlockState.unlocked[currentEndingId] && (
          <div className="mt-1.5 text-[11px] text-tno-green">
            ✦ 本结局已收录进主菜单「结局画廊」
          </div>
        )}
      </div>
    </div>
  );
}

export default function GameEndingScreen({ state, onRestart, onReturnToMainMenu }: GameEndingScreenProps) {
  const details = ENDING_BY_ID[state.gameEnding ?? ''] ?? UNKNOWN_ENDING;
  const summary = getCampaignSummary(state);

  // 挂载时一次性落库：结局解锁 + 最近一局编年史快照
  useEffect(() => {
    if (state.gameEnding) {
      unlockEnding(state.gameEnding);
      saveLastChronicle({
        endingId: state.gameEnding,
        endingTitle: details.title,
        routeTag: details.routeTag,
        completedAt: Date.now(),
        entries: state.chronicle ?? [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-8">
      <div className={`max-w-4xl w-full bg-zinc-950 border-2 ${details.borderColor} p-8 relative overflow-hidden flex flex-col items-center text-center max-h-[90vh] overflow-y-auto`}>
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-20"></div>

        <h1 className={`text-6xl font-bold ${details.color} mb-2 tracking-widest uppercase font-serif`}>
          {details.title}
        </h1>
        <h2 className="text-2xl text-tno-text/80 mb-8 tracking-wider">
          {details.subtitle}
        </h2>

        <div className={`w-full h-64 border ${details.borderColor} mb-8 relative overflow-hidden`}>
          <img src={getEndingImageUrl(details.imageKey)} alt="Ending" className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
          <div className={`absolute inset-0 ${details.bgColor} mix-blend-overlay`}></div>
        </div>

        <p className="text-lg text-tno-text leading-relaxed mb-12 max-w-2xl text-left whitespace-pre-wrap">
          {details.description}
        </p>

        <div className="grid grid-cols-2 gap-8 w-full max-w-2xl mb-8 text-left">
          <div className="border border-tno-border p-4 bg-black/50">
            <h3 className="text-tno-highlight font-bold mb-2">最终状态</h3>
            <ul className="text-sm text-tno-text/80 space-y-1">
              <li>政治点数: {state.stats.pp.toFixed(0)}</li>
              <li>稳定度: {state.stats.stab.toFixed(1)}%</li>
              <li>学生支持度: {state.stats.ss.toFixed(1)}%</li>
              <li>激进愤怒: {state.stats.radicalAnger.toFixed(1)}%</li>
            </ul>
          </div>
          <div className="border border-tno-border p-4 bg-black/50">
            <h3 className="text-tno-highlight font-bold mb-2">最终领袖</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-16 border border-tno-border bg-zinc-900 overflow-hidden">
                <img src={getLeaderPortraitUrl(state.leader.portrait)} alt="Leader" className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
              </div>
              <div>
                <div className="font-bold text-white">{state.leader.name}</div>
                <div className="text-xs text-tno-text/60">{state.leader.title}</div>
              </div>
            </div>
          </div>
        </div>

        {/* v8.9 结局收集进度 */}
        <EndingProgress currentEndingId={state.gameEnding ?? ''} routeTag={details.routeTag} />

        <section className="ending-ledger w-full max-w-2xl mb-10 text-left" aria-label="本局校园年鉴">
          <div className="ending-ledger-head"><span>HEFEI No.1 / CAMPUS RECORD</span><h3>本局校园年鉴</h3><p>2023—{state.date.getFullYear()} · 运行 {summary.days} 天 · {details.routeTag}</p></div>
          <div className="ending-metrics">
            <div><strong>{summary.c9.toLocaleString()}</strong><span>C9 录取人数 <small>模型推算</small></span></div>
            <div><strong>{summary.university985.toLocaleString()}</strong><span>985 录取人数 <small>模型推算</small></span></div>
            <div><strong>{summary.papersUsed.toLocaleString()}</strong><span>使用试卷 <small>张</small></span></div>
            <div><strong>{summary.clubEvents.toLocaleString()}</strong><span>开展社团活动 <small>次</small></span></div>
          </div>
          <p className="ending-ledger-foot">累计印制约 {summary.papersPrinted.toLocaleString()} 张试卷，学习环境指数平均 {summary.average} / 100。{summary.cohorts ? `跨越 ${summary.cohorts} 届高考；升学人数根据本局学习环境推算。` : '本局尚未到达首个高考毕业季，因此录取人数为零。'}旧存档可能缺少历史累计数据。</p>
        </section>

        <div className="flex gap-4 z-20 pointer-events-auto">
          <button
            onClick={onRestart}
            className={`px-8 py-3 border-2 ${details.borderColor} ${details.color} hover:bg-white/10 font-bold tracking-widest transition-colors cursor-pointer pointer-events-auto`}
          >
            重新开始
          </button>
          <button
            onClick={onReturnToMainMenu}
            className="px-8 py-3 border-2 border-tno-border text-tno-text/80 hover:bg-white/10 font-bold tracking-widest transition-colors cursor-pointer pointer-events-auto"
          >
            返回主菜单
          </button>
        </div>
      </div>
    </div>
  );
}
