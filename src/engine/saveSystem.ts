import { normalizeDisplayNames } from './displayNames';
/**
 * engine/saveSystem.ts - 多槽位存档系统
 *
 * 存档槽位:
 * - quicksave: F5 即时存档 / F9 即时读档
 * - autosave_monthly: 每月自动存档
 * - save_slot_1, save_slot_2, save_slot_3: 手动存档槽
 */

import { GameState } from '../types';
import { restoreCampusEvent } from './campusEvents';
import { FLAVOR_EVENTS } from '../data/flavorEvents';

// ---- 类型定义 ----

export interface SaveMetadata {
  date: string;
  dateDisplay: string;
  leaderName: string;
  leaderTitle: string;
  focusTree: string;
  pp: number;
  stab: number;
  tpr: number;
  ss: number;
  completedFocuses: number;
  gameEnding?: string;
  savedAt: number; // timestamp
}

export type SaveSlotId = 'quicksave' | 'autosave_monthly' | 'save_1' | 'save_2' | 'save_3';

const SLOT_KEYS: Record<SaveSlotId, { data: string; meta: string }> = {
  quicksave: { data: 'tno_quicksave_data', meta: 'tno_quicksave_meta' },
  autosave_monthly: { data: 'tno_autosave_data', meta: 'tno_autosave_meta' },
  save_1: { data: 'tno_save_1_data', meta: 'tno_save_1_meta' },
  save_2: { data: 'tno_save_2_data', meta: 'tno_save_2_meta' },
  save_3: { data: 'tno_save_3_data', meta: 'tno_save_3_meta' },
};

const SLOT_LABELS: Record<SaveSlotId, string> = {
  quicksave: '快速存档 (F5/F9)',
  autosave_monthly: '每月自动存档',
  save_1: '存档槽 ①',
  save_2: '存档槽 ②',
  save_3: '存档槽 ③',
};

// ---- 序列化 ----

export function serializeGameState(state: GameState): string {
  return JSON.stringify({
    ...state,
    date: state.date.toISOString(),
  });
}

export function deserializeGameState(raw: string): GameState | null {
  try {
    const parsed = JSON.parse(normalizeDisplayNames(raw));
    if (!parsed || !parsed.stats || !parsed.flags || !Array.isArray(parsed.nationalSpirits)) return null;
    const date = new Date(parsed.date);
    if (!Number.isFinite(date.getTime())) return null;
    const discardedOrders = parsed.command?.version === 1 ? (parsed.command.teams || []).filter((team: { order?: { costPP?: number } }) => team.order).map((team: { order: { costPP?: number } }) => team.order) : [];
    const refundedPP = discardedOrders.reduce((total: number, order: { costPP?: number }) => total + (Number(order.costPP) || 0), 0);
    const state = {
      ...parsed,
      date,
      stats: { ...parsed.stats, pp: parsed.stats.pp + refundedPP },
      command: parsed.command?.version === 1 ? undefined : parsed.command,
      // 撤回试验性的校史档案加成，避免旧测试档继续携带已经移除的玩法。
      flags: Object.fromEntries(Object.entries(parsed.flags).filter(([key]) => !key.startsWith('archive_found_') && key !== 'archive_conclusion')),
      nationalSpirits: parsed.nationalSpirits.filter((spirit: { id: string }) => !['archive_truth', 'archive_silence', 'archive_council'].includes(spirit.id)),
      // v8.0 编年史：旧存档无此字段，兜底为空数组
      chronicle: parsed.chronicle ?? [],
    } as GameState;
    const restore = (event: NonNullable<GameState['activeEvent']>) => event.campusSituation
      ? restoreCampusEvent(state, event)
      : FLAVOR_EVENTS[event.id] ? { ...FLAVOR_EVENTS[event.id], ...event, effect: FLAVOR_EVENTS[event.id].effect, choices: FLAVOR_EVENTS[event.id].choices } : event;
    state.activeEvent = state.activeEvent ? restore(state.activeEvent) : null;
    state.activeStoryEvents = (state.activeStoryEvents ?? []).map(restore);
    return state;
  } catch {
    return null;
  }
}

