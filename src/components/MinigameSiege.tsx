import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import { Shield, Users, FileText, AlertTriangle } from 'lucide-react';
import { getCommandState } from '../engine/commandSystem';

interface MinigameSiegeProps {
  state: GameState;
  onComplete: (success: boolean) => void;
  spendTPR: (amount: number) => boolean;
}

type UnitType = 'debater' | 'picket' | 'barricade' | null;

interface FloorState {
  level: number;
  enemyProgress: number; // 0 to 100
  unit: UnitType;
}

export default function MinigameSiege({ state, onComplete, spendTPR }: MinigameSiegeProps) {
  const fieldSupport = Math.min(3, getCommandState(state).preparation?.revolution || 0);
  const [turn, setTurn] = useState(1);
  const [actionPoints, setActionPoints] = useState(() => 3 + fieldSupport);
  const [floors, setFloors] = useState<FloorState[]>([
    { level: 5, enemyProgress: 0, unit: null },
    { level: 4, enemyProgress: 0, unit: null },
    { level: 3, enemyProgress: 0, unit: null },
    { level: 2, enemyProgress: 0, unit: null },
    { level: 1, enemyProgress: 20, unit: null }, // Enemies start at floor 1
  ]);
  const [selectedUnit, setSelectedUnit] = useState<UnitType>(null);
  const [shake, setShake] = useState(false);

  const triggerError = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleDeploy = (floorIndex: number) => {
    if (!selectedUnit || actionPoints <= 0) {
      triggerError();
      return;
    }

    if (selectedUnit === 'barricade' && !spendTPR(200)) {
      triggerError();
      return;
    }

    setFloors(prev => {
      const next = [...prev];
      if (next[floorIndex].unit) {
        triggerError();
        return prev;
      }
      next[floorIndex].unit = selectedUnit;
      return next;
    });

    setActionPoints(prev => prev - 1);
    setSelectedUnit(null);
  };

  const endTurn = () => {
    let isGameOver = false;
    let nextFloors = [...floors].map(f => ({ ...f }));

    // Process from bottom to top (index 4 to 0)
    for (let i = 4; i >= 0; i--) {
      const floor = nextFloors[i];
      
      // Base enemy advance
      let advance = 30;

      // Apply unit effects
      if (floor.unit === 'debater') {
        advance = 10; // Slows down
      } else if (floor.unit === 'picket') {
        advance = -20; // Pushes back
      } else if (floor.unit === 'barricade') {
        advance = 0; // Blocks completely
      }

      floor.enemyProgress = Math.max(0, floor.enemyProgress + advance);

      // If progress > 100, they move to the next floor up
      if (floor.enemyProgress >= 100) {
        floor.enemyProgress = 100;
        if (i > 0) {
          nextFloors[i - 1].enemyProgress += 20; // Spill over to next floor
        } else {
          // Reached floor 5 and overwhelmed it
          isGameOver = true;
        }
      }
    }

    setFloors(nextFloors);

    if (isGameOver) {
      onComplete(false);
      return;
    }

    if (turn >= 10) {
      onComplete(true);
      return;
    }

    setTurn(prev => prev + 1);
    setActionPoints(3); // Reset AP each turn
  };

  return (
    <div className={`absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 ${shake ? 'shake' : ''}`}>
      <div className="bg-tno-panel border-2 border-tno-highlight max-w-4xl w-full p-6 shadow-2xl shadow-tno-highlight/20 relative flex flex-col h-[80vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-tno-highlight pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-tno-highlight crt-flicker" />
            <div>
              <h2 className="text-2xl font-bold text-tno-highlight tracking-widest">经天纬地的铁壁</h2>
              <div className="text-xs text-tno-text/60">B3教学楼 - 阵地防卫战</div>
              {fieldSupport > 0 && <div className="text-xs text-emerald-300">地下联络工作组筹备 {fieldSupport} 份 · 首回合行动点 +{fieldSupport}</div>}
            </div>
          </div>
          <div className="text-right flex gap-6">
            <div>
              <div className="text-3xl font-bold text-tno-highlight crt-flicker">{turn}/10</div>
              <div className="text-[10px] text-tno-text/60">当前回合</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-tno-green crt-flicker">{actionPoints}</div>
              <div className="text-[10px] text-tno-text/60">行动力 (AP)</div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 gap-6 overflow-hidden">
          {/* Left: Building View */}
          <div className="flex-1 flex flex-col gap-2">
            {floors.map((floor, index) => (
              <div 
                key={floor.level} 
                className="flex-1 border border-tno-border bg-zinc-900/50 relative flex items-center p-4 cursor-pointer hover:border-tno-highlight transition-colors group"
                onClick={() => handleDeploy(index)}
              >
                <div className="w-12 text-center font-bold text-tno-text/60 border-r border-tno-border pr-4 mr-4">
                  {floor.level}F
                </div>
                
                {/* Progress Bar */}
                <div className="flex-1 h-8 bg-black border border-tno-border relative overflow-hidden">
                  <div 
                    className="absolute top-0 bottom-0 left-0 bg-tno-red/80 transition-all duration-500"
                    style={{ width: `${floor.enemyProgress}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold mix-blend-difference text-white z-10">
                    敌军渗透率: {Math.round(floor.enemyProgress)}%
                  </div>
                </div>

                {/* Deployed Unit */}
                <div className="w-32 ml-4 flex items-center justify-center">
                  {floor.unit === 'debater' && <div className="text-tno-highlight text-sm font-bold flex items-center gap-1"><Users className="w-4 h-4"/> 实验班辩手</div>}
                  {floor.unit === 'picket' && <div className="text-tno-green text-sm font-bold flex items-center gap-1"><Shield className="w-4 h-4"/> 钢铁红蛤</div>}
                  {floor.unit === 'barricade' && <div className="text-tno-text text-sm font-bold flex items-center gap-1"><FileText className="w-4 h-4"/> 白卷路障</div>}
                  {!floor.unit && <div className="text-tno-text/30 text-xs group-hover:text-tno-highlight/50">点击部署</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Deployment Panel */}
          <div className="w-64 flex flex-col gap-4">
            <div className="border border-tno-border p-4 bg-zinc-900">
              <h3 className="text-tno-highlight font-bold mb-4 border-b border-tno-border pb-2">可用单位</h3>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setSelectedUnit('debater')}
                  className={`w-full text-left p-2 border transition-colors ${selectedUnit === 'debater' ? 'border-tno-highlight bg-tno-highlight/10' : 'border-tno-border hover:border-tno-highlight/50'}`}
                >
                  <div className="font-bold text-tno-highlight text-sm flex items-center gap-2"><Users className="w-4 h-4"/> 实验班辩手</div>
                  <div className="text-[10px] text-tno-text/60 mt-1">大幅减缓敌军推进速度。消耗 1 AP。</div>
                </button>

                <button 
                  onClick={() => setSelectedUnit('picket')}
                  className={`w-full text-left p-2 border transition-colors ${selectedUnit === 'picket' ? 'border-tno-green bg-tno-green/10' : 'border-tno-border hover:border-tno-green/50'}`}
                >
                  <div className="font-bold text-tno-green text-sm flex items-center gap-2"><Shield className="w-4 h-4"/> 钢铁红蛤纠察队</div>
                  <div className="text-[10px] text-tno-text/60 mt-1">推回敌军防线。消耗 1 AP。</div>
                </button>

                <button 
                  onClick={() => setSelectedUnit('barricade')}
                  className={`w-full text-left p-2 border transition-colors ${selectedUnit === 'barricade' ? 'border-tno-text bg-tno-text/10' : 'border-tno-border hover:border-tno-text/50'}`}
                >
                  <div className="font-bold text-tno-text text-sm flex items-center gap-2"><FileText className="w-4 h-4"/> 白卷路障</div>
                  <div className="text-[10px] text-tno-text/60 mt-1">完全封锁该楼层。消耗 1 AP 和 200 TPR。</div>
                </button>
              </div>
            </div>

            <div className="flex-1 border border-tno-border p-4 bg-zinc-900 flex flex-col justify-between">
              <div>
                <div className="text-xs text-tno-text/60 mb-1">当前 TPR 储备:</div>
                <div className="text-xl font-bold text-tno-highlight">{Math.floor(state.stats.tpr)}</div>
              </div>
              
              <button 
                onClick={endTurn}
                className="w-full py-3 border border-tno-red text-tno-red hover:bg-tno-red hover:text-black font-bold tracking-widest transition-colors"
              >
                结束回合
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
