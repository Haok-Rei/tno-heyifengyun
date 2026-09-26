/**
 * engine/gameLoop.ts - 游戏引擎工具模块
 *
 * 从 App.tsx 的 Tick 循环中抽离出的独立功能：
 * - Super Event 常量
 * - 修正值计算 (modifier calculation)
 * - 危机触发条件检查
 * - 国策要求检查
 */

import { GameState, SuperEventData, NationalSpirit } from '../types';
import { LAWS, LAW_CATEGORIES, getLawSystem } from '../data/laws';
import { getPaperUpkeep } from './campaignStats';

// ============================================================
// Super Event 常量
// ============================================================

export const GAME_OVER_SCHOOL: SuperEventData = {
  id: 'game_over_school',
  title: '全面镇压',
  quote: '"秩序，高于一切。"',
  author: '吴福军',
  color: '#FF3333'
};

export const GAME_OVER_ANARCHY: SuperEventData = {
  id: 'game_over_anarchy',
  title: '升学率雪崩',
  quote: '"我们自由了，然后呢？"',
  author: '佚名做题家',
  color: '#39FF14'
};

export const FOCUS_COMPLETION_SUPER_EVENTS: Record<string, SuperEventData> = {
  charge_b3: {
    id: 'b3_uprising', title: '合肥一中B3起义',
    quote: '重拾民主，再塑合一。', author: '潘仁越', color: 'tno-red',
  },
  jidi_corporate_utopia: {
    id: 'jidi_empire_super', title: '及第帝国',
    quote: '"在利润面前，教育会被改写成生产线。"', author: '及第联合管理委员会', color: '#f59e0b',
  },
  jidi_hidden_riot: {
    id: 'jidi_riot_super', title: '及第暴乱',
    quote: '"在你身边，路虽远亦未倦。"', author: '漫步人生路', color: '#ef4444',
  },
  start_reform: {
    id: 'true_left_reform_super', title: '做题改革启动',
    quote: '"革命不是换一张试卷，而是换一套命运。"', author: '王兆凯', color: '#f43f5e',
  },
  lu_bohan_start: {
    id: 'lu_authoritarian_super', title: '极权派上台',
    quote: '"合一做题蛆太多，我们图蛆太少。"', author: '吕波汉', color: '#ef4444',
  },
  gouxiong_accident: {
    id: 'haobang_rise_super', title: '自社派上台',
    quote: '"团结不是退让，是为了更美好世界的梦想。"', author: '豪邦', color: '#38bdf8',
  },
  gx_start: {
    id: 'gx_auditorium_split_super', title: '艺术礼堂分裂',
    quote: '"银幕升起的那一刻，旧同盟也被撕成两半。"', author: '礼堂值夜记录', color: '#a855f7',
  },
  gx_redeem_settlement: {
    id: 'gx_redeem_super', title: '浪子回头',
    quote: '"把面具摘下，才有资格谈明天。"', author: '狗熊', color: '#22c55e',
  },
  gx_embarrass_settlement: {
    id: 'gx_embarrass_super', title: '丢人现眼',
    quote: '"当聚光灯照向现实，小丑无处可逃。"', author: '达璧', color: '#ef4444',
  },
  gx_ruin_settlement: {
    id: 'gx_ruin_super', title: '永恒的赛博废墟',
    quote: '"当现实被按下暂停键，废墟也会长出荧光。"', author: '弹幕纪元记录', color: '#ec4899',
  },
};

export const FOCUS_START_SUPER_EVENTS: Record<string, SuperEventData> = {
  first_democratic_election: {
    id: 'first_democratic_election_super', title: '第一次合一普选',
    quote: '"让每一张选票，都比口号更响亮。"', author: '合一学生议会', color: '#22c55e',
  },
};

// ============================================================
// 国策要求检查
// ============================================================

const OR_REQUIRE_FOCUS_IDS = new Set(['steel_toad', 'rectify_campus_order', 'charge_b3', 'wu_coup_december', 'wu_millennium_plan']);

