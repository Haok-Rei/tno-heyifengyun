import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Target, Book } from 'lucide-react';
import { GameState, Decision, ALL_SUB_TILES } from '../types';
import SituationMetrics from './SituationMetrics';
import { FLAVOR_EVENTS } from '../data/flavorEvents';
import { STORY_EVENTS } from '../data/storyEvents';
import RouteGuide from './RouteGuide';
import HoverWindow from './HoverWindow';
import { getCommandRoute } from '../data/commandRoutes';
import { ROUTE_OPERATIONS } from '../data/routeOperations';
import { getCommandState, getPreparationPreview } from '../engine/commandSystem';

interface RightSidebarProps {
  state: GameState;
  triggerDecision: (decision: Decision) => void;
  triggerError: () => void;
}

const DEBUG_LEADERS: Record<string, GameState['leader']> = {
  feng_anbao: {
    name: '封安宝',
    title: '校长',
    portrait: 'feng_anbao',
    ideology: 'authoritarian',
  },
  wang_zhaokai: {
    name: '王照凯',
    title: '钢铁红蛤领袖',
    portrait: 'wang_zhaokai',
    ideology: 'radical_socialism',
  },
  pan_renyue: {
    name: '潘仁越',
    title: '学生议会议长',
    portrait: 'pan_renyue',
    ideology: 'liberal',
  },
  lu_bohan: {
    name: '吕波汉',
    title: 'N.K.P.D.总负责人',
    portrait: 'lu_bohan',
    ideology: 'authoritarian',
  },
  hao_bang: {
    name: '豪邦',
    title: '联合革委会临时舵手',
    portrait: 'hao_bang',
    ideology: 'radical_socialism',
  },
  yang_yule: {
    name: '杨玉乐',
    title: '名师工作室代理校长',
    portrait: 'yang_yule',
    ideology: 'reactionary',
  },
  feng_anxiang: {
    name: '封安祥',
    title: '及第教育CEO',
    portrait: 'feng_anxiang',
    ideology: 'anarcho_capitalism',
  },
  gouxiong: {
    name: '狗熊',
    title: '二次元缝合怪',
    portrait: 'gouxiong',
    ideology: 'deconstructivism',
  }
};

const withDebugMapFlags = (state: GameState, overrides: Record<string, any> = {}) => ({
  ...state.flags,
  map_phase_ended: false,
  polling_stations_unlocked: false,
  map_struggle_ended: false,
  jidi_takeover_complete: false,
  rebellion_started: false,
  yang_yule_route_started: false,
  lu_purge_map_phase: false,
  haobang_commune_map_phase: false,
  jidi_new_era_active: false,
  gx_anarchy_phase: false,
  ...overrides,
});

/** 初始化15地块状态，根据地图阶段设置正确的旗标 */
const initDebugTileState = (flags: Record<string, any>, phase: string): Record<string, any> => {
  const f = { ...flags };
  switch (phase) {
    case 'gx_anarchy': {
      const ownerMap: Record<string, string> = { b3: 'left', admin: 'school', b1b2: 'gouxiong', auditorium: 'gouxiong', lab: 'school', playground: 'left' };
      ALL_SUB_TILES.forEach(t => {
        f[`gx_map_owner_tile_${t.id}`] = ownerMap[t.buildingId];
        f[`tile_ctrl_${t.id}`] = ownerMap[t.buildingId] === 'gouxiong' ? 70 : ownerMap[t.buildingId] === 'left' ? 50 : 20;
      });
      break;
    }
    case 'lu_purge': {
      ALL_SUB_TILES.forEach(t => {
        f[`lu_purge_zone_level_tile_${t.id}`] = 0;
        f[`lu_purge_action_tile_${t.id}`] = true;
        f[`tile_ctrl_${t.id}`] = 40;
      });
      break;
    }
    case 'haobang_commune': {
      ALL_SUB_TILES.forEach(t => {
        f[`haobang_commune_zone_level_tile_${t.id}`] = 1;
        f[`haobang_commune_action_tile_${t.id}`] = true;
        f[`tile_ctrl_${t.id}`] = 65;
      });
      break;
    }
    case 'jidi': {
      ALL_SUB_TILES.forEach(t => {
        f[`tile_ctrl_${t.id}`] = 0;
      });
      break;
    }
    case 'yang_yule': {
      ALL_SUB_TILES.forEach(t => {
        f[`tile_ctrl_${t.id}`] = t.studentControl;
      });
      break;
    }
    case 'rebellion':
    default: {
      ALL_SUB_TILES.forEach(t => {
        f[`tile_ctrl_${t.id}`] = t.studentControl;
      });
      break;
    }
  }
  return f;
};

