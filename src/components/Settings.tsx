import React, { useState, useEffect } from 'react';
import type { SaveMetadata } from '../engine/saveSystem';
import { AUDIO_SETTINGS_EVENT, DEFAULT_AUDIO_SETTINGS, readAudioSettings, writeAudioSettings, type AudioSettings } from '../engine/audioSettings';

interface SaveSlotState {
  slotId: string;
  label: string;
  meta: SaveMetadata | null;
  isEmpty: boolean;
}

interface SettingsProps {
  onBackToMenu: () => void;
  mode?: 'main' | 'ingame';
  onCloseInGameMenu?: () => void;
  onReturnToMainMenu?: () => void;
  onSaveToSlot?: (slotId: 'save_1' | 'save_2' | 'save_3') => void;
  onLoadFromSlot?: (slotId: 'save_1' | 'save_2' | 'save_3' | 'autosave_monthly') => void;
  onDeleteSlot?: (slotId: 'save_1' | 'save_2' | 'save_3') => void;
  getSaveSlotStates?: () => SaveSlotState[];
}

type ConfirmAction = 'reset' | 'clear' | null;

export default function Settings({
  onBackToMenu,
  mode = 'main',
  onCloseInGameMenu,
  onReturnToMainMenu,
  onSaveToSlot,
  onLoadFromSlot,
  onDeleteSlot,
  getSaveSlotStates,
}: SettingsProps) {
  const [settings, setSettings] = useState<AudioSettings>(readAudioSettings);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [statusText, setStatusText] = useState<string>('');
  const [saveSlots, setSaveSlots] = useState<SaveSlotState[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setSettings(readAudioSettings());
    window.addEventListener(AUDIO_SETTINGS_EVENT, update);
    return () => window.removeEventListener(AUDIO_SETTINGS_EVENT, update);
  }, []);

  useEffect(() => {
    if (getSaveSlotStates) setSaveSlots(getSaveSlotStates());
  }, [getSaveSlotStates]);

  const refreshSlots = () => {
    if (getSaveSlotStates) setSaveSlots(getSaveSlotStates());
  };

  const saveSettings = (newSettings: AudioSettings) => {
    setSettings(newSettings);
    writeAudioSettings(newSettings);
  };

  const handleVolumeChange = (key: 'masterVolume' | 'musicVolume' | 'effectsVolume', value: number) => {
    saveSettings({ ...settings, [key]: value });
    setStatusText('音量设置已更新。');
  };

  const handleGameSpeedChange = (value: number) => {
    saveSettings({ ...settings, gameSpeed: value });
    setStatusText('游戏速度设置已更新。');
  };

  const handleResetToDefaults = () => {
    saveSettings(DEFAULT_AUDIO_SETTINGS);
    setConfirmAction(null);
    setStatusText('设置已恢复默认值。');
  };

  const handleResetGameData = () => {
    ['tno_quicksave_data', 'tno_quicksave_meta', 'tno_autosave_data', 'tno_autosave_meta',
     'tno_save_1_data', 'tno_save_1_meta', 'tno_save_2_data', 'tno_save_2_meta',
     'tno_save_3_data', 'tno_save_3_meta', 'gameSettings'].forEach(k => localStorage.removeItem(k));
    window.dispatchEvent(new Event(AUDIO_SETTINGS_EVENT));
    setConfirmAction(null);
    refreshSlots();
    setStatusText('存档与本地设置已清除。');
  };

  useEffect(() => {
    if (!statusText) return;
    const timer = setTimeout(() => setStatusText(''), 2200);
    return () => clearTimeout(timer);
  }, [statusText]);

  const ideologyColor = (name: string): string => {
    const map: Record<string, string> = {
      '封安宝': '#9ca3af', '王照凯': '#ef4444', '潘仁越': '#3B82F6',
      '吕波汉': '#dc2626', '狗熊': '#c084fc', '豪邦': '#38bdf8',
      '封安祥': '#f59e0b', '杨玉乐': '#78716c',
    };
    return map[name] || '#9ca3af';
  };

  const formatTimestamp = (ts: number): string => {
    const d = new Date(ts);
    return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  return (
    <div className="relative h-screen w-screen overflow-auto bg-[#070a12] text-tno-text crt">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(68,167,255,0.22),rgba(8,12,18,0.95)_58%)]" />

      {statusText && (
        <div className="fixed right-4 top-4 z-40 border border-cyan-300/70 bg-black/75 px-4 py-2 text-sm tracking-[0.06em] text-cyan-100">
          {statusText}
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6 border border-cyan-300/45 bg-black/55 p-5 backdrop-blur-sm md:mb-8 md:p-7">
          <p className="mb-2 text-xs uppercase tracking-[0.32em] text-cyan-200/85 md:text-sm">System Control</p>
          <h1 className="text-3xl font-black tracking-[0.1em] text-white md:text-5xl"
            style={{ textShadow: '0 0 18px rgba(82,172,255,0.3), 0 0 30px rgba(255,78,126,0.2)' }}>
            {mode === 'ingame' ? '游戏菜单' : '设置中心'}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/82 md:text-base">
            {mode === 'ingame'
              ? '管理存档槽位、调整系统参数，或返回主界面。'
              : '调整体验参数与存档策略。'}
          </p>
        </div>

        {mode === 'ingame' && (
          <section className="mb-5 border border-cyan-300/45 bg-black/62 p-5 md:p-6">
            <h2 className="mb-4 text-lg font-bold tracking-[0.08em] text-cyan-200 md:text-xl">存档管理</h2>

            {/* 3 Manual Save Slots */}
            <div className="mb-4 grid gap-3 md:grid-cols-3">
              {saveSlots.filter(s => s.slotId.startsWith('save_')).map(slot => (
                <div key={slot.slotId}
                  className={`border p-3 ${slot.isEmpty
                    ? 'border-zinc-600 bg-zinc-800/30'
                    : 'border-cyan-300/50 bg-cyan-500/5'}`}>
                  <div className="mb-2 text-xs font-bold tracking-[0.1em] text-cyan-300/80">{slot.label}</div>
                  {slot.isEmpty ? (
                    <div className="mb-2 text-xs text-zinc-500">（空）</div>
                  ) : (
                    <div className="mb-2 space-y-0.5 text-[11px] leading-tight text-white/80">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">日期</span>
                        <span>{slot.meta?.dateDisplay}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">领袖</span>
                        <span style={{ color: ideologyColor(slot.meta?.leaderName || '') }}>{slot.meta?.leaderName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">PP/稳/TPR</span>
                        <span>{slot.meta?.pp}/{slot.meta?.stab}/{slot.meta?.tpr}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">国策树</span>
                        <span className="text-[10px]">{slot.meta?.focusTree}</span>
                      </div>
                      {slot.meta?.gameEnding && (
                        <div className="text-tno-red text-[10px]">[结局中]</div>
                      )}
                      <div className="text-[9px] text-zinc-500 text-right">{formatTimestamp(slot.meta?.savedAt || 0)}</div>
                    </div>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => { onSaveToSlot?.(slot.slotId as 'save_1' | 'save_2' | 'save_3'); refreshSlots(); setStatusText(`已保存至 ${slot.label}`); }}
                      className="flex-1 border border-cyan-400/60 bg-cyan-500/10 py-1 text-[11px] font-bold text-cyan-200 hover:bg-cyan-500/25 transition-all">
                      保存
                    </button>
                    <button
                      onClick={() => { onLoadFromSlot?.(slot.slotId as 'save_1' | 'save_2' | 'save_3'); }}
                      disabled={slot.isEmpty}
                      className={`flex-1 py-1 text-[11px] font-bold transition-all ${slot.isEmpty
                        ? 'cursor-not-allowed border border-zinc-600 bg-zinc-700/20 text-zinc-500'
                        : 'border border-violet-400/60 bg-violet-500/10 text-violet-200 hover:bg-violet-500/25'}`}>
                      读取
                    </button>
                    {!slot.isEmpty && (
                      <button
                        onClick={() => setConfirmDelete(slot.slotId)}
                        className="border border-red-400/50 bg-red-500/10 px-1.5 py-1 text-[9px] text-red-300 hover:bg-red-500/25 transition-all">
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Autosave & Quicksave row */}
            <div className="grid gap-3 md:grid-cols-2">
              {saveSlots.filter(s => s.slotId === 'autosave_monthly' || s.slotId === 'quicksave').map(slot => (
                <div key={slot.slotId}
                  className={`border p-3 ${slot.isEmpty
                    ? 'border-zinc-600 bg-zinc-800/20'
                    : 'border-emerald-300/40 bg-emerald-500/5'}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold tracking-[0.08em] text-emerald-300/80">{slot.label}</span>
                    {!slot.isEmpty && (
                      <span className="text-[9px] text-zinc-500">{formatTimestamp(slot.meta?.savedAt || 0)}</span>
                    )}
                  </div>
                  {slot.isEmpty ? (
                    <div className="text-xs text-zinc-500">（空）</div>
                  ) : (
                    <div className="mb-2 text-[11px] text-white/70">
                      {slot.meta?.dateDisplay} · {slot.meta?.leaderName} · PP:{slot.meta?.pp}
                    </div>
                  )}
                  <button
                    onClick={() => { onLoadFromSlot?.(slot.slotId as 'autosave_monthly'); }}
                    disabled={slot.isEmpty}
                    className={`w-full py-1.5 text-[12px] font-bold transition-all ${slot.isEmpty
                      ? 'cursor-not-allowed border border-zinc-600 bg-zinc-700/20 text-zinc-500'
                      : 'border border-emerald-400/60 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/25'}`}>
                    读取
                  </button>
                </div>
              ))}
            </div>

            <p className="mt-3 text-xs text-white/60">
              快捷键：F5 快速存档 · F9 快速读档 · 每月1日自动存档
            </p>
          </section>
        )}

        <div className="space-y-5">
          <section className="border border-cyan-300/45 bg-black/62 p-5 md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-[0.08em] text-cyan-200 md:text-xl">主音量</h2>
              <span className="text-base font-semibold text-white md:text-lg">{settings.masterVolume}%</span>
            </div>
            <input type="range" min="0" max="100" value={settings.masterVolume}
              onChange={(e) => handleVolumeChange('masterVolume', Number(e.target.value))}
              className="w-full" style={{ accentColor: '#58d9ff' }} />
          </section>

          <section className="grid gap-4 border border-cyan-300/45 bg-black/62 p-5 md:grid-cols-2 md:p-6">
            {([['musicVolume', '音乐音量'], ['effectsVolume', '交互音效']] as const).map(([key, label]) => <div key={key}>
              <label htmlFor={key} className="mb-3 flex justify-between text-sm font-bold tracking-[0.08em] text-cyan-200"><span>{label}</span><span className="text-white">{settings[key]}%</span></label>
              <input id={key} aria-label={label} type="range" min="0" max="100" value={settings[key]}
                onChange={(e) => handleVolumeChange(key, Number(e.target.value))}
                className="w-full" style={{ accentColor: '#cba66a' }} />
            </div>)}
            <p className="text-xs text-white/55 md:col-span-2">实际音量由主音量与对应分类音量共同决定。</p>
          </section>

          <section className="border border-cyan-300/45 bg-black/62 p-5 md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-[0.08em] text-cyan-200 md:text-xl">游戏速度</h2>
              <select value={settings.gameSpeed}
                onChange={(e) => handleGameSpeedChange(Number(e.target.value))}
                className="border border-cyan-200 bg-black/80 px-3 py-2 text-sm text-cyan-100 outline-none md:text-base">
                <option value={0.5}>0.5x | 慢速</option>
                <option value={1}>1.0x | 标准</option>
                <option value={1.5}>1.5x | 快速</option>
                <option value={2}>2.0x | 极速</option>
              </select>
            </div>
          </section>

          <section className="border border-pink-300/45 bg-black/62 p-5 md:p-6">
            <h2 className="mb-3 text-lg font-bold tracking-[0.08em] text-pink-200 md:text-xl">数据管理</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <button onClick={() => setConfirmAction('reset')}
                className="border border-pink-300/60 bg-pink-500/10 px-4 py-3 text-sm font-bold tracking-[0.08em] text-pink-100 transition-all duration-300 hover:bg-pink-500/22">
                重置设置为默认
              </button>
              <button onClick={() => setConfirmAction('clear')}
                className="border border-red-300/65 bg-red-500/10 px-4 py-3 text-sm font-bold tracking-[0.08em] text-red-100 transition-all duration-300 hover:bg-red-500/22">
                清除全部存档
              </button>
            </div>
          </section>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 md:mt-8">
          {mode === 'ingame' && (
            <button onClick={onCloseInGameMenu}
              className="border border-cyan-200 bg-black/75 px-8 py-3 text-sm font-bold uppercase tracking-[0.22em] text-cyan-100 transition-all duration-300 hover:border-cyan-300 hover:bg-cyan-500/15 hover:text-white md:text-base">
              返回游戏
            </button>
          )}
          {mode === 'ingame' ? (
            <button onClick={onReturnToMainMenu}
              className="border border-pink-300 bg-black/75 px-8 py-3 text-sm font-bold uppercase tracking-[0.22em] text-pink-100 transition-all duration-300 hover:border-pink-300 hover:bg-pink-500/20 hover:text-white md:text-base">
              返回主界面
            </button>
          ) : (
            <button onClick={onBackToMenu}
              className="border border-cyan-200 bg-black/75 px-8 py-3 text-sm font-bold uppercase tracking-[0.22em] text-cyan-100 transition-all duration-300 hover:border-pink-300 hover:bg-pink-500/20 hover:text-white md:text-base">
              返回主菜单
            </button>
          )}
        </div>
      </div>

      {/* Confirm dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-md border border-pink-300/65 bg-[#090d16] p-5 md:p-6">
            <h3 className="mb-3 text-xl font-bold tracking-[0.08em] text-pink-200 md:text-2xl">执行确认</h3>
            <p className="mb-6 text-sm leading-relaxed text-white/82 md:text-base">
              {confirmAction === 'reset' ? '将把所有设置恢复为默认值。' : '将清除本地全部存档与设置，且无法恢复。'}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmAction(null)}
                className="border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/15 transition-all">取消</button>
              <button onClick={confirmAction === 'reset' ? handleResetToDefaults : handleResetGameData}
                className="border border-pink-300 bg-pink-500/20 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-500/35 transition-all">确认执行</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete slot confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-sm border border-red-400/60 bg-[#090d16] p-5">
            <h3 className="mb-3 text-lg font-bold text-red-300">删除存档</h3>
            <p className="mb-4 text-sm text-white/75">确认删除该存档槽？此操作不可恢复。</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="border border-cyan-200 px-3 py-1.5 text-sm text-cyan-100 hover:bg-cyan-500/15 transition-all">取消</button>
              <button onClick={() => {
                onDeleteSlot?.(confirmDelete as 'save_1' | 'save_2' | 'save_3');
                setConfirmDelete(null);
                refreshSlots();
                setStatusText('存档已删除。');
              }}
                className="border border-red-400 bg-red-500/20 px-3 py-1.5 text-sm text-white hover:bg-red-500/35 transition-all">删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
