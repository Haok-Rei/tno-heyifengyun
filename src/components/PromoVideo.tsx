import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import Hls from 'hls.js';
import { X, Film, RotateCcw } from 'lucide-react';
import { AUDIO_SETTINGS_EVENT, readAudioSettings } from '../engine/audioSettings';
import { PROMO_VIDEO_AUDIO_START, PROMO_VIDEO_AUDIO_END } from '../engine/promoVideoAudio';
import './promoVideo.css';

export const PROMO_VIDEO_SOURCE='/media/pv-v2/index.m3u8';
export const PROMO_VIDEO_POSTER='/media/pv-v2/poster.webp';

/** The video and streaming client are mounted only after the player opens the film. */
export default function PromoVideo({onClose}:{onClose:()=>void}) {
  const videoRef=useRef<HTMLVideoElement>(null);
  const dialogRef=useRef<HTMLElement>(null);
  const closeRef=useRef<HTMLButtonElement>(null);
  const ownsAudio=useRef(false);
  const [attempt,setAttempt]=useState(0);
  const [error,setError]=useState('');
  const titleId=useId();
  const takeAudio=()=>{
    if(ownsAudio.current)return;
    ownsAudio.current=true;window.dispatchEvent(new Event(PROMO_VIDEO_AUDIO_START));
  };
  const releaseAudio=()=>{
    if(!ownsAudio.current)return;
    ownsAudio.current=false;window.dispatchEvent(new Event(PROMO_VIDEO_AUDIO_END));
  };

  useEffect(()=>{
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    closeRef.current?.focus();
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onClose();}};
    window.addEventListener('keydown',escape,true);
    return()=>{window.removeEventListener('keydown',escape,true);previous?.focus();};
  },[onClose]);

  useEffect(()=>{
    const video=videoRef.current;
    if(!video)return;
    let cancelled=false;
    let hls:Hls|undefined;
    takeAudio();setError('');
    const volume=()=>{const settings=readAudioSettings();video.volume=settings.masterVolume*settings.musicVolume/10000;};
    volume();window.addEventListener(AUDIO_SETTINGS_EVENT,volume);
    const fail=()=>{if(!cancelled){video.pause();hls?.stopLoad();setError('暂时无法播放，请重试。');releaseAudio();}};
    const play=()=>{if(!cancelled)void video.play().catch(()=>{/* Native controls remain available if autoplay is blocked. */});};
    video.addEventListener('error',fail);
    if(Hls.isSupported()) {
      hls=new Hls({enableWorker:false,maxBufferLength:24,maxMaxBufferLength:36,backBufferLength:12});
      hls.on(Hls.Events.MEDIA_ATTACHED,()=>hls?.loadSource(PROMO_VIDEO_SOURCE));
      hls.on(Hls.Events.MANIFEST_PARSED,play);
      hls.on(Hls.Events.ERROR,(_,data)=>{if(data.fatal)fail();});
      hls.attachMedia(video);
    } else if(video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src=PROMO_VIDEO_SOURCE;play();
    } else { setError('当前浏览器不支持此视频，请使用Chrome、Edge或Safari观看。');releaseAudio(); }
    return()=>{
      cancelled=true;video.removeEventListener('error',fail);video.removeEventListener('loadedmetadata',play);
      window.removeEventListener(AUDIO_SETTINGS_EVENT,volume);
      video.pause();hls?.destroy();video.removeAttribute('src');video.load();releaseAudio();
    };
  },[attempt]);

  const trapFocus=(event:ReactKeyboardEvent)=>{
    if(event.key!=='Tab')return;
    const items:HTMLElement[]=Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),video')??[]);
    const first=items[0],last=items.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  };

  return <div className="pv-overlay" onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
    <section ref={dialogRef} className="pv-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} onKeyDown={trapFocus}>
      <header className="pv-titlebar"><Film size={23} aria-hidden="true"/><div><small>THE HEFEI ORDER / PROMOTIONAL FILM</small><h2 id={titleId}>向合一奔去</h2></div><span>PV V2 · 04:11</span><button ref={closeRef} onClick={onClose} aria-label="关闭PV"><X size={23}/></button></header>
      <div className="pv-screen">
        <video ref={videoRef} controls playsInline preload="metadata" poster={PROMO_VIDEO_POSTER} aria-label="向合一奔去PV V2" tabIndex={0} onPlay={takeAudio} onEnded={releaseAudio}/>
        {error&&<div className="pv-error" role="alert"><p>{error}</p><button onClick={()=>setAttempt(value=>value+1)}><RotateCcw size={15}/>重新播放</button></div>}
      </div>
      <footer><span>合一风云 · 官方宣传片</span><small>支持进度拖动、音量调节与全屏观看</small></footer>
    </section>
  </div>;
}
