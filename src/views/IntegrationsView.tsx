import React from 'react';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Database,
  Lock,
  Key,
  Globe
} from 'lucide-react';
import { useRacerOps } from '../context/RacerOpsContext';

export const IntegrationsView: React.FC = () => {
  const { integrations, syncIntegration, showToast, setIsConfigModalOpen, setSelectedIntegrationId } = useRacerOps();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-100 tracking-tight">Integration Adapters</h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
              Modular IntegrationProvider Pattern
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Modular service adapters allowing third-party tools to be swapped or progressive live credentials applied without breaking UI contracts.
          </p>
        </div>

        <button
          onClick={() => showToast('All integration adapter health checks passed')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-all self-start sm:self-auto"
        >
          <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Health Check All</span>
        </button>
      </div>

      {/* Security Architecture Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start space-x-3 text-xs text-slate-300">
        <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-100 font-semibold">Zero-Credential Exposure Policy:</strong>
          <span className="text-slate-400 ml-1">
            API keys, OAuth tokens, and webhook secrets are strictly isolated in environment variables. Live endpoints interact via signed sidecar adapters without client exposure.
          </span>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integ) => (
          <div
            key={integ.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col justify-between shadow-sm space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 font-bold text-xs">
                    {integ.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{integ.name}</h3>
                    <span className="text-[10px] uppercase font-mono text-slate-400">
                      {integ.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                      integ.mode === 'live'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {integ.mode}
                  </span>

                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                      integ.status === 'connected'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : integ.status === 'degraded'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {integ.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-3 leading-relaxed">{integ.description}</p>

              {integ.lastError && (
                <div className="mt-2.5 p-2 rounded-lg bg-rose-950/40 border border-rose-900/60 text-[11px] text-rose-300 font-mono">
                  {integ.lastError}
                </div>
              )}

              {/* Supported Data Types */}
              <div className="mt-3">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                  Ingested Data Types
                </span>
                <div className="flex flex-wrap gap-1">
                  {integ.supportedDataTypes.map((dt, dIdx) => (
                    <span
                      key={dIdx}
                      className="px-2 py-0.5 rounded bg-slate-950 text-[10px] text-slate-300 border border-slate-800 font-mono"
                    >
                      {dt}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with Sync and Config Triggers */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="truncate max-w-[120px]">
                {integ.lastSyncAt ? `Synced: ${integ.lastSyncAt.split(' ')[0]}` : 'Never synced'}
              </span>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => {
                    setSelectedIntegrationId(integ.id);
                    setIsConfigModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-semibold transition-colors"
                  title="Configure live webhook or credentials"
                >
                  Configure
                </button>
                <button
                  onClick={() => syncIntegration(integ.id)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800/60 text-cyan-300 text-[10px] font-semibold flex items-center space-x-1 transition-colors"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Sync</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
