import type { GameEvent } from '../types';
import { getEventArtwork } from '../config/eventArtwork';

export default function EventIllustration({event,legacyImage,fallback}:{event:GameEvent;legacyImage:string;fallback:string}) {
  const art=getEventArtwork(event);
  return <img key={event.id} data-event-art-main src={art?.src ?? legacyImage} alt={event.title+'配图'} decoding="async" draggable={false}
    onError={e=>{if(!e.currentTarget.dataset.fallback){e.currentTarget.dataset.fallback='true';e.currentTarget.src=fallback;}}}/>;
}