export const DECISIONS: Decision[] = [
  {
    id: 'host_culture_festival',
    title: '举办校园文化节',
    description: '消耗 50 TPR 和 50 SS。学生理智度 +10，权力平衡偏向素质教育 5%。',
    effectsText: ['学生理智 +10', '权力平衡偏向素质教育 5%', '-消耗 50 TPR + 50 SS'],
    costPP: 0,
    costText: '50 TPR + 50 SS',
    requirementsText: ['完成国策：学生自治赋权'],
    cooldownDays: 30,
    isVisible: (state) => state.completedFocuses.includes('empower_student_unions'),
    canAfford: (state) => state.stats.tpr >= 50 && state.stats.ss >= 50,
    effect: (state) => ({
      stats: { ...state.stats, tpr: Math.max(0, state.stats.tpr - 50), ss: Math.max(0, state.stats.ss - 50), studentSanity: Math.min(100, state.stats.studentSanity + 10) },
      parliamentState: state.parliamentState ? { ...state.parliamentState, powerBalance: Math.max(0, state.parliamentState.powerBalance - 5) } : undefined
    })
  },
  {
    id: 'independent_media_forum',
    title: '开展独立媒体论坛',
    description: '消耗 30 TPR 和 20 PP。学生理智度 +5，权力平衡偏向素质教育 3%。',
    effectsText: ['学生理智 +5', '权力平衡偏向素质教育 3%', '-消耗 30 TPR'],
    costPP: 20,
    costText: '30 TPR',
    requirementsText: ['完成国策：媒体支持'],
    cooldownDays: 20,
    isVisible: (state) => state.completedFocuses.includes('student_media_support'),
    canAfford: (state) => state.stats.tpr >= 30,
    effect: (state) => ({
      stats: { ...state.stats, tpr: Math.max(0, state.stats.tpr - 30), studentSanity: Math.min(100, state.stats.studentSanity + 5) },
      parliamentState: state.parliamentState ? { ...state.parliamentState, powerBalance: Math.max(0, state.parliamentState.powerBalance - 3) } : undefined
    })
  },
  {
    id: 'student_academic_salon',
    title: '学生自发学术沙龙',
    description: '消耗 40 TPR 和 30 SS。学生理智度 +8，权力平衡偏向素质教育 4%。',
    effectsText: ['学生理智 +8', '权力平衡偏向素质教育 4%', '-消耗 40 TPR + 30 SS'],
    costPP: 0,
    costText: '40 TPR + 30 SS',
    requirementsText: ['完成国策：奥赛赞助'],
    cooldownDays: 25,
    isVisible: (state) => state.completedFocuses.includes('academic_competition_sponsorship'),
    canAfford: (state) => state.stats.tpr >= 40 && state.stats.ss >= 30,
    effect: (state) => ({
      stats: { ...state.stats, tpr: Math.max(0, state.stats.tpr - 40), ss: Math.max(0, state.stats.ss - 30), studentSanity: Math.min(100, state.stats.studentSanity + 8) },
      parliamentState: state.parliamentState ? { ...state.parliamentState, powerBalance: Math.max(0, state.parliamentState.powerBalance - 4) } : undefined
    })
  },
  {
    id: 'all_school_club_exhibition',
    title: '全校社团联合展演',
    description: '消耗 60 TPR 和 60 SS。学生理智度 +15，权力平衡偏向素质教育 8%。',
    effectsText: ['学生理智 +15', '权力平衡偏向素质教育 8%', '-消耗 60 TPR + 60 SS'],
    costPP: 0,
    costText: '60 TPR + 60 SS',
    requirementsText: ['完成国策：课外活动基金'],
    cooldownDays: 45,
    isVisible: (state) => state.completedFocuses.includes('extracurricular_activities_fund'),
    canAfford: (state) => state.stats.tpr >= 60 && state.stats.ss >= 60,
    effect: (state) => ({
      stats: { ...state.stats, tpr: Math.max(0, state.stats.tpr - 60), ss: Math.max(0, state.stats.ss - 60), studentSanity: Math.min(100, state.stats.studentSanity + 15) },
      parliamentState: state.parliamentState ? { ...state.parliamentState, powerBalance: Math.max(0, state.parliamentState.powerBalance - 8) } : undefined
    })
  },
  {
    id: 'jidi_sell_tpr_for_pp',
    title: '出售多余教辅',
    description: '将库存的教辅资料出售给下级市场。消耗 1000 TPR，获得 50 PP。',
    effectsText: ['政治点数 +50', '-消耗 1000 TPR'],
    costPP: 0,
    costText: '1000 TPR',
    requirementsText: ['完成国策：建立及第委员会'],
    cooldownDays: 14,
    isVisible: (state) => state.completedFocuses.includes('jidi_establish_committee'),
    canAfford: (state) => state.stats.tpr >= 1000,
    effect: (state) => ({
      stats: { ...state.stats, tpr: Math.max(0, state.stats.tpr - 1000), pp: state.stats.pp + 50 }
    })
  },
  {
    id: 'jidi_sell_tpr_for_gdp',
    title: '教辅捆绑销售',
    description: '强制要求学生购买教辅套餐。消耗 2000 TPR，及第资本GDP增加 100万，学生理智度 -5。',
    effectsText: ['及第GDP +100万', '-学生理智 -5', '-消耗 2000 TPR'],
    costPP: 10,
    costText: '2000 TPR',
    requirementsText: ['完成国策：绩效指标'],
    cooldownDays: 30,
    isVisible: (state) => state.completedFocuses.includes('jidi_performance_metrics'),
    canAfford: (state) => state.stats.tpr >= 2000 && state.stats.pp >= 10,
    effect: (state) => ({
      stats: { ...state.stats, tpr: Math.max(0, state.stats.tpr - 2000), studentSanity: Math.max(0, state.stats.studentSanity - 5) },
      jidiCorporateState: state.jidiCorporateState ? { ...state.jidiCorporateState, gdp: state.jidiCorporateState.gdp + 100 } : undefined
    })
  },
  {
    id: 'jidi_sell_tpr_for_stab',
    title: '用题海麻痹学生',
    description: '通过海量的作业让学生无暇思考反抗。消耗 1500 TPR，稳定度 +10%，学生理智度 -10。',
    effectsText: ['稳定度 +10%', '-学生理智 -10', '-消耗 1500 TPR'],
    costPP: 20,
    costText: '1500 TPR',
    requirementsText: ['完成国策：及第垄断'],
    cooldownDays: 20,
    isVisible: (state) => state.completedFocuses.includes('jidi_monopoly'),
    canAfford: (state) => state.stats.tpr >= 1500 && state.stats.pp >= 20,
    effect: (state) => ({
      stats: { ...state.stats, tpr: Math.max(0, state.stats.tpr - 1500), stab: Math.min(100, state.stats.stab + 10), studentSanity: Math.max(0, state.stats.studentSanity - 10) }
    })
  },
  {
    id: 'jidi_sell_tpr_for_bureau_anger',
    title: '向教育局上贡教辅成果',
    description: '将最新的教辅研发成果作为政绩上报。消耗 3000 TPR，教育局愤怒 -20%。',
    effectsText: ['教育局愤怒 -20%', '-消耗 3000 TPR'],
    costPP: 50,
    costText: '3000 TPR',
    requirementsText: ['完成国策：企业乌托邦'],
    cooldownDays: 60,
    isVisible: (state) => state.completedFocuses.includes('jidi_corporate_utopia'),
    canAfford: (state) => state.stats.tpr >= 3000 && state.stats.pp >= 50,
    effect: (state) => {
      let newState = { ...state };
      newState.stats = { ...newState.stats, tpr: Math.max(0, newState.stats.tpr - 3000) };
      if (newState.jidiCorporateState && newState.jidiCorporateState.riotState) {
        newState.jidiCorporateState = {
          ...newState.jidiCorporateState,
          riotState: {
            ...newState.jidiCorporateState.riotState,
            bureauAnger: Math.max(0, newState.jidiCorporateState.riotState.bureauAnger - 20)
          }
        };
      }
      return newState;
    }
  },
  {
    id: 'raid_dorm',
    title: '突击查寝',
    description: '稳定度 +5%，学生支持度 -3%。',
    effectsText: ['稳定度 +5%', '-学生支持度 -3%'],
    costPP: 25,
    cooldownDays: 7,
    effect: (state) => ({
      stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 5), ss: Math.max(0, state.stats.ss - 3) }
    })
  },
  {
    id: 'print_flyers',
    title: '地下印刷红蛤传单',
    description: '学生支持度 +5%，稳定度 -2%。',
    effectsText: ['学生支持度 +5%', '-稳定度 -2%'],
    costPP: 30,
    cooldownDays: 14,
    effect: (state) => ({
      stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 5), stab: Math.max(0, state.stats.stab - 2) }
    })
  },
  {
    id: 'anti_capital_campaign',
    title: '抵制商业化',
    description: '资本渗透度 -10%，稳定度 -5%。',
    effectsText: ['资本渗透 -10%', '-稳定度 -5%'],
    costPP: 40,
    cooldownDays: 14,
    effect: (state) => ({
      stats: { ...state.stats, capitalPenetration: Math.max(0, state.stats.capitalPenetration - 10), stab: Math.max(0, state.stats.stab - 5) }
    })
  },
  {
    id: 'buy_papers',
    title: '向及第教育妥协购买密卷',
    description: '卷子储备 +500，资本渗透度 +20%。',
    effectsText: ['卷子储备 +500', '-资本渗透 +20%'],
    costPP: 50,
    cooldownDays: 30,
    effect: (state) => ({
      stats: { ...state.stats, tpr: state.stats.tpr + 500, capitalPenetration: state.stats.capitalPenetration + 20 }
    })
  },
  {
    id: 'incite_anger',
    title: '煽动学生情绪',
    description: '激进派愤怒 +30%，稳定度 -10%。',
    effectsText: ['激进愤怒 +30%', '-稳定度 -10%'],
    costPP: 20,
    cooldownDays: 10,
    effect: (state) => ({
      stats: { ...state.stats, radicalAnger: state.stats.radicalAnger + 30, stab: Math.max(0, state.stats.stab - 10) }
    })
  },
  {
    id: 'reform_recruit',
    title: '招募先锋党员',
    description: '先锋党员 +10，学生支持度 -2%。',
    effectsText: ['先锋党员 +10', '-学生支持度 -2%'],
    costPP: 25,
    requirementsText: ['完成国策：扩充先锋队'],
    cooldownDays: 14,
    isVisible: (state) => !!state.reformState?.unlockedRecruitDecisions,
    effect: (state) => ({
      stats: { ...state.stats, ss: Math.max(0, state.stats.ss - 2) },
      reformState: state.reformState ? { ...state.reformState, vanguardMembers: state.reformState.vanguardMembers + 10 } : undefined
    })
  },
  {
    id: 'reform_sanity',
    title: '心理疏导讲座',
    description: '学生理智度 +10%，稳定度 +2%。',
    effectsText: ['学生理智 +10%', '稳定度 +2%'],
    costPP: 30,
    requirementsText: ['完成国策：心理疏导运动'],
    cooldownDays: 21,
    isVisible: (state) => !!state.reformState?.unlockedSanityDecisions,
    effect: (state) => ({
      stats: { ...state.stats, studentSanity: Math.min(100, state.stats.studentSanity + 10), stab: Math.min(100, state.stats.stab + 2) }
    })
  },
  {
    id: 'reform_anger',
    title: '安抚激进情绪',
    description: '激进愤怒度 -15%，联盟团结度 +5%。',
    effectsText: ['激进愤怒 -15%', '联盟团结 +5%'],
    costPP: 35,
    requirementsText: ['完成国策：安抚激进情绪'],
    cooldownDays: 21,
    isVisible: (state) => !!state.reformState?.unlockedAngerDecisions,
    effect: (state) => ({
      stats: { ...state.stats, radicalAnger: Math.max(0, state.stats.radicalAnger - 15), allianceUnity: Math.min(100, state.stats.allianceUnity + 5) }
    })
  },
  {
    id: 'lower_sanity',
    title: '推行二次元解构',
    description: '学生理智值 -20%，学生支持度 +10%。',
    effectsText: ['学生支持度 +10%', '-学生理智 -20%'],
    costPP: 30,
    cooldownDays: 15,
    effect: (state) => ({
      stats: { ...state.stats, studentSanity: Math.max(0, state.stats.studentSanity - 20), ss: Math.min(100, state.stats.ss + 10) }
    })
  },
  {
    id: 'exchange_tpr_for_pp',
    title: '倒卖试卷储备',
    description: '消耗 1000 TPR，获得 50 PP。',
    effectsText: ['政治点数 +50', '-消耗 1000 TPR'],
    costPP: 0,
    costText: '1000 TPR',
    requirementsText: ['已解锁资源兑换机制'],
    cooldownDays: 14,
    isVisible: (state) => !!state.flags.unlockedResourceExchange,
    canAfford: (state) => state.stats.tpr >= 1000,
    effect: (state) => ({
      stats: { ...state.stats, tpr: state.stats.tpr - 1000, pp: state.stats.pp + 50 }
    })
  },
  {
    id: 'exchange_ss_for_pp',
    title: '动员学生支持',
    description: '消耗 20% 学生支持度，获得 50 PP。',
    effectsText: ['政治点数 +50', '-消耗 20 SS'],
    costPP: 0,
    costText: '20 SS',
    requirementsText: ['已解锁资源兑换机制'],
    cooldownDays: 14,
    isVisible: (state) => !!state.flags.unlockedResourceExchange,
    canAfford: (state) => state.stats.ss >= 20,
    effect: (state) => ({
      stats: { ...state.stats, ss: state.stats.ss - 20, pp: state.stats.pp + 50 }
    })
  },
  {
    id: 'mock_exam_sprint',
    title: '组织一模冲刺',
    description: '消耗 500 卷子储备，化解一模危机。',
    effectsText: ['化解一模考试危机', '-消耗 500 TPR'],
    costPP: 20,
    costText: '500 TPR',
    requirementsText: ['一模考试危机进行中', '每局仅可使用一次'],
    cooldownDays: 0,
    isVisible: (state) => !state.flags.mock_exam_sprint_used,
    canAfford: (state) => state.stats.tpr >= 500 && state.crises.some(c => c.id === 'mock_exam'),
    effect: (state) => {
      return {
        stats: { ...state.stats, tpr: state.stats.tpr - 500 },
        crises: state.crises.filter(c => c.id !== 'mock_exam'),
        flags: { ...state.flags, mock_exam_sprint_used: true }
      };
    }
  },
  {
    id: 'big_character_poster',
    title: '大字报运动',
    description: '真左派决议：学生支持度 +10%，激进愤怒 +10%，稳定度 -5%。',
    effectsText: ['学生支持度 +10%', '激进愤怒 +10%', '-稳定度 -5%'],
    costPP: 50,
    requirementsText: ['完成国策：真左派巩固'],
    cooldownDays: 20,
    isVisible: (state) => state.completedFocuses.includes('true_left_consolidation'),
    canAfford: (state) => state.completedFocuses.includes('true_left_consolidation'),
    effect: (state) => ({
      stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 10), radicalAnger: Math.min(100, state.stats.radicalAnger + 10), stab: Math.max(0, state.stats.stab - 5) }
    })
  },
  {
    id: 'confiscate_assets',
    title: '没收反动资产',
    description: '真左派决议：获得 300 TPR，联盟团结度 -5%。',
    effectsText: ['卷子储备 +300', '-联盟团结 -5%'],
    costPP: 30,
    requirementsText: ['完成国策：真左派巩固'],
    cooldownDays: 15,
    isVisible: (state) => state.completedFocuses.includes('true_left_consolidation'),
    canAfford: (state) => state.completedFocuses.includes('true_left_consolidation'),
    effect: (state) => ({
      stats: { ...state.stats, tpr: state.stats.tpr + 300, allianceUnity: Math.max(0, state.stats.allianceUnity - 5) }
    })
  },
  {
    id: 'campus_elections',
    title: '校园民主选举',
    description: '民主派决议：联盟团结度 +15%，稳定度 +10%。',
    effectsText: ['联盟团结 +15%', '稳定度 +10%'],
    costPP: 60,
    requirementsText: ['完成国策：温和派接管'],
    cooldownDays: 30,
    isVisible: (state) => state.completedFocuses.includes('pan_takeover'),
    canAfford: (state) => state.completedFocuses.includes('pan_takeover'),
    effect: (state) => ({
      stats: { ...state.stats, allianceUnity: Math.min(100, state.stats.allianceUnity + 15), stab: Math.min(100, state.stats.stab + 10) }
    })
  },
  {
    id: 'academic_freedom',
    title: '学术自由讲座',
    description: '民主派决议：学生理智值 +15%，消耗 100 TPR。',
    effectsText: ['学生理智 +15%', '-消耗 100 TPR'],
    costPP: 40,
    costText: '100 TPR',
    requirementsText: ['完成国策：温和派接管'],
    cooldownDays: 20,
    isVisible: (state) => state.completedFocuses.includes('pan_takeover'),
    canAfford: (state) => state.completedFocuses.includes('pan_takeover') && state.stats.tpr >= 100,
    effect: (state) => ({
      stats: { ...state.stats, studentSanity: Math.min(100, state.stats.studentSanity + 15), tpr: state.stats.tpr - 100 }
    })
  },
  {
    id: 'purge_revisionists',
    title: '清洗修正主义者',
    description: '真左派决议：党内集权度 +10%，联盟团结度 -10%，稳定度 +10%。',
    effectsText: ['党内集权 +10%', '稳定度 +10%', '-联盟团结 -10%'],
    costPP: 60,
    requirementsText: ['完成国策：正统派主导，或极权线的大清洗行动'],
    cooldownDays: 30,
    isVisible: (state) => state.completedFocuses.includes('orthodox_dominance') || (state.currentFocusTree === 'treeA_lu_bohan' && state.completedFocuses.includes('great_purge_map_phase')),
    canAfford: (state) => state.completedFocuses.includes('orthodox_dominance') || (state.currentFocusTree === 'treeA_lu_bohan' && state.completedFocuses.includes('great_purge_map_phase')),
    effect: (state) => ({
      stats: { ...state.stats, partyCentralization: Math.min(100, state.stats.partyCentralization + 10), allianceUnity: Math.max(0, state.stats.allianceUnity - 10), stab: Math.min(100, state.stats.stab + 10) }
    })
  },
  {
    id: 'student_referendum',
    title: '发起全校公投',
    description: '民主派决议：联盟团结度 +20%，党内集权度 -15%。',
    effectsText: ['联盟团结 +20%', '-党内集权 -15%'],
    costPP: 80,
    requirementsText: ['完成国策：全面民主改革'],
    cooldownDays: 45,
    isVisible: (state) => state.completedFocuses.includes('democratic_reforms'),
    canAfford: (state) => state.completedFocuses.includes('democratic_reforms'),
    effect: (state) => ({
      stats: { ...state.stats, allianceUnity: Math.min(100, state.stats.allianceUnity + 20), partyCentralization: Math.max(0, state.stats.partyCentralization - 15) }
    })
  },
  {
    id: 'delay_reform_crisis',
    title: '推迟题改危机',
    description: '通过高昂的政治代价，将“做题改革付之东流”危机推迟10天。最多推迟10次。',
    effectsText: ['题改危机倒计时 +10 天'],
    costPP: 100,
    requirementsText: ['做题改革危机进行中', '最多使用 10 次'],
    cooldownDays: 0,
    isVisible: (state) => state.crises.some(c => c.id === 'reform_fail_crisis'),
    canAfford: (state) => state.stats.pp >= 100 && (state.flags['reform_delay_count'] || 0) < 10,
    effect: (state) => {
      const newCrises = state.crises.map(c => {
        if (c.id === 'reform_fail_crisis') {
          return { ...c, daysLeft: c.daysLeft + 10 };
        }
        return c;
      });
      return {
        crises: newCrises,
        flags: { ...state.flags, reform_delay_count: (state.flags['reform_delay_count'] || 0) + 1 }
      };
    }
  },
  {
    id: 'yang_yule_ascension',
    title: '“杨特”出山',
    description: '耗费 20 学生支持度。杨玉乐接管大权，进入杨玉乐专属国策树。',
    effectsText: ['进入杨玉乐线（名师工作室）', '杨玉乐接管大权', '-消耗 20 SS'],
    costPP: 0,
    costText: '20 SS',
    requirementsText: ['攻下B3后满10天且稳定度 < 35（杨玉乐在任时）', '尚未进入杨玉乐线'],
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.yang_yule_decision_unlocked && !state.flags.yang_yule_route_started,
    canAfford: (state) => state.stats.ss >= 20,
    effect: (state) => ({
      stats: { ...state.stats, ss: state.stats.ss - 20 },
      currentFocusTree: 'treeB',
      completedFocuses: [],
      ideologies: {
        authoritarian: 10,
        reactionary: 40,
        liberal: 5,
        radical_socialism: 5,
        anarcho_capitalism: 5,
        deconstructivism: 5,
        test_taking: 30,
      },
      activeMinigame: null,
      advisors: state.advisors.map(a => a?.id === 'yang_yule' ? null : a),
      crises: state.crises.filter(c => c.id !== 'school_counterattack' && c.id !== 'alliance_collapse'),
      nationalSpirits: state.nationalSpirits.filter(ns => !['red_campus', 'student_council', 'awakened_binhu', 'assembly_dynamics', 'democratic_councils_spirit'].includes(ns.id)).concat({
        id: 'yang_yule_regime',
        name: '代理副校长',
        description: "杨玉乐没有正式接任副校长，暂代其职。这个位置给他的是处理日常事务的实权，而不是名分，因此他维持局面的方式更依赖个人判断。",
        type: 'positive',
        effects: { stabDaily: 0.2, ppDaily: 0.1 }
      }),
      yangYuleState: {
        fengFavor: 50,
        teacherSupport: 50,
        health: 100,
        thermosUsesThisWeek: 0,
        medicineUsesThisWeek: 0,
        dailyDecisionUsed: false,
        rebelLocations: {},
        unlockedMechanics: {
          desk: false,
          map: false,
          health: false,
        }
      },
      leader: {
        name: '杨玉乐',
        title: '名师工作室代理校长',
        portrait: 'yang_yule',
        ideology: 'reactionary',
        description: "杨玉乐是合肥一中的名师工作室负责人，同时代理校长职务。这一位置使他不必事事站到台前，也能凭借特级教师的资历介入校内事务。他是校内保守派的代表，老谋深算，面对学生运动更倾向于分化瓦解，而非正面压服：拆散学生内部的共识，把政治热情重新引回课堂与考试的正轨。在他看来，学校首先是维持秩序与成绩的机构，越出课本的动员只会让教学停摆，最终受损的仍是学生。这种立场在校内自有市场，也使他得以在风潮中保持影响力。但代理二字本身就说明他的权威并不完整：他能化解眼前的运动，却给不出比纪律和分数更有说服力的东西。",
        buffs: ['老谋深算 (每日PP +0.25)']
      },
      flags: { ...state.flags, yang_yule_route_started: true },
      // v8.11 杨玉乐「维稳」法案组合：高压管理 + 衡水作息 + 主任委员会 + 应试至上
      lawSystem: { discipline: 'strict', schedule: 'hengshui_schedule', personnel: 'director_committee', education: 'exam_above_all' },
      activeEvent: {
        id: 'enter_yang_yule_route',
        title: '“杨特”出山',
        description: 'B3教学楼的楼梯间里充斥着汗臭、防暴盾牌的碰撞声和声嘶力竭的叫骂。合一内战爆发已经过去了四个小时。\n\n高三年级部主任吴福军的衬衫已经完全被冷汗湿透。他引以为傲的保安队和学生督察，在王照凯布置的课桌街垒和灭火器烟雾阵面前碰得头破血流。王照凯的“钢铁红蛤”用严密的纪律接管了潘仁越的浪漫主义起义，现在的B3楼顶是一座真正的堡垒。\n\n“给我砸！用液压剪把门剪开！全给他们记大过！开除！”吴福军在楼道里无能狂怒，他的嗓子已经喊哑了。\n\n但他心里清楚，自己已经完了。教育局的电话已经打到了封安宝的办公室，如果事情闹大，如果哪怕有一个学生在冲突中受伤，或者从楼上跳下去，他吴福军就是第一个被封安宝扔出去平息众怒的替罪羊。暴力威慑一旦失效，暴君就变成了小丑。\n\n就在吴福军气急败坏，准备下令强行破拆的时候，一只苍老却稳定的手按住了他的肩膀。\n\n“吴主任，歇歇吧。强攻要是见了血，封校长和教育局那边，你我可都担待不起啊。”\n\n吴福军猛地回头，看到了端着保温杯的杨玉乐。这位平时在教务会上连个响屁都不敢放的老特级教师，此刻虽然满脸愁容，但眼镜片后的目光却冷得像冰。杨玉乐知道，吴福军的暴力已经把局势熬到了最脆弱的临界点——学生们的肾上腺素正在消退，取而代之的是对未来的本能恐惧。\n\n现在，是他出场摘桃子的时候了。',
        buttonText: '唱白脸的屠夫退场了。'
      }
    })
  },
  // --- v8.5 吴福军镇压线决议 ---
  {
    id: 'wu_raise_martial',
    title: '提升戒严等级',
    description: '发布新一轮戒严令。镇压效率提升，但学生的愤怒也在无声累积。',
    effectsText: ['戒严等级 +1（最高3级）', '-学生愤怒 +8', '吴福军野心 +3'],
    costPP: 20,
    requirementsText: ['铁腕时代进行中', '戒严等级 < 3'],
    cooldownDays: 20,
    isVisible: (state) => !!state.wuState && state.wuState.martialLawLevel < 3,
    effect: (state) => state.wuState ? ({
      wuState: { ...state.wuState, martialLawLevel: Math.min(3, state.wuState.martialLawLevel + 1), studentAnger: Math.min(100, state.wuState.studentAnger + 8), wuAmbition: Math.min(100, state.wuState.wuAmbition + 3) }
    }) : {}
  },
  {
    id: 'wu_pr_press',
    title: '舆论公关',
    description: '联系家长群意见领袖，投放"正面报道"，把网络上的声音压下去。',
    effectsText: ['舆论压力 -15%', '-封校长信任 -5%'],
    costPP: 30,
    requirementsText: ['铁腕时代进行中'],
    cooldownDays: 25,
    isVisible: (state) => !!state.wuState,
    effect: (state) => state.wuState ? ({
      wuState: { ...state.wuState, publicOpinion: Math.max(0, state.wuState.publicOpinion - 15), fengTrust: Math.max(0, state.wuState.fengTrust - 5) }
    }) : {}
  },
  {
    id: 'wu_parents_meeting',
    title: '家长会安抚',
    description: '召开线上家长会，重申"一切正常"。家长们安心了，老师们也能喘口气。',
    effectsText: ['舆论压力 -10%', '教师支持 +5%'],
    costPP: 25,
    requirementsText: ['铁腕时代进行中'],
    cooldownDays: 25,
    isVisible: (state) => !!state.wuState,
    effect: (state) => state.wuState ? ({
      wuState: { ...state.wuState, publicOpinion: Math.max(0, state.wuState.publicOpinion - 10), teacherSupport: Math.min(100, state.wuState.teacherSupport + 5) }
    }) : {}
  },
  {
    id: 'wu_commend_wu',
    title: '表彰吴福军',
    description: '再给吴主任一次露脸的机会。他高兴，残党就倒霉——但每次表彰，都让他的腰板更直一点。',
    effectsText: ['吴福军野心 +8', '封校长信任 +5%', '残党实力 -5%'],
    costPP: 15,
    requirementsText: ['铁腕时代进行中'],
    cooldownDays: 20,
    isVisible: (state) => !!state.wuState,
    effect: (state) => state.wuState ? ({
      wuState: { ...state.wuState, wuAmbition: Math.min(100, state.wuState.wuAmbition + 8), fengTrust: Math.min(100, state.wuState.fengTrust + 5), guerrillaStrength: Math.max(0, state.wuState.guerrillaStrength - 5) }
    }) : {}
  },
  {
    id: 'wu_minigame_crackdown',
    title: '午夜清场行动',
    description: '组织一次大规模清场演习。驱散聚集人群，震慑地下网络。',
    effectsText: ['开启小游戏：午夜清场（4级结算）'],
    costPP: 25,
    requirementsText: ['铁腕时代进行中'],
    cooldownDays: 30,
    isVisible: (state) => !!state.flags.wu_route_active,
    effect: (state) => ({ activeMinigame: 'wu_crackdown' })
  },
  {
    id: 'wu_negotiation_push',
    title: '推动和谈进程',
    description: '通过中间人向残党释放更多善意，推动谈判。',
    effectsText: ['谈判进度 +10', '-封校长信任 -3%'],
    costPP: 20,
    requirementsText: ['和谈窗口已开启', '谈判进度 < 100'],
    cooldownDays: 15,
    isVisible: (state) => !!state.flags.wu_negotiation_open && !!state.wuState && state.wuState.negotiationProgress < 100,
    effect: (state) => state.wuState ? ({
      wuState: { ...state.wuState, negotiationProgress: Math.min(100, state.wuState.negotiationProgress + 10), fengTrust: Math.max(0, state.wuState.fengTrust - 3) }
    }) : {}
  },
  // --- v8.0 跨路线小游戏决议 ---
  {
    id: 'drill_siege_b3',
    title: '城防演习',
    description: '按B3保卫战预案进行模拟攻防，检验防御体系。胜则巩固B3地块与防御工事，负则暴露短板、挫伤士气。',
    effectsText: ['开启小游戏：B3保卫战演习', '胜利：B3三地块控制 +15、防御 +3 天、SS +8', '-失败：B3三地块控制 -12、稳定 -5'],
    costPP: 30,
    requirementsText: ['起义后·Tree A 地图斗争阶段', '非狗熊线无政府状态'],
    cooldownDays: 45,
    isVisible: (state) => !!state.flags.rebellion_started && !state.flags.map_phase_ended
      && state.currentFocusTree.startsWith('treeA') && !state.flags.gx_anarchy_phase,
    effect: (state) => ({ activeMinigame: 'siege_b3', flags: { ...state.flags, siege_b3_drill: true } })
  },
  {
    id: 'poster_agitation',
    title: '海报宣传攻势',
    description: '在全校六大区域张贴宣传海报，唤起群众对路线事业的理解与支持。',
    effectsText: ['开启小游戏：海报宣传战（覆盖率结算）'],
    costPP: 20,
    requirementsText: ['起义后·Tree A 地图斗争阶段', '非狗熊线无政府状态'],
    cooldownDays: 30,
    isVisible: (state) => !!state.flags.rebellion_started && !state.flags.map_phase_ended
      && state.currentFocusTree.startsWith('treeA') && !state.flags.gx_anarchy_phase,
    effect: (state) => ({ activeMinigame: 'poster_war' })
  },
  // --- DEBUG DECISIONS ---
  {
    id: 'debug_switch_phase1',
    title: '[DEBUG] 切换至初始国策树',
    description: '测试模式：切换至初始阶段国策树。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'phase1',
      completedFocuses: [],
      activeFocus: null,
      leader: DEBUG_LEADERS.feng_anbao,
      flags: withDebugMapFlags(state)
    })
  },
  {
    id: 'debug_switch_treeA',
    title: '[DEBUG] 切换至泛左翼国策树',
    description: '测试模式：切换至泛左翼联盟阶段国策树。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'treeA',
      completedFocuses: [],
      activeFocus: null,
      leader: DEBUG_LEADERS.wang_zhaokai,
      flags: withDebugMapFlags(state)
    })
  },
  {
    id: 'debug_switch_treeA_pan',
    title: '[DEBUG] 切换至民主派国策树',
    description: '测试模式：切换至民主派国策树。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'treeA_pan',
      completedFocuses: [],
      activeFocus: null,
      leader: DEBUG_LEADERS.pan_renyue,
      flags: withDebugMapFlags(state)
    })
  },
  {
    id: 'debug_switch_treeA_pan_despair',
    title: '[DEBUG] 切换至民主派绝望国策树',
    description: '测试模式：切换至民主派绝望国策树。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'treeA_pan_despair',
      completedFocuses: [],
      activeFocus: null,
      leader: DEBUG_LEADERS.pan_renyue,
      flags: withDebugMapFlags(state)
    })
  },
  {
    id: 'debug_switch_treeA_true_left',
    title: '[DEBUG] 切换至真左派国策树',
    description: '测试模式：切换至真左派国策树。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'treeA_true_left',
      completedFocuses: [],
      activeFocus: null,
      leader: DEBUG_LEADERS.wang_zhaokai,
      flags: withDebugMapFlags(state)
    })
  },
  {
    id: 'debug_switch_treeA_lu_bohan',
    title: '[DEBUG] 切换至吕波汉国策树',
    description: '测试模式：切换至吕波汉国策树。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'treeA_lu_bohan',
      completedFocuses: [],
      activeFocus: null,
      leader: DEBUG_LEADERS.lu_bohan,
      flags: withDebugMapFlags(state, {
        red_toad_politburo_unlocked: true,
        lu_nkpd_mode: true,
      }),
      redToadState: state.redToadState || {
        overallConsensus: 55,
        factions: {
          orthodox: { influence: 30, loyalty: 70, retired: false },
          bear: { influence: 25, loyalty: 40, retired: false },
          pan: { influence: 15, loyalty: 20, retired: false },
          anarchy: { influence: 10, loyalty: 60, retired: false },
          testTaker: { influence: 20, loyalty: 50, retired: false },
        },
        activeBillId: null, billCooldown: 0,
        historicalBills: [], availableBills: [],
      }
    })
  },
  {
    id: 'debug_switch_treeA_haobang',
    title: '[DEBUG] 切换至豪邦国策树',
    description: '测试模式：切换至豪邦国策树。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'treeA_haobang',
      completedFocuses: [],
      activeFocus: null,
      leader: DEBUG_LEADERS.hao_bang,
      flags: withDebugMapFlags(state, {
        red_toad_politburo_unlocked: true,
        lu_nkpd_mode: false,
      }),
      redToadState: state.redToadState || {
        overallConsensus: 55,
        factions: {
          orthodox: { influence: 25, loyalty: 80, retired: false },
          bear: { influence: 20, loyalty: 60, retired: false },
          pan: { influence: 20, loyalty: 50, retired: false },
          anarchy: { influence: 10, loyalty: 30, retired: false },
          testTaker: { influence: 25, loyalty: 70, retired: false },
        },
        activeBillId: null, billCooldown: 0,
        historicalBills: [], availableBills: [],
      }
    })
  },
  {
    id: 'debug_switch_treeB',
    title: '[DEBUG] 切换至杨玉乐国策树',
    description: '测试模式：切换至杨玉乐国策树。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'treeB',
      completedFocuses: [],
      activeFocus: null,
      leader: DEBUG_LEADERS.yang_yule,
      flags: withDebugMapFlags(state, {
        yang_yule_route_started: true,
      })
    })
  },
  {
    id: 'debug_switch_jidi_tree',
    title: '[DEBUG] 切换至及第教育国策树',
    description: '测试模式：切换至及第教育国策树。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'jidi_tree',
      completedFocuses: [],
      activeFocus: null,
      leader: DEBUG_LEADERS.feng_anxiang,
      flags: withDebugMapFlags(state, {
        jidi_takeover_complete: true,
        jidi_new_era_active: true,
      }),
      jidiCorporateState: state.jidiCorporateState || {
        unlockedMechanics: { rnd: true, committee: true },
        gdp: 1200,
        gdpGrowth: 2.5,
        gdpHistory: [1000, 1100, 1200],
        admissionRate: 92,
        rndState: {
          phase: 'idle',
          daysInPhase: 0,
          testingIntensity: 5,
          daysSinceLastIntensityChange: 0,
        },
        committeeState: {
          seats: { jidi: 45, newOriental: 25, teachers: 20, disciplineCommittee: 10 },
          satisfaction: { jidi: 70, newOriental: 60, teachers: 50, disciplineCommittee: 65 },
          bureauInfluence: 50,
        }
      }
    })
  },
  {
    id: 'debug_switch_gouxiong_tree',
    title: '[DEBUG] 切换至狗熊国策树',
    description: '测试模式：切换至狗熊国策树。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'gouxiong_tree',
      completedFocuses: [],
      activeFocus: null,
      leader: DEBUG_LEADERS.gouxiong,
      flags: withDebugMapFlags(state, {
        rebellion_started: true,
        gouxiong_coup_complete: true,
      })
    })
  },
  {
    id: 'debug_switch_gx_ruin',
    title: '[DEBUG] 切换至狗熊线·天国永存（废墟线）',
    description: '测试模式：狗熊国策树 + 达璧判定完成且结果为天国永存（总好感<30），可直接点「搁浅的复仇」。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'gouxiong_tree',
      completedFocuses: ['gx_dabi_route_trial'],
      activeFocus: null,
      leader: DEBUG_LEADERS.gouxiong,
      gouxiongState: state.gouxiongState ? {
        ...state.gouxiongState,
        sanity: 55,
        affinities: { dabi: 10, maodun: 0, lante: 0, wushuo: 0 },
      } : state.gouxiongState,
      flags: withDebugMapFlags(state, {
        rebellion_started: true,
        gouxiong_coup_complete: true,
        gx_dabi_route_outcome: 'ruin',
      })
    })
  },
  {
    id: 'debug_trigger_true_left_good',
    title: '[DEBUG] 触发结局：合一大革命',
    description: '测试模式：直接弹出「同一杆麦克风」结局事件，确认后进入合一大革命结局画面。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: () => ({
      activeEvent: STORY_EVENTS.true_left_good_event,
    })
  },
  {
    id: 'debug_trigger_wang_pan_pact',
    title: '[DEBUG] 触发事件：王潘和解协定',
    description: '测试模式：直接弹出「十字路口的第三种答案」，选择后续路线并签署和解协定（金线起点）。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: () => ({
      activeEvent: FLAVOR_EVENTS.true_left_union_choice_event,
    })
  },
  {
    id: 'debug_set_leader_wang',
    title: '[DEBUG] 领导人：王照凯',
    description: '测试模式：仅切换当前领导人为王照凯。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: () => ({ leader: DEBUG_LEADERS.wang_zhaokai })
  },
  {
    id: 'debug_set_leader_pan',
    title: '[DEBUG] 领导人：潘仁越',
    description: '测试模式：仅切换当前领导人为潘仁越。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: () => ({ leader: DEBUG_LEADERS.pan_renyue })
  },
  {
    id: 'debug_set_leader_lu',
    title: '[DEBUG] 领导人：吕波汉',
    description: '测试模式：仅切换当前领导人为吕波汉。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: () => ({ leader: DEBUG_LEADERS.lu_bohan })
  },
  {
    id: 'debug_set_leader_haobang',
    title: '[DEBUG] 领导人：豪邦',
    description: '测试模式：仅切换当前领导人为豪邦。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: () => ({ leader: DEBUG_LEADERS.hao_bang })
  },
  {
    id: 'debug_set_leader_yang',
    title: '[DEBUG] 领导人：杨玉乐',
    description: '测试模式：仅切换当前领导人为杨玉乐。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: () => ({ leader: DEBUG_LEADERS.yang_yule })
  },
  {
    id: 'debug_set_leader_fengxiang',
    title: '[DEBUG] 领导人：封安祥',
    description: '测试模式：仅切换当前领导人为封安祥。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: () => ({ leader: DEBUG_LEADERS.feng_anxiang })
  },
  {
    id: 'debug_set_leader_gouxiong',
    title: '[DEBUG] 领导人：狗熊',
    description: '测试模式：仅切换当前领导人为狗熊。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: () => ({ leader: DEBUG_LEADERS.gouxiong })
  },
  {
    id: 'debug_unlock_minigame_frequency_war',
    title: '[DEBUG] 触发频率战小游戏',
    description: '测试模式：直接触发频率战小游戏。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({ activeMinigame: 'frequency_war' })
  },
  {
    id: 'debug_unlock_minigame_siege_b3',
    title: '[DEBUG] 触发B3保卫战小游戏',
    description: '测试模式：直接触发B3保卫战小游戏。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({ activeMinigame: 'siege_b3' })
  },
  {
    id: 'debug_unlock_minigame_nkpd_negotiation',
    title: '[DEBUG] 触发NKPD谈判小游戏',
    description: '测试模式：直接触发极权派谈判小游戏。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({ activeMinigame: 'nkpd_negotiation' })
  },
  {
    id: 'debug_switch_wu_tree',
    title: '[DEBUG] 切换至吴福军镇压线',
    description: '测试模式：进入铁腕时代国策树并初始化戒严状态。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'wu_tree',
      completedFocuses: [],
      activeFocus: null,
      leader: DEBUG_LEADERS.feng_anbao,
      flags: withDebugMapFlags(state, {
        wu_route_active: true,
        wu_crackdown_map_phase: true,
        wu_arrest_unlocked: true,
        wu_negotiation_open: false,
      }),
      wuState: {
        guerrillaStrength: 40,
        martialLawLevel: 1,
        fengTrust: 60,
        wuAmbition: 20,
        studentAnger: 30,
        teacherSupport: 40,
        publicOpinion: 20,
        crackdownActions: 0,
        negotiationProgress: 0,
      }
    })
  },
  {
    id: 'debug_trigger_wu_minigame',
    title: '[DEBUG] 触发午夜清场小游戏',
    description: '测试模式：直接触发午夜清场小游戏。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({ activeMinigame: 'wu_crackdown' })
  },
  {
    id: 'debug_switch_wu_p2_feng',
    title: '[DEBUG] 吴福军线二阶段：封安宝千年线',
    description: '测试模式：跳过一阶段，直接进入叙职判定后的二阶段（判定：模范校提名 → 秩序元年）。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'wu_tree_p2_feng',
      completedFocuses: [
        'wu_order_restored', 'wu_resume_classes', 'wu_secure_perimeter', 'wu_annual_review',
        'wu_martial_law', 'wu_night_patrol', 'wu_dorm_sweep',
        'wu_parents_forum', 'wu_teacher_relief', 'wu_club_concession',
        'wu_promote_wu', 'wu_independent_command',
      ],
      activeFocus: null,
      leader: DEBUG_LEADERS.feng_anbao,
      flags: withDebugMapFlags(state, {
        wu_route_active: true,
        wu_crackdown_map_phase: true,
        wu_phase2_active: true,
        wu_annual_review_done: true,
        wu_bureau_verdict: 'praise',
        wu_arrest_unlocked: true,
      }),
      wuState: {
        guerrillaStrength: 40,
        martialLawLevel: 2,
        fengTrust: 65,
        wuAmbition: 40,
        studentAnger: 35,
        teacherSupport: 55,
        publicOpinion: 25,
        crackdownActions: 6,
        negotiationProgress: 0,
      }
    })
  },
  {
    id: 'debug_switch_wu_p2_spring',
    title: '[DEBUG] 吴福军线二阶段：合一之春线',
    description: '测试模式：跳过一阶段，直接进入叙职判定后的二阶段（判定：限期整改 → 风暴前夕）。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'wu_tree_p2_spring',
      completedFocuses: [
        'wu_order_restored', 'wu_resume_classes', 'wu_secure_perimeter', 'wu_annual_review',
        'wu_martial_law', 'wu_night_patrol', 'wu_dorm_sweep',
        'wu_parents_forum', 'wu_teacher_relief', 'wu_club_concession',
        'wu_promote_wu', 'wu_independent_command',
      ],
      activeFocus: null,
      leader: DEBUG_LEADERS.feng_anbao,
      flags: withDebugMapFlags(state, {
        wu_route_active: true,
        wu_crackdown_map_phase: true,
        wu_phase2_active: true,
        wu_annual_review_done: true,
        wu_bureau_verdict: 'reprimand',
        wu_club_concession_done: true,
        wu_arrest_unlocked: true,
      }),
      wuState: {
        guerrillaStrength: 55,
        martialLawLevel: 2,
        fengTrust: 50,
        wuAmbition: 55,
        studentAnger: 50,
        teacherSupport: 40,
        publicOpinion: 60,
        crackdownActions: 9,
        negotiationProgress: 20,
      }
    })
  },
  {
    id: 'debug_switch_wu_p2_coup',
    title: '[DEBUG] 吴福军线二阶段：吴福军政变线',
    description: '测试模式：跳过一阶段，直接进入叙职判定后的二阶段（判定：不置可否 → 大权在握）。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      currentFocusTree: 'wu_tree_p2_coup',
      completedFocuses: [
        'wu_order_restored', 'wu_resume_classes', 'wu_secure_perimeter', 'wu_annual_review',
        'wu_martial_law', 'wu_night_patrol', 'wu_dorm_sweep',
        'wu_parents_forum', 'wu_teacher_relief', 'wu_club_concession',
        'wu_promote_wu', 'wu_independent_command',
      ],
      activeFocus: null,
      leader: DEBUG_LEADERS.feng_anbao,
      flags: withDebugMapFlags(state, {
        wu_route_active: true,
        wu_crackdown_map_phase: true,
        wu_phase2_active: true,
        wu_annual_review_done: true,
        wu_bureau_verdict: 'neutral',
        wu_night_patrol_active: true,
        wu_independent_command: true,
        wu_arrest_unlocked: true,
      }),
      wuState: {
        guerrillaStrength: 55,
        martialLawLevel: 2,
        fengTrust: 60,
        wuAmbition: 50,
        studentAnger: 50,
        teacherSupport: 45,
        publicOpinion: 40,
        crackdownActions: 8,
        negotiationProgress: 0,
      }
    })
  },
  {
    id: 'debug_add_resources',
    title: '[DEBUG] 获取大量资源',
    description: '测试模式：获得 1000 PP, 10000 TPR, 100 SS, 100 稳定度等。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      stats: {
        ...state.stats,
        pp: state.stats.pp + 1000,
        tpr: state.stats.tpr + 10000,
        ss: 100,
        stab: 100,
        studentSanity: 100,
        radicalAnger: 0,
        allianceUnity: 100,
        partyCentralization: 100
      }
    })
  },
  {
    id: 'debug_unlock_assembly',
    title: '[DEBUG] 解锁学生大会',
    description: '测试模式：解锁学生大会机制。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      completedFocuses: state.completedFocuses.includes('convene_assembly')
        ? state.completedFocuses
        : [...state.completedFocuses, 'convene_assembly'],
      flags: { ...state.flags, assembly_unlocked: true },
      parliamentState: state.parliamentState || {
        isUpgraded: false,
        powerBalanceUnlocked: true,
        powerBalance: 50,
        factionSupport: {
          orthodox: 50,
          bear: 50,
          pan: 50,
          otherDem: 50,
          testTaker: 50,
          conservativeDem: 50,
          jidiTutoring: 50,
        },
        activeBill: null,
      }
    })
  },
  {
    id: 'debug_unlock_red_toad_politburo',
    title: '[DEBUG] 解锁红蛤政治局',
    description: '测试模式：启用红蛤政治局并初始化派系数据。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: { ...state.flags, red_toad_politburo_unlocked: true },
      redToadState: state.redToadState || {
        overallConsensus: 55,
        factions: {
          orthodox: { id: 'orthodox', name: '正统派', leader: '王照凯', influence: 420, loyalty: 75, execution: 60, color: '#f0d44a', view: '[领袖视图]', portrait: 'faction_orthodox' },
          libertarian_socialist: { id: 'libertarian_socialist', name: '自社派', leader: '豪邦', influence: 280, loyalty: 70, execution: 45, color: '#4a90f0', view: '[基层信号]', portrait: 'faction_libertarian_socialist' },
          anarchist: { id: 'anarchist', name: '安那其派', leader: '时纪', influence: 180, loyalty: 55, execution: 35, color: '#4af0d4', view: '[信号丢失]', portrait: 'faction_anarchist' },
          internet_philosopher: { id: 'internet_philosopher', name: '网哲派', leader: '周红兵', influence: 120, loyalty: 45, execution: 20, color: '#d44af0', view: '[迷雾覆盖]', portrait: 'faction_internet_philosopher' },
          authoritarian: { id: 'authoritarian', name: '极权派', leader: '吕波汉', influence: 300, loyalty: 30, execution: 85, color: '#ff4444', view: '[保密视图]', portrait: 'faction_authoritarian' },
        },
        activeBillId: null,
        billCooldown: 0,
        historicalBills: [],
        availableBills: []
      }
    })
  },
  {
    id: 'debug_unlock_haobang_mechanics',
    title: '[DEBUG] 解锁豪邦后期机制',
    description: '测试模式：解锁新学生代表大会扩展机制与豪邦路线态度字段。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: {
        ...state.flags,
        assembly_unlocked: true,
        red_toad_politburo_unlocked: true,
        haobang_assembly_deluxe_ui: true,
      },
      currentFocusTree: 'treeA_haobang',
      leader: DEBUG_LEADERS.hao_bang,
      parliamentState: {
        ...(state.parliamentState || {
          isUpgraded: true,
          powerBalanceUnlocked: true,
          powerBalance: 50,
          factionSupport: {},
          activeBill: null,
        }),
        isUpgraded: true,
        haobangFactionAttitude: {
          orthodox: 45,
          bear: 35,
          pan: 62,
          otherDem: 58,
          testTaker: 50,
          conservativeDem: 52,
          jidiTutoring: 34,
        }
      }
    })
  },
  {
    id: 'debug_unlock_yang_yule_desk',
    title: '[DEBUG] 解锁杨玉乐办公桌',
    description: '测试模式：解锁杨玉乐办公桌机制。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      yangYuleState: {
        ...(state.yangYuleState || {
          fengFavor: 50,
          teacherSupport: 50,
          health: 100,
          thermosUsesThisWeek: 0,
          medicineUsesThisWeek: 0,
          dailyDecisionUsed: false,
          rebelLocations: {}
        }),
        unlockedMechanics: {
          desk: true,
          map: true,
          health: true
        }
      }
    })
  },
  {
    id: 'debug_unlock_cyber_deconstruction',
    title: '[DEBUG] 解锁赛博解构',
    description: '测试模式：解锁赛博解构机制。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => {
      const newAdvisors = [...state.advisors];
      if (!newAdvisors.some(a => a?.id === 'gouxiong_advisor')) {
        newAdvisors[0] = {
          id: 'gouxiong_advisor',
          name: '狗熊',
          title: '二次元解构大师',
          cost: 0,
          description: '解锁赛博解构机制',
          portrait: 'gouxiong',
          modifiers: {}
        };
      }
      return { advisors: newAdvisors };
    }
  },
  {
    id: 'debug_unlock_reform_decisions',
    title: '[DEBUG] 解锁改革委员会',
    description: '测试模式：解锁所有改革委员会相关决议和面板。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => {
      const currentReformState = state.reformState || ({} as any);
      return {
        flags: { ...state.flags, reform_unlocked: true },
        reformState: {
          progress: currentReformState.progress || 0,
          vanguardMembers: currentReformState.vanguardMembers || 50,
          regionalStubbornness: currentReformState.regionalStubbornness || {
            'B3': 60,
            'B1_B2': 40,
            'Admin': 80,
            'ArtHall': 30,
            'Lab': 50,
            'Playground': 20
          },
          activeMissions: currentReformState.activeMissions || {},
          baseSuccessRate: currentReformState.baseSuccessRate || 50,
          reformDaysElapsed: currentReformState.reformDaysElapsed || 0,
          juanhaoAttitude: currentReformState.juanhaoAttitude || 0,
          juanhaoEventsTriggered: currentReformState.juanhaoEventsTriggered || {},
          unlockedRecruitDecisions: true,
          unlockedSanityDecisions: true,
          unlockedAngerDecisions: true
        }
      };
    }
  },
  {
    id: 'debug_unlock_resource_exchange',
    title: '[DEBUG] 解锁资源兑换',
    description: '测试模式：解锁倒卖试卷储备和动员学生支持决议。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: { ...state.flags, unlockedResourceExchange: true }
    })
  },
  {
    id: 'debug_max_map_control',
    title: '[DEBUG] 拉满地图控制度',
    description: '测试模式：将所有区域的学生控制度设为100。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: {
        ...state.flags,
        ...Object.fromEntries(ALL_SUB_TILES.map(t => [`tile_ctrl_${t.id}`, 100])),
      }
    })
  },
  {
    id: 'debug_max_assembly_support',
    title: '[DEBUG] 拉满议会支持度',
    description: '测试模式：将所有派系的支持度设为100。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => {
      const newParliamentState = state.parliamentState ? { ...state.parliamentState } : {
        isUpgraded: true,
        powerBalanceUnlocked: true,
        powerBalance: 50,
        factionSupport: {},
        activeBill: undefined
      };
      newParliamentState.factionSupport = {
        orthodox: 100,
        bear: 100,
        pan: 100,
        otherDem: 100,
        testTaker: 100,
        conservativeDem: 100,
        jidiTutoring: 100
      };
      newParliamentState.haobangFactionAttitude = {
        orthodox: 100,
        bear: 100,
        pan: 100,
        otherDem: 100,
        testTaker: 100,
        conservativeDem: 100,
        jidiTutoring: 100,
      };
      return { parliamentState: newParliamentState as any };
    }
  },
  {
    id: 'debug_switch_map_phase_gx',
    title: '[DEBUG] 切换地图阶段：GX无政府战局',
    description: '测试模式：切换至狗熊无政府战区（自动初始化15地块所有权和控制度）。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: initDebugTileState(withDebugMapFlags(state, {
        gx_anarchy_phase: true,
        rebellion_started: true,
        gx_anarchy_action_tile_aud_screen: true, gx_anarchy_action_tile_aud_back: true, gx_anarchy_action_tile_aud_hall: true,
        gx_anarchy_action_tile_dorm_1_4: true, gx_anarchy_action_tile_dorm_5_7: true,
        gx_anarchy_action_tile_b3_a1a3: true, gx_anarchy_action_tile_b3_b1b2: true, gx_anarchy_action_tile_b3_tower: true,
        gx_anarchy_action_tile_court_area: true, gx_anarchy_action_tile_canteen: true, gx_anarchy_action_tile_track_field: true,
        gx_anarchy_action_tile_intl_dept: true, gx_anarchy_action_tile_lib_area: true,
        gx_anarchy_action_tile_admin_main: true, gx_anarchy_action_tile_admin_gym: true,
      }), 'gx_anarchy'),
      currentFocusTree: 'gouxiong_tree',
      leader: DEBUG_LEADERS.gouxiong,
    })
  },
  {
    id: 'debug_switch_map_phase_reform',
    title: '[DEBUG] 切换地图阶段：全面做题改革',
    description: '测试模式：切换至全面做题改革阶段。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: initDebugTileState(withDebugMapFlags(state, { map_phase_ended: true, rebellion_started: true, red_toad_politburo_unlocked: true }), 'default'),
      currentFocusTree: 'treeA_true_left',
      leader: DEBUG_LEADERS.wang_zhaokai,
    })
  },
  {
    id: 'debug_switch_map_phase_polling',
    title: '[DEBUG] 切换地图阶段：普选站网络',
    description: '测试模式：切换至普选站网络阶段。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: initDebugTileState(withDebugMapFlags(state, { polling_stations_unlocked: true }), 'default')
    })
  },
  {
    id: 'debug_switch_map_phase_peace',
    title: '[DEBUG] 切换地图阶段：和平重建',
    description: '测试模式：切换至和平重建阶段。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: initDebugTileState(withDebugMapFlags(state, { map_struggle_ended: true }), 'default')
    })
  },
  {
    id: 'debug_switch_map_phase_jidi',
    title: '[DEBUG] 切换地图阶段：及第教育接管',
    description: '测试模式：切换至及第教育接管阶段。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: initDebugTileState(withDebugMapFlags(state, {
        jidi_takeover_complete: true,
        jidi_new_era_active: true,
      }), 'jidi')
    })
  },
  {
    id: 'debug_switch_map_phase_rebellion',
    title: '[DEBUG] 切换地图阶段：武装起义',
    description: '测试模式：切换至武装起义阶段。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: initDebugTileState(withDebugMapFlags(state, { rebellion_started: true }), 'rebellion')
    })
  },
  {
    id: 'debug_switch_map_phase_lu_purge',
    title: '[DEBUG] 切换地图阶段：N.K.P.D.清洗图',
    description: '测试模式：切换至吕波汉路线清洗地图（自动解锁所有地块清洗授权）。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: initDebugTileState(withDebugMapFlags(state, {
        lu_purge_map_phase: true,
        red_toad_politburo_unlocked: true,
        lu_purge_map_actions: state.flags.lu_purge_map_actions || 0,
      }), 'lu_purge'),
      currentFocusTree: 'treeA_lu_bohan',
      leader: DEBUG_LEADERS.lu_bohan,
    })
  },
  {
    id: 'debug_switch_map_phase_haobang_commune',
    title: '[DEBUG] 切换地图阶段：学生公社建设图',
    description: '测试模式：切换至豪邦路线公社建设地图（自动解锁所有地块建设授权）。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: initDebugTileState(withDebugMapFlags(state, {
        haobang_commune_map_phase: true,
        red_toad_politburo_unlocked: true,
        haobang_commune_map_actions: state.flags.haobang_commune_map_actions || 0,
      }), 'haobang_commune'),
      currentFocusTree: 'treeA_haobang',
      leader: DEBUG_LEADERS.hao_bang,
    })
  },
  {
    id: 'debug_switch_map_phase_yang',
    title: '[DEBUG] 切换地图阶段：杨玉乐路线',
    description: '测试模式：切换至杨玉乐路线阶段。',
    costPP: 0,
    cooldownDays: 0,
    isVisible: (state) => !!state.flags.debug_mode,
    effect: (state) => ({
      flags: initDebugTileState(withDebugMapFlags(state, { yang_yule_route_started: true }), 'yang_yule')
    })
  }
];

