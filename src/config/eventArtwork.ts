import type { GameEvent } from '../types';
import bindings from './eventArtBindings.json';
import { EXPANDED_ART_URLS } from './expandedArtwork';
import { LOCAL_PORTRAIT_URLS } from './localPortraits';
import { LOADING_ART } from './loadingArtwork';
import { NEWS_ARTWORK } from './newsArtwork';

type Binding = { scene?: string; news?: string; generated?: string; primary?: string; secondary?: string; portrait?: string; theme?: string; reason?: string };
export const EVENT_ART_BINDINGS: Record<string, Binding> = bindings;
export const EVENT_SCENES: Record<string,string> = {
  'dorm-whispers':new URL('../assets/events/dorm-whispers.webp',import.meta.url).href,
  'school-infirmary':new URL('../assets/events/school-infirmary.webp',import.meta.url).href,
  'rooftop-midnight':new URL('../assets/events/rooftop-midnight.webp',import.meta.url).href,
};
export type EventArtwork = { kind:'scene'; src:string } | { kind:'symbol'|'portrait'; primary:string; secondary:string; theme:string };

/** Exact event assignments take priority; save variants of one ambient family share its subject. */
export function getEventArtwork(event: Pick<GameEvent,'id'|'title'|'description'|'campusSituation'>): EventArtwork | undefined {
  const binding = EVENT_ART_BINDINGS[event.id] ?? (event.campusSituation ? EVENT_ART_BINDINGS['campus_'+event.campusSituation.family] : undefined);
  if(!binding) return undefined;
  const scene=binding.scene ? LOADING_ART[binding.scene] : binding.news ? NEWS_ARTWORK[binding.news as keyof typeof NEWS_ARTWORK] : binding.generated ? EVENT_SCENES[binding.generated] : undefined;
  if(scene) return {kind:'scene',src:scene};
  const primary=binding.portrait ? LOCAL_PORTRAIT_URLS[binding.portrait] : binding.primary ? EXPANDED_ART_URLS[binding.primary] : undefined;
  const secondary=binding.secondary ? EXPANDED_ART_URLS[binding.secondary] : undefined;
  if(primary&&secondary) return {kind:binding.portrait?'portrait':'symbol',primary,secondary,theme:binding.theme??'campus'};
  return undefined;
}
