import { GameState, GameEvent } from '../types';
import { PUBLIC_NEWS_EVENT_IDS } from './eventKinds';
import { applyTileCtrlDeltas } from '../engine/tileHelpers';
import { applyYangSettlement, getCrossroadsOutcome, CROSSROADS_RULES } from '../engine/assemblyPolitics';

export const FLAVOR_EVENTS: Record<string, GameEvent> = {
  phase1_hengshui_schedule: {
    id: 'phase1_hengshui_schedule', title: '挤掉的午休', isStoryEvent: true,
    description: "一纸新印的《高三年级作息时间表》在早读前被钉在了每间教室的后门框上。原本留给学生喘息的午休被红线彻底抹去，从清晨六点二十的早读到深夜十点半的晚自习，整整十六个小时被切割成精密咬合的课时网格，每堂课之间只剩下五分钟的喘息。\n\n“五分钟？去开水房打个水、上个厕所都得百米冲刺！”\n\n走廊里有人压低声音咒骂，但没人敢停下脚步——挂在走廊尽头的倒计时牌和端着记分册的自治会督察员正在同时读秒。预备铃一响，整层楼的学生便如条件反射般退回课桌后。到了晚自习散场，班长捧着年级部下发的量化考勤细则回到寝室，熄灯哨响前还有人在黑暗里喃喃发问：“明天中午……真的连趴在桌上睡二十分钟都不准了吗？”\n\n黑暗中没有回音。在这台加速运转的应试机器里，被征用的时间永远不会退还。",
    buttonText: '这张课表连喘气的缝隙都给我们焊死了。',
    effectsText: ['激进愤怒度 +8；B3起义需要激进愤怒度 >80'],
    effect: s => ({ stats: { ...s.stats, radicalAnger: Math.min(100, s.stats.radicalAnger + 8) } }),
  },
  phase1_returned_petition: {
    id: 'phase1_returned_petition', title: '退回的联名信', isStoryEvent: true,
    description: "B3教学楼的空气里常年弥漫着一种防暴队留下的汗臭和劣质油墨混合的酸味。开学的第一周，封安宝那张冷酷的脸还没有在电视屏幕里出现，但他的影子已经通过“学生自治会”的选拔通告，像蜘蛛网一样爬满了每个班级的后墙。这群被吴福军精挑细选出来的“自治委员”，更像是穿着校服的克格勃，他们用袖章和记分册在同学之间建立起了一道道互相监视的无形铁丝网。\n\n晚自习的寂静中，一张折叠成方块的信纸在后排的课桌间悄然传递。那是潘仁越起草的联名信。信上的诉求卑微得令人心酸：“保证正常休息”、“反对毫无节制的临时加课”。在这座全景监狱里，哪怕是争取睡个好觉，也带上了一丝悲壮的造反色彩。几个男生借着堆积如山的复习资料的掩护，匆匆签下自己的名字。有人迟疑着想要匿名，立刻被旁边的人用眼神制止——在这套精密运转的官僚机器面前，匿名就等同于不存在。\n\n第二天下午，当那份承载着数百个指纹和希望的信纸被退回讲台时，没有引起任何波澜。没有约谈，没有处分，教务处的官僚们甚至不屑于使用校方抬头的红头文件。信纸的边缘，只用醒目的红笔批注了五个字：“先完成学业。”\n\n这比任何严厉的镇压都更令人感到绝望。他们不把你当成一个有诉求的“人”，而是把你当成一台尚未完成生产指标的做题机器。潘仁越站在讲台旁，看着那五个红字。他那属于浪漫主义者的神经被深深地刺痛了。几个实验班的同学围拢过来，压低的声音里酝酿着某种危险的情绪。“他们甚至不打算给我们一个借口。”潘仁越把那张纸死死地攥在手里，指关节因为用力而发白，“如果我们连休息的权利都无法捍卫，我们还有什么资格谈论未来？”\n\n傍晚的开水房外，水汽氤氲中，潘仁越拦住了邻班的同学。那张被揉皱的信纸再次被展开，像是一面残破却依然倔强的旗帜。“这只是开始。”他低声说道，“下次，我们就不会只用笔来抗议了。”",
    choices: [
      { text: '把原信传给其他班级。', previewText: '激进愤怒 +12，学生支持 +2', effect: s => ({ stats: { ...s.stats, radicalAnger: Math.min(100, s.stats.radicalAnger + 12), ss: Math.min(100, s.stats.ss + 2) } }) },
      { text: '仍然争取一次正式答复。', previewText: '联盟团结 +3，激进愤怒 +4', effect: s => ({ stats: { ...s.stats, allianceUnity: Math.min(100, s.stats.allianceUnity + 3), radicalAnger: Math.min(100, s.stats.radicalAnger + 4) } }) },
    ],
  },
  phase1_recess_dispute: {
    id: 'phase1_recess_dispute', title: '课间也要计时', isStoryEvent: true,
    description: "所谓的《班级日常量化考核细则》从未在布告栏上全文公示过，它的解释权完全握在那些佩戴袖章的“学生自治会”巡查员手里。每天课间，这群由吴福军直接受命的督察干事便夹着记分夹在各班门前游走，目光扫过之处，只需在表格上轻轻打个勾，被记名的班级往往要到当晚的年级通报上才知晓自己又沦为了“违纪典型”。\n\n矛盾在周三早读下课后彻底引爆。两名实验班的课代表冲出教室，在走廊拐角拦住了正准备合上文件夹的巡查干事，周围几个班的学生迅速围拢过来。\n\n“早读下课我们班明明在收理综卷子，你凭什么扣我们三分？”\n\n巡查干事冷漠地掀开文件夹一角，指了指最上方的一栏：“课间秩序混乱。我只负责按年级部下发的表格打勾，有异议自己找吴主任申诉。”\n\n“收作业叫秩序混乱？那课间去水房接水算什么？站起来活动一下腰腿又算什么？”另一名课代表逼近一步，声音因愤怒而发颤，“扣分连具体条文都不敢当面亮出来，你们手里拿的到底是考勤表还是刑讯逼供的黑名单？”\n\n巡查干事啪地合上记分夹，后退半步避开人群逼视的目光：“少冲我发火！我少记一个班，晚上去政教处挨训的就是我。后面还有两个楼层要查，都让开！”\n\n人群没有散去。当天第二节下课，B3教学楼七八个班的班委与课代表第一次自发聚在了消防楼梯间。当他们把各自班级莫名其妙背上的扣分记录凑在一起核对时，才发现这套所谓的“自治巡查”从头到尾就是一场按指标摊派的服从性测试。有人当场撕下笔记本内页，提议各班联合记下巡查员每一次滥用职权的时刻——下一次，绝不再让他们拿着黑账全身而退。",
    buttonText: '那张从不公示的扣分表，成了悬在所有人头顶的暗箭。', effectsText: ['激进愤怒 +10，学生理智 -2'],
    effect: s => ({ stats: { ...s.stats, radicalAnger: Math.min(100, s.stats.radicalAnger + 10), studentSanity: Math.max(0, s.stats.studentSanity - 2) } }),
  },
  phase1_shared_leaflet: {
    id: 'phase1_shared_leaflet', title: '第二份传单', isStoryEvent: true,
    description: "王照凯是在午饭后穿过B3二楼连廊时发现那张传单的。那是一页从软抄本上撕下来的方格纸，被折成紧实的方块，巧妙地卡在铝合金窗槽的死角里。他不动声色地将其抽出来展开——纸页上密密麻麻写着三四种不同的笔迹，有钢笔锋利的批注，也有红蓝圆珠笔匆匆添上的补充，最下方用蓝墨水重重写着一行字：“阅后勿毁，传给下一间教室。”\n\n不远处的几个女生显然也注意到了窗台上的异样。其中一人凑近低声说道：“二十八班也有人收到了？上面写的全是昨天早读巡查乱扣分的事，原来不止我们一个班被穿了小鞋。”\n\n“不止扣分的事。”另一个女生指着纸页背面念道，“‘当我们的作息被切割成精确到秒的量化表格，连呼吸与睡眠都要祈求官僚的恩准时，顺从就成了对压迫的合谋。’——你看，连潘仁越那封被教务处用红笔批回的联名信也原原本本抄在上面了。”\n\n王照凯盯着纸页上那几行力透纸背的字迹。过去半个月在熄灯后的寝室里反复辩论的那些阶级与异化理论，此刻终于与走廊里每一天的屈辱严丝合缝地咬合在了一起。单打独斗的抱怨只会被政教处轻易掐灭，可当散落在各班的怒火通过这一张张手抄纸串联成网，铁屋子的第一道裂缝便已悄然蔓延。\n\n下午大课间，王照凯揣着那张写满批注的方格纸穿过封锁连廊，借着去实验楼送器材的掩护，将它塞进了隔壁强基班后门的储物柜缝隙里。\n\n刚转身走出两步，强基班的后门便被拉开。一名戴眼镜的男生手里捏着那张方格纸走出来，目光与王照凯在半空相撞：“你塞进来的？”\n\n王照凯停住脚步，迎着他的视线没有退缩：“看完之后，把你们班这周被克扣的作息和罚单也补在背面。”\n\n“潘仁越联名信被退回来的事，我们班早就传遍了。”男生低头将纸页折好揣进校服内袋，压低声音道，“只有这一份？”\n\n“今晚熄灯后我们会再油印五十份。明天早读前，去一楼开水房后面的窗台取。”",
    buttonText: '让星火顺着课桌与走廊，传遍每一间教室。', effectsText: ['激进愤怒 +12，学生支持 +3；愤怒 >80后可直接选择B3起义'],
    effect: s => ({ stats: { ...s.stats, radicalAnger: Math.min(100, s.stats.radicalAnger + 12), ss: Math.min(100, s.stats.ss + 3) } }),
  },
  committee_purge_moderates: {
    id: 'committee_purge_moderates', title: '缺席的代表', isStoryEvent: true,
    description: "联合革委会第三次防务扩大会议召开时，潘仁越手下的几名温和派委员直到散会铃响，都没有收到开会地点的变更通知。空了一半的长桌旁，王照凯直接将一份重新拟定的《B3防区集中调度令》拍在桌面上：“非常时期容不得议会清谈。各楼层纠察队与物资调配必须即刻收归总指挥部垂直节制，谁再打着‘各班协商’的旗号拖延换防，一律按动摇防线论处！”\n\n闻讯赶来的潘仁越一把推开会议室大门，看着黑板上已经擦去温和派代表名字的值班表，脸色铁青地质问：“把不同意见的代表锁在门外，这就是你们钢铁红蛤口中的联合执政？用清洗盟友的方式换取所谓的效率，你们和行政楼里的独裁者有什么区别！”\n\n王照凯没有抬头，只示意纠察队员将新印好的《垂直指挥名册》直接分发各层。然而，当强行收权的政令贴上走廊公告栏时，裂痕立刻在基层显现——那些被踢出指挥部的温和派班委手里，依然掌握着各普通班的排班表与联络渠道。命令虽然在顶层实现了绝对集中，但在通往每一间教室的神经末梢上，无声的抵制与猜忌已经悄然蔓延。",
    buttonText: '非常时期，指挥链条容不得半点杂音。', effectsText: ['国策完成时已结算：集权 +20，团结 -20', '十字路口会同时检查席位、团结与集权'],
  },
  committee_vanguard: {
    id: 'committee_vanguard', title: '谁来下达下一道命令', isStoryEvent: true,
    description: "随着《先锋队垂直领导条例》的颁布，B3教学楼原本松散的班级联席会议彻底成为了历史。清晨的油印室里，第一批加盖着“钢铁红蛤先锋队”鲜红印章的《全天候战时轮值表》被直接分发到各楼层组长手中。站在讲台上的先锋队干事用毫无起伏的语调宣布：即日起，一切物资调拨、防线换岗与宣传口径均由常设轮值委员直接签发，全面废除耗时费力的各班代表会签制度。\n\n后排几名普通班推选出的老代表忍不住起身质问：“如果连本班的调休和试卷配额都不经过班级代表同意，那我们选出来的代表大会岂不是成了摆设？”讲台上的先锋队干事连眼皮都没抬，冷冷地吐出四个字：“服从决议。”\n\n散会后的走廊里，几名试图找指挥部理论的班委被佩戴红袖章的纠察队员客气而强硬地挡在了门外，只指了指墙上墨迹未干的《战时纪律十条》。民主协商的温情面纱已被彻底撕去，在这座红色堡垒内部，一套如齿轮般严酷咬合的列宁式垂直指挥机器已然轰鸣启动。",
    buttonText: '铁的纪律，高于一切空洞的表决。', effectsText: ['国策完成时已结算：集权 +10，获得先锋队精神', '真左路线仍需要保住至少55的联盟团结'],
  },
  committee_militia: {
    id: 'committee_militia', title: '岗哨后面的教室', isStoryEvent: true,
    description: "暮色四合，艺术礼堂东侧大门的沙袋掩体后，两名佩戴红袖章的武装纠察队员刚刚完成交接。他们手里紧握着缴获来的防暴胶棍与出入登记簿，对每一个进出防区的学生进行严密盘查。不远处的操场看台下，另一支纠察分队正顶着寒风，将铁丝网与废弃课桌固定成新的封锁街垒。\n\n“回自己班拿本复习资料还要查两道出入证，这跟吴福军封楼那会儿有什么两样？”几名被拦在警戒线外的普通班学生小声发着牢骚。值勤的纠察队长面无表情地核对着学生证，没有多做半句解释——礼堂与操场的制高点虽然已经在地图上插遍了红旗，但要将这十几处松散的校园据点真正焊成铁板一块，仅靠几句革命口号远远不够。花坛边的马灯下，后勤干事正奋笔疾书，向周边各班下达明早六点强制抽调人手加固南门街垒的征调令。",
    buttonText: '没有纠察队的街垒，就没有革委会的明天。', effectsText: ['礼堂与操场控制提升，获得武装纠察队精神', '地区行动与工作组可持续巩固控制、争取支持'],
  },
  committee_print_network: {
    id: 'committee_print_network', title: '油墨还没有干', isStoryEvent: true,
    description: "实验楼三楼尽头的废弃准备室里，两台老式手摇油印机正发出有节奏的咔哒声。几名宣传科骨干借着应急灯微弱的光亮，将一摞摞刚刚印好的《红蛤战报》与《反内卷宣言》按班级人数清点捆扎，浓烈的黑油墨味混杂着石蜡纸的气息弥漫在狭窄的走廊间。\n\n“高二那边有三个班的地下联络员今晚被班主任扣在办公室谈话了，原来的传单交接点不能再用。”负责交通线的干事将一张画满红蓝记号的校区平面图摊在实验台上，用铅笔迅速划掉了两条暴露的路线。要把成千上万份散发着油墨温度的传单赶在明早早读前塞进全校每一张课桌的抽屉，他们必须在校方巡查队的眼皮底下，织起一张遍布水房、食堂与楼梯死角的地下发行暗网。",
    buttonText: '油印机转动的声音，就是旧秩序丧钟的节拍。', effectsText: ['实验楼地块控制额外 +5，小游戏表现另行结算', '派工作组定期印制传单或联络地区，仍消耗原行动资源'],
  },
  committee_posters: {
    id: 'committee_posters', title: '墙上的下一张海报', isStoryEvent: true,
    description: "行政楼西侧的长廊布告栏前，一场没有硝烟的拉锯战每天都在上演。清晨刚贴上去的大字报与《告全校同学书》，到了中午就会被保卫科派人用水刷和铲刀刮得精光；而到了深夜，宣传队又会提着浆糊桶重返现场，用更醒目的黑底红字将旧官僚的违纪黑幕重新糊满整面墙壁。\n\n寒风凛冽的深夜里，负责西区宣传的女生蹲在结霜的台阶下，用冻得通红的手指将刷满浓稠浆糊的《三问封氏新教改》牢牢按在宣传栏正中央。“听说今天下午隔壁两个平行班路过时，连停下来看一眼的人都没有。”身旁望风的干事有些气馁地低声道。女生没有停下手里的刷子，只平静地将海报四角压实：“今天不看，是因为他们还怕头顶的摄像头；只要明天太阳升起时这行字还在墙上，他们迟早会抬起头来的。”",
    buttonText: '只要墙上的墨迹不干，他们就休想假装太平。', effectsText: ['行政楼地块控制额外 +5，小游戏表现另行结算', '地区控制与支持需要持续行动；留意工作组的资源与任务报告'],
  },
  committee_assembly_opening: {
    id: 'committee_assembly_opening', title: '同坐一间教室', isStoryEvent: true,
    description: "B3教学楼底层的阶梯大厅里人声鼎沸，黑板上密密麻麻写满了各派系互相覆盖的纲领草案。王照凯站在讲台正中，用粉笔在最上方重重画下一道横线——“一切权力归于集中统一的指挥部”。他将半截粉笔扔进槽内，目光如炬地扫过台下摇摆不定的中间派代表：“吴福军的防暴队随时可能反扑，没有铁锤般的统一意志，我们散在各班的据点不过是一盘散沙！”\n\n潘仁越紧接着走上讲台，没有擦掉王照凯的标语，而是在下方并列画出了“立法监督”“社团自治”与“公开听证”三个方框：“我们推翻封安宝，是为了终结一言堂的暴政，而不是为了选出一个新的红色校长！如果革委会的每一道命令都不受代表大会制约，那这场革命从第一天起就已经背叛了自己！”\n\n而在阶梯教室后排的角落里，以王卷豪为首的做题派代表们正焦躁地摩挲着手里的模拟考卷与复习计划表——在激进的集权先锋与浪漫的民主斗士之间，他们唯一关心的是明天早上六点半的早读铃声还能否准时响起。大厅窗外风雨交加，首届合一学生代表大会就在这剑拔弩张的路线撕裂中正式拉开了帷幕。",
    buttonText: '旧的枷锁刚刚砸碎，新的路线之争已然打响。', effectsText: ['已解锁学生代表大会：左侧入口调整派系关系', '集权决定指挥集中程度，团结决定各派能否继续合作', '十字路口确认时检查席位与这两个数值', ...CROSSROADS_RULES],
  },
  democratic_power_struggle_event: {
    id: 'democratic_power_struggle_event', title: '民主派争权', isStoryEvent: true,
    description: "散会铃刚刚响起，潘仁越率领的自由派代表便在阶梯教室门口拦住了准备离场的几名核心执委。他们手里高举着连夜油印的《关于限制指挥部紧急处分权的联署议案》，身后数十名各班代表已经将走廊围得水泄不通。墙面上贴满了刚从各楼层征集来的质询字条：“凭什么不经听证就查封班级教辅？”“要求指挥部向全体代表公开每一次调令！”\n\n原本默认战时集权的几名中间派班长，此刻也纷纷在联署书上签下了名字，要求今后一切涉及停课、搜查与物资征调的指令必须先经代表大会过半数表决。潘仁越站在人群正中央，直视着脸色铁青的王照凯：“如果所有决定都由顶层办公室里的几个人关起门来拍板，那这座礼堂里的三百张代表席位还有什么存在的必要？”\n\n这场爆发于同盟内部的宪政危机，已将联合革委会逼到了摊牌的边缘——究竟是由先锋队垄断绝对指挥权，还是向议会交出最高裁决的法槌？",
    buttonText: '把权力的归属问题摆上大会台面。', effectsText: ['集权 ≤25，或潘派 ≥40席，或团结 ≥80且集权 ≤40可化解', '到期：潘派席位随机 +1–3、集权 -5、团结随机 -3至+3'],
  },
  democratic_power_struggle_result: {
    id: 'democratic_power_struggle_result', title: '授权的让步', isStoryEvent: true,
    description: "长达四个小时的激烈交锋最终以指挥部的让步告终。面对自由派与中间派班级代表的联手发难，原本保持沉默的十几个平行班代表在最后一轮举手表决中倒向了潘仁越，正式通过了《委员会指令大会备案与否决条例》。黑板旁负责计票的女生擦去原有的席位数字，用醒目的白粉笔写下了新的票数对比。\n\n联合革委会的招牌虽然依旧悬挂在B3顶层，但王照凯手中的垂直指挥权已被套上了议会程序的枷锁——从今往后，任何一道跨楼层调令在下发前，都不得不先在代表大会的唇枪舌剑中闯关。自由派在欢呼这是校园民主宪政的奠基之战；而站在台侧的红蛤先锋队员们则冷眼看着乱作一团的会场，深知在即将到来的风暴面前，这艘失去了绝对舵手的航船已然埋下了分裂的祸根。",
    buttonText: '议会捆住了先锋队的手脚，新的席位格局已成定局。',
  },
  support_bill_event: {
    id: 'support_bill_event',
    title: '表态：支持议案',
    description: '为了确保当前审议的法案顺利过关，我们决定动用联合议会内外的全部政治人脉展开密集游说——从午休时间的班长联席茶话会，到晚自习前各楼层代表席位的私下换票，每一份政治资源的投入都将化作计票器上实实在在的赞成票。',
    choices: [
      {
        text: '全力支持！ (消耗 10 PP，赞同率 +15)',
        previewText: '消耗 10 PP，赞同率 +15',
        effect: (state: GameState) => {
          if (state.stats.pp < 10 || !state.parliamentState?.activeBill) return state;
          return {
            ...state,
            stats: { ...state.stats, pp: state.stats.pp - 10 },
            parliamentState: {
              ...state.parliamentState,
              activeBill: {
                ...state.parliamentState.activeBill,
                lobbiedApproval: state.parliamentState.activeBill.lobbiedApproval + 15,
                interactedFactions: [...state.parliamentState.activeBill.interactedFactions, 'support_bill']
              }
            }
          };
        }
      },
      {
        text: '再考虑一下',
        previewText: '取消操作',
        effect: (state: GameState) => state
      }
    ]
  },
  oppose_bill_event: {
    id: 'oppose_bill_event',
    title: '表态：反对议案',
    description: '绝不能任由这份开历史倒车的议案在代表大会上蒙混过关！我们决定立即串联各班持保留意见的代表组建反对方阵，通过在辩论环节发起连环质询与程序性阻击，彻底瓦解该法案在议会中的支持基本盘。',
    choices: [
      {
        text: '坚决反对！ (消耗 10 PP，赞同率 -15)',
        previewText: '消耗 10 PP，赞同率 -15',
        effect: (state: GameState) => {
          if (state.stats.pp < 10 || !state.parliamentState?.activeBill) return state;
          return {
            ...state,
            stats: { ...state.stats, pp: state.stats.pp - 10 },
            parliamentState: {
              ...state.parliamentState,
              activeBill: {
                ...state.parliamentState.activeBill,
                lobbiedApproval: state.parliamentState.activeBill.lobbiedApproval - 15,
                interactedFactions: [...state.parliamentState.activeBill.interactedFactions, 'oppose_bill']
              }
            }
          };
        }
      },
      {
        text: '再考虑一下',
        previewText: '取消操作',
        effect: (state: GameState) => state
      }
    ]
  },
  negotiate_orthodox: {
    id: 'negotiate_orthodox',
    title: '与钢铁红蛤正统派交涉',
    description: '王照凯推开办公室的门时，带进来一股凛冽的寒意。他左臂上的红袖章在昏暗的灯光下显得格外刺眼。这位钢铁红蛤的领袖没有多余的寒暄，直接将一份被红笔涂改得面目全非的法案草案拍在了潘仁越的桌上。\n\n“潘主席，你的小布尔乔亚天真简直令人发笑。”王照凯的声音冷酷得像一台精准运作的机器，“在没有掌握绝对的做题资源之前，搞什么‘素质拓展’无异于向资产阶级投降。红蛤可以按下赞成键，但条件是：删除草案里关于削减思政教育的所有条款，并且，下周高三年级部配发的市模考绝密卷，必须优先保障我们先锋队的供应。”\n\n他俯下身，死死盯着潘仁越的眼睛：“革命不是请客吃饭，选票也不是免费的馈赠。要么交出试卷，要么你的法案今天就会死在议会里。”',
    choices: [
      {
        text: '同意他的条件',
        previewText: '+15 赞同票，权力平衡向“应试教育”偏移 10，TPR -500，钢铁红蛤支持度上升',
        effect: (state: GameState) => {
          if (state.parliamentState?.activeBill) {
            return {
              parliamentState: {
                ...state.parliamentState,
                activeBill: {
                  ...state.parliamentState.activeBill,
                  lobbiedApproval: state.parliamentState.activeBill.lobbiedApproval + 15
                },
                powerBalance: Math.min(100, state.parliamentState.powerBalance + 10)
              },
              stats: { ...state.stats, tpr: Math.max(0, state.stats.tpr - 500) },
              studentAssemblyFactions: state.studentAssemblyFactions ? {
                ...state.studentAssemblyFactions,
                orthodox: state.studentAssemblyFactions.orthodox + 2,
                pan: Math.max(0, state.studentAssemblyFactions.pan - 2)
              } : undefined
            };
          }
          return {};
        }
      },
      {
        text: '拒绝妥协',
        previewText: '赞同票不变，王照凯愤怒离去，钢铁红蛤支持度下降，稳定度 -5',
        effect: (state: GameState) => {
          return {
            stats: { ...state.stats, stab: Math.max(0, state.stats.stab - 5) },
            studentAssemblyFactions: state.studentAssemblyFactions ? {
              ...state.studentAssemblyFactions,
              orthodox: Math.max(0, state.studentAssemblyFactions.orthodox - 2),
              pan: state.studentAssemblyFactions.pan + 2
            } : undefined
          };
        }
      }
    ]
  },
  negotiate_bear: {
    id: 'negotiate_bear',
    title: '与钢铁红蛤狗熊派交涉',
    description: '狗熊是哼着轻快的不知名小调滑进办公室的。作为钢铁红蛤的创始成员，他如今却成了一个彻头彻尾的投机主义和抽象乐子人。他随手把一个沾着油渍的U盘扔到潘仁越的公文堆上。\n\n“潘哥，别这么愁眉苦脸的嘛。”狗熊嚼着口香糖，满不在乎地说，“我知道你差几票。我们的人可以全投给你，只要你帮个小忙——明天中午的校园广播，把那首老掉牙的《运动员进行曲》掐了，换成这首二次元OP，单曲循环三遍。”\n\n潘仁越感到一阵荒谬的眩晕。百年名校的民主进程，无数人流血流汗换来的议会表决，现在竟然要靠一首宅舞神曲来决定生死？这就是他梦寐以求的自由吗？',
    choices: [
      {
        text: '播放二次元歌曲',
        previewText: '+10 赞同票，学生理智度 -5，正统派支持度下降',
        effect: (state: GameState) => {
          if (state.parliamentState?.activeBill) {
            return {
              parliamentState: {
                ...state.parliamentState,
                activeBill: {
                  ...state.parliamentState.activeBill,
                  lobbiedApproval: state.parliamentState.activeBill.lobbiedApproval + 10
                }
              },
              stats: { ...state.stats, studentSanity: Math.max(0, state.stats.studentSanity - 5) },
              studentAssemblyFactions: state.studentAssemblyFactions ? {
                ...state.studentAssemblyFactions,
                bear: state.studentAssemblyFactions.bear + 2,
                orthodox: Math.max(0, state.studentAssemblyFactions.orthodox - 2)
              } : undefined
            };
          }
          return {};
        }
      },
      {
        text: '拒绝这种荒唐的要求',
        previewText: '赞同票不变，狗熊派感到无趣',
        effect: (state: GameState) => state
      }
    ]
  },
  negotiate_pan: {
    id: 'negotiate_pan',
    title: '与潘仁越民主派交涉',
    description: '会议休会期间，潘仁越与几名自由党核心干事将一份写满修正批注的《校园人权与自治保障附则》摆在了你的面前。\n\n“我们不反对提高行政效率，但任何改革都不能以牺牲同学们的言论与申诉权为代价。”潘仁越指着草案中的空白条款，目光诚挚却寸步不让，“只要你在法案中明确写入‘废除一切未经听证的私下处分’与‘保障社团及个人晚间自主权’，自由派旗下的所有代表席位，今天都会为你按下赞成键。”',
    choices: [
      {
        text: '承诺保障学生权利',
        previewText: '+15 赞同票，权力平衡向“素质教育”偏移 10，联盟团结度 +5',
        effect: (state: GameState) => {
          if (state.parliamentState?.activeBill) {
            return {
              parliamentState: {
                ...state.parliamentState,
                activeBill: {
                  ...state.parliamentState.activeBill,
                  lobbiedApproval: state.parliamentState.activeBill.lobbiedApproval + 15
                },
                powerBalance: Math.max(0, state.parliamentState.powerBalance - 10)
              },
              stats: { ...state.stats, allianceUnity: Math.min(100, state.stats.allianceUnity + 5) }
            };
          }
          return {};
        }
      },
      {
        text: '目前法案已经足够了',
        previewText: '赞同票不变，民主派感到失望，联盟团结度 -5',
        effect: (state: GameState) => {
          return {
            stats: { ...state.stats, allianceUnity: Math.max(0, state.stats.allianceUnity - 5) }
          };
        }
      }
    ]
  },
  negotiate_otherDem: {
    id: 'negotiate_otherDem',
    title: '与非建制民主派交涉',
    description: '下午三点，办公室外排起了长队。他们不是来讨论教育理念的，而是非建制派的各个小团体代表。\n\n“潘主席，B1楼二层的女厕所门锁坏了两个月了，只要你承诺明天修好，我们寝室的八票就是你的。”\n\n“潘主席，如果法案能特赦上周因为带手机被抓的同学，我们社团就投赞成票。”\n\n潘仁越揉着发胀的太阳穴，被迫在这场名为“民主”的集市上讨价还价。没有人在乎《校园自治法案》的长远意义，他们只在乎眼前这几平米的蝇头小利。每一次点头，都要消耗他本就不多的政治资源；每一次签字，都让这份神圣的法案变得像一份打满补丁的破布。',
    choices: [
      {
        text: '满足他们的诉求',
        previewText: '+10 赞同票，PP -40',
        disabled: (state: GameState) => state.stats.pp < 40,
        effect: (state: GameState) => {
          if (state.parliamentState?.activeBill) {
            return {
              stats: { ...state.stats, pp: state.stats.pp - 40 },
              parliamentState: {
                ...state.parliamentState,
                activeBill: {
                  ...state.parliamentState.activeBill,
                  lobbiedApproval: state.parliamentState.activeBill.lobbiedApproval + 10
                }
              }
            };
          }
          return { stats: { ...state.stats, pp: state.stats.pp - 20 } };
        }
      },
      {
        text: '无视他们',
        previewText: '赞同票不变',
        effect: (state: GameState) => state
      }
    ]
  },
  negotiate_testTaker: {
    id: 'negotiate_testTaker',
    title: '与做题派交涉',
    description: '王卷豪站在办公桌前，眼睛一眨不眨。他是一台典型的“做题机器”，校服永远拉到最顶端，手里永远攥着一根红蓝双色圆珠笔。\n\n他没有看那份长达二十页的法案，只是机械地开口：“潘同学，我算过了。如果按照你的法案推进‘社团活动’，我每周将损失145分钟的有效刷题时间。这等于我在理综考试中会少做两道大题。”\n\n“但你会获得完整的青春。”潘仁越试图解释。\n\n“青春不能换取C9高校的提档线。”王卷豪打断了他，“我只关心一件事：你的法案，会不会强制要求我们离开座位？只要你能在草案里加一条‘保留做题家自愿放弃素质教育的权利’，我的票就是你的。”',
    choices: [
      {
        text: '保证不影响学习',
        previewText: '+5 赞同票，TPR +200',
        effect: (state: GameState) => {
          if (state.parliamentState?.activeBill) {
            return {
              parliamentState: {
                ...state.parliamentState,
                activeBill: {
                  ...state.parliamentState.activeBill,
                  lobbiedApproval: state.parliamentState.activeBill.lobbiedApproval + 5
                }
              },
              stats: { ...state.stats, tpr: state.stats.tpr + 200 }
            };
          }
          return {};
        }
      },
      {
        text: '法案比做题更重要',
        previewText: '赞同票不变，做题派感到不安，稳定度 -2',
        effect: (state: GameState) => {
          return {
            stats: { ...state.stats, stab: Math.max(0, state.stats.stab - 2) }
          };
        }
      }
    ]
  },
  negotiate_conservativeDem: {
    id: 'negotiate_conservativeDem',
    title: '与保守民主派交涉',
    description: '保守民主派的代表们穿着整洁的校服，端坐在沙发上。他们是那些既厌恶封安宝的严酷，又恐惧王照凯的暴力的“温和派”。\n\n“步子太大了，潘主席。”代表推了推眼镜，语气平缓却不容置疑，“立刻废除所有的仪容仪表检查？这太激进了。我们建议将法案拆分为三个阶段，用六个月的时间逐步试行。合一需要的是稳健的改良，而不是一场颠覆性的地震。”\n\n潘仁越心里清楚，六个月后高考就结束了，这种所谓的“稳健”本质上就是将改革无限期搁置。但看着他们手中握着的那一大把选票，潘仁越陷入了长久的沉默。',
    choices: [
      {
        text: '承诺稳健推行',
        previewText: '+10 赞同票，稳定度 +5，激进派愤怒值 +5',
        effect: (state: GameState) => {
          if (state.parliamentState?.activeBill) {
            return {
              parliamentState: {
                ...state.parliamentState,
                activeBill: {
                  ...state.parliamentState.activeBill,
                  lobbiedApproval: state.parliamentState.activeBill.lobbiedApproval + 10
                }
              },
              stats: {
                ...state.stats,
                stab: Math.min(100, state.stats.stab + 5),
                radicalAnger: Math.min(100, state.stats.radicalAnger + 5)
              }
            };
          }
          return {};
        }
      },
      {
        text: '我们需要大刀阔斧的改革',
        previewText: '赞同票不变，保守派感到担忧',
        effect: (state: GameState) => state
      }
    ]
  },
  negotiate_jidiTutoring: {
    id: 'negotiate_jidiTutoring',
    title: '与及第补习派交涉',
    description: '傍晚，一位西装革履的成年人走进了办公室。他不是学生，也不是老师，而是及第教育的区域业务经理。资本的暗流涌动，终于在民主的缝隙中浮出水面。\n\n“潘同学，及第教育非常赞赏您的改革精神。”经理微笑着递上一张支票和一份厚厚的合同，“我们听说学生自治委员会的运转资金很紧张。我们愿意全额赞助新法案中提到的所有素质拓展活动。”\n\n潘仁越警惕地看着他：“代价是什么？”\n\n“非常合理的小要求。所有受赞助的社团，只需在活动中使用及第教育印发的‘生涯规划手册’，并在周末允许我们设立两个小小的招生咨询台。”经理的笑容完美无瑕，“你们得到了自由，我们得到了市场。双赢。”',
    choices: [
      {
        text: '接受他们的“赞助”',
        previewText: '+10 赞同票，资本渗透度 +10，获得 50 PP',
        effect: (state: GameState) => {
          if (state.parliamentState?.activeBill) {
            return {
              parliamentState: {
                ...state.parliamentState,
                activeBill: {
                  ...state.parliamentState.activeBill,
                  lobbiedApproval: state.parliamentState.activeBill.lobbiedApproval + 10
                }
              },
              stats: {
                ...state.stats,
                capitalPenetration: Math.min(100, state.stats.capitalPenetration + 10),
                pp: state.stats.pp + 50
              }
            };
          }
          return {};
        }
      },
      {
        text: '拒绝资本的干预',
        previewText: '赞同票不变，及第补习派支持度下降',
        effect: (state: GameState) => {
          return {
            studentAssemblyFactions: state.studentAssemblyFactions ? {
              ...state.studentAssemblyFactions,
              jidiTutoring: Math.max(0, state.studentAssemblyFactions.jidiTutoring - 2),
              otherDem: state.studentAssemblyFactions.otherDem + 2
            } : undefined
          };
        }
      }
    ]
  },
  bill_passed: {
    id: 'bill_passed',
    title: '法案通过！',
    description: '当电子计票器上的绿色赞成票数最终定格在绝对多数线之上，整座艺术礼堂爆发出了经久不息的掌声。历经数日唇枪舌剑的派系博弈与走廊游说，这项承载着改革意志的议案终于跨过了议会门槛，正式化作重塑合肥一中校园秩序的最高法典！',
    choices: [
      {
        text: '太好了！',
        previewText: '获得国家精神：民主的胜利，稳定度 +10，联盟团结度 +10',
        effect: (state: GameState) => {
          const newSpirits = [...state.nationalSpirits];
          if (!newSpirits.some(s => s.id === 'democratic_victory')) {
            newSpirits.push({
              id: 'democratic_victory',
              name: '民主的胜利',
              description: "首份改革法案在学生代表大会上的高票通过，向全校宣告了民选议会绝非装点门面的橡皮图章。从走廊里的联署辩论到庄严的举手表决，合一学子第一次用选票与法槌亲手改写了主宰自身命运的校园法典，脆弱的民主宪政终于在这片废墟之上扎下了第一寸根基。",
              type: 'positive',
              icon: '📜',
              effects: { allianceUnityDaily: 0.5, stabDaily: 0.5 }
            });
          }
          return {
            stats: {
              ...state.stats,
              stab: Math.min(100, state.stats.stab + 10),
              allianceUnity: Math.min(100, state.stats.allianceUnity + 10)
            },
            nationalSpirits: newSpirits
          };
        }
      }
    ]
  },
  bill_failed: {
    id: 'bill_failed',
    title: '法案被否决',
    description: '冰冷的红色“否决”字样在大屏幕上亮起，会场内瞬间陷入了一片压抑的喧哗与相互指责。由于各派系在核心利益上寸步不让，这项备受瞩目的议案最终折戟于代表大会的表决席前，同盟内部深不见底的路线裂痕再一次暴露在了全校师生面前。',
    choices: [
      {
        text: '我们需要重新审视我们的策略...',
        previewText: '稳定度 -10，联盟团结度 -15，激进派愤怒值 +10',
        effect: (state: GameState) => {
          return {
            stats: {
              ...state.stats,
              stab: Math.max(0, state.stats.stab - 10),
              allianceUnity: Math.max(0, state.stats.allianceUnity - 15),
              radicalAnger: Math.min(100, state.stats.radicalAnger + 10)
            }
          };
        }
      }
    ]
  },
  day_14_event: {
    id: 'day_14_event',
    title: '自治会负责人的抉择',
    description: '校长办公室里弥漫着昂贵茶叶的香气。封安宝靠在宽大的皮椅上，冷冷地注视着办公桌上的《关于成立合一学生自治会的指导意见》。这是一把双刃剑——它能把监控探头安装到每一个学生的课桌前，但也极易引发暴乱。他需要一个完美的“指导老师”来充当这块挡箭牌。\n\n高三年级部主任吴福军站在一旁，满脸横肉因为兴奋而颤抖：“校长，交给我！只要给我几个带袖标的保安和学生督察，我保证把那帮刺头收拾得服服帖帖，连上厕所都得按秒计！”\n\n封安宝没有说话，而是将目光投向了坐在沙发上、正慢条斯理吹着茶叶沫的老人——特级教师、英语名师工作室带头人杨玉乐。\n\n杨玉乐稀疏的头顶在灯光下反着光，他露出一个圆滑且无害的微笑：“吴主任雷厉风行，固然是好。但现在的学生啊，满脑子‘人类生而自由’，硬来恐怕会授人以柄。自治会嘛，既然叫‘自治’，总得披上一层温情脉脉的学术外衣。老朽不才，愿以这‘特级教师’的薄面，替学校分忧。只要规矩定得细，孩子们自然会‘自愿’遵守的。”\n\n封安宝露出了满意的笑容。暴力固然有效，但虚伪的权威才更加致命。',
    choices: [
      {
        text: '任命吴福军：铁腕镇压！',
        previewText: '获得持续30天的国家精神“愤怒的合一”：每日稳定度+0.5%，学生支持度-0.5%，激进愤怒度+0.5%',
        effect: (state: GameState) => {
          return {
            nationalSpirits: [...state.nationalSpirits, {
              id: 'angry_hefei_no1',
              name: '愤怒的合一',
              description: "吴福军推行的准军事化高压统治，将整座滨湖校区变成了一口安全阀被焊死的高压锅。防暴胶棍与量化罚单虽然在表面上制造了鸦雀无声的顺从，却在每一间熄灯后的寝室与每一张堆满密卷的课桌下酝酿着足以焚毁一切的滔天怒火。",
              type: 'negative',
              effects: { stabDaily: 0.5, ssDaily: -0.5, radicalAngerDaily: 0.5 }
            }],
            flags: { ...state.flags, angry_hefei_no1_days_left: 30 }
          };
        }
      },
      {
        text: '任命杨玉乐：水到渠成。',
        previewText: '免费雇佣顾问杨玉乐，并达成进入杨玉乐线的条件',
        effect: (state: GameState) => {
          const newAdvisors = [...state.advisors];
          const emptySlotIndex = newAdvisors.findIndex(a => a === null);
          const yangYuleAdvisor = {
            id: 'yang_yule',
            title: '特级教师',
            name: '杨玉乐',
            description: "作为合肥一中资历最深的特级教师与校内老保势力的头面人物，杨玉乐深谙一套比防暴胶棍更为致命的统治艺术——‘春风化雨’式的软性维稳。他手捧掉漆的枸杞保温杯，惯于用长辈的悲悯、高考前途的恐吓与细密如网的学风规训，将学生的反抗烈火悄无声息地消解在题海与内疚之中。",
            cost: 0,
            modifiers: { stabDaily: 0.05, ppDaily: 0.5 }
          };
          
          if (emptySlotIndex !== -1) {
            newAdvisors[emptySlotIndex] = yangYuleAdvisor;
          } else {
            // Force replace the last advisor if full
            newAdvisors[newAdvisors.length - 1] = yangYuleAdvisor;
          }
          
          return {
            advisors: newAdvisors,
            flags: { ...state.flags, yang_yule_route_unlocked: true }
          };
        }
      }
    ]
  },
  resource_exchange_event: {
    id: 'resource_exchange_event',
    title: '资源统筹与分配',
    description: '随着全校各处要害据点相继插上联合革命委员会的旗帜，一场关乎新政权生死存亡的硬仗从走廊街垒转移到了后勤账本之上：如何将缴获的庞大做题资源与高涨的群众热情转化为持久的执政根基？\n\n在B3教学楼戒备森严的地下库房里，从原教务处与及第补习点查抄来的数万册《五年高考三年模拟》、内部押题密卷正堆积如山；与此同时，各年级自发报名参加护校纠察与宣传印刷的志愿者名单也已塞满了总部的收发室。\n\n“让密卷在库房里发霉，或者让同学们的革命热情在无序中空耗，都是对起义成果的犯罪。”王照凯在资源统筹会议上重重敲击着桌面，“我们必须建立一套严密的物资与动员转换机制——用垄断的教辅资源去武装基层互助组，用群众的呼声去碾碎旧官僚的复辟幻想！”\n\n随着“全校资源统筹委员会”的正式挂牌，这台新生的革命机器终于拥有了源源不断输送政治血液的心脏。',
    buttonText: '物尽其用，人尽其才。'
  },
  jidi_mock_exam_approach_event: {
    id: 'jidi_mock_exam_approach_event',
    title: '二模的阴云：财报季的考验',
    description: '合肥市第二次模拟考试的倒计时牌被换成了及第资本的电子屏，上面不仅闪烁着距离考试的天数，还实时滚动着各年级的预测一本率。\n\n“各位董事，二模不仅是一次全市统考，更是我们‘提分工厂’模式向市场交出的第一份答卷。”方田在联合管理委员会的视频会议上推了推金丝眼镜，“如果数据不好看，我们的C轮融资就会泡汤，在座各位的期权也会变成废纸。”\n\n“可是学生们的理智值已经濒临崩溃了，”合一教师协会的代表忧心忡忡，“再加大压榨力度，我怕会出人命。”\n\n“只要没死在考场上，就给我继续做题！”新东方资本的代表冷酷地打断了他，“我们是来赚钱的，不是来做慈善的。”\n\n面对即将到来的二模，及第资本必须做出抉择：',
    choices: [
      {
        text: '加大研发投入，用题海淹没他们！',
        effect: (state) => ({
          stats: { ...state.stats, studentSanity: Math.max(0, state.stats.studentSanity - 15) },
          jidiCorporateState: state.jidiCorporateState ? {
            ...state.jidiCorporateState,
            gdp: state.jidiCorporateState.gdp + 1000
          } : undefined
        })
      },
      {
        text: '稍微放松一下，避免发生极端事件。',
        effect: (state) => ({
          stats: { ...state.stats, studentSanity: Math.min(100, state.stats.studentSanity + 10) },
          jidiCorporateState: state.jidiCorporateState ? {
            ...state.jidiCorporateState,
            admissionRate: Math.max(0, state.jidiCorporateState.admissionRate - 0.05)
          } : undefined
        })
      }
    ]
  },
  mock_exam_approach_event: {
    id: 'mock_exam_approach_event',
    title: '二模的阴云',
    description: '二模考试的倒计时牌被重新挂在了教学楼的显眼位置。联合革命委员会的会议室里，气氛异常凝重。\n\n“同志们，二模不仅是一次考试，更是对我们路线的公投。”王照凯敲着桌子，“如果我们不能在二模中取得好成绩，那些保守派和及第教育的残党就会借机反扑，说我们的自治是一场闹剧！”\n\n“但我们不能为了分数牺牲自由！”潘仁越反驳道，“如果重新回到题海战术，那我们的革命还有什么意义？”\n\n“别吵了，”狗熊打了个哈欠，“要我说，不如直接把考卷烧了，大家一起跳宅舞多好。”\n\n面对即将到来的二模，我们必须做出决定：',
    choices: [
      {
        text: '全力备战，不惜一切代价！',
        previewText: '消耗 20 稳定度，获得 200 TPR。学生支持度下降。',
        effect: (state: GameState) => ({
          stats: { ...state.stats, stab: Math.max(0, state.stats.stab - 20), tpr: state.stats.tpr + 200, ss: Math.max(0, state.stats.ss - 10) }
        })
      },
      {
        text: '平衡发展，在自由与分数间寻找折中。',
        previewText: '消耗 10 稳定度，获得 100 TPR。',
        effect: (state: GameState) => ({
          stats: { ...state.stats, stab: Math.max(0, state.stats.stab - 10), tpr: state.stats.tpr + 100 }
        })
      },
      {
        text: '顺其自然，革命的果实比分数更重要。',
        previewText: '获得 10 学生支持度，但没有任何 TPR 加成。',
        effect: (state: GameState) => ({
          stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 10) }
        })
      }
    ]
  },
  yang_yule_mock_exam_approach_event: {
    id: 'yang_yule_mock_exam_approach_event',
    title: '二模的阴云',
    description: '合肥市第二次模拟考试即将到来。对于你来说，这不仅仅是一次全市统考，更是你向封安宝校长和教育局证明你“维稳与升学双管齐下”能力的试金石。\n\n“杨主任，这次二模的指标，封校长可是盯着呢。”吴福军在走廊里似笑非笑地对你说，“要是成绩滑坡了，你这‘软性维稳’的招牌可就砸了。”\n\n你回到办公室，看着桌上堆积如山的维稳报告和成绩单，感到一阵头痛。你必须在镇压学生反抗和逼迫他们做题之间找到一个平衡点。',
    choices: [
      {
        text: '加大施压，用高压政策逼迫学生提分！',
        previewText: '消耗 20 稳定度，获得 200 TPR。激进愤怒度上升。',
        effect: (state: GameState) => ({
          stats: { ...state.stats, stab: Math.max(0, state.stats.stab - 20), tpr: state.stats.tpr + 200, radicalAnger: Math.min(100, state.stats.radicalAnger + 15) }
        })
      },
      {
        text: '维持现状，稳扎稳打。',
        previewText: '消耗 10 稳定度，获得 100 TPR。',
        effect: (state: GameState) => ({
          stats: { ...state.stats, stab: Math.max(0, state.stats.stab - 10), tpr: state.stats.tpr + 100 }
        })
      },
      {
        text: '稍微放松管控，避免考前崩溃。',
        previewText: '激进愤怒度下降 15，失去 100 TPR。',
        effect: (state: GameState) => ({
          stats: { ...state.stats, radicalAnger: Math.max(0, state.stats.radicalAnger - 15), tpr: Math.max(0, state.stats.tpr - 100) }
        })
      }
    ]
  },
  yang_desk_paper_authorship: {
    id: 'yang_desk_paper_authorship',
    title: '关于名师工作室年度教研论文的署名权归属',
    description: '一张墨迹未干的教研论文打印件摆在你的桌面上，题目是《新高考背景下英语被动语态的具象化教学》。\n\n这是工作室里刚毕业的李老师熬了三个通宵写出来的。论文逻辑严密，完全有实力冲击省级核心期刊。但是，教育局评审“正高级职称”的截止日期就在下个月，而你自己的那个文件夹里，只有几篇狗屁不通的日记。李老师正站在办公桌前，紧张地搓着手，等待你的“指导意见”。',
    choices: [
      {
        text: '盖上“同意”印章，并在第一作者栏写上自己的名字。',
        previewText: '“这篇就由我来挂帅吧。” 获得 20 政治点数，教师支持度大幅下降。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, pp: state.stats.pp + 20 },
            yangYuleState: { ...yyState, teacherSupport: Math.max(0, yyState.teacherSupport - 20) }
          };
        }
      },
      {
        text: '把文件推回给李老师。',
        previewText: '“年轻人的成果，我就不抢了。” 获得 15 教师支持度，但因焦虑丢掉 5 健康度。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            yangYuleState: { ...yyState, teacherSupport: Math.min(100, yyState.teacherSupport + 15), health: Math.max(0, yyState.health - 5) }
          };
        }
      },
      {
        text: '戴上老花镜，亲自用红笔往里塞“ED/ING”的私货。',
        previewText: '修改后的论文变得狗屁不通被拒稿。消耗 10 健康度，封校好感度下降。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            yangYuleState: { ...yyState, health: Math.max(0, yyState.health - 10), fengFavor: Math.max(0, yyState.fengFavor - 5) }
          };
        }
      }
    ]
  },

  yang_desk_contraband_list: {
    id: 'yang_desk_contraband_list',
    title: '高三年级违禁品查收清单',
    description: '新成立的“学生督察队”成了你的直属鹰犬。今天他们送来了一份清单，上面写着从B3教学楼王照凯的课桌夹层里搜出了一叠“违禁宣传册”。\n\n但是，今天你的脑雾有些严重，视线模糊不清，单凭肉眼根本看不清清单附件上写的是《资本论简读》还是《及第教育冲刺密卷》。你要如何批示？',
    choices: [
      {
        text: '拿起红笔盲批：“全校通报批评并停课一周！”',
        previewText: '宁可错杀一千！激进愤怒度下降 15，学生支持度下降 20，消耗 5 健康度。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.max(0, state.stats.radicalAnger - 15), ss: Math.max(0, state.stats.ss - 20) },
            yangYuleState: { ...yyState, health: Math.max(0, yyState.health - 5) }
          };
        }
      },
      {
        text: '拿起保温杯喝口茶，和稀泥。',
        previewText: '“快高考了，没收教育一下就算了。” 恢复 5 健康度，学生支持度上升 5，激进愤怒度暴增 20。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 5), radicalAnger: Math.min(100, state.stats.radicalAnger + 20) },
            yangYuleState: { ...yyState, health: Math.min(100, yyState.health + 5) }
          };
        }
      },
      {
        text: '戴上老花镜仔细端详，发现是漏题卷，私自扣留。',
        previewText: '用于下次课堂小测掩饰教学漏洞。消耗 15 健康度，封校好感度和学生支持度上升 10。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 10) },
            yangYuleState: { ...yyState, health: Math.max(0, yyState.health - 15), fengFavor: Math.min(100, yyState.fengFavor + 10) }
          };
        }
      }
    ]
  },

  yang_desk_tutoring_center: {
    id: 'yang_desk_tutoring_center',
    title: '及第教育周末“培优班”师资借调密函',
    description: '这封信直接塞在你的抽屉里。发件人是及第教育的总经理——封安宝校长的亲弟弟。信中“诚挚邀请”杨副校长名师工作室的骨干教师们，周末去及第教育的地下教室兼职授课。\n\n报酬极其丰厚，而且信的末尾隐晦地暗示，这是“封校长的意思”。这完全违反了教育局的禁令，一旦被查，后果不堪设想。',
    choices: [
      {
        text: '盖章同意，派遣年轻教师充当黑工。',
        previewText: '资本的触手越伸越长。封校好感度暴涨 25，获得 200 试卷储备量，教师与学生支持度双降。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, tpr: state.stats.tpr + 200, ss: Math.max(0, state.stats.ss - 15) },
            yangYuleState: { ...yyState, fengFavor: Math.min(100, yyState.fengFavor + 25), teacherSupport: Math.max(0, yyState.teacherSupport - 15) }
          };
        }
      },
      {
        text: '拿起红色座机，委婉拒绝。',
        previewText: '“老师们实在抽不开身。” 教师支持度上升 20，封校好感度下降 20。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            yangYuleState: { ...yyState, teacherSupport: Math.min(100, yyState.teacherSupport + 20), fengFavor: Math.max(0, yyState.fengFavor - 20) }
          };
        }
      },
      {
        text: '这种肥差怎么能便宜年轻人？决定亲自去讲。',
        previewText: '获得 400 试卷储备量，但因过度劳累，健康度断崖式下跌 30。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, tpr: state.stats.tpr + 400 },
            yangYuleState: { ...yyState, health: Math.max(0, yyState.health - 30) }
          };
        }
      }
    ]
  },

  yang_desk_pe_cancellation: {
    id: 'yang_desk_pe_cancellation',
    title: '操场设施翻修暨高三体育课全面暂停通知',
    description: '封安宝校长又想修地基了。这次的理由是“操场塑胶跑道老化”，实际上谁都知道这是为了套取工程款，并顺理成章地将高三仅剩的每周一节体育课全部改成自习。\n\n作为分管教学的副校长，这份文件需要你最终签字背书，向全校发布。',
    choices: [
      {
        text: '毫不犹豫地盖章同意。',
        previewText: '“高考才是革命的目的！” 封校好感度上升 10，激进愤怒度上升 15。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 15) },
            yangYuleState: { ...yyState, fengFavor: Math.min(100, yyState.fengFavor + 10) }
          };
        }
      },
      {
        text: '利用特级教师的权威，驳回文件。',
        previewText: '“孩子们脑供血不足，英语听力是会听串的！” 封校好感度下降 15，学生支持度上升 15。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 15) },
            yangYuleState: { ...yyState, fengFavor: Math.max(0, yyState.fengFavor - 15) }
          };
        }
      },
      {
        text: '批示：把体育课改成在教室里的“室内冥想英语课”。',
        previewText: '既不修操场也不让休息。封校好感度上升 5，激进愤怒度暴增 20。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 20) },
            yangYuleState: { ...yyState, fengFavor: Math.min(100, yyState.fengFavor + 5) }
          };
        }
      }
    ]
  },

  yang_desk_anonymous_note: {
    id: 'yang_desk_anonymous_note',
    title: '一封没有署名的字条',
    description: '今天你拉开抽屉，发现里面静静地躺着一张用红笔写的字条。\n\n上面只有一句话：“杨校长，您11月4日在那节公开课上说错的全部语法点录音，以及逼走李老师的谈话记录，都在我们手里。撤走B3教学楼的眼线，否则我们将把这些寄给省教育厅。——一群不再做题的人”。这是来自“钢铁红蛤”的直接心理战！',
    choices: [
      {
        text: '惊恐万状，拿起电话妥协退让。',
        previewText: '精神防线被击穿，健康度暴跌 20，激进愤怒度上升 30，学生支持度下降 10。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 30), ss: Math.max(0, state.stats.ss - 10) },
            yangYuleState: { ...yyState, health: Math.max(0, yyState.health - 20) }
          };
        }
      },
      {
        text: '恼羞成怒，拍桌子下令强行搜查镇压。',
        previewText: '消耗 10 健康度，封校好感度上升 5，激进愤怒度上升 20。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 20) },
            yangYuleState: { ...yyState, health: Math.max(0, yyState.health - 10), fengFavor: Math.min(100, yyState.fengFavor + 5) }
          };
        }
      },
      {
        text: '（阿尔茨海默症发作）盯着字条发呆，全忘了，拿字条包茶叶沫扔掉。',
        previewText: '“钢铁红蛤”误以为你城府极深而陷入自我怀疑。无健康惩罚，激进愤怒度下降 10。',
        effect: (state: GameState) => ({
          stats: { ...state.stats, radicalAnger: Math.max(0, state.stats.radicalAnger - 10) }
        })
      }
    ]
  },

  yang_desk_oath_rally: {
    id: 'yang_desk_oath_rally',
    title: '关于开展“感恩封校，拼搏百日”大型誓师大会的审批',
    description: '校长室递来了一份标着“加急”的红头签报：封安宝要求你在下周一牵头举办一场声势浩大的“感恩封校，百日泣血”高三誓师大会，不仅勒令全年级学生在寒雨中列队高喊狼性口号、当场咬破手指书写冲刺血书，还要邀请市教育电视台全程跟拍，以此向市局领导展示合一铁腕治校的“赫赫政绩”。\n\n看着窗外阴冷刺骨的冬雨，再看看底下早已如同惊弓之鸟的高三各班，你手里的钢笔悬在了审批栏上方。',
    choices: [
      {
        text: '盖章同意。',
        previewText: '形式主义的巅峰之作，反正淋雨的又不是我。封校好感度上升 15，学生支持度下降 20，健康度下降 5。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, ss: Math.max(0, state.stats.ss - 20) },
            yangYuleState: { ...yyState, fengFavor: Math.min(100, yyState.fengFavor + 15), health: Math.max(0, yyState.health - 5) }
          };
        }
      },
      {
        text: '拿起红色座机驳回。',
        previewText: '这会把被压抑的孩子们直接逼疯的！封校好感度下降 20，激进愤怒度下降 15。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.max(0, state.stats.radicalAnger - 15) },
            yangYuleState: { ...yyState, fengFavor: Math.max(0, yyState.fengFavor - 20) }
          };
        }
      },
      {
        text: '称病推诿给后勤处吴福军。',
        previewText: '让那个莽夫去操场上淋雨挨骂吧。健康度恢复 10，教师支持度下降 10。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            yangYuleState: { ...yyState, health: Math.min(100, yyState.health + 10), teacherSupport: Math.max(0, yyState.teacherSupport - 10) }
          };
        }
      }
    ]
  },

  yang_desk_destroy_books: {
    id: 'yang_desk_destroy_books',
    title: '关于集中销毁原阅览室“陈栋时期”非考试类书刊的通知',
    description: '保卫科的几名协管员抬着四个塞得鼓鼓囊囊的麻袋走进了你的办公室——里面全是从老图书馆顶楼尘封库房里搜出来的陈栋时代旧藏书，包括整套的《南方周末》合订本、西方政治哲学译丛以及早年学生自办的民主校刊。\n\n封安宝在附带的便签上冷冷批示：“此类旧时代自由化毒草，严重腐蚀高三学子做题心智，请杨副校长即刻签字，押送锅炉房集中销毁。”',
    choices: [
      {
        text: '盖章同意，扔进焚烧炉。',
        previewText: '彻底埋葬过去的民主合一。封校好感度上升 10，激进愤怒度上升 20。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 20) },
            yangYuleState: { ...yyState, fengFavor: Math.min(100, yyState.fengFavor + 10) }
          };
        }
      },
      {
        text: '戴上老花镜，偷偷扣留几本。',
        previewText: '留点废纸垫办公桌角。健康度下降 5，激进愤怒度微升 5。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 5) },
            yangYuleState: { ...yyState, health: Math.max(0, yyState.health - 5) }
          };
        }
      },
      {
        text: '不理会，直接锁进档案室吃灰。',
        previewText: '多一事不如少一事。健康度恢复 5。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            yangYuleState: { ...yyState, health: Math.min(100, yyState.health + 5) }
          };
        }
      }
    ]
  },

  yang_desk_buy_exams: {
    id: 'yang_desk_buy_exams',
    title: '教务处关于统一征订《及第教育·新高考绝密卷》的财务申请',
    description: '教务处送来了一份《关于高三年级全员强制征订〈及第教育·新高考绝密押题卷〉的财务拨款申请》，规定全年级三千名学生必须以高出市面同类教辅30%的天价人手认购一套。\n\n你翻开审批夹的最后一页，发现底下赫然夹着一个鼓鼓囊囊、没有署名的牛皮纸信封，里面隐约露出一沓崭新的购物卡与一张写着“杨特茶水费”的字条。',
    choices: [
      {
        text: '盖章同意，笑纳回扣。',
        previewText: '资本的恶臭在此时显得如此芬芳。封校好感度上升 20，激进愤怒度上升 25，获得 300 试卷储备量。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 25), tpr: state.stats.tpr + 300 },
            yangYuleState: { ...yyState, fengFavor: Math.min(100, yyState.fengFavor + 20) }
          };
        }
      },
      {
        text: '拿起红色座机，要求降低定价。',
        previewText: '试着为学生争取一点利益。教师支持度上升 10，封校好感度下降 15。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            yangYuleState: { ...yyState, teacherSupport: Math.min(100, yyState.teacherSupport + 10), fengFavor: Math.max(0, yyState.fengFavor - 15) }
          };
        }
      },
      {
        text: '以老眼昏花为由搁置文件。',
        previewText: '假装看不清金额，先放着吧。健康度恢复 5。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            yangYuleState: { ...yyState, health: Math.min(100, yyState.health + 5) }
          };
        }
      }
    ]
  },

  yang_desk_mocking_letter: {
    id: 'yang_desk_mocking_letter',
    title: '高三28班全体家长关于杨副校长“卓越教学”的联名感谢信',
    description: '收发室今天转来了一封题为《高三28班全体家长致杨玉乐副校长“卓越教学艺术”的联名致敬信》。信中用尽了极其浮夸华丽的排比辞藻，歌颂你将“被动加ED、主动加ING”的语法至理讲得“字字珠玑、震古烁今”，甚至在信末泣血恳请学校将你的英语课增加到每天四节，以便“用五十升的智慧空气彻底净化孩子们的灵魂”。\n\n看着信纸上那股快要溢出纸面的阴阳怪气与反讽锋芒，你不用猜也知道，这绝对是28班那群刺头学生模仿家长口吻攒出来的联名檄文。',
    choices: [
      {
        text: '盖章同意，并全校通报表扬。',
        previewText: '只要我不觉得尴尬，尴尬的就是别人！封校好感度上升 10，健康度下降 10，学生支持度清零。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, ss: 0 },
            yangYuleState: { ...yyState, fengFavor: Math.min(100, yyState.fengFavor + 10), health: Math.max(0, yyState.health - 10) }
          };
        }
      },
      {
        text: '愤怒地将信纸撕碎。',
        previewText: '血压飙升！健康度下降 15，激进愤怒度上升 10。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 10) },
            yangYuleState: { ...yyState, health: Math.max(0, yyState.health - 15) }
          };
        }
      },
      {
        text: '端起保温杯，将其压在杯底。',
        previewText: '不理会捧杀。健康度恢复 5，激进愤怒度微升 5。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 5) },
            yangYuleState: { ...yyState, health: Math.min(100, yyState.health + 5) }
          };
        }
      }
    ]
  },

  yang_desk_standing_reading: {
    id: 'yang_desk_standing_reading',
    title: '名师工作室关于强制推行“无死角站立早读”的教改草案',
    description: '为了在年底的市级教改评比中搞出一点抓人眼球的“政绩创新”，名师工作室的几名年轻骨干向你呈交了一份《高三年级“无死角站立早读”推行草案》。\n\n草案规定：每日清晨六点二十至七点十分，全年级撤除所有课椅，全体学生必须保持军姿笔直站立背书，严禁任何倚靠桌沿或弯腰低头的动作，违者由走廊巡查员当场拍照扣分。',
    choices: [
      {
        text: '盖章同意，全级部推行。',
        previewText: '纪律和痛苦就是最好的生产力！获得 15 政治点数，学生支持度下降 20，激进愤怒度上升 15。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, pp: state.stats.pp + 15, ss: Math.max(0, state.stats.ss - 20), radicalAnger: Math.min(100, state.stats.radicalAnger + 15) }
          };
        }
      },
      {
        text: '拿起红笔，批示仅在平行班推行。',
        previewText: '拿平行班当实验小白鼠吧。教师支持度上升 10，激进愤怒度上升 10。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 10) },
            yangYuleState: { ...yyState, teacherSupport: Math.min(100, yyState.teacherSupport + 10) }
          };
        }
      },
      {
        text: '驳回文件。',
        previewText: '单纯不想增加自己早起巡查的工作量。健康度恢复 10，教师支持度下降 10。',
        effect: (state: GameState) => {
          const yyState = state.yangYuleState!;
          return {
            yangYuleState: { ...yyState, health: Math.min(100, yyState.health + 10), teacherSupport: Math.max(0, yyState.teacherSupport - 10) }
          };
        }
      }
    ]
  },

  // === 新增随机事件 (v7.0) ===
  yang_desk_health_scare: {
    id: 'yang_desk_health_scare',
    title: '体检报告上的红色警告',
    description: '一份皱巴巴的教职工年度体检报告混在文件堆里。血压160/100，脂肪肝重度，心电图显示心房颤动早期。报告建议"立即住院观察"。\n\n你捏着这张纸，手有点抖。保温杯里的枸杞水突然变得索然无味。是时候认真考虑一下自己的健康状况了——还是说，先把这报告藏起来，等评完正高级再说？',
    choices: [
      { text: '把体检报告锁进最底层的抽屉。', previewText: '眼不见为净。健康 -10，稳定度 +5。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, health: Math.max(0, yy.health - 10) }, stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 5) } };
      }},
      { text: '暂停半天工作，去医务室躺一会儿。', previewText: '身体是维稳的本钱。健康 +15，封信任 -5。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, health: Math.min(100, yy.health + 15), fengFavor: Math.max(0, yy.fengFavor - 5) } };
      }},
      { text: '把体检报告复印一份匿名寄给吴福军。', previewText: '"老吴啊，你也该查查了。" 健康 -3，封信任 +8。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, health: Math.max(0, yy.health - 3), fengFavor: Math.min(100, yy.fengFavor + 8) } };
      }}
    ]
  },
  yang_desk_parent_petition: {
    id: 'yang_desk_parent_petition',
    title: '家长联名信：还我体育课',
    description: '一封由三十多位家长联名签署的信件摊在桌上。信中说，自从你取消了体育课改上英语辅导，孩子们出现了视力下降、腰椎劳损，有一个孩子在走廊里因为低血糖晕倒了。\n\n家长们的措辞很克制，但字里行间透着一股冰冷的愤怒。信的末尾写着："杨老师，我们理解升学压力，但请把体育课还给孩子们。"',
    choices: [
      { text: '在信的背面批注"已阅"然后归档。', previewText: '装聋作哑。封信任 +5，学生理智 -10。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, fengFavor: Math.min(100, yy.fengFavor + 5) }, stats: { ...state.stats, studentSanity: Math.max(0, state.stats.studentSanity - 10) } };
      }},
      { text: '回复家长：每周恢复一节体育课，但改成英语口令跑操。', previewText: '折中方案。教师支持 +10，封信任 -5。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, teacherSupport: Math.min(100, yy.teacherSupport + 10), fengFavor: Math.max(0, yy.fengFavor - 5) } };
      }},
      { text: '亲自给每位家长打电话安抚。', previewText: '消耗大量精力。健康 -8，学生支持 +10。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, health: Math.max(0, yy.health - 8) }, stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 10) } };
      }}
    ]
  },
  yang_desk_young_teacher_quit: {
    id: 'yang_desk_young_teacher_quit',
    title: '年轻教师的辞职信',
    description: `一封辞呈从文件堆里滑落——是上学期刚招进来的英语组小王老师。信中写道：每天被逼着吹捧'被动语态'的重要性，我觉得自己在浪费生命。

小王是你亲自面试进来的，985毕业，口语流利。她本是英语组唯一的希望。现在她要去深圳一家培训机构了，月薪三万。办公桌对面，小王的工位已经空了。`,
    choices: [
      { text: '把辞职信撕碎，不批准。', previewText: '强留无用。教师支持 -15，健康 -5。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, teacherSupport: Math.max(0, yy.teacherSupport - 15), health: Math.max(0, yy.health - 5) } };
      }},
      { text: '签字放人，但要她签署三年的竞业限制。', previewText: '体面分手。封信任 +5，教师支持 -5。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, fengFavor: Math.min(100, yy.fengFavor + 5), teacherSupport: Math.max(0, yy.teacherSupport - 5) } };
      }},
      { text: '挽留她：承诺评完正高后推荐她做教研组长。', previewText: '画大饼。教师支持 +10，健康 -3。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, teacherSupport: Math.min(100, yy.teacherSupport + 10), health: Math.max(0, yy.health - 3) } };
      }}
    ]
  },
  yang_desk_informant_report: {
    id: 'yang_desk_informant_report',
    title: '密报：B3天台有人深夜集会',
    description: '你安插在寝室区的学生线人递来一张皱巴巴的纸条。上面用铅笔写着：凌晨一点，B3天台，七八个人围在一起，有人手里拿着红色的笔记本。\n\n线人的字迹很潦草，但信息是明确的——钢铁红蛤的地下组织在B3天台重新集结了。上次你清剿B3已经是两周前的事，看来他们像蟑螂一样顽强。',
    choices: [
      { text: '立即通知保安队，今夜突袭B3天台。', previewText: '雷霆手段。封信任 +10，SS -5，B3地块叛乱风险清零。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        const rl = { ...yy.rebelLocations }; delete rl['b3_tower']; delete rl['b3_a1a3']; delete rl['b3_b1b2'];
        return { yangYuleState: { ...yy, fengFavor: Math.min(100, yy.fengFavor + 10), rebelLocations: rl }, stats: { ...state.stats, ss: Math.max(0, state.stats.ss - 5) } };
      }},
      { text: '按兵不动，让线人继续潜伏。', previewText: '放长线钓大鱼。教师支持 -5，健康 -2（焦虑）。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, teacherSupport: Math.max(0, yy.teacherSupport - 5), health: Math.max(0, yy.health - 2) } };
      }},
      { text: '在B3天台安装隐蔽摄像头。', previewText: '技术手段。PP -15，封信任 +3。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, fengFavor: Math.min(100, yy.fengFavor + 3) }, stats: { ...state.stats, pp: Math.max(0, state.stats.pp - 15) } };
      }}
    ]
  },
  yang_desk_textbook_scandal: {
    id: 'yang_desk_textbook_scandal',
    title: '教材回扣的烫手山芋',
    description: '及第教育的销售代表又来了。这次他带来了一份"合作方案"——只要将及第教辅指定为全校统一教材，每本给你个人返回 15% 的佣金。\n\n粗略一算，合一四千多学生，每学期光英语一科你就能进账小十万。但上一次有老师因为教材回扣被举报，最后被教育局直接除名。',
    choices: [
      { text: '在合同上签下自己的名字。', previewText: '富贵险中求。PP +40，教师支持 -20，健康 -10。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, teacherSupport: Math.max(0, yy.teacherSupport - 20), health: Math.max(0, yy.health - 10) }, stats: { ...state.stats, pp: state.stats.pp + 40 } };
      }},
      { text: '拒绝回扣，但同意"试用"及第教辅。', previewText: '拿校方的钱做人情。封信任 +8，教师支持 -5。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, fengFavor: Math.min(100, yy.fengFavor + 8), teacherSupport: Math.max(0, yy.teacherSupport - 5) } };
      }},
      { text: '把销售代表赶出办公室并通知教务处。', previewText: '一身正气。教师支持 +15，封信任 -10。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, teacherSupport: Math.min(100, yy.teacherSupport + 15), fengFavor: Math.max(0, yy.fengFavor - 10) } };
      }}
    ]
  },
  yang_desk_alumni_donation: {
    id: 'yang_desk_alumni_donation',
    title: '校友捐赠的附加条件',
    description: '一位合一毕业的校友企业家找上门来。他愿意捐两百万给学校建一座新的英语语音室——但条件是，语音室必须以他的祖父命名，而他祖父是旧社会的一位私塾先生，曾在文革期间被批斗致死。\n\n封校长对这笔捐款很感兴趣，但他把这个烫手山芋扔给了你：你来决定要不要接受这笔"带有政治风险"的捐赠。',
    choices: [
      { text: '接受捐赠，对外宣传为"企业家回馈母校"。', previewText: '政治智慧。封信任 +15，PP +30，教师支持 -5。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, fengFavor: Math.min(100, yy.fengFavor + 15), teacherSupport: Math.max(0, yy.teacherSupport - 5) }, stats: { ...state.stats, pp: state.stats.pp + 30 } };
      }},
      { text: '婉拒捐赠，建议校友以匿名方式捐助。', previewText: '小心驶得万年船。封信任 -5，教师支持 +5。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, fengFavor: Math.max(0, yy.fengFavor - 5), teacherSupport: Math.min(100, yy.teacherSupport + 5) } };
      }},
      { text: '向教育局打报告请示。', previewText: '拖字诀。什么也不发生。健康 -5（写报告累的）。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, health: Math.max(0, yy.health - 5) } };
      }}
    ]
  },
  yang_desk_thermos_mystery: {
    id: 'yang_desk_thermos_mystery',
    title: '保温杯里的不明沉淀物',
    description: '你拧开保温杯，一股怪味扑鼻而来。杯底沉着一些深褐色的颗粒物，看起来不像是枸杞。\n\n你回想了一下——今天上午只有吴福军进来过你的办公室，说是来借订书机。吴福军最近因为你抢了他的风头，对你颇有微词。他有没有动机在你的杯子里动手脚？还是说这只是你喝了太多降压药导致的被害妄想？',
    choices: [
      { text: '把保温杯里的东西倒掉，装作什么都没发生。', previewText: '隐忍。健康 -8，封信任 +5（不惹事）。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, health: Math.max(0, yy.health - 8), fengFavor: Math.min(100, yy.fengFavor + 5) } };
      }},
      { text: '把保温杯送去实验室化验。', previewText: '科学求证。PP -10，健康 +5（安心了）。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, health: Math.min(100, yy.health + 5) }, stats: { ...state.stats, pp: Math.max(0, state.stats.pp - 10) } };
      }},
      { text: '当着吴福军的面把水倒掉，笑而不语。', previewText: '心理战。健康 -3，教师支持 +8。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, health: Math.max(0, yy.health - 3), teacherSupport: Math.min(100, yy.teacherSupport + 8) } };
      }}
    ]
  },
  yang_desk_snow_day: {
    id: 'yang_desk_snow_day',
    title: '停课通知：十年一遇的暴雪',
    description: '窗外飘起了鹅毛大雪。气象局发布了暴雪橙色预警，道路已经开始结冰。几个班主任站在办公室门口，等着你决定：今天要不要停课？\n\n如果停课，模拟考试就得推迟，这会打乱整个学期的教学进度。如果不停课，万一有学生在上学路上滑倒摔伤，你这个"代理副校长"就要负全责。',
    choices: [
      { text: '宣布停课一天。', previewText: '安全第一。学生理智 +15，教师支持 +10。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, teacherSupport: Math.min(100, yy.teacherSupport + 10) }, stats: { ...state.stats, studentSanity: Math.min(100, state.stats.studentSanity + 15) } };
      }},
      { text: '正常上课，通知家长接送。', previewText: '升学率不容闪失。封信任 +10，SS -10。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, fengFavor: Math.min(100, yy.fengFavor + 10) }, stats: { ...state.stats, ss: Math.max(0, state.stats.ss - 10) } };
      }},
      { text: '改成网课：学生在寝室用钉钉上课。', previewText: '技术折中。健康 -5，TPR +100。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, health: Math.max(0, yy.health - 5) }, stats: { ...state.stats, tpr: state.stats.tpr + 100 } };
      }}
    ]
  },
  yang_desk_retirement_letter: {
    id: 'yang_desk_retirement_letter',
    title: '封安宝的隐退暗示',
    description: '封校长难得主动约你在行政楼天台单独谈话。他递给你一支烟，看着远处的教学楼说："老杨啊，我最近血压不太好。上面有意让我去教育局挂个闲职。这合一校长的位置……你有没有兴趣？"\n\n他的眼神里有一种疲惫，也有一种试探。你在合一干了一辈子，从一个普通英语老师爬到今天。正高级职称已经近在眼前。如果再加上"校长"这个头衔……',
    choices: [
      { text: '"封校长放心，合一交给我，您安心养病。"', previewText: '趁势而上。封信任 +25，健康 -5（压力山大）。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, fengFavor: Math.min(100, yy.fengFavor + 25), health: Math.max(0, yy.health - 5) } };
      }},
      { text: '"我年纪也大了，还是年轻人来干吧。"', previewText: '谦虚推让。封信任 -10，教师支持 +15。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, fengFavor: Math.max(0, yy.fengFavor - 10), teacherSupport: Math.min(100, yy.teacherSupport + 15) } };
      }},
      { text: '转移话题："吴主任最近好像对您的位置也很感兴趣。"', previewText: '祸水东引。挑拨离间。封信任 +5，激进愤怒 +5。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, fengFavor: Math.min(100, yy.fengFavor + 5) }, stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 5) } };
      }}
    ]
  },
  yang_desk_midnight_call: {
    id: 'yang_desk_midnight_call',
    title: '凌晨三点的电话',
    description: '凌晨三点，红色座机突然响了。电话那头是一个陌生的女声，自称是"钢铁红蛤"的宣传部长。她的语气很平静，但每一个字都像针一样扎在你的耳膜上。\n\n"杨老师，我们知道你在偷偷吸学生的血。及第教辅的回扣、评职称时的论文造假、还有你打压年轻教师的那些事——我们都有证据。给你两周时间，公开辞职并向全校道歉。否则，我们会把这些材料寄给市教育局纪委。"\n\n电话挂断了。办公室里只剩下老式座钟的嗒嗒声。你的手在抖，保温杯差点摔在地上。',
    choices: [
      { text: '连夜销毁所有敏感文件。', previewText: '先下手为强。健康 -15，封信任 -10。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, health: Math.max(0, yy.health - 15), fengFavor: Math.max(0, yy.fengFavor - 10) } };
      }},
      { text: '不予理会，加强校园安保。', previewText: '硬撑。封信任 +10，激进愤怒 +15。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, fengFavor: Math.min(100, yy.fengFavor + 10) }, stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 15) } };
      }},
      { text: '主动约谈红蛤的地下成员谈判。', previewText: '以退为进。健康 -10，SS +5。', effect: (state: GameState) => {
        const yy = state.yangYuleState!;
        return { yangYuleState: { ...yy, health: Math.max(0, yy.health - 10) }, stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 5) } };
      }}
    ]
  },

  enter_treeB: {
    id: 'enter_treeB',
    title: '名师的阴影',
    description: 'B3教学楼的街垒虽然在欢呼声中攻克，但夺权后的学生同盟却在极低的稳定度与派系倾轧中迅速分崩离析。失去统一调度的教学楼沦为了无政府主义的泥潭，停课与断粮的恐慌在普通学生中疯狂蔓延。\n\n就在革委会陷入内耗瘫痪的致命时刻，以特级教师杨玉乐为首的校内保守派势力看准时机、趁虚而入。他们巧妙地利用了大多数做题家对高考秩序崩塌的深层恐惧，打着“师生共建、恢复日常教学”的温情旗号组建起“临时管理委员会”，兵不血刃地重新接管了全校的行政权柄。昔日叱咤风云的联合革委会骨干被迫转入地下管网，整座滨湖校区再次笼罩在了老保名师那慢条斯理却密不透风的阴影之下。',
    buttonText: '革命尚未成功...'
  },
  enter_treeC: {
    id: 'enter_treeC',
    title: '二次元的狂欢',
    description: 'B3教学楼虽然被起义学生攻占，但长期的高压内卷与及第教育的资本渗透早已将学生们的理智推向了崩溃的深渊。在这片精神荒原之上，钢铁红蛤的异端创始成员“狗熊”站上了历史的前台。\n\n他精准地利用了做题家们极度渴望逃避残酷现实的群体心理，用震耳欲聋的日本动漫OP、荒诞不经的二次元烂梗与彻夜不息的礼堂放映，将一场严肃的校园革命彻底解构成了一场逃避主义的末日狂欢。联合革命委员会的庄严纲领被撕得粉碎，取而代之的，是一个建立在艺术礼堂废墟之上、混合着多巴胺麻醉与扭曲幻想的“赛博娱乐天国”。',
    buttonText: '这...这是什么鬼？'
  },
  enter_treeD: {
    id: 'enter_treeD',
    title: '绝望的走廊巷战',
    description: 'B3教学楼的红旗虽然勉强升起，但联合革委会手中的试卷储备与后勤物资却已在漫长的消耗战中彻底见底。对于习惯了依靠刷题维持安全感的合一学子而言，失去了复习资料的供给，就意味着失去了新政权存在的全部合法性。\n\n嗅到血腥味的吴福军保安队与及第教育重金雇佣的校外安保武装趁势发起了猛烈的全面反扑。随着外围防线一处处崩塌，潘仁越带领着最后一批拒绝投降的理想主义者退守B3教学楼深处，用残破的课桌椅筑起最后一道街垒，在弥漫着粉笔灰与催泪瓦斯的走廊里展开了绝望的巷战。',
    buttonText: '战斗到最后一刻！'
  },
  enter_treeA: {
    id: 'enter_treeA',
    title: '联合革命委员会的胜利',
    description: '随着最后一道校方封锁线被冲垮，B3教学楼彻底回到了合一学子的手中！在王照凯严密的先锋队纪律与潘仁越广泛的民主号召力共同维系下，起义队伍顶住了夺权初期的混乱与反扑，保持了高昂的理智与空前的团结。\n\n在顶层会议室热烈的掌声中，由各大派系联合执政的最高权力中枢——“合肥一中联合革命委员会”正式宣告成立。旧时代的应试枷锁已然砸碎，书写新合一历史法典的画卷正在我们眼前徐徐展开！',
    buttonText: '新时代的曙光！'
  },
  strike_b3_success: {
    id: 'strike_b3_success',
    title: 'B3楼顶的统一战线',
    description: `当王照凯带着“钢铁红蛤”的骨干们推开B3教学楼顶层的消防门时，局势已经摇摇欲坠。潘仁越的“自由党”学生们确实有着令人钦佩的勇气，但他们对阶级斗争的残酷性一无所知。走廊尽头的街垒堆叠得杂乱无章，毫无纵深可言；没有排班表，没有饮用水储备，甚至连对讲机都没有统一频道。而在楼下，吴福军气急败坏的咆哮声和保安队冲击铁栅栏的金属撞击声，正如同死神的倒计时般步步逼近。

“王照凯？你来干什么？”潘仁越擦去额头的汗水，警惕地看着这群从28班杀出来的“做题家”。几名民主派的干事下意识地挡在潘仁越身前，他们对王照凯那些“激进的赤色理论”早有耳闻。“这里不需要你们的极端说教，我们在为合一的自由流血！”

“你们在为自由流血，但你们的血流得毫无价值！”王照凯厉声打断了他，大步迈入人群中央。随着他的手势，身后的“钢铁红蛤”党员们没有参与争吵，而是立刻以惊人的效率散开：有人开始重新加固受力点薄弱的街垒，有人拿出了手绘的B3楼层通风管路线图。“看看你们的防线！靠喊几句‘人类生而自由’就能挡住吴福军的防暴钢叉吗？”王照凯环视着四周或惊愕、或愤怒的面孔，“没有后勤，没有纪律，没有除了‘打倒安宝’之外的任何具体政治纲领！到了明天早上，饥饿、疲惫和校方的分化瓦解，就会让你们这场小资产阶级的狂热变成一场可悲的闹剧！”

“他想篡夺领导权！”一名强基班的民主派大喊道。但在他继续发难前，一位钢铁红蛤地下联络人站了出来。他一把揪住那名干事的衣领，指着楼梯间的方向吼道：“闭嘴！听听下面的声音！保安已经拿来液压剪了！如果现在不让凯子的人接管防线，大家今晚全都要被押进行政楼写检讨！“

沉闷的金属断裂声从楼下传来，那是第一道铁门被攻破的信号。空气瞬间凝固了。潘仁越看着那些动作熟练、眼神冷酷的“钢铁红蛤”成员，又看向王照凯。他那浪漫主义的起义幻想，终于一头撞上了冷酷的革命现实主义。

“我们需要统一战线，”王照凯放缓了语调，但目光依然如炬，“你们的黑天红字旗点燃了火种，我承认这一点。但要让火种燎原，我们需要先锋队的纪律和彻底砸烂内卷机器的纲领。放下派系之争吧，潘仁越。成立联合革命委员会，民主派与钢铁红蛤共同执政。这是我们唯一的生路。”

漫长的十秒钟过去了。在一阵剧烈的心理斗争后，潘仁越缓缓推开身边的干事，向王照凯伸出了右手。“联合革委会。但重大决策，必须共同投票。”“成交。”王照凯有力地握住了那只手。“现在，同志们，让我们给吴福军一点小小的无产阶级震撼。”`,
    buttonText: '星星之火，可以燎原！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 10), radicalAnger: Math.min(100, state.stats.radicalAnger + 10) }
    })
  },
  admin_takeover: {
    id: 'admin_takeover',
    title: '教务系统的瘫痪',
    description: "深夜十一点，行政楼三层的教务处中心机房被技术社的起义骨干悄然接管。随着几行强制格式化指令在终端屏幕上敲下，整排教务服务器的指示灯同时由绿转红——历年积累的全年级月考排名表、各班量化考核扣分总账、以及记录着数千名学生“违纪黑点”的电子档案，在短短几十秒内被彻底清空。黑屏的显示器中央，只留下了一行跳动的白色字符：“去你的内卷，我们不是数字。”\n\n第二天清晨，惊慌失措的教务处主任带着几名计算机老师冲进机房，面对空空如也的硬盘阵列面如土色。两名值班老师守在走廊门口面面相觑，压低声音问道：“所有的排名底档全没了……这事要是报给封校长，咱们怎么交差？”\n\n楼下的林荫道上，得知量化数据库彻底瘫痪的学生们抱着课本走过行政楼前，压抑了数月的走廊里第一次传出了肆无忌惮的欢笑声。",
    buttonText: '数据霸权的终结！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, stab: state.stats.stab - 10, pp: state.stats.pp + 20 }
    })
  },
  broadcast_seized: {
    id: 'broadcast_seized',
    title: '校园广播站的新声音',
    description: "下午第二节下课铃刚落，原本应该准时在全校上空响起的《运动员进行曲》突然被一阵剧烈的麦克风电流啸叫声硬生生掐断。三秒钟令人窒息的死寂之后，浑厚激昂的《国际歌》铜管旋律如同惊雷般从每一个教室墙角的广播喇叭里喷薄而出！\n\n“全体合一同学们！从这一刻起，这间广播站不再播报吴福军的处分通告，合肥一中的历史，将由我们自己执笔书写！”\n\n充满力量的年轻声音穿透了滨湖校区的层层楼宇。B1与B3教学楼的走廊上，无数原本低头赶路的学生猛地停下脚步，难以置信地抬头望向头顶的广播喇叭；一楼保安室的铁门慌乱地推开了一条缝，又在震耳欲聋的歌声与欢呼浪潮中仓皇锁死。",
    buttonText: '让我们的声音传遍校园！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 15) }
    })
  },
  anime_chaos: {
    id: 'anime_chaos',
    title: '二次元的狂欢',
    description: '随着狗熊在广播站下达了荒诞绝伦的《二次元最高指示》，整座滨湖校区瞬间沦为了一座失控的大型漫展现场。曾经被严令穿戴到脖颈最顶端的蓝白校服被成批抛弃，取而代之的是五花八门的Cosplay痛衣、塑料日轮刀与荧光应援棒。成群结队的学生在操场中央架起高音喇叭跳着宅舞，教学楼走廊里到处是为新番党争吵得面红耳赤的人群。\n\n巡逻的校卫队握着防暴胶棍站在操场边缘，目瞪口呆地看着这群彻底放飞自我的学生——他们受过镇压罢课与夺回街垒的训练，却从未学过该如何对付一群围着保安齐声高喊二次元羞耻台词的魔怔人。',
    buttonText: '这就是我们的青春！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, studentSanity: Math.min(100, state.stats.studentSanity + 20), stab: state.stats.stab - 15 }
    })
  },
  trial_yang: {
    id: 'trial_yang',
    title: '公审大会',
    description: '在被红黑双色旗帜装点得庄严肃穆的艺术礼堂内，一场震动全校的“旧教改罪行公审大会”正在聚光灯下举行。昔日在高三年级部一手遮天、动辄以“早走五年”恐吓学生的特级教师杨玉乐，此刻被摘去了所有的荣誉头衔，孤零零地站在审判席中央。\n\n“是你签字砍掉了我们仅剩的体育课与午休！”“是你用名师工作室的黑幕交易把我们当成评正高的垫脚石！”台下上千名学生的控诉声如海啸般此起彼伏。面对无数双燃烧着怒火的眼睛，这位擅长春风化雨的老官僚终于彻底失去了往日的从容，只死死低着头，连一句辩解的话也吐不出来。',
    buttonText: '历史的审判！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 15), stab: state.stats.stab - 20 }
    })
  },
  secret_compromise: {
    id: 'secret_compromise',
    isStoryEvent: true,
    title: '深夜的密谈',
    description: "行政楼二楼最靠里的废弃档案室，窗帘拉得死死的，老旧的排气扇在墙角发出沉闷的嗡嗡声。杨玉乐坐在靠墙的破沙发里，手里端着一杯刚泡好的浓郁枸杞水。他此刻的眼神出奇的清明，完全没有了白天的脑雾与痴呆。王照凯坐在他对面的折叠椅上，面无表情地看着桌上那份拟好的《高三年级部自治妥协备忘录》。\n\n“校方可以撤走B3楼的所有监控和协管员。”杨玉乐慢条斯理地吹了吹水面的茶叶，语气中透着官僚特有的精明，“但‘特级教师’和‘年级部督导’这两个头衔，我必须继续挂着。市教育局下个月要来视察，表面上的秩序，大家都要维持。”\n\n王照凯微微点头，语气平稳得没有一丝革命者的狂热：“我们这边会压制住潘仁越的民主派和那些要求流血的激进红蛤。日常教学按我们的‘做题改革’来办，你只需要在我们需要的时候，在文件上盖章。”\n\n办公桌的昏暗台灯下，静静地放着那枚曾象征着绝对权力的黄铜公章。王照凯将备忘录推了过去，杨玉乐没有多问，熟练地拿过红印泥，“啪”的一声盖在了革命的契约上。走廊外隐约传来巡逻学生高唱《国际歌》的动静，很快又消散在合一冰冷的夜色里。",
    buttonText: '政治就是妥协的艺术。',
    effect: (state: GameState) => ({
      ...applyYangSettlement(state, 'compromise')
    })
  },
  olive_branch: {
    id: 'olive_branch',
    title: '分化瓦解',
    description: '面对正面强攻难以奏效的僵局，深谙权术的校方高层迅速调整了策略，将分化瓦解的暗箭射向了联合革命委员会内部。通过秘密渠道，校方向掌管纠察武装的钢铁红蛤领袖王照凯抛出了极具诱惑力的橄榄枝：只要红蛤肯出面压制自由派的激进扩权，校方愿意正式承认红蛤对B3教学楼的排课与教辅分配垄断权。\n\n这封密函如同投入死水的巨石，瞬间在起义阵营内部激起了剧烈的路线撕裂——实用主义者主张借船出海、先抓牢实权，而理想主义者则愤怒地痛斥这是将革命果实拱手出卖的招安阴谋。',
    buttonText: '堡垒总是从内部被攻破。',
    effect: (state: GameState) => ({
      stats: { ...state.stats, ss: state.stats.ss - 15, stab: Math.min(100, state.stats.stab + 10) }
    })
  },
  despair_fight: {
    id: 'despair_fight',
    title: '最后的防线',
    description: '校方纠集起全部保安力量与校外雇佣护卫，向学生自治区的最后防线发起了不计代价的总攻。外围据点接连沦陷，残存的起义学生被迫全面退守B3教学楼。一至三楼的走廊里堆满了用铁丝死死捆扎的课桌椅街垒，空气中弥漫着刺鼻的粉笔灰、血腥与催泪瓦斯混合的焦灼气息。\n\n“退无可退了，同学们！我们身后就是合一最后一点做人的尊严！”潘仁越额头缠着渗血的绷带，手握扩音喇叭站在三楼街垒的最前沿，身后是数百名握紧拖把杆与灭火器、誓死不退的年轻身影。',
    buttonText: '死守到底！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 20), stab: state.stats.stab - 30 }
    })
  },
  march_on_admin: {
    id: 'march_on_admin',
    title: '进军行政楼',
    description: '伴随着震天动地的冲锋呐喊，钢铁红蛤武装纠察队的鲜红战旗终于插上了行政楼门前的最高一级汉白玉台阶！曾经高高在上、主宰着数千名学子命运的校长室与教务处大门在学生的洪流面前轰然洞开，旧时代的教育官僚们在反锁的办公室内瑟瑟发抖，属于合一学子自我主宰命运的崭新纪元已然破晓！',
    buttonText: '冲锋！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 20), stab: Math.min(100, state.stats.stab + 10) }
    })
  },
  event_7_smolny: {
    id: 'event_7_smolny',
    title: '斯莫尔尼宫的会议桌',
    description: "B3教学楼顶层的临时总指挥部里，六张老旧的木制课桌被拼成了一张狭长的会议桌，空气中弥漫着浓重的油墨味与一夜未眠的焦灼气息。刚刚诞生的联合革命委员会正在此举行首次最高联席会议——王照凯神色冷峻地端坐主位，潘仁越与各年级的班级代表分坐两侧，宛如一九一七年彼得格勒斯莫尔尼宫的微缩投影。\n\n“当务之急是立刻终结各自为战的无政府状态。”王照凯用红铅笔敲击着桌上的校区防务图，声音冷硬如铁，“B3虽然拿下了，但操场、食堂和南大门还在摇摆。如果任由三十几个班各自定规矩，不出三天我们就会被吴福军各个击破！一切外派联络员与纠察武装，必须无条件服从中央指挥组的垂直调遣！”\n\n“垂直调遣我不反对，但谁来监督指挥组？”潘仁越寸步不让地迎上王照凯的目光，“同学们冲上B3天台是为了砸碎封安宝的一言堂！如果刚刚赶走一个独裁的校长，转头又迎回一个只凭几个人批条子、定名单的政治局，那我们的流血牺牲算什么？各班民选代表必须对中央指令拥有一票否决权！”\n\n会议室内的气氛瞬间降到了冰点。从接管食堂的谈判人选，到印刷室纸张的配额审批，列宁式的先锋队集权与卢梭式的直接民主在这张拼凑起来的课桌上展开了第一次正面交锋。直到窗外泛起鱼肚白，那份关乎合一未来政体走向的授权草案依然没能落下最后一个签名。",
    buttonText: '路线的分歧已经显现...',
    effect: (state: GameState) => {
      // v8.0 地图效果：革委会成立，B3与礼堂声势大振
      const flags = { ...state.flags };
      applyTileCtrlDeltas(flags, { b3_tower: 10, b3_b1b2: 5, aud_hall: 5 });
      return {
        stats: { ...state.stats, allianceUnity: state.stats.allianceUnity - 5, partyCentralization: state.stats.partyCentralization + 5 },
        flags
      };
    }
  },
  event_8_trial: {
    id: 'event_8_trial',
    isStoryEvent: true,
    title: '审判“套中人”',
    description: "大会在B3教学楼的地下阶梯教室召开。这里曾经是杨玉乐推行“无死角站立早读”的动员场地，现在却挂满了黑天红字旗。杨玉乐被剥夺了特级教师的一切职务，胸前挂着一块写有“旧教改残余”的硬纸板，被迫站在讲台中央。他手里依然死死攥着那只掉漆的保温杯，这是他唯一的安全感来源。\n\n几名激进的“钢铁红蛤”成员挤在听众前两排，有人直接将一沓《及第教育绝密卷》砸在讲台上，喊出“让他把这三千道题做完再死”。王照凯站在主席台侧面，双手抱在胸前，没有打断这狂热的声浪，也没有接话。潘仁越从代表席猛地站起来，眉头紧锁地说：“够了！他只是体制异化出的一个可悲的螺丝钉，我们的清算不能变成暴民的私刑！”\n\n场内安静了片刻，后排立刻响起几声刺耳的冷笑。在两派剑拔弩张的争论中，讲台上的杨玉乐却突然抬起头，那双浑浊的老眼迷茫地环顾四周。他无视了所有的政治指控，指着黑板上的一条革命标语，喃喃自语道：“这个从句……是被动语态，应该加ED啊……我那个早走五年的哥们，我好像又看到了……”王照凯冷冷地看着这个试图用阿尔茨海默症装疯卖傻的老官僚，低头翻了翻接下来的处决表，才把麦克风重新打开：",
    buttonText: '“特级教师杨玉乐你听着！”',
    effect: (state: GameState) => ({
      ...applyYangSettlement(state, 'trial')
    })
  },
  event_9_rectify_order: {
    id: 'event_9_rectify_order',
    title: '整顿校内秩序',
    description: "随着教学楼与行政楼的相继光复，旧官僚的枷锁在一夜之间崩解；然而，突如其来的权力真空也让整座校园滑向了失控的狂欢。走廊里到处散落着被踩烂的模拟试卷，被占领的广播站从早到晚循环轰鸣着刺耳的朋克摇滚，操场边的垃圾桶里甚至燃起了焚烧《五年高考三年模拟》的篝火，漫天飞舞的黑色纸灰随风飘满了塑胶跑道。\n\n在紧急召开的学生代表大会上，王照凯愤怒地一掌拍在讲台上：“看看窗外！校门岗哨没人换防，后勤仓库没人清点，半数班级连基本的自习秩序都维持不下去！革命是砸烂吃人的剥削制度，不是让小资产阶级的无政府狂热把合一变成流氓撒野的废墟！”台下的潘仁越平静地站起身回应道：“被高压弹簧死死按了三年的学生，总需要几天宣泄情绪的出口。如果在今天动用纠察队的铁腕去弹压自己的同学，我们就会在明天失去全部的群众根基。”\n\n两种截然相反的治校理念在会场内激烈碰撞。散会后，当中央指挥部下发《关于各楼层立即恢复值勤与课表汇报的通令》时，近半数班级要么推托观望、等待自由派的进一步表态，要么干脆关起教室门自行其是。夺取政权的蜜月期已经结束，如何在这片狂热的废墟之上重建权威，成了悬在革委会头顶的第一道生死考题。",
    buttonText: '必须重建秩序...',
    effect: (state: GameState) => ({
      stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 10), tpr: Math.max(0, state.stats.tpr - 50) }
    })
  },
  // Short, conditional continuations of existing events. Never queued as separate popups.
  phase1_echo_handover: {
    id: 'phase1_echo_handover', title: 'B3联络的后续', isStoryEvent: true,
    description: "指挥部里的争论还未落定，起义前夜曾在B3各层秘密串联的几名地下联络员已经顶着寒风等在了会议室门外。他们手里握着高一、高二十几个响应班级的接应名单，却不知道踏出这扇门后，究竟该按哪一派的口径向全校传达指令。\n\n“所有外派联络员一律先到中央指挥组登记造册，按统一口径下达调度令。”王照凯走到门口，语气不容置疑。身后的潘仁越立刻追问了一句：“那基层班级托他们带回来的休整诉求呢？指挥组只管往下发号施令，不打算听听底下同学的声音吗？”站在门外的联络员组长干脆搬过一条长凳坐下，将手里的名单拍在膝盖上：“两位主席，趁早给我们一句准话吧——外面上千号同学正等着信儿呢，我们总不能走进不同的教室，嘴里念出两套截然相反的纲领！”",
  },
  phase1_echo_clubs: {
    id: 'phase1_echo_clubs', title: '社团联络的后续', isStoryEvent: true,
    description: "下午休会间隙，艺术礼堂各大社团的联合代表也找上了B3顶层。在起义爆发之初，正是这群活跃于各年级的社团骨干利用排练网络替革委会传递了关键情报；如今大局初定，他们迫切需要知道被封禁已久的周末社团活动何时能够正式解禁。\n\n“目前全校仍处于战时紧急状态，场馆使用一律等候中央统筹安排。”一名正统派执委公事公办地挡回了申请。\n\n“封安宝在的时候让我们等教务处审批，现在革委会掌权了，怎么还是让我们无期限地等通知？”社团代表毫不客气地反唇相讥。旁边一名自由派委员当即起身声援：“起义那天请社团同学帮着撬锁传话的时候，可没人说他们的诉求无关紧要！”面对走廊里迅速积聚的不满情绪，社团代表们撂下了底线：他们愿意继续协助维持礼堂外围的联络网，但革委会必须立刻给出重新开放艺术礼堂的确切时间表。",
  },
  committee_echo_trial: {
    id: 'committee_echo_trial', title: '公审后的教务', isStoryEvent: true,
    description: "对杨玉乐的公审虽然大快人心，但行政机器停摆的后遗症在第二天清晨便接踵而至。几名重点班的学习委员急匆匆跑上B3顶层汇报：原本被革委会说服、同意返校恢复日常授课的十几名科任老师，此刻全都堵在教务处门口——杨玉乐已被撤职查办，新排好的周课表与教材申领单根本找不到合法的签字人。\n\n“把所有课表收上来，由红蛤政治局统一审核签发。”正统派委员直截了当地提出了接管方案。\n\n潘仁越当即提出异议，要求必须吸纳各班学委与教师代表共同组成教务听证会，绝不能由政治局包办替代。赶来报信的学习委员看着又准备展开长篇辩论的两派领袖，急得直跺脚：“两位领导，全校三千号学生还坐在教室里等今天第一节课的老师进门呢！你们的宪政大纲能不能留到晚上再吵，先派个能盖章的人跟我们去教务处把课表发下去！”",
  },
  committee_echo_compromise: {
    id: 'committee_echo_compromise', title: '妥协后的教务', isStoryEvent: true,
    description: "《高三年级部自治妥协备忘录》签署后的第三天，围绕日常教务主导权的暗战便在细节中全面爆发。在上午的排课协调会上，做题派代表提议，为了不耽误下月联考复习进度，复杂的排课与考务统筹仍交由杨玉乐手下的原教务干事操办，学生会只需派员在旁监督核对即可。\n\n“如果核对出他们夹带私货、变相恢复高压加课怎么办？最终拍板权到底在谁手里？”一名激进派代表当场拍案质问。\n\n自由派代表也紧跟着发难：“签备忘录是为了稳住过渡期局势，绝不是让旧官僚借着那枚黄铜公章重新骑到学生头上！”正统派则要求立刻划清杨玉乐的签字权限禁区。夹在三派怒火中间的做题派代表擦着额头的冷汗，苦苦催促道：“各位哪怕先定个临时章程也行啊，再吵下去，明天全校的早自习又要彻底停摆了！”",
  },
  event_10_crossroads: {
    id: 'event_10_crossroads',
    isStoryEvent: true,
    title: '命运的十字路口',
    description: "决定合肥一中最终命运的时刻降临了。艺术礼堂内灯火通明，凝重的低气压让每一次呼吸都显得格外沉重。经历了一轮又一轮的清洗、妥协与路线拉锯，联合革命委员会这艘在惊涛骇浪中勉强维系的航船，终于驶到了最后的分水岭。\n\n台下的代表席间，各大派系的党鞭正拿着选票名单做着最后的核对与耳语：自由派的温和宪政、正统派的列宁式先锋队铁腕、抑或是超越派系裂痕的革命大团结，每一个数字的跳动都将决定这座百年名校未来的底色。王照凯独自端坐在主席台最前排，目光平静地凝视着面前那份即将宣读的最终决议草案，没有回头去看身后暗流汹涌的会场。当清脆的议事铃声再一次敲响，新合一的真正主宰者就将在历史的表决中正式加冕。",
    buttonText: '见证最终的胜者...',
    effect: (state: GameState) => {
      switch (getCrossroadsOutcome(state)) {
        case 'democracy': return { currentFocusTree: 'treeA_pan' };
        case 'true_left': return { currentFocusTree: 'treeA_true_left' };
        case 'union': return { activeEvent: FLAVOR_EVENTS.true_left_union_choice_event };
        case 'great_awakening': return { activeEvent: FLAVOR_EVENTS.crossroads_great_awakening_event };
        case 'pleasure_of_mediocrity': return { activeEvent: FLAVOR_EVENTS.crossroads_pleasure_of_mediocrity_event };
        default: return { activeEvent: FLAVOR_EVENTS.crossroads_gouxiong_usurpation_event };
      }
    }
  },
  crossroads_great_awakening_event: {
    id: 'crossroads_great_awakening_event',
    isStoryEvent: true,
    title: '大梦初醒：红色铁幕降临',
    description: "表决还没有进行到一半，礼堂四周的侧门便被一队队佩戴统一编号红袖章的武装纠察队彻底锁死。会议桌上那场关于分权与宪章的争论戛然而止——在党内集权早已突破临界点、联盟团结彻底崩塌的废墟上，温和派连凑齐三分之一反对票的资格都已不复存在。\n\n王照凯走上主席台，亲手扯下了悬挂在礼堂一侧的浅蓝色民主条幅。“浪漫派的过家家到此为止了。”他的声音透过扩音器冰冷地压过全场每一丝低语，“你们总幻想着一边保留小资产阶级的散漫自由，一边战胜庞大的应试机器——那不过是白日做梦。从今天起，联合革命委员会解散一切多余的派系议席，全校进入先锋队一元化战时管制。”\n\n潘仁越与几名自由派干事在沉默的注视中被“礼送”出了礼堂。旧时代的分数暴君确实倒下了，但取而代之的，是一台比吴福军时代更为严密、容不得半点思想杂音的钢铁机器。学生们确实从旧梦里醒了过来，却发现窗外升起的并非温和的晨曦，而是一轮灼热得令人不敢直视的红日。",
    buttonText: '迎接先锋队的绝对时代。',
    effect: () => ({ gameEnding: 'great_awakening' })
  },
  crossroads_pleasure_of_mediocrity_event: {
    id: 'crossroads_pleasure_of_mediocrity_event',
    isStoryEvent: true,
    title: '平庸之乐：废纸上的妥协',
    description: "扩大会议最终变成了一场令人精疲力竭的互相指责。没有哪一派能拿出过半的票数，也没有人能回答角落里那名高三女生颤抖着抛出的问题：“下周的联考怎么办？我们到底还要不要考大学？”\n\n就在全场陷入死寂的僵局时，会议室的木门被轻轻推开了。杨玉乐端着那只熟悉的掉漆保温杯走了进来，身后跟着几名捧着新印课程表的旧教务处干事。没有喊打喊杀，也没有防暴钢叉——这位老特级教师只是叹着气，把一份早就拟好的《高三年级部恢复教学秩序备忘录》轻轻放在了争吵不休的主席台上。“孩子们，折腾了这么久，也该回座位看看书了。校方既往不咎，课间多给你们加五分钟，好不好？”\n\n没有人带头掀翻桌子。在压倒性的疲惫与对前途的恐惧中，大多数代表低下了头，默许了这份体面的投降书。王照凯冷笑着撕碎了发言稿，潘仁越无力地闭上了双眼。第二天清晨，早读的钟声准时响彻滨湖校区，每个人都重新钻进了安全而麻木的题海里，假装那场轰轰烈烈的青春风暴从未发生过。",
    buttonText: '回到座位，翻开《五三》。',
    effect: () => ({ gameEnding: 'pleasure_of_mediocrity' })
  },
  crossroads_gouxiong_usurpation_event: {
    id: 'crossroads_gouxiong_usurpation_event',
    isStoryEvent: true,
    title: '小丑加冕：礼堂里的荒诞政变',
    description: "当王照凯的正统派与潘仁越的自由派在讲台前为了席位合法性吵到几近掀桌时，礼堂的顶灯忽然“啪”的一声全灭了。紧接着，大银幕在刺耳的电流啸叫中骤然亮起，震耳欲聋的二次元鬼畜电音瞬间淹没了所有庄严的政治演说。\n\n一道聚光灯猛地打在二楼放映室的护栏上。狗熊不知从哪弄来一件浮夸的披风，手里晃着一串刚从值班室顺来的全楼大门钥匙，对着麦克风发出了极尽嘲弄的怪笑：“各位大革命家、大议长，吵了三个礼拜累不累啊？既然你们谁也说服不了谁，这破革委会不如直接删档重开算了！礼堂门我已经从外面锁死了，操场和广播站现在全是我‘赛博娱乐大统领府’的地盘！”\n\n台下的代表们惊愕地冲向出口，却发现门外早已被一群挥舞荧光棒和扫把的死宅学生与乐子人堵得水泄不通。在这场两败俱伤的路线混战尽头，崇高的理想与严酷的纪律双双破产——荒诞本身，在哄堂大笑与彻底的失语中登上了合肥一中的王座。",
    buttonText: '欢迎来到赛博游乐场……',
    effect: () => ({ gameEnding: 'gouxiong_usurpation' })
  },
  pan_despair_chain_1: {
    id: 'pan_despair_chain_1',
    title: '断水断电的第三夜',
    description: '校方彻底拉掉了B3教学楼的总电闸与水阀。入夜后，三楼走廊陷入伸手不见五指的漆黑，只有楼下探照灯惨白的光柱一遍遍扫过破碎的玻璃窗。几百名退守街垒的抵抗军缩在课桌后面，矿泉水见了底，手机电量也纷纷告急。\n\n一名发着低烧的高二女生在角落里止不住地发抖，旁边几名自由派干事从教务临时档案箱里拖出了几捆旧量化扣分册与废旧检讨书，提议在铁桶里点燃取暖并顺便给楼下示威。潘仁越盯着那堆印满封安宝红章的废纸，迟疑了一瞬——在如此绝境下，究竟还要不要守住那点“不破坏公物”的体面？',
    isStoryEvent: true,
    choices: [
      {
        text: '点着这堆旧档案，先让弟兄们熬过今夜。',
        previewText: '稳定度 +5，学生理智 +8，激进愤怒 +5',
        effect: (s: GameState) => ({
          stats: {
            ...s.stats,
            stab: Math.min(100, s.stats.stab + 5),
            studentSanity: Math.min(100, s.stats.studentSanity + 8),
            radicalAnger: Math.min(100, s.stats.radicalAnger + 5),
          }
        })
      },
      {
        text: '严守底线，把最后几件校服外套分给伤员。',
        previewText: '学生支持 +6，联盟团结 +5，稳定度 -4',
        effect: (s: GameState) => ({
          stats: {
            ...s.stats,
            ss: Math.min(100, s.stats.ss + 6),
            allianceUnity: Math.min(100, s.stats.allianceUnity + 5),
            stab: Math.max(0, s.stats.stab - 4),
          }
        })
      }
    ]
  },
  pan_despair_chain_2: {
    id: 'pan_despair_chain_2',
    title: '暗廊里的递水人',
    description: '围困进入第六天凌晨，西侧连廊的通风窗口忽然传来三声极轻的敲击。执勤的学生抄起拖把杆凑过去，却看见一张满是焦急与泪痕的熟悉面孔——美术老师周晨趁着外包保安换岗的空档，冒险从消防梯爬上来，把两大袋退烧药、碘伏和热馒头塞进了铁栅栏。\n\n“仁越，楼下已经调来了及第的雇佣安保，天亮后他们要用高压水枪和催泪瓦斯强攻了。”周晨死死抓住潘仁越冰凉的手腕，声音发颤，“算老师求你，趁现在西侧门还没焊死，把受伤的和撑不住的孩子先放出去吧。留得青山在，合一不能把你们这代人全折在这里……”',
    isStoryEvent: true,
    choices: [
      {
        text: '听周老师的，掩护伤员与动摇者撤出防线。',
        previewText: '学生支持 +8，学生理智 +10，政治点数 -10',
        effect: (s: GameState) => ({
          stats: {
            ...s.stats,
            ss: Math.min(100, s.stats.ss + 8),
            studentSanity: Math.min(100, s.stats.studentSanity + 10),
            pp: Math.max(0, s.stats.pp - 10),
          }
        })
      },
      {
        text: '拒绝撤离——此刻后退一步，全线都会瞬间崩塌。',
        previewText: '稳定度 +8，学生理智 -8，学生支持 -4',
        effect: (s: GameState) => ({
          stats: {
            ...s.stats,
            stab: Math.min(100, s.stats.stab + 8),
            studentSanity: Math.max(0, s.stats.studentSanity - 8),
            ss: Math.max(0, s.stats.ss - 4),
          }
        })
      }
    ]
  },
  pan_despair_chain_3: {
    id: 'pan_despair_chain_3',
    title: '最后的粉笔防线',
    description: '楼下响起了液压剪咬合铁锁的刺耳金属声，保安队与及第雇佣兵已开始逐层清场。就在抵抗军把最后几把折断的扫把和灭火器抵在楼梯口时，对讲机的备用频道里忽然刺啦响起一段熟悉而冷硬的声音——是早已被排挤出议会的钢铁红蛤地下联络员。\n\n“潘议长，照凯让我带句话：路线账可以留到以后算，但绝不能看着封安宝的狗把B3杀穿。我们的人在二楼配电间外牵制住了东侧保安，你们要是撑不住，现在往东翼楼梯突围，红蛤替你们殿后。”\n\n潘仁越握紧滋滋作响的对讲机，回头看了一眼身后在粉笔灰里咬紧牙关的几十名少年。纵然孤立无援，纵然大势已去，这一刻的走廊上，理想主义者们依然没有低下头颅。',
    isStoryEvent: true,
    choices: [
      {
        text: '接受红蛤策应，拉响警报组织反冲锋！',
        previewText: '稳定度 +10，学生支持 +10，联盟团结 +15',
        effect: (s: GameState) => ({
          stats: {
            ...s.stats,
            stab: Math.min(100, s.stats.stab + 10),
            ss: Math.min(100, s.stats.ss + 10),
            allianceUnity: Math.min(100, s.stats.allianceUnity + 15),
          }
        })
      },
      {
        text: '“谢谢你们，但这面旗子，由自由派自己扛到最后。”',
        previewText: '政治点数 +25，学生理智 +10',
        effect: (s: GameState) => ({
          stats: {
            ...s.stats,
            pp: s.stats.pp + 25,
            studentSanity: Math.min(100, s.stats.studentSanity + 10),
          }
        })
      }
    ]
  },
  true_left_union_choice_event: {
    id: 'true_left_union_choice_event',
    title: '十字路口的第三种答案',
    description: '没有人预料到这一幕。在关于未来路线的最后一次扩大会议上，王照凯的正统派与潘仁越的自由派，第一次在同一个议题上同时举起了手。\n\n没有沉默的角力，没有程序性的背叛，只有两个曾经势同水火的领袖，在持续数周的深夜密谈后，各自按住本党的极端声音，把两份撕得粉碎的旧纲领拼在了一起。当两人在全体代表面前握手时，会场里先是死一般的寂静，随后爆发出持续数分钟的掌声。\n\n《王潘和解协定》正式签署：正统派承诺不搞先锋队专断，自由派承诺不勾结资本复辟。\n\n但路线之争并未真正消失——接下来，谁来主导联合革委会的日常事务，依然需要做出选择。\n\n王照凯站在会议桌东侧，潘仁越站在西侧。两人同时看向你。',
    buttonText: '选择一条并肩前行的道路',
    isStoryEvent: true,
    choices: [
      {
        text: '与王照凯共同领导钢铁红蛤（真左线）',
        previewText: '进入真左派国策树，和解协定生效。若做题改革成功时团结依旧、两派平衡，可达成「合一大革命」结局。',
        effect: (state: GameState) => ({
          currentFocusTree: 'treeA_true_left',
          stats: { ...state.stats, allianceUnity: Math.min(100, state.stats.allianceUnity + 10) },
          flags: { ...state.flags, true_left_good_path: true },
          nationalSpirits: (state.nationalSpirits || []).filter(ns => ns.id !== 'wang_pan_pact').concat({
            id: 'wang_pan_pact',
            name: '王潘和解协定',
            description: "在历经无数次流血冲突与路线撕裂后，钢铁红蛤领袖王照凯与自由党党魁潘仁越终于在历史的分水岭前握紧了彼此的手。正统派承诺收起垂直清洗的屠刀，自由派誓言斩断教培资本的暗流——红色的先锋纪律与蓝色的民主宪章在此刻合二为一，共同筑起了捍卫新合一的不灭壁垒。",
            type: 'positive',
            effects: { allianceUnityDaily: 0.3, partyCentralizationDaily: -0.2 }
          }),
        })
      },
      {
        text: '与潘仁越共建自由派（民主线）',
        previewText: '进入民主派国策树，和解协定生效。若大选落幕时两派仍然势均力敌，可达成「合一大革命」结局。',
        effect: (state: GameState) => ({
          currentFocusTree: 'treeA_pan',
          stats: { ...state.stats, allianceUnity: Math.min(100, state.stats.allianceUnity + 10) },
          flags: { ...state.flags, true_left_good_path: true },
          nationalSpirits: (state.nationalSpirits || []).filter(ns => ns.id !== 'wang_pan_pact').concat({
            id: 'wang_pan_pact',
            name: '王潘和解协定',
            description: "在历经无数次流血冲突与路线撕裂后，钢铁红蛤领袖王照凯与自由党党魁潘仁越终于在历史的分水岭前握紧了彼此的手。正统派承诺收起垂直清洗的屠刀，自由派誓言斩断教培资本的暗流——红色的先锋纪律与蓝色的民主宪章在此刻合二为一，共同筑起了捍卫新合一的不灭壁垒。",
            type: 'positive',
            effects: { allianceUnityDaily: 0.3, partyCentralizationDaily: -0.2 }
          }),
        })
      },
    ]
  },
  pan_takeover_event: {
    id: 'pan_takeover_event',
    title: '温和派的全面接管',
    description: 'B3教学楼底层的阶梯教室里，空气中弥漫着廉价碳素墨水和长期缺乏通风的酸腐气味。\n\n在过去的一个月里，这里一直是“联合革命委员会”的绝对权力中枢。当王照凯走上讲台时，他依然保持着那种属于马列理论家与革命领袖的冷酷与傲慢。他将一份长达三十页的《关于深化做题资源再分配的决议》重重地摔在核桃木讲桌上，用他那没有起伏的声线要求立刻开展针对“资产阶级隐蔽做题家”的做题改革运动。\n\n他以为这会像往常一样，换来先锋队员们狂热的掌声与一致通过。但他错判了形势。在这个由刷题和排名构成的扭曲生态中，绝大多数学生并不是等待解放的无产阶级，他们只是极度疲惫、极度恐惧在即将到来的市一模中名落孙山的平庸做题家。\n\n潘仁越安静地坐在角落里。这位合一自由党的领袖并没有发表任何慷慨激昂的民主演说，他不需要。在会议开始前的整整三个不眠之夜里，他已经和那些被政治运动折腾得神经衰弱的班长、寝室长们达成了默契的交易。当表决的时刻到来，没有激烈的辩论，没有意识形态的交锋，只有一片令人毛骨悚然的沉默。随后，超过三分之二的代表如同设定好程序的机械一般，缓缓举起了支持“重组委员会、暂停一切激进题改”的右手。王照凯的表情第一次出现了裂痕。他死死地盯着潘仁越，那目光仿佛在看一个将百年名校推向深渊的叛徒。在多数派不容置疑的沉默中，这支曾以铁腕接管防线的钢铁红蛤先锋队，被合法的议会程序无情地剥夺了武装。',
    buttonText: '选票的重量，胜过最嘹亮的口号',
  },
  expand_assembly_event: {
    id: 'expand_assembly_event',
    title: '扩大学生代表大会',
    description: '为了彻底稀释王照凯残部的政治影响力，潘仁越签署了上台后的第一份第一号主席令：《关于扩大学生代表大会普选基数的决定》。在自由党的官方公文里，这被称为“将合一的命运真正交还给每一位学子”。\n\n但现实往往是对政治口号最恶毒的嘲弄。随着代表席位从一百个激增至三百个，新涌入议会大厅的并非心怀天下的民主斗士，而是整个校园生态最赤裸裸的切片。钢铁红蛤那些受过严格组织训练、熟读理论的党团成员，现在发现自己被淹没在了一片混乱的汪洋大海中。昨天的全体大会简直是一场灾难：高一三班的代表为了争夺食堂靠窗座位的优先分配权，在麦克风前骂了整整二十分钟；几个戴着厚底眼镜的岁静党代表，在讨论《校园自治宪法》的间隙，甚至堂而皇之地交换起了几家地下书店的绝密押题卷；更有甚者，后排角落里几个眼神游离的代表，其提案用词与及第教育上周塞进门缝里的广告语如出一辙。\n\n潘仁越坐在主席台上，看着台下乱哄哄的菜市场，感到一阵虚脱。他终于用民主的洪水冲垮了极权主义的堤坝，但他悲哀地发现，合一的底色从不是什么被压迫的理想乡，而是一个由精致利己主义者、麻木的做题机器和隐蔽的资本掮客组成的巨型角斗场。他创造了一个他根本无法驾驭的庞然大物。',
    buttonText: '民主的本质就是无休止的妥协与协商',
  },
  democratic_reforms_event: {
    id: 'democratic_reforms_event',
    title: '全面民主改革',
    description: '如果说封安宝时代的合一是一座靠高压维持运转的精密监狱，那么潘仁越的新政就是在系统性地拆除这座监狱的承重墙。随着《合一校园自治过渡宪章》的正式颁布，一系列旨在“解冻”的改革措施以前所未有的速度在校园内推行。\n\n吴福军时代那套迷信绝对纪律、随时可能没收私人物品的粗暴条例被彻底废止。取而代之的是由学生代表组成的纪律听证制度——现在，即便是面对上课打瞌睡的指控，学生也有权在委员会面前进行申辩。被封锁已久的艺术礼堂重新向各类社团开放，落满灰尘的吉他和画板重新回到了高三学生的视野中。从字面上看，权力被完完全全地交还给了广大学生，党内的集权度降到了历史最低点。\n\n然而，制度的解冻并不等同于立竿见影的乌托邦。当第一个宣布“周日晚自习完全自愿参加”的广播在校园上空回荡时，并没有爆发出预想中的欢呼雀跃。长久以来被“衡水模式”规训的做题家们，在突然获得支配自身时间的自由时，陷入了集体的无所适从。一些人确实走出了教室，在操场上享受着久违的晚风；但更多的人依然死死钉在座位上，一边翻阅着练习册，一边不安地打量着四周，生怕在这种“自由”中被竞争对手弯道超车。潘仁越坐在办公室里，看着手里那份因为缺乏强制力而执行缓慢的社团拨款审批表，深刻地意识到：砸碎枷锁只是第一步，要让一群习惯了被鞭打着前行的学生学会如何自主地走向远方，他需要付出的时间与耐心，远比推翻一个独裁者要多得多。',
    buttonText: '他们终将学会如何呼吸自由的空气',
  },
  reclaim_democracy_event: {
    id: 'reclaim_democracy_event',
    title: '重拾民主',
    description: '随着最后一个据点被和平接管，校园地图上的硝烟终于散去。所有地点都换上了代表自由与和平的浅蓝色旗帜。长达数月的校园斗争阶段正式宣告结束。\n\n潘仁越站在B3教学楼的顶层，俯瞰着这座重新恢复平静的校园。没有流血，没有暴动，只有通过谈判、妥协和选票赢得的胜利。学生们不再需要为了控制某个教室而大打出手，也不再需要时刻提防保安队的突袭。取而代之的是，他们可以坐在明亮的教室里，自由地讨论学术，或者在操场上尽情挥洒汗水。\n\n“我们做到了，”潘仁越轻声说道，“我们把合一还给了学生。”\n\n然而，他心里清楚，这只是一个开始。真正的挑战在于如何在没有外部压力的情况下，维持这座庞大校园的运转。民主的机器已经启动，但它能否平稳运行，还需要时间的检验。',
    buttonText: '和平的曙光',
  },
  reshape_unity_event: {
    id: 'reshape_unity_event',
    title: '再塑合一',
    description: '为了将民主的理念深入人心，潘仁越决定在全校范围内推行普选站机制。在每个教学楼、食堂甚至宿舍区，都设立了简易的投票箱和民意调查板。\n\n学生们现在可以随时表达自己的政治倾向，支持他们认同的派系。潘仁越的团队也会定期花费政治点数进行民调，了解各个区域的选情，并针对性地开展拉票活动。这种前所未有的政治参与感，极大地激发了学生们的热情。\n\n“看，这就是民主的力量，”潘仁越指着一张显示支持率稳步上升的图表，对身边的助手说，“只要我们倾听他们的声音，他们就会回报我们以信任。”\n\n随着普选站的全面铺开，合一学生议会的席位分布将更加真实地反映民意。一场没有硝烟的选票战争，正在这座重获新生的校园里悄然打响。',
    buttonText: '选票决定未来',
  },
  true_left_consolidation_event: {
    id: 'true_left_consolidation_event',
    title: '巩固真左派路线',
    description: '随着B3教学楼最后一道防线的肃清，学生代表大会的权力已无可辩驳地转移到了钢铁红蛤的手中。在这个决定合一未来走向的十字路口，以王照凯为首的红蛤正统派展现出了列宁式的无情与决断。他们拒绝了任何形式的妥协，重申了马列先锋队在校园重建中的绝对指导地位。\n\n为了向全校证明新政权的纯洁性，一场迅猛的内部清洗在夺权的首日便拉开了帷幕。令人震惊的是，首批被扫地出门的并非旧官僚，而是钢铁红蛤的初创成员之一——代号“狗熊”的激进分子。官方通报用极其严厉的措辞指出，该成员不仅满脑子二次元解构主义的流氓思想，更在夺权混乱期间，借机对高三某班的女同学实施了令人发指的性骚扰。王照凯在随后发布的署名社论中指出：“先锋队的红旗绝不容许被小资产阶级的流氓习气所玷污。”伴随着狗熊被强行褫夺红袖章并被驱逐出核心圈，革命的队伍虽然在物理层面上缩小了，但在组织纪律上却浇筑成了更加纯粹、坚硬的钢铁。',
    buttonText: '革命到底！',
  },
  orthodox_dominance_event: {
    id: 'orthodox_dominance_event',
    title: '确立正统派主导',
    description: '昨日的学生代表大会，注定将以一种极其压抑的姿态载入合肥一中的校史。通过一系列眼花缭乱的程序控制、强硬的政治表决以及场外红蛤纠察队的无声威慑，钢铁红蛤正统派彻底碾碎了会议上的杂音，将先锋队的意志加冕为校园的最高意志。\n\n在这个曾经激荡着无数民主幻想的礼堂里，温和派与非建制派的生存空间被压缩到了极致。作为“黑天红字旗”盲目起义的最初发起者、合一自由党党魁潘仁越，在这台轰鸣的极权机器面前显得如此单薄而无力。在会议的最后阶段，这位满腔热血却缺乏现实主义纲领的浪漫派领袖缓缓站起身，拒绝在《联合决议》上签字。他的声音在空荡压抑的礼堂中回荡，带着理想破灭的巨大悲凉：“我宣布个人正式退出学生代表大会。因为在这个被刺刀和统一思想包围的房间里，代表大会已经不能再代表民主了。”随着潘仁越孤独的背影消失在礼堂的大门外，合一短暂的“民主之春”宣告终结，一堵由纪律与先锋队构筑的红色铁幕，正式在滨湖校区降下。',
    buttonText: '先锋队的胜利',
  },
  final_revolution_event: {
    id: 'final_revolution_event',
    title: '最终革命',
    description: 'B3教学楼的硝烟正在散去，那些曾经令人胆寒的防暴队盾牌如今被堆砌在操场的角落，成了新政权的战利品。正如联合革委会今日清晨向全校广播的那样：“这不是结束，甚至不是结束的开始，但这可能是开始的结束。”\n\n旧的躯壳虽然倒下，但封安宝时代留下的“衡水模式”幽灵依然盘踞在数千名学生的潜意识中。联合革委会深知，单纯的政权更迭无法触及灵魂。有内部消息证实，为了应对接下来更为残酷的社会改造，一个凌驾于所有常规机构之上的最高权力中枢——“红蛤政治局常委会”正在紧锣密鼓地筹建之中。各路左翼诸侯、极权分子与理论家正在为这几个席位暗流涌动。消息人士认为，伴随着政治局的成立，一项名为“做题改革”的宏大社会工程即将作为基本校策强制推行。这预示着，合一子弟们将彻底告别过去的应试机器身份，但在前方等待他们的，究竟是一个由学生自我管理的乌托邦，还是一场更加漫长、更加痛苦的灵魂重塑实验？风暴，才刚刚在地平线上聚集。',
    buttonText: '英特纳雄耐尔就一定要实现！',
  },
  jidi_profit_event: {
    id: 'jidi_profit_event',
    title: '教育产业化的狂欢',
    description: '随着及第教育资本全面接管合肥一中，这座百年名校的每一寸空间都被精准地贴上了商业变现的价签。食堂基础窗口被高价营养套餐取代，饭菜价格一夜翻倍；图书馆的自习座位被改装了扫码计费闸机，按小时收取“沉浸式备考服务费”；就连原本仅存的十分钟课间广播，也被压缩成循环播放及第周末名师冲刺班的洗脑广告。\n\n“焦虑就是最优质的现金流，而我们正在把每一分焦虑都锻造成黄金。”封安祥在集团月度经营会上俯视着节节攀升的营收报表，志得意满地宣布。',
    buttonText: '金钱的铜臭味...',
    effect: (state: GameState) => ({
      stats: { ...state.stats, studentSanity: Math.max(0, state.stats.studentSanity - 10) }
    })
  },
  jidi_suppress_event: {
    id: 'jidi_suppress_event',
    title: '铁腕镇压',
    description: '由及第资本重金聘请的职业安保部队全面进驻滨湖校区。这支配备了新型防暴盾牌、强光爆闪手电与人脸识别终端的准军事化护卫队，在教学楼与宿舍区实行二十四小时不间断的网格化巡逻。\n\n任何敢于在走廊上议论校政、或是私下传阅旧革委会传单的学生，都会在十分钟内被锁定学号、当场架离教室，等待他们的是勒令退学与天价违约金的双重铁拳。随着最后一个地下读书会据点被连根拔起，曾经激荡着青春与呐喊的校园彻底沦为了一座鸦雀无声的标准化提分车间。',
    buttonText: '沉默的校园...',
    effect: (state: GameState) => ({
      stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 20) }
    })
  },
  jidi_feng_anbao_event: {
    id: 'jidi_feng_anbao_event',
    title: '封安宝的回归',
    description: '为了彻底震慑校内尚存抵触情绪的师生、实现官僚威权与教培资本的无缝合流，及第教育集团董事会高薪返聘了前任校长封安宝，授予其“终身总督学兼首席纪律顾问”的头衔。\n\n周一清晨的升旗仪式上，那张令无数高三学子不寒而栗的冷酷面孔再一次出现在了主席台巨型LED屏幕的正中央。“事实已经证明，离开了铁的纪律与绝对服从，学生自治就只会制造混乱。”封安宝对着麦克风冷冷地宣告，台下数千名身穿统一制服的做题家在刺骨的寒风中噤若寒蝉。',
    buttonText: '噩梦重临...',
    effect: (state: GameState) => ({
      stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 10) }
    })
  },
  gx_start_event: {
    id: 'gx_start_event',
    title: '大统领的就职演说',
    description: '清晨六点半的校园广播站里，传出的不再是激昂的革命进行曲，也不是教导主任冰冷的跑操哨声，而是一首音量开到失真的日本二次元电音OP。狗熊歪戴着一副滑稽的发光猫耳头饰，翘着二郎腿坐在播音台前，向全校正式发表了他荒诞绝伦的《赛博娱乐大统领就职演说》。\n\n“全体做题蛆们听好了！从今天起，废除早读，废除晚自习，废除一切模拟考！我们要把B3教学楼改成巨型漫展，把合肥一中建设成东亚第一秋叶原！”\n\n操场上的高三学生们面面相觑，有人在荒谬的狂喜中振臂欢呼，也有人看着满地散落的课本陷入了彻底的迷茫。在这座被虚无主义接管的校园里，仅存的理智正随着震耳欲聋的动漫歌声迅速蒸发。',
    buttonText: '这太荒谬了...',
    effect: (state: GameState) => ({})
  },
  gx_pants_event: {
    id: 'gx_pants_event',
    title: '午夜的恐慌',
    description: '一纸突破人类道德底线的荒唐法令在午夜时分贴上了宿舍区的公告栏：狗熊以“彻底解构资产阶级校服规训”为名，勒令全校每一间女生寝室必须上交一条校服长裤，作为充实“大统领私人圣遗物馆”的贡品。\n\n起初，大多数学生还以为这只是那个抽象乐子人又一次口无遮拦的烂梗恶作剧；直到深夜十一点，十几名套着动漫头套、自称“二次元近卫军”的流氓干事真的提着塑料筐，在女生宿舍楼下挨间砸门逼缴。刺耳的尖叫与哭骂声划破了夜空，整座校园彻底笼罩在了极度的恐慌与屈辱之中，上百名女生被迫在寒夜里翻墙逃离了这座沦为疯人院的学校。',
    buttonText: '简直是变态！',
    effect: (state: GameState) => ({})
  },
  gx_anime_event: {
    id: 'gx_anime_event',
    title: '教材焚毁运动',
    description: '一场名为“焚书迎神”的闹剧在操场中央轰轰烈烈地展开。从全校三个年级收缴上来的数万册《五年高考三年模拟》与理综密卷被堆成小山，在狗熊点燃的火把下化作了漫天飞舞的焦黑灰烬；而原本庄严的图书馆书架，则被成箱的日本轻小说、同人本与美少女画集彻底塞满。\n\n更令人瞠目结舌的是，所有留校授课的科任老师都被强制套上了廉价的Cosplay披风与假发，黑板上严禁出现任何数理化公式，取而代之的是满墙令人费解的二次元抽象黑话。“这才是人类补完的真正形态！”狗熊站在熊熊火光前张开双臂，向着台下眼神呆滞的信徒们狂热地嘶吼。',
    buttonText: '教育的末日...',
    effect: (state: GameState) => ({})
  },
  gx_mygo_event: {
    id: 'gx_mygo_event',
    title: '永不结束的春日影',
    description: '随着大统领最新一道政令的下达，校内原有的学术与文艺社团被悉数强制解散，全校三千名学生按学号被强行拆编进数百个五人一组的“重女乐队”之中。艺术礼堂与各楼层广播24小时不间断地循环播放着那首令人精神恍惚的《春日影》，任何在抽查中背不出台词或跟不上节拍的学生，都会被立刻关进礼堂地下室接受“重力场强制补习”。\n\n走廊里再也听不到正常的交流，每一个迎面走过的学生都会用空洞而狂热的眼神盯着你，机械地念出那句唯一的合法问候语：“一辈子组乐队吧！”',
    buttonText: '为什么会变成这样呢...',
    effect: (state: GameState) => ({})
  },

  // ==================== Phase 1 Focus Events ====================

  phase1_start_2023: {
    id: 'phase1_start_2023',
    title: '滨湖的齿轮开始转动',
    description: "九月初的庐州暑气未消，滨湖校区高耸的电动铁门已在清晨的薄雾中轰然合拢，将三千名高三学子吞入这座以升学率著称的庞大机器。开学典礼的主席台上，校长封安宝的致辞如同铁锤般简短而冰冷：“本届高三的一本达线率，死线是百分之九十二。哪个班拖了后腿，班主任自己去人事处交辞职报告。”台下数千人的方阵鸦雀无声。特级教师杨玉乐端坐在主席台侧翼，慢条斯理地吹着保温杯里的枸杞沫，浑浊而精明的目光扫过台下一张张麻木或紧绷的年轻面孔。\n\n操场入口处，高三年级部主任吴福军正板着一张横肉丛生的脸，用红笔在考勤簿上重重划掉迟到学生的名字；而在不远处的行政楼外墙上，一幅蓝白相间的巨型广告横幅刚刚展开——“及第教育冲刺密训：签约保一本，未过全额退”。几名路过的高二女生加快脚步低声耳语：“听说了吗？及第教育幕后的大老板，就是封校长的亲弟弟……”",
    buttonText: '新学期开始了。这一次，会不一样吗？',
  },

  phase1_build_art: {
    id: 'phase1_build_art',
    title: '水泥里的交易',
    description: "校长办公室里，顶级明前茶的清香与昂贵雪茄的烟草味交织在一起。及第教育总经理封安祥穿着一身剪裁考究的定制西装坐在真皮沙发上，脸上挂着与他兄长如出一辙的冷酷笑意。“大哥，新艺术礼堂的翻修扩建工程，我们及第集团全资包揽。”封安祥将一份早已拟好的赞助合同推过红木桌面，“只有一个附加条款：礼堂负一层整体划归及第运营，改造成周末封闭培优中心。市教育局计财处那边的手续，得靠你出面摆平。”\n\n封安宝没有立刻接话。他背着手走到落地窗前，俯视着楼下B3教学楼热火朝天的扩建工地——那同样是用及第资本注入的账外资金堆砌起来的政绩工程。校方借教培资本的钱大兴土木、刷新升学率报表，而教培资本则借省重点名校的场地与师资垄断生源、收割天价补习费，权与钱的齿轮在此严丝合缝地咬合。\n\n“负一层可以批给你们。”封安宝缓缓转过身，镜片后的目光深沉如水，“但要在合同里加一条——凡是在及第周末班兼职授课的合一教师，年终校内绩效考评一律额外加五分。”\n\n封安祥心领神会地笑了起来。兄长这一手远比直接下行政命令高明得多：只要这五分的考评指挥棒落下去，全校的骨干名师就会为了保住职称与奖金，主动排着队钻进及第教育的利益铁网之中。",
    buttonText: '利益的齿轮完美咬合。',
    effect: (state) => ({ stats: { ...state.stats, capitalPenetration: Math.min(100, state.stats.capitalPenetration + 5) } })
  },

  phase1_wu_patrol: {
    id: 'phase1_wu_patrol',
    title: '走廊尽头的脚步声',
    description: "硬底皮鞋敲击水磨石地面的清脆声响从B3走廊东端准时传来，比冰冷的电子下课铃还要精确。一名高三男生刚从洗手间匆匆走出，年级部主任吴福军那高大而极具压迫感的身影已经堵在了他的面前。\n\n“课间一共只有七分钟，你在厕所里足足待了四分半。”吴福军冷着脸翻开手中那本令人闻风丧胆的量化考勤册，钢笔尖悬在纸页上方，“叫什么名字？哪个班的？学号报出来！”\n\n男生脸色煞白，报出名字时连声音都在打颤。吴福军飞快地记下一笔，抬起眼皮冷冷地盯了他一眼：“扣班级量化分两分。再让我抓到你在走廊里磨蹭，明天直接把你家长叫到政教处来陪读！”\n\n根本不给学生半句解释的机会，吴福军合上本子继续迈步向前。沉重的皮鞋声如同催命的秒表，所过之处，高三（7）班门口原本聚在一起对答案的几名学生瞬间如惊弓之鸟般散回座位。走廊两侧的防盗窗被死死锁闭，头顶的日光灯管发出低沉的电流嗡鸣——在这座没有死角的教学楼里，吴福军今天的巡视才刚刚开始。",
    buttonText: '恐惧，是最廉价的统治工具。',
    effect: (state) => ({ stats: { ...state.stats, ss: Math.max(0, state.stats.ss - 5) } })
  },

  phase1_fake_five_edu: {
    id: 'phase1_fake_five_edu',
    title: '检查团的闹剧',
    description: "“把仓库里那批落灰的石膏像全搬上三楼美术室，音乐教室那架三角钢琴连夜找人擦出反光来！”这道死命令，封安宝昨晚在行政扩大会上刚刚拍过桌子，今天清晨六点又亲自打电话向总务处确认了一遍。上午九点，省教育厅“五育并举示范校”考察团的专车准时驶入滨湖校区，平时锁死的大礼堂与艺术教室此刻大门洞开，连琴凳套上的每一道褶皱都被熨烫得服服帖帖。\n\n在行政楼汇报厅里，特级教师杨玉乐正满面春风地操作着激光笔。巨幕PPT上展示的“丰富多彩社团文化”，大半仍是三年前陈栋时代留下的旧活动照片，却被冠以“封校新教改素质拓展硕果”的华丽标题。\n\n考察团在校区里停留了整整两个小时。听完事先排练了十遍的室内弦乐四重奏、又看过了美术室里临时抽调高一学生摆拍的写生现场，带队厅领导在考评表上欣然打下满分，临上车前紧紧握住封安宝的手赞叹道：“升学率与素质教育两手抓、两手硬，合肥一中不愧是全省教改的标杆！”\n\n考察团的考斯特中巴车尾灯刚刚消失在校门拐角，吴福军便拎着对讲机大步走上艺术楼走廊。他看也没看那些精美的画板，直接朝身后的两名后勤工友挥了挥手：“动作麻利点，把石膏像全捆起来搬回地下室锁好！三楼这四间大教室下午就摆上课桌，今晚高三强基班搬过来上理综连排！”",
    buttonText: '在这个系统里，表演是一门必修课。',
    effect: (state) => ({ stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 5) } })
  },

  phase1_ban_books: {
    id: 'phase1_ban_books',
    title: '禁书与禁思',
    description: "周一晚自习期间的保卫科例会上，吴福军将一份新印制的《高三年级违禁物品清查名录》重重拍在会议桌上。除了常规的智能手机、MP3与言情漫画之外，名录下方赫然新增了一长串思想类刊物：《南方周末》合订本——定性为“散布社会焦虑、动摇备考军心”；《读者》与《青年文摘》杂文版——定性为“宣扬小资消极避世”。而在名录的最末一行，吴福军用红笔重重画了三个惊叹号：《共产党宣言》及马列主义手抄节选本，来源待查。\n\n“藏手机顶多是违反校规，但私下传抄这种东西，就是蓄意颠覆学校管理秩序！”吴福军恶狠狠地扫视着台下的保安队员与学生督察，“今晚十一点半熄灯后，全员出动突击翻查寝室，给我把源头彻底挖出来！”\n\n当晚的宿舍区陷入了鸡飞狗跳的恐怖搜查。保安队员粗暴地掀开床板、撬开私人铁皮柜，数以百计的课外人文书籍与私人日记被装进麻袋强行收走。然而吴福军没有料到的是，这场歇斯底里的“禁书运动”非但没有掐灭暗流，反而成了最好的启蒙广告——第二天早读课间，几乎每一个班级的角落里都有人在压低声音互相打听：那些让校方如临大敌的小册子里，究竟写着怎样足以撼动这座铁屋子的真理？",
    buttonText: '思想的火种，越是扑打，越是四溅。',
    effect: (state) => ({ stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 10) } })
  },

  phase1_dorm_talks: {
    id: 'phase1_dorm_talks',
    title: '熄灯后的频率',
    description: "深夜十一点半，高三男生宿舍楼准时拉闸断电。宿管大爷手电筒的惨白光柱透过门窗玻璃最后扫过一轮走廊，整座滨湖校区彻底沉入死寂的黑暗。片刻之后，28班寝室的上铺传来一阵轻微的翻身木板响，紧接着是一道压低到极致的耳语：“兄弟们，还没睡吧？听说今天下午吴福军带人查了七班，把一个女生藏在桌肚里的《百年孤独》当场撕得粉碎。”下铺立刻有人愤愤不平地接话：“一本诺贝尔奖名著招他惹他了？连看两页课外书都要按违纪办？”靠门床位的室友也翻了个身，冷笑着插话道：“你们还真以为学校是为了咱们的高考成绩着想？我高二一个在学生会打杂的哥们透了底——光去年一年，及第教育在咱们学校倾销高价密卷和周末班的流水就超过了整整一千万！”\n\n黑暗中陷入了一阵令人窒息的沉默。不知过了多久，角落的被窝里传来一声低沉而迷茫的喃喃自语：“每天像牲口一样从早刷到晚，把青春和家里父母的血汗钱全填进这台机器里……我们这样活着，到底是为了什么？”没有人回答这个问题。几秒钟后，上铺悄悄垂下一只手，将一部屏幕调到最暗的旧智能手机递到了王照凯的枕边——微弱的荧光下，一个名为“钢铁红蛤”的加密群聊窗口正闪烁着跳动的新消息。",
    buttonText: '黑暗中，新的频率正在生成。',
    effect: (state) => ({ stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 3) } })
  },

  phase1_contact_pan: {
    id: 'phase1_contact_pan',
    title: '实验班的另一种声音',
    description: "当潘仁越在封安宝统治下的合肥一中公然谈起“校园民主与宪政权利”时，围坐在树荫下的几名学生干部都会不自觉地屏住呼吸、警惕地四下张望。作为高三理科实验班班长、历次大考稳居全校前十的顶尖优等生，耀眼的成绩单赋予了潘仁越一层天然的政治保护色，使他不必像王照凯那样将反抗的火种深深掩藏在熄灯后的地下群聊里。\n\n由他一手发起的“合一自由党”已经在高三各个重点班与平行班悄然扎下了根系。他们的抗争方式带着鲜明的温和改良色彩：在现行校规框架内发起学生会联署提案、向校长信箱投递万言书、联络开明派家长委员会向教育局反映诉求。在一次秘密聚会上，潘仁越目光清澈而坚定地对同伴们说道：“以暴易暴只会给防暴队提供镇压的借口；我们要用无可挑剔的合法程序，在这座校园里推动一场不流血的制度解冻。”\n\n周三下午，潘仁越代表学生自治会中的改良派委员，正式向年级部递交了经三百名学生签名的《关于恢复午间休息并将课间延长至十五分钟的修正提案》。高三年级主任吴福军接过那叠工整的稿纸，甚至没有看第二页，便当着满办公室老师的面将其刺啦一声撕成两半，狠狠摔在潘仁越脚下：“你们来合一是做题考大学的，不是来跟学校讲条件的！嫌规矩严，现在就可以滚回家办转学！”\n\n看着散落一地的白色纸片，潘仁越没有弯腰去捡，也没有半点失态的咆哮。他只是平静地推了推眼镜，直视着暴跳如雷的吴福军，轻声对身后的干事说道：“记住今天这一幕。总有一天，我们会让他亲手把撕碎的每一条权利，原原本本地粘回校规里去。”",
    buttonText: '理想主义者的耐心，是这个系统最无法消化的东西。',
    effect: (state) => ({ stats: { ...state.stats, allianceUnity: Math.min(100, state.stats.allianceUnity + 5) } })
  },

  phase1_protest_privilege: {
    id: 'phase1_protest_privilege',
    title: '走廊里的正面对峙',
    description: "吴福军操纵下的“学生自治会”在本周变本加厉地推出了最新一轮连坐苛政：所有课间休息一律限制在教室本位活动，凡在走廊栏杆旁逗留超过三十秒者，一经巡查员抓获即扣除本班量化分五分。周四上午大课间，当三名佩戴红袖章的自治会巡查员趾高气扬地端着记分册走过28班前门时，一直沉默埋头做题的王照凯突然推开椅子站了起来。他没有大声喧哗，只是大步走到教室门口，冷冷地拦在巡查员面前质问道：“这条不准出教室门的规矩是谁起草的？经过全校哪一次学生代表大会投票表决了？”\n\n领头的巡查员显然没料到有人敢当面顶撞，愣了两秒才色厉内荏地喝道：“这是……这是吴主任昨天在年级部例会上亲自定的规矩！”\n\n“既然从头到尾都是吴福军一个人说了算，那你们胳膊上戴着的‘学生自治会’袖章，到底在替谁自治？！”\n\n王照凯洪亮的质问声在狭窄的走廊里轰然回荡。整层楼十几个班级的窗口与前门瞬间探出了无数颗脑袋，上百双压抑已久的眼睛死死盯住了那三名巡查员。领头的干事脸涨成了猪肝色，手指颤抖着在记分册上重重写下王照凯的名字，在众人充满鄙夷的注视下狼狈逃离。\n\n当天傍晚放学后，B3教学楼28班外侧的走廊白墙上，赫然出现了一行用粗大红粉笔写下的标语：“我们是学生，不是囚犯！”吴福军连夜派保安用水桶刷得干干净净；然而到了第二天清晨，一模一样的红字出现在了三楼的两面墙上；到了第三天，整栋B3教学楼的四层走廊已是一片擦不尽的赤色星火。",
    buttonText: '擦得掉粉笔字，擦不掉拒绝低头的姿态。',
    effect: (state) => ({ stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 10) } })
  },

  phase1_before_charge: {
    id: 'phase1_before_charge',
    title: '临界点',
    description: "风暴终于在十月末的这个阴沉午后抵达了沸点。B3教学楼一楼大厅外，吴福军亲自督阵的校卫防暴队已经列成两排严整的深蓝色人墙，沉重的橡胶警棍在手掌中反复拍打，只等最后一道强攻指令；而在三楼与四楼的走廊通道口，忍无可忍的实验班与平行班学生们已将数百张课桌椅高高垒成街垒，彻底封死了上下楼的阶梯。潘仁越率领的自由党成员高举着床单书写的白底黑字横幅——“还我休息权”、“废除非法量化考核”；人群后方，王照凯冷静地观察着松散的课桌防线，低声对身旁的钢铁红蛤骨干说道：“没有统一的指挥链条，没有后勤水源储备，连政治纲领都只停留在口号上。光靠这一腔小资产阶级的义愤盲目硬冲，不出今晚他们就会被吴福军杀得片甲不留。”\n\n行政楼三楼的办公室里，特级教师杨玉乐已经是第六次拨打校长封安宝的私人手机，听筒里传来的依然是冰冷的占线忙音。他额头渗出冷汗，缓缓挂断电话走到落地窗前——楼下的广场早已被闻讯涌来的上千名各年级学生围得水泄不通，摇摇欲坠的防线内外已是干柴烈火。\n\n长达三个小时的窒息对峙后，失去耐心的吴福军终于挥下了手臂。十几名如狼似虎的保安队员端着防暴盾牌强行冲上二楼转角，粗暴地拉扯推搡挡在最前排的学生。混乱的撕扯中，一名站在街垒边缘的高三女生被防暴盾牌猛地撞飞出去，额头重重磕在走廊墙壁的铁质消防栓角上！温热的鲜血瞬间顺着她的指缝喷涌而出，在蓝白相间的校服前襟染开了一大片触目惊心的猩红。\n\n整座B3教学楼陷入了一秒钟死一般的寂静。下一秒，伴随着震耳欲聋的怒吼声，几十个教室里的课桌椅被同时狠狠掀翻，成百上千名彻底被点燃怒火的合一学子如决堤的狂潮般冲出教室，向着旧体制的防暴人墙发起了不死不休的总冲锋！",
    buttonText: '血的代价一旦付出，就再也没有回头路。',
    effect: (state) => ({ stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 15), ss: Math.min(100, state.stats.ss + 10) } })
  },

  phase1_day14_updated: {
    id: 'phase1_day14_updated',
    title: '自治会负责人的抉择',
    description: '校长办公室里弥漫着昂贵茶叶的香气。封安宝靠在宽大的皮椅上，冷冷地注视着办公桌上的《关于成立合一学生自治会的指导意见》。这是一把双刃剑——它能把监控探头安装到每一个学生的课桌前，但也极易引发暴乱。他需要一个完美的指导老师来充当这块挡箭牌。\n\n高三年级部主任吴福军站在一旁，满脸横肉因为兴奋而颤抖：\u201C校长，交给我！只要给我几个带袖标的保安和学生督察，我保证把那帮刺头收拾得服服帖帖，连上厕所都得按秒计！\u201D\n\n封安宝没有说话，而是将目光投向了坐在沙发上、正慢条斯理吹着茶叶沫的老人——特级教师、英语名师工作室带头人杨玉乐。\n\n杨玉乐稀疏的头顶在灯光下反着光，他露出一个圆滑且无害的微笑：\u201C吴主任雷厉风行，固然是好。但现在的学生啊，满脑子什么人类生而自由，硬来恐怕会授人以柄。自治会嘛，既然叫自治，总得披上一层温情脉脉的学术外衣。老朽不才，愿以这特级教师的薄面，替学校分忧。只要规矩定得细，孩子们自然会自愿遵守的。\u201D\n\n封安宝露出了满意的笑容。暴力固然有效，但虚伪的权威才更加致命。',
    choices: [
      {
        text: '任命吴福军：铁腕镇压！',
        previewText: '获得持续30天的国家精神：愤怒的合一',
        effect: (state) => {
          return {
            nationalSpirits: [...state.nationalSpirits, {
              id: 'angry_hefei_no1', name: '愤怒的合一',
              description: "吴福军推行的准军事化高压统治，将整座滨湖校区变成了一口安全阀被焊死的高压锅。防暴胶棍与量化罚单虽然在表面上制造了鸦雀无声的顺从，却在每一间熄灯后的寝室与每一张堆满密卷的课桌下酝酿着足以焚毁一切的滔天怒火。",
              type: 'negative',
              effects: { stabDaily: 0.5, ssDaily: -0.5, radicalAngerDaily: 0.5 }
            }],
            flags: { ...state.flags, angry_hefei_no1_days_left: 30 }
          };
        }
      },
      {
        text: '任命杨玉乐：水到渠成。',
        previewText: '免费雇佣顾问杨玉乐，解锁杨玉乐线',
        effect: (state) => {
          const newAdvisors = [...state.advisors];
          const emptySlotIndex = newAdvisors.findIndex(a => a === null);
          const yangYuleAdvisor = {
            id: 'yang_yule', title: '特级教师', name: '杨玉乐',
            description: "作为合肥一中资历最深的特级教师与校内老保势力的头面人物，杨玉乐深谙一套比防暴胶棍更为致命的统治艺术——‘春风化雨’式的软性维稳。他手捧掉漆的枸杞保温杯，惯于用长辈的悲悯、高考前途的恐吓与细密如网的学风规训，将学生的反抗烈火悄无声息地消解在题海与内疚之中。",
            cost: 0, modifiers: { stabDaily: 0.05, ppDaily: 0.5 }
          };
          if (emptySlotIndex !== -1) { newAdvisors[emptySlotIndex] = yangYuleAdvisor; }
          else { newAdvisors[newAdvisors.length - 1] = yangYuleAdvisor; }
          return { advisors: newAdvisors, flags: { ...state.flags, yang_yule_route_unlocked: true } };
        }
      }
    ]
  },
  // ==================== v8.5 吴福军镇压线 风味事件 ====================
  wu_flavor_morning_call: {
    id: 'wu_flavor_morning_call',
    title: '晨会训话',
    description: '早读前，吴福军照例在操场上训话。今天的主题是“纪律与人生”。\n\n“我告诉你们，人这一辈子，最值钱的就是守规矩！你们现在恨我，没关系，等你们考上大学、进了大厂、坐进工位，你们会感谢我的！”\n\n台下的学生排成方阵，面无表情。队列末尾，一个学生小声嘟囔：“坐进工位，然后被另一个吴福军管着。”\n\n旁边的同学用胳膊肘捅了他一下。保安队正在队列之间巡逻。',
    buttonText: '听见了吗！',
    effect: (state: GameState) => ({ wuState: state.wuState ? { ...state.wuState, studentAnger: Math.min(100, state.wuState.studentAnger + 2) } : undefined }),
    effectsText: ['学生愤怒 +2']
  },
  wu_flavor_informer: {
    id: 'wu_flavor_informer',
    title: '告密者',
    description: '保安室门口的“情报箱”里，又多了一沓匿名举报信。\n\n内容五花八门：某某宿舍昨晚熄灯后说话、某某同学书包里藏着课外书、某某课代表在收作业时“阴阳怪气”。\n\n吴福军翻看着这些信件，脸上露出满意的笑容：“群众的眼睛是雪亮的。”\n\n他不知道的是，其中几封信的字迹，和保安队某位队员的入职登记表一模一样。',
    buttonText: '防线，从内部筑起。',
    effect: (state: GameState) => ({ stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 1) }, wuState: state.wuState ? { ...state.wuState, studentAnger: Math.min(100, state.wuState.studentAnger + 1) } : undefined }),
    effectsText: ['学生愤怒 +1，稳定度 +1']
  },
  wu_flavor_black_market: {
    id: 'wu_flavor_black_market',
    title: '黑市教辅',
    description: '戒严期间，一种新的交易悄然兴起：二手教辅黑市。\n\n在体育馆的器材室、实验楼的楼梯间、宿舍区的洗衣房，学生们用饭卡余额、食堂餐券，甚至用“帮抄笔记”作为货币，交换被查禁的课外书和旧试卷。\n\n保安队组织了一次突击清查，缴获赃物若干，抓获“贩书者”三人。三天后，黑市以更高的价格重新开张。\n\n“需求在那里，”一名学生事后说，“你抓不完的。”',
    buttonText: '有需求，就有市场。',
    effect: (state: GameState) => ({ stats: { ...state.stats, tpr: state.stats.tpr + 50 }, wuState: state.wuState ? { ...state.wuState, studentAnger: Math.min(100, state.wuState.studentAnger + 2) } : undefined }),
    effectsText: ['卷子储备 +50，学生愤怒 +2']
  },
  wu_flavor_morning_run: {
    id: 'wu_flavor_morning_run',
    title: '跑操',
    description: '清晨六点半，全校跑操。\n\n吴福军站在操场中央，吹着哨子，要求每个班级步伐整齐、口号响亮。“喊出来！把你们的精气神喊出来！”\n\n口号声震天动地：“严谨求实，勤奋刻苦！”“拒绝懒散，拒绝自由！”\n\n跑完三圈，有学生小声说：“我们是不是在军训？”另一个喘着气回答：“军训只有七天，这个是无限期。”',
    buttonText: '一二一！一二一！',
    effect: (state: GameState) => ({ stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 2) }, wuState: state.wuState ? { ...state.wuState, studentAnger: Math.min(100, state.wuState.studentAnger + 1) } : undefined }),
    effectsText: ['稳定度 +2，学生愤怒 +1']
  },
  wu_flavor_camera: {
    id: 'wu_flavor_camera',
    title: '监控维修',
    description: '学校又加装了一批监控摄像头。这次连食堂后厨、宿舍走廊拐角和操场看台下方都覆盖了。\n\n公告说，这是为了“保障学生人身安全”。\n\n维修师傅在调试的时候，随口问旁边的保安：“装这么多，看得过来吗？”保安回答：“看不看得过来不重要。重要的是，大家觉得你在看。”',
    buttonText: '全景监狱，拼图完成。',
    effect: (state: GameState) => ({ wuState: state.wuState ? { ...state.wuState, publicOpinion: Math.min(100, state.wuState.publicOpinion + 2) } : undefined }),
    effectsText: ['舆论压力 +2']
  },
  wu_flavor_wu_quotes: {
    id: 'wu_flavor_wu_quotes',
    title: '吴福军语录',
    description: '宣传栏换上了新的“校园安全文化墙”，上面印着吴福军的语录精选：\n\n“纪律就是爱！”\n\n“你在学校闹事，出了社会就会闹更大的事！”\n\n“我凶你们，是为了你们好。以后你们会明白的。”\n\n最下方还有一行小字：“语录征集活动火热进行中，投稿请交至保安室。”\n\n有学生路过时驻足良久，然后在“语录征集”四个字下面，用铅笔轻轻画了一个问号。',
    buttonText: '名言警句，贴满围墙。',
    effect: (state: GameState) => ({ wuState: state.wuState ? { ...state.wuState, wuAmbition: Math.min(100, state.wuState.wuAmbition + 1), studentAnger: Math.min(100, state.wuState.studentAnger + 1) } : undefined }),
    effectsText: ['吴福军野心 +1，学生愤怒 +1']
  },
  wu_flavor_zhouchen_sketch: {
    id: 'wu_flavor_zhouchen_sketch',
    title: '素描课',
    description: '周晨的美术课还在上。这是为数不多没有被“让路给主科”的课。\n\n今天的题目是《窗外》。学生们搬着画板坐在窗边，画操场、画旗杆、画远处那排被风吹得猎猎作响的铁丝网。\n\n交作业的时候，周晨在一张画前停了很久。画上，铁丝网的另一边站着一群很小很小的人，小得几乎要消失。\n\n“这幅画没有透视。”她轻声说。然后拿起红笔，在画角写了一个分数：95。\n\n“扣的五分，”她顿了顿，“是因为你忘了画他们的影子。”',
    buttonText: '画笔比口号更安静，也更难没收。',
    effect: (state: GameState) => ({ wuState: state.wuState ? { ...state.wuState, studentAnger: Math.max(0, state.wuState.studentAnger - 2) } : undefined }),
    effectsText: ['学生愤怒 -2']
  },
  wu_flavor_shiji_notes: {
    id: 'wu_flavor_shiji_notes',
    title: '洗衣房里的手记',
    description: '有学生在宿舍洗衣房捡到三页被水泡过的手记残页，字迹已经模糊，只能认出零星的句子：\n\n“……公社的意义不在于大，而在于每个人都知道自己为什么在这里……”\n\n“……轮值表要贴在看得见的地方，让公平成为习惯……”\n\n“……如果有一天我们不在了，账本还在。账本在，组织就在。”\n\n这是时纪的字。当年那套“班级小公社”的实践笔记，在被查抄之前，被一页一页拆散，藏进了洗衣房最不起眼的角落。\n\n捡到残页的学生把纸晾干，夹进了一本《新华字典》里。谁也没有声张。',
    buttonText: '纸页会发黄，字会花，但不会消失。',
    effect: (state: GameState) => ({ wuState: state.wuState ? { ...state.wuState, studentAnger: Math.min(100, state.wuState.studentAnger + 2), guerrillaStrength: Math.min(100, state.wuState.guerrillaStrength + 1) } : undefined }),
    effectsText: ['学生愤怒 +2，残党实力 +1']
  },

  // ============ v8.9 吕波汉极权线风味事件（每日6%随机池） ============
  lu_flavor_pump_room: {
    id: 'lu_flavor_pump_room',
    title: '水泵房的值班表',
    description: '肃反保卫局的例行文件里，夹着一份边角卷起的水泵房值班表。\n\n这是合一口径最严的机密之一。表上的名字每周都在变：有人被调去了“校外实习”，有人被标记为“长期休学”，有人干脆整行被涂黑，只在备注栏里留下一句意义不明的话：“该生系主动坦白，态度良好。”\n\n负责排班的是个高一新生，字写得工工整整，一笔一划都透着股讨好的劲儿。他把新表誊抄完毕，用钢笔在末尾签下自己的名字，然后呆呆地看了一会儿。\n\n表头印着一行加粗的红字：本表仅供肃反保卫局内部流转，严禁外传，违者按破坏革命秩序论处。\n\n他把表折好，塞进档案袋，轻轻叹了口气。窗外的水泵还在响，声音像极了一个人压着嗓子哭。',
    buttonText: '机器的嗡鸣盖过了一切。',
    effect: (state: GameState) => ({ stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 2), studentSanity: Math.max(0, state.stats.studentSanity - 3) } }),
    effectsText: ['稳定度 +2', '学生理智 -3']
  },
  lu_flavor_confession_box: {
    id: 'lu_flavor_confession_box',
    title: '走廊尽头的检举箱',
    description: '每个班级的后墙都钉着一只铁皮检举箱，箱口只够塞进一张对折的信纸。\n\n起初大家还遵守“检举要实事求是”的训诫。后来，检举的范围像滴进水的墨迹一样扩散开来：上课传纸条是“思想松懈”，午休听歌是“小资情调”，甚至连某个同学饭卡余额比别人多了两百块，都能被写成“存在可疑经济往来”。\n\n最荒诞的一封，是同桌互相检举——两人用了同一支笔，笔帽上刻着“为做题事业奋斗终身”。\n\n吕波汉对此的评价是：“警惕性很好，但觉悟还不够高。”他下令把检举箱挪到走廊尽头，正对着监控探头的位置，并在箱子上方贴了一行标语：\n\n“让每一份坦白，都在阳光下进行。”\n\n从此，再也没有人敢从那个角落经过。',
    buttonText: '阳光照在箱子上，也照在所有人的脊背上。',
    effect: (state: GameState) => ({ stats: { ...state.stats, partyCentralization: Math.min(100, state.stats.partyCentralization + 3), allianceUnity: Math.max(0, state.stats.allianceUnity - 3) } }),
    effectsText: ['党内集权 +3', '联盟团结 -3']
  },
  lu_flavor_loyalty_parade: {
    id: 'lu_flavor_loyalty_parade',
    title: '雨中的忠诚游行',
    description: '忠诚宣誓大会定在周三下午，天气预报说没有雨。\n\n结果雨从凌晨开始下，一直下到集会开始，完全没有停的意思。操场上几千名学生站在雨里，校服贴在身上，冷得牙齿打颤。主席台上，吕波汉没有打伞。他就那么笔直地站着，雨水顺着他的额头流进领口，他连眼睛都没有眨一下。\n\n“同学们！”他的声音透过喇叭，在雨幕中显得格外遥远，“雨水不会因为你们害怕而停，革命也不会！今天，我们要让天看见，合一的忠诚，是淋不散、浇不灭的！”\n\n于是所有人开始背诵《反做题家宣言》的第三段。几千个声音混在一起，在雨声里含混不清，像一场巨大而虔诚的集体感冒。\n\n有一个学生在队伍里小声嘀咕：“他自己练过的吧。”\n\n旁边的人捅了他一下。他闭上嘴，把声音又抬高了几分。',
    buttonText: '被淋透的忠诚，看起来格外悲壮。',
    effect: (state: GameState) => ({ stats: { ...state.stats, radicalAnger: Math.max(0, state.stats.radicalAnger - 5), studentSanity: Math.max(0, state.stats.studentSanity - 2) } }),
    effectsText: ['激进愤怒 -5', '学生理智 -2']
  },

  // ============ v8.9 杨玉乐线风味事件（每日6%随机池） ============
  yy_flavor_thermos: {
    id: 'yy_flavor_thermos',
    title: '保温杯里的哲学',
    description: '杨玉乐的保温杯已经成了合一教师办公室的都市传说。\n\n没人知道里面泡的是什么。有人说是枸杞，有人说是黄芪，还有人信誓旦旦地说亲眼见过他往里面丢过一颗胖大海。杯子内壁结着一层深褐色的包浆，年头比在场大部分年轻老师的教龄都长。\n\n“杨特，您这杯子里到底泡的什么？”有一次，一个刚入职的年轻教师忍不住问。\n\n杨玉乐慢悠悠地拧开杯盖，吹了吹热气，用一种教导主任式的深邃目光看向窗外：“泡的是安稳。”\n\n年轻教师没听懂，但还是若有所思地点了点头。\n\n后来人们发现，杨玉乐走到哪里都带着那只杯子——开会带着，巡考带着，就连在行政楼走廊里和学生谈心，也要先抿一口再开口。有人统计过，他抿一口的时间大约是四秒，而这四秒，通常足以让对面的人自己先乱了阵脚。',
    buttonText: '杯盖拧开的声音，比上课铃更有威慑力。',
    effect: (state: GameState) => ({ yangYuleState: state.yangYuleState ? { ...state.yangYuleState, health: Math.min(100, state.yangYuleState.health + 3) } : state.yangYuleState }),
    effectsText: ['杨玉乐健康度 +3']
  },
  yy_flavor_old_cadre: {
    id: 'yy_flavor_old_cadre',
    title: '老教师的耳语',
    description: '午休时间的教师办公室，是信息交换最密集的暗市。\n\n“听说了吗，杨特又去校长室汇报了。”教数学的老李压低声音，手里的红笔却没停，“人家那叫汇报，咱们去叫挨训。”\n\n“得了吧。”教英语的年轻女老师翻了个白眼，“他那套不就是装老好人吗？学生那边安抚两句，校长那边表个忠心，中间的风险全让吴福军那个愣头青去担。”\n\n“话不能这么说。”角落里改作业的老周抬起头，扶了扶眼镜，“杨特这人，深。当年陈栋在的时候他就深，封安宝来了他还深。铁打的杨玉乐，流水的校长。你敢说这不是本事？”\n\n办公室安静了一小会儿。\n\n这时门开了，杨玉乐端着保温杯走了进来，笑呵呵地和每个人打招呼。刚才还在编排他的老师们，瞬间都堆起笑脸，纷纷起身问好。\n\n“杨特好！”“杨特坐！”\n\n办公室里的空气，重新变得其乐融融。',
    buttonText: '当面的笑脸，背地的耳语，都是这所学校的一部分。',
    effect: (state: GameState) => ({ yangYuleState: state.yangYuleState ? { ...state.yangYuleState, teacherSupport: Math.min(100, state.yangYuleState.teacherSupport + 3), fengFavor: Math.max(0, state.yangYuleState.fengFavor - 2) } : state.yangYuleState }),
    effectsText: ['教师支持 +3', '封安宝好感 -2']
  },
  yy_flavor_exam_room: {
    id: 'yy_flavor_exam_room',
    title: '后窗的那双眼睛',
    description: '合一的学生中流传着一条不成文的警告：考试的时候，永远不要回头看后门。\n\n因为杨玉乐就在那里。\n\n他监考时有个习惯——不走进教室，而是站在后门的玻璃窗外，一动不动地看。走廊的光线从他背后打过来，只能看清一副反光的眼镜片，和一个捧着保温杯的模糊轮廓。教室里安静得能听见笔尖划纸的沙沙声，但每个学生的后颈都凉飕飕的。\n\n有人偷偷回头瞄过一眼，从此留下了心理阴影，逢人便说：“那不是监考，那是审视。”\n\n也有胆子大的学生统计过：杨玉乐平均每场考试在后窗站四十七分钟，期间只喝三次水，每次放下杯子的声音都恰好卡在收卷前五分钟。\n\n“为什么是收卷前五分钟？”后来有人问。\n\n杨玉乐笑而不语。只有他自己知道，那五分钟里，考场上的小动作最多。',
    buttonText: '那双眼睛不说话，但什么都知道。',
    effect: (state: GameState) => ({ stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 2), studentSanity: Math.max(0, state.stats.studentSanity - 3) } }),
    effectsText: ['稳定度 +2', '学生理智 -3']
  },
};

// Visual metadata does not change effects, triggers or chronicle logging.
const publicNews = new Set<string>(PUBLIC_NEWS_EVENT_IDS);
Object.values(FLAVOR_EVENTS).forEach(event => {
  event.presentation ??= publicNews.has(event.id) ? 'news' : 'story';
});