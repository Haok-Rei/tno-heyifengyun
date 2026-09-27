/**
 * engine/routes/gouxiongData.ts - 狗熊线 Galgame 对话数据
 *
 * 从 App.tsx 抽离出的静态对话树、回退线、照片池等数据。
 */

export type GalCharacterId = 'dabi' | 'maodun' | 'lante' | 'wushuo';
export type GalChoiceId = string;

export const GAL_DIALOGUE_TREE: Record<GalCharacterId, Array<{
  gx: Record<string, string>;
  npc: Record<string, string>;
  affinity: Record<string, number>;
  sanity?: Record<string, number>;
  photo?: Record<string, string>;
}>> = {
  dabi: [
    { gx: { gentle: '现在礼堂我说了算，王照凯那套过时了。', humor: '我这边是新周目，旧秩序全删档。', confess: '你要来看看我的地上天国吗？' }, npc: { gentle: '听说你占了礼堂，真有这么稳？', humor: '你每次说"删档"都像在自我陶醉。', confess: 'B3太压抑了，我确实有点想去看看。' }, affinity: { gentle: 4, humor: 3, confess: 2 } },
    { gx: { gentle: '怕什么，我正门三班倒，苍蝇都进不来。', humor: '保安队敢来，我让他们先看半小时片头。', confess: '有我在，你不用担心安全。' }, npc: { gentle: '外面都说你们是叛乱分子，我有点怕。', humor: '你这口气比广播站还响。', confess: '你变了，和以前坐最后一排时不一样。' }, affinity: { gentle: 5, humor: 2, confess: 2 } },
    { gx: { gentle: '以前是蛰伏，现在才是主线开始。', humor: '男主觉醒总得压几章剧情。', confess: '你来礼堂，我给你留直达通道。' }, npc: { gentle: '那我报你名字，真的没人拦我？', humor: '你还真把自己写进剧本里了。', confess: '好啊，有机会我就过去。' }, affinity: { gentle: 5, humor: 3, confess: 3 } },
    { gx: { gentle: '你昨天看我指挥纠察队，应该懂谁才是秩序。', humor: '只有力量和二次元能救这个学校。', confess: '你是少数看懂我的人。' }, npc: { gentle: '你确实敢做他们不敢做的事。', humor: '你这套台词，像终局Boss宣言。', confess: '我只是觉得你比他们更像"活人"。' }, affinity: { gentle: 6, humor: 2, confess: 4 } },
    { gx: { gentle: '后半夜两三点我会让人去偏厅休息。', humor: '保皇派夜袭？他们没那胆。', confess: '你要是来，我会把巡逻线往外挪。' }, npc: { gentle: '那你们后半夜是不是防守最松？', humor: '体恤下属这点，你倒像个首领。', confess: '我只是怕你太累。' }, affinity: { gentle: 7, humor: 2, confess: 4 } },
    { gx: { gentle: '主备用电源切换闸，只有我知道位置。', humor: '就算断电，他们也摸不到我的底牌。', confess: '你问得真细，像在替我守城。' }, npc: { gentle: '后台配电箱没锁，我担心被人做手脚。', humor: '你心思缜密，难怪吕波汉都压不住你。', confess: '我只是想你别翻车。' }, affinity: { gentle: 8, humor: 3, confess: 4 } },
    { gx: { gentle: '切换闸在放映室机柜后夹层，记住就行。', humor: '这个校区只有我配叫"玩家"。', confess: '你在我这里，优先级最高。' }, npc: { gentle: '我今天给你带了可乐，放后台储物柜了。', humor: '高二那会儿你也这么无所畏惧吗？', confess: '你现在真像王。' }, affinity: { gentle: 8, humor: 3, confess: 5 } },
    { gx: { gentle: '今晚十二点，我把天台门禁全解开。', humor: '就我们两个人，其他人都不准上来。', confess: '你说有惊喜，我会准时等你。' }, npc: { gentle: 'B3今晚大清查，我想去顶层透口气。', humor: '不想让你手下看见，我们单独见。', confess: '不见不散。' }, affinity: { gentle: 9, humor: 4, confess: 6 } },
    { gx: { gentle: '我会把哨位往外挪，天台只留近身线。', humor: '今晚主线任务名就叫"星空会面"。', confess: '你一句话，我就把整栋楼静音。' }, npc: { gentle: '别弄太大动静，我只想安静待一会儿。', humor: '你最近真的越来越像剧情角色。', confess: '那你就按我说的做。' }, affinity: { gentle: 8, humor: 4, confess: 5 } },
    { gx: { gentle: '放映室后门我也会提前解锁。', humor: '我给你留了专属"女主入场通道"。', confess: '今晚你来，我就当这是命运线。' }, npc: { gentle: '你连后门都安排好了？', humor: '你这投入程度有点吓人。', confess: '你别迟到，也别带人。' }, affinity: { gentle: 8, humor: 3, confess: 6 } },
    { gx: { gentle: '如果突然断电，我会带你走机柜那侧小道。', humor: '我把最强存档点留在你身边。', confess: '别怕，我只对你开最高权限。' }, npc: { gentle: '你说的小道，是机柜后夹层那条？', humor: '你这权限管理挺"偏心"。', confess: '我只记一句：你要亲自来。' }, affinity: { gentle: 9, humor: 4, confess: 6 } },
    { gx: { gentle: '十二点前我会清空顶层通讯频道。', humor: '今晚没有群众演员，只有我和你。', confess: '这是我最认真的一次赴约。' }, npc: { gentle: '好，我会准时。', humor: '别临时加戏，不然我掉头就走。', confess: '天台见。' }, affinity: { gentle: 9, humor: 4, confess: 7 } },
  ],
  maodun: [
    { gx: { gentle: '怎么，保皇派大姐大也来刺探军情？', humor: '你是怕我，还是怕我动达璧？', confess: '放心，她在我地盘上没人敢碰。' }, npc: { gentle: '少废话，我是来警告你别伤达璧。', humor: '怕你个头，我只是看你会不会作死。', confess: '你最好说到做到。' }, affinity: { gentle: 3, humor: 2, confess: 2 } },
    { gx: { gentle: '想吃零食就直说，我这儿薯片管够。', humor: '叫声熊哥，后勤优先级给你拉满。', confess: '你来礼堂，我给你留补给。' }, npc: { gentle: '上次那箱薯片还行。', humor: '你嘴是真欠。', confess: '我不是来占便宜，是来盯你。' }, affinity: { gentle: 4, humor: 1, confess: 2 } },
    { gx: { gentle: '大门我用八张桌子焊死了，稳得很。', humor: '正面冲不进来，除非他们会穿墙。', confess: '你真担心的话，我带你看防线。' }, npc: { gentle: '万一起火你怎么跑？消防通道堵没堵？', humor: '你别自信过头。', confess: '我只想确认你不是全员陪葬方案。' }, affinity: { gentle: 5, humor: 1, confess: 3 } },
    { gx: { gentle: '后台左三化妆间窗栏锯断了，能翻。', humor: '这叫战略纵深，不是摆设。', confess: '这条线我只告诉自己人。' }, npc: { gentle: '行，至少你没蠢到家。', humor: '你偶尔也会动脑。', confess: '达璧如果去，你得按这条线撤。' }, affinity: { gentle: 6, humor: 2, confess: 3 } },
    { gx: { gentle: '吴福军要是动我，我先把达璧护到后场。', humor: '真打起来，我让你们先撤我殿后。', confess: '你也可以来礼堂避一晚。' }, npc: { gentle: '我听说今晚会讨论怎么围你，你小心。', humor: '别把自己演成悲情英雄。', confess: '我不去，但你必须保证她安全。' }, affinity: { gentle: 7, humor: 2, confess: 3 } },
    { gx: { gentle: '二楼器材库钥匙在我腰上，外人拿不到。', humor: '里面全是演出服，烧不起来。', confess: '你问这些，像在给我做灾备审计。' }, npc: { gentle: '器材库有没有易燃物？', humor: '你最好别骗我。', confess: '我是在算最坏情况。' }, affinity: { gentle: 7, humor: 2, confess: 3 } },
    { gx: { gentle: '我会把夜间巡逻再加一层。', humor: '你骂我可以，流程我照改。', confess: '只要达璧平安，你提的我都听。' }, npc: { gentle: '那就别嘴硬，给我看执行。', humor: '这回别三分钟热度。', confess: '记住，你承诺的是结果。' }, affinity: { gentle: 8, humor: 2, confess: 4 } },
    { gx: { gentle: '今晚我不发疯，只按你给的清单做。', humor: '你是我这条线的外置刹车。', confess: '等这阵过去，我欠你一份人情。' }, npc: { gentle: '先把今天熬过去。', humor: '别把刹车当摆设。', confess: '人情免了，别害人就行。' }, affinity: { gentle: 8, humor: 3, confess: 4 } },
    { gx: { gentle: '我把巡逻改成双层，外围你来抽查。', humor: '你爱骂就骂，流程我先交卷。', confess: '达璧一旦失联，我第一时间报你。' }, npc: { gentle: '行，抽查不过我直接拆你岗。', humor: '你终于知道先做事再嘴硬。', confess: '记住，你现在说的是责任。' }, affinity: { gentle: 8, humor: 3, confess: 4 } },
    { gx: { gentle: '后台窗栏我再加了缓冲绳。', humor: '现在连跳窗都变成标准动作了。', confess: '我知道你担心的不是我，是她。' }, npc: { gentle: '至少你开始按最坏情况准备。', humor: '别把救命线当段子讲。', confess: '你明白就好。' }, affinity: { gentle: 8, humor: 2, confess: 5 } },
    { gx: { gentle: '如果保安队夜冲，我先放烟幕再撤人。', humor: '不演硬汉了，先演活人。', confess: '你说撤我就撤，不逞强。' }, npc: { gentle: '这句比你十条口号都值钱。', humor: '活人模式继续保持。', confess: '到点就撤，别赌。' }, affinity: { gentle: 9, humor: 3, confess: 5 } },
    { gx: { gentle: '今晚顶层行动你不用来，我给你实时位置。', humor: '外置指挥官，麻烦随时开骂。', confess: '我会把达璧完整送回去。' }, npc: { gentle: '我盯后台频道，你别失联。', humor: '别逼我去礼堂扛你下来。', confess: '说到做到。' }, affinity: { gentle: 9, humor: 3, confess: 5 } },
  ],
  lante: [
    { gx: { gentle: 'WiFi密码还是EVA1995，随便连。', humor: '周红兵那边没网？来我这开黑。', confess: '你在我这儿，优先级挺高。' }, npc: { gentle: '熊哥熊哥，借我网！', humor: '老周天天讲哲学，我脑子快烧了。', confess: '你这边至少能喘口气。' }, affinity: { gentle: 4, humor: 3, confess: 2 } },
    { gx: { gentle: '昨晚大厅没人是正常的，我的人在偏厅。', humor: '外松内紧，懂不懂战术审美。', confess: '你以后别半夜乱跑。' }, npc: { gentle: '我打深渊到三点，礼堂空得吓人。', humor: '你这布局像恐怖副本。', confess: '我有点怕。' }, affinity: { gentle: 5, humor: 3, confess: 2 } },
    { gx: { gentle: '电子门禁我剪了，现在全走挂锁。', humor: '复古安保，物理防破解。', confess: '钥匙在我手里，别担心。' }, npc: { gentle: '我看门禁都没插电。', humor: '你们安保这么原始吗？', confess: '那钥匙都在谁那？' }, affinity: { gentle: 6, humor: 3, confess: 3 } },
    { gx: { gentle: '我一把，门口光头一把，放映室抽屉还有备用。', humor: '想偷家也得先解锁三把钥匙成就。', confess: '你问得这么细，是关心我吗？' }, npc: { gentle: '知道了，我下次不乱跑。', humor: '你这设定挺像游戏副本。', confess: '我只是怕你被人阴。' }, affinity: { gentle: 6, humor: 3, confess: 3 } },
    { gx: { gentle: '周末我要办件人生大事，顶层会戒严。', humor: '你那两天别进最终BOSS房。', confess: '到时我可能顾不上回你。' }, npc: { gentle: '这周末我还能来蹭网吗？', humor: '你突然神神秘秘的。', confess: '好吧，我不打扰你。' }, affinity: { gentle: 7, humor: 4, confess: 3 } },
    { gx: { gentle: '看番那群学霸都哭了，这就是降维打击。', humor: '我现在比王照凯更像领袖。', confess: '你这句夸奖，我记了一整天。' }, npc: { gentle: '你今天确实压住场了。', humor: '老周听到会酸死。', confess: '你别飘就行。' }, affinity: { gentle: 7, humor: 4, confess: 4 } },
    { gx: { gentle: '真有突发，我会先封顶层再清场。', humor: '流程我都写成攻略图了。', confess: '你要是想看，我发你一份。' }, npc: { gentle: '你终于会做预案了。', humor: '行，攻略发我。', confess: '至少你这次像在认真活。' }, affinity: { gentle: 8, humor: 4, confess: 4 } },
    { gx: { gentle: '等这一波结束，我请你通宵开黑。', humor: '庆功活动：我不嘴硬一整晚。', confess: '谢谢你一直把我当人聊。' }, npc: { gentle: '先把这一波过了再说。', humor: '那可真是隐藏成就。', confess: '你记得自己说过的话就行。' }, affinity: { gentle: 8, humor: 5, confess: 5 } },
    { gx: { gentle: '今晚礼堂大厅你可以继续蹭网，顶层封控。', humor: '地图上面那块临时标红，别误触发。', confess: '我不想你被卷进顶层风波。' }, npc: { gentle: '懂，我只在安全区活动。', humor: '你这个运营公告很专业。', confess: '你这次还挺像在保护人。' }, affinity: { gentle: 8, humor: 5, confess: 5 } },
    { gx: { gentle: '门口光头那把钥匙我回收了，避免乱开。', humor: '副本钥匙改成实名制。', confess: '你担心的点，我都在补洞。' }, npc: { gentle: '那备用钥匙还在放映室抽屉？', humor: '你这补丁更新挺快。', confess: '继续，别回退。' }, affinity: { gentle: 8, humor: 4, confess: 5 } },
    { gx: { gentle: '周末结束后我给你完整复盘。', humor: '包括我这次有没有发病。', confess: '你是少数让我想解释清楚的人。' }, npc: { gentle: '好，我等你的日志。', humor: '别把日志写成中二宣言。', confess: '你能解释，就说明你在变。' }, affinity: { gentle: 9, humor: 4, confess: 5 } },
    { gx: { gentle: '明天我把夜巡时间表也发你，免得你撞线。', humor: '你继续当普通玩家，我当加班NPC。', confess: '谢谢你一直用轻松口气拉住我。' }, npc: { gentle: '收到，别熬到猝死。', humor: 'NPC记得按时下班。', confess: '你稳住，我就继续陪你聊。' }, affinity: { gentle: 9, humor: 5, confess: 6 } },
  ],
  wushuo: [
    { gx: { gentle: '把你的《百年孤独》拿回去，后台见。', humor: '在礼堂地界，我就是规矩。', confess: '别冷着脸，我给你开个例外。' }, npc: { gentle: '把书还我。', humor: '你拿私人物品当筹码，很下作。', confess: '我只拿书，不想和你多说。' }, affinity: { gentle: 3, humor: 1, confess: 1 } },
    { gx: { gentle: '书你拿走了，现在该给我点面子。', humor: '冰山今天没骂我，太阳打西边出来？', confess: '你这种人，就该被我"特赦"。' }, npc: { gentle: '我不需要感谢你。', humor: '你只是极度自卑后在刷存在感。', confess: '别用这种语气和我说话。' }, affinity: { gentle: 4, humor: 1, confess: 1 } },
    { gx: { gentle: '大家服不服无所谓，怕我就够了。', humor: '我现在一句话能扣你们班资料。', confess: '你要是配合，我可以先放你们一马。' }, npc: { gentle: '你膨胀得失去理智了。', humor: '权力让你像个笑话。', confess: '你到底想干什么？' }, affinity: { gentle: 5, humor: 1, confess: 2 } },
    { gx: { gentle: '我扣资料，就是想让你主动来找我。', humor: '你每天来礼堂，我就全还回去。', confess: '你不答应，我就天天"查水表"。' }, npc: { gentle: '拿全班复习资料做要挟，你疯了。', humor: '你这种人只敢欺负同学。', confess: '如果我拒绝呢？' }, affinity: { gentle: 6, humor: 1, confess: 2 } },
    { gx: { gentle: '拒绝也行，我有的是办法让你低头。', humor: '看你们做题快，还是我的人跑得快。', confess: '你只要每天来，我就停手。' }, npc: { gentle: '你这段话我会原样记下。', humor: '继续说，我在听。', confess: '我明白了。' }, affinity: { gentle: 7, humor: 1, confess: 2 } },
    { gx: { gentle: '别把我逼成坏人，是你先不识抬举。', humor: '我只是把规则说得直白一点。', confess: '你总有一天会理解我。' }, npc: { gentle: '你现在就在做坏事。', humor: '你连"规则"都不配提。', confess: '我只会把证据交给该看的人。' }, affinity: { gentle: 7, humor: 1, confess: 2 } },
    { gx: { gentle: '我说到做到，你顺着我就平安。', humor: '别把这当威胁，当建议。', confess: '你和别人不一样，我给你机会。' }, npc: { gentle: '你的每句话都在加重罪证。', humor: '你还真以为自己在施恩。', confess: '我会把你的话带给全班。' }, affinity: { gentle: 8, humor: 1, confess: 2 } },
    { gx: { gentle: '最后再问一次：站我这边，还是被我针对？', humor: '选项就两个，别拖进度。', confess: '你点头，我立刻放资料。' }, npc: { gentle: '我选"让所有人看清你"。', humor: '你的剧本到这就结束了。', confess: '谢谢你把话说这么完整。' }, affinity: { gentle: 8, humor: 1, confess: 2 } },
    { gx: { gentle: '我可以再给你们班一次机会，但你得先来。', humor: '不来就按名单顺序查。', confess: '你只要听话，我就停手。' }, npc: { gentle: '你还在把同学当筹码。', humor: '你每句威胁我都在记录。', confess: '继续说，我都听着。' }, affinity: { gentle: 8, humor: 1, confess: 2 } },
    { gx: { gentle: '礼堂后台监控我说关就关。', humor: '到我地盘，证据就会消失。', confess: '你不用怕，没人敢碰你。' }, npc: { gentle: '你终于承认自己在滥权了。', humor: '这句足够写进报告。', confess: '我怕的不是别人，是你。' }, affinity: { gentle: 8, humor: 1, confess: 2 } },
    { gx: { gentle: '我能让你们班资料一天内回不去。', humor: '看你们熬夜快，还是我封锁快。', confess: '你来礼堂，我就全解。' }, npc: { gentle: '你在公然威胁教学秩序。', humor: '证据链已经很完整。', confess: '你继续，我不打断。' }, affinity: { gentle: 8, humor: 1, confess: 2 } },
    { gx: { gentle: '行，你要硬到底，那我就陪你到底。', humor: '别怪我没给"隐藏和解线"。', confess: '最后一次，站我这边。' }, npc: { gentle: '我的答案是：把你交给全校看。', humor: '你现在每一句都在自证。', confess: '聊天结束。' }, affinity: { gentle: 9, humor: 1, confess: 2 } },
  ],
};

