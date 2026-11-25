import { ALL_BUILDING_IDS, type GameState } from '../types';
import { getBuildingControl } from './mapState';

export const CAMPUS_COUNTERATTACK = {
  committeeDays: 18,
  crossingLost: 4,
  ultimatumLost: 5,
  stability: 35,
  papers: 140,
  support: 32,
  schoolDays: 18,
};

export const DARK_CROSSROADS_REQUIREMENTS =
  '联合革委会进入第18天后，至少4个建筑区失守、稳定度低于35，并且试卷储备≤140或学生支持低于32。';

type PressureStats = Pick<GameState['stats'], 'tpr' | 'ss' | 'stab'>;

export function isSchoolCounterattackPressure(stats: PressureStats) {
  return stats.tpr <= CAMPUS_COUNTERATTACK.papers && stats.ss < CAMPUS_COUNTERATTACK.support;
}

export function isDarkCrossroadsReady(days: number, lost: number, stats: PressureStats) {
  return days >= CAMPUS_COUNTERATTACK.committeeDays
    && lost >= CAMPUS_COUNTERATTACK.crossingLost && stats.stab < CAMPUS_COUNTERATTACK.stability
    && (stats.tpr <= CAMPUS_COUNTERATTACK.papers || stats.ss < CAMPUS_COUNTERATTACK.support);
}

export function canChooseDarkCrossroads(state: GameState) {
  return state.currentFocusTree === 'treeA' && !state.flags.map_struggle_ended
    && isDarkCrossroadsReady(
      Number(state.flags.treeA_days_elapsed ?? 0),
      ALL_BUILDING_IDS.filter(id => Math.round(getBuildingControl(state, id)) < 45).length,
      state.stats,
    );
}
