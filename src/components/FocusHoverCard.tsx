import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function Preview({anchor, children, width = 310, delay = 140, side, point, focus, dismiss}: {
  anchor: HTMLElement; children: ReactNode; width?: number; delay?: number; side?: string; point?: {x:number;y:number}; focus?: boolean; dismiss: () => void;
}) {
  const card = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const close = useRef(dismiss);
  close.current = dismiss;
  useEffect(() => {
    setReady(false);
    const timer = window.setTimeout(() => setReady(true), delay);
    function hide() { window.clearTimeout(timer); setReady(false); close.current(); }
    document.addEventListener('scroll', hide, true);
    document.addEventListener('wheel', hide, {capture:true, passive:true});
    window.addEventListener('resize', hide);
    return () => { window.clearTimeout(timer); document.removeEventListener('scroll', hide, true); document.removeEventListener('wheel', hide, true); window.removeEventListener('resize', hide); };
  }, [anchor, delay]);
  useLayoutEffect(() => {
    const el = card.current;
    if (!ready || !el) return;
    function position() {
      if (!el) return;
      const drawer = anchor.closest('.decisions-drawer,.government-drawer,.district-window,[aria-label="校内法案选择"]');
      const rect = anchor.getBoundingClientRect(), edge = drawer?.getBoundingClientRect() ?? rect;
      const right = edge.right + 8, left = edge.left - el.offsetWidth - 8;
      const preferRight = drawer ? !drawer.matches('.decisions-drawer,.district-window') : side === 'right' || rect.left < innerWidth / 2;
      const x = preferRight ? (right + el.offsetWidth <= innerWidth - 8 ? right : left) : (left >= 8 ? left : right);
      const credits = anchor.matches('.start-credits-trigger');
      const dockX = credits ? (left >= 8 ? left : rect.right-el.offsetWidth) : x;
      const dockY = credits ? rect.bottom - el.offsetHeight : rect.top;
      el.style.left = Math.max(8, Math.min(point ? rect.left+point.x+14 : dockX, innerWidth-el.offsetWidth-8))+'px';
      el.style.top = Math.max(8, Math.min(point ? rect.top+point.y+14 : dockY, innerHeight-el.offsetHeight-8))+'px';
    }
    position();
    const observer = new ResizeObserver(position);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ready, anchor, side, point]);
  return ready && createPortal(<div ref={card} role="tooltip" data-focus-tooltip={focus || undefined} tabIndex={focus ? 0 : undefined}
    className={'archive-preview'+(focus?' focus-hover-card':'')} style={{width:Math.min(width,innerWidth-16),pointerEvents:'none'}}>{children}</div>,document.body);
}

export default function FocusHoverCard({anchor, children, onLeave}: {anchor: HTMLElement; children: ReactNode; onEnter: () => void; onLeave: () => void}) {
  return <Preview anchor={anchor} focus dismiss={onLeave}>{children}</Preview>;
}

// For inline help nested inside an existing button or label, preserve its DOM and handlers.
export function InlineHint({children}: {children: ReactNode}) {
  const marker = useRef<HTMLSpanElement>(null);
  const [anchor, setAnchor] = useState<HTMLElement|null>(null);
  useEffect(() => {
    const parent = marker.current?.parentElement;
    if (!parent) return;
    const show = () => setAnchor(parent);
    const hide = () => setAnchor(null);
    parent.addEventListener('pointerenter', show);
    parent.addEventListener('pointerleave', hide);
    parent.addEventListener('focusin', show);
    parent.addEventListener('focusout', hide);
    return () => {
      parent.removeEventListener('pointerenter', show);
      parent.removeEventListener('pointerleave', hide);
      parent.removeEventListener('focusin', show);
      parent.removeEventListener('focusout', hide);
    };
  }, []);
  return <><span hidden ref={marker}/>{anchor && <Preview anchor={anchor} dismiss={()=>setAnchor(null)}>{children}</Preview>}</>;
}
