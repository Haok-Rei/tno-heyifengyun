import { ALL_SUB_TILES, type GameState } from '../types';
import { getCommandRoute } from '../data/commandRoutes';
import { ROUTE_OPERATIONS } from '../data/routeOperations';
import { getLawSystem } from '../data/laws';
import { availableMapActions, executeMapAction } from './mapActions';
import type { CommandState, FieldOrder } from './commandTypes';
import { getTileControl } from './mapState';

const day = (date: Date) => Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
const regionTile: Record<string, string> = { B3: 'b3_tower', B1_B2: 'dorm_1_4', Admin: 'admin_main', ArtHall: 'aud_hall', Lab: 'intl_dept', Playground: 'track_field' };
const newTeam = (index: number) => ({ id: `team-${index + 1}`, name: ['一中联络组','校园协调组','地区行动组','机动工作组','预备工作组'][index] || `第${index + 1}工作组`, order: null });

function routePreparation(state: GameState): CommandState['preparation'] {
  const preparation = { ...state.command?.preparation };
  const route = getCommandRoute(state).id;
  // The early B3 network becomes revolutionary contacts; the reform teams later
  // become the commune's first floor coordinators. Transfer once on route change.
  const inherited = route === 'revolution' ? 'opening' : route === 'commune' ? 'reform' : null;
  if (inherited && preparation[inherited]) {
    preparation[route] = Math.min(6, (preparation[route] || 0) + Math.min(3, preparation[inherited]));
    preparation[inherited] = 0;
  }
  return preparation;
}

export function getCommandLinks(state: GameState, repeats = 0, tileId?: string, actionId?: string) {
  const route = getCommandRoute(state).id;
  const link = ROUTE_OPERATIONS[route];
  const focusReady = state.completedFocuses.includes(link.focus);
  const decisionDays = state.decisionCooldowns[link.decision] || 0;
  const lawReady = link.lawLevels.includes(getLawSystem(state.lawSystem)[link.law]);
  const matched = !!actionId && link.actions.includes(actionId);
  const veteran = repeats >= 3;
  const supplied = !!tileId && getSupplyNetwork(state).has(tileId);
  const preparation = routePreparation(state)?.[route] || 0;
  return { ...link, focusReady, decisionDays, lawReady, matched, veteran, supplied, preparation, bonus: matched ? Math.min(2, 1 + Number(focusReady && lawReady && supplied)) : 0 };
}

export function getOrderCadence(state: GameState, tileId: string, interval: number, repeats = 0, actionId?: string): number {
  const links = getCommandLinks(state, repeats, tileId, actionId);
  return Math.max(1, interval - Number(links.matched && links.focusReady) - Number(links.matched && links.decisionDays > 0));
}

function applyCommandLinks(state: GameState, repeats: number, tileId: string, actionId: string): { state: GameState; outcome: string } {
  const route = getCommandRoute(state).id;
  const links = getCommandLinks(state, repeats, tileId, actionId);
  if (!links.matched) return { state, outcome: '常规地区行动；不属于本路线筹备' };
  const command = getCommandState(state);
  const before = command.preparation?.[route] || 0;
  const after = Math.min(6, before + links.bonus);
  command.preparation = { ...command.preparation, [route]: after };
  return { state: { ...state, command }, outcome: `${links.preparationUse} +${after - before}（${after}/6）；可用于${links.decisionName}${route === 'revolution' || route === 'commune' || route === 'wu' ? '及相关小游戏' : ''}` };
}

