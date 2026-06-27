import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  CheckSquare, 
  Shuffle, 
  ShieldCheck, 
  Clock, 
  Activity,
  ArrowRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { AiBriefing, Event } from '../types';

interface AiAssistantViewProps {
  activeEvent: Event | null;
  onRefreshLogs?: () => void;
  onApplyResourceMovement?: (details: string) => void;
}

export default function AiAssistantView({ 
  activeEvent, 
  onRefreshLogs,
  onApplyResourceMovement 
}: AiAssistantViewProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [briefing, setBriefing] = useState<AiBriefing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [approvedItems, setApprovedItems] = useState<Record<number, boolean>>({});

  const generateBriefing = async () => {
    if (!activeEvent) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: activeEvent.id })
      });
      if (!response.ok) {
        throw new Error('Failed to generate briefing from server');
      }
      const data = await response.json();
      setBriefing(data);
    } catch (err: any) {
      setError(err.message || 'Error executing AI Operations module.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeEvent) {
      generateBriefing();
    }
  }, [activeEvent]);

  const handleApplyAction = (reallocationText: string, index: number) => {
    setApprovedItems(prev => ({ ...prev, [index]: true }));
    if (onApplyResourceMovement) {
      onApplyResourceMovement(reallocationText);
    }
  };

  if (!activeEvent) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200">
        <Sparkles className="w-12 h-12 text-slate-300 animate-pulse mb-4" />
        <h3 className="text-lg font-bold text-slate-800">No Selected Event</h3>
        <p className="text-slate-500 text-sm max-w-sm mt-1">Please select an active event from the main control panel to engage the AI Assistant.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="ai_assistant_view">
      {/* Header Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 text-white rounded-2xl shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Cpu className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest font-mono">Operations Assistant</span>
          </div>
          <h2 className="text-2xl font-display font-bold tracking-tight">Gemini 3.5 Operational Intelligence</h2>
          <p className="text-slate-400 text-xs">Parses checklists, staff attendance, sub-vendor timelines, and current wind logs of {activeEvent.name}.</p>
        </div>
        <button 
          onClick={generateBriefing}
          disabled={loading}
          className="relative z-10 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-xs font-semibold shadow-md transition-all duration-250 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Analyzing event logs...' : 'Regenerate Briefing'}</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {/* Skeleton Loader */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-3 bg-slate-200 rounded w-full" />
            <div className="h-3 bg-slate-200 rounded w-5/6" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 animate-pulse h-48" />
            <div className="p-6 bg-white rounded-2xl border border-slate-200 animate-pulse h-48" />
          </div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-800 rounded-2xl border border-red-200 space-y-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h4 className="font-bold">Operational Error</h4>
          <p className="text-sm">{error}</p>
          <button onClick={generateBriefing} className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition">Retry Analysis</button>
        </div>
      ) : briefing ? (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Col 1 & 2: Main Brief */}
          <div className="md:col-span-2 space-y-6">
            {/* Executive Summary */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-display font-bold text-lg text-slate-900">Executive Operations Briefing</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{briefing.summary}</p>
              
              {/* Bottlenecks alerts */}
              {briefing.bottlenecks.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200/60 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 text-xs font-bold font-mono">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>CRITICAL BOTTLENECK DETECTED</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-amber-700 space-y-1">
                    {briefing.bottlenecks.map((bot, i) => (
                      <li key={i}>{bot}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Smart Resource Reallocations / Action items */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Shuffle className="w-5 h-5 text-blue-600" />
                <h3 className="font-display font-bold text-lg text-slate-900">Smart Resource Reallocations</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-2">The model has evaluated staffing quotas and logistics to balance resource densities. Approve a suggestion below to apply changes:</p>
              <div className="space-y-3">
                {briefing.resourceAllocation.map((realloc, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4 hover:border-slate-300 transition">
                    <div className="space-y-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-[10px] font-bold font-mono text-blue-700 uppercase">Suggestion {idx + 1}</span>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">{realloc}</p>
                    </div>
                    <button 
                      onClick={() => handleApplyAction(realloc, idx)}
                      disabled={approvedItems[idx]}
                      className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        approvedItems[idx] 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {approvedItems[idx] ? <ShieldCheck className="w-3.5 h-3.5" /> : null}
                      <span>{approvedItems[idx] ? 'Applied' : 'Apply Now'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Col 3: Side Metrics */}
          <div className="space-y-6">
            {/* Confidence Score & Risk */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Execution Confidence</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-display font-bold text-slate-900">{briefing.confidenceScore}%</span>
                <span className="text-xs font-semibold text-slate-500">schedule rate</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    briefing.confidenceScore > 90 ? 'bg-success' : briefing.confidenceScore > 75 ? 'bg-warning' : 'bg-danger'
                  }`}
                  style={{ width: `${briefing.confidenceScore}%` }}
                />
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                Probability of delivering all scheduled timelines on schedule without client friction.
              </p>
            </div>

            {/* Predictive Risks list */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Predictive Risk Index</h4>
              <div className="space-y-3">
                {briefing.risks.map((risk, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-danger shrink-0 mt-1.5 animate-pulse" />
                    <p className="text-xs text-slate-600 leading-relaxed">{risk}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Checklist */}
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Priority Action Items</h4>
              <div className="space-y-3">
                {briefing.priorityActions.map((action, idx) => (
                  <div key={idx} className="flex gap-3 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <CheckSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Sparkles className="w-12 h-12 text-blue-300 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-slate-800">Operational Intelligence Offline</h3>
          <p className="text-slate-500 text-sm max-w-sm mt-1">Ready to compile checklist metrics. Click below to synthesize event-day logs.</p>
          <button onClick={generateBriefing} className="mt-4 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition cursor-pointer">Generate Briefing</button>
        </div>
      )}
    </div>
  );
}
