type MusicElement = Pick<HTMLAudioElement, 'paused' | 'pause' | 'play'>;

/** Temporarily yields the music channel to a super-event cue. */
export function createMusicInterruption(getMusic: () => MusicElement | null, onResumeError: () => void) {
  const owners=new Set<string>();
  let shouldResume = false;

  return {
    get active() { return owners.size>0; },
    start(owner='super-event') {
      if(owners.has(owner))return;
      owners.add(owner);
      if(owners.size>1)return;
      const music = getMusic();
      shouldResume = !!music && !music.paused;
      music?.pause();
    },
    end(owner='super-event') {
      if(!owners.delete(owner)||owners.size)return;
      if (!shouldResume) return;
      shouldResume = false;
      void getMusic()?.play().catch(onResumeError);
    },
    cancelResume() { shouldResume = false; },
  };
}
