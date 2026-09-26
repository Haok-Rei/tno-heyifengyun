import { FLAVOR_EVENTS } from '../data/flavorEvents';
import { STORY_EVENTS } from '../data/storyEvents';
import { LOCAL_GOUXIONG_PORTRAIT, LOCAL_PORTRAIT_URLS } from './localPortraits';
import { LOADING_ART, LOADING_ART_URLS } from './loadingArtwork';
export { LOADING_ART_URLS } from './loadingArtwork';

type AssetDomain = 'leader' | 'advisor' | 'faction' | 'ending' | 'superevent' | 'news' | 'storyevent' | 'mechanic' | 'ui' | 'placeholder';

export type AssetKey =
  | `leader_${string}`
  | `advisor_${string}`
  | `faction_${string}`
  | `ending_${string}`
  | `superevent_${string}`
  | `news_${string}`
  | `storyevent_${string}`
  | `mechanic_${string}`
  | `ui_${string}`
  | `placeholder_${string}`;

const ABSOLUTE_URL_RE = /^(?:https?:)?\/\//i;

const loadingArt = (name: string): string => LOADING_ART[name] || LOADING_ART_URLS[0];

const NEWS_EVENT_ASSET_URLS: Partial<Record<AssetKey, string>> = Object.keys(FLAVOR_EVENTS).reduce((acc, eventId) => {
  acc[`news_${eventId}` as AssetKey] = `https://picsum.photos/seed/news_${eventId}/400/600?grayscale`;
  return acc;
}, {} as Partial<Record<AssetKey, string>>);

const STORY_EVENT_ASSET_URLS: Partial<Record<AssetKey, string>> = Object.keys(STORY_EVENTS).reduce((acc, eventId) => {
  acc[`storyevent_${eventId}` as AssetKey] = `https://picsum.photos/seed/story_${eventId}/400/300?grayscale`;
  return acc;
}, {} as Partial<Record<AssetKey, string>>);

