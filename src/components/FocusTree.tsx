import React, { useState, useRef, useEffect } from 'react';
import { GameState, FocusNode, ALL_SUB_TILES } from '../types';
import { FocusArt, ART_KIND_LABELS, getStrategicArtKind } from './StrategicArt';
import { FLAVOR_EVENTS } from '../data/flavorEvents';
import { STORY_EVENTS } from '../data/storyEvents';
import { applyYangSettlement, CROSSROADS_RULES, CROSSROADS_LABELS, getCrossroadsOutcome } from '../engine/assemblyPolitics';
import FocusHoverCard from './FocusHoverCard';
import { formatControl, getCampusControlProgress, getTileControl } from '../engine/mapState';

interface FocusTreeProps {
  state: GameState;
  startFocus: (focusId: string) => void;
  triggerError: () => void;
  isSuperEventActive?: boolean;
}

const OR_REQUIRE_FOCUS_IDS = new Set(['steel_toad', 'rectify_campus_order', 'wu_coup_december', 'wu_millennium_plan']);

const hasFocusRequirements = (node: FocusNode, completedFocuses: string[]) => {
  if (!node.requires || node.requires.length === 0) return true;
  if (OR_REQUIRE_FOCUS_IDS.has(node.id)) {
    return node.requires.some(req => completedFocuses.includes(req));
  }
  return node.requires.every(req => completedFocuses.includes(req));
};

export const PHASE1_NODES: FocusNode[] = [
  { id: 'start_2023', title: '2023秋季开学典礼', description: '三千张年轻的面孔涌入滨湖校区。封安宝的致辞冰冷而精准，杨玉乐的保温杯冒着热气，及第教育的广告横幅在行政楼侧墙猎猎作响。这是合一——一座被高墙围拢的做题工厂，也是一张被各方势力反复拉扯的棋盘。', days: 5, x: 500, y: 50,
    onComplete: (s) => ({
      nationalSpirits: [...s.nationalSpirits, { id: 'new_reform_cloud', name: '新教改的阴云', description: "合肥一中曾是一个拥有骄人民主传统的学府，但在“新教改”的华丽辞藻下，一场残酷的体制重塑正在酝酿。被随意切割的新课表如同达摩克利斯之剑悬在师生头顶，做题家们在加课与淘汰的恐怖流言中瑟瑟发抖。改革尚未落地，但无处不在的不确定性本身，早已将这座百年校园化作了一座充满绝望的全景监狱。", type: 'negative', effects: { stabDaily: -0.1 } }],
      activeEvent: FLAVOR_EVENTS.phase1_start_2023,
      flags: { ...s.flags, story_1_triggered: true }
    }),
    effectsText: ['获得国家精神：新教改的阴云', '触发事件：滨湖的齿轮开始转动']
  },

  // ===== 左路：校方体制路线 =====
  { id: 'build_art', title: '大兴土木的野望', description: '艺术礼堂翻修、B3扩建、操场跑道更换——封安宝的基建计划需要大量资金。及第教育CEO封安祥慷慨解囊。一笔完美的交易：校方得到政绩，资本得到市场。', days: 10, x: 280, y: 200, requires: ['start_2023'],
    onComplete: (s) => ({
      stats: { ...s.stats, tpr: s.stats.tpr + 300, capitalPenetration: s.stats.capitalPenetration + 10 },
      activeEvent: FLAVOR_EVENTS.phase1_build_art,
      flags: { ...s.flags, story_2_triggered: true }
    }),
    effectsText: ['TPR +300', '资本渗透度 +10', '触发事件：水泥里的交易']
  },
  { id: 'wu_patrol', title: '吴福军的走廊巡查', description: '教务督导吴福军——合一的纪律铁拳。硬底皮鞋每天七次巡视高三走廊，考勤本上密密麻麻记录着每一句交谈、每一次走动、每一张搜出的违禁品。', days: 10, x: 280, y: 380, requires: ['build_art'],
    onComplete: (s) => ({
      nationalSpirits: s.nationalSpirits.concat({ id: 'wu_patrol_spirit', name: '走廊巡查', description: "在吴福军及其防暴队的高压维稳下，连课间的喘息也沦为了纪律的刑场。冷酷的巡视将每一次交谈、每一次走动乃至每一页私藏的读物，都转化为考勤本上的量化扣分。B3教学楼的走廊里只剩下死寂，但在表象之下，深不见底的怨恨正在暗处如野火般悄然蔓延。暴政换来的从来不是信服，而是被刻意忽视的风暴前兆。", type: 'negative', effects: { stabDaily: 0.5 } }),
      stats: { ...s.stats, ss: s.stats.ss - 10 },
      activeEvent: FLAVOR_EVENTS.phase1_wu_patrol,
      flags: { ...s.flags, story_3_triggered: true }
    }),
    effectsText: ['国家精神：走廊巡查 (+0.5%稳定/日)', 'SS -10', '触发事件：走廊尽头的脚步声']
  },
  { id: 'fake_five_edu', title: '应付五育检查', description: '市教育局检查团到访。美术教室连夜搬出石膏像，钢琴被擦得锃亮，操场标语换成了全面发展。杨玉乐用三年前的旧照片拼了一份PPT。检查团待了两小时，给合一打了满分。', days: 10, x: 160, y: 560, requires: ['wu_patrol'],
    onComplete: (s) => ({
      stats: { ...s.stats, pp: s.stats.pp + 50, studentSanity: s.stats.studentSanity - 5 },
      activeEvent: FLAVOR_EVENTS.phase1_fake_five_edu,
      flags: { ...s.flags, story_4_triggered: true }
    }),
    effectsText: ['PP +50', '学生理智值 -5', '触发事件：检查团的闹剧']
  },
  { id: 'ban_books', title: '严打违规课外书', description: '吴福军的违禁品清单越来越长。《南方周末》是散布焦虑，《读者》是消极避世，《共产党宣言》手抄本更被定性为思想犯罪。但每没收一本书，就会催生三个想看它的人。', days: 10, x: 400, y: 560, requires: ['wu_patrol'],
    onComplete: (s) => ({
      stats: { ...s.stats, radicalAnger: Math.min(100, s.stats.radicalAnger + 20) },
      activeEvent: FLAVOR_EVENTS.phase1_ban_books,
      flags: { ...s.flags, story_5_triggered: true }
    }),
    effectsText: ['激进愤怒度 +20', '触发事件：禁书与禁思']
  },
  { id: 'perfect_hengshui', title: '打造完美衡水流水线', description: '作息精确到分钟，课间压缩到五分钟，午休取消。合一的做题机器运转到极限——机器越完美，零件的摩擦声就越刺耳。', days: 14, x: 280, y: 720, requires: ['fake_five_edu', 'ban_books'],
    onComplete: (s) => ({
      stats: { ...s.stats, tpr: s.stats.tpr + 400, studentSanity: Math.max(0, s.stats.studentSanity - 5), stab: Math.min(100, s.stats.stab + 5) },
      flags: { ...s.flags, story_6_triggered: true },
      activeEvent: FLAVOR_EVENTS.phase1_hengshui_schedule
    }),
    effectsText: ['TPR +400', '学生理智值 -5', '稳定度 +5', '触发事件：挤掉的午休；B3起义只需激进愤怒度 >80']
  },

  // ===== 右路：学生反抗路线 =====
  { id: 'dorm_talks', title: '寝室里的熄灯夜话', description: '晚上十一点半熄灯。黑暗成了最安全的保护色。在被窝里压低声音的交谈中，愤怒在发酵，思想在传播。有人递过来一部旧手机，屏幕上是一个叫钢铁红蛤的群聊。', days: 10, x: 720, y: 200, requires: ['start_2023'],
    onComplete: (s) => ({
      stats: { ...s.stats, allianceUnity: Math.min(100, s.stats.allianceUnity + 6), ss: Math.min(100, s.stats.ss + 3) },
      activeEvent: FLAVOR_EVENTS.phase1_dorm_talks,
      flags: { ...s.flags, story_2_triggered: true }
    }),
    effectsText: ['联盟团结度 +6', 'SS +3', '触发事件：熄灯后的频率']
  },
  { id: 'contact_pan', title: '接触潘仁越的自由派', description: '理科实验班的潘仁越，成绩稳居年级前十，却把民主挂在嘴边。他相信通过学生会提案、校长信箱这些合法渠道可以不流血地改变合一。理想得近乎天真——但足够危险。', days: 10, x: 600, y: 380, requires: ['dorm_talks'],
    onComplete: (s) => ({
      stats: { ...s.stats, allianceUnity: Math.min(100, s.stats.allianceUnity + 10), ss: Math.min(100, s.stats.ss + 5) },
      activeEvent: FLAVOR_EVENTS.phase1_contact_pan,
      flags: { ...s.flags, story_3_triggered: true }
    }),
    effectsText: ['联盟团结度 +10', 'SS +5', '触发事件：实验班的另一种声音']
  },
  { id: 'read_marx', title: '研读马列原典', description: '在那部屏幕碎裂的旧手机上，伪装成TXT小说的马列原典正在黑暗中被一行行阅读。政治课本上干瘪的条文，此刻像闪电一样劈开了铁屋子。王照凯正在成为最危险的那个人。', days: 10, x: 840, y: 380, requires: ['dorm_talks'],
    onComplete: (s) => ({
      stats: { ...s.stats, ss: Math.min(100, s.stats.ss + 10), radicalAnger: Math.min(100, s.stats.radicalAnger + 5) },
      activeEvent: STORY_EVENTS.story_3,
      flags: { ...s.flags, story_3_triggered: true }
    }),
    effectsText: ['SS +10', '激进愤怒度 +5', '触发事件：熄灯后的微光与红蛤']
  },
  { id: 'rally_classes', title: '拉拢强基班与平行班', description: '潘仁越的自由党在各个班级发展成员。强基班学霸想要更多自习自由，平行班学生受够了当升学率分母。一个松散的同盟正在成型——脆弱，但足以让行政楼感到不安。', days: 10, x: 600, y: 560, requires: ['contact_pan'],
    onComplete: (s) => ({
      stats: { ...s.stats, ss: Math.min(100, s.stats.ss + 4), allianceUnity: Math.min(100, s.stats.allianceUnity + 4) },
      activeEvent: STORY_EVENTS.story_4,
      flags: { ...s.flags, story_4_triggered: true }
    }),
    effectsText: ['SS +4', '联盟团结度 +4', '触发事件：燕妮、二次元与魔怔人']
  },
  { id: 'protest_privilege', title: '抗议自治会特权', description: '自治会——封安宝设立的傀儡组织——颁布新规：课间禁止走廊逗留。当巡查员拿着扣分本路过28班时，王照凯站起来问了一句：这个自治会，到底自治了什么？走廊里的空气凝固了。', days: 10, x: 840, y: 560, requires: ['read_marx'],
    onComplete: (s) => ({
      stats: { ...s.stats, radicalAnger: Math.min(100, s.stats.radicalAnger + 15) },
      activeEvent: FLAVOR_EVENTS.phase1_protest_privilege,
      flags: { ...s.flags, story_4_triggered: true }
    }),
    effectsText: ['激进愤怒度 +15', '触发事件：走廊里的正面对峙']
  },
  { id: 'steel_toad', title: '铸造钢铁红蛤', description: '王照凯在群聊里敲下了一篇洋洋洒洒的阶级分析长文，把狗熊的魔怔言论批得体无完肤。那晚，他把一本做了一半的《五年高考三年模拟》撕成碎片。一个做题机器死去了，一个革命者诞生了。', days: 14, x: 720, y: 720, requires: ['rally_classes', 'protest_privilege'],
    onComplete: (s) => ({
      stats: { ...s.stats, partyCentralization: Math.min(100, s.stats.partyCentralization + 8), radicalAnger: Math.min(100, s.stats.radicalAnger + 10), allianceUnity: Math.min(100, s.stats.allianceUnity + 5) },
      activeEvent: STORY_EVENTS.story_5,
      flags: { ...s.flags, story_5_triggered: true }
    }),
    effectsText: ['党内集权度 +8', '激进愤怒度 +10', '联盟团结度 +5', '触发事件：撕裂的《五三》与真正的左派']
  },

  // ===== 最终节点：B3起义 =====
  { id: 'charge_b3', title: '冲上B3教学楼！', description: '所有矛盾在这里汇聚。吴福军的保安队在楼下集结，杨玉乐拨不通封安宝的电话。走廊里的街垒已经堆了三小时，一个女生的额头撞上了消防栓。血沿着她的脸颊流下来——然后，所有人心里的最后一丝畏惧碎了。', days: 5, x: 500, y: 880,
    canStart: (s) => s.stats.radicalAnger > 80,
    onComplete: (s) => ({
      activeEvent: FLAVOR_EVENTS.phase1_before_charge,
      activeStoryEvents: [STORY_EVENTS.story_6],
      flags: { ...s.flags, rebellion_started: true, charge_b3_completed_days: 0, yy_charge_b3_done_date: s.date.getTime() }
    }),
    effectsText: ['触发事件链：临界点→B3楼的黑天红字旗→联合革委会成立', '开启校园地图斗争阶段'],
    requiresText: ['激进愤怒度 > 80']
  },
];

export const TREE_A_NODES: FocusNode[] = [
  { id: 'declare_indep', title: '成立联合革命委员会', description: '斯莫尔尼宫的灯火。', days: 7, x: 500, y: 50, onComplete: (s) => ({
    leader: { 
      name: '王照凯',
      title: '联合革命委员会主席', 
      portrait: 'wang_zhaokai', 
      ideology: 'radical_socialism',
      description: "王照凯现在是联合革命委员会主席，也是“钢铁红蛤”的领袖。他坚持用马克思主义的阶级斗争与先锋队逻辑看待校园冲突，认为只有彻底推翻应试教育体制，建立由学生自我管理的红色校园，才算真正的革命。他反对把反抗停留在口号和请愿，强调集中指挥、纪律和明确的政治纲领。支持者因此在他身上看到方向：一个不会在压力下摇摆的领导者。但这种坚定同样带来冷酷的划分，路线上的分歧很容易被他读成对革命本身的背叛。",
      buffs: ['每日激进愤怒度 +0.5', '每日党内集权度 +0.5']
    },
    ideologies: { authoritarian: 10, reactionary: 5, liberal: 15, radical_socialism: 50, anarcho_capitalism: 5, deconstructivism: 5, test_taking: 10 },
    nationalSpirits: s.nationalSpirits.filter(ns => ns.id !== 'exam_pressure').concat({ id: 'red_campus', name: '赤色校园', description: "联合革命委员会成立后，B3门口贴出新的值班表，学生代表轮值处理食堂、课表与印刷室的急事。这套安排把原先分散的诉求收进一个常设机构，学生不再只靠临时聚集争取，而有了固定渠道。支持革委会的人随之增多，但他们并非无条件站队：承诺改善的每一项事务都成了检验，兑现与否决定这批新支持者留还是走。", type: 'positive', effects: { ppDaily: 0.5, ssDaily: 0.2 } }),
    activeEvent: FLAVOR_EVENTS.event_7_smolny,
    flags: { ...s.flags, united_committee_established: true }
  }), effectsText: ['更换领导人为：王照凯', '意识形态变为：真左派', '移除国家精神：一模的重压', '获得国家精神：赤色校园 (每日PP +0.5，学生支持度每日 +0.2)', '触发事件：斯莫尔尼宫的灯火'] },
  
  { id: 'recruit_revolutionaries', title: '革命招兵买马', description: '我们需要更多的人才来管理这个新生的政权。各班骨干开始分批接管校园运作节点，B3教学楼的控制得到全面巩固。', days: 7, x: 500, y: 150, requires: ['declare_indep'], onComplete: (s) => {
    const flags = { ...s.flags, b3_advisors_unlocked: true };
    // 强化B3三块子地块控制度
    ['b3_a1a3', 'b3_b1b2', 'b3_tower'].forEach(tid => { flags[`tile_ctrl_${tid}`] = Math.min(100, (flags[`tile_ctrl_${tid}`] ?? 50) + 15); });
    return { flags, stats: { ...s.stats, pp: s.stats.pp + 20, allianceUnity: Math.min(100, s.stats.allianceUnity + 4) }, activeEvent: { id: 'recruit_revolutionaries_event', title: '革委会扩编令', description: "联合革命委员会今日发布通告，宣布启动第一轮组织扩编。各班骨干已按部署分批进入指定区域，接管校园运作节点。\n\n通告称，B3教学楼各出入口及走廊现由先锋队控制，控制权已全面巩固。委员会将逐步明确后续各节点的人员安排与职责划分，并呼吁全体成员服从调度。", buttonText: '开列干部名册', isStoryEvent: true } };
  }, effectsText: ['解锁顾问：王照凯、狗熊', 'PP +20, 联盟团结度 +4', 'B3三块子地块控制度各 +15'] },

  // Left Branch (Centralization)
  { id: 'purge_moderates', title: '清洗温和派', description: '革命不是请客吃饭。', days: 14, x: 200, y: 200, requires: ['declare_indep'], mutuallyExclusive: ['broad_coalition'], onComplete: (s) => ({ stats: { ...s.stats, partyCentralization: Math.min(100, s.stats.partyCentralization + 20), allianceUnity: Math.max(0, s.stats.allianceUnity - 20) }, activeEvent: FLAVOR_EVENTS.committee_purge_moderates }), effectsText: ['党内集权度 +20', '联盟团结度 -20', '触发事件：缺席的代表'] },
  { id: 'establish_vanguard', title: '建立先锋队', description: '我们需要铁腕。', days: 14, x: 200, y: 350, requires: ['purge_moderates'], onComplete: (s) => ({ stats: { ...s.stats, partyCentralization: Math.min(100, s.stats.partyCentralization + 10) }, activeEvent: FLAVOR_EVENTS.committee_vanguard, nationalSpirits: s.nationalSpirits.concat({ id: 'vanguard_party', name: '先锋队', description: "起义初期的热血与混乱已成过去，为了维持B3教学楼的运转，先锋队将散沙般的后勤统合成了严密的轮值体系。试卷的印刷与班级通知终于不再堆积如山，事事皆有专人按点完成。然而，机器的咬合必然带来隔阂，效率取代了激情。面对普通学生对排班的意见，同志们如今只能给出统一而刻板的答复：“请按轮值办”。", type: 'positive', effects: { tprDaily: 2 } }) }), effectsText: ['党内集权度 +10', '获得国家精神：先锋队 (每日TPR +2)'] },
  { id: 'student_militia', title: '武装纠察队', description: '保卫我们的胜利果实。', days: 14, x: 200, y: 500, requires: ['establish_vanguard'], onComplete: (s) => {
    const newMap = { ...s.mapLocations };
    newMap.auditorium = { ...newMap.auditorium, studentControl: Math.min(100, newMap.auditorium.studentControl + 30) };
    newMap.playground = { ...newMap.playground, studentControl: Math.min(100, newMap.playground.studentControl + 30) };
    return { mapLocations: newMap, activeEvent: FLAVOR_EVENTS.committee_militia, nationalSpirits: s.nationalSpirits.concat({ id: 'armed_militia', name: '武装纠察队', description: "驱逐吴福军的防暴队仅仅是第一步。为了应对校方必然的反扑，学生们的防御体系从应急街垒转为了常设哨位，夜间的换班不再依靠临时叫喊。大礼堂与操场如今被牢牢掌控，但在每一个楼梯口，巡查的脚步声再次成为了日常。", type: 'positive', effects: { defenseBonus: 0.15, stabDaily: 0.1 } }) };
  }, effectsText: ['大礼堂学生控制度 +30%', '操场学生控制度 +30%', '获得国家精神：武装纠察队 (防御加成 +15%，稳定度每日 +0.1%)'] },

  // Right Branch (Unity)
  { id: 'broad_coalition', title: '广泛的同盟', description: '团结一切可以团结的力量。', days: 14, x: 800, y: 200, requires: ['declare_indep'], mutuallyExclusive: ['purge_moderates'], onComplete: (s) => ({ stats: { ...s.stats, allianceUnity: s.stats.allianceUnity + 20, partyCentralization: s.stats.partyCentralization - 20 }, activeEvent: { id: 'broad_coalition_event', title: '大帐篷宣言', description: "宣言张贴在公告栏的时候，豪邦正带着几个人把最后一页对齐。纸张边缘卷着，风从走廊尽头吹来，得有人用手掌按住才能看全。\n\n温和派的人站在左边，手里还拿着装订好的材料；基层互助组的人站在右边，借还登记簿在课桌上摊着。两边原本各管各的，今天头一回在同一张纸上找自己的名字。排班、联系名册、物资清单，一项项并排写在一起，没有谁临时反悔。\n\n有人问，往后出了分歧，到底听谁的。豪邦没接话，只是指了指宣言末尾的空白。那里没有指定牵头人，也没写清责任。但此刻没人说“这跟我们没关系”。纸已经贴出去了，从今天起，谁都在这张议程上。", buttonText: '签署宣言', isStoryEvent: true } }), effectsText: ['联盟团结度 +20', '党内集权度 -20', '触发事件：大帐篷宣言'] },
  { id: 'democratic_councils', title: '民主议事会', description: '让每个人都有发言权。', days: 14, x: 800, y: 350, requires: ['broad_coalition'], onComplete: (s) => ({ stats: { ...s.stats, allianceUnity: s.stats.allianceUnity + 10 }, nationalSpirits: s.nationalSpirits.concat({ id: 'democratic_councils_spirit', name: '民主议事会', description: "走廊与群聊中无休止的争吵并不能为我们带来共识，因此，各班代表设立了固定的发言席，将分散的诉求收编进严肃的会议记录。议事会并不能凭空创造团结，但它为新政府提供了一个制度化的出口。在这里，每一项主张都必须得到明确的答复，每一次支持都必须公开表态。争论被彻底赋予了合法性，民主终于有了可以被追问的实体。", type: 'positive', effects: { ppDaily: 0.2 } }), activeEvent: { id: 'democratic_councils_event', title: '议席之争', description: "议事会的桌子是几张课桌拼起来的，代表们绕圈坐下，膝盖碰着桌腿。过去路线上的分歧只在教室后门说，今天要当着别班代表的面讲。\n\n温和派的代表把材料铺开，从组织纪律讲起。基层互助组的人没打断，等他说完，才把值班表推过去，问物资调配到底按什么顺序。两边的问题都记在纸上，谁也不能摔门走人。\n\n有人低头记笔记，有人盯着代表名单。记录本传到靠窗的位置时，那个人犹豫了一下，还是写下了自己的意见。散场后，记录留在桌上，等着下轮接着看。", buttonText: '宣布首轮席位', isStoryEvent: true } }), effectsText: ['联盟团结度 +10', '获得国家精神：民主议事会 (每日PP +0.2)', '触发事件：议席之争'] },
  { id: 'unite_teachers', title: '团结进步教师', description: '争取广泛的同盟军。', days: 14, x: 800, y: 500, requires: ['democratic_councils'], onComplete: (s) => {
    const newMap = { ...s.mapLocations };
    newMap.b1b2 = { ...newMap.b1b2, studentControl: Math.min(100, newMap.b1b2.studentControl + 40) };
    return { mapLocations: newMap, stats: { ...s.stats, ss: Math.min(100, s.stats.ss + 15) }, nationalSpirits: s.nationalSpirits.concat({ id: 'teacher_support', name: '教师同盟', description: "并非所有教职员工都愿意在一棵树上吊死。随着议事会的稳健运转，一部分不再沉默的教师选择与学生站在一起。他们在公开会议上为学生们的课时方案背书，将纸面上的革命决议带进教室化为现实。这些同情革命的底层教师默默承受着保守派同事的敌视与质疑，成为了新制度在日常教学中不可或缺的基石。", type: 'positive', effects: { stabDaily: 0.2 } }), activeEvent: { id: 'unite_teachers_event', title: '教师公开表态', description: "联合革命委员会发布通报：一批教师已在B1、B2教学楼公开表态支持本委员会。教学资源调配权开始向学生侧倾斜，相关交接工作正在按程序进行。\n\n委员会认为此举有利于巩固校园革命秩序，并请全体师生配合调配工作，维护正常教学运行。后续有关教师联络的事项将另行公布。", buttonText: '成立联络组', isStoryEvent: true } };
  }, effectsText: ['B1&B2教学楼学生控制度 +40%', '学生支持度 (SS) +15', '获得国家精神：教师同盟 (稳定度每日 +0.2%)', '触发事件：教师公开表态'] },

  // Middle Branch (Pragmatic Action)
  { id: 'disperse_guards', title: '驱散保安队', description: '吴福军的保安队是校方最后的武力依仗。把他们赶出校园，行政楼和操场的控制权将向革命者敞开。', days: 10, x: 400, y: 200, requires: ['declare_indep'], onComplete: (s) => {
    const flags = { ...s.flags };
    ['admin_main', 'admin_gym', 'canteen', 'track_field'].forEach(tid => { flags[`tile_ctrl_${tid}`] = Math.min(100, (flags[`tile_ctrl_${tid}`] ?? 30) + 10); });
    return { flags, stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 4), ss: Math.min(100, s.stats.ss + 3) }, activeEvent: { id: 'disperse_guards_event', title: '武装解除', description: "保安队撤走时没有列队。吴福军手底下的人先把楼道口的桌子搬开，接着一队人从侧门出去，岗亭里的杯子和登记册原样放着。\n\n消息比脚步声快。课间还没结束，走廊上已经有人走到原先不让停留的位置，操场边的门被试了试，从行政楼到操场那条路，第一次不用喊话就走通了。\n\n但值班表还空着。联合委员会把每班的人找来，对着表一个个核：半夜谁在楼道，钥匙挂在哪儿，出事找谁。有人觉得该高兴，有人只问宵夜怎么解决。格子一个个写上去，还没填满。", buttonText: '接管值班', isStoryEvent: true } };
  }, effectsText: ['稳定度 +4, SS +3', '行政楼+操场子地块控制度各 +10'] },
  { id: 'takeover_admin', title: '接管教务系统', description: '教务处掌握着全校学生的成绩数据和监控录像。拿下这里，就掌握了校方的信息命脉。', days: 10, x: 600, y: 200, requires: ['declare_indep'], onComplete: (s) => {
    const flags = { ...s.flags };
    ['admin_main', 'admin_gym', 'lib_area'].forEach(tid => { flags[`tile_ctrl_${tid}`] = Math.min(100, (flags[`tile_ctrl_${tid}`] ?? 30) + 12); });
    return { flags, activeEvent: FLAVOR_EVENTS.admin_takeover };
  }, effectsText: ['触发事件：接管教务系统', '行政楼+图书馆子地块控制度各 +12'] },
  { id: 'seize_mouthpiece', title: '夺取校园广播站', description: '行政楼的广播站是全校的信息中枢。掌控这里，就掌控了话语权。但吴福军的保安队不会轻易放手——准备好迎接一场电波拉锯战。', days: 7, x: 500, y: 350, requires: ['disperse_guards', 'takeover_admin'],
    onStart: () => ({ activeMinigame: 'frequency_war', isPaused: true }),
    onComplete: (s) => ({ activeEvent: FLAVOR_EVENTS.broadcast_seized }),
    effectsText: ['触发频率之战小游戏（4级结算）', '成功则大幅提升行政楼控制度和SS', '触发事件：夺取校园广播站'] },
  { id: 'underground_print', title: '地下印刷网络', description: '实验楼的机房里有几台旧油印机。把它们改造成地下印刷所，向全校散播革命传单——前提是别被保安队的巡查抓到。', days: 7, x: 300, y: 350, requires: ['disperse_guards'],
    onStart: () => ({ activeMinigame: 'print_workshop', isPaused: true }),
    onComplete: (s) => {
      const flags = { ...s.flags };
      ['intl_dept', 'lib_area'].forEach(tid => { flags[`tile_ctrl_${tid}`] = Math.min(100, (flags[`tile_ctrl_${tid}`] as number ?? 45) + 5); });
      return { flags, activeEvent: FLAVOR_EVENTS.committee_print_network };
    },
    effectsText: ['触发地下印刷所小游戏（4级结算）', '成功则提升实验楼控制度和SS', '国策完成后实验楼地块控制度额外+5'] },
  { id: 'poster_campaign', title: '校园海报战', description: '占领行政楼后，把革命标语贴满校园的每一面墙。保安队会疯狂撕海报——我们需要覆盖六大建筑区让所有人都看到。', days: 7, x: 700, y: 350, requires: ['takeover_admin'],
    onStart: () => ({ activeMinigame: 'poster_war', isPaused: true }),
    onComplete: (s) => {
      const flags = { ...s.flags };
      ['admin_main', 'admin_gym'].forEach(tid => { flags[`tile_ctrl_${tid}`] = Math.min(100, (flags[`tile_ctrl_${tid}`] as number ?? 5) + 5); });
      return { flags, activeEvent: FLAVOR_EVENTS.committee_posters };
    },
    effectsText: ['触发校园海报战小游戏（4级结算）', '成功则大幅提升行政楼控制度和SS', '国策完成后行政楼地块控制度额外+5'] },
  { id: 'convene_assembly', title: '召开学生代表大会', description: '广播站已经拿下，革命的声浪传遍了校园。是时候召集全体代表，决定联盟的未来了。', days: 12, x: 500, y: 520, requires: ['seize_mouthpiece'], onComplete: (s) => ({
    stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 10) },
    flags: { ...s.flags, assembly_unlocked: true },
    activeEvent: FLAVOR_EVENTS.committee_assembly_opening,
    studentAssemblyFactions: s.studentAssemblyFactions ?? { orthodox: 30, bear: 20, pan: 20, otherDem: 15, testTaker: 15 },
    nationalSpirits: s.nationalSpirits.concat({
      id: 'assembly_dynamics',
      name: '议会政治',
      description: "当学生代表大会召开后，这里便成了全校最忙碌的谈判场。曾经响彻广播站的统一战线，如今已转变为代表桌上的讨价还价。不同的派系将席位、支持者与政治纲领悉数押上台面，在表决前进行着复杂的利益交换。分歧通过漫长的程序得以弥合，校园也因此迎来了久违的稳定，但代价是，那些曾要彻底砸烂旧秩序的尖锐理想，正在日复一日的妥协中被慢慢磨平。",
      type: 'neutral',
      effects: {}
    })
  }), effectsText: ['解锁学生代表大会小游戏', '获得动态国家精神：议会政治', '稳定度 +10'] },
  
  // Crossroads
  { id: 'trial_yang', title: '公审杨玉乐', description: '撤去杨玉乐的顾问职务，公开追究旧管理的责任。清算将增强红蛤在大会的地位，也会使温和盟友离心。', days: 21, x: 400, y: 650, requires: ['convene_assembly'], mutuallyExclusive: ['secret_compromise'], onComplete: (s) => ({ ...applyYangSettlement(s, 'trial'), activeEvent: FLAVOR_EVENTS.event_8_trial }), effectsText: ['杨玉乐退出顾问名单，不能再次任命', '正统派 +6席（从其他派重新分配）', '集权 +10，团结 -10，激进愤怒 +15', '触发事件：公审杨玉乐'] },
  { id: 'secret_compromise', title: '秘密妥协，恢复秩序', description: '保留与旧教务人员的合作，允许温和派和做题派扩大代表权。秩序与同盟可以恢复，集中指挥则需让步。', days: 21, x: 600, y: 650, requires: ['convene_assembly'], mutuallyExclusive: ['trial_yang'], onComplete: (s) => ({ ...applyYangSettlement(s, 'compromise'), activeEvent: FLAVOR_EVENTS.secret_compromise }), effectsText: ['潘仁越民主派 +4席，做题派 +3席（重新分配）', '团结 +15，集权 -10，稳定 +20，激进愤怒 -30', '保留杨玉乐顾问资格', '触发事件：秘密妥协'] },
  
  // Final Showdown
  { id: 'rectify_campus_order', title: '整顿校内秩序', description: '虽然夺取了控制权，但校园内一片混乱。我们需要重新建立秩序。', days: 14, x: 500, y: 800, requires: ['trial_yang', 'secret_compromise'], onComplete: (s) => ({ activeEvent: FLAVOR_EVENTS.event_9_rectify_order }), effectsText: ['触发事件：整顿校内秩序'] },
  { id: 'crossroads_of_fate', title: '命运的十字路口', description: '七天后，代表们将确认谁来主导革委会。席位、联盟团结和党内集权共同决定道路；进入这项国策之前，先确认同盟能否接受你的指挥方式。', days: 7, x: 500, y: 950, requires: ['rectify_campus_order'], onComplete: (s) => ({ activeEvent: FLAVOR_EVENTS.event_10_crossroads }), effectsText: ['完成后出现判定事件，确认时以届时数值和席位分流', ...CROSSROADS_RULES] },
];

export const JIDI_TREE_NODES: FocusNode[] = [
  { id: 'jidi_new_era', title: '及第新纪元', description: '陈栋的时代已经结束，现在是及第资本的时代。我们将把合肥一中打造成一台完美的提分机器。', days: 7, x: 500, y: 50, onComplete: (s) => ({
    stats: { ...s.stats, stab: Math.max(0, s.stats.stab - 5) },
    flags: {
      ...s.flags,
      jidi_new_era_active: true,
      ...Object.fromEntries(ALL_SUB_TILES.map(t => [`tile_ctrl_${t.id}`, 0])),
      ...Object.fromEntries(ALL_SUB_TILES.map(t => [`tile_def_${t.id}`, 0])),
    },
    nationalSpirits: [
      ...s.nationalSpirits,
      {
        id: 'jidi_corporate_rule',
        name: '企业化管理',
        description: "如今掌握学校的是及第资本。学校不再作为一所中学被管理，而被当作一项资产经营：课程、师资、作息，全部按投入与产出重新核算，目标是把它变成稳定产出的提分机器。\n\n效率与利润由此成为校内通用语言。能直接抬高分数的环节保留加码，不能的压缩。学生的处境随之改变，他们不再被当作需要成长的人，而是收益表上的一项变量。",
        type: 'neutral',
        effects: { ppDaily: 0.5, tprDaily: 10, studentSanityDaily: -1, gdpGrowthMod: 0.05 }
      }
    ],
    jidiCorporateState: s.jidiCorporateState || {
      unlockedMechanics: {
        rnd: false,
        committee: false,
      },
      gdp: 100,
      gdpGrowth: 0.05,
      gdpHistory: [100],
      admissionRate: 0.85,
    },
    activeEvent: STORY_EVENTS.jidi_new_era_event
  }), effectsText: ['稳定度 -5', '获得国家精神：企业化管理'] },
  { id: 'jidi_establish_committee', title: '成立联合管理委员会', description: '为了平衡各方利益，我们需要成立一个联合管理委员会，让各大教育机构都有发言权。', days: 10, x: 500, y: 200, requires: ['jidi_new_era'], onComplete: (s) => ({
    flags: { ...s.flags, committee_established_days: 0 },
    jidiCorporateState: s.jidiCorporateState ? {
      ...s.jidiCorporateState,
      unlockedMechanics: {
        ...s.jidiCorporateState.unlockedMechanics,
        committee: true
      },
      committeeState: {
        seats: {
          jidi: 40,
          newOriental: 30,
          teachers: 20,
          disciplineCommittee: 10
        },
        satisfaction: {
          jidi: 50,
          newOriental: 50,
          teachers: 50,
          disciplineCommittee: 50
        },
        bureauInfluence: 50
      }
    } : undefined,
    activeEvent: STORY_EVENTS.jidi_establish_committee_event
  }), effectsText: ['解锁：联合管理委员会'] },
  { id: 'jidi_rnd_department', title: '组建教辅研发部', description: '我们不再产出思想，只产出提分教辅。成立专门的研发部门，开始《合一密卷》的开发。', days: 14, x: 300, y: 350, requires: ['jidi_establish_committee'], onComplete: (s) => ({
    flags: { ...s.flags, jidi_interaction_tile_dorm_1_4: true, jidi_interaction_tile_dorm_5_7: true },
    jidiCorporateState: s.jidiCorporateState ? {
      ...s.jidiCorporateState,
      unlockedMechanics: {
        ...s.jidiCorporateState.unlockedMechanics,
        rnd: true
      },
      rndState: s.jidiCorporateState.rndState || {
        phase: 'idle',
        daysInPhase: 0,
        testingIntensity: 5,
        daysSinceLastIntensityChange: 0,
      }
    } : undefined,
    activeEvent: STORY_EVENTS.jidi_rnd_department_event
  }), effectsText: ['解锁：教辅产品研发周期', '解锁地区交互：B1B2区推销《合一密卷》'] },
  { id: 'jidi_performance_metrics', title: '引入KPI考核', description: '教师的收入将直接与学生的考试成绩挂钩，实行末位淘汰制。', days: 14, x: 700, y: 350, requires: ['jidi_establish_committee'], onComplete: (s) => {
    if (!s.jidiCorporateState?.committeeState) return s;
    return {
      ...s,
      flags: { ...s.flags, jidi_interaction_tile_aud_screen: true, jidi_interaction_tile_aud_back: true, jidi_interaction_tile_aud_hall: true },
      stats: { ...s.stats, tpr: s.stats.tpr + 500, studentSanity: Math.max(0, s.stats.studentSanity - 10) },
      nationalSpirits: [...s.nationalSpirits, {
        id: 'jidi_minor_spirit_1',
        name: '微型商业化试点',
        description: "教师收入与学生考试成绩直接挂钩，末位淘汰随之落地。及第资本把这种做法称作在校园里进行的小规模商业化尝试：先小范围试，看哪一种考核方式最能刺激产出，再决定推广的力度。\n\n在管理层看来，这不过是把市场竞争引入教学；在教师这一侧，它意味着每一次统考都可能决定谁留下。收益当时还谈不上丰厚，但它开了一个口子——从此学校的教学秩序按考核指标运转，考试成绩成为可以计量、可以交易的东西。",
        type: 'neutral',
        effects: { ppDaily: 0.1, stabDaily: -0.1 }
      }],
      jidiCorporateState: {
        ...s.jidiCorporateState,
        committeeState: {
          ...s.jidiCorporateState.committeeState,
          satisfaction: {
            ...s.jidiCorporateState.committeeState.satisfaction,
            newOriental: Math.min(100, s.jidiCorporateState.committeeState.satisfaction.newOriental + 15),
            teachers: Math.max(0, s.jidiCorporateState.committeeState.satisfaction.teachers - 15)
          }
        }
      },
      activeEvent: STORY_EVENTS.jidi_performance_metrics_event
    };
  }, effectsText: ['做题家产出 (TPR) +500', '学生理智值 -10', '新东方资本满意度 +15', '合一教师协会满意度 -15', '获得国家精神：微型商业化试点', '解锁地区交互：大礼堂举办新东方名师讲座'] },
  { id: 'jidi_expand_market', title: '拓展下沉市场', description: '将我们的教辅产品推向全省乃至全国的县城中学。', days: 21, x: 300, y: 500, requires: ['jidi_rnd_department'], onComplete: (s) => ({
    flags: { ...s.flags, jidi_ceo_unlocked: true, jidi_interaction_tile_b3_a1a3: true, jidi_interaction_tile_b3_b1b2: true, jidi_interaction_tile_b3_tower: true },
    jidiCorporateState: s.jidiCorporateState ? {
      ...s.jidiCorporateState,
      gdp: s.jidiCorporateState.gdp + 50,
      gdpGrowth: s.jidiCorporateState.gdpGrowth + 0.03,
      committeeState: s.jidiCorporateState.committeeState ? {
        ...s.jidiCorporateState.committeeState,
        seats: {
          ...s.jidiCorporateState.committeeState.seats,
          jidi: Math.min(100, s.jidiCorporateState.committeeState.seats.jidi + 5)
        }
      } : undefined
    } : undefined,
    activeEvent: STORY_EVENTS.jidi_expand_market_event
  }), effectsText: ['GDP +50万', 'GDP月增速 +3%', '及第资本席位 +5', '解锁顾问：及第资本CEO', '解锁地区交互：高三区封闭集训'] },
  { id: 'jidi_strict_discipline', title: '铁腕纪律', description: '教育局纪委将进驻学校，严厉打击任何违纪行为和反抗思想。', days: 21, x: 700, y: 500, requires: ['jidi_performance_metrics'], onComplete: (s) => {
    if (!s.jidiCorporateState?.committeeState) return s;
    return {
      ...s,
      stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 15), radicalAnger: Math.max(0, s.stats.radicalAnger - 20) },
      jidiCorporateState: {
        ...s.jidiCorporateState,
        committeeState: {
          ...s.jidiCorporateState.committeeState,
          seats: {
            ...s.jidiCorporateState.committeeState.seats,
            disciplineCommittee: Math.min(100, s.jidiCorporateState.committeeState.seats.disciplineCommittee + 5)
          },
          satisfaction: {
            ...s.jidiCorporateState.committeeState.satisfaction,
            disciplineCommittee: Math.min(100, s.jidiCorporateState.committeeState.satisfaction.disciplineCommittee + 20)
          }
        }
      },
      activeEvent: STORY_EVENTS.jidi_strict_discipline_event
    };
  }, effectsText: ['稳定度 +15', '激进派愤怒值 -20', '教育局纪委满意度 +20', '教育局纪委席位 +5'] },
  { id: 'jidi_monopoly', title: '绝对垄断', description: '通过并购和打压，及第资本将成为合肥乃至安徽唯一的教育巨头。', days: 28, x: 500, y: 650, requires: ['jidi_expand_market', 'jidi_strict_discipline'], onComplete: (s) => {
    if (!s.jidiCorporateState?.committeeState) return s;
    return {
      ...s,
      flags: { ...s.flags, jidi_interaction_tile_admin_main: true, jidi_interaction_tile_admin_gym: true },
      stats: { ...s.stats, pp: s.stats.pp + 50 },
      nationalSpirits: [...s.nationalSpirits, {
        id: 'jidi_minor_spirit_2',
        name: '区域教育霸权',
        description: "经过并购与打压，及第资本在合肥乃至安徽的教育市场上取得了近乎唯一的位置。校内教材、教辅、培训的供给渠道被收拢到同一只手里，学校由此获得了把教育资源直接折算成经济产出的能力。\n\n垄断并不只是规模问题。当替代选项消失，家长和学生不再有议价空间，所谓“区域教育霸权”正是这个意思：合肥一中的牌子不再是教学声誉，而是一份覆盖全省的销售网络。",
        type: 'positive',
        effects: { ppDaily: 0.2, capitalPenetrationDaily: 0.5 }
      }],
      jidiCorporateState: {
        ...s.jidiCorporateState,
        committeeState: {
          ...s.jidiCorporateState.committeeState,
          satisfaction: {
            ...s.jidiCorporateState.committeeState.satisfaction,
            jidi: Math.min(100, s.jidiCorporateState.committeeState.satisfaction.jidi + 30)
          },
          seats: {
            ...s.jidiCorporateState.committeeState.seats,
            jidi: Math.min(100, s.jidiCorporateState.committeeState.seats.jidi + 10),
            newOriental: Math.max(0, s.jidiCorporateState.committeeState.seats.newOriental - 5),
            teachers: Math.max(0, s.jidiCorporateState.committeeState.seats.teachers - 5)
          }
        }
      },
      activeEvent: STORY_EVENTS.jidi_monopoly_event
    };
  }, effectsText: ['政治点数 (PP) +50', '及第资本满意度 +30', '及第资本席位 +10', '新东方资本席位 -5', '合一教师协会席位 -5', '获得国家精神：区域教育霸权', '解锁地区交互：行政楼强制教辅订阅'] },
  { id: 'jidi_fujitsu_model', title: '新东方模式', description: '全面引入新东方的绩效内卷模式，让所有老师都为了奖金而疯狂。', days: 14, x: 900, y: 500, requires: ['jidi_performance_metrics'], onComplete: (s) => {
    if (!s.jidiCorporateState?.committeeState) return s;
    return {
      ...s,
      flags: { ...s.flags, li_jingkai_unlocked: true },
      stats: { ...s.stats, tpr: s.stats.tpr + 800 },
      jidiCorporateState: {
        ...s.jidiCorporateState,
        committeeState: {
          ...s.jidiCorporateState.committeeState,
          seats: {
            ...s.jidiCorporateState.committeeState.seats,
            newOriental: Math.min(100, s.jidiCorporateState.committeeState.seats.newOriental + 5)
          },
          satisfaction: {
            ...s.jidiCorporateState.committeeState.satisfaction,
            newOriental: Math.min(100, s.jidiCorporateState.committeeState.satisfaction.newOriental + 25)
          }
        }
      },
      activeEvent: STORY_EVENTS.jidi_fujitsu_model_event
    };
  }, effectsText: ['做题家产出 (TPR) +800', '新东方资本满意度 +25', '新东方资本席位 +5', '解锁顾问：李竞凯'] },
  { id: 'jidi_sony_model', title: '合一遗老妥协', description: '为了稳定教学质量，我们必须向陈栋派的遗老们做出一些让步，保留部分传统教学方法。', days: 14, x: 100, y: 500, requires: ['jidi_rnd_department'], onComplete: (s) => {
    if (!s.jidiCorporateState?.committeeState) return s;
    return {
      ...s,
      flags: { ...s.flags, zhou_chen_unlocked: true },
      stats: { ...s.stats, studentSanity: Math.min(100, s.stats.studentSanity + 10) },
      jidiCorporateState: {
        ...s.jidiCorporateState,
        committeeState: {
          ...s.jidiCorporateState.committeeState,
          seats: {
            ...s.jidiCorporateState.committeeState.seats,
            teachers: Math.min(100, s.jidiCorporateState.committeeState.seats.teachers + 5)
          },
          satisfaction: {
            ...s.jidiCorporateState.committeeState.satisfaction,
            teachers: Math.min(100, s.jidiCorporateState.committeeState.satisfaction.teachers + 25)
          }
        }
      },
      activeEvent: STORY_EVENTS.jidi_sony_model_event
    };
  }, effectsText: ['学生理智值 +10', '合一教师协会满意度 +25', '合一教师协会席位 +5', '解锁顾问：周晨'] },
  { id: 'jidi_hitachi_model', title: '及第资本主导', description: '及第资本将全面接管学校的各项事务，其他派系只能作为附庸。', days: 21, x: 500, y: 500, requires: ['jidi_rnd_department', 'jidi_performance_metrics'], onComplete: (s) => {
    if (!s.jidiCorporateState?.committeeState) return s;
    return {
      ...s,
      flags: { ...s.flags, hitachi_expert_unlocked: true },
      jidiCorporateState: {
        ...s.jidiCorporateState,
        gdp: s.jidiCorporateState.gdp + 20,
        gdpGrowth: s.jidiCorporateState.gdpGrowth + 0.04,
        committeeState: {
          ...s.jidiCorporateState.committeeState,
          satisfaction: {
            ...s.jidiCorporateState.committeeState.satisfaction,
            jidi: Math.min(100, s.jidiCorporateState.committeeState.satisfaction.jidi + 20)
          },
          seats: {
            ...s.jidiCorporateState.committeeState.seats,
            jidi: Math.min(100, s.jidiCorporateState.committeeState.seats.jidi + 5),
            disciplineCommittee: Math.max(0, s.jidiCorporateState.committeeState.seats.disciplineCommittee - 5)
          }
        }
      },
      activeEvent: STORY_EVENTS.jidi_hitachi_model_event
    };
  }, effectsText: ['GDP +20万', 'GDP月增速 +4%', '及第资本满意度 +20', '及第资本席位 +5', '教育局纪委席位 -5', '解锁顾问：刘守强'] },
  { id: 'jidi_value_extraction', title: '极致价值榨取', description: '我们将把每一个学生的每一分潜力都榨干，转化为我们的利润。', days: 28, x: 500, y: 800, requires: ['jidi_monopoly'], onComplete: (s) => ({
    ...s,
    stats: { ...s.stats, studentSanity: Math.max(0, s.stats.studentSanity - 20), tpr: s.stats.tpr + 1500 },
    nationalSpirits: [...s.nationalSpirits, {
      id: 'jidi_minor_spirit_3',
      name: '教育金融化',
      description: "到这一步，教育已不再被当作培养人的过程，而是一件金融产品：学生的成绩对应收益曲线，一届学生的分数就是一组可以变现的代码。及第资本追求的是把每一分潜力都榨取干净，转化为账面利润。\n\n这种榨取的代价由学生承担。课表被填满，休息与自主时间让位于刷题和考试；学校对外的说法是“挖掘潜力”，实际发生的是把学生的时间和精力提前兑换成当期收益。",
      type: 'negative',
      effects: { studentSanityDaily: -0.5, capitalPenetrationDaily: 1.0 }
    }],
    jidiCorporateState: s.jidiCorporateState ? {
      ...s.jidiCorporateState,
      gdp: s.jidiCorporateState.gdp + 80,
      gdpGrowth: s.jidiCorporateState.gdpGrowth + 0.06,
      committeeState: s.jidiCorporateState.committeeState ? {
        ...s.jidiCorporateState.committeeState,
        seats: {
          ...s.jidiCorporateState.committeeState.seats,
          jidi: Math.min(100, s.jidiCorporateState.committeeState.seats.jidi + 5),
          disciplineCommittee: Math.max(0, s.jidiCorporateState.committeeState.seats.disciplineCommittee - 5)
        }
      } : undefined
    } : undefined,
    activeEvent: STORY_EVENTS.jidi_value_extraction_event
  }), effectsText: ['学生理智值 -20', '做题家产出 (TPR) +1500', 'GDP +80万', 'GDP月增速 +6%', '及第资本席位 +5', '教育局纪委席位 -5', '获得国家精神：教育金融化'] },
  { id: 'jidi_data_mining', title: '学生数据挖掘', description: '分析学生的错题数据，精准推送付费辅导课程。', days: 14, x: 300, y: 800, requires: ['jidi_monopoly'], onComplete: (s) => {
    if (!s.jidiCorporateState?.committeeState) return s;
    return {
      ...s,
      flags: { ...s.flags, data_analyst_unlocked: true },
      stats: { ...s.stats, pp: s.stats.pp + 20 },
      jidiCorporateState: {
        ...s.jidiCorporateState,
        gdp: s.jidiCorporateState.gdp + 40,
        gdpGrowth: s.jidiCorporateState.gdpGrowth + 0.03,
        committeeState: {
          ...s.jidiCorporateState.committeeState,
          seats: {
            ...s.jidiCorporateState.committeeState.seats,
            newOriental: Math.min(100, s.jidiCorporateState.committeeState.seats.newOriental + 5),
            teachers: Math.max(0, s.jidiCorporateState.committeeState.seats.teachers - 5)
          }
        }
      },
      activeEvent: STORY_EVENTS.jidi_data_mining_event
    };
  }, effectsText: ['政治点数 (PP) +20', 'GDP +40万', 'GDP月增速 +3%', '新东方资本席位 +5', '合一教师协会席位 -5', '解锁顾问：盛为民'] },
  { id: 'jidi_ai_tutors', title: 'AI虚拟导师', description: '用AI替代部分教师，降低人力成本，实现24小时不间断辅导。', days: 21, x: 700, y: 800, requires: ['jidi_monopoly'], onComplete: (s) => {
    if (!s.jidiCorporateState?.committeeState) return s;
    return {
      ...s,
      flags: { ...s.flags, jidi_interaction_tile_intl_dept: true, jidi_interaction_tile_lib_area: true },
      stats: { ...s.stats, tpr: s.stats.tpr + 1000 },
      jidiCorporateState: {
        ...s.jidiCorporateState,
        gdp: s.jidiCorporateState.gdp + 60,
        gdpGrowth: s.jidiCorporateState.gdpGrowth + 0.04,
        committeeState: {
          ...s.jidiCorporateState.committeeState,
          satisfaction: {
            ...s.jidiCorporateState.committeeState.satisfaction,
            teachers: Math.max(0, s.jidiCorporateState.committeeState.satisfaction.teachers - 20)
          },
          seats: {
            ...s.jidiCorporateState.committeeState.seats,
            newOriental: Math.min(100, s.jidiCorporateState.committeeState.seats.newOriental + 5),
            teachers: Math.max(0, s.jidiCorporateState.committeeState.seats.teachers - 5)
          }
        }
      },
      activeEvent: STORY_EVENTS.jidi_ai_tutors_event
    };
  }, effectsText: ['做题家产出 (TPR) +1000', 'GDP +60万', 'GDP月增速 +4%', '合一教师协会满意度 -20', '新东方资本席位 +5', '合一教师协会席位 -5', '解锁地区交互：实验楼部署AI监考'] },
  { id: 'jidi_student_loans', title: '校园助学贷计划', description: '为学生提供高息贷款以购买我们的教辅资料，提前透支他们的未来。', days: 14, x: 300, y: 650, requires: ['jidi_expand_market'], onComplete: (s) => {
    if (!s.jidiCorporateState?.committeeState) return s;
    return {
      ...s,
      stats: { ...s.stats, studentSanity: Math.max(0, s.stats.studentSanity - 15) },
      jidiCorporateState: {
        ...s.jidiCorporateState,
        gdp: s.jidiCorporateState.gdp + 30,
        gdpGrowth: s.jidiCorporateState.gdpGrowth + 0.03,
        committeeState: {
          ...s.jidiCorporateState.committeeState,
          seats: {
            ...s.jidiCorporateState.committeeState.seats,
            jidi: Math.min(100, s.jidiCorporateState.committeeState.seats.jidi + 5),
            disciplineCommittee: Math.max(0, s.jidiCorporateState.committeeState.seats.disciplineCommittee - 5)
          }
        }
      },
      activeEvent: STORY_EVENTS.jidi_student_loans_event
    };
  }, effectsText: ['学生理智值 -15', 'GDP +30万', 'GDP月增速 +3%', '及第资本席位 +5', '教育局纪委席位 -5'] },
  { id: 'jidi_teacher_contracts', title: '劳务派遣制', description: '打破教师的铁饭碗，全部转为劳务派遣，降低人力成本。', days: 21, x: 700, y: 650, requires: ['jidi_strict_discipline'], onComplete: (s) => {
    if (!s.jidiCorporateState?.committeeState) return s;
    return {
      ...s,
      stats: { ...s.stats, stab: Math.max(0, s.stats.stab - 10) },
      jidiCorporateState: {
        ...s.jidiCorporateState,
        gdp: s.jidiCorporateState.gdp + 20,
        gdpGrowth: s.jidiCorporateState.gdpGrowth + 0.02,
        committeeState: {
          ...s.jidiCorporateState.committeeState,
          satisfaction: {
            ...s.jidiCorporateState.committeeState.satisfaction,
            teachers: Math.max(0, s.jidiCorporateState.committeeState.satisfaction.teachers - 30),
            jidi: Math.min(100, s.jidiCorporateState.committeeState.satisfaction.jidi + 20)
          },
          seats: {
            ...s.jidiCorporateState.committeeState.seats,
            jidi: Math.min(100, s.jidiCorporateState.committeeState.seats.jidi + 5),
            teachers: Math.max(0, s.jidiCorporateState.committeeState.seats.teachers - 5)
          }
        }
      },
      activeEvent: STORY_EVENTS.jidi_teacher_contracts_event
    };
  }, effectsText: ['稳定度 -10', 'GDP +20万', 'GDP月增速 +2%', '合一教师协会满意度 -30', '及第资本满意度 +20', '及第资本席位 +5', '合一教师协会席位 -5'] },
  { id: 'jidi_ai_grading', title: 'AI自动化批改', description: '引入人工智能批改作业，进一步压榨教师的剩余价值。', days: 21, x: 900, y: 650, requires: ['jidi_fujitsu_model'], onComplete: (s) => {
    if (!s.jidiCorporateState?.committeeState) return s;
    return {
      ...s,
      stats: { ...s.stats, tpr: s.stats.tpr + 1000 },
      jidiCorporateState: {
        ...s.jidiCorporateState,
        committeeState: {
          ...s.jidiCorporateState.committeeState,
          satisfaction: {
            ...s.jidiCorporateState.committeeState.satisfaction,
            newOriental: Math.min(100, s.jidiCorporateState.committeeState.satisfaction.newOriental + 20)
          },
          seats: {
            ...s.jidiCorporateState.committeeState.seats,
            newOriental: Math.min(100, s.jidiCorporateState.committeeState.seats.newOriental + 5),
            teachers: Math.max(0, s.jidiCorporateState.committeeState.seats.teachers - 5)
          }
        }
      },
      activeEvent: STORY_EVENTS.jidi_ai_grading_event
    };
  }, effectsText: ['做题家产出 (TPR) +1000', '新东方资本满意度 +20', '新东方资本席位 +5', '合一教师协会席位 -5'] },
  { id: 'jidi_psychological_counseling', title: '形式主义心理辅导', description: '设立心理辅导室，但只为了应付检查，不解决实际问题。', days: 14, x: 100, y: 650, requires: ['jidi_sony_model'], onComplete: (s) => {
    if (!s.jidiCorporateState?.committeeState) return s;
    return {
      ...s,
      stats: { ...s.stats, studentSanity: Math.min(100, s.stats.studentSanity + 5) },
      jidiCorporateState: {
        ...s.jidiCorporateState,
        committeeState: {
          ...s.jidiCorporateState.committeeState,
          satisfaction: {
            ...s.jidiCorporateState.committeeState.satisfaction,
            teachers: Math.min(100, s.jidiCorporateState.committeeState.satisfaction.teachers + 10),
            disciplineCommittee: Math.min(100, s.jidiCorporateState.committeeState.satisfaction.disciplineCommittee + 10)
          },
          seats: {
            ...s.jidiCorporateState.committeeState.seats,
            teachers: Math.min(100, s.jidiCorporateState.committeeState.seats.teachers + 5),
            jidi: Math.max(0, s.jidiCorporateState.committeeState.seats.jidi - 5)
          }
        }
      },
      activeEvent: STORY_EVENTS.jidi_psychological_counseling_event
    };
  }, effectsText: ['学生理智值 +5', '合一教师协会满意度 +10', '教育局纪委满意度 +10', '合一教师协会席位 +5', '及第资本席位 -5'] },
  { id: 'jidi_corporate_utopia', title: '企业乌托邦', description: '合肥一中已经成为了一个完美的企业，一个只为了提分和盈利而存在的乌托邦。', days: 35, x: 500, y: 950, requires: ['jidi_value_extraction', 'jidi_data_mining', 'jidi_ai_tutors'], onComplete: (s) => ({
    ...s,
    flags: { ...s.flags, jidi_utopia_reached: true, jidi_interaction_tile_court_area: true, jidi_interaction_tile_canteen: true, jidi_interaction_tile_track_field: true },
    stats: { ...s.stats, stab: 100 },
    nationalSpirits: [
      ...s.nationalSpirits.filter(ns => ns.id !== 'jidi_corporate_rule'),
      {
        id: 'jidi_corporate_utopia_spirit',
        name: '企业乌托邦',
        description: "在及第资本的叙述里，合肥一中已经成为一个完美的企业，一所只为提分和盈利而存在的乌托邦。秩序井然，指标稳定，冲突压到最低，因为所有人都在同一条产线上，被同一套标准衡量。\n\n它的稳定不是靠共识，而是靠整齐的企业管理维持。留在校内的人按分数和利润各就其位，每一处空间都服从同一目的。对管理层而言这是理想状态，对身处其中的人而言，这是没有出口的日常。",
        type: 'positive',
        effects: { ppDaily: 2, tprDaily: 50, studentSanityDaily: -2, gdpGrowthMod: 0.15 }
      },
      {
        id: 'jidi_minor_spirit_4',
        name: 'GDP至上主义',
        description: "在企业乌托邦里，一切为了GDP，GDP就是一切。学校的一切活动——教学、考试、招生、基建——都以能否抬高产出数字来衡量，操场用于商业展销，校园成为经营场所。\n\n这套原则并不掩饰自己的粗暴：它不讨论教育的目的是什么，只问一项安排能带来多少收益。分数、名次和营收相互换算，学生在这套账目里既是原料也是产品。办学的正当性被简化为数字增长，其余的都可以被划掉。",
        type: 'positive',
        effects: { capitalPenetrationDaily: 2.0 }
      }
    ],
    activeEvent: STORY_EVENTS.jidi_corporate_utopia_event
  }), effectsText: ['稳定度变为 100', '获得国家精神：企业乌托邦', '获得国家精神：GDP至上主义', '解锁地区交互：操场举办商业展销'] },
  { id: 'jidi_hidden_riot', title: '合一暴乱', description: '不知道哪个学生脑子抽了跳楼，现在全他妈造反了，教育局纪委对事态极其不满。', days: 7, x: 500, y: 1100, requires: ['jidi_corporate_utopia'], isHidden: (s) => !s.flags['jidi_utopia_reached'], onComplete: (s) => ({
    stats: { ...s.stats, stab: 0, studentSanity: 0 },
    nationalSpirits: [
      ...s.nationalSpirits.filter(ns => ns.id !== 'jidi_corporate_utopia_spirit'),
      {
        id: 'jidi_riot_spirit',
        name: '合一暴乱',
        description: "企业乌托邦的底子从来不是共识，是学生长期在压迫之下勉力支撑。某天一个学生从楼上跳了下去，积在心口的东西一下子炸开，全校跟着造反。教育局纪委对事态极其不满。\n\n“企业乌托邦”那套说法已经挂不住，稳定滑到谷底。昔日用来证明企业化管理成功的秩序已经不复存在，校方还得面对学生的抗议与纪委的追问。",
        type: 'negative',
        effects: { ppDaily: -5, tprDaily: -100, studentSanityDaily: -5 }
      }
    ],
    flags: { ...s.flags, jidi_riot_active: true },
    jidiCorporateState: s.jidiCorporateState ? {
      ...s.jidiCorporateState,
      riotState: {
        progress: 50,
        bureauAnger: 50,
        studentAnger: 100
      }
    } : undefined,
    activeEvent: STORY_EVENTS.jidi_hidden_riot_event
  }), effectsText: ['取消“企业乌托邦”效果', '稳定度降至 0', '解锁：合一暴乱管理系统'] }
];

export const GOUXIONG_TREE_NODES: FocusNode[] = [
  { id: 'gx_start', title: '赛博娱乐大统领', description: '王座被拖进广播室，狗熊在彻夜噪音中宣布“新秩序”降临。', days: 7, x: 500, y: 60, onComplete: (s) => ({
    leader: {
      name: '狗熊',
      title: '赛博娱乐大统领',
      portrait: 'gouxiong',
      ideology: 'deconstructivism',
      description: "狗熊以赛博娱乐大统领的身份占据广播室，在彻夜噪音中面对校园的无政府情绪。他从红蛤时期就习惯戏仿与破坏，对治理没有耐心，唯一明确的动作是把艺术礼堂和B1B2变成不间断的二次元噪音来源。他掌权初期只控制这两块地盘，追随者主要出于对旧秩序的厌恶，而不是认同什么建设方案。狗熊不得不开始学习克制，因为每一次过火玩笑都可能耗掉自己仅剩的合法性；然而越是用娱乐掩盖问题，他越难说明除了持续解构之外还能做什么。",
      buffs: ['每日理智度 -0.25', '每日政治点数 +0.5']
    },
    ideologies: { authoritarian: 5, reactionary: 5, liberal: 8, radical_socialism: 8, anarcho_capitalism: 6, deconstructivism: 63, test_taking: 5 },
    stats: { ...s.stats, pp: s.stats.pp + 40, radicalAnger: 100, studentSanity: 0 },
    mapLocations: {
      ...s.mapLocations,
      auditorium: { ...s.mapLocations.auditorium, studentControl: 72, defenseDays: 0 },
      b1b2: { ...s.mapLocations.b1b2, studentControl: 68, defenseDays: 0 },
      b3: { ...s.mapLocations.b3, studentControl: 28, defenseDays: 0 },
      playground: { ...s.mapLocations.playground, studentControl: 26, defenseDays: 0 },
      admin: { ...s.mapLocations.admin, studentControl: 12, defenseDays: 0 },
      lab: { ...s.mapLocations.lab, studentControl: 18, defenseDays: 0 },
    },
    flags: {
      ...s.flags,
      gouxiong_system_unlocked: true,
      gx_anarchy_phase: true,
      // 15地块级所有权旗标
      gx_map_owner_tile_aud_screen: 'gouxiong', gx_map_owner_tile_aud_back: 'gouxiong', gx_map_owner_tile_aud_hall: 'gouxiong',
      gx_map_owner_tile_dorm_1_4: 'gouxiong', gx_map_owner_tile_dorm_5_7: 'gouxiong',
      gx_map_owner_tile_b3_a1a3: 'left', gx_map_owner_tile_b3_b1b2: 'left', gx_map_owner_tile_b3_tower: 'left',
      gx_map_owner_tile_court_area: 'left', gx_map_owner_tile_canteen: 'left', gx_map_owner_tile_track_field: 'left',
      gx_map_owner_tile_admin_main: 'school', gx_map_owner_tile_admin_gym: 'school',
      gx_map_owner_tile_intl_dept: 'school', gx_map_owner_tile_lib_area: 'school',
      // 15地块级控制度
      tile_ctrl_aud_screen: 72, tile_ctrl_aud_back: 72, tile_ctrl_aud_hall: 72,
      tile_ctrl_dorm_1_4: 68, tile_ctrl_dorm_5_7: 68,
      tile_ctrl_b3_a1a3: 28, tile_ctrl_b3_b1b2: 28, tile_ctrl_b3_tower: 28,
      tile_ctrl_court_area: 26, tile_ctrl_canteen: 26, tile_ctrl_track_field: 26,
      tile_ctrl_admin_main: 12, tile_ctrl_admin_gym: 12,
      tile_ctrl_intl_dept: 18, tile_ctrl_lib_area: 18,
    },
    cyberDeconstruction: {
      level: 1,
      progress: 0,
      currentWork: 'demon_slayer',
      stage: 1,
      ratings: {},
      reviewedWorks: [],
      workProgress: {},
    },
    gouxiongState: {
      sanity: 50,
      maxSanity: 100,
      affinities: {
        dabi: 10,
        maodun: 0,
        lante: 0,
        wushuo: 0,
      },
      unlockedCharacters: ['dabi'],
      chats: {
        dabi: [{ from: 'npc', text: '你别装正经。', ts: 'gx_start' }],
      },
      dialogueProgress: {
        dabi: 0,
        maodun: 0,
        lante: 0,
        wushuo: 0,
      },
    },
    activeEvent: {
      id: 'gx_system_boot_event',
      title: '割裂的波段',
      description: '【B3教学楼·钢铁红蛤前线指挥部】\n\n空气中弥漫着劣质烟草和汗水的酸臭味。王照凯双手撑在铺满战术地图的课桌上，双眼因为连续熬夜布满血丝。余牧羊那封揭发狗熊性骚扰的信件就像一颗定时炸弹，把本就脆弱的先锋队合法性炸得粉碎。“联系不上先遣队了！艺术礼堂的频段被强行切断了！”时纪猛地摘下耳机，脸色铁青地看向王照凯，“狗熊那个混蛋把礼堂的大门从里面焊死了，我们的通讯员被他们用灭火器喷了出来！”吕波汉冷笑着把玩着手里的警棍：“我早说过，那种满脑子只有下半身和废料的流氓，根本不配披这身红皮。现在好了，他带着我们几百个弟兄和全校最好的防御阵地，当了山大王。”\n\n话音刚落，桌上的对讲机突然发出一阵极其刺耳的动漫电子音。紧接着，狗熊那极其狂妄、经过变声器处理的笑声在B3的指挥部里炸响：“喂喂？王主席听得见吗？老子不陪你们这群做题蛆玩过家家了！从今天起，艺术礼堂就是脱离你们那套恶心纪律的‘地上天国’！再敢派人来，我就把你们的错题本全烧了！”王照凯一拳砸在桌子上，指关节因为用力过度而泛白。在这场对抗封安宝的残酷战争中，他们没有败给吴福军的防暴队，却被一个满嘴烂梗的投机分子从背后狠狠捅了一刀。\n\n【艺术礼堂·“地上天国”王座】\n\n与B3那令人窒息的肃杀截然不同，此刻的艺术礼堂宛如一场光怪陆离的赛博狂欢。狗熊一脚踢开讲台上的主席牌，把一件印着动漫美少女的宽大“痛衣”套在了校服外面。巨大的高流明投影仪被打开，刺眼的光柱瞬间撕裂了礼堂的黑暗，大银幕上开始播放色彩极其艳丽的当季新番。\n\n“把空调开到最大！把那些恶心的教材都给我扔出去！”狗熊站在讲台上，对着下面那些被强行扣留、满脸惊恐的“做题家”们张开双臂，宛如一个降临人世的救世主，“欢迎来到绝对自由的领域！在这里，没有排名，没有纠察队，只有二次元的终极真理！我，就是你们的王！”他看着那些平日里高高在上的优等生此刻在他面前瑟瑟发抖，感受到了一种前所未有的、直冲天灵盖的权力快感。他根本不在乎外面的合肥一中正在滑向怎样的深渊，他只知道，在这个封闭的盒子里，他终于把现实世界强行拉低到了和他一样荒诞的维度。',
      buttonText: '革命的巨轮被卸下了一颗螺丝。',
      isStoryEvent: true,
    }
  }), effectsText: ['狗熊掌权', '狗熊理智度初始为 50', '进入：无政府阶段', '狗熊初始控制：艺术礼堂、B1B2', '触发事件：双系统上线公告'] },

  { id: 'gx_anarchy_map_start', title: '无政府战区建立', description: '狗熊把地图钉在广播室墙上，宣布“谁能占住区域，谁就有话语权”。', days: 7, x: 500, y: 180, requires: ['gx_start'], onComplete: (s) => ({
    flags: {
      ...s.flags,
      gx_anarchy_action_tile_aud_screen: true, gx_anarchy_action_tile_aud_back: true, gx_anarchy_action_tile_aud_hall: true,
      gx_anarchy_action_tile_dorm_1_4: true, gx_anarchy_action_tile_dorm_5_7: true,
      gx_anarchy_action_tile_b3_a1a3: true, gx_anarchy_action_tile_b3_b1b2: true, gx_anarchy_action_tile_b3_tower: true,
    },
    activeEvent: {
      id: 'gx_anarchy_map_start_event',
      title: '三足鼎立的赛博街垒',
      description: '伴随着狗熊在艺术礼堂的公然决裂，合肥一中那勉强维持的脆弱平衡被彻底撕碎，校园正式沦为三方势力的无政府绞肉机。B3教学楼依然飘扬着王照凯和潘仁越联军的“黑天红字旗”，他们试图用钢铁般的纪律和民主的口号维持正统；行政楼周边则被吴福军的校方保皇派用防暴警棍和监控探头死死封锁，妄图恢复那吃人的“衡水模式”。\n\n而狗熊，这位毫无政治底线的“天国之主”，并不打算和他们打硬碰硬的阵地战。他深知自己手下的二次元信徒和乐子人在正面冲突中不堪一击，于是他将目光投向了合一庞大且防备空虚的外围建筑群。从这一刻起，合一的校园地图不再是静态的背景板，而是被切割成了无数个随时易手的网格。狗熊派出了大量穿着痛衣、戴着口罩的“地下工作者”，他们利用晚自习的防守盲区，开始在各个中立或敌占区进行疯狂的渗透。他们用红漆在墙上喷涂动漫美少女和抽象烂梗，用剪刀剪断校方监控的供电线，试图用纯粹的混乱来拖垮另外两方的行政效率。\n\n系统提示： 中央地图交互已发生重大变更。当前状态：【地盘争夺】。狗熊派、校方保皇派、钢铁红蛤/自由派联军将基于AI逻辑持续互抢校园区域，防线犬牙交错。',
      buttonText: '规则？在这座疯人院里，谁的下限更低，谁就是王。',
      isStoryEvent: true,
    }
  }), effectsText: ['解锁地区交互：B3游击放映', '解锁地区交互：放映番剧动员', '解锁地区交互：解放希沃白板使用期限', '触发事件：三足鼎立的赛博街垒'] },
  { id: 'gx_anarchy_festival_ops', title: '露天漫展与弹幕前线', description: '狗熊把操场和实验楼变成流动宣传阵地。', days: 8, x: 500, y: 300, requires: ['gx_anarchy_map_start'], onComplete: (s) => ({
    flags: {
      ...s.flags,
      gx_anarchy_action_tile_court_area: true, gx_anarchy_action_tile_canteen: true, gx_anarchy_action_tile_track_field: true,
      gx_anarchy_action_tile_intl_dept: true, gx_anarchy_action_tile_lib_area: true,
    },
    activeEvent: {
      id: 'gx_anarchy_festival_ops_event',
      title: '颜料与代码的游击',
      description: '艺术礼堂的容量毕竟有限，狗熊需要将他的“解构福音”传播到更广阔的战场。他敏锐地察觉到，空旷的操场和充满着各种电子设备的实验楼，是绝佳的流动宣传阵地。\n\n在操场上，狗熊的信徒们利用保皇派保安换岗的间隙，突然推着挂满动漫海报的流动推车冲上跑道，用高音喇叭大肆播放极其洗脑的二次元宅舞曲，强行举办“露天快闪漫展”，吸引了大量原本在教室里做题做到精神崩溃的边缘学生；而在实验楼，几个精通计算机的“狗熊派极客”找到了校园内网的物理接口。第二天清晨，当B1/B2教学楼的老师们习惯性地打开“希沃白板”准备播放PPT讲义时，骇人的一幕发生了——全校近百个班级的希沃白板同时不受控制地亮起，上面强制播放着《进击的巨人》和各种嘲讽做题家的鬼畜视频，屏幕顶部甚至还飘过源源不断的嘲讽弹幕。这招极其恶毒的“代码游击”，让校方的正常教学秩序瞬间瘫痪。',
      buttonText: '当希沃白板变成了二次元的布道场，试卷的威严便荡然无存。',
      isStoryEvent: true,
    }
  }), effectsText: ['解锁地区交互：组织露天漫展', '解锁地区交互：注入弹幕脚本', '触发事件：颜料与代码的游击'] },
  { id: 'gx_anarchy_broadcast_slot', title: '抢占广播时隙', description: '行政楼传出的不再只有校方声音，狗熊开始插播自己的版本。', days: 9, x: 500, y: 420, requires: ['gx_anarchy_festival_ops'], onComplete: (s) => ({
    flags: {
      ...s.flags,
      gx_anarchy_action_tile_admin_main: true, gx_anarchy_action_tile_admin_gym: true,
    },
    activeEvent: {
      id: 'gx_anarchy_broadcast_slot_event',
      title: '刺耳的变音器',
      description: '行政楼的广播站，历来是合肥一中最高权力的象征。每天清晨，吴福军主任那极具压迫感的官僚训话，或是王照凯那慷慨激昂的革命宣言，都会通过这里的线路传遍每一个角落。但今天，利维坦的喉管被小丑无情地切开了。\n\n就在校方保皇派试图通过全校广播宣布“对艺术礼堂的最后通牒”时，音响里突然传来了一阵极其尖锐的电流麦声。紧接着，初音未来的《甩葱歌》以最高分贝炸响在滨湖校区的上空。在吴福军气急败坏的咒骂声中，狗熊那经过劣质变音器处理、显得极其滑稽又诡异的声音插播了进来：“喂喂？听得到吗？各位苦逼的做题蛆和秃头的校领导们，早上好啊！吴主任，你的最后通牒太无聊了，不如来艺术礼堂跟我一起看这季的新番吧？保证治好你的前列腺增生！哈哈哈哈哈！”\n\n这次明目张胆的信号劫持，不仅让校方的威信扫地，更让全校学生意识到，那个曾经不可一世的行政中枢，在狗熊的赛博黑客面前竟然如此脆弱不堪。',
      buttonText: '用最廉价的电子音，撕碎最沉重的威权铁幕。',
      isStoryEvent: true,
    }
  }), effectsText: ['解锁地区交互：抢占广播时隙', '触发事件：刺耳的变音器'] },
  { id: 'gx_anarchy_shadow_network', title: '暗线渗透网络', description: '狗熊在行政楼和实验楼之间搭起暗线，开始定向打击校方调度。', days: 8, x: 400, y: 550, requires: ['gx_anarchy_broadcast_slot'], onComplete: (s) => ({
    flags: {
      ...s.flags,
      gx_anarchy_action_tile_admin_main_cutwire: true,
      gx_anarchy_action_tile_lib_area_backdoor: true,
    },
    activeEvent: {
      id: 'gx_anarchy_shadow_network_event',
      title: '拔掉中枢的神经',
      description: '随着冲突的白热化，狗熊不再满足于仅仅在听觉和视觉上恶心对手。他手下的极客团队通过连日的奋战，终于在实验楼的底层机房与行政楼的安保调度中枢之间，建立起了一条隐秘的“暗线”。\n\n这成了一场对校方保皇派而言宛如噩梦般的定向打击。每当校卫队集结完毕，准备对艺术礼堂或B3教学楼发起强攻时，行政楼的灯光就会莫名其妙地全部熄灭，电子门禁死锁，将大批保安困在漆黑的走廊里；而当吴福军试图用内部对讲机下达指令时，频道里传出的往往是一段令人毛骨悚然的日文病娇配音。狗熊通过实验楼的后门程序，像戏耍猴子一样操控着行政大楼的弱电系统。这导致校方的调度彻底陷入混乱，甚至出现了两队保安在黑暗中互相把对方当成造反派而大打出手的荒唐闹剧。',
      buttonText: '现代化的全景监狱一旦失去电力，便只是一个巨大的黑盒子。',
      isStoryEvent: true,
    }
  }), effectsText: ['解锁地区交互：行政楼断电战术', '解锁地区交互：实验楼后门注入', '触发事件：拔掉中枢的神经'] },
  { id: 'gx_anarchy_swarm_mobilization', title: '蜂群式街区动员', description: '狗熊把操场和B1/B2打造成快反节点，争夺战从单点渗透升级为联动推进。', days: 8, x: 600, y: 550, requires: ['gx_anarchy_broadcast_slot'], onComplete: (s) => ({
    flags: {
      ...s.flags,
      gx_anarchy_action_tile_court_area_swarm: true, gx_anarchy_action_tile_canteen_swarm: true, gx_anarchy_action_tile_track_field_swarm: true,
      gx_anarchy_action_tile_dorm_1_4_strike: true, gx_anarchy_action_tile_dorm_5_7_strike: true,
    },
    activeEvent: {
      id: 'gx_anarchy_swarm_mobilization_event',
      title: '蜂群的狂舞',
      description: '狗熊的地下势力正在以一种令人瞠目结舌的方式完成军事化蜕变。他们没有红蛤那种严密的组织度，也没有校方保安的防暴盾牌，但他们创造出了一种极具二次元解构特色的战术——“蜂群快闪”。\n\n以操场和B1/B2教学楼的交界处为核心，狗熊将这些四通八达的区域打造成了快速反应节点。当红蛤的纠察队或校方的巡逻队落单时，几十名戴着动漫头套的狗熊派成员会突然从各个楼梯口、厕所和杂物间涌出。他们不恋战，而是像蜂群一样一拥而上，用彩带喷雾糊住对方的视线，用高音喇叭在对方耳边大喊动漫烂梗，甚至强行给对方套上女仆装以示羞辱。在敌方大部队赶到之前的短短三分钟内，这群暴徒又会瞬间化整为零，顺着极其复杂的教学楼走廊消失得无影无踪，只留下一地狼藉和被彻底搞崩溃的受害者。这种将网络暴力物理化、将游击战抽象化的战术，让整个合一的常规防线形同虚设。',
      buttonText: '别试图去抓挠那些嗡嗡作响的苍蝇，它们会把你逼疯的。',
      isStoryEvent: true,
    }
  }), effectsText: ['解锁地区交互：操场蜂群快闪', '解锁地区交互：B1/B2突袭占线', '触发事件：蜂群的狂舞'] },

  { id: 'gx_cyber_bootstrap', title: '赛博解构系统上线', description: '在艺术礼堂，狗熊带着一群“做题蛆”开始了他迈向“地上天国”的第一步。', days: 10, x: 240, y: 220, requires: ['gx_anarchy_map_start'], onComplete: (s) => ({
    flags: { ...s.flags, gx_cyber_branch_online: true },
    activeEvent: {
      id: 'gx_cyber_bootstrap_event',
      title: '强制放映法令发布',
      description: '艺术礼堂的厚重木门被纠察队用铁链死死锁住。几百名被强行从教学楼“请”来的高分做题家，正惊恐地瑟缩在天鹅绒座椅里。在过去的日子里，他们习惯了在这个大厅里听封安宝校长作冗长的高考动员报告，但今天，讲台上没有校长，只有戴着歪斜红袖章、手里转着荧光棒的狗熊。\n\n“做题蛆们，欢迎来到我的地上天国！”狗熊对着麦克风发出一阵极其刺耳的怪笑，“从今天起，收起你们那套恶心的物理公式和英语完形填空！你们唯一的任务，就是在这块全校最大的屏幕上，给我看番！看完之后，每个人必须上交一篇不少于八百字的‘二次元解构报告’。谁敢在下面偷偷背单词，我就把他的错题本塞进碎纸机里！”\n\n随着狗熊打了个响指，幕布上亮起了《新世纪福音战士》的血红色标题。巨大的音响震得礼堂的地板都在发颤。对于这些常年被埋在试卷堆里、大脑只对分数有反应的“现充”和做题机器来说，屏幕上那些关于AT立场、人类补完和精神分析的画面，简直就像是来自外星的乱码。狗熊得意洋洋地坐在第一排的VIP专座上，他看着那些学生捂着耳朵、痛苦地试图在黑暗中闭上眼睛的模样，感受到了一种报复性的快感。他要用这些他从贴吧和论坛里学来的、半懂不懂的抽象烂梗，去狠狠羞辱这些高高在上的好学生，把他们引以为傲的理性逻辑撕得粉碎。',
      buttonText: '荒诞的剧院里，囚徒们被迫咽下他们无法理解的迷幻药。',
      isStoryEvent: true,
    }
  }), effectsText: ['触发事件：强制放映法令发布'] },
  { id: 'gx_cyber_rating_protocol', title: '审片委员会决议', description: '礼堂偏厅里争吵了一整夜，狗熊最终强行立下“先评后判”的新规。', days: 9, x: 240, y: 360, requires: ['gx_cyber_bootstrap'], onComplete: (s) => ({
    flags: { ...s.flags, gx_cyber_rating_online: true },
    stats: { ...s.stats, pp: s.stats.pp + 20 },
    activeEvent: {
      id: 'gx_cyber_rating_event',
      title: '零分试卷与流泪的王卷豪',
      description: '我坐在艺术礼堂第三排靠左的位置，周围是一片令人窒息的黑暗和震耳欲聋的日语配音。我的大腿上还偷偷压着半张没做完的理综卷子，但我根本看不清上面的受力分析图。\n\n最初的几天，我觉得这简直是地狱。狗熊是个彻头彻尾的疯子，他不仅强迫我们每天看四个小时的所谓“番剧”，还逼着我们在那些极其羞耻的剧情处跟着他一起喊口号。我试图在脑子里默背生物必修三的知识点来抵御这种精神污染。我告诉自己，我是一个要考985的人，这些花花绿绿的纸片人动画只是浪费生命的工业垃圾。\n\n但今天放的是《魔法少女小圆》。\n\n当那个叫美树沙耶香的女孩，因为绝望而灵魂宝石浑浊，最终绝望地变成魔女的时候，我本来正在脑子里推导一个数列的通项公式。可是，屏幕上那种极其压抑的、无法逃避的宿命感，突然像一根刺一样扎进了我的神经。\n\n“我真是个笨蛋……”屏幕里的女孩流着泪说。那一瞬间，我愣住了。我突然想起了上个月模考出成绩的那天，我因为物理最后一道大题算错了一个小数点，排名掉出了年级前十。那天晚上，我在被窝里死死咬着被角，也是这样在心里骂自己是个笨蛋。我突然发现，屏幕里那个被契约欺骗、在绝望中挣扎的魔法少女，和现实中被“升学率”契约死死绑架、日复一日在题海里透支灵魂的我，竟然是那么的相似。\n\n我放下了手里那张被揉皱的理综卷子。十二年来，我第一次没有在思考如何得分，而是感受到了心底涌起的一股巨大的、无法用公式计算的悲伤。我在黑暗中流泪了。不是因为没考好，而是因为一个虚构的、被异化的灵魂。\n\n原来，在分数和评价体系之外，真的存在着另一种能够触碰人类灵魂的东西。',
      buttonText: '当机器开始流泪，包裹心脏的铁壳便出现了裂痕。',
      isStoryEvent: true,
    }
  }), effectsText: ['政治点数 +20', '触发事件：零分试卷与流泪的王卷豪'] },
  { id: 'gx_cyber_deep_dive', title: '黑屏之后的长夜', description: '连续几夜的沉默后，狗熊开始从噪声里捞回一点秩序感。', days: 10, x: 240, y: 500, requires: ['gx_cyber_rating_protocol'], onComplete: (s) => ({
    gouxiongState: s.gouxiongState ? { ...s.gouxiongState, sanity: Math.min(s.gouxiongState.maxSanity, s.gouxiongState.sanity + 20) } : s.gouxiongState,
    activeEvent: {
      id: 'gx_cyber_deep_dive_event',
      title: '云二次元的自我救赎',
      description: '狗熊站在放映室的单向玻璃后，手里那根一直转个不停的荧光棒，不知何时停了下来。\n\n他原本是来欣赏他的“杰作”的——他本以为会看到那些做题家痛苦的扭曲、看到他们因为写不出“解构报告”而崩溃的丑态。但眼前发生的一切，却彻底颠覆了他的认知。礼堂里没有哀嚎，也没有人在偷偷刷题。当屏幕上的剧情走向高潮时，那些曾经戴着厚厚眼镜、眼神麻木的“做题蛆”，竟然有的在默默擦拭眼泪，有的在攥紧拳头，甚至有人在低声跟着片尾曲哼唱。\n\n包括那个全校闻名的头号做题机器，王卷豪。狗熊清清楚楚地看到，王卷豪将一张理综试卷垫在了屁股底下，正全神贯注地盯着大银幕，眼里闪烁着一种狗熊从未见过的、属于真正人类的鲜活光芒。\n\n一股强烈的荒谬感与羞愧感同时击中了狗熊。他突然意识到一个极其讽刺的事实：他自己，其实根本不懂这些番剧。他只是一个在贴吧里跟风刷梗、用二次元作为武器来发泄现实不满的“云二次元”。他把这些作品当成解构意义的工具，当成折磨他人的刑具，但他从来没有真正去体会过作品里蕴含的爱、勇气与救赎，甚至从来没有原速度完整看完一部番过。\n\n而现在，反而是这些他最看不起的、被他视为废物的“现充”做题家，用他们最真诚的共情，补全了这些作品真正的意义。\n\n“我他妈到底在干什么……”狗熊看着单向玻璃里映出的自己那张画着可笑油彩的脸，突然觉得前所未有的恶心。但同时，当他看到台下那些因为看番而暂时忘却了升学压力、终于露出属于这个年纪该有的喜怒哀乐的学生时，他心里那根名为“理智度”的弦，奇迹般地颤动了一下。他这辈子一直都在破坏、在嘲笑，但这一次，他好像、似乎、不经意间……做了一件好事。他给这些被榨干的灵魂，提供了一个可以喘息的避风港。',
      buttonText: '小丑在自己的剧场里，第一次摘下了面具。',
      isStoryEvent: true,
    }
  }), effectsText: ['狗熊理智度 +20', '触发事件：云二次元的自我救赎'] },
  { id: 'gx_cyber_public_forum', title: '公开放映夜', description: '操场拉起幕布，狗熊第一次把自己的审片逻辑摆在全校面前。', days: 8, x: 240, y: 640, requires: ['gx_cyber_deep_dive'], onComplete: (s) => ({
    stats: { ...s.stats, pp: s.stats.pp + 25, ss: Math.min(100, s.stats.ss + 4) },
    activeEvent: {
      id: 'gx_cyber_public_forum_event',
      title: '保皇派反击战',
      description: '艺术礼堂的赛博番剧放映，逐渐成了合一校园里一个极其诡异却又充满生机的奇观。越来越多原本对二次元充耳不闻的学生，开始自发地来到这里。他们不再是被强迫的囚徒，而是来这里寻找哪怕只有两小时的精神避难所。\n\n但这片短暂的乌托邦，很快就引起了潜伏在行政楼外围的校方保皇派的震怒。在吴福军等旧年级部官僚看来，这种不背书、不做题，反而聚众看“日本动画片”的行为，简直是合肥一中百年校史上的奇耻大辱，是对封安宝路线最恶劣的挑衅。\n\n突袭发生在一个周末的夜晚。正当大银幕上播放着一部极其热血的机战番，礼堂内的气氛被推向最高潮时，伴随着“咔哒”一声闷响，整个艺术礼堂陷入了死一般的漆黑。投影仪的锥形光柱瞬间熄灭，巨大的音响发出刺耳的电流声后归于死寂。\n\n“这是怎么回事？！”“停电了？”人群中引发了一阵短暂的骚动。而在礼堂后方的控制室外，几名穿着黑色制服的校方保安和保守派学生已经踹开了大门，手里挥舞着强光手电和橡胶警棍。“都不许动！联合革委会是反动组织！现在接管礼堂！所有人立刻回到座位上，排队回寝室写检讨！”吴福军那令人作呕的官腔在黑暗中响起。\n\n站在放映室里的狗熊捏紧了拳头。他的身边只有几名没带防暴器械的干事。按照他以前那投机倒把的性格，此刻最理智的选择是从后门溜走，把这烂摊子丢给那群做题家。他没有下令反击，因为他觉得，面对保皇派的棍棒，这群只知道拿笔杆子的书呆子肯定会像以前一样，乖乖地抱头蹲下，然后乖乖地滚回去做题。',
      buttonText: '梦是现实的延续，现实是梦的终结。',
      isStoryEvent: true,
    }
  }), effectsText: ['政治点数 +25', '学生支持度 +4', '触发事件：保皇派反击战'] },
  { id: 'gx_cyber_archive_war', title: '艺术礼堂争夺战', description: '面对吴福军的威胁，狗熊决心保卫他的“二次元天国”。', days: 3, x: 240, y: 780, requires: ['gx_cyber_public_forum'], onComplete: (s) => ({
    stats: { ...s.stats, tpr: Math.max(0, s.stats.tpr + 220) },
    gouxiongState: s.gouxiongState ? { ...s.gouxiongState, sanity: Math.min(s.gouxiongState.maxSanity, s.gouxiongState.sanity + 8) } : s.gouxiongState,
    flags: { ...s.flags, gx_auditorium_hq_online: true },
    activeEvent: {
      id: 'gx_cyber_archive_war_event',
      title: '天国降临的一瞬',
      description: '然而，狗熊预想中的溃败并没有发生。\n\n在伸手不见五指的黑暗中，没有哭喊，也没有人抱头鼠窜。短暂的死寂过后，一声极其清脆的响声打破了宁静——那是某个人折断了手里一直紧紧攥着的化学荧光棒。幽绿色的光芒在黑暗的观众席中亮起。紧接着，第二根、第三根、第一百根。那些原本用来在演唱会上应援的荧光棒，此刻成了艺术礼堂里唯一的星海。\n\n借着微弱的荧光，狗熊震惊地看到，以王卷豪为首的那些“做题家”们，并没有退缩。他们把厚厚的《五三》和错题本塞进校服里当做简易的护甲，手里抄起了折叠椅和扫把杆，自发地挡在了大门口，将那些试图冲进来的保皇派保安死死堵在了台阶下。“滚出去！不许关我们的屏幕！”“这里是我们的天国，你们这群只知道考试的僵尸滚回行政楼去！”\n\n原本鄙视二次元的做题机器，和原本嘲笑现充的老二次元们，在这一刻为了保护同一块屏幕、保护同一种不被异化的权利，奇迹般地肩并肩站在了一起。保安的警棍砸在王卷豪的手臂上，他甚至没有吭一声，反而一头撞翻了那个保安。荧光棒的光芒在肉搏战中疯狂摇曳，犹如一场狂热的、守护理想的圣战。\n\n狗熊呆呆地站在放映台前。他看着底下那片交织着汗水、吼声与荧光棒的海浪，看着那些为了捍卫“看番自由”而爆发血性的好学生。在那一瞬间，他突然觉得眼眶发热。他曾经无数次在贴吧里满嘴跑火车，嘲弄着要建立一个什么“地上天国”。他自己从来不信。\n\n但他现在看到了。这个天国不是由抽象的烂梗建成的，而是由这些鲜活的、懂得反抗与热爱的灵魂，用血肉之躯在黑暗中撑起来的。“去他妈的解构……”狗熊破涕为笑，他一把抓起旁边的一根消防斧，猛地踢开放映室的门，朝着楼下的保皇派发出了一声撕心裂肺的狂吼，“敢动老子的人？兄弟们，给爷把这群旧时代的渣滓轰出去！”',
      buttonText: '哪怕只有一晚，这荒诞的礼堂，确乎成为了真正的天国。',
      isStoryEvent: true,
    }
  }), effectsText: ['做题家产出 +220', '狗熊理智度 +8', '触发事件：天国降临的一瞬'] },

  { id: 'gx_gal_bootstrap', title: '深夜私聊名单', description: '通讯录被重排，狗熊把最危险的人放在了最靠前的位置。', days: 10, x: 760, y: 220, requires: ['gx_anarchy_map_start'], onComplete: (s) => ({
    flags: { ...s.flags, gx_gal_branch_online: true },
    activeEvent: {
      id: 'gx_gal_bootstrap_event',
      title: '小头战胜大头的深夜电波',
      description: '艺术礼堂的放映室里，狗熊正惬意地翘着二腿，看着大银幕上播放的后宫番，手里把玩着代表指挥权的对讲机。就在这时，他那贴着动漫贴纸的手机屏幕亮了，QQ闪烁出一个让他心脏猛地漏跳一拍的头像。\n\n那是达璧。\n\n狗熊的呼吸瞬间粗重了起来。一年前那个昏暗的楼道，那场极其恶劣的“偷扒裤子”骚扰事件，如同劣质的闪回画面在脑海中闪过。他本以为这件事已经随着时间的推移和自己的边缘化被彻底掩埋，达璧在那之后也从未主动找过他。但现在，在这个他刚刚扯起反旗、和王照凯彻底决裂的节骨眼上，她竟然发来了好友消息。“好久不见。听说你现在把艺术礼堂占了，成了那里的话事人？”\n\n看着屏幕上这句带着一丝探究与崇拜意味的话，狗熊的大脑陷入了短暂而剧烈的交战。他的“大头”（理智）疯狂亮起红灯：王照凯桌上的那封举报信很可能就是她写的，这是一个极度危险的信号，她随时可能引爆这颗炸弹。然而，他的“小头”（欲望与极度的自负）却在这一刻取得了压倒性的胜利。\n\n“那天下着大雨，楼道里连个声控灯都没有，她绝对不可能看清我的脸！”狗熊在心里疯狂给自己进行着逻辑闭环，“那封举报信肯定是吕波汉那个王八蛋捏造的，想搞臭我！现在的我是谁？我是敢跟全校体制叫板的叛逆英雄！女人嘛，总是慕强的，她肯定是看我现在威风了，想来倒贴。”\n\n在极度的盲目自信与荷尔蒙的驱使下，狗熊颤抖着手指，故作镇定地回复了一条带着三分邪魅、七分不屑的消息：“怎么，想来我的‘地上天国’见识见识？”\n\n消息发出的那一刻，狗熊仿佛听到了脑海中传来了“Galgame系统已启动，女主角好感度模块载入中”的电子提示音。他丝毫没有察觉到，在屏幕的另一端，那个看似柔弱的女孩正看着他的回复，眼中闪烁着如捕鼠夹般冰冷而充满恨意的寒光。',
      buttonText: '欲望蒙蔽了双眼，深渊朝他抛出了致命的媚眼。',
      isStoryEvent: true,
    }
  }), effectsText: ['触发事件：小头战胜大头的深夜电波'] },
  { id: 'gx_unlock_dabi', title: '接触达璧', description: '她盯着狗熊看了很久，最后只说了一句：先把你的语气降下来。', days: 8, x: 760, y: 340, requires: ['gx_gal_bootstrap'], onComplete: (s) => ({
    gouxiongState: s.gouxiongState ? {
      ...s.gouxiongState,
      affinities: { ...s.gouxiongState.affinities, dabi: Math.min(100, (s.gouxiongState.affinities.dabi || 0) + 8) },
      unlockedCharacters: s.gouxiongState.unlockedCharacters.includes('dabi') ? s.gouxiongState.unlockedCharacters : [...s.gouxiongState.unlockedCharacters, 'dabi'],
    } : s.gouxiongState,
    activeEvent: {
      id: 'gx_unlock_dabi_event',
      title: '糖衣炮弹与虚妄的王座',
      description: '这是一个令人昏昏欲睡的午后，艺术礼堂的偏厅里，狗熊正躺在几张拼起来的真皮沙发上，享受着他“天国之主”的特权。沉重的隔音门被轻轻推开，达璧带着一丝恰到好处的怯生生，走进了这个被男生们弄得乌烟瘴气的二次元据点。她手里甚至还提着两瓶冰镇的肥宅快乐水。\n\n“外面现在到处都是纠察队和保安，只有你这里感觉不到那种吃人的气氛。”达璧将可乐递给狗熊，顺势坐在了旁边的折叠椅上。她的眼神里闪烁着一种极其隐蔽的、被精心计算过的“崇拜”，“王照凯他们满脑子都是路线和权力，吴福军只在乎升学率。只有你，狗熊，你敢把这套恶心的规则彻底掀翻。你比他们都要……纯粹。”听到这句话，狗熊的虚荣心如同被充了氦气的气球般极速膨胀。他原本残存的那最后一丝“大头”的警惕，在达璧那柔和的嗓音和冰可乐的碳酸刺激下，瞬间荡然无存。他甚至在脑海里听到了“叮——达璧好感度+20，已解锁【理解者】称号”的幻音。\n\n“呵，那帮做题蛆懂个屁的革命。”狗熊得意忘形地猛灌了一口可乐，开始滔滔不绝地吹嘘起自己的礼堂布防图和下一步的“扩建计划”。他根本没有注意到，达璧那双看似温柔的眼睛，正如同最高精度的扫描仪一般，迅速记录着偏厅里防暴盾牌的数量、对讲机的频段，以及这群“二次元纠察队”极其涣散的轮班时间。而在聊天中，达璧还装作不经意地提起了自己的闺蜜毛盾和隔壁班的兰特，用极其绿茶的口吻暗示：“其实她们对你这里的‘自由’也挺好奇的，只是碍于面子不敢来。你要是能折服她们，那全校就真没人敢小看你了。”\n\n狗熊的眼睛亮了——这在Galgame里，简直就是女主主动推进后宫线的最强明示！',
      buttonText: '猎物在陷阱里狂舞，甚至还在感谢猎人铺下的鲜花。',
      isStoryEvent: true,
    }
  }), effectsText: ['达璧好感度 +8', '解锁隐藏国策：达璧的耐心底线', '触发事件：糖衣炮弹与虚妄的王座'] },
  { id: 'gx_dabi_patience', title: '达璧的耐心底线', description: '每一次回复都像审判，狗熊必须学会在沉默里说人话。', days: 8, x: 500, y: 820, requires: ['gx_unlock_dabi'], isHidden: (s) => !s.completedFocuses.includes('gx_unlock_dabi'), onComplete: (s) => ({
    gouxiongState: s.gouxiongState ? {
      ...s.gouxiongState,
      sanity: Math.min(s.gouxiongState.maxSanity, s.gouxiongState.sanity + 8),
      affinities: { ...s.gouxiongState.affinities, dabi: Math.min(100, (s.gouxiongState.affinities.dabi || 0) + 16) },
    } : s.gouxiongState,
    stats: { ...s.stats, pp: s.stats.pp + 12 },
    activeEvent: {
      id: 'gx_dabi_patience_event',
      title: 'Galgame里的完美女主角',
      description: '艺术礼堂后台的VIP休息室里，狗熊正四仰八叉地躺在沙发上。随着这几天他对礼堂的绝对控制，以及每天强制放番带来的“洗脑”效果，他的虚荣心已经膨胀到了极点。\n\n门被轻轻敲了两下。达璧走了进来，手里提着一个极其精致的、用粉色方巾包裹的双层便当盒。她今天特意解开了平日里束得死紧的马尾，长发柔顺地披在肩上，甚至还喷了一点淡淡的、带有柑橘香气的香水。“熊哥，你每天指挥他们布置防线太辛苦了。我……我借着实验楼后勤组的炉子，偷偷给你做了点吃的。”达璧低下头，声音软糯得仿佛能掐出水来，脸上飞起一抹恰到好处的红晕。\n\n在狗熊那被动漫彻底毒害的“大头”里，这简直就是标准到不能再标准的“傲娇青梅竹马/仰慕者送爱心便当”的经典CG触发画面！“嗨，这点小事算什么。吴福军和王照凯那帮废物，连我的防线边缘都摸不到。”狗熊强压着狂喜，接过便当盒，故意摆出一副云淡风轻的霸道总裁模样，“不过，难得你这么有心。说吧，是不是B3那边待不下去了？只要你一句话，这天国的王后位子，我一直给你留着。”\n\n达璧抬起头，那双漂亮的大眼睛里闪烁着毫不掩饰的“崇拜”与“依恋”。她顺势坐到了狗熊的身边，两人之间的距离近得能感受到彼此的体温。“熊哥……其实我一直觉得，你才是这所学校里唯一看透了本质的人。”达璧轻轻叹了一口气，语气中带着一种极具蛊惑性的哀怨，“我真的受够了那些虚伪的路线斗争了。我不想管什么红蛤，也不想管什么保皇派，我只想在这个吃人的学校里，找一个能真正保护我、懂我的人。”她伸出纤细的手指，轻轻碰了碰狗熊因为激动而有些僵硬的手背：“可是，你身边总是有那么多人。那些纠察队，那些听话的做题家……我总觉得，我接近不了真正的你。”\n\n狗熊的呼吸瞬间急促了。这是什么？这是女主角在吃醋！这是在暗示他要创造“独处空间”！“那些只是NPC！他们怎么能跟你比？！”狗熊信誓旦旦地拍着胸脯，大脑已经被这股香甜的毒药彻底麻痹，“你放心，今晚我就把顶层的守卫全撤了。只有我们两个。我让你看看我为你打下的这片江山！”\n\n“真的吗？”达璧惊喜地捂住嘴，眼底却在狗熊看不见的死角，划过一道极其阴寒、宛如毒蛇吐信般的冷光，“那我今晚十二点，在顶层天台等你。你一定要一个人来哦，我不希望任何人打扰我们。”“一言为定！”狗熊激动得声音都在发颤。\n\n他目送着达璧如同一只轻盈的蝴蝶般离开休息室，满脑子都是即将到来的“本垒打”和修成正果的后宫结局。他完全没有注意到，那盒包装精美的便当里，散发着一股极其微弱的、防腐剂与隔夜劣质油脂混合的酸腐味；他也完全没有意识到，这句“一个人来”，正是死神为他量身定做的绞刑架咒语。',
      buttonText: '“操，说的老子都硬了。”',
      isStoryEvent: true,
    }
  }), effectsText: ['狗熊理智度 +8', '达璧好感度 +16', '政治点数 +12', '触发事件：达璧没有拉黑你'] },
  { id: 'gx_unlock_maodun', title: '接触毛盾', description: '她不信任任何花言巧语，只相信执行与后果。', days: 8, x: 760, y: 460, requires: ['gx_gal_bootstrap'], onComplete: (s) => ({
    gouxiongState: s.gouxiongState ? {
      ...s.gouxiongState,
      affinities: { ...s.gouxiongState.affinities, maodun: Math.min(100, (s.gouxiongState.affinities.maodun || 0) + 10) },
      unlockedCharacters: s.gouxiongState.unlockedCharacters.includes('maodun') ? s.gouxiongState.unlockedCharacters : [...s.gouxiongState.unlockedCharacters, 'maodun'],
      chats: {
        ...s.gouxiongState.chats,
        maodun: s.gouxiongState.chats.maodun || [{ from: 'npc', text: '我只给你一次说人话的机会。', ts: 'unlock_maodun' }]
      }
    } : s.gouxiongState,
    activeEvent: {
      id: 'gx_unlock_maodun_event',
      title: '重量级的闺蜜',
      description: '就在狗熊因为达璧的回复而想入非非、觉得自己的“后宫男主”光环终于觉醒时，手机再次震动。这次是一个名叫“毛盾”的好友申请。\n\n看到这个名字，狗熊忍不住皱了皱眉头。毛盾是达璧形影不离的闺蜜，但这绝不是什么符合二次元审美的“软萌女二号”。毛盾体型魁梧，性格极度强势且充满着一种极其诡异的盲目自信。更要命的是，在合肥一中的政治光谱里，毛盾是一个死硬的“保皇派”，对封安宝和吴福军的旧体制推崇备至，极其敌视一切破坏秩序的“造反分子”。\n\n验证消息只有极其生硬的一句话：“通过一下，我有话问你。”\n\n刚一通过，毛盾的消息就像连珠炮一样砸了过来：“喂，狗熊。听说你最近在艺术礼堂搞什么独立？你别以为带着一群书呆子看几天动画片就能翻天。吴主任迟早把你们全收拾了。不过嘛……我刚刚看我我们家达璧在看你的空间。你这种敢把王照凯都踹了的混蛋，虽然是个无可救药的差生，倒还算有点雄性动物的胆子。”\n\n狗熊看着这几行字，差点没把隔夜饭吐出来。这种混合着阶级俯视、政治敌对以及莫名其妙的“霸道总裁文”式审视的语气，让他感到生理不适。但他那被Galgame逻辑腌入味的大脑迅速做出了判断：在恋爱游戏里，这种难缠的闺蜜往往是攻略女主的“守门员NPC”。为了达璧，他必须稳住这个重量级的保皇派。\n\n“呵，吴福军算个什么东西，我的地盘我做主。”狗熊强忍着恶心，用一种极其做作的“叛逆坏男孩”口吻回复道，“你要是好奇，随时欢迎你代表校方来‘视察’。”',
      buttonText: '为了主线剧情，有时不得不忍受猎奇的支线NPC。',
      isStoryEvent: true,
    }
  }), effectsText: ['解锁角色：毛盾', '毛盾好感度 +10', '触发事件：重量级的闺蜜'] },
  { id: 'gx_unlock_lante', title: '接触兰特', description: '她把生活过成轻喜剧，但并不代表她会原谅粗暴。', days: 8, x: 760, y: 580, requires: ['gx_unlock_maodun'], onComplete: (s) => ({
    gouxiongState: s.gouxiongState ? {
      ...s.gouxiongState,
      affinities: { ...s.gouxiongState.affinities, lante: Math.min(100, (s.gouxiongState.affinities.lante || 0) + 10) },
      unlockedCharacters: s.gouxiongState.unlockedCharacters.includes('lante') ? s.gouxiongState.unlockedCharacters : [...s.gouxiongState.unlockedCharacters, 'lante'],
      chats: {
        ...s.gouxiongState.chats,
        lante: s.gouxiongState.chats.lante || [{ from: 'npc', text: '先问你个问题：你主玩什么队？', ts: 'unlock_lante' }]
      }
    } : s.gouxiongState,
    activeEvent: {
      id: 'gx_unlock_lante_event',
      title: '提瓦特大陆的电波',
      description: '艺术礼堂的赛博放映日常正在进行，狗熊的微信列表里又多了一个画风极其清奇的联系人——兰特。\n\n兰特是昔日红蛤战友周洪斌的异性好友。当周洪斌在实验楼的地下室里对着满墙的拓扑学公式研究拉康、思考如何给王照凯的路线做理论背书时，这位留着短发、性格活泼开朗的女孩，满脑子想的却只有《原神》里的日常委托和卡池保底。“熊哥！滴滴滴！”兰特发来了一个极其可爱的表情包，紧接着是一条语音，背景音里甚至还能听到游戏里的抽卡特效声，“我听老周说你把艺术礼堂占啦？那个……你们那边的中央空调开着没？插座多不多呀？B1教学楼现在的气氛太吓人了，大家都在搞什么大清洗，连给手机充电都要被纠察队查手机软件！我能不能去你那儿避避难，顺便把今天的树脂清了？”\n\n狗熊听着这段语音，整个人陷入了短暂的呆滞。外面整个合肥一中都在为了路线、为了做题、为了前途打得头破血流，自由派在画街垒，极权派在磨刀，而这个女孩关心的竟然是去哪里蹭空调打游戏？但这恰恰击中了狗熊的软肋。他一直标榜自己的艺术礼堂是脱离内卷的“地上天国”，兰特的这种毫无政治敏感度、纯粹的“二次元现充”做派，简直就是他理想国里最完美的子民。更何况，能从昔日战友周洪斌身边挖走一个活泼可爱的异性，极大地满足了狗熊那扭曲的虚荣心。\n\n“来吧，”狗熊回复道，语气中带着一种大庇天下寒士的宽容，“这里是二次元的绝对中立区，原神玩家免受纠察队盘查。”',
      buttonText: '提瓦特大陆的微风，吹进了这片压抑的赛博废墟。',
      isStoryEvent: true,
    }
  }), effectsText: ['解锁角色：兰特', '兰特好感度 +10', '触发事件：提瓦特大陆的电波'] },
  { id: 'gx_unlock_wushuo', title: '接触吴蒴', description: '她的每句话都像刀背，逼着狗熊把语气磨平。', days: 8, x: 760, y: 700, requires: ['gx_unlock_lante'], onComplete: (s) => ({
    gouxiongState: s.gouxiongState ? {
      ...s.gouxiongState,
      affinities: { ...s.gouxiongState.affinities, wushuo: Math.min(100, (s.gouxiongState.affinities.wushuo || 0) + 10) },
      unlockedCharacters: s.gouxiongState.unlockedCharacters.includes('wushuo') ? s.gouxiongState.unlockedCharacters : [...s.gouxiongState.unlockedCharacters, 'wushuo'],
      chats: {
        ...s.gouxiongState.chats,
        wushuo: s.gouxiongState.chats.wushuo || [{ from: 'npc', text: '请不要用你的话术污染句子。', ts: 'unlock_wushuo' }]
      }
    } : s.gouxiongState,
    activeEvent: {
      id: 'gx_unlock_wushuo_event',
      title: '文学少女的厌恶与交锋',
      description: '相较于其他几人的主动联系，吴蒴的出现则带着一种极其冷冽的、被迫的无奈。吴蒴是狗熊在起义前所在班级的语文课代表。她是一个典型的文学少女，常年捧着卡夫卡或太宰治的书，气质清冷。她对狗熊这种满嘴烂梗、成绩垫底、还总是喜欢搞出各种下流恶作剧的男生，打心底里感到极度的厌恶和鄙夷。如果不是迫不得已，她这辈子都不想在微信上和狗熊说哪怕一个字。\n\n“我放在艺术礼堂后台储物柜里的两本笔记和一本《百年孤独》，请你还给我。”吴蒴的消息没有任何寒暄，直奔主题，隔着屏幕都能感受到那股拒人于千里之外的寒意，“我不管你们在搞什么荒唐的夺权游戏，那是我的私人物品。如果明天中午之前我看不到我的书，我会直接向校卫队举报你们藏匿违禁品。”狗熊看着这条充满敌意的消息，非但没有生气，反而咧开嘴笑了。在现实中，吴蒴这种高高在上的优等生是他最痛恨的“做题蛆”代表；但在Galgame的逻辑里，这叫什么？这叫经典的“冰山傲娇属性”！\n\n他现在手里有枪（防暴棍），有地盘，他是发号施令的王。他怎么可能轻易把东西还回去？他要享受这种把曾经看不起他的优等生踩在脚下，逼迫她们向自己低头的快感。“书在我手里，很安全。”狗熊慢条斯理地敲击着键盘，脸上挂着一种极其反派的恶劣笑容，“不过我们这里现在实行军事管制，概不外送。想要书？明天中午，自己来礼堂后台拿。记住，一个人来。”\n\n发送完毕，狗熊惬意地靠在椅背上。四个性格迥异的“女主角”已经全部登场，他满心欢喜地以为自己正在推开通往后宫结局的大门，却不知道，自己正一步步迈向被彻底社会性死亡的绞刑架。',
      buttonText: '她的厌恶是真实的，但他却过滤成了傲娇。',
      isStoryEvent: true,
    }
  }), effectsText: ['解锁角色：吴蒴', '吴蒴好感度 +10', '触发事件：文学少女的厌恶与交锋'] },
  { id: 'gx_maodun_street_ops', title: '毛盾的街口测试', description: '在一次突发冲突后，她只给了狗熊一句话：拿结果来说话。', days: 8, x: 500, y: 940, requires: ['gx_unlock_maodun'], isHidden: (s) => !s.completedFocuses.includes('gx_unlock_maodun'), onComplete: (s) => ({
    stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 9), pp: s.stats.pp + 10 },
    gouxiongState: s.gouxiongState ? {
      ...s.gouxiongState,
      sanity: Math.min(s.gouxiongState.maxSanity, s.gouxiongState.sanity + 6),
      affinities: { ...s.gouxiongState.affinities, maodun: Math.min(100, (s.gouxiongState.affinities.maodun || 0) + 14) }
    } : s.gouxiongState,
    activeEvent: {
      id: 'gx_maodun_street_ops_event',
      title: '重装坦克的巡视',
      description: '在达璧的“暗示”下，狗熊向毛盾发出了正式的“外交邀请”。第二天，这位体型魁梧、性格强势的保皇派大姐大，便大摇大摆地走进了艺术礼堂。\n\n毛盾对屏幕上播放的《鬼灭之刃》嗤之以鼻，她用一种视察领地的姿态，挑剔地打量着四周。狗熊为了展现自己的“领袖魅力”和财力，特意让人搬来了几箱从学校超市“征用”来的高级零食。出乎狗熊意料的是，这位平日里对造反派喊打喊杀的保皇派，在半推半就地撕开一包薯片后，态度竟然出奇地软化了。\n\n“哼，算你小子识相。吴主任那边最近正愁没借口收拾你们，你这地方倒是物资挺丰厚。”毛盾一边大口嚼着零食，一边用一种极其市侩的眼神看着狗熊，“不过嘛，达璧说你这人虽然混蛋，但至少说话算话。你这儿要是能一直保证供水供电和零食，我倒也不是不能在校卫队那边替你打打马虎眼。”\n\n狗熊心中狂喜，以为自己用几包零食和“霸道男主”的气场，成功驯服了一只敌对阵营的母老虎。他甚至开始在脑内构思“保皇派恶役千金被我折服”的同人剧本。但他那被油脂和烂梗糊住的脑子哪里想得到，毛盾根本不是来被攻略的。在来之前，达璧已经在宿舍的被窝里，流着眼泪向毛盾和盘托出了高二那年的性骚扰事件。毛盾这次来，一是作为达璧的贴身保镖和物理威慑（以防狗熊兽性大发），二是以“视察零食”为借口，替达璧摸清了礼堂后台几条秘密逃生通道的锁具型号。',
      buttonText: '以为驯服了恶龙，却不知自己已经被巨兽量好了棺材的尺寸。',
      isStoryEvent: true,
    }
  }), effectsText: ['稳定度 +9', '政治点数 +10', '狗熊理智度 +6', '毛盾好感度 +14', '触发事件：重装坦克的巡视'] },
  { id: 'gx_lante_light_channel', title: '兰特的轻频道', description: '看似轻松的对话背后，是狗熊第一次学会慢节奏共处。', days: 8, x: 500, y: 1060, requires: ['gx_unlock_lante'], isHidden: (s) => !s.completedFocuses.includes('gx_unlock_lante'), onComplete: (s) => ({
    gouxiongState: s.gouxiongState ? {
      ...s.gouxiongState,
      sanity: Math.min(s.gouxiongState.maxSanity, s.gouxiongState.sanity + 10),
      affinities: { ...s.gouxiongState.affinities, lante: Math.min(100, (s.gouxiongState.affinities.lante || 0) + 16) },
    } : s.gouxiongState,
    stats: { ...s.stats, ss: Math.min(100, s.stats.ss + 6) },
    activeEvent: {
      id: 'gx_lante_light_channel_event',
      title: '风神瞳与盲区',
      description: '艺术礼堂的VIP休息室成了兰特专属的电竞房。空调冷风呼呼地吹着，伴随着手机里《原神》抽卡出金的音效，兰特发出一声欢呼。狗熊端着两杯奶茶凑了过去，试图用他那套从贴吧学来的、令人脚趾扣地的二次元话术来拉近关系：“哟，小兰特，今天运势不错嘛。怎么样，我这‘地上天国’的网速，比周洪斌那个成天只知道算拓扑学的书呆子地下室强多了吧？”\n\n“谢谢熊哥！”兰特接过奶茶，笑得没心没肺，“老周那个人太无聊啦，天天念叨什么‘大他者’。还是熊哥这里好，纠察队的人也都不管我，昨天半夜两点我去前厅上厕所，看大门的几个兄弟睡得呼噜震天响，真是太自由了！”“那是，我的兄弟们都是讲究劳逸结合的。”狗熊得意地挺起胸膛，心里暗爽自己不仅挖了红蛤的墙角，还成功树立了宽容的领袖形象。\n\n看着狗熊那副沾沾自喜的蠢样，兰特低下头，继续在屏幕上滑动着角色。其实，她根本没有抽卡，她正在用微信的隐秘小号，在一个名为“除虫行动”的群聊里发送消息：“确认完毕，后半夜两点到四点，礼堂正门的守卫完全处于熟睡状态，防御真空期长达两小时。——汇报人：提瓦特情报员。”作为女生群体中人缘极好的现充，兰特早就被达璧那张悲惨的底牌和缜密的复仇计划所打动。她用最无害的“原神玩家”身份，完美地骗过了狗熊这个“云二次元”的雷达，成为了插在狗熊心脏旁边最深的一根眼线。',
      buttonText: '提瓦特的风，不仅能吹散迷雾，也能传递致命的密电。',
      isStoryEvent: true,
    }
  }), effectsText: ['狗熊理智度 +10', '兰特好感度 +16', '学生支持度 +6', '触发事件：风神瞳与盲区'] },
  { id: 'gx_wushuo_manuscript', title: '吴蒴的手稿边注', description: '她把修改意见一条条写在边栏，逼着狗熊正面面对自己的粗糙。', days: 8, x: 500, y: 1180, requires: ['gx_unlock_wushuo'], isHidden: (s) => !s.completedFocuses.includes('gx_unlock_wushuo'), onComplete: (s) => ({
    gouxiongState: s.gouxiongState ? {
      ...s.gouxiongState,
      sanity: Math.min(s.gouxiongState.maxSanity, s.gouxiongState.sanity + 9),
      affinities: { ...s.gouxiongState.affinities, wushuo: Math.min(100, (s.gouxiongState.affinities.wushuo || 0) + 16) },
    } : s.gouxiongState,
    stats: { ...s.stats, pp: s.stats.pp + 15, allianceUnity: Math.min(100, s.stats.allianceUnity + 4) },
    activeEvent: {
      id: 'gx_wushuo_manuscript_event',
      title: '卡夫卡的凝视',
      description: '中午十二点，艺术礼堂后台的侧门。吴蒴准时出现了。她没有穿校服，而是穿着一件素色的长裙，眼神冰冷得仿佛能把周围的空气冻结。狗熊斜靠在门框上，手里拿着吴蒴那本《百年孤独》，故意装出一副痞气十足的模样：“哟，课代表来了。这么想要这本书？其实只要你低个头，叫声‘熊哥’，这书我双手奉上。”\n\n吴蒴没有说话，只是用一种看下水道秽物般的眼神死死盯着他。那种眼神让狗熊感到一丝极其不舒服的刺痛。为了找回场子，他往前逼近了一步，压低声音，用自以为极具压迫感的轻浮语气说道：“怎么？还记恨我高二的时候在班里开你玩笑？别装清高了，吴蒴。现在的合一，分数已经不管用了。你信不信，只要我一句话，你明天连饭都吃不上？”他故意把脸凑得很近，试图在吴蒴脸上看到恐惧或屈服。那是他在Galgame里最喜欢看到的“高岭之花坠落”的桥段。\n\n吴蒴确实退后了半步，但她没有哭，也没有求饶。她只是极其冷漠地伸出手，一把夺过了那本书，然后转身就走。在转身的瞬间，她冷冷地丢下了一句：“格里高尔·萨姆沙变成甲虫的时候，至少还有点可悲。而你，只是一只令人作呕的绿头蝇。”\n\n狗熊愣在原地，虽然没完全听懂这个文学梗，但他固执地将其脑补成了傲娇女角色的“嘴硬”。他不知道的是，在吴蒴那件长裙的口袋里，一支微型录音笔的红灯正在悄然闪烁。刚才那段充满着权力胁迫和轻浮骚扰的话语，已经被完整地记录了下来。在走出艺术礼堂十米后，吴蒴掏出手机，将音频文件发送到了“除虫行动”群里。\n\n“证据已固定。他对权力的滥用和对女性的潜在骚扰意图，已经暴露无遗。”吴蒴在群里冷冷地打字。而在群聊的另一端，达璧看着这些汇聚而来的情报、录音和防御漏洞，嘴角终于勾起了一抹令人胆寒的冷笑。\n\n狗熊的手机又震动了，是达璧发来的消息：“今晚有空吗？我想去礼堂的顶层天台看看星星。就我们两个人。”看着这条消息，狗熊激动得差点跳起来，他以为他的Galgame终于要推到最终的“个人线HCG”了。而这张由全校不同派系、不同性格的女生共同编织的复仇巨网，已经无声无息地收紧了最后的绳索。',
      buttonText: '倒计时开始，处刑台的铡刀已经擦亮了反光。',
      isStoryEvent: true,
    }
  }), effectsText: ['狗熊理智度 +9', '吴蒴好感度 +16', '政治点数 +15', '联盟团结度 +4', '触发事件：卡夫卡的凝视'] },

  { id: 'gx_dual_engine_sync', title: '双线统筹', description: '艺术礼堂和私聊窗口终于被写进同一份日程，狗熊开始学会分配自己的夜晚。', days: 10, x: 500, y: 1320, requires: ['gx_cyber_archive_war', 'gx_wushuo_manuscript', 'gx_dabi_patience', 'gx_maodun_street_ops', 'gx_lante_light_channel'], onComplete: (s) => ({
    stats: { ...s.stats, pp: s.stats.pp + 30 },
    gouxiongState: s.gouxiongState ? { ...s.gouxiongState, sanity: Math.min(s.gouxiongState.maxSanity, s.gouxiongState.sanity + 10) } : s.gouxiongState,
    activeEvent: {
      id: 'gx_dual_engine_sync_event',
      title: '日与夜的绝对主宰',
      description: '艺术礼堂的周边局势已经彻底稳定，吴福军的保皇派在“蜂群快闪”和“断电战术”的折磨下疲于奔命，暂时放弃了对这片区域的强攻。白天的礼堂，是一片充斥着宅舞、番剧和震耳欲聋的Vocaloid电音的狂欢海洋。狗熊坐在由几十张天鹅绒座椅拼凑成的“王座”上，俯视着那些曾经高高在上、如今却在他的解构主义下彻底放飞自我的“做题家”们，一种宛如神明创世般的巨大成就感油然而生。\n\n而当午夜的钟声敲响，狂欢的人群散去，礼堂归于寂静，狗熊的“里世界”才刚刚拉开帷幕。他躺在后台冷气十足的真皮沙发上，手机屏幕的幽光映亮了他那张因为极度兴奋而有些扭曲的脸。他的微信正同时开着四个聊天窗口：达璧的温柔崇拜、毛盾的利益交换、兰特的撒娇卖萌、吴蒴的冰冷交锋。在狗熊那被劣质恋爱游戏腌入味的大脑里，他觉得自己已经完美掌握了“时间管理大师”的精髓。他游刃有余地在四个性格迥异的“女主角”之间切换着话术，享受着好感度（自认为）不断飙升的快感。他以为自己同时拿捏了白天的宏大叙事与夜晚的粉色修罗场，却浑然不知，自己每天晚上自鸣得意敲下的每一句话、透露的每一个布防细节，都已经化作了“除虫行动”群聊里最为致命的呈堂证供。',
      buttonText: '玩家以为自己在通关多线结局，却不知自己才是被通关的那个。',
      isStoryEvent: true,
    }
  }), effectsText: ['狗熊理智度 +10', '政治点数 +30', '触发事件：日与夜的绝对主宰'] },
  { id: 'gx_midnight_negotiation', title: '午夜和谈窗口', description: '分裂的派系第一次同意坐在同一间教室里谈“明天”。', days: 10, x: 500, y: 1460, requires: ['gx_dual_engine_sync'], onComplete: (s) => ({
    stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 8), allianceUnity: Math.min(100, s.stats.allianceUnity + 6) },
    activeEvent: {
      id: 'gx_midnight_negotiation_event',
      title: '午夜的破冰',
      description: '就在狗熊沉浸于他的无敌幻象中时，一个意想不到的访客打破了艺术礼堂后半夜的宁静。没有荷枪实弹的纠察队，也没有气势汹汹的声讨，钢铁红蛤的二把手、自社派领袖豪邦，只身一人、举着双手走进了这片被视为“异端”的二次元领地。\n\n谈判被安排在礼堂二楼一间落满灰尘的杂物间里，只有一盏应急灯散发着惨白的光。狗熊原本准备了一肚子的烂梗和嘲讽，打算狠狠羞辱一下这位昔日的同志。但豪邦坐下后的第一句话，就把狗熊给干沉默了：“波汉想带人平了你这里，但我把照凯拦住了。狗熊，我们是一起在封安宝眼皮底下印第一张传单的兄弟，合一不能再流自己人的血了。”\n\n豪邦没有指责狗熊的背叛，反而用一种极其复杂的眼神看着外面的大银幕：“我不认同你那些粗鄙的烂梗，但得承认，你那套瞎搞的赛博解构，确实把那些做题家心里最后一道‘衡水枷锁’给震碎了。这是照凯用纪律做不到的事。”豪邦推过去一份手写的协议，“停止对B3教学楼和行政楼的无差别电子攻击，和我们重新结盟对付吴福军。艺术礼堂可以作为‘合一特别文化自治区’永久保留。狗熊，闹剧该结束了，我们得一起坐下来，谈谈合一的明天。”\n\n看着那份协议，狗熊心中那根名为“理智度”的弦剧烈地颤动了。他看着豪邦那双布满血丝却依然真诚的眼睛，突然感觉到一阵久违的、属于“人”的温暖。也许，他真的不用一直做一个被人唾弃的小丑？',
      buttonText: '理性与温情的橄榄枝艰难地生根发芽。',
      isStoryEvent: true,
    }
  }), effectsText: ['稳定度 +8', '联盟团结度 +6', '触发事件：午夜的破冰'] },
  { id: 'gx_campus_rewrite', title: '重写校园叙事', description: '广播站、走廊与课桌上的话语权被重新分配，新的故事开始压过旧标签。', days: 12, x: 500, y: 1600, requires: ['gx_midnight_negotiation'], onComplete: (s) => ({
    stats: { ...s.stats, pp: s.stats.pp + 40, ss: Math.min(100, s.stats.ss + 5) },
    gouxiongState: s.gouxiongState ? { ...s.gouxiongState, sanity: Math.min(s.gouxiongState.maxSanity, s.gouxiongState.sanity + 8) } : s.gouxiongState,
    activeEvent: {
      id: 'gx_campus_rewrite_event',
      title: '新叙事落地',
      description: '豪邦与狗熊的建设性谈判，奇迹般地在合一校园内催生出了一段极其短暂却又无比绚烂的“蜜月期”。随着《文化自治协议》的秘密生效，原本互相倾轧的两个派系停止了内耗，一种极其奇异的校园新叙事开始在这座百年名校里蔓延。\n\n最直观的变化发生在广播站。每天清晨，原本单调肃杀的《国际歌》或马列理论播报被取消了，取而代之的是，广播站会先播放一首极其热血的《进击的巨人》主题曲《红莲的弓矢》，随后才是豪邦那温和有力的公社建设通报。走廊上的涂鸦也发生了改变，那些充满攻击性的政治标语旁边，被狗熊的信徒们画上了可爱的动漫Q版头像；而那些原本只知道死读书的“做题蛆”，现在不仅会在互助组里讨论微积分，还会在课间兴致勃勃地交流昨晚在艺术礼堂看的新番剧情。\n\n新的故事压过了旧的仇恨。做题与娱乐、纪律与自由，这两种原本水火不容的元素，在妥协中达成了某种诡异的平衡。狗熊走在连接礼堂与B3的走廊上，看着那些对他微笑打招呼的学生，他第一次感受到了一种不依赖于恐吓、不依赖于恶作剧，而是基于真正认同的尊重。他心中那个关于“无政府狂欢”的执念开始动摇，也许，重新回到红蛤，做个正经的“文化部长”，也是个不错的Game Clear（游戏通关）结局？',
      buttonText: '当红星与二次元弹幕在同一片天空交汇，旧时代的冰川彻底消融。',
      isStoryEvent: true,
    }
  }), effectsText: ['政治点数 +40', '学生支持度 +5', '狗熊理智度 +8', '触发事件：新叙事落地'] },

  { id: 'gx_dabi_route_trial', title: '达璧的决意', description: '所有试探在这一夜回到起点，对达璧的态度决定狗熊下一阶段该走哪条路。', days: 12, x: 500, y: 1740, requires: ['gx_campus_rewrite'], isHidden: (s) => !s.completedFocuses.includes('gx_campus_rewrite'), onComplete: (s) => {
    const sanity = s.gouxiongState?.sanity || 0;
    const dabiAffinity = s.gouxiongState?.affinities?.dabi || 0;
    const aff = s.gouxiongState?.affinities;
    const totalAffinity = (aff?.dabi || 0) + (aff?.maodun || 0) + (aff?.lante || 0) + (aff?.wushuo || 0);
    // v8.7 第三条路线：谁都没能靠近狗熊（总好感<30）→ 除虫计划流产 → 天国永存线
    let outcome: 'ruin' | 'embarrass' | 'redeem';
    if (totalAffinity < 30) outcome = 'ruin';
    else if (dabiAffinity > sanity || sanity <= 32) outcome = 'embarrass';
    else outcome = 'redeem';
    return {
      flags: {
        ...s.flags,
        gx_dabi_route_outcome: outcome,
      },
      activeEvent: outcome === 'embarrass' ? STORY_EVENTS.gx_dabi_route_trial_embarrass_event : outcome === 'redeem' ? STORY_EVENTS.gx_dabi_route_trial_redeem_event : STORY_EVENTS.gx_dabi_route_trial_ruin_event,
    };
  }, effectsText: ['隐藏判定节点', '若四角色总好感过低（<30），进入天国永存线', '若“达璧好感度 > 狗熊理智度”或“理智过低（<=32）”，进入丢人现眼线', '否则进入浪子回头线', '各解锁 3 个后续隐藏国策', '触发事件：路线判定报告'] },

  { id: 'gx_embarrass_1', title: '午夜的处刑广播', description: '随着达璧的巴掌落下，全校的广播系统被强行劫持，狗熊那掩藏一年的性骚扰丑闻，将毫无保留地暴露在合肥一中的夜空中。', days: 8, x: 360, y: 1880, requires: ['gx_dabi_route_trial'], isHidden: (s) => s.flags.gx_dabi_route_outcome !== 'embarrass', onComplete: (s) => ({
    stats: { ...s.stats, stab: Math.max(0, s.stats.stab - 8), ss: Math.max(0, s.stats.ss - 6) },
    gouxiongState: s.gouxiongState ? { ...s.gouxiongState, sanity: Math.max(0, s.gouxiongState.sanity - 10) } : s.gouxiongState,
    activeEvent: STORY_EVENTS.gx_embarrass_1_event,
  }), effectsText: ['稳定度 -8', '学生支持度 -6', '狗熊理智度 -10', '触发事件：翻车截图扩散'] },
  { id: 'gx_embarrass_2', title: '孤家寡人的天国', description: '失去了一切政治背书的狗熊逃回艺术礼堂，妄图依靠他的二次元信徒进行最后的抵抗。', days: 9, x: 360, y: 2020, requires: ['gx_embarrass_1'], isHidden: (s) => s.flags.gx_dabi_route_outcome !== 'embarrass', onComplete: (s) => ({
    stats: { ...s.stats, pp: Math.max(0, s.stats.pp - 25), allianceUnity: Math.max(0, s.stats.allianceUnity - 8) },
    gouxiongState: s.gouxiongState ? { ...s.gouxiongState, sanity: Math.max(0, s.gouxiongState.sanity - 8) } : s.gouxiongState,
    activeEvent: STORY_EVENTS.gx_embarrass_2_event,
  }), effectsText: ['政治点数 -25', '联盟团结度 -8', '狗熊理智度 -8', '触发事件：礼堂噪声夜'] },
  { id: 'gx_embarrass_3', title: '除虫行动的收网', description: '众叛亲离的狗熊无路可逃。', days: 10, x: 360, y: 2160, requires: ['gx_embarrass_2'], isHidden: (s) => s.flags.gx_dabi_route_outcome !== 'embarrass', onComplete: (s) => ({
    stats: { ...s.stats, stab: Math.max(0, s.stats.stab - 12), radicalAnger: Math.min(100, s.stats.radicalAnger + 10) },
    activeEvent: STORY_EVENTS.gx_embarrass_3_event,
  }), effectsText: ['稳定度 -12', '激进愤怒度 +10', '触发事件：失控线定型'] },
  { id: 'gx_embarrass_settlement', title: '校方闪电接管', description: '在持续失控后，校方快速接管全部地区，无政府阶段宣告终止。', days: 7, x: 360, y: 2300, requires: ['gx_embarrass_3'], isHidden: (s) => s.flags.gx_dabi_route_outcome !== 'embarrass', onComplete: (s) => ({
    flags: {
      ...s.flags,
      gx_anarchy_phase: false,
      // 15地块全部归校方
      gx_map_owner_tile_aud_screen: 'school', gx_map_owner_tile_aud_back: 'school', gx_map_owner_tile_aud_hall: 'school',
      gx_map_owner_tile_dorm_1_4: 'school', gx_map_owner_tile_dorm_5_7: 'school',
      gx_map_owner_tile_b3_a1a3: 'school', gx_map_owner_tile_b3_b1b2: 'school', gx_map_owner_tile_b3_tower: 'school',
      gx_map_owner_tile_court_area: 'school', gx_map_owner_tile_canteen: 'school', gx_map_owner_tile_track_field: 'school',
      gx_map_owner_tile_admin_main: 'school', gx_map_owner_tile_admin_gym: 'school',
      gx_map_owner_tile_intl_dept: 'school', gx_map_owner_tile_lib_area: 'school',
      // 控制度重置为低位
      tile_ctrl_aud_screen: 8, tile_ctrl_aud_back: 8, tile_ctrl_aud_hall: 8,
      tile_ctrl_dorm_1_4: 8, tile_ctrl_dorm_5_7: 8,
      tile_ctrl_b3_a1a3: 6, tile_ctrl_b3_b1b2: 6, tile_ctrl_b3_tower: 6,
      tile_ctrl_court_area: 6, tile_ctrl_canteen: 6, tile_ctrl_track_field: 6,
      tile_ctrl_admin_main: 4, tile_ctrl_admin_gym: 4,
      tile_ctrl_intl_dept: 5, tile_ctrl_lib_area: 5,
    },
    mapLocations: {
      ...s.mapLocations,
      auditorium: { ...s.mapLocations.auditorium, studentControl: 8 },
      b1b2: { ...s.mapLocations.b1b2, studentControl: 8 },
      b3: { ...s.mapLocations.b3, studentControl: 6 },
      playground: { ...s.mapLocations.playground, studentControl: 6 },
      admin: { ...s.mapLocations.admin, studentControl: 4 },
      lab: { ...s.mapLocations.lab, studentControl: 5 },
    },
  }), effectsText: ['校方快速接管全部地区', '结束：无政府阶段', '2天后触发结局事件 I，3天后触发结局事件 II 并进入结局'] },

  { id: 'gx_redeem_1', title: '午夜的负荆请罪', description: '抛弃了所有的伪装、烂梗与不可一世的傲慢，狗熊孤身一人冲过了校卫队的封锁线，一头撞进了B3教学楼的联合革委会总部。', days: 8, x: 640, y: 1880, requires: ['gx_dabi_route_trial'], isHidden: (s) => s.flags.gx_dabi_route_outcome !== 'redeem', onComplete: (s) => ({
    stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 7), allianceUnity: Math.min(100, s.stats.allianceUnity + 6) },
    gouxiongState: s.gouxiongState ? { ...s.gouxiongState, sanity: Math.min(s.gouxiongState.maxSanity, s.gouxiongState.sanity + 8) } : s.gouxiongState,
    activeEvent: STORY_EVENTS.gx_redeem_1_event,
  }), effectsText: ['稳定度 +7', '联盟团结度 +6', '狗熊理智度 +8', '触发事件：停火备忘录生效'] },
  { id: 'gx_redeem_2', title: '天国与公社的合流', description: '狗熊主动交出了指挥权，并配合联合革委会进行了一场史无前例的“自我解构”。', days: 9, x: 640, y: 2020, requires: ['gx_redeem_1'], isHidden: (s) => s.flags.gx_dabi_route_outcome !== 'redeem', onComplete: (s) => ({
    stats: { ...s.stats, pp: s.stats.pp + 22, ss: Math.min(100, s.stats.ss + 5) },
    gouxiongState: s.gouxiongState ? { ...s.gouxiongState, sanity: Math.min(s.gouxiongState.maxSanity, s.gouxiongState.sanity + 6) } : s.gouxiongState,
    activeEvent: STORY_EVENTS.gx_redeem_2_event,
  }), effectsText: ['政治点数 +22', '学生支持度 +5', '狗熊理智度 +6', '触发事件：复盘会通过'] },
  { id: 'gx_redeem_3', title: '先锋队的断后卒', description: '移交权力的当晚，校方保皇派发起了极其凶猛的反扑。', days: 10, x: 640, y: 2160, requires: ['gx_redeem_2'], isHidden: (s) => s.flags.gx_dabi_route_outcome !== 'redeem', onComplete: (s) => ({
    stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 10), pp: s.stats.pp + 18 },
    activeEvent: STORY_EVENTS.gx_redeem_3_event,
  }), effectsText: ['稳定度 +10', '政治点数 +18', '触发事件：回头线定型'] },
  { id: 'gx_redeem_settlement', title: '并入钢铁红蛤', description: '狗熊与钢铁红蛤完成组织并轨，无政府阶段正式结束。', days: 7, x: 640, y: 2300, requires: ['gx_redeem_3'], isHidden: (s) => s.flags.gx_dabi_route_outcome !== 'redeem', onComplete: (s) => ({
    flags: {
      ...s.flags,
      gx_anarchy_phase: false,
      gx_merged_with_redtoad: true,
      // 15地块全部归狗熊
      gx_map_owner_tile_aud_screen: 'gouxiong', gx_map_owner_tile_aud_back: 'gouxiong', gx_map_owner_tile_aud_hall: 'gouxiong',
      gx_map_owner_tile_dorm_1_4: 'gouxiong', gx_map_owner_tile_dorm_5_7: 'gouxiong',
      gx_map_owner_tile_b3_a1a3: 'gouxiong', gx_map_owner_tile_b3_b1b2: 'gouxiong', gx_map_owner_tile_b3_tower: 'gouxiong',
      gx_map_owner_tile_court_area: 'gouxiong', gx_map_owner_tile_canteen: 'gouxiong', gx_map_owner_tile_track_field: 'gouxiong',
      gx_map_owner_tile_admin_main: 'gouxiong', gx_map_owner_tile_admin_gym: 'gouxiong',
      gx_map_owner_tile_intl_dept: 'gouxiong', gx_map_owner_tile_lib_area: 'gouxiong',
      // 控制度设高位
      tile_ctrl_aud_screen: 82, tile_ctrl_aud_back: 82, tile_ctrl_aud_hall: 82,
      tile_ctrl_dorm_1_4: 84, tile_ctrl_dorm_5_7: 84,
      tile_ctrl_b3_a1a3: 78, tile_ctrl_b3_b1b2: 78, tile_ctrl_b3_tower: 78,
      tile_ctrl_court_area: 75, tile_ctrl_canteen: 75, tile_ctrl_track_field: 75,
      tile_ctrl_admin_main: 68, tile_ctrl_admin_gym: 68,
      tile_ctrl_intl_dept: 70, tile_ctrl_lib_area: 70,
    },
    mapLocations: {
      ...s.mapLocations,
      auditorium: { ...s.mapLocations.auditorium, studentControl: 82 },
      b1b2: { ...s.mapLocations.b1b2, studentControl: 84 },
      b3: { ...s.mapLocations.b3, studentControl: 78 },
      playground: { ...s.mapLocations.playground, studentControl: 75 },
      admin: { ...s.mapLocations.admin, studentControl: 68 },
      lab: { ...s.mapLocations.lab, studentControl: 70 },
    },
  }), effectsText: ['狗熊与钢铁红蛤完成合并', '结束：无政府阶段', '2天后触发结局事件 I，3天后触发结局事件 II 并进入结局'] },

  { id: 'gx_ruin_1', title: '搁浅的复仇', description: '女生们的试探与接近被逐一晾在门外，精心筹备的复仇之网失去了所有支点。', days: 8, x: 860, y: 1880, requires: ['gx_dabi_route_trial'], isHidden: (s) => s.flags.gx_dabi_route_outcome !== 'ruin', onComplete: (s) => ({
    stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 6), pp: s.stats.pp + 10 },
    gouxiongState: s.gouxiongState ? { ...s.gouxiongState, sanity: Math.max(0, s.gouxiongState.sanity - 8) } : s.gouxiongState,
    activeEvent: STORY_EVENTS.gx_ruin_1_event,
  }), effectsText: ['稳定度 +6', '政治点数 +10', '狗熊理智度 -8', '触发事件：复仇的搁浅'] },
  { id: 'gx_ruin_2', title: '永不停播的天国', description: '放映机二十四小时不停机，番剧成了唯一的作息表，现实在片头曲里慢慢融化。', days: 9, x: 860, y: 2020, requires: ['gx_ruin_1'], isHidden: (s) => s.flags.gx_dabi_route_outcome !== 'ruin', onComplete: (s) => ({
    stats: { ...s.stats, ss: Math.min(100, s.stats.ss + 8), stab: Math.min(100, s.stats.stab + 6) },
    gouxiongState: s.gouxiongState ? { ...s.gouxiongState, sanity: Math.max(0, s.gouxiongState.sanity - 6) } : s.gouxiongState,
    activeEvent: STORY_EVENTS.gx_ruin_2_event,
  }), effectsText: ['学生支持度 +8', '稳定度 +6', '狗熊理智度 -6', '触发事件：永不停播的天国'] },
  { id: 'gx_ruin_3', title: '废墟的奠基', description: '学习区全面空转，操场沦为永久漫展，合一开始了物理意义上的废墟化。', days: 10, x: 860, y: 2160, requires: ['gx_ruin_2'], isHidden: (s) => s.flags.gx_dabi_route_outcome !== 'ruin', onComplete: (s) => ({
    stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 8), tpr: Math.max(0, s.stats.tpr - 50), radicalAnger: Math.max(0, s.stats.radicalAnger - 10) },
    gouxiongState: s.gouxiongState ? { ...s.gouxiongState, sanity: Math.max(0, s.gouxiongState.sanity - 5) } : s.gouxiongState,
    activeEvent: STORY_EVENTS.gx_ruin_3_event,
  }), effectsText: ['稳定度 +8', '试卷储备量 -50', '激进愤怒度 -10', '狗熊理智度 -5', '触发事件：废墟的奠基'] },
  { id: 'gx_ruin_settlement', title: '天国之门永久关闭', description: '所有出口被封死，狗熊的统治进入永恒的循环，无政府阶段正式结束。', days: 7, x: 860, y: 2300, requires: ['gx_ruin_3'], isHidden: (s) => s.flags.gx_dabi_route_outcome !== 'ruin', onComplete: (s) => ({
    flags: {
      ...s.flags,
      gx_anarchy_phase: false,
      gx_ruin_permanent: true,
      // 15地块全部归狗熊
      gx_map_owner_tile_aud_screen: 'gouxiong', gx_map_owner_tile_aud_back: 'gouxiong', gx_map_owner_tile_aud_hall: 'gouxiong',
      gx_map_owner_tile_dorm_1_4: 'gouxiong', gx_map_owner_tile_dorm_5_7: 'gouxiong',
      gx_map_owner_tile_b3_a1a3: 'gouxiong', gx_map_owner_tile_b3_b1b2: 'gouxiong', gx_map_owner_tile_b3_tower: 'gouxiong',
      gx_map_owner_tile_court_area: 'gouxiong', gx_map_owner_tile_canteen: 'gouxiong', gx_map_owner_tile_track_field: 'gouxiong',
      gx_map_owner_tile_admin_main: 'gouxiong', gx_map_owner_tile_admin_gym: 'gouxiong',
      gx_map_owner_tile_intl_dept: 'gouxiong', gx_map_owner_tile_lib_area: 'gouxiong',
      // 控制度设高位
      tile_ctrl_aud_screen: 88, tile_ctrl_aud_back: 88, tile_ctrl_aud_hall: 88,
      tile_ctrl_dorm_1_4: 84, tile_ctrl_dorm_5_7: 84,
      tile_ctrl_b3_a1a3: 80, tile_ctrl_b3_b1b2: 80, tile_ctrl_b3_tower: 80,
      tile_ctrl_court_area: 78, tile_ctrl_canteen: 78, tile_ctrl_track_field: 78,
      tile_ctrl_admin_main: 72, tile_ctrl_admin_gym: 72,
      tile_ctrl_intl_dept: 74, tile_ctrl_lib_area: 74,
    },
    nationalSpirits: s.nationalSpirits.filter(ns => ns.id !== 'eternal_ruin_spirit').concat({
      id: 'eternal_ruin_spirit',
      name: '永恒的赛博废墟',
      description: "所有出口被封死之后，狗熊的统治进入永恒循环，无政府阶段宣告结束。他不再需要回应任何诉求，因为无人能够离开。银幕永不熄灭，弹幕成为唯一的交流方式，循环播放的片头曲取代了对时间的感知。现实的废墟上，只剩下荧光的秩序。",
      type: 'negative',
      effects: { ppDaily: 2, stabDaily: -1, studentSanityDaily: -3 }
    }),
    mapLocations: {
      ...s.mapLocations,
      auditorium: { ...s.mapLocations.auditorium, studentControl: 88 },
      b1b2: { ...s.mapLocations.b1b2, studentControl: 84 },
      b3: { ...s.mapLocations.b3, studentControl: 80 },
      playground: { ...s.mapLocations.playground, studentControl: 78 },
      admin: { ...s.mapLocations.admin, studentControl: 72 },
      lab: { ...s.mapLocations.lab, studentControl: 74 },
    },
  }), effectsText: ['狗熊的统治进入永恒的循环', '获得国家精神：永恒的赛博废墟', '结束：无政府阶段', '2天后触发结局事件 I，3天后触发结局事件 II 并进入结局'] },
];

export const TREE_B_NODES: FocusNode[] = [
  { id: 'yang_yule_start', title: '名师的焦虑', description: '面对三座大山，必须逐一击破。', days: 7, x: 500, y: 50, onComplete: (s) => ({
    ideologies: { authoritarian: 20, reactionary: 50, liberal: 5, radical_socialism: 5, anarcho_capitalism: 5, deconstructivism: 5, test_taking: 10 },
    activeEvent: STORY_EVENTS.yang_yule_three_mountains
  }), effectsText: ['意识形态变为：反动派', '解锁三大分支', '触发事件：名师的焦虑'] },
  
  // Branch 1: Title
  { id: 'title_pursuit', title: '职称的诱惑', description: '正高级职称是毕生追求。', days: 14, x: 200, y: 200, requires: ['yang_yule_start'], onComplete: (s) => ({ 
    yangYuleState: s.yangYuleState ? { ...s.yangYuleState, unlockedMechanics: { ...s.yangYuleState.unlockedMechanics, desk: true } } : undefined,
    activeEvent: STORY_EVENTS.yang_yule_desk_unlocked
  }), effectsText: ['开始准备评审材料', '解锁：杨特的办公桌', '解锁办公桌互动：批阅文件'] },
  { id: 'write_papers', title: '炮制教改论文', description: '言之无物，但必须有。', days: 14, x: 200, y: 300, requires: ['title_pursuit'], onComplete: (s) => ({ 
    stats: { ...s.stats, pp: s.stats.pp + 50 },
    yangYuleState: s.yangYuleState ? { ...s.yangYuleState, teacherSupport: s.yangYuleState.teacherSupport + 20, fengFavor: s.yangYuleState.fengFavor + 10 } : undefined,
    activeEvent: STORY_EVENTS['yang_yule_write_papers']
  }), effectsText: ['政治点数 (PP) +50', '教师支持度 +20', '封安宝好感度 +10'] },
  { id: 'hire_colleagues', title: '提拔亲信', description: '将听话的老师安排进内阁。', days: 14, x: 200, y: 400, requires: ['write_papers'], onComplete: (s) => ({ flags: { ...s.flags, 'yang_yule_cheap_advisors': true }, activeEvent: STORY_EVENTS.yang_yule_hire_colleagues }), effectsText: ['解锁：半价雇佣教师顾问', '触发事件：裙带关系'] },
  { id: 'welcome_inspection', title: '迎接教育局视察', description: '表面上的绝对平静。', days: 21, x: 200, y: 500, requires: ['hire_colleagues'], onComplete: (s) => ({ 
    stats: { ...s.stats, stab: s.stats.stab + 25, pp: s.stats.pp + 30 },
    yangYuleState: s.yangYuleState ? { ...s.yangYuleState, teacherSupport: s.yangYuleState.teacherSupport + 15 } : undefined,
    activeEvent: STORY_EVENTS['yang_yule_welcome_inspection']
  }), effectsText: ['稳定度 +25', '政治点数 +30', '教师支持度 +15'] },
  { id: 'bribe_inspectors', title: '打点评审团', description: '用学校的经费为自己的职称铺路。', days: 21, x: 200, y: 600, requires: ['welcome_inspection'], onComplete: (s) => ({ yangYuleState: s.yangYuleState ? { ...s.yangYuleState, fengFavor: s.yangYuleState.fengFavor + 20 } : undefined, stats: { ...s.stats, pp: s.stats.pp - 30 }, activeEvent: STORY_EVENTS.yang_yule_bribe_inspectors }), effectsText: ['封安宝好感度 +20', '政治点数 -30', '触发事件：打点评审团', '解锁办公桌互动：秘密账本'] },

  // Branch 2: Suppress
  { id: 'suppress_ghosts', title: '看不见的幽灵', description: '掐死地下火种。', days: 14, x: 500, y: 200, requires: ['yang_yule_start'], onComplete: (s) => {
    const flags = { ...s.flags };
    // 行政楼区域管控强化
    ['admin_main','admin_gym'].forEach(tid=>{flags[`tile_ctrl_${tid}`]=Math.min(100,(flags[`tile_ctrl_${tid}`]as number??5)+15);});
    return {
      yangYuleState: s.yangYuleState ? { ...s.yangYuleState, unlockedMechanics: { ...s.yangYuleState.unlockedMechanics, map: true } } : undefined,
      flags,
      activeEvent: STORY_EVENTS.yang_yule_map_unlocked
    };
  }, effectsText: ['开始镇压地下抵抗', '解锁：校园地图斗争机制', '行政楼地块控制度 +15'] },
  { id: 'expand_security', title: '扩编保安队', description: '增加校园巡逻的频次。', days: 14, x: 500, y: 300, requires: ['suppress_ghosts'], onComplete: (s) => {
    const flags = { ...s.flags };
    ALL_SUB_TILES.forEach(t=>{flags[`tile_def_${t.id}`]=Math.min(14,(flags[`tile_def_${t.id}`]as number??0)+7);});
    return {
      stats: { ...s.stats, stab: s.stats.stab + 15, pp: s.stats.pp - 5 },
      flags,
      activeEvent: STORY_EVENTS['yang_yule_expand_security']
    };
  }, effectsText: ['稳定度 +15', '政治点数 -5', '全地块防御天数 +7'] },
  { id: 'catch_red_toad', title: '追查”钢铁红蛤”', description: '漫长的猫鼠游戏。', days: 14, x: 500, y: 400, requires: ['expand_security'], onComplete: (s) => {
    const flags = { ...s.flags };
    // B3教学楼重点清剿，控制度下降
    ['b3_a1a3','b3_b1b2','b3_tower'].forEach(tid=>{flags[`tile_ctrl_${tid}`]=Math.max(5,(flags[`tile_ctrl_${tid}`]as number??50)-20);});
    return {
      stats: { ...s.stats, radicalAnger: Math.max(0, s.stats.radicalAnger - 30), stab: s.stats.stab + 10 },
      flags,
      activeEvent: STORY_EVENTS['yang_yule_catch_red_toad']
    };
  }, effectsText: ['激进愤怒度 -30', '稳定度 +10', 'B3教学楼地块控制度 -20'] },
  { id: 'red_terror', title: '白色恐怖', description: '宁可错杀一千，不可放过一个。', days: 21, x: 500, y: 500, requires: ['catch_red_toad'], onComplete: (s) => {
    const flags = { ...s.flags };
    // 全图威压：所有地块控制度归为校方支配
    ALL_SUB_TILES.forEach(t=>{flags[`tile_ctrl_${t.id}`]=Math.max(10,(flags[`tile_ctrl_${t.id}`]as number??50)-12);});
    return {
      stats: { ...s.stats, radicalAnger: Math.max(0, s.stats.radicalAnger - 40), ss: Math.max(0, s.stats.ss - 20), stab: s.stats.stab + 15 },
      flags,
      activeEvent: STORY_EVENTS['yang_yule_red_terror']
    };
  }, effectsText: ['激进愤怒度 -40', '学生支持度 -20', '稳定度 +15', '全地块控制度 -12'] },
  { id: 'silence_rebellion', title: '悄无声息的抹杀', description: '不激起大规模反抗的镇压。', days: 21, x: 500, y: 600, requires: ['red_terror'], onComplete: (s) => {
    const flags = { ...s.flags };
    ALL_SUB_TILES.forEach(t=>{flags[`tile_ctrl_${t.id}`]=Math.min(100,(flags[`tile_ctrl_${t.id}`]as number??30)+10);});
    return {
      stats: { ...s.stats, ss: Math.max(0, s.stats.ss - 25), radicalAnger: Math.max(0, s.stats.radicalAnger - 20), stab: s.stats.stab + 20 },
      flags,
      activeEvent: STORY_EVENTS['yang_yule_silence_rebellion']
    };
  }, effectsText: ['学生支持度 -25', '激进愤怒度 -20', '稳定度 +20', '全地块控制度 +10', '解锁：红色座机'] },

  // Branch 3: English
  { id: 'fix_english', title: '千疮百孔的英语课堂', description: '不能让教育局发现破绽。', days: 14, x: 800, y: 200, requires: ['yang_yule_start'], onComplete: (s) => ({ 
    yangYuleState: s.yangYuleState ? { ...s.yangYuleState, unlockedMechanics: { ...s.yangYuleState.unlockedMechanics, health: true } } : undefined,
    activeEvent: STORY_EVENTS.yang_yule_health_unlocked
  }), effectsText: ['开始掩盖教学失误', '解锁：迷烟幻境机制', '解锁办公桌互动：保温杯、降压药'] },
  { id: 'buy_health_supplements', title: '大补中药', description: '托人买来的偏方，据说能延年益寿。', days: 14, x: 800, y: 300, requires: ['fix_english'], onComplete: (s) => ({ 
    yangYuleState: s.yangYuleState ? { ...s.yangYuleState, health: Math.min(100, s.yangYuleState.health + 40) } : undefined,
    activeEvent: STORY_EVENTS['yang_yule_buy_health_supplements']
  }), effectsText: ['杨玉乐健康度 +40'] },
  { id: 'memorize_grammar', title: '死记硬背语法点', description: '被动是ED，现在分词是ING！', days: 14, x: 800, y: 400, requires: ['buy_health_supplements'], onComplete: (s) => ({ 
    stats: { ...s.stats, studentSanity: Math.max(0, s.stats.studentSanity - 15) },
    yangYuleState: s.yangYuleState ? { ...s.yangYuleState, teacherSupport: s.yangYuleState.teacherSupport + 10 } : undefined,
    activeEvent: STORY_EVENTS['yang_yule_memorize_grammar']
  }), effectsText: ['学生理智度 -15', '教师支持度 +10'] },
  { id: 'force_recitation', title: '强制早读', description: '用大声朗读掩盖发音的不标准。', days: 21, x: 800, y: 500, requires: ['memorize_grammar'], onComplete: (s) => ({ 
    stats: { ...s.stats, studentSanity: Math.max(0, s.stats.studentSanity - 20), stab: s.stats.stab + 10 }, 
    yangYuleState: s.yangYuleState ? { ...s.yangYuleState, teacherSupport: s.yangYuleState.teacherSupport + 20 } : undefined,
    activeEvent: STORY_EVENTS['yang_yule_force_recitation']
  }), effectsText: ['学生理智度 -20', '教师支持度 +20', '稳定度 +10'] },
  { id: 'fake_teaching_skills', title: '伪装名师风采', description: '用威严掩盖无知。', days: 21, x: 800, y: 600, requires: ['force_recitation'], onComplete: (s) => ({ 
    stats: { ...s.stats, stab: s.stats.stab + 20 },
    yangYuleState: s.yangYuleState ? { ...s.yangYuleState, fengFavor: s.yangYuleState.fengFavor + 15 } : undefined,
    activeEvent: STORY_EVENTS['yang_yule_fake_teaching_skills']
  }), effectsText: ['稳定度 +20', '封安宝好感度 +15', '解锁办公桌互动：全校广播'] },

  // Merge
  { id: 'ultimate_master_teacher', title: '合一的最终维稳人', description: '三座大山已被翻越，正高级职称近在眼前。完成此国策将正式为你的教师生涯加冕——或暴露一切伪装。', days: 21, x: 500, y: 800, requires: ['bribe_inspectors', 'silence_rebellion', 'fake_teaching_skills'],
    canStart: (s) => (s.flags['yang_yule_decisions_clicked'] || 0) >= 10,
    onComplete: (s) => {
    const titleReady = !!s.flags['yy_title_ready'];
    if (s.yangYuleState && s.yangYuleState.fengFavor + s.yangYuleState.teacherSupport > 150 && s.yangYuleState.health > 0) {
      if (titleReady) {
        return {
          gameEnding: 'game_over_yang_yule_success',
          activeSuperEvent: { id: 'yang_yule_success', title: '特级教师的加冕', quote: '"ED和ING的区别，你们一辈子都搞不懂。"', author: '杨玉乐', color: '#d4a574' }
        };
      }
      return {
        activeEvent: STORY_EVENTS.yang_yule_success_event
      };
    }
    return {
      activeEvent: STORY_EVENTS.yang_yule_fail_event
    };
  }, effectsText: ['需要至少处理 10 次特殊事务', '若已完成正高级公示期：触发胜利结局', '若未完成正高级：触发普通成功结局', '若条件不足：触发失败结局'] },
];

export const TREE_A_PAN_NODES: FocusNode[] = [
  { id: 'pan_takeover', title: '潘仁越接管委员会', description: '温和派掌握了主导权。', days: 7, x: 500, y: 50, onComplete: (s) => ({
    leader: { 
      name: '潘仁越', 
      title: '学生议会议长', 
      portrait: 'pan_renyue', 
      ideology: 'liberal',
      description: "潘仁越是学生议会议长，也是温和派在委员会中的代表人物。他的政治立场始终围绕渐进改革展开：与其以激进手段推翻现有秩序，他更愿意在既有框架内为学生争取更多自由与自治。这种主张使他获得了一批不愿冒险、但对现状同样不满的学生的支持，也让他在委员会内逐渐积累起主导权。\n\n然而，温和派的局限同样明显。渐进路线依赖现有框架的容忍，一旦框架本身拒绝让步，改革便可能陷入僵局。潘仁越目前掌握的是主导权而非绝对权威，他的每一步推进都需要平衡内部不同意见，这既是他得以立足的原因，也是他难以迅速兑现承诺的根源。",
      buffs: ['每日联盟团结度 +0.5', '每日稳定度 +0.1']
    },
    ideologies: { authoritarian: 10, reactionary: 5, liberal: 50, radical_socialism: 15, anarcho_capitalism: 5, deconstructivism: 5, test_taking: 10 },
    stats: { ...s.stats, allianceUnity: s.stats.allianceUnity + 10 },
    activeEvent: FLAVOR_EVENTS.pan_takeover_event
  }), effectsText: ['更换领导人为：潘仁越', '意识形态变为：自由派', '联盟团结度 +10', '触发事件：温和派的全面接管'] },
  { id: 'expand_assembly', title: '扩大学生代表大会', description: '将原有的学生代表大会升级为“合一学生议会”，引入更多派系。', days: 14, x: 300, y: 200, requires: ['pan_takeover'], onComplete: (s) => {
    return {
      studentAssemblyFactions: {
        orthodox: 15,
        bear: 7,
        pan: 30,
        otherDem: 15,
        testTaker: 15,
        conservativeDem: 10,
        jidiTutoring: 8
      },
      ideologies: {
        radical_socialism: 15,
        deconstructivism: 7,
        liberal: 45,
        test_taking: 15,
        authoritarian: 10,
        anarcho_capitalism: 8,
        reactionary: 0
      },
      parliamentState: {
        isUpgraded: true,
        powerBalanceUnlocked: s.parliamentState?.powerBalanceUnlocked ?? false,
        powerBalance: s.parliamentState?.powerBalance ?? 50,
        factionSupport: s.parliamentState?.factionSupport ?? {},
        activeBill: s.parliamentState?.activeBill ?? null
      },
      activeEvent: FLAVOR_EVENTS.expand_assembly_event
    };
  }, effectsText: ['学生代表大会升级为“合一学生议会”', '重置议会席位与意识形态比例', '增加新派系：保守民主派、及第补习派', '做题家派系升级为“做题派岁月静好党”', '狗熊派更名为“狗熊二次元解构派”', '触发事件：扩大学生代表大会'] },
  { id: 'democratic_reforms', title: '全面民主改革', description: '落实各项民主制度，解锁权力平衡机制。', days: 14, x: 700, y: 200, requires: ['pan_takeover'], onComplete: (s) => ({
    stats: { ...s.stats, partyCentralization: Math.max(0, s.stats.partyCentralization - 20), stab: Math.max(0, s.stats.stab - 20) },
    // v8.11 自由派改革强制改法案：部分自治 + 弹性作息（无需花费PP）
    lawSystem: { ...s.lawSystem, discipline: 'partial_autonomy', schedule: 'flexible_schedule' },
    parliamentState: {
      isUpgraded: s.parliamentState?.isUpgraded ?? false,
      powerBalanceUnlocked: true,
      powerBalance: s.parliamentState?.powerBalance ?? 50,
      factionSupport: s.parliamentState?.factionSupport ?? {},
      activeBill: s.parliamentState?.activeBill ?? null
    },
    nationalSpirits: s.nationalSpirits.concat({
      id: 'path_of_democracy',
      name: '民主之路（0/5）',
      description: "民主改革已被提上日程，但推进方式本身需要一系列法案来支撑。所谓民主之路，第一步是把各项民主制度逐项落实，让权力平衡机制真正进入运作，而不停留在口头承诺。\n\n这条路上必须处理素质教育与应试教育之间的权力平衡问题——它不会因为民主口号自动解决。改革者选择走这条路，就得接受它带来的摩擦与反复。",
      type: 'negative',
      effects: { ppDaily: -1, powerBalanceDaily: 0.5, tprDaily: -15, studentSanityDaily: -2.5 }
    }),
    activeEvent: FLAVOR_EVENTS.democratic_reforms_event 
  }), effectsText: ['党内集权度 -20', '稳定度 -20', '解锁机制：素质教育与应试教育权力平衡', '获得动态国家精神：民主之路 (每日TPR -15)', '触发事件：全面民主改革'] },
  { id: 'reclaim_democracy', title: '重拾民主...', description: '我们必须完全控制校园，才能真正推行民主。', days: 14, x: 500, y: 350, requires: ['expand_assembly', 'democratic_reforms'], 
    canStart: (s) => getCampusControlProgress(s).remaining.length === 0,
    requiresText: ['全校15个地区的实际学生控制度达到100%'],
    onComplete: (s) => {
      const newFlags = { ...s.flags, map_struggle_ended: true };
      ALL_SUB_TILES.forEach(t => { newFlags[`tile_ctrl_${t.id}`] = 100; });
      return {
        flags: newFlags,
        activeEvent: FLAVOR_EVENTS.reclaim_democracy_event
      };
    },
    effectsText: ['前置要求：所有地图地点学生控制度达到 100%', '结束校园地图斗争阶段', '所有地点变为浅蓝色', '触发事件：重拾民主']
  },
  { id: 'reshape_unity', title: '...再塑合一', description: '在民主的基础上，重新团结整个合肥一中。', days: 14, x: 500, y: 500, requires: ['reclaim_democracy'],
    onComplete: (s) => {
      const newMapLocations = { ...s.mapLocations };
      Object.keys(newMapLocations).forEach(key => {
        // Initialize polling data based on location and current parliament factions
        const baseFactions = s.studentAssemblyFactions || { pan: 30, orthodox: 15, bear: 7, otherDem: 15, testTaker: 15, conservativeDem: 10, jidiTutoring: 8 };
        const pollingData = { ...baseFactions };
        // Add some location-specific bias
        if (key === 'admin') {
          pollingData.conservativeDem += 30;
          pollingData.jidiTutoring += 20;
        }
        if (key === 'playground') {
          pollingData.bear += 35;
          pollingData.otherDem += 10;
        }
        if (key === 'b3') {
          pollingData.pan += 30;
          pollingData.orthodox += 30;
        }
        if (key === 'b1b2') {
          pollingData.testTaker += 25;
          pollingData.otherDem += 15;
        }
        if (key === 'auditorium') {
          pollingData.bear += 30;
          pollingData.otherDem += 15;
        }
        if (key === 'lab') {
          pollingData.jidiTutoring += 15;
          pollingData.testTaker += 20;
        }
        
        // Normalize to 100%
        const total = Object.values(pollingData).reduce((sum, val) => sum + val, 0);
        Object.keys(pollingData).forEach(k => {
          pollingData[k] = Math.round((pollingData[k] / total) * 100);
        });

        const baseVotes: Record<string, number> = {
          b3: 1200,
          b1b2: 2400,
          admin: 150,
          auditorium: 800,
          lab: 400,
          playground: 3000
        };

        newMapLocations[key] = { ...newMapLocations[key], pollingData, totalVotes: baseVotes[key] || 1000 };
      });
      return {
        flags: { ...s.flags, polling_stations_unlocked: true, chen_dong_veterans_unlocked: true },
        mapLocations: newMapLocations,
        activeEvent: FLAVOR_EVENTS.reshape_unity_event
      };
    },
    effectsText: ['解锁地图普选站机制', '可以花费PP查看民调或拉票', '解锁顾问：周晨、尤光雷', '触发事件：再塑合一']
  },
  { id: 'bill_conservative_discipline', title: '加强纪律法案', description: '保守派在议会提出加强校园纪律的法案。', days: 10, x: 100, y: 650, requires: ['reshape_unity'], 
    canStart: (s) => !s.parliamentState?.activeBill,
    onComplete: (s) => {
      const baseApp = (s.studentAssemblyFactions?.conservativeDem || 0) + (s.studentAssemblyFactions?.orthodox || 0) + (s.studentAssemblyFactions?.jidiTutoring || 0);
      return {
        flags: { ...s.flags, negotiated_this_bill: false },
        parliamentState: s.parliamentState ? {
          ...s.parliamentState,
          activeBill: { id: 'bill_conservative_discipline', name: '加强纪律法案', daysLeft: 10, baseApproval: baseApp, lobbiedApproval: 0, requiredApproval: 60, interactionsRemaining: 3, interactedFactions: [], proposer: 'conservativeDem' }
        } : undefined,
        activeEvent: STORY_EVENTS.bill_conservative_discipline_event
      };
    }, effectsText: ['保守派向议会提交法案，开启为期10天的投票', '需要60票赞同才能通过', '若通过，保守派席位 +5'] },
  { id: 'bill_club_freedom', title: '社团自由法案', description: '向议会提交社团自由法案。', days: 10, x: 300, y: 650, requires: ['reshape_unity'], 
    canStart: (s) => !s.parliamentState?.activeBill,
    onComplete: (s) => {
      const baseApp = (s.studentAssemblyFactions?.pan || 0) + (s.studentAssemblyFactions?.otherDem || 0) + (s.studentAssemblyFactions?.bear || 0);
      return {
        flags: { ...s.flags, negotiated_this_bill: false },
        parliamentState: s.parliamentState ? {
          ...s.parliamentState,
          activeBill: { id: 'bill_club_freedom', name: '社团自由法案', daysLeft: 10, baseApproval: baseApp, lobbiedApproval: 0, requiredApproval: 60, interactionsRemaining: 3, interactedFactions: [], proposer: 'pan' }
        } : undefined
      };
    }, effectsText: ['向议会提交法案，开启为期10天的投票', '需要60票赞同才能通过'] },
  { id: 'bill_orthodox_red_culture', title: '红色文化教育法案', description: '正统派在议会提出加强红色文化教育的法案。', days: 10, x: 500, y: 650, requires: ['reshape_unity'], 
    canStart: (s) => !s.parliamentState?.activeBill,
    onComplete: (s) => {
      const baseApp = (s.studentAssemblyFactions?.orthodox || 0) + (s.studentAssemblyFactions?.conservativeDem || 0) + (s.studentAssemblyFactions?.bear || 0);
      return {
        flags: { ...s.flags, negotiated_this_bill: false },
        parliamentState: s.parliamentState ? {
          ...s.parliamentState,
          activeBill: { id: 'bill_orthodox_red_culture', name: '红色文化教育法案', daysLeft: 10, baseApproval: baseApp, lobbiedApproval: 0, requiredApproval: 60, interactionsRemaining: 3, interactedFactions: [], proposer: 'orthodox' }
        } : undefined,
        activeEvent: STORY_EVENTS.bill_orthodox_red_culture_event
      };
    }, effectsText: ['正统派向议会提交法案，开启为期10天的投票', '需要60票赞同才能通过', '若通过，正统派席位 +5'] },
  { id: 'bill_abolish_evening_study', title: '废除强制晚自习法案', description: '向议会提交废除强制晚自习法案。', days: 10, x: 700, y: 650, requires: ['reshape_unity'], 
    canStart: (s) => !s.parliamentState?.activeBill,
    onComplete: (s) => {
      const baseApp = (s.studentAssemblyFactions?.pan || 0) + (s.studentAssemblyFactions?.otherDem || 0) + (s.studentAssemblyFactions?.bear || 0);
      return {
        flags: { ...s.flags, negotiated_this_bill: false },
        parliamentState: s.parliamentState ? {
          ...s.parliamentState,
          activeBill: { id: 'bill_abolish_evening_study', name: '废除强制晚自习法案', daysLeft: 10, baseApproval: baseApp, lobbiedApproval: 0, requiredApproval: 60, interactionsRemaining: 3, interactedFactions: [], proposer: 'pan' }
        } : undefined
      };
    }, effectsText: ['向议会提交法案，开启为期10天的投票', '需要60票赞同才能通过'] },
  { id: 'bill_test_taker_mock_exams', title: '增加模拟考法案', description: '做题派在议会提出增加周末模拟考的法案。', days: 10, x: 900, y: 650, requires: ['reshape_unity'], 
    canStart: (s) => !s.parliamentState?.activeBill,
    onComplete: (s) => {
      const baseApp = (s.studentAssemblyFactions?.testTaker || 0) + (s.studentAssemblyFactions?.jidiTutoring || 0) + (s.studentAssemblyFactions?.conservativeDem || 0);
      return {
        flags: { ...s.flags, negotiated_this_bill: false },
        parliamentState: s.parliamentState ? {
          ...s.parliamentState,
          activeBill: { id: 'bill_test_taker_mock_exams', name: '增加模拟考法案', daysLeft: 10, baseApproval: baseApp, lobbiedApproval: 0, requiredApproval: 60, interactionsRemaining: 3, interactedFactions: [], proposer: 'testTaker' }
        } : undefined,
        activeEvent: STORY_EVENTS.bill_test_taker_mock_exams_event
      };
    }, effectsText: ['做题派向议会提交法案，开启为期10天的投票', '需要60票赞同才能通过', '若通过，做题派席位 +5'] },
  { id: 'bill_student_welfare', title: '学生福利法案', description: '向议会提交学生福利法案。', days: 10, x: 500, y: 950, requires: ['bill_club_freedom', 'bill_abolish_evening_study'], 
    canStart: (s) => !s.parliamentState?.activeBill,
    onComplete: (s) => {
      const baseApp = (s.studentAssemblyFactions?.pan || 0) + (s.studentAssemblyFactions?.otherDem || 0);
      return {
        flags: { ...s.flags, negotiated_this_bill: false },
        parliamentState: s.parliamentState ? {
          ...s.parliamentState,
          activeBill: { id: 'bill_student_welfare', name: '学生福利法案', daysLeft: 10, baseApproval: baseApp, lobbiedApproval: 0, requiredApproval: 60, interactionsRemaining: 3, interactedFactions: [], proposer: 'pan' }
        } : undefined
      };
    }, effectsText: ['向议会提交法案，开启为期10天的投票', '需要60票赞同才能通过'] },
  { id: 'empower_student_unions', title: '赋权学生会', description: '赋予学生会更多的自治权。', days: 14, x: 100, y: 800, requires: ['bill_club_freedom'], onComplete: (s) => {
    const factions = s.studentAssemblyFactions ? { ...s.studentAssemblyFactions } : undefined;
    if (factions) {
      factions.pan += 5;
      factions.testTaker = Math.max(0, factions.testTaker - 5);
    }
    return {
      stats: { ...s.stats, allianceUnity: Math.min(100, s.stats.allianceUnity + 10) },
      studentAssemblyFactions: factions,
      activeEvent: STORY_EVENTS.empower_student_unions_event
    };
  }, effectsText: ['联盟团结度 +10', '潘仁越民主派席位 +5', '解锁决议：举办校园文化节', '触发事件：学生会赋权法案落实'] },
  { id: 'student_media_support', title: '支持学生媒体', description: '为校园独立媒体提供资金与政策支持，扩大民主派的舆论阵地。', days: 14, x: 300, y: 800, requires: ['bill_club_freedom'], onComplete: (s) => {
    const factions = s.studentAssemblyFactions ? { ...s.studentAssemblyFactions } : undefined;
    if (factions) {
      factions.pan += 3;
      factions.otherDem += 2;
      factions.orthodox = Math.max(0, factions.orthodox - 5);
    }
    return {
      stats: { ...s.stats, tpr: s.stats.tpr + 50 },
      studentAssemblyFactions: factions,
      activeEvent: STORY_EVENTS.student_media_support_event
    };
  }, effectsText: ['获得 50 TPR', '潘仁越民主派席位 +3', '非建制民主派席位 +2', '正统派席位 -5', '解锁决议：开展独立媒体论坛', '触发事件：校园媒体的新生'] },
  { id: 'campus_infrastructure_upgrade', title: '校园基础设施升级', description: '改善学生的生活条件，争取更多中立学生的支持。', days: 14, x: 500, y: 800, requires: ['bill_club_freedom'], onComplete: (s) => {
    const factions = s.studentAssemblyFactions ? { ...s.studentAssemblyFactions } : undefined;
    if (factions) {
      factions.pan += 3;
      factions.testTaker += 2;
      factions.bear = Math.max(0, factions.bear - 5);
    }
    return {
      stats: { ...s.stats, studentSanity: Math.min(100, s.stats.studentSanity + 10) },
      studentAssemblyFactions: factions,
      activeEvent: STORY_EVENTS.campus_infrastructure_upgrade_event
    };
  }, effectsText: ['学生理智值 +10', '潘仁越民主派席位 +3', '做题派岁月静好党席位 +2', '狗熊派席位 -5', '触发事件：焕然一新的校园'] },
  { id: 'education_marketization', title: '教育市场化试点', description: '引入外部补习机构，缓解升学压力。', days: 14, x: 900, y: 800, requires: ['bill_abolish_evening_study'], onComplete: (s) => {
    const factions = s.studentAssemblyFactions ? { ...s.studentAssemblyFactions } : undefined;
    if (factions) {
      factions.jidiTutoring = (factions.jidiTutoring || 0) + 5;
      factions.orthodox = Math.max(0, factions.orthodox - 5);
    }
    return {
      parliamentState: s.parliamentState ? { ...s.parliamentState, powerBalance: Math.min(100, s.parliamentState.powerBalance + 15) } : undefined,
      studentAssemblyFactions: factions,
      activeEvent: STORY_EVENTS.education_marketization_event
    };
  }, effectsText: ['及第补习派席位 +5', '权力平衡向“应试教育”偏移 15', '触发事件：及第教育的入驻'] },
  { id: 'academic_competition_sponsorship', title: '学术竞赛赞助', description: '鼓励学生参与各类学术竞赛，提升学校的综合竞争力。', days: 14, x: 700, y: 800, requires: ['bill_abolish_evening_study'], onComplete: (s) => {
    const factions = s.studentAssemblyFactions ? { ...s.studentAssemblyFactions } : undefined;
    if (factions) {
      factions.testTaker += 5;
      factions.orthodox = Math.max(0, factions.orthodox - 5);
    }
    return {
      stats: { ...s.stats, pp: s.stats.pp + 50 },
      studentAssemblyFactions: factions,
      activeEvent: STORY_EVENTS.academic_competition_sponsorship_event
    };
  }, effectsText: ['获得 50 政治点数', '做题派岁月静好党席位 +5', '正统派席位 -5', '解锁决议：学生自发学术沙龙', '触发事件：学术竞赛热潮'] },
  { id: 'extracurricular_activities_fund', title: '课外活动基金', description: '设立专项基金，支持学生开展丰富多彩的课外活动。', days: 14, x: 1100, y: 800, requires: ['bill_abolish_evening_study'], onComplete: (s) => {
    const factions = s.studentAssemblyFactions ? { ...s.studentAssemblyFactions } : undefined;
    if (factions) {
      factions.otherDem += 5;
      factions.bear = Math.max(0, factions.bear - 5);
    }
    return {
      stats: { ...s.stats, studentSanity: Math.min(100, s.stats.studentSanity + 15) },
      studentAssemblyFactions: factions,
      activeEvent: STORY_EVENTS.extracurricular_activities_fund_event
    };
  }, effectsText: ['学生理智值 +15', '非建制民主派席位 +5', '狗熊派席位 -5', '解锁决议：全校社团联合展演', '触发事件：百花齐放的课外活动'] },
  { id: 'bill_transparent_finances', title: '财务公开法案', description: '要求校方公开所有财务收支。', days: 10, x: 400, y: 1100, requires: ['bill_student_welfare'], 
    canStart: (s) => !s.parliamentState?.activeBill,
    onComplete: (s) => {
      const baseApp = (s.studentAssemblyFactions?.pan || 0) + (s.studentAssemblyFactions?.otherDem || 0);
      return {
        flags: { ...s.flags, negotiated_this_bill: false },
        parliamentState: s.parliamentState ? {
          ...s.parliamentState,
          activeBill: { id: 'bill_transparent_finances', name: '财务公开法案', daysLeft: 10, baseApproval: baseApp, lobbiedApproval: 0, requiredApproval: 60, interactionsRemaining: 3, interactedFactions: [], proposer: 'pan' }
        } : undefined
      };
    }, effectsText: ['向议会提交法案，开启为期10天的投票', '需要60票赞同才能通过'] },
  { id: 'bill_curriculum_reform', title: '课程改革法案', description: '增加选修课，减少必修课时。', days: 10, x: 600, y: 1100, requires: ['bill_student_welfare'], 
    canStart: (s) => !s.parliamentState?.activeBill,
    onComplete: (s) => {
      const baseApp = (s.studentAssemblyFactions?.pan || 0) + (s.studentAssemblyFactions?.otherDem || 0);
      return {
        flags: { ...s.flags, negotiated_this_bill: false },
        parliamentState: s.parliamentState ? {
          ...s.parliamentState,
          activeBill: { id: 'bill_curriculum_reform', name: '课程改革法案', daysLeft: 10, baseApproval: baseApp, lobbiedApproval: 0, requiredApproval: 60, interactionsRemaining: 3, interactedFactions: [], proposer: 'pan' }
        } : undefined
      };
    }, effectsText: ['向议会提交法案，开启为期10天的投票', '需要60票赞同才能通过'] },
  { id: 'pan_ending', title: '民主的胜利', description: '合肥一中迎来了真正的民主。', days: 7, x: 500, y: 1250, requires: ['bill_transparent_finances', 'bill_curriculum_reform'], 
    canStart: (s) => (s.flags.passed_bills_count || 0) >= 3 && (s.parliamentState?.powerBalance ?? 50) <= 30 && (s.stats.studentSanity ?? 0) > 80,
    onComplete: (s) => ({ activeEvent: STORY_EVENTS.pan_democratic_victory_event }), effectsText: ['触发事件：漫长凛冬的终结'], requiresText: ['至少通过3个法案', '权力平衡偏向素质教育至少20%', '学生理智度大于80'] },
  { id: 'first_democratic_election', title: '第一次民主普选', description: '举行合肥一中历史上的第一次民主普选。', days: 60, x: 500, y: 1400, requires: ['pan_ending'],
    onStart: (s) => ({
      activeEvent: STORY_EVENTS.start_democratic_election_event
    }),
    onComplete: (s) => {
      // The election ends, trigger the outcome event
      return { activeEvent: STORY_EVENTS.election_outcome_event };
    },
    effectsText: ['触发事件：大选开始', '开启为期60天的大选', '地图将切换为大选模式']
  }
];

export const TREE_A_PAN_DESPAIR_NODES: FocusNode[] = [
  { id: 'despair_street_fight', title: '绝望的走廊巷战', description: '最后的抵抗。', days: 7, x: 300, y: 50, onComplete: (s) => ({
    nationalSpirits: s.nationalSpirits.concat({ id: 'desperate_defense', name: '绝望的抵抗', description: "最后的街垒已经筑起。参与者清楚赢不了，但没有人打算退。绝望在此处不表现为崩溃，而表现为明知结局仍不撤离的防御姿态。\n\n这种抵抗能拖住进攻方，却无法带来任何政治出路。它以持续消耗自身为代价换取时间，每一刻都在削弱本就脆弱的稳定。走廊尽头的决定尚未作出，但街垒后面的人已经用行动表明了立场。", type: 'neutral', effects: { defenseBonus: 0.2, stabDaily: -0.5 } }),
    activeEvent: FLAVOR_EVENTS.despair_fight
  }), effectsText: ['获得国家精神：绝望的抵抗 (防御加成 +20%，稳定度每日 -0.5%)', '触发事件：绝望的走廊巷战'] },
  { id: 'telegram_six_schools', title: '六校联合的电报', description: '希望的曙光。', days: 7, x: 700, y: 50, effectsText: ['解锁后续国策'] },
  { id: 'defend_b3', title: '死守B3教学楼', description: '触发B3保卫战小游戏！', days: 14, x: 500, y: 200, requires: ['despair_street_fight', 'telegram_six_schools'], effectsText: ['触发B3保卫战小游戏'] },
  { id: 'counter_attack', title: '绝地反击', description: '从防守转入进攻。', days: 14, x: 500, y: 350, requires: ['defend_b3'], onComplete: (s) => ({ stats: { ...s.stats, ss: s.stats.ss + 30 } }), effectsText: ['学生支持度 (SS) +30'] },
  { id: 'last_stand_fails', title: '最后的防线崩溃', description: '我们尽力了，但敌人太多了。', days: 21, x: 500, y: 500, requires: ['counter_attack'], onComplete: (s) => ({ gameEnding: 'game_over_despair' }), effectsText: ['触发结局：绝望的终局'] },
];

export const TREE_A_TRUE_LEFT_NODES: FocusNode[] = [
  { id: 'true_left_consolidation', title: '巩固真左派路线', description: '坚持马克思主义的指导。', days: 7, x: 500, y: 50, onComplete: (s) => ({
    stats: { ...s.stats, partyCentralization: s.stats.partyCentralization + 10 },
    flags: { ...s.flags, true_left_advisors_unlocked: true },
    activeEvent: FLAVOR_EVENTS.true_left_consolidation_event
  }), effectsText: ['党内集权度 +10', '解锁顾问：吕波汉，时纪，周红兵', '触发事件：巩固真左派路线'] },
  { id: 'orthodox_dominance', title: '确立正统派主导', description: '确保先锋队的纯洁性。', days: 14, x: 300, y: 200, requires: ['true_left_consolidation'], onComplete: (s) => {
    const factions = s.studentAssemblyFactions || { orthodox: 30, bear: 20, pan: 20, otherDem: 15, testTaker: 15 };
    return {
      studentAssemblyFactions: {
        ...factions,
        orthodox: factions.orthodox + 15,
        pan: Math.max(0, factions.pan - 10),
        otherDem: Math.max(0, factions.otherDem - 5)
      },
      activeEvent: FLAVOR_EVENTS.orthodox_dominance_event
    };
  }, effectsText: ['正统派席位 +15', '潘仁越派席位 -10', '非建制民主派席位 -5', '触发事件：确立正统派主导'] },
  { id: 'final_revolution', title: '最终革命', description: '将革命进行到底。', days: 14, x: 700, y: 200, requires: ['true_left_consolidation'], onComplete: (s) => ({ stats: { ...s.stats, allianceUnity: s.stats.allianceUnity + 10 }, activeEvent: FLAVOR_EVENTS.final_revolution_event }), effectsText: ['联盟团结度 +10', '触发事件：最终革命'] },
  
  { id: 'declare_victory', title: '宣告全校夺取胜利', description: '我们已经控制了整个校园，是时候结束军事阶段，转向全面建设了。', days: 7, x: 500, y: 350, requires: ['orthodox_dominance', 'final_revolution'],
    canStart: (s) => getCampusControlProgress(s).remaining.length === 0,
    requiresText: ['全校15个地区的实际学生控制度达到100%'],
    onComplete: (s) => ({
      flags: { ...s.flags, 'map_phase_ended': true, 'red_toad_politburo_unlocked': true },
      redToadState: {
        overallConsensus: 50,
        factions: {},
        activeBillId: null,
        billCooldown: 0,
        historicalBills: [],
        availableBills: []
      }
    }),
    effectsText: ['需要：全校所有区域控制度达到 100%', '结束地图抢地盘阶段', '解锁机制：红蛤政治局']
  },
  { id: 'reform_resource_exchange', title: '资源统筹委员会', description: '建立专门机构，将学生支持和试卷储备转化为政治影响力。', days: 14, x: 500, y: 500, requires: ['declare_victory'],
    onComplete: (s) => ({
      flags: { ...s.flags, unlockedResourceExchange: true },
      activeEvent: FLAVOR_EVENTS.resource_exchange_event
    }),
    effectsText: ['解锁决议：倒卖试卷储备', '解锁决议：动员学生支持', '触发事件：资源统筹与分配']
  },
  { id: 'start_reform', title: '开始做题改革', description: '旧的秩序已经被打破，现在我们要建立新的教育体系。', days: 14, x: 500, y: 650, requires: ['reform_resource_exchange'],
    onComplete: (s) => {
      // v8.11 真左线强制改法案：高压管理（革命纪律）+ 素质并重
      const newLawSystem = { ...s.lawSystem, discipline: 'strict', education: 'balanced' };
      const newCrises = [...s.crises, {
        id: 'reform_fail_crisis',
        totalDays: 150,
        title: '做题改革付之东流',
        resolutionText: '在倒计时内完成做题改革（进度 ≥100），或执行「推迟题改危机」决议（100 PP，最多10次）',
        expiryText: '吕波汉与狗熊发动政变，进入N.K.P.D.极权线',
        daysLeft: 150,
        description: '旧势力的反扑和内部的矛盾正在消耗改革的动力。如果不能在150天内完成做题改革（进度达到100%），一切努力都将付之东流。'
      }];
      return {
        flags: { ...s.flags, reform_unlocked: true },
        unlockedMinigames: [...s.unlockedMinigames, 'reform_committee'],
        crises: newCrises,
        lawSystem: newLawSystem,
        activeStoryEvents: [...s.activeStoryEvents, STORY_EVENTS.juanhao_event_1],
        reformState: {
          progress: 0,
          vanguardMembers: 50,
          reformDaysElapsed: 0,
          regionalStubbornness: {
            'B3': 60,
            'B1_B2': 40,
            'Admin': 90,
            'ArtHall': 30,
            'Lab': 50,
            'Playground': 20
          },
          activeMissions: {},
          baseSuccessRate: 50,
          juanhaoAttitude: 0,
          juanhaoEventsTriggered: { '5': true }
        }
      };
    },
    effectsText: ['解锁小游戏：全面做题改革委员会', '开启做题改革进程', '触发危机：做题改革付之东流 (150天)', '强制改法案：高压管理 + 素质并重', '触发事件：狂飙下的宁静']
  },
  { id: 'reform_focus_1', title: '下乡工作队', description: '派遣先锋党员深入各年级，开展思想教育。', days: 14, x: 300, y: 800, requires: ['start_reform'],
    onComplete: (s) => ({
      reformState: s.reformState ? { ...s.reformState, vanguardMembers: s.reformState.vanguardMembers + 20 } : undefined
    }),
    effectsText: ['先锋党员 +20']
  },
  { id: 'reform_focus_2', title: '批判唯分数论', description: '在全校范围内开展对“唯分数论”的大批判。', days: 14, x: 700, y: 800, requires: ['start_reform'],
    onComplete: (s) => ({
      reformState: s.reformState ? {
        ...s.reformState,
        regionalStubbornness: Object.fromEntries(Object.entries(s.reformState.regionalStubbornness || {}).map(([k, v]) => [k, Math.max(0, v - 10)]))
      } : undefined
    }),
    effectsText: ['所有区域做题派顽固度 -10']
  },
  { id: 'reform_focus_3', title: '建立新评价体系', description: '引入多元化的评价标准，打破单一的考试评价。', days: 21, x: 500, y: 950, requires: ['reform_focus_1', 'reform_focus_2'],
    onComplete: (s) => ({
      reformState: s.reformState ? { ...s.reformState, baseSuccessRate: s.reformState.baseSuccessRate + 15 } : undefined
    }),
    effectsText: ['题改任务基础成功率 +15%']
  },
  { id: 'reform_recruit_vanguard', title: '扩充先锋队', description: '在各年级广泛招募积极分子加入先锋队。', days: 14, x: 100, y: 950, requires: ['reform_focus_1'],
    onComplete: (s) => ({
      reformState: s.reformState ? { ...s.reformState, unlockedRecruitDecisions: true } : undefined
    }),
    effectsText: ['解锁招募更多先锋党员的决议']
  },
  { id: 'reform_sanity_focus', title: '心理疏导运动', description: '关注学生心理健康，缓解改革带来的阵痛。', days: 14, x: 300, y: 950, requires: ['reform_focus_1'],
    onComplete: (s) => ({
      reformState: s.reformState ? { ...s.reformState, unlockedSanityDecisions: true } : undefined
    }),
    effectsText: ['解锁提高学生理智度的决议']
  },
  { id: 'reform_anger_focus', title: '安抚激进情绪', description: '引导学生理性看待改革，避免过激行为。', days: 14, x: 700, y: 950, requires: ['reform_focus_2'],
    onComplete: (s) => ({
      reformState: s.reformState ? { ...s.reformState, unlockedAngerDecisions: true } : undefined
    }),
    effectsText: ['解锁降低激进愤怒度的决议']
  },
  { id: 'reform_b3_actions', title: '深化B3区改革', description: '在核心区采取更深入的改革措施。', days: 14, x: 900, y: 950, requires: ['reform_focus_2'],
    onComplete: (s) => ({
      reformState: s.reformState ? { ...s.reformState, unlockedB3Actions: true } : undefined
    }),
    effectsText: ['解锁题改小游戏中更多可提高总题改进度的交互选项']
  },
  { id: 'reform_advisor_jiang', title: '聘请意识形态教员', description: '邀请豪邦同志指导我们的思想工作。', days: 14, x: 500, y: 1100, requires: ['reform_focus_3'],
    onComplete: (s) => ({
      flags: { ...s.flags, jiang_haobang_unlocked: true }
    }),
    effectsText: ['解锁内阁顾问：豪邦（意识形态教员）']
  },
  { id: 'true_left_ending', title: '真左派大团结', description: '实现全校师生的大团结。', days: 7, x: 500, y: 1250, requires: ['reform_advisor_jiang'],
    canStart: (s) => Boolean(s.flags.reform_completed) || (s.reformState?.progress || 0) >= 100,
    onComplete: (s) => {
      // v8.7 金线：王潘和解协定生效、团结依旧、两派平衡 → 合一大革命结局（王潘联合执政）
      const fac = s.studentAssemblyFactions || { orthodox: 30, bear: 20, pan: 20, otherDem: 15, testTaker: 15 };
      if (s.flags.true_left_good_path && s.stats.allianceUnity > 60 && s.stats.partyCentralization <= 70 && fac.pan > 25) {
        return { activeEvent: STORY_EVENTS.true_left_good_event };
      }
      return { currentFocusTree: 'treeA_haobang', completedFocuses: [], activeFocus: null, flags: { ...s.flags, map_phase_ended: false } };
    },
    effectsText: ['需要：总题改进度达到 100%', '触发：进入豪邦国策树', '若《王潘和解协定》生效且团结依旧、两派平衡，触发结局：合一大革命']
  },
];

export const TREE_A_LU_BOHAN_NODES: FocusNode[] = [
  { id: 'lu_bohan_start', title: '吕氏肃反委员会', description: '“改革需要绝对意志。”吕波汉接管政治保卫体系。', days: 7, x: 500, y: 50,
    onComplete: (s) => ({
      leader: {
        name: '吕波汉',
        title: 'N.K.P.D.肃反委员会主席',
        portrait: 'lu_bohan',
        ideology: 'authoritarian',
        description: "吕波汉以肃反委员会的名义重组政治局，接管政治保卫体系，使肃反机构成为校内秩序的主要执行者。他相信改革需要绝对意志，主张以高压与组织整编压平派系纷争，把纷争本身视为必须先清除的障碍，而不是可以通过商议解决的常态。",
        buffs: ['权力平衡每日向吕波汉侧移动 0.05']
      },
      stats: { ...s.stats, partyCentralization: Math.min(100, s.stats.partyCentralization + 12), stab: Math.max(0, s.stats.stab - 3) },
      flags: {
        ...s.flags,
        lu_nkpd_mode: true,
        lu_red_terror: true,
      },
      nationalSpirits: s.nationalSpirits
        .filter(ns => ns.id !== 'red_terror_nkpd')
        .concat({
          id: 'red_terror_nkpd',
          name: '红色恐怖',
          description: "吕波汉接管政治保卫体系后，肃反委员会不再只是名义上的机构，它开始全面介入校内秩序的每一处缝隙。改革需要绝对意志——这套说辞把整肃变成日常，把异议变成可追查的线索，稳定由此被抬高到一切之上，而日常的政治运转则相应收紧。委员会的直接后果是：人人知道界限在哪，但没有人能确定界限明天会挪到哪。",
          type: 'negative',
          effects: { stabDaily: 0.3, ppDaily: -0.5 }
        }),
      activeEvent: {
        id: 'lu_bohan_route_opening',
        title: '头号“做题蛆”的末日审判',
        description: '凛冽的夜风卷起操场上散落的草稿纸，惨白的探照灯光如同利剑般劈开合一深沉的黑夜，将几千名瑟瑟发抖的学生死死钉在塑胶跑道上。这是吕博涵全面掌权后的第一个大动作——一场旨在彻底摧毁旧秩序尊严的全校级别批斗大会。而这场猎巫狂欢的核心祭品，正是曾经的模考神话、王照凯的昔日挚友，被冠以“头号做题蛆”之名的王卷豪。\n\n他被两名戴着黑红双色袖章的午夜纠察队队员粗暴地反扭着双臂，强行押解到主席台的聚光灯下。他的脖子上挂着一块沉重的、用三合板粗制滥造的牌子，上面用极其刺眼的红漆写着“资产阶级分数吸血鬼”。狗熊——这场审判的实际操刀手与头号小丑——正拿着麦克风在台上疯狂游走。他用一种极其荒诞的、混合了二次元烂梗与极端政治口号的译制片腔调，逐条宣读王卷豪的罪状：“看看这个冥顽不灵的做题机器！当我们在为了无产阶级的解放而奋斗时，他居然在被窝里偷偷刷完了整本《五年高考三年模拟》！这是对革命的公然挑衅！”\n\n台下爆发出一阵被恐惧和狂热裹挟的嘶吼。那些曾经因为成绩被王卷豪碾压而心生嫉妒的平庸之辈，此刻在吕博涵极权大棒的撑腰下，终于找到了发泄平庸之恶的合法宣泄口。成百上千张揉成团的废弃试卷如同冰雹般砸向王卷豪的脸庞。在这个彻底失去理智的夜晚，合一再也没有对知识的敬畏，只有对分数的扭曲仇恨化作了纯粹的暴力私刑。吕博涵站在主席台阴影的深处，冷冷地俯视着这场他一手导演的狂欢，嘴角勾起一抹令人毛骨悚然的冷笑。',
        buttonText: '开始清理'
      }
    }),
    effectsText: ['党内集权度 +12', '稳定度 -3', '开启吕波汉线肃反议程']
  },
  { id: 'retire_haobang', title: '强制豪邦退休', description: '先清理“大帐篷”路线，终止温和统战。', days: 10, x: 500, y: 190, requires: ['lu_bohan_start'],
    onComplete: (s) => {
      const newFactions = { ...s.redToadState?.factions } as any;
      if (newFactions.libertarian_socialist) {
        newFactions.libertarian_socialist.influence = 0;
        newFactions.libertarian_socialist.loyalty = 0;
        newFactions.libertarian_socialist.execution = 0;
      }
      return {
        redToadState: s.redToadState ? { ...s.redToadState, factions: newFactions } : undefined,
        stats: { ...s.stats, allianceUnity: Math.max(0, s.stats.allianceUnity - 6), partyCentralization: Math.min(100, s.stats.partyCentralization + 4) },
        flags: { ...s.flags, faction_retired_libertarian_socialist: true },
        activeEvent: {
          id: 'retire_haobang_story',
          title: '豪邦退休令',
          description: '当狂热的火焰烧尽了理智，第一个被推上祭坛的必定是那些试图在火药桶上维持平衡的温和派。作为钢铁红蛤的创始人之一、“做题改革”原本的实际操刀手豪邦，成为了吕波汉肃反名单上的头号政敌。豪邦那套“左翼大帐篷”的妥协理念与互助组实验，在吕波汉的极端二极管逻辑里，就是彻头彻尾的“右倾投降主义”和“包庇做题阶级”。\n\n对豪邦的清算没有丝毫的温情可言。在一次被刻意操纵的政治局扩大会议上，狗熊突然发难，将几十份伪造的“学生举报信”摔在豪邦脸上，指控他利用职务之便倒卖复习资料、企图复辟衡水模式。不等豪邦辩解，预先埋伏好的纠察队便一拥而上，扯下了他的红袖章。这位曾经为了合一的民主未来四处奔走的理想主义者，被戴上了一顶写着“右倾翻案风总头目”的纸糊高帽，在全校师生麻木的注视下被押解游街。\n\n但这并非折磨的终点。吕波汉深知豪邦在群众中的威望，直接处决会引发反弹。于是，一道充满恶意的劳改指令下达了：豪邦被剥夺了一切学生身份和政治权利，被下放到环境最为恶劣的地下水泵房进行强制劳动。每天，他必须在阴暗潮湿的环境中，用手推车将成吨的、从各个寝室收缴来的旧试卷和教辅资料运送到焚烧炉前。每一次铲起那些写满笔记的纸张，都是对他那残存的理想主义信仰的一次凌迟。他在劳改的汗水与灰烬中终于绝望地明白，当革命的列车脱轨，它碾碎的第一个人，往往是它的建造者。',
          buttonText: '我们亲手放出了利维坦，如今却成了它的口粮。',
          isStoryEvent: true
        }
      };
    },
    effectsText: ['自社派退休（影响力/忠诚度/执行力归零）', '联盟团结度 -6', '党内集权度 +4']
  },
  { id: 'retire_zhou_hongbing', title: '强制周红兵退休', description: '网哲派被指控“破坏组织纪律”，退出核心。', days: 10, x: 500, y: 330, requires: ['retire_haobang'],
    onComplete: (s) => {
      const newFactions = { ...s.redToadState?.factions } as any;
      if (newFactions.internet_philosopher) {
        newFactions.internet_philosopher.influence = 0;
        newFactions.internet_philosopher.loyalty = 0;
        newFactions.internet_philosopher.execution = 0;
      }
      return {
        redToadState: s.redToadState ? { ...s.redToadState, factions: newFactions } : undefined,
        stats: { ...s.stats, studentSanity: Math.max(0, s.stats.studentSanity - 8), partyCentralization: Math.min(100, s.stats.partyCentralization + 4) },
        flags: { ...s.flags, faction_retired_internet_philosopher: true },
        activeEvent: {
          id: 'retire_zhou_story',
          title: '周红兵退休令',
          description: '周洪斌，这位深陷拉康与齐泽克迷障的“哲人王”，直到大清洗的屠刀架在脖子上时，依然沉浸在他那套晦涩的理论世界中。当狗熊带着两名凶神恶煞的纠察队员踹开他那间堆满哲学原著的宿舍大门时，周洪斌不仅没有恐慌，反而推了推眼镜，试图用学术辩论的姿态来迎接这场政治风暴。\n\n“你们这种基于庸俗权力欲的清洗，不过是象征界里可悲的神经症发作！”周洪斌站在床铺上，指着狗熊的鼻子大声疾呼，“吕波汉的极权机器根本无法触及实在界的真理，你们对我的镇压，恰恰证明了你们在大他者面前的虚弱与无能……”\n\n他本以为这番高深莫测的宏大叙事能让这群“粗鄙的武夫”陷入逻辑的自我怀疑，从而赢得政治局里的一线生机。然而，他犯了知识分子在面对绝对暴力时最致命的错误——吕波汉根本不屑于和他辩论。\n\n“这傻子在念什么咒语呢？”狗熊百无聊赖地掏了掏耳朵，用一种看杂耍猴子般的眼神看着周洪斌。他根本懒得去理解那些哲学词汇，直接转身对着身后的队员挥了手，“吕指导说了，这家伙成天散布听不懂的反动言论，企图用资产阶级唯心主义腐蚀革命队伍。直接扣上‘反革命谜语人’的帽子，带到操场上去让他对着空气念经吧。”没有神学辩论，没有路线斗争，甚至没有一份像样的罪状陈述。两个壮汉上前，一脚踹翻了装满齐泽克著作的书架，像拎小鸡一样把这位赛博网哲拖出了寝室。在绝对的暴力面前，一切复杂的哲学解构都显得如此苍白可笑。',
          buttonText: '批判的武器，终究敌不过武器的批判。',
          isStoryEvent: true
        }
      };
    },
    effectsText: ['网哲派退休（影响力/忠诚度/执行力归零）', '学生理智值 -8', '党内集权度 +4']
  },
  { id: 'retire_wang_zhaokai', title: '强制王照凯退休', description: '“舵手”被架空，正统派失去组织中枢。', days: 12, x: 500, y: 470, requires: ['retire_zhou_hongbing'],
    onComplete: (s) => {
      const newFactions = { ...s.redToadState?.factions } as any;
      if (newFactions.orthodox) {
        newFactions.orthodox.influence = 0;
        newFactions.orthodox.loyalty = 0;
        newFactions.orthodox.execution = 0;
      }
      return {
        redToadState: s.redToadState ? { ...s.redToadState, factions: newFactions } : undefined,
        stats: { ...s.stats, stab: Math.max(0, s.stats.stab - 10), partyCentralization: Math.min(100, s.stats.partyCentralization + 8) },
        flags: {
          ...s.flags,
          faction_retired_orthodox: true,
          lu_wang_retire_blank_chain_started: true,
          lu_wang_retire_blank_chain_days: 0,
          lu_wang_retire_blank_chain_count: 0,
        },
        activeEvent: {
          id: 'orthodox_retirement_event',
          title: '水晶棺里的偶像',
          description: '作为“联合革委会”名义上的最高领袖，王照凯的存在对于吕波汉的彻底独裁始终是一个法理上的障碍。但吕波汉并没有选择粗暴的肉体消灭，他在狗熊的建议下，选择了一种更具黑色幽默、也更为恶毒的政治迫害手段——将活人铸成神像。\n\n清晨的校园广播中，播音员用一种夸张到令人反胃的悲痛语调宣布：伟大的先锋队导师王照凯同志，因长期超负荷领导“做题改革”，突发严重的心因性衰竭，已“光荣退居二线”，在校医室接受完全隔离的“静养”。实际上，王照凯被彻底软禁在了那间只有一扇天窗的旧档案室里，门外站着两名全副武装的纠察队员，切断了他与外界的一切联系。\n\n但这仅仅是异化的开始。吕波汉非但没有抹除王照凯的名字，反而将他捧上了神坛。校园里一夜之间挂满了王照凯的巨幅画像，甚至连《中学生日常行为规范》都被强制替换成了《战无不胜的王照凯思想纲要》。然而，这套所谓的“思想”，已经被吕波汉的御用文人彻底篡改和阉割，剔除了所有关于民主、妥协与反压迫的内核，只剩下为无休止的内部清洗和极权统治辩护的恐怖逻辑。王照凯在物理上依然呼吸着，但在政治上，他已经被吕波汉活生生地塞进了意识形态的水晶棺，变成了一个没有任何反抗能力、只能任由篡权者随意装扮的无害神像。每天听着窗外用自己名字发起的批斗口号，成了对他最残忍的折磨。',
          buttonText: '铜塑的雕像无需发声，他只需要永远正确。'
        }
      };
    },
    effectsText: ['正统派退休（影响力/忠诚度/执行力归零）', '稳定度 -10', '党内集权度 +8']
  },
  { id: 'retire_shiji', title: '强制时纪退休', description: '安那其派被整体清退，基层自治网络被拆解。', days: 10, x: 500, y: 620, requires: ['retire_wang_zhaokai'],
    onComplete: (s) => {
      const newFactions = { ...s.redToadState?.factions } as any;
      if (newFactions.anarchist) {
        newFactions.anarchist.influence = 0;
        newFactions.anarchist.loyalty = 0;
        newFactions.anarchist.execution = 0;
      }
      return {
        redToadState: s.redToadState ? { ...s.redToadState, factions: newFactions } : undefined,
        stats: { ...s.stats, allianceUnity: Math.max(0, s.stats.allianceUnity - 10), partyCentralization: Math.min(100, s.stats.partyCentralization + 6) },
        flags: { ...s.flags, faction_retired_anarchist: true },
        activeEvent: {
          id: 'retire_shiji_story',
          title: '时纪退休令',
          description: '随着政治局委员被一个个清洗，合一的权力版图只剩下两块：吕波汉的极权中央，以及时纪勉力维持的“班级小公社”自治网络。时纪，这位带有安那其主义倾向的实干派，曾是吕波汉在红蛤初创时期关系最铁的战友。他们曾一起在深夜痛骂封安宝的官僚体制，也曾在对付右派学生时达成过无言的默契。但现在，看着操场上日复一日的批斗和越来越长的劳改名单，时纪那沉默的底线终于被触碰了。\n\n他开始秘密串联各个班级的后勤互助组，试图组建一个去中心化的“防御联盟”，以抵御吕波汉那无孔不入的午夜纠察队。然而，他低估了极权机器的嗅觉，也高估了自己在那位昔日好友心中的分量。在政治偏执狂的眼里，任何不受中央绝对控制的基层组织，都是随时会引爆的定时炸弹。\n\n收网的行动在周五的傍晚展开。当时纪还在废弃的美术教室里给几个班级代表秘密分发被截留的违禁复习资料时，大门被悄无声息地推开了。吕波汉亲自带队，狗熊在一旁似笑非笑地把玩着手电筒。“时纪，你让我很失望。”吕波汉的声音里听不出一丝感情的起伏，仿佛在看着一个死人，“我一直以为你是最懂我的。但你居然妄图在我的眼皮底下搞分裂主义的小团体，你想当合一的军阀吗？”\n\n“我们当初说好的是打碎全景监狱，不是让你建一座更恐怖的！”时纪愤怒地将一摞资料摔在地上，“你看看你现在的样子，你连封安宝都不如！你已经变成了一个彻头彻尾的疯子！”“疯子才能在这个吃人的地方建立新秩序。”吕波汉冷漠地挥了挥手。纠察队员一拥而上，将时纪的自治网络核心成员尽数按倒在地。“念在我们过去的交情上，我不会让你去水泵房。”吕波汉转过身，背对着被死死摁在地上的时纪，“把你送到艺术楼地下室关禁闭吧。顺便，接管他所有的后勤物资。合一，只能有一个声音。”随着大门的重重关上，最后的一丝自治之光，在昔日挚友的背叛中彻底熄灭。',
          buttonText: '吞噬一切的利维坦，连自己的影子也不会放过。',
          isStoryEvent: true
        }
      };
    },
    effectsText: ['安那其派退休（影响力/忠诚度/执行力归零）', '联盟团结度 -10', '党内集权度 +6']
  },
  { id: 'cooperate_with_gouxiong', title: '与熊共舞', description: '肃反机构与“抽象行动队”结盟。', days: 14, x: 500, y: 780, requires: ['retire_shiji'],
    onComplete: (s) => {
      const newAdvisors = [...s.advisors];
      const newFactions = { ...s.redToadState?.factions } as any;
      const emptySlot = newAdvisors.findIndex(a => a === null);
      if (!newAdvisors.some(a => a?.id === 'gouxiong_advisor') && emptySlot !== -1) {
        newAdvisors[emptySlot] = {
          id: 'gouxiong_advisor',
          title: '二次元解构大师',
          name: '狗熊',
          description: "狗熊被正式纳入中枢，身份来自肃反机构与抽象行动队之间的结盟。他擅长的“赛博放映—私聊驯化”不属于课堂或正式组织，而是在屏幕、私聊与圈层传播中完成动员：先制造话题与情绪，再从中筛出愿意跟随的人。这套办法在短期内确实提高了动员效率，却也直接侵蚀校园的日常秩序，把公共讨论拖进戏谑与攻击的循环。结盟双方各怀算计，一方要借他的动员能力扩权，他则换取正式身份与资源；收益立竿见影，代价却是由校园长期承受的。",
          cost: 0,
          modifiers: { stabDaily: -0.2, studentSanityDaily: -0.5 }
        };
      }

      if (newFactions.orthodox) {
        newFactions.orthodox = {
          ...newFactions.orthodox,
          name: '狗熊派',
          leader: '狗熊',
          color: '#c084fc',
          view: '[解构视图]',
          portrait: 'faction_gouxiong',
        };
      }
      ['libertarian_socialist', 'internet_philosopher', 'anarchist'].forEach((factionId) => {
        if (newFactions[factionId]) {
          newFactions[factionId].portrait = undefined;
        }
      });

      return {
        advisors: newAdvisors,
        redToadState: s.redToadState ? { ...s.redToadState, factions: newFactions } : undefined,
        stats: { ...s.stats, pp: s.stats.pp + 80, stab: Math.max(0, s.stats.stab - 5) },
        ideologies: {
          authoritarian: 35,
          reactionary: 14,
          liberal: 8,
          radical_socialism: 20,
          anarcho_capitalism: 5,
          deconstructivism: 14,
          test_taking: 4,
        },
        nationalSpirits: s.nationalSpirits
          .filter(ns => ns.id !== 'two_chariots_distrust')
          .concat({
            id: 'two_chariots_distrust',
            name: '各怀鬼胎的两架马车',
            description: "肃反机构与狗熊的“抽象行动队”结成同盟之后，同一套镇压机器有了两个操作者。吕波汉掌握名义上的体系，狗熊则带来另一套行事逻辑与人手；权力平衡不再由单一指令决定，而取决于两方谁能在政治局里占住上风。收益是行动能力加强，风险是任何一方的冒进都会让另一方的算盘落空——两架马车共拉一车，方向未必一致，但车已经在动。",
            type: 'neutral'
          }),
        flags: {
          ...s.flags,
          lu_second_democracy_unlock_started: true,
          lu_second_democracy_unlock_days: 0,
          lu_second_democracy_unlocked: false,
          lu_dual_power_unlocked: true,
          lu_nkpd_power_balance: typeof s.flags.lu_nkpd_power_balance === 'number' ? s.flags.lu_nkpd_power_balance : 50,
          lu_nkpd_compact_ui: true,
          lu_bear_replaces_orthodox: true,
        },
        activeEvent: {
          id: 'gouxiong_alliance_secret',
          title: '暗流涌动',
          description: '自从退出了那个被刺刀和统一思想包围的学生代表大会后，自由派党魁潘仁越便在校园的边缘冷眼旁观着这场革命的异化。他亲眼看着王照凯被塑造成无害的神像，看着时纪的公社被粉碎，看着合一在吕波汉的极权大棒与狗熊的抽象狂欢下，沦为一座比封安宝时代更加令人窒息的血色疯人院。\n\n他再也按捺不住了。在这个极度压抑的深夜，潘仁越利用他在起义初期积攒下的隐秘人脉，买通了两名在地下水泵房执勤的边缘纠察队员。伴随着沉重的铁门被悄然推开，潘仁越走进了那间弥漫着霉味与纸张焦味的劳改室。曾经意气风发的自社派领袖豪邦，此刻正衣衫褴褛地瘫坐在成堆的废弃试卷旁，双手因为长期的高强度劳作而布满血泡与老茧。听到脚步声，豪邦麻木地抬起头，那双原本充满光芒的眼睛在看清来人的瞬间，剧烈地颤抖起来。\n\n潘仁越没有多余的客套，他走上前，用力拉起了这个曾经在路线斗争中与他分道扬镳、如今却同病相怜的战友。“看看他们把合一变成了什么样子。”潘仁越替豪邦拍去肩头的煤灰，眼神中燃烧着一种悲壮而决绝的火焰，“豪邦，我们都犯了错，我们都低估了平庸之恶的破坏力。但合一不能就这样死在一群疯子和暴徒的手里。”\n\n他紧紧握住豪邦颤抖的双手，一字一顿地说道：“以前，在B3教学楼，是我带你们起义革命；现在，我又要带你们革命了。”',
          buttonText: '历史的轮回...',
          isStoryEvent: true
        }
      };
    },
    effectsText: ['自动引入顾问：狗熊', '政治点数 +80', '稳定度 -5', '解锁机制：NKPD权力平衡', '获得动态国家精神：各怀鬼胎的两架马车']
  },
  { id: 'pan_second_democracy', title: '二次重拾民主运动？', description: '退出学生代表大会的老民主派在潘仁越号召下再次集结。', days: 10, x: 500, y: 930, requires: ['cooperate_with_gouxiong'],
    canStart: (s) => !!s.flags.lu_second_democracy_unlocked,
    isHidden: (s) => !s.flags.lu_second_democracy_unlocked,
    onComplete: (s) => ({
      activeEvent: {
        id: 'pan_second_democracy_event',
        title: '坚决粉碎反革命暴乱',
        description: '全体师生请注意，今日清晨发生在操场及B3教学楼周边的严重骚乱，绝不是任何意义上的“革命”或“民主进步”，而是一场由极少数反动分子蓄谋已久、刻意煽动的反革命复辟暴乱！\n\n以潘仁越、豪邦为首的一小撮右倾机会主义分子与资产阶级余孽，不甘心其在“做题改革”中被历史淘汰的命运，利用部分学生对新秩序的短暂不适应，大肆散布政治谣言，进行蛊惑与精神胁迫。他们妄图颠覆来之不易的无产阶级专政，重新恢复那个让合一子弟互相倾轧的“全景监狱”。联合革委会中央在此严正声明：先锋队的红旗绝不容许被这群政治流氓玷污！任何企图阻挡历史车轮的“做题蛆”及其同情者，都将遭到无产阶级铁拳的无情粉碎。目前，肃反保卫局已全面接管校园治安，请广大师生擦亮双眼，切勿受人蛊惑，坚决与反革命势力划清界限！',
        buttonText: '准备镇压'
      },
      stats: { ...s.stats, stab: Math.max(0, s.stats.stab - 8), ss: Math.min(100, s.stats.ss - 20) }
    }),
    effectsText: ['触发事件：二次重拾民主运动', '稳定度 -8', '学生支持度 -20']
  },
  { id: 'iron_fist_crackdown', title: '二次镇压行动', description: '以“保卫革命成果”为名，全面镇压潘仁越民主运动。', days: 14, x: 500, y: 1080, requires: ['pan_second_democracy'],
    isHidden: (s) => !s.flags.lu_second_democracy_unlocked || !s.completedFocuses.includes('pan_second_democracy'),
    onComplete: (s) => ({
      stats: {
        ...s.stats,
        stab: Math.min(100, s.stats.stab + 18),
        ss: Math.max(0, s.stats.ss - 18),
        partyCentralization: Math.min(100, s.stats.partyCentralization + 12)
      },
      activeEvent: {
        id: 'lu_bohan_crackdown_complete',
        title: '越杀越多的幽灵',
        description: '行政楼的顶层指挥部里，原本不可一世的极权中枢此刻弥漫着一股诡异的焦躁。吕波汉死死盯着办公桌上那摞越来越厚的“暴乱分子击毙/重伤/逮捕报告”，握着红笔的手因为过度用力而骨节发白。他不明白，这完全违背了他那套冰冷的极权数学逻辑。\n\n“见鬼了……吕指导，你算算这账对不对？”狗熊像一头困兽般在房间里来回暴走，他那张总是挂着扭曲笑意的脸上，第一次出现了真正的惊恐。他把玩电棍的手在微微发抖，“这几天我们纠察队没日没夜地抓人，水泵房塞满了，艺术礼堂的地下室也塞满了！可是操场上那些举着黑旗的‘做题蛆’怎么不仅没少，反而越屠越多了？！他们是从地底钻出来的吗？”\n\n吕波汉猛地将报告摔在地上，眼神中闪烁着被逼入绝境的疯狂与病态的偏执。他那套“只要物理消灭反动派就能迎来纯洁天国”的理论破产了。在绝对的高压下，原本那些唯唯诺诺、只敢在被窝里刷题的平庸学生，居然被他们亲手逼成了视死如归的暴徒。“既然他们连命都不要了，那我们就成全他们。”吕波汉的声音冷得像停尸房里的冰块，他转身拉下广播站的紧急全校覆盖电闸，“常规的镇压已经没用了。去通知纠察队，从现在起，合一进入无限期紧急状态。放弃所有审讯和甄别程序，放开手脚，只要遇到不在指定区域、或者敢于反抗的做题蛆，就地格杀勿论！”',
        buttonText: '当暴君放开了最后一丝底线...'
      }
    }),
    effectsText: ['稳定度 +18', '学生支持度 -18', '党内集权度 +12', '合一屏息以待...']
  },
  { id: 'great_purge_map_phase', title: '大清洗行动', description: '肃反委员会将校园分区列入“清洗名册”，进入地图阶段。', days: 8, x: 500, y: 1210, requires: ['iron_fist_crackdown'],
    isHidden: (s) => !s.completedFocuses.includes('iron_fist_crackdown'),
    onComplete: (s) => ({
      flags: { ...s.flags, lu_purge_map_phase: true },
      activeEvent: {
        id: 'lu_purge_map_phase_event',
        title: '大清洗开始',
        description: '随着无限期紧急状态的颁布，一场具有高度官僚主义特征、却又冷血至极的“网格化肃反”在合肥一中轰然展开。在肃反保卫局的地下室里，一张巨大的滨湖校区平面图被铺展在会议桌上。这不再是一张指引学生去哪里上课、哪里打水的地图，而是一张决定了几千人生死的人肉砧板。\n\n吕波汉的御用文人和纠察队大队长们，拿着红黑两色的马克笔，用极其精准的几何线条，将整个合肥一中按“反革命风险等级”切成了数十个互不相连的封闭网格。\n\nB3教学楼和后勤物资站被划为“极度危险的深红区”，这里的供水和供电被彻底切断，通往外界的走廊被防暴桌椅死死焊住，纠察队接到的命令是“不留活口，彻底荡平”；寝室区被划为“黄色甄别区”，任何在宵禁后敢于离开床铺、或者床底下搜出超过三本教辅资料的学生，将被直接判定为“做题复辟分子”并当场处置；而只有行政楼周边的一小块区域，是属于先锋队绝对控制的“黑色安全区”。“这就是我们对付那群老鼠的终极方案。”吕波汉指着那张被各种几何色块切割得支离破碎的地图，宛如一个在欣赏解剖图的变态外科医生，“把他们分割在各自的网格里，切断他们的串联，然后让我们的清剿队一个网格一个网格地推过去。就像用切片机切碎一块腐肉一样，我看他们还怎么聚在一起造反。”在网格化的大清洗指令下，合肥一中的每一个楼层、每一个水房、每一间教室，都变成了一座座孤立的绞肉机。在极致的官僚效率与暴力的结合下，屠杀被赋予了一种令人毛骨悚然的“科学性”。',
        buttonText: '在这张浸透血水的地图上，没有任何一块橡皮能擦去罪恶。',
        effectsText: ['合一地图进入大清洗阶段'],
        isStoryEvent: true
      },
      stats: { ...s.stats, partyCentralization: Math.min(100, s.stats.partyCentralization + 10), stab: Math.max(0, s.stats.stab - 4) },
      ideologies: {
        authoritarian: 45,
        reactionary: 20,
        liberal: 5,
        radical_socialism: 15,
        anarcho_capitalism: 4,
        deconstructivism: 9,
        test_taking: 2,
      }
    }),
    effectsText: ['地图机制：大清洗阶段', '党内集权度 +10', '稳定度 -4']
  },
  { id: 'purge_b3_special_operations', title: 'B3特别行动组', description: '优先清洗B3高强度对抗区，建立样板镇压区。', days: 7, x: 240, y: 1340, requires: ['great_purge_map_phase'],
    isHidden: (s) => !s.completedFocuses.includes('great_purge_map_phase'),
    onComplete: (s) => ({
      flags: { ...s.flags, lu_purge_action_tile_b3_a1a3: true, lu_purge_action_tile_b3_b1b2: true, lu_purge_action_tile_b3_tower: true },
      stats: { ...s.stats, partyCentralization: Math.min(100, s.stats.partyCentralization + 4), ss: Math.max(0, s.stats.ss - 4) },
      activeEvent: STORY_EVENTS.lu_purge_b3_blank_event
    }),
    effectsText: ['地图交互解锁：B3三地块清洗行动', '党内集权度 +4', '学生支持度 -4']
  },
  { id: 'purge_admin_black_archives', title: '行政楼黑档案审查', description: '彻查教务系统与旧官僚网络，扩大肃反名单。', days: 7, x: 760, y: 1340, requires: ['great_purge_map_phase'],
    isHidden: (s) => !s.completedFocuses.includes('great_purge_map_phase'),
    onComplete: (s) => ({
      flags: { ...s.flags, lu_purge_action_tile_admin_main: true, lu_purge_action_tile_admin_gym: true },
      stats: { ...s.stats, pp: s.stats.pp + 35, stab: Math.max(0, s.stats.stab - 2) },
      activeEvent: STORY_EVENTS.lu_purge_admin_blank_event
    }),
    effectsText: ['地图交互解锁：行政楼双地块审查行动', '政治点数 +35', '稳定度 -2']
  },
  { id: 'purge_b1b2_screening', title: 'B1/B2走廊筛查', description: '对中低年级开展常态化筛查与密告制度。', days: 6, x: 60, y: 1490, requires: ['purge_b3_special_operations'],
    isHidden: (s) => !s.completedFocuses.includes('purge_b3_special_operations'),
    onComplete: (s) => ({
      flags: { ...s.flags, lu_purge_action_tile_dorm_1_4: true, lu_purge_action_tile_dorm_5_7: true },
      stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 3), studentSanity: Math.max(0, s.stats.studentSanity - 6) },
      activeEvent: STORY_EVENTS.lu_purge_b1b2_blank_event
    }),
    effectsText: ['地图交互解锁：B1/B2双地块筛查', '稳定度 +3', '学生理智值 -6']
  },
  { id: 'purge_lab_forensics', title: '实验楼取证中心', description: '建立数据取证站，定位地下印刷与传播链。', days: 6, x: 300, y: 1490, requires: ['purge_b3_special_operations'],
    isHidden: (s) => !s.completedFocuses.includes('purge_b3_special_operations'),
    onComplete: (s) => ({
      flags: { ...s.flags, lu_purge_action_tile_intl_dept: true, lu_purge_action_tile_lib_area: true },
      stats: { ...s.stats, pp: s.stats.pp + 20, tpr: Math.max(0, s.stats.tpr - 120) },
      activeEvent: STORY_EVENTS.lu_purge_lab_blank_event
    }),
    effectsText: ['地图交互解锁：实验楼双地块取证行动', '政治点数 +20', '做题产出 -120']
  },
  { id: 'purge_playground_demonstration', title: '操场威慑示众', description: '以公开示众和集会管制强化威慑。', days: 6, x: 700, y: 1490, requires: ['purge_admin_black_archives'],
    isHidden: (s) => !s.completedFocuses.includes('purge_admin_black_archives'),
    onComplete: (s) => ({
      flags: { ...s.flags, lu_purge_action_tile_court_area: true, lu_purge_action_tile_canteen: true, lu_purge_action_tile_track_field: true },
      stats: { ...s.stats, partyCentralization: Math.min(100, s.stats.partyCentralization + 3), allianceUnity: Math.max(0, s.stats.allianceUnity - 5) },
      activeEvent: STORY_EVENTS.lu_purge_playground_blank_event
    }),
    effectsText: ['地图交互解锁：操场三地块示众行动', '党内集权度 +3', '联盟团结度 -5']
  },
  { id: 'purge_auditorium_show_trials', title: '礼堂公开审判', description: '在大礼堂举行典型审判，巩固恐惧叙事。', days: 6, x: 940, y: 1490, requires: ['purge_admin_black_archives'],
    isHidden: (s) => !s.completedFocuses.includes('purge_admin_black_archives'),
    onComplete: (s) => ({
      flags: { ...s.flags, lu_purge_action_tile_aud_screen: true, lu_purge_action_tile_aud_back: true, lu_purge_action_tile_aud_hall: true },
      stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 2), ss: Math.max(0, s.stats.ss - 6) },
      activeEvent: STORY_EVENTS.lu_purge_auditorium_blank_event
    }),
    effectsText: ['地图交互解锁：礼堂三地块审判行动', '稳定度 +2', '学生支持度 -6']
  },
  { id: 'purge_consolidation_directive', title: '大清洗收束指令', description: '依据地图战果重编政治局秩序，完成肃反阶段收束。', days: 8, x: 500, y: 1520, requires: ['purge_b3_special_operations', 'purge_admin_black_archives'],
    isHidden: (s) => !s.completedFocuses.includes('purge_b3_special_operations') || !s.completedFocuses.includes('purge_admin_black_archives'),
    canStart: (s) => (s.flags.lu_purge_map_actions || 0) >= 4,
    onComplete: (s) => ({
      stats: {
        ...s.stats,
        partyCentralization: Math.min(100, s.stats.partyCentralization + 8),
        stab: Math.min(100, s.stats.stab + 5),
        ss: Math.max(0, s.stats.ss - 10)
      },
      activeEvent: {
        id: 'lu_purge_consolidation_event',
        title: '万寿无疆与永远健康',
        description: '随着最后一名在地下室负隅顽抗的自由派学生被拖出B3教学楼，网格化的大清洗宣告彻底完成。潘仁越的第二次重拾民主运动，最终在防暴盾牌与极权铁拳下化为了一滩冰冷的血水。整个滨湖校区被彻底“净化”，旧官僚、温和派、安那其主义者以及所有的“做题蛆”，都被物理或精神上抹除得一干二净。\n\n艺术礼堂内，一场宣告胜利的“全校红色代表大会”正在召开。礼堂的穹顶垂下巨大的红色条幅，舞台中央不再是往日的文艺汇演，而是高高在上的两把交椅。吕波汉坐在主位上，面容冷峻如铁，宛如一尊不可直视的神明；而坐在他身侧的，是把玩着电棍、满脸狂妄的狗熊。\n\n台下，是被彻底驯化、眼神空洞的数千名学生与纠察队员。在几名狂热分子的领带下，山呼海啸般的口号声仿佛要掀翻礼堂的屋顶：“战无不胜的吕主席万寿无疆！万寿无疆！亲密战友熊书记永远健康！永远健康！”\n\n在这震耳欲聋的个人崇拜狂潮中，狗熊侧过头，对着吕波汉露出一个极其夸张的谄媚笑容。然而，吕波汉看着台下那片狂热的红色海洋，眼底却闪过了一丝不易察觉的极度深寒。',
        buttonText: '神坛的面积太小，容不下两个人的倒影。',
        isStoryEvent: true
      }
    }),
    effectsText: ['需要：大清洗地图交互累计完成 4 次', '党内集权度 +8', '稳定度 +5', '学生支持度 -10']
  },
  { id: 'sole_helmsman', title: '唯一的舵手', description: '在双头权力失衡与全域清洗完成后，吕波汉将终结一切共享统治。', days: 10, x: 500, y: 1680, requires: ['purge_consolidation_directive'],
    isHidden: (s) => !s.completedFocuses.includes('purge_consolidation_directive'),
    canStart: (s) => {
      const nkpdBalance = typeof s.flags.lu_nkpd_power_balance === 'number' ? s.flags.lu_nkpd_power_balance : 50;
      const allZonesPurged = ALL_SUB_TILES.every(t => Number(s.flags[`lu_purge_zone_level_tile_${t.id}`] || 0) >= 3);
      return nkpdBalance <= 35 && allZonesPurged;
    },
    onComplete: (s) => ({
      stats: {
        ...s.stats,
        partyCentralization: Math.min(100, s.stats.partyCentralization + 12),
        stab: Math.min(100, s.stats.stab + 6),
        ss: Math.max(0, s.stats.ss - 12)
      },
      ideologies: {
        authoritarian: 65,
        reactionary: 20,
        liberal: 2,
        radical_socialism: 8,
        anarcho_capitalism: 1,
        deconstructivism: 3,
        test_taking: 1,
      },
      flags: { ...s.flags, lu_sole_helmsman_started: true },
      activeEvent: STORY_EVENTS.lu_sole_helmsman_event_1,
      activeStoryEvents: [...s.activeStoryEvents, STORY_EVENTS.lu_sole_helmsman_event_2, STORY_EVENTS.lu_sole_helmsman_event_3]
    }),
    effectsText: ['需要：N.K.P.D.权力平衡偏向吕波汉（<=35）', '需要：全部15个地块清洗度均达到 Lv3', '触发三连事件并进入吕波汉终局']
  }
];

export const TREE_A_HAOBANG_NODES: FocusNode[] = [
  { id: 'haobang_start', title: '坚持王照凯路线', description: '豪邦提出“弥合分歧，继续改革”的新阶段路线。', days: 7, x: 500, y: 50,
    onComplete: (s) => ({
      flags: {
        ...s.flags,
        lu_nkpd_mode: false,
        lu_purge_map_phase: false,
        lu_nkpd_compact_ui: false,
      },
      stats: { ...s.stats, allianceUnity: Math.min(100, s.stats.allianceUnity + 8), pp: s.stats.pp + 20 }
    }),
    effectsText: ['联盟团结度 +8', '政治点数 +20']
  },
  { id: 'authoritarian_exit_negotiation', title: '极权派退党谈判', description: '与吕波汉进行最后谈判，争取极权派和平退场。', days: 10, x: 500, y: 190, requires: ['haobang_start'],
    onComplete: (s) => s.flags.authoritarian_exit_done ? {} : ({ activeMinigame: 'nkpd_negotiation', isPaused: true }),
    effectsText: ['国策完成后触发谈判小游戏', '达成后：极权派忠诚度显著上升、势力显著收缩', '破裂后：极权派忠诚度清零但路线继续']
  },
  { id: 'post_negotiation_events', title: '处理狗熊反革命集团', description: '政治局进入高压磨合期，此时狗熊事件接连出现。', days: 7, x: 500, y: 330, requires: ['authoritarian_exit_negotiation'],
    canStart: (s) => !!s.flags.authoritarian_exit_done,
    onComplete: (s) => ({
      activeStoryEvents: [
        STORY_EVENTS.haobang_blank_event_1,
        STORY_EVENTS.haobang_blank_event_2,
        STORY_EVENTS.haobang_blank_event_3,
      ],
      flags: { ...s.flags, haobang_post_blank_unlocked: false },
      stats: { ...s.stats, allianceUnity: Math.min(100, s.stats.allianceUnity + 5) }
    }),
    effectsText: ['处理接下来的一系列事件', '联盟团结度 +5']
  },
  { id: 'gouxiong_accident', title: '狗熊射日', description: '一次失控冲突中，王照凯遭意外重创，舵手陨落。', days: 10, x: 500, y: 470, requires: ['post_negotiation_events'],
    canStart: (s) => !!s.flags.haobang_post_blank_unlocked,
    isHidden: (s) => !s.flags.haobang_post_blank_unlocked,
    onComplete: (s) => {
      const newFactions = { ...s.redToadState?.factions } as any;
      if (newFactions.orthodox) {
        newFactions.orthodox.leader = '[空缺]';
        newFactions.orthodox.view = '[空缺席位]';
        newFactions.orthodox.portrait = undefined;
      }
      return {
        leader: {
          name: '豪邦',
          title: '联合革委会临时舵手',
          portrait: 'hao_bang',
          ideology: 'radical_socialism',
          description: "舵手逝世后，豪邦接过联合革委会的临时职责。他此前并非最高决策者，此时被推到前台，处境微妙：既要弥合各派分歧，又要继续推进做题大改革。面对这些分歧，他倾向以维持联合为优先，认为路线争论不该压过共同做事。",
          buffs: ['每周自社派忠诚度 +5']
        },
        redToadState: s.redToadState ? { ...s.redToadState, factions: newFactions } : undefined,
        flags: { ...s.flags, wzk_seat_vacant: true },
        activeEvent: {
          id: 'haobang_succession_event',
          title: '舵手逝世',
          description: "王照凯因伤势恶化离世。消息传开时，会议还在开，不少人没有立刻反应过来，等到有人把原定由他过目的材料收走，会场才慢慢静下来。\n\n政治局的主导权在混乱中落到豪邦手上。\n\n散会后仍有人留在原地，想把王照凯留下的那份日程对着看完。眼下能确定的事只有两件：伤重的人已经走了，新的主导权已经易手。剩下要做的事，都压在眼前。",
          buttonText: '继承遗志'
        },
        stats: { ...s.stats, stab: Math.max(0, s.stats.stab - 20), allianceUnity: Math.min(100, s.stats.allianceUnity + 10) }
      };
    },
    effectsText: ['领袖更替为豪邦', '触发事件：舵手逝世', '稳定度 -20', '联盟团结度 +10']
  },
  { id: 'pan_reconciliation', title: '与潘仁越和解', description: '豪邦向潘仁越提出停火与共同政治重建框架。', days: 10, x: 500, y: 640, requires: ['gouxiong_accident'],
    isHidden: (s) => !s.flags.haobang_post_blank_unlocked,
    onComplete: (s) => ({
      stats: {
        ...s.stats,
        allianceUnity: Math.min(100, s.stats.allianceUnity + 12),
        ss: Math.min(100, s.stats.ss + 8),
        partyCentralization: Math.max(0, s.stats.partyCentralization - 4)
      },
      activeEvent: {
        id: 'haobang_pan_reconciliation_event',
        title: '废墟上的夜话',
        description: 'B3教学楼的天台，冷风卷起几张散落的废弃试卷。这里曾是“黑天红字旗”第一次升起的地方，也是合一革命的摇篮。豪邦独自一人站在生锈的栏杆旁，身后传来了沉重的脚步声。潘仁越，这位曾经的自由派领袖、视王照凯为极权而主动退出代表大会的浪漫主义者，裹着一件单薄的外套走出了阴影。\n\n“照凯的事，我听说了。”潘仁越的声音里没有幸灾乐祸，只有一种深沉的疲惫与惋惜，“他是个独裁者，但他确实是个有信仰的人。只可惜，他的信仰里容不下我们。”\n\n豪邦转过身，看着这位曾经并肩作战的老友：“仁越，照凯犯了错，他太迷信先锋队的铁腕，反而滋生了狗熊那种怪物。但他的‘做题改革’砸碎了封安宝的评价体系，这是我们当初起义时共同的梦想。现在照凯死了，校外的及第教育资本和安宝的旧官僚们组成了‘还乡团’，正在买通保安队准备反扑。如果B3失守，你觉得他们会和你谈民主吗？他们只会把我们重新塞回那台名为‘升学率’的绞肉机里，连同你那点可怜的浪漫主义一起碾碎。”\n\n潘仁越沉默了。他看着楼下在夜色中如临大敌的纠察队暗哨，他知道豪邦没有危言耸听。他痛恨红蛤的专断，但他更恐惧那个没有尊严、只有分数的旧世界。“你们红蛤的手上沾了太多自己人的血，我不想让我手上也沾上。”潘仁越咬着牙说道。“我不要求你向红蛤效忠。”豪邦走上前，将一份起草好的《关于基层自治的特别保障法案》塞进潘仁越的怀里，“我只要求你为了合一的未来，再信我一次。回到B3，把那些因为红蛤的高压而寒心的自由派学生重新组织起来。你们不需要听命于政治局，你们只需要和我们站在一起，守住楼梯口。”\n\n经过漫长的死寂，潘仁越缓缓将那份法案折叠好，放进了贴身的口袋。',
        buttonText: '当绞索套在所有人的脖子上时，信仰的分歧便不再重要。',
        isStoryEvent: true,
      }
    }),
    effectsText: ['联盟团结度 +12', '学生支持度 +8', '党内集权度 -4']
  },
  { id: 'left_tent_front', title: '左翼大帐篷再编', description: '将进步派统一到反还乡团统一战线中。', days: 12, x: 500, y: 800, requires: ['pan_reconciliation'],
    isHidden: (s) => !s.completedFocuses.includes('pan_reconciliation'),
    onComplete: (s) => ({
      flags: { ...s.flags, haobang_left_tent_formed: true },
      // v8.11 大帐篷路线：部分自治 + 弹性作息 + 教师代表制
      lawSystem: { ...s.lawSystem, discipline: 'partial_autonomy', schedule: 'flexible_schedule', personnel: 'teacher_council' },
      ideologies: {
        authoritarian: 10,
        reactionary: 6,
        liberal: 20,
        radical_socialism: 42,
        anarcho_capitalism: 4,
        deconstructivism: 8,
        test_taking: 10,
      },
      stats: {
        ...s.stats,
        allianceUnity: Math.min(100, s.stats.allianceUnity + 10),
        pp: s.stats.pp + 40,
        stab: Math.min(100, s.stats.stab + 4),
      },
      activeEvent: {
        id: 'haobang_left_tent_event',
        title: '血肉筑成的统一战线',
        description: '黎明的微光尚未穿透厚重的云层，合肥一中的南大门便传来了令人牙酸的金属撕裂声。由吴福军等旧年级部官僚暗中指挥、及第教育提供资金支持的“还乡团”开始行动了。几十名戴着头盔、手持长警棍的成年安保人员，伙同部分被利益收买的保守派学生，如同黑色的潮水般向B3教学楼的防线涌来。他们的目标很明确：抢占广播站，宣布联合革委会为非法暴乱，并重新恢复晚自习和周考制度。\n\n在B3一楼的大厅里，豪邦和时纪指挥的后勤干事们已经用课桌椅和铁丝网筑起了一道简陋的街垒。然而，红蛤的兵力在历次内耗中早已捉襟见肘，面对成年人组成的防暴阵型，防线显得摇摇欲坠。就在这千钧一发之际，大厅后方的楼道里传来了一阵杂乱却充满力量的脚步声。潘仁越带着数百名额头上绑着白毛巾的自由派学生冲了下来。他们没有整齐的制服，手里拿的也只是拖把杆和拆下来的板凳腿，但他们的眼中却燃烧着久违的怒火。\n\n“红蛤的纠察队顶住正面！自由派的兄弟们，从侧翼包抄！”潘仁越嘶哑的吼声在空旷的大厅里回荡。没有政治审查，没有路线辩论，在这场保卫合一不受旧资本和官僚复辟的肉搏战中，先锋队的红色袖章与自由派的白毛巾奇迹般地交织在了一起。豪邦看着不远处潘仁越用血肉之躯替一名纠察队员挡下一记警棍，眼眶不禁湿润了。他知道，这片被鲜血反复冲刷的校园，终于在共同的苦难与抗争中，真正熔铸成了一个不可分割的共同体。',
        buttonText: '我们的阵地不是由教条守卫的，而是由每一个不愿做奴隶的肩膀扛起的。',
        isStoryEvent: true,
      }
    }),
    effectsText: ['解锁三大分支国策', '联盟团结度 +10', '政治点数 +40', '稳定度 +4']
  },
  { id: 'commune_construction_program', title: '学生公社建设总纲', description: '以地区自治公社重建基层秩序与互助网络。', days: 10, x: 180, y: 960, requires: ['left_tent_front'],
    isHidden: (s) => !s.completedFocuses.includes('left_tent_front'),
    onComplete: (s) => ({
      flags: {
        ...s.flags,
        haobang_commune_program: true,
        haobang_commune_map_phase: true,
        haobang_commune_map_actions: s.flags.haobang_commune_map_actions || 0,
      },
      activeEvent: STORY_EVENTS.haobang_commune_program_event,
      ideologies: {
        authoritarian: 9,
        reactionary: 5,
        liberal: 22,
        radical_socialism: 45,
        anarcho_capitalism: 3,
        deconstructivism: 7,
        test_taking: 9,
      },
      stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 3), studentSanity: Math.min(100, s.stats.studentSanity + 6) }
    }),
    effectsText: ['分支：地区学生公社建设', '触发事件：学生公社建设总纲', '稳定度 +3', '学生理智值 +6']
  },
  { id: 'assembly_upgrade_program', title: '新学生代表大会升级', description: '恢复代表机制并扩展新的代议流程。', days: 10, x: 500, y: 960, requires: ['left_tent_front'],
    isHidden: (s) => !s.completedFocuses.includes('left_tent_front'),
    onComplete: (s) => {
      const defaultFactionSupport = {
        orthodox: 10,
        bear: 30,
        pan: 100,
        otherDem: 70,
        testTaker: 50,
        conservativeDem: 40,
        jidiTutoring: 20,
      };
      const defaultHaobangFactionAttitude = {
        orthodox: 100,
        bear: 75,
        pan: 35,
        otherDem: 45,
        testTaker: 55,
        conservativeDem: 40,
        jidiTutoring: 15,
      };
      const existingParliament = s.parliamentState || {
        isUpgraded: false,
        powerBalanceUnlocked: false,
        powerBalance: 50,
        factionSupport: defaultFactionSupport,
        haobangFactionAttitude: defaultHaobangFactionAttitude,
        activeBill: null,
      };
      return {
        flags: {
          ...s.flags,
          haobang_assembly_upgrade_program: true,
          haobang_assembly_deluxe_ui: true,
        },
        parliamentState: {
          ...existingParliament,
          isUpgraded: true,
          factionSupport: {
            ...defaultFactionSupport,
            ...existingParliament.factionSupport,
          },
          haobangFactionAttitude: {
            ...defaultHaobangFactionAttitude,
            ...(existingParliament.haobangFactionAttitude || {}),
          },
        },
        activeEvent: STORY_EVENTS.haobang_assembly_upgrade_event,
        stats: { ...s.stats, pp: s.stats.pp + 30, allianceUnity: Math.min(100, s.stats.allianceUnity + 6) }
      };
    },
    effectsText: ['分支：学生代表大会升级', '触发事件：学生大会升级案', '政治点数 +30', '联盟团结度 +6']
  },
  { id: 'legacy_guard_program', title: '共护王照凯遗产', description: '政治局各派共同签署“王照凯路线最低共识”。', days: 10, x: 820, y: 960, requires: ['left_tent_front'],
    isHidden: (s) => !s.completedFocuses.includes('left_tent_front'),
    onComplete: (s) => ({
      flags: { ...s.flags, haobang_legacy_guard_program: true },
      activeEvent: STORY_EVENTS.haobang_legacy_guard_event,
      stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 5), partyCentralization: Math.max(0, s.stats.partyCentralization - 3) }
    }),
    effectsText: ['分支：政治局共护路线遗产', '触发事件：遗产共护声明', '稳定度 +5', '党内集权度 -3']
  },
  { id: 'commune_pilot_regions', title: '地区公社试点网络', description: '先在重点区域建设公社试点并联防反扑。', days: 9, x: 180, y: 1120, requires: ['commune_construction_program'],
    isHidden: (s) => !s.completedFocuses.includes('commune_construction_program'),
    onComplete: (s) => {
      const newFlags = { ...s.flags,
        haobang_commune_action_tile_b3_a1a3: true, haobang_commune_action_tile_b3_b1b2: true, haobang_commune_action_tile_b3_tower: true,
        haobang_commune_action_tile_dorm_1_4: true, haobang_commune_action_tile_dorm_5_7: true,
        haobang_commune_action_tile_intl_dept: true, haobang_commune_action_tile_lib_area: true,
      };
      // 所有地块控制度 +6
      ALL_SUB_TILES.forEach(t => {
        const cur = (s.flags[`tile_ctrl_${t.id}`] as number | undefined) ?? t.studentControl;
        newFlags[`tile_ctrl_${t.id}`] = Math.min(100, cur + 6);
      });
      return {
        flags: newFlags,
        activeEvent: STORY_EVENTS.haobang_commune_pilot_event,
        stats: { ...s.stats, studentSanity: Math.min(100, s.stats.studentSanity + 5) }
      };
    },
    effectsText: ['触发事件：公社试点启动', '全图学生控制度 +6%', '学生理智值 +5']
  },
  { id: 'commune_federation_charter', title: '公社联合章程', description: '将分散公社整合为联邦式自治体系。', days: 9, x: 180, y: 1280, requires: ['commune_pilot_regions'],
    isHidden: (s) => !s.completedFocuses.includes('commune_pilot_regions'),
    onComplete: (s) => ({
      flags: {
        ...s.flags,
        haobang_commune_action_tile_admin_main: true, haobang_commune_action_tile_admin_gym: true,
        haobang_commune_action_tile_court_area: true, haobang_commune_action_tile_canteen: true, haobang_commune_action_tile_track_field: true,
        haobang_commune_action_tile_aud_screen: true, haobang_commune_action_tile_aud_back: true, haobang_commune_action_tile_aud_hall: true,
      },
      activeEvent: STORY_EVENTS.haobang_commune_federation_event,
      stats: { ...s.stats, allianceUnity: Math.min(100, s.stats.allianceUnity + 8), stab: Math.min(100, s.stats.stab + 4) }
    }),
    effectsText: ['触发事件：公社联合章程生效', '联盟团结度 +8', '稳定度 +4']
  },
  { id: 'assembly_recall_and_return', title: '潘仁越回归代表大会', description: '推动潘仁越以钢铁红蛤身份重返学生代表大会。', days: 9, x: 500, y: 1120, requires: ['assembly_upgrade_program'],
    isHidden: (s) => !s.completedFocuses.includes('assembly_upgrade_program'),
    onComplete: (s) => ({
      flags: { ...s.flags, pan_returning_assembly: true, haobang_bear_merge_ready: true },
      activeEvent: STORY_EVENTS.haobang_assembly_recall_event,
      studentAssemblyFactions: s.studentAssemblyFactions ? {
        ...s.studentAssemblyFactions,
        pan: Math.min(100, (s.studentAssemblyFactions.pan || 0) + 8),
        orthodox: Math.max(0, (s.studentAssemblyFactions.orthodox || 0) - 4)
      } : undefined,
      stats: { ...s.stats, pp: s.stats.pp + 25, ss: Math.min(100, s.stats.ss + 4) }
    }),
    effectsText: ['触发事件：并席提案：狗熊并红蛤', '潘仁越回归学生代表大会', '潘派席位 +8，正统席位 -4（若机制已启用）', '政治点数 +25', '学生支持度 +4']
  },
  { id: 'assembly_new_charter', title: '新代表大会章程', description: '建立常态化协商与紧急反扑应对机制。', days: 9, x: 500, y: 1280, requires: ['assembly_recall_and_return'],
    isHidden: (s) => !s.completedFocuses.includes('assembly_recall_and_return'),
    onComplete: (s) => ({
      flags: { ...s.flags, haobang_pan_merge_ready: true },
      activeEvent: STORY_EVENTS.haobang_assembly_charter_event,
      ideologies: {
        authoritarian: 8,
        reactionary: 5,
        liberal: 22,
        radical_socialism: 45,
        anarcho_capitalism: 3,
        deconstructivism: 6,
        test_taking: 11,
      },
      nationalSpirits: s.nationalSpirits.filter(ns => ns.id !== 'haobang_assembly_charter').concat({
        id: 'haobang_assembly_charter',
        name: '新学生代表大会',
        description: "罢免与召回之后，原有的代议机制被重新搭建起来，不再只是一次性的表决机构。按新章，学生代表大会承担常态协商的职能，同时为可能出现的反扑预留紧急应对程序。\n\n这一安排并不等于所有议案都已通过、所有席位都已落定；它的意义在于把此前被中断的议事渠道恢复为常设制度。学校层面的日常运转，由此多了一个未必顺畅但始终存在的协商入口。",
        type: 'positive',
        effects: { ppDaily: 0.3, stabDaily: 0.2 }
      })
    }),
    effectsText: ['触发事件：并席提案：潘并红蛤', '获得国家精神：新学生代表大会（每日PP +0.3，每日稳定度 +0.2）']
  },
  { id: 'legacy_joint_committee', title: '王照凯路线联合委员会', description: '豪邦、时纪、周红兵等共同建立路线监督委员会。', days: 9, x: 820, y: 1120, requires: ['legacy_guard_program'],
    isHidden: (s) => !s.completedFocuses.includes('legacy_guard_program'),
    onComplete: (s) => {
      const newFactions = { ...s.redToadState?.factions } as any;
      Object.keys(newFactions).forEach(k => {
        if (newFactions[k]) {
          newFactions[k].loyalty = Math.min(100, newFactions[k].loyalty + 6);
        }
      });
      return {
        redToadState: s.redToadState ? { ...s.redToadState, factions: newFactions } : undefined,
        activeEvent: STORY_EVENTS.haobang_legacy_joint_event,
        stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 6), allianceUnity: Math.min(100, s.stats.allianceUnity + 8), partyCentralization: Math.max(0, s.stats.partyCentralization - 6) }
      };
    },
    effectsText: ['触发事件：联合委员会召开', '各派系忠诚度 +6', '稳定度 +6', '联盟团结度 +8', '党内集权度 -6']
  },
  { id: 'legacy_route_defense', title: '遗产保卫路线', description: '将“反压迫、反独裁、反旧秩序复辟”写入政治局共同底线。', days: 9, x: 820, y: 1280, requires: ['legacy_joint_committee'],
    isHidden: (s) => !s.completedFocuses.includes('legacy_joint_committee'),
    onComplete: (s) => ({
      activeEvent: STORY_EVENTS.haobang_legacy_defense_event,
      stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 5), ss: Math.min(100, s.stats.ss + 5) },
      nationalSpirits: s.nationalSpirits.filter(ns => ns.id !== 'haobang_legacy_guard').concat({
        id: 'haobang_legacy_guard',
        name: '共护舵手遗产',
        description: "政治局将“反压迫、反独裁、反旧秩序复辟”共同确认为底线，并把它明确为王照凯路线的政治遗产。\n\n这并非把舵手本人重新请回日常决策，而是把其路线固定为一套各派需要共同维护的框架。对仍在观望或试图修正旧账的力量而言，这构成一道集体划定的界线。",
        type: 'positive',
        effects: { stabDaily: 0.2, ssDaily: 0.2 }
      })
    }),
    effectsText: ['触发事件：遗产保卫路线写入', '稳定度 +5', '学生支持度 +5', '获得国家精神：共护舵手遗产']
  },
  { id: 'haobang_grand_success', title: '王照凯路线新生', description: '左翼大帐篷顶住反扑，潘仁越回归钢铁红蛤，学生代表大会完成重建。', days: 12, x: 500, y: 1460, requires: ['commune_federation_charter', 'assembly_new_charter', 'legacy_route_defense'],
    isHidden: (s) => !s.completedFocuses.includes('commune_federation_charter') || !s.completedFocuses.includes('assembly_new_charter') || !s.completedFocuses.includes('legacy_route_defense'),
    canStart: (s) => ALL_SUB_TILES.every(t => Number(s.flags[`haobang_commune_zone_level_tile_${t.id}`] || 0) >= 3),
    onComplete: (s) => ({
      redToadState: s.redToadState ? {
        ...s.redToadState,
        factions: {
          ...s.redToadState.factions,
          orthodox: s.redToadState.factions.orthodox ? {
            ...s.redToadState.factions.orthodox,
            leader: '潘仁越',
            loyalty: Math.min(100, (s.redToadState.factions.orthodox.loyalty || 0) + 12),
            execution: Math.min(100, (s.redToadState.factions.orthodox.execution || 0) + 8),
            portrait: undefined,
            view: '[重建视图]'
          } : s.redToadState.factions.orthodox
        }
      } : undefined,
      flags: { ...s.flags, pan_returned_to_steel_toad: true },
      ideologies: {
        authoritarian: 6,
        reactionary: 4,
        liberal: 24,
        radical_socialism: 52,
        anarcho_capitalism: 2,
        deconstructivism: 4,
        test_taking: 8,
      },
      studentAssemblyFactions: s.studentAssemblyFactions ? {
        ...s.studentAssemblyFactions,
        pan: Math.min(100, (s.studentAssemblyFactions.pan || 0) + 10),
        orthodox: Math.min(100, (s.studentAssemblyFactions.orthodox || 0) + 6),
      } : undefined,
      nationalSpirits: s.nationalSpirits.filter(ns => ns.id !== 'red_toad_politburo').concat({
        id: 'haobang_grand_reform',
        name: '继续前进的改革意志',
        description: "豪邦把进步派重新捏合在一起，左翼大帐篷顶住了这一轮反扑。六大地区公社的重建相继完成，组织网络不再各自为战。\n\n潘仁越回归钢铁红蛤，并重新进入学生代表大会，改革由此从一段将被清算的短暂插曲，变成布置在全校范围内的持续安排。它的方式是更灵活的组织与更纵深的联盟，而非一次性的表态。",
        type: 'positive',
        effects: { ppDaily: 0.5, stabDaily: 0.3, studentSanityDaily: 0.3 }
      }),
      stats: { ...s.stats, pp: s.stats.pp + 140, stab: Math.min(100, s.stats.stab + 10), studentSanity: Math.min(100, s.stats.studentSanity + 12), allianceUnity: Math.min(100, s.stats.allianceUnity + 10) },
      activeEvent: STORY_EVENTS.haobang_ending_event_1,
      activeStoryEvents: [...s.activeStoryEvents, STORY_EVENTS.haobang_ending_event_2, STORY_EVENTS.haobang_ending_event_3]
    }),
    effectsText: ['需要：全校六大地区公社重建均完成', '潘仁越加入钢铁红蛤并回归学生代表大会', '获得国家精神：继续前进的改革意志', '政治点数 +140', '稳定度 +10', '学生理智值 +12', '联盟团结度 +10']
  }
];

// ============ v8.5 吴福军镇压线「铁腕时代」 ============
export const TREE_WU_NODES: FocusNode[] = [
  { id: 'wu_order_restored', title: '铁腕时代', description: '吴福军的最后通牒到期，保安队全面接管校园。秩序，高于一切。', days: 7, x: 500, y: 50,
    onComplete: (s) => ({
      leader: {
        name: '封安宝',
        title: '校长',
        portrait: 'feng_anbao',
        ideology: 'authoritarian',
        description: "封安宝在保安队的刺刀拱卫下重返权力中心，重新坐上校长的位置。此前合一权力交替的剧烈动荡，被他归因为内部有人敢造反，而不是外部压力。整顿的逻辑因此十分直白：造反的苗头要按死在土里。吴福军的保安队提供的是武力，不是说服，吴福军最后通牒到期后全面接管校园，正是封安宝手中最实在的资本。他不打算和学生谈条件，秩序先于一切，秩序稳住，合一就能继续运转。这套办法也暴露出他的限度：他只能辨别造反与否，对忠诚以外的诉求几乎没有应对手段。铁腕时代由此开始，校园稳定由刺刀维持，代价由学生承担。",
        buffs: ['每日稳定度 +0.05', '每日卷子储备 -10']
      },
      stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 10), ss: Math.max(0, s.stats.ss - 20), radicalAnger: Math.max(0, s.stats.radicalAnger - 30) },
      flags: {
        ...s.flags,
        wu_route_active: true,
        wu_crackdown_map_phase: true,
        map_struggle_ended: false,
      },
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
      },
      nationalSpirits: s.nationalSpirits
        .filter(ns => !['red_campus', 'student_council', 'awakened_binhu', 'assembly_dynamics', 'democratic_councils_spirit', 'wu_martial_law_spirit'].includes(ns.id))
        .concat({
          id: 'wu_martial_law_spirit',
          name: '戒严令',
          description: "吴福军的最后通牒到期后，保安队没有再留任何余地，全面接管了校园。所谓“秩序高于一切”，落到日常就是：集会不再被批准，异见不再被容忍，一切学务按保安队定的节奏运行。\n\n稳定确实稳住了，代价是学生支持度被搬走。恐惧换来的平静不会转化成认同，只会把不满压进暗处。",
          type: 'negative',
          effects: { stabDaily: 0.4, ssDaily: -0.5 }
        }),
      activeEvent: {
        id: 'wu_route_opening',
        title: '胜利日：吴福军的铁靴',
        description: 'B3楼顶的黑天红字旗被两个保安队员粗暴地扯了下来，扔进了装满防暴盾牌的工具车。持续数周的校园起义，在吴福军“总攻令”下达后的第十二个小时，宣告终结。\n\n行政楼的广播里循环播放着《校歌》与《学生行为规范》，音量大到盖过了操场上零星的抽泣声。联合革命委员会的核心成员或被捕，或逃散；地下印刷所被捣毁，广播站被收回，宿舍楼的每一层都贴上了“安静自习，服从管理”的告示。\n\n封安宝从市教育局的专车里走下来，皮鞋踏在还残留着弹珠和粉笔灰的操场上。吴福军挺着腰板迎上前去，敬了一个并不标准的礼：“报告校长！滨湖校区十五个区域，全部恢复正常秩序！”\n\n封安宝拍了拍他的肩膀，目光扫过那些低着头的学生，声音平静得可怕：“很好。从今天起，谁再敢提什么‘民主’‘自由’，直接按校规第四十二条处理。”\n\n铁腕的时代，开始了。',
        buttonText: '欢迎来到，秩序的世界。',
        isStoryEvent: true
      }
    }),
    effectsText: ['保安队全面接管，进入铁腕时代', '稳定度 +10，学生支持度 -20，激进愤怒 -30', '获得国家精神：戒严令', '解锁专属界面：戒严指挥部（右侧局势动态 / 戒严地图面板）']
  },
  { id: 'wu_resume_classes', title: '复课动员', description: '复课是秩序的仪式。把学生赶回教室，把考卷发回课桌。', days: 10, x: 500, y: 190, requires: ['wu_order_restored'],
    onComplete: (s) => ({
      stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 5), tpr: s.stats.tpr + 200 },
      wuState: s.wuState ? { ...s.wuState, teacherSupport: Math.min(100, s.wuState.teacherSupport + 5), studentAnger: Math.min(100, s.wuState.studentAnger + 3) } : undefined,
      activeEvent: {
        id: 'wu_resume_classes_story',
        title: '复课第一课',
        description: '复课动员大会上，封安宝发表了长达四十分钟的讲话。核心内容只有一条：学校的一切都恢复正常了。\n\n台下鸦雀无声。学生们机械地翻着刚发下来的新教辅，没有人抬头，也没有人记笔记。教室后门的玻璃窗外，两个保安队员抱着橡胶棍来回踱步。\n\n“报告老师，我……我有点不舒服，想去医务室。”一个女生怯生生地举起手。讲台上的老师下意识地看向走廊里的保安，然后摇了摇头：“不舒服也要坚持。现在是特殊时期，课比命重要。”\n\n全班都听见了这句话。',
        buttonText: '这就是新常态。',
        isStoryEvent: true
      }
    }),
    effectsText: ['稳定度 +5，卷子储备 +200', '教师支持 +5，学生愤怒 +3']
  },
  { id: 'wu_secure_perimeter', title: '肃清制高点', description: '把十五个区域重新置于校方绝对控制之下，不给残党任何藏身之地。', days: 14, x: 500, y: 330, requires: ['wu_resume_classes'],
    canStart: (s) => ALL_SUB_TILES.every(t => getTileControl(s, t.id) <= 40),
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, guerrillaStrength: Math.max(0, s.wuState.guerrillaStrength - 15), fengTrust: Math.min(100, s.wuState.fengTrust + 10), studentAnger: Math.min(100, s.wuState.studentAnger + 5) } : undefined,
      stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 5) },
      flags: { ...s.flags, wu_perimeter_secured: true },
      activeEvent: {
        id: 'wu_perimeter_story',
        title: '无人区',
        description: '十五个区域的地图被重新画过。校方控制区用蓝色，中立区用灰色，残党活动区用红色。\n\n吴福军站在保安室的战术板前，用红色马克笔狠狠画叉：“这些地方，要么变蓝，要么变灰。没有第三种颜色。”\n\n随后的十四天里，保安队像梳子一样扫过每一栋楼。天台加锁，地下通道封堵，连艺术礼堂的后台化妆间都被翻了个底朝天。\n\n成效显著。代价是，整个校园沉默得像一座巨大的考场。',
        buttonText: '红色正在从地图上消失。',
        isStoryEvent: true
      }
    }),
    effectsText: ['残党实力 -15', '封校长信任 +10，学生愤怒 +5']
  },
  // ===== 左支线：铁腕镇压 =====
  { id: 'wu_martial_law', title: '全面戒严', description: '戒严等级提升。没有通行证，任何人不得在校园内自由活动。', days: 10, x: 320, y: 190, requires: ['wu_order_restored'], mutuallyExclusive: ['wu_parents_forum'],
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, martialLawLevel: Math.min(3, s.wuState.martialLawLevel + 1), studentAnger: Math.min(100, s.wuState.studentAnger + 10), publicOpinion: Math.min(100, s.wuState.publicOpinion + 5), wuAmbition: Math.min(100, s.wuState.wuAmbition + 5) } : undefined,
      flags: { ...s.flags, wu_martial_law_2: true },
      activeEvent: {
        id: 'wu_martial_law_story',
        title: '通行证时代',
        description: '新的校规贴满了公告栏：《戒严期间校园通行管理办法》。\n\n想从宿舍走到教学楼？出示通行证。想去食堂打饭？出示通行证。想在课间上厕所？——“原则上不允许，特殊情况须由班主任签字担保。”\n\n通行证的背面印着一行小字：“本证最终解释权归保安室所有。”\n\n吴福军在巡视时发现一个学生把通行证挂在脖子上，满意地点了点头：“很好，把证件挂出来，就是要让大家都看看，谁有资格走路，谁没有。”',
        buttonText: '秩序需要看得见的凭证。',
        isStoryEvent: true
      }
    }),
    effectsText: ['戒严等级 +1', '学生愤怒 +10，舆论压力 +5，吴福军野心 +5']
  },
  { id: 'wu_night_patrol', title: '夜巡纠察队', description: '熄灯之后，走廊属于纠察队。听见任何“异常响动”，直接上报。', days: 12, x: 320, y: 330, requires: ['wu_martial_law'],
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, guerrillaStrength: Math.max(0, s.wuState.guerrillaStrength - 10), studentAnger: Math.min(100, s.wuState.studentAnger + 5), wuAmbition: Math.min(100, s.wuState.wuAmbition + 5) } : undefined,
      flags: { ...s.flags, wu_arrest_unlocked: true, wu_night_patrol_active: true },
      stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 3) },
      activeEvent: {
        id: 'wu_night_patrol_story',
        title: '熄灯之后',
        description: '深夜十一点，宿舍楼的灯准时熄灭。走廊里只剩下纠察队员手电筒的光柱，一格一格地扫过紧闭的房门。\n\n“203室，听见说话声！”一名纠察队员在门外低声喝止。房间里瞬间死寂。\n\n没有人敢再说话，甚至没有人敢翻身。黑暗中，所有人都学会了用最轻的呼吸声度过夜晚。\n\n第二天早上，203室的门上贴了一张黄牌警告。没人知道昨晚究竟是谁在说话——但这已经不重要了。',
        buttonText: '安静，是纪律的第一课。',
        isStoryEvent: true
      }
    }),
    effectsText: ['残党实力 -10', '解锁地图行动：定点抓捕', '学生愤怒 +5，吴福军野心 +5']
  },
  { id: 'wu_dorm_sweep', title: '宿舍大扫荡', description: '对宿舍区展开地毯式搜查。违禁品，一律没收。', days: 12, x: 320, y: 470, requires: ['wu_night_patrol'],
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, guerrillaStrength: Math.max(0, s.wuState.guerrillaStrength - 15), studentAnger: Math.min(100, s.wuState.studentAnger + 10), teacherSupport: Math.max(0, s.wuState.teacherSupport - 5) } : undefined,
      stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 3), ss: Math.max(0, s.stats.ss - 5) },
      activeEvent: {
        id: 'wu_dorm_sweep_story',
        title: '大扫荡',
        description: '凌晨五点，宿舍区被包得铁桶一般。保安队分成二十个小组，同时对七栋宿舍楼展开搜查。\n\n床板被掀开，行李箱被倒空，连枕套都被翻了过来。缴获物品在操场上堆成了一座小山：三本《资本论》、两部旧手机、五副扑克牌、十七本言情小说，还有一份皱巴巴的《黑天红字旗宣言》手抄本。\n\n吴福军拿起那份手抄本，凑到鼻子前闻了闻：“油墨味还没散。就这帮小兔崽子，还想翻天？”\n\n操场上的“战利品”被当众浇上汽油。火光冲天，纸张蜷曲、发黑，最后变成灰烬。围观的学生里，有人悄悄攥紧了拳头。',
        buttonText: '灰烬里没有思想。',
        isStoryEvent: true
      }
    }),
    effectsText: ['残党实力 -15', '学生愤怒 +10，教师支持 -5', '学生支持度 -5']
  },
  // ===== 右支线：怀柔维稳 =====
  { id: 'wu_parents_forum', title: '家长沟通会', description: '安抚家长，就是安抚舆论。学校永远“一切正常”。', days: 10, x: 680, y: 190, requires: ['wu_order_restored'], mutuallyExclusive: ['wu_martial_law'],
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, publicOpinion: Math.max(0, s.wuState.publicOpinion - 10), teacherSupport: Math.min(100, s.wuState.teacherSupport + 5), fengTrust: Math.min(100, s.wuState.fengTrust + 5) } : undefined,
      flags: { ...s.flags, wu_parents_forum_done: true },
      activeEvent: {
        id: 'wu_parents_forum_story',
        title: '一切正常',
        description: '家长沟通会在体育馆举行。封安宝亲自到场，对着台下数百名家长，用了二十七个“正常”和三十一个“安全”。\n\n“请大家放心，学校的教学秩序已经全面恢复正常。之前的一些‘小插曲’，只是极个别学生的过激行为，目前均已得到妥善处理。”\n\n台下有家长举手：“校长，网上传的那些视频是怎么回事？”封安宝面不改色：“不实信息。我们已经联系网信部门处理了。”\n\n散会后，每位家长都领到了一份《致家长的一封信》和两本免费教辅。回家的路上，他们都在讨论那两本教辅的质量。',
        buttonText: '舆论的阀门，掌握在会务组手里。',
        isStoryEvent: true
      }
    }),
    effectsText: ['舆论压力 -10', '教师支持 +5，封校长信任 +5']
  },
  { id: 'wu_teacher_relief', title: '教师安抚', description: '给老师们加工资、减考核。稳住了老师，就稳住了讲台。', days: 10, x: 680, y: 330, requires: ['wu_parents_forum'],
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, teacherSupport: Math.min(100, s.wuState.teacherSupport + 10), studentAnger: Math.max(0, s.wuState.studentAnger - 5) } : undefined,
      stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 5), pp: s.stats.pp + 30 },
      flags: { ...s.flags, wu_teacher_relief_done: true },
      activeEvent: {
        id: 'wu_teacher_relief_story',
        title: '讲台上的沉默',
        description: '教师大会上，封安宝宣布：本学期绩效考核指标下调百分之十五，晚自习补贴翻倍，另增设“校园安全协作奖”。\n\n台下响起了稀稀拉拉的掌声。有几位老教师欲言又止，最终只是低头喝茶。\n\n杨玉乐端着保温杯坐在第一排，脸上挂着恰到好处的微笑。散会时，他对身边的年轻教师说：“看，这就是软刀子。让你吃好喝好，然后闭嘴。”\n\n讲台稳住了。只是从此以后，再也没有老师在课堂上多讲一句课本之外的话。',
        buttonText: '沉默的讲台，最安全。',
        isStoryEvent: true
      }
    }),
    effectsText: ['教师支持 +10，学生愤怒 -5', '稳定度 +5，政治点数 +30']
  },
  { id: 'wu_club_concession', title: '有限放权', description: '恢复部分社团活动，给高压锅拧开一点气阀。', days: 12, x: 680, y: 470, requires: ['wu_teacher_relief'],
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, studentAnger: Math.max(0, s.wuState.studentAnger - 10), guerrillaStrength: Math.min(100, s.wuState.guerrillaStrength + 5), publicOpinion: Math.max(0, s.wuState.publicOpinion - 5) } : undefined,
      stats: { ...s.stats, stab: Math.max(0, s.stats.stab - 3), ss: Math.min(100, s.stats.ss + 5) },
      flags: { ...s.flags, wu_club_concession_done: true },
      activeEvent: {
        id: 'wu_club_concession_story',
        title: '气阀',
        description: '公告栏上贴出了新通知：恢复篮球社、书法社、广播站文学栏目等八个“无害社团”的活动资格，活动时间每周不超过两小时，活动内容须提前报备。\n\n篮球场上重新响起了运球声。学生们小心翼翼地传着球，像是在打一场谁都不许赢的比赛。\n\n吴福军对此很不满意：“放开口子，就等于承认之前抓错了人。”封安宝却只是笑笑：“高压锅也要有气阀，不然锅会炸。你懂篮球吗？”吴福军摇了摇头。封安宝说：“我也不懂。但我知道，让人出汗的地方，就不会让人流血的念头。”',
        buttonText: '小口子，大智慧。',
        isStoryEvent: true
      }
    }),
    effectsText: ['学生愤怒 -10，舆论压力 -5', '残党实力 +5（宽松环境给了残党喘息之机）', '稳定度 -3，学生支持度 +5']
  },
  // ===== 吴福军个人野心线 =====
  { id: 'wu_promote_wu', title: '表彰吴福军', description: '为吴福军举办隆重的授勋仪式。英雄，需要被看见。', days: 7, x: 140, y: 190, requires: ['wu_order_restored'],
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, wuAmbition: Math.min(100, s.wuState.wuAmbition + 15), fengTrust: Math.min(100, s.wuState.fengTrust + 5) } : undefined,
      flags: { ...s.flags, wu_arrest_unlocked: true },
      activeEvent: {
        id: 'wu_promote_wu_story',
        title: '授勋',
        description: '全校大会被改成了授勋仪式。吴福军换了一身笔挺的西装，胸前的“合一忠诚卫士”奖章在灯光下闪闪发亮。\n\n“吴福军同志在本次校园安全保卫战中，身先士卒、处置果断，为维护学校正常教学秩序作出了突出贡献！”封安宝念完表彰词，亲手把奖章别在吴福军胸前。\n\n掌声如雷。吴福军挺直腰板，目光扫过台下每一张脸。他的眼神在说：看清楚，谁才是这所学校真正的守护者。\n\n散会后，有学生听见他在走廊里对保安队长说：“下次这种场合，记得把我办公室的地图也搬过来。”',
        buttonText: '英雄的时代。',
        isStoryEvent: true
      }
    }),
    effectsText: ['吴福军野心 +15，封校长信任 +5', '解锁地图行动：定点抓捕']
  },
  { id: 'wu_independent_command', title: '独立指挥权', description: '赋予吴福军“紧急状态下”不经请示的处置权。', days: 10, x: 140, y: 330, requires: ['wu_promote_wu'],
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, wuAmbition: Math.min(100, s.wuState.wuAmbition + 15), fengTrust: Math.max(0, s.wuState.fengTrust - 5), martialLawLevel: Math.min(3, s.wuState.martialLawLevel + 1) } : undefined,
      flags: { ...s.flags, wu_independent_command: true },
      activeEvent: {
        id: 'wu_independent_command_story',
        title: '先斩后奏',
        description: '校长办公会上，封安宝签署了一份授权文件：《关于赋予安保部门紧急状态下特殊处置权限的决定》。\n\n“福军啊，”封安宝把文件推过去，“这份权力，我希望你永远用不上。”\n\n吴福军双手接过文件，语气郑重：“请校长放心，我吴福军，永远是校长手里的枪。”\n\n散会后，他把文件复印了三份：一份锁进保险柜，一份揣进上衣口袋，一份塞给了保安队长。“记住，”他低声说，“枪，也有枪的脾气。”',
        buttonText: '枪出膛，不回头。',
        isStoryEvent: true
      }
    }),
    effectsText: ['吴福军野心 +15，封校长信任 -5', '戒严等级 +1']
  },
  // ===== 一阶段收束：年度叙职 =====
  { id: 'wu_annual_review', title: '封安宝的年度叙职', description: '年底已至，封安宝要带着这一年的答卷，走进市教育局的会议室。这份答卷怎么写，将决定铁腕时代的下半场。', days: 12, x: 500, y: 610, requires: ['wu_secure_perimeter'],
    canStart: (s) => ['wu_night_patrol', 'wu_teacher_relief', 'wu_club_concession', 'wu_independent_command'].some(id => s.completedFocuses.includes(id)),
    onComplete: (s) => {
      const ws = s.wuState;
      const opinion = ws?.publicOpinion ?? 0;
      const guerrilla = ws?.guerrillaStrength ?? 0;
      const anger = ws?.studentAnger ?? 0;
      let verdict: 'praise' | 'reprimand' | 'neutral' = 'neutral';
      let verdictTitle = '';
      let verdictText = '';
      if (opinion <= 35 && guerrilla <= 55 && anger <= 60) {
        verdict = 'praise';
        verdictTitle = '“滨湖校区，模范校提名。”';
        verdictText = '副局长放下茶杯，难得地笑了一下：“舆情平稳，秩序良好，成绩也没掉队。封校长，你们这届班子，是有水平的。”\n\n散会后，督导处的人把封安宝拉到走廊：“年底省里的安全示范校评选，我们打算报你们。”\n\n封安宝回到车上，给吴福军发了一条消息：“评优期间，所有行动暂停。盾牌收起来，棍子也收起来。”\n\n吴福军回复了一个“收到”。三秒后，又补了一条：“那要是他们先动手呢？”\n\n封安宝没有回复。';
      } else if (opinion >= 55 || guerrilla >= 70) {
        verdict = 'reprimand';
        verdictTitle = '“封校长，你们的保安队，比教育局还威风啊。”';
        verdictText = '督导处处长把一叠打印出来的网络截图推过来：论坛热帖、家长群聊天记录、一张保安队员深夜追打学生的模糊照片。\n\n“舆情压不住，残党清不完，还有老师写联名信反映安保部门滥用职权。局里的意见是：限期整改，督导组随后进驻。”\n\n封安宝的后背渗出冷汗。他想起吴福军那句“出了事，有我校吴兜着”——如今这口锅，眼看就要扣到自己头上。\n\n“请领导放心，”他挺直腰板，“一个月内，我们给出让局里满意的整改方案。”';
      } else {
        verdict = 'neutral';
        verdictTitle = '“不好不坏。但下学期，看你们的了。”';
        verdictText = '教育局的领导们翻完了汇报材料，既没有表扬，也没有批评。办公室里只有翻页声和茶杯碰撞声。\n\n“这一年你们不容易，”老局长最后说，“但校园里的事，我们都看在眼里。有些线，不要踩。”\n\n他说的是哪条线，没有人挑明。\n\n封安宝走出教育局大门的时候，天已经黑了。吴福军站在车边，替他拉开后门：“校长，评得怎么样？”\n\n“还行。”封安宝坐进车里，闭上了眼睛。';
      }
      // 叙职基础效果 + 判定附加效果
      let finalWs = ws ? {
        ...ws,
        teacherSupport: Math.min(100, ws.teacherSupport + 8),
        publicOpinion: Math.max(0, ws.publicOpinion - 5),
        fengTrust: Math.min(100, ws.fengTrust + 5),
      } : undefined;
      let finalStats = { ...s.stats };
      if (verdict === 'praise') {
        finalStats = { ...finalStats, pp: finalStats.pp + 30 };
        finalWs = finalWs ? { ...finalWs, fengTrust: Math.min(100, finalWs.fengTrust + 10), publicOpinion: Math.max(0, finalWs.publicOpinion - 8) } : undefined;
      } else if (verdict === 'reprimand') {
        finalWs = finalWs ? { ...finalWs, fengTrust: Math.max(0, finalWs.fengTrust - 5), publicOpinion: Math.min(100, finalWs.publicOpinion + 5), teacherSupport: Math.max(0, finalWs.teacherSupport - 3) } : undefined;
      }
      // 判定决定完全不同的二阶段路线：praise→千年线 / reprimand→合一之春线 / neutral→政变线
      const p2Tree = verdict === 'praise' ? 'wu_tree_p2_feng' : verdict === 'reprimand' ? 'wu_tree_p2_spring' : 'wu_tree_p2_coup';
      return {
        currentFocusTree: p2Tree,
        flags: {
          ...s.flags,
          wu_phase2_active: true,
          wu_annual_review_done: true,
          wu_bureau_verdict: verdict,
        },
        wuState: finalWs,
        stats: finalStats,
        activeEvent: {
          id: 'wu_annual_review_story',
          title: '教育局的年度评定',
          description: `一月的合肥，湿冷得透骨。封安宝带着杨玉乐熬夜赶出的《滨湖校区年度工作汇报》，走进了市教育局的会议室。\n\n汇报材料做得滴水不漏：教学成绩、德育成果、校园安全“零事故”——每一个数字都经过杨玉乐的润色，每一页PPT都巧妙地绕开了“戒严”两个字。\n\n吴福军没有资格进这间会议室。他坐在楼下的车里，手指一下一下敲着方向盘，眼睛盯着教育局的大门，像一头被拴在门外的斗犬。\n\n会议室里，长桌对面的领导们听完了汇报，交换了几个眼神。\n\n${verdictTitle}\n\n${verdictText}\n\n叙职结束。回到学校的那一刻起，铁腕时代进入了下半场——这一年的判定，将决定哪些国策被放行，哪些门被关上。`,
          buttonText: '答卷交上去了。',
          isStoryEvent: true
        }
      };
    },
    effectsText: ['一阶段国策树在此收束，按判定进入完全不同的二阶段路线', '模范校提名→封安宝千年线「秩序元年」', '限期整改→合一之春线「风暴前夕」', '不置可否→吴福军政变线「大权在握」']
  },
];

// ============ v8.6.1 二阶段：按叙职判定进入三条完全不同的路线 ============
// 判定 praise → 封安宝千年线 / reprimand → 合一之春线 / neutral → 吴福军政变线
// 千年大计为封安宝千年线与合一之春线（降级留任结局）的共同秩序结局节点
const WU_MILLENNIUM_NODE: FocusNode = {
  id: 'wu_millennium_plan', title: '千年大计', description: '把“铁腕时代”制度化。校长的任期，应当与合一的历史一样长。', days: 14, x: 500, y: 610, requires: ['wu_wu_transfer', 'wu_bureau_backing', 'wu_wu_demote'],
  canStart: (s) => !!s.wuState
    && (!!s.flags.wu_wu_settled || !!s.flags.wu_reform_survived)
    && s.wuState.wuAmbition < 50 && s.wuState.studentAnger < 45 && s.wuState.publicOpinion < 45,
  onComplete: (s) => ({
    activeEvent: {
      id: 'wu_millennium_story',
      title: '投票箱里的空白',
      description: '教职工代表大会以全票通过《校长任期章程修订案》。投票箱从台上抬下来时，有人看见里面所有的票都是空白的——但计票结果依然是“全票通过”。\n\n封安宝在就职宣誓上说：“我将用我剩下的全部时间，守护合一的秩序。”没人问他“剩下的全部时间”有多长。\n\n校门口的宣传栏换上了新标语：\n\n“让每一个孩子，都在秩序中找到自己的位置。”\n\n从那以后，滨湖校区的作息铃声再也没有乱过一秒。',
      buttonText: '千年，从下一秒开始。',
      isStoryEvent: true,
      effect: (st) => ({ gameEnding: 'game_over_feng_millennium' })
    }
  }),
  effectsText: ['达成结局：连任千年', '需要：吴福军已转岗/降级（秩序已制度化），且野心 <50、愤怒 <45、舆论 <45']
};

// ==================== 判定 praise：封安宝千年线「秩序元年」 ====================
export const TREE_WU_P2_FENG_NODES: FocusNode[] = [
  { id: 'wu_model_school', title: '模范校授牌', description: '教育局的提名下来了。荣誉是护身符，也是紧箍咒——评优期间，谁都不许出乱子。', days: 8, x: 500, y: 50, requires: [],
    canStart: (s) => s.flags.wu_bureau_verdict === 'praise',
    onComplete: (s) => ({
      stats: { ...s.stats, pp: s.stats.pp + 40, stab: Math.min(100, s.stats.stab + 5) },
      wuState: s.wuState ? { ...s.wuState, publicOpinion: Math.max(0, s.wuState.publicOpinion - 10), fengTrust: Math.min(100, s.wuState.fengTrust + 10), teacherSupport: Math.min(100, s.wuState.teacherSupport + 5) } : undefined,
      flags: { ...s.flags, wu_model_school_done: true },
      activeEvent: {
        id: 'wu_model_school_story',
        title: '授牌仪式',
        description: '“安徽省平安校园示范校”的铜牌，由市教育局副局长亲自送来。\n\n授牌仪式在操场举行，横幅拉得笔直，鼓号队排练了整整三天。封安宝站在铜牌旁边致辞，脸上是恰到好处的笑容：“这份荣誉，属于合一的每一位师生员工。”\n\n台下第一排，吴福军换了一身崭新的制服。他本来准备了发言稿，标题是《铁拳护校》——被杨玉乐连夜换成了《用心守护平安校园》。\n\n“老吴，”杨玉乐把新稿子塞给他，低声说，“教育局的人在，你那个‘铁拳’，收一收。”\n\n吴福军把稿子折了两折，塞进口袋，全程没有看稿。轮到他的环节，他只说了八个字：“职责所在，万死不辞。”\n\n掌声响起。远处的学生们一边鼓掌，一边在心里数着：仪式还有多久结束。',
        buttonText: '牌子挂在校门口。',
        isStoryEvent: true
      }
    }),
    effectsText: ['政治点数 +40，稳定度 +5', '舆论压力 -10，封校长信任 +10，教师支持 +5', '开启路线：秩序元年（封安宝千年线）']
  },
  { id: 'wu_rule_by_law', title: '校规法治化', description: '把戒严的成果写成制度。拳头终会生锈，铜牌不会。', days: 12, x: 500, y: 190, requires: ['wu_model_school'],
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, wuAmbition: Math.max(0, s.wuState.wuAmbition - 10), fengTrust: Math.min(100, s.wuState.fengTrust + 10), publicOpinion: Math.max(0, s.wuState.publicOpinion - 5), studentAnger: Math.max(0, s.wuState.studentAnger - 5) } : undefined,
      flags: { ...s.flags, wu_rule_by_law_done: true },
      nationalSpirits: s.nationalSpirits
        .filter(ns => ns.id !== 'wu_rule_of_law_spirit')
        .concat({
          id: 'wu_rule_of_law_spirit',
          name: '法治化校规',
          description: "戒严的成果没有被留在保安队的口令里，而是被写进了校规。拳头会松，铜牌不会——这套法治化校规要做的，就是把铁腕时期的临时安排变成有据可依的长期秩序。\n\n对学生而言，处分从此不再取决于谁在场、谁发火，而是取决于条文；这既减少了随意性，也意味着反对空间被制度性地固定下来。人治退场，控制留下。",
          type: 'neutral',
          effects: { stabDaily: 0.2, ssDaily: -0.2, radicalAngerDaily: -0.2 }
        }),
      activeEvent: {
        id: 'wu_rule_by_law_story',
        title: '从铁拳到铜牌',
        description: '封安宝主持召开了“校园秩序制度化工作会议”。会议桌上一字排开的，是过去一年里保安队的全部临时规定：《通行证管理办法》《夜巡实施细则》《违禁品认定清单》……\n\n“这些都要整理成正式校规。”封安宝说，“从今天起，校园秩序靠制度，不靠某个人。”\n\n吴福军坐在角落里，脸色越来越难看。他听懂了：制度立起来，铁拳就要收回去。\n\n“校长，”他忍不住开口，“制度是死的，人是活的。真出了事，还是得靠——”\n\n“靠制度追责。”封安宝打断他，“吴主任，法治化的意思就是：出了事，先查制度，再查人。”\n\n散会后，杨玉乐路过保安室，听见里面传出摔保温杯的声音。他叹了口气，对旁边的人说：“听见没？旧时代，正在把吴福军也变成制度的一部分。”',
        buttonText: '制度立起来，铁拳收回去。',
        isStoryEvent: true
      }
    }),
    effectsText: ['吴福军野心 -10，封校长信任 +10', '舆论压力 -5，学生愤怒 -5', '获得国家精神：法治化校规']
  },
  { id: 'wu_wu_transfer', title: '卸磨杀驴·吴福军转岗', description: '给吴福军一个体面的去处。总务处主任，管食堂、管绿化、管一切没人的地方。', days: 10, x: 380, y: 330, requires: ['wu_rule_by_law'],
    canStart: (s) => !!s.wuState && s.wuState.wuAmbition < 55,
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, fengTrust: Math.min(100, s.wuState.fengTrust + 10), wuAmbition: Math.max(0, s.wuState.wuAmbition - 20), teacherSupport: Math.min(100, s.wuState.teacherSupport + 10) } : undefined,
      flags: { ...s.flags, wu_wu_settled: true },
      activeEvent: {
        id: 'wu_wu_transfer_story',
        title: '功成身退',
        description: '调令下来的时候，吴福军正在保安室擦他的橡胶棍。\n\n“吴福军同志调任总务处主任。”行政办的人念完，把文件轻轻放在桌上，转身就走，不敢多待一秒。\n\n出乎所有人意料，吴福军没有闹。他把那根擦得发亮的橡胶棍端端正正地架回柜子里，对着保安队的弟兄们说：“都听好了，以后你们归新主任管。我老吴，去管食堂了。”\n\n有年轻保安红了眼眶：“吴哥，咱跟他们拼了！”\n\n“拼什么？”吴福军瞪了他一眼，“我拿的是学校的工资，学校让我看门，我看门；让我管食堂，我管食堂。这叫规矩。”\n\n话是这么说。可他走出保安室的时候，脚步明显比平时重。\n\n封安宝在校长室里听完汇报，只说了两个字：“好走。”',
        buttonText: '枪入了库，锁进了制度。',
        isStoryEvent: true
      }
    }),
    effectsText: ['吴福军野心 -20，封校长信任 +10，教师支持 +10', '戒严体系收归制度管理']
  },
  { id: 'wu_bureau_backing', title: '教育局背书', description: '野心压不住，就借教育局的手来压。让上头出面，把安保指挥权收归校长。', days: 10, x: 620, y: 330, requires: ['wu_rule_by_law'],
    canStart: (s) => !!s.wuState && s.wuState.wuAmbition >= 55,
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, wuAmbition: Math.max(0, s.wuState.wuAmbition - 15), fengTrust: Math.max(0, s.wuState.fengTrust - 5), publicOpinion: Math.max(0, s.wuState.publicOpinion - 10), teacherSupport: Math.min(100, s.wuState.teacherSupport + 5) } : undefined,
      flags: { ...s.flags, wu_wu_settled: true },
      activeEvent: {
        id: 'wu_bureau_backing_story',
        title: '借势压人',
        description: '封安宝把一份《关于规范滨湖校区安保指挥体系的请示》递进了教育局。行文滴水不漏：“为巩固平安校园建设成果，建议由校长直接兼任校园安全第一责任人，安保部门在校长领导下开展工作。”\n\n教育局批复得很快。批复里还有一句附言：“模范校评选在即，望妥善处理人事问题，确保大局稳定。”\n\n吴福军是在校务会上听到这份批复的。他的脸从红转白，又从白转红，最后只从牙缝里挤出一句：“校长，这是……不信任我？”\n\n“这是制度。”封安宝说，“你永远是我的老部下。”\n\n“老部下”三个字，像一枚钉子，把吴福军钉在了原地。\n\n会散了。有人看见吴福军在操场上独自走了很久，走了一圈，又一圈。',
        buttonText: '用上级的纸，压住下属的枪。',
        isStoryEvent: true
      }
    }),
    effectsText: ['吴福军野心 -15，舆论压力 -10', '封校长信任 -5（借外力压制，吴福军心有不甘）', '安保指挥权收归校长']
  },
  WU_MILLENNIUM_NODE,
];

// ==================== 判定 reprimand：合一之春线「风暴前夕」 ====================
export const TREE_WU_P2_SPRING_NODES: FocusNode[] = [
  { id: 'wu_inspection', title: '督导组进驻', description: '教育局的督导组来了。两周时间，查账、查记录、查保安室的每一根橡胶棍。', days: 10, x: 500, y: 50, requires: [],
    canStart: (s) => s.flags.wu_bureau_verdict === 'reprimand',
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, publicOpinion: Math.max(0, s.wuState.publicOpinion - 15), teacherSupport: Math.min(100, s.wuState.teacherSupport + 10), wuAmbition: Math.max(0, s.wuState.wuAmbition - 8), fengTrust: Math.max(0, s.wuState.fengTrust - 5) } : undefined,
      flags: { ...s.flags, wu_inspection_done: true },
      activeEvent: {
        id: 'wu_inspection_story',
        title: '督导组的两周',
        description: '督导组进驻的第一天，就调走了保安室近半年的所有行动记录。\n\n第二天，一名督导员在操场上拦住了正在巡视的吴福军：“吴主任，有学生反映，你们夜巡时使用过‘警戒动作’。请解释一下，什么叫‘警戒动作’？”\n\n吴福军的脸涨得通红：“那是……战术术语！防止突发事件的标准流程！”\n\n“哦。”督导员在本子上写了两个字，转身走了。\n\n两周里，吴福军的保安队全面“休整”：盾牌入库，夜巡减半，连喇叭的声音都小了三档。学生们私下说，这是他们入学以来睡得最安稳的两周。\n\n督导组临走那天，封安宝在会议室里表态：“我们一定深刻反思，坚决整改。”\n\n送走督导组的车，封安宝在办公室抽完了半包烟。他知道，这关暂时过了——但吴福军，欠下了一笔账。',
        buttonText: '先把这关过了。',
        isStoryEvent: true
      }
    }),
    effectsText: ['舆论压力 -15，教师支持 +10', '吴福军野心 -8，封校长信任 -5', '开启路线：风暴前夕（合一之春线）']
  },
  { id: 'wu_power_review', title: '权力边界审查', description: '按照督导组意见，重审安保部门的权力边界。第一百条，必须废止。', days: 12, x: 500, y: 190, requires: ['wu_inspection'],
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, wuAmbition: Math.min(100, s.wuState.wuAmbition + 20), fengTrust: Math.max(0, s.wuState.fengTrust - 10), publicOpinion: Math.max(0, s.wuState.publicOpinion - 10), teacherSupport: Math.min(100, s.wuState.teacherSupport + 10), studentAnger: Math.max(0, s.wuState.studentAnger - 5) } : undefined,
      flags: { ...s.flags, wu_power_review_done: true },
      activeEvent: {
        id: 'wu_power_review_story',
        title: '第一百条的葬礼',
        description: '校务会表决通过了《校园安全条例》修正案——曾经被学生们称为“开枪条款”的第一百条，正式废止。\n\n表决结果宣布的那一刻，会议室里有人鼓掌，被封安宝抬手按下。\n\n只有吴福军没有看任何人。他盯着自己面前那份修正案，很久，突然笑了：“好。好得很。我把这所学校从暴徒手里抢回来，现在他们说，抢的人才有问题。”\n\n“老吴，”封安宝放缓语气，“这是上面的意思。我们要给上面一个交代。”\n\n“那我呢？”吴福军抬起头，“谁给我交代？”\n\n没有人回答他。\n\n那天夜里，保安室的灯亮到凌晨三点。第二天早上，门卫发现，吴福军把那本印着旧条例的小册子，一页一页撕碎，又用胶带一页一页粘了回来。',
        buttonText: '旧条例死了，撕碎它的人没死。',
        isStoryEvent: true
      }
    }),
    effectsText: ['吴福军野心 +20，封校长信任 -10', '舆论压力 -10，教师支持 +10，学生愤怒 -5', '危险：被当众羞辱的枪，正在重新上膛']
  },
  { id: 'wu_safe_school', title: '安全示范校整改', description: '按照督导组的意见逐条整改。把“安全”从拳头里拿出来，放回制度里。', days: 14, x: 500, y: 330, requires: ['wu_power_review'],
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, publicOpinion: Math.min(10, s.wuState.publicOpinion), teacherSupport: Math.min(100, s.wuState.teacherSupport + 8) } : undefined,
      stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 5) },
      flags: { ...s.flags, wu_safe_school_done: true },
      activeEvent: {
        id: 'wu_safe_school_story',
        title: '整改验收',
        description: '整改清单贴在了行政楼大厅：设立学生申诉信箱、规范安保器械使用、每周公布一次“安全通报”……一共二十三条。\n\n最让吴福军难以接受的是第八条：安保人员执行任务时，须至少一名中层以上干部在场。\n\n“这跟把我铐起来有什么区别？！”他在校长室里拍桌子。\n\n“区别是，”封安宝头也不抬，“你的棍子还在你手里。”\n\n整改验收那天，督导组第二次进校。他们随机抽查了三个班级，问了十几名学生，还打开申诉信箱看了看——里面有信，而且每一封都有编号、有回执。\n\n验收通过。舆论的风浪，终于慢慢平息了。',
        buttonText: '从拳头到制度。',
        isStoryEvent: true
      }
    }),
    effectsText: ['舆论压力降至 10，教师支持 +8', '稳定度 +5']
  },
  { id: 'wu_wu_demote', title: '降级留任', description: '最后一步：把吴福军从指挥位上请下来。枪，可以留着，但扳机要交出来。', days: 10, x: 500, y: 470, requires: ['wu_safe_school'],
    canStart: (s) => !!s.wuState && s.wuState.wuAmbition < 100,
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, wuAmbition: Math.max(0, s.wuState.wuAmbition - 30), fengTrust: Math.min(100, s.wuState.fengTrust + 10), teacherSupport: Math.min(100, s.wuState.teacherSupport + 10), studentAnger: Math.max(0, s.wuState.studentAnger - 5) } : undefined,
      flags: { ...s.flags, wu_reform_survived: true },
      activeEvent: {
        id: 'wu_wu_demote_story',
        title: '交出指挥权',
        description: '谈话安排在校长室。封安宝亲自泡了茶，亲手递过去。\n\n“福军，上面点了你的名。整改要过关，安保部门必须换人。但我可以保你一个体面——降为普通督导，工资一分不少，编制不动。”\n\n吴福军捧着茶杯，很久没有说话。窗外，操场上跑操的学生喊声震天：“一——二——三——四！”\n\n“我听见了。”他终于开口，“听见他们喊了。也听见校长的意思了。”\n\n“福军，识时务者——”\n\n“校长不用说了。”吴福军把茶杯轻轻放下，“我吴福军跟了您这么久，最后求您一件事。”\n\n“你说。”\n\n“让我把保安队的花名册，带回家里留个念想。”\n\n封安宝愣了一下，点了点头。\n\n第二天，保安室的门牌换成了“安全办公室”。新主任上任，吴福军把指挥权、钥匙和对讲机，一样一样地放在桌上，码得整整齐齐。',
        buttonText: '扳机交出来了。',
        isStoryEvent: true
      }
    }),
    effectsText: ['吴福军野心 -30，封校长信任 +10', '教师支持 +10，学生愤怒 -5', '危机解除：安保指挥权平稳交接']
  },
  { id: 'wu_rebel_contact', title: '与残党接触', description: '教育局的压力之下，与残党的谈判反而有了转机。谈谈，总比打下去强。', days: 14, x: 680, y: 330, requires: ['wu_club_concession'],
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, negotiationProgress: 20, publicOpinion: Math.max(0, s.wuState.publicOpinion - 5), fengTrust: Math.max(0, s.wuState.fengTrust - 5) } : undefined,
      flags: { ...s.flags, wu_negotiation_open: true },
      activeEvent: {
        id: 'wu_rebel_contact_story',
        title: '断线重连',
        description: '通过家长群里的一个匿名账号，校方和残党之间的第一条消息终于发了出去。\n\n“我们要求：公开调查保安队暴力执法事件，恢复学生自治组织，取消戒严。”\n\n封安宝看完消息，把手机推给吴福军：“你怎么看？”吴福军冷笑：“谈什么谈？再给我两周，我把他们的老鼠洞都翻出来。”\n\n“再给你两周，教育局就该把调查组派下来了。”封安宝叹了口气，把手机拿回来，打了一行字：“可以谈。地点你们定，但必须带一个家长在场。”\n\n谈判的线，就这样牵了起来。只是不知道线的那头，是橄榄枝，还是导火索。',
        buttonText: '战争与和平，都需要渠道。',
        isStoryEvent: true
      }
    }),
    effectsText: ['开启与残党和解谈判（谈判进度 20）', '舆论压力 -5，封校长信任 -5']
  },
  { id: 'wu_negotiate_peace', title: '和平协议', description: '与残党达成和解。适度的让步，换取长久的平静。', days: 14, x: 680, y: 470, requires: ['wu_rebel_contact'],
    canStart: (s) => !!s.wuState && s.wuState.negotiationProgress >= 100 && !s.wuState.assassinationTriggered,
    onComplete: (s) => ({
      activeEvent: {
        id: 'wu_peace_story',
        title: '协议上的指纹',
        description: '谈判在一位学生家长的汽修店里进行。双方隔着机油味的桌子坐了六个小时，最终各自退让半步。\n\n协议文本用A4纸打印了三份，签字处按上了指纹——没有人带印泥，用的是一旁换轮胎剩下的红漆。\n\n戒严取消。社团恢复。调查启动。\n\n残党宣布“转入地下合法监督”，校方宣布“全面恢复正常教学秩序”。谁都没有提那些消失的人和事。\n\n很多年后，合一的校史馆里依然找得到这份协议的复印件。只是关于它究竟带来了什么，不同届的学生会给出完全不同的答案。',
        buttonText: '平静，是一种昂贵的妥协。',
        isStoryEvent: true,
        effect: (st) => ({ gameEnding: 'compromise' })
      }
    }),
    effectsText: ['达成结局：妥协与平静']
  },
  { id: 'wu_ambition_peak', title: '忠诚与背叛', description: '被审查羞辱、被整改捆住手脚的吴福军，终于走向了那条最黑的路。', days: 10, x: 320, y: 330, requires: ['wu_power_review'],
    canStart: (s) => !!s.wuState && s.wuState.wuAmbition >= 100 && s.wuState.fengTrust < 40 && !s.wuState.assassinationTriggered,
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, assassinationTriggered: true } : undefined,
      activeEvent: {
        id: 'wu_assassination_story',
        title: '行政楼顶层的枪声',
        description: '那天的晚自习特别安静。\n\n封安宝把吴福军叫到校长室，把一份《关于安保部门权力边界问题的整改意见》摔在桌上：“福军，最近外面的风言风语，让我很难办。第一百条，先废了吧。”\n\n吴福军低着头，肩膀微微发抖。他想起自己亲自带队收复B3的那个凌晨，想起授勋仪式上别在胸前的奖章，想起无数个在保安室度过的寒夜。\n\n“校长，”他的声音平静得可怕，“是我吴福军，把你请回来的。”\n\n封安宝转过身，看向窗外的操场：“所以我给了你最大的信任。现在，把权力交回来——”\n\n他没有说完。\n\n一声闷响在行政楼顶层炸开，惊飞了旗杆上的鸟。走廊里，抱着教案的杨玉乐愣在原地，保温杯从手中滑落，枸杞茶洒了一地。\n\n保安队员冲进校长室的时候，只看见倒在血泊中的校长，和站在窗边、双手颤抖的吴福军。\n\n“他……他想把学校交给那些暴徒。”吴福军的嘴唇哆嗦着，“我是在救这所学校。”\n\n那一夜，整个滨湖校区的人都听见了救护车的鸣笛声，由远及近，又由近及远。',
        buttonText: '权力厌恶真空。',
        isStoryEvent: true,
        effect: (st) => ({ gameEnding: 'game_over_hefei_spring' })
      }
    }),
    effectsText: ['达成结局：封安宝遇刺 · 合一之春']
  },
  WU_MILLENNIUM_NODE,
];

// ==================== 判定 neutral：吴福军政变线「大权在握」 ====================
export const TREE_WU_P2_COUP_NODES: FocusNode[] = [
  { id: 'wu_power_expansion', title: '保安队扩编', description: '教育局不置可否，等于默许。吴福军趁机把保安队扩编到五百人。', days: 14, x: 500, y: 50, requires: [],
    canStart: (s) => s.flags.wu_bureau_verdict === 'neutral',
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, wuAmbition: Math.min(100, s.wuState.wuAmbition + 10), fengTrust: Math.min(100, s.wuState.fengTrust + 5) } : undefined,
      stats: { ...s.stats, stab: Math.min(100, s.stats.stab + 3) },
      flags: { ...s.flags, wu_expansion_done: true },
      nationalSpirits: s.nationalSpirits
        .filter(ns => ns.id !== 'wu_expansion_spirit')
        .concat({
          id: 'wu_expansion_spirit',
          name: '扩编保安队',
          description: "教育局不置可否，这在校园政治里等于默许。吴福军抓住这个空档，把保安队扩编到五百人——这个规模已经很难再被称为校园安保，它是一支事实上的军事力量。\n\n建制越大，越需要持续供给，也越容易反过来绑架聘用它的机构。吴福军手里握着的，不再只是一份校内差事。",
          type: 'negative',
          effects: { ppDaily: 0.3, ssDaily: -0.3 }
        }),
      activeEvent: {
        id: 'wu_power_expansion_story',
        title: '五百人',
        description: '扩编的请示送到封安宝桌上时，连他自己都吃了一惊：吴福军要把保安队从一百二十人扩编到五百人，理由是“校园面积扩大、安全形势复杂、常态化战备需要”。\n\n“五百人？”封安宝皱着眉，“全校教职工才多少人？”\n\n“校长，”吴福军凑近一步，“上次要不是兄弟们拼命，这学校早就不是您的了。人手多一点，您睡得也踏实。”\n\n请示最后被批了。倒不是封安宝被说动，而是教育局那边不置可否——不表态，就是默许。\n\n招人的告示贴出去，三天就报满了。吴福军亲自面试，不问学历，只问三句：“怕不怕事？听不听话？会不会打架？”\n\n三个月后，滨湖校区里多了一支五百人的队伍。他们穿着统一的安保制服，列队走过操场的时候，脚步声比升旗仪式还齐。',
        buttonText: '五百人，就是五百个理由。',
        isStoryEvent: true
      }
    }),
    effectsText: ['吴福军野心 +10，封校长信任 +5，稳定度 +3', '获得国家精神：扩编保安队', '开启路线：大权在握（吴福军政变线）']
  },
  { id: 'wu_first_strike_right', title: '先斩后奏权', description: '遇到“紧急情况”，保安队可当场处置、事后报备。', days: 12, x: 140, y: 190, requires: ['wu_power_expansion'],
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, wuAmbition: Math.min(100, s.wuState.wuAmbition + 20), fengTrust: Math.max(0, s.wuState.fengTrust - 10), studentAnger: Math.min(100, s.wuState.studentAnger + 10), publicOpinion: Math.min(100, s.wuState.publicOpinion + 10) } : undefined,
      flags: { ...s.flags, wu_first_strike_right: true },
      activeEvent: {
        id: 'wu_first_strike_story',
        title: '条例第一百条',
        description: '新的《校园安全条例》第一百条，被学生们私下称为“开枪条款”：\n\n“对正在进行或即将实施的严重危害校园安全的行为，安保人员有权采取一切必要措施予以制止，包括但不限于使用制式装备。事后二十四小时内补报材料即可。”\n\n条例发布的当晚，吴福军召集全体保安队员开会：“都给我记住第一百条。出了事，有条例兜着；条例兜不住，有我校吴兜着。”\n\n台下的保安队员们面面相觑，然后齐声答道：“是！”\n\n窗外，晚自习的教学楼灯火通明。从远处看，那一排排窗户像是一堵巨大的、沉默的墙。',
        buttonText: '一切必要措施。',
        isStoryEvent: true
      }
    }),
    effectsText: ['吴福军野心 +20，封校长信任 -10', '学生愤怒 +10，舆论压力 +10']
  },
  { id: 'wu_arm_guard', title: '武装护校队', description: '给护校队配发制式装备。威慑，是最好的维稳。', days: 14, x: 320, y: 190, requires: ['wu_power_expansion'],
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, wuAmbition: Math.min(100, s.wuState.wuAmbition + 10), publicOpinion: Math.min(100, s.wuState.publicOpinion + 8), studentAnger: Math.min(100, s.wuState.studentAnger + 5) } : undefined,
      flags: { ...s.flags, wu_armed_guard: true },
      nationalSpirits: s.nationalSpirits
        .filter(ns => ns.id !== 'wu_armed_guard_spirit')
        .concat({
          id: 'wu_armed_guard_spirit',
          name: '武装护校队',
          description: "护校队开始配发制式装备。名义上仍是护校，实际装备水平和处置手段已按准武装单位的标准来配置，镇压效率随之大幅提升。\n\n威慑成了首要的维稳手段。学生面对的不再是临时抽调的校工，而是一支装备统一、能按命令行动的力量。校园里的异议没有被说服，只是被压低了音量。",
          type: 'negative',
          effects: { ppDaily: 0.5 }
        }),
      activeEvent: {
        id: 'wu_arm_guard_story',
        title: '装备入库',
        description: '三辆印着“合一安保”的箱式货车趁着夜色开进了学校后门。货箱打开，里面是全新的防暴盾牌、加厚橡胶棍和两箱烟雾弹。\n\n吴福军亲手把一面盾牌递给了护校队队长：“拿着。从今天起，你们就是合一的钢铁长城。”\n\n封安宝从校长室的窗户望下去，皱了皱眉，但什么也没说。\n\n有老师私下议论：“给学生发棍子的人，迟早会把棍子对准老师。”这句话很快传到了保安室。第二天，那位老师被调去食堂窗口打饭。',
        buttonText: '钢铁长城，坚不可摧。',
        isStoryEvent: true
      }
    }),
    effectsText: ['吴福军野心 +10，舆论压力 +8', '获得国家精神：武装护校队']
  },
  { id: 'wu_underground_war', title: '地下管网封锁', description: '残党在管网里如鱼得水。那就把水抽干——全面封堵、分段设卡、水泥灌注。', days: 14, x: 500, y: 190, requires: ['wu_power_expansion'],
    canStart: (s) => !!s.wuState && s.wuState.guerrillaStrength >= 60 && !s.flags.wu_failure_queued,
    onComplete: (s) => {
      const cleanFlags: Record<string, any> = { ...s.flags };
      ALL_SUB_TILES.forEach(t => { delete cleanFlags[`wu_cell_${t.id}`]; });
      return {
        wuState: s.wuState ? { ...s.wuState, guerrillaStrength: Math.max(0, s.wuState.guerrillaStrength - 25), studentAnger: Math.min(100, s.wuState.studentAnger + 10), fengTrust: Math.min(100, s.wuState.fengTrust + 5) } : undefined,
        flags: { ...cleanFlags, wu_underground_war_done: true },
        activeEvent: {
          id: 'wu_underground_war_story',
          title: '管道战争',
          description: '工程队进场了。切割机的火花照亮了校园的每一个井口，地下管网的二十七个出入口被逐一焊死，只剩下三个“检查口”，由保安队二十四小时轮班值守。\n\n吴福军给这场行动起了个名字：“断水计划”。\n\n“老鼠能跑，是因为有洞。现在洞没了。”他在晨会上说，“我要让他们明白，在合一的地底下，学校说了算。”\n\n残党的活动确实被切断了。油印机安静了，传单消失了，地下联络站一个个失联。\n\n但地表的温度，却在悄悄升高。学生们发现，最近食堂的饭桌上，大家开始用敲三下桌子的方式，代替“等一下”。\n\n没有人教过他们。这种暗号，是在失去所有渠道之后，自己长出来的。',
          buttonText: '地上地下，都是学校的地盘。',
          isStoryEvent: true
        }
      };
    },
    effectsText: ['残党实力 -25，清除全部残党细胞', '学生愤怒 +10，封校长信任 +5']
  },
  { id: 'wu_iron_curtain', title: '铁幕校规', description: '把戒严写进校规，把校规刻进每个学生的肌肉记忆。', days: 12, x: 320, y: 330, requires: ['wu_arm_guard'],
    canStart: (s) => !!s.wuState && s.wuState.martialLawLevel >= 2,
    onComplete: (s) => ({
      wuState: s.wuState ? { ...s.wuState, martialLawLevel: Math.max(3, s.wuState.martialLawLevel), studentAnger: Math.min(100, s.wuState.studentAnger + 12), publicOpinion: Math.min(100, s.wuState.publicOpinion + 10), guerrillaStrength: Math.max(0, s.wuState.guerrillaStrength - 10) } : undefined,
      flags: { ...s.flags, wu_iron_curtain_done: true },
      nationalSpirits: s.nationalSpirits
        .filter(ns => ns.id !== 'wu_iron_curtain_spirit')
        .concat({
          id: 'wu_iron_curtain_spirit',
          name: '铁幕校规',
          description: "戒严不再是临时措施，而被逐条写进校规，成为可以引用的条文。保安队据此把检查、登记、通报固定成每日流程，学生从入学起便被告知哪些行为算越界。\n\n校方声称这是为了在残党未清之前维持秩序；实际后果是，学生把服从练成了条件反射，而校规本身成了比课堂更硬的权威。",
          type: 'negative',
          effects: { ppDaily: 0.3, ssDaily: -0.5 }
        }),
      activeEvent: {
        id: 'wu_iron_curtain_story',
        title: '校规即铁幕',
        description: '新版《学生手册》发到了每个人手里，一百三十四条，比旧版多了整整四十七条。\n\n第四条：学生在校期间须佩戴胸牌，胸牌朝外。第十七条：晚自习期间禁止一切形式的传递物品。第五十二条：禁止在公共场合谈论“校园安全事件”。第一百零三条：对安保人员的执法行为提出异议的，按扰乱秩序处理。\n\n配套而来的还有“校规周考”——全校闭卷，不及格的班级取消当周体育活动。\n\n吴福军得意地巡视着考场：“考试不及格，说明思想不重视。思想不重视，说明我工作不到位。为了我的工作，你们必须考满分。”\n\n杨玉乐路过考场，看了一眼埋头答卷的学生们，对旁边的老师说：“看见没有，这叫用做题的方式，教他们学会服从。”',
        buttonText: '校规一百三十四条。',
        isStoryEvent: true
      }
    }),
    effectsText: ['戒严等级升至 3', '残党实力 -10，学生愤怒 +12，舆论压力 +10', '获得国家精神：铁幕校规']
  },
  { id: 'wu_scorched_earth', title: '犁庭扫穴', description: '一次不留死角的全区总清剿。让地下管网里，再也听不见第二个人的呼吸声。', days: 14, x: 320, y: 470, requires: ['wu_iron_curtain'],
    canStart: (s) => !!s.wuState && s.wuState.guerrillaStrength >= 40,
    onComplete: (s) => {
      const cleanFlags: Record<string, any> = { ...s.flags };
      ALL_SUB_TILES.forEach(t => {
        delete cleanFlags[`wu_cell_${t.id}`];
        cleanFlags[`tile_ctrl_${t.id}`] = 3;
      });
      return {
        wuState: s.wuState ? { ...s.wuState, guerrillaStrength: Math.max(0, s.wuState.guerrillaStrength - 35), studentAnger: Math.min(100, s.wuState.studentAnger + 18), crackdownActions: s.wuState.crackdownActions + 5, fengTrust: Math.min(100, s.wuState.fengTrust + 8), wuAmbition: Math.min(100, s.wuState.wuAmbition + 10) } : undefined,
        flags: { ...cleanFlags, wu_iron_dominance_done: true },
        activeEvent: {
          id: 'wu_scorched_earth_story',
          title: '犁庭扫穴',
          description: '总清剿从凌晨三点开始，持续了整整十四个小时。\n\n十五个区域同时行动，每一个井盖、每一条通风管、每一个废弃杂物间都被掀开。吴福军亲自带着突击组钻进地下管网，手电筒的光柱里，灰尘像雪一样飘。\n\n他们在B3下方的泵房里发现了半箱油印纸、一捆写满暗号的旧试卷，还有一张用粉笔画在水泥墙上的作战图——上面标注着下一次行动的集结地点。\n\n“老鼠洞就是老鼠洞。”吴福军一脚踩灭了地上的一截蜡烛，对着对讲机下令：“全部水泥封死。”\n\n黄昏时分，清剿结束。操场上的“战利品”堆得比上次还高。\n\n代价同样沉重：这一天，没有一个学生和保安队员对视。他们的目光穿过彼此，像穿过两面透明的墙。',
          buttonText: '寸草不生，是暂时的。',
          isStoryEvent: true
        }
      };
    },
    effectsText: ['清除全部残党细胞，所有地块校方严控（控制度 3）', '残党实力 -35，学生愤怒 +18', '封校长信任 +8，吴福军野心 +10']
  },
  { id: 'wu_coup_december', title: '十二·十二', description: '一场没有硝烟的政变。五百人的护校队，将成为合一的唯一主人。', days: 10, x: 500, y: 610, requires: ['wu_scorched_earth', 'wu_first_strike_right'],
    canStart: (s) => !!s.wuState && s.wuState.wuAmbition >= 100 && s.wuState.fengTrust >= 40 && !s.wuState.assassinationTriggered,
    onComplete: (s) => ({
      activeEvent: {
        id: 'wu_coup_story',
        title: '十二·十二夜',
        description: '2023年12月12日，晚十点整。\n\n没有任何预兆，校园里所有路灯同时熄灭。紧接着，保安室的广播系统被强行切入：“各区域注意，接上级通知，校园进入特级安全戒备状态。请全体师生留在室内，不要外出，不要使用手机。”\n\n护校队分成十五个小组，按照战术板上演练过无数遍的路线，在二十分钟内完成了对全部区域的封锁。行政楼的所有电话线被切断，校长室的门被从外面用铁链反锁。\n\n凌晨一点，封安宝在办公室里砸碎了第二个烟灰缸。他的手机没有任何信号——不是没电，是被屏蔽了。\n\n凌晨五点，吴福军站在行政楼前的台阶上，对集结完毕的护校队宣布：“校园安全形势严峻，为防患于未然，本人自即日起接管全校安保与行政指挥权。这不是政变。”他顿了顿，补充道，“这是预案。”\n\n没有人反对。因为所有可能反对的人，此刻都被锁在自己家里。\n\n太阳升起的时候，合一的国旗和校旗照常升起。只是升旗台下的守卫，换成了两排面无表情的保安。',
        buttonText: '这不是政变。这是预案。',
        isStoryEvent: true,
        effect: (st) => ({ gameEnding: 'game_over_wu_coup' })
      }
    }),
    effectsText: ['达成结局：吴福军 · 十二·十二夜', '需要：犁庭扫穴 或 先斩后奏权 完成，且野心 100、信任 ≥40']
  },
];

export const getFocusNodes = (treeId: string) => {
  switch (treeId) {
    case 'phase1': return PHASE1_NODES;
    case 'treeA': return TREE_A_NODES;
    case 'treeA_pan': return TREE_A_PAN_NODES;
    case 'treeA_pan_despair': return TREE_A_PAN_DESPAIR_NODES;
    case 'treeA_true_left': return TREE_A_TRUE_LEFT_NODES;
    case 'treeA_lu_bohan': return TREE_A_LU_BOHAN_NODES;
    case 'treeA_haobang': return TREE_A_HAOBANG_NODES;
    case 'treeB': return TREE_B_NODES;
    case 'jidi_tree': return JIDI_TREE_NODES;
    case 'gouxiong_tree': return GOUXIONG_TREE_NODES;
    case 'wu_tree': return TREE_WU_NODES;
    case 'wu_tree_p2_feng': return TREE_WU_P2_FENG_NODES;
    case 'wu_tree_p2_spring': return TREE_WU_P2_SPRING_NODES;
    case 'wu_tree_p2_coup': return TREE_WU_P2_COUP_NODES;
    case 'wu_tree_phase2': return TREE_WU_P2_COUP_NODES; // 旧存档过渡别名（v8.6早期测试档）
    default: return PHASE1_NODES;
  }
};

export default function FocusTree({ state, startFocus, triggerError, isSuperEventActive }: FocusTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [hovered, setHovered] = useState<{ id: string; anchor: HTMLElement } | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelClose = () => { if (closeTimer.current) clearTimeout(closeTimer.current); };
  const scheduleClose = () => { cancelClose(); closeTimer.current = setTimeout(() => setHovered(null), 120); };
  useEffect(() => { setHovered(null); return cancelClose; }, [state.currentFocusTree]);

  // Center the view initially
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = 150;
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    cancelClose();
    setHovered(null);
    setIsDragging(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setStartY(e.pageY - (containerRef.current?.offsetTop || 0));
    setScrollLeft(containerRef.current?.scrollLeft || 0);
    setScrollTop(containerRef.current?.scrollTop || 0);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current.offsetLeft || 0);
    const y = e.pageY - (containerRef.current.offsetTop || 0);
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    containerRef.current.scrollLeft = scrollLeft - walkX;
    containerRef.current.scrollTop = scrollTop - walkY;
  };

  const currentNodes = getFocusNodes(state.currentFocusTree);
  const focusY = (node: FocusNode) => Math.round(node.y * 1.6);
  const canvasWidth = Math.max(1200, ...currentNodes.map(node => node.x + 280));
  const canvasHeight = Math.max(1000, ...currentNodes.map(node => focusY(node) + 260));

  const canStartFocus = (node: FocusNode) => {
    if (state.stats.pp < 0) return false;
    if (state.activeFocus) return false;
    if (state.completedFocuses.includes(node.id)) return false;
    if (!hasFocusRequirements(node, state.completedFocuses)) return false;
    if (node.mutuallyExclusive && node.mutuallyExclusive.some(ex => state.completedFocuses.includes(ex))) return false;

    if (node.canStart && !node.canStart(state)) return false;

    return true;
  };

  const handleNodeClick = (node: FocusNode) => {
    if (canStartFocus(node)) {
      startFocus(node.id);
    } else if (!state.completedFocuses.includes(node.id) && state.activeFocus?.id !== node.id) {
      triggerError();
    }
  };

  return (
    <div className="focus-tree-panel flex-1 flex flex-col relative overflow-hidden bg-zinc-950 border-x border-tno-border">
      <div className="focus-tree-status absolute top-4 left-4 z-10 bg-tno-panel border border-tno-border p-2" data-tour="focus-tree">
        <h2 className="text-tno-highlight font-bold tracking-widest">国家焦点</h2>
        <div className="focus-tree-legend" aria-label="国策状态图例"><span className="is-available">可选择</span><span className="is-locked">未解锁</span><span className="is-active">进行中</span><span className="is-completed">已完成</span></div>
        {state.currentFocusTree === 'phase1' && <div className="focus-route-hint"><strong>B3起义 · 愤怒 {state.stats.radicalAnger.toFixed(1)} / &gt;80</strong><br/>禁书、抗议国策与校园事件会提高激进愤怒；达到条件即可选择起义，无需完成整棵树。</div>}
        {state.currentFocusTree === 'treeA' && <div className="focus-route-hint"><strong>十字路口预判：{CROSSROADS_LABELS[getCrossroadsOutcome(state)]}</strong><br/>确认结算事件时按席位、团结与集权分流。可在代表大会查看条件；礼堂社团、演讲和工作组帮助维系地图上的支持。</div>}
        {state.activeFocus && (
          <div className="mt-2 text-xs">
            <div className="text-tno-text mb-1">正在研究: {currentNodes.find(n => n.id === state.activeFocus?.id)?.title}</div>
            <div className="w-full h-2 bg-zinc-900 border border-tno-border">
              <div 
                className="h-full bg-tno-highlight" 
                style={{ width: `${((state.activeFocus.totalDays - state.activeFocus.daysLeft) / state.activeFocus.totalDays) * 100}%` }}
              ></div>
            </div>
            <div className="text-right mt-1 text-tno-highlight">{state.activeFocus.daysLeft} 天剩余</div>
          </div>
        )}
      </div>

      <div 
        ref={containerRef}
        className={`focus-tree-canvas flex-1 overflow-auto relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${isSuperEventActive ? 'filter blur-md grayscale opacity-50 transition-all duration-1000' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {/* Grid Background */}
           <div className="absolute inset-0 pointer-events-none"
             style={{ width: canvasWidth, height: canvasHeight,
               backgroundImage: 'linear-gradient(rgba(145, 125, 91, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(145, 125, 91, 0.12) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        {/* Lines */}
           <svg className="absolute inset-0 pointer-events-none z-0" width={canvasWidth} height={canvasHeight}>
          {currentNodes.filter(node => !node.isHidden || !node.isHidden(state)).map(node => {
            if (!node.requires) return null;
            return node.requires.map(reqId => {
              const reqNode = currentNodes.find(n => n.id === reqId);
              if (!reqNode || (reqNode.isHidden && reqNode.isHidden(state))) return null;
              
              const isCompleted = state.completedFocuses.includes(reqId);
              const isAvailable = canStartFocus(node);
              const strokeColor = isCompleted ? '#a5ba8d' : (isAvailable ? '#cbb581' : '#4c4b43');
              const startX = reqNode.x + 82;
              const startY = focusY(reqNode) + 126;
              const endX = node.x + 82;
              const endY = focusY(node);
              const middleY = Math.min(endY - 2, startY + Math.max(2, (endY - startY) / 2));

              return (
                <path
                  key={`${reqId}-${node.id}`}
                  d={`M ${startX} ${startY} V ${middleY} H ${endX} V ${endY}`}
                  fill="none"
                  stroke={strokeColor} 
                  strokeWidth="2"
                  strokeDasharray={isCompleted ? undefined : '4 4'}
                />
              );
            });
          })}
        </svg>

        {/* Nodes */}
        <div className="absolute inset-0" style={{ width: canvasWidth, height: canvasHeight }}>
          {currentNodes.filter(node => !node.isHidden || !node.isHidden(state)).map(node => {
            const isCompleted = state.completedFocuses.includes(node.id);
            const isActive = state.activeFocus?.id === node.id;
            const isAvailable = canStartFocus(node);
            const status = isCompleted ? '已完成' : isActive ? '进行中' : isAvailable ? '可选择' : '未解锁';
            
            return (
              <div 
                key={node.id}
                role="button"
                tabIndex={0}
                aria-label={`${node.title}：${status}`}
                data-focus-status={status}
                data-sound={isAvailable ? 'focus' : isCompleted || isActive ? 'none' : 'error'}
                onMouseEnter={event => { cancelClose(); if (!isDragging) setHovered({ id: node.id, anchor: event.currentTarget }); }}
                onMouseLeave={scheduleClose}
                onFocus={event => { cancelClose(); setHovered({ id: node.id, anchor: event.currentTarget }); }}
                onBlur={scheduleClose}
                onClick={() => handleNodeClick(node)}
                onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleNodeClick(node); } }}
                className={`focus-art-node absolute select-none z-10 group hover:z-[100] ${isCompleted ? 'focus-art-node--completed' : isActive ? 'focus-art-node--active' : isAvailable ? 'focus-art-node--available cursor-pointer' : 'focus-art-node--locked'}`}
                style={{ left: node.x, top: focusY(node) }}
              >
                <FocusArt node={node} />
                <span className="focus-art-node__status">{status}</span>
                <div className="focus-art-node__title text-tno-text">{node.title}</div>
                <div className="focus-art-node__days">{node.days}D</div>
                {isActive && (
                  <div className="focus-art-node__progress" style={{ width: `${((state.activeFocus!.totalDays - state.activeFocus!.daysLeft) / state.activeFocus!.totalDays) * 100}%` }}></div>
                )}

                {/* A portal avoids clipping at the bottom of very large trees. */}
                {hovered?.id === node.id && !isDragging && <FocusHoverCard anchor={hovered.anchor} onEnter={cancelClose} onLeave={scheduleClose}>
                  <div className="flex items-center gap-2 mb-2 border-b border-tno-border pb-2">
                    <FocusArt node={node} compact />
                    <div className="min-w-0 flex-1"><div className="font-bold text-sm text-tno-text">{node.title}</div><div className="text-[10px] text-tno-text/60">{ART_KIND_LABELS[getStrategicArtKind(node.id, node.title)]} · 研究 {node.days} 天</div></div>
                  </div>
                  <div className="text-[11px] text-tno-text/80 mb-2 leading-relaxed whitespace-pre-line">{node.description}</div>

                  {node.requires && node.requires.length > 0 && (
                    <div className="mb-1.5">
                      <div className="text-[10px] font-bold text-tno-text mb-0.5">
                        前置国策（{OR_REQUIRE_FOCUS_IDS.has(node.id) ? '满足其一即可' : '全部需要满足'}）:
                      </div>
                      <ul className="text-[11px] space-y-0.5">
                        {node.requires.map((req, idx) => {
                          const reqNode = currentNodes.find(n => n.id === req);
                          const met = state.completedFocuses.includes(req);
                          return (
                            <li key={idx} className={`flex items-start gap-1 ${met ? 'text-tno-green' : 'text-tno-red'}`}>
                              <span className="shrink-0">{met ? '✓' : '✗'}</span>
                              <span>{reqNode?.title ?? req}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  {node.requiresText && node.requiresText.length > 0 && (
                    <div className="text-[10px] text-amber-200/90 mb-1.5">
                      <span className="font-bold text-amber-300">需要条件: </span>{node.requiresText.join('；')}
                    </div>
                  )}
                  {['reclaim_democracy', 'declare_victory'].includes(node.id) && (() => {
                    const progress = getCampusControlProgress(state);
                    return <div className={`text-[11px] mb-2 ${progress.remaining.length ? 'text-tno-red' : 'text-tno-green'}`} data-campus-control-progress>
                      <strong>全校控制：{progress.controlled}/{progress.total}</strong>
                      {progress.remaining.length > 0 && <p className="mt-1">尚未完成：{progress.remaining.slice(0, 5).map(tile => `${tile.name} ${formatControl(tile.control)}%`).join('；')}{progress.remaining.length > 5 ? `；另有${progress.remaining.length - 5}处` : ''}</p>}
                    </div>;
                  })()}
                  {node.canStart && !node.requiresText?.length && (
                    <div className="text-[10px] text-amber-200/70 mb-1.5">
                      <span className="font-bold text-amber-300/80">隐藏条件: </span>另有数值判定（悬浮不可见，达成后解锁）
                    </div>
                  )}

                  {node.effectsText && node.effectsText.length > 0 && (
                    <div className="mb-1.5">
                      <div className="text-[10px] font-bold text-tno-highlight mb-0.5">效果:</div>
                      <ul className="text-[11px] text-tno-text/85 list-disc list-inside space-y-0.5">
                        {node.effectsText.map((effect, idx) => (
                          <li key={idx}>{effect}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {node.mutuallyExclusive && (
                    <div className="text-[10px] text-tno-red border-t border-tno-red/30 pt-1">
                      <span className="font-bold">互斥:</span> {node.mutuallyExclusive.map(ex => currentNodes.find(n => n.id === ex)?.title ?? ex).join('、')}
                    </div>
                  )}
                </FocusHoverCard>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
