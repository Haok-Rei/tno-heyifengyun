import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getSuperEventCue, SUPER_EVENT_CUE_BY_ID } from '../src/engine/superEventAudio';

test('each authored super-event has a bundled cue and story beats use varied sounds', () => {
  assert.equal(Object.keys(SUPER_EVENT_CUE_BY_ID).length, 17);
  assert.ok(new Set(Object.values(SUPER_EVENT_CUE_BY_ID)).size >= 7);
  for (const [id, url] of Object.entries(SUPER_EVENT_CUE_BY_ID)) {
    assert.equal(getSuperEventCue(id), url);
    const path = fileURLToPath(url);
    assert.ok(existsSync(path), `missing cue for ${id}`);
    const bytes = readFileSync(path).subarray(0, 4);
    assert.ok(
      bytes.toString('ascii') === 'OggS' || bytes.toString('ascii', 0, 3) === 'ID3' || bytes[0] === 0xff,
      `unsupported audio container for ${id}`,
    );
  }
  assert.ok(getSuperEventCue('unknown_scene'));
});
