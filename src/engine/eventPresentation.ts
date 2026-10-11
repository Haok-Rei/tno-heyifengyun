import type { GameEvent } from '../types';
import { FLAVOR_EVENTS } from '../data/flavorEvents';
import { STORY_EVENTS } from '../data/storyEvents';

export type EventPresentation = 'news' | 'story';
const authoredKinds = new Map<string, EventPresentation>([
  ['school_starts', 'news'],
  ...Object.values(FLAVOR_EVENTS).map(event => [event.id, event.presentation ?? 'story'] as const),
  ...Object.values(STORY_EVENTS).map(event => [event.id, event.presentation ?? 'story'] as const),
]);

/** Canonical metadata repairs old saves with missing or outdated flags. */
export function getEventPresentation(event: GameEvent): EventPresentation {
  return event.presentation ?? authoredKinds.get(event.id)
    ?? (event.campusSituation || event.isStoryEvent !== false ? 'story' : 'news');
}
