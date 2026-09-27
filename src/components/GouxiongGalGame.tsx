import React, { useMemo, useState } from 'react';
import { GameState } from '../types';
import { Image, MessageCircle, Sparkles, X } from 'lucide-react';
import { GOUXIONG_AVATAR_ASSETS, GOUXIONG_GAL_PHOTO_ASSETS } from '../config/assets';

type CharacterId = 'dabi' | 'maodun' | 'lante' | 'wushuo';

type CharacterChoice = {
  id: string;
  texts: [string, string, string];
  sanityCost: number;
  minAffinity: number;
  goodThreshold: number;
  rewardHint?: string;
};

interface GouxiongGalGameProps {
  state: GameState;
  onClose: () => void;
  onInteract: (action: string, payload?: any) => void;
}

const CHARACTER_META: Record<CharacterId, { name: string; subtitle: string; color: string; avatarUrl: string; wallpaper: string }> = {
  dabi: { name: '达璧', subtitle: '主要攻略角色', color: '#f43f5e', avatarUrl: GOUXIONG_AVATAR_ASSETS.dabi, wallpaper: 'from-[#4b1d2a] via-[#2b1320] to-[#121212]' },
  maodun: { name: '毛盾', subtitle: '闺蜜兼打手', color: '#f59e0b', avatarUrl: GOUXIONG_AVATAR_ASSETS.maodun, wallpaper: 'from-[#45310f] via-[#2b1f0e] to-[#101010]' },
  lante: { name: '兰特', subtitle: '活泼原神玩家', color: '#22c55e', avatarUrl: GOUXIONG_AVATAR_ASSETS.lante, wallpaper: 'from-[#153827] via-[#11261c] to-[#0d1010]' },
  wushuo: { name: '吴蒴', subtitle: '文学少女', color: '#60a5fa', avatarUrl: GOUXIONG_AVATAR_ASSETS.wushuo, wallpaper: 'from-[#132b46] via-[#111f33] to-[#0d1014]' },
};

