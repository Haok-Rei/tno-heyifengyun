import type { GameState, NationalSpirit } from '../types';
import { getLawSystem, LAW_CATEGORIES } from '../data/laws';

export type HeyiZone = 'sign' | 'gate' | 'building' | 'students' | 'teachers' | 'road' | 'trees' | 'guard';
export type HeyiRoute = 'opening' | 'democracy' | 'revolution' | 'despair' | 'reform' | 'haobang' | 'yang' | 'jidi' | 'jidi_riot' | 'gouxiong' | 'wu';
export type HeyiMood = 'ruin' | 'weary' | 'restless' | 'bright';
export type HeyiStatusTone = 'danger' | 'strained' | 'unsettled' | 'good';

export interface HeyiLightSnapshot {
  value: number;
  target: number;
  route: HeyiRoute;
  mood: HeyiMood;
  democraticVictory: boolean;
  headline: string;
  overview: string;
  accent: string;
  zones: Record<HeyiZone, { label: string; description: string; status: string; tone: HeyiStatusTone }>;
  spirit: NationalSpirit;
}

const clamp = (value: number) => Math.max(0, Math.min(100, value));
const safeNumber = (value: unknown, fallback: number) => typeof value === 'number' && Number.isFinite(value) ? value : fallback;

export function getHeyiRoute(state: GameState): HeyiRoute {
  const tree = state.currentFocusTree;
  const ending = state.gameEnding ?? '';
  if (ending === 'game_over_jidi_2' || (ending !== 'game_over_jidi_1' && (state.flags.jidi_riot_active || state.flags.jidi_riot_failed || state.jidiCorporateState?.riotState || tree === 'jidi_tree' && state.completedFocuses.includes('jidi_hidden_riot')))) return 'jidi_riot';
  if (tree === 'treeA_pan_despair' || ending === 'game_over_despair') return 'despair';
  if (tree === 'jidi_tree' || ending.startsWith('game_over_jidi')) return 'jidi';
  if (tree === 'gouxiong_tree' || ending === 'game_over_bear' || ending === 'gouxiong_usurpation') return 'gouxiong';
  if (tree === 'treeB' || ending === 'game_over_yang_yule_success') return 'yang';
  if (tree === 'treeA_haobang') return 'haobang';
  if (tree === 'treeA_lu_bohan' || tree.startsWith('wu_tree') || state.flags.wu_route_active) return 'wu';
  if (tree === 'treeA_true_left' || ['true_left_good', 'great_awakening', 'game_over_wang'].includes(ending)) return 'revolution';
  if (tree === 'treeA_pan' || ['game_over_pan', 'game_over_xu', 'game_over_juanhao'].includes(ending)) return 'democracy';
  if (tree === 'treeA' || tree === 'treeA_haobang_pre') return 'reform';
  return 'opening';
}

