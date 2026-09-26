export const SUPER_EVENT_AUDIO_START = 'tno-super-event-audio-start';
export const SUPER_EVENT_AUDIO_END = 'tno-super-event-audio-end';

const darkStinger = new URL('../assets/superevent/dark_stinger.mp3', import.meta.url).href;
const orchestralStinger = new URL('../assets/superevent/orchestral_stinger.mp3', import.meta.url).href;
const sadStinger = new URL('../assets/superevent/sad_stinger.mp3', import.meta.url).href;
const abyssStinger = new URL('../assets/superevent/abyss.ogg', import.meta.url).href;
const cyberStinger = new URL('../assets/superevent/cyber_sting.ogg', import.meta.url).href;
const lossFanfare = new URL('../assets/superevent/loss_fanfare.ogg', import.meta.url).href;
const victoryFanfare = new URL('../assets/superevent/victory_fanfare.ogg', import.meta.url).href;
const successStinger = new URL('../assets/superevent/success_stinger.mp3', import.meta.url).href;

/** Match each story beat to a cue, rather than using one positive/negative split. */
export const SUPER_EVENT_CUE_BY_ID: Record<string, string> = {
  game_over_school: darkStinger,
  game_over_anarchy: lossFanfare,
  b3_uprising: orchestralStinger,
  jidi_empire_super: cyberStinger,
  jidi_riot_super: darkStinger,
  true_left_reform_super: victoryFanfare,
  lu_authoritarian_super: abyssStinger,
  haobang_rise_super: victoryFanfare,
  gx_auditorium_split_super: cyberStinger,
  gx_redeem_super: successStinger,
  gx_embarrass_super: sadStinger,
  gx_ruin_super: abyssStinger,
  first_democratic_election_super: victoryFanfare,
  yang_yule_death: sadStinger,
  yang_yule_success: orchestralStinger,
  yang_yule_fail: lossFanfare,
  wu_crackdown: darkStinger,
};

export function getSuperEventCue(id: string): string {
  return SUPER_EVENT_CUE_BY_ID[id] ?? orchestralStinger;
}
