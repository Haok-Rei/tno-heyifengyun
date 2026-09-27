import type { ModifierValues } from '../engine/gameLoop';

/**
 * data/laws.ts (v8.11) — 校内法案系统（钢铁雄心4法案制）
 *
 * 六类法案，每类一条等级链。当前等级以动态精神形式每日生效
 * （law_spirit_<category>），切换任意等级消耗 150 PP。
 * 部分剧情/国策会强制改写法案（免费且不受PP限制）。
 */

export interface Law {
  id: string;
  /** 等级名称 */
  name: string;
  /** 风味描述 */
  flavor: string;
  /** 每日修正值（动态精神 effects） */
  effects: Partial<ModifierValues>;
  /** 顾问雇佣费系数（人事法案专用，默认 1） */
  advisorCostMult?: number;
}

export interface LawCategory {
  id: 'discipline' | 'schedule' | 'personnel' | 'education' | 'assessment' | 'clubs';
  name: string;
  desc: string;
  /** 等级 id，从「最严」到「最宽」排序 */
  levels: string[];
}

export type LawSystemState = Record<LawCategory['id'], string>;

export const LAW_CATEGORIES: LawCategory[] = [
  {
    id: 'discipline',
    name: '纪律法案',
    desc: '校园秩序管制的松紧程度',
    levels: ['panopticon', 'hengshui', 'strict', 'normal', 'partial_autonomy', 'full_autonomy'],
  },
  {
    id: 'schedule',
    name: '作息法案',
    desc: '上课与自习时长的分配',
    levels: ['hengshui_schedule', 'high_intensity', 'standard_schedule', 'flexible_schedule', 'free_schedule'],
  },
  {
    id: 'personnel',
    name: '人事法案',
    desc: '谁来决定内阁与人事任命',
    levels: ['principal_decree', 'director_committee', 'teacher_council', 'student_assembly_hr'],
  },
  {
    id: 'education',
    name: '教育法案',
    desc: '应试与素质教育的权重',
    levels: ['exam_above_all', 'exam_first', 'balanced', 'quality_education'],
  },
  { id: 'assessment', name: '考试与试卷', desc: '周测、月考及教辅的使用强度', levels: ['daily_testing', 'weekly_testing', 'monthly_review', 'project_assessment'] },
  { id: 'clubs', name: '社团与课外活动', desc: '活动时间和社团申请的审批尺度', levels: ['clubs_frozen', 'clubs_supervised', 'clubs_open', 'student_clubs'] },
];