/** Field preparation is spent only by the matching route decision or minigame. */
export function consumeRoutePreparation(state: GameState, route: ReturnType<typeof getCommandRoute>['id'], stage: 'decision' | 'minigame'): { state: GameState; spent: number; outcome: string } {
  if (getCommandRoute(state).id !== route) return { state, spent: 0, outcome: '' };
  const command = getCommandState(state);
  const spent = Math.min(3, command.preparation?.[route] || 0);
  if (!spent) return { state, spent: 0, outcome: '' };
  command.preparation = { ...command.preparation, [route]: (command.preparation?.[route] || 0) - spent };
  let next = { ...state, command, stats: { ...state.stats } };
  if (route === 'opening' || route === 'revolution') next.stats.ss = Math.min(100, next.stats.ss + spent * 2);
  else if (route === 'democracy' || route === 'commune') next.stats.allianceUnity = Math.min(100, next.stats.allianceUnity + spent * 2);
  else if (route === 'purge') next.stats.partyCentralization = Math.min(100, next.stats.partyCentralization + spent * 2);
  else if (route === 'wu' && next.wuState) next.wuState = { ...next.wuState, guerrillaStrength: Math.max(0, next.wuState.guerrillaStrength - spent * 2) };
  else if (route === 'reform' && next.reformState) next.reformState = { ...next.reformState, progress: Math.min(100, next.reformState.progress + spent * 2) };
  else if (route === 'yang' && next.yangYuleState) next.yangYuleState = { ...next.yangYuleState, teacherSupport: Math.min(100, next.yangYuleState.teacherSupport + spent * 2) };
  else if (route === 'jidi' && next.jidiCorporateState) next.jidiCorporateState = { ...next.jidiCorporateState, gdp: next.jidiCorporateState.gdp + spent };
  else if (route === 'gouxiong' && next.gouxiongState) next.gouxiongState = { ...next.gouxiongState, sanity: Math.min(next.gouxiongState.maxSanity, next.gouxiongState.sanity + spent * 2) };
  const actual = Number((preparationValue(next, route) - preparationValue(state, route)).toFixed(2));
  const outcome = `${ROUTE_OPERATIONS[route].preparationUse}投入${stage === 'decision' ? '决议' : '小游戏'}：消耗 ${spent} 份，${ROUTE_OPERATIONS[route].result} ${actual >= 0 ? '+' : ''}${actual}；剩余 ${command.preparation[route]}/6`;
  command.reports = [{ id: command.nextId++, date: state.date.getTime(), title: stage === 'decision' ? '工作组支援决议' : '工作组支援行动', text: ROUTE_OPERATIONS[route].decisionName, outcome, tileId: getCommandRoute(state).hq }, ...command.reports].slice(0, 10);
  return { state: next, spent, outcome };
}

function preparationValue(state: GameState, route: ReturnType<typeof getCommandRoute>['id']): number {
  if (route === 'opening' || route === 'revolution') return state.stats.ss;
  if (route === 'democracy' || route === 'commune') return state.stats.allianceUnity;
  if (route === 'purge') return state.stats.partyCentralization;
  if (route === 'wu') return state.wuState?.guerrillaStrength ?? 0;
  if (route === 'reform') return state.reformState?.progress ?? 0;
  if (route === 'yang') return state.yangYuleState?.teacherSupport ?? 0;
  if (route === 'jidi') return state.jidiCorporateState?.gdp ?? 0;
  return state.gouxiongState?.sanity ?? 0;
}

/** A forecast of the existing capped reward; reading this never consumes preparation. */
export function getPreparationPreview(state: GameState) {
  const route = getCommandRoute(state).id;
  const stored = getCommandState(state).preparation?.[route] || 0;
  const spent = Math.min(3, stored);
  const before = preparationValue(state, route);
  const hasTarget = route === 'wu' ? !!state.wuState : route === 'reform' ? !!state.reformState
    : route === 'yang' ? !!state.yangYuleState : route === 'jidi' ? !!state.jidiCorporateState : route === 'gouxiong' ? !!state.gouxiongState : true;
  const maximumDelta = route === 'jidi' ? spent : route === 'wu' ? -spent * 2 : spent * 2;
  const delta = !hasTarget ? 0 : route === 'jidi' ? spent : route === 'wu' ? -Math.min(before, spent * 2)
    : Math.max(0, Math.min(route === 'gouxiong' ? state.gouxiongState?.maxSanity ?? 100 : 100, before + spent * 2) - before);
  const uses = route === 'opening' ? '起义后最多继承3份，可支援传单决议和革命小游戏'
    : route === 'revolution' ? '传单决议；频率之战、地下印刷所、海报战与B3保卫战'
    : `${ROUTE_OPERATIONS[route].decisionName}${['commune', 'wu'].includes(route) ? '与相关小游戏' : ''}`;
  return { spent, delta, maximumDelta, stored, result: ROUTE_OPERATIONS[route].result, uses, inherits: route === 'opening' };
}

