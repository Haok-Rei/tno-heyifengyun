import type { Advisor } from '../types';
import { formatModifierEntry } from '../engine/gameLoop';

export interface CharacterTrait { text: string; positive: boolean }

/** Story text stays separate from numeric traits, including in older saved games. */
const ADVISOR_PROFILES: Record<string, { description: string; extra?: CharacterTrait[] }> = {
  zhou_chen: { description: '陈栋时代留下的老教师，仍相信一张课表和一次耐心谈话能让校园重新安静下来。她熟悉旧秩序，也懂得学生真正害怕什么。' },
  li_jingkai: { description: '及第资本的合伙人，习惯将教学楼、课程和学生统统放进一张收益表。引入他的资金，也意味着把学校的一部分未来交给市场。' },
  you_guanglei: { description: '陈栋身边的执行者，比起激烈的口号，他更愿意逐项修补行政机器。离开旧班底后，他仍保有一套可靠的人脉与工作方法。' },
  wu_fujun: { description: '教务系统的强硬派，善于用点名册、巡查表和纪律程序恢复秩序。他可以压住失控的局面，也会让学生感到更深的压迫。' },
  yang_yule: { description: '声望卓著的特级教师，把课堂当成自己的指挥部。他的教学经验能够提高效率，但也不断把学校推向考试的中心。' },
  jiang_haobang: { description: '自社派的组织者，擅长在相互猜疑的派系间保留对话渠道。即使担任思想教员，他仍试图为革命留下妥协与自治的余地。', extra: [{ text: '每周先锋党员 +1', positive: true }, { text: '自社派每周忠诚度 +5', positive: true }] },
  wang_juanhao_vanguard: { description: '从 B3 教学楼走出的年轻先锋，熟悉基层动员与试卷生产的每一道环节。他的热情能把抽象口号变成具体任务。', extra: [{ text: 'B3 教学楼任务成功率 +30%', positive: true }] },
  wang_zhaokai_advisor: { description: '起义后的革命委员会主席，坚持用集中指挥推进做题改革。他能为摇摆的组织提供方向，也容易把分歧视作对革命的背叛。' },
  gouxiong_advisor: { description: '艺术礼堂的赛博煽动者，以戏谑、影像和网络迷因拆解旧权威。他能让沉闷的校园沸腾，却未必能控制自己点燃的火。', extra: [{ text: '开启狗熊线相关剧情', positive: true }] },
  jing_zhen: { description: '谨慎的自由派教师，愿意倾听学生，却总在公开表态前反复权衡后果。她能争取温和派的信任，也难以承担高压对抗。' },
  zhang_chun: { description: '年级部里公认的老好人，熟知各班主任的脾气与各年级的实际困难。琐碎的协调工作，在危机中反而成了珍贵的稳定力量。' },
  feng_anbao_advisor: { description: '旧校长以教育顾问的身份重返权力中心。他知道如何稳住行政体系，却也为及第资本重新打开了校门。' },
  jidi_ceo: { description: '小企业投资人方田看中了合一的品牌、流量和可复制的课程体系。他带来资金与增长，也要求学校像公司一样运转。' },
  hitachi_expert: { description: '刘守强推崇工业管理中的标准化与流程控制，试图把试卷生产变成一条永不停机的流水线。' },
  data_analyst: { description: '盛为民善于从成绩、舆情与生产报表里找出隐藏趋势。数字让决策更快，也让校园生活愈发像一组指标。' },
  lu_bohan: { description: '极权派的理论与组织核心，认为只有铁一般的纪律才能结束派系争斗。他的效率建立在越来越狭窄的言论空间之上。', extra: [{ text: '极权派每周忠诚度 +3、执行力 +3', positive: true }] },
  shi_ji: { description: '安那其派的协调者，主张让教学楼和社团自行决定日常事务。她能扩大联盟的共同基础，却也会削弱中央命令的效力。', extra: [{ text: '安那其派每周忠诚度 +4', positive: true }] },
  zhou_hongbing: { description: '网哲派的激进思想家，擅长把抽象理论写成煽动性的校园宣言。他能推动行动，也不断消耗政治上的耐心。', extra: [{ text: '网哲派每周忠诚度 +3', positive: true }, { text: '网哲派每周执行力 -1', positive: false }] },
};

const BAD_WHEN_RISING = new Set(['capitalPenetrationDaily', 'radicalAngerDaily']);

export function getAdvisorProfile(advisor: Advisor): { description: string; traits: CharacterTrait[] } {
  const profile = ADVISOR_PROFILES[advisor.id];
  const traits = Object.entries(advisor.modifiers).flatMap(([key, value]) => {
    if (typeof value !== 'number' || value === 0) return [];
    const formatted = formatModifierEntry(key, value);
    const text = key === 'gdpGrowthDaily'
      ? `${formatted.label} ${value > 0 ? '+' : ''}${Math.round(value * 1000) / 10}%`
      : `${formatted.label} ${formatted.text}`;
    return [{ text, positive: BAD_WHEN_RISING.has(key) ? value < 0 : formatted.positive }];
  });
  return { description: profile?.description ?? advisor.description, traits: [...traits, ...(profile?.extra ?? [])] };
}

export function getLeaderTraits(buffs: string[] | undefined): CharacterTrait[] {
  return (buffs ?? []).map(text => {
    const harmfulStat = /激进愤怒|资本渗透/.test(text);
    const negative = /[−-]\s*\d/.test(text);
    return { text, positive: harmfulStat ? negative : !negative };
  });
}
