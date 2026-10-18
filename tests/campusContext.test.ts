import test from 'node:test';
import assert from 'node:assert/strict';
import {campusMessages} from '../scripts/art/campus-context.mjs';

test('different art tasks keep images, source and reviewed design in a byte-identical prefix',()=>{
 const shared=[{role:'system',content:'TNO line art rules'},{role:'user',content:[{type:'image_url',image_url:{url:'data:image/png;base64,REFERENCE'}},{type:'text',text:'fixed source and geometry'}]}];
 const original=structuredClone(shared),study={errors:['no window icons'],design:'architecture changes'};
 const a=campusMessages(shared,'draw democracy',study),b=campusMessages(shared,'draw factory',study);
 assert.deepEqual(shared,original);assert.equal(JSON.stringify(a.slice(0,-1)),JSON.stringify(b.slice(0,-1)));
 assert.equal(a.at(-1).content,'draw democracy');assert.notEqual(a.at(-1).content,b.at(-1).content);
});
