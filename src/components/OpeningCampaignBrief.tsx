import React from 'react';
import type { GameState } from '../types';
import { getChapterBrief, getOpeningMemorySummary, type OpeningChapter } from '../engine/openingCampaign';

const CHAPTERS: Array<{ id: OpeningChapter; label: string }> = [
  { id: 'mobilization', label: '联络动员' }, { id: 'handover', label: '起义接管' }, { id: 'committee', label: '革委会协商' },
];

function ChapterSeal({ chapter }: { chapter: OpeningChapter }) {
  return <svg className="chapter-seal" viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <path d="M32 4 56 17v30L32 60 8 47V17Z" stroke="currentColor" opacity=".5" />
    <path d="M32 9 51 20v24L32 55 13 44V20Z" stroke="currentColor" opacity=".25" />
    {chapter === 'mobilization' ? <>
      <path d="M19 33 27 25l10 14 10-10M19 33l18 6M27 25l20 4" stroke="currentColor" />
      {[[19,33],[27,25],[37,39],[47,29]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="3" fill="#1b2122" stroke="currentColor" />)}
    </> : chapter === 'handover' ? <>
      <path d="M17 44h31M22 43V21h20v22M26 26h12M26 31h12M27 44v-8h10v8M39 21V13m0 0 12 4-12 4" stroke="currentColor" />
      <path d="m15 46 12-3 12 3 11-2" stroke="currentColor" opacity=".6" />
    </> : <>
      <path d="M16 34h32v6H16zM21 40v8m22-8v8M26 29v-8m12 8v-8" stroke="currentColor" />
      <circle cx="26" cy="17" r="3" stroke="currentColor" /><circle cx="38" cy="17" r="3" stroke="currentColor" />
      <path d="M18 28h28M32 12v15m0-15 9 3-9 4" stroke="currentColor" opacity=".7" />
    </>}
  </svg>;
}

export default function OpeningCampaignBrief({ state }: { state: GameState }) {
  const brief = getChapterBrief(state);
  const memory = getOpeningMemorySummary(state);
  if (!brief) return null;
  const index = CHAPTERS.findIndex(chapter => chapter.id === brief.id);
  return <section className="opening-brief" aria-label="当前章节引导">
    <header><ChapterSeal chapter={brief.id} /><div><small>当前进展</small><h3>{brief.title}</h3><p>{brief.goal}</p></div></header>
    <ol className="opening-chapter-track" aria-label="开局章节">
      {CHAPTERS.map((chapter, i) => <li key={chapter.id} className={i === index ? 'current' : i < index ? 'past' : ''} aria-current={i === index ? 'step' : undefined}><i />{chapter.label}</li>)}
    </ol>
    <details className="opening-brief-details"><summary>本章行动与前史</summary>
      <ul>{brief.steps.map(step => <li key={step.label} className={step.done ? 'done' : ''}><b>{step.done ? '✓' : '◇'} {step.label}</b><p>{step.hint}</p></li>)}</ul>
      {!!memory.length && <div className="opening-memory">{memory.map(line => <p key={line}>{line}</p>)}</div>}
    </details>
  </section>;
}
