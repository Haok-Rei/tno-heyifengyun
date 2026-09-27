import { normalizeDisplayNames } from './displayNames';
/**
 * engine/endingGallery.ts - 结局画廊持久化 (v8.0)
 *
 * localStorage 键（与 tno_save_* 体系一致）：
 * - tno_endings_unlock_v1: 结局解锁记录（跨局持久）
 * - tno_last_chronicle_v1: 最近一局编年史快照
 */

import { ChronicleEntry } from '../types';

const UNLOCK_KEY = 'tno_endings_unlock_v1';
const LAST_CHRONICLE_KEY = 'tno_last_chronicle_v1';

export interface EndingUnlockState {
  version: 1;
  /** endingId -> 解锁时间戳 */
  unlocked: Record<string, number>;
  /** endingId -> 在画廊点开查看的时间戳（用于 NEW 标记消除） */
  seen: Record<string, number>;
}

export interface LastChronicleRecord {
  endingId: string;
  endingTitle: string;
  routeTag: string;
  completedAt: number;
  entries: ChronicleEntry[];
}

export function getEndingUnlockState(): EndingUnlockState {
  try {
    const raw = localStorage.getItem(UNLOCK_KEY);
    if (!raw) return { version: 1, unlocked: {}, seen: {} };
    const parsed = JSON.parse(normalizeDisplayNames(raw));
    return {
      version: 1,
      unlocked: parsed.unlocked ?? {},
      seen: parsed.seen ?? {},
    };
  } catch {
    return { version: 1, unlocked: {}, seen: {} };
  }
}

/** 幂等写入，返回是否首次解锁（用于解锁动画） */
export function unlockEnding(endingId: string): boolean {
  if (!endingId) return false;
  const state = getEndingUnlockState();
  const isNew = !state.unlocked[endingId];
  state.unlocked[endingId] = state.unlocked[endingId] ?? Date.now();
  try {
    localStorage.setItem(UNLOCK_KEY, JSON.stringify(state));
  } catch { /* ignore quota */ }
  return isNew;
}

/** 点开详情时调用，消除 NEW 标记 */
export function markEndingSeen(endingId: string): void {
  if (!endingId) return;
  const state = getEndingUnlockState();
  state.seen[endingId] = Date.now();
  try {
    localStorage.setItem(UNLOCK_KEY, JSON.stringify(state));
  } catch { /* ignore quota */ }
}

/** 已解锁且尚未在画廊查看过的结局ID列表（NEW 徽章） */
export function getUnseenEndings(): string[] {
  const state = getEndingUnlockState();
  return Object.keys(state.unlocked).filter(id => !state.seen[id]);
}

export function saveLastChronicle(rec: LastChronicleRecord): void {
  try {
    localStorage.setItem(LAST_CHRONICLE_KEY, JSON.stringify(rec));
  } catch { /* ignore quota */ }
}

export function getLastChronicle(): LastChronicleRecord | null {
  try {
    const raw = localStorage.getItem(LAST_CHRONICLE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(normalizeDisplayNames(raw));
    if (!parsed || !Array.isArray(parsed.entries)) return null;
    return parsed as LastChronicleRecord;
  } catch {
    return null;
  }
}
