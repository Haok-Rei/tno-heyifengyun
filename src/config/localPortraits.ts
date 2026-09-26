const fengAnbao = new URL('../../art/人像/封安保.png', import.meta.url).href;
const wangZhaokai = new URL('../../art/人像/王兆凯4.png', import.meta.url).href;
const panRenyue = new URL('../../art/人像/潘仁越5.png', import.meta.url).href;
const luBohan = new URL('../../art/人像/吕波汉.png', import.meta.url).href;
const gouxiong = new URL('../../art/人像/狗熊2.png', import.meta.url).href;
const haoBang = new URL('../../art/人像/豪邦.png', import.meta.url).href;
const fengAnxiang = new URL('../../art/人像/封安祥.png', import.meta.url).href;
const yangYule = new URL('../../art/人像/杨玉乐4.png', import.meta.url).href;
const wuFujun = new URL('../../art/人像/吴福军.jpeg', import.meta.url).href;
const wangJunhao = new URL('../../art/人像/王俊豪.png', import.meta.url).href;
const shiJi = new URL('../../art/人像/时稷.png', import.meta.url).href;
const zhouHongbing = new URL('../../art/人像/周鸿斌.png', import.meta.url).href;
const xuWenfeng = new URL('../../art/人像/许文峰.png', import.meta.url).href;
const caiJuntai = new URL('../../art/人像/蔡君泰.png', import.meta.url).href;
const liXutong = new URL('../../art/人像/黎旭同.png', import.meta.url).href;
const chenDong = new URL('../../art/人像/陈栋.jpeg', import.meta.url).href;
const zhouChen = new URL('../../art/人像/周晨.jpg', import.meta.url).href;
const youGuanglei = new URL('../../art/人像/尤光雷.jpg', import.meta.url).href;
const jingZhen = new URL('../../art/人像/靖珍.jpg', import.meta.url).href;
const zhangChun = new URL('../../art/人像/张春.jpg', import.meta.url).href;
const classified = new URL('../assets/portrait-classified.svg', import.meta.url).href;
const jidiPartner = new URL('../assets/portraits/jidi-partner.svg', import.meta.url).href;
const jidiInvestor = new URL('../assets/portraits/jidi-investor.svg', import.meta.url).href;
const jidiManager = new URL('../assets/portraits/jidi-manager.svg', import.meta.url).href;
const jidiAnalyst = new URL('../assets/portraits/jidi-analyst.svg', import.meta.url).href;

/** 本地肖像是人物身份的唯一来源；未核实身份的条目显示档案占位。 */
export const LOCAL_PORTRAIT_URLS: Record<string, string> = {
  leader_feng_anbao: fengAnbao,
  leader_wang_zhaokai: wangZhaokai,
  leader_pan_renyue: panRenyue,
  leader_lu_bohan: luBohan,
  leader_gouxiong: gouxiong,
  leader_hao_bang: haoBang,
  leader_feng_anxiang: fengAnxiang,
  leader_yang_yule: yangYule,
  leader_vacant: classified,

  advisor_default: classified,
  advisor_zhou_chen: zhouChen,
  advisor_li_jingkai: jidiPartner,
  advisor_you_guanglei: youGuanglei,
  advisor_jing_zhen: jingZhen,
  advisor_zhang_chun: zhangChun,
  advisor_feng_anbao_advisor: fengAnbao,
  advisor_jidi_ceo: jidiInvestor,
  advisor_hitachi_expert: jidiManager,
  advisor_data_analyst: jidiAnalyst,
  advisor_wu_fujun: wuFujun,
  advisor_yang_yule: yangYule,
  advisor_jiang_haobang: haoBang,
  advisor_wang_juanhao_vanguard: wangJunhao,
  advisor_wang_zhaokai_advisor: wangZhaokai,
  advisor_gouxiong_advisor: gouxiong,
  advisor_lu_bohan: luBohan,
  advisor_shi_ji: shiJi,
  advisor_zhou_hongbing: zhouHongbing,
  advisor_xu_wenfeng: xuWenfeng,
  advisor_cai_juntai: caiJuntai,
  advisor_li_xutong: liXutong,
  advisor_chen_dong: chenDong,

  faction_default: classified,
  faction_orthodox: wangZhaokai,
  faction_libertarian_socialist: haoBang,
  faction_anarchist: shiJi,
  faction_internet_philosopher: zhouHongbing,
  faction_authoritarian: luBohan,
  faction_gouxiong: gouxiong,
};

export const LOCAL_GOUXIONG_PORTRAIT = gouxiong;
