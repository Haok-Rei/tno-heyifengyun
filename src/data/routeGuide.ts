import { CROSSROADS_RULES } from '../engine/assemblyPolitics';

export type GuideNodeType = 'root' | 'branch' | 'route' | 'crisis' | 'ending' | 'info' | 'golden';

export interface GuideNode {
  id: string;
  title: string;
  type: GuideNodeType;
  req?: string;       // 分歧点要求 / 达成条件
  story?: string;     // 剧情梗概
  endingId?: string;  // 结局 id（关联 endings.ts）
  note?: string;      // 补充说明
  isNew?: boolean;    // 历史新增标记
  children?: GuideNode[];
}

// ============================================================
// 路线条件与当前玩法同步维护
// ============================================================
export const ROUTE_TREE: GuideNode = {
  id: 'start',
  title: '2023年9月1日 · 封安宝时代（第一阶段）',
  type: 'root',
  story: '滨湖校区，衡水模式高压统治。稳定度、卷子储备(TPR)、学生支持度(SS)与政治点数(PP)是贯穿全局的生命线。',
  children: [
    {
      id: 'mock_exam',
      title: '一模考试临近',
      type: 'crisis',
      req: '开局自带危机 · 30天倒计时',
      story: '到期未能稳住军心 → 稳定度 -30（无直接结局，但极易引发连锁崩溃）。',
    },
    {
      id: 'charge_b3',
      title: '冲上B3教学楼！',
      type: 'branch',
      req: '完成「铸造钢铁红蛤」，且激进愤怒度 >80',
      story: '「拉拢强基班与平行班」「器材室的秘密聚会」「抗议自治会特权」都要完成，才能铸造钢铁红蛤。冲上B3结算后依次触发临界点、黑天红字旗和起义超事件。',
      children: [
        {
          id: 'yang_yule_entry',
          title: '杨玉乐线「名师工作室」',
          type: 'route',
          req: '攻下B3后：稳定度 <35 且 杨玉乐在任顾问时记录机会 → B3国策完成满10天解锁「杨特出山」决议（消耗20 SS）',
          story: '特级教师杨玉乐以“维稳”为名接管合一。玩的是教师视角：三大支线（应对考核/扑灭红蛤/掩盖英语失误），办公室互动、健康与好感管理，最终冲击正高级职称。',
          children: [
            {
              id: 'yy_ending_success', title: '装在套子里的合一', type: 'ending', endingId: 'game_over_yang_yule_success',
              req: '最终维稳人国策：处理事务 ≥ 10 次，且 封安宝好感 + 教师支持 > 150、健康 > 0（完成公示期则直接加冕）',
              story: '杨玉乐如愿评上正高级特级教师，合一被永远定格在死寂的稳定之中。',
            },
            {
              id: 'yy_ending_fail', title: '全面镇压', type: 'ending', endingId: 'game_over_school',
              req: '条件不足（好感/支持不够或健康崩盘）',
              story: '功亏一篑。杨玉乐被封安宝抛弃，吴福军重新掌权，镇压比以往更加残酷。',
            },
          ],
        },
        {
          id: 'gx_early_entry',
          title: '狗熊线（早入·二次元的狂欢）',
          type: 'route',
          req: '完成冲上B3时：学生理智 < 20 且 资本渗透 > 80',
          story: '不等危机倒计时，狗熊直接在B3废墟上宣告“二次元地上天国”。后续与危机入口完全一致。',
          children: [{ id: 'gx_early_ref', title: '分支详见下方「狗熊线」条目', type: 'info' }],
        },
        {
          id: 'tree_a',
          title: '联合革委会（Tree A · 王照凯）',
          type: 'route',
          story: '争取地区后，可通过食堂后勤、B3防务或临时约法提高支持与稳定。完成「反渗透与暗夜戒备」通常会留下守备；第18天起，失守至少4区、稳定低于35，且试卷≤140或支持低于32时可主动转线；也可继续走命运的十字路口。',
          children: [
            { id: 'committee_authority', title: '民主派争权', type: 'crisis', req: '首次解锁大会时必定出现；后续按派系与同盟状态形成，结束后冷却15天', story: '到期潘派从其他派系转入1–3席、集权降低5、团结小幅变化。潘派达到40席，或集权降至25以下，或团结≥80且集权≤40可抑制后续争权；首次危机保留首日反馈。' },
            {
              id: 'crisis_wu',
              title: '吴福军最后通牒',
              type: 'crisis',
              req: '至少5个建筑区控制度 <45%，且稳定度 <35；倒计时12天',
              story: '失守建筑区少于5个，或稳定达到35时撤回；收到通牒可提前转线。革委会阶段超时必须在铁腕与绝望两线中选择。',
              children: [
                {
                  id: 'wu_route',
                  title: '铁腕时代「吴福军镇压线」（校方视角）',
                  type: 'route',
                  story: '你扮演封安宝与吴福军，戒严地图上清剿“革命残党细胞”。残党实力/戒严等级/封校长信任/吴福军野心/学生愤怒/教师支持/舆论压力/谈判进度八项参数，另有专属戒严指挥部控制台与《午夜清场》小游戏。',
                  children: [
                    {
                      id: 'wu_p1',
                      title: '一阶段：铁腕 / 怀柔 / 野心 三支线',
                      type: 'route',
                      story: '戒严、怀柔与安保扩权可分别推进。年度叙职按结算前数值判定：舆论≤35、残党≤55且愤怒≤60获提名；舆论≥55或残党≥70限期整改；其余为不置可否。',
                      children: [
                        {
                          id: 'wu_p2_feng',
                          title: '秩序元年（模范校提名 → praise）',
                          type: 'route',
                          story: '授牌后可推进范式白皮书与学生督导团。校规法治化后处理吴福军去留，再改写校史馆或推进千年大计。',
                          children: [
                            { id: 'wu_end_feng', title: '连任千年', type: 'ending', endingId: 'game_over_feng_millennium', req: '完成「千年大计」（野心<50 / 愤怒<45 / 舆论<45，与合一之春线共享）', story: '校长任期改为“无固定期限”，一千年的题海开始涨潮。' },
                          ],
                        },
                        {
                          id: 'wu_p2_spring',
                          title: '合一之春（限期整改 → reprimand）',
                          type: 'route',
                          story: '督导组进驻，吴福军被当众羞辱。权力边界审查、整改、忠诚与背叛的抉择。',
                          children: [
                            { id: 'wu_end_spring', title: '合一之春', type: 'ending', endingId: 'game_over_hefei_spring', req: '「忠诚与背叛」：野心 = 100 且 封校长信任 < 40', story: '一声闷响。封安宝倒在行政楼走廊，吴福军被带走，冻结的校园缓慢苏醒。' },
                            { id: 'wu_end_compromise', title: '妥协与平静', type: 'ending', endingId: 'compromise', req: '完成「雨夜的弃子算盘」和「与残党接触」，谈判进度达100后签署和平协议', story: '怀柔路线走到尽头。学生回到教室，老师们重新拿起教鞭。' },
                            { id: 'wu_end_feng2', title: '连任千年', type: 'ending', endingId: 'game_over_feng_millennium', req: '「降级留任」后完成共享节点「千年大计」', story: '同上——秩序派路线在整改风暴中幸存后的归宿。' },
                          ],
                        },
                        {
                          id: 'wu_p2_coup',
                          title: '大权在握（不置可否 → neutral）',
                          type: 'route',
                          story: '保安队扩编、先斩后奏权、铁幕校规、犁庭扫穴——吴福军在自己的野心之路上狂奔。',
                          children: [
                            { id: 'wu_end_coup', title: '十二·十二夜', type: 'ending', endingId: 'game_over_wu_coup', req: '完成「接管总机与校园广播」及两项旧前置之一；野心达100、封安宝信任≥40', story: '2023年12月12日夜，护校队封锁全校。吴福军站上升旗台，宣布校园一切事务由护校队司令部统一指挥。' },
                          ],
                        },
                        { id: 'wu_fail', title: '升学率雪崩', type: 'ending', endingId: 'game_over_anarchy', req: '失败路径：残党实力 = 100', story: '铁腕失守，戒严彻底崩溃。' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'crisis_jidi',
              title: '及第资本夺权',
              type: 'crisis',
              req: '稳定度 < 50 且 资本渗透 > 60 · 30天倒计时（资本渗透降至 ≤ 60 可化解）',
              story: '及第教育对校园的渗透突破临界点。到期 → 及第企业线。',
              children: [
                {
                  id: 'jidi_route',
                  title: '及第企业线「赛博朋克象牙塔」',
                  type: 'route',
                  story: '你替及第资本经营一所“企业学校”：考核指标、效率面板、部门管理，把学校改造成提分生产线。',
                  children: [
                    { id: 'jidi_end_1', title: '及第帝国', type: 'ending', endingId: 'game_over_jidi_1', req: '完成「及第企业乌托邦」', story: '封安祥看着完美到虚假的报表，手在不受控制地颤抖——这根本不是教育。' },
                    { id: 'jidi_end_2', title: '及第梦一场', type: 'ending', endingId: 'game_over_jidi_2', req: '完成「合一暴乱」', story: '压榨到极限的学生跳楼了。企业学校实验以最惨烈的方式破产，但全国新的“及第”仍在诞生。' },
                  ],
                },
              ],
            },
            {
              id: 'crisis_gx',
              title: '内奸？？（狗熊政变危机）',
              type: 'crisis',
              req: '稳定度 < 30 且 学生理智 < 30 且 狗熊在任顾问 · 15天倒计时（条件恢复可化解）',
              story: '狗熊在暗中串联二次元地下势力。到期 → 狗熊公开分裂，建立“地上天国”。',
              children: [
                {
                  id: 'gx_route',
                  title: '狗熊线「赛博娱乐大统领」',
                  type: 'route',
                  story: '你成为狗熊：白天在礼堂放映番剧搞“赛博解构”，夜晚用Galgame式私聊周旋于四个“女主”之间——但她们的真实身份，是隐忍一年的复仇者。理智度与好感度决定一切。',
                  children: [
                    {
                      id: 'gx_trial',
                      title: '达璧的决意（三线判定）',
                      type: 'branch',
                      req: '天台之夜，依 四角色总好感 / 达璧好感 vs 狗熊理智度 判定',
                      story: '复仇之网收束之夜。三个互斥结局链：',
                      children: [
                        {
                          id: 'gx_ruin',
                          title: '天国永存线',
                          type: 'route',
                          isNew: true,
                          req: '四角色总好感 < 30（谁都没能靠近狗熊）',
                          story: '除虫行动因证据与布防情报不足而流产。复仇之刀举到半空，发现猎物根本不在现实里。搁浅的复仇 → 永不停播的天国 → 废墟的奠基 → 天国之门永久关闭。',
                          children: [
                            { id: 'gx_end_ruin', title: '永恒的赛博废墟', type: 'ending', endingId: 'game_over_gouxiong', isNew: true, story: '很多年后，人们只记得“那个有动漫节的学校”。没有高考，没有未来，只有无尽的二次元狂欢。' },
                          ],
                        },
                        {
                          id: 'gx_embarrass',
                          title: '丢人现眼线',
                          type: 'route',
                          req: '达璧好感 > 狗熊理智度，或 理智度 ≤ 32',
                          story: '狗熊掉进复仇陷阱，一年前的性骚扰录音响彻全校夜空。处刑广播 → 孤家寡人 → 除虫行动收网 → 校方闪电接管。',
                          children: [
                            { id: 'gx_end_embarrass', title: '公开处刑日', type: 'ending', endingId: 'game_over_gouxiong_embarrass', story: '他被挂上“性骚扰犯”的牌子游街，被扫进历史的焚尸炉。' },
                          ],
                        },
                        {
                          id: 'gx_redeem',
                          title: '浪子回头线',
                          type: 'route',
                          req: '其余情况（达璧好感 ≤ 理智度 且 理智度 > 32，总好感 ≥ 30）',
                          story: '狗熊在最后关头惊醒，冲进B3负荆请罪。负荆请罪 → 天国与公社合流 → 断后卒 → 并入钢铁红蛤。',
                          children: [
                            { id: 'gx_end_redeem', title: '并轨后的黎明', type: 'ending', endingId: 'game_over_gouxiong_redeem', story: '狗熊不再是失控的变量，而是被制度约束后仍能发挥作用的执行者。' },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'crisis_alliance',
              title: '联盟濒临瓦解',
              type: 'crisis',
              req: '党内集权 > 90 且 联盟团结 < 25 · 15天倒计时',
              story: '联盟从内部崩解。到期 → 无政府状态，直接失败。',
              children: [{ id: 'end_alliance', title: '升学率雪崩', type: 'ending', endingId: 'game_over_anarchy', story: '新的秩序并未建立，校园陷入无休止的混乱与派系斗争。' }],
            },
            {
              id: 'crisis_midnight',
              title: '子夜？（合一的毁灭）',
              type: 'crisis',
              req: '稳定度 ≤ 0 且 TPR ≤ 0 · 30天倒计时',
              story: '秩序与资源同时枯竭，万劫不复的深渊。到期 → 合一的毁灭。',
              children: [{ id: 'end_midnight', title: '合一的毁灭', type: 'ending', endingId: 'game_over_midnight', story: '没有分数作为支撑，也没有了维持运转的稳定，一切灰飞烟灭。' }],
            },
            {
              id: 'fail_green',
              title: '地图斗争失败：升学率雪崩',
              type: 'crisis',
              req: '绿区 ≥ 5（≥5建筑学生控制 > 55%）且 TPR ≤ 0 且 稳定度 < 30',
              story: '地盘赢了、题却没做。自由了，然后呢？即刻失败（铁腕时代/狗熊线/杨玉乐线免疫此判定）。',
              children: [{ id: 'end_green', title: '升学率雪崩', type: 'ending', endingId: 'game_over_anarchy', story: '曾经的做题家们在迷茫中徘徊，他们得到了自由，却失去了未来。' }],
            },
            {
              id: 'crossroads',
              title: '命运的十字路口',
              type: 'branch',
              req: '完成「整顿校内秩序」后选择；十字路口事件确认时依席位、团结、集权按顺序判定',
              story: '革委会的总分岔点。先判断民主与真左，再判断和解，最后检查三种失控结果；和解后可选择主导路线。',
              children: [
                {
                  id: 'route_pan',
                  title: '潘仁越民主线（自由派）',
                  type: 'route',
                  req: CROSSROADS_RULES[0],
                  story: '温和民主路线：学生议会、法案博弈、派系拉拢。潘仁越要在一群“精致利己主义者与做题机器”中建立真正的民主。',
                  children: [
                    { id: 'pan_reclaim', title: '重拾民主', type: 'branch', req: '完成扩大大会与民主改革；全校15个地区实际控制度均达到100%', story: '手动地区行动和工作组共用地区控制。表面四舍五入接近100不算完成，剩余地区可在当前进度中查看；完成此国策后地图斗争结束。' },
                    { id: 'pan_slander', title: '反对派抹黑', type: 'crisis', req: '民主路线已解锁大会、学生理智<70且潘派<40席', story: '恢复理智或扩大潘派可化解；到期稳定与团结各降低10，随后冷却15天。此危机不用于革委会或其他路线。' },
                    {
                      id: 'pan_election',
                      title: '第一次民主普选',
                      type: 'branch',
                      req: '完成「民主的胜利」（通过 ≥3 法案 + 议会权力平衡 ≤30（素质教育方向） + 学生理智 > 80）后开启，60天大选；各派工作组每五天转移宣传地区',
                      story: '合肥一中历史上第一次普选。票数决定五大执政结局，而金线玩家在此迎来王潘的最终考验。',
                      children: [
                        { id: 'pan_end_golden', title: '合一大革命', type: 'golden', endingId: 'true_left_good', isNew: true, req: '持有《王潘和解协定》且 潘派 > 25 且 正统派 > 25 且 团结 > 60', story: '大选落幕，两个声音同时在广播站响起。纪律与自由不再互为敌人。' },
                        { id: 'pan_end_1', title: '民主的胜利', type: 'ending', endingId: 'game_over_pan', story: '潘仁越胜选，两代人的黎明。' },
                        { id: 'pan_end_2', title: '钢铁红蛤的复兴', type: 'ending', endingId: 'game_over_wang', story: '王照凯胜选，正统派的胜利。' },
                        { id: 'pan_end_3', title: '自由的狂欢', type: 'ending', endingId: 'game_over_bear', story: '狗熊胜选，最快乐的青春时光。' },
                        { id: 'pan_end_4', title: '中道之胜', type: 'ending', endingId: 'game_over_xu', story: '徐志胜选——“我们是不是选上台了另一个封安宝？”' },
                        { id: 'pan_end_5', title: '内卷的回归', type: 'ending', endingId: 'game_over_juanhao', story: '王卷豪胜选，模拟考和自习室重新成为主旋律。' },
                      ],
                    },
                    {
                      id: 'pan_despair',
                      title: '校方反攻与B3围城',
                      type: 'crisis',
                      req: '试卷储备≤140且学生支持<32，倒计时18天；也可从革委会暗夜抉择直接进入',
                      story: '围城路线有配给、递药和六校电报三条准备线。完成「焚烧量化黑账」「B3通风管的暗语」「向围墙外喊话」后可进保卫战。',
                      children: [
                        { id: 'despair_end_1', title: 'B3保卫战胜利', type: 'ending', endingId: 'game_over_victory', req: '保卫战守住B3，再完成「绝地反击」与「焦土上的黎明」', story: '红旗未倒。这只是一个开始，但已经证明了学生的力量。' },
                        { id: 'despair_end_2', title: '绝望的终局', type: 'ending', endingId: 'game_over_despair', req: '完成「最后的防线崩溃」国策', story: '保卫战失守，抵抗军从楼梯间退上天台。最后一段广播之后，防线彻底瓦解。' },
                        { id: 'despair_end_3', title: '升学率雪崩', type: 'ending', endingId: 'game_over_anarchy', req: '旧版已结算存档的结果；新版失守后继续「天台上的最后广播」', story: '保安队突破防线，红旗被拔除，吴福军宣布全面军管。' },
                      ],
                    },
                  ],
                },
                {
                  id: 'route_true_left',
                  title: '王照凯真左线（正统派）',
                  type: 'route',
                  req: CROSSROADS_RULES[1],
                  story: '王照凯的原教旨路线：红蛤政治局、做题改革。一场触及灵魂的大革命——成功与否，决定合一走向何方。',
                  children: [
                    {
                      id: 'reform_success',
                      title: '做题改革成功',
                      type: 'branch',
                      req: '题改进度 = 100（150天危机内）→ 完成「真左派大团结」国策',
                      story: '改革落地。金线玩家在此迎来最终考验，否则进入豪邦自社线。',
                      children: [
                        { id: 'tl_end_golden', title: '合一大革命', type: 'golden', endingId: 'true_left_good', isNew: true, req: '持有《王潘和解协定》且 团结 > 60 且 集权 ≤ 70 且 潘派 > 25', story: '做题改革成功的那天，王照凯与潘仁越共握同一杆麦克风。' },
                        {
                          id: 'route_haobang',
                          title: '豪邦自社线',
                          type: 'route',
                          story: '豪邦的左翼大帐篷：公社建设、代表大会升级、政治局联合委员会的制度合流。',
                          children: [
                            { id: 'hb_end', title: '路线新生', type: 'ending', endingId: 'game_over_haobang', req: '完成公社/议会/遗产三大路线并合流', story: '剑收进了剑鞘，但它依然保护着合一。晚安，合一；早安，明天。' },
                          ],
                        },
                      ],
                    },
                    {
                      id: 'reform_fail',
                      title: '做题改革失败',
                      type: 'crisis',
                      req: '改革危机倒计时（150天）到期',
                      story: '“江南十校联考”压垮了互助组，绝密押题卷丑闻爆发。吕波汉与狗熊发动政变。',
                      children: [
                        {
                          id: 'route_lu',
                          title: '吕波汉极权线（N.K.P.D.）',
                          type: 'route',
                          story: '肃反委员会的政治保卫体系：六大区域清洗、命令链治理。做题蛆的时代结束了——以最极端的方式。',
                          children: [
                            { id: 'lu_end', title: '唯一的舵手', type: 'ending', endingId: 'game_over_lu_sole_helmsman', req: '完成清洗主线', story: '吕波汉独自坐在用同学骨骸堆砌的王座上，他已是全校唯一有资格做题的人。' },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'golden_path',
                  title: '王潘和解协定（金线）',
                  type: 'golden',
                  isNew: true,
                  req: CROSSROADS_RULES[2],
                  story: '两派势均力敌、不偏不倚时的第三种答案：王照凯与潘仁越签署《王潘和解协定》（团结 +0.3/日、集权 -0.2/日），玩家自选进入真左线或自由派线继续游戏。结局不在十字路口——必须一路维持两派均衡，到各自路线终盘（大选落幕 / 做题改革成功）才能达成「合一大革命」。',
                },
                { id: 'x_end_awakening', title: '大梦初醒', type: 'ending', endingId: 'great_awakening', req: '团结 < 40 且 集权 > 80', story: '确认终局前置事件后结算。钢铁红蛤的铁腕压碎一切反对声音——包括曾经的战友。' },
                { id: 'x_end_mediocrity', title: '平庸之乐', type: 'ending', endingId: 'pleasure_of_mediocrity', req: '集权 < 40', story: '确认终局前置事件后结算。短暂的狂热后向现实低头。一模的惨败让所有人明白：没有分数，他们什么都不是。' },
                { id: 'x_end_usurpation', title: '狗熊篡权', type: 'ending', endingId: 'gouxiong_usurpation', req: '其余情况（默认）', story: '读完终局前置事件并确认后结算。两派无休止争斗中，二次元缝合怪趁虚而入夺取最高权力。' },
              ],
            },
          ],
        },
      ],
    },
  ],
};