export const ASSET_URLS: Record<AssetKey, string> = {
  placeholder_default: 'https://picsum.photos/seed/asset_fallback/800/500?grayscale',

  news_default: 'https://picsum.photos/seed/news_default/400/600?grayscale',
  storyevent_default: 'https://picsum.photos/seed/story_default/400/300?grayscale',

  leader_feng_anbao: 'https://i.postimg.cc/0KD1kzvY/feng-an-bao.png',
  leader_wang_zhaokai: 'https://i.postimg.cc/CKzd8r22/wang-zhao-kai4.png',
  leader_pan_renyue: 'https://i.postimg.cc/Hr5z6b2F/pan-ren-yue5.png',
  leader_lu_bohan: 'https://i.postimg.cc/WpQKcDjd/lu-bo-han.png',
  leader_gouxiong: 'https://i.postimg.cc/RFygTHhx/gou-xiong2.png',
  leader_hao_bang: 'https://i.postimg.cc/v81jK7Rf/hao-bang.png',
  leader_feng_anxiang: 'https://i.postimg.cc/Prrg7J9c/feng-an-xiang.png',
  leader_yang_yule: 'https://i.postimg.cc/2bPfN4sV/yang-yu-le4.jpg',
  leader_vacant: 'https://picsum.photos/seed/vacant/200/300',

  advisor_default: 'https://picsum.photos/seed/advisor/100/150?grayscale',
  advisor_zhou_chen: 'https://picsum.photos/seed/zhou_chen/100/150?grayscale',
  advisor_li_jingkai: 'https://picsum.photos/seed/li_jingkai/100/150?grayscale',
  advisor_you_guanglei: 'https://picsum.photos/seed/you_guanglei/100/150?grayscale',
  advisor_wu_fujun: 'https://picsum.photos/seed/wu_fujun/100/150?grayscale',
  advisor_yang_yule: 'https://picsum.photos/seed/yang_yule_advisor/100/150?grayscale',
  advisor_jiang_haobang: 'https://i.postimg.cc/v81jK7Rf/hao-bang.png',
  advisor_wang_juanhao_vanguard: 'https://i.postimg.cc/KYfFy03C/wang-jun-hao.png',
  advisor_wang_zhaokai_advisor: 'https://i.postimg.cc/CKzd8r22/wang-zhao-kai4.png',
  advisor_gouxiong_advisor: 'https://i.postimg.cc/RFygTHhx/gou-xiong2.png',
  advisor_lu_bohan: 'https://i.postimg.cc/WpQKcDjd/lu-bo-han.png',
  advisor_shi_ji: 'https://i.postimg.cc/fW6FQ3Zk/shi-ji.png',
  advisor_zhou_hongbing: 'https://i.postimg.cc/mZcqn3xH/zhou-hong-bin.jpg',

  faction_default: 'https://picsum.photos/seed/faction_default/200/300?grayscale',
  faction_orthodox: 'https://i.postimg.cc/CKzd8r22/wang-zhao-kai4.png',
  faction_libertarian_socialist: 'https://i.postimg.cc/v81jK7Rf/hao-bang.png',
  faction_anarchist: 'https://i.postimg.cc/fW6FQ3Zk/shi-ji.png',
  faction_internet_philosopher: 'https://i.postimg.cc/mZcqn3xH/zhou-hong-bin.jpg',
  faction_authoritarian: 'https://i.postimg.cc/WpQKcDjd/lu-bo-han.png',
  faction_gouxiong: 'https://i.postimg.cc/RFygTHhx/gou-xiong2.png',

  ending_game_over_pan: 'https://picsum.photos/seed/democracy/800/400?grayscale',
  ending_game_over_wang: 'https://picsum.photos/seed/red/800/400?grayscale',
  ending_game_over_bear: 'https://picsum.photos/seed/party/800/400?grayscale',
  ending_game_over_xu: 'https://picsum.photos/seed/conservative/800/400?grayscale',
  ending_game_over_juanhao: 'https://picsum.photos/seed/study/800/400?grayscale',
  ending_true_left_good: 'https://picsum.photos/seed/dawn/800/400?grayscale',
  ending_great_awakening: 'https://picsum.photos/seed/iron/800/400?grayscale',
  ending_pleasure_of_mediocrity: 'https://picsum.photos/seed/mediocrity/800/400?grayscale',
  ending_gouxiong_usurpation: 'https://picsum.photos/seed/anime/800/400?grayscale',
  ending_compromise: 'https://picsum.photos/seed/compromise/800/400?grayscale',
  ending_game_over_victory: 'https://picsum.photos/seed/victory/800/400?grayscale',
  ending_game_over_yang_yule_success: 'https://picsum.photos/seed/case/800/400?grayscale',
  ending_game_over_school: 'https://picsum.photos/seed/suppression/800/400?grayscale',
  ending_game_over_anarchy: 'https://picsum.photos/seed/anarchy/800/400?grayscale',
  ending_game_over_jidi_1: 'https://picsum.photos/seed/money/800/400?grayscale',
  ending_game_over_jidi_2: 'https://picsum.photos/seed/riot/800/400?grayscale',
  ending_game_over_gouxiong: 'https://picsum.photos/seed/anime_ruin/800/400?grayscale',
  ending_game_over_gouxiong_embarrass: 'https://picsum.photos/seed/gx_embarrass_ending/800/400?grayscale',
  ending_game_over_gouxiong_redeem: 'https://picsum.photos/seed/gx_redeem_ending/800/400?grayscale',
  ending_game_over_despair: 'https://picsum.photos/seed/despair/800/400?grayscale&blur=2',
  ending_game_over_midnight: 'https://picsum.photos/seed/midnight_ruin/800/400?grayscale',
  ending_game_over_lu_sole_helmsman: 'https://picsum.photos/seed/sole_helmsman/800/400?grayscale',
  ending_game_over_haobang: 'https://picsum.photos/seed/haobang_rebirth/800/400?grayscale',
  ending_game_over_feng_millennium: 'https://picsum.photos/seed/feng_millennium/800/400?grayscale',
  ending_game_over_hefei_spring: 'https://picsum.photos/seed/hefei_spring/800/400',
  ending_game_over_wu_coup: 'https://picsum.photos/seed/wu_coup/800/400?grayscale',
  ending_unknown: 'https://picsum.photos/seed/unknown/800/400?grayscale',

  superevent_default: loadingArt('行政楼'),
  superevent_game_over_school: loadingArt('封安保时代'),
  superevent_game_over_anarchy: loadingArt('合一陨落'),
  superevent_b3_uprising: loadingArt('B3革命'),
  superevent_jidi_empire_super: loadingArt('及第之梦'),
  superevent_jidi_riot_super: loadingArt('内卷'),
  superevent_true_left_reform_super: loadingArt('合一文革'),
  superevent_lu_authoritarian_super: loadingArt('合一文革2'),
  superevent_haobang_rise_super: loadingArt('合一之春'),
  superevent_gx_auditorium_split_super: loadingArt('裤熊逢春'),
  superevent_gx_redeem_super: loadingArt('合一之春2'),
  superevent_gx_embarrass_super: loadingArt('校园涂鸦2'),
  superevent_gx_ruin_super: loadingArt('校园涂鸦1'),
  superevent_first_democratic_election_super: loadingArt('合一之春2'),
  superevent_yang_yule_death: loadingArt('特级教师'),
  superevent_yang_yule_success: loadingArt('特级'),
  superevent_yang_yule_fail: loadingArt('特级0'),
  superevent_wu_crackdown: loadingArt('清场'),

  mechanic_jidi_rnd_product_1: 'https://i.postimg.cc/NKKPM6GV/jd1.png',
  mechanic_jidi_rnd_product_2: 'https://i.postimg.cc/QFvYWFVq/jd2.png',
  mechanic_jidi_rnd_product_3: 'https://i.postimg.cc/bZZFJxY0/jd3.png',
  mechanic_newOriental_rnd_product_1: 'https://i.postimg.cc/G44S2F3K/jd4.png',
  mechanic_newOriental_rnd_product_2: 'https://i.postimg.cc/zy42RyVz/jd5.png',
  mechanic_newOriental_rnd_product_3: 'https://i.postimg.cc/bGbC0qtq/jd6.png',
  mechanic_teachers_rnd_product_1: 'https://i.postimg.cc/zLWtwqgh/jd7.png',
  mechanic_teachers_rnd_product_2: 'https://i.postimg.cc/5Hv75fCY/jd8.png',
  mechanic_teachers_rnd_product_3: 'https://i.postimg.cc/HJ5Z0Ty0/jd9.png',
  mechanic_cyber_deconstruction_cover: 'https://picsum.photos/seed/mechanic_cyber_deconstruction_cover/200/300',
  mechanic_yang_desk_wood_pattern: 'https://www.transparenttextures.com/patterns/wood-pattern.png',
  mechanic_yang_desk_diagmonds_pattern: 'https://www.transparenttextures.com/patterns/diagmonds-light.png',

  ui_main_background: loadingArt('及第之梦'),
  ui_thumbnail_1: loadingArt('B3革命'),
  ui_thumbnail_2: loadingArt('合一之春'),
  ui_thumbnail_3: loadingArt('特级教师'),
  ui_thumbnail_4: loadingArt('合一陨落'),
  ui_game_logo: new URL('../assets/ui/game-logo.webp', import.meta.url).href,
  ui_studio_logo: new URL('../assets/ui/studio-logo.webp', import.meta.url).href,
  ui_loading_bg_1: loadingArt('及第之梦'),
  ui_loading_bg_2: loadingArt('B3革命'),
  ui_loading_bg_3: loadingArt('军训'),
  ui_loading_bg_4: loadingArt('合一陨落'),
  ui_loading_bg_5: loadingArt('行政楼'),
  ui_loading_bg_6: loadingArt('封安保时代'),

  ...LOCAL_PORTRAIT_URLS,

  ...(NEWS_EVENT_ASSET_URLS as Record<AssetKey, string>),
  ...(STORY_EVENT_ASSET_URLS as Record<AssetKey, string>),
};