export default function RightSidebar({ state, triggerDecision, triggerError }: RightSidebarProps) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleDecision = (decision: Decision) => {
    if (state.stats.pp < decision.costPP || (state.decisionCooldowns[decision.id] || 0) > 0 || (decision.canAfford && !decision.canAfford(state))) {
      triggerError();
      return;
    }
    triggerDecision(decision);
  };


  return (
    <div className="w-64 md:w-80 flex-shrink-0 tno-panel border-l border-tno-border h-full flex flex-col p-4 relative z-10" data-tour="decisions">
      
      <SituationMetrics state={state} />

      {/* Crises */}
       <div className="mb-4 flex flex-col max-h-64 min-h-0">
        <h2 className="text-tno-red font-bold text-lg mb-4 border-b border-tno-border pb-2 tracking-widest flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
          当前危机
        </h2>
        
        <div className="space-y-3 overflow-y-auto pr-1">
          {state.crises.map(crisis => (
            <HoverWindow
              key={crisis.id}
              width={300}
              estimateHeight={190}
              content={
                <div className="bg-tno-panel border border-tno-red/60 p-3 shadow-lg shadow-black/70">
                  <div className="flex justify-between items-baseline mb-1.5 border-b border-tno-red/30 pb-1">
                    <span className="font-bold text-sm text-tno-red">⚠ {crisis.title}</span>
                    <span className="text-[11px] text-tno-red font-bold crt-flicker">剩余 {crisis.daysLeft} / {(crisis.totalDays ?? 30)} 天</span>
                  </div>
                  {crisis.resolutionText && (
                    <div className="mb-1.5">
                      <span className="text-[11px] font-bold text-tno-green">化解条件：</span>
                      <span className="text-[11px] text-tno-text/85 leading-relaxed">{crisis.resolutionText}</span>
                    </div>
                  )}
                  {crisis.expiryText && (
                    <div>
                      <span className="text-[11px] font-bold text-tno-red">到期后果：</span>
                      <span className="text-[11px] text-tno-text/85 leading-relaxed">{crisis.expiryText}</span>
                    </div>
                  )}
                </div>
              }
            >
              <div className="border border-tno-red bg-tno-red/5 p-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-tno-red text-sm">{crisis.title}</h4>
                  <span className="text-xs text-tno-red font-bold crt-flicker">{crisis.daysLeft} 天</span>
                </div>
                <div className="w-full h-1 bg-zinc-900 border border-tno-border mb-2">
                  <div className="h-full bg-tno-red" style={{ width: `${Math.min(100, Math.max(0, (crisis.daysLeft / (crisis.totalDays ?? 30)) * 100))}%` }}></div>
                </div>
                <p className="text-[10px] text-tno-text/80 leading-tight">
                  {crisis.description}
                </p>
              </div>
            </HoverWindow>
          ))}
          {state.crises.length === 0 && (
            <div className="text-xs text-tno-text/50 text-center py-4">暂无迫在眉睫的危机</div>
          )}
        </div>
      </div>

      {/* Decisions */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <h2 className="text-tno-highlight font-bold text-lg mb-4 border-b border-tno-border pb-2 tracking-widest flex items-center gap-2">
          <Target className="w-5 h-5" />
          可用决议
        </h2>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {DECISIONS.filter(d => d.isVisible ? d.isVisible(state) : true).map(decision => {
            const route = getCommandRoute(state).id;
            const linkedPreparation = decision.id === ROUTE_OPERATIONS[route].decision ? Math.min(3, getCommandState(state).preparation?.[route] || 0) : 0;
            const preparationPreview = linkedPreparation > 0 ? getPreparationPreview(state) : null;
            const cooldown = state.decisionCooldowns[decision.id] || 0;
            const canAffordPP = state.stats.pp >= decision.costPP;
            const canAffordCustom = decision.canAfford ? decision.canAfford(state) : true;
            const isAvailable = cooldown <= 0 && canAffordPP && canAffordCustom;

            return (
              <HoverWindow
                key={decision.id}
                width={280}
                estimateHeight={280}
                content={
                  <div className="bg-tno-panel border border-tno-highlight/60 p-3.5 shadow-lg shadow-black/70">
                    <div className="flex justify-between items-baseline mb-2 border-b border-tno-border/50 pb-1.5">
                      <span className="font-bold text-base text-tno-text">{decision.title}</span>
                      <span className={`text-xs font-bold ${isAvailable ? 'text-tno-green' : cooldown > 0 ? 'text-tno-red' : 'text-amber-300'}`}>
                        {isAvailable ? '✓ 可执行' : cooldown > 0 ? `✗ 冷却中 ${cooldown} 天` : '✗ 资源不足'}
                      </span>
                    </div>
                    {decision.effectsText && decision.effectsText.length > 0 && (
                      <div className="mb-2">
                        <span className="text-xs font-bold text-tno-highlight">效果要点：</span>
                        <ul className="text-xs text-tno-text/90 mt-1 space-y-0.5">
                          {decision.effectsText.map((t, i) => (
                            <li key={i} className={`${t.startsWith('-') ? 'text-tno-red' : 'text-tno-green'}`}>• {t}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="text-sm text-tno-text/90 leading-relaxed mb-2">{decision.description}</div>
                    {preparationPreview && <div className="text-xs text-tno-green mb-2">地区筹备投入 {linkedPreparation} 份：{preparationPreview.result}最多 {preparationPreview.maximumDelta >= 0 ? '+' : ''}{preparationPreview.maximumDelta}，受数值上限限制</div>}
                    {(decision.costPP > 0 || decision.costText) && (
                      <div className="text-sm mb-1.5">
                        <span className="font-bold text-tno-highlight">消耗: </span>
                        {decision.costPP > 0 && <span className="text-tno-highlight">{decision.costPP} PP</span>}
                        {decision.costPP > 0 && decision.costText && <span className="text-zinc-500"> + </span>}
                        {decision.costText && <span className="text-amber-300">{decision.costText}</span>}
                        <span className="text-zinc-500">（当前 {Math.floor(state.stats.pp)} PP）</span>
                      </div>
                    )}
                    {decision.requirementsText && decision.requirementsText.length > 0 && (
                      <div className="text-sm mb-1.5">
                        <span className="font-bold text-amber-300">解锁条件: </span>
                        <ul className="list-disc list-inside text-zinc-400 mt-1 space-y-0.5">
                          {decision.requirementsText.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                    )}
                    {decision.cooldownDays > 0 && (
                      <div className="text-xs text-zinc-400">执行后冷却 {decision.cooldownDays} 天</div>
                    )}
                  </div>
                }
              >
                <button
                  data-sound={isAvailable ? 'decision' : 'error'}
                  onClick={() => handleDecision(decision)}
                  className={`w-full text-left border p-3 transition-colors ${
                    isAvailable
                      ? 'border-tno-border hover:border-tno-highlight hover:bg-zinc-900'
                      : 'border-tno-border/50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h4 className={`font-bold text-sm ${isAvailable ? 'text-tno-text' : 'text-tno-text/50'}`}>
                      {decision.title}
                    </h4>
                    <div className="flex items-center gap-1 shrink-0">
                      {decision.costPP > 0 && (
                        <span className={`text-[10px] font-bold px-1 py-0.5 border ${canAffordPP ? 'text-tno-highlight border-tno-highlight/50' : 'text-tno-red border-tno-red/50'}`}>
                          {decision.costPP} PP
                        </span>
                      )}
                      {decision.costText && (
                        <span className={`text-[10px] font-bold px-1 py-0.5 border ${canAffordCustom ? 'text-amber-300 border-amber-400/50' : 'text-tno-red border-tno-red/50'}`}>
                          {decision.costText}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-tno-text/60 mb-1.5 leading-tight">{decision.description}</p>
                  {linkedPreparation > 0 && <p className="text-[10px] text-tno-green mb-1">工作组筹备 {linkedPreparation} 份待投入</p>}
                  {decision.requirementsText && decision.requirementsText.length > 0 && (
                    <div className="text-[9px] text-zinc-500 leading-tight">
                      ⚑ {decision.requirementsText[0]}{decision.requirementsText.length > 1 ? ` 等${decision.requirementsText.length}项条件（悬浮查看全部）` : ''}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    {cooldown > 0 && (
                      <span className="text-[10px] text-tno-red font-bold">冷却中: {cooldown} 天</span>
                    )}
                    {decision.cooldownDays > 0 && cooldown <= 0 && (
                      <span className="text-[9px] text-zinc-500">冷却: {decision.cooldownDays} 天</span>
                    )}
                  </div>
                </button>
              </HoverWindow>
            );
          })}
        </div>
        
        <div className="mt-2 w-full">
          <button 
            onClick={() => setIsGuideOpen(true)}
            className="border border-tno-highlight bg-tno-highlight/10 text-tno-highlight hover:bg-tno-highlight hover:text-black p-1.5 flex items-center justify-center gap-1.5 transition-colors font-bold text-xs"
          >
            <Book className="w-3 h-3" />
            路线指南
          </button>
        </div>
      </div>

      {/* Guide Modal */}
      {isGuideOpen && createPortal(
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-tno-bg border-2 border-tno-highlight w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl shadow-tno-highlight/20">
            <div className="p-4 border-b border-tno-highlight bg-tno-highlight/10 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-tno-highlight tracking-widest flex items-center gap-2">
                <Book className="w-6 h-6" />
                合肥一中风云：全路线思维导图
              </h2>
              <button
                onClick={() => setIsGuideOpen(false)}
                className="text-tno-highlight hover:text-white font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-4 text-sm text-tno-text/90 flex-1 min-h-0">
              <RouteGuide state={state} />
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