export const LAWS: Record<string, Law> = {
  daily_testing: { id: 'daily_testing', name: '每日统测', flavor: '每天一套卷，成绩排名实时公示。试卷消耗巨大，学生也更容易透支。', effects: { tprDaily: -2, studentSanityDaily: -0.25, ssDaily: -0.12 } },
  weekly_testing: { id: 'weekly_testing', name: '每周周测', flavor: '每周集中测验一次，平日以课堂练习与讲评为主。这是开学时教务处常见的安排。', effects: { tprDaily: -0.5, studentSanityDaily: -0.08 } },
  monthly_review: { id: 'monthly_review', name: '月考与订正', flavor: '月考之后留下充分时间订正错题，减少重复印卷。', effects: { tprDaily: 0.8, studentSanityDaily: 0.1, ssDaily: 0.08 } },
  project_assessment: { id: 'project_assessment', name: '项目评价', flavor: '课程展示和长期项目进入评价体系，纸笔测验不再独占话语权。', effects: { tprDaily: 1.5, studentSanityDaily: 0.2, ssDaily: 0.16 } },
  clubs_frozen: { id: 'clubs_frozen', name: '暂停社团', flavor: '教室与操场优先用于备考。社团只能存在于毕业照里。', effects: { tprDaily: 1, ssDaily: -0.2, studentSanityDaily: -0.12 } },
  clubs_supervised: { id: 'clubs_supervised', name: '审批制活动', flavor: '社团需提前报备，活动频率受限；学校仍会举行少量常规活动。', effects: { stabDaily: 0.05, studentSanityDaily: 0.04 } },
  clubs_open: { id: 'clubs_open', name: '定期开放', flavor: '社团可以固定时间使用教室、礼堂和操场。', effects: { ssDaily: 0.12, studentSanityDaily: 0.12, allianceUnityDaily: 0.05, tprDaily: -0.5 } },
  student_clubs: { id: 'student_clubs', name: '学生自治社团', flavor: '活动主题与经费由学生自行商议，新的社团不断出现。', effects: { ssDaily: 0.22, studentSanityDaily: 0.18, allianceUnityDaily: 0.1, tprDaily: -1 } },
  // ============ 纪律法案 ============
  panopticon: {
    id: 'panopticon',
    name: '全景监狱',
    flavor: '每层走廊的监控探头全天候运转，量化评分精确到每一次抬头。没有人敢在教室之外多停留一秒——秩序本身，就是最高目的。',
    effects: { stabDaily: 0.6, ssDaily: -0.8, studentSanityDaily: -0.4, radicalAngerDaily: 0.3, ppDaily: 0.2 },
  },
  hengshui: {
    id: 'hengshui',
    name: '衡水模式',
    flavor: '起床铃、跑操、晨读、刷题、熄灯——每一分钟都被写进作息表。这里不是学校，是一座以升学率为唯一产量的工厂。',
    effects: { stabDaily: 0.3, ssDaily: -0.4, studentSanityDaily: -0.2, tprDaily: 2 },
  },
  strict: {
    id: 'strict',
    name: '高压管理',
    flavor: '量化分、巡查队、通报批评依旧存在，但偶尔允许课间在走廊喘口气。学生把这称为「恩赐」，而校方把这称为「弹性」。',
    effects: { stabDaily: 0.2, ssDaily: -0.2, tprDaily: 1 },
  },
  normal: {
    id: 'normal',
    name: '常规管理',
    flavor: '校规写在墙上，处分单锁在柜子里。只要不越线，没人会特意来找你的麻烦——这在合一，已经算是一种奢侈。',
    effects: { stabDaily: 0.1, ssDaily: 0.1 },
  },
  partial_autonomy: {
    id: 'partial_autonomy',
    name: '部分自治',
    flavor: '学生会开始拥有真正的否决权：处分决定需要听证，社团活动不再需要「先报备再悔过」。校方依然存在，但不再无处不在。',
    effects: { stabDaily: -0.1, ssDaily: 0.3, studentSanityDaily: 0.1, allianceUnityDaily: 0.2 },
  },
  full_autonomy: {
    id: 'full_autonomy',
    name: '全面自治',
    flavor: '校规由学生代表大会表决，保安队撤出教学楼。自由像开闸的水——同时也冲刷出了补课机构的传单，和某些来路不明的商业赞助。',
    effects: { stabDaily: -0.3, ssDaily: 0.5, studentSanityDaily: 0.2, allianceUnityDaily: 0.4, capitalPenetrationDaily: 0.2 },
  },

  // ============ 作息法案 ============
  hengshui_schedule: {
    id: 'hengshui_schedule',
    name: '衡水作息',
    flavor: '早五晚十一，午休三十分钟，晚自习到十点半。熄灯后的宿舍楼安静得像停尸房，只有被窝里手电筒的光还在游动。',
    effects: { tprDaily: 5, studentSanityDaily: -0.5, ssDaily: -0.3, stabDaily: 0.2 },
  },
  high_intensity: {
    id: 'high_intensity',
    name: '高强度作息',
    flavor: '早六晚十，课间压缩到八分钟。学生抱怨睡眠不足，老师抱怨课时不够，教务处永远在抱怨「时间都去哪了」。',
    effects: { tprDaily: 3, studentSanityDaily: -0.3, ssDaily: -0.2 },
  },
  standard_schedule: {
    id: 'standard_schedule',
    name: '标准作息',
    flavor: '早七晚九，晚自习自愿登记。这是其他学校再普通不过的时间表，在合一的校史上却需要一场漫长的拉锯才能换来。',
    effects: { tprDaily: 1, studentSanityDaily: 0.1 },
  },
  flexible_schedule: {
    id: 'flexible_schedule',
    name: '弹性作息',
    flavor: '晚自习改为社团时间，图书馆延长开放。成绩单上的数字开始松动，但操场上传来了久违的吉他声。',
    effects: { tprDaily: -2, ssDaily: 0.4, studentSanityDaily: 0.3 },
  },
  free_schedule: {
    id: 'free_schedule',
    name: '自由作息',
    flavor: '没有统一课表，没有强制自习。有人用它刷题到凌晨，有人用它看完了这辈子最多的电影。自由从来不是免费的。',
    effects: { tprDaily: -5, ssDaily: 0.6, studentSanityDaily: 0.4, radicalAngerDaily: -0.2 },
  },

  // ============ 人事法案 ============
  principal_decree: {
    id: 'principal_decree',
    name: '校长一言堂',
    flavor: '所有任命由校长室一纸文件决定。内阁成员更像御前行走，好处是政令畅通，坏处是——谁能上桌，全凭一个人在办公室里的好恶。',
    effects: { ppDaily: 0.5, partyCentralizationDaily: 0.3 },
    advisorCostMult: 1.5,
  },
  director_committee: {
    id: 'director_committee',
    name: '主任委员会',
    flavor: '年级部主任们组成的联席会议审批人事。保守、缓慢、讲究「程序」，但至少比一个人的心情可靠一点。',
    effects: { ppDaily: 0.1, stabDaily: 0.1 },
    advisorCostMult: 1.0,
  },
  teacher_council: {
    id: 'teacher_council',
    name: '教师代表制',
    flavor: '教师代表拥有提名权，老教师们终于不用再把意见咽回肚子里。人事决定慢了一些，但被选中的人至少在同事中说得上话。',
    effects: { ssDaily: 0.2, stabDaily: 0.05 },
    advisorCostMult: 0.8,
  },
  student_assembly_hr: {
    id: 'student_assembly_hr',
    name: '学生评议会',
    flavor: '内阁人选需要过学生代表大会的质询。年轻的面孔站上讲台接受提问，答得不好真的会被投下来——权力的滋味，原来也烫嘴。',
    effects: { ppDaily: -0.2, allianceUnityDaily: 0.3, partyCentralizationDaily: -0.3 },
    advisorCostMult: 0.6,
  },

  // ============ 教育法案 ============
  exam_above_all: {
    id: 'exam_above_all',
    name: '应试至上',
    flavor: '体育课只存在于课表上，音乐教室的锁已经锈死。一切与分数无关的事物都被贴上「浪费时间」的标签——包括发呆。',
    effects: { tprDaily: 3, ssDaily: -0.3, studentSanityDaily: -0.2, capitalPenetrationDaily: 0.1 },
  },
  exam_first: {
    id: 'exam_first',
    name: '应试为主',
    flavor: '分数依然是硬通货，但社团可以「在不影响成绩的前提下」存在。前提两个字，是永远悬在头顶的刀。',
    effects: { tprDaily: 2, ssDaily: -0.1, studentSanityDaily: -0.1 },
  },
  balanced: {
    id: 'balanced',
    name: '素质并重',
    flavor: '竞赛、体育、艺术与刷题被摆在同一条起跑线上。教务处因此多开了很多会，学生们因此多长了不少见识。',
    effects: { tprDaily: -1, ssDaily: 0.2, studentSanityDaily: 0.2 },
  },
  quality_education: {
    id: 'quality_education',
    name: '素质教育',
    flavor: '课堂讨论取代题海战术，评价体系里第一次出现了「创造力」这一栏。有人为此欢呼，也有家长在校门口举着成绩单流泪。',
    effects: { tprDaily: -3, ssDaily: 0.5, studentSanityDaily: 0.4, radicalAngerDaily: -0.1 },
  },
};

/** 开局默认法案（2023-09-01 封安宝时代） */
export const DEFAULT_LAW_SYSTEM: LawSystemState = {
  discipline: 'strict',
  schedule: 'high_intensity',
  personnel: 'director_committee',
  education: 'exam_first',
  assessment: 'weekly_testing',
  clubs: 'clubs_supervised',
};

/** 切换法案的消耗 */
export const LAW_CHANGE_COST = 150;

/** 安全读取当前法案（兼容旧存档） */
export function getLawSystem(lawSystem: LawSystemState | undefined): LawSystemState {
  if (!lawSystem) return { ...DEFAULT_LAW_SYSTEM };
  const result = { ...DEFAULT_LAW_SYSTEM, ...lawSystem };
  // 非法等级回退默认
  (Object.keys(result) as (keyof LawSystemState)[]).forEach(k => {
    const cat = LAW_CATEGORIES.find(c => c.id === k);
    if (cat && !cat.levels.includes(result[k])) result[k] = DEFAULT_LAW_SYSTEM[k];
  });
  return result;
}
