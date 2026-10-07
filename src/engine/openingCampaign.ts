import { ALL_SUB_TILES, type GameEvent, type GameState } from '../types';
import { FLAVOR_EVENTS } from '../data/flavorEvents';

export type OpeningChapter = 'mobilization' | 'handover' | 'committee';
export interface OpeningFieldRecord {
  chapter: OpeningChapter;
  tileId: string;
  actionId: string;
  manual: number;
  workgroup: number;
  firstDate: number;
  lastDate: number;
}
export interface OpeningCampaignHistory {
  version: 1;
  fieldwork: Record<string, OpeningFieldRecord>;
}
export interface ChapterBrief {
  id: OpeningChapter;
  title: string;
  goal: string;
  steps: Array<{ label: string; done: boolean; hint: string }>;
}

const count = (n: number | undefined) => Number.isFinite(n) ? Math.max(0, Math.floor(n!)) : 0;
export function getOpeningFieldwork(state: GameState): OpeningFieldRecord[] {
  return state.openingCampaign?.version === 1 ? Object.values(state.openingCampaign.fieldwork ?? {}) : [];
}

export function getOpeningChapter(state: GameState): OpeningChapter | null {
  if (state.gameEnding || !['phase1', 'treeA'].includes(state.currentFocusTree)) return null;
  if (state.currentFocusTree === 'phase1' && !state.flags.rebellion_started) return 'mobilization';
  if (!state.completedFocuses.includes('declare_indep')) return 'handover';
  return 'committee';
}

/** Narrative memory only: prices, map control, rewards and daily timing stay with mapActions. */
export function recordOpeningFieldwork(before: GameState, after: GameState, tileId: string, actionId: string, source: 'manual' | 'workgroup'): GameState {
  const chapter = getOpeningChapter(before);
  if (!chapter) return after;
  const key = `${chapter}/${tileId}/${actionId}`;
  const fieldwork = before.openingCampaign?.version === 1 ? before.openingCampaign.fieldwork ?? {} : {};
  const previous = fieldwork[key];
  const entry: OpeningFieldRecord = {
    chapter, tileId, actionId,
    manual: count(previous?.manual) + Number(source === 'manual'),
    workgroup: count(previous?.workgroup) + Number(source === 'workgroup'),
    firstDate: previous?.firstDate ?? after.date.getTime(),
    lastDate: after.date.getTime(),
  };
  return { ...after, openingCampaign: { version: 1, fieldwork: { ...fieldwork, [key]: entry } } };
}

export function getLocalFieldwork(state: GameState, tileId: string) {
  const entries = getOpeningFieldwork(state).filter(entry => entry.tileId === tileId);
  return entries.reduce((sum, entry) => ({ manual: sum.manual + count(entry.manual), workgroup: sum.workgroup + count(entry.workgroup) }), { manual: 0, workgroup: 0 });
}

export function getYangSettlement(state: GameState): 'trial' | 'compromise' | null {
  const choice = state.flags.yang_settlement;
  if (choice === 'trial' || choice === 'compromise') return choice;
  if (state.flags.yang_yule_removed_by_trial || state.completedFocuses.includes('trial_yang')) return 'trial';
  if (state.completedFocuses.includes('secret_compromise')) return 'compromise';
  return null;
}

export function getChapterBrief(state: GameState): ChapterBrief | null {
  const chapter = getOpeningChapter(state);
  const done = (id: string) => state.completedFocuses.includes(id);
  if (chapter === 'mobilization') return {
    id: chapter, title: '风暴前夜 · 联络与动员',
    goal: state.stats.radicalAnger > 80 ? 'B3行动已可选择；也可以继续完成当前国策。' : `激进愤怒 ${Math.floor(state.stats.radicalAnger || 0)} / >80；巡查、禁书与学生联络的国策和事件会推动局势。`,
    steps: [
      { label: '秋季开学', done: done('start_2023'), hint: '开学典礼完成后，校方与学生两侧国策开放。' },
      { label: '校园联络', done: getOpeningFieldwork(state).some(e => e.chapter === chapter), hint: 'B3串联、礼堂社团和操场活动均可操作；工作组定期执行同一行动。' },
      { label: 'B3行动', done: done('charge_b3'), hint: '激进愤怒大于80即可选择；无需完成左右两侧全部国策。' },
    ],
  };
  if (chapter === 'handover') return {
    id: chapter, title: 'B3起义 · 街垒与接管',
    goal: '处理B3事件链；接下来由联合革委会组织地区接管。',
    steps: [
      { label: '冲上B3', done: done('charge_b3'), hint: '原有起义事件链继续推进，地图地区行动已经开放。' },
      { label: '地区接管', done: getOpeningFieldwork(state).some(e => e.chapter === chapter), hint: '地图上的控制、防御与宣传仍按各自原有费用执行。' },
      { label: '成立革委会', done: done('declare_indep'), hint: '进入革委会国策后完成成立国策；开局筹备最多3份转入革命筹备。' },
    ],
  };
  if (chapter === 'committee') return {
    id: chapter, title: '联合革委会 · 同盟与指挥',
    goal: done('convene_assembly') ? '大会席位、联盟团结与党内集权共同决定十字路口；地区争夺仍可继续。' : '继续地区接管和革委会国策；召开大会后，席位与同盟分歧进入下一阶段。',
    steps: [
      { label: '召开大会', done: done('convene_assembly'), hint: '大会解锁后可调整派系关系；争权危机要结合当前席位与团结处理。' },
      { label: '处置旧教务', done: getYangSettlement(state) !== null, hint: '公审与妥协互斥：前者撤去杨玉乐并增强正统派，后者保留合作并扩大温和与做题派代表权。' },
      { label: '命运十字路口', done: done('crossroads_of_fate'), hint: '先完成整顿校内秩序。十字路口事件确认时，按届时数值和席位分流。' },
    ],
  };
  return null;
}

