import { HEYI_LIGHT_ART } from '../config/heyiLightArtwork';
import type { GameState } from '../types';
import { getHeyiLightSnapshot, type HeyiRoute } from '../engine/heyiLight';
import { getCampusArtScene, getCampusArtChapter, getCampusArtBranch } from '../engine/campusArt';
import { getStructureProfile } from './CampusStructures';

const THEMES: Record<HeyiRoute,string> = {opening:'school',uprising:'coalition',democracy:'democracy',revolution:'red',reform:'red',despair:'despair',haobang:'haobang',yang:'study',jidi:'corporate',jidi_riot:'despair',gouxiong:'culture',wu:'military'};
/** Uses exactly the scene's existing route/chapter/branch decisions; no extra game state. */
export function getHeyiSpiritAppearance(state?:GameState) {
  const snapshot=state?getCampusArtScene(state,getHeyiLightSnapshot(state)):undefined;
  const route=snapshot?.route??'opening', chapter=state&&snapshot?getCampusArtChapter(state,snapshot):0;
  const branch=state?getCampusArtBranch(state):'standard';
  const mood=snapshot?.mood??'restless';
  const theme=branch==='nkpd'?'security':branch==='spring'?'democracy':THEMES[route];
  return {route,chapter,branch,mood,theme,value:snapshot?.value??50,profile:getStructureProfile(route,chapter,branch),key:`${route}-${chapter}-${branch}-${mood}`};
}

export default function HeyiLightSpirit({state}:{state?:GameState}) {
  const appearance=getHeyiSpiritAppearance(state);
  const src=HEYI_LIGHT_ART[appearance.key] ?? HEYI_LIGHT_ART['opening-0-standard-restless'];
  return <span className={`strategic-art strategic-art--spirit heyi-spirit heyi-spirit--${appearance.mood}`} data-art-kind="campus" data-heyi-badge={appearance.key} aria-hidden="true"><img src={src} alt="" draggable={false} style={{width:'100%',height:'100%',objectFit:'contain'}}/></span>;
}
