import ui from '../assets/sfx/ui.ogg';
import focus from '../assets/sfx/focus.ogg';
import decision from '../assets/sfx/decision.ogg';
import event from '../assets/sfx/event.ogg';
import error from '../assets/sfx/error.ogg';
import { readAudioSettings } from './audioSettings';

export type UiSound = 'ui' | 'focus' | 'decision' | 'event' | 'error';

const sounds: Record<UiSound, string> = { ui, focus, decision, event, error };
const baseGain: Record<UiSound, number> = { ui: 0.55, focus: 0.75, decision: 0.7, event: 0.75, error: 0.6 };

export function playUiSound(kind: UiSound) {
  const { masterVolume, effectsVolume } = readAudioSettings();
  const volume = (masterVolume / 100) * (effectsVolume / 100) * baseGain[kind];
  if (volume <= 0) return;
  const audio = new Audio(sounds[kind]);
  audio.volume = volume;
  void audio.play().catch(() => { /* Audio may be locked until a user gesture. */ });
}

export function installUiSoundListener() {
  const handler = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const marked = target.closest<HTMLElement>('[data-sound]');
    if (marked?.dataset.sound === 'none') return;
    if (!marked && !target.closest('button, [role="button"]')) return;
    const kind = marked?.dataset.sound;
    const button = target.closest<HTMLButtonElement>('button');
    if (button?.disabled) return;
    playUiSound(kind === 'focus' || kind === 'decision' || kind === 'event' || kind === 'error' ? kind : 'ui');
  };
  document.addEventListener('click', handler, true);
  return () => document.removeEventListener('click', handler, true);
}
