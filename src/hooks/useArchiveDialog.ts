import { useEffect, useRef } from 'react';

/** Dialog-local shortcuts must not reach the game's Escape menu or move focus behind the overlay. */
export function useArchiveDialog(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const items = () => (Array.from(ref.current?.querySelectorAll('button:not(:disabled),input,summary,a[href],[tabindex="0"]') ?? []) as HTMLElement[]).filter(el => el.getClientRects().length);
    ref.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); close.current(); }
      // Preserve native typing/button activation while isolating Space and console shortcuts from the game.
      if (event.key.length === 1) event.stopPropagation();
      if (event.key === 'Tab') {
        const focusable = items();
        if (!focusable.length) { event.preventDefault(); return; }
        const index = focusable.indexOf(document.activeElement as HTMLElement);
        if (index < 0 || event.shiftKey && index === 0 || !event.shiftKey && index === focusable.length - 1) {
          event.preventDefault(); (event.shiftKey ? focusable.at(-1) : focusable[0])?.focus();
        }
      }
    };
    window.addEventListener('keydown', keydown, true);
    return () => { window.removeEventListener('keydown', keydown, true); if (previous?.isConnected) previous.focus(); };
  }, []);
  return ref;
}
