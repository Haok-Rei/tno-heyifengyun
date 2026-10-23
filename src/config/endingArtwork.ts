import { LOADING_ART } from './loadingArtwork';

/** Scene names are explicit so ending illustrations can be reviewed against the story. */
export const ENDING_SCENE_NAMES: Record<string,string> = {
  game_over_pan:'第一张选票', game_over_wang:'终章·钢铁红蛤的复兴', game_over_bear:'终章·自由的狂欢',
  game_over_xu:'终章·中道之胜', game_over_juanhao:'内卷', true_left_good:'街垒黎明',
  great_awakening:'终章·大梦初醒', pleasure_of_mediocrity:'终章·平庸之乐', compromise:'灯下的协议',
  game_over_victory:'终章·B3保卫战胜利', gouxiong_usurpation:'银幕仍亮',
  game_over_gouxiong_embarrass:'终章·公开处刑日', game_over_gouxiong_redeem:'课桌上的改革', game_over_gouxiong:'裤熊逢春',
  game_over_jidi_1:'企业学校的黄昏', game_over_jidi_2:'价格牌下的风暴', game_over_yang_yule_success:'特级',
  game_over_lu_sole_helmsman:'名单之外', game_over_haobang:'公社的长桌',
  game_over_feng_millennium:'终章·连任千年', game_over_hefei_spring:'春回滨湖', game_over_wu_coup:'熄灯后的脚步',
  game_over_school:'清场', game_over_anarchy:'终章·升学率雪崩', game_over_midnight:'合一陨落', game_over_despair:'最后一间教室',
};
export const ENDING_ARTWORK: Record<string,string> = Object.fromEntries(Object.entries(ENDING_SCENE_NAMES).map(([id,name])=>[id,LOADING_ART[name]]));
