import type { GameState } from '../types';
import type { HeyiLightSnapshot } from './heyiLight';

export type CampusChapter = 0 | 1 | 2;
export type CampusBranch = 'standard' | 'spring' | 'coup' | 'institution' | 'nkpd';

export function getCampusArtScene(state: GameState, scene: HeyiLightSnapshot): HeyiLightSnapshot {
  return scene.route === 'revolution' && state.flags.reform_unlocked && state.reformState ? {...scene,route:'reform'} : scene;
}

export function getCampusArtBranch(state: GameState): CampusBranch {
  if (state.currentFocusTree === 'wu_tree_p2_spring') return 'spring';
  if (state.currentFocusTree === 'wu_tree_p2_coup') return 'coup';
  if (state.currentFocusTree === 'wu_tree_p2_feng') return 'institution';
  if (state.currentFocusTree === 'treeA_lu_bohan') return 'nkpd';
  return 'standard';
}

/** Presentation only: uses completed story milestones, never changes the save. */
export function getCampusArtChapter(state: GameState, scene: HeyiLightSnapshot): CampusChapter {
  const done = (ids: string[]) => ids.some(id => state.completedFocuses.includes(id));
  if (scene.route === 'uprising') return scene.uprisingStage === 'assembly' ? 2 : scene.uprisingStage === 'committee' ? 1 : 0;
  if (scene.route === 'democracy') return scene.democraticVictory ? 2 : state.electionState?.isActive ? 1 : done(['bill_club_freedom', 'bill_curriculum_reform']) ? 2 : 0;
  if (scene.route === 'jidi_riot') return state.flags.jidi_riot_failed || state.gameEnding === 'game_over_jidi_2' ? 2 : (state.jidiCorporateState?.riotState?.daysActive ?? 0) >= 5 ? 1 : 0;
  if (scene.route === 'yang') return (state.yangYuleState?.health ?? 100) < 35 ? 2 : (state.yangYuleState?.titleStage ?? 0) >= 2 ? 1 : 0;
  if (scene.route === 'reform') return (state.reformState?.progress ?? 0) >= 75 ? 2 : (state.reformState?.progress ?? 0) >= 25 ? 1 : 0;
  if (scene.route === 'wu' && state.currentFocusTree.startsWith('wu_tree_p2_')) return 2;
  if (scene.route === 'despair') return done(['counter_attack']) ? 2 : done(['defend_b3']) ? 1 : 0;
  if (state.gameEnding) return 2;
  const milestones: Partial<Record<HeyiLightSnapshot['route'], [string[], string[]]>> = {
    opening: [['wu_patrol', 'fake_five_edu'], ['ban_books', 'charge_b3']],
    jidi: [['jidi_rnd_department', 'jidi_performance_metrics'], ['jidi_monopoly', 'jidi_value_extraction']],
    revolution: [['declare_victory', 'start_reform'], ['reform_focus_3', 'true_left_ending']],
    haobang: [['post_negotiation_events', 'pan_reconciliation'], ['assembly_new_charter', 'commune_federation_charter', 'haobang_grand_success']],
    wu: [['wu_martial_law', 'great_purge_map_phase'], ['wu_iron_curtain', 'wu_millennium_plan', 'sole_helmsman', 'wu_negotiate_peace']],
    gouxiong: [['gx_cyber_bootstrap', 'gx_gal_bootstrap'], ['gx_campus_rewrite', 'gx_embarrass_settlement', 'gx_redeem_settlement', 'gx_ruin_settlement']],
  };
  const milestonesForRoute = milestones[scene.route];
  return milestonesForRoute && done(milestonesForRoute[1]) ? 2 : milestonesForRoute && done(milestonesForRoute[0]) ? 1 : 0;
}