const ROUTE_SCENES: Record<HeyiRoute, {
  headline: string; overview: string; accent: string; target: number;
  descriptions: Record<HeyiZone, string>;
}> = {
  opening: {
    headline: '一座还在上课的学校', overview: '清晨七点，校门照常开启。谁也不知道这一天会从哪间教室开始失控。', accent: '#c18b55', target: 49,
    descriptions: {
      sign: '“合肥一中”的字亮得很准时。放学时，有一笔总是先暗下去。',
      gate: '伸缩门停在半开的地方。迟到的学生和巡视的主任都嫌它开得太慢。',
      building: '教学楼一层层亮起。最先亮的是高三，最后熄的也是高三。',
      students: '校服在人流里看起来一样。走近些，能分辨谁在背单词，谁把传单藏进了袖口。',
      teachers: '值班老师揣着登记簿站在门边；他认得不少学生，却未必记得他们的名字。',
      road: '送考的车、赶课的自行车和早餐摊的蒸汽，在门前拥成一条缓慢的河。',
      trees: '围墙边的树比保安更早知道季节变了。风一吹，落叶便越过了校规。',
      guard: '门卫室有两只杯子，一只泡茶，一只盛着没收来的学生证。',
    },
  },
  democracy: {
    headline: '他们开始讨论明天', overview: '校门口的告示栏贴着候选人的名字。争论仍在继续，放学铃后也没有人急着散去。', accent: '#8fae9c', target: 76,
    descriptions: {
      sign: '四个字底下挂着新选出的学生代表名单。有人把自己的名字念了三遍才相信。',
      gate: '门口不再挤着检查袖章的人。一次迟到，先被问到的终于是理由。',
      building: '一楼会议室亮到很晚。窗里有人争课表，也有人认真记下反对票。',
      students: '几个学生围着候选人的海报争得面红耳赤；争完又一起去食堂。',
      teachers: '老师站在学生议事桌旁，第一次得等举手才能插话。',
      road: '路边有人分发印着竞选纲领的纸。清洁工抱怨纸多，却留了一张给自己看。',
      trees: '树下的长椅被借去开班级会议。阴影正好遮住午后的太阳。',
      guard: '门卫把放行名单换成了访客登记。两页纸的差别，够他重新学一阵子。',
    },
  },
  revolution: {
    headline: '红旗曾在这里升起', overview: '每个人都说要让学校换一种活法。关于“换成什么”，门口的争论一天也没停过。', accent: '#bf6558', target: 60,
    descriptions: {
      sign: '横幅绕过校名四个字。有学生坚持把字露出来：他们要改变的不是学校的名字。',
      gate: '门的轨道上压着一面旧旗。今天谁能出入，得听临时委员会的安排。',
      building: 'B3的一扇窗挂出红布，另一扇窗还贴着期中考试安排。',
      students: '宣传队和纠察队从同一道门进出，认得彼此的脸，却不总认同彼此的话。',
      teachers: '教师代表抱着一摞新课纲穿过人群。谁来上第一堂课还没定下来。',
      road: '地上的粉笔箭头指向会场。昨夜雨一落，箭头便只剩一半。',
      trees: '树枝上系着红布条，褪色得很快。树下的争论倒是一点也没褪。',
      guard: '保卫室的钥匙交接了三次。桌上的旧登记簿仍无人敢扔。',
    },
  },
  despair: {
    headline: '铃声无人应答', overview: '窗户一扇接一扇黑下去。门外有脚步，门里却越来越听不见说话声。', accent: '#9d6d68', target: 13,
    descriptions: {
      sign: '校名还在，下面的玻璃碎了一角。雨水沿着裂缝流进“肥”字的笔画。',
      gate: '伸缩门歪在轨道外。夜里有人把它扶正，第二天又被推开。',
      building: 'B3楼道的灯只剩一半亮着，亮处照出墙上匆忙涂去的名字。',
      students: '留在学校的人不愿摘下书包；离开的人也不敢回头看门。',
      teachers: '讲台上的粉笔没有收走。排课表已经无人更新。',
      road: '路障把斑马线截成两段。救护车过去后，只剩一只单鞋。',
      trees: '叶子被烟熏成灰色。风吹过时，沙沙声像有人在撕考卷。',
      guard: '门卫室的灯常亮，屋里却看不见值班的人。',
    },
  },
  reform: {
    headline: '课表上的空白', overview: '改过的校规贴在门口，纸上还有未干的印章。有人已经按新规走进去了。', accent: '#a2ad84', target: 65,
    descriptions: {
      sign: '校名下多了一块小小的意见箱。第一天便塞满了纸条。',
      gate: '门照旧在七点开，但早到的学生可以先去图书馆，不必在队伍里等。',
      building: '实验室重新添了灯。走廊里偶尔传出讨论声，主任经过时停下听了几秒。',
      students: '有人抱着习题册，有人抱着社团海报。他们在同一条队伍里往前走。',
      teachers: '教师会议室开着门，窗台上摆了几份学生写的课程建议。',
      road: '道路还没变宽，早高峰却不再只剩催促声。',
      trees: '树下贴着新一季社团招募。风吹掉一角，两个学生把它重新按牢。',
      guard: '门卫的名单薄了些。少掉的名字不都是缺席，有些是终于得到信任。',
    },
  },
  haobang: {
    headline: '秩序重新议价', overview: '新领导的告示贴在旧告示上。学生读得仔细，因为每一句都可能在下周改口。', accent: '#bfa778', target: 58,
    descriptions: {
      sign: '校名旁挂着整洁的红蛤徽记，挂钩还是上届学生会留下的。',
      gate: '值守组改由不同派别轮流排班。每班都说自己那天门口最安静。',
      building: '行政楼会议室灯火通明。楼下学生用灯亮的时长猜测谈判进度。',
      students: '传单上印着“联合”。发传单的两个人，刚才还为席位吵过架。',
      teachers: '教师代表拿着会议通知穿过校门，先看了一眼署名，再决定去不去。',
      road: '校门前没有路障，取而代之的是长长的排队和更多张来回传递的纸。',
      trees: '树上的旧口号已被取下。钉痕仍在，新的横幅正在量尺寸。',
      guard: '门卫记住了每个新委员的脸；他们的头衔换得比值班表快。',
    },
  },
  yang: {
    headline: '办公室的灯亮着', overview: '值日表看似一切正常，晚自习也没有缺席。老师们却总往行政楼的窗户望。', accent: '#baa080', target: 36,
    descriptions: {
      sign: '校名四字被擦得发亮。门口的荣誉展示栏多了一块预留给“名师”的空位。',
      gate: '值班老师拿着表格逐个核对。校门开得很宽，进来的人却个个缩着肩。',
      building: '顶层办公室的灯比教室还晚熄。纸篓里是改了三次的评审材料。',
      students: '孩子们听到脚步便收起闲话。英语单词在嘴里背得整齐，眼睛却很困。',
      teachers: '老师排队等一个签字。队伍没动几步，评职称的消息已经传遍走廊。',
      road: '宣传车停在门前拍照时，早餐摊被要求往后挪。车走后它又推了回来。',
      trees: '树荫下常有老师低声交换消息，说到一半便各自翻开教案。',
      guard: '门卫室新添了检查表。来访者姓名一栏写满，离校时间却留着空白。',
    },
  },
  jidi: {
    headline: '成绩单像一道围墙', overview: '校门整洁，楼宇明亮，晨读准时开始。宣传屏上滚动着数字，没人知道它何时会停。', accent: '#c8a363', target: 39,
    descriptions: {
      sign: '“合肥一中”四字旁是一块电子榜。平均分每刷新一次，便有人停下脚步。',
      gate: '入口划了三条线：学生、教师和访客。每条线都有新的计时规则。',
      building: '教学楼的灯像表格一样整齐。没有熄灯的窗，是还没做完题的教室。',
      students: '书包背带压出深痕。有人边走边做题，抬头时已经过了校门。',
      teachers: '教师手里的平板实时记录课堂进度。以前的备课本仍锁在抽屉里。',
      road: '送学生的车流准确地在铃响前消散。路面上还留着昨晚的雨。',
      trees: '树被修成相同的高度。落叶不计入评比，所以只有扫地阿姨在乎。',
      guard: '门卫的桌面上有访客码、迟到码和一只快没电的扫码枪。',
    },
  },
  jidi_riot: {
    headline: '榜单烧穿了夜色', overview: '警报声越过教学楼。校门前的每个人都在寻找熟悉的脸，没人再看屏幕上的分数。', accent: '#de7751', target: 7,
    descriptions: {
      sign: '电子榜被浓烟熏黑，“合肥一中”仍从烟里露出四个字。',
      gate: '门栅倒了一半，另一半卡着烧焦的横幅。有人从缝里递水。',
      building: 'B3楼上有火。每隔几分钟，某扇窗后会出现手电筒的光。',
      students: '学生们喊名字寻找同伴。有的举着旗，有的只想把人带走。',
      teachers: '一位老师在路中央点人数，数到最后又从头开始。',
      road: '路面混着消防水、玻璃和散开的试卷。车灯照来，每一页都像白旗。',
      trees: '火星粘在树叶上。有人端来水桶，先浇树，再跑回楼里。',
      guard: '门卫室玻璃已碎，桌上那只登记簿还摊在今天。',
    },
  },
  gouxiong: {
    headline: '告示牌成了弹幕', overview: '有人把会议通知改成了梗图。笑声是真的，谁在签署决定却不太清楚。', accent: '#bb80bf', target: 59,
    descriptions: {
      sign: '四个字上贴了几枚贴纸，晚上又被人仔细揭下。校名每天经历一次整容。',
      gate: '进门的学生要猜今天的通行暗号。猜不出也能进，值班组只是想看反应。',
      building: '走廊屏幕一半显示课表，一半滚动着一场没人承认发起的投票。',
      students: '有人穿校服，有人披着演出服；他们并肩走进同一间教室。',
      teachers: '老师试着让学生关掉直播。三分钟后，他也凑过去看评论。',
      road: '门前画了巨大的粉笔表情。雨后只剩一边眼睛，仍有人停下来拍照。',
      trees: '树枝上挂着纸做的角色牌。风一吹，不认识角色的人也会抬头。',
      guard: '门卫室贴着“今日值班管理员”。海报每天换，钥匙却一直在原处。',
    },
  },
  wu: {
    headline: '每扇窗都有人注视', overview: '校门口平静得过分。秩序沿着地面的黄线铺开，谁越线，值班室的笔就动一下。', accent: '#8793a0', target: 24,
    descriptions: {
      sign: '校名下面挂着“文明秩序示范校”的铜牌。擦铜牌的人不敢留下指纹。',
      gate: '伸缩门每天只开到规定宽度。通行者的脚步也跟着排成了一列。',
      building: '楼道尽头加装了摄像头。窗内的学生记得监控拍不到的角落。',
      students: '队伍走得整齐。站在最后的人偷偷为前一个人捡起掉落的笔。',
      teachers: '教师点名册添了一栏“异常”。有人只在那一栏写了一个破折号。',
      road: '路口的锥桶摆出笔直的线。几辆车等绿灯，没人鸣笛。',
      trees: '树枝被修到看不见窗户。夜里有人在树根埋过一张纸条。',
      guard: '门卫室灯光白得发冷。换班交接比上课铃还要准时。',
    },
  },
};

