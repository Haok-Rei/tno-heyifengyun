import type { GameState } from '../types';
import { ROUTE_TREE, type GuideNode } from '../data/routeGuide';
import { getCommandRoute } from '../data/commandRoutes';
import { ENDING_BY_ID } from '../data/endings';
import { getCampusControlProgress, formatControl } from './mapState';
import { getCrossroadsOutcome, CROSSROADS_LABELS } from './assemblyPolitics';

export function findGuideNode(id: string, root = ROUTE_TREE): GuideNode | undefined {
  if (root.id === id) return root;
  for (const child of root.children ?? []) { const found = findGuideNode(id, child); if (found) return found; }
}
export function guideIds(node: GuideNode): string[] { return [node.id, ...(node.children ?? []).flatMap(guideIds)]; }
export function guideExpansion(root: GuideNode, open: boolean): Record<string, boolean> {
  return Object.fromEntries(guideIds(root).map(id => [id, open]));
}
export function guidePath(id: string, node = ROUTE_TREE): string[] {
  if (node.id === id) return [id];
  for (const child of node.children ?? []) { const path = guidePath(id, child); if (path.length) return [node.id, ...path]; }
  return [];
}
export function filterGuide(node: GuideNode, search: string): GuideNode | undefined {
  const query = search.trim().toLocaleLowerCase();
  const ending = node.endingId ? ENDING_BY_ID[node.endingId] : undefined;
  if (!query || [node.title, node.req, node.story, node.note, ending?.title, ending?.subtitle].some(value => value?.toLocaleLowerCase().includes(query))) return node;
  const children = node.children?.map(child => filterGuide(child, query)).filter((child): child is GuideNode => !!child);
  return children?.length ? { ...node, children } : undefined;
}
export function currentGuideId(state: GameState): string {
  const ids: Record<string, string> = { phase1: state.flags.rebellion_started ? 'charge_b3' : 'start', treeA: 'tree_a', treeA_pan: 'route_pan', treeA_pan_despair: 'pan_despair', treeA_true_left: 'route_true_left', treeA_haobang: 'route_haobang', treeA_lu_bohan: 'route_lu', treeB: 'yang_yule_entry', jidi_tree: 'jidi_route', gouxiong_tree: 'gx_route', wu_tree: 'wu_route', wu_tree_p2_feng: 'wu_p2_feng', wu_tree_p2_spring: 'wu_p2_spring', wu_tree_p2_coup: 'wu_p2_coup' };
  return ids[state.currentFocusTree] ?? 'start';
}
export function getRouteGuideStatus(state: GameState) {
  const route = getCommandRoute(state);
  const done = (id: string) => state.completedFocuses.includes(id);
  const checks: Array<{ label: string; value: string; met: boolean }> = [];
  let tip = '国策决定剧情阶段；决议、法案、地区行动与工作组为路线准备条件。';
  if (state.currentFocusTree === 'phase1' && !state.flags.rebellion_started) {
    checks.push({ label: 'B3起义 · 激进愤怒', value: state.stats.radicalAnger.toFixed(1)+' / >80', met: state.stats.radicalAnger > 80 });
    tip = '禁书、抗议国策与校园小事件会推动愤怒。工作组定期重复已解锁的地图行动；无需完成所有开局国策。';
  } else if (state.currentFocusTree === 'treeA') {
    checks.push({ label: '真左团结底线', value: state.stats.allianceUnity.toFixed(1)+' / ≥55', met: state.stats.allianceUnity >= 55 });
    tip = '按当前席位与数值预判：'+CROSSROADS_LABELS[getCrossroadsOutcome(state)]+'。真正分流在十字路口事件确认时；国策推进期间仍可进行地区争夺和大会协商。';
  } else if (state.currentFocusTree === 'treeA_pan') {
    if (!state.flags.map_struggle_ended && !state.electionState?.isActive) {
      const progress = getCampusControlProgress(state);
      checks.push({ label: '完全控制地区', value: `${progress.controlled}/${progress.total}`, met: !progress.remaining.length }, { label: '扩大大会与民主改革', value: '两项前置国策', met: done('expand_assembly') && done('democratic_reforms') });
      tip = progress.remaining.length ? '尚未完全控制：'+progress.remaining.map(t => `${t.name} ${formatControl(t.control)}%`).join('、')+'。手动争取地区与驻地工作组均可推进；全部达成后选择“重拾民主”。' : '十五地区控制已达标，完成两项前置即可选择“重拾民主”；之后进入法案与普选阶段。';
    } else if (state.electionState?.isActive) {
      checks.push({ label: '普选剩余', value: `${state.electionState.daysLeft}天 / ${state.electionState.totalDays}天`, met: true });
      tip = '各派竞选工作组每五日移动；地区选情解锁后可在地区窗口查看比例，己方驻地工作组可继续拉票。';
    } else {
      checks.push({ label: '已通过法案', value: `${state.flags.passed_bills_count || 0}/3`, met: (state.flags.passed_bills_count || 0) >= 3 }, { label: '议会权力平衡', value: `${state.parliamentState?.powerBalance ?? 50} / ≤30`, met: (state.parliamentState?.powerBalance ?? 50) <= 30 }, { label: '学生理智', value: `${state.stats.studentSanity.toFixed(1)} / >80`, met: state.stats.studentSanity > 80 });
      tip = '“民主的胜利”还需完成透明财政与课程改革国策；随后“第一次民主普选”持续60天。大选开始前的地区拉票效果较弱。';
    }
  } else if (state.currentFocusTree === 'treeA_true_left') {
    checks.push({ label: '题改进度', value: `${state.reformState?.progress ?? 0} / 100`, met: (state.reformState?.progress ?? 0) >= 100 });
    const deadline = state.crises.find(c => c.id === 'reform_fail_crisis');
    tip = '先完成地区接管，再用做题改革委员会推进改革。题改任务与地图驻地行动共用工作组名额；改革达标后推进团结国策。'+(deadline ? `改革危机还剩${deadline.daysLeft}天。` : '');
  } else {
    const tips: Record<string, string> = { yang: '国策开放办公桌、维稳地图和健康管理；事务处理、教师支持与封安宝好感共同支撑职称评审。', jidi: '企业国策开放部门与地区产线；用既有地区行动和驻地工作组积累成果，并检查效率与财务状态。', commune: '国策授权公社地区行动；工作组重复当地建设，成果与大会、政治局联合委员会衔接。', purge: '按国策授权推进地区清洗；地区阶段与国家精神随剧情变化，驻地工作组执行同一行动规则。', wu: '国策推进戒严阶段；地区处置与决议会影响残党、学生愤怒、野心、信任与舆论。年度叙职将决定后续路线。', gouxiong: '国策开放礼堂玩法与聊天；地区社团行动、理智和人物好感共同影响天台之夜的分流。' };
    tip = tips[route.id] ?? tip;
  }
  return { id: currentGuideId(state), title: route.title, chapter: route.chapter, color: route.color, checks, tip };
}
