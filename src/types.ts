import type { LawSystemState } from './data/laws';

export interface Advisor {
  id: string;
  title: string;
  name: string;
  description: string;
  portrait?: string;
  cost: number;
  modifiers: {
    ppDaily?: number;
    stabDaily?: number;
    ssDaily?: number;
    tprDaily?: number;
    studentSanityDaily?: number;
    capitalPenetrationDaily?: number;
    radicalAngerDaily?: number;
    allianceUnityDaily?: number;
    partyCentralizationDaily?: number;
    powerBalanceDaily?: number;
    gdpGrowthDaily?: number;
    rndQualityDaily?: number;
  };
}

export interface FocusNode {
  id: string;
  title: string;
  description: string;
  days: number;
  x: number;
  y: number;
  requires?: string[];
  mutuallyExclusive?: string[];
  canStart?: (state: GameState) => boolean;
  isHidden?: (state: GameState) => boolean;
  onStart?: (state: GameState) => Partial<GameState>;
  onComplete?: (state: GameState) => Partial<GameState>;
  effectsText?: string[];
  requiresText?: string[];
}

export interface Crisis {
  id: string;
  title: string;
  daysLeft: number;
  /** 危机总时长（用于进度条显示，v8.9 新增，未提供时按 30 天渲染） */
  totalDays?: number;
  description: string;
  /** 化解条件（悬浮窗显示，v8.10） */
  resolutionText?: string;
  /** 到期后果（悬浮窗显示，v8.10） */
  expiryText?: string;
  onExpire?: (state: GameState) => Partial<GameState>;
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  costPP: number;
  /** 非PP类消耗说明（如「50 TPR + 50 SS」），显示在决议卡上 */
  costText?: string;
  /** 解锁/执行条件说明，显示在决议卡与悬浮窗中 */
  requirementsText?: string[];
  /** 结构化效果要点（悬浮窗显示，以「-」开头渲染为红色） */
  effectsText?: string[];
  cooldownDays: number;
  canAfford?: (state: GameState) => boolean;
  isVisible?: (state: GameState) => boolean;
  effect: (state: GameState) => Partial<GameState>;
}

export interface Leader {
  name: string;
  title: string;
  portrait: string;
  ideology: string;
  description?: string;
  buffs?: string[];
}

export interface NationalSpirit {
  id: string;
  name: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  icon?: string;
  effects?: {
    ppDaily?: number;
    stabDaily?: number;
    ssDaily?: number;
    tprDaily?: number;
    studentSanityDaily?: number;
    capitalPenetrationDaily?: number;
    radicalAngerDaily?: number;
    allianceUnityDaily?: number;
    partyCentralizationDaily?: number;
    powerBalanceDaily?: number;
    defenseBonus?: number;
    attackBonus?: number;
    gdpGrowthDaily?: number;
    rndQualityDaily?: number;
  };
}

export interface EventChoice {
  id?: string;
  text: string;
  previewText?: string;
  disabled?: (state: GameState) => boolean;
  effect?: (state: GameState) => Partial<GameState>;
}

export interface GameEvent {
  campusSituation?: { family: string; variant: string; route: string; channel: 'daily' | 'document' };
  id: string;
  title: string;
  description: string;
  buttonText?: string;
  effectsText?: string[];
  isStoryEvent?: boolean;
  effect?: (state: GameState) => Partial<GameState>;
  choices?: EventChoice[];
}

/** 吴福军镇压线状态 (v8.5) */
export interface WuState {
  /** 革命残党实力 0-100，满则残党反攻（本线失败结局） */
  guerrillaStrength: number;
  /** 戒严等级 0-3：影响镇压效率/学生愤怒/吴福军野心 */
  martialLawLevel: number;
  /** 封安宝信任 0-100 */
  fengTrust: number;
  /** 吴福军野心 0-100，高则走向政变/刺杀 */
  wuAmbition: number;
  /** 学生愤怒 0-100，遇刺结局核心变量 */
  studentAnger: number;
  /** 教师支持 0-100 */
  teacherSupport: number;
  /** 舆论压力 0-100，满则教育局介入 */
  publicOpinion: number;
  /** 镇压行动累计计数 */
  crackdownActions: number;
  /** 与残党和解谈判进度 0-100 */
  negotiationProgress: number;
  /** 刺杀线已触发 */
  assassinationTriggered?: boolean;
}

/** 编年史条目类型 (v8.0) */
export type ChronicleType = 'focus' | 'event' | 'leader' | 'crisis' | 'route' | 'ending';

