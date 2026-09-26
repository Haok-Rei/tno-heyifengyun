import test from 'node:test';
import assert from 'node:assert/strict';
import { createMusicInterruption } from '../src/engine/musicInterruption';

function music(initiallyPaused: boolean) {
  let pauses = 0;
  let plays = 0;
  const element = {
    paused: initiallyPaused,
    pause() { pauses++; this.paused = true; },
    async play() { plays++; this.paused = false; },
  };
  return { element, counts: () => ({ pauses, plays }) };
}

test('super-event cue resumes only music that was playing before it started', async () => {
  const playing = music(false);
  const interruption = createMusicInterruption(() => playing.element, () => assert.fail('resume failed'));
  interruption.start();
  interruption.start();
  assert.equal(playing.element.paused, true);
  interruption.end();
  interruption.end();
  assert.deepEqual(playing.counts(), { pauses: 1, plays: 1 });

  const paused = music(true);
  const second = createMusicInterruption(() => paused.element, () => assert.fail('resume failed'));
  second.start();
  second.end();
  assert.equal(paused.counts().plays, 0);
});

test('manual pause during a cue cancels automatic resume', () => {
  const current = music(false);
  const interruption = createMusicInterruption(() => current.element, () => assert.fail('resume failed'));
  interruption.start();
  interruption.cancelResume();
  interruption.end();
  assert.equal(current.counts().plays, 0);
});