const ZONE_LABELS: Record<HeyiZone, string> = {
  sign: '校名', gate: '校门', building: '教学楼', students: '学生',
  teachers: '教师', road: '门前马路', trees: '行道树', guard: '门卫室',
};

type Status = [string, HeyiStatusTone];
const MOOD_STATUS: Record<HeyiMood, Record<HeyiZone, Status>> = {
  ruin: {
    sign: ['斑驳难辨', 'danger'], gate: ['破损失守', 'danger'], building: ['残灯断窗', 'danger'],
    students: ['行尸走肉', 'danger'], teachers: ['踪影难寻', 'danger'], road: ['满地狼藉', 'danger'],
    trees: ['焦枝败叶', 'danger'], guard: ['空岗无灯', 'danger'],
  },
  weary: {
    sign: ['蒙尘失色', 'strained'], gate: ['戒备森严', 'strained'], building: ['灯火未歇', 'strained'],
    students: ['倦于奔命', 'strained'], teachers: ['疲于应付', 'strained'], road: ['车流拥堵', 'strained'],
    trees: ['疏于照料', 'strained'], guard: ['登记繁密', 'strained'],
  },
  restless: {
    sign: ['旧字犹存', 'unsettled'], gate: ['人流交错', 'unsettled'], building: ['窗灯参差', 'unsettled'],
    students: ['心绪浮动', 'unsettled'], teachers: ['议论未定', 'unsettled'], road: ['人来人往', 'unsettled'],
    trees: ['枝叶初展', 'unsettled'], guard: ['例行值守', 'unsettled'],
  },
  bright: {
    sign: ['明净如新', 'good'], gate: ['出入有序', 'good'], building: ['书声未断', 'good'],
    students: ['意气风发', 'good'], teachers: ['从容授课', 'good'], road: ['干净整洁', 'good'],
    trees: ['绿荫成行', 'good'], guard: ['笑语相迎', 'good'],
  },
};
const ROUTE_STATUS: Partial<Record<HeyiRoute, Partial<Record<HeyiZone, Status>>>> = {
  democracy: { sign: ['众议留名', 'good'], building: ['灯下辩论', 'good'], students: ['各抒己见', 'good'], teachers: ['平席共议', 'good'] },
  revolution: { sign: ['红旗高悬', 'unsettled'], gate: ['纠察轮值', 'unsettled'], students: ['奔走相告', 'unsettled'], road: ['粉笔指路', 'unsettled'] },
  despair: { gate: ['门户洞开', 'danger'], building: ['人去楼空', 'danger'], road: ['路障横陈', 'danger'] },
  reform: { building: ['新课试行', 'good'], students: ['各展所长', 'good'], trees: ['社团张榜', 'good'] },
  haobang: { sign: ['新徽高挂', 'unsettled'], gate: ['各方轮值', 'unsettled'], building: ['彻夜商议', 'unsettled'] },
  yang: { building: ['长夜未熄', 'strained'], students: ['噤声赶课', 'strained'], teachers: ['候签成队', 'strained'] },
  jidi: { sign: ['榜单滚动', 'strained'], building: ['通宵亮灯', 'strained'], students: ['埋首题海', 'strained'], road: ['准点清场', 'strained'] },
  jidi_riot: { sign: ['浓烟蔽字', 'danger'], gate: ['铁栅倾倒', 'danger'], students: ['四散寻人', 'danger'], road: ['水纸交杂', 'danger'] },
  gouxiong: { sign: ['贴纸更迭', 'unsettled'], students: ['笑闹成群', 'unsettled'], road: ['粉笔留痕', 'unsettled'] },
  wu: { gate: ['逐一查验', 'strained'], building: ['监控遍布', 'strained'], students: ['噤若寒蝉', 'danger'], guard: ['昼夜登记', 'strained'] },
};

