import type { GameState } from '../types';

export const INITIAL_ASSEMBLY = { orthodox: 30, bear: 20, pan: 20, otherDem: 15, testTaker: 15 };
export const TRUE_LEFT_UNITY_MIN = 55;
export const CROSSROADS_RULES = [
  '民主路线：潘派 >30席、团结 >70、集权 <30',
  '真左路线：正统派严格最多、团结 ≥55、集权 >60',
  '王潘和解：双方各 >25席、团结 >60、集权 30–70；优先满足以上路线时按以上判定',
];

export type CrossroadsOutcome = 'democracy' | 'true_left' | 'union' | 'great_awakening' | 'pleasure_of_mediocrity' | 'gouxiong_usurpation';
export function getCrossroadsOutcome(state: GameState): CrossroadsOutcome {
  const f = state.studentAssemblyFactions ?? INITIAL_ASSEMBLY;
  const { allianceUnity: unity, partyCentralization: central } = state.stats;
  const orthodoxLeads = Object.entries(f).every(([id, seats]) => id === 'orthodox' || f.orthodox > (seats ?? 0));
  if (f.pan > 30 && unity > 70 && central < 30) return 'democracy';
  if (orthodoxLeads && unity >= TRUE_LEFT_UNITY_MIN && central > 60) return 'true_left';
  if (f.pan > 25 && f.orthodox > 25 && unity > 60 && central >= 30 && central <= 70) return 'union';
  if (unity < 40 && central > 80) return 'great_awakening';
  if (central < 40) return 'pleasure_of_mediocrity';
  return 'gouxiong_usurpation';
}
export const CROSSROADS_LABELS: Record<CrossroadsOutcome, string> = {
  democracy: '潘仁越民主路线', true_left: '王照凯真左路线', union: '王潘和解 · 可选择主导路线',
  great_awakening: '联盟决裂风险', pleasure_of_mediocrity: '改革停滞风险', gouxiong_usurpation: '狗熊夺权风险',
};
const clamp = (n: number) => Math.max(0, Math.min(100, n));
type Seats = NonNullable<GameState['studentAssemblyFactions']>;
/** Reassign existing seats. Never inflate the chamber or produce negative seats. */
export function transferSeats(seats: Seats, recipient: keyof Seats, count: number, donors: Array<keyof Seats>): Seats {
  const next = { ...seats };
  let remaining = Math.max(0, Math.floor(count));
  for (const donor of donors) {
    if (donor === recipient) continue;
    const taken = Math.min(remaining, next[donor] ?? 0);
    next[donor] = (next[donor] ?? 0) - taken;
    next[recipient] = (next[recipient] ?? 0) + taken;
    remaining -= taken;
    if (!remaining) break;
  }
  return next;
}

export function applyYangSettlement(state: GameState, choice: 'trial' | 'compromise'): Partial<GameState> {
  if (state.flags.yang_settlement) return {};
  let seats = state.studentAssemblyFactions ?? INITIAL_ASSEMBLY;
  if (choice === 'trial') {
    seats = transferSeats(seats, 'orthodox', 6, ['testTaker', 'otherDem', 'pan', 'bear']);
    return { studentAssemblyFactions: seats, advisors: state.advisors.map(a => a?.id === 'yang_yule' ? null : a),
      stats: { ...state.stats, allianceUnity: clamp(state.stats.allianceUnity - 10), partyCentralization: clamp(state.stats.partyCentralization + 10), radicalAnger: clamp(state.stats.radicalAnger + 15) },
      flags: { ...state.flags, yang_settlement: choice, yang_yule_removed_by_trial: true } };
  }
  seats = transferSeats(seats, 'pan', 4, ['orthodox', 'bear', 'otherDem']);
  seats = transferSeats(seats, 'testTaker', 3, ['bear', 'orthodox', 'otherDem']);
  return { studentAssemblyFactions: seats,
    stats: { ...state.stats, allianceUnity: clamp(state.stats.allianceUnity + 15), partyCentralization: clamp(state.stats.partyCentralization - 10), stab: clamp(state.stats.stab + 20), radicalAnger: clamp(state.stats.radicalAnger - 30) },
    flags: { ...state.flags, yang_settlement: choice } };
}

export function assemblyCrisisKind(state: GameState): 'opposition_slander' | 'democratic_power_struggle' | null {
  const unlocked = state.flags.assembly_unlocked || (state.completedFocuses ?? []).includes('convene_assembly') || (state.nationalSpirits ?? []).some(s => s.id === 'assembly_dynamics') || state.parliamentState;
  if (!unlocked || state.gameEnding) return null;
  if (state.currentFocusTree === 'treeA') return 'democratic_power_struggle';
  if (state.currentFocusTree === 'treeA_pan' || state.currentFocusTree === 'treeA_pan_despair') return 'opposition_slander';
  return null;
}
export function shouldTriggerAssemblyCrisis(state: GameState): boolean {
  const kind = assemblyCrisisKind(state);
  return !!kind && state.stats.studentSanity < 70 && (state.studentAssemblyFactions?.pan ?? 20) < 40
    && (kind !== 'democratic_power_struggle' || state.stats.allianceUnity < 65);
}
export function cleanAssemblyCrises(state: GameState): GameState {
  const kind = assemblyCrisisKind(state);
  const allowed = (id: string) => !['opposition_slander', 'democratic_power_struggle'].includes(id) || (id === kind && shouldTriggerAssemblyCrisis(state));
  const allowEvent = (id: string) => {
    if (id === 'opposition_slander_event') return kind === 'opposition_slander';
    if (id === 'democratic_power_struggle_event' || id === 'democratic_power_struggle_result') return kind === 'democratic_power_struggle';
    return true;
  };
  return { ...state, crises: (state.crises ?? []).filter(c => allowed(c.id)),
    activeEvent: state.activeEvent && allowEvent(state.activeEvent.id) ? state.activeEvent : null,
    activeStoryEvents: (state.activeStoryEvents ?? []).filter(e => allowEvent(e.id)) };
}
export function expireAssemblyCrisis(state: GameState, id: string, random = Math.random): Partial<GameState> {
  if (id !== assemblyCrisisKind(state)) return {};
  if (id === 'opposition_slander') return {
    stats: { ...state.stats, stab: clamp(state.stats.stab - 10), allianceUnity: clamp(state.stats.allianceUnity - 10) },
    flags: { ...state.flags, opposition_slander_cooldown: 15 },
  };
  const gained = 1 + Math.min(2, Math.floor(Math.max(0, random()) * 3));
  const unityDelta = Math.min(6, Math.floor(Math.max(0, random()) * 7)) - 3;
  const before = state.studentAssemblyFactions ?? INITIAL_ASSEMBLY;
  const seats = transferSeats(before, 'pan', gained, ['orthodox', 'bear', 'otherDem', 'testTaker']);
  return { studentAssemblyFactions: seats,
    stats: { ...state.stats, partyCentralization: clamp(state.stats.partyCentralization - 5), allianceUnity: clamp(state.stats.allianceUnity + unityDelta) },
    flags: { ...state.flags, democratic_power_struggle_cooldown: 15, democratic_power_struggle_seats: seats.pan - before.pan, democratic_power_struggle_unity: unityDelta } };
}
