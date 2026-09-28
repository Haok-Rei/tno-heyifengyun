import type { GameState } from '../types';

export const ELECTION_DISTRICTS = ['b3', 'admin', 'b1b2', 'auditorium', 'lab', 'playground'] as const;
export const ELECTION_CANDIDATES = ['pan', 'orthodox', 'bear', 'conservativeDem', 'testTaker'] as const;

export function shiftPoll(poll: Record<string, number>, candidate: string, gain: number): Record<string, number> {
  const next = { ...poll, [candidate]: Math.max(0, (poll[candidate] || 0) + gain) };
  const total = Object.values(next).reduce((sum, value) => sum + Math.max(0, value), 0);
  if (total <= 0) return next;
  Object.keys(next).forEach(key => { next[key] = 100 * Math.max(0, next[key]) / total; });
  return next;
}

export function startCampaignTeams(candidates: string[] = [...ELECTION_CANDIDATES]): NonNullable<GameState['electionState']>['campaignTeams'] {
  return candidates.map((candidate, index) => ({ candidate, district: ELECTION_DISTRICTS[index % ELECTION_DISTRICTS.length], visits: 0 }));
}

export function advanceCampaignTeams(election: NonNullable<GameState['electionState']>, locations: GameState['mapLocations']) {
  const elapsed = election.totalDays - election.daysLeft;
  const teams = (election.campaignTeams?.length ? election.campaignTeams : startCampaignTeams(election.candidates)).map((team, index) => {
    const district = ELECTION_DISTRICTS[(index + Math.floor(elapsed / 5)) % ELECTION_DISTRICTS.length];
    const loc = locations[district];
    if (loc?.pollingData) locations[district] = { ...loc, pollingData: shiftPoll(loc.pollingData, team.candidate, 1.5) };
    return { ...team, district, visits: team.visits + (district !== team.district ? 1 : 0) };
  });
  return { ...election, campaignTeams: teams };
}
