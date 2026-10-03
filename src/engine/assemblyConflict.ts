import type { GameState } from '../types';
import { FLAVOR_EVENTS } from '../data/flavorEvents';
import { assemblyCrisisKind, assemblyDateKey, cleanAssemblyCrises, shouldTriggerAssemblyCrisis } from './assemblyPolitics';
import { enqueueEvent } from './eventQueue';

/** Also repairs an interrupted queue in saves; never awards focus effects twice. */
export function syncAssemblyConflict(input: GameState): GameState {
  let state = cleanAssemblyCrises(input);
  const kind = assemblyCrisisKind(state);
  if (kind === 'democratic_power_struggle' && state.crises.some(c => c.id === kind) && !state.flags.committee_authority_crisis_started) {
    state = { ...state, flags: { ...state.flags, committee_authority_crisis_started: true } };
  }
  if (kind && !state.crises.some(c => c.id === kind) && shouldTriggerAssemblyCrisis(state) && (kind === 'democratic_power_struggle' && !state.flags.committee_authority_crisis_started || !(state.flags[kind + '_cooldown'] > 0))) {
    const committee = kind === 'democratic_power_struggle';
    state = { ...state,
      flags: committee ? { ...state.flags, committee_authority_crisis_started: true, committee_authority_crisis_day: assemblyDateKey(state.date) } : state.flags,
      crises: [...state.crises, { id: kind, title: committee ? '民主派争权' : '反对派污蔑！', daysLeft: 30, totalDays: 30,
        description: committee ? '大会已经召开，潘仁越民主派要求限制指挥部的授权、扩大代表权。各派对新秩序的分歧进入公开议程。' : '学生理智低下且民主派在议会中处于弱势，反对派正在散布谣言。',
        resolutionText: committee ? '集权 ≤25，或潘派 ≥40席，或团结 ≥80且集权 ≤40；达到任一条件自动化解' : '学生理智 ≥70，或潘派 ≥40席（自动化解）',
        expiryText: committee ? '潘派随机 +1–3席（重新分配），集权 -5，团结随机 -3至+3' : '稳定 -10，联盟团结 -10',
      }],
    };
    const event = committee ? FLAVOR_EVENTS.democratic_power_struggle_event : {
      id: 'opposition_slander_event', title: '反对派污蔑！', description: '近期学生理智持续走低，潘仁越民主派在议会中的席位不足四十。反对派正在借校园中的不满散布谣言，争夺更多代表的支持。', buttonText: '回应质疑，争取代表。',
      effectsText: ['理智达到70或潘派达到40席可化解；30天后未化解则稳定与团结各 -10'],
    };
    state = { ...state, ...enqueueEvent(state, event) };
  }
  // A legacy save can be paused at the very focus whose popup was lost. Only
  // recover acknowledgements with idempotent effects, or an unresolved crossroads.
  if (state.currentFocusTree === 'treeA' && !state.gameEnding) {
    const latest = state.completedFocuses?.at(-1);
    const ids: Record<string, string> = { trial_yang: 'event_8_trial', secret_compromise: 'secret_compromise', crossroads_of_fate: 'event_10_crossroads' };
    const id = latest ? ids[latest] : undefined;
    if (id && !state.flags['event_seen_' + id]) state = { ...state, ...enqueueEvent(state, FLAVOR_EVENTS[id], true) };
  }
  return state.activeEvent ? { ...state, isPaused: true } : state;
}
