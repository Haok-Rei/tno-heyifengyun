export function placeFocusTooltip(anchor: { left: number; right: number; top: number; bottom: number }, width: number, height: number, viewport: { width: number; height: number }) {
  const margin = 12, gap = 10;
  const maxHeight = Math.max(40, viewport.height - margin * 2);
  const actualHeight = Math.min(height, maxHeight);
  const below = viewport.height - anchor.bottom - margin - gap;
  const above = anchor.top - margin - gap;
  const proposed = below >= actualHeight || below >= above ? anchor.bottom + gap : anchor.top - actualHeight - gap;
  return {
    left: Math.max(margin, Math.min(viewport.width - width - margin, (anchor.left + anchor.right - width) / 2)),
    top: Math.max(margin, Math.min(viewport.height - actualHeight - margin, proposed)), maxHeight,
  };
}
