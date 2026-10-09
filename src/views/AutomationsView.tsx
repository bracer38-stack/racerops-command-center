import React from 'react';
import {
  Cpu,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldAlert,
  Play,
  Zap,
  Activity
} from 'lucide-react';
import { useRacerOps } from '../context/RacerOpsContext';

export const AutomationsView: React.FC = () => {
  const { automations, automationRuns, retryAutomation, showToast } = useRacerOps();

  const systemStatusCards = [
    { name: 'OpenClaw Agent Orchestrator', status: 'Online', healthy: true },
    { name: 'n8n Workflow Engine', status: 'Online', healthy: true },
    { name: 'Blotato Social Publisher', status: 'Degraded (OAuth Error)', healthy: false },
    { name: 'Cloudflare Edge CDN & DNS', status: 'Healthy', healthy: true },
    { name: 'HubSpot CRM Sync', status: 'Connected', healthy: true },
    { name: 'WhatsApp Webhook Gateway', status: 'Connected', healthy: true }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-100 tracking-tight">Automation Monitor</h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
              1 Degraded Workflow
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time heartbeat across scheduled webhooks, background CRONs, and multi-platform sync pipelines.
          </p>
        </div>

        <button
          onClick={() => showToast('Triggered full fleet heartbeat scan')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-all self-start sm:self-auto"
        >
          <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Scan All Pipelines</span>
        </button>
      </div>

      {/* Systems Status Badges Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
          Underlying Engine Infrastructure
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {systemStatusCards.map((sys, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between"
            >
              <span className="text-[11px] font-semibold text-slate-300 leading-tight">
                {sys.name}
              </span>
              <div className="flex items-center space-x-1.5 mt-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    sys.healthy ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                  }`}
                ></span>
                <span
                  className={`text-[10px] font-mono font-medium ${
                    sys.healthy ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {sys.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Workflows Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-4">
          Managed Automation Pipelines
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase font-mono text-slate-400">
                <th className="pb-3">Workflow Name</th>
                <th className="pb-3">Platform</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Last Run</th>
                <th className="pb-3">Next Scheduled</th>
                <th className="pb-3">Success / Fail</th>
                <th className="pb-3">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {automations.map((auto) => (
                <tr key={auto.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-3">
                    <p className="font-semibold text-slate-200">{auto.name}</p>
                    {auto.lastError && (
                      <p className="text-[11px] text-rose-400 font-mono mt-0.5 max-w-sm">
                        {auto.lastError}
                      </p>
                    )}
                  </td>

                  <td className="py-3">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {auto.platform}
                    </span>
                  </td>

                  <td className="py-3">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                        auto.status === 'online'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : auto.status === 'degraded'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {auto.status}
                    </span>
                  </td>

                  <td className="py-3 font-mono text-slate-300 text-[11px]">{auto.lastRun}</td>
                  <td className="py-3 font-mono text-slate-400 text-[11px]">{auto.nextRun}</td>

                  <td className="py-3 font-mono text-[11px]">
                    <span className="text-emerald-400 font-semibold">{auto.successCount}</span> /{' '}
                    <span className={auto.failureCount > 0 ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                      {auto.failureCount}
                    </span>
                  </td>

                  <td className="py-3">
                    <button
                      onClick={() => retryAutomation(auto.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Trigger Now</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Execution Runs Log */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
          Recent Run Telemetry Log
        </h2>

        <div className="space-y-2">
          {automationRuns.map((run) => (
            <div
              key={run.id}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`w-2 h-2 rounded-full ${
                    run.status === 'success'
                      ? 'bg-emerald-400'
                      : run.status === 'warning'
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                  }`}
                ></span>
                <div>
                  <span className="font-bold text-slate-200">{run.time}</span>
                  <span className="text-slate-400 ml-2">— {run.workflowName}:</span>
                  <span className="text-slate-300 ml-1.5">{run.message}</span>
                </div>
              </div>

              <span className="text-slate-400 text-[11px] flex-shrink-0 ml-4">
                {run.durationMs}ms
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