/** 判断节点前置国策是「或」还是「与」关系（供国策树悬浮窗显示） */
export function requiresIsOr(nodeId: string): boolean {
  return OR_REQUIRE_FOCUS_IDS.has(nodeId);
}

export function hasFocusRequirements(
  node: { id: string; requires?: string[] },
  completedFocuses: string[]
): boolean {
  if (!node.requires || node.requires.length === 0) return true;
  if (OR_REQUIRE_FOCUS_IDS.has(node.id)) {
    return node.requires.some(req => completedFocuses.includes(req));
  }
  return node.requires.every(req => completedFocuses.includes(req));
}

// ============================================================
// 修正值计算 (Modifier Calculation)
// ============================================================

export interface ModifierValues {
  ppDaily: number;
  stabDaily: number;
  ssDaily: number;
  tprDaily: number;
  studentSanityDaily: number;
  capitalPenetrationDaily: number;
  radicalAngerDaily: number;
  allianceUnityDaily: number;
  partyCentralizationDaily: number;
  powerBalanceDaily: number;
  gdpGrowthDaily: number;
  rndQualityDaily: number;
}

/**
 * 根据当前游戏状态计算所有每日修正值。
 * 这是从 Tick 循环中抽离出来的纯计算函数。
 */
export function calculateModifiers(state: GameState): {
  modifiers: ModifierValues;
  updatedSpirits: NationalSpirit[];
} {
  let ppMod = 1.0;
  let stabMod = 0;
  let ssMod = 0;
  let tprMod = 0;
  let studentSanityMod = 0;
  let capitalPenetrationMod = 0;
  let radicalAngerMod = 0;
  let allianceUnityMod = 0;
  let partyCentralizationMod = 0;
  let powerBalanceMod = 0;
  let gdpGrowthMod = 0;
  let rndQualityMod = 0;

  const newNationalSpirits = [...state.nationalSpirits];

  // ---- Leader buffs ----
  switch (state.leader.name) {
    case '封安保':
      stabMod += 0.05;
      tprMod -= 10;
      break;
    case '王兆凯':
      radicalAngerMod += 0.5;
      partyCentralizationMod += 0.5;
      break;
    case '潘仁越':
      allianceUnityMod += 0.5;
      stabMod += 0.1;
      break;
    case '封安祥':
      gdpGrowthMod += 0.05;
      ssMod -= 0.5;
      break;
    case '狗熊':
      ppMod += 0.5;
      break;
    case '杨玉乐': {
      ppMod += 0.25;
      const yy = state.yangYuleState;
      if (yy) {
        if (yy.fengFavor > 50) ppMod += (yy.fengFavor - 50) / 100;
        else if (yy.fengFavor < 30) ppMod -= (30 - yy.fengFavor) / 100;
      }
      break;
    }
  }

  // ---- Advisor modifiers ----
  state.advisors.forEach(adv => {
    if (!adv) return;
    const m = adv.modifiers;
    if (m.ppDaily) ppMod += m.ppDaily;
    if (m.stabDaily) stabMod += m.stabDaily;
    if (m.ssDaily) ssMod += m.ssDaily;
    if (m.tprDaily) tprMod += m.tprDaily;
    if (m.studentSanityDaily) studentSanityMod += m.studentSanityDaily;
    if (m.capitalPenetrationDaily) capitalPenetrationMod += m.capitalPenetrationDaily;
    if (m.radicalAngerDaily) radicalAngerMod += m.radicalAngerDaily;
    if (m.allianceUnityDaily) allianceUnityMod += m.allianceUnityDaily;
    if (m.partyCentralizationDaily) partyCentralizationMod += m.partyCentralizationDaily;
    if (m.powerBalanceDaily) powerBalanceMod += m.powerBalanceDaily;
    if (m.gdpGrowthDaily) gdpGrowthMod += m.gdpGrowthDaily;
    if (m.rndQualityDaily) rndQualityMod += m.rndQualityDaily;
  });

  // ---- National Spirit modifiers ----
  state.nationalSpirits.forEach(spirit => {
    // v8.9 动态精神跳过（与 App.tsx tick 保持一致，避免双计）
    if (spirit.id === 'assembly_dynamics' || spirit.id === 'red_toad_politburo' || spirit.id === 'gouxiong_sanity_state' || spirit.id.startsWith('law_spirit_')) return;
    const e = spirit.effects;
    if (!e) return;
    if (e.ppDaily) ppMod += e.ppDaily;
    if (e.stabDaily) stabMod += e.stabDaily;
    if (e.ssDaily) ssMod += e.ssDaily;
    if (e.tprDaily) tprMod += e.tprDaily;
    if (e.studentSanityDaily) studentSanityMod += e.studentSanityDaily;
    if (e.capitalPenetrationDaily) capitalPenetrationMod += e.capitalPenetrationDaily;
    if (e.radicalAngerDaily) radicalAngerMod += e.radicalAngerDaily;
    if (e.allianceUnityDaily) allianceUnityMod += e.allianceUnityDaily;
    if (e.partyCentralizationDaily) partyCentralizationMod += e.partyCentralizationDaily;
    if (e.powerBalanceDaily) powerBalanceMod += e.powerBalanceDaily;
    if (e.gdpGrowthDaily) gdpGrowthMod += e.gdpGrowthDaily;
    if (e.rndQualityDaily) rndQualityMod += e.rndQualityDaily;
  });

  // ---- Assembly Dynamics ----
  const assemblyDynamicsIndex = newNationalSpirits.findIndex(ns => ns.id === 'assembly_dynamics');
  if (assemblyDynamicsIndex !== -1 && state.studentAssemblyFactions) {
    const assemblyDynamics = { ...newNationalSpirits[assemblyDynamicsIndex] };
    const factions = state.studentAssemblyFactions;

    let adPpMod = -0.5;
    let adTprMod = factions.testTaker * 0.2;
    adPpMod += factions.orthodox * 0.02;
    let adSsMod = factions.bear * 0.02;

    if (factions.conservativeDem) adPpMod -= factions.conservativeDem * 0.01;
    if (factions.jidiTutoring) {
      adTprMod += factions.jidiTutoring * 0.5;
      adSsMod -= factions.jidiTutoring * 0.05;
    }

    adPpMod = Math.round(adPpMod * 1000) / 1000;
    adTprMod = Math.round(adTprMod * 1000) / 1000;
    adSsMod = Math.round(adSsMod * 1000) / 1000;

    assemblyDynamics.effects = { ppDaily: adPpMod, tprDaily: adTprMod, ssDaily: adSsMod };
    newNationalSpirits[assemblyDynamicsIndex] = assemblyDynamics;

    ppMod += adPpMod;
    tprMod += adTprMod;
    ssMod += adSsMod;
  }

  // ---- 校内法案 (Law System, v8.11) ----
  const activeLaws = getLawSystem(state.lawSystem);
  LAW_CATEGORIES.forEach(cat => {
    const law = LAWS[activeLaws[cat.id]];
    if (!law) return;
    const spiritId = `law_spirit_${cat.id}`;
    const spiritIdx = newNationalSpirits.findIndex(ns => ns.id === spiritId);
    const lawSpirit: NationalSpirit = {
      id: spiritId,
      name: `${cat.name}：${law.name}`,
      description: law.flavor,
      type: 'neutral',
      effects: { ...law.effects },
    };
    if (spiritIdx !== -1) newNationalSpirits[spiritIdx] = lawSpirit;
    else newNationalSpirits.push(lawSpirit);
    const e = law.effects;
    if (e.ppDaily) ppMod += e.ppDaily;
    if (e.stabDaily) stabMod += e.stabDaily;
    if (e.ssDaily) ssMod += e.ssDaily;
    if (e.tprDaily) tprMod += e.tprDaily;
    if (e.studentSanityDaily) studentSanityMod += e.studentSanityDaily;
    if (e.capitalPenetrationDaily) capitalPenetrationMod += e.capitalPenetrationDaily;
    if (e.radicalAngerDaily) radicalAngerMod += e.radicalAngerDaily;
    if (e.allianceUnityDaily) allianceUnityMod += e.allianceUnityDaily;
    if (e.partyCentralizationDaily) partyCentralizationMod += e.partyCentralizationDaily;
  });

  // ---- Red Toad Politburo Dynamics ----
  if (state.redToadState) {
    const consensus = state.redToadState.overallConsensus;
    const politburoSpiritIndex = newNationalSpirits.findIndex(ns => ns.id === 'red_toad_politburo');

    let spiritType: 'positive' | 'negative' | 'neutral' = 'neutral';
    let spiritDesc = '会议室里的气氛像绷紧的弦，各派系谁也不肯先开口。';
    let effects: Record<string, number> = {};

    if (consensus > 50) {
      spiritType = 'positive';
      const level = Math.max(1, Math.floor((consensus - 50) / 10));
      spiritDesc = '几大派系罕见地拧成一股绳，议案以惊人的速度通过。';
      effects = { ppDaily: level * 0.1, stabDaily: level * 0.2, tprDaily: level * 5 };
    } else if (consensus < 50) {
      spiritType = 'negative';
      const level = Math.max(1, Math.floor((50 - consensus) / 10));
      spiritDesc = '会议室里拍桌声不绝，每一份议案都要先撕上三轮。';
      effects = { ppDaily: -level * 0.1, stabDaily: -level * 0.2, radicalAngerDaily: level * 0.5 };
    }

    const politburoSpirit: NationalSpirit = {
      id: 'red_toad_politburo', name: '红蛤政治局',
      description: spiritDesc, type: spiritType, effects,
    };

    if (politburoSpiritIndex !== -1) {
      newNationalSpirits[politburoSpiritIndex] = politburoSpirit;
    } else {
      newNationalSpirits.push(politburoSpirit);
    }

    if (effects.ppDaily) ppMod += effects.ppDaily;
    if (effects.stabDaily) stabMod += effects.stabDaily;
    if (effects.tprDaily) tprMod += effects.tprDaily;
    if (effects.radicalAngerDaily) radicalAngerMod += effects.radicalAngerDaily;
  }

  // ---- Power Balance ----
  if (state.parliamentState?.powerBalanceUnlocked) {
    const pb = state.parliamentState.powerBalance;
    if (pb < 40) { ppMod += (40 - pb) * 0.05; tprMod -= (40 - pb) * 0.5; }
    else if (pb > 60) { tprMod += (pb - 60) * 0.5; ppMod -= (pb - 60) * 0.02; }
    else { stabMod += 0.2; }
  }

  // ---- Gou Xiong Sanity State ----
  const isGxActive = state.currentFocusTree === 'gouxiong_tree' || !!state.flags.gouxiong_system_unlocked || state.leader.name === '狗熊';
  if (isGxActive && state.gouxiongState) {
    const spiritId = 'gouxiong_sanity_state';
    const spiritIdx = newNationalSpirits.findIndex(ns => ns.id === spiritId);
    const currentSanity = Math.max(0, Math.min(100, state.gouxiongState.sanity));

    let sanitySpirit: NationalSpirit;
    if (currentSanity > 50) {
      sanitySpirit = { id: spiritId, name: '狗熊理智在线', description: `理智 ${currentSanity.toFixed(1)}：治理效率上升。`, type: 'positive', effects: { ppDaily: 0.3, stabDaily: 0.2 } };
      ppMod += 0.3; stabMod += 0.2;
    } else if (currentSanity < 50) {
      sanitySpirit = { id: spiritId, name: '狗熊理智失衡', description: `理智 ${currentSanity.toFixed(1)}：决策质量下降。`, type: 'negative', effects: { ppDaily: -0.3, stabDaily: -0.3 } };
      ppMod -= 0.3; stabMod -= 0.3;
    } else {
      sanitySpirit = { id: spiritId, name: '狗熊理智波动', description: '理智处于临界状态。', type: 'neutral', effects: { ppDaily: 0, stabDaily: 0 } };
    }

    if (spiritIdx !== -1) newNationalSpirits[spiritIdx] = sanitySpirit;
    else newNationalSpirits.push(sanitySpirit);
  } else {
    // Remove sanity spirit if not in gouxiong system
    const idx = newNationalSpirits.findIndex(ns => ns.id === 'gouxiong_sanity_state');
    if (idx !== -1) newNationalSpirits.splice(idx, 1);
  }

  // ---- TPR Penalty ----
  if (state.stats.tpr <= 0) stabMod -= 5.0;

  // ---- Dynamic Stat Effects ----
  ppMod += (state.stats.stab - 50) / 100;
  stabMod += (state.stats.ss - 50) / 100;

  // ---- Yang Yule Feng Favor ----
  if (state.yangYuleState) {
    if (state.yangYuleState.fengFavor > 50) ppMod += (state.yangYuleState.fengFavor - 50) * 0.02;
    else if (state.yangYuleState.fengFavor < 30) ppMod -= (30 - state.yangYuleState.fengFavor) * 0.05;
  }

  // ---- Region Buffs ----
  const ml = state.mapLocations;
  if (ml.b3?.studentControl >= 100) stabMod += 0.1;
  if (ml.admin?.studentControl >= 100) ppMod += 0.5;
  if (ml.b1b2?.studentControl >= 100) tprMod += 10;
  tprMod -= getPaperUpkeep(state);
  if (ml.auditorium?.studentControl >= 100) ssMod += 0.1;
  if (ml.lab?.studentControl >= 100) studentSanityMod += 0.1;
  if (ml.playground?.studentControl >= 100) stabMod += 0.1;

  // ---- Force minimum PP ----
  if (state.stats.pp < 0 && ppMod <= 0) ppMod = 0.5;

  // ---- Radical Anger Drift ----
  if (state.stats.radicalAnger > 50) {
    radicalAngerMod -= ((state.stats.radicalAnger - 50) / 50) * 0.5;
  } else if (state.stats.radicalAnger < 50) {
    radicalAngerMod += ((50 - state.stats.radicalAnger) / 50) * 0.5;
  }

  return {
    modifiers: {
      ppDaily: ppMod,
      stabDaily: stabMod,
      ssDaily: ssMod,
      tprDaily: tprMod,
      studentSanityDaily: studentSanityMod,
      capitalPenetrationDaily: capitalPenetrationMod,
      radicalAngerDaily: radicalAngerMod,
      allianceUnityDaily: allianceUnityMod,
      partyCentralizationDaily: partyCentralizationMod,
      powerBalanceDaily: powerBalanceMod,
      gdpGrowthDaily: gdpGrowthMod,
      rndQualityDaily: rndQualityMod,
    },
    updatedSpirits: newNationalSpirits,
  };
}

