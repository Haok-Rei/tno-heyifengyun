import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getFocusNodes } from '../src/components/FocusTree';
import { FocusArt, SpiritArt, LawArt } from '../src/components/StrategicArt';
import { ROUTE_FOCUS_ART, ROUTE_LAW_ART, ROUTE_SPIRIT_ART, getRouteSpiritArt } from '../src/config/routeIconArtwork';
import assignments from '../src/config/artAssignments.json';
import { LAWS } from '../src/data/laws';

test('every real playable focus renders the synchronized image, including web-only millennium plan', () => {
  const trees = ['phase1','treeA','treeA_pan','treeA_pan_despair','treeA_true_left','treeA_lu_bohan','treeA_haobang','treeB','jidi_tree','gouxiong_tree','wu_tree','wu_tree_p2_feng','wu_tree_p2_spring','wu_tree_p2_coup'];
  const seen = new Set<string>();
  for (const tree of trees) for (const node of getFocusNodes(tree)) {
    const art = ROUTE_FOCUS_ART[node.id]; assert.ok(art, `${tree}/${node.id}`); seen.add(node.id);
    assert.match(renderToStaticMarkup(createElement(FocusArt, { node })), /data-art-version="2"/);
    const png = readFileSync(fileURLToPath(art.src));
    assert.equal(png.subarray(1,4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), art.width); assert.equal(png.readUInt32BE(20), art.height);
  }
  assert.equal(seen.size, 208); assert.equal(ROUTE_FOCUS_ART.wu_millennium_plan.important, true);
  assert.equal(Object.values(ROUTE_FOCUS_ART).filter(a => a.important).length, 33);
});

test('all law and original spirit identifiers use current images; parliament and politburo stay separate', () => {
  for (const id of Object.keys(LAWS)) {
    assert.ok(ROUTE_LAW_ART[id], id);
    assert.match(renderToStaticMarkup(createElement(LawArt, { id })), /data-art-version="2"/);
    assert.equal(getRouteSpiritArt('law_spirit_'+id), ROUTE_LAW_ART[id]);
  }
  for (const id of Object.keys(assignments.spirit)) {
    assert.ok(getRouteSpiritArt(id), id);
    assert.match(renderToStaticMarkup(createElement(SpiritArt, { spirit: { id, name: id, type: 'neutral' } })), /data-art-version="2"/);
  }
  assert.notEqual(ROUTE_SPIRIT_ART.assembly_dynamics.src, ROUTE_SPIRIT_ART.red_toad_politburo.src);
  assert.equal(getRouteSpiritArt('path_of_democracy', '民主之路（4/5）'), ROUTE_SPIRIT_ART.democracy_4);
});