export const GOUXIONG_AVATAR_ASSETS = {
  gx: LOCAL_GOUXIONG_PORTRAIT,
  dabi: 'https://picsum.photos/seed/dabi_avatar/256/256',
  maodun: 'https://picsum.photos/seed/maodun_avatar/256/256',
  lante: 'https://picsum.photos/seed/lante_avatar/256/256',
  wushuo: 'https://picsum.photos/seed/wushuo_avatar/256/256',
} as const;

export const GOUXIONG_CYBER_POSTER_ASSETS: Record<string, string> = {
  demon_slayer: 'https://picsum.photos/seed/gx_poster_demon_slayer/800/1200',
  aot: 'https://picsum.photos/seed/gx_poster_aot/800/1200',
  takagi: 'https://picsum.photos/seed/gx_poster_takagi/800/1200',
  mygo: 'https://picsum.photos/seed/gx_poster_mygo/800/1200',
  frieren: 'https://picsum.photos/seed/gx_poster_frieren/800/1200',
  bochi: 'https://picsum.photos/seed/gx_poster_bochi/800/1200',
  eva: 'https://picsum.photos/seed/gx_poster_eva/800/1200',
};

export const GOUXIONG_GAL_PHOTO_ASSETS: Record<string, { src: string; caption: string }> = {
  dabi_1: { src: 'https://picsum.photos/seed/gx_photo_dabi_1/900/560', caption: '窗边的侧影，配文：别再说空话。' },
  maodun_1: { src: 'https://picsum.photos/seed/gx_photo_maodun_1/900/560', caption: '训练场手套照，配文：明天按清单执行。' },
  lante_1: { src: 'https://picsum.photos/seed/gx_photo_lante_1/900/560', caption: '游戏截图，配文：今晚通关，心情+1。' },
  wushuo_1: { src: 'https://picsum.photos/seed/gx_photo_wushuo_1/900/560', caption: '手稿边角，配文：这一段终于像话了。' },
};

