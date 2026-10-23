import { useId, type CSSProperties } from 'react';
import type { GameState } from '../types';
import { getHeyiLightSnapshot, type HeyiRoute } from '../engine/heyiLight';
import { getCampusArtScene, getCampusArtChapter, getCampusArtBranch } from '../engine/campusArt';
import { getStructureProfile } from './CampusStructures';
import { BADGE_BACKDROP_ART } from '../config/campaignArtwork';

const THEMES: Record<HeyiRoute,string> = {opening:'school',uprising:'coalition',democracy:'democracy',revolution:'red',reform:'red',despair:'despair',haobang:'haobang',yang:'study',jidi:'corporate',jidi_riot:'despair',gouxiong:'culture',wu:'military'};
const PALETTES: Record<string,[string,string,string]> = {
  school:['#a48e6b','#5b574d','#dcc695'], coalition:['#a48b73','#655747','#c8926e'],
  democracy:['#acb6b0','#566d73','#c9d7c1'], red:['#a39884','#665d51','#d09a79'],
  haobang:['#b8aa85','#636e62','#ded6b1'], study:['#a4ac91','#58675b','#d6d7ac'],
  corporate:['#ac9470','#5e6159','#dec18d'], culture:['#a998b0','#64566f','#d2b7d1'],
  military:['#899698','#424f59','#b4c4c0'], security:['#7c8580','#404846','#a5afa5'],
  despair:['#807b70','#454841','#b9a88c'],
};

/** Uses exactly the scene's existing route/chapter/branch decisions; no extra game state. */
export function getHeyiSpiritAppearance(state?:GameState) {
  const snapshot=state?getCampusArtScene(state,getHeyiLightSnapshot(state)):undefined;
  const route=snapshot?.route??'opening', chapter=state&&snapshot?getCampusArtChapter(state,snapshot):0;
  const branch=state?getCampusArtBranch(state):'standard';
  const mood=snapshot?.mood??'restless';
  const theme=branch==='nkpd'?'security':branch==='spring'?'democracy':THEMES[route];
  return {route,chapter,branch,mood,theme,value:snapshot?.value??50,profile:getStructureProfile(route,chapter,branch),key:`${route}-${chapter}-${branch}-${mood}`};
}