export function getTeamCapacity(state: GameState): number {
  const route = getCommandRoute(state).id;
  const routeFocus = getCommandLinks(state).focusReady ? 1 : 0;
  if (route === 'opening') return 1 + routeFocus;
  if (route === 'reform') return Math.max(1, Math.min(5, 1 + Math.floor((state.reformState?.vanguardMembers || 0) / 15) + routeFocus));
  const focusBonus = routeFocus || state.completedFocuses.length >= 15 ? 1 : 0;
  const phaseBonus = ['democracy','commune','purge','wu','gouxiong'].includes(route) ? 1 : 0;
  return Math.min(5, 2 + focusBonus + phaseBonus);
}

/** v1 的独立行动不再产生效果；旧存档中的工作组保留，重新派遣即可。 */
export function getCommandState(state: GameState): CommandState {
  const stored = state.command;
  const capacity = getTeamCapacity(state);
  const route = getCommandRoute(state).id;
  const retired: FieldOrder[] = [];
  const teams = Array.from({ length: Math.max(capacity, stored?.teams?.length || 0) }, (_, i) => {
    const old = stored?.teams?.[i];
    let order = old?.order && 'actionId' in old.order ? old.order as FieldOrder : null;
    if (order && (order.route !== route || (!order.reformRegion && !availableMapActions(state, order.tileId).some(action => action.id === order!.actionId)))) {
      retired.push(order);
      order = null;
    }
    return { ...newTeam(i), order };
  });
  const nextId = stored?.nextId || 1;
  const reports = retired.map((order, index) => ({ id: nextId + index, date: state.date.getTime(), title: '工作组撤回', text: '路线或地区授权发生改变，定期任务自动终止。', outcome: '无额外损失', tileId: order.tileId }));
  return { version: 2, nextId: nextId + retired.length, lastTick: stored?.version === 2 ? stored.lastTick : day(state.date), teams, reports: retired.length ? [...reports, ...(stored?.reports || [])].slice(0, 10) : stored?.reports || [], completed: stored?.completed || 0, preparation: routePreparation(state) };
}

export function getSupplyNetwork(state: GameState): Set<string> {
  const hq = getCommandRoute(state).hq;
  const connected = new Set<string>([hq]);
  const queue = [hq];
  while (queue.length) {
    const currentId = queue.shift();
    const current = ALL_SUB_TILES.find(t => t.id === currentId);
    for (const neighbor of current?.adjacentTo || []) {
      if (connected.has(neighbor)) continue;
      const tile = ALL_SUB_TILES.find(t => t.id === neighbor);
      if (!tile) continue;
      const control = getTileControl(state, neighbor);
      if (getCommandRoute(state).schoolSide ? control <= 50 : control >= 50) { connected.add(neighbor); queue.push(neighbor); }
    }
  }
  return connected;
}
export function hasSupplyAccess(state: GameState, tileId: string): boolean {
  const network = getSupplyNetwork(state);
  if (network.has(tileId)) return true;
  return ALL_SUB_TILES.find(t => t.id === tileId)?.adjacentTo.some(t => network.has(t)) || false;
}

export function assignRecurringAction(state: GameState, tileId: string, actionId: string, interval: number): GameState {
  if (![2,4,7].includes(interval) || !availableMapActions(state, tileId).some(a => a.id === actionId)) return state;
  const command = getCommandState(state);
  const index = command.teams.findIndex((t, i) => i < getTeamCapacity(state) && !t.order);
  if (index < 0 || command.teams.some(t => t.order?.tileId === tileId && t.order?.actionId === actionId)) return state;
  const order: FieldOrder = { id: command.nextId++, tileId, actionId, route: getCommandRoute(state).id, interval, nextRunDay: day(state.date) + getOrderCadence(state, tileId, interval, 0, actionId), repeats: 0 };
  command.teams[index] = { ...command.teams[index], order };
  return { ...state, command };
}

