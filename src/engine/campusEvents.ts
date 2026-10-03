import { ALL_SUB_TILES, type GameEvent, type GameState } from '../types';
import { getCommandRoute } from '../data/commandRoutes';
import { LAWS, getLawSystem } from '../data/laws';
import { getCommandState } from './commandSystem';
import { getTileCtrl } from './tileHelpers';
import { FLAVOR_EVENTS } from '../data/flavorEvents';

type Stats = Partial<GameState['stats']>;
type Situation = { id: string; title: string; body: string; test: (s: GameState) => boolean; options: [string, Stats][]; teacher?: number };
const exhausted = (s: GameState) => s.stats.studentSanity < 55 || ['high_intensity', 'hengshui_schedule'].includes(getLawSystem(s.lawSystem).schedule);
const strict = (s: GameState) => ['panopticon', 'hengshui', 'strict'].includes(getLawSystem(s.lawSystem).discipline);
const yangHere = (s: GameState) => !s.flags.yang_yule_health_death && (s.leader.name === '杨玉乐' || s.advisors.some(a => a?.name === '杨玉乐'));
const always = () => true;

// 校园事务不是路线剧情的替代品；它们从实际制度与校园状态中产生。
export const CAMPUS_SITUATIONS: Situation[] = [
  { id: 'authorship', title: '教案上空着的署名', body: "青年教师把两份教案送到行政楼。一份是课堂记录，署着他的名字；另一份是送审稿，署名处写着负责人。两份内容几乎一样，找不出多少差别。\n\n教研组翻完，问了一句：这算谁的成果？他没有当场回答，只说想把归属定清楚。课堂上是他上的，送审稿却写着负责人的名字。\n\n两份材料放在桌上，教研组要求明确归属。他等一个答复，其他教师也在看：以后备出来的东西，名字该落在哪儿。", test: always, teacher: 5, options: [['按课堂记录公开署名', { pp: -8, ss: 3 }], ['保留负责人署名，补发教研津贴', { pp: -4, stab: 2, studentSanity: -2 }]] },
  { id: 'contraband', title: '没收物品的清单', body: "值班室的抽屉已经合不上了。手机、几本翻旧的小说、一副掉漆的耳机，全堆在没收袋里。家长在门口等，问什么时候可以把东西领回去。值班教师没直接开门，只说还要按程序来，怕把归还理解成撤销纪律。\n\n清单就压在台历下面，一件一件写着物品名称和没收日期。家长说自己不是来吵架的，只想知道孩子晚上怎么和家里联系。值班室一下子静了。东西还在这儿，每一项都得有交代。先交还，还是继续封存，今天总得定下来。", test: strict, options: [['登记后交还并明确使用时段', { pp: -6, ss: 4, stab: -1 }], ['继续封存，统一告知家长', { stab: 3, ss: -3, radicalAnger: 2 }]] },
  { id: 'tutoring', title: '围墙外的补课广告', body: '晚自习散场时，几张补课传单混进了家长群。培训机构承诺“内部资料”，年级组担心校园正在成为它的招生渠道。', test: s => s.stats.capitalPenetration >= 20, options: [['公开教辅来源，切断招生合作', { pp: -10, capitalPenetration: -6, ss: 3 }], ['签订透明合作协议', { pp: 12, capitalPenetration: 4, studentSanity: -2 }]] },
  { id: 'sports', title: '体育课没有响起的哨声', body: "体育老师站在操场边，点名册还夹在胳膊下。上课铃已经响过，跑道上没有人。他抬头看了看教学楼，那边教室的灯亮着，学生正低着头订正试卷。\n\n橱窗里两张课表都盖着章：一张写着体育课，一张安排的是复习。谁也没撕掉谁的，两个时段就这么撞在一起。他等了几分钟，没有吹哨。被占掉的那节课，该由哪张课表负责？老师没有走进教室去要人，只站在门口说，得给个说法。", test: exhausted, options: [['给体育课留下完整时段', { tpr: -25, studentSanity: 5, ss: 3 }], ['暂时让位于复习', { tpr: 35, studentSanity: -4, ss: -2 }]] },
  { id: 'letters', title: '意见箱里的未署名信', body: "意见箱里多出一封没有姓名的长信。写信的人逐条列出食堂排队、午休和值日的问题，写到具体班级时却把那一栏涂黑了。他不确定把这些说出去是否安全。\n\n信读过一遍，收信的人停在涂黑的那块上。逐条的问题是每天发生的事，排队、午休、值日，哪一样都不新鲜；涂黑的地方才说明写的人顾虑什么。", test: always, options: [['公布答复，保护匿名表达', { pp: -5, ss: 4, allianceUnity: 2 }], ['先交各班内部协调', { stab: 2, ss: -2 }]] },
  { id: 'rally', title: '誓师大会的空白节目单', body: '年级组准备了一场大会。学生提出用真实的学习经验替换齐声口号，组织者担心场面不够整齐。空白的节目单摆在两种期待之间。', test: s => getLawSystem(s.lawSystem).education !== 'quality_education', options: [['让学生讲自己的经验', { pp: -6, studentSanity: 4, ss: 2 }], ['按统一程序排练', { stab: 3, studentSanity: -3, radicalAnger: 2 }]] },
  { id: 'books', title: '图书角的去留', body: "有人要求清走班级图书角里“与考试无关”的书。借阅册被翻出来，上面显示，几位成绩下滑的学生几乎每天都来读书。\n\n提出清书的人说，图书角占地方，不如腾出来放教辅。负责登记的学生把册子推过去：他们来得比谁都勤。可成绩下滑和读书之间的关系，谁也没有定论。\n\n班主任没有当场表态。阅读与成绩之间该怎样权衡，还需要一个明确的答复。答复需要明确，班主任在等一个说法。", test: always, options: [['保留图书角', { pp: -4, studentSanity: 4, ss: 2 }], ['转移到图书馆统一管理', { stab: 2, ss: -1 }]] },
  { id: 'exams', title: '另一套试卷', body: '印刷室收到新的采购报价。宣传页强调题量和排名，却没有说明题目是否重复。备课组建议先用少量样卷检验教学效果。', test: s => getLawSystem(s.lawSystem).assessment !== 'project_assessment', options: [['做小范围试测再采购', { pp: -8, tpr: 45, studentSanity: 2 }], ['按套餐统一采购', { pp: -15, tpr: 110, capitalPenetration: 3, studentSanity: -3 }]] },
  { id: 'staff', title: '办公室里的空椅子', body: '一位青年教师递交了调岗申请。反复填报的表格占满了备课时间，同事们不愿把这件事简单归结为“吃不了苦”。', test: s => s.currentFocusTree === 'treeB' ? (s.yangYuleState?.teacherSupport ?? 100) < 55 : exhausted(s), teacher: 7, options: [['减掉重复报表，安排共同备课', { pp: -10, stab: 3 }], ['批准调岗，维持现行考核', { pp: 5, ss: -3, stab: -2 }]] },
  { id: 'petition', title: '家长群里的联名请求', body: '几位家长把孩子的作息记录拼成了一张表。他们没有要求降低升学目标，只要求学校解释：为什么同样的分数，需要越来越长的在校时间？', test: exhausted, options: [['召开公开说明会并留出休息', { pp: -10, ss: 5, studentSanity: 3 }], ['强调升学目标，继续现行安排', { stab: 3, radicalAnger: 4, studentSanity: -3 }]] },
  { id: 'clubs', title: '社团活动申请的最后一页', body: "学生为一场活动准备了几个星期。申请表上，场地、经费、安全负责人一栏一栏都填了，审批栏却一直空着。\n\n负责场地的老师看过表，说：“不是我不批，是得等上面定。”学生问等到什么时候，老师只答“等通知”。可通知已经等了好几天，准备的东西再拖就要作废。\n\n老师也不想再只回复“等通知”。场地在谁手里、安全谁签字，不是他一个人能定的。申请表停在那最后一页，学生还在等答复。", test: always, options: [['划出试办时段', { pp: -8, ss: 4, allianceUnity: 3 }], ['限定规模，先完成场地备案', { pp: -3, stab: 2, ss: 1 }]] },
  { id: 'alumni', title: '校友寄来的设备清单', body: '校友愿意捐赠一批旧电脑，但希望经费和使用情况向全校公开。设备并不昂贵，是否接受附带的公开监督，却让行政会上多了一轮讨论。', test: s => s.stats.stab >= 45 && s.stats.ss >= 40, options: [['接受捐赠并公开使用账目', { pp: 16, ss: 3, capitalPenetration: -2 }], ['由行政部门统一调配', { pp: 22, partyCentralization: 2, ss: -2 }]] },
  { id: 'health', title: '医务室的提醒', body: "杨玉乐的体检单夹在教研材料里，被翻材料的人先看见了。医生在几项指标上划了线，旁边写着“建议复查”。\n\n工作室的教师把单子抽出来放到他桌上。有人说这几项得去查，杨玉乐把单子合上，说材料还没弄完。有人接话：材料可以分着做，复查不能拖。\n\n杨玉乐习惯用保温杯顶着，可医生划的线不是喝水能划掉的。工作室提出替他承担一部分事务，腾出时间去复查。他还没有答应，也没有把单子扔进抽屉。分不分事务、查不查，都在这一两天定。", test: s => yangHere(s) && s.currentFocusTree === 'treeB' && (s.yangYuleState?.health ?? 100) < 60, teacher: 3, options: [['把事务分给工作室，安排复查', { pp: -12, stab: -1 }], ['暂缓复查，先完成材料', { pp: 6, studentSanity: -2 }]] },
  { id: 'thermos', title: '留在讲台上的保温杯', body: '杨玉乐把保温杯忘在了教室。学生们在杯旁留下一张纸条，没有模仿他的口头禅，只写着“老师，今天也早点休息”。一件小事打断了办公室惯常的训话。', test: yangHere, options: [['把纸条收进教案夹', { ss: 2, studentSanity: 3 }], ['提醒学生按时完成订正', { stab: 2, ss: -1 }]] },
  { id: 'winter', title: '结冰的上学路', body: '门卫收到几次迟到说明：桥面结冰，公交车停在半路。值日记录把这些学生列在同一张违纪表上，班主任请学校区分天气与纪律。', test: s => [11, 0, 1].includes(s.date.getMonth()), options: [['豁免天气迟到，开放暖房', { pp: -6, ss: 4, studentSanity: 2 }], ['调整到校时间，补齐值班', { pp: -3, stab: 3 }]] },
  { id: 'unrest', title: '熄灯后的走廊', body: '值班教师报告，学生在走廊里聚集讨论。他们的诉求来自最近几次未被回应的申请。保安在门口等候，学生代表则要求先把问题说完。', test: s => s.stats.stab < 45 || s.stats.ss < 35 || s.stats.radicalAnger > 55 || Object.keys(s.yangYuleState?.rebelLocations ?? {}).length > 0 && s.currentFocusTree === 'treeB', options: [['请代表带着诉求参加协调', { pp: -10, ss: 4, radicalAnger: -5, stab: 2 }], ['恢复秩序后再受理', { stab: 5, radicalAnger: 5, ss: -4 }]] },
  { id: 'canteen', title: '食堂窗口的账本', body: '菜单上的价格改了，分量却没有解释。学生递来几天的照片，食堂经理拿来采购账本。争论需要一场对照，而不是另一次互相指责。', test: always, options: [['让代表核对账目', { pp: -5, ss: 4, capitalPenetration: -2 }], ['行政约谈供餐商', { pp: -3, stab: 3 }]] },
  { id: 'supply', title: '印刷室最后一箱纸', body: "印刷室在当天的排程上画了红线。几个年级都要用卷，仓库里却只剩一批纸。\n\n管排程的人把单子摊开，说都印是不可能了。谁先印，谁后印，还是谁改用讲评，今天就得定。有的老师已经备好卷子，有的还在等。\n\n“先给哪个年级？”有人问，没有谁能马上回答。纸不够，时间也不够，排程上的红线一条压一条。协调批次，能少印一些重复的；紧急购买纸张，也得等纸到。两条路都要今天动，不然明天的课就没有着落。", test: s => s.stats.tpr < 300, options: [['协调批次，减少重复印刷', { pp: -10, tpr: 90, studentSanity: 3 }], ['紧急购买纸张', { pp: -20, tpr: 160, capitalPenetration: 2 }]] },
  { id: 'textbooks', title: '课本夹页里的报价单', body: '教辅采购单被夹进了发给学生的课本。报价上的折扣与家长实际支付的金额对不上，出版社联系人却只肯向行政负责人解释差额。', test: s => s.stats.capitalPenetration >= 35, options: [['公开采购合同，退还差额', { pp: -12, capitalPenetration: -8, ss: 5 }], ['私下谈判降低下次报价', { pp: 14, capitalPenetration: 3, ss: -3 }]] },
  { id: 'standing', title: '站着读完的早自习', body: '教室里实行了站立晨读。值班教师说声音更齐了，医务室却收到几张头晕的就诊记录。班长要求停止把身体疲惫当作态度问题。', test: s => strict(s) && exhausted(s), options: [['恢复坐读，个别指导', { pp: -5, studentSanity: 5, ss: 3 }], ['缩短站读时长，保留要求', { stab: 3, studentSanity: -2 }]] },
  { id: 'retirement', title: '抽屉里的退休申请', body: '杨玉乐翻到一份没签名的退休申请。评审材料还堆在旁边，同事劝他先决定哪些事务值得亲自完成，而不是把余下的身体也填进工作总结。', test: s => yangHere(s) && s.currentFocusTree === 'treeB' && (s.yangYuleState?.health ?? 100) < 45 && (s.yangYuleState?.titleStage ?? 0) >= 2, options: [['授权工作室承担日常事务', { pp: -10, ss: 3, stab: -1 }], ['把申请放回抽屉', { pp: 8, studentSanity: -2 }]] },
  { id: 'mockery', title: '传阅的英语讲义', body: '一份模仿杨玉乐口吻的英语讲义在学生间传阅，署名栏写着“被动语态研究小组”。内容里夹着对作息安排的具体批评，不能仅用一声训斥抹掉。', test: s => yangHere(s) && s.stats.ss < 55, options: [['回应批评，不追究戏仿', { pp: -6, ss: 4, radicalAnger: -3 }], ['追查印刷来源', { stab: 4, ss: -3, radicalAnger: 3 }]] },
  { id: 'informants', title: '没有证据的举报单', body: '值班室收到一张举报单，列出了几个学生的名字，却没有具体行为。被点名的人要求当面核实；交单的人只说“他们总是在一起讨论”。', test: s => strict(s) && (s.stats.stab < 55 || s.stats.radicalAnger > 40), options: [['逐条核实，不以名单定罪', { pp: -8, ss: 4, allianceUnity: 2 }], ['先登记观察', { stab: 3, radicalAnger: 4, studentSanity: -2 }]] },
];

