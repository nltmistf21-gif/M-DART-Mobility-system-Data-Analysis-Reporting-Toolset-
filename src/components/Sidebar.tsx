import React from 'react';
import { LayoutDashboard, GitCompare, FileText, Settings, Database, Activity } from 'lucide-react';
import { ViewMode } from '../types';
import { cn } from '../utils';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'Dashboard', icon: LayoutDashboard, label: 'Data Processor' },
    { id: 'Correlation', icon: GitCompare, label: 'FEA Correlation' },
    { id: 'Reporting', icon: FileText, label: 'Auto Reporting' },
  ];

  return (
    <div className="w-64 h-screen bg-brand-card border-r border-slate-800 flex flex-col p-4">
      <div className="flex items-center gap-4 mb-10 px-2">
        <div className="w-10 h-10 bg-sky-500 rounded flex items-center justify-center font-bold text-white tracking-tighter">
          M
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white leading-tight">M-DART</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-sans">Hanwha Aerospace</p>
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
                ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" 
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5",
              currentView === item.id ? "text-sky-400" : "text-slate-500 group-hover:text-slate-300"
            )} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-6 border-t border-slate-800 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-300 transition-colors">
          <Database className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider font-semibold">PLM Sync</span>
        </button>
      </div>

      <div className="mt-auto p-4 bg-brand-bg rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">System Stable</span>
        </div>
        <p className="text-[10px] text-slate-600 leading-relaxed font-mono">
          SECURE: AES-256<br/>
          NODE: ON-PREM
        </p>
      </div>
    </div>
  );
}
