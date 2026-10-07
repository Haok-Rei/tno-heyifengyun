import { ALL_SUB_TILES, type GameState, type FocusNode, type Decision } from '../types';
import { hasFocusRequirements } from './gameLoop';
import { LAW_CATEGORIES, LAW_CHANGE_COST, getLawSystem } from '../data/laws';
import { getAvailableAdvisors, getAdvisorCost } from '../data/advisors';
import { getCommandState, getTeamCapacity } from './commandSystem';
import { availableMapActions } from './mapActions';
import { getPaperUpkeep } from './campaignStats';
import { getHeyiSceneChanges } from './heyiLight';
import { getChapterBrief } from './openingCampaign';

export type ReminderKind = 'focus' | 'decision' | 'advisor' | 'law' | 'team' | 'mechanic' | 'crisis' | 'papers' | 'stalled' | 'heyi';
export const REMINDER_IGNORE_DAYS = 30;
export interface ActionReminder {
  id: ReminderKind;
  title: string;
  entries: string[];
  keys: string[];
  target?: string;
}
export interface MechanicEntry { id: string; label: string; active: boolean }
export interface DismissedReminder { keys: string[]; until: number; route: string }
export const campaignDay = (date: Date) => Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);

/** Selectors share eligibility rules with the actual controls. They never execute an action. */
export function getActionReminders(state: GameState, focuses: FocusNode[], decisions: Decision[], mechanics: MechanicEntry[]): ActionReminder[] {
  if (state.gameEnding || state.stats.pp < 0) return [];
  const result: ActionReminder[] = [];
  const sceneChange = getHeyiSceneChanges(state);
  if (sceneChange) result.push({ id: 'heyi', title: '合一之光 · 校园景象有变化', entries: sceneChange.entries, keys: [sceneChange.key], target: 'heyi-light' });
  const add = (id: ReminderKind, title: string, items: {id: string; label: string}[], target?: string) => {
    if (items.length) result.push({id,title,entries:items.map(x=>x.label),keys:items.map(x=>x.id).sort(),target});
  };
  add('crisis','危机即将到期',(state.crises || []).filter(c=>c.daysLeft<=10)
    .sort((a,b)=>a.daysLeft-b.daysLeft).map(c=>({id:c.id,label:`${c.title} · 剩余${c.daysLeft}天`})));
  if (state.stats.tpr < getPaperUpkeep(state)*7) add('papers','试卷库存偏低',
    [{id:'paper-stock-low',label:`现有${Math.floor(state.stats.tpr)}份；每日基础消耗约${Math.ceil(getPaperUpkeep(state))}份，请检查考试与教育法案。`}]);
  if (!state.activeFocus) add('focus','可以选择国策',focuses.filter(n =>
    !state.completedFocuses.includes(n.id) && !n.isHidden?.(state) && hasFocusRequirements(n,state.completedFocuses)
    && !n.mutuallyExclusive?.some(id=>state.completedFocuses.includes(id)) && (!n.canStart || n.canStart(state))
  ).map(n=>({id:n.id,label:n.title})));
  const chapter = getChapterBrief(state);
  const focusReminder = result.find(reminder => reminder.id === 'focus');
  if (chapter && focusReminder) focusReminder.entries.unshift(chapter.goal);
  add('decision','可以执行决议',decisions.filter(d => !d.id.startsWith('debug_')
    && (!d.isVisible || d.isVisible(state)) && (state.decisionCooldowns[d.id]||0)<=0
    && state.stats.pp>=d.costPP && (!d.canAfford || d.canAfford(state))
  ).map(d=>({id:d.id,label:d.title})));
  if (state.advisors.some(a=>!a)) add('advisor','内阁有空缺',getAvailableAdvisors(state)
    .filter(a=>state.stats.pp>=getAdvisorCost(state,a)).map(a=>({id:a.id,label:`${a.name} · ${getAdvisorCost(state,a)} PP`})));
  const laws=getLawSystem(state.lawSystem);
  if (state.stats.pp>=LAW_CHANGE_COST) add('law','可以调整法案',LAW_CATEGORIES.filter(c=>c.levels.some(l=>l!==laws[c.id]))
    .map(c=>({id:c.id,label:`${c.name} · ${LAW_CHANGE_COST} PP`})));
  const command=getCommandState(state);
  const idle=command.teams.filter((t,i)=>i<getTeamCapacity(state)&&!t.order).length;
  const tile=ALL_SUB_TILES.find(t=>availableMapActions(state,t.id).some(a=>!command.teams.some(team=>team.order?.tileId===t.id&&team.order.actionId===a.id)));
  if (idle && tile) add('team',`${idle}支工作组待命`,[{id:tile.id,label:`${tile.name}：可安排定期地区行动`}],tile.id);
  const stalled=command.teams.filter(t=>{
    const order=t.order;
    if (!order || order.reformRegion) return false;
    const action=availableMapActions(state,order.tileId).find(a=>a.id===order.actionId);
    return !!action && command.reports.some(report=>
      report.tileId===order.tileId&&report.title===`${action.name} · 暂缓`
      && campaignDay(new Date(report.date))>=campaignDay(state.date)-1
      && !command.reports.some(done=>done.tileId===report.tileId&&done.date>=report.date&&done.title.startsWith(`${action.name} · 第`)));
  });
  if (stalled.length) add('stalled','工作组任务暂缓',stalled.map(t=>({id:t.id,label:`${t.name}：检查资源与地区行动条件`})),stalled[0].order!.tileId);
  // Persistent scenery is never a pending action.
  const available=mechanics.filter(m=>m.id!=='heyi-light'&&!m.active);
  add('mechanic','特色机制可以进入',available.map(m=>({id:m.id,label:m.label})),available[0]?.id);
  return result;
}

export function isReminderDismissed(reminder: ActionReminder, dismissed: DismissedReminder | undefined, state: GameState): boolean {
  return !!dismissed && dismissed.route===state.currentFocusTree && campaignDay(state.date)<dismissed.until
    && reminder.keys.every(key=>dismissed.keys.includes(key));
}
