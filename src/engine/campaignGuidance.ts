import type { GameState } from '../types';

/** One-time, spaced opening scenes; never bleed into another route or a pending story. */
export function nextOpeningGuidance(state: GameState): string | null {
  if (state.currentFocusTree !== 'phase1' || state.gameEnding || state.flags.rebellion_started || state.activeEvent || state.activeStoryEvents.length || state.activeMinigame || state.activeSuperEvent) return null;
  const days = Math.floor((Date.UTC(state.date.getFullYear(), state.date.getMonth(), state.date.getDate()) - Date.UTC(2023, 8, 1)) / 86400000);
  const last = Number(state.flags.opening_guidance_day ?? -100);
  if (days - last < 6 || !state.completedFocuses.includes('start_2023') || state.stats.radicalAnger > 80) return null;
  const candidates = [
    ['phase1_returned_petition', days >= 16],
    ['phase1_recess_dispute', days >= 25 && (state.completedFocuses.includes('wu_patrol') || state.completedFocuses.includes('dorm_talks'))],
    ['phase1_shared_leaflet', days >= 32 && ['read_marx', 'ban_books', 'steel_toad'].some(id => state.completedFocuses.includes(id))],
  ] as const;
  return candidates.find(([id, ready]) => ready && !state.flags[`${id}_seen`])?.[0] ?? null;
}
