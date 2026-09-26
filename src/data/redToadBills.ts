import { GameState, RedToadBill } from '../types';

export const RED_TOAD_BILLS: RedToadBill[] = [
  {
    id: 'bill_purge',
    title: '颁布肃反密令',
    description: '为彻底清除潜伏在互助组内的“做题阶级”残余，提议扩大午夜纠察队的执法权限。所有模考排名上升的学生将被视为重点防范对象。',
    warning: '警告：该法案将急剧推高校园恐怖氛围，并导致安那其派的自治网络崩溃。能推进做题改革，但会激增激进愤怒度。',
    initiator: 'authoritarian',
    supportThreshold: 1000,
    onPass: (state) => {
      const newFactions = { ...state.redToadState!.factions };
      if (newFactions.authoritarian) newFactions.authoritarian.influence += 100;
      if (newFactions.anarchist) {
        newFactions.anarchist.loyalty -= 20;
        newFactions.anarchist.influence -= 50;
      }
      const newReformState = state.reformState ? { ...state.reformState, progress: state.reformState.progress + 10 } : state.reformState;
      return {
        stats: { ...state.stats, tpr: state.stats.tpr + 20, studentSanity: state.stats.studentSanity - 10, radicalAnger: state.stats.radicalAnger + 20 },
        redToadState: { ...state.redToadState!, factions: newFactions, overallConsensus: state.redToadState!.overallConsensus - 5 },
        reformState: newReformState
      };
    },
    onFail: (state) => {
      const newFactions = { ...state.redToadState!.factions };
      if (newFactions.authoritarian) newFactions.authoritarian.loyalty -= 10;
      return {
        redToadState: { ...state.redToadState!, factions: newFactions }
      };
    }
  },
  {
    id: 'bill_decentralize',
    title: '学习资料去中心化',
    description: '废除所有官方指定的复习资料，允许学生自由交换和编写学习指南，建立基于区块链的去中心化题库。',
    warning: '警告：这会削弱正统派的控制力，但能极大提升学生的理智度。',
    initiator: 'anarchist',
    supportThreshold: 900,
    onPass: (state) => {
      const newFactions = { ...state.redToadState!.factions };
      if (newFactions.anarchist) newFactions.anarchist.influence += 100;
      if (newFactions.orthodox) newFactions.orthodox.loyalty -= 15;
      const newReformState = state.reformState ? { ...state.reformState, progress: state.reformState.progress + 5 } : state.reformState;
      return {
        stats: { ...state.stats, studentSanity: state.stats.studentSanity + 15, partyCentralization: state.stats.partyCentralization - 10 },
        redToadState: { ...state.redToadState!, factions: newFactions },
        reformState: newReformState
      };
    },
    onFail: (state) => {
      const newFactions = { ...state.redToadState!.factions };
      if (newFactions.anarchist) newFactions.anarchist.loyalty -= 15;
      return {
        redToadState: { ...state.redToadState!, factions: newFactions }
      };
    }
  },
  {
    id: 'bill_theory_study',
    title: '强制理论学习',
    description: '要求所有学生每天必须进行两小时的“真左派理论”学习，并撰写心得体会。',
    warning: '警告：网哲派会非常高兴，但学生理智度会下降。',
    initiator: 'internet_philosopher',
    supportThreshold: 800,
    onPass: (state) => {
      const newFactions = { ...state.redToadState!.factions };
      if (newFactions.internet_philosopher) {
        newFactions.internet_philosopher.influence += 150;
        newFactions.internet_philosopher.loyalty += 20;
      }
      return {
        stats: { ...state.stats, pp: state.stats.pp + 10, studentSanity: state.stats.studentSanity - 5 },
        redToadState: { ...state.redToadState!, factions: newFactions, overallConsensus: state.redToadState!.overallConsensus + 5 }
      };
    },
    onFail: (state) => {
      const newFactions = { ...state.redToadState!.factions };
      if (newFactions.internet_philosopher) newFactions.internet_philosopher.loyalty -= 20;
      return {
        redToadState: { ...state.redToadState!, factions: newFactions }
      };
    }
  },
  {
    id: 'bill_grassroots',
    title: '基层互助网络',
    description: '将资源下放到各个班级的互助小组，由学生自主管理日常事务。',
    warning: '警告：自社派的影响力将提升，极权派会感到不满。',
    initiator: 'libertarian_socialist',
    supportThreshold: 950,
    onPass: (state) => {
      const newFactions = { ...state.redToadState!.factions };
      if (newFactions.libertarian_socialist) newFactions.libertarian_socialist.influence += 100;
      if (newFactions.authoritarian) newFactions.authoritarian.loyalty -= 15;
      const newReformState = state.reformState ? { ...state.reformState, progress: state.reformState.progress + 5 } : state.reformState;
      return {
        stats: { ...state.stats, stab: state.stats.stab + 10, allianceUnity: state.stats.allianceUnity + 10 },
        redToadState: { ...state.redToadState!, factions: newFactions },
        reformState: newReformState
      };
    },
    onFail: (state) => {
      const newFactions = { ...state.redToadState!.factions };
      if (newFactions.libertarian_socialist) newFactions.libertarian_socialist.loyalty -= 10;
      return {
        redToadState: { ...state.redToadState!, factions: newFactions }
      };
    }
  },
  {
    id: 'bill_exam_abolition',
    title: '废除标准化考试',
    description: '全面废除合一的标准化考试制度，代之以学生互评和实践项目考核。',
    warning: '警告：将极大推进做题改革，但会引起正统派的强烈反弹。',
    initiator: 'anarchist',
    supportThreshold: 1200,
    requiresFlag: 'reform_stage_2',
    onPass: (state) => {
      const newFactions = { ...state.redToadState!.factions };
      if (newFactions.orthodox) {
        newFactions.orthodox.loyalty -= 30;
        newFactions.orthodox.influence -= 100;
      }
      const newReformState = state.reformState ? { ...state.reformState, progress: state.reformState.progress + 20 } : state.reformState;
      return {
        stats: { ...state.stats, radicalAnger: state.stats.radicalAnger + 10, studentSanity: state.stats.studentSanity + 20 },
        redToadState: { ...state.redToadState!, factions: newFactions, overallConsensus: state.redToadState!.overallConsensus - 10 },
        reformState: newReformState
      };
    },
    onFail: (state) => {
      const newFactions = { ...state.redToadState!.factions };
      if (newFactions.anarchist) newFactions.anarchist.loyalty -= 20;
      if (newFactions.libertarian_socialist) newFactions.libertarian_socialist.loyalty -= 20;
      return {
        redToadState: { ...state.redToadState!, factions: newFactions }
      };
    }
  },
  {
    id: 'bill_student_soviets',
    title: '建立学生苏维埃',
    description: '在全校范围内建立由学生直选产生的苏维埃代表大会，接管学校的一切行政和教学管理权。',
    warning: '警告：这是做题改革的终极目标之一。通过后将彻底改变学校的权力结构。',
    initiator: 'libertarian_socialist',
    supportThreshold: 1500,
    requiresFlag: 'reform_stage_3',
    onPass: (state) => {
      const newFactions = { ...state.redToadState!.factions };
      if (newFactions.libertarian_socialist) newFactions.libertarian_socialist.influence += 200;
      if (newFactions.anarchist) newFactions.anarchist.influence += 200;
      const newReformState = state.reformState ? { ...state.reformState, progress: state.reformState.progress + 30 } : state.reformState;
      return {
        stats: { ...state.stats, allianceUnity: state.stats.allianceUnity + 20, partyCentralization: state.stats.partyCentralization - 30 },
        redToadState: { ...state.redToadState!, factions: newFactions, overallConsensus: state.redToadState!.overallConsensus + 10 },
        reformState: newReformState
      };
    },
    onFail: (state) => {
      const newFactions = { ...state.redToadState!.factions };
      if (newFactions.authoritarian) newFactions.authoritarian.loyalty += 20;
      return {
        redToadState: { ...state.redToadState!, factions: newFactions, overallConsensus: state.redToadState!.overallConsensus - 15 }
      };
    }
  }
];