// ============================================================
// 修正值中文化标签（供悬浮窗统一使用, v8.8）
// ============================================================

export const MODIFIER_LABELS: Record<string, { label: string; suffix: string; invert?: boolean; percent?: boolean }> = {
  ppDaily: { label: '每日政治点数', suffix: '' },
  stabDaily: { label: '每日稳定度', suffix: '%' },
  ssDaily: { label: '每日学生支持度', suffix: '%' },
  tprDaily: { label: '每日卷子储备', suffix: '' },
  studentSanityDaily: { label: '每日学生理智', suffix: '' },
  capitalPenetrationDaily: { label: '每日资本渗透', suffix: '%' },
  radicalAngerDaily: { label: '每日激进愤怒', suffix: '' },
  allianceUnityDaily: { label: '每日联盟团结', suffix: '' },
  partyCentralizationDaily: { label: '每日党内集权', suffix: '' },
  powerBalanceDaily: { label: '每日权力平衡', suffix: '', invert: true },
  gdpGrowthDaily: { label: '每日及第GDP', suffix: '%' },
  rndQualityDaily: { label: '每日研发质量', suffix: '' },
  defenseBonus: { label: '防御加成', suffix: '%', percent: true },
};

/** 将修正值 key/value 格式化为中文显示（返回是否为正面效果） */
export function formatModifierEntry(effectKey: string, val: number): { label: string; text: string; positive: boolean } {
  const meta = MODIFIER_LABELS[effectKey] ?? { label: effectKey, suffix: '' };
  const displayVal = meta.percent ? val * 100 : val;
  let formatted = String(Math.round(displayVal * 1000) / 1000);
  if (formatted.includes('.')) formatted = formatted.replace(/\.?0+$/, '');
  if (formatted === '' || formatted === '-0') formatted = '0';
  const positive = meta.invert ? val <= 0 : val >= 0;
  const sign = displayVal > 0 ? '+' : '';
  return { label: meta.label, text: `${sign}${formatted}${meta.suffix}`, positive };
}

