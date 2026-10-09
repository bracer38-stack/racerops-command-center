import React from 'react';
import {
  Search,
  Sparkles,
  Bell,
  ShieldAlert,
  Activity,
  ArrowRight,
  ShieldCheck,
  Upload
} from 'lucide-react';
import { useRacerOps } from '../../context/RacerOpsContext';

export const Header: React.FC = () => {
  const {
    healthBreakdown,
    approvals,
    notifications,
    setIsHealthModalOpen,
    setIsDailyBriefOpen,
    setIsAskRacerOpsOpen,
    setIsSearchOpen,
    setIsIngestModalOpen,
    askRacerOpsQuery,
    setAskRacerOpsQuery,
    submitAskRacerOps
  } = useRacerOps();

  const pendingApprovalsCount = approvals.filter(a => a.status === 'pending').length;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (askRacerOpsQuery.trim()) {
      submitAskRacerOps();
      setIsAskRacerOpsOpen(true);
    } else {
      setIsAskRacerOpsOpen(true);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10 select-none">
      {/* Ask RacerOps Input Field */}
      <div className="flex-1 max-w-xl mr-6">
        <form onSubmit={handleSearchSubmit} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <input
            type="text"
            value={askRacerOpsQuery}
            onChange={(e) => setAskRacerOpsQuery(e.target.value)}
            placeholder="Ask RacerOps: 'What needs my attention?', 'Which Kim's Closet items to relist?', 'NutriPlanPro status'..."
            className="w-full pl-9 pr-24 py-2 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-medium"
          />
          <div className="absolute inset-y-0 right-1 flex items-center space-x-1 pr-1.5">
            <button
              type="submit"
              className="px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold flex items-center space-x-1 transition-all shadow-sm"
            >
              <span>Ask</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </form>
      </div>

      {/* Action Badges & Health Score */}
      <div className="flex items-center space-x-3">
        {/* Transparent Business Health Score Button */}
        <button
          onClick={() => setIsHealthModalOpen(true)}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/60 transition-all group shadow-sm"
          title="Click to view transparent health scoring calculation breakdown"
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <div className="flex items-center space-x-1.5 text-xs font-medium">
            <span className="text-slate-400">Health:</span>
            <span className="font-bold text-emerald-400 font-mono">
              {healthBreakdown.overallScore} / 100
            </span>
          </div>
          <span className="text-[10px] text-cyan-400 underline font-mono opacity-80 group-hover:opacity-100">
            Inspect
          </span>
        </button>

        {/* Ingest Data / Upload CSV Button */}
        <button
          onClick={() => setIsIngestModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 hover:bg-cyan-900/30 transition-all text-xs font-semibold shadow-sm"
          title="Upload real CSV or wipe sample data"
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ingest Data</span>
        </button>

        {/* Daily Brief Button */}
        <button
          onClick={() => setIsDailyBriefOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-blue-300 hover:bg-blue-900/30 hover:border-blue-700 transition-all text-xs font-semibold shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Daily Brief</span>
        </button>

        {/* Consequential Approvals Center */}
        {pendingApprovalsCount > 0 && (
          <button
            onClick={() => setIsAskRacerOpsOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 hover:bg-amber-900/40 transition-all text-xs font-semibold shadow-sm animate-pulse"
            title="Consequential actions awaiting human sign-off"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>{pendingApprovalsCount} Awaiting Approval</span>
          </button>
        )}

        {/* Global Search Palette Cmd+K */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all"
          title="Quick Find (Cmd+K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button
          onClick={() => setIsDailyBriefOpen(true)}
          className="relative p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-900"></span>
          )}
        </button>

        {/* User Pill */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs ring-1 ring-cyan-400/40">
            B
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-none">Brace</p>
            <p className="text-[10px] text-slate-400 leading-tight">Commander</p>
          </div>
        </div>
      </div>
    </header>
  );
};
