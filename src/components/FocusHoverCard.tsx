import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { placeFocusTooltip } from '../engine/tooltipPosition';

export default function FocusHoverCard({ anchor, children, onEnter, onLeave }: {
  anchor: HTMLElement; children: ReactNode; onEnter: () => void; onLeave: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 12, top: 12, maxHeight: window.innerHeight - 24 });
  useLayoutEffect(() => {
    const measure = () => {
      if (!ref.current || !anchor.isConnected) return;
      const card = ref.current.getBoundingClientRect();
      setPosition(placeFocusTooltip(anchor.getBoundingClientRect(), card.width, card.height, { width: window.innerWidth, height: window.innerHeight }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (ref.current) observer.observe(ref.current);
    window.addEventListener('resize', measure);
    document.addEventListener('scroll', measure, true);
    return () => { observer.disconnect(); window.removeEventListener('resize', measure); document.removeEventListener('scroll', measure, true); };
  }, [anchor, children]);
  return createPortal(<div ref={ref} data-focus-tooltip role="tooltip" tabIndex={0} className="focus-hover-card" style={position} onMouseEnter={onEnter} onMouseLeave={onLeave}
    onMouseDown={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>{children}</div>, document.body);
}
