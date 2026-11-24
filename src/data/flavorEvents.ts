import { GameState, GameEvent } from '../types';
import { PUBLIC_NEWS_EVENT_IDS } from './eventKinds';
import { applyTileCtrlDeltas } from '../engine/tileHelpers';
import { applyYangSettlement, getCrossroadsOutcome, CROSSROADS_RULES } from '../engine/assemblyPolitics';

export const FLAVOR_EVENTS: Record<string, GameEvent> = {
  phase1_hengshui_schedule: {
    id: 'phase1_hengshui_schedule', title: '挤掉的午休', isStoryEvent: true,
    description: "新的作息表贴在了每间教室的门后。午休那一栏被划掉了，一整天从早读到晚自习，每个课间只剩五分钟。\n\n“这哪是课间？打个水都要跑。”\n\n走廊里有人这么嘟囔。上课铃一响，人就得坐回位子上。晚自习结束后，班干部把新安排带回寝室，熄灯前还有人在问：“明天中午真的没有休息？”\n\n没人回答。被压缩的时间不会退回来。",
    buttonText: '这张课表没有留给我们喘气的时间。',
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
    description: "扣分细则之前从没张榜公布过，是巡查的人走到教室门口才报出来的。他们手里有张表，按行项目打勾，记完就合上本子，再往下一个班走。被记的人往往当时不知道，到了晚上才从别班传过来一句“你们班被扣了”。\n\n这次是早读刚结束。两个课代表追到走廊上，把那个拿表的学生叫住。两人尽量压低声音，但旁边几个班的人都听见了。\n\n“我们班没说话，你记的哪条？”\n\n对方把表打开一点，露出最上面两行：“课间纪律。我只管照着填，你觉得有问题，去年级组问。”\n\n“你记的时候，我们班还在收作业。”另一个课代表往前走了一步，“为什么扣了都不当场说清楚？哪个班被记了，要我们自己到别班去问？”\n\n巡查的学生把表合上，侧身避开走廊上的阳光：“我夹在中间，你们嫌我乱扣分，少记一项又得问我为什么没记。你们让我怎么办？”\n\n“能给我们看吗？”\n\n“表不能给你们。”他顿了顿，“我记错了也不归我改。后面还有两个班要查，你们先让一让。”\n\n两个课代表没让，但也没再追。第二节课后，几个班的课代表在楼梯口碰了一次。被记下的“课间纪律”并没有解释：收作业算什么，接水算什么，离开座位和大声起哄为什么记在同一栏？最后有人提议，把各班的记录抄在一起，挑最集中的几项，等下次巡查的人来，当面一项项问清楚。",
    buttonText: '我们都遇到过这张扣分表。', effectsText: ['激进愤怒 +10，学生理智 -2'],
    effect: s => ({ stats: { ...s.stats, radicalAnger: Math.min(100, s.stats.radicalAnger + 10), studentSanity: Math.max(0, s.stats.studentSanity - 2) } }),
  },
  phase1_shared_leaflet: {
    id: 'phase1_shared_leaflet', title: '第二份传单', isStoryEvent: true,
    description: "王照凯是在去食堂的路上看见那张纸的。纸很小，折成方块，塞在窗台铝槽和玻璃之间，边上还露着一个角。他抽出来，展开一半。纸上抄着几段话，一看就是不同人的笔迹。最下面有人用蓝笔添了一行：“下一间教室也看看。”\n\n前面几个女生也看到了。其中一个指了指那张纸：“我们班也有人被记课间说话。原来别的班也在问这个。”\n\n“这上面抄的也不是什么坏话。”另一个女生凑过来，小声念出末尾一句，“‘学校给我们的时间被扣成一张表，休息和学习都得看巡查的脸色。’有人把联名信退回来的事也写上去了。”\n\n王照凯把那句话又读了一遍。寝室里争论过的道理，传单上没有照抄；写它的人拿全班遇到的事来解释。个人向老师抱怨，得到一句劝学；一起署名，又被当成添乱。还会有多少班收到同样的答复？\n\n下午课间，王照凯去另一栋楼找认识的同学，把传单留在了教室后门。\n\n往回走时，一个男生正好推门出来，手里捏着那张纸，抬眼看见他：“你放的？”\n\n王照凯没躲：“你们要看，看完传下去。”\n\n“联名信的事我们听说了。”那男生把纸展平，“就这一张？”\n\n“先把你们班遇到的事补上。看完别扔，我明天来找你。”",
    buttonText: '让下一间教室也读到它。', effectsText: ['激进愤怒 +12，学生支持 +3；愤怒 >80后可直接选择B3起义'],
    effect: s => ({ stats: { ...s.stats, radicalAnger: Math.min(100, s.stats.radicalAnger + 12), ss: Math.min(100, s.stats.ss + 3) } }),
  },
  committee_purge_moderates: {
    id: 'committee_purge_moderates', title: '缺席的代表', isStoryEvent: true,
    description: "清晨的联合指挥会议刚刚落锁，潘仁越派的几名干事才从走廊值班口听说自己被“遗漏”在了通知名单之外。会议桌前，王照凯把新拟的《战时统一调度令》拍在台面上，声音冷硬如铁：“防暴队随时可能反扑，革委会容不下清谈馆式的内耗。从今天起，所有防务与物资指令由核心指挥组单线签发，不允许任何派系另起炉灶。”\n\n等潘仁越闻讯推门而入时，新名单已经盖上红章发往各班。温和派的名字被彻底抹去，但真正维系各楼层联络、给普通班传话送饭的联络网却依旧攥在他们手里。走廊的公告栏上，墨迹未干的新指挥名单就贴在旧通告旁边——权力确实收拢进了少数人的拳头，可同盟内部的信任裂痕，也随之被撕开了一道再难缝合的口子。",
    buttonText: '执行新的指挥名单。', effectsText: ['国策完成时已结算：集权 +20，团结 -20', '十字路口会同时检查席位、团结与集权'],
  },
  committee_vanguard: {
    id: 'committee_vanguard', title: '谁来下达下一道命令', isStoryEvent: true,
    description: "新印制的《先锋队战时轮值总表》钉上B3楼梯口时，油墨的刺鼻气味还混着廊道里的粉笔灰。从此以后，送卷、巡夜与紧急联络不再经过各班代表层层签字——戴着红袖章的先锋队骨干站在讲台边，用不容置疑的口吻宣布：一切急务直报轮值指挥员，不必再走冗长的班级评议。\n\n后排有普通班代表起身发问，若名单之外的学生对调度有异议该如何申诉。台上的答复只有冷冰冰的四个字：“按新表走。”散会后，走廊里低声议论不断，但没人在公告栏前撕掉那张白纸。运转效率确实提上来了，只是所有人都嗅出了那股熟悉的气息——权力的指挥链条被拉得笔直，而普通学生说话的缝隙，正一寸寸收窄。",
    buttonText: '按新的轮值表执行。', effectsText: ['国策完成时已结算：集权 +10，获得先锋队精神', '真左路线仍需要保住至少55的联盟团结'],
  },
  committee_militia: {
    id: 'committee_militia', title: '岗哨后面的教室', isStoryEvent: true,
    description: "晚自习铃响前，艺术礼堂东门的铁栅栏边完成了又一轮换岗。两名臂缠红布的纠察队员拎着木棍站了一整个下午，逐个盘查进出教学区的同学，耳边不断飘来压低声音的怨言：“赶走了吴福军的保安，怎么回自己教室还要查通行证？”不远处的操场上，另一队人正把拆下来的旧铁架堆成路障，秋风卷得登记册哗哗作响。\n\n礼堂与操场的制高点确实攥在了革命委员会手里，但地图上圈出的控制区并不等同于发自内心的拥护。换下岗的纠察队员蹲在花坛边，就着路灯给隔壁几个观望班级写联络条，恳请他们明早抽调人手轮守正门——武装能挡住校方的警棍，却挡不住同窗之间悄然滋生的隔阂。",
    buttonText: '把换岗和通行安排告诉各班。', effectsText: ['礼堂与操场控制提升，获得武装纠察队精神', '地区行动与工作组可持续巩固控制、争取支持'],
  },
  committee_print_network: {
    id: 'committee_print_network', title: '油墨还没有干', isStoryEvent: true,
    description: "实验楼三楼背阴的器材间里，老式滚筒油印机正压着嗓子发出沉闷的咔嗒声。楼梯拐角码着两摞趁夜摸黑运进来的双胶纸，负责清点的学生满手黑墨，一边往牛皮纸袋里装传单一边报数：“三班的复习提纲附页还差二十份，五班今晚盯得紧，得拆成两包从后窗递进去。”\n\n第一轮制版调试总算熬过去了，但真正的硬仗还在后头。地上摊着那份画满红圈的各班接应名单，两个关键联络人昨晚刚被班主任叫去谈话，线路断了只能明天午休重新接头。在油墨浸透纸背的夜色里，传单印出来只是第一步，让它穿过封锁落到每一张课桌上，才算真正接通了革命的血管。",
    buttonText: '接上各班的联络。', effectsText: ['实验楼地块控制额外 +5，小游戏表现另行结算', '派工作组定期印制传单或联络地区，仍消耗原行动资源'],
  },
  committee_posters: {
    id: 'committee_posters', title: '墙上的下一张海报', isStoryEvent: true,
    description: "清晨的薄雾还没散尽，行政楼西侧的玻璃公告栏前已经聚了一小圈人。昨夜趁黑贴上去的红色大字报被水刷刮去了一大半，残存的纸边在冷风里无力地打着卷。人群里有人撇嘴说隔壁班压根没人抬头看，也有人低声提醒昨晚看见校方保洁带着铲刀来过。\n\n负责宣传组的女生一言不发，把装满浆糊的塑料桶往脚边一放，从鼓囊囊的书包里抽出新印好的备用海报。有同学忍不住问她是不是打算天天起五更来和保安打游击，她蹲下身把浆糊抹匀，头也不抬地回了一句：“今天少贴一张，明天这面墙上就又只剩下教务处的扣分红黑榜了。”",
    buttonText: '宣传不能只做一晚。', effectsText: ['行政楼地块控制额外 +5，小游戏表现另行结算', '地区控制与支持需要持续行动；留意工作组的资源与任务报告'],
  },
  committee_assembly_opening: {
    id: 'committee_assembly_opening', title: '同坐一间教室', isStoryEvent: true,
    description: "B3教学楼底层大厅挤满了来自各班的代表，黑板上层层叠叠写满了尚未擦净的提案。王照凯用粗粉笔在最顶端划下一道横线，力推所有行动组收归总指挥部垂直调度。他啪地丢下粉笔头，冷冷扫过前排犹豫不决的代表：“革命不能停留在广播站喊口号！敌人还在行政楼里磨刀，此刻我们需要的是一个拳头、一个声音。”\n\n潘仁越没有针锋相对地提高嗓门，只走上讲台在黑板另一侧画下三个并列的方格，工整地填上“纪律调查”“独立宣传”“恢复日常教学”。他敲了敲黑板：“如果为了打倒封安宝，革委会就要把所有不同意见的嘴统统堵上，那我们建起来的不过是换了旗号的旧监狱。”\n\n角落里，几名攥着三角板和模拟考复习表的做题派代表面面相觑——窗外阴雨连绵，广播里还在循环着激昂的进行曲，他们只想知道明天的理综卷究竟还发不发。砸烂旧世界只需一夜热血，可新秩序究竟由谁掌舵，第一场代表大会便已剑拔弩张。",
    buttonText: '先让代表们坐下来。', effectsText: ['已解锁学生代表大会：左侧入口调整派系关系', '集权决定指挥集中程度，团结决定各派能否继续合作', '十字路口确认时检查席位与这两个数值', ...CROSSROADS_RULES],
  },
  democratic_power_struggle_event: {
    id: 'democratic_power_struggle_event', title: '民主派争权', isStoryEvent: true,
    description: "散会铃刚落，潘仁越的自由派代表便在阶梯教室门口拦住了准备离开的几名指挥部委员，把一叠墨迹未干的《革委会授权边界复议案》递到了他们手里。外面的走廊墙上，民主派干事已经贴满了一整排从各班收上来的匿名意见条：“凭什么封锁通道不经大会表决？”“处分同学究竟是谁给的权力？”\n\n原本顺从统一调度的中间派代表也开始在会议桌旁骚动起来，纷纷要求今后指挥部发布的每道强制指令必须由代表大会副署生效。潘仁越没有走上主席台发表演说，只是站在人群中间，目光直视着前排的王照凯：“如果合一的命运仍由三五个人关起门来拍板，那我们费尽心血召开学生代表大会，究竟是为了当家作主，还是替新官僚鼓掌？”同盟尚未公开决裂，但主导权的争夺已经彻底摆上了台面。",
    buttonText: '把争议带回大会。', effectsText: ['集权 ≤25，或潘派 ≥40席，或团结 ≥80且集权 ≤40可化解', '到期：潘派席位随机 +1–3、集权 -5、团结随机 -3至+3'],
  },
  democratic_power_struggle_result: {
    id: 'democratic_power_struggle_result', title: '授权的让步', isStoryEvent: true,
    description: "持续整晚的拉锯表决终于落下帷幕，总指挥部未能如愿拿到绝对授权。在关键的举手环节里，几名原本骑墙观望的平行班代表倒向了潘仁越，硬生生把席位天平扳过了一截。计票黑板前，书记员擦掉旧数字，重重写下了新的各派席位比，粉笔灰簌簌落了一地。\n\n联合革委会的牌子依然挂在门头，但指挥部再想凭一纸通知调动全校已成奢望——今后每道政令落地前，都必须先过代表大会这一关。自由派欢呼这是宪政制约的第一步，而正统派先锋队员则面色阴沉地合上了笔记本：在危机四伏的校园里，多了一层制衡，也就意味着多了一分掣肘。",
    buttonText: '记录这次席位变化。',
  },
  support_bill_event: {
    id: 'support_bill_event',
    title: '表态：支持议案',
    description: '学生议会的辩论已进入白热化阶段，中间派代表仍在观望风向。你决定动用执政派的行政资源与人脉网络，在全校各班代表间展开公开游说与动员，将政治资本押注在这份议案的落槌通过上。',
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
    description: '眼前的议案一旦通过，必将把合一推向你无法接受的轨道。你决定在议会大厅亮明底牌，耗费政治资源串联各班反对席位、发起程序阻击，誓要将这份草案死死挡在表决门槛之外。',
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
    description: '几名实验班出身的自由派骨干堵在了议长办公室门口，手里拿着被红笔圈出十几处删改的《校园自治宪章》对照稿。他们曾是高举黑天红字旗冲上B3天台的急先锋，如今却对着昔日的领袖皱起了眉头。\n\n“潘主席，为了换保守派和做题派的选票，法案里关于废除早读考勤和保障社团独立经费的条款被砍得七零八落。”为首的女生把草案拍在桌上，语气急切却不容敷衍，“如果连我们自己都开始拿学生的基本权利去议会大厅里做买卖，那自由党和那些穿西装的旧官僚还有什么区别？把权利保障条款加回去，我们的票一票都不会少；否则，别怪弟兄们在表决时投弃权。”',
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
    description: '电子计票屏上的绿色数字定格在过半线的那一刻，嘈杂的阶梯教室瞬间静了一秒，随即爆发出雷鸣般的拍桌与欢呼声。历经数周的拉锯、妥协与唇枪舌剑，这份浸满各派心血的法案终于跨过了议会门槛，正式盖上学生代表大会的钢印。合一的新规不再诞生于校长室紧闭的红木门后，而是第一次在阳光与争辩中落地生根。',
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
              description: "当第一份经由公开辩论与表决诞生的法案正式生效，学生议会便不再是自娱自乐的过家家舞台。从提案起草到各派妥协，合一学子第一次用选票而非警棍改写了自身的命运——民主的火种纵然脆弱，却已在百年名校的冻土下扎下了根。",
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
    description: '计票器发出一声刺耳的短鸣，鲜红的“未通过”字样投射在大屏幕上。支持者们颓然坐回椅子，而反对派席位上则响起了一阵克制却冰冷的窃笑。几周来的奔走游说付诸东流，不仅暴露出执政联盟内部难以弥合的裂缝，更让原本摇摆的中间派开始怀疑：这座吵闹的议会，究竟还有没有能力领导合一走出泥潭？',
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
              description: "吴福军用袖章、秒表和防暴钢叉强行按住了滨湖校区的每一丝杂音。走廊里再无人敢大声交谈，可压抑在沉默之下的怒火却如地火般四处奔涌——铁腕能锁住教室的门，却锁不住即将冲破临界点的反抗。",
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
            description: "合肥一中资深英语特级教师，校内保守派官僚中最老谋深算的“笑面虎”。他深谙温水煮青蛙的软性维稳之道，从不与学生正面冲突，只凭一只保温杯、几句“为你好”的红脸戏和高考紧箍咒，便能轻易瓦解年轻人的抗争意志。只是这把纵横讲台三十年的老算盘，终究抵不过衰老与记忆的侵蚀。",
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
    description: '随着全校夺取胜利的宣告，联合革命委员会面临着一个现实问题：如何管理和分配我们手中掌握的庞大资源？\n\n在B3教学楼的地下室里，堆积如山的试卷和复习资料成为了我们最宝贵的财富。同时，学生们高涨的热情也为我们提供了源源不断的支持。\n\n“我们不能让这些试卷发霉，也不能让同学们的热情冷却。”王照凯在统筹会议上说道，“必须建立一个专门的委员会，将这些资源转化为我们推行下一步改革的政治影响力。”\n\n资源统筹委员会正式成立，标志着我们从破坏旧世界，迈向了建设新秩序的坚实一步。',
    buttonText: '物尽其用，人尽其才。'
  },
  jidi_mock_exam_approach_event: {
    id: 'jidi_mock_exam_approach_event',
    title: '二模的阴云：财报季的考验',
    description: '合肥市第二次模拟考试的倒计时牌被换成了及第资本的电子屏，上面不仅闪烁着距离考试的天数，还实时滚动着各年级的预测一本率。\n\n“各位董事，二模不仅是一次全市统考，更是我们‘提分工厂’模式向市场交出的第一份答卷。”封安祥在联合管理委员会的视频会议上推了推金丝眼镜，“如果数据不好看，我们的C轮融资就会泡汤，在座各位的期权也会变成废纸。”\n\n“可是学生们的理智值已经濒临崩溃了，”合一教师协会的代表忧心忡忡，“再加大压榨力度，我怕会出人命。”\n\n“只要没死在考场上，就给我继续做题！”新东方资本的代表冷酷地打断了他，“我们是来赚钱的，不是来做慈善的。”\n\n面对即将到来的二模，及第资本必须做出抉择：',
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
    description: '封安宝的亲笔批条一大早便摆上了办公桌。他要求你下周在操场操办一场史无前例的高考百日誓师大会：全高三三千名学生必须统一系上红头绳、按血手印宣誓，哪怕下着冷雨也要齐声嘶吼出“宁可少活二十年，拼命也要拿高分”的口号——市教育局的摄制组已经约好机位，就等着拍下这幕彰显合一“狼性”与你维稳政绩的宏大奇观。',
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
    description: '保卫科的推车停在了办公室门外，上面堆着十几捆从老阅览室地下库房清出来的过刊——泛黄的《南方周末》、陈栋时代印制的学生诗社合集，还有几本被翻烂的《开放社会及其敌人》。封安宝在封条上批了八个字：“陈年毒草，一律肃清。”现在，只等你这位代理副校长落下黄铜公章，这些旧时代的余温就会在锅炉房里化作一缕青烟。',
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
    description: '教务处送来一份加急用印单：拟以高出市面书店三成的定价，向全高三强制征订《及第教育·新高考终极押题密卷》。其实谁都知道那套卷子不过是拼凑旧题印出来的废纸，但财务处坚持必须有分管副校长签字背书才能走账——而一只没有署名的厚牛皮纸信封，正恰到好处地压在申请表的最底下，露出半截暗红色的银行卡边角。',
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
    description: '一封用大红宣纸打印、贴在行政楼意见箱上的“联名感谢信”被干事颤巍巍地递了上来。通篇辞藻华丽得近乎浮夸，盛赞你把“ED与ING的宇宙真理讲得出神入化，连呼吸五十升空气都透着被动语态的哲学光辉”，末尾更是诚挚恳请杨副校长每天加讲两节大课以“普度众生”。字字捧杀、句句带刺，用脚指头想也知道是28班那帮刺头学生的杰作。',
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
    description: '临近年底教研创新考核，名师工作室里几个急于表功的年轻教师连夜炮制出一份《精细化激发高三早读潜能实施方案》。方案的核心极其简单粗暴：全年级早读四十分钟必须全体起立、双手捧书过胸，严禁倚靠课桌或墙壁，并由督察员持分贝仪逐班打分。他们在附言里信心满满地写道，这套“无死角站立早读”绝对能成为市级示范亮点。',
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
    description: 'B3教学楼虽然被攻下，但联盟内部却因为极低的稳定度和团结度而分崩离析。学生们陷入了混乱，各自为战。就在这时，以杨玉乐为首的保守派教师们趁虚而入。他们利用学生对无政府状态的恐惧，迅速组织起了“临时管理委员会”，并以“恢复秩序”为名，重新接管了校园的控制权。联合革命委员会的成员们被迫转入地下，或者躲进了名师工作室避风头。',
    buttonText: '革命尚未成功...'
  },
  enter_treeC: {
    id: 'enter_treeC',
    title: '二次元的狂欢',
    description: 'B3教学楼被攻下，但学生们的理智已经跌入谷底，而及第教育的资本渗透却达到了顶峰。在绝望与荒诞中，狗熊站了出来。他利用了学生们逃避现实的心理，将一场严肃的抗争变成了一场二次元的狂欢。联合革命委员会被彻底解构，取而代之的是一个充满低幼性压抑风格的“赛博娱乐国度”。',
    buttonText: '这...这是什么鬼？'
  },
  enter_treeD: {
    id: 'enter_treeD',
    title: '绝望的走廊巷战',
    description: '黑天红字旗虽然还插在B3教学楼顶，但仓库里的试卷储备早已见底。在高考倒计时的阴影下，失去了“做题力”背书的新政权迅速失去了普通学生的拥护。嗅到血腥味的校方防暴队与及第资本雇佣的外包保安从四个方向合围上来，切断了教学楼的水电。潘仁越带着最后几百名不愿低头的自由派学生退守三楼走廊，在课桌垒成的残破街垒后，迎来了注定弹尽粮绝的绝望巷战。',
    buttonText: '战斗到最后一刻！'
  },
  enter_treeA: {
    id: 'enter_treeA',
    title: '联合革命委员会的胜利',
    description: '防暴队的铁甲在课桌街垒前退却，黑天红字旗在B3教学楼顶迎风猎猎展开。在王照凯的铁腕调度与潘仁越的组织串联下，起义没有滑向失控的打砸狂欢，而是迅速收束成了一座由学生自主运转的红色中枢——“合肥一中联合革命委员会”正式宣告成立。旧校规已被踩在脚下，但如何驾驭这座刚刚挣脱锁链的超级中学，真正的考验此刻才刚刚开始。',
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
    description: "行政楼第三层，教务处的几台电脑在同一时间黑屏。所有电子表格一片空白：年级排名、班级评比、量化考核分数全部消失了。有人把服务器上的数据删得干干净净，又在屏幕上留了一行字：去你的内卷。\n\n教务处的老师坐不住，找计算机老师来查。两名老师在办公室门口低声问：“这事要不要报告？”\n\n楼下通道里，几个学生经过时没有停步，有人笑出了声。",
    buttonText: '数据霸权的终结！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, stab: state.stats.stab - 10, pp: state.stats.pp + 20 }
    })
  },
  broadcast_seized: {
    id: 'broadcast_seized',
    title: '校园广播站的新声音',
    description: "下午第二节课刚下，走廊里准时响起的《运动员进行曲》被一段嘈杂的电流声打断。几秒后，铜管乐被《国际歌》盖了过去。\n\n“同学们，合肥一中的历史，将由我们自己来书写！”\n\n声音从行政楼广播站传出来，不是教导主任的腔调。底楼楼道里，几个学生抱着课本停下来，有人往楼上的方向探头。保安室的门开了一条缝，又迅速关上。",
    buttonText: '让我们的声音传遍校园！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 15) }
    })
  },
  anime_chaos: {
    id: 'anime_chaos',
    title: '二次元的狂欢',
    description: '随着“二次元最高指示”的下达，校园里出现了一群穿着Cosplay服装的学生。他们在操场上跳着宅舞，在走廊里大声讨论着新番。\n\n保安队看着这群“奇装异服”的学生，一时竟不知该如何应对。整个校园陷入了一种荒诞而欢乐的氛围中。',
    buttonText: '这就是我们的青春！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, studentSanity: Math.min(100, state.stats.studentSanity + 20), stab: state.stats.stab - 15 }
    })
  },
  trial_yang: {
    id: 'trial_yang',
    title: '公审大会',
    description: '在被占领的艺术礼堂里，一场史无前例的“公审大会”正在进行。曾经不可一世的杨玉乐老师被请到了台上，面对着台下群情激愤的学生。\n\n“你剥夺了我们的休息时间！你用分数衡量我们的人格！”学生们的控诉声此起彼伏。杨玉乐低着头，一言不发，曾经的威严荡然无存。',
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
    description: '行政楼里的旧官僚们敏锐地嗅到了联合革委会内部的路线裂痕。一纸绕开学生代表大会、直接递给王照凯的密信送进了B3顶层：只要钢铁红蛤肯协助恢复日常教学秩序并边缘化自由派，校方愿意默许他们在高三年级部推行部分“自主管理”。这根裹着糖衣的橄榄枝瞬间在同盟里炸出了深沟——有人动摇着想借壳上位，更多人则怒斥这是可耻的招安背叛。',
    buttonText: '堡垒总是从内部被攻破。',
    effect: (state: GameState) => ({
      stats: { ...state.stats, ss: state.stats.ss - 15, stab: Math.min(100, state.stats.stab + 10) }
    })
  },
  despair_fight: {
    id: 'despair_fight',
    title: '最后的防线',
    description: '液压剪咬断铁链的刺耳脆响响彻楼梯间，全副武装的保安队与及第雇佣兵正逐层碾碎外围防线。残存的抵抗军被迫全线退守B3教学楼三层，把每一张课桌、讲台和书柜都推倒堆成最后的街垒。空气里呛满了干粉灭火器的白雾、粉笔灰与血腥气，潘仁越抹去额角渗下的汗水，声音沙哑却寸步不让：“身后就是最后一道防线——退一步，这辈子都别想再把腰杆直起来！”',
    buttonText: '死守到底！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 20), stab: state.stats.stab - 30 }
    })
  },
  march_on_admin: {
    id: 'march_on_admin',
    title: '进军行政楼',
    description: '武装纠察队的列队穿过漫天飞舞的废旧检讨书，将黑天红字旗狠狠插进了行政楼门前的汉白玉台阶缝隙里。昔日高不可攀的校长室与教务处门窗紧闭，百叶窗后隐约晃动着旧官僚们惊慌失措的身影。防线正在倒塌，旧时代的铁幕已然出现裂口——向前冲锋，彻底接管这所学校的心脏！',
    buttonText: '冲锋！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 20), stab: Math.min(100, state.stats.stab + 10) }
    })
  },
  event_7_smolny: {
    id: 'event_7_smolny',
    title: '斯莫尔尼宫的会议桌',
    description: "B3教学楼顶层的阶梯教室充当了合一的“斯莫尔尼宫”。十几张沾满修正液痕迹的课桌拼成临时长桌，刚成立的联合革命委员会在这里召开了第一次全体扩大会议。王照凯坐在长桌尽头，手臂上的红袖章格外醒目；潘仁越则与各实验班代表分坐两侧，空气里飘着尚未散尽的硝烟与紧张。\n\n“现在最致命的敌人不是楼下的保安，而是各自为战的一盘散沙。”王照凯用指节叩响桌面，语气斩钉截铁，“B3虽然拿下了，可操场、食堂和校门还悬在半空。必须立刻建立垂直统一的战时指挥组，所有外联与防务调度一律先报中央审批。”\n\n潘仁越立刻接话，寸步不让：“统一调度我赞成，但别忘了我们冲上天台是为了砸碎封安宝的独裁。如果旧校长刚倒，新委员会就变成一个人钦点名单、一个人批条子，那我们流血究竟换来了什么？各班代表必须拥有对指挥组的否决权！”会议很快在操场与食堂的联络人选上彻底僵住——推翻共同的敌人只需一夜，可权力究竟该归于先锋队还是归于议会，裂痕已在第一张会议桌上悄然裂开。",
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
    description: "夺下教学楼与行政楼的狂欢还没持续三天，失序的暗流便开始吞噬这座失去旧管理者的校园。走廊上铺满了被撕成雪片的模拟卷，广播站从早到晚震耳欲聋地放着重金属摇滚，操场角落甚至有人点燃了成捆的《五三》，焦黑的纸灰随风飘满塑胶跑道。\n\n学生代表大会上，王照凯一巴掌拍得讲桌震天响：“革命不是流氓无产者的狂欢！大门没人守、广播没人管、连明天上不上自习都没人定规矩，等家长和教育局杀进门来，拿什么替我们说话？”潘仁越没有和他在嗓门上较劲，只是平静地提醒：三年的高压刚松开弹簧，此刻若立刻照搬旧校方的铁腕压制，革委会只会最先失去普通学生的心。\n\n散会后，各楼层报上来的值守名单残缺不全——有的班级躺平观望，有的干脆自行拉起了山头。砸碎旧笼子很容易，可要防止合一滑向无政府泥潭，革委会必须立刻拿出重建秩序的铁章程。",
    buttonText: '必须重建秩序...',
    effect: (state: GameState) => ({
      stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 10), tpr: Math.max(0, state.stats.tpr - 50) }
    })
  },
  // Short, conditional continuations of existing events. Never queued as separate popups.
  phase1_echo_handover: {
    id: 'phase1_echo_handover', title: 'B3联络的后续', isStoryEvent: true,
    description: "操场方向的外联人选还在桌上扯皮，起义前冒着开除风险在B3各层秘密串联的几名联络员已经等在了门外。他们手里攥着全校最真实的各班态度底数，眼下最犯难的不是保安巡逻，而是出去以后究竟该传哪一家的口信。\n\n“全部先报到总指挥组，口径与行动一律统一签发。”王照凯头也不抬地定调。潘仁越紧跟着追问：“那各班托他们冒险带回来的诉求和意见，交到谁手里裁决？”几名联络员索性拉过长凳坐了下来：“两位主席，趁现在先把规矩说死——我们可不想顶着风险跑出去，结果东边喊集权、西边喊普选，让全校看革委会的笑话。”",
  },
  phase1_echo_clubs: {
    id: 'phase1_echo_clubs', title: '社团联络的后续', isStoryEvent: true,
    description: "起义前替革委会通风报信、掩护印刷机的几名艺术礼堂社团骨干，午休时找上了B3顶层的临时办公点。他们手里拿着一沓早就批不下来的社团展演与排练申请，想问问赶走封安宝之后，这周末的礼堂场地究竟该找谁签字协调。\n\n“眼下处于非常时期，一律等全校统筹安排。”一名正统派代表随口挡了回去。“好家伙，以前看教务处脸色等通知，现在换到革委会门口继续等？”社团社长冷笑一声反问。旁边几名自由派代表立刻站出来打圆场，提醒同僚莫要过河拆桥。社团的同学们最终没翻脸，只把申请表压在桌角：帮忙联络可以，但新政权总得给个准话，礼堂究竟还属不属于学生。",
  },
  committee_echo_trial: {
    id: 'committee_echo_trial', title: '公审后的教务', isStoryEvent: true,
    description: "公审罢免杨玉乐的余波尚未平息，一名高三班委便焦急地推开了会议室的门：几名原本愿意配合复课的任课老师正拿着课表在教研室干等，旧的年级部公章已经被没收，现在连换一节晚自习都不知道该找哪位委员签字背书。\n\n“让各班把需求汇总上来，由总指挥部统一核定排课。”正统派代表立刻接过话头。潘仁越皱眉反问，若不让一线教师参与评议、不留班级申诉渠道，这和昔日的教务处专断有何区别？站在门口的班委实在听不下去这场没完没了的制度辩经，干脆敲了敲门框：“两位领导，宪法可以下周再吵，可明天早上八点的物理课到底上不上？先拍个板把摊子接住吧！”",
  },
  committee_echo_compromise: {
    id: 'committee_echo_compromise', title: '妥协后的教务', isStoryEvent: true,
    description: "深夜妥协备忘录签署后的第二天一早，一名做题派代表便在例会上提议：既然革委会一时搭不起排课班子，不如先让熟悉流程的旧教务处人员起草周考与课程表，再由各班代表逐条复核。\n\n话音刚落，前排便响起一片质疑：“复核不通过怎么办？最后还不是杨玉乐拿那枚黄铜公章一锤定音？”自由派代表也警告，绝不能让备忘录沦为旧官僚卷土重来的护身符；正统派则坚持必须先划清哪些核心教务绝不交回旧人手里。做题派代表无奈地指了指墙上的高考倒计时牌：“权力边界慢慢吵，可明天第一节课的铃声，总不会等你们辩出胜负再响吧？”",
  },
  event_10_crossroads: {
    id: 'event_10_crossroads',
    isStoryEvent: true,
    title: '命运的十字路口',
    description: "艺术礼堂沉重的木门缓缓合拢，决定合肥一中未来归属的终极扩大会议正式拉开帷幕。吊灯惨白的光芒倾泻在密密麻麻的席位上，每一排代表都在压低声音反复核对选票底数——联盟的团结还剩几分、先锋队的集权拧到了何种刻度，每一个数字都像悬在半空的铡刀，随时准备落向对手的咽喉。\n\n台下暗流汹涌，前排却死一般寂静。王照凯端坐在席位正中，面前摊着被红笔划得密密麻麻的发言顺序表，全程没有回头去看身后那些交头接耳的身影；不远处的西侧席位上，潘仁越紧紧攥着《自由宪章》草案，指节微微发白；而在礼堂最昏暗的角落里，几名臂章歪斜的投机者正悄悄把手按在电闸箱旁。所有的妥协与试探都已走到尽头——今天走出这扇门时，合一只能剩下一个答案。",
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
            description: "王照凯与潘仁越达成政治和解，结束路线对抗。协议约定：正统派放弃先锋队专断，自由派不与资本势力勾结。双方仍将争夺革委会主导权，但暂以学生组织共存为先。",
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
            description: "王照凯与潘仁越达成政治和解，结束路线对抗。协议约定：正统派放弃先锋队专断，自由派不与资本势力勾结。双方仍将争夺革委会主导权，但暂以学生组织共存为先。",
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
    description: '及第资本全面接管滨湖校区不过半月，校园里的每一寸空气便都被精确标好了价码。食堂窗口取消了平价补贴菜，图书馆的空调自习座按小时刷卡计费，连原本用来喘气的课间十分钟都被走廊里的液晶屏霸占，循环滚动着天价冲刺班的倒计时广告。\n\n总裁办的落地窗前，封安祥晃着手里的浓缩咖啡，对着董事会大屏上的营收曲线微微颔首：“昔日的校长只知道用分数要政绩，却看不见焦虑本身才是回报率最高的金矿。”',
    buttonText: '金钱的铜臭味...',
    effect: (state: GameState) => ({
      stats: { ...state.stats, studentSanity: Math.max(0, state.stats.studentSanity - 10) }
    })
  },
  jidi_suppress_event: {
    id: 'jidi_suppress_event',
    title: '铁腕镇压',
    description: '由及第资本重金外包的专业安保团队正式接管了校园防务。这些穿着笔挺黑西装、腰挂伸缩警棍与微表情记录仪的成年人实行二十四小时网格轮巡，任何敢在走廊串联或张贴传单的学生，在保安动手之前便会先收到法务部寄给家长的违约索赔函与退学告知书。联合革委会残部被连根拔起，整座滨湖校区在精准而体面的暴力威慑下，陷入了停尸房般的死寂。',
    buttonText: '沉默的校园...',
    effect: (state: GameState) => ({
      stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 20) }
    })
  },
  jidi_feng_anbao_event: {
    id: 'jidi_feng_anbao_event',
    title: '封安宝的回归',
    description: '为了压榨出这台提分工厂最后一点产能，及第董事会以天价顾问费返聘了昔日的铁腕校长封安宝。当那张曾令全校噤若寒蝉的冷酷面孔再次出现在主席台的大屏幕上时，底下的高三学生们只觉得一股寒气顺着脊椎直冲脑门。\n\n封安宝调整了一下话筒，语气里没有丝毫久别重逢的温情：“资本负责算账，我负责立规矩。我早就说过，唯有把每一分钟都拧干榨尽，才能配得上合一的牌子。”',
    buttonText: '噩梦重临...',
    effect: (state: GameState) => ({
      stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 10) }
    })
  },
  gx_start_event: {
    id: 'gx_start_event',
    title: '大统领的就职演说',
    description: '校园广播里往日循环的《运动员进行曲》与革命口号在一阵刺耳的电流声中戛然而止，取而代之的是震耳欲聋的新番动画OP。艺术礼堂的穹顶之下，狗熊套着浮夸的动漫痛衣与滑稽猫耳头饰跳上讲台，向全校宣告“赛博娱乐大统领府”正式成立。\n\n“从今天起，早读废除、晚自习删档！我们要亲手把这座做题监狱改造成永不打烊的秋叶原！”礼堂里爆发出混杂着癫狂与宣泄的欢呼，而在人群边缘，无数攥着模拟卷的高三生却在闪烁的霓虹灯下陷入了前所未有的茫然——理智的防线，正在笑声中寸寸蒸发。',
    buttonText: '这太荒谬了...',
    effect: (state: GameState) => ({})
  },
  gx_pants_event: {
    id: 'gx_pants_event',
    title: '午夜的恐慌',
    description: '一纸用二次元烂梗拼凑出来的荒唐通告贴上了宿舍区的公告栏：以“解构资产阶级校服规训”为名，强令各班女生上交一条裤子充作大统领的私人“收藏品”。最初所有人都把这当成又一场无底线的低俗玩笑，直到夜幕降临，几名戴着歪斜红袖章、满脸猥琐笑意的“二次元近卫军”真的踹响了女寝楼道的铁门。\n\n恐惧与屈辱瞬间笼罩了整片宿舍区。狂欢的糖衣剥落之后，露出的是权力失控下最丑陋的变态嘴脸，不少女生连夜收拾书包翻出围墙逃离了这座彻底发疯的校园。',
    buttonText: '简直是变态！',
    effect: (state: GameState) => ({})
  },
  gx_anime_event: {
    id: 'gx_anime_event',
    title: '教材焚毁运动',
    description: '成千上万本《五年高考三年模拟》与《衡水金卷》被堆成小山，在操场正中央熊熊燃烧，漫天飞舞的焦黑纸屑像一场荒诞的黑雪。教务处的书库被清空，换上了整箱整箱的轻小说、漫画与动漫设定集；昔日严厉的任课老师被强行套上劣质的Cosplay服饰站在讲台前，对着满黑板不知所云的二次元黑话手足无措。\n\n狗熊架着二郎腿坐在主席台的真皮转椅上，满意地挥了挥手：“砸烂旧教辅，拥抱新纪元——这他妈才叫真正的素质教育！”',
    buttonText: '教育的末日...',
    effect: (state: GameState) => ({})
  },
  gx_mygo_event: {
    id: 'gx_mygo_event',
    title: '永不结束的春日影',
    description: '大统领府颁布了最新的精神改造指令：全校原有社团一律就地解散，所有班级强制拆分为五人制“少女乐队”，艺术礼堂的音响二十四小时高分贝单曲循环着《春日影》。无论你是只懂导数压轴题的理科生还是五音不全的体育特长生，凡是抽查背不出台词、弹不对和弦者，一律押送后台接受高强度洗脑“补习”。\n\n走廊里再也听不见“早安”或“考得怎么样”，每个眼神空洞的学生擦肩而过时，都机械地复读着那句唯一的暗号：“一辈子组乐队吧！”',
    buttonText: '为什么会变成这样呢...',
    effect: (state: GameState) => ({})
  },

  // ==================== Phase 1 Focus Events ====================

  phase1_start_2023: {
    id: 'phase1_start_2023',
    title: '滨湖的齿轮开始转动',
    description: "九月的合肥，梧桐叶还没转黄，滨湖校区的大门已经吞进三千张年轻的面孔。开学典礼上，封安宝的致辞简短而冰冷：“本届高三的一本率，必须突破百分之九十二。做不到，相关负责人自己写辞职报告。”台下没有声音。杨玉乐坐在主席台侧边，端着保温杯，眼睛扫过一张张或麻木或不安的学生脸。\n\n操场入口，吴福军拿着考勤本清点各班迟到人数。行政楼侧墙，及第教育的广告横幅新挂上去——“签约保一本，不过全额退”。几个高二女生路过，小声说：“听说封校长的弟弟就是及第的老板……”",
    buttonText: '新学期开始了。这一次，会不一样吗？',
  },

  phase1_build_art: {
    id: 'phase1_build_art',
    title: '水泥里的交易',
    description: "封安宝办公室里，茶香和烟味混在一起。封安祥坐在对面，西装革履，笑容和他哥哥一样冷。“大哥，艺术礼堂的翻修工程，我们及第全资赞助。”封安祥说，“条件是：礼堂地下层改造成及第的周末补习中心。教育局那边，你帮我们摆平。”\n\n封安宝没有立刻回答。他走到窗边，楼下B3教学楼扩建工地正在施工——那也是及第出的钱。他用及第的钱修楼、买设备、发奖金，及第用他的校舍开补习班、卖教辅。这是一笔完美的交易。\n\n“地下层可以给你们。”封安宝转过身，“但是，所有在及第兼职的教师，校内考评一律加五分。”\n\n封安祥笑了。他知道，这不是给教师争取利益，而是用考评这根绳子把更多教师捆进及第的利益链条里。",
    buttonText: '利益的齿轮完美咬合。',
    effect: (state) => ({ stats: { ...state.stats, capitalPenetration: Math.min(100, state.stats.capitalPenetration + 5) } })
  },

  phase1_wu_patrol: {
    id: 'phase1_wu_patrol',
    title: '走廊尽头的脚步声',
    description: "鞋跟敲击水磨石地面的声音从走廊东头传来，比下课铃更准时。一个男生刚从厕所出来，吴福军已经走到他跟前。\n\n“课间只有七分钟，你上厕所用了四分钟。”吴福军翻开考勤本，笔尖悬在纸页上方，“叫什么名字？哪个班的？”\n\n男生报出名字时声音发飘。吴福军写完后抬头看他，又说：“下次再被我抓到，叫家长。”\n\n他没有等对方回答，转身继续往前走。硬底皮鞋每步都像在数秒，从高三（七）班门口经过时，他的目光扫过靠墙那排课桌。两个学生原本在低声说话，看见他立刻分开。\n\n吴福军拐进楼梯口，把考勤本合上。走廊两侧的窗户都关着，日光灯管有几根在闪。他还有六次巡视。",
    buttonText: '恐惧，是最廉价的统治工具。',
    effect: (state) => ({ stats: { ...state.stats, ss: Math.max(0, state.stats.ss - 5) } })
  },

  phase1_fake_five_edu: {
    id: 'phase1_fake_five_edu',
    title: '检查团的闹剧',
    description: "“美术教室的石膏像全部搬到走廊，音乐教室的钢琴擦干净。”这句话他昨晚在行政会上说过一次，今天早上又对总务处重复了一遍。检查团来看过了，钢琴盖还开着，椅套上留着刚才学生坐过的褶皱。\n\n杨玉乐坐在电脑前整理材料。三年前社团活动的旧照片仍占了汇报PPT的大半。\n\n检查团在合一待了两个小时。参观完美术教室，又看了一场提前排练的社团表演，检查团给合一打了满分。临走时，带队领导握住封安宝的手说：“合一的素质教育走在了全市前列。”\n\n车队刚出校门，吴福军就带着两个后勤工人走到走廊。他指了指石膏像：“先搬这两座，仓库左排空出来了。”\n\n走廊里的宣传板还都是新换的，但检查团不会再回头看了。",
    buttonText: '在这个系统里，表演是一门必修课。',
    effect: (state) => ({ stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 5) } })
  },

  phase1_ban_books: {
    id: 'phase1_ban_books',
    title: '禁书与禁思',
    description: "保安队例会上，吴福军把新印的违禁品清单拍在桌上：手机、MP3、漫画书下面，添了《南方周末》——“散布焦虑”；《读者》上几篇杂文——“消极避世”。最末一行用红笔圈着：《共产党宣言》手抄本，来源不明。\n\n“这不是普通违纪，是思想犯罪。”他说，“查源头。”\n\n当晚突击检查寝室。保安队翻床板、开衣柜，课本码在走廊上。没收的刊物被收走。第二天，班上有人小声问：《南方周末》上到底写了什么？问的人越来越多。",
    buttonText: '思想的火种，越是扑打，越是四溅。',
    effect: (state) => ({ stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 10) } })
  },

  phase1_dorm_talks: {
    id: 'phase1_dorm_talks',
    title: '熄灯后的频率',
    description: "晚上十一点半，寝室准时熄灯。宿管大爷的手电筒光束扫过最后一轮走廊，整个世界陷入黑暗。上铺传来轻微的翻身声，然后是一个压低到极限的耳语：“你们知道吗，今天吴福军又没收了一个女生的《百年孤独》。”下铺立刻回应：“那书里写什么了？至于吗？”隔床插话：“我有个高二的哥们说，他搞到了一份及第的内部财报——他们去年在合一的营业额，超过了一千万。”\n\n短暂的沉默后，不知谁在黑暗中说了一句：“我们这样活着，到底是为了什么？”没有人回答。被窝里有人递过来一部旧手机，屏幕上是一个叫钢铁红蛤的群聊。",
    buttonText: '黑暗中，新的频率正在生成。',
    effect: (state) => ({ stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 3) } })
  },

  phase1_contact_pan: {
    id: 'phase1_contact_pan',
    title: '实验班的另一种声音',
    description: "潘仁越在封安宝的合一说出“民主”时，周围几个学生不自觉地压低了呼吸。他是理科实验班班长，年级前十，这份成绩让他有底气把话讲得清楚，而不是像王照凯那样把群聊藏在手机深处。\n\n他组织的自由党在每个班都有两三个人。方式看似温和：写学生会提案，投校长信箱，找家长委员会沟通。在一次秘密聚会上，他说：“暴力只会换来更大的暴力，我们需要的是一场不流血的制度变革。”\n\n课间延长至十五分钟的提案，是潘仁越代表学生自治会递上去的。吴福军接过去，只扫了一眼，当场撕成两半：“你们是来上学的，不是来享受的。不爽就转学。”\n\n纸片落在地上，潘仁越没有去捡，也没有提高声音。他看着吴福军的脸，对身边的人说：“总有一天，他会自己把这份提案粘回去。”",
    buttonText: '理想主义者的耐心，是这个系统最无法消化的东西。',
    effect: (state) => ({ stats: { ...state.stats, allianceUnity: Math.min(100, state.stats.allianceUnity + 5) } })
  },

  phase1_protest_privilege: {
    id: 'phase1_protest_privilege',
    title: '走廊里的正面对峙',
    description: "自治会的新规贴在每层楼的公告栏上：课间活动一律在教室内进行，走廊逗留超过三十秒即扣量化分。巡查员们拿着扣分本从28班门口经过时，王照凯从座位上站起来。他没有提高嗓门，走到巡查员面前问：“这条规定是谁制定的？有没有经过学生表决？”\n\n巡查员愣了一下，说：“这是……吴主任定的。”\n\n“那这个自治会，自治了什么？”\n\n走廊里安静了几秒。各班门口陆续有人探出头来。巡查员的脸涨得通红，飞快在本子上记下王照凯的名字，转身走了。\n\n当天下午，28班外墙上出现一行粉笔字：“我们不是囚犯。”吴福军派人擦掉了。第二天，同样的字出现在另一面墙上。第三天，变成了五面墙。",
    buttonText: '擦得掉粉笔字，擦不掉拒绝低头的姿态。',
    effect: (state) => ({ stats: { ...state.stats, radicalAnger: Math.min(100, state.stats.radicalAnger + 10) } })
  },

  phase1_before_charge: {
    id: 'phase1_before_charge',
    title: '临界点',
    description: "B3教学楼前，吴福军的保安队已经集合，深蓝制服，橡胶棍，但没人下令上楼。三楼走廊里，学生们把课桌椅堆成街垒，堵住两个楼梯口。潘仁越的自由党学生举着自制标语：“还我自由”“废除量化考核”。王照凯对室友说：“没有组织，没有后勤，诉求也写不实。这样冲，吃亏的是他们自己。”\n\n杨玉乐在办公室拨第六遍电话，封安宝的号码占线。他扣回听筒，走到窗前。楼下黑压压的人头，保安队之外还围了一圈看热闹的学生。\n\n对峙持续三个小时，双方都等着对方先动。\n\n保安队开始往上走。一名保安队员推搡学生，一个女生趔趄着摔出去，额头撞在消防栓上。她靠着墙滑坐下去，血从指缝间流下来，在蓝白校服上洇开一小片。\n\n全场安静一秒。随后响起桌椅被猛地推开的声音，几十双脚同时踩在水泥地上。",
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
              description: "吴福军挥舞着纪律大棒与量化扣分表强行压制全校。走廊看似鸦雀无声，实则每一间熄灯后的寝室里都在酝酿着决堤的怒涛——高压锅焊死了气阀，换来的只会是更剧烈的爆炸。",
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
            description: "合肥一中资深英语特级教师，校内保守派官僚中最老谋深算的“笑面虎”。相比吴福军喊打喊杀的蠢办法，他更擅长用名师光环与“为你好”的温情话术分化瓦解学生运动，把一切政治抗争悄无声息地摁回高考题海。只要规矩定得够细，孩子们自然会“自愿”顺从。",
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