export function reserveReformTeam(state: GameState, region: string, actionId: string, days: number): GameState | null {
  const command = getCommandState(state);
  const index = command.teams.findIndex((t, i) => i < getTeamCapacity(state) && !t.order);
  if (index < 0) return null;
  const order: FieldOrder = { id: command.nextId++, tileId: regionTile[region], reformRegion: region, actionId, route: 'reform', interval: 0, nextRunDay: 0, repeats: 0, remaining: days };
  command.teams[index] = { ...command.teams[index], order };
  return { ...state, command };
}

export function cancelOrder(state: GameState, teamId: string): GameState {
  const command = getCommandState(state);
  const team = command.teams.find(t => t.id === teamId);
  if (!team?.order || team.order.reformRegion) return state;
  team.order = null;
  return { ...state, command };
}

/** 与游戏原有每日循环合并。每次执行仍支付地图行动的原价，并服从原有解锁条件。 */
export function advanceCommandDay(state: GameState): GameState {
  if (state.gameEnding) return state;
  const current = getCommandState(state);
  const today = day(state.date);
  if (today <= current.lastTick) {
    const retired = state.command?.teams.some((team, index) => team.order && !current.teams[index]?.order);
    return state.command?.version === 2 && !retired ? state : { ...state, command: current };
  }
  const command: CommandState = { ...current, lastTick: today, teams: current.teams.map(t => ({ ...t, order: t.order ? { ...t.order } : null })), reports: [...current.reports] };
  let next: GameState = { ...state, command };
  for (const team of command.teams) {
    const order = team.order;
    if (!order) continue;
    if (order.reformRegion) {
      const mission = next.reformState?.activeMissions?.[order.reformRegion];
      if (mission) order.remaining = mission.daysLeft;
      else {
        const linked = next.flags[`reform_mission_success_${order.reformRegion}`] === false
          ? { state: next, outcome: '任务失败，未形成地区筹备' }
          : applyCommandLinks(next, order.repeats, order.tileId, 'reform_mission');
        command.preparation = linked.state.command?.preparation;
        next = { ...linked.state, command };
        command.reports.unshift({ id: order.id, date: next.date.getTime(), title: '题改工作队归队', text: '改革委员会任务已结算，工作组重新待命。', outcome: linked.outcome, tileId: order.tileId });
        command.completed++;
        team.order = null;
      }
      continue;
    }
    if (order.route !== getCommandRoute(next).id || !availableMapActions(next, order.tileId).some(a => a.id === order.actionId)) {
      command.reports.unshift({ id: order.id, date: next.date.getTime(), title: '工作组撤回', text: '路线或地区授权发生改变，定期任务自动终止。', outcome: '无额外损失', tileId: order.tileId });
      team.order = null;
      continue;
    }
    if (today < order.nextRunDay) continue;
    const name = availableMapActions(next, order.tileId).find(a => a.id === order.actionId)!.name;
    const result = executeMapAction(next, order.tileId, order.actionId, 'workgroup');
    order.nextRunDay = today + (result.executed ? getOrderCadence(next, order.tileId, order.interval, order.repeats, order.actionId) : 1);
    if (!result.executed) {
      command.reports.unshift({ id: command.nextId++, date: next.date.getTime(), title: `${name} · 暂缓`, text: '所需资源不足或今天已经执行过；工作组明日重试。', outcome: '未扣资源', tileId: order.tileId });
      continue;
    }
    next = result.state;
    order.repeats++;
    const linked = applyCommandLinks(next, order.repeats, order.tileId, order.actionId);
    command.preparation = linked.state.command?.preparation;
    next = { ...linked.state, command };
    command.completed++;
    order.nextRunDay = today + getOrderCadence(next, order.tileId, order.interval, order.repeats, order.actionId);
    const fieldNote = order.repeats % 3 === 0 ? getCommandRoute(next).report : getCommandRoute(next).dispatch;
    command.reports.unshift({ id: command.nextId++, date: next.date.getTime(), title: `${name} · 第${order.repeats}次`, text: `${team.name}在${ALL_SUB_TILES.find(t => t.id === order.tileId)?.name}执行地图行动。${fieldNote}`, outcome: `${linked.outcome}；按原价结算；${order.nextRunDay - today}天后再执行`, tileId: order.tileId });
  }
  command.reports = command.reports.slice(0, 10);
  return { ...next, command };
}
