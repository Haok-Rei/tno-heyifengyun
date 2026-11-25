import type { GameEvent, GameState } from '../types';
import { getLawSystem, LAWS, LAW_CATEGORIES, type LawSystemState } from '../data/laws';

// Only milestones that actually change the school's rules belong here. Branches can
// overwrite earlier rules; untouched categories retain the player's current choice.
export const FOCUS_LAW_TRANSITIONS: Record<string, Partial<LawSystemState>> = {
  perfect_hengshui: { discipline: 'hengshui', schedule: 'hengshui_schedule', education: 'exam_above_all', assessment: 'daily_testing', clubs: 'clubs_frozen' },
  declare_indep: { discipline: 'normal', schedule: 'standard_schedule', personnel: 'teacher_council', assessment: 'weekly_testing' },
  committee_student_charter: { discipline: 'partial_autonomy', personnel: 'student_assembly_hr', clubs: 'clubs_open' },
  democratic_councils: { personnel: 'student_assembly_hr' },
  jidi_new_era: { education: 'exam_above_all', schedule: 'high_intensity', assessment: 'daily_testing' },
  jidi_establish_committee: { personnel: 'director_committee' },
  jidi_strict_discipline: { discipline: 'hengshui', clubs: 'clubs_frozen' },
  jidi_sony_model: { education: 'exam_first', schedule: 'standard_schedule' },
  gx_start: { discipline: 'full_autonomy', schedule: 'free_schedule', clubs: 'student_clubs', assessment: 'project_assessment' },
  expand_assembly: { personnel: 'student_assembly_hr' },
  democratic_reforms: { discipline: 'partial_autonomy', schedule: 'flexible_schedule', clubs: 'clubs_open' },
  start_reform: { education: 'balanced', assessment: 'monthly_review' },
  haobang_start: { discipline: 'normal', personnel: 'teacher_council', education: 'balanced' },
  wu_order_restored: { discipline: 'strict', personnel: 'principal_decree', clubs: 'clubs_frozen' },
  wu_martial_law: { discipline: 'panopticon', schedule: 'high_intensity' },
  wu_club_concession: { clubs: 'clubs_supervised' },
  wu_rule_by_law: { discipline: 'strict', personnel: 'director_committee' },
  wu_feng_curriculum_cage: { education: 'exam_above_all', assessment: 'daily_testing' },
  wu_feng_student_cadres: { clubs: 'clubs_supervised' },
  wu_safe_school: { discipline: 'normal', schedule: 'standard_schedule', clubs: 'clubs_supervised' },
  wu_wu_demote: { personnel: 'teacher_council' },
  wu_negotiate_peace: { discipline: 'partial_autonomy', personnel: 'teacher_council', clubs: 'clubs_open' },
  wu_power_review: { discipline: 'strict' },
  wu_iron_curtain: { discipline: 'panopticon', clubs: 'clubs_frozen' },
};

export function applyFocusLawTransition(current: LawSystemState | undefined, focusId: string): LawSystemState {
  return { ...getLawSystem(current), ...FOCUS_LAW_TRANSITIONS[focusId] };
}

const ROUTE_GOVERNMENTS: Record<string, { laws: Partial<LawSystemState>; shares: number[] }> = {
  treeA: {
    laws: { discipline: 'normal', schedule: 'standard_schedule', personnel: 'teacher_council', assessment: 'weekly_testing', clubs: 'clubs_supervised' },
    shares: [12, 7, 25, 40, 5, 5, 6],
  },
  treeA_pan_despair: {
    laws: { discipline: 'partial_autonomy', schedule: 'standard_schedule', personnel: 'student_assembly_hr', assessment: 'monthly_review', clubs: 'clubs_frozen' },
    shares: [20, 4, 39, 31, 3, 1, 2],
  },
  wu_tree: {
    laws: { discipline: 'panopticon', schedule: 'hengshui_schedule', personnel: 'principal_decree', education: 'exam_above_all', assessment: 'daily_testing', clubs: 'clubs_frozen' },
    shares: [58, 13, 7, 8, 7, 1, 6],
  },
  wu_tree_p2_feng: {
    laws: { discipline: 'strict', schedule: 'high_intensity', personnel: 'principal_decree', education: 'exam_first', assessment: 'weekly_testing', clubs: 'clubs_supervised' },
    shares: [55, 16, 7, 6, 5, 2, 9],
  },
  wu_tree_p2_spring: {
    laws: { discipline: 'strict', schedule: 'standard_schedule', personnel: 'director_committee', education: 'exam_first', assessment: 'weekly_testing', clubs: 'clubs_supervised' },
    shares: [38, 18, 24, 8, 4, 2, 6],
  },
  wu_tree_p2_coup: {
    laws: { discipline: 'panopticon', schedule: 'high_intensity', personnel: 'principal_decree', assessment: 'daily_testing', clubs: 'clubs_frozen' },
    shares: [72, 8, 5, 5, 5, 1, 4],
  },
};

export function getRouteGovernment(previousTree: string, nextTree: string, currentLaws?: LawSystemState):
    Pick<GameState, 'lawSystem' | 'ideologies'> | undefined {
  if (previousTree === nextTree) return undefined;
  const government = ROUTE_GOVERNMENTS[nextTree];
  if (!government) return undefined;
  const [authoritarian, reactionary, liberal, radical_socialism, anarcho_capitalism, deconstructivism, test_taking] = government.shares;
  return {
    lawSystem: { ...getLawSystem(currentLaws), ...government.laws },
    ideologies: { authoritarian, reactionary, liberal, radical_socialism, anarcho_capitalism, deconstructivism, test_taking },
  };
}

export function lawChangeEvent(before: LawSystemState | undefined, after: LawSystemState | undefined, source: string, date: Date): GameEvent | null {
  const old = getLawSystem(before);
  const next = getLawSystem(after);
  const changes = LAW_CATEGORIES.filter(category => old[category.id] !== next[category.id]);
  if (!changes.length) return null;
  return {
    id: `law_transition_${date.getTime()}_${source.replace(/[^a-zA-Z0-9_]/g, '_')}`,
    title: '校规与法案调整',
    description: `${source}后，新的校内安排正式生效。\n\n${changes.map(category => `▸ ${category.name}：${LAWS[old[category.id]]?.name ?? old[category.id]} → ${LAWS[next[category.id]]?.name ?? next[category.id]}`).join('\n')}\n\n各项效果已经计入每日结算。`,
    buttonText: '查看新规',
    isStoryEvent: true,
  };
}
