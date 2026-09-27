import React, { useState } from 'react';
import { GameState, WuState, ALL_SUB_TILES } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, Eye, Megaphone, FileWarning, Zap, Handshake, Award, AlertTriangle } from 'lucide-react';

// ============ 吴福军态度系统 (v8.6)：由 野心 与 封校长信任 推导，0-4 五档 ============
export function getWuAttitude(ws: WuState): number {
  const a = ws.wuAmbition, t = ws.fengTrust;
  if (a >= 85 && t < 30) return 4;
  if (a >= 70 && t < 55) return 3;
  if (a >= 50) return 2;
  if (a >= 25) return 1;
  return 0;
}

export const WU_ATTITUDE_LABELS = ['忠诚的猎犬', '尽职的处长', '居功的老吴', '尾大不掉的福军', '枪已上膛'];
export const WU_ATTITUDE_COLORS = ['#22c55e', '#84cc16', '#f59e0b', '#f97316', '#ef4444'];
export const WU_ATTITUDE_FLAVOR = [
  '校长指哪，我就咬哪。',
  '规矩就是规矩，谁都不能坏。',
  '这所学校，有一半是我保下来的。',
  '校长年纪大了，有些事看不明白了。',
  '枪的脾气，谁也别来试探。',
];

// 残党威胁词
export function guerrillaThreatWord(g: number): { word: string; color: string } {
  if (g >= 75) return { word: '反攻临界', color: '#ef4444' };
  if (g >= 50) return { word: '猖獗', color: '#f97316' };
  if (g >= 25) return { word: '活跃', color: '#f59e0b' };
  return { word: '潜伏期', color: '#22c55e' };
}
// 舆论压力词
export function opinionWord(o: number): { word: string; color: string } {
  if (o >= 75) return { word: '引爆边缘', color: '#ef4444' };
  if (o >= 50) return { word: '发酵中', color: '#f97316' };
  if (o >= 25) return { word: '轻微关注', color: '#f59e0b' };
  return { word: '外线平静', color: '#22c55e' };
}
// 教师支持词
export function teacherWord(t: number): { word: string; color: string } {
  if (t >= 75) return { word: '铁板一块', color: '#22c55e' };
  if (t >= 50) return { word: '基本稳固', color: '#84cc16' };
  if (t >= 25) return { word: '表面配合', color: '#f59e0b' };
  return { word: '离心离德', color: '#ef4444' };
}

// 建筑中文名 + 态势判定
const BUILDING_NAMES: Record<string, string> = { b3: 'B3教学区', admin: '行政楼区', b1b2: '生活宿舍区', auditorium: '艺术礼堂', lab: '实验/国际部', playground: '操场活动区' };

function buildingStatus(avgCtrl: number): { word: string; color: string } {
  if (avgCtrl <= 15) return { word: '校方严控', color: '#22c55e' };
  if (avgCtrl <= 30) return { word: '基本控制', color: '#84cc16' };
  if (avgCtrl <= 50) return { word: '有渗透', color: '#f59e0b' };
  return { word: '失守', color: '#ef4444' };
}

// SVG 校园态势图：六大区域矩形布局
const CAMPUS_ZONES: { bid: string; x: number; y: number; w: number; h: number }[] = [
  { bid: 'b3', x: 158, y: 52, w: 118, h: 62 },
  { bid: 'admin', x: 158, y: 8, w: 66, h: 40 },
  { bid: 'b1b2', x: 10, y: 8, w: 100, h: 88 },
  { bid: 'auditorium', x: 228, y: 118, w: 82, h: 46 },
  { bid: 'lab', x: 36, y: 112, w: 82, h: 48 },
  { bid: 'playground', x: 10, y: 166, w: 208, h: 34 },
];

// 紧急清剿：效果随吴福军态度变化（态度越低越卖力、代价越小；态度越高越敷衍、越跋扈）
const RAID_EFFECTS = [
  { g: -12, anger: 3, amb: 0, trust: 0, refuse: 0 },   // 忠诚的猎犬
  { g: -9, anger: 5, amb: 0, trust: 0, refuse: 0 },    // 尽职的处长
  { g: -7, anger: 6, amb: 4, trust: 0, refuse: 0 },    // 居功的老吴
  { g: -5, anger: 8, amb: 6, trust: -4, refuse: 0 },   // 尾大不掉的福军
  { g: -4, anger: 10, amb: 8, trust: 0, refuse: 0.5 }, // 枪已上膛：五成几率抗命
];

const WU_QUOTES = [
  '统统给我回教室！',
  '我在救你们！',
  '纪律就是爱！',
  '你们现在恨我，以后会感谢我。',
  '出了事，有条例兜着；条例兜不住，有我校吴兜着。',
  '老鼠洞就是老鼠洞。',
];