// ---- 元数据 ----

export function extractMetadata(state: GameState): SaveMetadata {
  const d = state.date;
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: d.toISOString(),
    dateDisplay: `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`,
    leaderName: state.leader.name,
    leaderTitle: state.leader.title,
    focusTree: state.currentFocusTree,
    pp: Math.round(state.stats.pp),
    stab: Math.round(state.stats.stab),
    tpr: Math.round(state.stats.tpr),
    ss: Math.round(state.stats.ss),
    completedFocuses: state.completedFocuses.length,
    gameEnding: state.gameEnding,
    savedAt: Date.now(),
  };
}

// ---- 存取操作 ----

export function saveToSlot(state: GameState, slotId: SaveSlotId): SaveMetadata {
  const keys = SLOT_KEYS[slotId];
  const meta = extractMetadata(state);
  localStorage.setItem(keys.data, serializeGameState(state));
  localStorage.setItem(keys.meta, JSON.stringify(meta));
  return meta;
}

export function loadFromSlot(slotId: SaveSlotId): GameState | null {
  const keys = SLOT_KEYS[slotId];
  const raw = localStorage.getItem(keys.data);
  if (!raw) return null;
  return deserializeGameState(raw);
}

export function getSlotMetadata(slotId: SaveSlotId): SaveMetadata | null {
  const keys = SLOT_KEYS[slotId];
  const raw = localStorage.getItem(keys.meta);
  if (!raw) return null;
  try {
    return JSON.parse(normalizeDisplayNames(raw)) as SaveMetadata;
  } catch {
    return null;
  }
}

export function deleteSlot(slotId: SaveSlotId): void {
  const keys = SLOT_KEYS[slotId];
  localStorage.removeItem(keys.data);
  localStorage.removeItem(keys.meta);
}

export function hasSlot(slotId: SaveSlotId): boolean {
  return getSlotMetadata(slotId) !== null;
}

export function getSlotLabel(slotId: SaveSlotId): string {
  return SLOT_LABELS[slotId];
}

export function getAllManualSlots(): SaveSlotId[] {
  return ['save_1', 'save_2', 'save_3'];
}

/**
 * 获取所有槽位状态（用于 UI 渲染）
 */
export function getSaveSlotStates(): Array<{
  slotId: SaveSlotId;
  label: string;
  meta: SaveMetadata | null;
  isEmpty: boolean;
}> {
  const allSlots: SaveSlotId[] = ['save_1', 'save_2', 'save_3', 'quicksave', 'autosave_monthly'];
  return allSlots.map(slotId => {
    const meta = getSlotMetadata(slotId);
    return {
      slotId,
      label: SLOT_LABELS[slotId],
      meta,
      isEmpty: meta === null,
    };
  });
}

/**
 * 兼容旧版存档迁移
 */
export function migrateLegacySaves(): void {
  // 迁移旧 quicksave
  const oldQuick = localStorage.getItem('quickSave');
  if (oldQuick && !hasSlot('quicksave')) {
    try {
      const state = deserializeGameState(oldQuick);
      if (state) saveToSlot(state, 'quicksave');
      localStorage.removeItem('quickSave');
    } catch { /* ignore */ }
  }

  // 迁移旧 manualSave -> save_1
  const oldManual = localStorage.getItem('manualSave');
  if (oldManual && !hasSlot('save_1')) {
    try {
      const state = deserializeGameState(oldManual);
      if (state) saveToSlot(state, 'save_1');
      localStorage.removeItem('manualSave');
    } catch { /* ignore */ }
  }

  // 迁移旧 autoSaveMonthly
  const oldAuto = localStorage.getItem('autoSaveMonthly');
  if (oldAuto && !hasSlot('autosave_monthly')) {
    try {
      const state = deserializeGameState(oldAuto);
      if (state) saveToSlot(state, 'autosave_monthly');
      localStorage.removeItem('autoSaveMonthly');
      localStorage.removeItem('autoSaveMonthlyMeta');
    } catch { /* ignore */ }
  }
}
