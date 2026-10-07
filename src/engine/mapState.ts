import { ALL_BUILDING_IDS, ALL_SUB_TILES, TILE_BY_ID, TILES_BY_BUILDING, type GameState } from '../types';
import { getCommandRoute } from '../data/commandRoutes';

export type MapMode = 'opening' | 'struggle' | 'reform' | 'commune' | 'purge' | 'wu' | 'yang' | 'jidi' | 'gouxiong' | 'election' | 'peace';
const EPSILON = 1e-7;
export function normalizeControl(value: number): number {
  const bounded = Math.max(0, Math.min(100, value));
  return 100 - bounded < EPSILON ? 100 : bounded;
}

/** The current route owns the map. Historic flags of other routes never select its actions. */
export function getMapMode(state: GameState): MapMode {
  const route = getCommandRoute(state).id;
  if (['commune', 'purge', 'wu', 'yang', 'jidi', 'gouxiong', 'opening'].includes(route)) return route as MapMode;
  if (state.currentFocusTree === 'treeA_pan_despair') return 'struggle';
  if (route === 'democracy' && (state.flags.polling_stations_unlocked || state.electionState?.isActive)) return 'election';
  if (route === 'democracy' && state.flags.map_struggle_ended) return 'peace';
  if (route === 'reform' && state.flags.map_phase_ended) return 'reform';
  if (route === 'revolution' && state.flags.map_struggle_ended) return 'peace';
  return 'struggle';
}

export function getTileControl(state: Pick<GameState, 'flags'>, tileId: string): number {
  const value = state.flags[`tile_ctrl_${tileId}`];
  return normalizeControl(typeof value === 'number' && Number.isFinite(value) ? value : TILE_BY_ID[tileId]?.studentControl ?? 50);
}

export function getBuildingControl(state: Pick<GameState, 'flags'>, buildingId: string): number {
  const tiles = TILES_BY_BUILDING[buildingId] ?? [];
  return tiles.length ? normalizeControl(tiles.reduce((sum, tile) => sum + getTileControl(state, tile.id), 0) / tiles.length) : 0;
}

/** Only genuinely complete control is displayed as 100%; fractional fronts stay visible. */
export function formatControl(value: number): string {
  const control = normalizeControl(value);
  return String(control === 100 ? 100 : Math.min(99.9, Math.round(control * 10) / 10));
}

export function getCampusControlProgress(state: Pick<GameState, 'flags'>) {
  const remaining = ALL_SUB_TILES.map(tile => ({ ...tile, control: getTileControl(state, tile.id) })).filter(tile => tile.control < 100);
  return { controlled: ALL_SUB_TILES.length - remaining.length, total: ALL_SUB_TILES.length, remaining };
}

export function syncMapLocations(state: GameState): GameState {
  if (!state.mapLocations) return state;
  let mapLocations = state.mapLocations;
  for (const id of ALL_BUILDING_IDS) {
    const location = mapLocations[id];
    const control = getBuildingControl(state, id);
    if (location && location.studentControl !== control) {
      if (mapLocations === state.mapLocations) mapLocations = { ...mapLocations };
      mapLocations[id] = { ...location, studentControl: control };
    }
  }
  return mapLocations === state.mapLocations ? state : { ...state, mapLocations };
}

/** Adapt old building-only saves once. Sparse modern tile flags retain their original defaults. */
export function restoreMapState(state: GameState): GameState {
  if (!state.mapLocations) return state;
  const hasTileData = ALL_SUB_TILES.some(tile => typeof state.flags[`tile_ctrl_${tile.id}`] === 'number');
  let next = state;
  if (!hasTileData && getMapMode(state) !== 'opening') {
    const flags = { ...state.flags };
    for (const tile of ALL_SUB_TILES) {
      const control = state.mapLocations[tile.buildingId]?.studentControl;
      if (typeof control === 'number' && Number.isFinite(control)) flags[`tile_ctrl_${tile.id}`] = normalizeControl(control);
    }
    next = { ...state, flags };
  }
  return syncMapLocations(next);
}
