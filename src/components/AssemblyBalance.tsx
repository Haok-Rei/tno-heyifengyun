import type { GameState } from '../types';
import { CROSSROADS_RULES, CROSSROADS_LABELS, getCrossroadsOutcome } from '../engine/assemblyPolitics';

export default function AssemblyBalance({ state }: { state: GameState }) {
  const central = Math.max(0, Math.min(100, state.stats.partyCentralization));
  const unity = Math.max(0, Math.min(100, state.stats.allianceUnity));
  const fractured = central > 90 && unity < 25;
  return <section className={`assembly-balance ${fractured ? 'is-fractured' : ''}`} aria-label="集权与团结">
    <header><span>指挥与共识</span><small>{fractured ? '联盟濒临瓦解' : unity >= 55 && central > 60 ? '集中指挥 · 同盟尚存' : '共同的事业，不同的授权'}</small></header>
    <svg viewBox="0 0 380 150" role="img" aria-label={`党内集权${central.toFixed(1)}，联盟团结${unity.toFixed(1)}；两项独立数值`}>
      <defs><linearGradient id="assembly-coupling"><stop stopColor="#bb8471"/><stop offset=".5" stopColor="#b7ad82"/><stop offset="1" stopColor="#7faea9"/></linearGradient></defs>
      <path d="M133 72H247M139 80H241" stroke="url(#assembly-coupling)" strokeWidth="1" fill="none"/>
      <path d="M178 60H202L212 76L202 92H178L168 76Z" fill="#141b1b" stroke="#7d7a60"/>
      <text x="190" y="73" className="assembly-balance__joint">共同</text><text x="190" y="86" className="assembly-balance__joint">执行</text>
      {[{x:88,value:central,color:'#c58a78',label:'党内集权',sub:'命令能否集中'}, {x:292,value:unity,color:'#8bbcb3',label:'联盟团结',sub:'各派是否愿意合作'}].map(d=><g key={d.label}>
        <circle cx={d.x} cy="76" r="45" fill="#0b1012" stroke="#344144"/>
        {Array.from({length:21},(_,i)=>{const a=(135+i*13.5)*Math.PI/180;return <line key={i} x1={d.x+Math.cos(a)*42} y1={76+Math.sin(a)*42} x2={d.x+Math.cos(a)*(i%5===0?37:40)} y2={76+Math.sin(a)*(i%5===0?37:40)} stroke="#71817c" strokeWidth=".7"/>;})}
        <circle cx={d.x} cy="76" r="32" fill="none" stroke="#252f31" strokeWidth="4"/>
        <circle cx={d.x} cy="76" r="32" fill="none" stroke={d.color} strokeWidth="4" strokeDasharray={`${d.value*2.0106} 201.06`} transform={`rotate(-90 ${d.x} 76)`}/>
        <text x={d.x} y="20" fill={d.color} className="assembly-balance__label">{d.label}</text>
        <text x={d.x} y="82" fill={d.color} className="assembly-balance__value">{d.value.toFixed(1)}</text>
        <text x={d.x} y="139" className="assembly-balance__sub">{d.sub}</text>
      </g>)}
    </svg>
    <p className="assembly-balance__relation">压制通常加强集权、削弱团结；招揽与妥协通常相反。两者独立变化，集中指挥也需要同盟支持。</p>
    {state.currentFocusTree === 'treeA' && <details className="assembly-balance__forecast">
      <summary>十字路口预判：<strong>{CROSSROADS_LABELS[getCrossroadsOutcome(state)]}</strong></summary>
      <p>完成国策后确认事件，才按届时数值分流；现在仍可通过大会、国策和地区工作调整。</p>
      <ul>{CROSSROADS_RULES.map(rule=><li key={rule}>{rule}</li>)}</ul>
    </details>}
    {state.currentFocusTree !== 'treeA' && <p className="assembly-balance__relation">集权超过90且团结低于25，将触发联盟瓦解危机。高数值不等于无条件有利。</p>}
  </section>;
}
