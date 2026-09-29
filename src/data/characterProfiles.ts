import type { Advisor } from '../types';
import { formatModifierEntry } from '../engine/gameLoop';

export interface CharacterTrait { text: string; positive: boolean }

/** Story text stays separate from numeric traits, including in older saved games. */
const ADVISOR_PROFILES: Record<string, { description: string; extra?: CharacterTrait[] }> = {
  zhou_chen: { description: '周晨总在下课后多留几分钟，听学生把真正的问题说完。陈栋时代的课表和习惯她都记得，也知道如今照搬旧办法行不通；她宁愿在办公室多协调一晚，也不让一句“按规定办”结束谈话。' },
  li_jingkai: { description: '李竞凯带进会议室的第一样东西是电子表格。他能为课程和楼宇争来资金，也会追问每间教室的投入产出。有人喜欢他的效率，有人发现自己的名字只出现在“用户留存”那一列。' },
  you_guanglei: { description: '游光磊习惯把争执先记进待办簿，再一项项找能签字的人。陈栋留下的人脉使他知道哪扇门还敲得开；他不擅长鼓舞人，却常能在会议散后把灯和课表安排妥当。' },
  wu_fujun: { description: '吴福军的巡查表细到每节课间。他能在半天内让失控的走廊安静下来，但被记在表上的学生会记得更久。对他来说，整齐的队列是秩序；对队列里的人，未必如此。' },
  yang_yule: { description: '杨玉乐讲课时很少看教案，听一遍学生的回答就知道卡在哪里。特级教师的声望帮他在行政楼争到空间，也使他更相信成绩可以解释一切；当学生的问题不在卷面上，他往往要想更久。' },
  jiang_haobang: { description: '豪邦每次开会都把最不愿同桌的人请到一张桌边。他相信革命需要制度，也需要给反对者留下说话的位置。这种耐心能维系联盟，却常被急于行动的人误解为犹豫。', extra: [{ text: '每周先锋党员 +1', positive: true }, { text: '自社派每周忠诚度 +5', positive: true }] },
  wang_juanhao_vanguard: { description: '王卷豪熟悉 B3 每间教室、每台印刷机和每份卷子的去向。别人还在争论纲领，他已经把值班表贴上墙。有人因此愿意跟着他干，也有人担心他把人的疲惫同样列进待办事项。', extra: [{ text: 'B3 教学楼任务成功率 +30%', positive: true }] },
  wang_zhaokai_advisor: { description: '王照凯总要求会上先定目标，再定谁来执行。他为起义后的革委会建立了指挥链，让分散的队伍能完成同一项任务；可当有人提出不同的路径，他听见的常是对目标本身的怀疑。' },
  gouxiong_advisor: { description: '狗熊懂得怎样用一段影片或一句玩笑让礼堂坐满人。旧权威的威严在他的麦克风前失效，台下的人也终于敢笑；只是笑声散去以后，他还得回答那些被玩笑伤到的人。', extra: [{ text: '开启狗熊线相关剧情', positive: true }] },
  jing_zhen: { description: '景珍会认真读完学生交来的每页材料，也会在签名之前反复确认谁要承担后果。温和派信任她的审慎，激进派则嫌她等得太久。她自己知道，迟疑有时也是一种决定。' },
  zhang_chun: { description: '张春记得哪位班主任周三有课、哪间教室的灯又坏了。危机时，他不写宣言，拿着钥匙在几个办公室之间跑。许多宏大的决定最终能落地，靠的正是这种不太有人愿意做的琐事。' },
  feng_anbao_advisor: { description: '封安宝回到行政楼时，许多旧表格又找到了熟悉的签字人。他能让停摆的行政系统重新运转，却也知道如何把及第的要求写成看似普通的校内程序。' },
  jidi_ceo: { description: '方田看中合一的校名，更看中可以复制的课程和教辅。他答应先拿钱把设备换新，但每笔投入都对应一条增长目标。学生在他眼里有前途，前途最好能按季度统计。' },
  hitachi_expert: { description: '刘守强把印刷室的排程画成流程图：哪道工序慢、哪批纸浪费，他一眼能找出来。教师佩服这份本事，也担心下一张流程图会把备课和休息算作可以削减的空档。' },
  data_analyst: { description: '盛为民从成绩、缺勤和舆情报表里发现别人没看见的变化。他不替数据撒谎，却很少追问一条曲线突然下沉时，坐在教室里的是谁。' },
  lu_bohan: { description: '吕波汉写规定总写到最后一条追责办法。他相信松散的组织会在下一次危机里散架，因此把纪律铺进每个岗位。命令传得越快，愿意当面反对他的人也越少。', extra: [{ text: '极权派每周忠诚度 +3、执行力 +3', positive: true }] },
  shi_ji: { description: '时纪开会前先问各班能自己解决什么，再讨论哪些事必须共议。社团与教学楼因此愿意坐到一起；到了需要统一行动的时刻，她也得承受这套办法带来的缓慢。', extra: [{ text: '安那其派每周忠诚度 +4', positive: true }] },
  zhou_hongbing: { description: '周红兵能把一场沉闷的理论讨论写成第二天贴满楼道的宣言。追随者喜欢他的锋利，负责落实的人则常要回头解释那些没来得及商量的句子。', extra: [{ text: '网哲派每周忠诚度 +3', positive: true }, { text: '网哲派每周执行力 -1', positive: false }] },
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
