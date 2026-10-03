import { GameState, GameEvent } from '../types';
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
    description: "联名信由班里传起来，一圈名字签下去。最后几行写得很挤，签名一个接一个落在纸边上。信交上去不久又回到班级。纸上没有批复，只加了一行字：先完成学业。\n\n拿到信的人把它合上。有几个人围过来，其中一个说：“这样不算答复。”\n\n“那怎么办？还找他们？还是让别的班也看看？”\n\n信还躺在桌上。",
    choices: [
      { text: '把原信传给其他班级。', previewText: '激进愤怒 +12，学生支持 +2', effect: s => ({ stats: { ...s.stats, radicalAnger: Math.min(100, s.stats.radicalAnger + 12), ss: Math.min(100, s.stats.ss + 2) } }) },
      { text: '仍然争取一次正式答复。', previewText: '联盟团结 +3，激进愤怒 +4', effect: s => ({ stats: { ...s.stats, allianceUnity: Math.min(100, s.stats.allianceUnity + 3), radicalAnger: Math.min(100, s.stats.radicalAnger + 4) } }) },
    ],
  },
  phase1_recess_dispute: {
    id: 'phase1_recess_dispute', title: '课间也要计时', isStoryEvent: true,
    description: "扣分表不是贴在公告栏里的，是巡查人员拿在手里，走到人前才亮出来的。高二三班门口那个穿蓝袖章的先对着教室后门喊了一声“都回座位”，接着又补了一句“课间不要串班交谈”。走廊上几个还在翻练习册的学生抬起头，互相看了一眼，没有人动。\n\n靠窗的男生把半截话咽下去，转身进了教室。他听见隔壁班有女生说“我们班根本没说话”，但巡查的人已经走到下一扇门前。\n\n这周被记过的三个班，都觉得自己没做错什么。有人去年级组问过，得到的答复是“课间纪律是统一要求”。问的人回来后只说了句：“他们按表扣分，扣完才告诉我们。”\n\n走廊里的抱怨从一个班传到另一个班。几个课代表商量，下次巡查再来，先把各个班被扣分的记录要来看一看。",
    buttonText: '我们都遇到过这张扣分表。', effectsText: ['激进愤怒 +10，学生理智 -2；仅在开局阶段出现一次'],
    effect: s => ({ stats: { ...s.stats, radicalAnger: Math.min(100, s.stats.radicalAnger + 10), studentSanity: Math.max(0, s.stats.studentSanity - 2) } }),
  },
  phase1_shared_leaflet: {
    id: 'phase1_shared_leaflet', title: '第二份传单', isStoryEvent: true,
    description: "书是寝室熄灯后传看的，查寝的人只拿走了书，没搜到夹在枕头底下的几页纸。上面抄着几段话，边角又添了两个人的作息表和本周被记过的规定。\n\n王照凯是在去食堂的路上看到传单的。一张从作业本撕下来的纸，折成很小的方块，塞在窗户缝里。他展开后半截，认出了其中一段抄的是同一本课外书。传单下边有人用蓝笔补了一行：“下一间教室也看看。”\n\n几个女生站在走廊另一头低声说，她们班也有人被记了课间说话，只是没往那本子上抄过什么。王照凯把手里那半张旧传单重新折好，没有问是谁贴的。",
    buttonText: '让下一间教室也读到它。', effectsText: ['激进愤怒 +12，学生支持 +3；愤怒 >80后可直接选择B3起义'],
    effect: s => ({ stats: { ...s.stats, radicalAnger: Math.min(100, s.stats.radicalAnger + 12), ss: Math.min(100, s.stats.ss + 3) } }),
  },
  committee_purge_moderates: {
    id: 'committee_purge_moderates', title: '缺席的代表', isStoryEvent: true,
    description: "指挥会议开始前，温和派的人发现自己没有接到通知。王照凯在会上说，行动必须统一调度，再各干各的只会乱套。潘仁越不同意，说路线分歧不该用排除的办法解决。\n\n通知发到各班，名字上面没有温和派的人。命令集中了，但联络名单还握在那些没到场的人手里。谁要传话，谁要替班，仍然得找他们。\n\n散会以后，有人把新指挥名单贴在旧通知旁边。名单不长，争议不会因为贴出来就结束。",
    buttonText: '执行新的指挥名单。', effectsText: ['国策完成时已结算：集权 +20，团结 -20', '十字路口会同时检查席位、团结与集权'],
  },
  committee_vanguard: {
    id: 'committee_vanguard', title: '谁来下达下一道命令', isStoryEvent: true,
    description: "宣布轮值安排时，值日表终于不再从各班的代表手里传来传去。白纸上印着统一的送卷时间和联络人，先锋队的人站在讲台边，说以后急事直接找轮值的人，不必再挨个签字。坐在后排的几个学生问，要是不在名单上的人有事怎么办？讲台上的回答是：“按新表走。”\n\n名单之外的人确实没有说话的地方。散会后有人在走廊拦住先锋队的成员，问下一道命令由谁下，对方只让他看公告栏。新印出来的安排还带着油墨味，但权力的路径已经比昨天更直了。",
    buttonText: '按新的轮值表执行。', effectsText: ['国策完成时已结算：集权 +10，获得先锋队精神', '真左路线仍需要保住至少55的联盟团结'],
  },
  committee_militia: {
    id: 'committee_militia', title: '岗哨后面的教室', isStoryEvent: true,
    description: "晚自习前，礼堂东门的岗哨换下来两个学生。他们站了一下午，核对来往的人员，也听着有人抱怨“进自己班还要被查”。操场上另一组人在搬运路障，风把登记本吹得哗哗响。\n\n有人问隔壁楼的检查什么时候减，岗哨只说还没接到通知。礼堂和操场守住了，但地图上画的阵地不等于各班都听招呼。一位纠察队员蹲在花坛边给附近班级写条子，问他们能不能明早派人来校门换岗——答复得等晚自习铃响后才带回来。",
    buttonText: '把换岗和通行安排告诉各班。', effectsText: ['礼堂与操场控制提升，获得武装纠察队精神', '地区行动与工作组可持续巩固控制、争取支持'],
  },
  committee_print_network: {
    id: 'committee_print_network', title: '油墨还没有干', isStoryEvent: true,
    description: "实验楼三楼的楼梯拐角堆着两摞纸，晚上送进来的。负责油印的学生正在数份数，旁边的人说三班还差二十张，五班需要多留一包。\n\n第一次调试已经结束，但纸是分几次运来的，下一批由谁去拿、送到哪几间教室还没定。有人把旧的联络名单摊在地上，发现两个班的接应人已经换了，只能明天中午再跑一趟。传单能印出来是一回事，让它们按时到人手里是另一回事。",
    buttonText: '接上各班的联络。', effectsText: ['实验楼地块控制额外 +5，小游戏表现另行结算', '派工作组定期印制传单或联络地区，仍消耗原行动资源'],
  },
  committee_posters: {
    id: 'committee_posters', title: '墙上的下一张海报', isStoryEvent: true,
    description: "行政楼西侧的公告栏前围了几个人，新贴上去的纸边角已经卷起来。一个学生说昨晚看见有人拿水刷往下揭，另一个说隔壁班的人看都没看。\n\n负责宣传的女生把浆糊桶放在脚边，从书包里抽出备用的几张。她没争辩，只说明天早点来，把被撕掉的位置重新贴上。有人问她是不是每晚都要来，她蹲下去涂浆糊，说不然明天墙上就什么都没有了。",
    buttonText: '宣传不能只做一晚。', effectsText: ['行政楼地块控制额外 +5，小游戏表现另行结算', '地区控制与支持需要持续行动；留意工作组的资源与任务报告'],
  },
  committee_assembly_opening: {
    id: 'committee_assembly_opening', title: '同坐一间教室', isStoryEvent: true,
    description: "教学楼大厅的黑板前挤满了各派代表，粉笔字重叠在一起。王照凯的提案写在最上面：所有行动小组归总指挥部统一调度，不要再各自为战。他把粉笔搁回槽里，转身对几个犹豫的做题派代表说：“革命不能停在广播站，现在需要的是一个声音。”\n\n潘仁越没有正面反驳，只在黑板上画了三个并列的方格，分别填上“调查”“宣传”“恢复上课”。他指着这些方格：“不同主张也得有地方说话。革委会不能把所有人的嘴都堵上。”\n\n做题派的代表站在角落，手里夹着三角板和油印的课程表。他们更想问的是，走廊被占领之后，那些准备模拟考的人怎么办。大厅外的雨声混着广播里循环的革命口号。\n\n推翻旧秩序是一回事，可新秩序到底长什么样，代表们自己还没吵出结果。",
    buttonText: '先让代表们坐下来。', effectsText: ['已解锁学生代表大会：左侧入口调整派系关系', '集权决定指挥集中程度，团结决定各派能否继续合作', '十字路口确认时检查席位与这两个数值', ...CROSSROADS_RULES],
  },
  democratic_power_struggle_event: {
    id: 'democratic_power_struggle_event', title: '民主派争权', isStoryEvent: true,
    description: "潘仁越的代表在大会门口拦住了几个刚散会的委员。他们手里拿着油印的提案草稿，要求重新讨论革委会的授权范围。走廊里，一个女生正把从各班收集来的意见条贴到墙上，纸条上写着“为什么处分没有经过我们讨论”“同意统一调动的举手”。\n\n会议桌旁，原先接受统一安排的人开始追问，指挥部的命令是否需要代表逐条签字。潘仁越没有走到讲台上，只是站在代表中间说：“如果所有决定都是几个人定的，那还要大会干什么？”\n\n争论仍然在同盟内部，但已经改变了谁能决定下一步。",
    buttonText: '把争议带回大会。', effectsText: ['30天内提高理智至70、团结至65或潘派至40席可化解', '到期：潘派席位随机 +1–3（重新分配）、集权 -5、团结随机 -3至+3'],
  },
  democratic_power_struggle_result: {
    id: 'democratic_power_struggle_result', title: '授权的让步', isStoryEvent: true,
    description: "新一轮争执没有定于一尊。一些原本坐在中间的班级代表把票投给了潘仁越，要求大会对指挥部的决定拥有更直接的约束。会场的黑板旁，负责记录表决结果的女生反复擦拭粉笔数字，又改了一次。\n\n革委会仍然存在，但发出同一道命令之前，需要争取的人更多了。有人把这当作合作的开始，认为至少各方愿意把分歧拿到台面上；也有人认为原来的安排已无法坚持，下一步只会更难。",
    buttonText: '记录这次席位变化。',
  },
  support_bill_event: {
    id: 'support_bill_event',
    title: '表态：支持议案',
    description: '你决定在议会中公开表态支持当前的议案。这需要消耗一定的政治点数来进行游说和动员，但能显著增加该议案的通过几率。',
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
    description: '你决定在议会中公开表态反对当前的议案。这需要消耗一定的政治点数来组织反对力量，能显著降低该议案的通过几率。',
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
    description: '潘仁越的追随者们希望你能在法案中加入更多保障学生基本权利的条款。',
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
    description: '经过激烈的辩论和投票，议案最终获得了多数代表的支持，正式成为合肥一中的新规。这是民主的胜利！',
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
              description: "学生议会成功通过法案，说明这套议事程序不再只是摆设，学生真的能借此改变与自己相关的规则。民主的理念由此在校园里变得具体：它意味着提案、辩论、表决和接受结果。一次成功不等于从此顺畅，但它证明了程序可以被用来办事。",
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
    description: '由于未能获得足够的赞同票，议案在学生议会中被否决。这表明我们的联盟内部还存在着巨大的分歧。',
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
              description: "吴福军的铁腕统治在合一激起学生的愤怒。表面秩序靠压制维持，学生的支持却在流失，不满转为愤怒，短期内还看不到出口。这种愤怒未必形成有组织的反抗，但它持续积累，使校园看起来平静，内里却越来越紧张。铁腕能压住行为，压不住认同。",
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
            description: "杨玉乐是合肥一中的特级教师，校内保守派里一位老谋深算的代表。他长年立足课堂，处理校务讲究实效，惯于从学生内部寻找裂缝，再用日常教学的名义把局面收拢回可控范围。在他看来，学校的运转终究要靠成绩和纪律，一时的政治热情若压过课堂，秩序就会先垮。他对学生运动的判断因此偏向保守：这不是需要回应的诉求，而是需要化解的麻烦。这一立场使他在校内拥有一批同样看重稳定的教师，却也暴露出他的矛盾——他手里真正有效的工具只存在于课堂之内，一旦学生把问题提到课堂之外，他能做的其实不多。",
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
    description: '封安宝要求你组织一场声势浩大的百日誓师，要求每个学生写下血书，并在雨中高喊口号，以此向市教育局展示合一学子的“狼性”和你的维稳政绩。',
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
    description: '保卫科送来了一批从老阅览室搜出的旧杂志（如《南方周末》等）。封校长认为这些“旧时代的民主毒草”会影响做题专注度，要求你这位代理校长亲自盖章销毁。',
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
    description: '强制要求所有高三学生以高于市场价30%的价格购买及第教育的废纸。财务处需要你签字背书，而装满回扣暗示的信封已经夹在文件底下了。',
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
    description: '这封信表面辞藻华丽，称赞你把“ED和ING讲得出神入化”，但字里行间透着一股浓烈阴阳怪气，甚至要求你每天增加两节课以“普度众生”。这显然是学生的代笔。',
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
    description: '为了赶年底的教研成果指标，你手下的年轻教师提出了一项新规：要求全高三学生早读必须站立，且不准有任何倚靠动作。',
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
    description: '一位合一毕业的校友企业家找上门来。他愿意捐两百万给学校建一座新的英语语音室——但条件是，语音室必须以他的祖父命名，而他祖父是旧社会的一位私塾先生，曾在文革期间被批斗致死。\n\n封校长对这比捐款很感兴趣，但他把这个烫手山芋扔给了你：你来决定要不要接受这笔"带有政治风险"的捐赠。',
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
    description: 'B3教学楼被攻下，但我们的试卷储备量已经彻底枯竭。没有了做题力作为支撑，我们无法建立新的秩序。校方保安队和及第教育的雇佣兵趁机发起了反扑。潘仁越带领着最后的抵抗军，在教学楼的走廊里展开了绝望的巷战。',
    buttonText: '战斗到最后一刻！'
  },
  enter_treeA: {
    id: 'enter_treeA',
    title: '联合革命委员会的胜利',
    description: 'B3教学楼被成功攻下！在王照凯和潘仁越的领导下，学生们保持了足够的理智和团结。我们成功建立了一个由学生自治的“联合革命委员会”，并开始着手制定新的校园秩序。',
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
    title: '深夜的密谈',
    description: "行政楼三楼最靠里的办公室，窗帘拉得不紧，空调外机在窗外嗡嗡响。杨玉乐坐在靠墙的沙发里，手边摆着一杯泡过多次的茶。学生代表坐在对面，没有动桌上的矿泉水。\n\n“校方会放松部分管制。”杨玉乐说，“顾问这个身份我继续挂着，该提意见时我会提。”\n\n学生代表点头，语气平稳：“我们这边停止过激抗议。潘仁越民主派的代表和做题派的代表已经沟通过，多数人认可这次安排。”\n\n办公桌上放着两摞刚收上来的意见表。代表说：“温和派与做题派已经拿到了新增名额。”\n\n杨玉乐没有多问。走廊外传来学生小声说话的动静，很快又安静下去。",
    buttonText: '政治就是妥协的艺术。',
    effect: (state: GameState) => ({
      ...applyYangSettlement(state, 'compromise')
    })
  },
  olive_branch: {
    id: 'olive_branch',
    title: '分化瓦解',
    description: '校方巧妙地利用了联合革命委员会内部的矛盾，向钢铁红蛤领袖王照凯抛出了橄榄枝，承诺给予他更多的自治权力。\n\n这一招果然奏效，学生阵营开始分裂，一部分人选择接受招安，而另一部分人则更加激进。',
    buttonText: '堡垒总是从内部被攻破。',
    effect: (state: GameState) => ({
      stats: { ...state.stats, ss: state.stats.ss - 15, stab: Math.min(100, state.stats.stab + 10) }
    })
  },
  despair_fight: {
    id: 'despair_fight',
    title: '最后的防线',
    description: '保安队发起了猛烈的反扑，学生们被迫退守B3教学楼。走廊里堆满了课桌椅作为街垒，空气中弥漫着粉笔灰和汗水的味道。\n\n“我们没有退路了，背后就是我们的尊严！”潘仁越站在防线的最前沿，目光坚定。',
    buttonText: '死守到底！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 20), stab: state.stats.stab - 30 }
    })
  },
  march_on_admin: {
    id: 'march_on_admin',
    title: '进军行政楼',
    description: '纠察队的红旗已经插上了行政楼的台阶。旧官僚们瑟瑟发抖，属于我们的时代即将来临！',
    buttonText: '冲锋！',
    effect: (state: GameState) => ({
      stats: { ...state.stats, ss: Math.min(100, state.stats.ss + 20), stab: Math.min(100, state.stats.stab + 10) }
    })
  },
  event_7_smolny: {
    id: 'event_7_smolny',
    title: '斯莫尔尼宫的会议桌',
    description: "B3教学楼顶层会议室里，几张课桌拼成临时长桌，各班的代表挤坐在长凳上。联合革命委员会刚成立，王照凯坐在一端，潘仁越和其他班代表分坐两侧。\n\n“现在最要紧的是别散架。”王照凯说，“楼我们是占下了，可操场、食堂、大门那边还没谈完。如果每个班都自己定规矩，我们需要一个统一的指挥组，所有行动先报到这里。”\n\n潘仁越接着说：“统一的指挥组我也赞成。但成立委员会的时候，我们说的是打破独裁。如果刚换上来就变成一个人定名单、一个人批条子，我们又改变了什么？各班代表必须有权否决指挥组的决定。”\n\n争论很快转到具体的人手问题上。王照凯提出，派去操场和食堂方向联络的人，应该由他直接指定。潘仁越反对，主张由各班代表去谈，情况再带回会议讨论。联络人选仍没谈妥。",
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
    title: '老保的审判与阶级立场',
    description: "大会在礼堂西侧的小报告厅开。杨玉乐被撤去顾问职务后，第一个议程就是追究旧管理人员在强制管控期间的责任。\n\n几名“钢铁红蛤”成员挤在听众前两排，有人直接喊出“肉体消灭”。王照凯站在台上，没有打断，也没有接话。潘仁越从代表席站起来，说：“他们也是体制的受害者，清算不能变成报复。”\n\n场内安静了片刻，后排响起几点嘘声。免职的事已成定局，更多代表转向了王照凯这边，但原先的温和盟友明显坐得远了些。争论集中在怎么处理旧管理人员，以及后续的监督由谁负责。王照凯低头翻了翻发言顺序，才把麦克风重新打开。",
    buttonText: '必须有人付出代价！',
    effect: (state: GameState) => ({
      ...applyYangSettlement(state, 'trial')
    })
  },
  event_9_rectify_order: {
    id: 'event_9_rectify_order',
    title: '整顿校内秩序',
    description: "夺取教学楼和行政楼之后，控制权暂时落在学生手里，但没有人真正接过管理。走廊上散落着试卷，广播从早到晚播放摇滚乐，操场边的教辅资料被点着了，纸灰飘到跑道上。\n\n王照凯在学生代表大会上拍了桌子：“自由不是放纵！门口、广播、物资都没有人管，教室也没有恢复上课，外面的人会怎么看我们？”潘仁越没有反驳拍桌子的动作，只说宣泄是长期压抑后的反应，过度干涉会先失去基础。\n\n两人的分歧没有当场解决。散会后，王照凯要求各楼层报告物资和广播的值守情况，不少班级回答说还在等代表给办法；也有地方已经自行排班，但没有向会议汇报。秩序还没有重建起来，下一步要明确由谁指挥、怎样把已经拿下的地方管起来。",
    buttonText: '必须重建秩序...',
    effect: (state: GameState) => ({
      stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 10), tpr: Math.max(0, state.stats.tpr - 50) }
    })
  },
  event_10_crossroads: {
    id: 'event_10_crossroads',
    title: '命运的十字路口',
    description: "代表们即将对主导权作最后表态。礼堂里，各派别的人都在低声核对席位，有人反复确认联盟内部的团结程度和党内的集权程度。会前的最后一步，是让同盟方面明确是否接受当前的指挥方式。\n\n表态还没有正式作出，分歧也没有消失。王照凯坐在前排，面前摊着发言名单，没有回头去看身后那些交头接耳的代表。谁会成为最终的胜者，要等这一轮表态结束才能知道。",
    buttonText: '见证最终的胜者...',
    effect: (state: GameState) => {
      switch (getCrossroadsOutcome(state)) {
        case 'democracy': return { currentFocusTree: 'treeA_pan' };
        case 'true_left': return { currentFocusTree: 'treeA_true_left' };
        case 'union': return { activeEvent: FLAVOR_EVENTS.true_left_union_choice_event };
        case 'great_awakening': return { gameEnding: 'great_awakening' };
        case 'pleasure_of_mediocrity': return { gameEnding: 'pleasure_of_mediocrity' };
        default: return { gameEnding: 'gouxiong_usurpation' };
      }
    }
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
            description: "王照凯与潘仁越签下停火书，两支曾经兵戎相向的力量暂时搁置分歧。办公桌上红旗与选票并排摆着，谁也不曾真正说服谁，只是都承认继续对抗的代价高于妥协。和解是脆弱的，它依赖双方保持克制；一旦信任耗尽，这张纸随时可能被撕毁。",
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
            description: "王照凯与潘仁越签下停火书，两支曾经兵戎相向的力量暂时搁置分歧。办公桌上红旗与选票并排摆着，谁也不曾真正说服谁，只是都承认继续对抗的代价高于妥协。和解是脆弱的，它依赖双方保持克制；一旦信任耗尽，这张纸随时可能被撕毁。",
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
    description: '为了彻底稀释王照凯残部的政治影响力，潘仁越签署了上台后的第一份第一号主席令：《关于扩大学生代表大会普选基数的决定》。在自由党的官方公文里，这被称为“将合一的命运真正交还给每一位学子”。\n\n但现实往往是对政治口号最恶毒的嘲弄。随着代表席位从一百个激增至三百个，新涌入议会大厅的并非心怀天下的民主斗士，而是整个校园生态最赤裸裸的切片。钢铁红蛤那些受过严格组织训练、熟读理论的党团成员 ，现在发现自己被淹没在了一片混乱的汪洋大海中。昨天的全体大会简直是一场灾难：高一三班的代表为了争夺食堂靠窗座位的优先分配权，在麦克风前骂了整整二十分钟；几个戴着厚底眼镜的岁静党代表，在讨论《校园自治宪法》的间隙，甚至堂而皇之地交换起了几家地下书店的绝密押题卷；更有甚者，后排角落里几个眼神游离的代表，其提案用词与及第教育上周塞进门缝里的广告语如出一辙。\n\n潘仁越坐在主席台上，看着台下乱哄哄的菜市场，感到一阵虚脱。他终于用民主的洪水冲垮了极权主义的堤坝，但他悲哀地发现，合一的底色从不是什么被压迫的理想乡，而是一个由精致利己主义者、麻木的做题机器和隐蔽的资本掮客组成的巨型角斗场。他创造了一个他根本无法驾驭的庞然大物。',
    buttonText: '民主的本质就是无休止的妥协与协商',
  },
  democratic_reforms_event: {
    id: 'democratic_reforms_event',
    title: '全面民主改革',
    description: '如果说封安宝时代的合一是一座靠高压维持运转的精密监狱，那么潘仁越的新政就是在系统性地拆除这座监狱的承重墙。随着《合一校园自治过渡宪章》的正式颁布，一系列旨在“解冻”的改革措施以前所未有的速度在校园内推行。\n\n吴福军时代那套迷信绝对纪律、随时可能没收私人物品的粗暴条例被彻底废止。取而代之的是由学生代表组成的纪律听证制度——现在，即便是面对上课打瞌睡的指控，学生也有权在委员会面前进行申辩。被封锁已久的艺术礼堂重新向各类社团开放，落满灰尘的吉他和画板重新回到了高三学生的视野中。从字面上看，权力被完完全全地交还给了广大学生，党内的集权度降到了历史最低点。\n\n然而，制度的解冻并不等同于立竿见影的乌托邦。当第一个宣布“周日晚自习完全自愿参加”的广播在校园上空回荡时，并没有爆发出预想中的欢呼雀跃。长久以来被“衡水模式”规训的做题家们 ，在突然获得支配自身时间的自由时，陷入了集体的无所适从。一些人确实走出了教室，在操场上享受着久违的晚风；但更多的人依然死死钉在座位上，一边翻阅着练习册，一边不安地打量着四周，生怕在这种“自由”中被竞争对手弯道超车。潘仁越坐在办公室里，看着手里那份因为缺乏强制力而执行缓慢的社团拨款审批表，深刻地意识到：砸碎枷锁只是第一步，要让一群习惯了被鞭打着前行的学生学会如何自主地走向远方，他需要付出的时间与耐心，远比推翻一个独裁者要多得多。',
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
    description: '随着及第教育全面接管合肥一中，校园内的每一个角落都被贴上了价格标签。食堂的饭菜价格翻倍，图书馆的座位需要按小时付费，甚至连课间的休息时间都被压缩，用来播放及第教育的辅导班广告。\n\n“知识就是财富，而我们正在创造财富。”封安祥在董事会上得意地宣布。',
    buttonText: '金钱的铜臭味...',
    effect: (state: GameState) => ({
      stats: { ...state.stats, studentSanity: Math.max(0, state.stats.studentSanity - 10) }
    })
  },
  jidi_suppress_event: {
    id: 'jidi_suppress_event',
    title: '铁腕镇压',
    description: '及第教育的保安队配备了最先进的防暴装备，在校园内进行24小时不间断的巡逻。任何敢于表达不满的学生都会被立刻带走，面临退学甚至更严重的惩罚。联合革命委员会的残余势力被彻底粉碎。\n\n曾经充满活力的校园，如今死气沉沉。',
    buttonText: '沉默的校园...',
    effect: (state: GameState) => ({
      stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 20) }
    })
  },
  jidi_feng_anbao_event: {
    id: 'jidi_feng_anbao_event',
    title: '封安宝的回归',
    description: '为了更好地管理这所已经完全商业化的学校，及第教育高薪聘请了前任校长封安宝作为特别顾问。他那熟悉的严厉面孔再次出现在校园里，让许多学生感到不寒而栗。\n\n“我早就说过，只有严格的管理才能出成绩。”封安宝在就职演说中冷冷地说道。',
    buttonText: '噩梦重临...',
    effect: (state: GameState) => ({
      stats: { ...state.stats, stab: Math.min(100, state.stats.stab + 10) }
    })
  },
  gx_start_event: {
    id: 'gx_start_event',
    title: '大统领的就职演说',
    description: '广播站里传来的不再是激昂的革命宣言，而是某部日本动画的OP。狗熊戴着滑稽的猫耳头饰，宣布自己成为“赛博娱乐大统领”。\n\n“从今天起，没有早读，没有晚自习！只有无尽的狂欢！我们要把合肥一中变成秋叶原！”\n\n台下的学生们有的欢呼，有的则陷入了深深的迷茫。理智正在这所学校里迅速蒸发。',
    buttonText: '这太荒谬了...',
    effect: (state: GameState) => ({})
  },
  gx_pants_event: {
    id: 'gx_pants_event',
    title: '午夜的恐慌',
    description: '一项荒唐的法令被颁布：所有女生必须上交一条裤子作为“大统领的收藏品”。起初大家以为这只是个恶劣的玩笑，直到大统领的“二次元近卫军”真的开始在宿舍区挨个敲门。\n\n校园里弥漫着恐慌和屈辱的气氛，许多女生连夜逃离了学校。',
    buttonText: '简直是变态！',
    effect: (state: GameState) => ({})
  },
  gx_anime_event: {
    id: 'gx_anime_event',
    title: '教材焚毁运动',
    description: '所有的《五年高考三年模拟》被堆积在操场上付之一炬。取而代之的是成堆的轻小说和漫画。老师们被强迫穿上Cosplay服装进行教学，黑板上写满了令人费解的二次元黑话。\n\n“这才是真正的素质教育！”狗熊在主席台上大声宣布。',
    buttonText: '教育的末日...',
    effect: (state: GameState) => ({})
  },
  gx_mygo_event: {
    id: 'gx_mygo_event',
    title: '永不结束的春日影',
    description: '所有的社团被强制解散，所有人被编入不同的“乐队”。大礼堂里24小时不间断地播放着《春日影》。任何人如果不能熟练地演奏这首曲子，就会被送去“补习”。\n\n“一辈子组乐队吧！”这句台词成了校园里唯一的问候语。',
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
              description: "吴福军以铁腕管理合一，学生的不满由此而生。校方越依赖压制，学生的愤怒越难消解；表面上没有人公开对抗，私下的抵触却不断累积。这是一种制度性的对立：管理者用纪律换取服从，学生则在被压制的日常中失去对学校的认同。愤怒未必立刻爆发，但它已经是一种稳定的状态。",
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
            description: "杨玉乐是合肥一中的特级教师，也是校内保守派教师的代表。他不大靠公开的行政姿态施压，而是凭多年积累的教学声望周旋于学生与校方之间，一边安抚情绪，一边寻找学生运动中可以被分化的位置。他相信学校最需要的是稳定，稳定的来源则是课堂、考试和既有的教师秩序，因此学生运动在他看来终究要被引回日常轨道。这样的角色使他在校内说话有分量，也让他在对立双方之间都保有一定的余地。问题在于，他的可信度恰恰建立在成绩与纪律之上；这使他惯于缓和对立，却难以触及学生诉求的根子，调解往往只是把冲突推迟。",
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