// 保留原有路线人物风味；只在人物/制度仍适用时出现，同一篇全文仅一次。
const legacyGates: Record<string, (s: GameState) => boolean> = {
  wu_flavor_morning_call: s => !!s.wuState && s.wuState.martialLawLevel >= 1,
  wu_flavor_informer: s => s.stats.stab < 55,
  wu_flavor_black_market: s => s.stats.tpr < 300,
  wu_flavor_morning_run: exhausted,
  wu_flavor_camera: s => getLawSystem(s.lawSystem).discipline === 'panopticon',
  wu_flavor_wu_quotes: s => (s.wuState?.wuAmbition ?? 0) >= 30,
  wu_flavor_zhouchen_sketch: s => !s.flags.wu_zhouchen_suspension_fired,
  wu_flavor_shiji_notes: s => !!s.flags.haobang_commune_map_phase,
  lu_flavor_pump_room: s => !!s.flags.great_purge_map_phase,
  lu_flavor_confession_box: s => s.stats.partyCentralization >= 65,
  lu_flavor_loyalty_parade: s => s.stats.partyCentralization >= 50 && s.stats.allianceUnity < 55,
};
function availableLegacy(s: GameState) {
  const route = getCommandRoute(s).id;
  return Object.keys(legacyGates).filter(id => (route === 'wu' && id.startsWith('wu_') || route === 'purge' && id.startsWith('lu_')) && FLAVOR_EVENTS[id] && legacyGates[id](s) && !history(s).seen.includes(id));
}

