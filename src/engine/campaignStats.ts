import type { GameState } from '../types';
import { getLawSystem } from '../data/laws';

export function getPaperUpkeep(state: GameState): number {
  const laws = getLawSystem(state.lawSystem);
  const tests = { daily_testing: 6, weekly_testing: 3, monthly_review: 2, project_assessment: 1 }[laws.assessment] ?? 3;
  const schedule = laws.schedule === 'hengshui_schedule' ? 2 : laws.schedule === 'high_intensity' ? 1 : 0;
  const education = laws.education === 'exam_above_all' ? 2 : laws.education === 'exam_first' ? 1 : 0;
  // 长期堆积的教辅会过时、损耗并占用印刷与库房能力。
  const stockWaste = Math.max(0, state.stats.tpr - 1500) * 0.06;
  return tests + schedule + education + stockWaste;
}

export function recordCampaignDay(previous: GameState, current: GameState, paperUpkeep: number): GameState {
  const old = current.campaignStats ?? previous.campaignStats ?? { days: 0, papersUsed: 0, papersPrinted: 0, clubEvents: 0, learningScoreTotal: 0 };
  const days = old.days + 1;
  const clubPolicy = getLawSystem(current.lawSystem).clubs;
  const clubInterval = clubPolicy === 'student_clubs' ? 7 : clubPolicy === 'clubs_open' ? 14 : clubPolicy === 'clubs_supervised' ? 35 : Infinity;
  const learningScore = Math.max(0, Math.min(100, current.stats.studentSanity * 0.28 + current.stats.stab * 0.2 + current.stats.ss * 0.17 + Math.min(100, current.stats.tpr / 15) * 0.35));
  return { ...current, campaignStats: {
    days,
    papersUsed: old.papersUsed + Math.round(paperUpkeep),
    papersPrinted: old.papersPrinted + Math.max(0, Math.round(current.stats.tpr - previous.stats.tpr + paperUpkeep)),
    clubEvents: old.clubEvents + (days % clubInterval === 0 ? 1 : 0),
    learningScoreTotal: old.learningScoreTotal + learningScore,
  } };
}

export function getCampaignSummary(state: GameState) {
  const legacyDays = Math.max(0, Math.round((state.date.getTime() - new Date(2023, 8, 1).getTime()) / 86400000));
  const snapshotScore = Math.max(0, Math.min(100, state.stats.studentSanity * 0.28 + state.stats.stab * 0.2 + state.stats.ss * 0.17 + Math.min(100, state.stats.tpr / 15) * 0.35));
  const stats = state.campaignStats ?? { days: legacyDays, papersUsed: Math.round(legacyDays * getPaperUpkeep(state)), papersPrinted: Math.round(legacyDays * getPaperUpkeep(state) + state.stats.tpr), clubEvents: 0, learningScoreTotal: snapshotScore * legacyDays };
  const average = stats.days ? stats.learningScoreTotal / stats.days : 50;
  let cohorts = 0;
  for (let year = 2024; year <= state.date.getFullYear(); year++) {
    if (new Date(year, 5, 1).getTime() <= state.date.getTime()) cohorts++;
  }
  return { ...stats, average: Math.round(average), cohorts, c9: Math.round(cohorts * (15 + average * 0.55)), university985: Math.round(cohorts * (130 + average * 3.2)) };
}
