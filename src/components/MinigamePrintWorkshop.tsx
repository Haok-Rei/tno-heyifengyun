import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types';
import { Printer, ShieldAlert, Zap, FileText } from 'lucide-react';
import { getCommandState } from '../engine/commandSystem';

interface Props { state: GameState; onComplete: (r: PrintResult) => void; spendPP: (n: number) => boolean; }
export interface PrintResult { tier: 'critical'|'success'|'partial'|'failure'; printed: number; busted: number; labCtrl: number; }

const PHRASES = ['废除量化考核','恢复社团自由','打倒做题工厂','学生不是囚犯','我们需要睡眠','拒绝形式主义','教育不是生意','还我课间十分','不做考试机器','自由属于合一'];
const CENSOR = ['X', '#', '*', '!', '?'];

export default function MinigamePrintWorkshop({ state, onComplete, spendPP }: Props) {
  const fieldSupport = Math.min(3, getCommandState(state).preparation?.revolution || 0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [started, setStarted] = useState(false);
  const [printed, setPrinted] = useState(() => fieldSupport * 2);
  const [busted, setBusted] = useState(0);
  const [current, setCurrent] = useState('');
  const [target, setTarget] = useState('');
  const [input, setInput] = useState('');
  const [alert, setAlert] = useState(0); // 保安巡查警报 0-100
  const [hidden, setHidden] = useState(false); // 隐藏印刷机
  const [shake, setShake] = useState(false);
  const [combo, setCombo] = useState(0);
  const loopRef = useRef<NodeJS.Timeout|null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const newTarget = () => {
    const p = PHRASES[Math.floor(Math.random() * PHRASES.length)];
    // 随机加入审查干扰
    const c = CENSOR[Math.floor(Math.random() * CENSOR.length)];
    const pos = Math.floor(Math.random() * p.length);
    const t = p.substring(0, pos) + c + p.substring(pos + 1);
    setTarget(p); setCurrent(t); setInput('');
  };

  useEffect(() => { if (started) newTarget(); }, [started]);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;
    loopRef.current = setInterval(() => {
      setTimeLeft(p => { if (p <= 1) { clearInterval(loopRef.current!); return 0; } return p - 1; });
      // 警报随机上升（降低速率）
      setAlert(p => {
        const inc = Math.random() * (hidden ? 1 : 3);
        const n = Math.min(100, p + inc);
        if (n >= 100 && !hidden) {
          setBusted(b => b + 1);
          setCombo(0);
          return 25;
        }
        return n;
      });
    }, 1000);
    return () => clearInterval(loopRef.current!);
  }, [started, timeLeft, hidden]);

  useEffect(() => { if (timeLeft === 0) finish(); }, [timeLeft]);

  const finish = () => {
    let tier: PrintResult['tier']; let ctrl: number;
    if (printed >= 10) { tier = 'critical'; ctrl = 22; }
    else if (printed >= 6) { tier = 'success'; ctrl = 14; }
    else if (printed >= 2) { tier = 'partial'; ctrl = 6; }
    else { tier = 'failure'; ctrl = -6; }
    onComplete({ tier, printed, busted, labCtrl: ctrl });
  };

  const submit = () => {
    if (input === target) {
      setPrinted(p => p + 1); setCombo(c => c + 1); setAlert(p => Math.max(0, p - 10));
      if (combo >= 4) { setAlert(p => Math.max(0, p - 20)); } // 连击奖励
      newTarget();
    } else {
      setShake(true); setTimeout(() => setShake(false), 300);
      setAlert(p => Math.min(100, p + 10));
    }
    setInput('');
  };

  const hide = () => {
    if (spendPP(10)) { setHidden(true); setTimeout(() => setHidden(false), 4000); }
    else { setShake(true); setTimeout(() => setShake(false), 400); }
  };

  const speedUp = () => {
    if (spendPP(20)) { setTimeLeft(p => Math.max(1, p - 8)); setAlert(p => Math.min(100, p + 20)); }
    else { setShake(true); setTimeout(() => setShake(false), 400); }
  };

  return (
    <div className={`absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 ${shake?'shake':''}`}>
      <div className="bg-[#0a0a14] border-2 border-[#06B6D4]/40 max-w-2xl w-full p-6 shadow-[0_0_60px_rgba(6,182,212,0.15)] relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(6,182,212,0.1) 2px,rgba(6,182,212,0.1) 4px)'}}/>

        {!started && (
          <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-8 text-center">
            <Printer className="w-16 h-16 text-[#06B6D4] mb-4" />
            <h2 className="text-3xl font-black text-[#06B6D4] mb-3 tracking-[0.3em]">地 下 印 刷 所</h2>
            {fieldSupport > 0 && <p className="text-emerald-300 text-xs mb-2">地下联络工作组筹备 {fieldSupport} 份 · 预先印制 +{fieldSupport * 2}</p>}
            <p className="text-white/70 mb-2 text-sm max-w-md">实验楼机房 · 40秒内尽可能多地印刷革命传单</p>
            <div className="text-white/50 text-xs mb-6 max-w-md space-y-1">
              <p>· 屏幕显示被审查污染的标语——输入正确原文发布</p>
              <p>· 保安巡查警报持续上升，满格则被没收一批传单</p>
              <p>· 隐藏印刷机(12PP/4秒)减缓警报 · 加速印刷(20PP)跳过8秒</p>
              <p className="text-[#06B6D4] mt-2">连续正确输入可获得连击奖励！</p>
            </div>
            <button onClick={() => setStarted(true)} className="bg-[#06B6D4]/20 border-2 border-[#06B6D4] text-[#06B6D4] font-black py-3 px-10 text-lg hover:bg-[#06B6D4] hover:text-black transition-all tracking-widest">开 始 印 刷</button>
          </div>
        )}

        <div className="flex justify-between items-center mb-4 border-b border-[#06B6D4]/30 pb-3">
          <div className="flex items-center gap-3">
            <Printer className="w-7 h-7 text-[#06B6D4]" />
            <div><h2 className="text-xl font-black text-[#06B6D4] tracking-[0.2em]">地下印刷所</h2>
              <div className="text-[10px] text-white/40">实验室机房 · 已印刷 {printed} 份 | 被没收 {busted} 份{combo >= 3 ? ` | ${combo}连击!` : ''}</div></div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-black ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-[#06B6D4]'}`}>{timeLeft}s</div>
            <div className="text-[10px] text-white/40">PP: {Math.floor(state.stats.pp)}</div>
          </div>
        </div>

        {/* 警报条 */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-white/40 mb-1"><span>保安巡查</span><span className={alert>70?'text-red-400':''}>{Math.round(alert)}%</span></div>
          <div className="h-3 bg-[#0d1117] border border-[#1a2a3a] rounded overflow-hidden">
            <div className={`h-full transition-all duration-300 ${alert>70?'bg-red-500':alert>40?'bg-yellow-500':'bg-[#06B6D4]'}`} style={{width:`${alert}%`}} />
          </div>
        </div>

        {hidden && <div className="mb-3 p-2 bg-cyan-900/20 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2"><ShieldAlert className="w-4 h-4"/>印刷机已隐藏——巡查减缓</div>}

        {/* 印刷界面 */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <div className="text-[10px] text-white/30 mb-1">被审查污染的标语（找出并修正错误字符）</div>
            <div className="text-2xl font-black text-red-400 tracking-wider bg-[#0d1117] px-6 py-3 border border-red-500/20 rounded">{current}</div>
          </div>
          <form onSubmit={e => { e.preventDefault(); submit(); }} className="flex gap-2 w-full max-w-md">
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              className="flex-1 bg-[#0d1117] border border-[#06B6D4]/30 text-[#06B6D4] font-mono text-lg px-4 py-2 outline-none focus:border-[#06B6D4] rounded"
              placeholder="输入正确原文..." autoFocus />
            <button type="submit" className="bg-[#06B6D4]/20 border border-[#06B6D4] text-[#06B6D4] font-bold px-6 py-2 hover:bg-[#06B6D4] hover:text-black transition-all rounded">发布</button>
          </form>
        </div>

        <div className="mt-4 pt-4 border-t border-[#06B6D4]/20 flex gap-3">
          <button onClick={hide} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-[#06B6D4]/50 text-[#06B6D4] hover:bg-[#06B6D4]/10 transition-all"><ShieldAlert className="w-3.5 h-3.5"/>隐藏 (12PP)</button>
          <button onClick={speedUp} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 transition-all"><Zap className="w-3.5 h-3.5"/>加速 (20PP)</button>
          <div className="flex-1"/>
          <button onClick={finish} className="px-6 py-2 text-xs font-black border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all tracking-wider">收工</button>
        </div>
      </div>
    </div>
  );
}
