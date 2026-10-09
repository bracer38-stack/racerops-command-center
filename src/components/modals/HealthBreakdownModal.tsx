import React from 'react';
import {
  X,
  Activity,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Cpu,
  Users,
  ShoppingBag,
  Smartphone,
  ShieldAlert
} from 'lucide-react';
import { useRacerOps } from '../../context/RacerOpsContext';

export const HealthBreakdownModal: React.FC = () => {
  const {
    isHealthModalOpen,
    setIsHealthModalOpen,
    healthBreakdown,
    setActiveView
  } = useRacerOps();

  if (!isHealthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-100">
                  Business Health Scoring Rubric
                </h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {healthBreakdown.overallScore} / 100
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transparent deterministic calculation based on 6 weighted operational dimensions
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsHealthModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-mono">Consolidated Assessment</p>
              <h3 className="text-lg font-bold text-slate-100 mt-0.5 flex items-center space-x-2">
                <span>Healthy Operating Cadence</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  Grade: B+
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Portfolio financials are outperforming benchmarks (+10.6% MoM). 16 points deducted across lead follow-up SLA, expired automation tokens, and pending approvals.
              </p>
            </div>
            <div className="flex items-center space-x-4 self-center md:self-auto flex-shrink-0">
              <div className="text-center p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-2xl font-black text-emerald-400 font-mono">84%</span>
                <span className="text-[10px] text-slate-400 block font-mono">WEIGHTED SCORE</span>
              </div>
            </div>
          </div>

          {/* Component Breakdown Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Scoring Components & Deduction Log
            </h3>

            {healthBreakdown.components.map((comp, idx) => {
              const isPerfect = comp.score === comp.maxScore;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    isPerfect
                      ? 'bg-slate-950/60 border-slate-800/80'
                      : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`p-1.5 rounded-lg ${
                          comp.status === 'optimal' || comp.status === 'good'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950/60 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {comp.status === 'optimal' || comp.status === 'good' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                          <span>{comp.name}</span>
                          <span className="text-[11px] font-mono text-slate-400 font-normal">
                            ({comp.weight}% weight)
                          </span>
                        </h4>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-slate-100">
                        {comp.score} / {comp.maxScore}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">pts</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">{comp.details}</p>

                  {comp.deductionReason && (
                    <div className="mt-2.5 p-2 rounded-lg bg-amber-950/30 border border-amber-900/50 text-[11px] text-amber-300">
                      <span className="font-semibold text-amber-200">Point Deduction: </span>
                      {comp.deductionReason}
                    </div>
                  )}

                  <div className="mt-2 text-[11px] text-cyan-300/90 flex items-start space-x-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-cyan-200 font-medium">Recommended Remediation:</strong>{' '}
                      {comp.recommendation}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 font-mono">
            Calculated: {healthBreakdown.calculatedAt}
          </p>
          <button
            onClick={() => setIsHealthModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
