import test from 'node:test';
import assert from 'node:assert/strict';
import type { Advisor } from '../src/types';
import { getAdvisorProfile, getLeaderTraits } from '../src/data/characterProfiles';

test('character dossiers separate story descriptions from positive and negative traits', () => {
  const advisor: Advisor = {
    id: 'wu_fujun', name: '吴福军', title: '教务督导', description: '旧存档中的数值文案', cost: 150,
    modifiers: { stabDaily: 0.2, ssDaily: -0.2 },
  };
  const profile = getAdvisorProfile(advisor);
  assert.match(profile.description, /巡查表/);
  assert.deepEqual(profile.traits.map(trait => trait.positive), [true, false]);
  assert.deepEqual(getLeaderTraits(['每日稳定度 +0.05', '每日卷子储备 -10']).map(trait => trait.positive), [true, false]);
});
