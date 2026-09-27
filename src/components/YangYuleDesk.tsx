import React, { useState } from 'react';
import { GameState } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Stamp, Pill, Coffee, FileText, Terminal, Phone, BookOpen, Mic } from 'lucide-react';
import { canDrawCampusDocument, drawCampusDocument } from '../engine/campusEvents';
import { getMechanicImageUrl } from '../config/assets';

interface YangYuleDecision {
  id: string;
  title: string;
  description: string;
  costPP: number;
  effect: () => void;
}

interface YangYuleDeskProps {
  state: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onClose: () => void;
  triggerEvent: (event: any) => void;
  updateYangYuleState: (updates: Partial<NonNullable<GameState['yangYuleState']>>) => void;
  spendPP: (amount: number) => boolean;
}

export default function YangYuleDesk({ state, setGameState, onClose, triggerEvent, updateYangYuleState, spendPP }: YangYuleDeskProps) {
  const [activeModal, setActiveModal] = useState<'stamp' | 'map' | null>(null);
  const yyState = state.yangYuleState;
  if (!yyState) return null;
  const documentReady = canDrawCampusDocument(state);

  const YANG_YULE_DECISIONS: YangYuleDecision[] = [
    {
      id: 'write_paper',
      title: '撰写教改论文',
      description: '消耗 10 PP。教师支持度 +5，教研成果 +3。',
      costPP: 10,
      effect: () => {
        updateYangYuleState({
          teacherSupport: Math.min(100, yyState.teacherSupport + 5),
          studioAchievements: Math.min(100, (yyState.studioAchievements || 0) + 3),
        });
      }
    },
    {
      id: 'report_to_feng',
      title: '向封安宝汇报工作',
      description: '消耗 15 PP。封校长信任 +10，评审进度 +2。',
      costPP: 15,
      effect: () => {
        updateYangYuleState({
          fengFavor: Math.min(100, yyState.fengFavor + 10),
          titleProgress: Math.min(100, (yyState.titleProgress || 0) + 2),
        });
      }
    },
    {
      id: 'pacify_teachers',
      title: '安抚教师情绪',
      description: '消耗 20 PP。教师支持度 +15，教研成果 +2。',
      costPP: 20,
      effect: () => {
        updateYangYuleState({
          teacherSupport: Math.min(100, yyState.teacherSupport + 15),
          studioAchievements: Math.min(100, (yyState.studioAchievements || 0) + 2),
        });
      }
    },
    {
      id: 'strengthen_patrol',
      title: '加强校园巡逻',
      description: '消耗 25 PP。激进愤怒度 -10。',
      costPP: 25,
      effect: () => {
        triggerEvent({
          title: '加强巡逻',
          description: '保安队加强了巡逻，压制了激进派的活动。',
          buttonText: '很好',
          effect: (s: GameState) => ({ stats: { ...s.stats, radicalAnger: Math.max(0, s.stats.radicalAnger - 10) } })
        });
      }
    },
    {
      id: 'suppress_moderates',
      title: '打压温和派',
      description: '消耗 15 PP。学生理智度 -10，稳定度 +5。',
      costPP: 15,
      effect: () => {
        triggerEvent({
          title: '打压温和派',
          description: '通过行政手段打压了温和派的诉求，换取了暂时的稳定。',
          buttonText: '这就对了嘛',
          effect: (s: GameState) => ({ stats: { ...s.stats, studentSanity: Math.max(0, s.stats.studentSanity - 10), stab: Math.min(100, s.stats.stab + 5) } })
        });
      }
    },
    {
      id: 'master_lecture',
      title: '名师讲座',
      description: '消耗 20 PP。教师支持度 +10，学生支持度 +5，教研成果 +5。',
      costPP: 20,
      effect: () => {
        updateYangYuleState({
          teacherSupport: Math.min(100, yyState.teacherSupport + 10),
          studioAchievements: Math.min(100, (yyState.studioAchievements || 0) + 5),
        });
        triggerEvent({
          title: '名师讲座',
          description: '作为合肥一中的”名师代表”，你受邀前往合肥师范学院为未来的师范生们举办一场教研讲座。\n\n当你站在大学的讲台上，看着下面那些充满朝气、眼神中还没有被内卷磨灭光芒的大学生时，你突然感到一种莫名的烦躁。讲稿上写的是”素质教育”，但你的嘴巴却开始不受控制地想说些别的。',
          buttonText: 'ED or ING？',
          effect: (s: GameState) => ({ stats: { ...s.stats, ss: Math.min(100, s.stats.ss + 5) } })
        });
      }
    }
  ];

  const handleDecision = (decision: YangYuleDecision) => {
    if (yyState.dailyDecisionUsed) {
      triggerEvent({ title: '精力有限', description: '今天已经处理过日常事务了，明天再来吧。', buttonText: '好吧' });
      return;
    }
    if (spendPP(decision.costPP)) {
      decision.effect();
      updateYangYuleState({ dailyDecisionUsed: true });
    } else {
      triggerEvent({ title: '政治点数不足', description: '没有足够的政治资本来执行此决议。', buttonText: '唉' });
    }
  };

  const handleRandomDocument = () => {
    if (!documentReady) return;
    setGameState(prev => drawCampusDocument(prev));
    setActiveModal(null);
  };

  const handleSecretLedger = () => {
    if (state.decisionCooldowns['secret_ledger'] > 0) {
      triggerEvent({ title: '账本冷却中', description: '现在风声紧，不能频繁做账。', buttonText: '明白' });
      return;
    }
    if (state.stats.stab >= 10) {
      setGameState(prev => ({
        ...prev,
        stats: { ...prev.stats, stab: prev.stats.stab - 10, pp: prev.stats.pp + 20 },
        yangYuleState: prev.yangYuleState ? { ...prev.yangYuleState, fengFavor: prev.yangYuleState.fengFavor + 5 } : undefined,
        decisionCooldowns: { ...prev.decisionCooldowns, 'secret_ledger': 7 }
      }));
      triggerEvent({
        title: '秘密账本',
        description: '你翻开了那本只有你和封安宝知道的秘密账本。通过巧妙地挪用一部分“教改专项资金”，你不仅充实了手头的政治资源，还给封安宝送去了一份“心意”。虽然这让学校底层的老师们怨声载道，但只要上面高兴，这点牺牲算什么？',
        buttonText: '账面做平了就行。'
      });
    } else {
      triggerEvent({ title: '稳定度过低', description: '学校现在太乱了，挪用资金会被立刻发现。', buttonText: '好吧' });
    }
  };

  const handleMicrophone = () => {
    if (state.decisionCooldowns['master_microphone'] > 0) {
      triggerEvent({ title: '话筒冷却中', description: '你刚做过一次全校演讲，学生们还在消化你的“教诲”。', buttonText: '明白' });
      return;
    }
    if (yyState.health >= 10 && state.stats.pp >= 10) {
      spendPP(10);
      setGameState(prev => ({
        ...prev,
        stats: { ...prev.stats, studentSanity: Math.min(100, prev.stats.studentSanity + 15), stab: Math.min(100, prev.stats.stab + 10) },
        yangYuleState: prev.yangYuleState ? { ...prev.yangYuleState, health: prev.yangYuleState.health - 10 } : undefined,
        decisionCooldowns: { ...prev.decisionCooldowns, 'master_microphone': 7 }
      }));
      triggerEvent({
        title: '名师演讲',
        description: '你拿起话筒，对着全校广播开始了一场慷慨激昂的演讲。你用你那标志性的、略带沙哑的嗓音，向学生们灌输着“吃得苦中苦，方为人上人”的做题家哲学。虽然这耗费了你极大的精力，但听到广播里传出的雷鸣般的掌声（哪怕是强迫的），你感到一种虚幻的满足。学生们的情绪暂时稳定了。',
        buttonText: '我依然是合一的老特级。'
      });
    } else {
      triggerEvent({ title: '状态不佳', description: '你现在的身体状况或政治资本不足以支撑一场全校演讲。', buttonText: '好吧' });
    }
  };

  const handleThermos = () => {
    if (yyState.thermosUsesThisWeek >= 3) {
      triggerEvent({ title: '保温杯空了', description: '本周的枸杞已经泡完了，下周再泡吧。', buttonText: '好吧' });
      return;
    }
    if (spendPP(5)) {
      updateYangYuleState({
        health: Math.min(100, yyState.health + 5),
        thermosUsesThisWeek: yyState.thermosUsesThisWeek + 1
      });
    } else {
      triggerEvent({ title: '政治点数不足', description: '连泡枸杞的政治资本都没有了。', buttonText: '唉' });
    }
  };

  const handleMedicine = () => {
    if (yyState.medicineUsesThisWeek >= 1) {
      triggerEvent({ title: '是药三分毒', description: '降压药本周只能吃一次，吃多了会出人命的。', buttonText: '遵医嘱' });
      return;
    }
    if (spendPP(15)) {
      updateYangYuleState({
        health: Math.min(100, yyState.health + 15),
        medicineUsesThisWeek: yyState.medicineUsesThisWeek + 1
      });
    } else {
      triggerEvent({ title: '政治点数不足', description: '买药的政治资本不够了。', buttonText: '唉' });
    }
  };

  const handleSuppress = (locId: string) => {
    if (spendPP(10)) {
      const newRebelLocations = { ...yyState.rebelLocations };
      delete newRebelLocations[locId];
      const newRebelCooldowns = { ...(yyState.rebelCooldowns || {}) };
      newRebelCooldowns[locId] = 5;
      updateYangYuleState({ 
        rebelLocations: newRebelLocations,
        rebelCooldowns: newRebelCooldowns
      });
    } else {
      triggerEvent({ title: '政治点数不足', description: '没有足够的政治资本来调动保安队。', buttonText: '可恶' });
    }
  };

  const handleRedPhone = () => {
    if (Object.keys(yyState.rebelLocations).length === 0) {
      triggerEvent({ title: '风平浪静', description: '目前校园局势稳定，不需要动用吴福军。', buttonText: '很好' });
      return;
    }
    if (state.stats.pp >= 50 && state.stats.ss >= 20) {
      spendPP(50);
      triggerEvent({
        title: '吴福军出动',
        description: '情况已经完全失控了。\n\n钢铁红蛤的地下组织蔓延到了每一个班级，《资本论简读》被堂而皇之地摆在课桌上，学生们甚至开始串联罢考。你的软性维稳在绝对的革命怒火面前像一层窗户纸般被捅破。你看着窗外操场上聚集的人群，手不受控制地颤抖着。你知道，只有暴力能平息这一切了。你拿起了那部积灰已久的红色座机，拨通了后勤处吴福军的号码。',
        buttonText: '老吴，带你的人来清场。出了事我担着。',
        effect: (s: GameState) => {
          const newRebelCooldowns = { ...(s.yangYuleState?.rebelCooldowns || {}) };
          Object.keys(s.yangYuleState?.rebelLocations || {}).forEach(locId => {
            newRebelCooldowns[locId] = 5;
          });
          return {
            stats: { ...s.stats, ss: Math.max(0, s.stats.ss - 20) },
            yangYuleState: { 
              ...s.yangYuleState!, 
              rebelLocations: {},
              rebelCooldowns: newRebelCooldowns
            }
          };
        }
      });
    } else {
      triggerEvent({ title: '政治点数或学生支持度不足', description: '你需要 50 PP 和 20 学生支持度来调动吴福军。', buttonText: '可恶' });
    }
  };

  // Calculate visual effects based on health
  const healthPercent = yyState.health;
  const isBlurry = healthPercent < 50;
  const isScrambled = healthPercent < 20;
  
  const getCertificateText = () => {
    if (isScrambled) {
      const options = ['特级教尸', 'ED教师', '特级秃头', '老保头子'];
      return options[Math.floor(Math.random() * options.length)];
    }
    return '特级教师';
  };

  return (
    <div className="fixed inset-0 pt-12 z-40 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 crt">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`relative w-full max-w-6xl h-[85vh] bg-[#1a1a1a] rounded-lg border-4 border-[#3a2a1a] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden ${isScrambled ? 'animate-pulse' : ''}`}
      >
        {/* Desk Texture */}
        <div className="absolute inset-0 opacity-20 bg-cover bg-repeat mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url('${getMechanicImageUrl('yang_desk_wood_pattern')}')` }}></div>
        
        {/* Scanline */}
        <div className="absolute inset-0 pointer-events-none animate-scanline-sweep opacity-20 bg-gradient-to-b from-transparent via-tno-highlight to-transparent h-10 w-full z-10"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-tno-red/20 text-tno-red p-2 hover:bg-tno-red hover:text-black border border-tno-red transition-colors"
        >
          <X size={24} />
        </button>

        {/* Desk Surface */}
        <div className="absolute inset-0 p-8 flex flex-col z-20">
          
          {/* Top Row: Stats and Certificate */}
          <div className="flex justify-between items-start">
            
            {/* Stats Panel (Left) */}
            <div className="relative w-64 transform -rotate-1 shadow-2xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-zinc-300 rounded-full shadow-md z-10 flex items-center justify-center border border-zinc-400">
                <div className="w-4 h-4 bg-zinc-500 rounded-full shadow-inner"></div>
              </div>
              <div className="bg-[#fdfbf7] p-5 border border-gray-300 font-serif text-gray-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-800"></div>
                <h3 className="font-bold text-xl border-b-2 border-gray-800 mb-3 pb-2 text-center tracking-widest mt-2">维稳工作简报</h3>
                <div className="space-y-3 text-sm font-medium">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-1">
                    <span>封校长信任:</span>
                    <span className="font-bold text-blue-800 font-mono">{yyState.fengFavor.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-1">
                    <span>教师支持度:</span>
                    <span className="font-bold text-blue-800 font-mono">{yyState.teacherSupport.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-1">
                    <span>学生支持度:</span>
                    <span className="font-bold text-blue-800 font-mono">{state.stats.ss.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between items-center pb-1">
                    <span>激进愤怒度:</span>
                    <span className="font-bold text-red-700 font-mono">{state.stats.radicalAnger.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ---- 正高级职称评审进度 ---- */}
            <div className="relative w-80 transform rotate-1 shadow-2xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-9 h-9 bg-amber-300 rounded-full shadow-md z-10 flex items-center justify-center border-2 border-amber-400">
                <Stamp size={18} className="text-amber-800" />
              </div>
              <div className="bg-[#fdfbf7] p-5 border-2 border-amber-400 font-serif text-gray-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-600"></div>
                <h3 className="font-bold text-base border-b-2 border-amber-600 mb-3 pb-2 text-center tracking-widest">
                  正高级职称评审
                </h3>
                {((yyState.titleStage ?? 0) === 0) ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 text-center italic">封校长信任度达到60%后自动启动评审</p>
                    <p className="text-xs text-gray-400 text-center">提升信任度：向封安宝汇报工作、打压异己</p>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">名师工作室成员</span>
                        <span className="font-mono text-blue-700 font-bold">{yyState.studioMembers ?? 3} 人</span>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-gray-600">当前教研成果</span>
                        <span className="font-mono text-blue-700 font-bold">{(yyState.studioAchievements ?? 0).toFixed(0)} 点</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">成果每日自动积累（受教师支持度影响）</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Stage indicator */}
                    <div className="flex justify-between text-xs font-bold tracking-wide">
                      {['材料','评审','答辩','公示'].map((s, i) => (
                        <span key={i} className={i < (yyState.titleStage ?? 0) ? 'text-amber-600' : (i === (yyState.titleStage ?? 0) ? 'text-amber-800 animate-pulse' : 'text-gray-400')}>
                          {i < (yyState.titleStage ?? 0) ? '●' : (i === (yyState.titleStage ?? 0) ? '▶' : '○')} {s}
                        </span>
                      ))}
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-4 bg-gray-200 border border-gray-300 rounded overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700"
                        style={{ width: `${Math.min(100, yyState.titleProgress ?? 0)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span className="font-bold">评审进度</span>
                      <span className="font-mono font-bold text-amber-800">{(yyState.titleProgress ?? 0).toFixed(1)}%</span>
                    </div>
                    {/* Studio stats */}
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">工作室成员</span>
                        <span className="font-mono text-blue-700 font-bold">{yyState.studioMembers ?? 3} 人</span>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-gray-600">教研成果</span>
                        <span className="font-mono text-blue-700 font-bold">{(yyState.studioAchievements ?? 0).toFixed(0)} 点</span>
                      </div>
                    </div>
                    {/* Stage-specific hint */}
                    <p className="text-[11px] text-gray-500 italic border-t border-gray-200 pt-1.5">
                      {yyState.titleStage === 1 ? '需要：信任度≥70 且 教研成果≥20' :
                       yyState.titleStage === 2 ? '评审自动推进中（速度受信任度和支持度影响）' :
                       yyState.titleStage === 3 ? '答辩通过！等待进度达到100%' :
                       yyState.titleStage === 4 ? '公示期：维持信任度≥85 或 支持度≥70' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Certificate (Right) */}
            {yyState.unlockedMechanics.health && (
              <div 
                className={`relative bg-[#f4f1ea] p-2 border-[8px] border-[#8B5A2B] shadow-2xl w-80 transition-all duration-1000 transform rotate-1`}
                style={{
                  filter: `blur(${isBlurry ? '2px' : '0px'})`,
                }}
              >
                <div className="border border-double border-gray-400 p-4 text-center bg-white h-full flex flex-col justify-between">
                  <div>
                    <h2 className={`font-bold text-3xl mb-2 ${isScrambled ? 'font-mono tracking-tighter text-red-700' : 'font-serif tracking-widest text-[#D4AF37]'}`}>
                      {getCertificateText()}
                    </h2>
                    <p className="text-xs text-gray-600 font-serif mb-4 leading-relaxed">
                      兹证明 杨玉乐 同志在教育教学工作中成绩卓著，特发此证，以资鼓励。
                    </p>
                  </div>
                  <div className="border-t border-gray-300 pt-3 flex flex-col items-center">
                    <span className="text-sm text-gray-700 font-serif mb-1">当前健康状态</span>
                    <div className={`text-4xl font-bold font-mono tracking-wider ${
                      healthPercent > 70 ? 'text-green-600' :
                      healthPercent > 40 ? 'text-yellow-600' :
                      healthPercent > 20 ? 'text-orange-600' :
                      'text-red-700 animate-pulse'
                    }`}>
                      {healthPercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Area: Interactive Objects */}
          <div className="flex-1 relative mt-12">
            
            {/* Thermos */}
            {yyState.unlockedMechanics.health && (
              <button 
                onClick={handleThermos}
                className="absolute bottom-16 left-24 group hover:-translate-y-2 transition-transform duration-300 z-20"
                title="喝枸杞水 (消耗5PP，恢复5健康度)"
              >
                <div className="relative">
                  <div className="w-20 h-32 bg-gradient-to-b from-gray-300 to-gray-500 rounded-t-xl rounded-b-md border-2 border-gray-600 shadow-2xl flex flex-col items-center justify-end pb-4 relative overflow-hidden">
                    <div className="absolute top-0 w-full h-6 bg-gray-800 border-b-4 border-gray-900 rounded-t-xl"></div>
                    <Coffee size={32} className="text-red-800 opacity-80 mb-2 drop-shadow-md" />
                    <div className="w-full text-center text-sm font-bold text-white bg-red-800/80 py-1">
                      {3 - yyState.thermosUsesThisWeek}/3
                    </div>
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black/40 rounded-[100%] blur-sm -z-10"></div>
                </div>
              </button>
            )}

            {/* Medicine */}
            {yyState.unlockedMechanics.health && (
              <button 
                onClick={handleMedicine}
                className="absolute bottom-16 left-52 group hover:-translate-y-2 transition-transform duration-300 z-20"
                title="吃降压药 (消耗15PP，恢复15健康度)"
              >
                <div className="relative">
                  <div className="w-16 h-16 bg-white rounded-full border-4 border-gray-200 shadow-xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-300"></div>
                    <Pill size={28} className="text-red-600 drop-shadow-sm z-10" />
                    <div className="absolute -bottom-1 w-full text-center text-xs font-bold text-white bg-red-600 py-0.5 z-10">
                      {1 - yyState.medicineUsesThisWeek}/1
                    </div>
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/30 rounded-[100%] blur-sm -z-10"></div>
                </div>
              </button>
            )}

            {/* Stamp / Documents */}
            {yyState.unlockedMechanics.desk && (
              <button 
                onClick={() => setActiveModal('stamp')}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 group hover:-translate-y-2 transition-transform duration-300 z-10"
                title="批阅文件"
              >
                <div className="relative">
                  {/* Stack of papers */}
                  <div className="w-80 h-96 bg-[#f4f1ea] border border-gray-300 shadow-sm absolute top-4 left-4 transform -rotate-2"></div>
                  <div className="w-80 h-96 bg-[#fdfbf7] border border-gray-300 shadow-md absolute top-2 left-2 transform rotate-1"></div>
                  <div className="w-80 h-96 bg-white border border-gray-200 shadow-2xl flex flex-col items-center justify-center relative z-10">
                    <div className="absolute top-6 left-6 right-6 bottom-6 border-2 border-double border-gray-300 pointer-events-none"></div>
                    <FileText size={64} className="text-blue-900/40 mb-6" />
                    <span className="font-serif font-bold text-gray-800 text-3xl tracking-widest">待批阅文件</span>
                    <div className="mt-8 w-3/4 h-px bg-gray-300"></div>
                    <div className="mt-4 w-1/2 h-px bg-gray-300"></div>
                    {yyState.dailyDecisionUsed && (
                      <div className="absolute bottom-12 transform rotate-[-15deg] border-4 border-red-600 rounded-md px-6 py-3">
                        <span className="text-red-600 text-2xl font-bold tracking-widest">已阅</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-80 h-8 bg-black/20 rounded-[100%] blur-md -z-10"></div>
                </div>
              </button>
            )}

            {/* Map Drawer */}
            {yyState.unlockedMechanics.map && (
              <button 
                onClick={() => setActiveModal('map')}
                className="absolute bottom-12 right-12 group hover:-translate-y-2 transition-transform duration-300 z-20"
                title={`查看校园地图\n每日暴动概率 = (激进愤怒度 × 0.05)% + ((100 - 学生支持度) × 0.05)%`}
              >
                <div className="relative">
                  <div className="w-56 h-56 bg-gray-900 border-8 border-gray-700 shadow-2xl flex items-center justify-center relative overflow-hidden rounded-full">
                    <div className="absolute inset-0 opacity-20 bg-cover bg-repeat" style={{ backgroundImage: `url('${getMechanicImageUrl('yang_desk_diagmonds_pattern')}')` }}></div>
                    {/* Radar sweep effect */}
                    <div className="absolute inset-0 border-4 border-green-500/50 rounded-full"></div>
                    <div className="absolute inset-0 border border-green-500/30 rounded-full scale-75"></div>
                    <div className="absolute inset-0 border border-green-500/30 rounded-full scale-50"></div>
                    <div className="absolute inset-0 border border-green-500/30 rounded-full scale-25"></div>
                    <div className="absolute w-full h-full animate-spin-slow origin-center">
                      <div className="w-1/2 h-1/2 bg-gradient-to-br from-green-500/40 to-transparent origin-bottom-right"></div>
                    </div>
                    
                    <span className="font-mono font-bold text-green-400 text-sm tracking-widest z-10 bg-black/80 px-3 py-1 absolute bottom-6 border border-green-500/50 rounded-sm">校园维稳雷达</span>
                    {Object.keys(yyState.rebelLocations).length > 0 && (
                      <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-red-500 rounded-full animate-ping z-20"></div>
                    )}
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-56 h-8 bg-black/40 rounded-[100%] blur-md -z-10"></div>
                </div>
              </button>
            )}

            {/* Red Phone */}
            {state.completedFocuses.includes('silence_rebellion') && (
              <button 
                onClick={handleRedPhone}
                className="absolute top-11 right-24 group hover:-translate-y-2 transition-transform duration-300 z-20"
                title="呼叫吴福军 (消耗 50 PP, 20 SS 消除所有暴动)"
              >
                <div className="relative">
                  <div className="w-24 h-24 bg-red-700 rounded-lg border-b-8 border-red-900 shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1/2 bg-white/10"></div>
                    <Phone size={48} className="text-white animate-pulse drop-shadow-md" />
                    <div className="absolute -bottom-0 w-full text-center text-sm font-bold text-white bg-red-900/80 py-0.5">
                      紧急镇压
                    </div>
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black/40 rounded-[100%] blur-sm -z-10"></div>
                </div>
              </button>
            )}

            {/* Secret Ledger */}
            {state.completedFocuses.includes('bribe_inspectors') && (
              <button 
                onClick={handleSecretLedger}
                className="absolute top-15 left-20 group hover:-translate-y-2 transition-transform duration-300 z-20"
                title={`秘密账本 (消耗 10 稳定度)\n获得 20 PP, 5 封安宝好感度\n冷却: ${state.decisionCooldowns['secret_ledger'] || 0} 天`}
              >
                <div className="relative">
                  <div className="w-20 h-28 bg-[#2A2A2A] rounded-md border-r-8 border-b-8 border-[#1A1A1A] shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute left-2 w-1 h-full bg-red-900/50"></div>
                    <BookOpen size={36} className="text-tno-text/80 drop-shadow-md" />
                    <div className="absolute -bottom-0 w-full text-center text-sm font-bold text-tno-text/80 bg-black/80 py-0.5">
                      内部账本
                    </div>
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-black/40 rounded-[100%] blur-sm -z-10"></div>
                </div>
              </button>
            )}

            {/* Master Teacher Microphone */}
            {state.completedFocuses.includes('fake_teaching_skills') && (
              <button 
                onClick={handleMicrophone}
                className="absolute top-11 right-48 group hover:-translate-y-2 transition-transform duration-300 z-20"
                title={`名师话筒 (消耗 10 PP, 10 健康度)\n获得 15 学生理智度, 10 稳定度\n冷却: ${state.decisionCooldowns['master_microphone'] || 0} 天`}
              >
                <div className="relative">
                  <div className="w-16 h-24 bg-zinc-800 rounded-full border-b-4 border-zinc-900 shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1/3 bg-zinc-700 rounded-t-full"></div>
                    <Mic size={32} className="text-zinc-300 drop-shadow-md z-10" />
                    <div className="absolute -bottom-0 w-full text-center text-sm font-bold text-zinc-300 bg-black/80 py-0.5 z-10">
                      全校广播
                    </div>
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-6 bg-black/40 rounded-[100%] blur-sm -z-10"></div>
                </div>
              </button>
            )}

          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {activeModal === 'map' && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute inset-4 bg-black/95 border border-tno-highlight shadow-2xl p-6 z-50 flex flex-col crt"
            >
              <div className="flex justify-between items-center mb-4 border-b border-tno-highlight pb-2">
                <h2 className="text-2xl font-mono font-bold text-tno-highlight tracking-widest">校园维稳态势图</h2>
                <button onClick={() => setActiveModal(null)} className="text-tno-red hover:text-white"><X size={28} /></button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <p className="text-tno-text/80 font-mono mb-4">
                  “钢铁红蛤”的幽灵在校园里游荡。必须及时扑灭这些火星，否则封校长会对我失去耐心。
                </p>
                {Object.keys(yyState.rebelLocations).length === 0 ? (
                  <div className="text-center text-tno-text/50 font-mono mt-10">目前校园局势稳定。</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(yyState.rebelLocations).map(([locId, daysLeft]) => (
                      <div key={locId} className="bg-black/50 border border-tno-red p-4 shadow-md flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-tno-red text-lg">{state.mapLocations[locId]?.name || locId} 发生骚动</h4>
                          <p className="text-sm text-tno-text/80 font-mono">剩余处理时间: <span className="font-bold text-tno-red">{daysLeft} 天</span></p>
                        </div>
                        <button 
                          onClick={() => handleSuppress(locId)}
                          className="bg-tno-red/20 text-tno-red border border-tno-red px-4 py-2 font-bold hover:bg-tno-red hover:text-black transition-colors"
                        >
                          镇压 (10 PP)
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeModal === 'stamp' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-10 bg-black/95 border border-tno-highlight shadow-2xl p-8 z-50 flex flex-col crt"
            >
              <div className="flex justify-between items-center mb-6 border-b border-tno-highlight pb-2">
                <h2 className="text-3xl font-mono font-bold text-tno-highlight flex items-center gap-2 tracking-widest">
                  <Terminal className="text-tno-highlight" size={32} />
                  待批阅文件与个人决议
                </h2>
                <button onClick={() => setActiveModal(null)} className="text-tno-red hover:text-white"><X size={28} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-4">
                {/* Random Document Button */}
                <div className="mb-8 p-4 border border-tno-highlight bg-tno-highlight/10">
                  <h3 className="font-bold text-xl text-tno-highlight font-mono mb-2">特殊事务</h3>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-tno-text/80">按校园现状筛选待办文件，每日最多一份；作出处理后计入批阅次数。</p>
                    <button
                      onClick={handleRandomDocument}
                      disabled={!documentReady}
                      className={`px-6 py-3 font-bold font-mono transition-colors border ${
                        documentReady 
                          ? 'border-tno-highlight text-tno-highlight hover:bg-tno-highlight hover:text-black' 
                          : 'border-zinc-600 text-zinc-600 cursor-not-allowed'
                      }`}
                    >
                      {documentReady ? '批阅待办文件 · 5 PP' : state.stats.pp < 5 ? '政治点数不足' : '今日暂无待办'}
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-xl text-tno-highlight font-mono mb-4">日常事务</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {YANG_YULE_DECISIONS.map(decision => (
                    <div key={decision.id} className="bg-black/50 border border-tno-highlight/50 p-4 shadow-sm hover:border-tno-highlight transition-colors flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-tno-highlight font-mono mb-1">{decision.title}</h3>
                        <p className="text-sm text-tno-text/80 mb-4">{decision.description}</p>
                      </div>
                      <button
                        onClick={() => handleDecision(decision)}
                        disabled={state.stats.pp < decision.costPP || yyState.dailyDecisionUsed}
                        className={`w-full py-2 font-bold font-mono transition-colors border ${
                          state.stats.pp >= decision.costPP && !yyState.dailyDecisionUsed
                            ? 'border-tno-highlight text-tno-highlight hover:bg-tno-highlight hover:text-black' 
                            : 'border-zinc-600 text-zinc-600 cursor-not-allowed'
                        }`}
                      >
                        {yyState.dailyDecisionUsed ? '今日已处理' : `执行 (消耗 ${decision.costPP} PP)`}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
