import type { GameState } from '../types';
import { FLAVOR_EVENTS } from '../data/flavorEvents';
import { getLawSystem } from '../data/laws';
import { canDrawCampusDocument, drawCampusDocument } from './campusEvents';

const day = (date: Date) => Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
const deskGate: Record<string, (state: GameState) => boolean> = {
  yang_desk_paper_authorship: () => true,
  yang_desk_contraband_list: s => ['strict', 'hengshui', 'panopticon'].includes(getLawSystem(s.lawSystem).discipline),
  yang_desk_tutoring_center: () => true,
  yang_desk_pe_cancellation: s => ['high_intensity', 'hengshui_schedule'].includes(getLawSystem(s.lawSystem).schedule),
  yang_desk_anonymous_note: s => s.stats.radicalAnger >= 20,
  yang_desk_oath_rally: () => true,
  yang_desk_destroy_books: () => true,
  yang_desk_buy_exams: () => true,
  yang_desk_mocking_letter: s => s.stats.ss < 60,
  yang_desk_standing_reading: s => ['high_intensity', 'hengshui_schedule'].includes(getLawSystem(s.lawSystem).schedule),
  yang_desk_health_scare: s => (s.yangYuleState?.health ?? 100) < 85,
  yang_desk_parent_petition: s => s.stats.studentSanity < 60,
  yang_desk_young_teacher_quit: s => (s.yangYuleState?.teacherSupport ?? 100) < 80,
  yang_desk_informant_report: s => s.stats.radicalAnger >= 20,
  yang_desk_textbook_scandal: s => s.stats.capitalPenetration >= 10,
  yang_desk_alumni_donation: s => s.stats.stab >= 45,
  yang_desk_thermos_mystery: () => true,
  yang_desk_snow_day: s => [11, 0, 1].includes(s.date.getMonth()),
  yang_desk_retirement_letter: s => (s.yangYuleState?.titleStage ?? 0) >= 2,
  yang_desk_midnight_call: s => s.stats.radicalAnger >= 35,
};

export function availableYangDeskDocuments(state: GameState): string[] {
  if (state.currentFocusTree !== 'treeB' || !state.yangYuleState?.unlockedMechanics.desk) return [];
  const seen = state.campusEvents?.seen ?? [];
  return Object.keys(deskGate).filter(id => !seen.includes(id) && !!FLAVOR_EVENTS[id] && deskGate[id](state));
}

export function canDrawYangDeskDocument(state: GameState): boolean {
  if (state.currentFocusTree !== 'treeB' || !state.yangYuleState?.unlockedMechanics.desk || state.stats.pp < 5) return false;
  if (state.activeEvent || state.activeStoryEvents.length || state.activeSuperEvent || state.activeMinigame || state.gameEnding) return false;
  if (state.campusEvents?.lastDocumentDay === day(state.date)) return false;
  return availableYangDeskDocuments(state).length > 0 || canDrawCampusDocument(state);
}

/** 桌上旧文件与新的阶段性校园事务共存；旧稿只读一次，日期记录与新版共用。 */
export function drawYangDeskDocument(state: GameState, random = Math.random): GameState {
  if (!canDrawYangDeskDocument(state)) return state;
  const originals = availableYangDeskDocuments(state);
  if (!originals.length || (canDrawCampusDocument(state) && random() >= 0.7)) return drawCampusDocument(state, random);

  const id = originals[Math.min(originals.length - 1, Math.floor(random() * originals.length))];
  const history = state.campusEvents ?? { seen: [], familyDays: {}, resolved: [] };
  return {
    ...state,
    isPaused: true,
    activeEvent: FLAVOR_EVENTS[id],
    stats: { ...state.stats, pp: state.stats.pp - 5 },
    campusEvents: { ...history, lastDocumentDay: day(state.date), seen: [...history.seen, id] },
    // 原版文件选择会直接结算人物数值；批阅计数在文件签收时记录，读档仍保留。
    flags: { ...state.flags, yang_yule_decisions_clicked: (state.flags.yang_yule_decisions_clicked || 0) + 1 },
  };
}