/** 编年史条目：游戏内自动记录的关键节点 */
export interface ChronicleEntry {
  /** 记录时间戳 (Date.getTime()) */
  date: number;
  type: ChronicleType;
  title: string;
  description?: string;
  /** 路线标签，如 '民主派'、'狗熊线'、'杨玉乐线' */
  routeTag?: string;
  /** 重大程度：3=重大（领袖更迭/路线切换/结局），2=国策/危机，1=一般事件 */
  importance?: 1 | 2 | 3;
}

export interface MapLocation {
  id: string;
  name: string;
  studentControl: number;
  defenseDays: number;
  pollingData?: Record<string, number>;
  totalVotes?: number;
  castVotes?: Record<string, number>;
  /** 子地块列表 (v6.4 地块细化) */
  subTiles?: string[];
}

/** 子地块 (v6.4 地块细化系统) */
export interface SubTile {
  id: string;            // 'b3_rooftop', 'admin_broadcast', etc.
  name: string;          // 'B3天台', '行政楼广播站'
  buildingId: string;    // 父建筑ID: 'b3', 'admin', etc.
  studentControl: number;
  defenseDays: number;
  /** 相邻子地块ID列表 */
  adjacentTo: string[];
  /** 通用等级 (各模式共用: 清洗度/建设度 0-3) */
  zoneLevel?: number;
  /** GX无政府模式控制方 */
  owner?: string;
}

/** 所有子地块定义 (v6.4) */
export const ALL_SUB_TILES: SubTile[] = [
  // === B3教学楼 (革命中枢·教学区) ===
  { id: 'b3_a1a3',   name: 'A1-A3教学楼', buildingId: 'b3', studentControl: 50, defenseDays: 0, adjacentTo: ['b3_b1b2', 'admin_main', 'dorm_1_4'] },
  { id: 'b3_b1b2',   name: 'B1-B2教学楼', buildingId: 'b3', studentControl: 60, defenseDays: 0, adjacentTo: ['b3_a1a3', 'b3_tower', 'lib_area', 'admin_gym'] },
  { id: 'b3_tower',  name: 'B3教学楼主楼', buildingId: 'b3', studentControl: 70, defenseDays: 0, adjacentTo: ['b3_b1b2', 'aud_hall', 'track_field'] },
  // === 行政楼 (权力中心) ===
  { id: 'admin_main',   name: '行政楼主楼', buildingId: 'admin', studentControl: 0, defenseDays: 0, adjacentTo: ['b3_a1a3', 'admin_gym', 'dorm_1_4'] },
  { id: 'admin_gym',    name: '体育馆',     buildingId: 'admin', studentControl: 0, defenseDays: 0, adjacentTo: ['admin_main', 'b3_b1b2', 'aud_screen'] },
  // === B1/B2生活区 (群众基础·宿舍) ===
  { id: 'dorm_1_4',     name: '宿舍1-4栋',  buildingId: 'b1b2', studentControl: 45, defenseDays: 0, adjacentTo: ['dorm_5_7', 'admin_main', 'b3_a1a3'] },
  { id: 'dorm_5_7',     name: '宿舍5-7栋',  buildingId: 'b1b2', studentControl: 35, defenseDays: 0, adjacentTo: ['dorm_1_4', 'court_area', 'intl_dept'] },
  // === 艺术礼堂 (宣传阵地) ===
  { id: 'aud_screen',   name: '放映厅',    buildingId: 'auditorium', studentControl: 35, defenseDays: 0, adjacentTo: ['admin_gym', 'aud_back', 'b3_b1b2'] },
  { id: 'aud_back',     name: '后台化妆间', buildingId: 'auditorium', studentControl: 30, defenseDays: 0, adjacentTo: ['aud_screen', 'aud_hall', 'lib_area'] },
  { id: 'aud_hall',     name: '礼堂大厅',   buildingId: 'auditorium', studentControl: 25, defenseDays: 0, adjacentTo: ['aud_back', 'b3_tower', 'track_field'] },
  // === 实验楼 (技术/情报) ===
  { id: 'intl_dept',    name: '国际部',     buildingId: 'lab', studentControl: 55, defenseDays: 0, adjacentTo: ['dorm_5_7', 'lib_area', 'court_area'] },
  { id: 'lib_area',     name: '图书馆',     buildingId: 'lab', studentControl: 45, defenseDays: 0, adjacentTo: ['intl_dept', 'aud_back', 'b3_b1b2'] },
  // === 操场 (集结点) ===
  { id: 'court_area',   name: '篮球场',     buildingId: 'playground', studentControl: 65, defenseDays: 0, adjacentTo: ['dorm_5_7', 'intl_dept', 'canteen'] },
  { id: 'canteen',      name: '食堂区',     buildingId: 'playground', studentControl: 55, defenseDays: 0, adjacentTo: ['court_area', 'track_field'] },
  { id: 'track_field',  name: '田径场',     buildingId: 'playground', studentControl: 60, defenseDays: 0, adjacentTo: ['canteen', 'aud_hall', 'b3_tower'] },
];

