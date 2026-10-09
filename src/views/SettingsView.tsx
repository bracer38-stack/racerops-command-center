import React, { useState } from 'react';
import {
  Settings,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Database,
  Lock,
  Cpu,
  Terminal,
  Check
} from 'lucide-react';
import { useRacerOps } from '../context/RacerOpsContext';

export const SettingsView: React.FC = () => {
  const { showToast } = useRacerOps();
  const [safetyGateEnabled, setSafetyGateEnabled] = useState(true);
  const [demoModeEnabled, setDemoModeEnabled] = useState(true);

  const handleResetData = () => {
    showToast('Demo data reloaded to baseline initial state');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-100 tracking-tight">System & Security Settings</h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">
              v1.0.0 Stable
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure autonomous agent execution boundaries, safety gating, and data adapters.
          </p>
        </div>
      </div>

      {/* Safety Gate Protocols (Crucial for Level 3 Philosophy) */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Consequential Action Safety Gate (Human-in-the-Loop)</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              When active, no autonomous agent or automation pipeline can execute irreversible external actions without explicit operator sign-off in the Approval Inbox.
            </p>
          </div>

          <button
            onClick={() => {
              setSafetyGateEnabled(!safetyGateEnabled);
              showToast(safetyGateEnabled ? 'Warning: Safety Gate Disabled' : 'Safety Gate Enforced');
            }}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
              safetyGateEnabled ? 'bg-cyan-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                safetyGateEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2 text-[11px] text-slate-400">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 flex items-center space-x-2">
            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Public social publishing gated</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 flex items-center space-x-2">
            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Financial disbursements gated</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 flex items-center space-x-2">
            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Inventory price changes gated</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 flex items-center space-x-2">
            <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Production config gated</span>
          </div>
        </div>
      </div>

      {/* Data Mode & Environment */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Data Adapter Mode</span>
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-200">
              Demo / Simulated Data Layer
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Simulates live feeds for Over50FitLife, NutriPlanPro, Kim's Closet, and Team Rhino for testing and verification.
            </p>
          </div>

          <button
            onClick={handleResetData}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset Demo State</span>
          </button>
        </div>
      </div>

      {/* System Telemetry Specs */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-400 font-mono">
        <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-2 font-mono">
          System Environment Information
        </h3>
        <p>Product: RacerOps Business Command Center</p>
        <p>Runtime: Vite 8.3 / React 19.3 / Tailwind CSS v4</p>
        <p>Active Businesses: 4 (Over50FitLife, NutriPlanPro, Kim's Closet, Team Rhino)</p>
        <p>Autonomous AI Fleet: 7 Specialized Agents (OpenClaw, Antigravity, Claude, NotebookLM, Grok, n8n, Blotato)</p>
        <p>Safety Protocol: Level 3 Human Approval Guard Active</p>
      </div>
    </div>
  );
};
