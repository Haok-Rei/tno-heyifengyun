import test from 'node:test';
import assert from 'node:assert/strict';
import { FLAVOR_EVENTS } from '../src/data/flavorEvents';
import { STORY_EVENTS } from '../src/data/storyEvents';
import { CAMPUS_SITUATIONS } from '../src/engine/campusEvents';
import { EVENT_ART_BINDINGS, getEventArtwork } from '../src/config/eventArtwork';
import { LOCAL_PORTRAIT_URLS } from '../src/config/localPortraits';
import { LOADING_ART } from '../src/config/loadingArtwork';

test('all authored events and ambient families have valid local, content-specific artwork',()=>{
  const events=Object.values({...STORY_EVENTS,...FLAVOR_EVENTS});
  const signatures=new Set<string>();
  for(const event of events){
    const art=getEventArtwork(event);assert.ok(art,event.id);
    assert.equal(art.kind,'scene'); assert.ok(!art.src.startsWith('http')); signatures.add(art.src);
  }
  assert.ok(signatures.size/events.length>.9,'over 90% distinct visual subjects across authored events');
  for(const situation of CAMPUS_SITUATIONS)assert.ok(getEventArtwork({id:'campus_dynamic_save',title:situation.title,description:situation.body,campusSituation:{family:situation.id} as any}),situation.id);
});
test('portraits match named speakers, and important CGs keep exact scene bindings',()=>{
  for(const [id,name] of [['negotiate_pan','leader_pan_renyue'],['negotiate_orthodox','leader_wang_zhaokai'],['wu_zhouchen_suspension_event','advisor_zhou_chen']]){
    const art=getEventArtwork({id,title:'',description:''});assert.ok(art?.src.endsWith('/'+id+'.webp'));
  }
  for(const [id,name] of [['phase1_returned_petition','退回的联名信'],['secret_compromise','灯下的协议'],['yang_yule_success_event','特级'],['yang_yule_fail_event','特级0']]){
    const art=getEventArtwork({id,title:'',description:''});assert.ok(art&&art.kind==='scene');assert.equal(art.src,LOADING_ART[name]);
  }
  assert.ok(EVENT_ART_BINDINGS.phase1_dorm_talks.generated);
  assert.ok(EVENT_ART_BINDINGS.gx_redeem_ending_event.generated);
  assert.equal(getEventArtwork({id:'unknown_event_from_legacy_save',title:'',description:''}),undefined,'unknown saves use existing safe fallback');
});
