import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, ListMusic, Pause, Play, SkipBack, SkipForward, Volume2, X } from 'lucide-react';
import { AUDIO_SETTINGS_EVENT, readAudioSettings, writeAudioSettings } from '../engine/audioSettings';
import { installUiSoundListener } from '../engine/uiSounds';
import { SUPER_EVENT_AUDIO_END, SUPER_EVENT_AUDIO_START } from '../engine/superEventAudio';
import { createMusicInterruption } from '../engine/musicInterruption';
import './audioDock.css';

const files = import.meta.glob('../../music/*.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const TRACKS = Object.entries(files).map(([path, url]) => ({ id: path.split('/').pop()!, title: path.split('/').pop()!.replace(/\.mp3$/i, ''), url }));
type PlayMode = 'ordered' | 'repeat' | 'shuffle';

interface PlaylistState { order: string[]; enabled: string[]; mode: PlayMode; trackId: string }
const PLAYLIST_KEY = 'tno_music_playlist';

function loadPlaylist(): PlaylistState {
  let saved: Partial<PlaylistState> = {};
  try { saved = JSON.parse(localStorage.getItem(PLAYLIST_KEY) || '{}'); } catch { /* use defaults */ }
  const ids = TRACKS.map(track => track.id);
  const known = (saved.order || []).filter(id => ids.includes(id));
  const order = [...known, ...ids.filter(id => !known.includes(id))];
  const enabled = Array.isArray(saved.enabled) ? saved.enabled.filter(id => ids.includes(id)) : ids;
  return {
    order,
    enabled: enabled.length ? enabled : ids,
    mode: saved.mode === 'repeat' || saved.mode === 'shuffle' ? saved.mode : 'ordered',
    trackId: ids.includes(saved.trackId || '') ? saved.trackId! : ids[0] || '',
  };
}

export default function AudioDock() {
  const [open, setOpen] = useState(false);
  const [playlist, setPlaylist] = useState<PlaylistState>(loadPlaylist);
  const [settings, setSettings] = useState(readAudioSettings);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [message, setMessage] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const interruptionRef = useRef<ReturnType<typeof createMusicInterruption> | null>(null);
  const current = TRACKS.find(track => track.id === playlist.trackId);
  const orderedTracks = useMemo(() => playlist.order.map(id => TRACKS.find(track => track.id === id)).filter((track): track is typeof TRACKS[number] => !!track), [playlist.order]);

  useEffect(() => installUiSoundListener(), []);
  useEffect(() => { localStorage.setItem(PLAYLIST_KEY, JSON.stringify(playlist)); }, [playlist]);
  useEffect(() => {
    const update = () => setSettings(readAudioSettings());
    window.addEventListener(AUDIO_SETTINGS_EVENT, update);
    window.addEventListener('storage', update);
    return () => { window.removeEventListener(AUDIO_SETTINGS_EVENT, update); window.removeEventListener('storage', update); };
  }, []);
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = settings.masterVolume * settings.musicVolume / 10000;
  }, [settings]);
  useEffect(() => {
    const interruption = createMusicInterruption(() => audioRef.current, () => setPlaying(false));
    interruptionRef.current = interruption;
    const startCue = () => interruption.start();
    const endCue = () => interruption.end();
    window.addEventListener(SUPER_EVENT_AUDIO_START, startCue);
    window.addEventListener(SUPER_EVENT_AUDIO_END, endCue);
    return () => {
      window.removeEventListener(SUPER_EVENT_AUDIO_START, startCue);
      window.removeEventListener(SUPER_EVENT_AUDIO_END, endCue);
      interruptionRef.current = null;
    };
  }, []);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playing || interruptionRef.current?.active) return;
    void audio.play().catch(() => { setPlaying(false); setMessage('点击播放以启用音乐'); });
  }, [playlist.trackId, playing]);

  const move = (direction: 1 | -1, ended = false) => {
    const available = playlist.order.filter(id => playlist.enabled.includes(id));
    if (!available.length) return;
    if (ended && playlist.mode === 'repeat') { if (audioRef.current) { audioRef.current.currentTime = 0; void audioRef.current.play(); } return; }
    const index = available.indexOf(playlist.trackId);
    let next: string;
    if (playlist.mode === 'shuffle' && available.length > 1) {
      const alternatives = available.filter(id => id !== playlist.trackId);
      next = alternatives[Math.floor(Math.random() * alternatives.length)];
    } else {
      next = available[(index + direction + available.length) % available.length];
    }
    setPlaylist(prev => ({ ...prev, trackId: next }));
    setCurrentTime(0);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (interruptionRef.current?.active) {
      interruptionRef.current.cancelResume();
      audio.pause();
      setPlaying(false);
      return;
    }
    if (playing) { audio.pause(); setPlaying(false); return; }
    setMessage('');
    void audio.play().then(() => setPlaying(true)).catch(() => setMessage('浏览器无法播放此曲目'));
  };

  const selectTrack = (id: string) => {
    setPlaylist(prev => ({ ...prev, trackId: id, enabled: prev.enabled.includes(id) ? prev.enabled : [...prev.enabled, id] }));
    setCurrentTime(0);
  };

  const shiftTrack = (id: string, offset: number) => {
    setPlaylist(prev => {
      const order = [...prev.order];
      const from = order.indexOf(id);
      const to = from + offset;
      if (to < 0 || to >= order.length) return prev;
      [order[from], order[to]] = [order[to], order[from]];
      return { ...prev, order };
    });
  };

  const toggleTrack = (id: string) => {
    setPlaylist(prev => {
      if (prev.enabled.includes(id) && prev.enabled.length === 1) return prev;
      const enabled = prev.enabled.includes(id) ? prev.enabled.filter(item => item !== id) : [...prev.enabled, id];
      const trackId = enabled.includes(prev.trackId) ? prev.trackId : prev.order.find(item => enabled.includes(item)) || prev.trackId;
      return { ...prev, enabled, trackId };
    });
  };

  const formatTime = (seconds: number) => Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}` : '0:00';

  return <div className="audio-dock">
    <audio ref={audioRef} src={current?.url} preload="metadata" onLoadedMetadata={event => setDuration(event.currentTarget.duration)} onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)} onEnded={() => move(1, true)} onError={() => { setPlaying(false); setMessage('曲目加载失败'); }} />
    <button className={`audio-dock-trigger ${open ? 'is-open' : ''}`} onClick={() => setOpen(value => !value)} aria-label="打开音乐播放器" aria-expanded={open} title="音乐播放器"><ListMusic size={17} /><span>音乐</span></button>
    {open && <section className="audio-dock-panel" aria-label="音乐播放器">
      <header><div><small>HEFEI ORDER / RADIO</small><strong>校园电台</strong></div><button onClick={() => setOpen(false)} aria-label="关闭音乐播放器"><X size={16} /></button></header>
      <div className="audio-now-playing"><span>正在播放</span><strong title={current?.title}>{current?.title || '暂无曲目'}</strong></div>
      <div className="audio-transport">
        <button onClick={() => move(-1)} aria-label="上一首" disabled={!current}><SkipBack size={18} /></button>
        <button className="audio-play" onClick={togglePlay} aria-label={playing ? '暂停音乐' : '播放音乐'} disabled={!current}>{playing ? <Pause size={18} /> : <Play size={18} />}</button>
        <button onClick={() => move(1)} aria-label="下一首" disabled={!current}><SkipForward size={18} /></button>
      </div>
      <div className="audio-seek"><input aria-label="播放进度" type="range" min="0" max={Math.max(duration || 0, 1)} value={Math.min(currentTime, duration || 0)} onChange={event => { if (audioRef.current) audioRef.current.currentTime = Number(event.target.value); setCurrentTime(Number(event.target.value)); }} /><span>{formatTime(currentTime)} / {formatTime(duration)}</span></div>
      <div className="audio-mode"><span>播放顺序</span><select aria-label="播放顺序" value={playlist.mode} onChange={event => setPlaylist(prev => ({ ...prev, mode: event.target.value as PlayMode }))}><option value="ordered">顺序循环</option><option value="repeat">单曲循环</option><option value="shuffle">随机播放</option></select></div>
      <label className="audio-volume"><Volume2 size={15} /><span>音乐</span><input aria-label="音乐音量" type="range" min="0" max="100" value={settings.musicVolume} onChange={event => writeAudioSettings({ ...settings, musicVolume: Number(event.target.value) })} /><span>{settings.musicVolume}%</span></label>
      <div className="audio-list-heading"><span>歌单 · {playlist.enabled.length}/{TRACKS.length}</span><small>勾选启用 · 箭头排序</small></div>
      <div className="audio-track-list">{orderedTracks.map((track, index) => <div key={track.id} className={`audio-track ${track.id === playlist.trackId ? 'active' : ''}`}>
        <input type="checkbox" checked={playlist.enabled.includes(track.id)} onChange={() => toggleTrack(track.id)} aria-label={`启用 ${track.title}`} />
        <button className="audio-track-name" onClick={() => selectTrack(track.id)} title={track.title}><span>{String(index + 1).padStart(2, '0')}</span>{track.title}</button>
        <button onClick={() => shiftTrack(track.id, -1)} aria-label={`上移 ${track.title}`} disabled={index === 0}><ChevronUp size={13} /></button>
        <button onClick={() => shiftTrack(track.id, 1)} aria-label={`下移 ${track.title}`} disabled={index === orderedTracks.length - 1}><ChevronDown size={13} /></button>
      </div>)}</div>
      {message && <p className="audio-message" role="status">{message}</p>}
    </section>}
  </div>;
}
