import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { GameState } from '../src/types';
import { getFocusNodes } from '../src/components/FocusTree';
import { getFocusBackdrop, getStrategicArtKind } from '../src/components/StrategicArt';
import routes from '../src/config/focusRoutes.json';
import { FOCUS_BACKGROUNDS } from '../src/config/focusBackgrounds';
import { LAW_ART } from '../src/config/lawArtwork';
import { LAW_CATEGORIES, LAWS } from '../src/data/laws';
import { EXPANDED_ART_URLS } from '../src/config/expandedArtwork';
import { SPIRIT_BACKGROUND_VARIANTS } from '../src/config/hoi4Artwork';
import { CAMPUS_FLAGS, getCampusFlagKey } from '../src/config/campusFlags';
import { deserializeGameState } from '../src/engine/saveSystem';
import { normalizeDisplayNames } from '../src/engine/displayNames';

test('all playable focus trees have local route and subject backdrops', () => {
  for (const tree of ['phase1', 'treeA', 'treeA_pan', 'treeA_pan_despair', 'treeA_true_left', 'treeA_lu_bohan', 'treeA_haobang', 'treeB', 'jidi_tree', 'gouxiong_tree', 'wu_tree', 'wu_tree_p2_feng', 'wu_tree_p2_spring', 'wu_tree_p2_coup']) {
    for (const node of getFocusNodes(tree)) {
      const route = (routes as Record<string, string>)[node.id];
      assert.ok(route, `missing route: ${tree}/${node.id}`);
      const url = FOCUS_BACKGROUNDS[getFocusBackdrop(route, getStrategicArtKind(node.id, node.title))];
      assert.ok(url && existsSync(fileURLToPath(url)), `missing backing: ${node.id}`);
    }
  }
});

test('every law level has a locally bundled image and category background', () => {
  assert.deepEqual(Object.keys(LAW_ART).sort(), Object.keys(LAWS).sort());
  for (const category of LAW_CATEGORIES) {
    const seen = new Set<string>();
    for (const id of category.levels) {
      const art = LAW_ART[id];
      assert.ok(existsSync(fileURLToPath(EXPANDED_ART_URLS[art.piece])), id);
      assert.ok(existsSync(fileURLToPath(SPIRIT_BACKGROUND_VARIANTS[art.background])), id);
      assert.ok(!seen.has(art.piece), `repeated image in category: ${id}`);
      seen.add(art.piece);
    }
  }
});

test('flags track leader changes within a tree and all flag files exist', () => {
  const state = (tree: string, name: string, portrait: string) => ({currentFocusTree: tree, leader: {name, portrait}} as GameState);
  assert.equal(getCampusFlagKey(state('treeA', '王照凯', 'wang_zhaokai')), 'coalition');
  assert.equal(getCampusFlagKey(state('treeA_haobang', '豪邦', 'haobang')), 'red');
  assert.equal(getCampusFlagKey(state('wu_tree_p2_feng', '封安宝', 'feng_anbao')), 'school');
  assert.equal(getCampusFlagKey(state('treeA_pan', '陈栋', 'chen_dong')), 'chendong');
  assert.equal(getCampusFlagKey(state('treeA', '封安祥', 'feng_anxiang')), 'corporate');
  assert.equal(getCampusFlagKey(state('treeA', '狗熊', 'gouxiong')), 'culture');
  for (const flag of Object.values(CAMPUS_FLAGS)) assert.ok(existsSync(fileURLToPath(flag.src)), flag.label);
});

test('historical saves migrate names and event text while preserving game IDs and statistics', () => {
  assert.equal(normalizeDisplayNames('\u5146\u51ef同志与\u5b89\u4fdd的旧官僚、校园安保部门。'), '照凯同志与安宝的旧官僚、校园安保部门。');
  const raw = JSON.stringify({date:'2024-01-01', stats:{pp:150,tpr:80}, flags:{}, nationalSpirits:[], leader:{name:'\u738b\u5146\u51ef',portrait:'wang_zhaokai'}, activeEvent:{id:'historic',title:'\u5c01\u5b89\u4fdd的谈判',description:'\u738b\u5146\u51ef来到办公室。'}, currentFocusTree:'treeA_true_left'});
  const restored = deserializeGameState(raw)!;
  assert.equal(restored.leader.name, '王照凯');
  assert.equal(restored.leader.portrait, 'wang_zhaokai');
  assert.equal(restored.activeEvent?.title, '封安宝的谈判');
  assert.deepEqual(restored.stats, {pp:150,tpr:80});
  assert.equal(restored.currentFocusTree, 'treeA_true_left');
});
