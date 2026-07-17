import React, { useState } from 'react';
import { 
  FileText, Download, Wand2, CheckCircle, Clock, Save, Trash2, Printer, AlertCircle, Loader2 
} from 'lucide-react';
import { MOCK_FEA_CORRELATION, MOCK_SENSORS } from '../mockData';
import { cn } from '../utils';

export default function ReportPanel() {
  const [reportTitle, setReportTitle] = useState('MOBILITY_TRIAL_REPORT_2026_0716');
  const [draftText, setDraftText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'drafted' | 'saved'>('idle');

  const generateSmartDraft = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-report-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          peakValues: MOCK_FEA_CORRELATION.map(f => ({
            sensorId: f.sensorId,
            value: f.testValue,
            unit: 'MPa',
            timestamp: 'T+420ms'
          })),
          feaComparison: MOCK_FEA_CORRELATION
        })
      });
      const data = await response.json();
      setDraftText(data.text);
      setStatus('drafted');
    } catch (error) {
      console.error("Drafting error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-brand-bg text-slate-200 overflow-hidden">
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-brand-card sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white tracking-tight">Auto-Reporting Engine</h2>
          <div className="h-4 w-px bg-slate-700" />
          <span className="text-[10px] text-slate-400 font-mono italic uppercase tracking-widest">M-DART Drafting Module</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-medium transition-colors">
            <Save className="w-4 h-4 text-slate-400" />
            <span>Save Draft</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded text-xs font-bold text-white transition-all shadow-lg shadow-sky-900/20">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-12 gap-4">
          {/* Report Editor */}
          <div className="col-span-8 space-y-4">
            <div className="bg-brand-card border border-slate-800 rounded-lg p-8 min-h-[850px] relative">
              <div className="absolute top-0 right-0 p-6">
                <FileText className="w-10 h-10 text-slate-800/50" />
              </div>
              
              <input 
                type="text" 
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="text-2xl font-bold bg-transparent border-none text-white focus:outline-none w-full mb-1 tracking-tight"
              />
              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 mb-8 pb-4 border-b border-slate-800 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 2026-07-16 18:04:40</span>
                <span className="flex items-center gap-1.5 text-sky-400 font-bold">Classification: MIL-INTERNAL</span>
              </div>

              {/* Dynamic Content Section */}
              <div className="space-y-8">
                <section>
                  <h3 className="text-xs font-bold text-sky-400 mb-4 flex items-center gap-2 uppercase tracking-widest border-b border-slate-800/50 pb-2">
                    Executive Summary
                  </h3>
                  {draftText ? (
                    <div className="prose prose-invert max-w-none">
                      <p className="text-slate-400 leading-relaxed whitespace-pre-wrap font-serif text-[13px]">
                        {draftText}
                      </p>
                    </div>
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center border border-slate-800 rounded bg-brand-bg group">
                      <p className="text-[11px] text-slate-500 mb-4 font-mono uppercase tracking-widest">No intelligence drafted</p>
                      <button 
                        onClick={generateSmartDraft}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-6 py-2.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded border border-sky-500/20 transition-all font-bold text-xs uppercase tracking-widest"
                      >
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                        Smart Draft (AI)
                      </button>
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="text-xs font-bold text-sky-400 mb-4 flex items-center gap-2 uppercase tracking-widest border-b border-slate-800/50 pb-2">
                    Measured Analysis
                  </h3>
                  <div className="bg-brand-bg rounded border border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-[11px] font-mono">
                      <thead>
                        <tr className="text-slate-500 border-b border-slate-800 bg-slate-900/30">
                          <th className="py-2.5 px-4 font-bold uppercase tracking-tighter">Sensor</th>
                          <th className="py-2.5 px-4 font-bold uppercase tracking-tighter">Peak</th>
                          <th className="py-2.5 px-4 font-bold uppercase tracking-tighter">Safety Margin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {MOCK_FEA_CORRELATION.map((f, i) => (
                          <tr key={i}>
                            <td className="py-2 px-4 text-sky-400 font-bold">{f.sensorId}</td>
                            <td className="py-2 px-4 text-slate-200 font-bold">{f.testValue} MPa</td>
                            <td className="py-2 px-4">
                              <span className="text-emerald-500">{((320 - f.testValue) / 320 * 100).toFixed(1)}%</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-sky-400 mb-4 flex items-center gap-2 uppercase tracking-widest border-b border-slate-800/50 pb-2">
                    Verdict
                  </h3>
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded">
                    <p className="text-[11px] text-emerald-500/80 leading-relaxed font-medium uppercase tracking-tight">
                      Structural integrity confirmed. All measured values reside within safety envelope defined by MIL-STD-810G.
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* AI Assistant Side Panel */}
          <div className="col-span-4 space-y-4">
            <div className="bg-brand-card border border-slate-800 rounded-lg p-5 flex flex-col gap-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                Draft Assistant
                <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
              </h4>
              
              <div className="space-y-3">
                <div className="p-4 bg-sky-500/10 rounded border border-sky-500/20">
                  <p className="text-[11px] text-sky-400 font-bold uppercase tracking-wider mb-2">Refinement</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed italic font-serif">
                    "Stress concentration at SG-03 (+9.6%) exceeds the standard 8% threshold. I suggest adding a mitigation clause regarding the axle mount damping."
                  </p>
                  <button className="mt-3 text-[10px] font-bold text-sky-400 uppercase tracking-widest hover:text-sky-300">
                    Apply Clause
                  </button>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Attachments</p>
                  {[
                    { label: 'Strain Map V1', type: 'IMG' },
                    { label: 'Correlation Graph', type: 'CHART' },
                    { label: 'ANSYS Results', type: 'RAW' },
                  ].map((asset, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-brand-bg rounded border border-slate-800/50 group cursor-pointer hover:border-sky-500/30 transition-colors">
                      <span className="text-[11px] text-slate-400">{asset.label}</span>
                      <span className="text-[9px] font-mono text-slate-600 uppercase group-hover:text-sky-400">{asset.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={generateSmartDraft}
                disabled={isGenerating}
                className="w-full py-2.5 bg-brand-bg hover:bg-slate-800 rounded border border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-300 flex items-center justify-center gap-2 transition-all"
              >
                {isGenerating ? <Loader2 className="w-3 h-3 animate-spin text-sky-400" /> : <Wand2 className="w-3 h-3 text-sky-400" />}
                Regenerate Intelligent Draft
              </button>
            </div>

            <div className="p-4 bg-brand-card border border-slate-800 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="w-4 h-4 text-slate-600 shrink-0" />
                <p className="text-[10px] text-slate-600 italic leading-relaxed">
                  System draft requires lead engineer validation (MIL-SPEC-204) before final PLM commit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