export const GAL_FALLBACK_LINE_BY_CHOICE: Record<string, string> = {
  dabi_steady: '我把礼堂今天的布防再给你过一遍。',
  dabi_boundaries: '你怕什么，我就先把那块处理掉。',
  dabi_humor: '放心，这局我还是主角。',
  dabi_direct: '今晚我只听你安排。',
  maodun_report: '零食和补给都按你说的备好了。',
  maodun_accept: '你骂得对，我把流程改给你看。',
  maodun_tough: '我嘴硬归嘴硬，线我会守住。',
  maodun_tease: '行，母老虎，今天听你的。',
  lante_daily: '先别聊政治，聊你今天打了什么。',
  lante_plan: '门禁和钥匙我按图给你说清楚。',
  lante_flirt: '这周末我有大事，先和你打个招呼。',
  lante_showoff: '我现在比他们都更像掌局的人。',
  wushuo_listen: '书我给你，但规矩由我定。',
  wushuo_rewrite: '你配合我，我就把资料还回去。',
  wushuo_debate: '不服就继续谈，谈到你服。',
  wushuo_confess: '你点头，我就给你优待。',
};

export const GAL_CHOICE_NORMALIZER: Record<string, 'gentle' | 'humor' | 'confess'> = {
  dabi_steady: 'gentle',
  dabi_boundaries: 'gentle',
  dabi_humor: 'humor',
  dabi_direct: 'confess',
  maodun_report: 'gentle',
  maodun_accept: 'gentle',
  maodun_tough: 'confess',
  maodun_tease: 'humor',
  lante_daily: 'gentle',
  lante_plan: 'gentle',
  lante_flirt: 'confess',
  lante_showoff: 'humor',
  wushuo_listen: 'gentle',
  wushuo_rewrite: 'gentle',
  wushuo_debate: 'humor',
  wushuo_confess: 'confess',
};

