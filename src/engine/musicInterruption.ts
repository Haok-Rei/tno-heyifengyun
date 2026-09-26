type MusicElement = Pick<HTMLAudioElement, 'paused' | 'pause' | 'play'>;

/** Temporarily yields the music channel to a super-event cue. */
export function createMusicInterruption(getMusic: () => MusicElement | null, onResumeError: () => void) {
  let active = false;
  let shouldResume = false;

  return {
    get active() { return active; },
    start() {
      if (active) return;
      active = true;
      const music = getMusic();
      shouldResume = !!music && !music.paused;
      music?.pause();
    },
    end() {
      if (!active) return;
      active = false;
      if (!shouldResume) return;
      shouldResume = false;
      void getMusic()?.play().catch(onResumeError);
    },
    cancelResume() { shouldResume = false; },
  };
}
