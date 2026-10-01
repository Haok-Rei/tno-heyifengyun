import { ALL_SUB_TILES, type GameState, type FocusNode, type Decision } from '../types';
import { hasFocusRequirements } from './gameLoop';
import { LAW_CATEGORIES, LAW_CHANGE_COST, getLawSystem } from '../data/laws';
import { getAvailableAdvisors, getAdvisorCost } from '../data/advisors';
import { getCommandState, getTeamCapacity } from './commandSystem';
import { availableMapActions } from './mapActions';

export type ReminderKind = 'focus' | 'decision' | 'advisor' | 'law' | 'team' | 'mechanic';
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
  const add = (id: ReminderKind, title: string, items: {id: string; label: string}[], target?: string) => {
    if (items.length) result.push({id,title,entries:items.map(x=>x.label),keys:items.map(x=>x.id).sort(),target});
  };
  if (!state.activeFocus) add('focus','可以选择国策',focuses.filter(n =>
    !state.completedFocuses.includes(n.id) && !n.isHidden?.(state) && hasFocusRequirements(n,state.completedFocuses)
    && !n.mutuallyExclusive?.some(id=>state.completedFocuses.includes(id)) && (!n.canStart || n.canStart(state))
  ).map(n=>({id:n.id,label:n.title})));
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
  // Heyi Light is an observation surface; actionable route mechanisms take priority.
  const available=mechanics.filter(m=>!m.active).sort((a,b)=>Number(a.id==='heyi-light')-Number(b.id==='heyi-light'));
  add('mechanic','特色机制可以进入',available.map(m=>({id:m.id,label:m.label})),available[0]?.id);
  return result;
}

export function isReminderDismissed(reminder: ActionReminder, dismissed: DismissedReminder | undefined, state: GameState): boolean {
  return !!dismissed && dismissed.route===state.currentFocusTree && campaignDay(state.date)<dismissed.until
    && reminder.keys.every(key=>dismissed.keys.includes(key));
}
