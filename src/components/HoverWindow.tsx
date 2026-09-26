import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * HoverWindow (v8.11) — 视口固定定位的悬浮小窗
 *
 * 解决 absolute 悬浮窗在滚动容器内的两个问题：
 * 1. 超出容器边界被裁切（看不到完整内容）
 * 2. 撑大滚动区域（悬停后出现多余滚动条）
 *
 * 实现：鼠标悬停触发后测量触发元素 rect，用 portal 渲染到 body，
 * 以 fixed 定位在视口内（自动上下翻转 + 左右夹紧），带 120ms 关闭延迟
 * 防止鼠标移入小窗瞬间的"间隙消失"。
 */

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

export default function HoverWindow({ children, content, width = 300, estimateHeight = 240, openDelay = 80, placement = 'auto' }: HoverWindowProps) {
  const [pos, setPos] = useState<{ top: number; left: number; maxHeight: number; show: boolean }>({
    top: 0, left: 0, maxHeight: 400, show: false,
  });
  const triggerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const openTimer = useRef<number | null>(null);

  const clearTimers = () => {
    if (closeTimer.current !== null) { window.clearTimeout(closeTimer.current); closeTimer.current = null; }
    if (openTimer.current !== null) { window.clearTimeout(openTimer.current); openTimer.current = null; }
  };

  const scheduleClose = () => {
    clearTimers();
    closeTimer.current = window.setTimeout(() => setPos(p => ({ ...p, show: false })), 120);
  };

  const scheduleOpen = () => {
    if (closeTimer.current !== null) { window.clearTimeout(closeTimer.current); closeTimer.current = null; }
    if (openTimer.current !== null) return; // 已在排队打开
    openTimer.current = window.setTimeout(() => {
      openTimer.current = null;
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let top: number;
      let left: number;
      if (placement === 'right') {
        top = Math.max(8, Math.min(rect.top - 6, vh - estimateHeight - 8));
        left = rect.right + width + 8 <= vw
          ? rect.right + 8
          : Math.max(8, rect.left - width - 8);
      } else {
        top = rect.bottom + 6;
        if (top + estimateHeight > vh) top = Math.max(8, rect.top - estimateHeight - 6);
        left = Math.max(8, Math.min(rect.left, vw - width - 8));
      }
      const maxHeight = Math.min(vh - top - 8, 420);
      setPos({ top, left, maxHeight, show: true });
    }, openDelay);
  };

  return (
    <>
      <div ref={triggerRef} className="relative" onMouseEnter={scheduleOpen} onMouseLeave={scheduleClose}>
        {children}
      </div>
      {pos.show && createPortal(
        <div
          className="fixed z-[150]"
          style={{ top: pos.top, left: pos.left, width, maxHeight: pos.maxHeight, overflowY: 'auto' }}
          onMouseEnter={scheduleOpen}
          onMouseLeave={scheduleClose}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
}
