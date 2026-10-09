import { useEffect, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import type { Artwork } from '../data/artGallery';
import { unlockEarnedArtwork, type ArtProgress } from '../engine/artGallery';
import { LOADING_ART } from '../config/loadingArtwork';
import './artworkUnlockToast.css';

export default function ArtworkUnlockToast({ progress, suspended }: { progress: ArtProgress; suspended: boolean }) {
  const [queue, setQueue] = useState<Artwork[][]>([]);
  const batch = queue[0];
  useEffect(() => {
    const fresh = unlockEarnedArtwork(progress);
    if (fresh.length) setQueue(previous => [...previous, fresh]);
  }, [progress.currentFocusTree, progress.completedFocuses, progress.activeEvent?.id, progress.activeSuperEvent?.id, progress.gameEnding, progress.chronicle]);

  useEffect(() => {
    if (!batch || suspended) return;
    const timer = window.setTimeout(() => setQueue(previous => previous.slice(1)), 6500);
    return () => window.clearTimeout(timer);
  }, [batch, suspended]);

  if (!batch || suspended) return null;
  return <aside className="art-unlock" key={batch[0].name} role="status" aria-live="polite" aria-atomic="true">
    <img className="art-unlock__preview" src={LOADING_ART[batch[0].name]} alt="" />
    <div className="art-unlock__body"><span><ImagePlus size={13} /> 美术室 · 新画作收录</span><strong>{batch[0].name}{batch.length > 1 ? ` 等 ${batch.length} 幅` : ''}</strong><p>{batch.length > 1 ? batch.slice(1).map(work => work.name).join(' · ') : batch[0].note}</p></div>
    <button type="button" aria-label="关闭画作解锁通知" onClick={() => setQueue(previous => previous.slice(1))}><X size={14} /></button>
    <div className="art-unlock__timer" />
  </aside>;
}
