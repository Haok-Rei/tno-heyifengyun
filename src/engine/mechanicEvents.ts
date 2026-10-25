import type { GameEvent } from '../types';

/** Mechanisms may draft notices, but events entering the game must have an identity. */
export type MechanicEventDraft = Omit<GameEvent,'id'> & {id?:string};

export function ensureEventIdentity(event:MechanicEventDraft,prefix='legacy_inline'):GameEvent {
  if(typeof event.id==='string'&&event.id.trim())return event as GameEvent;
  // Stable across reloads and repeat renders; neither the prose nor effects are rewritten.
  const title=String(event.title??'');
  let hash=0x811c9dc5;
  for(let i=0;i<title.length;i++)hash=Math.imul(hash^title.charCodeAt(i),0x01000193);
  return {...event,id:`${prefix}_${(hash>>>0).toString(36)}`};
}
