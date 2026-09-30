import { useId } from 'react';
import type { GameState } from '../types';
import HoverWindow from './HoverWindow';
import { getWuAttitude, WU_ATTITUDE_LABELS } from './WuCrackdownConsole';

const SHAPES = [
  'M7 44V20H15V12H25V5H39V12H49V20H57V44H7Z',
  'M32 5C44 18 39 22 47 17C63 42 47 57 32 57C12 57 3 39 20 22C19 34 27 34 32 5Z',
  'M6 20L19 8L32 20L45 8L58 20V43L45 56L32 43L19 56L6 43Z',
  'M5 56V46H13V35H21V24H27V8H37V24H43V35H51V46H59V56Z',
  'M16 56V44L7 33L13 27V22C13 0 51 0 51 24C51 37 43 42 40 44V56Z',
];
const DETAILS = ['M15 20H49M23 18V42M33 18V42M43 18V42M7 48H57', 'M31 29Q19 44 32 49Q43 42 35 36', 'M19 8V56M45 8V56M6 32H58M23 24L32 32L41 24', 'M5 46H59M13 35H51M21 24H43M32 8V56', 'M23 17Q32 10 41 19M22 26Q32 18 42 27M25 34Q33 28 40 33'];
type Metric = { name: string; value: number; max?: number; daily?: number; text: string; change?: string; color: string; display?: string };
export default function SituationMetrics({ state }: { state: GameState }) {
  const id = useId().replace(/:/g, '');
  const s = state.stats;
  const w = state.wuState;
  const metrics: Metric[] = w ? [
    { name: '残党实力', value: w.guerrillaStrength, text: '地下力量达到100时将发动总反攻。', change: '随学生愤怒与戒严等级变化', color: '#c37d70' },
    { name: '吴公态度', value: w.wuAmbition, display: WU_ATTITUDE_LABELS[getWuAttitude(w)], text: '态度由野心和信任共同决定；填充表示野心。', change: '随决议与剧情变化', color: '#c4ab7c' },
    { name: '戒严等级', value: w.martialLawLevel, max: 3, text: '更高戒严等级强化镇压，也会加剧学生愤怒和吴公野心。', change: '由戒严决议调整', color: '#b89b78' },
    { name: '学生愤怒', value: w.studentAnger, text: '影响地下力量增长与刺杀风险。', change: '随戒严、行动和事件变化', color: '#c8796c' },
    { name: '社会支持', value: w.teacherSupport, display: `舆论 ${Math.round(w.publicOpinion)} / 教师 ${Math.round(w.teacherSupport)}`, text: '填充表示教师支持；舆论压力达到80会每天降低0.2稳定度。', change: '随谈判、宣传与事件变化', color: '#91b9ae' },
  ] : [
    { name: '资本渗透', value: s.capitalPenetration, daily: state.modifiers.capitalPenetrationDaily, text: '外部资本对学校的控制程度，影响及第路线与改革行动。', color: '#b99677' },
    { name: '激进愤怒', value: s.radicalAnger, daily: state.modifiers.radicalAngerDaily, text: '激进学生的不满。超过80可解锁冲上B3教学楼等行动。', color: '#c6796e' },
    { name: '联盟团结', value: s.allianceUnity, daily: state.modifiers.allianceUnityDaily, text: '各学生派系的共识与协作程度，影响联盟国策和议会。', color: '#91bba4' },
    { name: '党内集权', value: s.partyCentralization, daily: state.modifiers.partyCentralizationDaily, text: '红蛤组织内部权力集中程度，影响路线分歧与改革成功率。', color: '#c2ab7a' },
    { name: '学生理智', value: s.studentSanity, daily: state.modifiers.studentSanityDaily, text: '学生保持判断与正常生活的能力；低于30时须留意特殊事件。', color: '#8db7c2' },
  ];
  return <section className="situation-metrics" data-tour="situation-metrics" aria-label="局势动态">
    <h2>局势动态 <small>SITUATION</small></h2>
    <div className="situation-metrics__row">{metrics.map((m, i) => {
      const percent = Math.max(0, Math.min(100, m.value / (m.max || 100) * 100));
      const clip = `${id}-metric-${i}`;
      return <HoverWindow key={m.name} width={270} estimateHeight={170} content={<div className="situation-metrics__tooltip"><strong style={{ color: m.color }}>{m.name} · {m.display || `${Math.round(m.value)}${m.max ? ' / ' + m.max : '%'}`}</strong><p>{m.text}</p><footer>每日变化 <b>{m.daily !== undefined ? `${m.daily >= 0 ? '+' : ''}${m.daily.toFixed(2)}` : m.change}</b></footer></div>}>
        <button type="button" className="situation-metrics__item" aria-label={`${m.name}：${m.display || Math.round(m.value)}`}>
          <svg viewBox="0 0 64 64" aria-hidden="true"><defs><clipPath id={clip}><path d={SHAPES[i]} /></clipPath></defs><path d={SHAPES[i]} fill="#0a1216" stroke="#596a6e" strokeWidth="1.3" /><g clipPath={`url(#${clip})`}><rect className="situation-metrics__fill" x="0" y={58 - percent * .54} width="64" height={percent * .54} fill={m.color} opacity=".68" /><path d={`M0 ${58 - percent * .54}H64`} stroke={m.color} strokeWidth="1.4" /></g><path d={DETAILS[i]} stroke="#e3dbba" strokeWidth="1.2" fill="none" opacity=".85" /><path d={SHAPES[i]} fill="none" stroke={m.color} strokeWidth="1.2" /></svg>
          <span>{m.name}</span>
        </button>
      </HoverWindow>;
    })}</div>
  </section>;
}
