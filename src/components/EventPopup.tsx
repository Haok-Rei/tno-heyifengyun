import React, { useState } from 'react';
import { GameEvent, EventChoice, GameState } from '../types';
import { motion } from 'motion/react';
import { getNewsEventImageUrl, getStoryEventImageUrl } from '../config/assets';

interface EventPopupProps {
  event: GameEvent;
  onConfirm: (choice?: EventChoice) => void;
  date?: Date;
  state?: GameState;
}

export default function EventPopup({ event, onConfirm, date, state }: EventPopupProps) {
  const [hoveredChoiceIndex, setHoveredChoiceIndex] = useState<number | null>(null);
  const newsImageUrl = getNewsEventImageUrl(event.id);
  const storyImageUrl = getStoryEventImageUrl(event.id);

  const formatDate = (d: Date) => {
    return `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月${String(d.getDate()).padStart(2, '0')}日`;
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
      <motion.div 
        drag
        dragMomentum={false}
        className={`event-document ${event.campusSituation ? 'campus-event' : ''} bg-tno-panel border-4 border-double border-tno-border shadow-2xl shadow-black relative flex flex-col pointer-events-auto ${event.isStoryEvent ? 'w-[650px]' : 'max-w-xl w-full'}`}
      >
        {/* Header */}
        {!event.isStoryEvent && (
          <div className="bg-zinc-900 border-b border-tno-border p-3 flex justify-between items-center cursor-move">
            <div className="font-bold text-tno-highlight tracking-widest text-lg uppercase">校园电讯</div>
            <div className="text-xs text-tno-text/60">合肥一中广播站</div>
          </div>
        )}

        {/* Content */}
        <div className={`event-content p-6 flex gap-6 ${event.isStoryEvent ? 'flex-col h-full' : 'flex-col md:flex-row'}`}>
          {event.isStoryEvent ? (
            <div className="flex flex-col h-full relative">
              {date && (
                <div className="absolute top-0 right-0 z-20 text-[11px] text-tno-text/50 tracking-widest border border-tno-border/50 px-2 py-0.5 bg-black/40">
                  {formatDate(date)}
                </div>
              )}
              <h2 className="text-3xl font-bold text-white mb-6 leading-tight border-b border-tno-border pb-4 z-10 tracking-widest">{event.title}</h2>
              
              <div className="flex-1 relative flex flex-col items-start justify-start pt-2 overflow-y-auto pr-2">
                {/* Text */}
                <div className="event-body z-10 text-left text-[15px] text-tno-text/90 whitespace-pre-wrap font-serif w-full">
                  {event.description}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Image */}
              <div className="w-full md:w-1/3 flex-shrink-0 border border-tno-border relative bg-zinc-900 h-48 md:h-auto overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center opacity-80 mix-blend-luminosity" style={{ backgroundImage: `url('${newsImageUrl}')` }}></div>
                 <div className="absolute inset-0 bg-tno-highlight/10 mix-blend-overlay"></div>
              </div>

              {/* Text */}
              <div className="flex-1 flex flex-col">
                <h2 className="text-2xl font-bold text-white mb-4 leading-tight">{event.title}</h2>
                <div className="event-body text-sm text-tno-text/90 whitespace-pre-wrap flex-1 font-serif overflow-y-auto max-h-[50vh] pr-2">
                  {event.description}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer / Button */}
        <div className={`event-actions p-4 border-t border-tno-border bg-zinc-900/50 relative ${event.isStoryEvent ? 'mt-auto flex flex-row items-end gap-4' : 'flex flex-col gap-2 justify-end'}`}>
          {event.isStoryEvent && (
            <div className="w-32 aspect-[4/3] border border-tno-border p-1 bg-black shadow-lg flex-shrink-0 relative">
              <div className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-luminosity" style={{ backgroundImage: `url('${storyImageUrl}')` }}></div>
              <div className="absolute inset-0 bg-tno-highlight/10 mix-blend-overlay"></div>
            </div>
          )}
          
          <div className={`flex flex-col gap-2 flex-1 ${event.isStoryEvent ? 'items-end' : ''}`}>
            {hoveredChoiceIndex !== null && event.choices?.[hoveredChoiceIndex]?.previewText && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-tno-panel border border-tno-highlight p-3 text-sm text-tno-text shadow-lg z-10">
                <span className="font-bold text-tno-highlight block mb-1">效果预览：</span>
                {event.choices[hoveredChoiceIndex].previewText}
              </div>
            )}
            {hoveredChoiceIndex === -1 && event.effectsText && event.effectsText.length > 0 && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-tno-panel border border-tno-highlight p-3 text-sm text-tno-text shadow-lg z-10">
                <span className="font-bold text-tno-highlight block mb-1">效果预览：</span>
                <ul className="list-disc list-inside">
                  {event.effectsText.map((text, i) => (
                    <li key={i}>{text}</li>
                  ))}
                </ul>
              </div>
            )}
            {event.choices ? (
              event.choices.map((choice, index) => (
                <button 
                  key={index}
                  data-sound="event"
                  disabled={!!state && !!choice.disabled?.(state)}
                  onClick={() => onConfirm(choice)}
                  onMouseEnter={() => setHoveredChoiceIndex(index)}
                  onMouseLeave={() => setHoveredChoiceIndex(null)}
                  className={`border border-tno-highlight text-tno-highlight px-6 py-2 hover:bg-tno-highlight hover:text-black disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-tno-highlight transition-colors font-bold tracking-wider relative text-left ${event.isStoryEvent ? 'w-2/3' : 'w-full'}`}
                >
                  {choice.text}
                </button>
              ))
            ) : (
              <button 
                data-sound="event"
                onClick={() => onConfirm()}
                onMouseEnter={() => setHoveredChoiceIndex(-1)}
                onMouseLeave={() => setHoveredChoiceIndex(null)}
                className={`border border-tno-highlight text-tno-highlight px-6 py-2 hover:bg-tno-highlight hover:text-black transition-colors font-bold tracking-wider ${event.isStoryEvent ? 'w-2/3 text-left' : 'self-end'}`}
              >
                {event.buttonText || '确认'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