const ENDING_IMAGE_KEY_BY_ID: Record<string, AssetKey> = {
  game_over_pan: 'ending_game_over_pan',
  game_over_wang: 'ending_game_over_wang',
  game_over_bear: 'ending_game_over_bear',
  game_over_xu: 'ending_game_over_xu',
  game_over_juanhao: 'ending_game_over_juanhao',
  true_left_good: 'ending_true_left_good',
  great_awakening: 'ending_great_awakening',
  pleasure_of_mediocrity: 'ending_pleasure_of_mediocrity',
  gouxiong_usurpation: 'ending_gouxiong_usurpation',
  compromise: 'ending_compromise',
  game_over_victory: 'ending_game_over_victory',
  game_over_yang_yule_success: 'ending_game_over_yang_yule_success',
  game_over_school: 'ending_game_over_school',
  game_over_anarchy: 'ending_game_over_anarchy',
  game_over_jidi_1: 'ending_game_over_jidi_1',
  game_over_jidi_2: 'ending_game_over_jidi_2',
  game_over_gouxiong: 'ending_game_over_gouxiong',
  game_over_gouxiong_embarrass: 'ending_game_over_gouxiong_embarrass',
  game_over_gouxiong_redeem: 'ending_game_over_gouxiong_redeem',
  game_over_despair: 'ending_game_over_despair',
  game_over_midnight: 'ending_game_over_midnight',
  game_over_lu_sole_helmsman: 'ending_game_over_lu_sole_helmsman',
  game_over_haobang: 'ending_game_over_haobang',
  game_over_feng_millennium: 'ending_game_over_feng_millennium',
  game_over_hefei_spring: 'ending_game_over_hefei_spring',
  game_over_wu_coup: 'ending_game_over_wu_coup',
};

