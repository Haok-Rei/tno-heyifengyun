import type { GameState } from '../types';
import type { CommandRoute } from '../engine/commandTypes';

export interface RouteDoctrine {
  id: CommandRoute;
  title: string;
  chapter: string;
  color: string;
  hq: string;
  schoolSide: boolean;
  objective: string;
  voice: string;
  operation: string;
  effect: string;
  dispatch: string;
  report: string;
}

export const DOCTRINES: Record<CommandRoute, RouteDoctrine> = {
  opening: { id: 'opening', title: '风暴前夜', chapter: '序章 · 高墙之内', color: '#c9b481', hq: 'b3_tower', schoolSide: false,
    objective: '选择首个国策；维持卷子供给，为即将到来的路线分歧积蓄力量。', voice: '广播照常响起。走廊里，有人开始交换未曾说出口的想法。',
    operation: '课后互助网络', effect: '支持 +4 · 理智 +5 · 团结 +3', dispatch: '以互助小组为掩护，把散落各班的学生联络起来。', report: '名单没有交给任何一位领袖。最先传开的，是一道题的另一种解法。' },
  revolution: { id: 'revolution', title: 'B3 革命战线', chapter: '第一幕 · 街垒与盟约', color: '#df8b7b', hq: 'b3_tower', schoolSide: false,
    objective: '扩大相邻阵地并守住后勤；稳定与学生支持决定革命能走多远。', voice: '王照凯：没有后勤，没有纪律，你们的反抗只是一场闹剧。',
    operation: '巩固革命阵地', effect: '当地控制 +12 · 防御 5 天 · 团结 +4 · 激进 +3', dispatch: '让宣传员和物资一道抵达街垒。政治纲领必须变成可以执行的承诺。', report: '楼道里的课桌被重新排好。每一班的代表签下共同防守的约定。' },
  democracy: { id: 'democracy', title: '学生议会', chapter: '第二幕 · 选票的重量', color: '#88b5dd', hq: 'b3_tower', schoolSide: false,
    objective: '争取地方民意和议会支持；普选开放后，走访直接影响当地民调。', voice: '潘仁越：让每一张选票，都比口号更响亮。',
    operation: '选区倾听行动', effect: '支持 +5 · 团结 +4 · 当地候选人民调 +8 权重（若已开放）', dispatch: '把讲台留给学生。竞选承诺从宿舍、食堂和教室的具体问题写起。', report: '会议拖到了熄灯。没有人喊万岁，但几位始终沉默的学生终于举起了手。' },
  reform: { id: 'reform', title: '做题改革委员会', chapter: '第二幕 · 改造旧秩序', color: '#dd9288', hq: 'b3_tower', schoolSide: false,
    objective: '推进各地区题改，降低顽固度；不要让改革耗尽学生的理智。', voice: '王照凯：革命不是换一张试卷，而是换一套命运。',
    operation: '基层题改试点', effect: '本区顽固度 -8 · 改革进度 +2 · 理智 -2', dispatch: '先在一个班验证新的教学安排，再把可行的部分带到全校。', report: '试点班递来两份报告：一份记录分数，一份记录还有多少人愿意继续。' },
  commune: { id: 'commune', title: '合一学生公社', chapter: '第三幕 · 共同生活', color: '#93cbb1', hq: 'b3_tower', schoolSide: false,
    objective: '按照国策授权建设公社；把联盟团结落实到每一个生活区。', voice: '豪邦：团结不是退让，是为了更美好世界的梦想。',
    operation: '公社协作建设', effect: '已授权地区建设 +1 级 · 团结 +5 · 理智 +3', dispatch: '召集不同派别的代表共同分配空间、工时与物资。', report: '有人仍在争论旗帜的颜色。另一些人已经把公共厨房的灯修好了。' },
  purge: { id: 'purge', title: 'N.K.P.D. 管辖区', chapter: '第三幕 · 铁幕之下', color: '#bc9591', hq: 'admin_main', schoolSide: false,
    objective: '执行已经授权的地区行动；集权收益伴随着团结和理智的流失。', voice: '吕波汉的命令不断从行政楼发出。每一份都要求立刻执行。',
    operation: '地区组织整编', effect: '已授权地区整编 +1 级 · 集权 +4 · 团结 -4 · 理智 -3', dispatch: '新名单覆盖旧名单，纪律机构接管基层组织。', report: '报告称一切恢复了秩序。附页里，空缺的名字比新增的名字更多。' },
  wu: { id: 'wu', title: '戒严指挥部', chapter: '铁腕时代 · 秩序的代价', color: '#b9b7a3', hq: 'admin_main', schoolSide: true,
    objective: '压低残党实力，同时控制学生愤怒与舆论；后果将进入年度叙职。', voice: '吴福军：统统给我回教室！',
    operation: '定点秩序行动', effect: '清除当地细胞 · 残党 -5 · 学生愤怒 +4 · 舆论 +2', dispatch: '护校队与教务人员共同进入目标地区，恢复校方控制。', report: '走廊重新安静下来。值班教师在记录末尾补了一句：安静不代表信任。' },
  yang: { id: 'yang', title: '名师工作室', chapter: '旧日余晖 · 保温杯里的政治', color: '#c6af89', hq: 'admin_main', schoolSide: true,
    objective: '维持教师支持与校长信任；让工作室成果服务于职称评审。', voice: '杨玉乐：年轻人有想法是好事，但高考面前，一切都要为分数让路。',
    operation: '教师驻点协调', effect: '教师支持 +5 · 校长信任 +3 · 工作室成果 +2 · 健康 -2', dispatch: '带着工作室的教案和一壶热茶，先说服仍在观望的教师。', report: '杨玉乐忘了带走保温杯。教案却留在了每位班主任的桌上。' },
  jidi: { id: 'jidi', title: '及第联合管理局', chapter: '企业纪元 · 分数即资产', color: '#d1bb71', hq: 'admin_main', schoolSide: true,
    objective: '在增长与学生承受力之间安排产能；企业指标不能替代校园稳定。', voice: '封安祥：知识就是财富，而我们正在创造财富。',
    operation: '教学产线优化', effect: '卷子 +160 · 企业 GDP +2（已启用时）· 理智 -5 · 资本 +3', dispatch: '调整排课与印刷周期，提高同一套设施的产出。', report: '报表上的曲线再次向上。晚自习的最后一盏灯比昨天又晚灭了几分钟。' },
  gouxiong: { id: 'gouxiong', title: '礼堂自治战区', chapter: '赛博黄昏 · 聚光灯之外', color: '#c39acb', hq: 'aud_hall', schoolSide: false,
    objective: '按国策授权联络各地；保持狗熊理智，在混战与私人关系间选择。', voice: '狗熊：这世界就是个粪作。',
    operation: '社团联合放映', effect: '当地归属狗熊 · 控制至少 60 · 狗熊理智 +4 · 全校理智 -2', dispatch: '把临时停火谈判藏在一场放映之后。掌声结束时，仍要有人收拾礼堂。', report: '银幕熄灭后，有人留了下来。这一次没有弹幕替任何人回答问题。' },
};

