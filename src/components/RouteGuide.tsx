import React, { useEffect, useState } from 'react';
import type { GameState } from '../types';
import OpeningCampaignBrief from './OpeningCampaignBrief';
import { ENDING_BY_ID, IMPLEMENTED_ENDING_COUNT } from '../data/endings';
import { ROUTE_TREE, type GuideNode } from '../data/routeGuide';
import { currentGuideId, findGuideNode, filterGuide, guideExpansion, guidePath, getRouteGuideStatus } from '../engine/routeGuidance';
import { CURRENT_VERSION } from '../config/releases';

const LABELS = { root: '开局', branch: '分歧', route: '路线', crisis: '危机', ending: '结局', info: '提示', golden: '金线' };

function GuideTreeNode({ node, expanded, onToggle, current, searching }: { node: GuideNode; expanded: Record<string, boolean>; onToggle: (id: string) => void; current?: string; searching: boolean; key?: React.Key }) {
  const hasChildren = !!node.children?.length;
  const open = expanded[node.id] === true;
  const ending = node.endingId ? ENDING_BY_ID[node.endingId] : undefined;
  return <article className={'guide-node guide-node--'+node.type+(current === node.id ? ' guide-node--current' : '')} data-guide-id={node.id}>
    <div className="guide-node-heading">
      {hasChildren ? <button onClick={() => onToggle(node.id)} aria-expanded={open} aria-label={(open ? '折叠' : '展开')+node.title}><span aria-hidden="true">{open ? '−' : '+'}</span></button> : <span className="guide-node-dot" aria-hidden="true">◇</span>}
      <span className="guide-node-kind">{LABELS[node.type]}</span><h3 className={ending?.color}>{ending?.title ?? node.title}</h3>
      {current === node.id && <small className="guide-current-tag">当前</small>}
    </div>
    <div className="guide-node-copy">
      {ending && <small>{ending.subtitle}</small>}
      {node.req && <p className="guide-node-requirement"><b>条件</b>{node.req}</p>}
      {node.story && <p>{node.story}</p>}
      {node.note && <p className="guide-node-note">{node.note}</p>}
    </div>
    {hasChildren && open && <div className="guide-children">{node.children!.map(child => <GuideTreeNode key={child.id} node={child} expanded={expanded} onToggle={onToggle} current={current} searching={searching}/>)}</div>}
  </article>;
}

export default function RouteGuide({ state }: { state?: GameState } = {}) {
  const id = state ? currentGuideId(state) : 'start';
  const status = state ? getRouteGuideStatus(state) : undefined;
  const [mode, setMode] = useState<'current'|'all'>(state ? 'current' : 'all');
  const [query, setQuery] = useState('');
  const initial = () => ({ ...guideExpansion(ROUTE_TREE, false), ...Object.fromEntries(guidePath(id).map(pathId => [pathId, true])) });
  const [expanded, setExpanded] = useState<Record<string, boolean>>(initial);
  useEffect(() => { setExpanded(initial()); }, [id]);
  const base = mode === 'current' ? findGuideNode(id) ?? ROUTE_TREE : ROUTE_TREE;
  const tree = filterGuide(query ? ROUTE_TREE : base, query);
  const searchTree = (value: string) => { setQuery(value); setExpanded(value.trim() ? guideExpansion(ROUTE_TREE, true) : initial()); };
  return <div className="route-guide">
    <div className="route-guide-toolbar">
      <div className="route-guide-modes">{state && <button aria-pressed={mode === 'current'} onClick={() => {setMode('current');setQuery('');setExpanded(initial());}}>当前路线</button>}<button aria-pressed={mode === 'all'} onClick={() => {setMode('all');setQuery('');setExpanded(initial());}}>全部路线</button></div>
      <label className="route-guide-search"><span className="sr-only">搜索路线、条件或结局</span><input value={query} onChange={e => searchTree(e.target.value)} placeholder="搜索路线 / 条件 / 结局" type="search"/></label>
      <div className="route-guide-expansion"><button onClick={() => setExpanded(guideExpansion(ROUTE_TREE, true))}>全部展开</button><button onClick={() => {setQuery('');setExpanded({...guideExpansion(ROUTE_TREE, false),[base.id]:true});}}>全部折叠</button></div>
    </div>
    <div className="route-guide-meta"><span>条件与当前版本同步 · v{CURRENT_VERSION}</span><span>{IMPLEMENTED_ENDING_COUNT}个可解锁结局</span></div>
    <div className="route-guide-reading">
      {status && !query && <section className="guide-live-status" style={{'--route-color':status.color} as React.CSSProperties} aria-label="当前路线进度">
        <small>{status.chapter}</small><h3>{status.title}</h3>
        {!!status.checks.length && <div className="guide-live-checks">{status.checks.map(check => <div key={check.label} className={check.met ? 'met' : 'pending'}><span>{check.met ? '✓' : '◇'} {check.label}</span><strong>{check.value}</strong></div>)}</div>}
        <p>{status.tip}</p>
      </section>}
      {state?.currentFocusTree === 'phase1' && !query && <OpeningCampaignBrief state={state}/>}
      {tree ? <GuideTreeNode node={tree} expanded={expanded} onToggle={nodeId => setExpanded(prev => ({...prev,[nodeId]:!prev[nodeId]}))} current={id} searching={!!query.trim()}/> : <p className="guide-empty" role="status">没有找到对应条目。试试人物、国策或结局名称。</p>}
    </div>
  </div>;
}