const perspective: Record<string, string> = {
  opening: '校长室仍按旧程序传递文件，但学生和教师开始要求理由，而不仅是一枚公章。',
  revolution: '街垒后的临时委员会收到这份报告。承诺能否兑现，要从今天仍在上课的人开始。',
  democracy: '学生议会把问题列入议程。选票改变了权力的来源，却不能替代表们完成一次具体的协调。',
  reform: '题改委员会要求试点组记录处理结果：改革不能只留下成绩曲线，还要说明谁承担了代价。',
  commune: '公社代表把这份报告带到共同会议。不同派别对同一件小事的意见，也需要形成可执行的约定。',
  purge: '纪律机构要求在报告上标明责任人。人们斟酌着措辞，担心一项校园问题变成新的审查名单。',
  wu: '戒严指挥部收到值班报告。恢复安静的命令已经发过，老师仍然需要一个能在教室里解释的答案。',
  yang: '杨玉乐把材料压在保温杯下面。封安宝要的是学校继续运转，教师们等的却是一个可以照办的答复。',
  jidi: '联合管理局要求将问题换算为成本。报表能记录产出，却没有一栏能完整记录人的疲惫。',
  gouxiong: '礼堂里的临时联络员转来了报告。银幕外的校园还要继续生活，这一次不能用一条弹幕作答。',
};
export function campusStage(s: GameState): string {
  const route = getCommandRoute(s).id;
  if (route === 'yang') return ['代管时期', '教研材料筹备', '职称评审', '答辩准备', '公示时期'][Math.max(0, Math.min(4, s.yangYuleState?.titleStage ?? 0))];
  if (route === 'commune') return s.flags.haobang_commune_map_phase ? '公社建设' : '公社筹建';
  if (route === 'purge') return s.flags.great_purge_map_phase ? '地区整编' : '权力集中';
  if (route === 'democracy') return s.electionState ? '选区竞选' : s.parliamentState ? '议会运转' : '议会筹建';
  if (route === 'reform') return (s.reformState?.progress ?? 0) >= 50 ? '改革推广' : '基层试点';
  if (route === 'wu') return (s.wuState?.martialLawLevel ?? 0) >= 2 ? '全面戒严' : '秩序接管';
  if (route === 'jidi') return s.jidiCorporateState ? '企业管理' : '资本进驻';
  if (route === 'gouxiong') return s.flags.gx_anarchy_phase ? '地区混战' : '礼堂自治';
  return route === 'revolution' ? '革命阵地' : '风暴前夜';
}
const day = (s: GameState) => Math.floor(Date.UTC(s.date.getFullYear(), s.date.getMonth(), s.date.getDate()) / 86400000);
const history = (s: GameState): NonNullable<GameState['campusEvents']> => s.campusEvents ?? { seen: [], familyDays: {}, resolved: [] };
function context(s: GameState) {
  const route = getCommandRoute(s).id;
  const stage = campusStage(s);
  const mood = s.stats.ss < 40 ? '学生信任不足，代表要求公开回应。' : s.stats.stab < 45 ? '校园秩序尚未稳定，教师要求先明确执行安排。' : '校园暂时平稳，各方愿意先听取处理方案。';
  return { route, stage, mood, variant: `${route}/${stage}/${s.stats.ss < 40 ? 'distrust' : s.stats.stab < 45 ? 'unrest' : 'calm'}` };
}
export function availableCampusSituations(s: GameState, channel: 'daily' | 'document') {
  const h = history(s), c = context(s);
  return CAMPUS_SITUATIONS.filter(e => e.test(s) && !h.seen.includes(`${e.id}/${c.variant}`) && day(s) - (h.familyDays[e.id] ?? -Infinity) >= (channel === 'daily' ? 35 : 14));
}