/** O(1) 地块ID→SubTile 查找表 */
export const TILE_BY_ID: Record<string, SubTile> = Object.fromEntries(ALL_SUB_TILES.map(t => [t.id, t]));
/** 建筑ID→子地块列表 查找表 */
export const TILES_BY_BUILDING: Record<string, SubTile[]> = ALL_SUB_TILES.reduce((acc, t) => {
  (acc[t.buildingId] ??= []).push(t);
  return acc;
}, {} as Record<string, SubTile[]>);
/** 所有建筑ID列表 */
export const ALL_BUILDING_IDS = ['b3', 'admin', 'b1b2', 'auditorium', 'lab', 'playground'] as const;

export interface JidiCorporateState {
  unlockedMechanics: {
    rnd: boolean;
    committee: boolean;
  };
  gdp: number; // in millions
  gdpGrowth: number;
  gdpHistory: number[];
  admissionRate: number;
  bureauTarget?: {
    active: boolean;
    daysLeft: number;
    targetGdp: number;
  };
  riotState?: {
    progress: number;
    bureauAnger: number;
    studentAnger: number;
    daysActive?: number;
  };
  lockedUI?: {
    gdp?: boolean;
    rnd?: boolean;
    committee?: boolean;
  };
  rndState?: {
    phase: 'idle' | 'initiation' | 'testing' | 'dumping';
    daysInPhase: number;
    currentProduct?: {
      name: string;
      faction: 'jidi' | 'newOriental' | 'teachers';
      quality: number;
      sales: number;
      salesMultiplier: number;
      image?: string;
    };
    testingIntensity: number;
    daysSinceLastIntensityChange: number;
    hasInteractedToday?: boolean;
  };
  committeeState?: {
    seats: {
      jidi: number;
      newOriental: number;
      teachers: number;
      disciplineCommittee: number;
    };
    satisfaction: {
      jidi: number;
      newOriental: number;
      teachers: number;
      disciplineCommittee: number;
    };
    bureauInfluence: number;
    activeBill?: {
      id: string;
      name: string;
      daysLeft: number;
      support: number;
      proposer: 'jidi' | 'newOriental' | 'teachers' | 'disciplineCommittee';
      lobbiedFactions: string[];
    };
  };
}

export interface RedToadFaction {
  id: string;
  name: string;
  leader: string;
  influence: number;
  loyalty: number;
  execution: number;
  color: string;
  view: string;
  portrait?: string;
}

export interface RedToadBill {
  id: string;
  title: string;
  description: string;
  warning?: string;
  initiator?: string; // Faction ID of the initiator
  supportThreshold: number; // Influence needed to pass
  requiresFlag?: string; // Only available if this flag is true
  onPass: (state: GameState) => Partial<GameState>;
  onFail: (state: GameState) => Partial<GameState>;
}

export interface RedToadState {
  overallConsensus: number;
  factions: Record<string, RedToadFaction>;
  activeBillId: string | null;
  billCooldown: number;
  historicalBills: string[];
  availableBills: string[];
}

