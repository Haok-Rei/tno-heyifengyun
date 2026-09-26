/**
 * 15格地图系统辅助函数
 *
 * 统一管理所有地块级旗标的读写，避免在多处代码中拼接旗标字符串。
 * 所有"写入"操作使用地块ID（tid），"读取"可选择建筑级聚合。
 */

import { ALL_SUB_TILES, ALL_BUILDING_IDS, MapLocation, SubTile } from '../types';

// ========== 地块控制度 (tile_ctrl_<tid>) ==========

/** 读取地块控制度（0-100），自动回退到 SubTile 默认值 */
export function getTileCtrl(flags: Record<string, any>, tid: string): number {
  return (flags[`tile_ctrl_${tid}`] as number | undefined)
    ?? ALL_SUB_TILES.find(t => t.id === tid)?.studentControl
    ?? 50;
}

/** 写入地块控制度（自动 clamp 到 0-100） */
export function setTileCtrl(flags: Record<string, any>, tid: string, value: number): void {
  flags[`tile_ctrl_${tid}`] = Math.max(0, Math.min(100, Math.round(value)));
}

/** 批量初始化所有15个地块的控制度 */
export function initAllTileCtrl(flags: Record<string, any>, defaultValue?: number): void {
  ALL_SUB_TILES.forEach(t => {
    flags[`tile_ctrl_${t.id}`] = defaultValue ?? t.studentControl;
  });
}

/**
 * v8.0: 批量增减地块控制度（事件effect用）。
 * deltas: { 地块ID: 增减值 }，自动 clamp 0-100 并原地写入传入的 flags 副本。
 */
export function applyTileCtrlDeltas(flags: Record<string, any>, deltas: Record<string, number>): void {
  Object.entries(deltas).forEach(([tid, delta]) => {
    setTileCtrl(flags, tid, getTileCtrl(flags, tid) + delta);
  });
}

// ========== 地块防御天数 (tile_def_<tid>) ==========

/** 读取地块防御天数 */
export function getTileDef(flags: Record<string, any>, tid: string): number {
  return (flags[`tile_def_${tid}`] as number | undefined) ?? 0;
}

/** 设置地块防御天数 */
export function setTileDef(flags: Record<string, any>, tid: string, days: number): void {
  flags[`tile_def_${tid}`] = Math.max(0, days);
}

// ========== GX无政府模式 地块所有者 (gx_map_owner_tile_<tid>) ==========

type GxOwner = 'school' | 'gouxiong' | 'left';

/** 读取GX模式地块所有者 */
export function getGxTileOwner(flags: Record<string, any>, tid: string): GxOwner {
  return ((flags[`gx_map_owner_tile_${tid}`] as string | undefined) || 'school') as GxOwner;
}

/** 设置GX模式地块所有者 */
export function setGxTileOwner(flags: Record<string, any>, tid: string, owner: GxOwner): void {
  flags[`gx_map_owner_tile_${tid}`] = owner;
}

/** 批量初始化所有15个地块的GX所有者（按建筑聚合映射） */
export function initGxTileOwners(flags: Record<string, any>, buildingOwnerMap: Record<string, GxOwner>): void {
  ALL_SUB_TILES.forEach(t => {
    flags[`gx_map_owner_tile_${t.id}`] = buildingOwnerMap[t.buildingId] || 'school';
  });
}

// ========== 吕波汉清洗模式 zone_level (lu_purge_zone_level_tile_<tid>) ==========

/** 读取清洗zone_level（0-3） */
export function getLuZoneLevel(flags: Record<string, any>, tid: string): number {
  return Number(flags[`lu_purge_zone_level_tile_${tid}`] || 0);
}

/** 设置清洗zone_level（0-3） */
export function setLuZoneLevel(flags: Record<string, any>, tid: string, level: number): void {
  flags[`lu_purge_zone_level_tile_${tid}`] = Math.max(0, Math.min(3, level));
}

// ========== 豪邦公社模式 zone_level (haobang_commune_zone_level_tile_<tid>) ==========

/** 读取公社zone_level（0-3） */
export function getCmZoneLevel(flags: Record<string, any>, tid: string): number {
  return Number(flags[`haobang_commune_zone_level_tile_${tid}`] || 0);
}

/** 设置公社zone_level（0-3） */
export function setCmZoneLevel(flags: Record<string, any>, tid: string, level: number): void {
  flags[`haobang_commune_zone_level_tile_${tid}`] = Math.max(0, Math.min(3, level));
}

// ========== 建筑级聚合 ==========

/** 从地块旗标计算建筑平均控制度 */
export function buildingAvgCtrl(flags: Record<string, any>, bid: string): number {
  const tiles = ALL_SUB_TILES.filter(t => t.buildingId === bid);
  if (tiles.length === 0) return 50;
  return Math.round(tiles.reduce((sum, t) => sum + getTileCtrl(flags, t.id), 0) / tiles.length);
}

/** 同步所有6个建筑的控制度到 mapLocations（从地块旗标聚合） */
export function syncBuildingControl(flags: Record<string, any>, mapLocations: Record<string, MapLocation>): void {
  ALL_BUILDING_IDS.forEach(bid => {
    const avg = buildingAvgCtrl(flags, bid);
    if (mapLocations[bid]) {
      mapLocations[bid] = { ...mapLocations[bid], studentControl: avg };
    }
  });
}

/** 检查所有15个地块是否满足某条件（用于国策canStart） */
export function allTilesMeet(flags: Record<string, any>, prefix: string, predicate: (value: number) => boolean): boolean {
  return ALL_SUB_TILES.every(t => predicate(Number(flags[`${prefix}${t.id}`] || 0)));
}

/** 检查所有15个地块控制度是否都 >= target */
export function allTilesCtrlAtLeast(flags: Record<string, any>, target: number): boolean {
  return ALL_SUB_TILES.every(t => getTileCtrl(flags, t.id) >= target);
}

// ========== 邻接 ==========

/** 获取某地块的所有相邻地块ID列表 */
export function getAdjacentTileIds(tid: string): string[] {
  const tile = ALL_SUB_TILES.find(t => t.id === tid);
  return tile?.adjacentTo ?? [];
}

/** 获取某地块的相邻地块中由指定方控制的数量（GX模式） */
export function countAdjacentOwnedBy(flags: Record<string, any>, tid: string, owner: string): number {
  return getAdjacentTileIds(tid).filter(adjId => getGxTileOwner(flags, adjId) === owner).length;
}

/** 获取某建筑下所有地块ID */
export function getTileIdsForBuilding(bid: string): string[] {
  return ALL_SUB_TILES.filter(t => t.buildingId === bid).map(t => t.id);
}
