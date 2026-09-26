import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ASSET_URLS, LOADING_ART_URLS, getAdvisorPortraitUrl } from '../src/config/assets';
import { EXPANDED_ART_URLS } from '../src/config/expandedArtwork';
import { SPIRIT_BACKGROUND_VARIANTS } from '../src/config/hoi4Artwork';

const root = process.cwd();
const manifest = JSON.parse(readFileSync(join(root, 'src/config/artAssignments.json'), 'utf8')) as {
  focus: Record<string, string>;
  spirit: Record<string, string>;
};

test('story focus art stays complete and mostly unique', () => {
  const focusSource = readFileSync(join(root, 'src/components/FocusTree.tsx'), 'utf8');
  const ids = [...focusSource.matchAll(/\bid:\s*'([^']+)'\s*,\s*title:\s*'[^']+'/g)].map(match => match[1]);
  for (const id of ids) {
    assert.ok(manifest.focus[id], `missing focus artwork for ${id}`);
  }
  const pieces = Object.values(manifest.focus);
  assert.ok(new Set(pieces).size / pieces.length >= 0.7, 'focus imagery repeats too often');
  for (const piece of [...pieces, ...Object.values(manifest.spirit)]) {
    assert.ok(existsSync(join(root, 'src/assets/hoi4/expanded', `${piece}.png`)), `missing ${piece}.png`);
    assert.ok(EXPANDED_ART_URLS[piece], `unbundled ${piece}.png`);
  }
  assert.equal(Object.keys(SPIRIT_BACKGROUND_VARIANTS).length, 16);
  assert.equal(new Set(Object.values(manifest.spirit)).size, Object.keys(manifest.spirit).length);
});

test('new cabinet portraits and explicitly labelled dossier cards are bundled', () => {
  for (const id of ['zhou_chen', 'you_guanglei', 'jing_zhen', 'zhang_chun', 'feng_anbao_advisor', 'jidi_ceo', 'hitachi_expert', 'data_analyst', 'li_jingkai']) {
    const url = getAdvisorPortraitUrl(undefined, id);
    assert.ok(existsSync(fileURLToPath(url)), `missing advisor portrait: ${id}`);
    assert.notEqual(url, ASSET_URLS.advisor_default, `unmapped advisor portrait: ${id}`);
  }
});

test('all supplied loading art is optimized and every local super-event scene exists', () => {
  const originals = readdirSync(join(root, 'art/载入图')).filter(name => name.endsWith('.png'));
  const optimized = readdirSync(join(root, 'src/assets/loading')).filter(name => name.endsWith('.webp'));
  assert.equal(optimized.length, originals.length);
  assert.equal(LOADING_ART_URLS.length, originals.length);
  for (const url of LOADING_ART_URLS) assert.ok(existsSync(fileURLToPath(url)));
  for (const url of [ASSET_URLS.ui_game_logo, ASSET_URLS.ui_studio_logo]) assert.ok(existsSync(fileURLToPath(url)));
  for (const name of originals) assert.ok(optimized.includes(name.replace(/\.png$/, '.webp')));

  const config = readFileSync(join(root, 'src/config/assets.ts'), 'utf8');
  for (const match of config.matchAll(/superevent_[^:]+:\s*loadingArt\('([^']+)'\)/g)) {
    assert.ok(optimized.includes(`${match[1]}.webp`), `missing super-event scene ${match[1]}`);
  }
});
