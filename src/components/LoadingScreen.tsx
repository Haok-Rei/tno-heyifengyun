import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LOADING_ART } from '../config/loadingArtwork';
import { ARTWORKS } from '../data/artGallery';
import { getArtUnlocks, pickLoadingArtwork } from '../engine/artGallery';

interface LoadingScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

const LOADING_QUOTES = [
  { text: '教育的目的，不是灌输，而是点燃火焰。', author: '苏格拉底' },
  { text: '谁控制了青年，谁就掌握了未来。', author: '列宁' },
  { text: '真正的自由，不是想做什么就做什么，而是不想做什么就可以不做什么。', author: '康德' },
  { text: '秩序是自由的第一条件。', author: '黑格尔' },
  { text: '世界属于青年，就像黎明属于朝阳。', author: '毛泽东' },
] as const;

function shuffleArray<T>(items: readonly T[]): T[] {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

export default function LoadingScreen({ onComplete, durationMs = 10000 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [rotationIndex, setRotationIndex] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isCompletedRef = useRef(false);
  const shuffledQuotes = useMemo(() => shuffleArray(LOADING_QUOTES), []);
  const shuffledBackgrounds = useMemo(() => {
    const unlocks = getArtUnlocks();
    const picked = pickLoadingArtwork(unlocks);
    // Choose the category once per loading session: sensitive CGs occur in at most 2% of sessions.
    const pool = ARTWORKS.filter(work => picked.scenery ? work.scenery
      : !work.scenery && !!work.sensitive === !!picked.sensitive && unlocks[work.name]);
    return shuffleArray(pool).map(work => ({ name: work.name, url: LOADING_ART[work.name] }));
  }, []);

  const cycleLength = useMemo(
    () => Math.max(shuffledQuotes.length, shuffledBackgrounds.length),
    [shuffledQuotes.length, shuffledBackgrounds.length]
  );

  useEffect(() => {
    const updateProgress = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const nextProgress = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(nextProgress);

      if (nextProgress >= 100) {
        if (!isCompletedRef.current) {
          isCompletedRef.current = true;
          onComplete();
        }
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(updateProgress);
    };

    animationFrameRef.current = window.requestAnimationFrame(updateProgress);
    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [durationMs, onComplete]);

  useEffect(() => {
    const rotationTimer = window.setInterval(() => {
      setRotationIndex((prev) => (prev + 1) % cycleLength);
    }, 2400);

    return () => {
      window.clearInterval(rotationTimer);
    };
  }, [cycleLength]);

  const currentQuote = shuffledQuotes[rotationIndex % shuffledQuotes.length];
  const currentBgIndex = rotationIndex % shuffledBackgrounds.length;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white crt">
      <div className="absolute inset-0">
        {shuffledBackgrounds.map((bg, index) => (
          <img
            key={bg.name}
            src={bg.url}
            alt={bg.name}
            className={`absolute inset-0 h-full w-full object-cover brightness-[1.08] contrast-[1.08] saturate-[1.06] transition-opacity duration-1000 ${
              index === currentBgIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(7,10,22,0.06)_0%,rgba(4,8,16,0.36)_56%,rgba(0,0,0,0.62)_100%)]" />
        <div className="loading-grid-overlay absolute inset-0" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,120,77,0.03),rgba(56,189,248,0.05),rgba(255,255,255,0))]" />
      </div>

      <div className="absolute left-0 top-0 z-30 w-full px-4 pt-4 md:px-8 md:pt-6">
        <div className="relative overflow-hidden border border-cyan-200/70 bg-black/65 backdrop-blur-sm">
          <div className="h-[16px] w-full bg-cyan-100/10" />
          <div
            className="loading-bar-sweep absolute left-0 top-0 h-[16px] bg-gradient-to-r from-cyan-300 via-sky-200 to-orange-200 transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-cyan-100/90 md:text-xs">
          <span>Bootstrapping Campus Order...</span>
          <span>{Math.floor(progress)}%</span>
        </div>
      </div>

      <div className="relative z-20 h-full px-4 md:px-8">
        <div className="absolute bottom-4 left-1/2 w-[min(92vw,620px)] -translate-x-1/2 border border-white/25 bg-black/56 p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_14px_38px_rgba(0,0,0,0.55)] backdrop-blur-sm md:bottom-6 md:p-4">
          <p className="text-center text-sm leading-relaxed text-white/95 md:text-base">“{currentQuote.text}”</p>
          <p className="mt-2 text-center text-[10px] uppercase tracking-[0.24em] text-orange-200/85 md:text-xs">
            {currentQuote.author}
          </p>
        </div>
      </div>
    </div>
  );
}
