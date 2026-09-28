import type { GameEvent } from '../types';
import { getLawSystem, LAWS, LAW_CATEGORIES, type LawSystemState } from '../data/laws';

// Only milestones that actually change the school's rules belong here. Branches can
// overwrite earlier rules; untouched categories retain the player's current choice.
export const FOCUS_LAW_TRANSITIONS: Record<string, Partial<LawSystemState>> = {
  perfect_hengshui: { discipline: 'hengshui', schedule: 'hengshui_schedule', education: 'exam_above_all', assessment: 'daily_testing', clubs: 'clubs_frozen' },
  declare_indep: { discipline: 'normal', schedule: 'standard_schedule', personnel: 'teacher_council', assessment: 'weekly_testing' },
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
  wu_negotiate_peace: { discipline: 'normal', clubs: 'clubs_open' },
  wu_power_review: { discipline: 'strict' },
  wu_iron_curtain: { discipline: 'panopticon', clubs: 'clubs_frozen' },
};

export function applyFocusLawTransition(current: LawSystemState | undefined, focusId: string): LawSystemState {
  return { ...getLawSystem(current), ...FOCUS_LAW_TRANSITIONS[focusId] };
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
