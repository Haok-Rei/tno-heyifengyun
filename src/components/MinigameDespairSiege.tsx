import { useState } from 'react';
import { type GameState } from '../types';
import { getCommandState } from '../engine/commandSystem';
import {
  SIEGE_ORDERS, SIEGE_WAVES, advanceSiegeDefense, canDeploySiegeOrder,
  deploySiegeOrder, startSiegeDefense, type SiegeOrder,
} from '../engine/siegeDefense';
import MechanicCrest from './MechanicCrest';

interface Props {
  state: GameState;
  onComplete: (success: boolean) => void;
  spendTPR: (amount: number) => boolean;
}

export default function MinigameDespairSiege({state, onComplete, spendTPR}: Props) {
  const [siege, setSiege] = useState(() => startSiegeDefense(
    getCommandState(state).preparation?.revolution ?? 0,
    Boolean(state.flags.despair_red_toad_ally),
  ));
  const [selected, setSelected] = useState<SiegeOrder>('debater');
  const [notice, setNotice] = useState('');
  const wave = SIEGE_WAVES[siege.round];

  const deploy = (index: number) => {
    if (!canDeploySiegeOrder(siege, index, selected, state.stats.tpr)) return;
    const cost = SIEGE_ORDERS[selected].papers;
    if (cost && !spendTPR(cost)) return;
    setSiege(deploySiegeOrder(siege, index, selected));
  };

  const advance = () => {
    if (siege.result) return;
    const next = advanceSiegeDefense(siege);
    setSiege(next);
    if (next.result) {
      onComplete(next.result === 'held');
    } else {
      setNotice(next.integrity < siege.integrity ? '有楼层被突破，压力已传至上方。' : '本轮各楼层守住了。');
    }
  };

  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-black/90 p-3">
      <section role="dialog" aria-label="B3围城保卫战" className="strategy-minigame station-panel station-MinigameSiege w-full max-w-4xl max-h-[92vh] overflow-auto bg-tno-panel border border-tno-highlight p-4 sm:p-6">
        <header className="flex flex-wrap items-center gap-4 border-b border-tno-border pb-4">
          <MechanicCrest kind="siege"/>
          <div className="flex-1 min-w-40">
            <h2 className="text-xl font-bold text-tno-highlight">B3围城保卫战</h2>
            <p className="text-sm text-tno-text/75">撑到第八轮。突破会损失1点完整度并向上层传压，顶层失守扣2点，归零即失败。</p>
          </div>
          <div className="text-sm text-tno-text tabular-nums">
            <div>波次 {siege.round + 1}/{SIEGE_WAVES.length}　行动点 {siege.ap}</div>
            <div className={siege.integrity === 1 ? 'text-rose-300' : 'text-emerald-300'}>防线完整度 {siege.integrity}　试卷 {Math.floor(state.stats.tpr)}</div>
          </div>
        </header>
        <div className="grid gap-4 pt-4 md:grid-cols-[1fr_16rem]">
          <div className="grid gap-2" aria-label="楼层与下一波压力">
            {siege.floors.map((floor, index) => ({floor, index})).reverse().map(({floor, index}) => {
              const canDeploy = canDeploySiegeOrder(siege, index, selected, state.stats.tpr);
              const projected = Math.max(0, floor.pressure + wave[index] - (floor.order ? SIEGE_ORDERS[floor.order.id].reduction : 0));
              return (
                <button key={index} type="button" onClick={() => deploy(index)} disabled={!canDeploy}
                  className="grid grid-cols-[2rem_1fr_auto] items-center gap-x-3 gap-y-1.5 border border-tno-border px-3 py-2 text-left enabled:hover:border-tno-highlight disabled:cursor-default">
                  <strong className="text-tno-highlight">{index + 1}F</strong>
                  <span className="text-sm">{floor.order ? SIEGE_ORDERS[floor.order.id].label + ' · ' + floor.order.remaining + '轮' : '待命'}</span>
                  <span className={projected >= 100 ? 'text-rose-300 text-sm' : 'text-amber-200 text-sm'}>{projected >= 100 ? '即将突破　' : ''}来压 +{wave[index]}</span>
                  <span className="col-start-2 block h-2 bg-black">
                    <span className="block h-full bg-red-500" style={{width: floor.pressure + '%'}}/>
                  </span>
                  <span className="text-sm tabular-nums">{floor.pressure}%</span>
                </button>
              );
            })}
            <div className="text-xs text-tno-text/70 min-h-4" role="status">{notice}</div>
          </div>
          <div className="space-y-2">
            {(Object.entries(SIEGE_ORDERS) as Array<[SiegeOrder, (typeof SIEGE_ORDERS)[SiegeOrder]]>).map(([id, order]) =>
              <button type="button" key={id} aria-pressed={selected === id} onClick={() => setSelected(id)}
                className={'w-full text-left border px-3 py-2 ' + (selected === id ? 'border-tno-highlight bg-tno-highlight/10' : 'border-tno-border')}>
                <strong className="block text-sm">{order.label}</strong>
                <span className="text-xs text-tno-text/75">{order.cost} AP · 每轮抵消 {order.reduction} · 持续 {order.turns} 轮{order.papers ? ' · ' + order.papers + ' 试卷' : ''}{id === 'picket' ? ' · 同时仅一队' : ''}</span>
              </button>
            )}
            <button type="button" onClick={advance} className="w-full border border-tno-highlight px-3 py-2 text-tno-highlight hover:bg-tno-highlight/10">结算本轮</button>
          </div>
        </div>
      </section>
    </div>
  );
}
