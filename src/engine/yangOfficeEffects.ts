import type { GameEvent,GameState } from '../types';
import {ensureEventIdentity} from './mechanicEvents';

/** Canonical confirmations also restore after saving while an office notice is open. */
export const YANG_OFFICE_EFFECTS = {
  patrol:(s:GameState)=>({stats:{...s.stats,radicalAnger:Math.max(0,s.stats.radicalAnger-10)}}),
  suppress:(s:GameState)=>({stats:{...s.stats,studentSanity:Math.max(0,s.stats.studentSanity-10),stab:Math.min(100,s.stats.stab+5)}}),
  lecture:(s:GameState)=>({stats:{...s.stats,ss:Math.min(100,s.stats.ss+5)}}),
  redPhone:(s:GameState)=>{
    const rebelCooldowns={...(s.yangYuleState?.rebelCooldowns??{})};
    Object.keys(s.yangYuleState?.rebelLocations??{}).forEach(id=>{rebelCooldowns[id]=5;});
    return {stats:{...s.stats,ss:Math.max(0,s.stats.ss-20)},yangYuleState:{...s.yangYuleState!,rebelLocations:{},rebelCooldowns}};
  },
};
const confirmations=[['加强巡逻',YANG_OFFICE_EFFECTS.patrol],['打压温和派',YANG_OFFICE_EFFECTS.suppress],['名师讲座',YANG_OFFICE_EFFECTS.lecture],['吴福军出动',YANG_OFFICE_EFFECTS.redPhone]] as const;
const effectsById=new Map(confirmations.map(([title,effect])=>[ensureEventIdentity({title,description:''},'yang_office').id,effect]));
effectsById.set('yang_office_patrol',YANG_OFFICE_EFFECTS.patrol);
effectsById.set('yang_office_suppress',YANG_OFFICE_EFFECTS.suppress);
effectsById.set('yang_office_lecture',YANG_OFFICE_EFFECTS.lecture);
effectsById.set('yang_office_red_phone',YANG_OFFICE_EFFECTS.redPhone);

export function restoreYangOfficeEffect(event:GameEvent,state:GameState):GameEvent {
  const effect=effectsById.get(event.id) ?? (state.currentFocusTree==='treeB'&&event.id.startsWith('legacy_inline_')?confirmations.find(([title])=>title===event.title)?.[1]:undefined);
  return effect?{...event,effect}:event;
}
