import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { GameState } from '../src/types';
import { TREE_A_HAOBANG_NODES } from '../src/components/FocusTree';
import { DECISIONS } from '../src/components/RightSidebar';

test('豪邦退党谈判只在国策完成后开始，且不再有重复决议', () => {
  const focus = TREE_A_HAOBANG_NODES.find(node => node.id === 'authoritarian_exit_negotiation');
  assert.ok(focus);
  assert.equal(focus.days, 10);
  assert.equal(focus.onStart, undefined);
  assert.equal(focus.onComplete?.({ flags: {} } as GameState).activeMinigame, 'nkpd_negotiation');
  assert.equal(focus.onComplete?.({ flags: { authoritarian_exit_done: true } } as unknown as GameState).activeMinigame, undefined);
  assert.equal(DECISIONS.some(decision => decision.id === 'probe_nkpd_negotiation'), false);
});
