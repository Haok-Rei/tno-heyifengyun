/** CG requirements are independent of gallery visits and never alter campaign state. */
export type ArtRoute = '校园' | '序章' | '联合革命' | '做题改革' | 'N.K.P.D.' | '民主与豪邦' | '及第' | '杨玉乐' | '狗熊' | '吴福军' | '终局';
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
  { name: '滨湖晨光', route: '校园', note: '滨湖校门 · 秋晨', unlockHint: '开始一局游戏', opening: true, scenery: true },
  { name: '端馥晚照', route: '校园', note: '端馥堂 · 放学之后', unlockHint: '开始一局游戏', opening: true, scenery: true },
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
];

export const ART_ROUTES: Array<ArtRoute | '全部'> = ['全部', '校园', '序章', '联合革命', '做题改革', 'N.K.P.D.', '民主与豪邦', '及第', '杨玉乐', '狗熊', '吴福军', '终局'];
