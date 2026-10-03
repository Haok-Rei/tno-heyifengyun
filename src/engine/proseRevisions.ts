import data from '../data/proseRevisions.json';
import type { GameEvent, GameState } from '../types';

export interface ProseRevision {
  kind: 'person' | 'spirit' | 'event' | 'news';
  id: string;
  before: string;
  after: string;
}

/** Exact old text + identity: custom/dynamic prose and other story stages survive. */
export function refreshReviewedDescriptions(state: GameState, revisions = data.items as ProseRevision[]): GameState {
  const entries = new Map(revisions.map(r => [`${r.kind}\n${r.id}\n${r.before}`, r.after]));
  const replace = (kind: string, id: string, before: string | undefined) =>
    before === undefined ? before : entries.get(`${kind}\n${id}\n${before}`) ?? before;
  const event = (e: GameEvent) => ({ ...e, description: replace('event', e.id, e.description) ?? e.description });
  const refreshEvent = (e: GameEvent) => ({ ...event(e), description: replace('news', e.id, event(e).description) ?? e.description });
  return {
    ...state,
    leader: state.leader && { ...state.leader, description: replace('person', `${state.leader.name}/${state.leader.title}/${state.leader.portrait}`, state.leader.description) },
    advisors: (state.advisors ?? []).map(a => a && { ...a, description: replace('person', a.id, a.description) ?? a.description }),
    nationalSpirits: state.nationalSpirits.map(s => ({ ...s, description: replace('spirit', s.id, s.description) ?? s.description })),
    activeEvent: state.activeEvent && refreshEvent(state.activeEvent),
    activeStoryEvents: (state.activeStoryEvents ?? []).map(refreshEvent),
  };
}
