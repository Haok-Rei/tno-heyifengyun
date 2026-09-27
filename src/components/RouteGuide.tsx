import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Flag, AlertTriangle, Sparkles, Route as RouteIcon, ScrollText } from 'lucide-react';
import { ENDING_BY_ID, IMPLEMENTED_ENDING_COUNT } from '../data/endings';

/**
 * RouteGuide.tsx (v8.7) — 可分级展开的思维导图式路线指南
 *
 * 数据为树形结构，覆盖当前版本全部路线/分歧点/危机/结局：
 * - branch 节点：分歧点，标注触发要求
 * - route  节点：路线，标注剧情梗概
 * - crisis 节点：危机倒计时
 * - ending 节点：结局，引用 ENDING_BY_ID 的官方标题/配色/描述
 */

type GuideNodeType = 'root' | 'branch' | 'route' | 'crisis' | 'ending' | 'info' | 'golden';

interface GuideNode {
  id: string;
  title: string;
  type: GuideNodeType;
  req?: string;       // 分歧点要求 / 达成条件
  story?: string;     // 剧情梗概
  endingId?: string;  // 结局 id（关联 endings.ts）
  note?: string;      // 补充说明
  isNew?: boolean;    // v8.7 新增标记
  children?: GuideNode[];
}

// ============================================================
// 路线数据（2026-08 v8.7 全量梳理）
// ============================================================
const ROUTE_TREE: GuideNode = {
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
      req: '激进愤怒度 ≥ 70 或 学生支持度 ≥ 80',
      story: '联合革委会起义的起点。国策完成瞬间决定三条去向，同时决定杨玉乐线能否解锁。',
      children: [
        {
          id: 'yang_yule_entry',
          title: '杨玉乐线「名师工作室」',
          type: 'route',
          req: '攻下B3后：稳定度 < 35 且 杨玉乐在任顾问（每日判定）→ 攻下B3满10天解锁「杨特出山」决议（消耗20 SS）',
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
          story: '革命胜利但群龙无首。此阶段是全校最大分歧场：地图斗争 + 四大危机 + 命运十字路口，几乎所有路线都在这里分叉。',
          children: [
            {
              id: 'crisis_wu',
              title: '吴福军最后通牒',
              type: 'crisis',
              req: '红区 ≥ 5（6建筑中≥5个学生控制 < 45%）且 稳定度 < 30 · 15天倒计时',
              story: '可化解（恢复条件即撤回通牒）也可反复触发。到期不解决 → 吴福军总攻，视角翻转为校方。',
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
                      story: '11个国策收束于唯一节点「封安宝的年度叙职」，按 舆论压力/残党实力/学生愤怒 判定三档结果，进入三条互斥路线。',
                      children: [
                        {
                          id: 'wu_p2_feng',
                          title: '秩序元年（模范校提名 → praise）',
                          type: 'route',
                          story: '封安宝的完美答卷：模范校授牌 → 校规法治化 → 吴福军转岗或教育局背书 → 千年大计。',
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
                            { id: 'wu_end_compromise', title: '妥协与平静', type: 'ending', endingId: 'compromise', req: '「与残党接触」推进和平协议：谈判进度 = 100', story: '怀柔路线走到尽头。学生回到教室，老师们重新拿起教鞭。' },
                            { id: 'wu_end_feng2', title: '连任千年', type: 'ending', endingId: 'game_over_feng_millennium', req: '「降级留任」后完成共享节点「千年大计」', story: '同上——秩序派路线在整改风暴中幸存后的归宿。' },
                          ],
                        },
                        {
                          id: 'wu_p2_coup',
                          title: '大权在握（不置可否 → neutral）',
                          type: 'route',
                          story: '保安队扩编、先斩后奏权、铁幕校规、犁庭扫穴——吴福军在自己的野心之路上狂奔。',
                          children: [
                            { id: 'wu_end_coup', title: '十二·十二夜', type: 'ending', endingId: 'game_over_wu_coup', req: '「十二·十二」：野心 = 100 且 封校长信任 ≥ 40', story: '2023年12月12日夜，护校队封锁全校。吴福军站上升旗台，宣布校园一切事务由护校队司令部统一指挥。' },
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
              req: '国策「命运的十字路口」完成时，依 派系席位 / 联盟团结 / 党内集权 六路判定',
              story: 'Tree A 的总分岔点。同一场扩大会议上，七种结局互斥展开：',
              children: [
                {
                  id: 'route_pan',
                  title: '潘仁越民主线（自由派）',
                  type: 'route',
                  req: '潘派席位 > 30 且 团结 > 70 且 集权 < 30',
                  story: '温和民主路线：学生议会、法案博弈、派系拉拢。潘仁越要在一群“精致利己主义者与做题机器”中建立真正的民主。',
                  children: [
                    {
                      id: 'pan_election',
                      title: '第一次民主普选',
                      type: 'branch',
                      req: '完成「民主的胜利」（通过 ≥3 法案 + 权力平衡偏素质教育 ≥ 20% + 学生理智 > 80）后开启，30天大选',
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
                      title: '校方反攻？（绝望分支）',
                      type: 'crisis',
                      req: 'TPR ≤ 0 且 学生支持 < 30 · 30天倒计时',
                      story: '民主失能，校方保安队与及第雇佣兵反扑。到期 → 绝望的走廊巷战。',
                      children: [
                        { id: 'despair_end_1', title: 'B3保卫战胜利', type: 'ending', endingId: 'game_over_victory', req: '死守B3小游戏获胜', story: '红旗未倒。这只是一个开始，但已经证明了学生的力量。' },
                        { id: 'despair_end_2', title: '绝望的终局', type: 'ending', endingId: 'game_over_despair', req: '完成「最后的防线崩溃」国策', story: '潘仁越和抵抗军被镇压，抗争最终只是一场徒劳的悲剧。' },
                        { id: 'despair_end_3', title: '升学率雪崩', type: 'ending', endingId: 'game_over_anarchy', req: '死守B3小游戏失败', story: '保安队突破防线，红旗被拔除，吴福军宣布全面军管。' },
                      ],
                    },
                  ],
                },
                {
                  id: 'route_true_left',
                  title: '王照凯真左线（正统派）',
                  type: 'route',
                  req: '正统派席位最高 且 团结 > 70 且 集权 > 60',
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
                  req: '潘派 > 25 且 正统派 > 25 且 团结 > 60 且 集权 30 ~ 70',
                  story: '两派势均力敌、不偏不倚时的第三种答案：王照凯与潘仁越签署《王潘和解协定》（团结 +0.3/日、集权 -0.2/日），玩家自选进入真左线或自由派线继续游戏。结局不在十字路口——必须一路维持两派均衡，到各自路线终盘（大选落幕 / 做题改革成功）才能达成「合一大革命」。',
                },
                { id: 'x_end_awakening', title: '大梦初醒', type: 'ending', endingId: 'great_awakening', req: '团结 < 40 且 集权 > 80', story: '钢铁红蛤的铁腕压碎一切反对声音——包括曾经的战友。' },
                { id: 'x_end_mediocrity', title: '平庸之乐', type: 'ending', endingId: 'pleasure_of_mediocrity', req: '集权 < 40', story: '短暂的狂热后向现实低头。一模的惨败让所有人明白：没有分数，他们什么都不是。' },
                { id: 'x_end_usurpation', title: '狗熊篡权', type: 'ending', endingId: 'gouxiong_usurpation', req: '其余情况（默认）', story: '两派无休止争斗中，二次元缝合怪趁虚而入夺取最高权力。' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// ============================================================
// 组件
// ============================================================

const TYPE_STYLE: Record<GuideNodeType, { icon: React.ReactNode; label: string; titleClass: string; badgeClass: string }> = {
  root: { icon: <ScrollText className="w-3.5 h-3.5" />, label: '开局', titleClass: 'text-white', badgeClass: 'bg-zinc-700 text-zinc-200' },
  branch: { icon: <Flag className="w-3.5 h-3.5" />, label: '分歧点', titleClass: 'text-amber-300', badgeClass: 'bg-amber-500/15 text-amber-300 border border-amber-500/40' },
  route: { icon: <RouteIcon className="w-3.5 h-3.5" />, label: '路线', titleClass: 'text-cyan-300', badgeClass: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40' },
  crisis: { icon: <AlertTriangle className="w-3.5 h-3.5" />, label: '危机', titleClass: 'text-red-400', badgeClass: 'bg-red-500/15 text-red-400 border border-red-500/40' },
  ending: { icon: <Sparkles className="w-3.5 h-3.5" />, label: '结局', titleClass: 'text-tno-highlight', badgeClass: 'bg-tno-highlight/15 text-tno-highlight border border-tno-highlight/40' },
  info: { icon: <ChevronRight className="w-3.5 h-3.5" />, label: '提示', titleClass: 'text-zinc-400', badgeClass: 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/40' },
  golden: { icon: <Sparkles className="w-3.5 h-3.5" />, label: '金线', titleClass: 'text-yellow-300', badgeClass: 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/50' },
};

function GuideTreeNode({ node, depth, expanded, onToggle }: {
  node: GuideNode;
  depth: number;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  key?: string;
}) {
  const hasChildren = !!node.children?.length;
  const isOpen = expanded[node.id] ?? true;
  const style = TYPE_STYLE[node.type];
  const ending = node.endingId ? ENDING_BY_ID[node.endingId] : undefined;

  return (
    <div className="relative">
      <div className={`group ${depth > 0 ? 'ml-4 border-l border-zinc-700/60 pl-3' : ''}`}>
        {/* 节点头 */}
        <div className="flex items-start gap-2 py-0.5">
          <button
            onClick={() => hasChildren && onToggle(node.id)}
            className={`mt-0.5 shrink-0 text-zinc-500 hover:text-tno-highlight transition-colors ${hasChildren ? 'cursor-pointer' : 'cursor-default opacity-0'}`}
            aria-label={isOpen ? '折叠' : '展开'}
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${style.badgeClass}`}>
                {style.icon}{style.label}
              </span>
              <span className={`font-bold text-sm leading-tight ${ending ? ending.color : style.titleClass}`}>
                {ending ? ending.title : node.title}
              </span>
              {node.isNew && <span className="rounded bg-yellow-400/20 px-1 text-[9px] font-bold text-yellow-300 border border-yellow-400/50">v8.7新</span>}
            </div>
            {ending && <div className="mt-0.5 text-[11px] text-zinc-400">{ending.subtitle}</div>}
            {node.req && (
              <div className="mt-1 text-[11px] leading-relaxed text-amber-200/85">
                <span className="font-bold text-amber-300">要求 · </span>{node.req}
              </div>
            )}
            {node.story && <div className="mt-1 text-[11px] leading-relaxed text-zinc-400">{node.story}</div>}
            {node.note && <div className="mt-1 text-[11px] leading-relaxed text-zinc-500">{node.note}</div>}
          </div>
        </div>

        {/* 子节点 */}
        {hasChildren && isOpen && (
          <div className="mt-1 space-y-0.5">
            {node.children!.map(child => (
              <GuideTreeNode key={child.id} node={child} depth={depth + 1} expanded={expanded} onToggle={onToggle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RouteGuide() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const collectIds = (node: GuideNode, acc: string[] = []): string[] => {
    acc.push(node.id);
    node.children?.forEach(c => collectIds(c, acc));
    return acc;
  };

  const expandAll = () => {
    const all = {};
    collectIds(ROUTE_TREE).forEach(id => { (all as Record<string, boolean>)[id] = true; });
    setExpanded(all);
  };
  const collapseAll = () => {
    // 保留根节点展开，其余折叠
    const all: Record<string, boolean> = { [ROUTE_TREE.id]: true };
    setExpanded(all);
  };

  return (
    <div className="flex h-full flex-col">
      {/* 工具栏 + 图例 */}
      <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-zinc-700/60 pb-3">
        <div className="flex gap-1.5">
          <button onClick={expandAll} className="border border-zinc-600 px-2 py-1 text-[11px] font-bold text-zinc-300 hover:border-tno-highlight hover:text-tno-highlight transition-colors">
            全部展开
          </button>
          <button onClick={collapseAll} className="border border-zinc-600 px-2 py-1 text-[11px] font-bold text-zinc-300 hover:border-tno-highlight hover:text-tno-highlight transition-colors">
            全部折叠
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-400">
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/40">⚑ 分歧点</span>
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-cyan-500/15 text-cyan-300 border border-cyan-500/40">◈ 路线</span>
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-red-500/15 text-red-400 border border-red-500/40">⚠ 危机</span>
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-tno-highlight/15 text-tno-highlight border border-tno-highlight/40">✦ 结局</span>
          <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-yellow-500/15 text-yellow-300 border border-yellow-500/50">✦ 金线</span>
          <span className="ml-auto font-mono text-[10px] text-zinc-500">v8.7 全量路线 · {IMPLEMENTED_ENDING_COUNT}个可解锁结局</span>
        </div>
      </div>

      {/* 思维导图树 */}
      <div className="flex-1 overflow-y-auto pr-2">
        <GuideTreeNode node={ROUTE_TREE} depth={0} expanded={expanded} onToggle={(id) => setExpanded(prev => ({ ...prev, [id]: !(prev[id] ?? true) }))} />
      </div>
    </div>
  );
}
