import type { GameState } from '../types';

export const FACTION_COLORS: Record<string, string> = {
  radical_socialism: '#d46b62',
  authoritarian: '#ae9688',
  liberal: '#78a9ca',
  reactionary: '#906d93',
  anarcho_capitalism: '#d7b56d',
  deconstructivism: '#b090cb',
  test_taking: '#91aaa0',
};

export interface FactionDossier {
  name: string;
  leader: string;
  role: string;
  portrait: string;
  portraitDomain?: 'advisor';
  period: string;
  description: string;
  situation: string;
}

export function getFactionDossier(state: GameState, key: string): FactionDossier {
  const tree = state.currentFocusTree;
  const revolutionary = tree.startsWith('treeA');
  const parliament = tree.startsWith('treeA_pan');
  const iron = tree.startsWith('wu_tree');
  const capital = tree === 'jidi_tree';
  const cyber = tree === 'gouxiong_tree';
  const teacher = tree === 'treeB';
  const lu = tree === 'treeA_lu_bohan';
  const haobang = tree === 'treeA_haobang';

  switch (key) {
    case 'authoritarian': {
      if (lu) return {
        name: '极权派', leader: state.redToadState?.factions.authoritarian?.leader || '吕波汉', role: '肃反委员会主席', portrait: 'lu_bohan', period: '肃反委员会时期',
        description: '从革委会的保卫部门成长为独立的权力中心。吕波汉把审查、纪律和人事整编连成一套体系，声称只有绝对服从才能守住革命。',
        situation: '控制政治保卫体系，与其他革命派围绕权力边界持续角力。',
      };
      if (revolutionary) return {
        name: '极权派', leader: state.redToadState?.factions.authoritarian?.leader || '吕波汉', role: '革命保卫系统代表', portrait: 'lu_bohan', period: '联合革委会时期',
        description: '在学生革命内部主张集中权力与严密纪律。吕波汉依靠保卫组织扩大影响，却与潘仁越的议会派和豪邦的调和路线不断发生冲突。',
        situation: haobang && state.flags.authoritarian_exit_done ? '退党谈判已有结果，仍需观察其组织是否真正退出中枢。' : '保卫系统是其主要筹码，忠诚和影响力会随路线事件改变。',
      };
      if (iron) return {
        name: '校方建制派', leader: tree === 'wu_tree_p2_coup' ? '吴福军' : '封安宝', role: tree === 'wu_tree_p2_coup' ? '护校队实际掌权者' : '校长；吴福军掌握保安队', portrait: tree === 'wu_tree_p2_coup' ? 'wu_fujun' : 'feng_anbao', portraitDomain: tree === 'wu_tree_p2_coup' ? 'advisor' : undefined, period: '铁腕时代',
        description: '封安宝仍是校方合法性的象征，吴福军则控制巡查、通行与戒严的执行。随着护校队扩张，两人的主从关系逐渐成为校内最危险的裂缝。',
        situation: tree === 'wu_tree_p2_coup' ? '护校队已压过校长办公室，吴福军掌握现实权力。' : '行政楼仍在运转，但校长对保安队的控制并不稳固。',
      };
      if (capital) return {
        name: '旧校方', leader: '封安宝', role: '被托管的原校长', portrait: 'feng_anbao', period: '及第托管时期',
        description: '旧管理层保留部分章程与印章，预算、人事和课程却已转入及第教育手中。封安宝的威望不再足以决定学校的方向。',
        situation: '依赖及第资本维持残余影响力。',
      };
      if (cyber) return {
        name: '校方建制派', leader: '吴福军', role: '行政楼防线指挥', portrait: 'wu_fujun', portraitDomain: 'advisor', period: '赛博娱乐时期',
        description: '旧校方退守行政楼与监控网络。吴福军把守规章的师生重新编入保安队，等待狗熊的狂欢失去支持。',
        situation: '仍有组织能力，但难以重新控制整个校园。',
      };
      return {
        name: '校方建制派', leader: '封安宝', role: '校长；吴福军负责巡查', portrait: 'feng_anbao', period: '风暴前夜',
        description: '以行政楼、年级部和校规维系校园秩序。封安宝把升学率视为治理成绩，吴福军的巡查则把这一目标落实到每一条走廊。',
        situation: '掌握正式机构，却面对逐渐成形的学生反对力量。',
      };
    }
    case 'radical_socialism': {
      if (haobang && state.flags.wzk_seat_vacant) return {
        name: '真左派', leader: '豪邦', role: '革委会临时舵手', portrait: 'hao_bang', period: '舵手逝世之后',
        description: '王照凯留下的正统派席位暂时空缺。豪邦试图把仍愿合作的革命派留在同一张桌旁，同时继续推进做题改革。',
        situation: '领导权已经交接，联盟能否维持取决于后续谈判与改革。',
      };
      if (revolutionary) return {
        name: '真左派', leader: state.redToadState?.factions.orthodox?.leader?.replace(/\[|\]/g, '') || '王照凯', role: '钢铁红蛤正统派', portrait: 'wang_zhaokai', period: parliament ? '学生议会时期' : '联合革委会时期',
        description: '王照凯和B3的组织者相信，学生必须亲自掌握学校的权力。革委会成立后，如何兼顾先锋队纪律、派系合作与真正的自治，成了他们内部的分歧。',
        situation: parliament ? '保有革命时期的组织网络，在议会中争取制度化席位。' : lu ? '正统派与肃反委员会的权力界线日益模糊。' : '以B3为核心，仍在决定革命的制度形态。',
      };
      if (capital || iron || cyber) return {
        name: '真左派', leader: '王照凯', role: 'B3革命网络代表', portrait: 'wang_zhaokai', period: capital ? '及第托管时期' : iron ? '铁腕时代' : '赛博娱乐时期',
        description: '曾在B3组织反抗的学生仍保留地下联系。他们反对把校园变成盈利机器，也警惕旧校方和礼堂势力用另一套权威取代自治。',
        situation: '失去公开执政地位，转向组织与抵抗。',
      };
      return {
        name: '真左派', leader: '王照凯', role: '钢铁红蛤组织者', portrait: 'wang_zhaokai', period: '风暴前夜',
        description: '王照凯在B3集结不满应试高压的学生，试图把零散的怨气变成有纪律的行动。队伍内部已有温和协商与彻底革命两种声音。',
        situation: '尚未掌权，影响力正从教学楼向宿舍和礼堂扩散。',
      };
    }
    case 'liberal': {
      if (parliament) return {
        name: '自由派', leader: '潘仁越', role: '学生议会议长', portrait: 'pan_renyue', period: '学生议会时期',
        description: '潘仁越把原先的学生会提案变成正式议会程序，让各班和各派都能争取席位。改革不再只是反抗校长，更要经得起公开辩论和投票。',
        situation: '执掌议事程序，但必须在效率与广泛代表之间保持平衡。',
      };
      if (haobang && state.completedFocuses.includes('pan_reconciliation')) return {
        name: '自由派', leader: '潘仁越', role: '政治重建谈判代表', portrait: 'pan_renyue', period: '革委会重建时期',
        description: '在舵手逝世后的混乱里，潘仁越重新进入谈判桌。他要求把停火承诺写进可执行的议会规则，而不是再交给某位领袖的个人保证。',
        situation: '与豪邦合作，但坚持独立的组织和议事权。',
      };
      if (revolutionary) return {
        name: '自由派', leader: '潘仁越', role: '温和改革派代表', portrait: 'pan_renyue', period: '联合革委会时期',
        description: '潘仁越支持结束旧校方的高压，却反对用新的无限权力取而代之。他的同盟分布在强基班、平行班和愿意公开表态的教师之间。',
        situation: '推动议会与学生权利，随路线可能成为执政者或反对派。',
      };
      if (capital || iron || cyber) return {
        name: '自由派', leader: '潘仁越', role: '学生自治网络召集人', portrait: 'pan_renyue', period: capital ? '及第托管时期' : iron ? '铁腕时代' : '赛博娱乐时期',
        description: '自由派的合法活动空间被压缩，但潘仁越仍在班级和教师中维系联络。他主张以公开规则约束任何自称能拯救学校的强人。',
        situation: '目前难以主导校政，仍保有跨班级的支持者。',
      };
      return {
        name: '自由派', leader: '潘仁越', role: '学生会改革派', portrait: 'pan_renyue', period: '风暴前夜',
        description: '潘仁越相信公开提案、校长信箱与学生会程序尚有改革空间。他从成绩优异的学生和被忽视的平行班里寻找共同诉求。',
        situation: '组织松散，却能把不同班级的要求带到同一场讨论中。',
      };
    }
    case 'reactionary':
      return teacher ? {
        name: '反动派', leader: '杨玉乐', role: '特级教师与保守教员代表', portrait: 'yang_yule', period: '名师路线',
        description: '杨玉乐把职称、教育局评价和课堂纪律绑在一起。保守教员相信，只要维持看得见的成绩和秩序，学校便能躲过任何政治风暴。',
        situation: '掌握课堂与评审网络，却也受制于学生的不满。',
      } : {
        name: '反动派', leader: '杨玉乐', role: '资深教员代表', portrait: 'yang_yule', period: revolutionary ? '革命后的旧教员' : iron ? '铁腕时代' : capital ? '及第托管时期' : '风暴前夜',
        description: '保守教员依赖传统的职称、考核和班级权威。杨玉乐更关心教学秩序与个人前途，对激进变革始终抱有戒心。',
        situation: capital ? '在企业化考核下争取保住教师的专业地位。' : revolutionary ? '旧制度被打破后，试图在新秩序中保住讲台。' : '仍通过年级部与课堂影响学生生活。',
      };
    case 'anarcho_capitalism':
      return capital ? {
        name: '及第资本', leader: '封安祥', role: '及第教育CEO', portrait: 'feng_anxiang', period: '及第托管时期',
        description: '封安祥以托管合同接管学校，把课程、教辅、学生数据和升学焦虑编入同一张财务报表。校政的每个环节都被要求证明自身盈利。',
        situation: '掌握预算、人事与教辅供应，是当前的执政集团。',
      } : {
        name: '及第资本', leader: '封安祥', role: '及第教育负责人', portrait: 'feng_anxiang', period: revolutionary ? '革命后的资本网络' : iron ? '铁腕时代' : '风暴前夜',
        description: '封安祥从教辅供应和校园基建切入，逐渐把资金变成影响校政的筹码。及第资本承诺效率，却要求学校接受市场化的规则。',
        situation: revolutionary ? '公开权力有限，仍可通过物资与合同寻找突破口。' : '利用行政楼与家长的焦虑扩大商业入口。',
      };
    case 'deconstructivism':
      return cyber ? {
        name: '二次元解构派', leader: '狗熊', role: '赛博娱乐大统领', portrait: 'gouxiong', period: '赛博娱乐时期',
        description: '狗熊从礼堂广播和亚文化社群起家，以戏仿瓦解旧口号。成为统治者后，他发现梗和狂欢不足以分配资源、维持日常生活。',
        situation: '占据执政位置，必须在破坏冲动与治理需要之间抉择。',
      } : {
        name: '二次元解构派', leader: '狗熊', role: '艺术礼堂社群核心', portrait: 'gouxiong', period: revolutionary ? '联合革委会时期' : iron ? '铁腕时代' : '风暴前夜',
        description: '狗熊把放映厅、广播和网络迷因当作政治舞台。他吸引厌倦考试与严肃口号的学生，却常把讽刺推向对一切规则的否定。',
        situation: revolutionary ? '仍在革命联盟边缘活动，与正统派的冲突不断积累。' : '影响力主要来自礼堂与亚文化社群。',
      };
    case 'test_taking': {
      if (cyber) return {
        name: '做题派', leader: '王卷豪', role: '学习互助组织者', portrait: 'wang_juanhao_vanguard', portraitDomain: 'advisor', period: '赛博娱乐时期',
        description: '王卷豪和同伴仍需要安静的书桌，却开始意识到分数之外也有值得守护的生活。他们要求礼堂政权停止把学生当成笑料或素材。',
        situation: '从单纯追求排名，转向争取可学习也可休息的空间。',
      };
      if (state.reformState && state.reformState.progress >= 50) return {
        name: '做题派', leader: '王卷豪', role: '做题改革技术骨干', portrait: 'wang_juanhao_vanguard', portraitDomain: 'advisor', period: '做题改革推进期',
        description: '王卷豪把擅长的题目分析投入改革工作，开始质疑无限加卷能否真正提高学习质量。做题派内部也分成效率改良与旧式题海两种主张。',
        situation: '参与改革执行，诉求从更多试卷转向更有效的学习。',
      };
      return {
        name: '做题派', leader: '王卷豪', role: '高强度备考学生代表', portrait: 'wang_juanhao_vanguard', portraitDomain: 'advisor', period: parliament ? '学生议会时期' : capital ? '及第托管时期' : '风暴前夜',
        description: '王卷豪代表那些被分数与升学压力塑造的学生。他们渴望稳定的课堂和可预期的考试，却未必愿意把全部生活都交给校方或资本。',
        situation: parliament ? '在议会中争取学习安排的发言权。' : capital ? '是教辅商业化争夺最激烈的学生群体。' : '人数众多，尚未形成完全一致的政治立场。',
      };
    }
    default:
      return { name: key, leader: '尚未明确', role: '资料待更新', portrait: 'vacant', period: '当前阶段', description: '这一派系尚无完整的公开档案。', situation: '影响力随校内事件变化。' };
  }
}
