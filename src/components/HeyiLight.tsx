import { useEffect, useId, useState, type CSSProperties } from 'react';
import { X } from 'lucide-react';
import type { GameState } from '../types';
import { getHeyiLightSnapshot, type HeyiZone } from '../engine/heyiLight';
import './heyiLight.css';

interface HeyiLightProps {
  state: GameState;
  onClose: () => void;
}

const ZONES: Array<{ id: HeyiZone; x: number; y: number; width: number; height: number }> = [
  { id: 'sign', x: 440, y: 172, width: 325, height: 101 },
  { id: 'gate', x: 370, y: 420, width: 470, height: 160 },
  { id: 'building', x: 392, y: 310, width: 420, height: 108 },
  { id: 'students', x: 500, y: 555, width: 240, height: 112 },
  { id: 'teachers', x: 775, y: 540, width: 135, height: 112 },
  { id: 'road', x: 270, y: 667, width: 800, height: 90 },
  { id: 'trees', x: 72, y: 180, width: 240, height: 280 },
  { id: 'guard', x: 120, y: 385, width: 180, height: 190 },
];

function Figure({ x, y, scale = 1, teacher = false, accent = '#b5a891' }: { x: number; y: number; scale?: number; teacher?: boolean; accent?: string }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`} className="heyi-figure" aria-hidden="true">
    <ellipse cx="0" cy="2" rx="15" ry="3" fill="#080e10" opacity=".75" />
    <path d="M-4-30L-8-5M4-30L9-5" stroke="#121b20" strokeWidth="7" strokeLinecap="round" />
    <path d="M-8-48L8-48L11-27L-10-27Z" fill={teacher ? '#69757a' : '#304d56'} stroke={accent} strokeWidth="1.2" />
    {!teacher && <path d="M-7-46L7-46M-6-40L6-40" stroke="#b7c7bf" strokeWidth="1" opacity=".65" />}
    <path d="M-9-43L-18-26M10-43L19-28" stroke="#304149" strokeWidth="5" strokeLinecap="round" />
    {teacher && <rect x="15" y="-31" width="11" height="15" fill="#d4c9ad" stroke="#465159" />}
    {!teacher && <path d="M-13-44L-21-40L-19-27L-11-30Z" fill="#1b2b31" stroke={accent} strokeWidth=".8" />}
    <circle cx="0" cy="-57" r="8" fill="#a68f7c" />
    <path d="M-8-58Q-7-72 1-68Q10-67 8-56L6-63Q-1-59-8-58" fill="#151c1d" />
  </g>;
}

function GateScene({ snapshot, activeZone, setActiveZone }: {
  snapshot: ReturnType<typeof getHeyiLightSnapshot>;
  activeZone: HeyiZone | null;
  setActiveZone: (zone: HeyiZone | null) => void;
}) {
  const uid = useId().replace(/:/g, '');
  const id = (name: string) => `${name}-${uid}`;
  const { route, mood, value, accent } = snapshot;
  const riot = route === 'jidi_riot' || route === 'despair';
  const disciplined = route === 'jidi' || route === 'wu' || route === 'yang';
  const peaceful = route === 'democracy' && (value >= 60 || snapshot.democraticVictory);
  const dark = mood === 'ruin';
  const lights = Math.max(3, Math.round(value / 12));
  return <svg className={`heyi-scene heyi-scene--${route}`} viewBox="0 0 1200 760" role="img" aria-label={`合一之光：${snapshot.headline}`}>
    <defs>
      <linearGradient id={id('sky')} x2="0" y2="1">
        <stop stopColor={riot ? '#211016' : peaceful ? '#324d54' : '#0c1a22'} />
        <stop offset="1" stopColor={riot ? '#6a3026' : peaceful ? '#71847d' : '#38434a'} />
      </linearGradient>
      <linearGradient id={id('road')} x2="0" y2="1"><stop stopColor="#273137" /><stop offset="1" stopColor="#0c1116" /></linearGradient>
      <linearGradient id={id('brick')} x2="1" y2="1"><stop stopColor="#3c4141" /><stop offset=".6" stopColor="#1a2327" /><stop offset="1" stopColor="#0d171b" /></linearGradient>
      <pattern id={id('hatch')} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(43)"><path d="M0 0V7" stroke="#cad2c9" strokeOpacity=".08" strokeWidth="2" /></pattern>
      <pattern id={id('tile')} width="50" height="25" patternUnits="userSpaceOnUse"><path d="M0 25H50M25 0V25" stroke="#758184" strokeOpacity=".18" fill="none" /></pattern>
      <filter id={id('glow')}><feGaussianBlur stdDeviation="8" /></filter>
      <radialGradient id={id('vignette')}><stop offset=".55" stopColor="transparent" /><stop offset="1" stopColor="#030609" stopOpacity=".8" /></radialGradient>
    </defs>

    <rect width="1200" height="760" fill={`url(#${id('sky')})`} />
    <path d="M0 0H1200V340Q900 290 680 315Q350 260 0 355Z" fill="#0c1518" opacity=".32" />
    {riot && <g className="heyi-fire-glow"><ellipse cx="635" cy="324" rx="210" ry="145" fill="#e75d32" opacity=".4" filter={`url(#${id('glow')})`} /><path d="M400 410Q435 340 470 370Q480 335 515 365Q548 290 579 360Q617 306 651 347Q690 308 724 365Q760 327 808 400Z" fill="#d55230" opacity=".85" /><path d="M420 408Q470 355 505 400Q540 327 580 390Q632 333 677 395Q726 350 785 403Z" fill="#f1a350" opacity=".8" /></g>}
    {peaceful && <path d="M0 221Q300 120 600 172T1200 158" stroke="#efcc8c" strokeWidth="23" opacity=".1" fill="none" />}

    <g className="heyi-building">
      <path d="M345 152L795 140L830 172V474H330V172Z" fill={`url(#${id('brick')})`} stroke="#7a8583" strokeWidth="2" />
      <path d="M345 152L795 140L830 172H330Z" fill="#4b5553" stroke="#a9afa3" />
      <rect x="330" y="171" width="500" height="303" fill={`url(#${id('tile')})`} />
      {[0,1,2,3].map(floor => <g key={floor}>
        <path d={`M330 ${237 + floor * 72}H830`} stroke="#778585" strokeWidth="4" />
        {Array.from({ length: 8 }, (_, index) => <g key={index}>
          <rect x={356 + index * 58} y={183 + floor * 72} width="39" height="41" fill={index + floor * 8 < lights * 3 ? '#849d94' : '#101a20'} stroke="#687a78" strokeWidth="2" />
          <path d={`M${375 + index * 58} ${183 + floor * 72}V${224 + floor * 72}`} stroke="#203136" strokeWidth="1.5" />
        </g>)}
      </g>)}
      {route === 'jidi' && <g><rect x="405" y="253" width="346" height="47" fill="#111b20" stroke="#b49a68" /><text x="578" y="284" textAnchor="middle" fill="#dfc798" fontSize="22" letterSpacing="4">今日升学榜 · {Math.round(value * .7 + 39)}%</text></g>}
      {route === 'revolution' && <path d="M560 170H659L644 281L595 254L560 280Z" fill="#a64038" stroke="#d89477" strokeWidth="2" />}
      {route === 'revolution' && <g><rect x="435" y="264" width="293" height="49" fill="#452d2b" stroke="#bc7463" strokeWidth="2" /><text x="581" y="296" textAnchor="middle" fill="#e4b9a1" fontSize="21" letterSpacing="3">题海之外 · 课程革命</text></g>}
      {route === 'democracy' && <g><rect x="439" y="245" width="284" height="51" fill="#243c39" stroke="#aac7a8" /><text x="581" y="277" textAnchor="middle" fill="#d8e6ca" fontSize="22" letterSpacing="5">学生代表议事厅</text></g>}
      {peaceful && <g><path d="M332 215Q578 294 828 208" fill="none" stroke="#e3c895" strokeWidth="3" />{[390,447,505,563,621,679,737,795].map((x, i) => <path key={x} d={`M${x} ${234 + Math.sin(i) * 13}l16 8-12 24Z`} fill={i % 2 ? '#a9c8aa' : '#d0aa79'} />)}<text x="582" y="349" textAnchor="middle" fill="#dfe7d3" fontSize="20" letterSpacing="3">选举结果公告 · 学生共治</text></g>}
      {route === 'reform' && <g><rect x="426" y="254" width="310" height="48" fill="#344536" stroke="#b8c28d" strokeWidth="2" /><text x="581" y="284" textAnchor="middle" fill="#e0dfb3" fontSize="21" letterSpacing="2">新课程试行 · 社团开放</text><path d="M371 406q24-39 48 0q24-39 48 0" fill="none" stroke="#89a87e" strokeWidth="5" /></g>}
      {route === 'haobang' && <g><rect x="437" y="242" width="289" height="60" fill="#302d2a" stroke="#bb946f" strokeWidth="3" /><text x="581" y="267" textAnchor="middle" fill="#d6b38c" fontSize="18" letterSpacing="3">联席议事 · 校内公报</text><path d="M466 283H695" stroke="#b1816e" strokeWidth="2" /><text x="581" y="295" textAnchor="middle" fill="#aeb7ad" fontSize="11">ASSEMBLY / COMPROMISE</text></g>}
      {route === 'opening' && <g><circle cx="582" cy="272" r="24" fill="#19262a" stroke="#a3b3aa" strokeWidth="3" /><path d="M582 272v-16m0 16 10 6" stroke="#ded6be" strokeWidth="3" /></g>}
      {route === 'gouxiong' && <g><rect x="438" y="245" width="285" height="53" fill="#493c50" stroke="#d3a6d0" /><text x="581" y="280" textAnchor="middle" fill="#ebcfec" fontSize="27">✦ 今日也要好好上学 ✦</text></g>}
      {route === 'yang' && <rect x="745" y="181" width="36" height="40" fill="#ecc38b" opacity=".9" />}
      {route === 'wu' && <g><circle cx="582" cy="159" r="8" fill="#8eabb0" /><path d="M582 167V195M582 176L567 187M582 176L598 187" stroke="#8eabb0" strokeWidth="3" /></g>}
      {route === 'jidi_riot' && <g><path d="M453 104Q416 66 443 17M603 106Q569 49 598 5M725 110Q750 51 723 11" stroke="#a0988d" strokeWidth="21" strokeLinecap="round" opacity=".27" fill="none" /><rect x="489" y="263" width="187" height="43" fill="#1d1c1d" stroke="#bd6949" /><text x="582" y="291" textAnchor="middle" fill="#d4825b" fontSize="20">系统故障</text></g>}
      {riot && <path d="M409 381l28-18 18 22 30-14m142-50 16-29 18 23 14-17m-80 78 22-19 17 28" stroke="#c8aa95" strokeWidth="3" fill="none" />}
      <path d="M330 474H830" stroke="#bcc8b8" strokeWidth="5" />
    </g>

    <g className="heyi-trees">
      {[110,245,930,1080].map((x, index) => <g key={x}>
        <path d={`M${x} 487Q${x-16} 420 ${x-9} 363M${x} 487Q${x+12} 419 ${x+18} 341`} stroke="#413d36" strokeWidth="13" fill="none" />
        <path d={`M${x-9} 392Q${x-89} 389 ${x-70} 317M${x+13} 377Q${x+90} 360 ${x+74} 299`} stroke="#413d36" strokeWidth="6" fill="none" />
        <path d={`M${x-74} 350Q${x-108} 301 ${x-70} 256Q${x-72} 210 ${x-16} 211Q${x+39} 185 ${x+60} 249Q${x+109} 263 ${x+86} 335Q${x+35} 359 ${x-74} 350Z`} fill={riot ? '#302e2d' : value > 65 ? '#415a45' : '#293c39'} stroke={riot ? '#885244' : '#718575'} strokeWidth="2" opacity={riot ? .85 : .95} />
        <path d={`M${x-58} 327Q${x} 273 ${x+50} 318M${x-42} 267Q${x} 298 ${x+43} 252`} stroke="#91a390" strokeOpacity=".28" fill="none" />
        {index === 1 && route === 'gouxiong' && <path d={`M${x+42} 325l12 20 16-14`} stroke="#e5a7d5" strokeWidth="6" fill="none" />}
      </g>)}
    </g>

    <g className="heyi-gatehouse">
      <rect x="119" y="408" width="169" height="158" fill="#202b2d" stroke="#859697" strokeWidth="2" />
      <rect x="119" y="408" width="169" height="158" fill={`url(#${id('tile')})`} />
      <path d="M106 407L118 386H283L301 408Z" fill="#344042" stroke="#a4b0a9" strokeWidth="2" />
      <rect x="136" y="430" width="91" height="70" fill="#384e52" stroke="#90a6a4" strokeWidth="2" />
      <path d="M182 430V500" stroke="#83958e" strokeWidth="2" />
      <rect x="236" y="447" width="39" height="70" fill="#122029" stroke="#6f8180" />
      <path d="M119 565H287" stroke="#c2b394" strokeWidth="5" />
      <rect x="941" y="415" width="150" height="150" fill="#263134" stroke="#859697" strokeWidth="2" />
      <rect x="958" y="437" width="115" height="53" fill="#30484d" stroke="#8ca2a0" strokeWidth="2" />
    </g>

    <g className="heyi-monument">
      <rect x="296" y="168" width="93" height="397" fill="#192a2c" stroke="#86a09c" strokeWidth="3" />
      <rect x="810" y="168" width="93" height="397" fill="#192a2c" stroke="#86a09c" strokeWidth="3" />
      {[311,825].map(x => <g key={x}><rect x={x} y="182" width="63" height="370" fill="#2f5356" stroke="#91b6ae" /><path d={`M${x + 16} 182V552M${x + 35} 182V552`} stroke="#81b6b5" opacity=".48" /></g>)}
      <path d="M284 166L305 145H894L916 166Z" fill="#263234" stroke="#adbbb3" strokeWidth="3" />
      <rect x="284" y="165" width="632" height="111" fill="#293537" stroke="#9ea9a0" strokeWidth="3" />
      <rect x="284" y="165" width="632" height="111" fill={`url(#${id('tile')})`} />
      <text x="600" y="241" textAnchor="middle" fill={riot ? '#e8b0a0' : '#d7bba5'} fontFamily="SimSun, Songti SC, serif" fontSize="68" letterSpacing="23" stroke="#712f2b" strokeWidth="1.5" paintOrder="stroke">合肥一中</text>
      <path d="M290 276H910" stroke="#b7beb1" strokeWidth="6" />
      <path d="M300 286H900" stroke="#516569" strokeWidth="3" />
      {route === 'democracy' && <path d="M540 272v46l61-17 62 17v-46" fill="#718c80" stroke="#c8d9b7" />}
      {route === 'revolution' && <path d="M342 278l12 80 18-30 22 28 13-78" fill="#a44942" stroke="#d07866" />}
      {route === 'jidi' && <rect x="436" y="283" width="330" height="26" fill="#a58e64" opacity=".8" />}
      {route === 'wu' && <path d="M301 278H898V294H301Z" fill="#48545c" />}
      {route === 'haobang' && <g><path d="M903 287v82l-26-13-27 13v-82" fill="#9e3e36" stroke="#d59c78" strokeWidth="2" /><text x="876" y="332" textAnchor="middle" fill="#ead8b9" fontSize="18">联</text></g>}
      {route === 'reform' && <g><path d="M294 282v75l23-13 22 13v-75" fill="#647b5e" stroke="#b5c7a8" strokeWidth="2" /><text x="317" y="325" textAnchor="middle" fill="#e3e8c8" fontSize="17">改</text></g>}
    </g>

    <g className="heyi-fence" stroke={riot ? '#8b716a' : '#6f8988'}>
      <path d="M389 475H810M389 563H810" strokeWidth="5" />
      {Array.from({ length: 30 }, (_, i) => <g key={i}><path d={`M${392 + i * 14} 478V561`} strokeWidth="2" /><path d={`M${392 + i * 14} 487L${406 + i * 14} 548M${406 + i * 14} 487L${392 + i * 14} 548`} strokeWidth="1" /></g>)}
      {riot && <path d="M470 479l44 50-30 34M516 479l-25 39" stroke="#d3b4a2" strokeWidth="4" fill="none" />}
    </g>
    {dark && <g className="heyi-decay" fill="none"><path d="M305 351l18 10-8 21 17 11M859 381l-17 18 13 14M410 558l32-17 25 18" stroke="#b57d69" strokeWidth="3" opacity=".75" /><path d="M196 563l7-22 6 23m4-1 6-16 8 16M955 564l4-15 7 17" stroke="#60705f" strokeWidth="2" /></g>}
    {mood === 'bright' && !riot && <g><path d="M137 566q9-39 16 0m9 0q11-31 15 0m829-2q10-37 16 0" stroke="#75966d" strokeWidth="3" fill="none" /><circle cx="154" cy="535" r="5" fill="#d1a07c" /><circle cx="177" cy="541" r="4" fill="#d3c290" /><circle cx="1024" cy="536" r="5" fill="#cda787" /></g>}

    <path d="M0 566H1200V760H0Z" fill={`url(#${id('road')})`} />
    <path d="M0 571H1200" stroke="#bbc4b6" strokeWidth="8" opacity=".64" />
    <path d="M0 587H1200M0 742H1200" stroke="#7f8b87" strokeWidth="2" opacity=".55" />
    {[75,235,395,555,715,875,1035].map(x => <path key={x} d={`M${x} 660h75l28 61h-95Z`} fill="#abb7b0" opacity={riot ? .25 : .4} />)}
    <path d="M0 632H1200" stroke="#d1bb78" strokeDasharray="26 18" strokeWidth="2" opacity=".46" />
    {riot && <g><path d="M500 618l41-8 40 16-21 8-49-7Z" fill="#d6cab9" opacity=".8" /><path d="M846 613l55 17-49 6Z" fill="#d6cab9" opacity=".7" /></g>}
    {peaceful && <g className="heyi-confetti"><circle cx="487" cy="518" r="3" fill="#edd096" /><circle cx="723" cy="603" r="4" fill="#bed9af" /><circle cx="856" cy="513" r="3" fill="#d9bd9e" /></g>}
    {peaceful && <g><path d="M93 585q100-39 201 0m630-3q87-44 193 0" stroke="#e2c999" strokeWidth="2" fill="none" /><path d="M181 582l27 19 28-20m720 0 25 22 30-22" fill="#92b69b" stroke="#d3d4b0" strokeWidth="2" /><circle cx="360" cy="603" r="3" fill="#ebcf9c" /><circle cx="910" cy="619" r="3" fill="#dbbd9e" /><circle cx="774" cy="537" r="3" fill="#b0d0a4" /></g>}
    {route === 'haobang' && <g><rect x="897" y="577" width="115" height="67" fill="#292a29" stroke="#a78f74" strokeWidth="2" /><text x="954" y="601" textAnchor="middle" fill="#d2bc9c" fontSize="14">议事公告</text><path d="M915 613h80m-80 10h65m-65 10h73" stroke="#a99986" strokeWidth="2" /></g>}
    {route === 'reform' && <g><rect x="953" y="582" width="129" height="64" fill="#2a3b32" stroke="#93a984" strokeWidth="2" /><text x="1017" y="610" textAnchor="middle" fill="#e0e5c7" fontSize="15">社团招新</text><path d="M975 625h88" stroke="#c1c7aa" strokeWidth="2" /></g>}

    <Figure x={504} y={621} scale={1.05} accent={accent} />
    <Figure x={556} y={642} scale={1.18} accent={accent} />
    <Figure x={685} y={626} scale={1.02} accent={accent} />
    <Figure x={790} y={626} scale={1.17} teacher accent={accent} />
    {!disciplined && <Figure x={636} y={662} scale={1.23} accent={accent} />}
    {disciplined && <Figure x={702} y={658} scale={1.04} accent={accent} />}
    {riot && <path d="M581 621l17-20 20 16m-54 38 28-16" stroke="#d47856" strokeWidth="4" fill="none" />}

    <rect width="1200" height="760" fill={`url(#${id('vignette')})`} pointerEvents="none" />
    <g className="heyi-hotspots">
      {ZONES.map(zone => <g key={zone.id} role="button" tabIndex={0} aria-label={`查看${snapshot.zones[zone.id].label}：${snapshot.zones[zone.id].description}`}
        onMouseEnter={() => setActiveZone(zone.id)} onMouseLeave={() => setActiveZone(null)} onFocus={() => setActiveZone(zone.id)} onBlur={() => setActiveZone(null)}
        onClick={() => setActiveZone(zone.id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActiveZone(zone.id); } }}>
        <rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} fill="transparent" stroke={activeZone === zone.id ? accent : 'transparent'} strokeWidth="2" strokeDasharray="8 4" />
      </g>)}
    </g>
  </svg>;
}

