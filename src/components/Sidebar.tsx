import React, { useState, useEffect } from 'react';
import { Box, FileText, Settings, Database, Activity, LayoutGrid, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ViewMode } from '../types';
import { cn } from '../utils';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const [stockPrice, setStockPrice] = useState(378500);
  const [stockChange, setStockChange] = useState(4.25);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch('/api/stock-price');
        const data = await res.json();
        if (data.price) {
          setStockPrice(data.price);
          setStockChange(data.change);
        }
      } catch (err) {
        console.error('Failed to fetch stock price:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: 'VehicleViewer', icon: Box, label: '3D Asset Viewer' },
    { id: 'Reporting', icon: FileText, label: 'Auto Reporting' },
    { id: 'Minesweeper', icon: LayoutGrid, label: 'Integrity Scan' },
  ];

  return (
    <div className="w-64 h-screen bg-brand-card border-r border-brand-border flex flex-col p-4">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="relative w-10 h-10 flex items-center justify-center">
          {/* Simple Hanwha-inspired logo using three circles */}
          <div className="absolute w-6 h-6 border-2 border-hanwha-orange rounded-full -translate-x-2 translate-y-1 opacity-80" />
          <div className="absolute w-6 h-6 border-2 border-hanwha-orange rounded-full translate-x-2 translate-y-1 opacity-80" />
          <div className="absolute w-6 h-6 border-2 border-hanwha-orange rounded-full -translate-y-2 opacity-100" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-[0.05em] apple-tight uppercase">Hanwha</h1>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-none mt-0.5">Aerospace Lab</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as ViewMode)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
              currentView === item.id 
                ? "bg-hanwha-orange text-white shadow-lg shadow-hanwha-orange/20" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5",
              currentView === item.id ? "text-white" : "text-slate-500 group-hover:text-slate-700"
            )} />
            <span className="font-bold text-[13px] apple-tight uppercase tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-brand-border space-y-2">
        {/* Stock Price Ticker */}
        <div className="px-3 py-4 bg-slate-50 rounded-xl border border-brand-border/50 mb-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-1">
            <div className="flex items-center gap-1">
              <span className={cn("w-1 h-1 rounded-full animate-pulse", stockChange >= 0 ? "bg-emerald-500" : "bg-rose-500")} />
              <span className={cn("text-[7px] font-bold uppercase tracking-tighter", stockChange >= 0 ? "text-emerald-600" : "text-rose-600")}>Live</span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">KRX: 012450</span>
            <div className={cn("flex items-center gap-1 text-[9px] font-bold", stockChange >= 0 ? "text-emerald-600" : "text-rose-600")}>
              {stockChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{stockChange >= 0 ? '+' : ''}{stockChange}%</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-mono font-black text-slate-900 leading-none">
              {Math.floor(stockPrice).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 font-bold">KRW</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className={cn("flex-1 h-[2px] rounded-full overflow-hidden", stockChange >= 0 ? "bg-emerald-100" : "bg-rose-100")}>
              <div className={cn("h-full transition-all duration-1000", stockChange >= 0 ? "bg-emerald-500 w-2/3" : "bg-rose-500 w-1/3")} />
            </div>
            {stockChange >= 0 ? <ArrowUpRight className="w-3 h-3 text-emerald-500" /> : <ArrowDownRight className="w-3 h-3 text-rose-500" />}
          </div>
        </div>

        <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-700 transition-colors group">
          <Database className="w-4 h-4 text-slate-600 group-hover:text-hanwha-orange transition-colors" />
          <span className="text-[10px] uppercase tracking-widest font-bold apple-tight">PLM Infrastructure</span>
        </button>
        
        <div className="p-4 bg-brand-bg rounded-xl border border-brand-border/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">System Operational</span>
          </div>
          <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-hanwha-orange w-3/4 shadow-[0_0_8px_rgba(243,115,33,0.5)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
