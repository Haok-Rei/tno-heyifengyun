import { MECHANISM_ART } from '../config/campaignArtwork';

const CRESTS = {
  assembly:new URL("../assets/dispatch/gui-assembly.webp",import.meta.url).href,
  reform:new URL("../assets/dispatch/gui-reform.webp",import.meta.url).href,
  capital:new URL("../assets/dispatch/gui-capital.webp",import.meta.url).href,
  council:new URL("../assets/dispatch/gui-council.webp",import.meta.url).href,
  frequency:new URL("../assets/dispatch/gui-frequency.webp",import.meta.url).href,
  print:new URL("../assets/dispatch/gui-print.webp",import.meta.url).href,
  poster:new URL("../assets/dispatch/gui-poster.webp",import.meta.url).href,
  siege:new URL("../assets/dispatch/gui-siege.webp",import.meta.url).href,
  crackdown:new URL("../assets/dispatch/gui-crackdown.webp",import.meta.url).href,
  negotiation:new URL("../assets/dispatch/gui-negotiation.webp",import.meta.url).href,
} as const;

/** Route badges share the same materials as focus and national spirit art. */
export default function MechanicCrest({kind}:{kind:keyof typeof CRESTS}) {
  return <span className={'mechanic-crest mechanic-crest--'+kind} aria-hidden="true">
    <img src={CRESTS[kind]} alt="" draggable={false}/>
  </span>;
}

const ENTRY_BADGES: Record<string,string> = {
  'heyi-light':'entry_campus', assembly:'entry_assembly', reform:'entry_reform', politburo:'entry_politburo',
  wu:'entry_wu', jidi:'entry_jidi', election:'entry_election', cyber:'entry_gouxiong_cyber', gal:'entry_gouxiong_chat', yang:'entry_yang',
};
export function getMechanismEntryArt(id:string) { return MECHANISM_ART[ENTRY_BADGES[id]]; }
