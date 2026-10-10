import type { GameState } from '../types';
import { ARTWORKS, type Artwork } from '../data/artGallery';
import { ENDING_BY_ID } from '../data/endings';

export const ART_UNLOCK_KEY = 'heyi_art_unlocks_v1';
export type ArtUnlocks = Record<string, number>;
type ArtStorage = Pick<Storage, 'getItem' | 'setItem'>;
export type ArtProgress = Pick<GameState, 'currentFocusTree' | 'completedFocuses' | 'activeEvent' | 'activeSuperEvent' | 'gameEnding' | 'chronicle'>;
const knownNames = new Set(ARTWORKS.map(work => work.name));
// Scenery is available even before the first campaign, without granting route art.
const initialUnlocks: ArtUnlocks = Object.fromEntries(ARTWORKS.filter(work => work.scenery).map(work => [work.name, 1]));
let sessionUnlocks: ArtUnlocks = {};
const storageSessions = new WeakMap<ArtStorage, ArtUnlocks>();
const sessionFor = (storage?: ArtStorage) => storage ? storageSessions.get(storage) ?? {} : sessionUnlocks;

function browserStorage(): ArtStorage | undefined {
  try { return typeof localStorage === 'undefined' ? undefined : localStorage; }
  catch { return undefined; }
}

export function getEarnedArtwork(progress: ArtProgress): Artwork[] {
  const events = new Set([progress.activeEvent?.id, progress.activeSuperEvent?.id]);
  // A route transition already recorded in an old save also counts as played.
  const tags = new Set((progress.chronicle ?? []).filter(entry => entry.type === 'route').map(entry => entry.routeTag));
  return ARTWORKS.filter(work => work.scenery || work.opening
    || work.trees?.includes(progress.currentFocusTree)
    || work.focuses?.some(id => progress.completedFocuses.includes(id))
    || work.events?.some(id => events.has(id))
    || work.endings?.includes(progress.gameEnding ?? '')
    || work.routeTags?.some(tag => tags.has(tag)));
}

function artworksForEnding(id: string): Artwork[] {
  const route = ENDING_BY_ID[id]?.routeTag;
  if (!route) return [];
  return ARTWORKS.filter(work => work.opening || work.endings?.includes(id) || work.routeTags?.includes(route));
}

/** Scenery is initially open; route art requires progress or historical ending proof. */
export function getArtUnlocks(storage = browserStorage()): ArtUnlocks {
  const result: ArtUnlocks = { ...initialUnlocks, ...sessionFor(storage) };
  try {
    const parsed = JSON.parse(storage?.getItem(ART_UNLOCK_KEY) ?? '{}');
    for (const [name, date] of Object.entries(parsed)) {
      if (knownNames.has(name) && typeof date === 'number' && Number.isFinite(date) && date > 0) result[name] = date;
    }
    const endings = JSON.parse(storage?.getItem('tno_endings_unlock_v1') ?? '{}').unlocked ?? {};
    for (const [id, date] of Object.entries(endings)) {
      if (typeof date !== 'number' || !Number.isFinite(date) || date <= 0) continue;
      for (const work of artworksForEnding(id)) result[work.name] ??= date;
    }
  } catch { /* Damaged or unavailable storage must not break the game. */ }
  return result;
}

/** Only genuinely new unlocks are returned, so reloads cannot replay notifications. */
export function unlockEarnedArtwork(progress: ArtProgress, storage = browserStorage(), now = Date.now()): Artwork[] {
  const previous = getArtUnlocks(storage);
  const earned = getEarnedArtwork(progress);
  const fresh = earned.filter(work => !previous[work.name]);
  if (!fresh.length) return [];
  const next = { ...previous };
  for (const work of earned) next[work.name] ??= now;
  if (storage) storageSessions.set(storage, next);
  else sessionUnlocks = next;
  try { storage?.setItem(ART_UNLOCK_KEY, JSON.stringify(next)); } catch { /* Keep session progress if storage is full. */ }
  return fresh;
}

/** Each visible loading image: 30% uncollected previews, 70% collected art. No unlock is written. */
export function pickLoadingArtwork(unlocks: ArtUnlocks, random = Math.random, previous?: string): Artwork {
  const unlocked = ARTWORKS.filter(work => work.scenery || unlocks[work.name]);
  const locked = ARTWORKS.filter(work => !work.scenery && !unlocks[work.name]);
  const pool = random() < .3 ? locked : unlocked;
  const available = pool.length ? pool : unlocked.length ? unlocked : locked;
  const different = available.filter(work => work.name !== previous);
  const choices = different.length ? different : available;
  return choices[Math.min(choices.length - 1, Math.max(0, Math.floor(random() * choices.length)))];
}

/** Preload only the frames used during this load, rather than the entire collection. */
export function createLoadingArtworkSequence(unlocks: ArtUnlocks, count = 5, random = Math.random): Artwork[] {
  const sequence: Artwork[] = [];
  for (let i = 0; i < count; i++) sequence.push(pickLoadingArtwork(unlocks, random, sequence.at(-1)?.name));
  return sequence;
}