export interface GameState {
  /** 合一之光的缓变校风指数；旧存档按 50 处理。 */
  heyiLightValue?: number;
  campusEvents?: { lastEventDay?: number; lastDocumentDay?: number; seen: string[]; familyDays: Record<string, number>; resolved: string[] };
  /** 本局累计校园运行指标；旧存档缺失时由结算视图兼容处理。 */
  campaignStats?: { days: number; papersUsed: number; papersPrinted: number; clubEvents: number; learningScoreTotal: number };
  /** 战区指挥：纯数据，可直接随原有存档序列化。 */
  command?: import('./engine/commandTypes').CommandState;
  date: Date;
  isPaused: boolean;
  gameSpeed: number;
  stats: {
    pp: number;
    stab: number;
    ss: number;
    tpr: number;
    capitalPenetration: number;
    radicalAnger: number;
    allianceUnity: number;
    partyCentralization: number;
    studentSanity: number;
  };
  modifiers: {
    ppDaily: number;
    stabDaily: number;
    ssDaily: number;
    tprDaily: number;
    studentSanityDaily: number;
    capitalPenetrationDaily: number;
    radicalAngerDaily: number;
    allianceUnityDaily: number;
    partyCentralizationDaily: number;
    powerBalanceDaily: number;
  };
  leader: Leader;
  ideologies: Record<string, number>;
  nationalSpirits: NationalSpirit[];
  advisors: (Advisor | null)[];
  activeFocus: { id: string; daysLeft: number; totalDays: number } | null;
  completedFocuses: string[];
  /** v8.0 编年史：自动记录的关键节点 */
  chronicle: ChronicleEntry[];
  crises: Crisis[];
  decisionCooldowns: Record<string, number>;
  activeEvent: GameEvent | null;
  activeStoryEvents: GameEvent[];
  activeSuperEvent: SuperEventData | null;
  activeMinigame: string | null;
  unlockedMinigames: string[];
  flags: Record<string, any>;
  currentFocusTree: string;
  mapLocations: Record<string, MapLocation>;
  reformState?: {
    progress: number;
    vanguardMembers: number;
    reformDaysElapsed?: number;
    regionalStubbornness: Record<string, number>;
    activeMissions: Record<string, { daysLeft: number; actionId: string; membersCommitted?: number; fieldSupport?: number }>;
    baseSuccessRate: number;
    juanhaoAttitude?: number;
    juanhaoEventsTriggered?: Record<string, boolean>;
    unlockedB3Actions?: boolean;
    unlockedRecruitDecisions?: boolean;
    unlockedSanityDecisions?: boolean;
    unlockedAngerDecisions?: boolean;
  };
  gameEnding?: string;
  studentAssemblyFactions?: {
    orthodox: number;
    bear: number;
    pan: number;
    otherDem: number;
    testTaker: number;
    conservativeDem?: number;
    jidiTutoring?: number;
  };
  parliamentState?: {
    isUpgraded: boolean;
    powerBalanceUnlocked: boolean;
    powerBalance: number; // 0-100, 50 is center
    factionSupport: Record<string, number>; // 0-100 support for Pan Renyue
    haobangFactionAttitude?: Record<string, number>; // 0-100 attitude toward Steel Toad (Haobang route)
    activeBill: {
      id: string;
      name: string;
      daysLeft: number;
      baseApproval: number;
      lobbiedApproval: number;
      requiredApproval: number;
      interactionsRemaining: number;
      interactedFactions: string[];
      proposer?: string;
    } | null;
  };
  electionState?: {
    isActive: boolean;
    daysLeft: number;
    totalDays: number;
    candidates: string[];
    playerCandidate: string | null;
    votes: Record<string, number>;
    campaignTeams?: Array<{ candidate: string; district: string; visits: number }>;
  };
  cyberDeconstruction?: {
    level: number;
    progress: number;
    currentWork: string;
    stage: number;
    ratings?: Record<string, number>;
    reviewedWorks?: string[];
    workProgress?: Record<string, number>;
  };
  gouxiongState?: {
    sanity: number;
    maxSanity: number;
    affinities: {
      dabi: number;
      maodun: number;
      lante: number;
      wushuo: number;
    };
    unlockedCharacters: string[];
    chats: Record<string, Array<{ from: 'gx' | 'npc'; text: string; ts: string }>>;
    dialogueProgress?: Record<string, number>;
    dailyChatState?: {
      dateKey: string;
      sentCount: number;
      blocked: boolean;
      incomingByCharacter?: Record<string, number>;
    };
  };
  yangYuleState?: {
    fengFavor: number;
    teacherSupport: number;
    health: number;
    thermosUsesThisWeek: number;
    medicineUsesThisWeek: number;
    dailyDecisionUsed: boolean;
    rebelLocations: Record<string, number>;
    rebelCooldowns?: Record<string, number>;
    unlockedMechanics: {
      desk: boolean;
      map: boolean;
      health: boolean;
    };
    /** 正高级职称评审进度 (0-100) */
    titleProgress?: number;
    /** 职称评审阶段: 0=未开始 1=材料准备 2=评审中 3=答辩 4=公示 */
    titleStage?: number;
    /** 名师工作室成员数量 */
    studioMembers?: number;
    /** 名师工作室成果点数 */
    studioAchievements?: number;
    /** 已触发的里程碑事件 */
    titleMilestones?: string[];
  };
  jidiCorporateState?: JidiCorporateState;
  redToadState?: RedToadState;
  wuState?: WuState;
  /** 校内法案系统（v8.11，旧存档缺失时按默认法案处理） */
  lawSystem?: LawSystemState;
}

export interface SuperEventData {
  id: string;
  title: string;
  quote: string;
  author: string;
  color?: string;
}
