import React, { useState } from 'react';
import { Repeat2 } from 'lucide-react';
import type { GameState } from '../types';
import { assignRecurringAction, getCommandLinks, getCommandState, getOrderCadence, getTeamCapacity } from '../engine/commandSystem';
import { availableMapActions } from '../engine/mapActions';

export default function CommandPanel({ state, tileId, setGameState }: { state: GameState; tileId: string; setGameState: React.Dispatch<React.SetStateAction<GameState>> }) {
  const [interval, setInterval] = useState(4);
  const [selectedActionId, setSelectedActionId] = useState('');
  const actions = availableMapActions(state, tileId);
  const selected = actions.find(a => a.id === selectedActionId) || actions[0];
  const command = getCommandState(state);
  const free = command.teams.some((t, i) => i < getTeamCapacity(state) && !t.order);
  const local = command.teams.filter(t => t.order?.tileId === tileId);
  const links = getCommandLinks(state, local.find(t => t.order?.actionId === selected?.id)?.order?.repeats || 0, tileId, selected?.id);
  if (!actions.length && !local.length) return null;
  return <section className="field-command" aria-label="工作组定期任务">
    <div className="eyebrow"><Repeat2 size={13} /> 工作组 · 自动重复地区行动</div>
    <div className="command-summary" aria-label="路线筹备">
      <strong>{links.preparationUse} <b>{links.preparation}/6</b></strong>
      <span>{links.matched ? `执行一次 +${links.bonus}，供相关决议或小游戏使用` : '所选行动仅执行地图效果'}</span>
    </div>
    <details className="command-links">
      <summary>协同规则</summary>
      <span className={links.focusReady ? 'ready' : ''}>国策 {links.focusName}：{links.focusReady ? '已生效' : '待完成'}</span>
      <span className={links.lawReady ? 'ready' : ''}>法案 {links.lawName}：{links.lawReady ? '适配' : '尚未适配'}</span>
      <span className={links.decisionDays > 0 ? 'ready' : ''}>决议 {links.decisionName}：{links.decisionDays > 0 ? `加速期剩余 ${links.decisionDays} 天` : '可投入筹备'}</span>
      <span className={links.supplied ? 'ready' : ''}>地区补给：{links.supplied ? '已连通' : '未连通'}</span>
      <small>国策、法案和补给均就绪时，匹配行动额外筹备 +1。资源不足会自动暂缓；切换路线会撤回任务。</small>
    </details>
    <div className="pace-options" role="group" aria-label="执行间隔">
      {[2,4,7].map(n => <button key={n} aria-pressed={interval === n} className={interval === n ? 'selected' : ''} onClick={() => setInterval(n)}>每 {n} 天</button>)}
    </div>
    {local.map(team => <div className="deployed-note" key={team.id}><Repeat2 size={16} /><div><strong>{team.name}驻扎中</strong><p>{actions.find(a => a.id === team.order?.actionId)?.name || team.order?.actionId} · 已执行 {team.order?.repeats || 0} 次</p></div></div>)}
    {!!selected && <div className="recurring-picker">
      <label htmlFor={`recurring-action-${tileId}`}>驻点行动</label>
      <select id={`recurring-action-${tileId}`} value={selected.id} onChange={event => setSelectedActionId(event.target.value)} aria-label="工作组行动">
        {actions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      <p className="command-cost">每次 {selected.cost} · 实际间隔 {getOrderCadence(state,tileId,interval,0,selected.id)} 天</p>
      <p>{selected.description}</p>
      <button disabled={!free || !!local.find(t => t.order?.actionId === selected.id)} onClick={() => setGameState(s => assignRecurringAction(s, tileId, selected.id, interval))}><Repeat2 size={14} />派遣工作组</button>
    </div>}
    {!free && <p className="order-blocked">无空闲工作组，可在地图下方管理驻点任务。</p>}
  </section>;
}
