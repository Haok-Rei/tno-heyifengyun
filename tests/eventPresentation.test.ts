import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FLAVOR_EVENTS } from '../src/data/flavorEvents';
import { STORY_EVENTS } from '../src/data/storyEvents';
import { PUBLIC_NEWS_EVENT_IDS } from '../src/data/eventKinds';
import { getEventPresentation } from '../src/engine/eventPresentation';
import EventPopup from '../src/components/EventPopup';
import type { GameEvent } from '../src/types';

test('public reports are explicitly classified and legacy save copies retain their presentation', () => {
  for (const id of PUBLIC_NEWS_EVENT_IDS) {
    const event = FLAVOR_EVENTS[id];
    assert.ok(event, id);
    assert.equal(getEventPresentation(event), 'news', id);
    assert.equal(getEventPresentation({ ...event, presentation: undefined }), 'news', id+' old save');
  }
  assert.equal(getEventPresentation({id:'school_starts'} as GameEvent), 'news');
});
test('private negotiations, office files and narrative scenes never fall back to news', () => {
  for (const event of Object.values(FLAVOR_EVENTS)) {
    assert.ok(event.presentation, event.id);
    if ((PUBLIC_NEWS_EVENT_IDS as readonly string[]).includes(event.id)) continue;
    assert.equal(getEventPresentation(event), 'story', event.id);
    assert.equal(getEventPresentation({ ...event, presentation: undefined, isStoryEvent: false }), 'story', event.id+' legacy flag');
  }
  for (const event of Object.values(STORY_EVENTS)) assert.equal(getEventPresentation(event), 'story', event.id);
  // Visual migration leaves the historical chronicle switch untouched.
  assert.equal(FLAVOR_EVENTS.negotiate_pan.isStoryEvent, undefined);
  assert.equal(FLAVOR_EVENTS.strike_b3_success.isStoryEvent, undefined);
});
test('new documents default to narrative; genuinely new bulletins can opt into news', () => {
  const event = {id:'new_event',title:'新来件',description:'正文'} as GameEvent;
  assert.equal(getEventPresentation(event), 'story');
  assert.equal(getEventPresentation({...event,isStoryEvent:false}), 'news');
  assert.equal(getEventPresentation({...event,isStoryEvent:false,campusSituation:{channel:'document'}} as GameEvent), 'story');
  assert.equal(getEventPresentation({...event,presentation:'news'}), 'news');
});
test('popup exposes its title, correct document kind and original choice labels without changing content', () => {
  for (const id of ['enter_treeA','negotiate_pan','yang_desk_paper_authorship','strike_b3_success']) {
    const event = FLAVOR_EVENTS[id];
    assert.ok(event, id);
    const html = renderToStaticMarkup(React.createElement(EventPopup,{event,onConfirm:()=>{},date:new Date(2023,8,1)}));
    assert.match(html,/role="dialog"/);
    assert.ok(html.includes(event.title));
    assert.ok(html.includes(`data-presentation="${getEventPresentation(event)}"`));
    for (const choice of event.choices??[]) assert.ok(html.includes(choice.text), choice.text);
    assert.ok(!html.includes('picsum.photos'), id);
  }
  const empty = renderToStaticMarkup(React.createElement(EventPopup,{
    event:{id:'empty_choices',title:'来件',description:'正文',choices:[],buttonText:'已阅'}, onConfirm:()=>{},
  }));
  assert.ok(empty.includes('已阅'));
});
