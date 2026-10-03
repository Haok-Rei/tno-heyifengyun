import type { Advisor, GameState } from '../types';
import { LAWS, getLawSystem } from './laws';

export const AVAILABLE_ADVISORS: Advisor[] = [
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

export function getAdvisorCost(state: GameState, advisor: Advisor) {
    // v8.11 人事法案影响雇佣费用
    const laws = getLawSystem(state.lawSystem);
    const mult = LAWS[laws.personnel]?.advisorCostMult ?? 1;
    let cost = Math.round(advisor.cost * mult);
    if (state.flags.yang_yule_cheap_advisors && state.leader.name === '杨玉乐') {
      cost = Math.floor(cost / 2);
    }
    return cost;
}

export function getAvailableAdvisors(state: GameState): Advisor[] {
  return AVAILABLE_ADVISORS.filter(a => {
              if (a.id === 'yang_yule' && state.flags.yang_yule_removed_by_trial) return false;
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
            });
}
