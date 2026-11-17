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
  { id: 'authorship', title: '教案上空着的署名', body: "青年教师把两份装订好的教案并排放在行政楼的办公桌上。左边是熬了几个通宵写出来的原始随堂听课记录，右边则是刚打印出来的市级评优送审清样。除了封面第一作者那一栏被换成了教研组负责人的名字，里面连标点符号和板书插图都分毫不差。\n\n整个英语教研组的人都低着头假装批改卷子，但余光全定在这张桌面上。那名刚入职两年的年轻老师没有吵闹，只是指着封面问了一句：“如果连随堂教案都要按行政级别挂名，那下个月的公开课，是不是也不用我们备了？”", test: always, teacher: 5, options: [['按课堂记录公开署名', { pp: -8, ss: 3 }], ['保留负责人署名，补发教研津贴', { pp: -4, stab: 2, studentSanity: -2 }]] },
  { id: 'contraband', title: '没收物品的清单', body: "保卫科值班室的铁皮柜已经塞得合不上门。贴着封条的智能手机、翻卷了边的科幻杂志、还有十几副缠成一团的耳机，全按班级装在透明塑封袋里。几名家长从晚自习放学就等在走廊上，隔着防盗窗要求把孩子的通讯工具领回去。\n\n值班干事压着那本厚厚的《违纪物品暂扣台账》不敢松口——上面刚发话要严抓晚自习纪律，这时候退东西无异于自打嘴巴。可门外的家长把话挑得很明：“学校全封闭管理，孩子半夜突发高烧联系不上家里，这个责任是政教处担，还是你们值班室担？”", test: strict, options: [['登记后交还并明确使用时段', { pp: -6, ss: 4, stab: -1 }], ['继续封存，统一告知家长', { stab: 3, ss: -3, radicalAnger: 2 }]] },
  { id: 'tutoring', title: '围墙外的补课广告', body: "晚自习下课铃刚响，校门口的电动车流里就塞满了铜版纸印刷的培优传单。更让各班班主任坐不住的是，连年级家长微信群里都开始有人匿名转发同一家校外机构的链接，标题赫然写着“合一教研组核心题库同步精讲，内部名额买断”。\n\n几位老教师拿着传单找到年级部，发现上面印着的三道例题，竟然和明天周考尚未启封的压轴题只改了几个数字。校外资本的触角显然已经顺着油印室或备课组的裂缝钻进了课堂。", test: s => s.stats.capitalPenetration >= 20, options: [['公开教辅来源，切断招生合作', { pp: -10, capitalPenetration: -6, ss: 3 }], ['签订透明合作协议', { pp: 12, capitalPenetration: 4, studentSanity: -2 }]] },
  { id: 'sports', title: '体育课没有响起的哨声', body: "体育老师夹着点名册和秒表站在塑胶跑道边，预备铃已经响过五分钟，操场上却连半个人影都看不见。他抬头望向B3教学楼，三楼那几间本该下楼集合的教室依然亮着惨白的日光灯，窗户里隐约传出理综老师讲评试卷的扩音器声。\n\n教务处橱窗里同时贴着两张盖了红章的通知：一张是学期初排定的国家体质健康测试课表，另一张则是年级部昨天刚贴上去的“联考前机动自习统筹安排”。体育老师把哨子攥在手心里，直接走上行政楼讨个说法——究竟哪一枚公章才算学校承认的课表。", test: exhausted, options: [['给体育课留下完整时段', { tpr: -25, studentSanity: 5, ss: 3 }], ['暂时让位于复习', { tpr: 35, studentSanity: -4, ss: -2 }]] },
  { id: 'letters', title: '意见箱里的未署名信', body: "开锁清理一楼大厅的铁皮意见箱时，在一沓废纸团底下翻出了一封足有四页的方格稿纸信。写信人用极其工整的衡水体，逐条列出了近期二楼食堂窗口克扣菜量、午休查寝手电筒晃眼、以及量化扣分不公示明细等七项问题。\n\n耐人寻味的是，信件末尾原本写着班级和学号的位置，被人用碳素笔反复涂成了一块戳破纸背的黑疙瘩。在这座连课间多站三十秒都要被记名的校园里，写信人把事实核对得像实验报告一样详实，唯独不敢相信那个印在意见箱上的“保密承诺”。", test: always, options: [['公布答复，保护匿名表达', { pp: -5, ss: 4, allianceUnity: 2 }], ['先交各班内部协调', { stab: 2, ss: -2 }]] },
  { id: 'rally', title: '誓师大会的空白节目单', body: "距离百日誓师大会只剩三天，政教处送来的流程表却还在学生代表发言那一栏留着空白。按照往年的惯例，台词早就由语文组润色妥当，无非是挥拳高喊“苦战百天、拿命换分”的狼性口号。\n\n然而今年被选派上台的几名高三学生代表却集体拒绝背诵原稿，他们递交了一份自己撰写的发言提纲，要求在台上谈一谈连轴转的周考是如何拖垮全班睡眠效率的。督导主任认为这种发言会“动摇军心”，而各班学生已经在私下传阅那份原稿，等着看台上到底会响起真话还是录音机。", test: s => getLawSystem(s.lawSystem).education !== 'quality_education', options: [['让学生讲自己的经验', { pp: -6, studentSanity: 4, ss: 2 }], ['按统一程序排练', { stab: 3, studentSanity: -3, radicalAnger: 2 }]] },
  { id: 'books', title: '图书角的去留', body: "高三年级例会上，有人提议撤掉各班教室后排的图书角，理由是书架上那几本《百年孤独》和旧刊《南方周末》“既不考阅读理解，又容易让学生在晚自习分心”，不如全部腾空用来码放待发的理综套卷。\n\n各班图书管理员却把翻烂的借阅登记本拍在了讲台上：最近三次月考排名掉出前两百名的十几位学生，几乎每天课间都要去书架前翻上几页，那是他们全天十四个小时题海里唯一不用面对红叉的十分钟。是把这最后半平米的喘息之地也改造成卷子仓库，还是留给学生一口缓气的余地，各班班主任都在等上面拍板。", test: always, options: [['保留图书角', { pp: -4, studentSanity: 4, ss: 2 }], ['转移到图书馆统一管理', { stab: 2, ss: -1 }]] },
  { id: 'exams', title: '另一套试卷', body: "油印室清早收到了一份加急送来的教辅征订报价单。推销方打着“省命题组外围专家封闭押题”的旗号，要求全年级一次性打包采购三十套冲刺密卷。\n\n然而数学备课组长只抽查了其中两份样卷，就发现里面有近四成的题目是从三年前的外省联考卷里原封不动剪贴过来的，连印刷错漏的公式角标都没改。一边是推销方暗示的丰厚教研返点与现成的题量指标，另一边则是备课组要求先做小范围实测、拒绝拿劣质重题消耗学生精力的抗议。", test: s => getLawSystem(s.lawSystem).assessment !== 'project_assessment', options: [['做小范围试测再采购', { pp: -8, tpr: 45, studentSanity: 2 }], ['按套餐统一采购', { pp: -15, tpr: 110, capitalPenetration: 3, studentSanity: -3 }]] },
  { id: 'staff', title: '办公室里的空椅子', body: "高三英语组靠窗的那张办公桌今天早上空了出来，桌面上只压着一份签好字的岗位调动申请。递交申请的青年骨干教师上个月刚带出全年级单科第一，却在昨晚批完最后一套周考卷后，把整整三摞《精细化教学量化评估表》《晚自习巡班精确到分打卡记录》留在了教务处门口。\n\n教研室里的气氛压抑得像要下雨。老教师们谁也没去劝，反而有人冷冷地说了一句：“备一节课四十分钟，填证明自己备过课的表格要两个小时——再这么折腾下去，空出来的可就不止这一张椅子了。”", test: s => s.currentFocusTree === 'treeB' ? (s.yangYuleState?.teacherSupport ?? 100) < 55 : exhausted(s), teacher: 7, options: [['减掉重复报表，安排共同备课', { pp: -10, stab: 3 }], ['批准调岗，维持现行考核', { pp: 5, ss: -3, stab: -2 }]] },
  { id: 'petition', title: '家长群里的联名请求', body: "周日深夜，一张由四十多位高三家长共同整理对比的Excel长图在各个班级群里刷了屏。表格把本学期三次校内统考的平均分与每日强制在校时长并排拉出了折线：学生的睡眠时间从六个小时被一路挤压到不足四个半小时，而全校理综平均分却反常地倒退了七分。\n\n家长们的措辞极其克制，没有一个人提“减负”或“素质教育”，只在联名信末尾提了一个让教务处难以招架的问题：“既然边际效益已经跌成负数，学校究竟是在帮孩子提分，还是在用坐牢的时间长度向领导交差？”", test: exhausted, options: [['召开公开说明会并留出休息', { pp: -10, ss: 5, studentSanity: 3 }], ['强调升学目标，继续现行安排', { stab: 3, radicalAnger: 4, studentSanity: -3 }]] },
  { id: 'clubs', title: '社团活动申请的最后一页', body: "几个高二社团联合筹备了一个月的校园展演，场地消防预案、器材清单和自筹经费明细足足订了十页，唯独卡在最后一页的“行政终审签章”上动弹不得。\n\n团委负责对接的老师把申请表推了回来，苦笑着指了指天花板：“不是团委卡你们，现在谁签字谁就要为‘耽误备考氛围’担责，上面没发话，这章谁敢落下去？”桌对面的社团社长没有把表收走，只反问了一句：如果连走完所有合规流程的申请都只能换来一句“等通知”，那学生以后是不是也不必再走流程了？", test: always, options: [['划出试办时段', { pp: -8, ss: 4, allianceUnity: 3 }], ['限定规模，先完成场地备案', { pp: -3, stab: 2, ss: 1 }]] },
  { id: 'alumni', title: '校友寄来的设备清单', body: "一位早年从合一毕业、如今在长三角经营科技公司的校友主动联系校办，表示愿意无偿捐赠六十台高配台式机，用来替换实验楼机房里那批开机都要五分钟的老爷机。\n\n捐赠协议只有一个附加条款：所有电脑的资产编号、配置去向以及后续机房向学生开放的时长记录，必须每月在校园公告栏向全体师生公示，严禁挪用为行政办公电脑或锁在机房里充当迎检摆设。面对这笔不要白不要、却等于把监督探头架在后勤处头上的捐赠，行政例会上吵成了两派。", test: s => s.stats.stab >= 45 && s.stats.ss >= 40, options: [['接受捐赠并公开使用账目', { pp: 16, ss: 3, capitalPenetration: -2 }], ['由行政部门统一调配', { pp: 22, partyCentralization: 2, ss: -2 }]] },
  { id: 'health', title: '医务室的提醒', body: "市直机关医院寄来的教职工复检通知单混在一摞待签批的维稳简报里，被名师工作室的年轻干事整理文件时翻了出来。心电图与脑血流图那一栏印着加粗的黑字：“频发性房性早搏、脑供血不足，建议立即停止高负荷伏案并住院排查。”\n\n杨玉乐不动声色地伸手把化验单折成两半，顺手压进那只掉漆的保温杯底下，嘴里还念叨着下周送往省厅的教改汇编不能耽搁。工作室的几位老同事却罕见地没有顺着他的话往下接——谁都看得出来他这两天上楼时扶着栏杆喘气的样子，再硬撑下去，怕是正高级的批文还没下来，人就先倒在讲台上了。", test: s => yangHere(s) && s.currentFocusTree === 'treeB' && (s.yangYuleState?.health ?? 100) < 60, teacher: 3, options: [['把事务分给工作室，安排复查', { pp: -12, stab: -1 }], ['暂缓复查，先完成材料', { pp: 6, studentSanity: -2 }]] },
  { id: 'thermos', title: '留在讲台上的保温杯', body: "下午最后一节英语课拖了五分钟堂，杨玉乐夹着教案匆匆赶去行政楼开会，却把那只寸步不离的掉漆保温杯忘在了高三教室的讲桌上。等他散会后折返教室去拿时，晚自习前的教室里已经坐满了埋头刷题的学生。\n\n保温杯稳稳当当地摆在粉笔盒旁边，杯盖底下压着一张从草稿本上撕下来的小纸条。上面没有平日里学生私下调侃他的“ED与ING”段子，只有一行清秀工整的钢笔字：“杨老师，看您今天讲课时一直在揉太阳穴，晚自习不用来巡班了，早点回去歇着吧。”", test: yangHere, options: [['把纸条收进教案夹', { ss: 2, studentSanity: 3 }], ['提醒学生按时完成订正', { stab: 2, ss: -1 }]] },
  { id: 'winter', title: '结冰的上学路', body: "昨夜一场冻雨把紫云路和徽州大道的高架桥面冻成了溜冰场，早高峰的三路公交车全堵在半道上动弹不得。早上六点五十的早读铃响过，门卫室的考勤表上记下了整整八十多名踩着冰碴赶来的走读生。\n\n按照现行的量化管理细则，凡迟到超过五分钟者一律自动扣除班级操行分并罚站早读。几名冻得嘴唇发紫的学生站在结霜的走廊里背单词，高三年级的几位班主任实在看不下去，联名把考勤表退回办公会，要求区分天灾结冰与恶意违纪。", test: s => [11, 0, 1].includes(s.date.getMonth()), options: [['豁免天气迟到，开放暖房', { pp: -6, ss: 4, studentSanity: 2 }], ['调整到校时间，补齐值班', { pp: -3, stab: 3 }]] },
  { id: 'unrest', title: '熄灯后的走廊', body: "十一点半的熄灯号吹过之后，宿舍楼二层的走廊里并没有像往常一样安静下来。二十多名各个寝室推选出来的学生代表借着安全出口微弱的绿光围坐在楼梯口，手里拿着前几次递交上去却石沉大海的作息与食堂整改提案。\n\n巡夜的保安队拎着橡胶棍堵在一楼铁门外，对讲机里的电流声在寂静的楼道里格外刺耳；而坐在台阶最前排的班长没有退缩，只是平静地向闻讯赶来的值班主任提出：只要今晚有人能给之前压着不批的三份提案一个准话，大家立刻回寝室睡觉。", test: s => s.stats.stab < 45 || s.stats.ss < 35 || s.stats.radicalAnger > 55 || Object.keys(s.yangYuleState?.rebelLocations ?? {}).length > 0 && s.currentFocusTree === 'treeB', options: [['请代表带着诉求参加协调', { pp: -10, ss: 4, radicalAnger: -5, stab: 2 }], ['恢复秩序后再受理', { stab: 5, radicalAnger: 5, ss: -4 }]] },
  { id: 'canteen', title: '食堂窗口的账本', body: "一楼食堂的大荤窗口这周悄悄把排骨的价格往上提了两块，打菜勺里的肉却反而比上个月少了小半勺。几名早有准备的学生把连续五天拍下的餐盘照片洗了出来，直接贴在了食堂入口的意见栏上。\n\n承包商经理满头大汗地捧着一摞猪肉批发进货单赶来解释“近期物价上涨”，围观的学生却一眼认出进货单上的日期是上个季度的旧账。午饭高峰期的人群越聚越多，是允许学生代表直接进后厨核对本月原始流水账，还是由总务处关起门来内部约谈承包商，必须立刻拿个主意。", test: always, options: [['让代表核对账目', { pp: -5, ss: 4, capitalPenetration: -2 }], ['行政约谈供餐商', { pp: -3, stab: 3 }]] },
  { id: 'supply', title: '印刷室最后一箱纸', body: "B1楼底层的油印室今天下午彻底停工了。滚筒油印机旁只剩下最后半箱70克的双胶纸，而教务处排印单上还压着高三理综周测、英语晨读默写条和历史专题讲义整整三套急件。\n\n负责印刷的工友把沾满黑墨的手往围裙上一擦，干脆利落地把排印单推回给各备课组长：这点纸连印完一个年级的答题卡都不够。要么各科老师坐下来删减重复的题海卷面、把选择题改成课堂投影讲评，要么立刻批一笔特批经费去校外文印商那里高价调货，否则明早的课桌上一张卷子都发不出来。", test: s => s.stats.tpr < 300, options: [['协调批次，减少重复印刷', { pp: -10, tpr: 90, studentSanity: 3 }], ['紧急购买纸张', { pp: -20, tpr: 160, capitalPenetration: 2 }]] },
  { id: 'textbooks', title: '课本夹页里的报价单', body: "新下发的《高三二轮复习核心专题》还没捂热，三班的课代表就在拆封塑封膜时，从成捆教辅的最底下抽出了两张没来得及拿走的印刷厂原始出库结算单。\n\n结算单上白纸黑字印着“批量协议批发价：四五折”，而上周年级部下发的收费通知里，向每位学生实收的却是分文不少的封面全价。短短一个午休，两张照片就在各班传了个遍；出版商驻校代表慌忙跑来公关，请求校方以“含配套线上阅卷服务费”的名义把差价圆过去。", test: s => s.stats.capitalPenetration >= 35, options: [['公开采购合同，退还差额', { pp: -12, capitalPenetration: -8, ss: 5 }], ['私下谈判降低下次报价', { pp: 14, capitalPenetration: 3, ss: -3 }]] },
  { id: 'standing', title: '站着读完的早自习', body: "推行“全员无死角站立晨读”的第五天早上，B3教学楼三楼走廊里传来砰的一声闷响。一名昨晚刷题到凌晨两点的高三女生，在捧着英语书站了四十分钟后，因为急性低血糖直挺挺地栽倒在课桌过道里，磕翻了一摞复习资料。\n\n巡班督察还拿着分贝仪站在后门记录哪个班读书声不够响亮，同班的班长已经红着眼眶把校医务室开出的三张眩晕就诊单拍在了讲台上，当众质问年级部：把熬空了身体的学生逼得像兵马俑一样罚站，究竟是在提振士气，还是在拿学生的命换形式主义的整齐？", test: s => strict(s) && exhausted(s), options: [['恢复坐读，个别指导', { pp: -5, studentSanity: 5, ss: 3 }], ['缩短站读时长，保留要求', { stab: 3, studentSanity: -2 }]] },
  { id: 'retirement', title: '抽屉里的退休申请', body: "深夜整理办公桌最底层的加锁抽屉时，杨玉乐翻出了那张半年前从人事处领回来、却一直没填日期的《高级专家到龄退休审批表》。桌子另一头，冲击“正高级特级教师”的二十多份支撑材料和迎检汇报已经堆得像座小山。\n\n窗外B3教学楼的灯火倒映在他厚重的老花镜片上。工作室的老搭档临下班前曾委婉地劝过他：到了这个岁数，血压和记忆力都在往下掉，没必要把最后几年攒下的老本全填进政绩的无底洞里。是放权给年轻人去跑日常杂务、给自己留条退路，还是锁紧抽屉继续赌上全部身家冲刺最后的头衔，只有他自己能做决定。", test: s => yangHere(s) && s.currentFocusTree === 'treeB' && (s.yangYuleState?.health ?? 100) < 45 && (s.yangYuleState?.titleStage ?? 0) >= 2, options: [['授权工作室承担日常事务', { pp: -10, ss: 3, stab: -1 }], ['把申请放回抽屉', { pp: 8, studentSanity: -2 }]] },
  { id: 'mockery', title: '传阅的英语讲义', body: "早自习收作业时，各班英语课代表在卷子堆里发现了一份用学校官方模板排版的《高三英语核心语法补充讲义》，落款赫然印着“合一被动语态研究小组”。\n\n讲义前半页一本正经地模仿着杨玉乐“一个人一天呼吸五十升空气”的课堂名言，后半页却笔锋一转，把全校学生的作息表全部改写成充满黑色幽默的“被占用、被扣分、被自愿”的被动语态例句，条条直戳近期校务管理的痛处。这张让人哭笑不得的卷子已经传遍了三个楼层，保卫科请示要不要立刻按违禁传单查封源头。", test: s => yangHere(s) && s.stats.ss < 55, options: [['回应批评，不追究戏仿', { pp: -6, ss: 4, radicalAnger: -3 }], ['追查印刷来源', { stab: 4, ss: -3, radicalAnger: 3 }]] },
  { id: 'informants', title: '没有证据的举报单', body: "清晨打开值班室的举报信箱，里面躺着一张用左手歪歪扭扭写下的检举名单。上面一口气列出了高三（28）班和实验班的七名学生，罪名是“私下串联、散布消极抵触情绪”，但整张纸上既没有具体的时间地点，也拿不出半张传单或聊天记录。\n\n名单不知怎么走漏了风声，被点名的几名学生课间直接找上了年级部办公室，要求与举报人当面对质；而暗中投递名单的督察线人则通过纸条传话，声称“那几个人每天晚饭后都在操场看台下凑在一起小声说话，不先下手摁住迟早要出乱子”。", test: s => strict(s) && (s.stats.stab < 55 || s.stats.radicalAnger > 40), options: [['逐条核实，不以名单定罪', { pp: -8, ss: 4, allianceUnity: 2 }], ['先登记观察', { stab: 3, radicalAnger: 4, studentSanity: -2 }]] },
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
  opening: '行政楼的红头文件依然按封安宝时代的旧程序层层流转，但走廊与教研室里已经不再只有沉默的服从——无论是疲惫的老师还是被压抑到临界点的学生，都开始盯着那枚黄铜公章，等待一个能够自圆其说的交代。',
  revolution: '这份加急报告穿过课桌筑成的街垒，摆上了联合革命委员会的临时长桌。砸碎旧校规只需要一腔热血，但要想向全校证明新政权不是另一座失序的疯人院，就必须先给眼前这些还在维持日常运转的师生一个实实在在的办法。',
  democracy: '提案被秘书处正式列入了学生议会的今日议程。普选箱赋予了代表们质询的合法性，却变不出现成的妥协方案——在各派系挑剔的注视下，议长席上的每一次落槌，都在丈量着合一民主究竟是清谈馆还是真制度。',
  reform: '报告被下乡工作队送进了题改委员会的作战室。王照凯要求各试点组把处理结果记入红皮档案：做题改革绝不能只停留在收缴几套密卷的口号上，如果连日常教学中的剥削与内耗都理不清，旧体制的幽灵随时会卷土重来。',
  commune: '基层互助公社的联络员将这份材料带上了联席圆桌。豪邦的“左翼大帐篷”能够容下激烈的辩论，但公社的生命力终究要落在每一间教室的柴米油盐与公平底线上——只有把小事办妥，信任的纽带才不会断裂。',
  purge: '报告被直接呈送至肃反保卫局（N.K.P.D.）的审查案头。吕波汉的红笔悬在纸面上方，走廊里的空气冷得像冰窖——经手汇报的干事字斟句酌，生怕一次寻常的校务摩擦被定性为“做题蛆与右倾分子的蓄意反扑”。',
  wu: '值班室将情况紧急上报至护校队戒严指挥部。吴福军的防暴钢叉与监控探头确实让整座校园安静了下来，但高压锅的阀门不能只靠焊死来维持——面对教室里投来的目光，铁腕之下也得拿出一道能压服人心的指令。',
  yang: '杨玉乐慢条斯理地拧开保温杯，将这份棘手的报告压在杯底。封安宝在楼上等着看他“春风化雨”的维稳实效，名师工作室的年轻老师则在门外等着看这位老特级如何端平这碗水——既不能激起红蛤的反弹，又不能耽误正高级评审的大局。',
  jidi: '事务简报被数据部折算成风险敞口，投射在联合管理委员会的电子大屏上。在封安祥与李竞凯的精细精算里，任何校园风波都只是影响转化率与KPI的波动曲线；但报表之外那些有血有肉的耗材，正逼着董事会做出取舍。',
  gouxiong: '艺术礼堂后台的联络员挠着头，把这份三次元的麻烦事递到了放映室里。大银幕上的番剧还在昼夜不停地播放，但礼堂大门外的吃喝拉撒与日常矛盾并不会因为几句烂梗自动消失——就算是大统领，今天也得给个说法。',
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
  const mood = s.stats.ss < 40 ? '当前各班抵触情绪暗涌，普通学生对口头承诺早已麻木，任何敷衍塞责都可能演变成新的串联。' : s.stats.stab < 45 ? '眼下校园秩序绷在临界点上，一线教师与班干部都在观望上面的定盘星，急需一道明确果断的处置指令。' : '目前校内日常秩序尚算平稳，各派系与教研组都留着谈判余地，正是立下规矩的窗口期。';
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
  const stageNotes: Record<string, string> = {
    '风暴前夜': '开学初的高压机器仍在惯性运转，但每一次批示都在为即将到来的风暴积蓄或拆解引信。',
    '革命阵地': 'B3的红旗刚刚升起，全校师生都在透过这件小事，打量着革命委员会究竟与旧官僚有何不同。',
    '议会筹建': '各派代表正在争夺议事规则的定义权，这起风波的裁决将直接成为未来宪章的判例。',
    '议会运转': '议会大厅里的辩论声还未散去，选民们正盯着执政派能否兑现那些写在提案上的许诺。',
    '选区竞选': '大选倒计时的选票箱就摆在走廊里，任何一个草率的决定都可能成为竞争对手明天海报告示上的把柄。',
    '基层试点': '下乡工作队刚进驻各班，做题家们正用怀疑的目光审视着先锋队的每一道命令。',
    '改革推广': '做题改革已进入深水区，政治局的每一次拍板都在决定这场灵魂重塑是走向新生还是滑向暴走。',
    '公社筹建': '旧的行政命令链条已经拆解，新生的班级互助组急需通过这件实事来磨合自治的边界。',
    '公社建设': '联合公社的制度框架已初步成型，如何妥善化解基层摩擦，将检验“左翼大帐篷”真正的成色。',
    '权力集中': '肃反保卫局的暗网正在收紧，任何风吹草动都会被当作检验路线忠诚度的试金石。',
    '地区整编': '网格化清洗的探照灯扫过每一间教室，这道批示将作为铁律直接下达至各区纠察队。',
    '秩序接管': '防暴队的哨声刚刚压住骚乱，校方急需用滴水不漏的处置来证明铁腕重归的权威。',
    '全面戒严': '全校十五个区域均处于护校队的严密监控之下，任何处理方案都将被视为戒严令的延伸。',
    '资本进驻': '及第教育的评估团队正在盘点校园资产，每一项行政开支都要放在投入产出比的天平上过秤。',
    '企业管理': 'KPI电子大屏在教务处日夜闪烁，这道裁决将直接计入本季度的部门绩效与风险报表。',
    '礼堂自治': '艺术礼堂的荧光棒照亮了半个校园，但这群逃避现实的信徒依然需要有人替他们挡住门外的风浪。',
    '地区混战': '三方割据的拉锯战正酣，后方基地的每一分人心向背，都关乎礼堂防线能否撑过今晚。',
  };
  const stageText = c.route === 'yang' ? {
    '代管时期': '此时杨玉乐刚接手年级部代管大权，这桩事务的批示将直接决定一线教师是真心配合，还是把他当成另一个吴福军。',
    '教研材料筹备': '名师工作室正通宵达旦地拼凑正高级送审材料；此事若处置失当，怕是没有年轻老师再愿意替他贡献真实的课堂教案。',
    '职称评审': '市教育局的专家评审组已经调阅了近期校务卷宗，办公室必须留下一份逻辑自洽、挑不出毛病的处理记录。',
    '答辩准备': '现场答辩的讲稿接近定稿，评审委员们正盯着合一的实况——台上的“春风化雨”必须有台下的实际账面来兜底。',
    '公示时期': '正高级拟通过名单已挂上省厅官网，值此敏感关头，任何激化矛盾的昏招都可能化作举报箱里的致命一击。',
  }[c.stage] : (stageNotes[c.stage] ?? `这份卷宗正摆在「${c.stage}」阶段的案头，如何裁决将成为检验当前路线成色的试金石。`);
  const event: GameEvent = {
    id: `campus:${variant}`, campusSituation: { family, variant, route: c.route, channel }, title: e.title,
    description: `${e.body}

${perspective[c.route]}

${stageText}
${c.mood}

现行制度：${LAWS[relevantLaw]?.name ?? relevantLaw}。地区反馈：${tile.name}。`,
    choices: e.options.map(([text, delta], index) => ({ id: `${e.id}_${index}`, text,
      previewText: preview(delta) + (c.route === 'yang' && e.teacher ? ` · 教师支持 ${index === 0 ? '+' + e.teacher : '-3'}` : '') + (family === 'health' ? ` · 健康 ${index === 0 ? '+10' : '-5'}` : '') + (c.route === 'yang' && (s.yangYuleState?.titleStage ?? 0) >= 1 ? ` · ${c.stage === '教研材料筹备' ? '教研成果' : '评审进度'} ${index === 0 ? '+2' : '-1'}` : ''),
      disabled: current => current.stats.pp < Math.max(0, -(delta.pp ?? 0)),
      effect: current => resolve(current, event, delta, index, e.teacher),
    })),
  };
  if (getCommandState(s).preparation?.[c.route] || restoreFieldChoice) event.choices!.push({
    id: 'field_coordination', text: '抽调驻点工作组实地协调', previewText: '路线筹备 -1 · 学生支持 +4 · 稳定度 +3',
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
  event.choices!.push({ id: 'defer', text: '加盖“已阅”暂存归档，缓议待查', previewText: '学生支持 -1 · 不计入已批阅文件',
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
