import type { GameEvent } from '../types';
import bindings from './eventArtBindings.json';
import { LOADING_ART } from './loadingArtwork';
import { NEWS_ARTWORK } from './newsArtwork';

import { FEATURES } from "./eventFeatures";
type Binding = { feature?: string; scene?: string; news?: string; generated?: string; primary?: string; secondary?: string; portrait?: string; theme?: string; reason?: string };
export const EVENT_ART_BINDINGS: Record<string, Binding> = bindings;
export const EVENT_SCENES: Record<string,string> = {
  campus_canteen: new URL("../assets/dispatch/campus_canteen.webp",import.meta.url).href,
  campus_books: new URL("../assets/dispatch/campus_books.webp",import.meta.url).href,
  campus_clubs: new URL("../assets/dispatch/campus_clubs.webp",import.meta.url).href,
  campus_exams: new URL("../assets/dispatch/campus_exams.webp",import.meta.url).href,
  campus_health: new URL("../assets/dispatch/campus_health.webp",import.meta.url).href,
  campus_contraband: new URL("../assets/dispatch/campus_contraband.webp",import.meta.url).href,
  campus_letters: new URL("../assets/dispatch/campus_letters.webp",import.meta.url).href,
  campus_petition: new URL("../assets/dispatch/campus_petition.webp",import.meta.url).href,
  campus_rally: new URL("../assets/dispatch/campus_rally.webp",import.meta.url).href,
  campus_sports: new URL("../assets/dispatch/campus_sports.webp",import.meta.url).href,
  campus_staff: new URL("../assets/dispatch/campus_staff.webp",import.meta.url).href,
  campus_supply: new URL("../assets/dispatch/campus_supply.webp",import.meta.url).href,
  campus_textbooks: new URL("../assets/dispatch/campus_textbooks.webp",import.meta.url).href,
  campus_tutoring: new URL("../assets/dispatch/campus_tutoring.webp",import.meta.url).href,
  campus_unrest: new URL("../assets/dispatch/campus_unrest.webp",import.meta.url).href,
  campus_winter: new URL("../assets/dispatch/campus_winter.webp",import.meta.url).href,
  campus_alumni: new URL("../assets/dispatch/campus_alumni.webp",import.meta.url).href,
  campus_authorship: new URL("../assets/dispatch/campus_authorship.webp",import.meta.url).href,
  campus_standing: new URL("../assets/dispatch/campus_standing.webp",import.meta.url).href,
  campus_thermos: new URL("../assets/dispatch/campus_thermos.webp",import.meta.url).href,
  yang_desk_paper_authorship: new URL("../assets/dispatch/yang_desk_paper_authorship.webp",import.meta.url).href,
  yang_desk_contraband_list: new URL("../assets/dispatch/yang_desk_contraband_list.webp",import.meta.url).href,
  yang_desk_tutoring_center: new URL("../assets/dispatch/yang_desk_tutoring_center.webp",import.meta.url).href,
  yang_desk_pe_cancellation: new URL("../assets/dispatch/yang_desk_pe_cancellation.webp",import.meta.url).href,
  yang_desk_anonymous_note: new URL("../assets/dispatch/yang_desk_anonymous_note.webp",import.meta.url).href,
  yang_desk_oath_rally: new URL("../assets/dispatch/yang_desk_oath_rally.webp",import.meta.url).href,
  yang_desk_destroy_books: new URL("../assets/dispatch/yang_desk_destroy_books.webp",import.meta.url).href,
  yang_desk_buy_exams: new URL("../assets/dispatch/yang_desk_buy_exams.webp",import.meta.url).href,
  yang_desk_mocking_letter: new URL("../assets/dispatch/yang_desk_mocking_letter.webp",import.meta.url).href,
  yang_desk_standing_reading: new URL("../assets/dispatch/yang_desk_standing_reading.webp",import.meta.url).href,
  yang_desk_health_scare: new URL("../assets/dispatch/yang_desk_health_scare.webp",import.meta.url).href,
  yang_desk_parent_petition: new URL("../assets/dispatch/yang_desk_parent_petition.webp",import.meta.url).href,
  yang_desk_young_teacher_quit: new URL("../assets/dispatch/yang_desk_young_teacher_quit.webp",import.meta.url).href,
  yang_desk_informant_report: new URL("../assets/dispatch/yang_desk_informant_report.webp",import.meta.url).href,
  yang_desk_textbook_scandal: new URL("../assets/dispatch/yang_desk_textbook_scandal.webp",import.meta.url).href,
  yang_desk_alumni_donation: new URL("../assets/dispatch/yang_desk_alumni_donation.webp",import.meta.url).href,
  yang_desk_thermos_mystery: new URL("../assets/dispatch/yang_desk_thermos_mystery.webp",import.meta.url).href,
  yang_desk_retirement_letter: new URL("../assets/dispatch/yang_desk_retirement_letter.webp",import.meta.url).href,
  yang_desk_midnight_call: new URL("../assets/dispatch/yang_desk_midnight_call.webp",import.meta.url).href,
  committee_militia: new URL("../assets/dispatch/committee_militia.webp",import.meta.url).href,
  committee_print_network: new URL("../assets/dispatch/committee_print_network.webp",import.meta.url).href,
  committee_posters: new URL("../assets/dispatch/committee_posters.webp",import.meta.url).href,
  committee_vanguard: new URL("../assets/dispatch/committee_vanguard.webp",import.meta.url).href,
  committee_purge_moderates: new URL("../assets/dispatch/committee_purge_moderates.webp",import.meta.url).href,
  committee_assembly_opening: new URL("../assets/dispatch/committee_assembly_opening.webp",import.meta.url).href,
  broadcast_seized: new URL("../assets/dispatch/broadcast_seized.webp",import.meta.url).href,
  admin_takeover: new URL("../assets/dispatch/admin_takeover.webp",import.meta.url).href,
  event_7_smolny: new URL("../assets/dispatch/event_7_smolny.webp",import.meta.url).href,
  event_8_trial: new URL("../assets/dispatch/event_8_trial.webp",import.meta.url).href,
  event_9_rectify_order: new URL("../assets/dispatch/event_9_rectify_order.webp",import.meta.url).href,
  event_10_crossroads: new URL("../assets/dispatch/event_10_crossroads.webp",import.meta.url).href,
  democratic_councils_event: new URL("../assets/dispatch/democratic_councils_event.webp",import.meta.url).href,
  broad_coalition_event: new URL("../assets/dispatch/broad_coalition_event.webp",import.meta.url).href,
  unite_teachers_event: new URL("../assets/dispatch/unite_teachers_event.webp",import.meta.url).href,
  disperse_guards_event: new URL("../assets/dispatch/disperse_guards_event.webp",import.meta.url).href,
  red_toad_1: new URL("../assets/dispatch/red_toad_1.webp",import.meta.url).href,
  red_toad_2: new URL("../assets/dispatch/red_toad_2.webp",import.meta.url).href,
  red_toad_3: new URL("../assets/dispatch/red_toad_3.webp",import.meta.url).href,
  red_toad_4: new URL("../assets/dispatch/red_toad_4.webp",import.meta.url).href,
  red_toad_5: new URL("../assets/dispatch/red_toad_5.webp",import.meta.url).href,
  'dorm-whispers':new URL('../assets/events/dorm-whispers.webp',import.meta.url).href,
  'school-infirmary':new URL('../assets/events/school-infirmary.webp',import.meta.url).href,
  'rooftop-midnight':new URL('../assets/events/rooftop-midnight.webp',import.meta.url).href,
};
export type EventArtwork = { kind: 'scene'; src: string };

export function getEventArtwork(event: Pick<GameEvent,'id'|'title'|'description'|'campusSituation'>): EventArtwork | undefined {
  const binding = EVENT_ART_BINDINGS[event.id] ?? EVENT_ART_BINDINGS['campus_'+event.campusSituation?.family];
  if (!binding) return undefined;
  const src = binding.feature ? FEATURES[binding.feature] : binding.scene ? LOADING_ART[binding.scene] :
    binding.news ? NEWS_ARTWORK[binding.news as keyof typeof NEWS_ARTWORK] : EVENT_SCENES[binding.generated ?? ''];
  return src ? {kind:'scene',src} : undefined;
}
