import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { UserPlus, Scale } from 'lucide-react';
import { GameState, Advisor } from '../types';
import { getAdvisorPortraitUrl, getLeaderPortraitUrl } from '../config/assets';
import { getFocusNodes } from './FocusTree';
import { formatModifierEntry } from '../engine/gameLoop';
import { LAWS, LAW_CATEGORIES, getLawSystem, LAW_CHANGE_COST } from '../data/laws';
import HoverWindow from './HoverWindow';
import { FocusArt, SpiritArt, LawArt } from './StrategicArt';
import { FACTION_COLORS, getFactionDossier } from '../data/factionDossiers';
import CharacterProfile from './CharacterProfile';
import { getAdvisorProfile, getLeaderTraits } from '../data/characterProfiles';

interface LeftSidebarProps {
  state: GameState;
  hireAdvisor: (slotIndex: number, advisor: Advisor) => void;
  dismissAdvisor: (slotIndex: number) => void;
  cancelActiveFocus: () => void;
  onOpenFocus: () => void;
  triggerError: () => void;
  /** v8.11 切换校内法案（App 内扣除150 PP） */
  changeLaw: (categoryId: 'discipline' | 'schedule' | 'personnel' | 'education', levelId: string) => void;
}

/** 铁腕时代专属：吴福军自动受聘的加强版顾问 (v8.6.1) */
export const WU_ROUTE_ADVISOR: Advisor = {
  id: 'wu_fujun',
  title: '戒严总指挥',
  name: '吴福军',
  description: '吴福军以戒严总指挥的身份掌管整个校园的巡查与纪律体系。雷厉风行的整顿能迅速恢复秩序，代价则由学生承担。',
  cost: 0,
  modifiers: { stabDaily: 0.4, ssDaily: -0.4, radicalAngerDaily: -0.3, ppDaily: 0.3 }
};