function zoneStatus(state: GameState, route: HeyiRoute, mood: HeyiMood, zone: HeyiZone): Status {
  if (route === 'jidi_riot' || route === 'despair') return ROUTE_STATUS[route]?.[zone] ?? MOOD_STATUS.ruin[zone];
  if (zone === 'students' && safeNumber(state.stats.studentSanity, 50) < 25) return ['行尸走肉', 'danger'];
  if (zone === 'road' && safeNumber(state.stats.stab, 50) < 20) return ['满地狼藉', 'danger'];
  if (mood === 'ruin') return MOOD_STATUS.ruin[zone];
  if (mood === 'bright' && route !== 'wu' && route !== 'jidi' && route !== 'yang') return MOOD_STATUS.bright[zone];
  return ROUTE_STATUS[route]?.[zone] ?? MOOD_STATUS[mood][zone];
}

const MOOD_NOTES: Record<HeyiMood, string> = {
  ruin: '门前的清扫赶不上损坏的速度。',
  weary: '这座校园照常运转，疲惫藏在铃声的间隙。',
  restless: '有人开始停下脚步，看一眼身边发生的事。',
  bright: '放学后还有人愿意在校门口多待一会儿。',
};

export function getHeyiLightTarget(state: GameState): number {
  const laws = getLawSystem(state.lawSystem);
  const route = getHeyiRoute(state);
  const weights = LAW_CATEGORIES.map(category => {
    const index = category.levels.indexOf(laws[category.id]);
    return category.levels.length > 1 ? index / (category.levels.length - 1) : 0.5;
  });
  const openness = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
  const stats = state.stats;
  const stability = safeNumber(stats.stab, 50);
  const support = safeNumber(stats.ss, 50);
  const sanity = safeNumber(stats.studentSanity, 50);
  const unrest = safeNumber(stats.radicalAnger, 50);
  const routeBaseline = ROUTE_SCENES[route].target;
  let target = routeBaseline * 0.44 + openness * 100 * 0.21 + support * 0.12 + sanity * 0.12 + stability * 0.11;
  target -= Math.max(0, unrest - 60) * 0.11;
  if (state.flags.jidi_riot_active) target -= 12;
  if (state.flags.gx_anarchy_phase) target -= 9;
  if (state.electionState?.isActive) target += 4;
  if (state.gameEnding === 'game_over_pan') target += 11;
  if (state.gameEnding === 'game_over_despair' || state.gameEnding === 'game_over_anarchy') target -= 14;
  return Math.round(clamp(target) * 10) / 10;
}

