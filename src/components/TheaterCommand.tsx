import React from 'react';
import { ChevronRight, MapPin, Radio, X } from 'lucide-react';
import { ALL_SUB_TILES, GameState } from '../types';
import { getCommandRoute } from '../data/commandRoutes';
import { cancelOrder, getCommandState, getTeamCapacity } from '../engine/commandSystem';
import { availableMapActions } from '../engine/mapActions';

export function CommandLedger({ state, setGameState, onLocate }: { state: GameState; setGameState: React.Dispatch<React.SetStateAction<GameState>>; onLocate: (tile: string) => void }) {
  const command = getCommandState(state);
  const route = getCommandRoute(state);
  const preparation = command.preparation?.[route.id] || 0;
  const today = Math.floor(Date.UTC(state.date.getFullYear(),state.date.getMonth(),state.date.getDate())/86400000);
  return <section className="command-ledger" aria-label="战区工作组与战报">
    <div className="team-strip"><div className="team-strip-title"><Radio size={16} /><strong>战区指挥</strong><small>{state.activeEvent || state.activeSuperEvent || state.activeMinigame ? '等待事件处理' : state.isPaused ? '时间暂停' : '行动推进中'}</small>{preparation > 0 && <small className="field-preparation">地区筹备 {preparation}/6</small>}</div>
      {command.teams.filter((team, index) => index < getTeamCapacity(state) || team.order).map(team => <div className="team-slot" key={team.id}>
        <button className="team-main" onClick={() => team.order && onLocate(team.order.tileId)} disabled={!team.order}>
          <span><b>{team.name}</b><small>{team.order ? team.order.reformRegion ? `${team.order.remaining ?? '?'} 天` : `${Math.max(0,team.order.nextRunDay-today)} 天后 · ${team.order.repeats} 次` : '待命'}</small></span>
          <p>{team.order ? `${ALL_SUB_TILES.find(t => t.id === team.order!.tileId)?.name} · ${team.order.reformRegion ? '题改委员会任务' : availableMapActions(state, team.order.tileId).find(a => a.id === team.order?.actionId)?.name || team.order.actionId}` : '点击地图地区 → 派遣定期任务'}</p>
          <div className="command-progress"><i style={{ width: `${team.order ? team.order.reformRegion ? Math.max(8,100-(team.order.remaining || 0)*7) : Math.max(8,100-Math.max(0,team.order.nextRunDay-today)/Math.max(1,team.order.interval)*100) : 0}%`, background: route.color }} /></div>
        </button>
        {team.order && !team.order.reformRegion && <button className="cancel-order" title="撤回定期任务" aria-label={`撤回${team.name}`} onClick={() => setGameState(s => cancelOrder(s, team.id))}><X size={13} /></button>}
      </div>)}
      <div className="dispatch-voice">{route.voice}</div>
    </div>
    <details className="command-reports"><summary><span>行动电报 <b>{command.completed}</b></span><span>{command.reports[0]?.title || '工作组按设定间隔重复执行原有地图行动。'}</span><ChevronRight size={13} /></summary>
      <div className="report-list">{!command.reports.length && <p>工作组完成行动后，电报会显示在这里。</p>}{command.reports.map(report => <article key={report.id}><div><time>{new Date(report.date).toLocaleDateString('zh-CN')}</time><button onClick={() => onLocate(report.tileId)}><MapPin size={12} />{report.title}</button></div><p>{report.text}</p><small>{report.outcome}</small></article>)}</div>
    </details>
  </section>;
}
