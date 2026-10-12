import React from 'react';
import { createPortal } from 'react-dom';
import type { GameState } from '../types';
import RouteGuide from './RouteGuide';
import { useArchiveDialog } from '../hooks/useArchiveDialog';

export default function RouteGuideDialog({ state, onClose }: { state: GameState; onClose: () => void }) {
  const ref = useArchiveDialog(onClose);
  return createPortal(<div className="archive-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="guide-dialog" ref={ref} role="dialog" aria-modal="true" aria-labelledby="route-guide-title" tabIndex={-1}>
      <header className="archive-titlebar"><div><small>HEFEI ORDER · ROUTE ATLAS</small><h2 id="route-guide-title">路线指南</h2></div><button aria-label="关闭路线指南" onClick={onClose}>×</button></header>
      <div className="guide-dialog-body"><RouteGuide state={state}/></div>
    </div>
  </div>, document.body);
}
