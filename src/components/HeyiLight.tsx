import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { X } from 'lucide-react';
import type { GameState } from '../types';
import { getHeyiLightSnapshot, type HeyiZone } from '../engine/heyiLight';
import './heyiLight.css';
import { CampusBuildingDetails, CampusGround, CampusGate, CampusGuard, CampusTrees, StreetFurniture, CampusRouteObjects, CampusEdges } from './CampusEnvironment';

interface Props { state: GameState; onClose: () => void }
type Snapshot = ReturnType<typeof getHeyiLightSnapshot>;
type Point = { x: number; y: number };
function Person({ x, y, teacher = false, tired = false, stride = 0, active, snapshot, onZone, onPointer }: { x: number; y: number; teacher?: boolean; tired?: boolean; stride?: number; active: HeyiZone | null; snapshot: Snapshot; onZone: (zone: HeyiZone | null, anchor?: Point) => void; onPointer: (event: PointerEvent<SVGElement>, zone: HeyiZone) => void }) {
  const zone: HeyiZone = teacher ? 'teachers' : 'students';
  const accent = teacher ? '#c6c8ae' : stride === 2 ? '#b9b393' : stride === 3 ? '#8da9b6' : '#8bbfbe';
  return <g transform={'translate(' + x + ' ' + y + ') scale(.80 1.08)'} className={'heyi-person ' + (active === zone ? 'is-observed ' : '') + (stride ? 'heyi-person--walking' : 'heyi-person--standing')} style={{ animationDelay: '-' + (stride * 1.13) + 's' }}>
    <ellipse cx="2" cy="27" rx="24" ry="4" fill="#111d22" opacity=".8" stroke="none" />
    <g transform={tired ? 'rotate(7 0 -20)' : undefined}>
      <path className="heyi-person__leg heyi-person__leg--left" d="M-8-3L-14 19L-18 24L-10 26L-5 20L2 4Z" fill="#15242a" stroke={accent} strokeWidth="1.45" strokeLinejoin="round" />
      <path className="heyi-person__leg heyi-person__leg--right" d="M7-3L13 20L19 24L12 26L6 22L-1 5Z" fill="#101f26" stroke={accent} strokeWidth="1.45" strokeLinejoin="round" />
      <path d="M-17 25l12 1m19-1 10 1" stroke="#c1d1c9" strokeWidth="1.8" />
      <path d="M-12-38Q0-43 12-37L13-4Q0 1-13-4Z" fill={teacher ? '#101819' : '#091318'} stroke={accent} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M-10-36L-5-12H6L11-36M-12-19h25M-8-9h16" fill="none" stroke="#477a83" strokeWidth=".8" />
      {teacher ? <g><path d="M-8-39L0-25L8-39M-6-26L0-20L5-26" fill="#13232a" stroke="#d6d6c4" strokeWidth="1.25" /><path d="M2-25v14" stroke="#ab9c87" strokeWidth="1.2" /></g> : <g><path d="M-7-38L0-29L7-38" fill="none" stroke="#e1e3d6" strokeWidth="1.25" /><path d="M-10-31l-6 6v23l10 2" fill="none" stroke="#6d9ca3" strokeWidth="1.2" /><path d="M-8-19h16" stroke="#acc9c3" strokeWidth=".8" /><path d="M-3-19h6v7h-6Z" fill={stride === 2 ? '#b59a6b' : '#7d999a'} stroke="#d3d1b8" strokeWidth=".6" /></g>}
      <path d={tired ? 'M-12-34L-24-13L-20-8L-7-20M12-34L19-13L15-8L8-21' : 'M-12-34L-20-15L-17-5L-12-7L-15-16L-6-26M12-34L19-14L24-9L20-6L12-15L7-26'} fill="#0b2027" stroke={accent} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M-22-8l5 3m33-3 5 3" stroke="#d0c9ae" strokeWidth="2.5" strokeLinecap="round" />
      <g transform="translate(0 -55) scale(.80 .92) translate(0 55)">
      <path d="M-3-42v-7h7v7" fill="#18282b" stroke="#b1bcb1" strokeWidth="1.1" />
      <path d="M-9-54Q-7-64 0-64Q9-63 10-53L8-44Q0-39-8-45Z" fill="#102126" stroke="#bad0c5" strokeWidth="1.45" />
      <path d={stride === 2 ? 'M-11-54Q-16-68-6-70Q8-74 12-59L12-52Q7-57 4-62Q0-55-5-56Q-8-52-11-54Z' : stride === 3 ? 'M-10-55Q-12-68-3-70Q10-70 12-57L13-49Q8-50 8-57Q0-54-10-55Z' : 'M-9-54Q-13-65-5-69Q3-72 10-64L12-55Q6-60-2-60Q-5-55-9-54Z'} fill="#111917" stroke={teacher ? '#bdbba7' : '#a0bbb9'} strokeWidth="1.2" />
      {stride === 3 && <path d="M-11-56q-7 13-1 20m21-19q9 10 5 22" stroke="#b8b29f" strokeWidth="1.3" fill="none" />}
      <path d="M-4-50l2 1m6-1 2 1M-2-44q3 1 6 0" stroke="#b9baae" strokeWidth=".8" />
      </g>
      {teacher ? <g><path d="M17-7h17v24H17Z" fill="#0d2026" stroke="#c7ccb9" strokeWidth="1.35" /><path d="M21-7v-4h10v4M20 0h11m-11 5h8" stroke="#8faeaa" strokeWidth="1" /></g> : <g><path d="M-14-34L-31-29L-27 1L-13 2Z" fill="#071216" stroke={accent} strokeWidth="1.5" /><path d="M-27-26l14-1m-13 10 12-2m-10 11 11-2" stroke="#698884" strokeWidth=".9" /><path d="M-15-29l5 5" stroke="#d5c6a5" strokeWidth="1.2" /><circle cx="-21" cy="-14" r="2" fill="#c6bb8e" stroke="none" /></g>}
      {stride === 2 && <g><path d="M19-6l13-5 5 18-16 3Z" fill="#192a2d" stroke="#c0cbbd" strokeWidth="1.2" /><path d="M22-3l10-3m-9 7 10-3m-9 7 10-3" stroke="#8fa8a8" strokeWidth=".8" /></g>}
    </g>
    <path className="heyi-person__hit" d="M-12-70Q0-77 13-68L16-41L25-17L38-10V22L12 31L0 15L-12 31L-22 28L-35 4L-36-34L-15-42Z"
      role="button" tabIndex={0} aria-label={'观察'+snapshot.zones[zone].label}
      onPointerEnter={e=>onPointer(e,zone)} onPointerMove={e=>onPointer(e,zone)} onPointerLeave={()=>onZone(null)}
      onFocus={()=>onZone(zone,{x,y:y-35})} onBlur={()=>onZone(null)}
      onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onZone(zone,{x,y:y-35});}}} />
  </g>;
}
function SchoolCampus({ lit, unrest, route }: { lit: number; unrest: boolean; route: Snapshot['route'] }) {
  // Both facades converge on a shared horizon at y=260; the nearest corner is deliberately off-centre.
  const corner = {x:720, top:75, bottom:435};
  const faces = [{x:80,top:137,bottom:377,n:9},{x:1160,top:127,bottom:386,n:6}];
  const point=(face:typeof faces[number],u:number,v:number):Point=>({x:corner.x+(face.x-corner.x)*u,y:corner.top+(face.top-corner.top)*u+v*((corner.bottom-corner.top)+(face.bottom-face.top-corner.bottom+corner.top)*u)});
  const line=(points:Point[])=>'M'+points.map(q=>`${q.x.toFixed(2)} ${q.y.toFixed(2)}`).join('L');
  return <g className="heyi-campus">
    <path d="M80 137L720 75L1160 127V386L720 435L80 377Z" fill="#060e12" stroke="#c2c9be" strokeWidth="1.4" />
    <path d="M80 137L720 75L1160 127L1151 110L720 55L89 120Z" fill="#0a1317" stroke="#a5bcb9" strokeWidth="1" />
    <path d="M80 145L720 87L1160 137M80 153L720 99L1160 146M80 374L720 429L1160 383" stroke="#6f969b" strokeWidth=".8" fill="none" />
    {faces.map((face,side)=><g key={side}>
      {[.02,.25,.5,.75,.98].map(v=><g key={v}><path d={line([point(face,0,v),point(face,1,v)])} fill="none" stroke="#abb6ad" strokeWidth="1.1" /><path d={line([point(face,0,v+.014),point(face,1,v+.014)])} fill="none" stroke="#467581" strokeWidth=".65" /></g>)}
      {Array.from({length:face.n+1},(_,j)=>{const u=j/face.n;return <path key={j} d={line([point(face,u,.025),point(face,u,.98)])} stroke="#527d85" strokeWidth=".6" fill="none" />;})}
      {[0,1,2,3].map(row=>Array.from({length:face.n},(_,col)=>{
        const index=row*face.n+col+side*36;const u=(col+.18)/face.n, end=(col+.80)/face.n;const v=.055+row*.242, bottom=v+.165;
        const corners=[point(face,u,v),point(face,end,v),point(face,end,bottom),point(face,u,bottom)];
        const litWindow=(index*7+row)%16<lit*.7;
        return <g key={index}>
          <path d={line(corners)+'Z'} fill="#03090d" stroke="#c5d0c5" strokeWidth="1" />
          {litWindow&&<path className="heyi-window__light" style={{animationDelay:`-${index%7*1.7}s`}} d={line([point(face,u+.015,v+.01),point(face,end-.015,v+.01),point(face,end-.015,bottom-.01),point(face,u+.015,bottom-.01)])+'Z'} fill={index%3?'#6e775a':'#ac9056'} opacity=".23" />}
          <path d={line([point(face,(u+end)/2,v),point(face,(u+end)/2,bottom)])+line([point(face,u,(v+bottom)/2),point(face,end,(v+bottom)/2)])} fill="none" stroke="#739a9f" strokeWidth=".7" />
          <path d={line([point(face,u-.012,bottom+.012),point(face,end+.012,bottom+.012),point(face,end+.012,bottom+.025),point(face,u-.012,bottom+.025)])+'Z'} fill="#101b1e" stroke="#b0bdb0" strokeWidth=".7" />
          <path d={line([point(face,u+.035,v+.025),point(face,u+.10,v+.05)])} stroke="#799e9d" strokeWidth=".6" />
          {unrest&&index%11===3&&<path d={line([corners[0],point(face,(u+end)/2,(v+bottom)/2),corners[2]])} stroke="#c17e69" strokeWidth="1.1" fill="none" />}
          {row===3&&col%3===0&&<path d={line([point(face,u,bottom-.025),point(face,end,bottom-.025)])} stroke="#afab89" strokeWidth=".8" />}
        </g>;
      }))}
      {Array.from({length:18},(_,i)=>{const v=.04+i*.052; return <path key={i} d={line([point(face,.91,v),point(face,1,v)])} stroke="#395d67" strokeWidth=".5" fill="none" />;})}
    </g>)}
    <path d="M720 56V435M715 57V434M727 58V434" stroke="#c5cbb9" strokeWidth="1.1" />
    <path d="M720 54V22L744 29V61L720 54ZM720 22L687 32V58L720 54" fill="#070e12" stroke="#afbcae" strokeWidth="1" />
    <ellipse cx="706" cy="40" rx="8" ry="10" fill="#080f12" stroke="#c3b796" /><path d="M706 33V40L710 44" stroke="#ded4af" fill="none" />
    <path d="M113 143V370M1124 137V381" stroke="#8caaa5" strokeWidth="1.1" />
  </g>;
}
function Scene({ snapshot, month, viewBox, active, onZone, onPointer }: {
  snapshot: Snapshot; month: number; viewBox: string; active: HeyiZone | null;
  onZone: (zone: HeyiZone | null, anchor?: Point) => void;
  onPointer: (event: PointerEvent<SVGElement>, zone: HeyiZone) => void;
}) {
  const {route,mood,value}=snapshot;
  const unrest=route==='jidi_riot';
  const lit=route==='despair'?1:route==='jidi'?13:route==='yang'?10:Math.round(4+value/14);
  const observation={snapshot,active,onZone,onPointer};
  return <svg className="heyi-light-v2__scene" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" role="img" aria-label={'合肥一中校门：'+snapshot.headline}>
    <rect x="-500" width="2200" height="700" fill="#020b10" />
    <CampusGround observation={observation}/>
    <SchoolCampus lit={lit} unrest={unrest} route={route}/>
    <CampusBuildingDetails route={route}/>
    <g className="heyi-hotspots"><path d="M80 137L720 75L1160 127V386L720 435L80 377Z" className={active==='building'?'is-active':''}
      role="button" tabIndex={0} aria-label={'观察教学楼：'+snapshot.zones.building.description}
      onPointerEnter={e=>onPointer(e,'building')} onPointerMove={e=>onPointer(e,'building')} onPointerLeave={()=>onZone(null)}
      onFocus={()=>onZone('building',{x:610,y:190})} onBlur={()=>onZone(null)}
      onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onZone('building',{x:610,y:190});}}}/></g>
    <CampusEdges observation={observation}/>
    <CampusGuard observation={observation}/>
    <CampusGate observation={observation}/>
    <CampusTrees observation={observation} month={month}/>
    <StreetFurniture observation={observation}/>
    <CampusRouteObjects observation={observation}/>
    <Person x={route==='despair'?595:477} y={572} tired={mood==='weary'||mood==='ruin'||route==='wu'} stride={route==='despair'?0:1} active={active} snapshot={snapshot} onZone={onZone} onPointer={onPointer}/>
    {route!=='despair'&&<Person x={562} y={586} tired={mood==='ruin'||route==='jidi'||route==='wu'} stride={2} active={active} snapshot={snapshot} onZone={onZone} onPointer={onPointer}/>}
    {route!=='despair'&&<Person x={680} y={600} tired={mood==='weary'||mood==='ruin'||route==='jidi'||route==='wu'} stride={3} active={active} snapshot={snapshot} onZone={onZone} onPointer={onPointer}/>}
    {route!=='despair'&&<Person x={835} y={570} teacher tired={route==='jidi_riot'||route==='wu'} active={active} snapshot={snapshot} onZone={onZone} onPointer={onPointer}/>}
  </svg>;
}
export default function HeyiLight({ state, onClose }: Props) {
  const snapshot = getHeyiLightSnapshot(state);
  const [active, setActive] = useState<HeyiZone | null>(null);
  const [point, setPoint] = useState<Point>({ x: 0, y: 0 });
  const [viewBox, setViewBox] = useState('0 0 1200 700');
  const sceneRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const update = () => {
      const { width, height } = scene.getBoundingClientRect();
      if (width < 1 || height < 1) return;
      const worldWidth = Math.round(700 * width / height);
      setViewBox(((1200 - worldWidth) / 2) + ' 0 ' + worldWidth + ' 700');
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(scene);
    return () => observer.disconnect();
  }, []);
  const onZone = (zone: HeyiZone | null, anchor?: Point) => {
    setActive(zone);
    const bounds = sceneRef.current?.getBoundingClientRect();
    if (bounds && anchor) {
      const svg = sceneRef.current?.querySelector('svg');
      const matrix = svg?.getScreenCTM();
      if (svg && matrix) {
        const screenPoint = svg.createSVGPoint();
        screenPoint.x = anchor.x;
        screenPoint.y = anchor.y;
        const transformed = screenPoint.matrixTransform(matrix);
        setPoint({ x: transformed.x - bounds.left, y: transformed.y - bounds.top });
      }
    }
  };
  const onPointer = (event: PointerEvent<SVGElement>, zone: HeyiZone) => {
    const bounds = sceneRef.current?.getBoundingClientRect();
    if (bounds) setPoint({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
    setActive(zone);
  };
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, [onClose]);
  const trend = snapshot.target > snapshot.value + 1 ? '↗' : snapshot.target < snapshot.value - 1 ? '↘' : '→';
  const trendText = trend === '↗' ? '缓慢回升' : trend === '↘' ? '持续下行' : '基本平稳';
  const gaugeColor = snapshot.value < 25 ? '#c56f63' : snapshot.value < 48 ? '#c4a079' : snapshot.value < 72 ? '#89c2c5' : '#a9d2b1';
  const toneColor = active ? snapshot.zones[active].tone === 'danger' ? '#d47870' : snapshot.zones[active].tone === 'strained' ? '#d2a77f' : snapshot.zones[active].tone === 'good' ? '#a8d3b0' : '#81c9d4' : '#81c9d4';
  return <section className="heyi-light-v2" role="region" aria-labelledby="heyi-light-title">
    <header className="heyi-light-v2__header">
      <div className="heyi-light-v2__title"><span>档案 / CAMPUS OBSERVATION</span><h2 id="heyi-light-title">合一之光</h2></div>
      <div className="heyi-light-v2__value" role="meter" aria-label="合一值" aria-valuemin={0} aria-valuemax={100} aria-valuenow={snapshot.value} aria-valuetext={snapshot.value + '，' + trendText} style={{ '--heyi-gauge': gaugeColor } as CSSProperties}>
        <div className="heyi-light-v2__readout"><span>合一值 <small>HE YI INDEX</small></span><strong>{snapshot.value.toString().padStart(2, '0')}</strong><div className="heyi-light-v2__trend"><b>{trend}</b><em>{trendText}</em></div></div>
        <div className="heyi-light-v2__instrument">
          <div className="heyi-light-v2__ticks">{Array.from({length: 21}, (_, i) => <i key={i} className={i % 5 === 0 ? 'major' : ''} />)}</div>
          <div className="heyi-light-v2__scale"><i style={{ width: snapshot.value + '%' }} /><b style={{ left: snapshot.value + '%' }} /><span style={{ left: snapshot.target + '%' }} title="长期趋向位置" /></div>
        </div>
      </div>
      <button type="button" className="heyi-light-v2__close" onClick={onClose} aria-label="关闭合一之光"><X size={18} /></button>
    </header>
    <div ref={sceneRef} className="heyi-light-v2__scene-wrap">
      <Scene snapshot={snapshot} month={state.date.getMonth()} viewBox={viewBox} active={active} onZone={onZone} onPointer={onPointer} />
      {active && <div className="heyi-light-v2__tooltip" role="status" style={{
        left: Math.min(point.x + 18, Math.max(8, (sceneRef.current?.clientWidth ?? 600) - 284)),
        top: Math.min(point.y + 18, Math.max(8, (sceneRef.current?.clientHeight ?? 400) - 118)),
        '--heyi-status': toneColor,
      } as CSSProperties}><span>观察 / {snapshot.zones[active].label} <b>{snapshot.zones[active].status}</b></span><p>{snapshot.zones[active].description}</p></div>}
      <div className="heyi-light-v2__stamp" aria-hidden="true">{state.date.getFullYear()} / {String(state.date.getMonth() + 1).padStart(2, '0')} / {String(state.date.getDate()).padStart(2, '0')}</div>
    </div>
  </section>;
}
