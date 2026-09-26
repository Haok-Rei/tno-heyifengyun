import React, { useEffect, useState } from 'react';
import { ASSET_URLS } from '../config/assets';

interface StartMenuProps {
  onStartGame: () => void;
  onTutorial: () => void;
  onSettings: () => void;
  onGallery: () => void;
}

const MENU_ITEMS = [
  {
    key: 'start',
    label: '开始游戏',
    subtitle: 'Single Player Campaign',
    hoverText: '从 2023 年秋季入局，管理危机、路线与叙事节奏。',
    image: ASSET_URLS.ui_thumbnail_1,
  },
  {
    key: 'tutorial',
    label: '教程',
    subtitle: 'Gameplay Doctrine',
    hoverText: '快速掌握核心指标、决议逻辑与路线分歧。',
    image: ASSET_URLS.ui_thumbnail_2,
  },
  {
    key: 'gallery',
    label: '结局档案',
    subtitle: 'Ending Archive',
    hoverText: '回顾已解锁的结局，重读最近一局的编年史。',
    image: ASSET_URLS.ui_thumbnail_4,
  },
  {
    key: 'settings',
    label: '设置',
    subtitle: 'System Control',
    hoverText: '调整音量、速度、存档策略与系统参数。',
    image: ASSET_URLS.ui_thumbnail_3,
  },
] as const;

const TITLE_QUOTES = [
  '重拾民主，再塑合一。',
  '革命无罪，造反有理！',
  '我抛出一个问题，你们不思考，还在那里笑？',
  '怀天下抱负，做未来主人。',
  '苟利国家生死以，岂因祸福避趋之。',
] as const;