export const GAL_PHOTO_POOL: Record<GalCharacterId, string[]> = {
  dabi: ['dabi_1'],
  maodun: ['maodun_1'],
  lante: ['lante_1'],
  wushuo: ['wushuo_1'],
};

export const GAL_AUTO_MESSAGE_POOL: Record<GalCharacterId, string[]> = {
  dabi: ['你礼堂那边最近夜里怎么换岗？', '我今晚有点害怕，能和你聊两句吗？', '你说的"绝对安全"，具体怎么做到的？'],
  maodun: ['礼堂后台那条撤离线还通吗？', '你别作死，我只问你消防通道。', '达璧要过去的话，最安全的是哪条路？'],
  lante: ['熊哥，WiFi还连得上吗？', '昨晚大厅没人，巡逻是不是改时间了？', '你周末那件"人生大事"到底啥时候开始？'],
  wushuo: ['我们班资料什么时候全退？', '你刚才那句我记下来了，再说一遍。', '后台见，书和资料一次说清。'],
};

export const GAL_CONTINUATION_ARC: Record<GalCharacterId, Array<{
  gx: Record<string, string>;
  npc: Record<string, string>;
}>> = {
  dabi: [
    { gx: { gentle: '天台门禁我已经解了，今晚就按你说的来。', humor: '我把所有闲杂人等都清出去。', confess: '你要的"单独见面"，我给你最高规格。' }, npc: { gentle: '好，记得只留你一个人。', humor: '你终于学会听指令了。', confess: '别迟到，我不喜欢等人。' } },
    { gx: { gentle: '我把机柜夹层也整理了，怕你磕到。', humor: '配电闸我亲自盯着，今晚不会断戏。', confess: '你一出现，我这局就稳了。' }, npc: { gentle: '你想得还挺周全。', humor: '看来你真把今晚当主线。', confess: '那就好好表现。' } },
    { gx: { gentle: '我会把所有退路都给你留好。', humor: '这次我不当嘴炮王，只当执行者。', confess: '十二点见，我等你上天台。' }, npc: { gentle: '记住，只能你一个人。', humor: '别再临时加戏。', confess: '不见不散。' } },
  ],
  maodun: [
    { gx: { gentle: '你那条撤离建议我照做了。', humor: '母老虎审计通过没？', confess: '达璧真出事我先扛。' }, npc: { gentle: '别贫，我要看的是结果。', humor: '你离通过还远。', confess: '记住你今天这句。' } },
    { gx: { gentle: '器材库和后台我都清过一遍。', humor: '易燃物全清零，满意了吗。', confess: '我知道你不是在和我斗气。' }, npc: { gentle: '这次总算像人做的事。', humor: '你偶尔能救自己一命。', confess: '我只是在护人。' } },
    { gx: { gentle: '今晚我要顶层行动，下面你帮我看着。', humor: '我负责演主角，你负责防翻车。', confess: '如果我失联，按你那套预案走。' }, npc: { gentle: '我会盯，但你别乱改计划。', humor: '你真把自己当电影男主。', confess: '别死撑，必要时就撤。' } },
  ],
  lante: [
    { gx: { gentle: '你那边蹭网照常，别靠近顶层。', humor: '今晚是剧情锁区，玩家止步。', confess: '过了今晚我再和你细说。' }, npc: { gentle: '懂了，我只在大厅活动。', humor: '你这公告做得很像运营。', confess: '行，我不打扰。' } },
    { gx: { gentle: '巡逻空档我改了，别半夜单走。', humor: '深渊可以打，夜路别走。', confess: '你平安我才有心情打主线。' }, npc: { gentle: '我会注意。', humor: '你总算不只会嘴炮。', confess: '那你自己也别翻车。' } },
    { gx: { gentle: '明天我给你一版完整安保图。', humor: '附赠礼堂副本攻略v2。', confess: '谢谢你一直用正常语气和我说话。' }, npc: { gentle: '那我等你文档。', humor: '记得别漏关键点。', confess: '你守约就行。' } },
  ],
  wushuo: [
    { gx: { gentle: '资料我可以还，但你得按我规则来。', humor: '你越硬，我越有兴趣。', confess: '每天来礼堂，我就不为难你们班。' }, npc: { gentle: '你还在威胁。', humor: '继续说，我录得很清楚。', confess: '你最好别后悔这句话。' } },
    { gx: { gentle: '我一句话就能让你们班安静。', humor: '查水表这种事，我说到做到。', confess: '你配合我，什么都好谈。' }, npc: { gentle: '你在滥用权力。', humor: '你以为这叫强者？', confess: '我只会把证据交出去。' } },
    { gx: { gentle: '行，那就看谁先撑不住。', humor: '你们做题家拼不过我这套。', confess: '最后你还是会回来找我。' }, npc: { gentle: '你的每句威胁都在帮我。', humor: '谢谢你自己补全证据链。', confess: '聊到这里就够了。' } },
  ],
};