export default function HeyiLight({ state, onClose }: HeyiLightProps) {
  const snapshot = getHeyiLightSnapshot(state);
  const [activeZone, setActiveZone] = useState<HeyiZone | null>(null);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);
  return <div className="heyi-light-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="heyi-light" role="dialog" aria-modal="true" aria-labelledby="heyi-light-title" style={{ '--heyi-accent': snapshot.accent } as CSSProperties}>
      <header className="heyi-light__header">
        <div><span className="heyi-light__eyebrow">CAMPUS OBSERVATORY / 合一之光</span><h2 id="heyi-light-title">校门口的一天</h2></div>
        <button type="button" className="heyi-light__close" onClick={onClose} aria-label="关闭合一之光"><X size={22} /></button>
      </header>
      <div className="heyi-light__body">
        <div className="heyi-light__scene-frame"><GateScene snapshot={snapshot} activeZone={activeZone} setActiveZone={setActiveZone} />
          <div className="heyi-light__scene-caption"><span>合肥一中 · 滨湖校区</span><span>将鼠标移到画面上，观察此刻的校园</span></div>
        </div>
        <aside className="heyi-light__ledger" aria-live="polite">
          <div className="heyi-light__index"><span>合一值</span><strong>{snapshot.value}<small> / 100</small></strong></div>
          <div className="heyi-light__meter"><i style={{ width: `${snapshot.value}%` }} /></div>
          <p className="heyi-light__trend">学校的变化会慢慢积累。当前趋势：{snapshot.target > snapshot.value + 1 ? '回升' : snapshot.target < snapshot.value - 1 ? '下行' : '平稳'}</p>
          <div className="heyi-light__observation"><span>{activeZone ? `观测 / ${snapshot.zones[activeZone].label}` : '观测 / 全景'}</span>
            <h3>{activeZone ? snapshot.zones[activeZone].label : snapshot.headline}</h3>
            <p>{activeZone ? snapshot.zones[activeZone].description : snapshot.overview}</p>
          </div>
          <div className="heyi-light__zones" aria-label="可观察区域">
            {ZONES.map(zone => <button key={zone.id} type="button" className={activeZone === zone.id ? 'is-active' : ''}
              onMouseEnter={() => setActiveZone(zone.id)} onMouseLeave={() => setActiveZone(null)} onFocus={() => setActiveZone(zone.id)}
              onClick={() => setActiveZone(zone.id)}>{snapshot.zones[zone.id].label}</button>)}
          </div>
        </aside>
      </div>
      <footer className="heyi-light__footer"><span>照片不会记下每一句话。把光标停在某处，听那里的人说。</span><span>{state.date.getFullYear()} · {String(state.date.getMonth() + 1).padStart(2, '0')} · {String(state.date.getDate()).padStart(2, '0')}</span></footer>
    </section>
  </div>;
}