// LED 分段条仪表（军事风，10段）
function LedBar({ label, value, color, hint }: { label: string; value: number; color: string; hint: string }) {
  const lit = Math.round(Math.min(100, Math.max(0, value)) / 10);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-[#c9a86a]/80 font-mono tracking-wider">{label}</span>
        <span className="text-sm font-bold font-mono" style={{ color }}>{value.toFixed(2)}</span>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex-1 h-3 border border-[#3a3a2a]"
            style={{
              backgroundColor: i < lit ? color : '#14141a',
              boxShadow: i < lit ? `0 0 6px ${color}88` : 'none',
            }} />
        ))}
      </div>
      <div className="text-[10px] text-[#c9a86a]/40 mt-0.5 font-mono">{hint}</div>
    </div>
  );
}

interface WuCrackdownConsoleProps {
  state: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onClose: () => void;
  triggerEvent: (event: any) => void;
  spendPP: (amount: number) => boolean;
}

export default function WuCrackdownConsole({ state, setGameState, onClose, triggerEvent, spendPP }: WuCrackdownConsoleProps) {
  const ws = state.wuState;
  if (!ws) return null;
  const [showOrders, setShowOrders] = useState(false);
  const [showIntel, setShowIntel] = useState(false);

  const tier = getWuAttitude(ws);
  const tierColor = WU_ATTITUDE_COLORS[tier];
  const cd = (key: string) => (state.decisionCooldowns?.[key] ?? 0);
  const setCd = (key: string, days: number) =>
    setGameState(prev => ({ ...prev, decisionCooldowns: { ...prev.decisionCooldowns, [key]: days } }));
  const updateWu = (patch: Partial<WuState>) =>
    setGameState(prev => prev.wuState ? { ...prev, wuState: { ...prev.wuState!, ...patch } } : prev);

  // 情报简报：列出全部活跃残党细胞
  const activeCells = ALL_SUB_TILES.filter(t => state.flags[`wu_cell_${t.id}`] !== undefined)
    .map(t => ({ t, days: state.flags[`wu_cell_${t.id}`] as number }))
    .sort((a, b) => a.days - b.days);

  // 紧急清剿（红色行动）
  const handleRaid = () => {
    if (cd('wu_console_raid') > 0) { triggerEvent({ title: '行动冷却中', description: `吴福军刚带队行动过。他再能干，也得睡觉。剩余 ${cd('wu_console_raid')} 天。`, buttonText: '明白了' }); return; }
    if (!spendPP(40)) { triggerEvent({ title: '政治点数不足', description: '调动全校保安力量需要 40 PP。', buttonText: '唉' }); return; }
    const e = RAID_EFFECTS[tier];
    if (Math.random() < e.refuse) {
      setCd('wu_console_raid', 15);
      triggerEvent({
        id: 'wu_console_raid_refused',
        title: '枪有枪的脾气',
        description: '封安宝亲自给吴福军下达了清剿命令。\n\n“现在吗？”吴福军对着电话沉默了很久，“校长，我的人手昨天才刚换防。要不等下周？”\n\n“吴福军！”封安宝提高了声音，“我现在命令你——”\n\n“校长，”吴福军的语气突然变冷，“第一百条写得清楚：是否构成紧急情况，由安保部门认定。我现在认定：不是。”\n\n电话被挂断了。\n\n封安宝坐在空荡荡的办公室里，第一次意识到，那杆枪的扳机，已经不在自己手里了。',
        buttonText: '枪口，开始对准自己人。',
        isStoryEvent: true,
      });
      return;
    }
    updateWu({
      guerrillaStrength: Math.max(0, ws.guerrillaStrength + e.g),
      studentAnger: Math.min(100, ws.studentAnger + e.anger),
      wuAmbition: Math.min(100, ws.wuAmbition + e.amb),
      fengTrust: Math.max(0, ws.fengTrust + e.trust),
      crackdownActions: ws.crackdownActions + 1,
    });
    setCd('wu_console_raid', 15);
    triggerEvent({
      id: 'wu_console_raid_done',
      title: '雷霆清剿',
      description: `刺耳的哨声划破了校园。保安队分六路同时出动，对全部十五个区域展开了拉网式清剿。\n\n${tier <= 1
        ? '吴福军冲在最前面，亲自踹开了三间杂物室的门。“校长指哪，我咬哪。”行动结束后，他抹了把汗，立正报告。'
        : tier === 2
          ? '吴福军站在操场中央指挥，全程没有下场。“这种小事，用不着我亲自动手。”行动结束，他在庆功会上多喝了两杯。'
          : '吴福军把行动时间从凌晨三点“微调”到了上午十点——美其名曰“光明正大”。残党早跑光了，但声势搞得比谁都大。'}
\n\n封安宝听完汇报，只在报告上批了两个字：${tier <= 1 ? '“很好”' : '“知道了”'}。`,
      buttonText: '清剿结束。',
      isStoryEvent: true,
      effectsText: [`残党实力 ${e.g}，学生愤怒 +${e.anger}${e.amb ? `，吴福军野心 +${e.amb}` : ''}${e.trust ? `，封校长信任 ${e.trust}` : ''}`],
    });
  };

  // 态度管理三连
  const handleTalk = () => {
    if (cd('wu_console_talk') > 0) { triggerEvent({ title: '刚谈过', description: `谈心也是要讲时机的。冷却剩余 ${cd('wu_console_talk')} 天。`, buttonText: '好' }); return; }
    if (!spendPP(15)) { triggerEvent({ title: '政治点数不足', description: '请吴福军喝茶也要 15 PP。', buttonText: '唉' }); return; }
    updateWu({ wuAmbition: Math.max(0, ws.wuAmbition - 8), fengTrust: Math.min(100, ws.fengTrust + 6) });
    setCd('wu_console_talk', 7);
    triggerEvent({
      id: 'wu_console_talk',
      title: '校长室的茶',
      description: '封安宝亲自泡了壶茶，把吴福军请到校长室聊了一个钟头。\n\n“福军，你在合一的这些年，没有功劳也有苦劳。我都记着。”\n\n吴福军双手捧着茶杯，腰板挺得笔直。聊到当年刚入职、跟着封安宝一起抓迟到学生的时候，他的眼睛居然红了一下。\n\n“校长，你放心。”临走时他立正敬礼，“我吴福军，永远是校长手里的枪。”\n\n封安宝笑着点头。他知道，这话的保质期，取决于枪离手掌有多远。',
      buttonText: '枪擦一擦，还能用很久。',
      isStoryEvent: true,
      effectsText: ['吴福军野心 -8，封校长信任 +6'],
    });
  };
  const handleCommend = () => {
    if (cd('wu_console_commend') > 0) { triggerEvent({ title: '刚表彰过', description: `表彰太多就不值钱了。冷却剩余 ${cd('wu_console_commend')} 天。`, buttonText: '好' }); return; }
    if (!spendPP(20)) { triggerEvent({ title: '政治点数不足', description: '办一场像样的表彰会需要 20 PP。', buttonText: '唉' }); return; }
    updateWu({ wuAmbition: Math.min(100, ws.wuAmbition + 5), fengTrust: Math.min(100, ws.fengTrust + 5), guerrillaStrength: Math.max(0, ws.guerrillaStrength - 3) });
    setCd('wu_console_commend', 14);
    triggerEvent({
      id: 'wu_console_commend',
      title: '又一次表彰',
      description: '晨会上，封安宝当众念了吴福军的“先进事迹”，并颁发“校园安全突出贡献奖”。\n\n吴福军上台领奖，皮鞋擦得锃亮。台下掌声整齐，像是用尺子量过的。\n\n“表彰是荣誉，也是鞭策。”他对着话筒说，“我吴福军，一定不负校长的信任，把这群——把这些隐患，统统扫干净。”\n\n散会后，他让保安队长把奖状拍成照片，发到了三个工作群里。\n\n杨玉乐看见了，摇了摇头，对旁边的人说：“看见没有，喂得越勤，牙长得越快。”',
      buttonText: '荣誉喂饱了，活也多干了。',
      isStoryEvent: true,
      effectsText: ['吴福军野心 +5，封校长信任 +5', '残党实力 -3'],
    });
  };
  const handleWarn = () => {
    if (cd('wu_console_warn') > 0) { triggerEvent({ title: '刚敲打过', description: `敲打太频繁，容易敲断。冷却剩余 ${cd('wu_console_warn')} 天。`, buttonText: '好' }); return; }
    if (!spendPP(10)) { triggerEvent({ title: '政治点数不足', description: '敲打也要 10 PP 的底气。', buttonText: '唉' }); return; }
    updateWu({ wuAmbition: Math.max(0, ws.wuAmbition - 5), fengTrust: Math.max(0, ws.fengTrust - 8) });
    setCd('wu_console_warn', 10);
    triggerEvent({
      id: 'wu_console_warn',
      title: '敲打',
      description: '校务会上，封安宝“顺便”提了一句：“最近有些同志，功劳还没捂热，就开始讲排场了。安全经费的每一分钱，都要花在刀刃上。”\n\n说这话时，他看了吴福军一眼。\n\n会后，吴福军在保安室里砸了一个搪瓷杯：“刀——刃！我吴福军难道不是刀刃？！”\n\n第二天，保安队的巡逻照样一丝不苟。只是吴福军路过行政楼的时候，头抬得比平时更高了。',
      buttonText: '给他提个醒，也给自己提个醒。',
      isStoryEvent: true,
      effectsText: ['吴福军野心 -5，封校长信任 -8'],
    });
  };

  // 新闻发布会
  const handlePress = () => {
    if (cd('wu_console_press') > 0) { triggerEvent({ title: '发布会冷却中', description: `天天开发布会，家长们就不信了。冷却剩余 ${cd('wu_console_press')} 天。`, buttonText: '好' }); return; }
    if (!spendPP(25)) { triggerEvent({ title: '政治点数不足', description: '筹备新闻发布会需要 25 PP。', buttonText: '唉' }); return; }
    updateWu({ publicOpinion: Math.max(0, ws.publicOpinion - 15), teacherSupport: Math.min(100, ws.teacherSupport + 5) });
    setCd('wu_console_press', 20);
    triggerEvent({
      id: 'wu_console_press',
      title: '新闻发布会',
      description: '体育馆临时改成了新闻发布会现场。台上坐着封安宝和两位副校长，背景板写着“办人民满意的教育”。\n\n记者的提问很刁钻：“有家长反映，学生出入校园需要通行证，请问这是长期制度吗？”\n\n封安宝不紧不慢：“这是特殊时期的安全管理措施。我们正在研究，将结合实际情况逐步优化。”\n\n“逐步”两个字，他说得特别稳。\n\n发布会结束，舆论的风向缓了下来。老师们也松了一口气——至少短期内，不会再有人来办公室门口蹲点了。',
      buttonText: '话术，也是维稳装备。',
      isStoryEvent: true,
      effectsText: ['舆论压力 -15，教师支持 +5'],
    });
  };

  // 情报简报（免费）
  const handleIntel = () => {
    if (cd('wu_console_intel') > 0) { triggerEvent({ title: '情报组加班中', description: '情报是要花时间汇总的。明日可再呈报。', buttonText: '好' }); return; }
    setCd('wu_console_intel', 1);
    setShowIntel(true);
  };

  // 六区态势
  const districtRows = Object.entries(BUILDING_NAMES).map(([bid, name]) => {
    const tiles = ALL_SUB_TILES.filter(t => t.buildingId === bid);
    const avg = tiles.length
      ? tiles.reduce((s, t) => s + ((state.flags[`tile_ctrl_${t.id}`] as number | undefined) ?? ALL_SUB_TILES.find(x => x.id === t.id)?.studentControl ?? 50), 0) / tiles.length
      : 0;
    const st = buildingStatus(avg);
    const cellCount = tiles.filter(t => state.flags[`wu_cell_${t.id}`] !== undefined).length;
    return { bid, name, st, cellCount };
  });

  // 仪表盘指针角度（0-4 → 180°到0°，屏幕坐标上为左到右）
  const needleAngle = 180 - tier * 45;
  const needleRad = (needleAngle * Math.PI) / 180;
  const gx = 100, gy = 92, gr = 66;
  const nx = gx + gr * Math.cos(needleRad);
  const ny = gy - gr * Math.sin(needleRad);

  const threat = guerrillaThreatWord(ws.guerrillaStrength);
  const opn = opinionWord(ws.publicOpinion);
  const tch = teacherWord(ws.teacherSupport);

  const raidEffect = RAID_EFFECTS[tier];

  return (
    <div className="fixed inset-0 pt-12 z-40 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 crt">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-6xl h-[85vh] bg-[#0a0a0d] rounded-lg border-4 border-[#3a3a2a] shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
      >
        {/* 金属面板纹理 + 扫描线 */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #888 1px, transparent 1px), linear-gradient(-45deg, #888 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
        <div className="absolute inset-0 pointer-events-none animate-scanline-sweep opacity-10 bg-gradient-to-b from-transparent via-[#c9a86a] to-transparent h-10 w-full z-10"></div>

        {/* 顶栏 */}
        <div className="flex items-center justify-between px-6 py-3 border-b-2 border-[#3a3a2a] bg-[#12120f] z-20 relative">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <h2 className="font-mono font-bold text-[#c9a86a] tracking-[0.3em] text-xl">合一戒严指挥控制台</h2>
            <span className="font-mono text-xs text-[#c9a86a]/40 tracking-widest">CRACKDOWN COMMAND CONSOLE</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-[#c9a86a]/60">{state.date.toISOString().split('T')[0]}</span>
            <button onClick={onClose} className="bg-red-500/20 text-red-400 p-2 hover:bg-red-500 hover:text-black border border-red-500 transition-colors">
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-5 p-6 overflow-hidden relative z-20">
          {/* ===== 左列：吴福军态度仪表 + 传达指令 + 状态灯 ===== */}
          <div className="col-span-4 flex flex-col gap-4 overflow-y-auto pr-1">
            {/* 态度仪表 */}
            <div className="bg-[#101014] border border-[#3a3a2a] p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: tierColor }}></div>
              <h3 className="font-mono text-[#c9a86a] tracking-widest text-base mb-1">吴福军态度 · 忠诚度仪表</h3>
              <p className="font-mono text-xs text-[#c9a86a]/40 mb-2">由 野心指数 与 封校长信任 实时推导 · 决定行动效力与服从度</p>
              <svg viewBox="0 0 200 110" className="w-full">
                <path d="M 34 92 A 66 66 0 0 1 166 92" fill="none" stroke="#3a3a2a" strokeWidth="10" strokeLinecap="round" />
                {[0, 1, 2, 3, 4].map(i => {
                  const a = (180 - i * 45) * Math.PI / 180;
                  const x1 = gx + (gr - 10) * Math.cos(a), y1 = gy - (gr - 10) * Math.sin(a);
                  const x2 = gx + (gr + 8) * Math.cos(a), y2 = gy - (gr + 8) * Math.sin(a);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={WU_ATTITUDE_COLORS[i]} strokeWidth="3" opacity="0.8" />;
                })}
                <line x1={gx} y1={gy} x2={nx} y2={ny} stroke="#f5f5f4" strokeWidth="3" />
                <circle cx={gx} cy={gy} r="7" fill="#0a0a0d" stroke="#f5f5f4" strokeWidth="2" />
              </svg>
              <div className="text-center mt-1">
                <span className="font-mono font-bold text-2xl tracking-widest" style={{ color: tierColor }}>{WU_ATTITUDE_LABELS[tier]}</span>
              </div>
              <p className="font-mono text-sm text-[#c9a86a]/70 text-center mt-1 italic">“{WU_ATTITUDE_FLAVOR[tier]}”</p>
              <div className="grid grid-cols-2 gap-2 mt-3 font-mono text-xs text-[#c9a86a]/70">
                <div className="border border-[#3a3a2a] p-2 flex justify-between"><span>野心指数</span><span style={{ color: ws.wuAmbition >= 70 ? '#ef4444' : '#c9a86a' }}>{ws.wuAmbition.toFixed(2)}</span></div>
                <div className="border border-[#3a3a2a] p-2 flex justify-between"><span>校长信任</span><span style={{ color: ws.fengTrust < 40 ? '#ef4444' : '#c9a86a' }}>{ws.fengTrust.toFixed(2)}</span></div>
              </div>
              {tier >= 3 && (
                <div className="mt-2 border border-red-500/30 bg-red-500/10 p-2 text-sm text-red-400 font-mono flex items-center gap-2">
                  <AlertTriangle size={16} className="flex-shrink-0" />
                  {tier === 4 ? '警告：枪已上膛——吴福军可能未经请示擅自行动！' : '注意：吴福军开始自行解读命令。建议通过态度管理干预。'}
                </div>
              )}
              {/* 二级小窗口入口：吴福军决议 */}
              <button
                onClick={() => setShowOrders(true)}
                className="w-full mt-3 py-3 font-mono font-bold tracking-widest border-2 border-[#c9a86a] text-[#e8d5a4] bg-[#c9a86a]/10 hover:bg-[#c9a86a] hover:text-black transition-colors text-base"
              >
                📢 向吴福军传达指令
              </button>
            </div>

            {/* 状态灯阵列 */}
            <div className="bg-[#101014] border border-[#3a3a2a] p-4">
              <h3 className="font-mono text-[#c9a86a] tracking-widest text-base mb-3">全局状态灯</h3>
              <div className="space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#c9a86a]/80">戒严等级</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map(lv => (
                      <div key={lv} className={`w-10 h-5 border ${ws.martialLawLevel >= lv ? 'bg-amber-400 border-amber-600 shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-[#1a1a1f] border-[#3a3a2a]'}`} title={`Lv${lv}`}></div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#c9a86a]/80">残党威胁</span>
                  <span className="text-sm font-bold tracking-widest" style={{ color: threat.color }}>{threat.word}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#c9a86a]/80">外线舆论</span>
                  <span className="text-sm font-bold tracking-widest" style={{ color: opn.color }}>{opn.word}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#c9a86a]/80">教师群体</span>
                  <span className="text-sm font-bold tracking-widest" style={{ color: tch.color }}>{tch.word}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#c9a86a]/80">学生怒火</span>
                  <span className={`text-sm font-bold tracking-widest ${ws.studentAnger >= 70 ? 'text-red-400 animate-pulse' : ws.studentAnger >= 45 ? 'text-orange-400' : 'text-green-400'}`}>
                    {ws.studentAnger >= 70 ? '一触即发' : ws.studentAnger >= 45 ? '闷烧中' : '尚可控制'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#c9a86a]/80">和谈进度</span>
                  <span className="text-sm font-bold text-[#c9a86a]">{ws.negotiationProgress > 0 ? `${ws.negotiationProgress.toFixed(1)}%` : '未开启'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== 中列：SVG校园态势图 + LED仪表 ===== */}
          <div className="col-span-5 flex flex-col gap-4 overflow-y-auto pr-1">
            {/* SVG 校园态势图 */}
            <div className="bg-[#101014] border border-[#3a3a2a] p-4">
              <h3 className="font-mono text-[#c9a86a] tracking-widest text-base mb-3">全区控制态势图</h3>
              <svg viewBox="0 0 320 206" className="w-full border border-[#3a3a2a] bg-[#0c0c10]">
                {/* 校园路网底纹 */}
                <g stroke="#22262a" strokeWidth="1">
                  <line x1="150" y1="0" x2="150" y2="206" />
                  <line x1="0" y1="100" x2="320" y2="100" />
                </g>
                {CAMPUS_ZONES.map(z => {
                  const d = districtRows.find(r => r.bid === z.bid)!;
                  return (
                    <g key={z.bid}>
                      <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="2"
                        fill={d.st.color} fillOpacity="0.18" stroke={d.st.color} strokeWidth="1.5" />
                      <text x={z.x + z.w / 2} y={z.y + z.h / 2 - 4} textAnchor="middle"
                        fill={d.st.color} fontSize="9" fontFamily="monospace" fontWeight="bold">{d.name}</text>
                      <text x={z.x + z.w / 2} y={z.y + z.h / 2 + 10} textAnchor="middle"
                        fill={d.st.color} fontSize="8" fontFamily="monospace">{d.st.word}</text>
                      {d.cellCount > 0 && (
                        <circle cx={z.x + z.w - 7} cy={z.y + 7} r="4" fill="#ef4444" className="animate-ping" opacity="0.7" />
                      )}
                      {d.cellCount > 0 && (
                        <circle cx={z.x + z.w - 7} cy={z.y + 7} r="3" fill="#ef4444" />
                      )}
                    </g>
                  );
                })}
                {/* 图例 */}
                <g fontFamily="monospace" fontSize="7" fill="#c9a86a">
                  <rect x="8" y="180" width="6" height="6" fill="#22c55e" opacity="0.8" />
                  <text x="17" y="186">校方严控</text>
                  <rect x="70" y="180" width="6" height="6" fill="#f59e0b" opacity="0.8" />
                  <text x="79" y="186">有渗透</text>
                  <rect x="120" y="180" width="6" height="6" fill="#ef4444" opacity="0.8" />
                  <text x="129" y="186">失守</text>
                  <circle cx="206" cy="183" r="3" fill="#ef4444" />
                  <text x="214" y="186">残党细胞</text>
                </g>
              </svg>
              <p className="font-mono text-xs text-[#c9a86a]/40 mt-2">红点=活跃残党细胞（5天夺占地块）。绿色=校方严控 · 黄色=残党渗透 · 红色=失守。</p>
            </div>

            {/* LED 仪表 */}
            <div className="bg-[#101014] border border-[#3a3a2a] p-4 space-y-4">
              <h3 className="font-mono text-[#c9a86a] tracking-widest text-base">参数仪表明细</h3>
              <LedBar label="残党实力" value={ws.guerrillaStrength} color={threat.color} hint="100 = 残党总反攻（本线失败）" />
              <LedBar label="学生愤怒" value={ws.studentAnger} color={ws.studentAnger >= 70 ? '#ef4444' : '#f59e0b'} hint="遇刺线核心变量 · 高愤怒加速残党发展" />
              <LedBar label="舆论压力" value={ws.publicOpinion} color={opn.color} hint="≥80 教育局每日施压（稳定度 -0.2/日）" />
              <LedBar label="教师支持" value={ws.teacherSupport} color={tch.color} hint="影响和谈推进速度与年度判定" />
            </div>

            {/* 情报简报区 */}
            <div className="bg-[#101014] border border-[#3a3a2a] p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-mono text-[#c9a86a] tracking-widest text-base">情报组 · 残党细胞监控</h3>
                <button onClick={handleIntel} className="font-mono text-xs border border-[#c9a86a]/50 text-[#c9a86a] px-3 py-1.5 hover:bg-[#c9a86a] hover:text-black transition-colors">
                  <Eye size={14} className="inline mr-1" />呈报
                </button>
              </div>
              {showIntel && (
                activeCells.length === 0 ? (
                  <p className="font-mono text-sm text-green-400">✓ 暂无活跃细胞。地下网络很安静——也许太安静了。</p>
                ) : (
                  <div className="space-y-1.5">
                    {activeCells.map(({ t, days }) => (
                      <div key={t.id} className="flex items-center justify-between border border-red-500/30 bg-red-500/10 px-3 py-2">
                        <span className="font-mono text-sm text-red-300">⚠ {t.name}</span>
                        <span className="font-mono text-xs text-red-400">{days >= 4 ? '即将爆发！' : `活跃第 ${days} 天`}（5天夺占）</span>
                      </div>
                    ))}
                    <p className="font-mono text-xs text-[#c9a86a]/50">提示：细胞可在地图上用 设卡封锁 / 情报收集 / 定点抓捕 清除</p>
                  </div>
                )
              )}
              {!showIntel && <p className="font-mono text-sm text-[#c9a86a]/40">点击「呈报」获取全图残党细胞位置与活跃天数。</p>}
            </div>
          </div>

          {/* ===== 右列：行动按钮（图标化） ===== */}
          <div className="col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
            <h3 className="font-mono text-[#c9a86a] tracking-widest text-base">行动指令 · 由封校长下达</h3>

            {/* 紧急清剿：常驻大按钮（详情在二级窗口） */}
            <div className="border-2 border-red-500/40 bg-red-500/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-red-400 text-lg flex items-center gap-2"><Zap size={18} />紧急清剿</span>
                <span className="font-mono text-xs text-red-400/70">{cd('wu_console_raid') > 0 ? `冷却 ${cd('wu_console_raid')} 天` : '40 PP'}</span>
              </div>
              <p className="font-mono text-sm text-[#c9a86a]/70 mb-3">
                当前态度「{WU_ATTITUDE_LABELS[tier]}」<br />
                预期：残党 {raidEffect.g} · 愤怒 +{raidEffect.anger}
                {raidEffect.amb ? ` · 野心 +${raidEffect.amb}` : ''}
                {raidEffect.trust ? ` · 信任 ${raidEffect.trust}` : ''}
                {raidEffect.refuse ? ' · 50%抗命！' : ''}
              </p>
              <button onClick={() => setShowOrders(true)} className="w-full py-3 font-mono font-bold border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-black transition-colors text-base">
                下达指令
              </button>
            </div>

            {/* 新闻发布会（图标化） */}
            <button onClick={handlePress} disabled={cd('wu_console_press') > 0}
              className={`flex items-center gap-3 p-4 border transition-colors text-left ${cd('wu_console_press') > 0 ? 'border-[#3a3a2a] text-[#c9a86a]/30 cursor-not-allowed' : 'border-[#c9a86a]/50 text-[#e8d5a4] hover:bg-[#c9a86a]/10'}`}>
              <Megaphone size={28} className="flex-shrink-0 text-[#c9a86a]" />
              <div>
                <div className="font-mono font-bold text-base">新闻发布会</div>
                <div className="font-mono text-xs text-[#c9a86a]/60">{cd('wu_console_press') > 0 ? `冷却 ${cd('wu_console_press')} 天` : '舆论 -15 · 教师 +5 · 25 PP'}</div>
              </div>
            </button>

            {/* 情报呈报（图标化） */}
            <button onClick={handleIntel}
              className="flex items-center gap-3 p-4 border border-[#c9a86a]/50 text-[#e8d5a4] hover:bg-[#c9a86a]/10 transition-colors text-left">
              <Eye size={28} className="flex-shrink-0 text-[#c9a86a]" />
              <div>
                <div className="font-mono font-bold text-base">情报呈报</div>
                <div className="font-mono text-xs text-[#c9a86a]/60">免费 · 定位全图残党细胞</div>
              </div>
            </button>

            {/* 提示 */}
            <div className="bg-[#101014] border border-[#3a3a2a] p-3">
              <p className="font-mono text-xs text-[#c9a86a]/60 flex items-start gap-2"><FileWarning size={14} className="flex-shrink-0 mt-0.5" />
                每日巡逻 / 设卡 / 抓捕在地图执行；「午夜清场」小游戏与「家长会安抚」等在右侧决议栏。</p>
            </div>

            <div className="bg-[#101014] border border-[#3a3a2a] p-3 mt-auto">
              <p className="font-mono text-xs text-[#c9a86a]/40 flex items-center gap-1.5"><ShieldAlert size={13} />
                {state.flags.wu_phase2_active ? '当前阶段：铁腕时代 · 下半场' : '当前阶段：铁腕时代 · 上半场（年度叙职前）'}
              </p>
              {state.flags.wu_bureau_verdict && (
                <p className="font-mono text-xs mt-1" style={{ color: state.flags.wu_bureau_verdict === 'praise' ? '#22c55e' : state.flags.wu_bureau_verdict === 'reprimand' ? '#ef4444' : '#c9a86a' }}>
                  教育局年度判定：{state.flags.wu_bureau_verdict === 'praise' ? '模范校提名' : state.flags.wu_bureau_verdict === 'reprimand' ? '限期整改' : '不置可否'}
                </p>
              )}
            </div>

            {/* 语录跑马灯 */}
            <div className="bg-[#101014] border border-[#3a3a2a] p-3">
              <p className="font-mono text-[10px] text-[#c9a86a]/40 mb-1">保安室广播 · 实时监听</p>
              <p className="font-mono text-sm text-[#c9a86a]/70 italic">“{WU_QUOTES[Math.abs(Math.floor(state.stats.pp)) % WU_QUOTES.length]}”</p>
            </div>
          </div>
        </div>

        {/* ===== 二级小窗口：向吴福军传达指令 ===== */}
        <AnimatePresence>
          {showOrders && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 z-50 flex flex-col p-8 crt"
            >
              <div className="flex justify-between items-center mb-6 border-b border-[#c9a86a] pb-3">
                <div>
                  <h2 className="font-mono font-bold text-[#c9a86a] tracking-[0.3em] text-2xl">向吴福军传达指令</h2>
                  <p className="font-mono text-sm text-[#c9a86a]/60 mt-1">
                    当前态度：<span className="font-bold" style={{ color: tierColor }}>「{WU_ATTITUDE_LABELS[tier]}」</span> —— “{WU_ATTITUDE_FLAVOR[tier]}”
                  </p>
                </div>
                <button onClick={() => setShowOrders(false)} className="text-red-400 hover:text-white border border-red-500 p-2 hover:bg-red-500/20 transition-colors">
                  <X size={26} />
                </button>
              </div>

              {/* 紧急清剿（红色行动） */}
              <div className="border-2 border-red-500/50 bg-red-500/10 p-6 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-red-400 text-2xl flex items-center gap-3"><Zap size={28} />紧急清剿（红色行动）</span>
                  <span className="font-mono text-sm text-red-400/80">{cd('wu_console_raid') > 0 ? `冷却 ${cd('wu_console_raid')} 天` : '40 PP · 冷却15天'}</span>
                </div>
                <p className="font-mono text-base text-[#c9a86a]/80 mb-4">
                  调动全校保安对十五区域展开拉网清剿。<br />
                  当前态度「{WU_ATTITUDE_LABELS[tier]}」：残党 {raidEffect.g}，愤怒 +{raidEffect.anger}
                  {raidEffect.amb ? `，野心 +${raidEffect.amb}` : ''}
                  {raidEffect.trust ? `，信任 ${raidEffect.trust}` : ''}
                  {raidEffect.refuse ? '，50%几率抗命！' : ''}
                </p>
                <button onClick={handleRaid} disabled={cd('wu_console_raid') > 0}
                  className={`w-full py-4 font-mono font-bold text-xl border-2 transition-colors ${cd('wu_console_raid') > 0 ? 'border-[#3a3a2a] text-[#c9a86a]/30 cursor-not-allowed' : 'border-red-500 text-red-400 hover:bg-red-500 hover:text-black animate-pulse'}`}>
                  {cd('wu_console_raid') > 0 ? '行动冷却中' : '▶ 下达清剿令'}
                </button>
              </div>

              {/* 态度管理三连 */}
              <h3 className="font-mono font-bold text-[#c9a86a] text-xl tracking-widest mb-3 flex items-center gap-2"><Handshake size={22} />吴福军态度管理</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#101014] border border-[#3a3a2a] p-5 flex flex-col">
                  <Handshake size={30} className="text-[#22c55e] mb-3" />
                  <h4 className="font-mono font-bold text-lg text-[#e8d5a4]">谈心安抚</h4>
                  <p className="font-mono text-sm text-[#c9a86a]/60 my-2">野心 -8 · 信任 +6</p>
                  <p className="font-mono text-xs text-[#c9a86a]/40 mb-3">15 PP · 冷却7天</p>
                  <button onClick={handleTalk} disabled={cd('wu_console_talk') > 0}
                    className={`mt-auto w-full py-2.5 font-mono font-bold border transition-colors text-base ${cd('wu_console_talk') > 0 ? 'border-[#3a3a2a] text-[#c9a86a]/30 cursor-not-allowed' : 'border-[#22c55e] text-[#22c55e] hover:bg-[#22c55e] hover:text-black'}`}>
                    {cd('wu_console_talk') > 0 ? `冷却 ${cd('wu_console_talk')} 天` : '执行'}
                  </button>
                </div>
                <div className="bg-[#101014] border border-[#3a3a2a] p-5 flex flex-col">
                  <Award size={30} className="text-[#f59e0b] mb-3" />
                  <h4 className="font-mono font-bold text-lg text-[#e8d5a4]">公开表彰</h4>
                  <p className="font-mono text-sm text-[#c9a86a]/60 my-2">野心 +5 · 信任 +5 · 残党 -3</p>
                  <p className="font-mono text-xs text-[#c9a86a]/40 mb-3">20 PP · 冷却14天</p>
                  <button onClick={handleCommend} disabled={cd('wu_console_commend') > 0}
                    className={`mt-auto w-full py-2.5 font-mono font-bold border transition-colors text-base ${cd('wu_console_commend') > 0 ? 'border-[#3a3a2a] text-[#c9a86a]/30 cursor-not-allowed' : 'border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b] hover:text-black'}`}>
                    {cd('wu_console_commend') > 0 ? `冷却 ${cd('wu_console_commend')} 天` : '执行'}
                  </button>
                </div>
                <div className="bg-[#101014] border border-[#3a3a2a] p-5 flex flex-col">
                  <AlertTriangle size={30} className="text-[#ef4444] mb-3" />
                  <h4 className="font-mono font-bold text-lg text-[#e8d5a4]">敲打警告</h4>
                  <p className="font-mono text-sm text-[#c9a86a]/60 my-2">野心 -5 · 信任 -8</p>
                  <p className="font-mono text-xs text-[#c9a86a]/40 mb-3">10 PP · 冷却10天</p>
                  <button onClick={handleWarn} disabled={cd('wu_console_warn') > 0}
                    className={`mt-auto w-full py-2.5 font-mono font-bold border transition-colors text-base ${cd('wu_console_warn') > 0 ? 'border-[#3a3a2a] text-[#c9a86a]/30 cursor-not-allowed' : 'border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444] hover:text-black'}`}>
                    {cd('wu_console_warn') > 0 ? `冷却 ${cd('wu_console_warn')} 天` : '执行'}
                  </button>
                </div>
              </div>
              <p className="font-mono text-sm text-[#c9a86a]/40 mt-4">态度由野心与信任实时推导——管理态度，就是管理那把枪。</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
