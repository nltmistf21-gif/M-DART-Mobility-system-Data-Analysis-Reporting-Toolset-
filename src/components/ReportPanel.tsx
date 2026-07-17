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
    <div className="flex-1 flex flex-col h-screen bg-brand-bg text-slate-800 overflow-hidden font-sans">
      <header className="h-16 border-b border-brand-border flex items-center justify-between px-6 bg-brand-card sticky top-0 z-10 glass-morphism">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight apple-tight">Reporting Engine</h2>
          <div className="h-4 w-px bg-slate-300" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest apple-tight">M-DART Intelligence Module</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 rounded-full text-xs font-bold uppercase tracking-widest text-slate-700 transition-all active:scale-95">
            <Save className="w-4 h-4 text-slate-600" />
            <span>Save Draft</span>
          </button>
          <button className="flex items-center gap-2 px-8 py-2 bg-hanwha-orange text-white hover:bg-hanwha-orange text-white-bright rounded-full text-xs font-bold uppercase tracking-widest transition-all text-white shadow-lg shadow-hanwha-orange/20 active:scale-95">
            <Download className="w-4 h-4" />
            <span>Export Final</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-12 gap-8">
          {/* Report Editor */}
          <div className="col-span-8 space-y-8">
            <div className="bg-brand-card border border-brand-border rounded-2xl p-12 min-h-[900px] relative shadow-2xl">
              <div className="absolute top-0 right-0 p-8">
                <FileText className="w-12 h-12 text-slate-200" />
              </div>
              
              <input 
                type="text" 
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="text-3xl font-bold bg-transparent border-none text-slate-900 focus:outline-none w-full mb-2 tracking-tight apple-tight"
              />
              <div className="flex items-center gap-6 text-[10px] font-bold text-slate-500 mb-10 pb-6 border-b border-brand-border uppercase tracking-[0.2em] apple-tight">
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 2026-07-16 18:04:40</span>
                <span className="flex items-center gap-2 text-hanwha-orange">Status: MIL-INTERNAL</span>
              </div>

              {/* Dynamic Content Section */}
              <div className="space-y-12">
                <section>
                  <h3 className="text-[11px] font-bold text-hanwha-orange mb-6 flex items-center gap-2 uppercase tracking-[0.2em] apple-tight border-b border-hanwha-orange/10 pb-3">
                    Executive Summary
                  </h3>
                  {draftText ? (
                    <div className="prose prose max-w-none">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-serif text-[15px] italic">
                        {draftText}
                      </p>
                    </div>
                  ) : (
                    <div className="h-56 flex flex-col items-center justify-center border border-brand-border rounded-2xl bg-slate-50 group transition-all hover:border-slate-300">
                      <p className="text-[11px] text-slate-500 mb-6 font-bold uppercase tracking-widest apple-tight opacity-50">Intelligent Analysis Pending</p>
                      <button 
                        onClick={generateSmartDraft}
                        disabled={isGenerating}
                        className="flex items-center gap-3 px-8 py-3 bg-hanwha-orange/10 hover:bg-hanwha-orange/20 text-hanwha-orange rounded-full border border-hanwha-orange/20 transition-all font-bold text-xs uppercase tracking-widest active:scale-95 shadow-lg shadow-hanwha-orange/5"
                      >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        Generate Smart Draft
                      </button>
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="text-[11px] font-bold text-hanwha-orange mb-6 flex items-center gap-2 uppercase tracking-[0.2em] apple-tight border-b border-hanwha-orange/10 pb-3">
                    Metrical Validation
                  </h3>
                  <div className="bg-slate-50 rounded-2xl border border-brand-border overflow-hidden">
                    <table className="w-full text-left text-[12px] font-mono">
                      <thead>
                        <tr className="text-slate-500 border-b border-brand-border bg-slate-100">
                          <th className="py-4 px-6 font-bold uppercase tracking-widest">Node ID</th>
                          <th className="py-4 px-6 font-bold uppercase tracking-widest text-right">Peak (MPa)</th>
                          <th className="py-4 px-6 font-bold uppercase tracking-widest text-right">Margin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border">
                        {MOCK_FEA_CORRELATION.map((f, i) => (
                          <tr key={i} className="hover:bg-slate-100 transition-colors">
                            <td className="py-4 px-6 text-hanwha-orange font-bold">{f.sensorId}</td>
                            <td className="py-4 px-6 text-slate-800 font-bold text-right">{f.testValue.toFixed(1)}</td>
                            <td className="py-4 px-6 text-right">
                              <span className="text-emerald-600 font-bold">+{((320 - f.testValue) / 320 * 100).toFixed(1)}%</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <h3 className="text-[11px] font-bold text-hanwha-orange mb-6 flex items-center gap-2 uppercase tracking-[0.2em] apple-tight border-b border-hanwha-orange/10 pb-3">
                    Mission Verdict
                  </h3>
                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl shadow-inner">
                    <p className="text-[13px] text-emerald-500/90 leading-relaxed font-bold uppercase tracking-tight apple-tight">
                      System integrity validated. All measured values reside within safety envelope defined by MIL-STD-810G protocols.
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* AI Assistant Side Panel */}
          <div className="col-span-4 space-y-6">
            <div className="bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col gap-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-hanwha-orange text-white/5 -mr-12 -mt-12 rounded-full" />
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between apple-tight">
                Draft Assistant
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </h4>
              
              <div className="space-y-4">
                <div className="p-5 bg-hanwha-orange/5 rounded-2xl border border-hanwha-orange/10 shadow-sm">
                  <p className="text-[11px] text-hanwha-orange font-bold uppercase tracking-widest mb-3">Refinement Note</p>
                  <p className="text-[13px] text-slate-600 leading-relaxed italic font-medium">
                    "Stress concentration at <span className="text-hanwha-orange">SG-03</span> (+9.6%) exceeds the standard 8% deviation threshold. Recommend adding a technical mitigation clause."
                  </p>
                  <button className="mt-4 text-[11px] font-bold text-hanwha-orange uppercase tracking-widest hover:text-slate-900 transition-colors">
                    Append Mitigation Clause
                  </button>
                </div>

                <div className="space-y-3 pt-6 border-t border-brand-border">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 apple-tight">Reference Attachments</p>
                  {[
                    { label: 'Strain Topology Map', type: 'DATA' },
                    { label: 'Correlation Graph', type: 'VEC' },
                    { label: 'Sim Results (CSV)', type: 'RAW' },
                  ].map((asset, i) => (
                    <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-brand-border group cursor-pointer hover:border-hanwha-orange/30 transition-all">
                      <span className="text-[11px] text-slate-600 font-medium">{asset.label}</span>
                      <span className="text-[9px] font-bold text-slate-600 uppercase group-hover:text-hanwha-orange tracking-widest transition-colors">{asset.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={generateSmartDraft}
                disabled={isGenerating}
                className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 rounded-full border border-slate-300 text-[10px] font-bold uppercase tracking-widest text-slate-700 flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-hanwha-orange" /> : <Wand2 className="w-4 h-4 text-hanwha-orange" />}
                Refresh Intelligence
              </button>
            </div>

            <div className="p-6 bg-brand-card border border-brand-border rounded-2xl shadow-lg">
              <div className="flex gap-4">
                <AlertCircle className="w-5 h-5 text-slate-600 shrink-0" />
                <p className="text-[11px] text-slate-500 italic leading-relaxed font-medium apple-tight">
                  All system drafts require physical validation by lead engineer (Protocol MIL-204) before PLM synchronization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
