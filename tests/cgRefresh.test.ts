import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ARTWORKS } from '../src/data/artGallery';
import { getEarnedArtwork } from '../src/engine/artGallery';
import { ASSET_URLS } from '../src/config/assets';
import { LOADING_ART } from '../src/config/loadingArtwork';
const progress = {currentFocusTree:'phase1',completedFocuses:[],activeEvent:null,activeSuperEvent:null,chronicle:[]};
test('new event CGs require their actual scene; scenery remains initially open',()=>{
  const earned = new Set(getEarnedArtwork(progress).map(work=>work.name));
  for(const name of ['廊桥课间','教室晨光','食堂晚灯','秋雨连廊']) assert.ok(earned.has(name));
  for(const [name,id] of [['退回的联名信','phase1_returned_petition'],['课间的争执','phase1_recess_dispute'],['雪中的来函','yang_desk_snow_day'],['灯下的协议','secret_compromise']]) {
    assert.ok(!earned.has(name));
    assert.ok(getEarnedArtwork({...progress,activeEvent:{id,title:'场景',description:'正文'}}).some(work=>work.name===name));
    assert.ok(getEarnedArtwork({...progress,flags:{[`event_seen_${id}`]:true}}).some(work=>work.name===name));
    assert.ok(!getEarnedArtwork({...progress,flags:{[`event_seen_${id}`]:false}}).some(work=>work.name===name));
    assert.equal(ASSET_URLS[`storyevent_${id}`],LOADING_ART[name]);
  }
  assert.ok(!getEarnedArtwork({...progress,currentFocusTree:'treeB'}).some(work=>work.name==='雪中的来函'));
});
test('dedicated super-event CGs remain distinct and bind to the correct plot',()=>{
  for(const [id,name] of [['first_democratic_election_super','六十日之约'],['haobang_rise_super','春回滨湖'],['jidi_riot_super','价格牌下的风暴'],['wu_crackdown','总攻前夜']]) {
    assert.equal(ASSET_URLS[`superevent_${id}`],LOADING_ART[name]);
    assert.ok(getEarnedArtwork({...progress,activeSuperEvent:{id,title:'超事件',quote:'',author:''}}).some(work=>work.name===name));
    assert.ok(!getEarnedArtwork(progress).some(work=>work.name===name));
  }
  assert.equal(new Set(ARTWORKS.map(work=>work.name)).size, ARTWORKS.length);
});