const AVAILABLE_ADVISORS: Advisor[] = [
  {
    id: 'zhou_chen',
    title: '陈栋时代遗老',
    name: '周晨',
    description: '每日权力平衡 -0.05，每日学生理智度 +2，每日研发质量 +0.5。',
    cost: 25,
    modifiers: { powerBalanceDaily: -0.05, studentSanityDaily: 2, rndQualityDaily: 0.5 }
  },
  {
    id: 'li_jingkai',
    title: '及第资本合伙人',
    name: '李竞凯',
    description: '每日GDP增长 +3%，每日政治点数 +0.2。',
    cost: 150,
    modifiers: { gdpGrowthDaily: 0.03, ppDaily: 0.2 }
  },
  {
    id: 'you_guanglei',
    title: '陈栋的副手',
    name: '尤光雷',
    description: '每日政治点数 +0.5，每日学生理智度 +0.25。',
    cost: 25,
    modifiers: { ppDaily: 0.5, studentSanityDaily: 0.25 }
  },
  {
    id: 'wu_fujun',
    title: '教务督导',
    name: '吴福军',
    description: '每日稳定度 +0.2%，学生支持度 -0.2%。',
    cost: 150,
    modifiers: { stabDaily: 0.2, ssDaily: -0.2 }
  },
  {
    id: 'yang_yule',
    title: '特级教师',
    name: '杨玉乐',
    description: '政治点数获取 +5%，卷子储备每日 +2。',
    cost: 150,
    modifiers: { ppDaily: 0.05, tprDaily: 2 }
  },
  {
    id: 'jiang_haobang',
    title: '意识形态教员',
    name: '豪邦',
    description: '每日联盟团结度 +0.05%，每周先锋党员 +1，自社派每周忠诚度 +5。',
    cost: 100,
    modifiers: { allianceUnityDaily: 0.05 }
  },
  {
    id: 'wang_juanhao_vanguard',
    title: '红色先锋',
    name: '王卷豪',
    description: '每日试卷储备量 +5，B3教学楼所有任务成功率固定 +30%。',
    cost: 100,
    modifiers: { tprDaily: 5 }
  },
  {
    id: 'wang_zhaokai_advisor',
    title: '联合革命委员会主席',
    name: '王照凯',
    description: '每日激进愤怒度 +0.1，每日党内集权度 +0.2，每日学生支持度 +0.2%。',
    cost: 150,
    modifiers: { radicalAngerDaily: 0.1, partyCentralizationDaily: 0.2, ssDaily: 0.2 }
  },
  {
    id: 'gouxiong_advisor',
    title: '二次元解构大师',
    name: '狗熊',
    description: '解锁狗熊线，每日稳定度 -0.2%，每日学生理智值 -0.5%。',
    cost: 150,
    modifiers: { stabDaily: -0.2, studentSanityDaily: -0.5 }
  },
  {
    id: 'jing_zhen',
    title: '胆小的自由派老师',
    name: '靖珍',
    description: '学生支持度 +0.3%，每日稳定度 -0.1%。',
    cost: 120,
    modifiers: { ssDaily: 0.3, stabDaily: -0.1 }
  },
  {
    id: 'zhang_chun',
    title: '年级部老好人',
    name: '张春',
    description: '每日稳定度 +0.05%，政治点数获取 +2%。',
    cost: 100,
    modifiers: { stabDaily: 0.05, ppDaily: 0.02 }
  },
  {
    id: 'feng_anbao_advisor',
    title: '及第教育顾问',
    name: '封安宝',
    description: '每日稳定度 +0.1%，每日资本渗透度 +0.5%。',
    cost: 150,
    modifiers: { stabDaily: 0.1, capitalPenetrationDaily: 0.5 }
  },
  {
    id: 'jidi_ceo',
    title: '小企业投资人',
    name: '方田',
    description: '每日GDP增长 +2%，每日学生理智度 -1。',
    cost: 150,
    modifiers: { gdpGrowthDaily: 0.02, studentSanityDaily: -1 }
  },
  {
    id: 'hitachi_expert',
    title: '日立管理学专家',
    name: '刘守强',
    description: '每日做题家产出 +50，每日稳定度 +0.1%。',
    cost: 150,
    modifiers: { tprDaily: 50, stabDaily: 0.1 }
  },
  {
    id: 'data_analyst',
    title: '首席数据分析师',
    name: '盛为民',
    description: '每日研发质量 +1，每日政治点数 +0.5。',
    cost: 150,
    modifiers: { rndQualityDaily: 1, ppDaily: 0.5 }
  },
  {
    id: 'lu_bohan',
    title: '极权反做题派',
    name: '吕波汉',
    description: '每日稳定度 -0.1，每日做题家产出 -10，每日政治点数 +0.5，极权派每周忠诚度 +3、每周执行力 +3。',
    cost: 150,
    modifiers: { stabDaily: -0.1, tprDaily: -10, ppDaily: 0.5 }
  },
  {
    id: 'shi_ji',
    title: '去中心化安人',
    name: '时纪',
    description: '每日稳定度 -0.3，每日政治点数 +0.3，每日联盟团结度 +0.3，安那其派每周忠诚度 +4。',
    cost: 150,
    modifiers: { stabDaily: -0.3, ppDaily: 0.3, allianceUnityDaily: 0.3 }
  },
  {
    id: 'zhou_hongbing',
    title: '真左哲人王',
    name: '周红兵',
    description: '每日政治点数 -0.2，每日学生理智度 -0.2，每日做题家产出 +15，网哲派每周忠诚度 +3、每周执行力 -1。',
    cost: 150,
    modifiers: { ppDaily: -0.2, studentSanityDaily: -0.2, tprDaily: 15 }
  }
];

