import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, RefreshCw, Flag, Timer, Bomb, ChevronLeft, LayoutGrid, Info } from 'lucide-react';
import { cn } from '../utils';

type CellStatus = 'hidden' | 'revealed' | 'flagged';
type CellValue = 'mine' | number;

interface Cell {
  value: CellValue;
  status: CellStatus;
  x: number;
  y: number;
}

const GRID_SIZE = 10;
const MINE_COUNT = 15;

export default function Minesweeper() {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost' | 'idle'>('idle');
  const [minesLeft, setMinesLeft] = useState(MINE_COUNT);
  const [time, setTime] = useState(0);

  const initGrid = useCallback(() => {
    const newGrid: Cell[][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        row.push({ value: 0, status: 'hidden', x, y });
      }
      newGrid.push(row);
    }

    // Place mines
    let placedMines = 0;
    while (placedMines < MINE_COUNT) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      if (newGrid[y][x].value !== 'mine') {
        newGrid[y][x].value = 'mine';
        placedMines++;
      }
    }

    // Calculate numbers
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (newGrid[y][x].value === 'mine') continue;
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < GRID_SIZE && nx >= 0 && nx < GRID_SIZE) {
              if (newGrid[ny][nx].value === 'mine') count++;
            }
          }
        }
        newGrid[y][x].value = count;
      }
    }

    setGrid(newGrid);
    setGameState('playing');
    setMinesLeft(MINE_COUNT);
    setTime(0);
  }, []);

  useEffect(() => {
    let interval: any;
    if (gameState === 'playing') {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const revealCell = (x: number, y: number) => {
    if (gameState !== 'playing' || grid[y][x].status !== 'hidden') return;

    const newGrid = [...grid.map(row => [...row])];
    const cell = newGrid[y][x];

    if (cell.value === 'mine') {
      // Game Over
      newGrid.forEach(row => row.forEach(c => {
        if (c.value === 'mine') c.status = 'revealed';
      }));
      setGrid(newGrid);
      setGameState('lost');
      return;
    }

    const revealRecursive = (cx: number, cy: number) => {
      if (cx < 0 || cx >= GRID_SIZE || cy < 0 || cy >= GRID_SIZE) return;
      const c = newGrid[cy][cx];
      if (c.status !== 'hidden') return;

      c.status = 'revealed';

      if (c.value === 0) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            revealRecursive(cx + dx, cy + dy);
          }
        }
      }
    };

    revealRecursive(x, y);
    setGrid(newGrid);

    // Check Win
    const hiddenCells = newGrid.flat().filter(c => c.status === 'hidden' && c.value !== 'mine');
    if (hiddenCells.length === 0) {
      setGameState('won');
    }
  };

  const toggleFlag = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    if (gameState !== 'playing' || grid[y][x].status === 'revealed') return;

    const newGrid = [...grid.map(row => [...row])];
    const cell = newGrid[y][x];
    if (cell.status === 'flagged') {
      cell.status = 'hidden';
      setMinesLeft(m => m + 1);
    } else if (cell.status === 'hidden') {
      cell.status = 'flagged';
      setMinesLeft(m => m - 1);
    }
    setGrid(newGrid);
  };

  return (
    <div className="flex flex-col h-full bg-brand-bg relative overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-brand-border flex items-center justify-between px-6 bg-brand-card z-10 glass-morphism">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight apple-tight uppercase">Thermal Stress Scan</h2>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center gap-2 text-[10px] font-mono text-hanwha-orange bg-hanwha-orange/10 px-2 py-1 rounded border border-hanwha-orange/20 uppercase tracking-[0.1em]">
            Structural Integrity Analysis
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest apple-tight">Unstable Nodes</span>
            <div className="flex items-center gap-2">
              <Bomb className="w-3.5 h-3.5 text-hanwha-orange" />
              <span className="text-xl font-mono font-bold text-hanwha-orange leading-none">{minesLeft.toString().padStart(2, '0')}</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-slate-300" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest apple-tight">Scan Duration</span>
            <div className="flex items-center gap-2">
              <Timer className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xl font-mono font-bold text-slate-900 leading-none">{time.toString().padStart(3, '0')}s</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 p-8 flex items-center justify-center relative">
        {/* Background Grids */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#F37321 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        </div>

        {gameState === 'idle' ? (
          <div className="bg-white border border-brand-border rounded-2xl p-12 text-center shadow-2xl max-w-lg relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-hanwha-orange/5 -mr-16 -mt-16 rounded-full transition-all group-hover:scale-150" />
            <div className="w-20 h-20 bg-hanwha-orange/10 border border-hanwha-orange/20 rounded-full flex items-center justify-center mb-8 mx-auto animate-pulse">
              <LayoutGrid className="w-10 h-10 text-hanwha-orange" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tighter apple-tight uppercase">Integrity Scanner</h3>
            <p className="text-slate-500 text-[13px] leading-relaxed mb-10 max-w-sm mx-auto font-medium">
              Initialize a high-resolution structural integrity scan. Locate and isolate potential thermal runaway nodes without compromising the sensor mesh.
            </p>
            <button 
              onClick={initGrid}
              className="w-full py-4 bg-hanwha-orange hover:bg-hanwha-orange-bright rounded-full text-white font-bold uppercase tracking-widest text-xs transition-all shadow-lg shadow-hanwha-orange/20 active:scale-95 flex items-center justify-center gap-3"
            >
              <RefreshCw className="w-4 h-4" />
              Boot Diagnostic Scan
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8">
            {/* The Grid */}
            <div className="bg-white p-2 rounded-2xl border border-brand-border shadow-2xl relative">
              {/* Scanline Effect */}
              {gameState === 'playing' && (
                <div className="absolute top-0 left-0 w-full h-0.5 bg-hanwha-orange/20 z-10 animate-scanline" />
              )}
              
              <div 
                className="grid gap-1.5"
                style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
              >
                {grid.map((row, y) => (
                  row.map((cell, x) => (
                    <button
                      key={`${x}-${y}`}
                      onClick={() => revealCell(x, y)}
                      onContextMenu={(e) => toggleFlag(e, x, y)}
                      className={cn(
                        "w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center transition-all text-sm font-bold border",
                        cell.status === 'hidden' && "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-hanwha-orange/30 shadow-sm",
                        cell.status === 'flagged' && "bg-hanwha-orange/5 border-hanwha-orange/30 text-hanwha-orange",
                        cell.status === 'revealed' && cell.value === 'mine' && "bg-rose-500 border-rose-600 text-white animate-pulse",
                        cell.status === 'revealed' && cell.value !== 'mine' && "bg-white border-slate-100 text-slate-400"
                      )}
                    >
                      {cell.status === 'revealed' && cell.value !== 'mine' && cell.value !== 0 && (
                        <span style={{ 
                          color: [
                            '', '#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#f59e0b', '#06b6d4', '#475569', '#1e293b'
                          ][cell.value as number] 
                        }}>
                          {cell.value}
                        </span>
                      )}
                      {cell.status === 'revealed' && cell.value === 'mine' && <Bomb className="w-5 h-5" />}
                      {cell.status === 'flagged' && <Flag className="w-4 h-4 fill-current" />}
                    </button>
                  ))
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={initGrid}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-700 transition-all flex items-center gap-2 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Recalibrate Mesh
              </button>
              
              <div className="px-4 py-2 bg-slate-50 rounded-full border border-brand-border flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">L-Click: Reveal | R-Click: Mark Node</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Result Overlays */}
      {(gameState === 'won' || gameState === 'lost') && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-20 flex items-center justify-center p-8">
          <div className={cn(
            "bg-white p-12 rounded-3xl border-2 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] text-center max-w-sm w-full animate-in zoom-in-95 duration-300",
            gameState === 'won' ? "border-emerald-500" : "border-rose-500"
          )}>
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto",
              gameState === 'won' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
            )}>
              {gameState === 'won' ? <ShieldAlert className="w-10 h-10" /> : <Bomb className="w-10 h-10" />}
            </div>
            
            <h4 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter uppercase apple-tight">
              {gameState === 'won' ? 'Analysis Complete' : 'System Critical'}
            </h4>
            <p className="text-slate-500 text-[13px] mb-8 font-medium">
              {gameState === 'won' 
                ? `Structural scan completed successfully in ${time} seconds. All unstable nodes isolated.` 
                : 'Thermal runaway detected at node. Diagnostic sequence terminated for system safety.'}
            </p>

            <button 
              onClick={initGrid}
              className={cn(
                "w-full py-4 rounded-full text-white font-bold uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95",
                gameState === 'won' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" : "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
              )}
            >
              Restart Diagnostic
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanline {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scanline {
          animation: scanline 4s linear infinite;
        }
      `}} />
    </div>
  );
}