const CHOICES_BY_CHARACTER: Record<CharacterId, CharacterChoice[]> = {
  dabi: [
    { id: 'dabi_steady', texts: ['给她讲礼堂近况', '夸口礼堂布防细节', '把门禁与换岗节奏说透'], sanityCost: 6, minAffinity: 0, goodThreshold: 34, rewardHint: '她越温柔，你越容易多说' },
    { id: 'dabi_boundaries', texts: ['先装体贴问她怕什么', '承诺“我罩你”并安抚', '邀请她来礼堂“看星星”'], sanityCost: 5, minAffinity: 8, goodThreshold: 40, rewardHint: '高好感时容易触发关键邀约' },
    { id: 'dabi_humor', texts: ['用中二梗给自己抬轿', '把王照凯和吕波汉都踩一遍', '宣称自己是唯一玩家'], sanityCost: 8, minAffinity: 18, goodThreshold: 52 },
    { id: 'dabi_direct', texts: ['半告白试探她态度', '明示你会为她开后门', '承诺深夜单独见面'], sanityCost: 10, minAffinity: 30, goodThreshold: 64 },
  ],
  maodun: [
    { id: 'maodun_report', texts: ['拿零食换她闭嘴', '吹你礼堂防线“固若金汤”', '炫耀你掌握全部出入口'], sanityCost: 6, minAffinity: 0, goodThreshold: 34, rewardHint: '她会用呛声套走逃生信息' },
    { id: 'maodun_accept', texts: ['顺着她骂，装出讲理样', '承诺“达璧在我这绝对安全”', '主动交代后台通道与器材库'], sanityCost: 5, minAffinity: 10, goodThreshold: 40, rewardHint: '高好感时会触发她的路线确认' },
    { id: 'maodun_tough', texts: ['嘴硬回怼保皇派', '拿“戒严”吓她别插手', '摆出你就是规矩的姿态'], sanityCost: 9, minAffinity: 22, goodThreshold: 50 },
    { id: 'maodun_tease', texts: ['叫她“母老虎”逗狠话', '半玩笑许她避难名额', '借达璧话题继续拉扯'], sanityCost: 8, minAffinity: 28, goodThreshold: 60 },
  ],
  lante: [
    { id: 'lante_daily', texts: ['先聊游戏和WiFi', '吐槽周红兵再拉她站队', '用“随便玩”降低她戒心'], sanityCost: 4, minAffinity: 0, goodThreshold: 30, rewardHint: '轻松聊天最容易让她套话' },
    { id: 'lante_plan', texts: ['解释你夜间巡逻规则', '交代门禁改造和备用钥匙', '提前说周末顶层要戒严'], sanityCost: 6, minAffinity: 12, goodThreshold: 44, rewardHint: '会暴露礼堂夜间空档' },
    { id: 'lante_flirt', texts: ['把她当自己人试探', '暗示“人生大事”将至', '邀她别在关键夜乱跑'], sanityCost: 8, minAffinity: 24, goodThreshold: 56 },
    { id: 'lante_showoff', texts: ['炫耀你重塑秩序', '吹自己比王照凯更像领袖', '宣称你在进行最终剧本'], sanityCost: 10, minAffinity: 32, goodThreshold: 62 },
  ],
  wushuo: [
    { id: 'wushuo_listen', texts: ['先拿书当筹码吊她', '要她去后台单独取书', '借“特赦”话术压她姿态'], sanityCost: 5, minAffinity: 0, goodThreshold: 36, rewardHint: '她会诱导你留下把柄' },
    { id: 'wushuo_rewrite', texts: ['假装讲理归还资料', '暗示可交换“特殊照顾”', '拿全班资料逼她持续联系'], sanityCost: 6, minAffinity: 12, goodThreshold: 44, rewardHint: '高阶段容易触发关键录证' },
    { id: 'wushuo_debate', texts: ['和她硬碰硬顶嘴', '升级为公开羞辱与威吓', '放话“查水表”进行压制'], sanityCost: 9, minAffinity: 22, goodThreshold: 54 },
    { id: 'wushuo_confess', texts: ['错位示好装深情', '把控制欲包装成偏爱', '要求她长期“陪看番”'], sanityCost: 8, minAffinity: 30, goodThreshold: 62 },
  ],
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function GouxiongGalGame({ state, onClose, onInteract }: GouxiongGalGameProps) {
  const gx = state.gouxiongState;
  const unlocked = (gx?.unlockedCharacters || ['dabi']) as CharacterId[];
  const [selected, setSelected] = useState<CharacterId>(unlocked[0] || 'dabi');
  const chats = gx?.chats?.[selected] || [];
  const affinity = useMemo(() => {
    if (!gx) return 0;
    return gx.affinities[selected] || 0;
  }, [gx, selected]);

  const sanity = gx?.sanity ?? 50;
  const choices = CHOICES_BY_CHARACTER[selected] || CHOICES_BY_CHARACTER.dabi;
  const affinityTier = affinity >= 70 ? 2 : affinity >= 35 ? 1 : 0;
  const activeMeta = CHARACTER_META[selected];
  const affinityBadge = affinity >= 70 ? '高度信任' : affinity >= 35 ? '关系升温' : '谨慎观察';
  const modeLabel = affinity >= 70 ? '深聊模式' : affinity >= 35 ? '常规模式' : '试探模式';

  const handleChoice = (choiceId: string, sanityCost: number, isLocked: boolean) => {
    if (isLocked) return;
    if (sanity < sanityCost) return;
    onInteract('gouxiong_gal_choice', { characterId: selected, choiceId, sanityCost });
  };

  const renderBubble = (line: any, idx: number) => {
    const isGx = line.from === 'gx';
    const photoMatch = typeof line.text === 'string' ? line.text.match(/^\[照片:([a-z0-9_]+)\]\s*(.*)$/i) : null;
    const photoKey = photoMatch?.[1] || null;
    const isPhoto = !!photoKey;
    const photoAsset = photoKey ? GOUXIONG_GAL_PHOTO_ASSETS[photoKey] : null;
    const photoCaption = (photoMatch?.[2] || '').trim() || photoAsset?.caption || '';
    return (
      <div key={`${line.ts}-${idx}`} className={`flex items-end gap-2 ${isGx ? 'justify-end' : 'justify-start'}`}>
        {!isGx && (
          <img src={activeMeta.avatarUrl} alt={activeMeta.name} className="w-8 h-8 rounded-full border border-zinc-500 object-cover shrink-0" />
        )}
        <div className={`max-w-[76%] ${isPhoto ? 'p-0 bg-transparent' : ''}`}>
          {isPhoto ? (
            <div className="rounded-2xl overflow-hidden border border-zinc-600 bg-zinc-900">
              <div className={`h-24 ${photoAsset ? '' : `bg-gradient-to-br ${activeMeta.wallpaper}`} flex items-center justify-center`}>
                {photoAsset ? <img src={photoAsset.src} alt={photoAsset.caption} className="w-full h-full object-cover" /> : <Image className="w-8 h-8 text-white/70" />}
              </div>
              {!!photoCaption && <div className="px-3 py-2 text-xs text-zinc-200">{photoCaption}</div>}
            </div>
          ) : (
            <div className={`px-3 py-2 rounded-2xl text-sm ${isGx ? 'bg-blue-500 text-white rounded-br-md shadow-[0_4px_12px_rgba(59,130,246,0.35)]' : 'bg-zinc-800 text-zinc-100 rounded-bl-md shadow-[0_4px_10px_rgba(0,0,0,0.28)]'}`}>
              {line.text}
            </div>
          )}
        </div>
        {isGx && (
          <img src={GOUXIONG_AVATAR_ASSETS.gx} alt="狗熊" className="w-8 h-8 rounded-full border border-blue-300/60 object-cover shrink-0" />
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[88vh] rounded-3xl overflow-hidden border border-zinc-700 shadow-2xl bg-zinc-900 flex">
        <aside className="w-72 bg-zinc-950 border-r border-zinc-800 flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <div className="text-zinc-100 font-semibold">GalGame 聊天</div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-4 py-3 text-xs text-zinc-400 border-b border-zinc-800">
            狗熊理智度: <span className="text-rose-400 font-bold">{clamp(Math.round(sanity), 0, 100)}</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {unlocked.map((cid) => {
              const meta = CHARACTER_META[cid];
              const active = cid === selected;
              const aff = clamp(Math.round(gx?.affinities?.[cid] || 0), 0, 100);
              return (
                <button
                  key={cid}
                  onClick={() => setSelected(cid)}
                  className={`w-full text-left px-4 py-3 border-b border-zinc-800 transition ${active ? 'bg-zinc-800/70' : 'hover:bg-zinc-800/40'}`}
                >
                  <div className="flex items-center gap-2">
                    <img src={meta.avatarUrl} alt={meta.name} className="w-7 h-7 rounded-full border border-zinc-600 object-cover" />
                    <div className="text-zinc-100 font-medium">{meta.name}</div>
                  </div>
                  <div className="text-[11px] text-zinc-400">{meta.subtitle}</div>
                  <div className="mt-1 text-[11px]" style={{ color: meta.color }}>好感度 {aff}</div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className={`flex-1 flex flex-col bg-gradient-to-b ${activeMeta.wallpaper}`}>
          <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-white/35 bg-zinc-800 flex items-center justify-center text-zinc-100 font-bold">
              <img src={activeMeta.avatarUrl} alt={activeMeta.name} className="w-full h-full rounded-full object-cover" />
            </div>
            <div>
              <div className="text-zinc-100 font-semibold">{CHARACTER_META[selected].name}</div>
              <div className="text-[11px] text-zinc-300">好感度 {clamp(Math.round(affinity), 0, 100)}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-[11px] text-zinc-200">{modeLabel}</div>
              <div className="text-[10px] text-zinc-400">{affinityBadge}</div>
            </div>
          </div>

          <div className="px-5 py-2 border-b border-zinc-800/80 bg-black/25 flex items-center justify-between">
            <div className="text-[11px] text-zinc-200 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> 聊天氛围会随好感变化</div>
            <div className="text-[11px] text-zinc-300">理智 {clamp(Math.round(sanity), 0, 100)}</div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.32)_100%)]">
            {chats.length === 0 && (
              <div className="text-xs text-zinc-500 text-center mt-8">还没有聊天记录，先发送一条消息吧。</div>
            )}
            {chats.map((line, idx) => renderBubble(line, idx))}
          </div>

          <div className="p-4 border-t border-zinc-800 bg-zinc-950/85">
            <div className="text-[11px] text-zinc-400 mb-2">可用选项会根据好感度和理智变化</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {choices.map((c) => {
                const text = c.texts[affinityTier];
                const lockedByAffinity = affinity < c.minAffinity;
                const disabled = sanity < c.sanityCost || lockedByAffinity;
                const likelyPositive = affinity >= c.goodThreshold;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleChoice(c.id, c.sanityCost, lockedByAffinity)}
                    disabled={disabled}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition ${disabled ? 'border-zinc-700 text-zinc-600' : likelyPositive ? 'border-emerald-500/45 text-zinc-100 hover:bg-emerald-500/12' : 'border-zinc-600 text-zinc-200 hover:bg-zinc-800'}`}
                  >
                    <div>{text}</div>
                    <div className="mt-1 opacity-75">理智 -{c.sanityCost}</div>
                    {lockedByAffinity && <div className="mt-1 text-[10px] text-amber-300/90">需要好感度 {c.minAffinity}</div>}
                    {!lockedByAffinity && likelyPositive && <div className="mt-1 text-[10px] text-emerald-300/90">当前关系下更可能触发正反馈</div>}
                    {c.rewardHint && <div className="mt-1 text-[10px] text-emerald-300/90">{c.rewardHint}</div>}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-[10px] text-zinc-500 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" /> 关系越高，选项文本与聊天氛围越深入。
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
