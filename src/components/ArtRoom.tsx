import { useEffect, useMemo, useState } from 'react';
import { LOADING_ART } from '../config/loadingArtwork';
import './artRoom.css';

interface Props { onBack: () => void }
type Route = '序章' | '革命' | '民主与改革' | '及第' | '杨玉乐' | '狗熊' | '吴福军' | '终局';
type Work = { name: keyof typeof LOADING_ART; route: Route; note: string };
const WORKS: Work[] = [
  { name: '行政楼', route: '序章', note: '校方体制 · 行政楼' },
  { name: '军训', route: '序章', note: '军训季 · 队列' },
  { name: '陈栋', route: '序章', note: '校长肖像' },
  { name: '陈栋与合一', route: '序章', note: '校长与校园' },
  { name: 'B3革命', route: '革命', note: 'B3教学楼 · 起义' },
  { name: '红色风暴', route: '革命', note: '校园革命' },
  { name: '合一文革', route: '革命', note: '革命路线 · 超事件' },
  { name: '合一文革2', route: '革命', note: '革命路线 · 差分' },
  { name: '批斗', route: '革命', note: '路线事件' },
  { name: '合一之春', route: '民主与改革', note: '改革与和解' },
  { name: '合一之春2', route: '民主与改革', note: '民主路线 · 超事件' },
  { name: '及第之梦', route: '及第', note: '及第路线 · 超事件' },
  { name: '内卷', route: '及第', note: '及第路线 · 暴动' },
  { name: '特级', route: '杨玉乐', note: '特级教师 · 结局差分' },
  { name: '特级0', route: '杨玉乐', note: '特级教师 · 结局差分' },
  { name: '特级教师', route: '杨玉乐', note: '杨玉乐路线 · 超事件' },
  { name: '裤熊逢春', route: '狗熊', note: '礼堂与新秩序' },
  { name: '校园涂鸦1', route: '狗熊', note: '校园涂鸦 · 差分一' },
  { name: '校园涂鸦2', route: '狗熊', note: '校园涂鸦 · 差分二' },
  { name: '清场', route: '吴福军', note: '铁腕路线 · 超事件' },
  { name: '封安宝时代', route: '终局', note: '校方体制 · 终局' },
  { name: '合一陨落', route: '终局', note: '校园崩溃 · 终局' },
];
const ROUTES: Array<Route | '全部'> = ['全部', '序章', '革命', '民主与改革', '及第', '杨玉乐', '狗熊', '吴福军', '终局'];
const STORAGE_KEY = 'heyi_art_room_viewed_v1';

export default function ArtRoom({ onBack }: Props) {
  const [route, setRoute] = useState<Route | '全部'>('全部');
  const [selected, setSelected] = useState<string>('行政楼');
  const [viewed, setViewed] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[]); }
    catch { return new Set(); }
  });
  const filtered = useMemo(() => route === '全部' ? WORKS : WORKS.filter(work => work.route === route), [route]);
  const current = WORKS.find(work => work.name === selected) ?? WORKS[0];
  const index = filtered.findIndex(work => work.name === current.name);

  useEffect(() => {
    setViewed(previous => {
      if (previous.has(selected)) return previous;
      const next = new Set(previous);
      next.add(selected);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch { /* storage may be unavailable */ }
      return next;
    });
  }, [selected]);
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
      <div><span>HEFEI NO.1 / VISUAL ARCHIVE</span><h1>合一美术室</h1><p>路线 CG · 超事件画面 · 载入图</p></div>
      <div className="art-room__count"><strong>{viewed.size.toString().padStart(2, '0')}</strong><span> / {WORKS.length} 已阅</span></div>
      <button type="button" onClick={onBack} className="art-room__back">返回主菜单</button>
    </header>
    <nav className="art-room__filters" aria-label="按路线筛选美术">
      {ROUTES.map(name => <button key={name} type="button" aria-pressed={route === name} onClick={() => setRoute(name)}>{name}</button>)}
    </nav>
    <div className="art-room__content">
      <section className="art-room__viewer" aria-label="画作预览">
        <div className="art-room__canvas"><img src={LOADING_ART[current.name]} alt={current.name} /><span className="art-room__corner art-room__corner--tl" /><span className="art-room__corner art-room__corner--br" /></div>
        <div className="art-room__caption"><div><span>馆藏 {String(WORKS.indexOf(current) + 1).padStart(2, '0')} / {WORKS.length} · {current.route}</span><h2>{current.name}</h2><p>{current.note}</p></div><div className="art-room__arrows"><button type="button" onClick={() => move(-1)} aria-label="上一张">‹</button><button type="button" onClick={() => move(1)} aria-label="下一张">›</button></div></div>
      </section>
      <section className="art-room__shelf" aria-label="画作目录">
        {filtered.map(work => <button key={work.name} type="button" className={selected === work.name ? 'is-selected' : ''} onClick={() => setSelected(work.name)}>
          <img src={LOADING_ART[work.name]} alt="" loading="lazy" /><span className="art-room__shelf-label"><b>{work.name}</b><small>{work.route}</small></span><i aria-label={viewed.has(work.name) ? '已阅' : '未阅'}>{viewed.has(work.name) ? '●' : '○'}</i>
        </button>)}
      </section>
    </div>
  </main>;
}
