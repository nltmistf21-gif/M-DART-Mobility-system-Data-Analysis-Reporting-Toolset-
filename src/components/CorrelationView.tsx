import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell 
} from 'recharts';
import { 
  CheckCircle2, AlertTriangle, XCircle, Info, ArrowRight, Layers, MapPin, Target 
} from 'lucide-react';
import { MOCK_FEA_CORRELATION, MOCK_SENSORS } from '../mockData';
import { cn } from '../utils';

export default function CorrelationView() {
  return (
    <div className="flex-1 flex flex-col h-screen bg-brand-bg text-slate-200 overflow-hidden">
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-brand-card sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white tracking-tight">FEA Correlation Engine</h2>
          <div className="h-4 w-px bg-slate-700" />
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Structural Audit Module</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-medium transition-colors">
            <Layers className="w-4 h-4 text-slate-400" />
            <span>Map Mesh Results</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Correlation Chart */}
        <div className="bg-brand-card border border-slate-800 rounded-lg p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Comparative Analysis: Test vs. FEA</h3>
              <p className="text-[10px] text-slate-500">Validation of simulation accuracy against actual field measurements.</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Test Data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-600" />
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">FEA Prediction</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_FEA_CORRELATION}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="sensorId" stroke="#334155" fontSize={10} tick={{ fill: '#475569' }} />
                <YAxis stroke="#334155" fontSize={10} tick={{ fill: '#475569' }} />
                <Tooltip 
                  cursor={{ fill: '#0B0E14' }}
                  contentStyle={{ backgroundColor: '#0B0E14', border: '1px solid #1e293b', borderRadius: '4px', fontSize: '12px' }}
                />
                <Bar dataKey="testValue" fill="#0ea5e9" radius={[2, 2, 0, 0]} barSize={32} />
                <Bar dataKey="feaValue" fill="#334155" radius={[2, 2, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Audit Table */}
        <div className="bg-brand-card border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-brand-card border-b border-slate-800">
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Node ID</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Sim (MPa)</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Test (MPa)</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Error (%)</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {MOCK_FEA_CORRELATION.map((item, i) => {
                const sensor = MOCK_SENSORS.find(s => s.id === item.sensorId);
                return (
                  <tr key={i} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="px-5 py-3 font-mono text-sky-400 font-bold">{item.sensorId}</td>
                    <td className="px-5 py-3 text-slate-400">{sensor?.name}</td>
                    <td className="px-5 py-3 text-right font-mono text-slate-500">{item.feaValue.toFixed(1)}</td>
                    <td className="px-5 py-3 text-right font-mono text-slate-200">{item.testValue.toFixed(1)}</td>
                    <td className="px-5 py-3 text-right font-mono">
                      <span className={cn(
                        item.errorRate > 8 ? "text-rose-400" : "text-emerald-400"
                      )}>
                        {item.errorRate > 0 ? '+' : ''}{item.errorRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {item.status === 'Safe' ? (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase font-bold tracking-tighter">
                            Validated
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase font-bold tracking-tighter">
                            Deviation
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-5 py-3 bg-brand-bg/50 border-t border-slate-800 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 uppercase font-mono">Overall Convergence Rate</span>
            <span className="text-xs font-bold text-sky-400 font-mono">96.2%</span>
          </div>
        </div>

        {/* Bottom Modules */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-brand-card border border-slate-800 p-5 rounded-lg flex flex-col justify-center">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <MapPin className="w-3 h-3 text-sky-500" />
              Node-Sensor Mapping
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              Nearest-neighbor mapping active (Tolerance: 5mm). All coordinates verified against Rig CAD (Rev. 04).
            </p>
          </div>
          <div className="bg-brand-card border border-slate-800 p-5 rounded-lg flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audit Recommendation</span>
              <AlertTriangle className="w-3 h-3 text-rose-400" />
            </div>
            <p className="text-[11px] text-slate-400">Deviation detected at SG-03 (+9.6%). Review boundary conditions for axle mount.</p>
            <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-300">
              Export Audit Findings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
