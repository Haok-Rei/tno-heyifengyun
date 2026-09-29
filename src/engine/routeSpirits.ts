import type { GameState, NationalSpirit } from '../types';
import { getCommandRoute } from '../data/commandRoutes';

type Route = ReturnType<typeof getCommandRoute>['id'];

// 只登记叙事明确归属某条路线的精神。未登记的通用精神与法律精神保留。
const owners: Record<string, readonly Route[]> = {
  exam_pressure: ['opening', 'yang', 'wu', 'jidi'],
  angry_hefei_no1: ['opening'],
  new_reform_cloud: ['opening'],
  wu_patrol_spirit: ['opening', 'yang', 'wu'],
  b3_fortress: ['opening', 'revolution', 'democracy', 'reform', 'commune', 'purge'],
  red_campus: ['revolution', 'democracy', 'reform', 'commune', 'purge'],
  student_council: ['revolution', 'democracy', 'reform', 'commune', 'purge'],
  awakened_binhu: ['revolution', 'democracy', 'reform', 'commune', 'purge'],
  silenced_vanguard: ['revolution', 'democracy', 'reform', 'commune', 'purge'],
  vanguard_party: ['revolution', 'reform', 'commune', 'purge'],
  armed_militia: ['revolution', 'democracy', 'reform', 'commune', 'purge'],
  teacher_support: ['revolution', 'democracy', 'reform', 'commune', 'purge'],
  red_toad_politburo: ['revolution', 'democracy', 'reform', 'commune', 'purge'],
  democratic_councils_spirit: ['revolution', 'democracy', 'reform', 'commune'],
  assembly_dynamics: ['revolution', 'democracy', 'reform', 'commune'],
  path_of_democracy: ['democracy'],
  democratic_victory: ['democracy'],
  desperate_defense: ['democracy'],
  strict_discipline_spirit: ['democracy'],
  red_culture_spirit: ['democracy'],
  extra_mock_exams_spirit: ['democracy'],
  club_freedom_spirit: ['democracy'],
  no_evening_study_spirit: ['democracy'],
  student_welfare_spirit: ['democracy'],
  transparent_finances_spirit: ['democracy'],
  curriculum_reform_spirit: ['democracy'],
  wang_pan_pact: ['democracy', 'reform'],
  red_terror_nkpd: ['purge'],
  two_chariots_distrust: ['purge'],
  haobang_assembly_charter: ['commune'],
  haobang_legacy_guard: ['commune'],
  haobang_grand_reform: ['commune'],
  yang_yule_regime: ['yang'],
  jidi_corporate_rule: ['jidi'],
  jidi_corporate_utopia_spirit: ['jidi'],
  jidi_riot_spirit: ['jidi'],
  cyber_hedonism_rule: ['gouxiong'],
  gouxiong_sanity_state: ['gouxiong'],
  eternal_ruin_spirit: ['gouxiong'],
  wu_martial_law_spirit: ['wu'],
  wu_rule_of_law_spirit: ['wu'],
  wu_expansion_spirit: ['wu'],
  wu_armed_guard_spirit: ['wu'],
  wu_iron_curtain_spirit: ['wu'],
};

const routeSpiritPrefixes: Partial<Record<Route, readonly string[]>> = {
  jidi: ['jidi_minor_spirit_'],
};

export function isSpiritValidForRoute(spirit: NationalSpirit, route: Route): boolean {
  const allowed = owners[spirit.id];
  if (allowed) return allowed.includes(route);
  for (const [owner, prefixes] of Object.entries(routeSpiritPrefixes)) {
    if (prefixes?.some(prefix => spirit.id.startsWith(prefix))) return owner === route;
  }
  return true;
}

export function reconcileRouteSpirits(state: GameState): GameState {
  const route = getCommandRoute(state).id;
  const branch = state.currentFocusTree;
  const nationalSpirits = state.nationalSpirits.filter(spirit => {
    if (!isSpiritValidForRoute(spirit, route)) return false;
    if (spirit.id === 'desperate_defense') return branch === 'treeA_pan_despair';
    if (spirit.id === 'wu_rule_of_law_spirit') return branch === 'wu_tree_p2_feng';
    if (['wu_expansion_spirit', 'wu_armed_guard_spirit', 'wu_iron_curtain_spirit'].includes(spirit.id)) return branch === 'wu_tree_p2_coup';
    return true;
  });
  return nationalSpirits.length === state.nationalSpirits.length ? state : { ...state, nationalSpirits };
}
