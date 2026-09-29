import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { X } from 'lucide-react';
import type { GameState } from '../types';
import { getHeyiLightSnapshot, type HeyiZone } from '../engine/heyiLight';
import './heyiLight.css';

interface Props { state: GameState; onClose: () => void }
type Snapshot = ReturnType<typeof getHeyiLightSnapshot>;
type Point = { x: number; y: number };
const HOTSPOTS: { id: HeyiZone; path: string; anchor: Point }[] = [
  { id: 'building', path: 'M58 55L1050 47V385L791 396V305L366 310V405L58 390Z', anchor: {x: 600, y: 160} },
  { id: 'sign', path: 'M365 230H792V306L365 311Z', anchor: {x: 590, y: 270} },
  { id: 'gate', path: 'M365 311L792 305V500L365 529Z', anchor: {x: 590, y: 410} },
  { id: 'guard', path: 'M65 355L318 349L338 379V522L65 541Z', anchor: {x: 185, y: 430} },
  { id: 'trees', path: 'M1007 292Q999 251 1040 212Q1037 167 1080 170Q1102 133 1138 160Q1172 151 1184 192Q1214 223 1188 267Q1178 296 1133 299Q1097 317 1064 302Q1036 312 1007 292ZM1084 298L1105 301L1090 461L1081 461Z', anchor: {x: 1100, y: 270} },
  { id: 'teachers', path: 'M858 468Q865 459 875 460Q888 462 889 477L901 493L904 546L890 556L882 533L872 558L850 557L844 506L854 487Z', anchor: {x: 875, y: 500} },
  { id: 'students', path: 'M449 498Q463 483 477 498L488 518L501 526L502 571L491 591L473 589L466 563L456 591L437 589L435 536Z M534 509Q550 492 565 508L578 528L589 538L590 579L578 601L560 599L552 572L542 600L522 597L521 545Z M636 503Q651 488 667 504L679 524L690 534L692 575L680 597L662 595L654 569L645 596L624 593L623 540Z', anchor: {x: 570, y: 540} },
  { id: 'road', path: 'M-500 565L0 506L364 507L450 535L753 515L1200 497L1700 565V700H-500Z', anchor: {x: 700, y: 615} },
];
const MARKS: Record<Snapshot['route'], [string, string]> = {
  opening: ['校务公告', '值日 / 课表 / 校历'],
  democracy: ['学生代表大会', '议程公开 · 等待表决'],
  revolution: ['临时委员会', '课程与食堂公开讨论'],
  despair: ['暂停对外开放', '告示张贴后无人落款'],
  reform: ['新课程试行', '社团教室申请开放'],
  haobang: ['联席会议公报', '各方签名尚未齐全'],
  yang: ['教师工作安排', '办公室的灯还亮着'],
  jidi: ['本周升学指标', '统计口径 / 排名 / 公示'],
  jidi_riot: ['系统暂停运行', '公告栏玻璃已经碎了'],
  gouxiong: ['校内活动通知', '礼堂节目单又改了一遍'],
  wu: ['通行登记制度', '请出示证件并依次入校'],
};
function Person({ x, y, teacher = false, tired = false, stride = 0 }: { x: number; y: number; teacher?: boolean; tired?: boolean; stride?: number }) {
  const accent = teacher ? '#adc7bb' : '#8bbfbe';
  return <g transform={'translate(' + x + ' ' + y + ')'} className={'heyi-person ' + (stride ? 'heyi-person--walking' : 'heyi-person--standing')} style={{ animationDelay: '-' + (stride * 1.13) + 's' }}>
    <ellipse cx="2" cy="27" rx="24" ry="4" fill="#111d22" opacity=".8" stroke="none" />
    <g transform={tired ? 'rotate(7 0 -20)' : undefined}>
      <path d={stride % 2 ? 'M-8-3L-15 23L-8 25L2 4M7-2L14 18L20 21L15 25L6 22L-1 6' : 'M-8-3L-13 19L-19 22L-15 26L-8 24L1 4M7-2L11 24L18 25L19 21L15 19L15-1'} fill="#0b1b20" stroke={accent} strokeWidth="1.45" strokeLinejoin="round" />
      <path d="M-17 25l12 1m19-1 10 1" stroke="#c1d1c9" strokeWidth="1.8" />
      <path d="M-12-38Q0-43 12-37L13-4Q0 1-13-4Z" fill={teacher ? '#142b30' : '#112a31'} stroke={accent} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M-10-36L-5-12H6L11-36M-12-19h25M-8-9h16" fill="none" stroke="#477a83" strokeWidth=".8" />
      {teacher ? <g><path d="M-8-39L0-25L8-39M-6-26L0-20L5-26" fill="#13232a" stroke="#d6d6c4" strokeWidth="1.25" /><path d="M2-25v14" stroke="#ab9c87" strokeWidth="1.2" /></g> : <g><path d="M-7-38L0-29L7-38" fill="none" stroke="#e1e3d6" strokeWidth="1.25" /><path d="M-10-31l-6 6v23l10 2" fill="none" stroke="#6d9ca3" strokeWidth="1.2" /><path d="M-8-19h16" stroke="#acc9c3" strokeWidth=".8" /></g>}
      <path d={tired ? 'M-12-34L-24-13L-20-8L-7-20M12-34L19-13L15-8L8-21' : 'M-12-34L-20-15L-17-5L-12-7L-15-16L-6-26M12-34L19-14L24-9L20-6L12-15L7-26'} fill="#0b2027" stroke={accent} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M-22-8l5 3m33-3 5 3" stroke="#d0c9ae" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M-3-42v-7h7v7" fill="#18282b" stroke="#b1bcb1" strokeWidth="1.1" />
      <path d="M-9-54Q-7-64 0-64Q9-63 10-53L8-44Q0-39-8-45Z" fill="#102126" stroke="#bad0c5" strokeWidth="1.45" />
      <path d="M-9-54Q-13-65-5-69Q3-72 10-64L12-55Q6-60-2-60Q-5-55-9-54Z" fill="#071419" stroke="#a0bbb9" strokeWidth="1.2" />
      <path d="M-4-50l2 1m6-1 2 1M-2-44q3 1 6 0" stroke="#b9baae" strokeWidth=".8" />
      {teacher ? <g><path d="M17-7h17v24H17Z" fill="#0d2026" stroke="#c7ccb9" strokeWidth="1.35" /><path d="M21-7v-4h10v4M20 0h11m-11 5h8" stroke="#8faeaa" strokeWidth="1" /></g> : <g><path d="M-14-34L-31-29L-27 1L-13 2Z" fill="#0b1b22" stroke="#8cb2b3" strokeWidth="1.5" /><path d="M-27-26l14-1m-13 10 12-2m-10 11 11-2" stroke="#3f7884" strokeWidth=".9" /><path d="M-15-29l5 5" stroke="#d5c6a5" strokeWidth="1.2" /></g>}
      {stride === 2 && <g><path d="M19-6l13-5 5 18-16 3Z" fill="#192a2d" stroke="#c0cbbd" strokeWidth="1.2" /><path d="M22-3l10-3m-9 7 10-3m-9 7 10-3" stroke="#8fa8a8" strokeWidth=".8" /></g>}
    </g>
  </g>;
}
function ClassroomWindow({ x, y, lit, cracked, index }: { x: number; y: number; lit: boolean; cracked: boolean; index: number }) {
  const frame = 'M' + x + ' ' + y + 'h51v61h-51Z';
  return <g className="heyi-window">
    <path d={'M' + (x - 7) + ' ' + (y - 8) + 'h65v75h-65Z'} fill="#06171c" stroke="#5f8f98" strokeWidth="1" />
    <path d={frame} fill={lit ? '#0c242a' : '#030e13'} stroke="#bed3d2" strokeWidth="1.6" />
    <g className={lit ? 'heyi-window__light' : ''} style={{ animationDelay: '-' + ((index % 7) * 1.7) + 's' }}>
      {lit && <path d={'M' + (x + 2) + ' ' + (y + 3) + 'h47v54h-47Z'} fill={index % 4 === 0 ? '#244047' : '#18363a'} opacity=".52" />}
      {lit && <path d={'M' + (x + 4) + ' ' + (y + 5) + 'h42'} stroke="#bbd5cc" strokeWidth="1.2" opacity=".72" />}
    </g>
    <path d={'M' + (x + 25) + ' ' + y + 'v61M' + x + ' ' + (y + 31) + 'h51M' + (x - 5) + ' ' + (y + 65) + 'h61'} fill="none" stroke="#a2c5c6" strokeWidth="1.3" />
    <path d={'M' + (x + 3) + ' ' + (y + 5) + 'l17 16m19-13 8 10'} stroke="#79a7a9" strokeWidth=".7" opacity=".6" />
    {lit && <g fill="none" stroke="#89a8a5" strokeWidth=".8">
      <path d={'M' + (x + 5) + ' ' + (y + 49) + 'h17l2 10m6-10h16l1 10'} />
      <path d={'M' + (x + 9) + ' ' + (y + 45) + 'v-5h8v5m18-4 7-4v8'} />
    </g>}
    {index % 5 === 0 && <g><path d={'M' + (x + 13) + ' ' + (y + 71) + 'h25v13h-25Z'} fill="#092026" stroke="#96b1b1" strokeWidth="1" /><circle cx={x + 26} cy={y + 77} r="4" fill="none" stroke="#7d9e9f" strokeWidth=".9" /><path d={'M' + (x + 11) + ' ' + (y + 70) + 'h29'} stroke="#c4cfca" strokeWidth="1" /></g>}
    {index % 6 === 2 && <path d={'M' + (x + 4) + ' ' + (y + 5) + 'v48m43-48v48'} stroke="#647e82" strokeWidth="2.5" opacity=".6" />}
    {cracked && <path d={'M' + x + ' ' + y + 'l21 31-7 21m7-21 28 30'} fill="none" stroke="#d1856c" strokeWidth="2" />}
  </g>;
}
function Scene({ snapshot, month, viewBox, active, onZone, onPointer }: {
  snapshot: Snapshot; month: number; viewBox: string; active: HeyiZone | null;
  onZone: (zone: HeyiZone | null, anchor?: Point) => void;
  onPointer: (event: PointerEvent<SVGPathElement>, zone: HeyiZone) => void;
}) {
  const { route, mood, value } = snapshot;
  const unrest = route === 'jidi_riot' || route === 'despair';
  const lit = Math.max(2, Math.round(value / 11));
  const autumn = month >= 8 && month <= 10;
  const winter = month === 11 || month <= 1;
  return <svg className="heyi-light-v2__scene" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" role="img" aria-label={'合肥一中校门：' + snapshot.headline}>
    <defs><pattern id="heyi-brick" width="30" height="18" patternUnits="userSpaceOnUse"><path d="M0 0H30M0 9H30M15 0V9M0 9v9" fill="none" stroke="#29505a" strokeWidth=".7" /></pattern></defs>
    <rect x="-500" width="2200" height="700" fill="#020b10" />
    <g className="heyi-side-street">
      <path d="M-500 120L58 55V390L-500 488Z" fill="#051319" stroke="#78a7ad" strokeWidth="1.4" />
      <path d="M-500 140L58 75M-500 259L58 202M-500 378L58 329" stroke="#4b818c" strokeWidth="1.1" />
      {Array.from({length: 7}, (_, i) => <g key={i}><path d={'M' + (-465 + i * 70) + ' ' + (197 - i * 11) + 'l43-6v64l-43 6Z'} fill="#071c23" stroke="#9dbdc0" strokeWidth="1.2" /><path d={'M' + (-444 + i * 70) + ' ' + (194 - i * 11) + 'v64m-21-31 43-6'} stroke="#789fa4" strokeWidth=".8" /></g>)}
      <path d="M-478 344l196-24v57l-196 31Z" fill="#092027" stroke="#b6cec8" strokeWidth="1.5" />
      <text x="-382" y="366" fill="#bfcfc5" textAnchor="middle" fontSize="22" letterSpacing="4">LIBRARY · 图书馆</text>
      <path d="M1050 47L1700 127V465L1050 385Z" fill="#06151b" stroke="#789fae" strokeWidth="1.5" />
      <path d="M1050 74l650 71M1050 177l650 82M1050 281l650 87" stroke="#487b86" strokeWidth="1" />
      {[0,1,2,3,4,5].map(i => <g key={i}><path d={'M' + (1090+i*94) + ' ' + (124+i*9) + 'l54 5v65l-54-5Z'} fill="#0b2329" stroke="#afc7c4" strokeWidth="1.3" /><path d={'M' + (1117+i*94) + ' ' + (127+i*9) + 'v64m-27-36 54 5'} stroke="#7aa5a9" strokeWidth=".9" /></g>)}
      <path d="M1245 334l270 31v73l-270-28Z" fill="#0b2025" stroke="#b7cac4" strokeWidth="1.5" />
      <text x="1379" y="390" textAnchor="middle" fill="#bccdc2" fontSize="26" letterSpacing="4">滨湖街区</text>
      <path d="M-500 488L0 419V514L-500 563ZM1200 418l500 47v100l-500-65Z" fill="#061319" stroke="#467581" />
    </g>
    <path d="M0 70L58 55V390L0 419ZM58 55L1050 47V385L791 396L366 405L58 390Z" fill="#07151a" stroke="#8eb9bf" strokeWidth="1.5" />
    <path d="M58 55L1050 47M58 67L1050 59M58 155L1050 146M58 267L1050 254M58 378L1050 368M1050 47V385" fill="none" stroke="#58a4ad" strokeWidth="1.25" />
    <path d="M58 55L1050 47V385L58 390Z" fill="url(#heyi-brick)" opacity=".6" />
    {Array.from({length: 11}, (_, i) => [0, 1, 2].map(floor => {
      const x = 82 + i * 86, y = 95 + floor * 100 - i;
      const light = (i + floor * 3) % 11 < lit;
      return <g key={i + '-' + floor}><ClassroomWindow x={x} y={y} lit={light} cracked={unrest && i === 5 && floor === 1} index={i + floor * 11} /></g>;
    }))}
    <g className="heyi-facade" fill="none">
      <path d="M59 54L1049 45L1063 53L58 64M58 83L1050 73M58 185L1050 175M58 285L1050 274M58 382L1050 372" stroke="#afcecd" strokeWidth="2" />
      <path d="M58 88L1050 78M58 190L1050 180M58 289L1050 279M58 387L1050 377" stroke="#35656e" strokeWidth="3" />
      {[66, 152, 238, 324, 410, 496, 582, 668, 754, 840, 926, 1012].map(x => <g key={x}><path d={'M' + x + ' 76v310'} stroke="#2c5e67" strokeWidth="3" /><path d={'M' + (x + 4) + ' 76v310'} stroke="#779b9f" strokeWidth=".8" /></g>)}
      <path d="M1050 48l-17 7v330l17 2M1041 50v332M69 73l-8 6v303" stroke="#adc6c3" strokeWidth="1.2" />
      <path d="M112 72l18-4v-19h18v16l47-2v-20h16v17M887 59v-27h37v26M921 32l15 10" stroke="#8fb7b8" strokeWidth="1.4" />
      <path d="M235 81l-3 306m3-200-3 7m3 93-3 7M840 70l-4 310" stroke="#70979b" strokeWidth="1.1" />
      <path d="M85 381h948M87 391h942" stroke="#acc8c6" strokeWidth="1.4" />
    </g>
    <g fill="none" stroke="#4c7981" strokeWidth=".7" opacity=".8">
      {Array.from({length: 13}, (_, i) => <path key={i} d={'M' + (79 + i * 77) + ' 77l4 308'} />)}
      <path d="M58 141l992-11M58 246l992-10M58 347l992-10" />
    </g>
    {route === 'democracy' && <g fill="none" stroke="#a8c6b7" strokeWidth="2"><path d="M388 181Q576 212 781 174M404 179l9 24 19-18m54 7 11 25 18-19m58 2 10 25 19-22m63-3 10 22 18-20" /><path d="M102 351h220M109 357h205" /></g>}
    {route === 'revolution' && <g><path d="M550 60v142m1-139 78 15-74 36Z" fill="#402126" stroke="#cf8070" strokeWidth="2" /><path d="M223 168l110-2v59l-110 1Z" fill="#25191c" stroke="#b8645b" /><path d="M243 180h71m-71 11h54m-54 11h64" stroke="#c08b7c" strokeWidth="2" /></g>}
    {route === 'jidi' && <g><path d="M744 169l250-3v53l-250 4Z" fill="#191912" stroke="#b5a578" strokeWidth="2" /><path d="M760 181h217m-217 13h190m-190 13h203" stroke="#a79871" strokeWidth="2" /></g>}
    {route === 'jidi_riot' && <g fill="none" stroke="#bd7866" strokeWidth="2"><path d="M139 340l39-30 28 27 33-19m537-5-23 25 9 22-19 18M860 311l14-36 24 18 13-27" /><path d="M107 407l28-15 30 14m510 19 45-24 25 9" /></g>}
    {route === 'wu' && <g><path d="M246 65l49-3v85l-49 1Z" fill="#121f28" stroke="#a4b8bd" strokeWidth="2" /><path d="M258 79h24m-24 10h24m-24 10h24" stroke="#8fa9ae" /><path d="M1040 72l-33 7-15 24 31-5Z" fill="#9eacae" stroke="#c4d2ce" /></g>}
    {route === 'haobang' && <g><path d="M111 170l150-3v46l-150 3Z" fill="#211819" stroke="#a7796d" strokeWidth="2" /><path d="M124 182h123m-123 10h107m-107 10h116" stroke="#bc9985" strokeWidth="1.5" /></g>}
    {route === 'reform' && <g fill="none" stroke="#91b49e" strokeWidth="2"><path d="M895 71q-32 21-6 46q25-21 6-46Zm33 12q-17 25 7 38q17-26-7-38Z" /><path d="M137 331l130-2m-126 10 99-2" /></g>}
    {route === 'gouxiong' && <g fill="none" stroke="#b7a1bd" strokeWidth="2"><path d="M872 222q28-26 51-1q21-19 39 4m-101 12h113" /><path d="M159 371l38-15 26 18 37-19" /></g>}
    {route === 'despair' && <g fill="none" stroke="#8b8581" strokeWidth="3"><path d="M139 329l27-26m-16 23 31-27M830 328l30-26m-22 29 34-32M64 386l29 13m677-16 24 18" /></g>}
    {mood === 'bright' && <g fill="none" stroke="#a8c8ad" strokeWidth="1.5"><path d="M198 408q13-21 26 0m10 0q12-17 23 0M1015 412q16-20 28 0" /><path d="M160 535l12-17 11 18m15-5 8-12 10 12" /></g>}
    <path d="M0 419L58 390L365 405V527L0 514ZM791 396L1050 385L1200 418V500L791 520Z" fill="#061117" stroke="#42818c" strokeWidth="1.4" />
    <path d="M-500 565L0 514L365 507L450 535L753 515L1200 497L1700 567V700H-500Z" fill="#030b11" stroke="#82a9ae" strokeWidth="1.6" />
    <path d="M0 531L451 550L750 530L1200 512M0 635L430 578M1200 633L778 572" fill="none" stroke="#396f78" strokeWidth="1" />
    <path d="M30 622L416 569L517 582L140 699H0ZM665 573L1191 527L1200 559L834 699H506Z" fill="#07151a" stroke="#659ba3" strokeWidth="1" />
    <path d="M-500 670L30 622L0 700H-500ZM1200 560l500 100v40h-500Z" fill="#07151a" stroke="#628d95" />
    <path d="M-430 597l390-56M1241 535l349 51M-380 678l322-50m1298-60 331 61" fill="none" stroke="#6c9297" strokeWidth="1" />
    {[0,1,2,3,4,5].map(i => <path key={i} d={'M' + (350+i*67) + ' ' + (584+i) + 'l28-1 37 70-28 2Z'} fill="#64787b" opacity={unrest ? .35 : .62} />)}
    <g className="heyi-roadwork" fill="none">
      <path d="M26 621L416 565M40 629L418 573M846 576l328-43M856 585l330-44" stroke="#a4bdba" strokeWidth="1.4" opacity=".68" />
      <path d="M0 538l386 18m408-30 406-22M59 685l384-106m269-3 387 110" stroke="#315e68" strokeWidth="1" />
      <path d="M24 580l101-12m-75 22 78-9m90 37 59-11M905 590l88 14m-42-24 100 11" stroke="#a0aca9" strokeWidth=".75" opacity=".5" />
      <ellipse cx="164" cy="649" rx="44" ry="13" stroke="#63838b" strokeWidth="1.2" />
      <path d="M124 648q38-11 80-1m-74 8q37-10 73-1m-37-18v27" stroke="#476e78" strokeWidth=".8" />
      <path d="M1012 616l26-4 10 12-29 5Z M38 604l17 3 3 8-19-3Z" stroke="#819698" strokeWidth=".85" />
      {Array.from({length: 18}, (_, i) => <path key={i} d={'M' + (40 + i * 62) + ' ' + (615 + i % 3 * 18) + 'l' + (i % 2 ? 4 : -3) + ' ' + (i % 4 + 1)} stroke="#69929a" strokeWidth=".8" opacity=".48" />)}
      <path d="M447 596l-50 80m161-80-11 63m98-70 38 77" stroke="#b7c9c6" strokeWidth=".85" opacity=".4" />
    </g>
    {value > 65 && <g className="heyi-road-reflection" fill="none" stroke="#66b8c5"><path d="M272 644l82-7m451-33 103-9m-475 82 88-6" strokeWidth="1.2" opacity=".4" /></g>}
    {(unrest || mood === 'weary') && <g fill="#a9aaa0" stroke="#9caaa7" strokeWidth=".8" opacity=".8"><path d="M256 596l21-8 13 7-18 11Z M910 563l16-6 24 12-19 5Z M71 561l13-3 12 5-12 5Z" /><path d="M873 660l17-2 10 8-19 5Z" /></g>}
    <g>
      <path d="M65 355L318 349L338 379L329 522L65 541Z" fill="#07151b" stroke="#a2c9ca" strokeWidth="2" />
      <path d="M66 380L332 377M80 397L319 391M65 540L329 521" stroke="#72aeb5" strokeWidth="1.2" />
      <path d="M77 390L318 384M77 396L318 390M75 510L328 496M72 527L329 512" stroke="#476f78" strokeWidth="1" />
      {[0,1,2,3,4].map(i => <path key={i} d={'M' + (75 + i * 46) + ' 389l4 122'} stroke="#315d68" strokeWidth=".85" />)}
      <path d="M89 413l98-2v70l-98 4ZM207 408l100-3v70l-100 5Z" fill="#0b252b" stroke="#bad5cf" strokeWidth="1.5" />
      <path d="M95 464l86-2M213 458l89-2" stroke="#647e80" strokeWidth="1" />
      <path d="M104 457l51-2v10l-51 2ZM113 454v-20l36-1v21M124 434v-8h14v8" fill="#112429" stroke="#7ea4a7" strokeWidth="1" />
      <path d="M220 450l21-2v10l-21 2ZM245 448l22-1v9l-22 2ZM224 442l36-1" fill="#122a30" stroke="#99aaa7" strokeWidth="1" />
      <circle cx="167" cy="429" r="6" fill="#09171b" stroke="#afc7bf" strokeWidth="1.2" />
      <path d="M160 441q5-10 13 0l6 21h-26Z" fill="#0a1c21" stroke="#9bb7b4" strokeWidth="1.1" />
      <path d="M161 423q7-11 13 0" fill="none" stroke="#bdc8bd" strokeWidth="1" />
      <path d="M217 420l16-2v13l-16 1Z" fill="#10262d" stroke="#a8b9b5" strokeWidth="1" />
      <path d="M226 425h3" stroke="#bad2c7" strokeWidth="1" />
      <path d="M138 412v70M257 407v70M94 448l91-2M213 444l91-3" stroke="#75abb0" />
      <path d="M69 538l265-21M72 544l263-20" stroke="#a8c3c1" strokeWidth="1" />
      <path d="M271 482l20-1v33l-20 2Z" fill="#071519" stroke="#adc4bf" strokeWidth="1" />
      <circle cx="279" cy="496" r="2" fill="#d0d7c7" />
      <path d="M80 532v-20h34v18m0-14h9" stroke="#759ca0" strokeWidth="1" />
      <text x="200" y="373" textAnchor="middle" fill="#c9d4cb" fontSize="14" letterSpacing="5">门卫室</text>
      {route === 'wu' && <g><path d="M60 480l28 10M330 467l-22 11" stroke="#a6b8bf" strokeWidth="3" /><circle cx="330" cy="465" r="5" fill="#a7c0c4" /></g>}
    </g>
    <g>
      <path d="M365 230H792V500L365 529Z" fill="#030e13" stroke="#b5d2cf" strokeWidth="2" />
      <path d="M365 230H792V306L365 311Z" fill="#0e252b" stroke="#d7e4d8" strokeWidth="2" />
      <path d="M377 239l403-2M377 245l403-2M377 297l403-5" stroke="#447780" strokeWidth="1" />
      {[388, 409, 754, 776].map(x => <g key={x}><circle cx={x} cy="252" r="2.1" fill="#a3bcbb" /><circle cx={x} cy="286" r="2.1" fill="#a3bcbb" /></g>)}
      <path d="M375 311V522M780 306V503M375 330L780 326M375 351L780 347" stroke="#78b5ba" strokeWidth="2" />
      <path d="M375 373L574 361L780 370M375 522L574 501L780 503" fill="none" stroke="#7ab4bb" strokeWidth="1.5" />
      {Array.from({length: 17}, (_, i) => <path key={i} d={'M' + (385+i*23) + ' 352V' + (520-i)} stroke="#8cb8b9" strokeWidth="1.25" />)}
      {Array.from({length: 8}, (_, i) => <path key={i} d={'M' + (394+i*46) + ' 391l23 120m-23-91 23-29'} fill="none" stroke="#365f67" strokeWidth=".9" />)}
      <path d="M574 352V501M574 374l-12 18m13-18 11 18" stroke="#c9d7ce" strokeWidth="2" />
      <path d="M365 230L379 215H778L792 230Z" fill="#102127" stroke="#d4dfd2" strokeWidth="2" />
      <path d="M382 222h392M369 313h420M369 321h420" stroke="#83aeb1" strokeWidth="1" />
      <path d="M365 231l-13 2v297l23-2V311M792 230l14 2v269l-26 3V306" fill="#10232a" stroke="#a2c8c7" strokeWidth="2" />
      <path d="M357 240v278m6-278v278m426-276v247m9-248v247" stroke="#457884" strokeWidth="1" />
      <path d="M347 530l33-3 8 7-47 4ZM779 501l25-3 9 7-43 5Z" fill="#0c2027" stroke="#abc7c2" strokeWidth="1.2" />
      <path d="M367 534L808 507M371 541L809 516" stroke="#76a1a8" strokeWidth="1.3" />
      <text x="578" y="286" textAnchor="middle" fill={unrest ? '#d9b6aa' : '#dce5d6'} fontFamily="SimSun, Songti SC, serif" fontSize="48" letterSpacing="20">合肥一中</text>
      {unrest && <path d="M575 370l17 41-24 29m-131 19 25-24 19 29" fill="none" stroke="#ce7864" strokeWidth="2" />}
    </g>
    <g>
      <path d="M813 397l190-7v116l-190 9Z" fill="#081a20" stroke={snapshot.accent} strokeWidth="1.5" />
      <path d="M825 411l166-5v88l-166 7Z" fill="#051015" stroke="#799fa5" />
      <text x="908" y="439" textAnchor="middle" fill={snapshot.accent} fontSize="17" letterSpacing="2">{MARKS[route][0]}</text>
      <path d="M836 453l139-4M836 461l117-4M836 469l135-5" stroke="#64858a" strokeWidth="1.3" />
      <text x="908" y="487" textAnchor="middle" fill="#a5b9b3" fontSize="11">{MARKS[route][1]}</text>
    </g>
    <g className="heyi-tree">
      <path d="M1078 464l12-206m0 90 49-77m-52 18-62-67m52 47-64 9m74 52 91-108m-87 55 71-44m-83 81-81-41" fill="none" stroke="#719497" strokeWidth="4" />
      <path d="M1077 464l13-111 9-69 3 180Z" fill="#071719" stroke="#9ab9b1" strokeWidth="1.4" />
      <g className="heyi-tree__crown">
        <path d="M1007 292Q999 251 1040 212Q1037 167 1080 170Q1102 133 1138 160Q1172 151 1184 192Q1214 223 1188 267Q1178 296 1133 299Q1097 317 1064 302Q1036 312 1007 292Z" fill={winter ? '#051116' : unrest ? '#141a1a' : '#0a2322'} stroke="#91b5ae" strokeWidth="1.5" />
        <path d="M1012 271q30-17 54 4q19-27 48-15q27-30 62-13M1025 228q25-18 49 1q29-30 56-13q26-21 51-4M1043 186q18 18 44 4m44-12q14 21 36 13" fill="none" stroke="#5d8b8e" strokeWidth="1.3" />
        <path d="M1042 267l45-39 42 23 42-35M1045 287l42-21 49 20M1084 206l17 23 34-23" fill="none" stroke="#6d9b99" strokeWidth="1" />
        {!winter && Array.from({length: 24}, (_, i) => {
          const x = 1019 + (i * 37 % 171), y = 185 + (i * 29 % 109);
          return <path key={i} d={'M' + x + ' ' + y + 'q5-7 10 0q-4 6-10 0Z'} fill={autumn ? '#544b36' : '#34544a'} stroke={autumn ? '#a9946f' : '#75a395'} strokeWidth=".8" opacity={i % 4 === 0 ? .8 : .53} />;
        })}
      </g>
      {autumn && [0,1,2,3,4,5].map(i => <path key={i} className="heyi-falling-leaf" style={{ animationDelay: '-' + (i * 1.7) + 's' }} d={'M' + (1016 + i * 29) + ' ' + (280 + i % 3 * 17) + 'q7-3 9 3q-5 6-9-3Z'} fill="#715d42" stroke="#b6a071" strokeWidth="1" />)}
      {winter && <path d="M1060 311l10-4m57-9 11-6m-56-65 9-4" stroke="#c1d1ca" strokeWidth="2" />}
    </g>
    <g className="heyi-lamp" fill="none" stroke="#9ebfc0" strokeWidth="2">
      <path d="M35 526V281l6-16h106M41 282h110l-5 22h-23M35 397h42M124 304l-15 18h35l-15-18ZM53 281v47" />
      <path d="M28 520h13m-10-20h9M117 299l-3 12h25l-3-12" stroke="#6e9ca2" />
      <path d="M43 344h18v55H43Z" fill="#081b20" stroke="#a6c9c8" strokeWidth="1.3" />
      <circle cx="52" cy="354" r="4" fill={unrest || route === 'wu' ? '#a65c57' : '#352a2a'} stroke="#b98781" strokeWidth="1" />
      <circle cx="52" cy="371" r="4" fill="#554629" stroke="#bbaa85" strokeWidth="1" />
      <circle className="heyi-lamp__signal" cx="52" cy="387" r="4" fill={!unrest && route !== 'wu' ? '#78a68d' : '#24443d'} stroke="#a3c3a9" strokeWidth="1" />
      <path d="M119 324q11 18 22 0" stroke={value > 65 ? '#d6c998' : '#53797f'} strokeWidth="1.8" />
    </g>
    <Person x={467} y={562} tired={mood === 'weary' || mood === 'ruin'} stride={1} />
    <Person x={552} y={573} tired={mood === 'ruin'} stride={2} />
    <Person x={654} y={568} tired={mood === 'weary'} stride={3} />
    <Person x={868} y={531} teacher />
    {route === 'democracy' && <g>
      <path className="heyi-cloth" d="M663 519l43-33v37Z" fill="#103837" stroke="#afccba" strokeWidth="2" />
      <path d="M663 520v41M709 521v39M93 511l116-6v31l-116 7Z" fill="none" stroke="#a7c7b7" strokeWidth="1.5" />
      <path d="M100 519l101-5m-101 10 83-4m-83 10 95-4" stroke="#8ebcae" strokeWidth="1" />
      <Person x={248} y={559} stride={2} />
    </g>}
    {route === 'revolution' && <g>
      <path d="M549 505l-4-58" stroke="#d5b19b" strokeWidth="2" />
      <path className="heyi-cloth" d="M545 447l42 10-40 18Z" fill="#472328" stroke="#d78470" strokeWidth="2" />
      <path d="M76 488l73-3v19l-73 4ZM177 482l78-2v19l-78 4Z" fill="#251519" stroke="#b86b60" strokeWidth="1" />
      <path d="M86 494h53m48-6h56m-56 6h45" stroke="#cb8b7b" strokeWidth="1" />
      <Person x={259} y={560} stride={1} />
    </g>}
    {route === 'reform' && <g>
      <path d="M804 518q5-25 10 0m8-1q4-17 9 0" fill="none" stroke="#89b29b" strokeWidth="2" />
      <path d="M824 519l26-6v17l-26 6ZM856 510l28-4v16l-28 4Z" fill="#11221e" stroke="#9dbd9f" />
      <circle cx="229" cy="551" r="17" fill="none" stroke="#8caea9" strokeWidth="2" /><circle cx="285" cy="549" r="17" fill="none" stroke="#8caea9" strokeWidth="2" /><path d="M229 551l27-38 29 36h-56l21-28h30m-20-9-8-4m21 3 15-1" fill="none" stroke="#a2bfad" strokeWidth="1.4" />
    </g>}
    {route === 'haobang' && <g>
      <path d="M82 502l238-7m-227 20 217-7" stroke="#b59b84" strokeWidth="1.4" />
      {[108, 180, 252].map(x => <path key={x} d={'M' + x + ' 499v35m-4-35h8m-8 35h8'} stroke="#b59b84" strokeWidth="1.4" />)}
      <path d="M712 515l63-3v27l-63 3Z" fill="#271d1d" stroke="#bd9580" /><path d="M722 523h41m-41 7h34" stroke="#bd9580" />
    </g>}
    {route === 'yang' && <g>
      <path d="M842 186l46-1v56l-46 1Z" fill="#433b27" stroke="#c1ab7e" opacity=".65" />
      <path d="M839 231l50-2v8l-50 2Z" fill="#715a3a" opacity=".3" />
      <path d="M899 548l35-3 6 12-37 3Z M910 541l29-3 5 7-34 4Z" fill="#172226" stroke="#acb8b0" strokeWidth="1" />
      <path d="M915 545l17-1m-16 9 20-1" stroke="#879e9e" />
    </g>}
    {route === 'jidi' && <g>
      <path d="M89 400l205-5M89 406l178-4" stroke="#b8a77f" />
      <path d="M763 524l18 3 8 31-31-3Z M822 519l16 2 11 30-30-3Z" fill="#282316" stroke="#d5bb82" strokeWidth="1.5" />
      <path d="M772 531l9 1m47-7 9 1" stroke="#e2c88c" />
      <path d="M700 590l69-4" stroke="#baa87d" strokeWidth="2" strokeDasharray="12 7" />
    </g>}
    {route === 'gouxiong' && <g>
      <path d="M108 494q14-22 27 0q14-20 28 0m32-3q18-17 35 0" fill="none" stroke="#b299b4" strokeWidth="1.5" />
      <path d="M812 515l85-5v25l-85 5Z" fill="#111b20" stroke="#a995b6" />
      <path d="M825 524l58-3m-53 8 41-2" stroke="#bba6c3" strokeWidth="1.2" />
      <path d="M255 602l41-5 13 8-32 9Z" fill="#2a2330" stroke="#aa8db2" />
    </g>}
    {route === 'wu' && <g>
      <circle cx="792" cy="233" r="7" fill="#97b2bd" /><path d="M792 240l-15 12m16-11 16 12" stroke="#97b2bd" strokeWidth="2" />
      <path className="heyi-searchlight" d="M793 240L575 502L438 517Z" fill="#9ab1b0" opacity=".07" />
      <path d="M91 557l19-31 17 27Zm91-3 18-32 17 28Zm90-5 17-31 18 26Z" fill="#172327" stroke="#b7a881" strokeWidth="1.2" />
      <path d="M79 570l278-17" stroke="#a89568" strokeWidth="2.5" />
    </g>}
    {route === 'despair' && <g>
      <path d="M63 529l223-17-18 14-179 17Z" fill="#172226" stroke="#af8171" strokeWidth="1.2" />
      <path d="M782 497l21-10 10 28-22 11Z" fill="#211f20" stroke="#a77d74" />
      <path d="M102 608l71-20m820-30 99 15" stroke="#a3786f" strokeWidth="1.3" />
    </g>}
    {route === 'jidi_riot' && <g>
      <path d="M72 508l189-12 20 16-210 19Z" fill="#231b1b" stroke="#cf826e" strokeWidth="1.2" />
      <path d="M780 484l27 12-19 39-36-23Z" fill="#261918" stroke="#c4755c" />
      <path d="M501 627l60-9 18 12-69 13Z M840 568l62-11 16 11-67 13Z" fill="#a5a59d" stroke="#cb7b66" strokeWidth="1" />
      <g className="heyi-smoke" fill="none" stroke="#7b7d7a" strokeWidth="8" opacity=".45"><path d="M717 407q-31-33-2-65q-29-28-5-62M758 424q35-38 7-71q24-30 6-58" /></g>
    </g>}
    {unrest && <g className="heyi-ember"><path d="M719 406l8-32 11 22 10-39 9 50Z" fill="#8e382c" stroke="#d18b67" /><path d="M754 432l6-23 8 12 8-31 10 44Z" fill="#772b24" stroke="#cb7656" /></g>}
    <g className="heyi-hotspots">{HOTSPOTS.map(zone => <path key={zone.id} d={zone.path} className={active === zone.id ? 'is-active' : ''}
      role="button" tabIndex={0} aria-label={'观察' + snapshot.zones[zone.id].label + '：' + snapshot.zones[zone.id].description}
      onPointerEnter={event => onPointer(event, zone.id)} onPointerMove={event => onPointer(event, zone.id)}
      onPointerLeave={() => onZone(null)} onFocus={() => onZone(zone.id, zone.anchor)} onBlur={() => onZone(null)}
      onClick={() => onZone(zone.id, zone.anchor)}
      onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); onZone(zone.id, zone.anchor); } }} />)}</g>
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
  const onPointer = (event: PointerEvent<SVGPathElement>, zone: HeyiZone) => {
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