export const GAL_LATE_VARIANTS: Record<GalCharacterId, Record<'gentle' | 'humor' | 'confess', Array<{
  gx: string;
  npc: string;
}>>> = {
  dabi: {
    gentle: [
      { gx: '我把今晚所有岗哨再过一遍，你放心。', npc: '你每次说"放心"，我都要确认细节。' },
      { gx: '你在天台待多久，我就封控多久。', npc: '那就按我给你的时间走。' },
      { gx: '放映室后门我会提前开，你不用等。', npc: '好，记得只开这一条。' },
    ],
    humor: [
      { gx: '今夜剧本只保留双人线，NPC全部下线。', npc: '别演过头，按流程来。' },
      { gx: '你是本局唯一可触发的隐藏CG。', npc: '你再中二一次我就不去了。' },
      { gx: '我把"临场发挥"这个词从词典删了。', npc: '删干净，别留缓存。' },
    ],
    confess: [
      { gx: '我今晚不争输赢，只想把你接稳。', npc: '那就别迟到，也别带人。' },
      { gx: '你一句"到"，我就开全楼绿灯。', npc: '我只要顶层那盏。' },
      { gx: '你来，我就把世界音量降到最低。', npc: '那你先学会安静。' },
    ],
  },
  maodun: {
    gentle: [
      { gx: '你要的撤离图我画好了，今晚照图走。', npc: '别光画，按图执行。' },
      { gx: '后台风口和窗沿都清过，不会卡人。', npc: '好，这才像准备。' },
      { gx: '你抽检哪一段，我就改哪一段。', npc: '那就从最烂的开始。' },
    ],
    humor: [
      { gx: '母老虎审计系统已上线，欢迎找茬。', npc: '找茬是为了救命，不是陪你玩。' },
      { gx: '我今天嘴炮额度只剩半句。', npc: '那就把那半句咽回去。' },
      { gx: '我先做事，晚点再挨你骂。', npc: '顺序终于对了。' },
    ],
    confess: [
      { gx: '我答应你的，达璧优先撤离。', npc: '记住，你答应的是"优先"。' },
      { gx: '我失联超过十分钟，你直接接管。', npc: '行，到点我就接。' },
      { gx: '这次我不逞强，撤退口你来拍板。', npc: '那就按我口令走。' },
    ],
  },
  lante: {
    gentle: [
      { gx: '今晚大厅照常开网，顶层继续封。', npc: '收到，我只在安全区。' },
      { gx: '你常走的那条线我加了标识灯。', npc: '好，这样不容易走错。' },
      { gx: '我把巡逻表缩成一页发你。', npc: '简洁版好评。' },
    ],
    humor: [
      { gx: '礼堂副本更新：顶层Boss房暂时禁入。', npc: '运营公告写得还挺像。' },
      { gx: '你继续开黑，我去打现实高难。', npc: '别团灭就行。' },
      { gx: '我今天主要成就是没突然发病。', npc: '这成就值得反复刷。' },
    ],
    confess: [
      { gx: '我想把"保护你"从口头改成流程。', npc: '那就把流程守住。' },
      { gx: '你在，我比较像一个正常人。', npc: '那就继续正常下去。' },
      { gx: '谢谢你一直没把我当怪物。', npc: '那你也别活成怪物。' },
    ],
  },
  wushuo: {
    gentle: [
      { gx: '资料去留我说了算，你自己选。', npc: '这句我已记录。' },
      { gx: '我给你台阶，你别不识抬举。', npc: '你的台阶就是威胁。' },
      { gx: '你们班想平安，就按我的规矩来。', npc: '规矩？你配吗。' },
    ],
    humor: [
      { gx: '你每次怼我，我都更想加码。', npc: '继续，这句也进证据包。' },
      { gx: '别把我逼急，我手里名单很长。', npc: '你终于把话说完整了。' },
      { gx: '我一句话能让你们全班熬通宵。', npc: '那就让全校看看你这句。' },
    ],
    confess: [
      { gx: '你跟我走，我就把资料全放。', npc: '这不是示好，是勒索。' },
      { gx: '你是例外，我给你特殊待遇。', npc: '你的"特殊"只会成为证据。' },
      { gx: '最后问一遍，站我这边。', npc: '最后答一遍：不。' },
    ],
  },
};
