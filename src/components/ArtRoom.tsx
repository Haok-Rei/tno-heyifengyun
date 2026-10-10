import { useEffect, useMemo, useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { LOADING_ART } from '../config/loadingArtwork';
import { ARTWORKS, ART_ROUTES, type ArtRoute } from '../data/artGallery';
import { getArtUnlocks } from '../engine/artGallery';
import './artRoom.css';

interface Props { onBack: () => void }
const WORKS = ARTWORKS;
const ROUTES = ART_ROUTES;
const STORAGE_KEY = 'heyi_art_room_viewed_v1';

export default function ArtRoom({ onBack }: Props) {
  const [route, setRoute] = useState<ArtRoute | '全部'>('全部');
  const [unlocked] = useState(getArtUnlocks);
  const [selected, setSelected] = useState(() => WORKS.find(work => unlocked[work.name])?.name ?? WORKS[0].name);
  const [viewed, setViewed] = useState<Set<string>>(() => {
    try { const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); return new Set(Array.isArray(data) ? data.filter(name => unlocked[name]) : []); }
    catch { return new Set(); }
  });
  const filtered = useMemo(() => route === '全部' ? WORKS : WORKS.filter(work => work.route === route), [route]);
  const current = filtered.find(work => work.name === selected) ?? filtered[0];
  const index = filtered.findIndex(work => work.name === current.name);
  const isUnlocked = !!unlocked[current.name];
  const unlockCount = WORKS.filter(work => unlocked[work.name]).length;

  useEffect(() => {
    if (!unlocked[selected]) return;
    setViewed(previous => {
      if (previous.has(selected)) return previous;
      const next = new Set(previous);
      next.add(selected);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch { /* storage may be unavailable */ }
      return next;
    });
  }, [selected, unlocked]);
  useEffect(() => {
    if (!filtered.some(work => work.name === selected)) setSelected(filtered[0].name);
  }, [filtered, selected]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onBack();
      if (event.key === 'ArrowLeft') setSelected(filtered[(index - 1 + filtered.length) % filtered.length].name);
      if (event.key === 'ArrowRight') setSelected(filtered[(index + 1) % filtered.length].name);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [filtered, index, onBack]);
  const move = (offset: number) => setSelected(filtered[(index + offset + filtered.length) % filtered.length].name);

  return <main className="art-room crt">
    <header className="art-room__header">
      <div><span>HEFEI NO.1 / VISUAL ARCHIVE</span><h1>合一美术室</h1><p>路线 CG · 超事件画面 · 校园风景</p></div>
      <div className="art-room__count"><strong>{unlockCount.toString().padStart(2, '0')}</strong><span> / {WORKS.length} 已解锁</span></div>
      <button type="button" onClick={onBack} className="art-room__back">返回主菜单</button>
    </header>
    <nav className="art-room__filters" aria-label="按路线筛选美术">
      {ROUTES.map(name => <button key={name} type="button" aria-pressed={route === name} onClick={() => setRoute(name)}>{name}</button>)}
    </nav>
    <div className="art-room__content">
      <section className="art-room__viewer" aria-label="画作预览">
        <div className={`art-room__canvas ${isUnlocked ? '' : 'is-locked'}`}>
          {isUnlocked ? <img src={LOADING_ART[current.name]} alt={current.name} /> : <div className="art-room__sealed"><LockKeyhole size={42} strokeWidth={1} /><span>尚未收录</span><p>{current.unlockHint}</p><small>体验对应剧情后自动收录；载入预览不计入收藏。</small></div>}
          <span className="art-room__corner art-room__corner--tl" /><span className="art-room__corner art-room__corner--br" />
        </div>
        <div className="art-room__caption"><div><span>馆藏 {String(WORKS.indexOf(current) + 1).padStart(2, '0')} / {WORKS.length} · {current.route}</span><h2>{current.name}</h2><p>{isUnlocked ? current.note : current.unlockHint}</p></div><div className="art-room__arrows"><button type="button" onClick={() => move(-1)} aria-label="上一张">‹</button><button type="button" onClick={() => move(1)} aria-label="下一张">›</button></div></div>
      </section>
      <section className="art-room__shelf" aria-label="画作目录">
        {filtered.map(work => <button key={work.name} type="button" className={`${selected === work.name ? 'is-selected' : ''} ${unlocked[work.name] ? '' : 'is-locked'}`} onClick={() => setSelected(work.name)} aria-label={`${work.name} · ${unlocked[work.name] ? '已解锁' : '未解锁'}`}>
          {unlocked[work.name] ? <img src={LOADING_ART[work.name]} alt="" loading="lazy" /> : <span className="art-room__locked-thumb"><LockKeyhole size={22} strokeWidth={1.2} /></span>}
          <span className="art-room__shelf-label"><b>{work.name}</b><small>{work.route}</small></span><i aria-label={!unlocked[work.name] ? '未解锁' : viewed.has(work.name) ? '已阅' : '新收录'}>{!unlocked[work.name] ? '锁' : viewed.has(work.name) ? '●' : 'NEW'}</i>
        </button>)}
      </section>
    </div>
  </main>;
}
