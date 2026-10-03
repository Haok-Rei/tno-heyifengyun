import test from 'node:test';
import assert from 'node:assert/strict';
import type { GameState } from '../src/types';
import { refreshReviewedDescriptions, type ProseRevision } from '../src/engine/proseRevisions';

test('save prose refresh matches identity and exact old text, preserving story state and effects', () => {
  const effect = (s: GameState) => s;
  const source = {
    date: new Date(2023, 8, 1), stats: { pp: 125 }, flags: { chapter: 2 },
    leader: { name: '甲', title: '校长', portrait: 'a', ideology: 'liberal', description: '旧传', buffs: ['每日PP +1'] },
    advisors: [null, { id: 'b', description: '旧顾问', modifiers: { stabDaily: 0.2 } }],
    nationalSpirits: [{ id: 's', description: '旧精神', effects: { ppDaily: 0.4 } }, { id: 'dynamic', description: '即时状态12' }],
    activeEvent: { id: 'e', description: '旧事件', choices: [{ text: '决定', effect }] },
    activeStoryEvents: [{ id: 'news', description: '旧通报' }],
  } as unknown as GameState;
  const revisions: ProseRevision[] = [
    { kind: 'person', id: '甲/校长/a', before: '旧传', after: '新传' },
    { kind: 'person', id: 'b', before: '旧顾问', after: '新顾问' },
    { kind: 'spirit', id: 's', before: '旧精神', after: '新精神' },
    { kind: 'event', id: 'e', before: '旧事件', after: '新事件' },
    { kind: 'news', id: 'news', before: '旧通报', after: '新通报' },
    { kind: 'spirit', id: 'dynamic', before: '初始介绍', after: '新的初始介绍' },
  ];
  const result = refreshReviewedDescriptions(source, revisions);
  assert.equal(result.leader.description, '新传');
  assert.equal(result.advisors[1]!.description, '新顾问');
  assert.equal(result.activeEvent!.description, '新事件');
  assert.equal(result.activeStoryEvents![0].description, '新通报');
  assert.equal(result.nationalSpirits[0].description, '新精神');
  assert.equal(result.nationalSpirits[1].description, '即时状态12');
  assert.strictEqual(result.stats, source.stats);
  assert.strictEqual(result.flags, source.flags);
  assert.strictEqual(result.nationalSpirits[0].effects, source.nationalSpirits[0].effects);
  assert.strictEqual(result.activeEvent!.choices![0].effect, effect);
  assert.equal(source.leader.description, '旧传');
  const later = { ...source, leader: { ...source.leader, title: '顾问' } };
  assert.equal(refreshReviewedDescriptions(later, revisions).leader.description, '旧传');
  const custom = { ...source, leader: { ...source.leader, description: '此阶段另有描述' } };
  assert.equal(refreshReviewedDescriptions(custom, revisions).leader.description, '此阶段另有描述');
});
