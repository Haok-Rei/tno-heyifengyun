import type { GameState } from '../types';

/** One-time, spaced opening scenes; never bleed into another route or a pending story. */
export function nextOpeningGuidance(state: GameState): string | null {
  if (state.currentFocusTree !== 'phase1' || state.gameEnding || state.flags.rebellion_started || state.activeEvent || state.activeStoryEvents.length || state.activeMinigame || state.activeSuperEvent) return null;
  const days = Math.floor((Date.UTC(state.date.getFullYear(), state.date.getMonth(), state.date.getDate()) - Date.UTC(2023, 8, 1)) / 86400000);
  const last = Number(state.flags.opening_guidance_day ?? -100);
  if (days - last < 6 || !state.completedFocuses.includes('start_2023') || state.stats.radicalAnger > 80 || state.activeFocus?.id === 'charge_b3') return null;
  const seen = (id: string) => !!state.flags[`${id}_seen`] || !!state.flags[`event_seen_${id}`];
  const candidates = [
    ['phase1_returned_petition', days >= 16 && (state.completedFocuses.includes('dorm_talks') || state.completedFocuses.includes('wu_patrol'))],
    ['phase1_recess_dispute', days >= 25 && seen('phase1_returned_petition') && (state.completedFocuses.includes('wu_patrol') || state.completedFocuses.includes('protest_privilege'))],
    ['phase1_shared_leaflet', days >= 32 && seen('phase1_returned_petition') && (state.completedFocuses.includes('read_marx') || state.completedFocuses.includes('ban_books'))],
  ] as const;
  return candidates.find(([id, ready]) => ready && !state.flags[`${id}_seen`])?.[0] ?? null;
}
