import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Upload, Filter, Maximize2, Download, Search, AlertCircle, Info, ChevronRight 
} from 'lucide-react';
import { MOCK_SENSORS, generateMockSensorData } from '../mockData';
import { formatTimestamp, downsample, cn } from '../utils';

export default function Dashboard() {
  const [selectedSensor, setSelectedSensor] = useState(MOCK_SENSORS[0]);
  const [dataPoints, setDataPoints] = useState(1000);
  
  const rawData = useMemo(() => generateMockSensorData(selectedSensor.id, dataPoints), [selectedSensor, dataPoints]);
  const chartData = useMemo(() => downsample(rawData, 500), [rawData]);

  const stats = useMemo(() => {
    const values = rawData.map(d => d.value);
    return {
      max: Math.max(...values),
      min: Math.min(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      peakTime: rawData.find(d => d.value === Math.max(...values))?.timestamp
    };
  }, [rawData]);

  return (
    <div className="flex-1 flex flex-col h-screen bg-brand-bg text-slate-200 overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-brand-card sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white tracking-tight">M-DART Dashboard</h2>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-2 text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-1 rounded border border-sky-500/20">
            <span>UNIT1_HSA_BETA</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-medium transition-colors">
            <Upload className="w-4 h-4 text-slate-400" />
            <span>Load DAT/CSV</span>
          </button>
          <button className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded text-xs font-medium transition-colors text-white shadow-lg shadow-sky-900/20">
            Export Dataset
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Top Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Peak Acceleration', value: `${stats.max.toFixed(2)}`, unit: selectedSensor.unit, trend: '+2.1%', color: 'text-sky-400', barColor: 'bg-sky-500' },
            { label: 'Minimum Stress', value: `${stats.min.toFixed(2)}`, unit: selectedSensor.unit, trend: '-0.5%', color: 'text-rose-400', barColor: 'bg-rose-500' },
            { label: 'Mean Average', value: `${stats.avg.toFixed(2)}`, unit: selectedSensor.unit, trend: 'Stable', color: 'text-slate-300', barColor: 'bg-slate-500' },
            { label: 'Sampling Rate', value: '50', unit: 'kHz', trend: '✓ Optimized', color: 'text-emerald-400', barColor: 'bg-emerald-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-brand-card border border-slate-800 p-4 rounded-lg hover:border-slate-700 transition-all group">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <span className={cn("text-2xl font-mono font-bold", stat.color)}>{stat.value}</span>
                <span className="text-[10px] text-slate-500 font-medium uppercase">{stat.unit}</span>
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full mt-3 overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-500", stat.barColor)} style={{ width: '70%' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Main Chart Area */}
        <div className="grid grid-cols-12 gap-4">
          {/* Sensor List */}
          <div className="col-span-3 space-y-2">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Channels</h3>
              <Search className="w-3 h-3 text-slate-600" />
            </div>
            <div className="space-y-1.5 overflow-y-auto max-h-[550px] pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              {MOCK_SENSORS.map(sensor => (
                <button
                  key={sensor.id}
                  onClick={() => setSelectedSensor(sensor)}
                  className={cn(
                    "w-full text-left p-3 rounded border transition-all duration-200 group relative",
                    selectedSensor.id === sensor.id 
                      ? "bg-sky-500/10 border-sky-500/30" 
                      : "bg-brand-card border-slate-800 hover:border-slate-700"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={cn(
                      "text-[10px] font-mono font-bold",
                      selectedSensor.id === sensor.id ? "text-sky-400" : "text-slate-500"
                    )}>{sensor.id}</span>
                    {selectedSensor.id === sensor.id && <div className="w-1 h-1 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]" />}
                  </div>
                  <p className={cn(
                    "text-xs font-medium truncate",
                    selectedSensor.id === sensor.id ? "text-slate-200" : "text-slate-400"
                  )}>{sensor.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Chart View */}
          <div className="col-span-9 bg-brand-card border border-slate-800 rounded-lg p-5 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  {selectedSensor.name}
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20">ACTIVE</span>
                </h3>
                <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">Points: {chartData.length} | Sampling: Real-time Optimized</p>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-slate-800 rounded text-slate-500 transition-colors"><Filter className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-slate-800 rounded text-slate-500 transition-colors"><Maximize2 className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex-1 min-h-[400px] w-full bg-brand-bg rounded border border-slate-800/50 p-4 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    stroke="#334155"
                    fontSize={10}
                    tick={{ fill: '#475569' }}
                  />
                  <YAxis 
                    stroke="#334155"
                    fontSize={10}
                    tick={{ fill: '#475569' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#1e293b', color: '#f1f5f9', fontSize: '12px' }}
                    itemStyle={{ color: '#0ea5e9' }}
                    labelFormatter={(ts) => `Timestamp: ${formatTimestamp(ts)}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0ea5e9" 
                    strokeWidth={1.5}
                    fillOpacity={1} 
                    fill="url(#colorVal)" 
                    animationDuration={400}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="absolute bottom-6 right-6 flex flex-col items-end gap-1 pointer-events-none">
                <div className="text-[10px] font-mono text-rose-400 flex items-center gap-2">
                  <span className="w-3 h-[1px] bg-rose-400" /> THRESHOLD_WARN: 450 MPa
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500 font-mono uppercase tracking-widest border-t border-slate-800/50 pt-4">
              <div className="flex gap-4">
                <span>Buffer: Stable</span>
                <span>Latency: 12ms</span>
              </div>
              <div>&copy; 2026 Hanwha Aero Mobility</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
