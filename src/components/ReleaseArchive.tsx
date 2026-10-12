import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CURRENT_VERSION, CURRENT_RELEASE, RELEASE_GROUPS } from '../config/releases';

export default function ReleaseArchive({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState(RELEASE_GROUPS[0].id);
  const group = RELEASE_GROUPS.find(g => g.id === selected)!;
  return createPortal(
    <div className="release-archive" role="dialog" aria-modal="false" aria-labelledby="release-archive-title" onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } }}>
      <header className="archive-titlebar"><div><small>HEFEI ORDER · RELEASE ARCHIVE</small><h2 id="release-archive-title">版本档案</h2></div><button aria-label="关闭版本档案" onClick={onClose}>×</button></header>
      <div className="release-current"><span>当前版本 <b>v{CURRENT_VERSION}</b></span><time>{CURRENT_RELEASE.date}</time></div>
      <div className="release-layout">
        <nav className="release-index" aria-label="大版本更新">
          {RELEASE_GROUPS.map(g => <button key={g.id} style={{ '--release-color': g.color } as React.CSSProperties} aria-pressed={selected === g.id} onClick={() => setSelected(g.id)}>
            <small>v{g.id}</small><span>{g.title}</span>{g.id === RELEASE_GROUPS[0].id && <i>当前</i>}
          </button>)}
        </nav>
        <section className="release-reading" style={{ '--release-color': group.color } as React.CSSProperties} aria-label={group.title+'更新内容'} key={group.id}>
          <header><span className="release-series">v{group.id}</span><h3>{group.title}</h3><p>{group.summary}</p></header>
          <div className="release-records">{group.releases.map(release => <details key={release.id} open={release.version === CURRENT_VERSION}>
            <summary><div><b>{release.version ? 'v'+release.version : '后续维护'}</b><span>{release.title}</span></div><time>{release.date ?? '早期版本'}</time></summary>
            <ul>{release.notes.map(note => <li key={note}>{note}</li>)}</ul>
          </details>)}</div>
          <footer>大更新与小版本分别收录；未编号的历史更新按维护日期保留。</footer>
        </section>
      </div>
    </div>, document.body);
}
