import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { RedToadState } from '../src/types';
import { ensureRedToadState } from '../src/data/redToadState';

test('politburo entry repairs incomplete route data before opening', () => {
  const incomplete = {
    overallConsensus: 55,
    factions: { orthodox: { influence: 30, loyalty: 70 } },
    activeBillId: null,
    billCooldown: 0,
    historicalBills: [],
    availableBills: [],
  } as unknown as RedToadState;
  const repaired = ensureRedToadState(incomplete);
  assert.equal(repaired.factions.orthodox.name, '正统派');
  assert.equal(repaired.factions.authoritarian.leader, '吕波汉');
  assert.equal(repaired.overallConsensus, 55);
  assert.equal(ensureRedToadState(repaired), repaired);
});