export function getCommandRoute(s: GameState): RouteDoctrine {
  const tree = s.currentFocusTree;
  const known: Record<string, CommandRoute> = {
    treeA: 'revolution', treeA_pan: 'democracy', treeA_pan_despair: 'democracy', treeA_true_left: 'reform',
    treeA_lu_bohan: 'purge', treeA_haobang: 'commune', treeB: 'yang', jidi_tree: 'jidi', gouxiong_tree: 'gouxiong',
  };
  // 当前国策树优先于历史旗标和选举产生的领袖名称。
  if (known[tree]) return DOCTRINES[known[tree]];
  if (tree.startsWith('wu_tree') || s.flags.wu_route_active) return DOCTRINES.wu;
  if (tree === 'jidi_tree' || s.leader.name === '封安祥') return DOCTRINES.jidi;
  if (tree === 'gouxiong_tree' || s.leader.name === '狗熊') return DOCTRINES.gouxiong;
  if (tree === 'treeB' || s.leader.name === '杨玉乐') return DOCTRINES.yang;
  if (tree === 'treeA_lu_bohan' || s.leader.name === '吕波汉') return DOCTRINES.purge;
  if (s.leader.name === '豪邦' || s.flags.haobang_commune_map_phase) return DOCTRINES.commune;
  if (tree.startsWith('treeA_pan')) return DOCTRINES.democracy;
  if (tree === 'treeA_true_left') return DOCTRINES.reform;
  if (s.flags.rebellion_started || tree.startsWith('treeA')) return DOCTRINES.revolution;
  return DOCTRINES.opening;
}