function buildEvent(s: GameState, family: string, channel: 'daily' | 'document', restoreFieldChoice = false): GameEvent {
  const e = CAMPUS_SITUATIONS.find(e => e.id === family)!;
  const c = context(s), variant = `${family}/${c.variant}`;
  const tile = [...ALL_SUB_TILES].sort((a, b) => getTileCtrl(s.flags, b.id) - getTileCtrl(s.flags, a.id))[0];
  const laws = getLawSystem(s.lawSystem);
  const relevantLaw = ['sports', 'petition', 'staff'].includes(family) ? laws.schedule : ['contraband', 'unrest'].includes(family) ? laws.discipline : family === 'clubs' ? laws.clubs : laws.education;
  const stageText = c.route === 'yang' ? {
    '代管时期': '此时尚未进入评审流程，处理结果首先影响教师是否愿意配合代管。',
    '教研材料筹备': '工作室正在整理送审材料；这件事将决定教师是否愿意提供真实的课堂记录。',
    '职称评审': '评审组正在核对成果，办公室要求留下处理记录，而不是只报一个结论。',
    '答辩准备': '答辩材料接近定稿，教师们要求用实际处理结果支撑台上的教改承诺。',
    '公示时期': '材料进入公示，任何含糊的答复都可能成为异议；当事人要求可核查的解释。',
  }[c.stage] : `这份材料送到${c.stage}的负责人手中，处理结果将成为当前制度的一次具体检验。`;
  const event: GameEvent = {
    id: `campus:${variant}`, campusSituation: { family, variant, route: c.route, channel }, title: e.title,
    description: `${e.body}\n\n${perspective[c.route]}\n\n${stageText}\n${c.mood}\n\n现行制度：${LAWS[relevantLaw]?.name ?? relevantLaw}。地区反馈：${tile.name}。`,
    choices: e.options.map(([text, delta], index) => ({ id: `${e.id}_${index}`, text,
      previewText: preview(delta) + (c.route === 'yang' && e.teacher ? ` · 教师支持 ${index === 0 ? '+' + e.teacher : '-3'}` : '') + (family === 'health' ? ` · 健康 ${index === 0 ? '+10' : '-5'}` : '') + (c.route === 'yang' && (s.yangYuleState?.titleStage ?? 0) >= 1 ? ` · ${c.stage === '教研材料筹备' ? '教研成果' : '评审进度'} ${index === 0 ? '+2' : '-1'}` : ''),
      disabled: current => current.stats.pp < Math.max(0, -(delta.pp ?? 0)),
      effect: current => resolve(current, event, delta, index, e.teacher),
    })),
  };
  if (getCommandState(s).preparation?.[c.route] || restoreFieldChoice) event.choices!.push({
    id: 'field_coordination', text: '交由驻点工作组协调', previewText: '路线筹备 -1 · 学生支持 +4 · 稳定度 +3',
    disabled: current => getCommandRoute(current).id !== event.campusSituation!.route || !(getCommandState(current).preparation?.[event.campusSituation!.route as typeof c.route]),
    effect: current => {
      const route = event.campusSituation!.route as typeof c.route;
      const command = getCommandState(current), reserve = command.preparation?.[route] ?? 0;
      if (reserve < 1 || getCommandRoute(current).id !== route) return {};
      if (history(current).resolved.includes(event.campusSituation!.variant)) return {};
      return { ...resolve(current, event, { ss: 4, stab: 3 }, 0, undefined, false), command: { ...command, preparation: { ...command.preparation, [route]: reserve - 1 } } };
    },
  });
  // 缺乏政治点数时仍能离开电讯，防止所有付费选择都不可用而锁死游戏。
  event.choices!.push({ id: 'defer', text: '登记问题，暂缓处理', previewText: '学生支持 -1 · 不计入已批阅文件',
    effect: current => resolve(current, event, { ss: -1 }, 0, undefined, false, false),
  });
  return event;
}
const statNames: Record<string, string> = { pp: '政治点数', tpr: '试卷', ss: '学生支持', stab: '稳定度', studentSanity: '学生理智', allianceUnity: '联盟团结', partyCentralization: '集权', radicalAnger: '激进愤怒', capitalPenetration: '资本渗透' };
function preview(delta: Stats) { return Object.entries(delta).map(([key, value]) => `${statNames[key]} ${value! > 0 ? '+' : ''}${value}`).join(' · '); }
function resolve(s: GameState, event: GameEvent, delta: Stats, option: number, teacher?: number, followups = true, processed = true): Partial<GameState> {
  const meta = event.campusSituation!, h = history(s);
  if (h.resolved.includes(meta.variant) || s.stats.pp < Math.max(0, -(delta.pp ?? 0))) return {};
  const stats = { ...s.stats };
  for (const [key, value] of Object.entries(delta)) {
    const k = key as keyof typeof stats;
    stats[k] = Math.max(0, Math.min(k === 'pp' || k === 'tpr' ? Infinity : 100, stats[k] + value!));
  }
  const result: Partial<GameState> = { stats, campusEvents: { ...h, resolved: [...h.resolved, meta.variant] } };
  if (s.currentFocusTree === 'treeB' && s.yangYuleState && meta.route === 'yang') {
    const yy = { ...s.yangYuleState };
    if (teacher) yy.teacherSupport = Math.max(0, Math.min(100, yy.teacherSupport + (option === 0 ? teacher : -3)));
    if (meta.family === 'health' && teacher) yy.health = Math.max(0, Math.min(100, yy.health + (option === 0 ? 10 : -5)));
    if ((yy.titleStage ?? 0) >= 1 && followups) {
      if (yy.titleStage === 1) yy.studioAchievements = Math.max(0, Math.min(100, (yy.studioAchievements ?? 0) + (option === 0 ? 2 : -1)));
      else yy.titleProgress = Math.max(0, Math.min(100, (yy.titleProgress ?? 0) + (option === 0 ? 2 : -1)));
    }
    result.yangYuleState = yy;
    if (meta.channel === 'document' && processed) result.flags = { ...s.flags, yang_yule_decisions_clicked: (s.flags.yang_yule_decisions_clicked || 0) + 1 };
  }
  return result;
}
function draw(s: GameState, channel: 'daily' | 'document', random: () => number): GameState {
  const candidates = availableCampusSituations(s, channel).filter(e => channel !== 'document' || e.options.some(([, delta]) => s.stats.pp >= 5 + Math.max(0, -(delta.pp ?? 0))));
  if (!candidates.length) return s;
  const e = candidates[Math.min(candidates.length - 1, Math.max(0, Math.floor(random() * candidates.length)))];
  const event = buildEvent(s, e.id, channel), h = history(s);
  return { ...s, isPaused: true, activeEvent: event,
    stats: channel === 'document' ? { ...s.stats, pp: s.stats.pp - 5 } : s.stats,
    campusEvents: { ...h, lastEventDay: day(s), lastDocumentDay: channel === 'document' ? day(s) : h.lastDocumentDay, seen: [...h.seen, event.campusSituation!.variant], familyDays: { ...h.familyDays, [e.id]: day(s) } },
  };
}
const blocked = (s: GameState) => !!(s.activeEvent || s.activeStoryEvents.length || s.activeSuperEvent || s.activeMinigame || s.gameEnding);
export function canDrawCampusDocument(s: GameState): boolean {
  return s.currentFocusTree === 'treeB' && !!s.yangYuleState && !blocked(s) && s.stats.pp >= 5 && history(s).lastDocumentDay !== day(s) && availableCampusSituations(s, 'document').some(e => e.options.some(([, delta]) => s.stats.pp >= 5 + Math.max(0, -(delta.pp ?? 0))));
}
export function drawCampusDocument(s: GameState, random = Math.random): GameState { return canDrawCampusDocument(s) ? draw(s, 'document', random) : s; }
export function advanceCampusEvents(s: GameState, random = Math.random): GameState {
  if (blocked(s) || day(s) - (history(s).lastEventDay ?? -Infinity) < 10 || random() >= 0.06) return s;
  const legacy = availableLegacy(s);
  if (legacy.length && random() < .35) {
    const id = legacy[Math.min(legacy.length - 1, Math.max(0, Math.floor(random() * legacy.length)))], h = history(s);
    return { ...s, isPaused: true, activeEvent: FLAVOR_EVENTS[id], campusEvents: { ...h, lastEventDay: day(s), seen: [...h.seen, id] } };
  }
  return draw(s, 'daily', random);
}
// 保存中的文字保持原样，重新绑定 JSON 无法保存的选择效果和条件。
export function restoreCampusEvent(s: GameState, saved: GameEvent): GameEvent {
  const meta = saved.campusSituation;
  if (!meta || !CAMPUS_SITUATIONS.some(e => e.id === meta.family)) return saved;
  const generated = buildEvent(s, meta.family, meta.channel, !!saved.choices?.some(c => c.id === 'field_coordination'));
  generated.campusSituation = meta;
  const choices = (saved.choices ?? generated.choices!).map(choice => {
    const bound = generated.choices!.find(c => c.id === choice.id);
    if (!bound) return choice;
    return { ...bound, ...choice, disabled: bound.disabled, effect: current => {
      // 绑定生成时的变体标识，避免读档后阶段改变使计数失效。
      return bound.effect?.(current);
    } };
  });
  return { ...saved, choices };
}