export default function StartMenu({ onStartGame, onTutorial, onSettings, onGallery }: StartMenuProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isQuoteVisible, setIsQuoteVisible] = useState(true);

  useEffect(() => {
    const timeoutIds: number[] = [];

    const interval = window.setInterval(() => {
      // Fade out
      setIsQuoteVisible(false);

      // Pause while invisible, then switch quote and fade in
      const switchTimer = window.setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % TITLE_QUOTES.length);

        const fadeInTimer = window.setTimeout(() => {
          setIsQuoteVisible(true);
        }, 500);
        timeoutIds.push(fadeInTimer);
      }, 800);
      timeoutIds.push(switchTimer);
    }, 10000);

    return () => {
      window.clearInterval(interval);
      timeoutIds.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const handleClick = (key: (typeof MENU_ITEMS)[number]['key']) => {
    if (key === 'start') onStartGame();
    if (key === 'tutorial') onTutorial();
    if (key === 'gallery') onGallery();
    if (key === 'settings') onSettings();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-tno-bg crt">
      <div className="absolute inset-0">
        <img
          src={ASSET_URLS.ui_main_background}
          alt="Main Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.16)_42%,rgba(0,0,0,0.55)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,10,14,0.16)_0%,rgba(8,10,14,0.08)_42%,rgba(8,10,14,0.42)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(255,88,133,0.14),transparent_42%),radial-gradient(circle_at_82%_18%,rgba(93,192,255,0.14),transparent_45%)]" />
      </div>

      <div className="absolute top-5 left-5 z-30 md:top-7 md:left-8">
        <img
          src={ASSET_URLS.ui_game_logo}
          alt="Game Logo"
          className="h-36 w-36 object-contain drop-shadow-[0_0_18px_rgba(255,255,255,0.36)] md:h-52 md:w-52"
        />
      </div>

      <div className="absolute top-5 right-5 z-30 md:top-7 md:right-8">
        <img
          src={ASSET_URLS.ui_studio_logo}
          alt="Studio Logo"
          className="h-[10.5rem] w-[10.5rem] object-contain drop-shadow-[0_0_22px_rgba(255,255,255,0.36)] md:h-[15.5rem] md:w-[15.5rem]"
        />
      </div>

      <div className="relative z-20 flex h-full flex-col px-4 pb-8 pt-20 md:px-10 md:pb-10 md:pt-14">
        <div className="mx-auto mt-6 w-full max-w-6xl text-center md:mt-8">
          <p className="mb-2 text-sm uppercase tracking-[0.4em] text-white/75 md:text-base">
            The New Order Interactive Narrative
          </p>
          <div className="relative mx-auto max-w-5xl px-4 py-3 md:px-8">
            <div className="pointer-events-none absolute inset-x-6 top-1/2 h-24 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(6,10,18,0.74)_0%,rgba(6,10,18,0.32)_52%,rgba(6,10,18,0)_100%)] blur-[2px] md:inset-x-16 md:h-28" />
            <h1
              className="relative mb-2 whitespace-nowrap text-[clamp(1.5rem,6.2vw,5.2rem)] font-black uppercase leading-[0.96] tracking-[0.12em] text-white"
              style={{
                textShadow:
                  '0 2px 0 rgba(255,255,255,0.88), 0 0 28px rgba(255,72,120,0.82), 0 0 74px rgba(82,172,255,0.64), 0 0 115px rgba(255,255,255,0.32)',
                WebkitTextStroke: '1px rgba(0,0,0,0.35)',
              }}
            >
              TNO:合肥一中风云
            </h1>
          </div>
          <p
            className={`mx-auto mt-3 min-h-[2.25rem] max-w-3xl text-sm text-white/92 transition-opacity md:text-lg ${
              isQuoteVisible ? 'opacity-100 duration-700' : 'opacity-0 duration-700'
            }`}
          >
            {TITLE_QUOTES[quoteIndex]}
          </p>
        </div>

        <div className="mt-auto mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4">
          {MENU_ITEMS.map((item) => (
            <div
              key={item.key}
              className="group relative overflow-hidden border border-cyan-300/60 bg-black/45 shadow-[0_0_0_1px_rgba(0,255,255,0.12),0_10px_32px_rgba(0,0,0,0.65)] transition-all duration-300 hover:-translate-y-1 hover:border-pink-300/80"
            >
              <div className="pointer-events-none absolute inset-0 z-20 border border-cyan-300/60 transition-all duration-300 group-hover:border-cyan-100 group-hover:shadow-[inset_0_0_26px_rgba(180,240,255,0.34),0_0_24px_rgba(140,224,255,0.25)]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[2px] bg-gradient-to-r from-transparent via-cyan-100/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[2px] bg-gradient-to-b from-transparent via-pink-200/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[2px] bg-gradient-to-b from-transparent via-yellow-200/65 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <img
                src={item.image}
                alt={item.label}
                className="h-64 w-full object-cover brightness-[0.72] contrast-[1.02] saturate-[1.08] transition-all duration-500 group-hover:scale-[1.04] group-hover:brightness-100 group-hover:contrast-[1.14] group-hover:saturate-[1.24] md:h-80"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(2,6,12,0.96)_0%,rgba(2,6,12,0.5)_42%,rgba(2,6,12,0.16)_100%)]" />

              <div className="absolute inset-x-0 bottom-0 z-20 p-4">
                <p className="mb-2 text-center text-xs uppercase tracking-[0.22em] text-cyan-200/90 md:text-sm">
                  {item.subtitle}
                </p>
                <p className="mb-2 max-h-0 overflow-hidden text-center text-xs leading-relaxed opacity-0 transition-all duration-300 group-hover:max-h-16 group-hover:opacity-100 md:text-sm">
                  <span className="text-cyan-200">{item.hoverText.slice(0, 10)}</span>
                  <span className="text-pink-200">{item.hoverText.slice(10, 22)}</span>
                  <span className="text-yellow-200">{item.hoverText.slice(22)}</span>
                </p>
                <button
                  onClick={() => handleClick(item.key)}
                  className="w-full border border-cyan-200 bg-black/70 px-4 py-2 text-base font-bold tracking-[0.12em] text-cyan-100 transition-all duration-300 hover:border-pink-300 hover:bg-pink-500/20 hover:text-white md:text-lg"
                >
                  {item.label}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-3 text-center text-[11px] uppercase tracking-[0.2em] text-white/55 md:text-xs">
          TNO v9.3.4 | Hefei Order
          <a href="/credits.txt" target="_blank" rel="noreferrer" className="ml-3 hover:text-white underline underline-offset-4">素材鸣谢</a>
        </div>
      </div>
    </div>
  );
}
