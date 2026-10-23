import { MECHANISM_ART } from '../config/campaignArtwork';

const CRESTS = {
  assembly:'entry_assembly', reform:'entry_reform', capital:'entry_jidi', council:'entry_politburo',
  print:'entry_print', frequency:'entry_frequency', poster:'entry_poster', siege:'entry_siege',
  negotiation:'entry_negotiation', crackdown:'entry_crackdown',
} as const;

/** Route badges share the same materials as focus and national spirit art. */
export default function MechanicCrest({kind}:{kind:keyof typeof CRESTS}) {
  return <span className={'mechanic-crest mechanic-crest--'+kind} aria-hidden="true">
    <img src={MECHANISM_ART[CRESTS[kind]]} alt="" draggable={false}/>
  </span>;
}

const ENTRY_BADGES: Record<string,string> = {
  'heyi-light':'entry_campus', assembly:'entry_assembly', reform:'entry_reform', politburo:'entry_politburo',
  wu:'entry_wu', jidi:'entry_jidi', election:'entry_election', cyber:'entry_gouxiong_cyber', gal:'entry_gouxiong_chat', yang:'entry_yang',
};
export function getMechanismEntryArt(id:string) { return MECHANISM_ART[ENTRY_BADGES[id]]; }