/** Explain the selected existing action without creating another field-task menu. */
export function getOpeningActionPurpose(state: GameState, actionId?: string): string | null {
  const chapter = getOpeningChapter(state);
  if (!chapter || !actionId) return null;
  if (chapter === 'mobilization') {
    if (actionId === 'b3_under') return '联络B3各班、提升支持；工作组另积累传单网络，起义后最多继承3份。';
    if (actionId === 'aud_coop') return '争取社团与同盟支持；工作组积累的网络可带入后续宣传行动。';
    if (actionId === 'pl_sports') return '恢复学生理智并增强当地控制；执行原有活动效果。';
  }
  const purposes: Record<string, string> = {
    boost: '争取当地控制；后续地区接管会继续使用这些地块。',
    defend: '提供当地7天防御，减少阵地丢失；防御天数随时间推进。',
    b3_fort: '提供当地14天防御，守住B3的联络与指挥据点。',
    b3_under: '继续联络当地学生，提高控制与支持。',
    b3_leaf: '提高控制、支持与愤怒；工作组另积累可投入宣传和小游戏的筹备。',
    rally: '提高控制与支持；工作组另积累革命筹备。',
    lab_print: '用试卷换取政治点数；工作组同时积累印刷宣传筹备。',
    adm_hack: '按学生支持决定广播行动的成败；工作组支付行动费用后积累筹备。',
    aud_coop: '通过社团争取控制和联盟团结，为大会协商保留群众基础。',
    aud_salon: '通过沙龙争取控制与团结，配合议会路线的协商。',
  };
  return purposes[actionId] ?? '继续执行所选地区行动；效果、费用与解锁条件沿用地图规则。';
}

export function getOpeningMemorySummary(state: GameState): string[] {
  const records = getOpeningFieldwork(state);
  const opening = records.filter(e => e.chapter === 'mobilization');
  const areas = new Set(opening.map(e => ALL_SUB_TILES.find(t => t.id === e.tileId)?.buildingId).filter(Boolean)).size;
  const manual = records.reduce((sum, e) => sum + count(e.manual), 0);
  const teams = records.reduce((sum, e) => sum + count(e.workgroup), 0);
  const summary = records.length ? [
    ...(opening.length ? [`起义前联络与活动覆盖${areas}个建筑区。`] : []),
    `已记录地区行动：手动${manual}次、工作组${teams}次。`,
  ] : [];
  const settlement = getYangSettlement(state);
  if (settlement) summary.push(settlement === 'trial' ? '公审后：杨玉乐退出顾问名单，正统派扩大代表权。' : '妥协后：保留杨玉乐顾问资格，潘派与做题派扩大代表权。');
  return summary;
}

/** Freeze a small narrative echo when the original event is created, preserving its callbacks. */
export function snapshotOpeningEvent(state: GameState, event: GameEvent): GameEvent {
  if (event.openingEcho !== undefined) return event;
  let echo: string | undefined;
  if (event.id === 'event_7_smolny') {
    const records = getOpeningFieldwork(state).filter(e => e.chapter === 'mobilization');
    const b3 = records.some(e => e.actionId === 'b3_under');
    const clubs = records.some(e => e.actionId === 'aud_coop');
    if (b3) echo = FLAVOR_EVENTS.phase1_echo_handover.description;
    else if (clubs) echo = FLAVOR_EVENTS.phase1_echo_clubs.description;
  } else if (event.id === 'event_9_rectify_order') {
    const settlement = getYangSettlement(state);
    if (settlement === 'trial') echo = FLAVOR_EVENTS.committee_echo_trial.description;
    else if (settlement === 'compromise') echo = FLAVOR_EVENTS.committee_echo_compromise.description;
  }
  return echo ? { ...event, openingEcho: echo } : event;
}
