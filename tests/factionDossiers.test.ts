import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { GameState } from '../src/types';
import { getFactionDossier } from '../src/data/factionDossiers';

function at(tree: string, flags: Record<string, boolean> = {}, completedFocuses: string[] = []): GameState {
  return { currentFocusTree: tree, flags, completedFocuses } as unknown as GameState;
}

test('派系领导人和处境跟随路线及剧情节点变化', () => {
  assert.equal(getFactionDossier(at('phase1'), 'authoritarian').leader, '封安宝');
  assert.equal(getFactionDossier(at('treeA_lu_bohan'), 'authoritarian').leader, '吕波汉');
  assert.equal(getFactionDossier(at('wu_tree_p2_coup'), 'authoritarian').leader, '吴福军');
  assert.equal(getFactionDossier(at('treeA_haobang'), 'radical_socialism').leader, '王照凯');
  assert.equal(getFactionDossier(at('treeA_haobang', { wzk_seat_vacant: true }), 'radical_socialism').leader, '豪邦');
  assert.equal(getFactionDossier(at('treeA_pan'), 'liberal').role, '学生议会议长');
  assert.match(getFactionDossier(at('treeA_haobang', {}, ['pan_reconciliation']), 'liberal').description, /潘仁越重新进入谈判桌/);
  assert.equal(getFactionDossier(at('jidi_tree'), 'anarcho_capitalism').role, '及第教育CEO');
});