export default function LeftSidebar({ state, hireAdvisor, dismissAdvisor, cancelActiveFocus, onOpenFocus, triggerError, changeLaw }: LeftSidebarProps) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [lawCategory, setLawCategory] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [lawBounds, setLawBounds] = useState<React.CSSProperties>({});

  const getAdvisorCost = (advisor: Advisor) => {
    // v8.11 人事法案影响雇佣费用
    const laws = getLawSystem(state.lawSystem);
    const mult = LAWS[laws.personnel]?.advisorCostMult ?? 1;
    let cost = Math.round(advisor.cost * mult);
    if (state.flags.yang_yule_cheap_advisors && state.leader.name === '杨玉乐') {
      cost = Math.floor(cost / 2);
    }
    return cost;
  };

  const handleHire = (advisor: Advisor) => {
    if (selectedSlot === null) return;
    const cost = getAdvisorCost(advisor);
    if (state.stats.pp < cost) {
      triggerError();
      return;
    }
    hireAdvisor(selectedSlot, { ...advisor, cost });
    setSelectedSlot(null);
  };

  const totalIdeology = Object.values(state.ideologies).reduce((a, b) => a + Math.max(0, b), 0);
  let currentAngle = 0;
  const pieSegments = Object.entries(state.ideologies).sort((a, b) => b[1] - a[1]).map(([key, value]) => {
    const percentage = totalIdeology > 0 ? (Math.max(0, value) / totalIdeology) * 100 : 0;
    const startAngle = currentAngle;
    currentAngle += percentage;
    return { key, percentage, startAngle, color: FACTION_COLORS[key] ?? '#a1a1aa', dossier: getFactionDossier(state, key) };
  });

  const conicGradient = totalIdeology > 0 ? `conic-gradient(${pieSegments.map(s => `${s.color} ${s.startAngle}% ${s.startAngle + s.percentage}%`).join(', ')})` : '#394144';
  const leadingFaction = pieSegments[0];
  const activeFocusNode = getFocusNodes(state.currentFocusTree).find(node => node.id === state.activeFocus?.id);

  return (
    <div ref={panelRef} className="nation-panel flex-shrink-0 tno-panel border-r border-tno-border h-full flex flex-col relative z-40 overflow-y-auto">
      <div className="nation-overview" data-tour="nation-overview">
      <div className="nation-leader-section">
        <HoverWindow
          width={240}
          estimateHeight={280}
          placement="right"
          content={
            <CharacterProfile name={state.leader.name} title={state.leader.title} description={state.leader.description} traits={getLeaderTraits(state.leader.buffs)} />
          }
        >
          <div className="nation-leader-identity cursor-help">
            <div className="nation-leader-portrait border-2 border-tno-border relative overflow-hidden bg-zinc-900 flex-shrink-0">
               <div className="absolute inset-0 bg-cover bg-center opacity-88" style={{ backgroundImage: `url('${getLeaderPortraitUrl(state.leader.portrait)}')` }}></div>
               <div className="absolute inset-0 bg-black/8"></div>
            </div>
            <div className="nation-leader-name border border-tno-border bg-black/70 text-center font-bold text-tno-highlight">
              {state.leader.name}
            </div>
          </div>
        </HoverWindow>

      </div>

      <div className="nation-ideology-section">
        <div className="nation-ideology-heading"><span>意识形态分布</span><small>校内势力</small></div>
        <div className="nation-ideology-layout">
          <div className="nation-ideology-chart" role="img" aria-label={`意识形态分布；最大派系为${leadingFaction?.dossier.name ?? '未知'}，占${leadingFaction?.percentage.toFixed(0) ?? 0}%`}>
            <div className="nation-ideology-ring" style={{ background: conicGradient }} />
          </div>
          <div className="nation-ideology-lead"><span>最大势力</span><strong>{leadingFaction?.dossier.name ?? '未知'}</strong><em>{leadingFaction?.percentage.toFixed(0) ?? 0}%</em></div>
        </div>
        <div className="nation-ideology-list">
            {pieSegments.map(s => (
              <HoverWindow
                key={s.key}
                width={310}
                estimateHeight={250}
                placement="right"
                content={
                  <div className="nation-faction-dossier" style={{ '--faction-accent': s.color } as React.CSSProperties}>
                    <div className="nation-faction-dossier-heading"><strong>{s.dossier.name}</strong><span>{s.dossier.period}</span></div>
                    <div className="nation-faction-dossier-leader">
                      <img src={s.dossier.portraitDomain === 'advisor' ? getAdvisorPortraitUrl(s.dossier.portrait, s.dossier.portrait) : getLeaderPortraitUrl(s.dossier.portrait)} alt="" loading="lazy" />
                      <div><small>当前领导人</small><strong>{s.dossier.leader}</strong><span>{s.dossier.role}</span></div>
                    </div>
                    <p>{s.dossier.description}</p>
                    <div className="nation-faction-dossier-situation"><span>当前处境</span>{s.dossier.situation}</div>
                  </div>
                }
              >
                <div className="nation-faction-row" style={{ '--faction-accent': s.color, '--faction-share': `${s.percentage}%` } as React.CSSProperties}>
                  <span className="nation-faction-swatch" />
                  <span className="nation-faction-name">{s.dossier.name}</span>
                  <strong>{s.percentage.toFixed(0)}%</strong>
                </div>
              </HoverWindow>
            ))}
        </div>
      </div>
      </div>

      {/* National Spirits（v8.11.2：法案动态精神不在此显示，见校内法案区） */}
      <div className="nation-module nation-module--spirits p-3 border-b border-tno-border">
        <div className="nation-module-heading text-xs text-tno-text/60 mb-1.5 uppercase tracking-widest">国家精神</div>
        <div className="flex flex-wrap gap-1.5">
          {state.nationalSpirits
            .filter(spirit => !spirit.id.startsWith('law_spirit_'))
            .map(spirit => (
              <HoverWindow
                key={spirit.id}
                width={260}
                estimateHeight={220}
                content={
                  <div className="bg-tno-panel border border-tno-border p-3 shadow-lg shadow-black/60">
                    <div className="flex items-center gap-2 mb-2 border-b border-tno-border/50 pb-2">
                      <SpiritArt spirit={spirit} />
                      <div className={`min-w-0 flex-1 font-bold text-sm ${spirit.type === 'positive' ? 'text-tno-green' : spirit.type === 'negative' ? 'text-tno-red' : 'text-tno-highlight'}`}>{spirit.name}</div>
                      <span className={`text-[9px] font-bold ${spirit.type === 'positive' ? 'text-tno-green/70' : spirit.type === 'negative' ? 'text-tno-red/70' : 'text-tno-highlight/70'}`}>
                        {spirit.type === 'positive' ? '正面' : spirit.type === 'negative' ? '负面' : '中性'}
                      </span>
                    </div>
                    <div className="text-xs text-tno-text/85 leading-relaxed mb-1.5">{spirit.description}</div>
                    {spirit.effects && (
                      <div className="text-[11px] space-y-0.5 border-t border-tno-border/40 pt-1.5">
                        {Object.entries(spirit.effects).map(([effectKey, val]) => {
                          const fmt = formatModifierEntry(effectKey, val as number);
                          return (
                            <div key={effectKey} className="flex justify-between">
                              <span className="text-tno-text/70">{fmt.label}</span>
                              <span className={fmt.positive ? 'text-tno-green' : 'text-tno-red'}>{fmt.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                }
              >
                <div className="nation-spirit-icon" aria-label={`国家精神：${spirit.name}`}><SpiritArt spirit={spirit} /></div>
              </HoverWindow>
            ))}
        </div>
      </div>

      {/* Current Focus */}
      <div className="nation-module nation-module--focus p-3 border-b border-tno-border" data-tour="nation-focus">
        <div className="nation-module-heading flex items-center justify-between mb-1.5"><span className="text-xs text-tno-text/60 uppercase tracking-widest">当前国策</span></div>
        <div className="space-y-2">
          <button onClick={onOpenFocus} aria-label="打开国策树" className="nation-focus-card w-full border border-tno-border bg-zinc-900/50 p-3 flex items-center gap-3 text-left">
            <FocusArt node={activeFocusNode ?? { id: 'campus', title: '未选择国策' }} compact />
            <div className="flex-1 overflow-hidden">
              {state.activeFocus ? (
                <>
                  <div className="text-sm font-bold text-tno-highlight truncate">
                    {activeFocusNode?.title ?? state.activeFocus.id}
                  </div>
                  <div className="w-full bg-black h-1.5 mt-2 border border-tno-border">
                    <div
                      className="bg-tno-highlight h-full transition-all duration-1000"
                      style={{ width: `${((state.activeFocus.totalDays - state.activeFocus.daysLeft) / state.activeFocus.totalDays) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-right mt-1">{state.activeFocus.daysLeft} 天</div>
                </>
              ) : (
                <div className="text-sm text-tno-text/60 italic">未选择国策</div>
              )}
            </div>
          </button>
          {state.activeFocus && (
            <button
              onClick={cancelActiveFocus}
              className="w-full border border-tno-red bg-tno-red/10 hover:bg-tno-red/20 text-tno-red px-3 py-1.5 text-xs font-bold tracking-wider transition-colors"
            >
              取消当前国策
            </button>
          )}
        </div>
      </div>

      {/* Cabinet（横排四格）v8.11 */}
      <div className="nation-module nation-module--cabinet p-3 border-b border-tno-border" data-tour="nation-cabinet">
        <div className="nation-module-heading text-xs text-tno-text/60 mb-1.5 uppercase tracking-widest">内阁与顾问</div>
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 1, 2, 3].map((slotIndex) => {
            const advisor = state.advisors[slotIndex];
            return advisor ? (
              <HoverWindow
                key={slotIndex}
                width={240}
                estimateHeight={260}
                content={
                  <CharacterProfile name={advisor.name} title={advisor.title} {...getAdvisorProfile(advisor)} />
                }
              >
                <div className="nation-advisor-card relative group cursor-help border border-tno-border bg-tno-bg">
                  <div className="nation-advisor-card__image"><img src={getAdvisorPortraitUrl(advisor.portrait, advisor.id)} alt={advisor.name} loading="lazy" /></div>
                  <div className="nation-advisor-card__name">{advisor.name}</div>
                  <button
                    onClick={() => dismissAdvisor(slotIndex)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black border border-tno-red text-tno-red text-[9px] leading-none opacity-0 group-hover:opacity-100 hover:bg-tno-red/30 transition-opacity"
                    title="撤销任命"
                  >
                    ✕
                  </button>
                </div>
              </HoverWindow>
            ) : (
              <button
                key={slotIndex}
                onClick={() => setSelectedSlot(slotIndex)}
                className="nation-advisor-empty border border-dashed border-tno-border flex flex-col items-center justify-center text-tno-text/40 hover:text-tno-highlight hover:border-tno-highlight transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5 mb-1" />
                <span className="text-[9px]">任命</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 校内法案 v8.11：紧凑行 + 二级切换面板 */}
      <div className="nation-module nation-module--laws p-3" data-tour="nation-laws">
        <div className="nation-module-heading flex justify-between items-center mb-2">
          <div className="text-xs text-tno-text/60 uppercase tracking-widest flex items-center gap-1">
            <Scale className="w-3 h-3" /> 校内法案
          </div>
          <div className="text-[9px] text-tno-text/50">切换 {LAW_CHANGE_COST} PP</div>
        </div>
        <div className="space-y-1.5">
          {LAW_CATEGORIES.map(cat => {
            const cur = getLawSystem(state.lawSystem);
            const law = LAWS[cur[cat.id]];
            return (
              <HoverWindow
                key={cat.id}
                width={260}
                estimateHeight={240}
                content={
                  !lawCategory && law ? (
                    <div className="bg-tno-panel border border-tno-border p-3 shadow-lg shadow-black/60">
                      <div className="font-bold text-xs mb-1 text-tno-text">{cat.name}：{law.name}</div>
                      <div className="text-[10px] text-tno-text/80 leading-relaxed mb-1.5">{law.flavor}</div>
                      <div className="text-[10px] space-y-0.5 border-t border-tno-border/40 pt-1.5">
                        {Object.entries(law.effects).map(([k, v]) => {
                          const fmt = formatModifierEntry(k, v as number);
                          return (
                            <div key={k} className="flex justify-between">
                              <span className="text-tno-text/70">{fmt.label}</span>
                              <span className={fmt.positive ? 'text-tno-green' : 'text-tno-red'}>{fmt.text}</span>
                            </div>
                          );
                        })}
                        {law.advisorCostMult && law.advisorCostMult !== 1 && (
                          <div className="flex justify-between">
                            <span className="text-tno-text/70">顾问雇佣费用</span>
                            <span className={law.advisorCostMult < 1 ? 'text-tno-green' : 'text-tno-red'}>
                              {law.advisorCostMult < 1 ? `-${Math.round((1 - law.advisorCostMult) * 100)}%` : `+${Math.round((law.advisorCostMult - 1) * 100)}%`}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-1.5 text-[9px] text-zinc-500">点击法案类别进入切换面板</div>
                    </div>
                  ) : null
                }
              >
                <button
                  onClick={() => {
                    const rect = panelRef.current?.getBoundingClientRect();
                    if (rect) setLawBounds({top: rect.top, left: rect.left, width: rect.width, height: rect.height});
                    setLawCategory(cat.id);
                  }}
                  className="w-full flex items-center justify-between border border-tno-border/60 bg-tno-bg/60 px-2.5 py-1 hover:border-tno-highlight hover:bg-zinc-900 transition-colors text-left"
                >
                  <span className="flex items-center gap-2 min-w-0"><LawArt id={law?.id ?? cur[cat.id]} /><span className="text-[11px] font-bold text-tno-text/90">{cat.name}</span></span>
                  <span className="flex items-center gap-1">
                    <span className="text-[10px] text-tno-highlight">{law?.name ?? cur[cat.id]}</span>
                    <span className="text-zinc-500 text-[10px]">›</span>
                  </span>
                </button>
              </HoverWindow>
            );
          })}
        </div>
      </div>

      {/* 法案二级切换面板 */}
      {lawCategory && createPortal(
        <div role="dialog" aria-label="校内法案选择" style={lawBounds} className="fixed bg-[#14191a] z-[120] p-3 flex flex-col border border-tno-border shadow-xl shadow-black/60">
          <div className="flex justify-between items-start border-b border-tno-border pb-2 mb-3">
            <div>
              <h3 className="text-tno-highlight font-bold text-sm">
                {LAW_CATEGORIES.find(c => c.id === lawCategory)?.name}
              </h3>
              <div className="text-[10px] text-tno-text/60 mt-0.5">
                {LAW_CATEGORIES.find(c => c.id === lawCategory)?.desc} · 每次切换 {LAW_CHANGE_COST} PP
              </div>
            </div>
            <button onClick={() => setLawCategory(null)} className="text-tno-red hover:text-white text-sm">关闭</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {LAW_CATEGORIES.find(c => c.id === lawCategory)?.levels.map(lvId => {
              const law = LAWS[lvId];
              const isActive = lvId === getLawSystem(state.lawSystem)[lawCategory as 'discipline'];
              const canAfford = state.stats.pp >= LAW_CHANGE_COST;
              return (
                <button
                  key={lvId}
                  onClick={() => { if (!isActive && canAfford) changeLaw(lawCategory as 'discipline', lvId); }}
                  disabled={isActive || !canAfford}
                  className={`w-full text-left border p-2.5 transition-colors ${
                    isActive
                      ? 'border-tno-highlight bg-tno-highlight/10'
                      : canAfford
                        ? 'border-tno-border hover:border-tno-highlight hover:bg-zinc-900'
                        : 'border-tno-border/50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <LawArt id={law.id} large />
                    <span className={`flex-1 font-bold text-xs ${isActive ? 'text-tno-highlight' : 'text-tno-text'}`}>
                      {law.name}{isActive ? '（当前）' : ''}
                    </span>
                    {!isActive && (
                      <span className={`text-[9px] ${canAfford ? 'text-amber-300' : 'text-tno-red'}`}>
                        {LAW_CHANGE_COST} PP
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-tno-text/80 leading-relaxed mb-1.5">{law.flavor}</div>
                  <div className="text-[10px] space-y-0.5 border-t border-tno-border/40 pt-1.5">
                    {Object.entries(law.effects).map(([k, v]) => {
                      const fmt = formatModifierEntry(k, v as number);
                      return (
                        <div key={k} className="flex justify-between">
                          <span className="text-tno-text/70">{fmt.label}</span>
                          <span className={fmt.positive ? 'text-tno-green' : 'text-tno-red'}>{fmt.text}</span>
                        </div>
                      );
                    })}
                    {law.advisorCostMult && law.advisorCostMult !== 1 && (
                      <div className="flex justify-between">
                        <span className="text-tno-text/70">顾问雇佣费用</span>
                        <span className={law.advisorCostMult < 1 ? 'text-tno-green' : 'text-tno-red'}>
                          {law.advisorCostMult < 1 ? `-${Math.round((1 - law.advisorCostMult) * 100)}%` : `+${Math.round((law.advisorCostMult - 1) * 100)}%`}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>, document.body
      )}

      {/* Hire Modal Overlay */}
      {selectedSlot !== null && (
        <div className="nation-hire-panel absolute inset-0 z-20 p-3 flex flex-col border-l border-tno-border">
          <div className="flex justify-between items-center border-b border-tno-border pb-2 mb-4">
            <h3 className="text-tno-highlight font-bold">选择顾问</h3>
            <button onClick={() => setSelectedSlot(null)} className="text-tno-red hover:text-white text-sm">关闭</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {AVAILABLE_ADVISORS.filter(a => {
              if (a.id === 'zhou_chen' && !state.flags['chen_dong_veterans_unlocked'] && !state.flags['zhou_chen_unlocked']) return false;
              if (a.id === 'you_guanglei' && !state.flags['chen_dong_veterans_unlocked']) return false;
              if (a.id === 'li_jingkai' && !state.flags['li_jingkai_unlocked']) return false;
              if (a.id === 'feng_anbao_advisor' && !state.flags['feng_anbao_unlocked']) return false;
              if ((a.id === 'wang_zhaokai_advisor' || a.id === 'gouxiong_advisor') && !state.flags['b3_advisors_unlocked']) return false;
              if (a.id === 'jiang_haobang' && !state.flags['jiang_haobang_unlocked']) return false;
              if (a.id === 'wang_juanhao_vanguard' && state.reformState?.juanhaoAttitude !== 4) return false;
              if (a.id === 'jidi_ceo' && !state.flags['jidi_ceo_unlocked']) return false;
              if (a.id === 'hitachi_expert' && !state.flags['hitachi_expert_unlocked']) return false;
              if (a.id === 'data_analyst' && !state.flags['data_analyst_unlocked']) return false;
              if ((a.id === 'lu_bohan' || a.id === 'shi_ji' || a.id === 'zhou_hongbing') && !state.flags['true_left_advisors_unlocked']) return false;
              return !state.advisors.find(h => h?.id === a.id);
            }).map(advisor => (
              <button
                key={advisor.id}
                onClick={() => handleHire(advisor)}
                className="nation-hire-option w-full text-left border border-tno-border p-2 hover:border-tno-highlight transition-colors"
              >
                <img className="nation-hire-option__portrait" src={getAdvisorPortraitUrl(advisor.portrait, advisor.id)} alt={advisor.name} loading="lazy" />
                <div className="nation-hire-option__body">
                  <CharacterProfile name={advisor.name} title={advisor.title} {...getAdvisorProfile(advisor)} compact />
                  <span className={`nation-hire-option__cost ${state.stats.pp >= getAdvisorCost(advisor) ? 'is-affordable' : 'is-unaffordable'}`}>
                    任命 · {getAdvisorCost(advisor)} PP
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
