import React, { useEffect } from 'react';
import { SuperEventData } from '../types';
import { getSuperEventImageUrl } from '../config/assets';
import { AUDIO_SETTINGS_EVENT, readAudioSettings } from '../engine/audioSettings';
import { getSuperEventCue, SUPER_EVENT_AUDIO_END, SUPER_EVENT_AUDIO_START } from '../engine/superEventAudio';
import './superEvent.css';

interface SuperEventProps {
  event: SuperEventData;
  onConfirm: () => void;
}

export default function SuperEvent({ event, onConfirm }: SuperEventProps) {
  const color = event.color || 'tno-red';
  const resolvedColor = color.startsWith('#') ? color : `var(--color-${color}, #ef4444)`;

  useEffect(() => {
    const audio = new Audio(getSuperEventCue(event.id));
    const updateVolume = () => {
      const settings = readAudioSettings();
      audio.volume = settings.masterVolume * settings.effectsVolume / 10000;
    };
    let active = true;
    const endCue = () => {
      if (!active) return;
      active = false;
      window.dispatchEvent(new Event(SUPER_EVENT_AUDIO_END));
    };
    updateVolume();
    audio.addEventListener('ended', endCue);
    audio.addEventListener('error', endCue);
    window.addEventListener(AUDIO_SETTINGS_EVENT, updateVolume);
    window.dispatchEvent(new Event(SUPER_EVENT_AUDIO_START));
    void audio.play().catch(endCue);
    return () => {
      audio.pause();
      audio.removeEventListener('ended', endCue);
      audio.removeEventListener('error', endCue);
      window.removeEventListener(AUDIO_SETTINGS_EVENT, updateVolume);
      endCue();
    };
  }, [event.id]);

  return (
    <div className="super-event-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="super-event-frame relative h-[540px] w-[900px] max-w-[94vw] border bg-black flex flex-col overflow-hidden animate-super-event-appear" style={{ borderColor: resolvedColor }}>
        <div className="super-event-image absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${getSuperEventImageUrl(event.id)}')` }}></div>
        <div className="super-event-vignette absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 border border-white/15" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[4px]" style={{backgroundColor:resolvedColor}} />
        <div className="pointer-events-none absolute left-5 top-5 h-6 w-6 border-l-2 border-t-2 border-white/50" />
        <div className="pointer-events-none absolute right-5 top-5 h-6 w-6 border-r-2 border-t-2 border-white/50" />
        <div className="pointer-events-none absolute bottom-5 left-5 h-6 w-6 border-b-2 border-l-2 border-white/50" />
        <div className="pointer-events-none absolute bottom-5 right-5 h-6 w-6 border-b-2 border-r-2 border-white/50" />

        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.22) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.05), rgba(0, 255, 255, 0.03), rgba(0, 0, 255, 0.05))', backgroundSize: '100% 4px, 8px 100%' }}></div>

        <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(to_top,rgba(0,0,0,0.84)_0%,rgba(0,0,0,0.6)_40%,rgba(0,0,0,0.22)_72%,rgba(0,0,0,0)_100%)]" />

        <div className="relative z-10 flex flex-1 flex-col items-start justify-center px-8 md:px-16 pb-12 pt-8 text-left">
          <div className="mb-4 text-[11px] tracking-[.4em] text-white/55">THE HEFEI ORDER · SUPEREVENT</div>
          <div className="mb-7 h-px w-32" style={{backgroundColor:resolvedColor}} />
          <h1 className={`mb-8 text-4xl font-black tracking-[0.18em] md:text-6xl font-serif`} style={{ color: resolvedColor, textShadow: '0 2px 14px rgba(0,0,0,.9)' }}>
            {event.title}
          </h1>

          <div className="mt-auto w-full max-w-3xl pb-3">
            <p className="mb-3 text-lg leading-relaxed text-white md:text-2xl font-serif" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
              "{event.quote}"
            </p>
            <p className="text-sm tracking-[0.14em] text-white/78 md:text-base" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.75)' }}>
              — {event.author}
            </p>
          </div>
          <button data-sound="event" onClick={onConfirm} className="super-event-continue mt-5 border px-7 py-2 text-xs tracking-[.28em] text-white hover:bg-white/10" style={{borderColor:resolvedColor}}>继续 →</button>
        </div>
      </div>
    </div>
  );
}
