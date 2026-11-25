import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { LOADING_ART } from '../config/loadingArtwork';
import { createLoadingArtworkSequence, getArtUnlocks } from '../engine/artGallery';
import { LOADING_QUOTES } from '../data/loadingQuotes';
import './loadingScreen.css';

interface LoadingScreenProps {
  onComplete: () => void;
  durationMs?: number;
}

const FRAME_MS = 2500;
const QUOTE_MS = 3250;

function shuffleQuotes() {
  const quotes = [...LOADING_QUOTES];
  for (let i = quotes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [quotes[i], quotes[j]] = [quotes[j], quotes[i]];
  }
  return quotes;
}

export default function LoadingScreen({ onComplete, durationMs = 10000 }: LoadingScreenProps) {
  const [elapsed, setElapsed] = useState(0);
  const completion = useRef(onComplete);
  const [quotes] = useState(shuffleQuotes);
  const duration = Math.max(1, durationMs);
  const frames = useMemo(() => {
    const unlocks = getArtUnlocks();
    return createLoadingArtworkSequence(unlocks, Math.ceil(duration / FRAME_MS)).map(work => ({
      name: work.name === '滨湖晨光0' ? '滨湖晨光 · 旧校门' : work.name,
      url: LOADING_ART[work.name],
      collected: work.scenery || Boolean(unlocks[work.name]),
    }));
  }, [duration]);
  const frameIndex = Math.min(frames.length - 1, Math.floor(elapsed / FRAME_MS));
  const quoteIndex = Math.floor(elapsed / QUOTE_MS) % quotes.length;
  const quote = quotes[quoteIndex];
  const progress = Math.min(100, Math.floor(elapsed / (duration - Math.min(260, duration / 4)) * 100));

  useEffect(() => { completion.current = onComplete; }, [onComplete]);

  useEffect(() => {
    let start: number | undefined;
    let frame = 0;
    const tick = (time: number) => {
      start ??= time;
      const timePassed = time - start;
      if (timePassed >= duration) {
        completion.current();
        return;
      }
      setElapsed(Math.floor(timePassed / 40) * 40);
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [duration]);

  return (
    <main className="loading-projector" aria-label="正在载入合一风云">
      <div className="loading-projector__scenes" aria-hidden="true">
        {frames.map((frame, index) => (
          <div key={index} className={'loading-projector__scene' + (index === frameIndex ? ' is-current' : '')}>
            <img src={frame.url} alt="" decoding="async" fetchPriority={index === 0 ? 'high' : 'low'} />
          </div>
        ))}
      </div>
      <div className="loading-projector__grade" aria-hidden="true" />
      <div className="loading-projector__grain" aria-hidden="true" />
      <div key={frameIndex} className="loading-projector__wipe" aria-hidden="true" />
      <div className="loading-projector__frame" aria-hidden="true"><i /><i /><i /><i /></div>
      <header className="loading-projector__header">
        <div>
          <span className="loading-projector__wordmark">THE HEFEI ORDER</span>
          <h1>合肥一中风云</h1>
        </div>
        <div className="loading-projector__plate" key={frameIndex}>
          <span>{frames[frameIndex].name}</span>
          {!frames[frameIndex].collected && <small>未收录预览</small>}
        </div>
      </header>
      <footer className="loading-projector__footer">
        <figure key={quoteIndex} className="loading-projector__quote">
          <blockquote>“{quote.text}”</blockquote>
          <figcaption>{quote.author} <cite>《{quote.source}》</cite></figcaption>
        </figure>
        <div className="loading-projector__load">
          <div className="loading-projector__load-label">
            <span>{progress === 100 ? '载入完成' : '载入游戏'}</span><output>{String(progress).padStart(2, '0')}<small>%</small></output>
          </div>
          <div className="loading-projector__progress" role="progressbar" aria-label="载入进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <div className="loading-projector__fill" style={{ '--load-fraction': progress / 100 } as CSSProperties} />
          </div>
        </div>
      </footer>
    </main>
  );
}