// ============================================================
// 每日修正值明细 (Modifier Breakdown for Tooltip, v8.8)
// ============================================================

export type BreakdownKey = 'pp' | 'stab' | 'ss' | 'tpr' | 'studentSanity' | 'capitalPenetration' | 'radicalAnger' | 'allianceUnity' | 'partyCentralization';

export interface ModifierEntry {
  key: BreakdownKey;
  source: string;
  value: number;
}

const BREAKDOWN_KEYS: { key: BreakdownKey; modKey: keyof ModifierValues }[] = [
  { key: 'pp', modKey: 'ppDaily' },
  { key: 'stab', modKey: 'stabDaily' },
  { key: 'ss', modKey: 'ssDaily' },
  { key: 'tpr', modKey: 'tprDaily' },
  { key: 'studentSanity', modKey: 'studentSanityDaily' },
  { key: 'capitalPenetration', modKey: 'capitalPenetrationDaily' },
  { key: 'radicalAnger', modKey: 'radicalAngerDaily' },
  { key: 'allianceUnity', modKey: 'allianceUnityDaily' },
  { key: 'partyCentralization', modKey: 'partyCentralizationDaily' },
];

/**
 * 计算每个每日修正值的全部来源明细（与 Tick 内计算逻辑镜像）。
 * 末尾以「其他修正」兜底吸收残差，保证各项之和恒等于 state.modifiers 中的权威总值。
 */
