import type { RedToadFaction, RedToadState } from '../types';

const INITIAL_FACTIONS: Record<string, RedToadFaction> = {
  orthodox: { id: 'orthodox', name: '正统派', leader: '王兆凯', influence: 420, loyalty: 75, execution: 60, color: '#f0d44a', view: '[领袖视图]', portrait: 'faction_orthodox' },
  libertarian_socialist: { id: 'libertarian_socialist', name: '自社派', leader: '豪邦', influence: 280, loyalty: 70, execution: 45, color: '#4a90f0', view: '[基层信号]', portrait: 'faction_libertarian_socialist' },
  anarchist: { id: 'anarchist', name: '安那其派', leader: '时纪', influence: 180, loyalty: 55, execution: 35, color: '#4af0d4', view: '[信号丢失]', portrait: 'faction_anarchist' },
  internet_philosopher: { id: 'internet_philosopher', name: '网哲派', leader: '周红兵', influence: 120, loyalty: 45, execution: 20, color: '#d44af0', view: '[迷雾覆盖]', portrait: 'faction_internet_philosopher' },
  authoritarian: { id: 'authoritarian', name: '极权派', leader: '吕波汉', influence: 300, loyalty: 30, execution: 85, color: '#ff4444', view: '[保密视图]', portrait: 'faction_authoritarian' },
};

export function ensureRedToadState(current?: RedToadState): RedToadState {
  if (!current) return { overallConsensus: 55, factions: { ...INITIAL_FACTIONS }, activeBillId: null, billCooldown: 0, historicalBills: [], availableBills: [] };
  const factions = Object.fromEntries(Object.entries(current.factions || {}).filter(([, faction]) => faction && typeof faction.id === 'string' && typeof faction.name === 'string'));
  if (Object.keys(factions).length === Object.keys(current.factions || {}).length && Object.keys(factions).length > 0) return current;
  return { ...current, factions: { ...INITIAL_FACTIONS, ...factions } };
}
