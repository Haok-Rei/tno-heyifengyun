import React, { useRef, useState } from 'react';
import { Preview } from './FocusHoverCard';
interface HoverWindowProps {
  children: React.ReactNode;
  content: React.ReactNode;
  /** 小窗宽度（默认 300） */
  width?: number;
  /** 预估内容高度（用于决定向上还是向下弹出，默认 240） */
  estimateHeight?: number;
  /** 打开延迟 ms（默认 80） */
  openDelay?: number;
  /** 悬浮窗相对于触发元素的位置 */
  placement?: 'auto' | 'right';
  key?: React.Key;
}

export default function HoverWindow({ children, content, width = 300, openDelay = 140, placement }: HoverWindowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  return <div ref={ref} className="relative" onMouseEnter={() => setActive(true)} onMouseLeave={() => setActive(false)}
    onFocus={() => setActive(true)} onBlur={() => setActive(false)}>
    {children}
    {active && ref.current && <Preview anchor={ref.current} width={width} delay={openDelay} side={placement} dismiss={() => setActive(false)}>{content}</Preview>}
  </div>;
}
