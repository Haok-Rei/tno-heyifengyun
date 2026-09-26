export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  effectsVolume: number;
  gameSpeed: number;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterVolume: 100,
  musicVolume: 55,
  effectsVolume: 65,
  gameSpeed: 1,
};

export const AUDIO_SETTINGS_EVENT = 'tno-audio-settings-change';

const clamp = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : fallback;

export function readAudioSettings(): AudioSettings {
  try {
    const saved = JSON.parse(localStorage.getItem('gameSettings') || '{}');
    return {
      masterVolume: clamp(saved.masterVolume, DEFAULT_AUDIO_SETTINGS.masterVolume),
      musicVolume: clamp(saved.musicVolume, DEFAULT_AUDIO_SETTINGS.musicVolume),
      effectsVolume: clamp(saved.effectsVolume, DEFAULT_AUDIO_SETTINGS.effectsVolume),
      gameSpeed: typeof saved.gameSpeed === 'number' ? saved.gameSpeed : DEFAULT_AUDIO_SETTINGS.gameSpeed,
    };
  } catch {
    return { ...DEFAULT_AUDIO_SETTINGS };
  }
}

export function writeAudioSettings(settings: AudioSettings) {
  localStorage.setItem('gameSettings', JSON.stringify(settings));
  window.dispatchEvent(new Event(AUDIO_SETTINGS_EVENT));
}
