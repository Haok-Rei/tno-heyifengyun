import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { X } from 'lucide-react';
import type { GameState } from '../types';
import { getHeyiLightSnapshot, type HeyiZone } from '../engine/heyiLight';
import './heyiLight.css';

interface Props { state: GameState; onClose: () => void }
type Snapshot = ReturnType<typeof getHeyiLightSnapshot>;
type Point = { x: number; y: number };
const HOTSPOTS: { id: HeyiZone; path: string; anchor: Point }[] = [
  { id: 'building', path: 'M80 137L720 75L1160 127V386L720 435L80 377Z', anchor: {x: 600, y: 140} },
  { id: 'sign', path: 'M365 230H792V306L365 311Z', anchor: {x: 590, y: 270} },
  { id: 'gate', path: 'M365 311L792 305V500L365 529Z', anchor: {x: 590, y: 410} },
  { id: 'guard', path: 'M65 355L318 349L338 379V522L65 541Z', anchor: {x: 185, y: 430} },
  { id: 'trees', path: 'M1007 292Q999 251 1040 212Q1037 167 1080 170Q1102 133 1138 160Q1172 151 1184 192Q1214 223 1188 267Q1178 296 1133 299Q1097 317 1064 302Q1036 312 1007 292ZM1084 298L1105 301L1090 461L1081 461Z', anchor: {x: 1100, y: 270} },
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
function Person({ x, y, teacher = false, tired = false, stride = 0, active, snapshot, onZone, onPointer }: { x: number; y: number; teacher?: boolean; tired?: boolean; stride?: number; active: HeyiZone | null; snapshot: Snapshot; onZone: (zone: HeyiZone | null, anchor?: Point) => void; onPointer: (event: PointerEvent<SVGPathElement>, zone: HeyiZone) => void }) {
  const zone: HeyiZone = teacher ? 'teachers' : 'students';
  const accent = teacher ? '#c6c8ae' : stride === 2 ? '#b9b393' : stride === 3 ? '#8da9b6' : '#8bbfbe';
  return <g transform={'translate(' + x + ' ' + y + ')'} className={'heyi-person ' + (active === zone ? 'is-observed ' : '') + (stride ? 'heyi-person--walking' : 'heyi-person--standing')} style={{ animationDelay: '-' + (stride * 1.13) + 's' }}>
    <ellipse cx="2" cy="27" rx="24" ry="4" fill="#111d22" opacity=".8" stroke="none" />
    <g transform={tired ? 'rotate(7 0 -20)' : undefined}>
      <path className="heyi-person__leg heyi-person__leg--left" d="M-8-3L-14 19L-18 24L-10 26L-5 20L2 4Z" fill="#15242a" stroke={accent} strokeWidth="1.45" strokeLinejoin="round" />
      <path className="heyi-person__leg heyi-person__leg--right" d="M7-3L13 20L19 24L12 26L6 22L-1 5Z" fill="#101f26" stroke={accent} strokeWidth="1.45" strokeLinejoin="round" />
      <path d="M-17 25l12 1m19-1 10 1" stroke="#c1d1c9" strokeWidth="1.8" />
      <path d="M-12-38Q0-43 12-37L13-4Q0 1-13-4Z" fill={teacher ? '#27312f' : stride === 2 ? '#30312a' : '#1d3035'} stroke={accent} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M-10-36L-5-12H6L11-36M-12-19h25M-8-9h16" fill="none" stroke="#477a83" strokeWidth=".8" />
      {teacher ? <g><path d="M-8-39L0-25L8-39M-6-26L0-20L5-26" fill="#13232a" stroke="#d6d6c4" strokeWidth="1.25" /><path d="M2-25v14" stroke="#ab9c87" strokeWidth="1.2" /></g> : <g><path d="M-7-38L0-29L7-38" fill="none" stroke="#e1e3d6" strokeWidth="1.25" /><path d="M-10-31l-6 6v23l10 2" fill="none" stroke="#6d9ca3" strokeWidth="1.2" /><path d="M-8-19h16" stroke="#acc9c3" strokeWidth=".8" /><path d="M-3-19h6v7h-6Z" fill={stride === 2 ? '#b59a6b' : '#7d999a'} stroke="#d3d1b8" strokeWidth=".6" /></g>}
      <path d={tired ? 'M-12-34L-24-13L-20-8L-7-20M12-34L19-13L15-8L8-21' : 'M-12-34L-20-15L-17-5L-12-7L-15-16L-6-26M12-34L19-14L24-9L20-6L12-15L7-26'} fill="#0b2027" stroke={accent} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M-22-8l5 3m33-3 5 3" stroke="#d0c9ae" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M-3-42v-7h7v7" fill="#18282b" stroke="#b1bcb1" strokeWidth="1.1" />
      <path d="M-9-54Q-7-64 0-64Q9-63 10-53L8-44Q0-39-8-45Z" fill="#102126" stroke="#bad0c5" strokeWidth="1.45" />
      <path d={stride === 2 ? 'M-11-54Q-16-68-6-70Q8-74 12-59L12-52Q7-57 4-62Q0-55-5-56Q-8-52-11-54Z' : stride === 3 ? 'M-10-55Q-12-68-3-70Q10-70 12-57L13-49Q8-50 8-57Q0-54-10-55Z' : 'M-9-54Q-13-65-5-69Q3-72 10-64L12-55Q6-60-2-60Q-5-55-9-54Z'} fill="#111917" stroke={teacher ? '#bdbba7' : '#a0bbb9'} strokeWidth="1.2" />
      {stride === 3 && <path d="M-11-56q-7 13-1 20m21-19q9 10 5 22" stroke="#b8b29f" strokeWidth="1.3" fill="none" />}
      <path d="M-4-50l2 1m6-1 2 1M-2-44q3 1 6 0" stroke="#b9baae" strokeWidth=".8" />
      {teacher ? <g><path d="M17-7h17v24H17Z" fill="#0d2026" stroke="#c7ccb9" strokeWidth="1.35" /><path d="M21-7v-4h10v4M20 0h11m-11 5h8" stroke="#8faeaa" strokeWidth="1" /></g> : <g><path d="M-14-34L-31-29L-27 1L-13 2Z" fill={stride === 2 ? '#2c302a' : '#122832'} stroke={accent} strokeWidth="1.5" /><path d="M-27-26l14-1m-13 10 12-2m-10 11 11-2" stroke="#698884" strokeWidth=".9" /><path d="M-15-29l5 5" stroke="#d5c6a5" strokeWidth="1.2" /><circle cx="-21" cy="-14" r="2" fill="#c6bb8e" stroke="none" /></g>}
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
    <path d="M-500 0H1700V480H-500Z" fill="#040c10" />
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
    <path d="M80 377L720 435L1160 386L1520 483L758 531L-230 477Z" fill="#070e11" stroke="#486d75" strokeWidth="1" />
    <path d="M80 393L720 449L1160 401M80 407L720 463L1160 415M-150 446L720 485L1350 445M-350 484L720 516L1530 480" fill="none" stroke="#657d7d" strokeWidth=".65" />
    <defs><clipPath id="heyi-courtyard-clip"><path d="M80 377L720 435L1160 386L1520 483L758 531L-230 477Z" /></clipPath></defs>
    <path clipPath="url(#heyi-courtyard-clip)" d="M-280 474L-1200 260M165 487L-1200 260M525 507L-1200 260M770 530L2300 260M1010 516L2300 260M1325 496L2300 260" fill="none" stroke="#365762" strokeWidth=".6" />
    <path d="M80 377L720 435L1160 386" fill="none" stroke="#c5b795" strokeWidth="1.2" />
    <path d="M113 143V370M1124 137V381" stroke="#8caaa5" strokeWidth="1.1" />
  </g>;
}
function CampusPoster({ x, y, title, ink = '#bcb89f', paper = '#343630' }: { x: number; y: number; title: string; ink?: string; paper?: string }) {
  return <g transform={`translate(${x} ${y})`}>
    <path d="M-3 3L91-2L94 92L0 96Z" fill="#11191a" stroke="#999e8d" strokeWidth="1" />
    <path d="M0 0L88-3L90 87L2 91Z" fill={paper} stroke={ink} strokeWidth="1.4" />
    <path d="M7 7L82 4M8 33L81 30M8 79L80 76" stroke={ink} strokeWidth=".9" opacity=".8" />
    <text x="45" y="23" textAnchor="middle" fill={ink} fontSize="13" fontWeight="bold" letterSpacing="2">{title}</text>
    <path d="M11 42l63-3m-63 7 54-3m-54 8 59-3m-59 8 42-2m-42 8 57-3" stroke={ink} strokeWidth="1" opacity=".68" />
    {[4, 84].map(px => [4, 83].map(py => <circle key={`${px}-${py}`} cx={px} cy={py} r="1.7" fill={ink} />))}
  </g>;
}
function RouteArchitecture({ route }: { route: Snapshot['route'] }) {
  if (route === 'democracy') return <g>
    <path d="M304 82Q448 131 594 83Q741 130 890 82" fill="none" stroke="#ded1a1" strokeWidth="2" />
    {[346, 426, 505, 664, 744, 823].map((x, i) => <path key={x} className="heyi-cloth" d={`M${x} ${97 + i % 2 * 8}l17 5-9 37-11-19Z`} fill={i % 2 ? '#355b50' : '#a89461'} stroke="#c8c4a4" strokeWidth="1" />)}
    <CampusPoster x={190} y={251} title="候选人" ink="#c1d3b7" paper="#263b32" />
    <CampusPoster x={924} y={251} title="投票须知" ink="#c1d3b7" paper="#263b32" />
  </g>;
  if (route === 'revolution') return <g>
    <path className="heyi-cloth" d="M388 67V5l83 16-78 30Z" fill="#632e2e" stroke="#dc9681" strokeWidth="2" />
    <path className="heyi-cloth" d="M804 67V2l-77 15 74 30Z" fill="#51262a" stroke="#cf8977" strokeWidth="2" />
    <path d="M386 68V7M805 67V4M382 71h11m407 0h11" stroke="#d0bd9e" strokeWidth="2" />
    <CampusPoster x={185} y={251} title="临时公报" ink="#d8a090" paper="#392527" />
    <CampusPoster x={925} y={251} title="学生自治" ink="#d8a090" paper="#392527" />
    <path d="M295 348l34-25 25 28m463-1 25-24 33 26" fill="none" stroke="#b36b61" strokeWidth="2" />
  </g>;
  if (route === 'reform') return <g>
    <path d="M296 65H904v9H296Z" fill="#33443a" stroke="#8aab8e" />
    <path d="M347 72v55m504-55v55" stroke="#a4bb99" strokeWidth="2" />
    <path className="heyi-cloth" d="M346 127q131 17 251-3q128 19 255-3v39q-128 16-255 3q-135 14-251-3Z" fill="#304638" stroke="#b5caa5" strokeWidth="1.5" />
    <text x="600" y="149" textAnchor="middle" fill="#dfddbf" fontSize="19" letterSpacing="8">课程与社团开放周</text>
    <CampusPoster x={192} y={249} title="社团招新" ink="#b5cbaa" paper="#26392f" />
    <CampusPoster x={925} y={249} title="课程试行" ink="#b5cbaa" paper="#26392f" />
  </g>;
  if (route === 'haobang') return <g>
    <path d="M317 69H881v8H317Z" fill="#55392e" stroke="#b99d7d" />
    <path className="heyi-cloth" d="M344 77q249 23 508 0v48q-240 21-508 0Z" fill="#553b35" stroke="#cca78d" strokeWidth="1.5" />
    <text x="596" y="110" textAnchor="middle" fill="#e8d2b0" fontSize="20" letterSpacing="7">联席会议</text>
    <CampusPoster x={190} y={250} title="会谈日程" ink="#d8b69a" paper="#392d2a" />
    <CampusPoster x={925} y={250} title="联合声明" ink="#d8b69a" paper="#392d2a" />
    <path d="M430 352l40-26h266l43 26" fill="#48342d" stroke="#bd9983" strokeWidth="2" />
  </g>;
  if (route === 'yang') return <g>
    <path d="M764 100h49v62h-49Z" fill="#896e43" opacity=".72" />
    <path className="heyi-window__light" d="M769 104h41v54h-41Z" fill="#d0a86b" opacity=".8" />
    <path d="M752 88l72-1v87l-72 1Z" fill="none" stroke="#dccba9" strokeWidth="2" />
    <path d="M770 126h35m-17-35v83" stroke="#6c6655" strokeWidth="2" />
    <CampusPoster x={188} y={252} title="办公室" ink="#d2bd92" paper="#38372d" />
    <CampusPoster x={925} y={252} title="工作安排" ink="#d2bd92" paper="#38372d" />
  </g>;
  if (route === 'jidi') return <g>
    <path d="M323 77h545v10H323Z" fill="#625633" stroke="#dbcb90" />
    <path className="heyi-cloth" d="M342 88q253 14 508 0v51q-253 15-508 0Z" fill="#65562f" stroke="#d8c68c" strokeWidth="1.5" />
    <text x="598" y="123" textAnchor="middle" fill="#eee1af" fontSize="20" letterSpacing="8">升学冲刺</text>
    <CampusPoster x={188} y={251} title="成绩公示" ink="#e0c987" paper="#3b3424" />
    <CampusPoster x={925} y={251} title="冲刺计划" ink="#e0c987" paper="#3b3424" />
    <path d="M305 350h582" stroke="#c5ad77" strokeWidth="3" />
  </g>;
  if (route === 'jidi_riot') return <g>
    <path d="M289 77H911v21H289Z" fill="#2b1f1d" opacity=".8" />
    <path d="M318 102l140 22 54-30 109 36 94-25 146 25" fill="none" stroke="#bb6d58" strokeWidth="3" />
    <g className="heyi-ember">
      <path d="M527 179q11-14 9-27q2-17 15-32q-3 29 13 35q11-11 12-32q5-17 13-35q-4 29 12 42q12-8 10-23q20 22 18 35q13-8 17-19q14 29 4 56Z" fill="#6f3029" stroke="#dc8466" strokeWidth="1.5" />
      <path d="M543 177q12-15 13-29q9 16 21 13q6-16 14-31q1 22 17 30q10-4 13-13q14 14 11 30Z" fill="#bc5a3d" opacity=".8" />
      <path d="M567 176q8-15 17-19q4 12 15 17q8-9 11-15q6 8 7 17Z" fill="#e0a267" opacity=".8" />
      <path d="M554 100l3-10m64 19 8-9m-27-16 2-12" stroke="#c87458" strokeWidth="2" strokeLinecap="round" />
    </g>
    <g className="heyi-smoke" fill="none" stroke="#77736a" strokeWidth="10" opacity=".55"><path d="M567 157q-35-51 5-82q-33-39 1-76m38 170q28-44-9-71q19-37-6-72" /></g>
    <CampusPoster x={186} y={251} title="停止运作" ink="#ca7f6c" paper="#332526" />
    <path d="M931 255l64 91m-75-41 72-18m-47 14 44 38" stroke="#b87768" strokeWidth="2" />
  </g>;
  if (route === 'gouxiong') return <g>
    <path d="M299 84q152 61 299 0q157 58 302 0" fill="none" stroke="#c2a6bf" strokeWidth="2" />
    {[337, 413, 489, 647, 723, 799].map((x,i) => <path key={x} className="heyi-cloth" d={`M${x} ${95+i%2*8}l17 6-9 32-9-18Z`} fill={i%2 ? '#59445d' : '#866a87'} stroke="#d1b2cb" />)}
    <CampusPoster x={188} y={251} title="礼堂节目" ink="#d6b8d3" paper="#322737" />
    <CampusPoster x={925} y={251} title="活动报名" ink="#d6b8d3" paper="#322737" />
    <path d="M581 78q-23 22 0 36q22-16 0-36m-25 36 50 0" fill="none" stroke="#c5aec8" strokeWidth="2" />
  </g>;
  if (route === 'wu') return <g>
    <path d="M288 78H910v11H288Z" fill="#27323a" stroke="#98adb2" />
    <path d="M302 93h66v73h-66Z M830 93h66v73h-66Z" fill="#1c2c32" stroke="#9db4b9" strokeWidth="2" />
    <path d="M304 106l64 0m-64 12h64m-64 12h64m-64 12h64m462-36h66m-66 12h66m-66 12h66m-66 12h66" stroke="#77939c" strokeWidth="1.2" />
    <circle cx="337" cy="106" r="5" fill="#a94947" /><circle cx="865" cy="106" r="5" fill="#a94947" />
    <CampusPoster x={186} y={251} title="通行规定" ink="#b9c3bb" paper="#263139" />
    <CampusPoster x={925} y={251} title="巡查记录" ink="#b9c3bb" paper="#263139" />
  </g>;
  if (route === 'despair') return <g>
    <path d="M302 83l590 7" stroke="#696662" strokeWidth="5" opacity=".5" />
    {[316, 464, 612, 760].map(x => <g key={x}><path d={`M${x} 187l125 55m-114 9 109-64`} stroke="#746c62" strokeWidth="7" /><path d={`M${x} 187l125 55m-114 9 109-64`} stroke="#b19a7d" strokeWidth="1" /></g>)}
    <CampusPoster x={186} y={250} title="停止开放" ink="#bd8d7e" paper="#332d2c" />
    <path d="M922 267l63 69m-69-19 76-36" stroke="#9c827a" strokeWidth="4" />
    <path d="M317 339l53 13m466-12 53 13" stroke="#806d67" strokeWidth="3" />
  </g>;
  return <g>
    <CampusPoster x={188} y={250} title="新学期" ink="#cbbd99" paper="#333630" />
  </g>;
}
function RouteForeground({ route, active, snapshot, onZone, onPointer }: { route: Snapshot['route']; active: HeyiZone | null; snapshot: Snapshot; onZone: (zone: HeyiZone | null, anchor?: Point) => void; onPointer: (event: PointerEvent<SVGPathElement>, zone: HeyiZone) => void }) {
  if (route === 'democracy') return <g className="heyi-route-props">
    <path d="M71 564l205-15 32 15-221 20Z" fill="#17221e" stroke="#8ba596" />
    <path d="M87 464l202-6v99l-202 11Z" fill="#273b32" stroke="#b8cab2" strokeWidth="2" />
    <path d="M89 465l23-22 167-4 10 19Z" fill="#385245" stroke="#c1c9a9" strokeWidth="1.5" />
    <path d="M98 484l178-4m-178 16 178-4m-89-12v73" stroke="#8ba99a" strokeWidth="1" />
    <text x="187" y="523" textAnchor="middle" fill="#e0ddbb" fontSize="16" letterSpacing="5">投 票 处</text>
    <path d="M127 552l26-2 4 14-30 2ZM228 547l24-2 4 14-27 2Z" fill="#c2ba96" stroke="#d7ceb1" />
    <path d="M297 523v47m53-49v45m-53-37q26-19 53-4" fill="none" stroke="#c6c8af" strokeWidth="2" />
    <path d="M807 550l158-11 13 10-166 12Z" fill="#233a31" stroke="#a9c3a8" />
    <path d="M825 505h130v44l-130 3Z" fill="#172e2a" stroke="#b9d0b2" strokeWidth="1.5" />
    <text x="890" y="532" textAnchor="middle" fill="#c7ddbd" fontSize="15" letterSpacing="3">公开计票</text>
    <path d="M840 541h100m-88-9h73" stroke="#83a596" />
  </g>;
  if (route === 'revolution') return <g className="heyi-route-props">
    <path d="M55 563l222-15 37 16-241 22Z" fill="#291c1b" stroke="#bd7664" />
    {[79, 143, 207].map(x => <g key={x}><path d={`M${x} 502l51-3 9 55-63 5Z`} fill="#3b2524" stroke="#ce8972" strokeWidth="1.4" /><path d={`M${x+8} 514l35-2m-32 14 36-2m-32 14 37-2`} stroke="#ba796a" strokeWidth="1" /></g>)}
    <path d="M110 497v-80m0 2 75 19-72 36Z" fill="#68312b" stroke="#dc9885" strokeWidth="2" />
    <path d="M813 543l144-8 38 16-171 11Z" fill="#2a1c1a" stroke="#c78672" />
    <path d="M839 493l124-5 6 51-136 7Z" fill="#3b2623" stroke="#cb8b76" strokeWidth="1.8" />
    <text x="901" y="524" textAnchor="middle" fill="#e2b0a0" fontSize="15" letterSpacing="4">临时委员会</text>
    <path d="M842 503l116-4m-113 37 118-5" stroke="#d29781" strokeWidth="1" />

    <Person x={307} y={555} stride={1} active={active} snapshot={snapshot} onZone={onZone} onPointer={onPointer} />
  </g>;
  if (route === 'reform') return <g className="heyi-route-props">
    <path d="M82 564l230-16m506 11 175-10" stroke="#709778" strokeWidth="2" />
    {[99, 231, 832, 936].map(x => <g key={x}><path d={`M${x} 522l33-3-3 29-29 3Z`} fill="#634c37" stroke="#b29773" strokeWidth="1.3" /><path d={`M${x+5} 520q-15-28 2-38q7 18 12 36m-12-17q21-28 28-17q-2 21-23 35`} fill="#344d3b" stroke="#86aa78" strokeWidth="1.2" /></g>)}
    <path d="M136 553a19 19 0 1 0 38 0a19 19 0 1 0-38 0m80-3a19 19 0 1 0 38 0a19 19 0 1 0-38 0" fill="none" stroke="#b0c2b2" strokeWidth="2" />
    <path d="M155 553l41-43 39 40h-80l34-29 47 5m-42-17-6-9m5 9 20 2" fill="none" stroke="#a6c6b1" strokeWidth="1.7" />
    <path d="M824 465l139-7 6 89-149 9Z" fill="#26372e" stroke="#b5caa7" strokeWidth="1.5" />
    <text x="894" y="491" textAnchor="middle" fill="#d2dfb9" fontSize="14" letterSpacing="3">学生项目展</text>
    <path d="M835 503l118-6m-118 9 97-5m-96 12 111-6m-111 11 71-4" stroke="#a4bea4" strokeWidth="1" />
  </g>;
  if (route === 'haobang') return <g className="heyi-route-props">
    <path d="M87 550l227-17 25 15-238 23Z" fill="#302520" stroke="#ae8e77" />
    <path d="M113 489l193-7v57l-193 12Z" fill="#44342c" stroke="#c3a58c" strokeWidth="1.5" />
    <text x="210" y="512" textAnchor="middle" fill="#e0c6a7" fontSize="15" letterSpacing="3">会 议 签 到</text>
    <path d="M125 523l164-7m-164 7 22 8m34-13 12 8m30-10 14 8m35-9 9 8" stroke="#aa9582" strokeWidth="1" />
    <path d="M775 560l80-12 123-5 16 15-129 6Z" fill="#372922" stroke="#ba9a80" strokeWidth="1.5" />
    <path d="M832 521l141-9v35l-141 7Z" fill="#3a2b26" stroke="#c5a88a" strokeWidth="1.3" />
    <path d="M842 534l121-8m-116 15 108-8" stroke="#d1b19a" strokeWidth="1" />
    <path d="M823 559v16m150-18v15" stroke="#a88c78" strokeWidth="2" />
    <Person x={795} y={555} teacher active={active} snapshot={snapshot} onZone={onZone} onPointer={onPointer} />
  </g>;
  if (route === 'yang') return <g className="heyi-route-props">
    <path d="M72 567l210-16 25 14-225 20Z" fill="#29291f" stroke="#a69c76" />
    <path d="M94 508l164-9 9 51-173 11Z" fill="#3e3829" stroke="#b9aa81" strokeWidth="1.5" />
    <path d="M109 504v-18l103-7v19m-89-14-8-11 92-5 10 11" fill="#b5a67e" stroke="#d2c19a" strokeWidth="1" />
    <path d="M109 518l135-8m-133 17 122-7m-121 17 136-9" stroke="#a49b80" strokeWidth="1" />
    <path d="M822 547l136-9 20 15-152 11Z" fill="#333026" stroke="#b4aa82" />
    {[0,1,2].map(i => <g key={i}><path d={`M${847+i*28} ${514-i*5}l66-5 3 31-67 5Z`} fill="#b0a281" stroke="#d6c6a2" /><path d={`M${855+i*28} ${522-i*5}l47-4m-44 11 52-4`} stroke="#776c58" /></g>)}
    <path d="M979 503l6 40m-14-34h27m-25 0 3-11h15l4 11" fill="none" stroke="#c4b88e" strokeWidth="2" />
  </g>;
  if (route === 'jidi') return <g className="heyi-route-props">
    <path d="M77 566l223-17 29 16-235 19Z" fill="#2f2a1e" stroke="#c2af77" />
    <path d="M90 458h192v97l-192 12Z" fill="#413821" stroke="#ddc889" strokeWidth="1.8" />
    <text x="188" y="481" textAnchor="middle" fill="#eee0ab" fontSize="16" letterSpacing="4">公 示 栏</text>
    <path d="M101 493l169-4m-169 11 169-5m-169 11 169-5m-169 11 169-5m-169 11 169-5m-169 11 169-5" stroke="#b9a470" strokeWidth="1" />
    {[0,1,2,3].map(i => <text key={i} x="113" y={504+i*12} fill="#d7c28e" fontSize="8">{String(i+1).padStart(2,'0')}  ·············  9{7-i}.8</text>)}
    <path d="M811 553l168-13 22 14-174 16Z" fill="#2f291d" stroke="#c5af7a" />
    <path d="M837 515l138-5v35l-138 8Z" fill="#473a22" stroke="#d4bc7e" strokeWidth="1.3" />
    <text x="903" y="535" textAnchor="middle" fill="#e8d297" fontSize="15" letterSpacing="4">倒计时 60</text>
    <Person x={772} y={572} tired stride={2} active={active} snapshot={snapshot} onZone={onZone} onPointer={onPointer} />
  </g>;
  if (route === 'jidi_riot') return <g className="heyi-route-props">
    <path d="M59 569l257-27 42 20-276 28Z" fill="#2d201e" stroke="#c37865" />
    {[75, 146, 217].map(x => <g key={x}><path d={`M${x} 503l57-10 13 57-69 14Z`} fill="#342220" stroke="#b66d5d" strokeWidth="1.5" /><path d={`M${x+7} 508l50-9m-47 24 50-9m-45 24 50-9`} stroke="#9d6255" /></g>)}
    <g className="heyi-ember">
      <path d="M111 514q8-18 9-31q7 17 17 7q0-23 16-43q-3 28 16 37q15-23 17-76q19 34 12 67q18-8 21-30q22 24 15 51q13-10 18-17q12 26 10 35Z" fill="#75342a" stroke="#e19068" strokeWidth="2" />
      <path d="M132 514q13-15 13-29q13 18 26 10q14-26 17-48q8 33 25 44q12-2 17-12q11 20 9 35Z" fill="#b85136" opacity=".82" />
      <path d="M161 514q10-13 15-24q13 17 28 20q13-16 20-17l11 21Z" fill="#e3a56c" opacity=".78" />
    </g>
    <path d="M783 558l191-22 34 18-204 24Z" fill="#382620" stroke="#ce7e67" />
    <path d="M832 503l55-36 64 37-60 40Z" fill="#3d2b27" stroke="#c88875" strokeWidth="1.5" />
    <path d="M837 509l106-2m-76-34 18 62m37-44-63 38" stroke="#ab6a5a" strokeWidth="2" />
    <path d="M799 581l24-9 18 13-27 12Zm134-13 31-9 13 16-29 11Z" fill="#a79a89" stroke="#cb8972" />
  </g>;
  if (route === 'gouxiong') return <g className="heyi-route-props">
    <path d="M65 567l249-21 31 16-256 25Z" fill="#302631" stroke="#b294b5" />
    <path d="M85 510l216-12v50l-216 13Z" fill="#423349" stroke="#c7abc8" strokeWidth="1.6" />
    <path d="M95 507q14-22 28 0q13-20 27-1q15-23 29-2q15-19 29-1q15-22 29-2q13-20 29-2" fill="none" stroke="#d7bcd1" strokeWidth="1.5" />
    <text x="193" y="535" textAnchor="middle" fill="#e4d0df" fontSize="16" letterSpacing="5">校园舞台</text>
    <path d="M806 548l180-14 16 13-188 18Z" fill="#342a39" stroke="#bd9ac2" />
    <path d="M834 484l132-6v61l-132 9Z" fill="#44354a" stroke="#d2b2d1" strokeWidth="1.4" />
    <path d="M847 496l108-4m-108 43 108-5" stroke="#ad8fb5" />
    <text x="901" y="519" textAnchor="middle" fill="#e1cde2" fontSize="14" letterSpacing="3">活动节目表</text>
  </g>;
  if (route === 'wu') return <g className="heyi-route-props">
    <path d="M57 568l265-27 32 16-276 33Z" fill="#222b2c" stroke="#abbab3" />
    {[83, 163, 243].map(x => <g key={x}><path d={`M${x} 509l59-8 8 48-68 13Z`} fill="#344145" stroke="#aab8b1" strokeWidth="1.4" /><path d={`M${x+7} 526l51-7`} stroke="#d7b97d" strokeWidth="4" /></g>)}
    <path d="M808 552l189-14 22 16-197 19Z" fill="#263237" stroke="#aabcb9" />
    <path d="M831 490l152-10 7 62-164 14Z" fill="#2a3940" stroke="#bdc8be" strokeWidth="1.5" />
    <text x="902" y="512" textAnchor="middle" fill="#d0d8c9" fontSize="14" letterSpacing="4">证 件 核 验</text>
    <path d="M845 524l117-8m-114 16 90-6" stroke="#9baba9" strokeWidth="1" />
    <circle cx="967" cy="492" r="5" fill="#aa4d4b" /><path d="M979 465l-48-18 6-9 51 17Z" fill="#46575a" stroke="#b7c6c0" />
    <path className="heyi-searchlight" d="M944 447L491 646L658 588Z" fill="#dfd7b5" opacity=".1" />
  </g>;
  if (route === 'despair') return <g className="heyi-route-props">
    <path d="M58 571l240-21 44 14-252 24Z" fill="#282322" stroke="#9b7b71" />
    <path d="M84 510l214-13-3 62-218 15Z" fill="#2f2929" stroke="#ab8579" strokeWidth="1.4" />
    <path d="M96 506l190 47m-193 8 198-56" stroke="#856e68" strokeWidth="7" />
    <path d="M97 503l193 49m-196 7 200-55" stroke="#c19980" strokeWidth="1.2" />
    <path d="M803 554l195-15 20 15-202 20Z" fill="#2d2827" stroke="#9b7b70" />
    <path d="M831 489l148-8 6 59-158 13Z" fill="#302a29" stroke="#a3897a" />
    <text x="902" y="516" textAnchor="middle" fill="#c7a997" fontSize="14" letterSpacing="3">暂停开放</text>
    <path d="M824 505l165 20m-159 9 151-43" stroke="#846c67" strokeWidth="5" />
    <path d="M270 602l37-12 17 6-39 14Zm709-29 31-11 20 6-36 12Z" fill="#8a7f70" stroke="#b79c84" />
  </g>;
  return <g className="heyi-route-props">
    <path d="M80 568l206-17 28 13-221 23Z" fill="#1e2a28" stroke="#a6a88d" />
    <path d="M101 520l165-11v44l-165 12Z" fill="#303b34" stroke="#b1b99b" strokeWidth="1.5" />
    <path d="M110 529l148-9m-147 18 124-8m-123 17 143-9" stroke="#91a790" />
    <path d="M800 558l188-16 16 13-189 19Z" fill="#242e2b" stroke="#aab29b" />
    <path d="M832 523l137-7v31l-137 10Z" fill="#374035" stroke="#b6b99a" strokeWidth="1.4" />
    <text x="902" y="544" textAnchor="middle" fill="#dbd3b1" fontSize="14" letterSpacing="3">开学日程</text>
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
    <defs>
      <linearGradient id="heyi-sky" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#101218" /><stop offset=".6" stopColor="#1d292b" /><stop offset="1" stopColor="#423a30" /></linearGradient>
      <linearGradient id="heyi-road" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#1c2524" /><stop offset="1" stopColor="#0a1216" /></linearGradient>
      <pattern id="heyi-brick" width="30" height="18" patternUnits="userSpaceOnUse"><path d="M0 0H30M0 9H30M15 0V9M0 9v9" fill="none" stroke="#837b67" strokeWidth=".75" /></pattern>
    </defs>
    <rect x="-500" width="2200" height="700" fill="#020b10" />
    <SchoolCampus lit={lit} unrest={unrest} route={route} />
    <RouteArchitecture route={route} />
    {mood === 'bright' && <g fill="none" stroke="#a8c8ad" strokeWidth="1.5"><path d="M198 408q13-21 26 0m10 0q12-17 23 0M1015 412q16-20 28 0" /><path d="M160 535l12-17 11 18m15-5 8-12 10 12" /></g>}
    <path d="M0 419L58 390L365 405V527L0 514ZM791 396L1050 385L1200 418V500L791 520Z" fill="#091316" stroke="#a8ad9a" strokeWidth="1.2" />
    <path d="M-500 565L0 514L365 507L450 535L753 515L1200 497L1700 567V700H-500Z" fill="url(#heyi-road)" stroke="#a1a99a" strokeWidth="1.6" />
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
      <path d="M80 349L314 343l28 28-276 9Z" fill="#3a4541" stroke="#b6bda8" strokeWidth="1.5" />
      <path d="M73 354l239-5 18 17-262 10Z" fill="#677267" stroke="#d3c9a9" strokeWidth="1" />
      <path d="M65 355L318 349L338 379L329 522L65 541Z" fill="#07151b" stroke="#a2c9ca" strokeWidth="2" />
      <path d="M318 349l20 30-9 143-16-7Z" fill="#29312e" stroke="#899b8c" strokeWidth="1" />
      <path d="M66 380L332 377M80 397L319 391M65 540L329 521" stroke="#72aeb5" strokeWidth="1.2" />
      <path d="M77 390L318 384M77 396L318 390M75 510L328 496M72 527L329 512" stroke="#476f78" strokeWidth="1" />
      {[0,1,2,3,4].map(i => <path key={i} d={'M' + (75 + i * 46) + ' 389l4 122'} stroke="#315d68" strokeWidth=".85" />)}
      <path d="M89 413l98-2v70l-98 4ZM207 408l100-3v70l-100 5Z" fill="#0b252b" stroke="#bad5cf" strokeWidth="1.5" />
      <path className="heyi-window__light" d="M94 418l88-2v55l-88 4Z" fill="#9a8859" opacity=".45" />
      <path d="M89 412l98-2v70l-98 5ZM207 407l100-3v70l-100 5Z" fill="none" stroke="#c0c4aa" strokeWidth="1.2" />
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
      <path d="M73 547l261-22 22 7-275 23Z" fill="#45554e" stroke="#9ba998" strokeWidth="1" />
      <path d="M271 482l20-1v33l-20 2Z" fill="#071519" stroke="#adc4bf" strokeWidth="1" />
      <circle cx="279" cy="496" r="2" fill="#d0d7c7" />
      <path d="M80 532v-20h34v18m0-14h9" stroke="#759ca0" strokeWidth="1" />
      <text x="200" y="373" textAnchor="middle" fill="#c9d4cb" fontSize="14" letterSpacing="5">门卫室</text>
      {route === 'wu' && <g><path d="M60 480l28 10M330 467l-22 11" stroke="#a6b8bf" strokeWidth="3" /><circle cx="330" cy="465" r="5" fill="#a7c0c4" /></g>}
    </g>
    <g>
      <path d="M365 230H792V500L365 529Z" fill="#071215" fillOpacity=".14" stroke="#b5d2cf" strokeWidth="2" />
      <path d="M365 230H792V306L365 311Z" fill="#081317" stroke="#d7e4d8" strokeWidth="1.5" />
      <path d="M365 230l17-19h394l16 19H365Z" fill="#68766a" stroke="#d8d0b5" strokeWidth="1.6" />
      <path d="M382 211l13-8h368l13 8Z" fill="#303b36" stroke="#b6b9a5" strokeWidth="1" />
      <path d="M365 230h427v13H365Z" fill="#1b2c2e" stroke="#c6cbb4" strokeWidth="1.2" />
      <path d="M382 216h394m-391 7h388" stroke="#c8c2a7" strokeWidth="1" />
      <path d="M377 239l403-2M377 245l403-2M377 297l403-5" stroke="#447780" strokeWidth="1" />
      {[388, 409, 754, 776].map(x => <g key={x}><circle cx={x} cy="252" r="2.1" fill="#a3bcbb" /><circle cx={x} cy="286" r="2.1" fill="#a3bcbb" /></g>)}
      <path d="M375 311V522M780 306V503M375 330L780 326M375 351L780 347" stroke="#78b5ba" strokeWidth="2" />
      <path d="M375 373L574 361L780 370M375 522L574 501L780 503" fill="none" stroke="#7ab4bb" strokeWidth="1.5" />
      {Array.from({length: 17}, (_, i) => <path key={i} d={'M' + (385+i*23) + ' 352V' + (520-i)} stroke="#8cb8b9" strokeWidth="1.25" />)}
      {Array.from({length: 8}, (_, i) => <path key={i} d={'M' + (394+i*46) + ' 391l23 120m-23-91 23-29'} fill="none" stroke="#365f67" strokeWidth=".9" />)}
      <path d="M574 352V501M574 374l-12 18m13-18 11 18" stroke="#c9d7ce" strokeWidth="2" />
      <path d="M365 230L379 215H778L792 230Z" fill="#102127" stroke="#d4dfd2" strokeWidth="2" />
      <path d="M382 222h392M369 313h420M369 321h420" stroke="#83aeb1" strokeWidth="1" />
      <path d="M365 231l-13 2v297l23-2V311M792 230l14 2v269l-26 3V306" fill="#283632" stroke="#a2c8c7" strokeWidth="2" />
      <path d="M352 233l-10 6v295l10-4ZM806 233l12 7v257l-12 4Z" fill="#1a2223" stroke="#758c87" strokeWidth="1.2" />
      <path d="M342 239l-10 10v291l10-6ZM818 240l12 11v246l-12 0Z" fill="#25302e" stroke="#9aa99b" strokeWidth="1" />
      <path d="M333 249l-6 4v286l5 1M829 251l6 5v242l-6-1" fill="none" stroke="#5f726c" strokeWidth="1.4" />
      <path d="M357 240v278m6-278v278m426-276v247m9-248v247" stroke="#457884" strokeWidth="1" />
      <path d="M347 530l33-3 8 7-47 4ZM779 501l25-3 9 7-43 5Z" fill="#0c2027" stroke="#abc7c2" strokeWidth="1.2" />
      <path d="M327 540l52-10 27 10-71 12ZM768 507l48-9 22 10-65 13Z" fill="#4c5b51" stroke="#b3bda7" strokeWidth="1" />
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

    <g className="heyi-hotspots">{HOTSPOTS.map(zone => <path key={zone.id} d={zone.path} className={active === zone.id ? 'is-active' : ''}
      role="button" tabIndex={0} aria-label={'观察' + snapshot.zones[zone.id].label + '：' + snapshot.zones[zone.id].description}
      onPointerEnter={event => onPointer(event, zone.id)} onPointerMove={event => onPointer(event, zone.id)}
      onPointerLeave={() => onZone(null)} onFocus={() => onZone(zone.id, zone.anchor)} onBlur={() => onZone(null)}
      onClick={() => onZone(zone.id, zone.anchor)}
      onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); onZone(zone.id, zone.anchor); } }} />)}</g>
    <RouteForeground route={route} active={active} snapshot={snapshot} onZone={onZone} onPointer={onPointer} />
    <Person x={route === 'despair' ? 535 : 467} y={562} tired={mood === 'weary' || mood === 'ruin' || route === 'wu'} stride={1} active={active} snapshot={snapshot} onZone={onZone} onPointer={onPointer} />
    {route !== 'despair' && <Person x={552} y={573} tired={mood === 'ruin' || route === 'jidi' || route === 'wu'} stride={2} active={active} snapshot={snapshot} onZone={onZone} onPointer={onPointer} />}
    {route !== 'despair' && <Person x={654} y={568} tired={mood === 'weary' || mood === 'ruin' || route === 'jidi' || route === 'wu'} stride={3} active={active} snapshot={snapshot} onZone={onZone} onPointer={onPointer} />}
    {route !== 'despair' && <Person x={868} y={531} teacher tired={route === 'jidi_riot' || route === 'wu'} active={active} snapshot={snapshot} onZone={onZone} onPointer={onPointer} />}
    {unrest && <g className="heyi-ember"><path d="M719 406l8-32 11 22 10-39 9 50Z" fill="#8e382c" stroke="#d18b67" /><path d="M754 432l6-23 8 12 8-31 10 44Z" fill="#772b24" stroke="#cb7656" /></g>}

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
