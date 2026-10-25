import React, { useEffect, useId, useRef, useState } from 'react';
import type { GameEvent, EventChoice, GameState } from '../types';
import { motion, useDragControls, useReducedMotion } from 'motion/react';
import { Radio, FileText, GripHorizontal, ChevronRight, Lock } from 'lucide-react';
import { getNewsEventImageUrl, getStoryEventImageUrl } from '../config/assets';
import { getEventPresentation } from '../engine/eventPresentation';
import EventIllustration from './EventIllustration';
import { ensureEventIdentity } from '../engine/mechanicEvents';

interface EventPopupProps {
  event: GameEvent;
  onConfirm: (choice?: EventChoice) => void;
  date?: Date;
  state?: GameState;
}

export default function EventPopup({ event:incomingEvent, onConfirm, date, state }: EventPopupProps) {
  const event=ensureEventIdentity(incomingEvent);
  const [hovered, setHovered] = useState<number | null>(null);
  const bounds = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const drag = useDragControls();
  const reducedMotion = useReducedMotion();
  const titleId = useId();
  const previewId = useId();
  const news = getEventPresentation(event) === 'news';
  const submitted = event.campusSituation?.channel === 'document' || event.id.startsWith('yang_desk_');
  const kind = news ? '合一新闻网' : submitted ? '来件批阅' : '校园纪事';
  const newsSection = event.id.startsWith('bill_') ? '代表大会' : event.id.startsWith('jidi_') ? '校园经营'
    : event.id.startsWith('gx_') || event.id === 'enter_treeC' ? '社团文化'
    : event.id.startsWith('enter_tree') || event.id === 'march_on_admin' ? '校园政局'
    : event.id === 'broadcast_seized' ? '校园广播' : '校园动态';
  const image = news ? getNewsEventImageUrl(event.id) : getStoryEventImageUrl(event.id);
  const fallback = news ? getNewsEventImageUrl(null) : getStoryEventImageUrl(null);
  const choices = event.choices?.length ? event.choices : null;
  const preview = hovered === null ? [] : hovered === -1 ? event.effectsText ?? []
    : event.choices?.[hovered]?.previewText ? [event.choices[hovered].previewText!] : [];
  const dateText = date && Number.isFinite(date.getTime())
    ? date.getFullYear()+'年'+String(date.getMonth()+1).padStart(2,'0')+'月'+String(date.getDate()).padStart(2,'0')+'日' : '';

  useEffect(() => {
    setHovered(null);
    dialog.current?.focus({ preventScroll: true });
  }, [event.id]);

  const trapFocus = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const buttons: HTMLElement[] = dialog.current ? Array.from<HTMLElement>(dialog.current.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]')) : [];
    const first = buttons[0], last = buttons.at(-1);
    if (!first || !last) return;
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) {
      e.preventDefault(); first.focus();
    }
  };
  const photo = <figure className="event-photo">
    <EventIllustration event={event} legacyImage={image} fallback={fallback}/>
  </figure>;
  const body = <div className="event-prose" tabIndex={0}>
    {event.description.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
    {event.openingEcho && <p className="event-echo" data-opening-echo>{event.openingEcho}</p>}
  </div>;

  return <div ref={bounds} className="event-overlay">
    <motion.div key={event.id} ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId}
      tabIndex={-1} onKeyDown={trapFocus} data-event-id={event.id} data-presentation={news ? 'news' : 'story'}
      className={'event-document tno-event-window event-window--'+(news ? 'news' : 'story')}
      drag dragControls={drag} dragListener={false} dragConstraints={bounds} dragElastic={0} dragMomentum={false}
      initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : .18 }}>
      <header className="event-titlebar" onPointerDown={e => drag.start(e)}>
        <span className="event-titlebar__kind">{news ? <Radio size={14}/> : <FileText size={14}/>} {kind}</span>
        <span className="event-titlebar__source">{news ? '合肥一中广播站' : dateText}</span>
        <GripHorizontal size={16} className="event-titlebar__grip" aria-hidden="true"/>
      </header>
      <div className="event-heading">
        {news && <div className="event-dateline"><span className="event-news-section">{newsSection}</span><span className="event-news-edition">HEFEI · CAMPUS NEWS</span><time>{dateText}</time></div>}
        <h2 id={titleId} className="event-headline">{event.title}</h2>
      </div>
      {news ? <div className="event-news-reading">{photo}{body}</div> : <div className="event-story-reading">{body}</div>}
      <footer className="event-choice-footer">
        {!news && photo}
        <div className="event-choice-list">
          {preview.length > 0 && <div id={previewId} role="tooltip" className="event-choice-preview">
            <strong>选项效果</strong>{preview.map((text, i) => <p key={i}>{text}</p>)}
          </div>}
          {choices ? choices.map((choice, index) => {
            const disabled = !!state && !!choice.disabled?.(state);
            return <div key={choice.id ?? index} className="event-choice-wrap"
              onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)}>
              <button type="button" data-sound="event" disabled={disabled}
                aria-describedby={hovered === index && preview.length ? previewId : undefined}
                onFocus={() => setHovered(index)} onBlur={() => setHovered(null)}
                onClick={() => onConfirm(choice)}>
                {disabled ? <Lock size={13} aria-hidden="true"/> : <ChevronRight size={14} aria-hidden="true"/>}
                <span>{choice.text}</span>
              </button>
            </div>;
          }) : <div className="event-choice-wrap" onMouseEnter={() => setHovered(-1)} onMouseLeave={() => setHovered(null)}>
            <button type="button" data-sound="event" onClick={() => onConfirm()}
              aria-describedby={hovered === -1 && preview.length ? previewId : undefined}
              onFocus={() => setHovered(-1)} onBlur={() => setHovered(null)}>
              <ChevronRight size={14} aria-hidden="true"/><span>{event.buttonText || '确认'}</span>
            </button>
          </div>}
        </div>
      </footer>
    </motion.div>
  </div>;
}
