import { useEffect, useState } from 'react';
import type { GameState } from '../types';
import { campaignDay, isReminderDismissed, REMINDER_IGNORE_DAYS, type ActionReminder, type DismissedReminder, type ReminderKind } from '../engine/actionReminders';
import './actionReminders.css';

function ReminderIcon({kind}:{kind:ReminderKind}) {
  return <svg viewBox="0 0 48 48" aria-hidden="true" className="action-reminder__icon" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
    <path d="M5 38h38M8 41h32" stroke="#6e766e" strokeWidth=".6"/>
    {kind==='focus'&&<><path d="M14 35V9m0 1 21-3-4 9 4 6-21 3" fill="#54482e"/><path d="m19 13 10-2-3 5 3 3-10 2M9 35h12l3 3H6Z"/><circle cx="14" cy="7" r="2"/><path d="m28 28 2 4 5 .5-4 3 1 5-4-2.5-4 2.5 1-5-4-3 5-.5Z" fill="#af9762"/></>}
    {kind==='decision'&&<><path d="M13 7h23v29H13Z" fill="#26362f"/><path d="M10 11v28h23M17 13h15m-15 4h15m-15 4h9m-9 4h7M17 30h5"/><path d="m25 33 12-14 3 3-12 14-5 2Z" fill="#b6a170"/><path d="m35 22 3 3"/></>}
    {kind==='advisor'&&<><path d="M19 8q9-4 11 5v7l-5 5-6-5Z" fill="#59675f"/><path d="M17 14q6-6 14-1M20 24l-9 6-2 7h30l-2-7-8-6M20 25l5 6 4-6m-4 6v6m-10-8 3 6m16-6-3 6"/><path d="M7 9h7M10.5 5.5v7" stroke="#8cac98"/><path d="m34 8 2 3 4 .5-3 2 .8 4-3-2-3 2 .8-4-3-2 4-.5Z"/></>}
    {kind==='law'&&<><path d="M24 8v28m-8 2h16M13 14l22-2M11 16 6 29h12Zm24-2-5 13h12Z"/><path d="M6 29q6 7 12 0m12-2q6 7 12 0" fill="#414844"/><circle cx="24" cy="7" r="2"/><path d="M19 36h10l3 3H16Z" fill="#625842"/></>}
    {kind==='team'&&<><circle cx="24" cy="12" r="4" fill="#4e6c68"/><circle cx="11" cy="20" r="3"/><circle cx="37" cy="20" r="3"/><path d="M17 27v-6l4-4h6l4 4v6ZM5 32v-5l4-3h5l3 4v4m14 0v-4l3-4h5l4 3v5M24 28v6m-13-1v3h26v-3"/><path d="M19 34h10v5H19Z" fill="#587d78"/><path d="M21 36h6"/></>}
    {kind==='mechanic'&&<><path d="M24 6l15 9v17l-15 9-15-9V15Z" fill="#263642"/><path d="m9 15 15 9 15-9M24 24v17m-9-22 9-5 9 5m-16 8 7 4 7-4"/><circle cx="24" cy="14" r="3" fill="#9caeb1"/><path d="m17 35-3-7m20 0-3 7"/></>}
    {kind==='crisis'&&<><path d="M24 6 43 37H5Z" fill="#4d2925"/><path d="M24 15v12" strokeWidth="3"/><circle cx="24" cy="32" r="1.6" fill="currentColor"/><path d="M11 33h6m14 0h6"/></>}
    {kind==='papers'&&<><path d="M12 9h20l6 7v21H12Z" fill="#444338"/><path d="M32 9v8h6M8 13v28h24M17 21h16m-16 5h16m-16 5h8"/><path d="M31 29v7m0 3v1" stroke="#d59e77" strokeWidth="2"/></>}
    {kind==='stalled'&&<><path d="M11 9h26v29H11Z" fill="#333c3d"/><path d="M16 14h16m-16 4h8M17 24v9m5-9v9" strokeWidth="2.4"/><path d="M29 25l9 9m0-9-9 9" stroke="#c88d72"/><path d="M8 12v29h26"/></>}
  </svg>;
}

export default function ActionReminders({state,reminders,onOpen}:{key?:number;state:GameState;reminders:ActionReminder[];onOpen:(reminder:ActionReminder)=>void}) {
  const [dismissed,setDismissed]=useState<Partial<Record<ReminderKind,DismissedReminder>>>({});
  const [hovered,setHovered]=useState<ReminderKind|null>(null);
  const day=campaignDay(state.date);
  const presence=reminders.map(r=>r.id).join(',');
  useEffect(()=>{
    setHovered(null);
    setDismissed(prev=>Object.fromEntries((Object.entries(prev) as [ReminderKind,DismissedReminder][]).filter(([id,d])=>presence.split(',').includes(id)&&d.route===state.currentFocusTree&&d.until>day&&d.until<=day+REMINDER_IGNORE_DAYS)));
  },[presence,state.currentFocusTree,day]);
  const visible=reminders.filter(r=>!isReminderDismissed(r,dismissed[r.id],state));
  return <div className="action-reminders" data-tour="action-reminders" role="group" aria-label="当前可用操作" onMouseDown={e=>e.stopPropagation()} onWheel={e=>e.stopPropagation()}>
    {visible.map(r=><div className={`action-reminder action-reminder--${r.id}`} key={r.id} onMouseEnter={()=>setHovered(r.id)} onMouseLeave={()=>setHovered(null)}>
      <button aria-label={r.title} aria-describedby={hovered===r.id?`reminder-${r.id}`:undefined}
        onFocus={()=>setHovered(r.id)} onBlur={()=>setHovered(null)} onClick={()=>{setHovered(null);onOpen(r);}}
        onContextMenu={e=>{e.preventDefault();setHovered(null);setDismissed(prev=>({...prev,[r.id]:{keys:r.keys,route:state.currentFocusTree,until:day+REMINDER_IGNORE_DAYS}}));}}
        onKeyDown={e=>{if(e.key==='Delete'){e.preventDefault();setHovered(null);setDismissed(prev=>({...prev,[r.id]:{keys:r.keys,route:state.currentFocusTree,until:day+REMINDER_IGNORE_DAYS}}));}}}>
        <ReminderIcon kind={r.id}/><span className="action-reminder__count">{r.entries.length}</span>
      </button>
      {hovered===r.id&&<div className="action-reminder__tooltip" id={`reminder-${r.id}`} role="tooltip">
        <strong>{r.title}</strong><ul>{r.entries.slice(0,6).map(entry=><li key={entry}>{entry}</li>)}</ul>
        {r.entries.length>6&&<p>另有 {r.entries.length-6} 项</p>}<small>左键打开{r.id==='mechanic'?`「${r.entries[0]}」`:''} · 右键暂时忽略<br/>新选项出现或30个游戏日后恢复</small>
      </div>}
    </div>)}
  </div>;
}
