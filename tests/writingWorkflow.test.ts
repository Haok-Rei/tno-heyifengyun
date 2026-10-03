import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { catalog, planEdits, mechanicsFingerprint } from '../scripts/writing/catalog.mjs';
import { validateDraft, assertReferenceStudy, isMechanicHint, rebindSelection, proseRange } from '../scripts/writing/editor.mjs';
import { parseModelJSON } from '../scripts/writing/json-output.mjs';

test('a targeted longer event uses its fact-card range without relaxing short spirit limits',()=>{
  const event={kind:'event',before:'旧稿',lengthRange:{minChars:350,maxChars:580}};
  assert.equal(validateDraft(event,'情'.repeat(500)).errors.length,0);
  assert.ok(validateDraft({...event,kind:'spirit',lengthRange:{minChars:65,maxChars:135}},'情'.repeat(150)).errors.length);
  assert.throws(()=>proseRange({...event,lengthRange:{minChars:100,maxChars:901}}));
});

test('JSON cleanup removes only structural trailing commas, preserving quoted prose', () => {
  const prose = '正文包含逗号, } 和引号“句子”。';
  const parsed = parseModelJSON('{"items":[{"description":'+JSON.stringify(prose)+',},],}');
  assert.equal(parsed.data.items[0].description, prose);
  assert.equal(parsed.formatRepairs, 3);
  assert.throws(() => parseModelJSON('{"description":"未闭合'));
});

test('mechanic-only advisor hints are excluded without excluding narrative openings', () => {
  assert.equal(isMechanicHint({kind:'person',before:'每日试卷储备量 +20，B3教学楼所有任务成功率固定 +30%。'}), true);
  assert.equal(isMechanicHint({kind:'person',before:'解锁赛博解构机制'}), true);
  assert.equal(isMechanicHint({kind:'person',before:'解锁改革的困局，需要理解教务工作。'}), false);
  assert.equal(isMechanicHint({kind:'event',before:'解锁赛博解构机制'}), false);
});

test('prose edits preserve callbacks, choices, numeric effects and literal escaping', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'heyi-writing-'));
  try {
    fs.mkdirSync(path.join(root, 'src'), { recursive: true });
    const before = `const event={id:'e',description:'旧正文',choices:[{text:'保留',effect:s=>({...s,pp:s.pp-12})}]};`;
    fs.writeFileSync(path.join(root, 'src/App.tsx'), before);
    const start = before.indexOf("'旧正文'");
    const record = { key: 'e', status: 'approved', after: '新正文。\n\n“保留”，他说。\\并非代码。', locations: [{ file: 'src/App.tsx', start, end: start + "'旧正文'".length, before: '旧正文', line: 1 }] };
    const [change] = planEdits([record], root);
    assert.equal(mechanicsFingerprint(before), mechanicsFingerprint(change.after));
    assert.notEqual(mechanicsFingerprint(before), mechanicsFingerprint(change.after.replace('pp-12', 'pp-10')));
    assert.ok(change.after.includes(JSON.stringify(record.after)));
    assert.equal(fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8'), before, 'planning cannot write source');
    assert.throws(() => planEdits([{ ...record, status: 'pending' }], root), /approved/);
    assert.throws(() => planEdits([{ ...record, locations: [{ ...record.locations[0], before: '已经变化' }] }], root), /Stale/);
    assert.throws(() => planEdits([{ ...record, locations: [{ ...record.locations[0], file: '../outside.ts' }] }], root), /allowlist/);
    assert.throws(() => planEdits([record, record], root), /Overlapping/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('draft guards reject cross-route actors, modifiers and credentials', () => {
  const item = { kind: 'person', blockedActors: ['封安宝'] };
  const valid = '这位教师熟悉课堂上的困境，也知道行政工作如何影响教学。他愿意支持改革，但不把每一次成绩波动都视为方向错误。对他而言，学生应该得到能够理解的解释，教师也需要能够执行的安排。他的经验可以帮助新管理者处理日常事务，却不能代替所有人作出政治选择。';
  assert.deepEqual(validateDraft(item, valid).errors, []);
  assert.ok(validateDraft(item, valid + '封安宝').errors.some(e => e.includes('actor')));
  assert.ok(validateDraft(item, valid + '每日稳定度 +0.5').errors.some(e => e.includes('mechanics')));
  assert.ok(validateDraft(item, valid + 'sk-' + 'x'.repeat(32)).errors.some(e => e.includes('credential')));
});

test('catalog exposes per-stage prose with exact sources and never selects dynamic scene spirit', () => {
  const items = catalog();
  assert.equal(new Set(items.map(i => i.key)).size, items.length);
  assert.ok(items.some(i => i.kind === 'event' && i.id === 'authorship'));
  assert.ok(items.some(i => i.kind === 'person' && i.label === '周晨'));
  assert.ok(items.every(i => i.id !== 'heyi_light'));
  assert.ok(items.some(i => i.kind === 'event' && i.lockedUI.choices));
  assert.ok(items.some(i => i.route === 'commune' && i.trigger));
  assert.ok(items.some(i => i.id === 'phase1_hengshui_schedule' && i.route === 'opening' && i.trigger?.id === 'perfect_hengshui'));
  assert.ok(items.some(i => i.id === 'event_8_trial' && i.route === 'revolution' && i.trigger?.id === 'trial_yang'));
});

test('targeted rewrites rebind overlapping reusable selections and preserve unrelated cards', () => {
  const draft = { key: 'old', kind: 'event', id: 'trial', after: '新正文', facts: ['已完成公审'], evidence: ['国策'] };
  const untouched = { key: 'other', facts: ['其他剧情'] };
  const result = rebindSelection([{key:'old', stage:'联合革委会'}, untouched], [draft]);
  assert.notEqual(result[0].key, 'old');
  assert.deepEqual(result[0].facts, draft.facts);
  assert.equal(result[0].stage, '联合革委会');
  assert.equal(result[1], untouched);
  assert.equal(rebindSelection([{key:'old'}, {key:'old'}], [draft]).length, 1);
});

test('model study cannot approve itself or reuse a changed reference corpus', () => {
  const refs = [{ file: '原文.txt', sha256: 'old' }];
  assert.throws(() => assertReferenceStudy(refs, { provenance: refs }), /editor review/);
  const reviewed = { review: { by: '编辑', note: '已对照原文，移除元数据误读' }, provenance: refs };
  assert.doesNotThrow(() => assertReferenceStudy(refs, reviewed));
  assert.throws(() => assertReferenceStudy([{ file: '原文.txt', sha256: 'new' }], reviewed), /changed/);
});