const SUPER_EVENT_IMAGE_KEY_BY_ID: Record<string, AssetKey> = {
  game_over_school: 'superevent_game_over_school',
  game_over_anarchy: 'superevent_game_over_anarchy',
  b3_uprising: 'superevent_b3_uprising',
  jidi_empire_super: 'superevent_jidi_empire_super',
  jidi_riot_super: 'superevent_jidi_riot_super',
  true_left_reform_super: 'superevent_true_left_reform_super',
  lu_authoritarian_super: 'superevent_lu_authoritarian_super',
  haobang_rise_super: 'superevent_haobang_rise_super',
  gx_auditorium_split_super: 'superevent_gx_auditorium_split_super',
  gx_redeem_super: 'superevent_gx_redeem_super',
  gx_embarrass_super: 'superevent_gx_embarrass_super',
  gx_ruin_super: 'superevent_gx_ruin_super',
  first_democratic_election_super: 'superevent_first_democratic_election_super',
  yang_yule_death: 'superevent_yang_yule_death',
  yang_yule_success: 'superevent_yang_yule_success',
  yang_yule_fail: 'superevent_yang_yule_fail',
  wu_crackdown: 'superevent_wu_crackdown',
};

function withDomain(domain: AssetDomain, keyOrId: string): AssetKey {
  return (keyOrId.startsWith(`${domain}_`) ? keyOrId : `${domain}_${keyOrId}`) as AssetKey;
}

function isAbsoluteUrl(input: string): boolean {
  return ABSOLUTE_URL_RE.test(input);
}

export function getAssetUrl(
  keyOrValue: string | null | undefined,
  options?: {
    domain?: AssetDomain;
    fallbackKey?: AssetKey;
    warn?: boolean;
  }
): string {
  const fallbackKey = options?.fallbackKey || 'placeholder_default';
  const fallbackUrl = ASSET_URLS[fallbackKey] || ASSET_URLS.placeholder_default;

  if (!keyOrValue) {
    return fallbackUrl;
  }

  if (isAbsoluteUrl(keyOrValue)) {
    return keyOrValue;
  }

  const key = options?.domain ? withDomain(options.domain, keyOrValue) : (keyOrValue as AssetKey);
  const url = ASSET_URLS[key];

  if (url) {
    return url;
  }

  if (options?.warn) {
    console.warn(`[assets] missing asset key: ${key}`);
  }

  return fallbackUrl;
}

export function getLeaderPortraitUrl(portrait: string | null | undefined): string {
  return getAssetUrl(portrait, { domain: 'leader', fallbackKey: 'leader_vacant' });
}

export function getAdvisorPortraitUrl(portrait: string | null | undefined, advisorId: string | null | undefined): string {
  return getAssetUrl(portrait || advisorId, { domain: 'advisor', fallbackKey: 'advisor_default' });
}

export function getFactionPortraitUrl(portrait: string | null | undefined, factionId: string | null | undefined): string {
  return getAssetUrl(portrait || factionId, { domain: 'faction', fallbackKey: 'faction_default' });
}

export function getEndingImageUrl(endingId: string | null | undefined): string {
  const key = (endingId && ENDING_IMAGE_KEY_BY_ID[endingId]) || 'ending_unknown';
  return getAssetUrl(key, { fallbackKey: 'ending_unknown' });
}

export function getSuperEventImageUrl(eventId?: string | null): string {
  const key = (eventId && SUPER_EVENT_IMAGE_KEY_BY_ID[eventId]) || 'superevent_default';
  return getAssetUrl(key, { fallbackKey: 'superevent_default' });
}

export function getJidiProductImageUrl(productImageKeyOrUrl: string | null | undefined): string {
  return getAssetUrl(productImageKeyOrUrl, { domain: 'mechanic', fallbackKey: 'placeholder_default' });
}

export function getNewsEventImageUrl(eventId: string | null | undefined): string {
  if (!eventId) {
    return getAssetUrl('news_default', { fallbackKey: 'news_default' });
  }
  const key = `news_${eventId}` as AssetKey;
  return getAssetUrl(key, { fallbackKey: 'news_default' });
}

export function getStoryEventImageUrl(eventId: string | null | undefined): string {
  if (!eventId) {
    return getAssetUrl('storyevent_default', { fallbackKey: 'storyevent_default' });
  }
  const key = `storyevent_${eventId}` as AssetKey;
  return getAssetUrl(key, { fallbackKey: 'storyevent_default' });
}

export function getMechanicImageUrl(imageKeyOrUrl: string | null | undefined): string {
  return getAssetUrl(imageKeyOrUrl, { domain: 'mechanic', fallbackKey: 'placeholder_default' });
}
