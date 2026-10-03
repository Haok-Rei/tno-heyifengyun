import type { Advisor } from '../types';
import { formatModifierEntry } from '../engine/gameLoop';

export interface CharacterTrait { text: string; positive: boolean }

/** Story text stays separate from numeric traits, including in older saved games. */
const ADVISOR_PROFILES: Record<string, { description: string; extra?: CharacterTrait[] }> = {
  zhou_chen: { description: "周晨是陈栋时代留下的资深美术教师，也是那间地下心理咨询室的创办人。她至今仍相信一次耐心谈话能让人重新坐下来，这种信念不是空话——封安宝高压时期，她曾自费帮助学生。她熟悉旧秩序怎么运转，也清楚学生真正害怕什么。\n\n她代表的是人文传统和良知那一面，而非某种管理方案。在陈栋的旧班底里，她的分量正来自这段具体经历：别人谈路线，她谈的是眼前这个孩子还撑不撑得住。" },
  li_jingkai: { description: "李竞凯是及第资本的合伙人，看教学楼、课程和学生时习惯把它们放进同一张收益表。引入他的资金意味着把学校的一部分未来交给市场，这既是他的入场理由，也是他带来的核心矛盾：资本能解决眼下缺钱的问题，但市场逻辑不会只停留在账面上。他不必亲自管教学，却会通过投入与回报的算法改变什么该被保留、什么可以被折算。对合肥一中而言，接受他就等于承认学校不只是一个教育场所，也是一项可以定价的资产。" },
  you_guanglei: { description: "尤光雷是陈栋昔日的副手，也做过年级班主任。他因抵制极端衡水化被流放，此后仍保有一套可靠的人脉和工作方法。比起喊激烈口号，他更愿意逐项修补行政机器，是温和稳健、有行政手腕的那类人。\n\n他与陈栋旧班底的联系，主要建立在做事的方式上：先弄清流程哪里断了，再决定怎么接上。务实是他的长处，也让他在需要表态的时刻往往显得比别人慢半拍。" },
  wu_fujun: { description: "吴福军在教务系统内是强硬派的代表，惯于点名册、巡查表与纪律程序，用最琐碎的日常手段把秩序一层层垒起来。他不靠说服，靠勤查、勤记、勤处理，局面一旦失控，这些程序确实能迅速压住校园。问题也出在同一处：点名和巡查管得住人，管不住怨气，纪律越密，学生越感到压迫。他所做的，是把稳定建立在程序上，而程序本身不产生信服。" },
  yang_yule: { description: "杨玉乐是合肥一中声望卓著的特级教师，把课堂当成自己最牢固的阵地。教学经验让他在处理校务时效率颇高，无论安排课程还是应对学生诉求，他都习惯用这套经验去衡量，也就不自觉地不断把学校推回考试的中心。在学生运动面前，他属于校内保守派的核心人物，主张分化与安抚，而不愿正面承认运动背后的诉求。特级教师的资历为他赢得许多教师的敬重，却也是他的限制所在：一个以考试为尺度的人，很难被学生当作可信的调解者。他能靠经验稳住一时的秩序，却回答不了学校是否只剩下考试这一种意义。" },
  jiang_haobang: { description: "豪邦是自社派的组织者，长期在相互猜疑的派系之间保留对话渠道。他担任意识形态教员，不靠压服来统一认识，而倾向于让不同主张在革命内部保有妥协与自治的余地。这种作风使他在立场强硬者眼中不够彻底，却也让他在需要谈判时成为各方都能接受的人。他的局限同样明显：对话渠道能延缓对立，却未必能消解分歧，一旦争论触及路线根本，他所依赖的耐心与折中便可能不够用。", extra: [{ text: '每周先锋党员 +1', positive: true }, { text: '自社派每周忠诚度 +5', positive: true }] },
  wang_juanhao_vanguard: { description: "从B3教学楼走出来的年轻先锋，王卷豪对基层动员和试卷生产的每一道环节都不陌生。他的长处不在于阐发口号，而在于把口号拆成一件件能落到人头的具体任务：谁去动员、哪间教室缺哪一科卷子、下一批纸张从哪来，这些事务他都熟。改革路线需要有人把抽象主张变成可执行的安排，王卷豪正是这种执行者。", extra: [{ text: 'B3 教学楼任务成功率 +30%', positive: true }] },
  wang_zhaokai_advisor: { description: "起义后出任联合革命委员会主席，王照凯把集中指挥当作推进做题改革的主要方式。他不相信松散的自发行动能维持局面，主张由委员会统一判断形势、分配任务，用纪律约束参差不齐的力量。一些原本摇摆的组织因此被吸引过来：它们未必认同全部主张，却需要有人给出明确的下一步，而王照凯提供的就是这种确定性。问题也出在这里——他容易把内部分歧视作对革命的背叛，联合中较温和或犹豫的部分因而持续承受压力。" },
  gouxiong_advisor: { description: "在艺术礼堂，狗熊更像一个赛博煽动者而不是政治人物。他用影像剪辑和网络迷因拆解旧权威，让沉闷的校园沸腾起来。来参加集会的人并不都认可他的解构方式。狗熊点燃的火常常超出他的控制，而他只在意自己的表演是否足够荒诞。", extra: [{ text: '开启狗熊线相关剧情', positive: true }] },
  jing_zhen: { description: "靖珍是谨慎的自由派教师，愿意倾听学生，却总在公开表态前反复权衡后果。她能在温和派中争取信任，这种信任来自她说话留有余地、不轻易把对话变成对抗。可一旦压力升高，她的谨慎就会变成迟疑：她既不愿站到学生对面，也不敢承担公开对抗的代价。这使得她在校园政治中更像一个缓冲带，而不是推动者。她能替双方传话，却很难替任何一方拍板，这正是她最难被替代也最难被依靠的地方。" },
  zhang_chun: { description: "张春是年级部里公认的老好人。他熟知各班主任的脾气，也清楚各年级的实际困难。那些琐碎的协调工作平日里不显山不露水，一旦危机压下来，反倒成了难得的稳定力量。\n\n他不提什么路线主张，擅长的是在具体的人与事之间来回传话、调和。正因如此，他在年级部里的位置不好被替代：许多僵局靠的不是某个强人拍板，而是他这样熟知各方底细的人先把它化开。" },
  feng_anbao_advisor: { description: "封安宝以教育顾问的身份重返权力中心。他熟悉行政体系怎么运转，知道旧日管理的惯性在哪里还能发力。这种经验帮助他在联合管理委员会中站稳位置，也让他重新坐回了与校园事务相关的座位。\n\n他为及第资本重新打开校门，说明他与企业利益之间存在彼此需要的空间；可这种回归同时把他放进一个尴尬位置：行政经验可以稳住秩序，却未必能约束资本扩张。" },
  jidi_ceo: { description: "方田是一名小企业投资人。他看中合肥一中已有的品牌、流量和可复制的课程体系——这些是现成的资产，不需要从零养成。他带来资金，也带来一套公司化的期待：学校应当按照企业的方式运转，投入要有回报，增长要看得见。\n\n在企业化管理的学校里，方田代表着扩张所需要的那类外部资金和商业视角。他关心的是品牌能否变现、课程能否复制、收益能否谈清。至于课堂上那些无法被量化的问题，他未必有耐心逐一处理。" },
  hitachi_expert: { description: "刘守强推崇工业管理中的标准化与流程控制，一心把试卷生产变成一条永不停机的流水线。这个思路放在日立式的科层管理里自有其道理，试卷从命题到印刷确实可以拆解成若干可量化的环节。问题在于，考试终究不是流水线产品，命题需要判断，批改需要理解，而标准化能规训流程，却不能替代教师的专业判断。刘守强代表的正是那种把教育问题先翻译成生产问题来处理的倾向，高效、可预测，却也把人的因素一步步挤出了视野。" },
  data_analyst: { description: "盛为民善于从成绩、舆情与生产报表里找出隐藏趋势。他的分析能让决策快一步，也让校园生活愈发像一组指标：投入、产出、达标与否。\n\n面对校内的争论，他扮演的是把模糊感受换算成可操作数据的人。好处是争论有了依据，代价是那些无法被量化、却真正影响学生处境的东西，容易被数据筛选遗漏。" },
  lu_bohan: { description: "吕波汉是极权反做题派的理论与组织核心。他把校内派系争斗归因于纪律涣散与言论泛滥，认为只有铁一般的纪律才能结束混战，因而把肃反与整编当作首要工具，而不是把精力放在说服或调和上。这种路线在组织层面强调服从、在思想层面强调清理，对做题式的迂回与妥协天然不信任。效率是实打实的，但它建立在言论空间不断收窄之上；空间越窄，反弹与逃避就越隐蔽，反而更难被纪律捕捉，这是他绕不开的一个矛盾。", extra: [{ text: '极权派每周忠诚度 +3、执行力 +3', positive: true }] },
  shi_ji: { description: "时纪是安那其派的协调者，主张让教学楼和社团自行决定日常事务。他的工作不是发号施令，而是扩大联盟的共同基础，让分散的声音坐到一起。\n\n地方自治能够争取更广泛的认同，也让中央的统一调度更加费力。时纪要做的，是让这些自治的教学楼与社团在共同事务上达成一致。", extra: [{ text: '安那其派每周忠诚度 +4', positive: true }] },
  zhou_hongbing: { description: "周红兵是网哲派的激进思想家，擅长把抽象理论写成煽动性的校园宣言。他不满足于纸面推演，总想让概念变成动员，把批判对准既有的秩序与惯性。\n\n这种能力让他能推动一部分人行动，也不断消耗周围人的政治耐心——口号越彻底，可供回旋的余地就越小。在网哲派里，他的位置偏思想上的激进一翼：追问立场是否干净，而不大顾及共识还能不能维持。", extra: [{ text: '网哲派每周忠诚度 +3', positive: true }, { text: '网哲派每周执行力 -1', positive: false }] },
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
  const description = advisor.id === 'wu_fujun' && advisor.title === '戒严总指挥'
    ? advisor.description : profile?.description ?? advisor.description;
  return { description, traits: [...traits, ...(profile?.extra ?? [])] };
}

export function getLeaderTraits(buffs: string[] | undefined): CharacterTrait[] {
  return (buffs ?? []).map(text => {
    const harmfulStat = /激进愤怒|资本渗透/.test(text);
    const negative = /[−-]\s*\d/.test(text);
    return { text, positive: harmfulStat ? negative : !negative };
  });
}
