import React from 'react';

export const NeonEmblem: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="60 0 1080 560"
      style={{ backgroundColor: 'transparent', width: '100%', height: '100%', display: 'block' }}
      {...props}
    >
      <defs>
        <radialGradient id="bg-halo" cx="50%" cy="48%" r="58%">
          <stop offset="0%" stopColor="#0f2b34" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#020406" stopOpacity="0" />
        </radialGradient>

        {/* 霓虹发光滤镜 */}
        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="soft-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 旗杆顶部的菱形枪尖 */}
        <g id="finial">
          <path d="M 0 -12 L 3 0 L 0 12 L -3 0 Z" stroke="#ff5e5e" strokeWidth="1.5" fill="none" />
          <line x1="0" y1="-12" x2="0" y2="20" stroke="#6ee8d6" strokeWidth="2" />
        </g>

        {/* 左侧 7 面旗帜与旗杆 (高复用编排) */}
        <g id="left-flags" filter="url(#neon-glow)">
          {/* 旗杆 */}
          <g stroke="#6ee8d6" strokeWidth="1.5">
            <line x1="600" y1="400" x2="440" y2="60" />
            <line x1="600" y1="400" x2="360" y2="70" />
            <line x1="600" y1="400" x2="280" y2="100" />
            <line x1="600" y1="400" x2="210" y2="150" />
            <line x1="600" y1="400" x2="150" y2="220" />
            <line x1="600" y1="400" x2="120" y2="310" />
            <line x1="600" y1="400" x2="130" y2="400" />
          </g>

          {/* 枪尖实例化 */}
          <use href="#finial" x="440" y="60" transform="rotate(-25 440 60)" />
          <use href="#finial" x="360" y="70" transform="rotate(-36 360 70)" />
          <use href="#finial" x="280" y="100" transform="rotate(-46 280 100)" />
          <use href="#finial" x="210" y="150" transform="rotate(-57 210 150)" />
          <use href="#finial" x="150" y="220" transform="rotate(-68 150 220)" />
          <use href="#finial" x="120" y="310" transform="rotate(-79 120 310)" />
          <use href="#finial" x="130" y="400" transform="rotate(-90 130 400)" />

          {/* 旗帜垂坠的褶皱波浪线 */}
          <g stroke="#ff5e5e" strokeWidth="1.5" fill="none">
            {/* 旗帜 7 */}
            <path d="M 440 60 C 400 150, 420 220, 460 230 C 470 230, 475 215, 480 200" />
            <path d="M 430 80 C 410 150, 430 200, 450 210" />
            {/* 旗帜 6 */}
            <path d="M 360 70 C 320 160, 350 250, 410 250 C 430 250, 440 230, 450 210" />
            <path d="M 350 90 C 330 160, 360 220, 400 230" />
            {/* 旗帜 5 */}
            <path d="M 280 100 C 240 200, 280 290, 350 290 C 370 290, 390 270, 400 250" />
            <path d="M 270 120 C 250 200, 290 260, 330 270" />
            {/* 旗帜 4 */}
            <path d="M 210 150 C 170 260, 220 340, 300 330 C 320 330, 340 310, 350 290" />
            <path d="M 200 170 C 180 260, 230 310, 280 310" />
            {/* 旗帜 3 */}
            <path d="M 150 220 C 120 320, 170 400, 250 380 C 270 370, 290 350, 300 330" />
            <path d="M 145 240 C 130 320, 180 370, 230 360" />
            {/* 旗帜 2 */}
            <path d="M 120 310 C 100 400, 150 460, 230 440 C 250 430, 260 400, 250 380" />
            <path d="M 115 330 C 110 400, 160 430, 210 420" />
            {/* 旗帜 1 */}
            <path d="M 130 400 C 130 460, 180 500, 260 480 C 280 470, 270 450, 230 440" />
            <path d="M 125 420 C 140 460, 190 480, 240 460" />
          </g>
        </g>
      </defs>

      <rect x="60" y="0" width="1080" height="560" fill="url(#bg-halo)" />

      {/* ================= 背景主旗帜 ================= */}
      <g id="main-background-flag" filter="url(#neon-glow)">
        <line x1="600" y1="300" x2="400" y2="30" stroke="#6ee8d6" strokeWidth="1.5" />
        <use href="#finial" x="400" y="30" transform="rotate(-28 400 30)" />
        <g stroke="#ff5e5e" strokeWidth="1.5" fill="none">
          <path d="M 400 30 C 550 50, 650 -10, 800 40 C 900 70, 950 50, 1020 60" />
          <path d="M 420 60 C 560 80, 640 20, 780 70 C 880 100, 930 80, 1000 90" />
          <path d="M 440 90 C 570 110, 630 50, 760 100 C 860 130, 910 110, 980 120" />
          <path d="M 460 120 C 580 140, 620 80, 740 130 C 840 160, 890 140, 960 150" />
        </g>
      </g>

      {/* ================= 左右对称侧旗帜 ================= */}
      <use href="#left-flags" />
      {/* 核心技巧：沿X=600中心对称镜像右侧旗帜 */}
      <use href="#left-flags" transform="translate(1200, 0) scale(-1, 1)" />

      {/* ================= 中央主体徽章 ================= */}
      <g id="central-emblem" filter="url(#neon-glow)">
        
        {/* 1. 外层青色边框 (带暗色填充以遮挡后方线条) */}
        <path 
          d="M 500 220 L 700 220 A 15 15 0 0 1 715 205 A 15 15 0 0 0 740 220 L 740 460 A 15 15 0 0 0 715 475 A 15 15 0 0 1 700 460 L 500 460 A 15 15 0 0 1 485 475 A 15 15 0 0 0 460 460 L 460 220 A 15 15 0 0 0 485 205 A 15 15 0 0 1 500 220 Z" 
          stroke="#6ee8d6" strokeWidth="2.5" fill="#06090e" strokeLinejoin="round" 
        />
        <path 
          d="M 510 230 L 690 230 A 15 15 0 0 1 705 215 A 15 15 0 0 0 730 230 L 730 450 A 15 15 0 0 0 705 465 A 15 15 0 0 1 690 450 L 510 450 A 15 15 0 0 1 495 465 A 15 15 0 0 0 470 450 L 470 230 A 15 15 0 0 0 495 215 A 15 15 0 0 1 510 230 Z" 
          stroke="#6ee8d6" strokeWidth="1" fill="none" 
        />
        {/* 边框底座 */}
        <path d="M 565 460 L 565 475 L 635 475 L 635 460" stroke="#6ee8d6" strokeWidth="2.5" fill="none" />
        <path d="M 575 475 L 575 485 L 625 485 L 625 475" stroke="#6ee8d6" strokeWidth="1.5" fill="none" />

        {/* 2. 金色太阳光芒 */}
        <g stroke="#ffcc5c" strokeWidth="1.5" fill="none">
          <path d="M 600 400 L 600 290 M 585 395 L 555 300 M 615 395 L 645 300 M 570 385 L 520 320 M 630 385 L 680 320 M 555 375 L 495 345 M 645 375 L 705 345" />
        </g>

        {/* 3. 青色地球经纬线 */}
        <g stroke="#6ee8d6" strokeWidth="1.5" fill="none">
          <circle cx="600" cy="350" r="50" fill="#06090e" />
          <ellipse cx="600" cy="350" rx="50" ry="20" />
          <ellipse cx="600" cy="350" rx="50" ry="8" />
          <ellipse cx="600" cy="350" rx="20" ry="50" />
          <ellipse cx="600" cy="350" rx="8" ry="50" />
        </g>

        {/* 4. 金色麦穗 (使用虚线和多重曲线模拟麦粒排布) */}
        <g stroke="#ffcc5c" fill="none">
          {/* 左侧麦穗 */}
          <path d="M 590 420 Q 530 410 490 350 Q 470 300 500 240" strokeWidth="5" strokeDasharray="6 4" />
          <path d="M 595 425 Q 540 420 500 360 Q 480 310 510 250" strokeWidth="2" />
          {/* 右侧麦穗 */}
          <path d="M 610 420 Q 670 410 710 350 Q 730 300 700 240" strokeWidth="5" strokeDasharray="6 4" />
          <path d="M 605 425 Q 660 420 700 360 Q 720 310 690 250" strokeWidth="2" />
        </g>

        {/* 5. 缠绕麦穗的红色缎带 */}
        <g stroke="#ff5e5e" strokeWidth="6" strokeLinecap="round">
          {/* 左侧 */}
          <path d="M 515 390 L 545 400 M 495 350 L 525 360 M 485 310 L 515 320 M 495 270 L 525 280 M 515 230 L 545 240" />
          {/* 右侧 */}
          <path d="M 685 390 L 655 400 M 705 350 L 675 360 M 715 310 L 685 320 M 705 270 L 675 280 M 685 230 L 655 240" />
          {/* 底部中央蝴蝶结连接 */}
          <path d="M 580 435 Q 600 450 620 435" strokeWidth="4" fill="none"/>
        </g>

        {/* 6. 金色镰刀与锤子 */}
        <g fill="none" transform="translate(600, 350) scale(1.4) translate(-600, -350)">
          {/* 锤子 */}
          <line x1="612" y1="362" x2="588" y2="338" stroke="#ffcc5c" strokeWidth="3.5" strokeLinecap="round" />
          <polygon points="580,345 595,330 590,325 575,340" fill="#ffcc5c" />
          {/* 镰刀 */}
          <path d="M 602 322 C 625 330, 630 360, 605 370 C 620 355, 610 335, 595 335 C 590 335, 585 340, 580 345 C 585 335, 595 325, 602 322 Z" fill="#ffcc5c" />
          <line x1="595" y1="365" x2="605" y2="375" stroke="#ffcc5c" strokeWidth="3.5" strokeLinecap="round" />
        </g>

        {/* 7. 顶端红色五角星 */}
        <polygon 
          points="600,185 603.5,195 614,195 605.5,201 609,211 600,205 591,211 594.5,201 586,195 596.5,195" 
          stroke="#ff5e5e" strokeWidth="2" fill="none" 
        />
        {/* 五角星内发光点 */}
        <polygon 
          points="600,192 602,197 607,197 603,200 605,205 600,202 595,205 597,200 593,197 598,197" 
          fill="#ffcc5c" opacity="0.8"
        />

        {/* 8. 额外光环细节 */}
        <ellipse cx="600" cy="350" rx="122" ry="95" stroke="#6ee8d6" strokeWidth="1.2" fill="none" opacity="0.55" />
        <ellipse cx="600" cy="350" rx="138" ry="108" stroke="#ff5e5e" strokeWidth="1" fill="none" opacity="0.45" strokeDasharray="6 5" />
        <g stroke="#ffcc5c" strokeWidth="1.5" opacity="0.85">
          <line x1="470" y1="350" x2="450" y2="350" />
          <line x1="750" y1="350" x2="730" y2="350" />
          <line x1="600" y1="252" x2="600" y2="232" />
          <line x1="600" y1="468" x2="600" y2="488" />
        </g>
      </g>

      {/* 外侧荣誉星 */}
      <g filter="url(#soft-glow)" stroke="#ff5e5e" fill="none" opacity="0.9">
        <polygon points="410,260 413,268 422,268 415,273 418,281 410,276 402,281 405,273 398,268 407,268" />
        <polygon points="790,260 793,268 802,268 795,273 798,281 790,276 782,281 785,273 778,268 787,268" />
      </g>

      {/* 底部绶带与标题 */}
      <g filter="url(#neon-glow)">
        <path d="M 470 500 Q 600 538 730 500 L 730 526 Q 600 556 470 526 Z" stroke="#ff5e5e" strokeWidth="2" fill="#1a0f0f" />
        <path d="M 470 500 L 438 515 L 470 526" stroke="#ff5e5e" strokeWidth="2" fill="none" />
        <path d="M 730 500 L 762 515 L 730 526" stroke="#ff5e5e" strokeWidth="2" fill="none" />
        <text x="600" y="521" textAnchor="middle" fontSize="20" letterSpacing="6" fill="#ffcc5c" fontFamily="monospace">最 高 苏 维 埃</text>
      </g>
    </svg>
  );
};

export default NeonEmblem;
