import type { GameEvent, GameState } from '../types';

type Queue = Pick<GameState, 'activeEvent' | 'activeStoryEvents'>;
/** Keep narrative feedback even when another event is already waiting. */
export function enqueueEvent(queue: Queue, event: GameEvent, priority = false): Queue {
  const waiting = queue.activeStoryEvents ?? [];
  if (queue.activeEvent?.id === event.id || waiting.some(e => e.id === event.id)) return queue;
  if (!queue.activeEvent) return { activeEvent: event, activeStoryEvents: waiting };
  return priority
    ? { activeEvent: event, activeStoryEvents: [queue.activeEvent, ...waiting] }
    : { activeEvent: queue.activeEvent, activeStoryEvents: [...waiting, event] };
}

export function promotePendingEvent(state: GameState): GameState {
  if (state.activeEvent || !state.activeStoryEvents?.length) return state;
  return { ...state, activeEvent: state.activeStoryEvents[0], activeStoryEvents: state.activeStoryEvents.slice(1), isPaused: true };
}
