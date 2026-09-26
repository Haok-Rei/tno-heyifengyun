import { ALL_SUB_TILES, type GameState } from '../types';
import { getLawSystem } from '../data/laws';
import { getTileCtrl } from './tileHelpers';

/** 每日最多新增一处，失控地区先冷却；同日失控统一汇报，避免弹窗连锁。 */
export function advanceYangRebellions(s: GameState, random = Math.random) {
  const yy = s.yangYuleState;
  if (s.currentFocusTree !== 'treeB' || !yy?.unlockedMechanics.map) return { state: s, failed: [] as string[] };
  const active = { ...yy.rebelLocations };
  const cooldowns = Object.fromEntries(Object.entries(yy.rebelCooldowns ?? {}).filter(([, n]) => n > 1).map(([id, n]) => [id, n - 1]));
  const failed: string[] = [];
  for (const [id, n] of Object.entries(active)) {
    if (n <= 1) { delete active[id]; cooldowns[id] = 14; failed.push(id); }
    else active[id] = n - 1;
  }
  const laws = getLawSystem(s.lawSystem);
  const pressure = Math.max(0, (50 - s.stats.ss) * .07 + (45 - s.stats.stab) * .04 + Math.max(0, s.stats.radicalAnger - 30) * .08);
  if (Object.keys(active).length < 3 && pressure > 0) {
    // 打乱检查起点，避免地图数组靠前的地区承担所有新暴动。
    const start = Math.floor(random() * ALL_SUB_TILES.length);
    for (let i = 0; i < ALL_SUB_TILES.length; i++) {
      const tile = ALL_SUB_TILES[(start + i) % ALL_SUB_TILES.length];
      if (active[tile.id] || cooldowns[tile.id]) continue;
      const chance = Math.min(8, pressure + getTileCtrl(s.flags, tile.id) * .025 + (['panopticon', 'hengshui'].includes(laws.discipline) ? 1 : 0));
      if (random() * 100 < chance) { active[tile.id] = 5; break; }
    }
  }
  return { failed, state: { ...s,
    stats: { ...s.stats, stab: Math.max(0, s.stats.stab - Math.min(18, failed.length * 10)) },
    yangYuleState: { ...yy, rebelLocations: active, rebelCooldowns: cooldowns, fengFavor: Math.max(0, yy.fengFavor - Math.min(18, failed.length * 10)) },
  } };
}