/** One in-game day. The capped change keeps even a sudden political turn visibly gradual. */
export function advanceHeyiLight(state: GameState): number {
  const current = clamp(safeNumber(state.heyiLightValue, 50));
  const target = getHeyiLightTarget(state);
  const change = Math.max(-0.45, Math.min(0.45, (target - current) * 0.018));
  return Math.round(clamp(current + change) * 100) / 100;
}

export function getHeyiLightSnapshot(state: GameState): HeyiLightSnapshot {
  const value = Math.round(clamp(safeNumber(state.heyiLightValue, 50)));
  const route = getHeyiRoute(state);
  const mood: HeyiMood = value < 25 ? 'ruin' : value < 48 ? 'weary' : value < 72 ? 'restless' : 'bright';
  const scene = ROUTE_SCENES[route];
  const zones = Object.fromEntries((Object.keys(ZONE_LABELS) as HeyiZone[]).map(zone => {
    const [status, tone] = zoneStatus(state, route, mood, zone);
    return [zone, {
      label: ZONE_LABELS[zone], description: `${scene.descriptions[zone]}${zone === 'gate' ? ` ${MOOD_NOTES[mood]}` : ''}`,
      status, tone,
    }];
  })) as HeyiLightSnapshot['zones'];
  return {
    value, target: getHeyiLightTarget(state), route, mood, democraticVictory: state.gameEnding === 'game_over_pan', headline: scene.headline,
    overview: scene.overview, accent: scene.accent, zones,
    spirit: {
      id: 'heyi_light', name: '合一之光', type: 'neutral', icon: 'campus',
      description: `合一值 ${value}/100。校门内外的景象随校园生活缓慢变化。`,
    },
  };
}
