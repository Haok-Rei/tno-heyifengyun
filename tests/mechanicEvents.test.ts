import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import EventPopup from '../src/components/EventPopup';
import {ensureEventIdentity} from '../src/engine/mechanicEvents';
import {deserializeGameState} from '../src/engine/saveSystem';
import type {GameEvent} from '../src/types';
import {YANG_OFFICE_EFFECTS} from '../src/engine/yangOfficeEffects';

test('anonymous office notices render without crashing and preserve prose, choices and effects',()=>{
  const effect=()=>({isPaused:true});
  const choices=[{text:'照办',effect}];
  const draft={title:'加强巡逻',description:'保安队加强了巡逻。',buttonText:'很好',effect,choices};
  const event=ensureEventIdentity(draft,'yang_office');
  assert.match(event.id,/^yang_office_/);assert.equal(event.effect,effect);assert.equal(event.choices,choices);
  assert.equal(event.description,draft.description);assert.ok(!('id' in draft));
  assert.equal(event.id,ensureEventIdentity({...draft},'yang_office').id);
  assert.notEqual(event.id,ensureEventIdentity(draft,'wu_console').id);
  for(const id of [undefined,null,17,'','   ']) {
    const html=renderToStaticMarkup(createElement(EventPopup,{event:{...draft,id} as unknown as GameEvent,onConfirm:()=>{}}));
    assert.ok(html.includes('加强巡逻'));assert.ok(html.includes('照办'));assert.match(html,/data-event-id="legacy_inline_/);
    assert.ok(html.includes('data-presentation="story"'));
  }
});

test('saving before office confirmation restores its effect without charging or applying it early',()=>{
  const state={date:new Date(2023,8,1),stats:{pp:175,radicalAnger:60},flags:{},currentFocusTree:'treeB',nationalSpirits:[],completedFocuses:[],yangYuleState:{dailyDecisionUsed:true},activeEvent:{id:'yang_office_patrol',title:'加强巡逻',description:'原文',effect:YANG_OFFICE_EFFECTS.patrol},activeStoryEvents:[]};
  const restored=deserializeGameState(JSON.stringify(state));assert.ok(restored);
  assert.equal(restored.stats.pp,175);assert.equal(restored.stats.radicalAnger,60);
  assert.equal(restored.activeEvent!.effect,YANG_OFFICE_EFFECTS.patrol);
  const result=restored.activeEvent!.effect!(restored);
  assert.equal(result.stats!.pp,175);assert.equal(result.stats!.radicalAnger,50);assert.equal(restored.yangYuleState!.dailyDecisionUsed,true);
});

test('authored event identities are retained exactly and pending legacy notices survive load',()=>{
  const known={id:'yang_desk_midnight_call',title:'深夜电话',description:'正文'};
  assert.equal(ensureEventIdentity(known),known);
  const state={date:new Date(2023,8,1),stats:{pp:50},flags:{},currentFocusTree:'treeB',nationalSpirits:[],completedFocuses:[],activeEvent:{title:'精力有限',description:'今天已经处理过事务。',buttonText:'好吧'},activeStoryEvents:[{title:'状态不佳',description:'稍作休息。'}]};
  const restored=deserializeGameState(JSON.stringify(state));assert.ok(restored);
  assert.match(restored.activeEvent!.id,/^legacy_inline_/);assert.match(restored.activeStoryEvents[0].id,/^legacy_inline_/);
  assert.equal(restored.activeEvent!.description,state.activeEvent.description);assert.equal(restored.stats.pp,50);
});

test('red phone pending save retains suppression and existing cooldowns without charging twice',()=>{
  const state={date:new Date(2023,8,1),stats:{pp:150,ss:50},flags:{},currentFocusTree:'treeB',nationalSpirits:[],completedFocuses:[],yangYuleState:{health:90,rebelLocations:{b3:40,library:20},rebelCooldowns:{dorm:2}},activeEvent:{id:'yang_office_red_phone',title:'吴福军出动',description:'原文'},activeStoryEvents:[]};
  const restored=deserializeGameState(JSON.stringify(state));assert.ok(restored);
  assert.equal(restored.stats.pp,150);assert.equal(restored.stats.ss,50);
  const result=restored.activeEvent!.effect!(restored);
  assert.equal(result.stats!.pp,150);assert.equal(result.stats!.ss,30);
  assert.deepEqual(result.yangYuleState!.rebelLocations,{});
  assert.deepEqual(result.yangYuleState!.rebelCooldowns,{dorm:2,b3:5,library:5});
  assert.equal(result.yangYuleState!.health,90);
});
