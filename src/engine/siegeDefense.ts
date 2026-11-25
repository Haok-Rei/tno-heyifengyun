export const SIEGE_ORDERS = {
  debater: { label: '实验班协调员', cost: 1, papers: 0, turns: 2, reduction: 28 },
  picket: { label: '钢铁红蛤预备队', cost: 2, papers: 0, turns: 1, reduction: 49 },
  barricade: { label: '白卷路障', cost: 1, papers: 50, turns: 2, reduction: 51 },
} as const;

export type SiegeOrder = keyof typeof SIEGE_ORDERS;
type Floor = { pressure: number; order?: { id: SiegeOrder; remaining: number } };
export type SiegeDefense = {
  round: number;
  ap: number;
  integrity: number;
  floors: Floor[];
  result?: 'held' | 'breached';
};

// Each line describes one round, from 1F to 5F.
export const SIEGE_WAVES = [
  [56,35,12,0,0], [52,17,42,8,0], [22,63,24,35,0], [48,36,60,17,7],
  [25,53,38,55,16], [58,22,56,32,36], [25,54,32,58,50], [38,31,58,55,61],
];

export function startSiegeDefense(fieldSupport: number, redToadSupport: boolean): SiegeDefense {
  return {
    round: 0,
    ap: 3 + Math.min(2, fieldSupport),
    integrity: redToadSupport ? 4 : 3,
    floors: Array.from({length: 5}, (_, index) => ({
      pressure: index === 0 ? (redToadSupport ? 8 : 20) : 0,
    })),
  };
}

export function canDeploySiegeOrder(state: SiegeDefense, floor: number, id: SiegeOrder, papers: number) {
  const order = SIEGE_ORDERS[id];
  const target = state.floors[floor];
  return !state.result && !!target && target.order?.id !== id && state.ap >= order.cost && papers >= order.papers
    && (id !== 'picket' || !state.floors.some(slot => slot.order?.id === 'picket'));
}

export function deploySiegeOrder(state: SiegeDefense, floor: number, id: SiegeOrder): SiegeDefense {
  const order = SIEGE_ORDERS[id];
  return {
    ...state,
    ap: state.ap - order.cost,
    floors: state.floors.map((slot, index) => index === floor ? { ...slot, order: { id, remaining: order.turns } } : slot),
  };
}

export function advanceSiegeDefense(state: SiegeDefense): SiegeDefense {
  if (state.result) return state;
  const wave = SIEGE_WAVES[state.round];
  let integrity = state.integrity;
  let spill = 0;
  const floors = state.floors.map((floor, index) => {
    const protectedBy = floor.order;
    const reduction = protectedBy ? SIEGE_ORDERS[protectedBy.id].reduction : 0;
    const pressure = Math.max(0, floor.pressure + wave[index] + spill - reduction);
    spill = pressure >= 100 ? 18 : 0;
    if (spill) integrity -= index === 4 ? 2 : 1;
    return {
      pressure: spill ? 54 : pressure,
      order: spill || !protectedBy || protectedBy.remaining === 1 ? undefined : { ...protectedBy, remaining: protectedBy.remaining - 1 },
    };
  });
  const result = integrity <= 0 ? 'breached' : state.round + 1 === SIEGE_WAVES.length ? 'held' : undefined;
  return {
    ...state, floors, integrity: Math.max(0, integrity), result,
    round: result ? state.round : state.round + 1,
    ap: result ? 0 : 3,
  };
}
