import { useState } from 'react';
import type { GameEvent } from '../types';
import { getEventArtwork } from '../config/eventArtwork';

export default function EventIllustration({event,legacyImage,fallback}:{event:GameEvent;legacyImage:string;fallback:string}) {
  const art=getEventArtwork(event);
  const [failed,setFailed]=useState(false);
  const label=event.title+'配图';
  if(!art||art.kind==='scene'||failed) return <img data-event-art-main data-fallback={failed?'true':undefined} src={failed?fallback:art?.kind==='scene'?art.src:legacyImage} alt={label} decoding="async" draggable={false}
    onError={e=>{if(e.currentTarget.dataset.fallback)return;e.currentTarget.dataset.fallback='true';e.currentTarget.src=fallback;}} />;
  return <div className={'event-illustration event-illustration--'+art.kind} data-art-theme={art.theme} role="img" aria-label={label}>
    <svg className="event-illustration__engraving" viewBox="0 0 600 400" aria-hidden="true">
      <defs><linearGradient id={'paper-'+event.id} x2="1" y2="1"><stop stopColor="#314448"/><stop offset="1" stopColor="#0b151b"/></linearGradient></defs>
      <path d="M55 315V90L170 48H528V316Z" fill={'url(#paper-'+event.id+')'} stroke="currentColor" strokeWidth="1"/>
      <path d="M55 90H170V48M170 90H528M42 330H548M70 344H525M80 359H495M196 108H499M196 122H421" fill="none" stroke="currentColor" strokeWidth="1"/>
      <circle cx="288" cy="202" r="119" fill="#070d1155" stroke="currentColor" strokeWidth="1"/>
      <circle cx="288" cy="202" r="106" fill="none" stroke="currentColor" strokeWidth=".7"/>
      <path d="M28 25H100M28 25V63M572 375H500M572 375V337" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
    <img data-event-art-main className="event-illustration__subject" src={art.primary} alt="" decoding="async" draggable={false} onError={()=>setFailed(true)}/>
    <div className="event-illustration__seal"><img src={art.secondary} alt="" decoding="async" draggable={false} onError={()=>setFailed(true)}/></div>
    <span className="event-illustration__rule" aria-hidden="true"/>
  </div>;
}