/** A miniature campus crest, rather than a second button or a numeric status tile. */
export default function HeyiLightSpirit({state}:{state?:GameState}) {
  const appearance=getHeyiSpiritAppearance(state);
  const {route,chapter,branch,mood,theme,profile}=appearance;
  const [stone,shade,edge]=PALETTES[theme];
  const id=useId().replace(/:/g,'');
  const floors=profile.body.floors, height=23+floors*11, top=101-height;
  const isRuin=mood==='ruin'||route==='despair'||route==='jidi_riot';
  const isOpen=profile.gate.open&&branch!=='nkpd';
  const point=(side:number,u:number,v:number):[number,number]=> side===0?[30+55*u,top-13+13*u+height*v]:[85+51*u,top-14*u+height*v];
  const poly=(side:number,u:number,v:number,w:number,h:number)=>[point(side,u,v),point(side,u+w,v),point(side,u+w,v+h),point(side,u,v+h)].map(p=>p.join(',')).join(' ');
  const line=(side:number,u:number,v:number,w:number,h:number)=>`M${point(side,u,v).join(' ')}L${point(side,u+w,v+h).join(' ')}`;
  const left=poly(0,0,0,1,1),right=poly(1,0,0,1,1);
  return <span className={`strategic-art strategic-art--spirit heyi-spirit heyi-spirit--${mood}`} data-art-kind="campus" data-heyi-badge={appearance.key} aria-hidden="true">
    <svg viewBox="0 0 160 140" focusable="false">
      <defs>
        <linearGradient id={id+'-stone'} x2="1" y2="1"><stop stopColor={stone}/><stop offset="1" stopColor={shade}/></linearGradient>
        <linearGradient id={id+'-roof'} x2="0" y2="1"><stop stopColor={edge}/><stop offset="1" stopColor={shade}/></linearGradient>
      </defs>
      <image href={BADGE_BACKDROP_ART[theme]} x="0" y="29" width="160" height="112"/>
      <path d="M20 112L79 126L147 108L92 91Z" fill="#1b2625" stroke={edge} strokeWidth="1"/>
      <path d="M20 112v5l59 14 68-18v-5L79 126Z" fill="#111a19" stroke={shade} strokeWidth="1"/>
      <g strokeLinejoin="round">
        <polygon points={left} fill={'url(#'+id+'-stone)'} stroke={edge} strokeWidth="1.4"/>
        <polygon points={right} fill={shade} stroke={edge} strokeWidth="1.4"/>
        <path d={`M30 ${top-13}L80 ${top-27}L136 ${top-14}L85 ${top}Z`} fill={'url(#'+id+'-roof)'} stroke={edge} strokeWidth="1.3"/>
        {profile.body.roof==='gable'&&<path d={`M27 ${top-14}L53 ${top-31}L111 ${top-31}L139 ${top-15}L85 ${top-1}Z`} fill={shade} stroke={edge} strokeWidth="1.4"/>}
        {profile.body.roof==='sawtooth'&&<path d={`M30 ${top-13}l12-13 6 16 12-13 6 17 12-13 7 19 18-16 6 10 15-13 12 6v5L85 ${top}Z`} fill={stone} stroke={edge} strokeWidth="1.4"/>}
        {profile.body.clock&&<g><circle cx="83" cy={top+6} r="5" fill="#152225" stroke={edge}/><path d={`M83 ${top+2}v4l3 1`} stroke={edge} fill="none"/></g>}
        {[0,1].map(side=><g key={side}>
          {Array.from({length:floors},(_,row)=><g key={row}>
            <path d={line(side,0,(row+1)/floors,1,0)} fill="none" stroke={edge} strokeWidth=".8"/>
            {Array.from({length:chapter===2?4:3},(_,col)=>{
              const count=chapter===2?4:3,u=.08+col*.84/count,v=.15+row*.8/floors,w=.62/count,h=.46/floors;
              const center=point(side,u+w/2,v+h/2), phase=side*7+row*3+col;
              const lit=!isRuin&&(phase%4!==0||mood==='bright');
              return <g key={col}>
                <polygon points={poly(side,u-.015,v-.02,w+.03,h+.04)} fill="#252e2a" stroke={edge} strokeWidth=".85"/>
                <polygon points={poly(side,u,v,w,h)} fill="#0d191b"/>
                {lit&&<polygon className="heyi-spirit__window" points={poly(side,u+.012,v+.012,w-.024,h-.024)} fill={mood==='weary'?'#bd945d':'#e2c98a'} style={{'--window-delay':`${-phase*1.43}s`,'--window-time':`${8+phase%5*2}s`} as CSSProperties}/>}
                {profile.body.windows==='arch'&&<path d={`M${point(side,u,v+h).join(' ')}L${point(side,u,v+h*.4).join(' ')}Q${point(side,u+w/2,v-h*.35).join(' ')} ${point(side,u+w,v+h*.4).join(' ')}L${point(side,u+w,v+h).join(' ')}`} stroke={edge} fill="none" strokeWidth="1"/>}
                <path d={line(side,u+w/2,v,0,h)+line(side,u,v+h*.55,w,0)+line(side,u-.02,v+h+.025,w+.04,0)} stroke={edge} fill="none" strokeWidth=".65"/>
                {(profile.body.windows==='shutter'||isRuin&&phase%3===0)&&<path d={line(side,u,v,w,h)+line(side,u,v+h,w,-h)} stroke={stone} strokeWidth="2" fill="none"/>}
                {profile.body.balcony&&row===floors-2&&<path d={line(side,u-.03,v+h+.08,w+.06,0)+line(side,u-.03,v+h+.08,0,-h*.35)+line(side,u+w+.03,v+h+.08,0,-h*.35)} fill="none" stroke={edge} strokeWidth=".9"/>}
                <circle cx={center[0]} cy={center[1]} r=".2" fill={edge}/>
              </g>;
            })}
          </g>)}
        </g>)}
        {profile.body.arcade&&<g fill="#152023" stroke={edge} strokeWidth="1.2">{[0,1,2].map(i=><path key={i} d={`M${37+i*14} ${94+i*3}v-12q5-9 10 2v12Z`}/>)}</g>}
        {route==='gouxiong'&&<g><path d="M38 80l40 10 49-13v10L78 101 38 91Z" fill="#4b355c" stroke="#baa5c0"/><path d="M48 83l19 5m21 3 25-8" stroke="#d0b8be" strokeWidth="2"/></g>}
        {route==='jidi'&&<g><path d="M97 70l32-9v28l-32 9Z" fill="#252c27" stroke={edge}/>{[0,1,2].map(i=><path key={i} d={`M99 ${76+i*7}l28-8`} stroke={stone}/>)}<path d="M115 92v13l17-5V87Z" fill="#8d7041" stroke={edge}/></g>}
        {(route==='uprising'||route==='revolution'||route==='reform')&&<g><path d={`M43 ${top-10}v-20l20 4-3 13-17-4`} fill="#873f35" stroke="#d39973" strokeWidth="1"/>{route==='reform'&&<path d="M37 105l14-4 13 5v10l-13-5-14 4Z M51 101v10" fill="#d2c6a5" stroke="#6a7460"/>}</g>}
        {route==='haobang'&&<g><path d="M35 103l31 8-12 4-31-8Z" fill="#a1936b" stroke={edge}/><path d="M30 109v8m27-1v7" stroke={edge} strokeWidth="2"/></g>}
        {route==='yang'&&<g><path d="M33 97l17-4 14 4-17 5Z M33 101l17-4 14 4-17 5Z M33 105l17-4 14 4-17 5Z" fill="#c7c0a2" stroke="#7c886e" strokeWidth="1"/></g>}
        <path d="M59 114v-15l8-2v17m60-17v-15l8-2v16" stroke={edge} fill={stone} strokeWidth="1.2"/>
        <path d="M56 99l77-21v5l-77 21Z" fill={shade} stroke={edge}/>
        <path d="M66 104l59-16v3l-59 16Z" fill="#adab8c" stroke={edge} strokeWidth=".8"/>
        {!isOpen&&<g stroke={edge} strokeWidth="1.4"><path d="M69 112l51-14M74 102v8m9-11v9m9-12v10m9-12v10m9-13v10M78 102l22 1 14-11"/></g>}
        {(route==='wu'||branch==='nkpd')&&branch!=='spring'&&<g><path d="M101 112l36-10 5 6-36 10Z" fill="#b1a487" stroke="#3c4948"/><path d="M110 110l4 5m6-8 4 5m6-8 4 5" stroke="#303c3a" strokeWidth="3"/><path className="heyi-spirit__searchlight" d="M135 77L151 49L146 85Z" fill="#ddcd9260"/></g>}
        {isRuin&&<g><path d={`M42 ${top-10}l4 14-7 18 11 12-4 22M121 ${top+4}l-7 17 9 11-8 18`} fill="none" stroke="#343b34" strokeWidth="2"/><path d="M25 115l12-5 8 8-13 2m88-1 10-7 12 3-13 7" fill="#736957" stroke="#ac9a77"/></g>}
        {route==='jidi_riot'&&<g className="heyi-spirit__embers" fill="#c58148" stroke="#e2b56b"><path d="M104 74q-8-9 0-19-2 9 5 12 3 8-5 7M54 86q-6-10 0-18 0 8 5 11 2 7-5 7"/></g>}
        {mood!=='ruin'&&<g stroke={mood==='bright'?'#92b192':'#7b8c76'} strokeWidth="1.4"><path d="M26 100V80m-3 10-5-4m8 1 6-5M143 96V76l6-5m-6 9-5-4"/><path d="M20 79q-4-9 3-12 7-7 11 2 6 6-2 11Z" fill={mood==='bright'?'#617e63':'#605f47'}/></g>}
        {Array.from({length:mood==='ruin'?1:mood==='bright'?4:2},(_,i)=><g key={i} transform={`translate(${76+i*10} ${114-i*2})`} fill={i%2?'#95a5a0':'#b4b8a1'}><circle cy="-8" r="1.7"/><path d="M-1-5h2l1 5-2 3-2-1 1-3Z"/><path d="M-1 2l-1 4m2-4 2 3" stroke={edge} strokeWidth="1"/></g>)}
      </g>
    </svg>
  </span>;
}
