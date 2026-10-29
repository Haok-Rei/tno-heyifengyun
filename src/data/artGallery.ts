/** CG requirements are independent of gallery visits and never alter campaign state. */
export type ArtRoute = '校园' | '序章' | '联合革命' | '做题改革' | 'N.K.P.D.' | '民主与豪邦' | '及第' | '杨玉乐' | '狗熊' | '吴福军' | '绝望' | '终局';
export interface Artwork {
  name: string;
  route: ArtRoute;
  note: string;
  unlockHint: string;
  trees?: string[];
  focuses?: string[];
  events?: string[];
  endings?: string[];
  routeTags?: string[];
  opening?: boolean;
  sensitive?: boolean;
  scenery?: boolean;
}

export const ARTWORKS: Artwork[] = [
  { name:'合一足球', route:'校园', note:'校园足球 · 绿茵时光', unlockHint:'初始开放', scenery:true },
  { name:'陈栋与封安宝', route:'序章', note:'陈栋与封安宝 · 校园旧影', unlockHint:'体验序章', opening:true },
  { name:'陈栋与封安宝2', route:'序章', note:'校友座谈 · 陈栋与封安宝', unlockHint:'体验序章', opening:true },
  { name: '滨湖晨光', route: '校园', note: '滨湖校门 · 秋晨', unlockHint: '初始开放', scenery: true },
  { name: '端馥晚照', route: '校园', note: '端馥堂 · 放学之后', unlockHint: '初始开放', scenery: true },
  { name: '雨过校门', route: '校园', note: '滨湖校门 · 雨后的归途', unlockHint: '初始开放', scenery: true },
  { name: '图书长廊', route: '校园', note: '图书馆 · 书架间的午后', unlockHint: '初始开放', scenery: true },
  { name: '操场晚晴', route: '校园', note: '滨湖操场 · 雨歇日落', unlockHint: '初始开放', scenery: true },
  { name: '梧桐秋径', route: '校园', note: 'B2楼前 · 秋日小亭', unlockHint: '初始开放', scenery: true },
  { name: 'B3夜读', route: '校园', note: 'B3教学楼 · 未熄的灯', unlockHint: '初始开放', scenery: true },
  { name: '行政楼', route: '序章', note: '校方体制 · 行政楼', unlockHint: '体验序章', opening: true, sensitive: true },
  { name: '军训', route: '序章', note: '军训季 · 队列', unlockHint: '体验序章', opening: true, sensitive: true },
  { name: '陈栋', route: '序章', note: '校长肖像', unlockHint: '体验序章', opening: true },
  { name: '陈栋与合一', route: '序章', note: '校长与校园', unlockHint: '体验序章', opening: true, sensitive: true },
  { name: 'B3革命', route: '联合革命', note: 'B3教学楼 · 起义', unlockHint: '经历B3起义', trees: ['treeA'], focuses: ['charge_b3'], events: ['b3_uprising'], routeTags: ['联合革命线'], sensitive: true },
  { name: '红色风暴', route: '联合革命', note: '联合革命委员会 · 新的校园', unlockHint: '进入联合革命委员会阶段', trees: ['treeA'], routeTags: ['联合革命线'], sensitive: true },
  { name: '批斗', route: '联合革命', note: '公审杨玉乐', unlockHint: '完成公审杨玉乐国策', focuses: ['trial_yang'], events: ['event_8_trial'], sensitive: true },
  { name: '合一文革', route: '做题改革', note: '做题改革 · 超事件', unlockHint: '进入做题改革路线', trees: ['treeA_true_left'], events: ['true_left_reform_super'], routeTags: ['做题改革线'], endings: ['true_left_good'], sensitive: true },
  { name: '合一文革2', route: 'N.K.P.D.', note: '极权派上台 · 超事件', unlockHint: '进入N.K.P.D.路线', trees: ['treeA_lu_bohan'], events: ['lu_authoritarian_super'], routeTags: ['N.K.P.D.线'], endings: ['great_awakening', 'game_over_lu_sole_helmsman'], sensitive: true },
  { name: '合一之春', route: '民主与豪邦', note: '豪邦路线 · 改革与和解', unlockHint: '进入豪邦路线', trees: ['treeA_haobang', 'treeA_haobang_pre'], events: ['haobang_rise_super'], routeTags: ['豪邦线'], endings: ['game_over_haobang'], sensitive: true },
  { name: '合一之春2', route: '民主与豪邦', note: '民主与和解 · 超事件', unlockHint: '进入民主路线，或见证校园和解的结局', trees: ['treeA_pan'], events: ['first_democratic_election_super', 'gx_redeem_super'], routeTags: ['民主选举线'], endings: ['game_over_pan', 'game_over_xu', 'game_over_wang', 'game_over_juanhao', 'game_over_gouxiong_redeem', 'game_over_hefei_spring'], sensitive: true },
  { name: '及第之梦', route: '及第', note: '及第路线 · 企业学校', unlockHint: '进入及第路线', trees: ['jidi_tree'], routeTags: ['及第线'], endings: ['game_over_jidi_1', 'game_over_jidi_2'] },
  { name: '内卷', route: '及第', note: '及第路线 · 暴动', unlockHint: '经历及第暴乱', focuses: ['jidi_hidden_riot'], events: ['jidi_riot_super'], endings: ['game_over_jidi_2'] },
  { name: '特级教师', route: '杨玉乐', note: '杨玉乐路线 · 办公桌', unlockHint: '进入杨玉乐路线', trees: ['treeB'], routeTags: ['杨玉乐线'], endings: ['game_over_yang_yule_success'] },
  { name: '特级', route: '杨玉乐', note: '名师的加冕 · 结局差分', unlockHint: '见证杨玉乐职称评定成功', events: ['yang_yule_success', 'yang_yule_success_event'], endings: ['game_over_yang_yule_success'], sensitive: true },
  { name: '特级0', route: '杨玉乐', note: '功亏一篑 · 结局差分', unlockHint: '见证杨玉乐职称评定失败', events: ['yang_yule_fail', 'yang_yule_fail_event'], sensitive: true },
  { name: '裤熊逢春', route: '狗熊', note: '艺术礼堂 · 新秩序', unlockHint: '进入狗熊路线', trees: ['gouxiong_tree'], events: ['gx_auditorium_split_super'], routeTags: ['狗熊线'], endings: ['gouxiong_usurpation', 'game_over_gouxiong_embarrass', 'game_over_gouxiong_redeem', 'game_over_gouxiong'] },
  { name: '校园涂鸦1', route: '狗熊', note: '永恒的赛博废墟 · 结局差分', unlockHint: '见证狗熊路线的赛博废墟结局', events: ['gx_ruin_super'], focuses: ['gx_ruin_settlement'], endings: ['game_over_gouxiong'] },
  { name: '校园涂鸦2', route: '狗熊', note: '丢人现眼 · 结局差分', unlockHint: '见证狗熊路线的公开处刑结局', events: ['gx_embarrass_super'], focuses: ['gx_embarrass_settlement'], endings: ['game_over_gouxiong_embarrass'] },
  { name: '清场', route: '吴福军', note: '铁腕时代 · 超事件', unlockHint: '进入吴福军的铁腕时代', trees: ['wu_tree', 'wu_tree_p2_feng', 'wu_tree_p2_spring', 'wu_tree_p2_coup'], events: ['wu_crackdown'], routeTags: ['铁腕时代', '秩序元年', '风暴前夕', '大权在握'], endings: ['compromise', 'game_over_feng_millennium', 'game_over_hefei_spring', 'game_over_wu_coup'], sensitive: true },
  { name: '封安宝时代', route: '终局', note: '校方体制 · 终局', unlockHint: '经历全面镇压或连任千年的结局', events: ['game_over_school'], endings: ['game_over_school', 'game_over_feng_millennium'] },
  { name: '合一陨落', route: '终局', note: '校园崩溃 · 终局', unlockHint: '经历升学率雪崩的结局', events: ['game_over_anarchy'], endings: ['game_over_anarchy'] },
  { name: '街垒黎明', route: '联合革命', note: 'B3起义之后 · 校门的第一缕光', unlockHint: '经历B3起义，进入联合革委会阶段', trees: ['treeA'], focuses: ['charge_b3'], events: ['b3_uprising'], routeTags: ['联合革命线'], sensitive: true },
  { name: '油印机之夜', route: '联合革命', note: '地下宣传 · 油墨未干', unlockHint: '完成“地下印刷网络”国策', focuses: ['underground_print'] },
  { name: '议场初开', route: '民主与豪邦', note: '学生代表大会 · 扩大的议场', unlockHint: '完成“扩大学生代表大会”国策', focuses: ['expand_assembly'], events: ['expand_assembly_event'] },
  { name: '第一张选票', route: '民主与豪邦', note: '首次大选 · 投票日', unlockHint: '完成“第一次民主普选”国策', focuses: ['first_democratic_election'], events: ['election_outcome_event'], endings: ['game_over_pan', 'game_over_xu', 'game_over_wang', 'game_over_juanhao'] },
  { name: '课桌上的改革', route: '做题改革', note: '题改工作组 · 新的课堂', unlockHint: '完成“建立新评价体系”国策', focuses: ['reform_focus_3'], endings: ['true_left_good'] },
  { name: '公社的长桌', route: '民主与豪邦', note: '豪邦路线 · 试点公社', unlockHint: '完成“地区公社试点网络”国策', focuses: ['commune_pilot_regions'], events: ['haobang_commune_pilot_event'], endings: ['game_over_haobang'] },
  { name: '名单之外', route: 'N.K.P.D.', note: '清洗时期 · 档案室', unlockHint: '完成“大清洗行动”国策', focuses: ['great_purge_map_phase'], endings: ['great_awakening', 'game_over_lu_sole_helmsman'] },
  { name: '保温杯与红批', route: '杨玉乐', note: '杨玉乐的办公桌 · 深夜批卷', unlockHint: '进入杨玉乐路线', trees: ['treeB'], routeTags: ['杨玉乐线'], endings: ['game_over_yang_yule_success'] },
  { name: '密卷流水线', route: '及第', note: '及第教研部 · 试卷生产', unlockHint: '完成“组建教辅研发部”国策', focuses: ['jidi_rnd_department'], events: ['jidi_rnd_department_event'], endings: ['game_over_jidi_1'] },
  { name: '企业学校的黄昏', route: '及第', note: '企业乌托邦 · 归校与离校', unlockHint: '完成“企业乌托邦”国策，或见证及第帝国结局', focuses: ['jidi_corporate_utopia'], events: ['jidi_empire_super'], endings: ['game_over_jidi_1'] },
  { name: '银幕仍亮', route: '狗熊', note: '艺术礼堂 · 赛博档案', unlockHint: '完成“艺术礼堂争夺战”国策', focuses: ['gx_cyber_archive_war'] },
  { name: '熄灯后的脚步', route: '吴福军', note: '铁腕时代 · 夜间巡查', unlockHint: '完成“夜巡纠察队”国策', focuses: ['wu_night_patrol'] },
  { name: '最后一间教室', route: '绝望', note: '绝望路线 · 空旷的校园', unlockHint: '进入绝望路线', trees: ['treeA_pan_despair'], routeTags: ['绝望线'], endings: ['game_over_despair'] },
  { name: '廊桥课间', route: '校园', note: '教学连廊 · 课间十分钟', unlockHint: '初始开放', scenery: true },
  { name: '教室晨光', route: '校园', note: '第一节课之前', unlockHint: '初始开放', scenery: true },
  { name: '食堂晚灯', route: '校园', note: '食堂 · 晚餐之后', unlockHint: '初始开放', scenery: true },
  { name: '秋雨连廊', route: '校园', note: '秋雨中的归途', unlockHint: '初始开放', scenery: true },
  { name: '退回的联名信', route: '序章', note: '联名信 · 退回教室', unlockHint: '经历“退回的联名信”事件', events: ['phase1_returned_petition'] },
  { name: '课间的争执', route: '序章', note: '扣分表 · 走廊争执', unlockHint: '经历“课间也要计时”事件', events: ['phase1_recess_dispute'] },
  { name: '雪中的来函', route: '杨玉乐', note: '办公桌 · 暴雪预警', unlockHint: '处理暴雪停课来件', events: ['yang_desk_snow_day'] },
  { name: '灯下的协议', route: '联合革命', note: '档案室 · 秘密妥协', unlockHint: '完成“秘密妥协”国策', focuses: ['secret_compromise'], events: ['secret_compromise'] },
  { name: '六十日之约', route: '民主与豪邦', note: '第一次民主普选 · 竞选启幕', unlockHint: '开启第一次民主普选', events: ['start_democratic_election_event', 'first_democratic_election_super'], focuses: ['first_democratic_election'] },
  { name: '春回滨湖', route: '民主与豪邦', note: '豪邦改革 · 校园和解', unlockHint: '见证豪邦改革的超事件', events: ['haobang_rise_super'], endings: ['game_over_haobang'] },
  { name: '价格牌下的风暴', route: '及第', note: '商业校园 · 暴乱', unlockHint: '经历及第暴乱', events: ['jidi_riot_super'], focuses: ['jidi_hidden_riot'], endings: ['game_over_jidi_2'] },
  { name: '总攻前夜', route: '吴福军', note: '铁腕时代 · 命令下达之前', unlockHint: '经历“总攻令”超事件', events: ['wu_crackdown'], sensitive: true },
  { name:'终章·钢铁红蛤的复兴', route:'民主与豪邦', note:'集体主义下的自治会议', unlockHint:'达成“钢铁红蛤的复兴”结局', endings:['game_over_wang'] },
  { name:'终章·自由的狂欢', route:'民主与豪邦', note:'校园社团节', unlockHint:'达成“自由的狂欢”结局', endings:['game_over_bear'] },
  { name:'终章·中道之胜', route:'民主与豪邦', note:'选举之后，秩序如常', unlockHint:'达成“中道之胜”结局', endings:['game_over_xu'] },
  { name:'终章·平庸之乐', route:'联合革命', note:'留在课桌边的选票', unlockHint:'达成“平庸之乐”结局', endings:['pleasure_of_mediocrity'] },
  { name:'终章·连任千年', route:'吴福军', note:'行政会议室里的长桌', unlockHint:'达成“连任千年”结局', endings:['game_over_feng_millennium'] },
  { name:'终章·B3保卫战胜利', route:'联合革命', note:'黎明后的教学楼', unlockHint:'达成“B3保卫战胜利”结局', endings:['game_over_victory'] },
  { name:'终章·大梦初醒', route:'N.K.P.D.', note:'理想凝结为名册与印章', unlockHint:'达成“大梦初醒”结局', endings:['great_awakening'] },
  { name:'终章·升学率雪崩', route:'终局', note:'成绩单前的沉默', unlockHint:'达成“升学率雪崩”结局', endings:['game_over_anarchy'] },
  { name:'终章·公开处刑日', route:'狗熊', note:'礼堂中的公开问责', unlockHint:'达成“公开处刑日”结局', endings:['game_over_gouxiong_embarrass'] },
];

export const ART_ROUTES: Array<ArtRoute | '全部'> = ['全部', '校园', '序章', '联合革命', '做题改革', 'N.K.P.D.', '民主与豪邦', '及第', '杨玉乐', '狗熊', '吴福军', '绝望', '终局'];
