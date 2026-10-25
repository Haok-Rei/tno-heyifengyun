import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {join} from 'node:path';

test('PV playlist ships all local fragments, the full four-minute film and bounded deployment files',()=>{
  const root='public/media/pv-v2',playlist=readFileSync(join(root,'index.m3u8'),'utf8');
  assert.match(playlist,/#EXT-X-ENDLIST/);assert.match(playlist,/#EXT-X-PLAYLIST-TYPE:VOD/);
  const init=playlist.match(/#EXT-X-MAP:URI="([^"]+)"/)?.[1];assert.ok(init);
  const fragments=playlist.split(/\r?\n/).filter(line=>line&&!line.startsWith('#'));
  assert.equal(fragments.length,42);
  for(const fragment of [init,...fragments,'poster.webp']){
    assert.ok(!fragment.includes('..')&&!fragment.includes('://'));
    const path=join(root,fragment);assert.ok(existsSync(path),fragment);assert.ok(statSync(path).size<25*1024*1024,fragment);
  }
  const duration=[...playlist.matchAll(/#EXTINF:([\d.]+)/g)].reduce((sum,match)=>sum+Number(match[1]),0);
  assert.ok(Math.abs(duration-251.066667)<.1,String(duration));
  const start=readFileSync('src/components/StartMenu.tsx','utf8');
  assert.match(start,/lazy\(\(\)=>import\('\.\/PromoVideo'\)\)/,'streaming client stays out of initial menu load');
  assert.match(start,/pvOpen&&/,'film is not mounted before a click');
});