export function calculateModifierBreakdown(state: GameState): ModifierEntry[] {
  const entries: ModifierEntry[] = [];
  const add = (key: BreakdownKey, source: string, value: number) => {
    if (value !== 0 && Number.isFinite(value)) {
      entries.push({ key, source, value: Math.round(value * 1000) / 1000 });
    }
  };

  // 基础产出（仅 PP）
  add('pp', '基础产出', 1.0);

  // 领袖加成
  switch (state.leader.name) {
    case '封安保':
      add('stab', '领袖：封安保', 0.05);
      add('tpr', '领袖：封安保', -10);
      break;
    case '王兆凯':
      add('radicalAnger', '领袖：王兆凯', 0.5);
      add('partyCentralization', '领袖：王兆凯', 0.5);
      break;
    case '潘仁越':
      add('allianceUnity', '领袖：潘仁越', 0.5);
      add('stab', '领袖：潘仁越', 0.1);
      break;
    case '封安祥':
      add('ss', '领袖：封安祥', -0.5);
      break;
    case '狗熊':
      add('pp', '领袖：狗熊', 0.5);
      break;
    case '杨玉乐': {
      add('pp', '领袖：杨玉乐', 0.25);
      const yy = state.yangYuleState;
      if (yy) {
        if (yy.fengFavor > 50) add('pp', '领袖：杨玉乐（封校长青睐）', Math.round(((yy.fengFavor - 50) / 100) * 1000) / 1000);
        else if (yy.fengFavor < 30) add('pp', '领袖：杨玉乐（封校长冷淡）', -Math.round(((30 - yy.fengFavor) / 100) * 1000) / 1000);
      }
      break;
    }
  }

  // 顾问加成
  state.advisors.forEach(adv => {
    if (!adv || !adv.modifiers) return;
    const m = adv.modifiers;
    const src = `顾问：${adv.name}`;
    (BREAKDOWN_KEYS as { key: BreakdownKey; modKey: keyof typeof m }[]).forEach(({ key, modKey }) => {
      const v = m[modKey] as number | undefined;
      if (v) add(key, src, v);
    });
  });

  // 国家精神加成（v8.9 动态精神跳过：由下方实时结算条目单独列出）
  state.nationalSpirits.forEach(sp => {
    if (sp.id === 'assembly_dynamics' || sp.id === 'red_toad_politburo' || sp.id === 'gouxiong_sanity_state' || sp.id.startsWith('law_spirit_')) return;
    const e = sp.effects;
    if (!e) return;
    const src = `精神：${sp.name}`;
    (BREAKDOWN_KEYS as { key: BreakdownKey; modKey: keyof typeof e }[]).forEach(({ key, modKey }) => {
      const v = e[modKey] as number | undefined;
      if (v) add(key, src, v);
    });
  });

  // 校内法案（v8.11）
  const lawSystem = getLawSystem(state.lawSystem);
  LAW_CATEGORIES.forEach(cat => {
    const law = LAWS[lawSystem[cat.id]];
    if (!law) return;
    const src = `${cat.name}：${law.name}`;
    (BREAKDOWN_KEYS as { key: BreakdownKey; modKey: keyof typeof law.effects }[]).forEach(({ key, modKey }) => {
      const v = law.effects[modKey] as number | undefined;
      if (v) add(key, src, v);
    });
  });

  // 红蛤政治局（共识度实时结算）
  if (state.redToadState) {
    const consensus = state.redToadState.overallConsensus;
    if (consensus > 50) {
      const level = Math.max(1, Math.floor((consensus - 50) / 10));
      add('pp', '政治局高共识', Math.round(level * 0.1 * 1000) / 1000);
      add('stab', '政治局高共识', Math.round(level * 0.2 * 1000) / 1000);
      add('tpr', '政治局高共识', level * 5);
    } else if (consensus < 50) {
      const level = Math.max(1, Math.floor((50 - consensus) / 10));
      add('pp', '政治局低共识', Math.round(-level * 0.1 * 1000) / 1000);
      add('stab', '政治局低共识', Math.round(-level * 0.2 * 1000) / 1000);
      add('radicalAnger', '政治局低共识', Math.round(level * 0.5 * 1000) / 1000);
    }
  }

  // 狗熊理智波动（实时结算）
  if ((state.currentFocusTree === 'gouxiong_tree' || !!state.flags.gouxiong_system_unlocked || state.leader.name === '狗熊') && state.gouxiongState) {
    const sanity = Math.max(0, Math.min(100, state.gouxiongState.sanity));
    if (sanity > 50) {
      add('pp', '狗熊理智在线', 0.3);
      add('stab', '狗熊理智在线', 0.2);
    } else if (sanity < 50) {
      add('pp', '狗熊理智失衡', -0.3);
      add('stab', '狗熊理智失衡', -0.3);
    }
  }

  // 议会博弈（Assembly Dynamics）实时结算加成
  if (state.nationalSpirits.some(ns => ns.id === 'assembly_dynamics') && state.studentAssemblyFactions) {
    const factions = state.studentAssemblyFactions;
    let adPpMod = -0.5 + factions.orthodox * 0.02;
    if (factions.conservativeDem) adPpMod -= factions.conservativeDem * 0.01;
    if (factions.otherDem) adPpMod += factions.otherDem * 0.01;
    const adTprMod = factions.testTaker * 0.2 + (factions.jidiTutoring ? factions.jidiTutoring * 0.5 : 0);
    const adSsMod = factions.bear * 0.02 - (factions.jidiTutoring ? factions.jidiTutoring * 0.05 : 0);
    add('pp', '议会博弈（实时结算）', Math.round(adPpMod * 1000) / 1000);
    add('tpr', '议会博弈（实时结算）', Math.round(adTprMod * 1000) / 1000);
    add('ss', '议会博弈（实时结算）', Math.round(adSsMod * 1000) / 1000);
  }

  // 议会权力平衡
  if (state.parliamentState?.powerBalanceUnlocked) {
    const pb = state.parliamentState.powerBalance;
    if (pb < 40) {
      add('pp', '权力平衡：素质偏向', Math.round((40 - pb) * 0.05 * 1000) / 1000);
      add('tpr', '权力平衡：素质偏向', Math.round(-(40 - pb) * 0.5 * 1000) / 1000);
    } else if (pb > 60) {
      add('tpr', '权力平衡：应试偏向', Math.round((pb - 60) * 0.5 * 1000) / 1000);
      add('pp', '权力平衡：应试偏向', Math.round(-(pb - 60) * 0.02 * 1000) / 1000);
    } else {
      add('stab', '权力平衡：居中稳衡', 0.2);
    }
  }

  // N.K.P.D. 双头制衡
  if (state.flags.lu_dual_power_unlocked) {
    const bal = typeof state.flags.lu_nkpd_power_balance === 'number' ? state.flags.lu_nkpd_power_balance : 50;
    if (bal <= 35) {
      add('pp', 'N.K.P.D.：吕波汉主导', 0.2);
      add('partyCentralization', 'N.K.P.D.：吕波汉主导', 0.3);
      add('ss', 'N.K.P.D.：吕波汉主导', -0.2);
    } else if (bal >= 65) {
      add('tpr', 'N.K.P.D.：狗熊主导', 5);
      add('stab', 'N.K.P.D.：狗熊主导', -0.35);
      add('ss', 'N.K.P.D.：狗熊主导', -0.35);
      add('radicalAnger', 'N.K.P.D.：狗熊主导', 0.5);
      add('pp', 'N.K.P.D.：狗熊主导', -0.2);
    } else {
      add('stab', 'N.K.P.D.：双头并行', 0.1);
      add('pp', 'N.K.P.D.：双头并行', -0.05);
    }
  }

  // 卷子储备枯竭惩罚
  if (state.stats.tpr <= 0) add('stab', '卷子储备枯竭', -5);

  // 局势联动
  add('pp', '稳定度联动', Math.round(((state.stats.stab - 50) / 100) * 1000) / 1000);
  add('stab', '学生支持联动', Math.round(((state.stats.ss - 50) / 100) * 1000) / 1000);

  // 杨玉乐特殊：封校长好感度额外加成
  if (state.yangYuleState) {
    if (state.yangYuleState.fengFavor > 50) {
      add('pp', '封校长好感度', Math.round((state.yangYuleState.fengFavor - 50) * 0.02 * 1000) / 1000);
    } else if (state.yangYuleState.fengFavor < 30) {
      add('pp', '封校长好感度', Math.round(-(30 - state.yangYuleState.fengFavor) * 0.05 * 1000) / 1000);
    }
  }

  // 地区全控加成
  const ml = state.mapLocations;
  if (ml.b3?.studentControl >= 100) add('stab', 'B3全面控制', 0.1);
  if (ml.admin?.studentControl >= 100) add('pp', '行政楼全面控制', 0.5);
  if (ml.b1b2?.studentControl >= 100) add('tpr', 'B1/B2全面控制', 10);
  add('tpr', '试卷使用与库存损耗', -getPaperUpkeep(state));
  if (ml.auditorium?.studentControl >= 100) add('ss', '礼堂全面控制', 0.1);
  if (ml.lab?.studentControl >= 100) add('studentSanity', '实验楼全面控制', 0.1);
  if (ml.playground?.studentControl >= 100) add('stab', '操场全面控制', 0.1);

  // 激进愤怒自然回落
  if (state.stats.radicalAnger > 50) {
    add('radicalAnger', '激进情绪回落', Math.round(-((state.stats.radicalAnger - 50) / 50) * 0.5 * 1000) / 1000);
  } else if (state.stats.radicalAnger < 50) {
    add('radicalAnger', '激进情绪反弹', Math.round(((50 - state.stats.radicalAnger) / 50) * 0.5 * 1000) / 1000);
  }

  // 残差兜底：保证明细之和恒等于权威总值
  BREAKDOWN_KEYS.forEach(({ key, modKey }) => {
    const total = state.modifiers[modKey];
    const computed = entries.filter(e => e.key === key).reduce((s, e) => s + e.value, 0);
    const residual = Math.round((total - computed) * 1000) / 1000;
    if (residual !== 0) add(key, '其他修正', residual);
  });

  return entries;
}
