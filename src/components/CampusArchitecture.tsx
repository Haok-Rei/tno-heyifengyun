import { memo } from 'react';
import type { HeyiRoute } from '../engine/heyiLight';
import { HORIZON, INK, EDGE, BLACK, path, at, inset, geometry, FaceLines, Plate, Box, Observe, Wheel, Bicycle, Bench, Table, Kiosk, Canopy, Cone, Barrier, Fire, SmallFigure, Flag, Chair, Van, Speaker, streetPoint, type Point, type Face, type Observation } from './campusPrimitives';

function CampusArchitecturalEngraving({ route, chapter }: { route: HeyiRoute; chapter: 0 | 1 | 2 }) {
  const left: Face = [{ x: 80, y: 137 }, { x: 720, y: 75 }, { x: 720, y: 435 }, { x: 80, y: 377 }];
  const right: Face = [{ x: 720, y: 75 }, { x: 1160, y: 127 }, { x: 1160, y: 386 }, { x: 720, y: 435 }];
  const room = (side: 'l' | 'r', row: number, col: number, n: number) => {
    const face = side === 'l' ? left : right;
    const u = (col + .18) / n, v = .055 + row * .242, w = .62 / n, h = .165;
    return { face, win: inset(face, u, v, w, h), u, v, w, h };
  };
  const roomPrefix = 'engraving-room-';
  const detail = (side: 'l' | 'r', row: number, col: number, n: number, route: HeyiRoute) => {
    const { face, win, u, v, w, h } = room(side, row, col, n);
    const id = `${roomPrefix}${side}-${row}-${col}`;
    const s = side === 'l' ? -1 : 1;
    const cx = (win[0].x + win[1].x) / 2;
    const cy = (win[0].y + win[2].y) / 2;
    const top = win[0].y, bot = win[2].y;
    const mid = (top + bot) / 2;
    const wd = win[1].x - win[0].x;
    const deskY = .82;
    const interiorRoute = (row + col * 2) % 3 === 0 || route === "jidi_riot" || route === "despair" ? route : "opening";
    return <g key={id} pointerEvents="none" aria-hidden="true">
      <defs><clipPath id={`${id}-clip`}><path d={path(win, true)} /></clipPath></defs>
      <g clipPath={`url(#${id}-clip)`}>
        <path d={path(inset(win, 0, 0, 1, 1), true)} fill="#050c0f" stroke="#8fa6a1" strokeWidth=".6" />
        {(row+col)%3!==1 && <path className="heyi-window__light" d={path(inset(win,.04,.04,.92,.92),true)} fill={route==='jidi'?'#a09051':'#a69a6d'} opacity=".07"/>}
        {interiorRoute === 'opening' && <g fill="none" stroke="#5e7876" strokeWidth=".45"><path d={path([at(win,.1,.21),at(win,.88,.21),at(win,.88,.49),at(win,.1,.49)],true)}/><path d={path([at(win,.13,.77),at(win,.87,.77)])+path([at(win,.2,.77),at(win,.2,.93)])+path([at(win,.8,.77),at(win,.8,.93)])}/><path d={path([at(win,.21,.33),at(win,.57,.33)])+path([at(win,.21,.4),at(win,.73,.4)])} stroke="#a7a48a"/></g>}
        <path d={path(inset(win, .03, .03, .94, .94), true)} fill="none" stroke="#4e6a6e" strokeWidth=".35" />
        {interiorRoute === 'jidi' && <>
          <path d={path(inset(win, .05, .08, .9, .07), true)} fill={col % 2 ? '#8f9b77' : '#9caa89'} opacity=".2" />
          <path d={path([at(win, .1, deskY), at(win, .9, deskY)])} stroke="#7a8a7a" strokeWidth="1" />
          <path d={path([at(win, .14, deskY), at(win, .14, .72)])} stroke="#7f8f7d" strokeWidth=".8" />
          <path d={path([at(win, .86, deskY), at(win, .86, .72)])} stroke="#7f8f7d" strokeWidth=".8" />
          {[.19, .37, .55, .73].map((u2, i) => <path key={u2} d={path([at(win, u2, deskY -.02), at(win, u2 + .09, deskY -.02)])} stroke="#b7bda4" strokeWidth=".6" />)}
          <path d={path(inset(win, .38, .19, .24, .2), true)} fill="#0b1616" stroke="#c2b88d" strokeWidth=".7" />
          <path d={path(inset(win, .41, .24, .18, .03), true)} fill="#a99a64" opacity=".5" />
          <path d={path([at(win, .42, .31), at(win, .58, .31)])} stroke="#c1b88f" strokeWidth="1.6" strokeDasharray="2 2" />
          <path d={path([at(win, .08, .36), at(win, .92, .36)])} stroke="#b3ab88" strokeWidth=".8" />
          <path d={path([at(win, .28, .36), at(win, .28, .43)])} stroke="#b3ab88" strokeWidth=".6" />
          <path d={path([at(win, .72, .36), at(win, .72, .43)])} stroke="#b3ab88" strokeWidth=".6" />
          <g transform={`translate(${at(win, .22, .86).x} ${at(win, .22, .86).y}) scale(${(bot-top)/72})`}><SmallFigure x={0} y={0} role="student" pose="sit" /></g>
          <g transform={`translate(${at(win, .62, .86).x} ${at(win, .62, .86).y}) scale(${(bot-top)/72})`}><SmallFigure x={0} y={0} role="student" pose="sit" /></g>
        </>}
        {interiorRoute === 'democracy' && <>
          <ellipse cx={at(win, .5, .55).x} cy={at(win, .5, .55).y} rx={wd * .3} ry={(bot - top) * .2} fill="#0b1517" stroke="#8da49c" strokeWidth=".7" />
          <path d={path([at(win, .18, .18), at(win, .5, .38), at(win, .84, .18)])} stroke="#9db0a2" strokeWidth=".8" fill="none" />
          <path d={path([at(win, .2, .3), at(win, .2, .42), at(win, .8, .42), at(win, .8, .3)])} stroke="#aab99f" strokeWidth=".5" fill="none" />
          {[.28, .5, .72].map((u2, i) => <path key={u2} d={path([at(win, u2, .42), at(win, u2, .52), at(win, u2 + .03, .56), at(win, u2-.02, .58)])} stroke="#b3c0a7" strokeWidth=".6" fill="none" />)}
          <path d={path([at(win, .1, .55), at(win, .9, .55)])} stroke="#879c93" strokeWidth="1.2" />
          <g transform={`translate(${at(win, .2, .72).x} ${at(win, .2, .72).y}) scale(${(bot-top)/72})`}><SmallFigure x={0} y={0} role="student" pose="talk" /></g>
          <g transform={`translate(${at(win, .78, .72).x} ${at(win, .78, .72).y}) scale(${(bot-top)/72})`}><SmallFigure x={0} y={0} role="student" pose="talk" /></g>
        </>}
        {interiorRoute === 'yang' && <>
          <path d={path([at(win, .1, .2), at(win, .9, .2), at(win, .9, .42), at(win, .1, .42)])} stroke="#a49c84" strokeWidth=".4" fill="none" />
          {Array.from({ length: 4 }, (_, i) => <path key={i} d={path([at(win, .14, .23 + i * .045), at(win, .72, .23 + i * .045)])} stroke="#b5ad93" strokeWidth=".35" />)}
          <path d={path([at(win, .18, deskY), at(win, .82, deskY)])} stroke="#8a9486" strokeWidth="1" />
          <path d={path([at(win, .28, deskY), at(win, .27, .5), at(win, .3, .48)])} stroke="#c7bc98" strokeWidth=".8" fill="none" />
          <path d={path([at(win, .26, .47), at(win, .3, .47), at(win, .31, .4), at(win, .25, .4)])} stroke="#b8ac85" strokeWidth=".6" fill="#0f1a18" />
          <path d={path([at(win, .58, deskY -.01), at(win, .7, deskY -.01), at(win, .72, .52), at(win, .6, .52)])} stroke="#9b9279" strokeWidth=".5" fill="none" />
          <path d={path([at(win, .5, .48), at(win, .5, .56)])} stroke="#b8a97e" strokeWidth=".5" />
          <g transform={`translate(${at(win, .46, .8).x} ${at(win, .46, .8).y}) scale(${(bot-top)/72})`}><SmallFigure x={0} y={0} role="teacher" pose="sit" /></g>
        </>}
        {interiorRoute === 'wu' && <>
          <path d={path([at(win, .12, .3), at(win, .88, .3)])} stroke="#98a89a" strokeWidth=".7" />
          <path d={path([at(win, .2, .3), at(win, .2, .65)])} stroke="#8fa096" strokeWidth=".5" />
          <path d={path([at(win, .8, .3), at(win, .8, .65)])} stroke="#8fa096" strokeWidth=".5" />
          <path d={path(inset(win, .42, .38, .16, .08), true)} fill="#0c1717" stroke="#b0a37b" strokeWidth=".6" />
          <path d={path([at(win, .38, .52), at(win, .62, .52)])} stroke="#b5aa82" strokeWidth=".7" />
          <path d={path([at(win, .38, .52), at(win, .38, .58)])} stroke="#b5aa82" strokeWidth=".5" />
          <path d={path([at(win, .62, .52), at(win, .62, .58)])} stroke="#b5aa82" strokeWidth=".5" />
          <path d={path([at(win, .25, .72), at(win, .75, .72)])} stroke="#687d75" strokeWidth=".8" strokeDasharray="5 3" />
          <g transform={`translate(${at(win, .5, .8).x} ${at(win, .5, .8).y}) scale(${(bot-top)/72})`}><SmallFigure x={0} y={0} role="steward" pose="stand" /></g>
        </>}
        {interiorRoute === 'jidi_riot' && <>
          <path d={path([at(win, 0, .14), at(win, .55, .4), at(win, .3, .7), at(win, .75, .88), at(win, 1, .64)])} stroke="#bd8f76" strokeWidth="1" fill="none" />
          <path d={path([at(win, .05, .32), at(win, .95, .42)])} stroke="#9a8873" strokeWidth=".5" />
          <path d={path([at(win, .1, .5), at(win, .9, .5)])} stroke="#a89378" strokeWidth=".4" />
          <path d={path(inset(win, .3, .55, .08, .11), true)} fill="#0e1b1a" stroke="#b19a77" strokeWidth=".7" />
          <path d={path([at(win, .32, .57), at(win, .36, .57), at(win, .36, .59), at(win, .32, .59)])} fill="#a97a61" opacity=".5" />
          <path d={path([at(win, .64, .55), at(win, .72, .55), at(win, .72, .66), at(win, .64, .66)])} fill="none" stroke="#b57e6b" strokeWidth=".8" />
          <path d={path([at(win, .64, .55), at(win, .72, .66)])} stroke="#b57e6b" strokeWidth=".5" />
          <path d={path([at(win, .72, .55), at(win, .64, .66)])} stroke="#b57e6b" strokeWidth=".5" />
        </>}
        {interiorRoute === 'despair' && <>
          <path d={path([at(win, .02, .08), at(win, .58, .42), at(win, .3, .75), at(win, .92, .94)])} stroke="#b78974" strokeWidth=".9" fill="none" />
          <path d={path([at(win, .4, .1), at(win, .26, .36), at(win, .46, .54)])} stroke="#ba907a" strokeWidth=".7" fill="none" />
          <path d={path([at(win, .08, .58), at(win, .92, .58)])} stroke="#6e7e72" strokeWidth=".6" />
          <path d={path([at(win, .16, .58), at(win, .18, .72)])} stroke="#6e7e72" strokeWidth=".4" />
          <path d={path([at(win, .84, .58), at(win, .82, .72)])} stroke="#6e7e72" strokeWidth=".4" />
          {[.24, .42, .58, .74].map((u2, i) => <path key={u2} d={path([at(win, u2, .74), at(win, u2 + .04, .66), at(win, u2 + .08, .78)])} stroke="#8d957f" strokeWidth=".4" fill="none" />)}
        </>}
        {interiorRoute === 'revolution' && <>
          <path d={path([at(win, .08, .18), at(win, .92, .18), at(win, .92, .32), at(win, .08, .32)])} fill="#0a1414" stroke="#a29b7f" strokeWidth=".6" />
          <path d={path([at(win, .12, .21), at(win, .88, .21)])} stroke="#b7ac8d" strokeWidth=".6" strokeDasharray="3 2" />
          <path d={path([at(win, .22, .48), at(win, .78, .48)])} stroke="#97a28a" strokeWidth=".8" />
          <path d={path([at(win, .22, .48), at(win, .18, .62), at(win, .82, .62), at(win, .78, .48)])} stroke="#8b937c" strokeWidth=".5" fill="none" />
          <path d={path(inset(win, .36, .5, .12, .08), true)} fill="#0b1514" stroke="#b3a887" strokeWidth=".6" />
          <path d={path([at(win, .3, .66), at(win, .7, .66), at(win, .7, .76), at(win, .3, .76)])} fill="none" stroke="#a49b80" strokeWidth=".6" />
          <path d={path([at(win, .3, .66), at(win, .7, .76), at(win, .3, .76), at(win, .7, .66)])} stroke="#a49b80" strokeWidth=".4" />
          <path d={path([at(win, .12, .82), at(win, .34, .76), at(win, .58, .8), at(win, .88, .74)])} stroke="#9a9175" strokeWidth=".7" fill="none" />
          <g transform={`translate(${at(win, .34, .88).x} ${at(win, .34, .88).y}) scale(${(bot-top)/72})`}><SmallFigure x={0} y={0} role="student" pose="talk" /></g>
          <g transform={`translate(${at(win, .68, .88).x} ${at(win, .68, .88).y}) scale(${(bot-top)/72})`}><SmallFigure x={0} y={0} role="student" pose="sit" /></g>
        </>}
        {interiorRoute === 'gouxiong' && <>
          <path d={path([at(win, .1, .18), at(win, .9, .18), at(win, .9, .32), at(win, .1, .32)])} stroke="#b79fb2" strokeWidth=".6" fill="none" />
          <path d={path([at(win, .2, .24), at(win, .8, .24)])} stroke="#bca4b6" strokeWidth=".5" strokeDasharray="2 3" />
          <path d={path([at(win, .16, .48), at(win, .26, .48), at(win, .26, .64), at(win, .16, .64)])} stroke="#a99b88" strokeWidth=".6" fill="none" />
          <path d={path([at(win, .5, .44), at(win, .62, .44), at(win, .62, .62), at(win, .5, .62)])} stroke="#a99b88" strokeWidth=".6" fill="none" />
          <path d={path([at(win, .5, .5), at(win, .62, .5), at(win, .62, .54), at(win, .5, .54)])} stroke="#bea987" strokeWidth=".7" fill="none" />
          <path d={path([at(win, .74, .46), at(win, .86, .46), at(win, .84, .64), at(win, .76, .64)])} stroke="#a99b88" strokeWidth=".6" fill="none" />
          <path d={path([at(win, .02, .72), at(win, .98, .72)])} stroke="#9a8f7b" strokeWidth=".8" />
          <g transform={`translate(${at(win, .28, .82).x} ${at(win, .28, .82).y}) scale(${(bot-top)/72})`}><SmallFigure x={0} y={0} role="student" pose="stand" /></g>
          <g transform={`translate(${at(win, .72, .82).x} ${at(win, .72, .82).y}) scale(${(bot-top)/72})`}><SmallFigure x={0} y={0} role="student" pose="talk" /></g>
        </>}
        {(route === 'uprising' || route === 'revolution') && <g transform={`translate(${at(win, .8, .88).x} ${at(win, .8, .88).y}) scale(${(bot-top)/72})`}><SmallFigure x={0} y={0} role="student" pose="carry" /></g>}
      </g>
      <path d={path(inset(win, .02, .02, .96, .96), true)} fill="none" stroke="#7e9a98" strokeWidth=".35" strokeDasharray="2 2" opacity=".6" />
      <path d={path([at(win,.5,0),at(win,.5,1)])+path([at(win,0,.5),at(win,1,.5)])} stroke="#739a9f" strokeWidth=".65" fill="none"/>
    </g>;
  };
  const drain = (side: 'l' | 'r') => {
    const face = side === 'l' ? left : right;
    const u = side === 'l' ? .88 : .12;
    const topPt = at(face, u, .06), botPt = at(face, u, .92);
    return <g key={`drain-${side}`} pointerEvents="none" aria-hidden="true">
      <path d={path([topPt, botPt])} stroke="#698785" strokeWidth=".9" />
      {[.14, .34, .54, .74].map((v, i) => {
        const q = at(face, u, v);
        return <g key={i}>
          <path d={path([{ x: q.x - 4, y: q.y }, { x: q.x + 4, y: q.y }])} stroke="#a7b7a6" strokeWidth="1.2" />
          <circle cx={q.x} cy={q.y + 2} r="1.6" fill="#0b1517" stroke="#9caf9f" strokeWidth=".5" />
        </g>;
      })}
      {[.26, .58].map((v, i) => {
        const q = at(face, side === 'l' ? u - .03 : u + .03, v);
        return <path key={i} d={path([q, { x: q.x, y: q.y + 7 }, { x: q.x + (side === 'l' ? -3 : 3), y: q.y + 12 }])} stroke="#879c94" strokeWidth=".55" fill="none" />;
      })}
    </g>;
  };
  const acUnits = (side: 'l' | 'r') => {
    const face = side === 'l' ? left : right;
    const n = side === 'l' ? 9 : 6;
    const cols = side === 'l' ? [2, 6] : [1, 4];
    return cols.map((col, idx) => {
      const u = (col + .18) / n + .62 / n + .035;
      if (u > .93) return null;
      const v = .1 + (idx === 0 ? 0 : .48);
      const f = inset(face, u, v, .09, .07);
      return <g key={`ac-${side}-${col}`} pointerEvents="none" aria-hidden="true">
        <path d={path(f, true)} fill="#050c0f" stroke="#8aa39c" strokeWidth=".7" />
        <path d={path(inset(f, .08, .08, .84, .84), true)} fill="none" stroke="#5b7777" strokeWidth=".35" />
        {Array.from({ length: 5 }, (_, i) => <path key={i} d={path([at(f, .12, .12 + i * .15), at(f, .88, .12 + i * .15)])} stroke="#728f8a" strokeWidth=".4" />)}
        <path d={path([at(f, .45, .04), at(f, .55, .04), at(f, .55, .96), at(f, .45, .96)])} stroke="#6e8882" strokeWidth=".4" fill="none" />
      </g>;
    }).filter(Boolean);
  };
  const entrance = (() => {
    const f = inset(left, .245, .735, .42, .21);
    return <g pointerEvents="none" aria-hidden="true">
      <path d={path(f,true)} fill="#050c10" stroke="#abb6a7" strokeWidth=".9"/>
      <path d={path(inset(f,.035,.07,.93,.86),true)} fill="#0a171a" stroke="#617e80" strokeWidth=".6"/>
      <path d={path(inset(f,.07,.1,.22,.8),true)} fill="#030b0e" stroke="#a5b8ae" strokeWidth=".75"/>
      <path d={path(inset(f,.71,.1,.22,.8),true)} fill="#030b0e" stroke="#a5b8ae" strokeWidth=".75"/>
      <path d={path([at(f,.32,.08),at(f,.32,.92),at(f,.68,.92),at(f,.68,.08)],true)} fill="#081115" stroke="#aab9ac" strokeWidth=".85"/>
      <path d={path([at(f,.5,.08),at(f,.5,.92)])+path([at(f,.32,.64),at(f,.68,.64)])} stroke="#91a9a1" strokeWidth=".65"/>

      <path d={path([at(f, 0, 1), at(f, 0, 1.16), at(f, 1, 1.16), at(f, 1, 1)])} fill="#050b0e" stroke="#8fa6a1" strokeWidth=".85" />
      <path d={path([at(f, .02, 1.04), at(f, .98, 1.04)])} stroke="#7a938f" strokeWidth=".5" />
      <path d={path([at(f, .04, 1.09), at(f, .96, 1.09)])} stroke="#5f7a7a" strokeWidth=".4" />
      <path d={path([at(f, .06, 1.14), at(f, .94, 1.14)])} stroke="#4f696a" strokeWidth=".35" />
      {[.12, .36, .6, .84].map((u, i) => <path key={i} d={path([at(f, u, 1), at(f, u, 1.16)])} stroke="#6b8481" strokeWidth=".4" />)}
      <path d={path([at(f, .08, .32), at(f, .08, .72)])} stroke="#b3b39b" strokeWidth="1.1" />
      <path d={path([at(f, .66, .32), at(f, .66, .72)])} stroke="#b3b39b" strokeWidth="1.1" />
      <path d={path([at(f, .08, .32), at(f, .66, .32)])} stroke="#b3b39b" strokeWidth=".8" />
      <path d={path([at(f, .34, .03), at(f, .34, .72), at(f, .42, .72), at(f, .42, .03)])} stroke="#c8c9b0" strokeWidth="1" fill="none" />
      <path d={path([at(f, .37, .08), at(f, .37, .68)])} stroke="#cdcbb0" strokeWidth="1.6" />
      <path d={path([at(f, .8, .24), at(f, .8, .62), at(f, .94, .62), at(f, .94, .24)])} fill="#0b1719" stroke="#9da897" strokeWidth=".6" />
      <path d={path([at(f, .84, .3), at(f, .9, .3)])} stroke="#b8ae8b" strokeWidth=".6" />
      <path d={path([at(f, .84, .36), at(f, .9, .36)])} stroke="#b8ae8b" strokeWidth=".6" />
      {route === 'wu' && <SmallFigure x={at(f, .78, .90).x} y={at(f, .78, .90).y} role="steward" pose="stand" />}
      {route === 'despair' && <path d={path([at(f, .02, .12), at(f, .34, .52), at(f, .58, .2), at(f, .97, .74)])} stroke="#b58a78" strokeWidth=".9" fill="none" />}
    </g>;
  })();
  const roofRailing = (() => {
    const y = 70;
    return <g pointerEvents="none" aria-hidden="true">
      <path d="M105 132L705 72M118 126L700 68M105 132L118 126M705 72L700 68" stroke="#a9b9a8" strokeWidth=".8" fill="none" />
      {Array.from({ length: 17 }, (_, i) => {
        const t = i / 16;
        const x = 105 + (705 - 105) * t;
        const y0 = 132 + (72 - 132) * t;
        return <path key={i} d={`M${x.toFixed(1)} ${y0.toFixed(1)}V${(y0 - 8).toFixed(1)}`} stroke="#859c96" strokeWidth=".6" />;
      })}
      <path d="M720 66L1150 120M720 62L1150 116" stroke="#a9b9a8" strokeWidth=".8" fill="none" />
      {Array.from({ length: 13 }, (_, i) => {
        const t = i / 12;
        const x = 720 + (1150 - 720) * t;
        const y0 = 66 + (120 - 66) * t;
        return <path key={i} d={`M${x.toFixed(1)} ${y0.toFixed(1)}V${(y0 - 8).toFixed(1)}`} stroke="#859c96" strokeWidth=".6" />;
      })}
      <path d={path([at(left, .02, .01), at(left, .02, .03)])} stroke="#9eaf9e" strokeWidth=".7" />
      <path d={path([at(right, .02, .01), at(right, .02, .03)])} stroke="#9eaf9e" strokeWidth=".7" />
    </g>;
  })();
  const lightningRod = (() => {
    const anchor = { x: 720, y: 54 };
    return <g pointerEvents="none" aria-hidden="true">
      <path d={`M${anchor.x} ${anchor.y}V${anchor.y - 42}`} stroke="#c1c9b6" strokeWidth="1.1" />
      <path d={`M${anchor.x - 15} ${anchor.y - 42}L${anchor.x} ${anchor.y - 58}L${anchor.x + 15} ${anchor.y - 42}`} stroke="#8da6a1" strokeWidth=".8" fill="none" />
      <circle cx={anchor.x} cy={anchor.y - 58} r="2.2" fill="#0b1517" stroke="#c8bc97" strokeWidth=".7" />
      <path d={`M${anchor.x - 22} ${anchor.y - 30}L${anchor.x + 22} ${anchor.y - 30}M${anchor.x - 18} ${anchor.y - 26}L${anchor.x + 18} ${anchor.y - 26}`} stroke="#7f9692" strokeWidth=".5" />
    </g>;
  })();
  return <g className="campus-architectural-engraving" pointerEvents="none" aria-hidden="true">
    {Array.from({ length: 4 }, (_, row) => <g key={'l' + row}>{Array.from({ length: 9 }, (_, col) => detail('l', row, col, 9, route))}</g>)}
    {Array.from({ length: 4 }, (_, row) => <g key={'r' + row}>{Array.from({ length: 6 }, (_, col) => detail('r', row, col, 6, route))}</g>)}
    <g pointerEvents="none" aria-hidden="true">
      <path d={path([at(left, .02, .72), at(left, .98, .72)])} stroke="#6f8988" strokeWidth=".5" />
      <path d={path([at(left, .02, .735), at(left, .98, .735)])} stroke="#4f6a6b" strokeWidth=".4" />
      <path d={path([at(left, .02, .97), at(left, .98, .97)])} stroke="#7b918a" strokeWidth=".6" />
      <path d={path([at(left, .02, .985), at(left, .98, .985)])} stroke="#556f6e" strokeWidth=".4" />
      <path d={path([at(right, .02, .72), at(right, .98, .72)])} stroke="#6f8988" strokeWidth=".5" />
      <path d={path([at(right, .02, .735), at(right, .98, .735)])} stroke="#4f6a6b" strokeWidth=".4" />
      <path d={path([at(right, .02, .97), at(right, .98, .97)])} stroke="#7b918a" strokeWidth=".6" />
      <path d={path([at(right, .02, .985), at(right, .98, .985)])} stroke="#556f6e" strokeWidth=".4" />
      <path d={path([at(left, .02, .02), at(left, .02, .98)])} stroke="#5c7d7f" strokeWidth=".55" />
      <path d={path([at(right, .98, .02), at(right, .98, .98)])} stroke="#5c7d7f" strokeWidth=".55" />
      <path d={path([at(left, .98, .02), at(left, .98, .98)])} stroke="#47696c" strokeWidth=".4" />
      <path d={path([at(right, .02, .02), at(right, .02, .98)])} stroke="#47696c" strokeWidth=".4" />
    </g>
    {acUnits('l')}
    {acUnits('r')}
    {drain('l')}
    {drain('r')}
    {entrance}
    {roofRailing}
    {lightningRod}
    {chapter >= 1 && <g pointerEvents="none" aria-hidden="true">
      <path d={path([at(left, .02, .035), at(left, .98, .035)])} stroke="#8ea39a" strokeWidth=".5" />
      <path d={path([at(right, .02, .035), at(right, .98, .035)])} stroke="#8ea39a" strokeWidth=".5" />
      {route === 'revolution' && <path d={path([at(left, .12, .045), at(left, .62, .045)])} stroke="#b79484" strokeWidth="1" strokeDasharray="6 3" />}
      {route === 'gouxiong' && <path d={path([at(right, .2, .045), at(right, .8, .045)])} stroke="#b79fb2" strokeWidth=".8" strokeDasharray="3 4" />}
    </g>}
    {chapter >= 2 && <g pointerEvents="none" aria-hidden="true">
      <path d={path([at(left, .02, .955), at(left, .98, .955)])} stroke="#8d9f8f" strokeWidth=".45" />
      <path d={path([at(right, .02, .955), at(right, .98, .955)])} stroke="#8d9f8f" strokeWidth=".45" />
      {(route === 'jidi' || route === 'wu') && <path d={path([at(left, .1, .935), at(left, .52, .935)])} stroke="#b7ad86" strokeWidth=".8" strokeDasharray="2 2" />}
      {(route === 'democracy' || route === 'revolution') && <path d={path([at(right, .1, .93), at(right, .7, .93)])} stroke="#a59a7e" strokeWidth=".8" />}
    </g>}

  </g>;
}

export default memo(CampusArchitecturalEngraving);
