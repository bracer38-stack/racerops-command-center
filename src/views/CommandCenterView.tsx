import React, { useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  DollarSign,
  Users,
  ChevronRight,
  ShieldAlert,
  FolderGit2,
  ShieldCheck,
  Check,
  X,
  Play,
  RotateCcw,
  Zap,
  Filter,
  Upload
} from 'lucide-react';
import { useRacerOps } from '../context/RacerOpsContext';
import { BusinessId, PrioritySeverity } from '../types';

export const CommandCenterView: React.FC = () => {
  const {
    businesses,
    healthBreakdown,
    priorities,
    togglePriority,
    alerts,
    resolveAlert,
    activities,
    financials,
    agents,
    integrations,
    projects,
    opportunities,
    updateOpportunityStatus,
    approvals,
    handleApproval,
    setIsHealthModalOpen,
    setIsDailyBriefOpen,
    setIsAskRacerOpsOpen,
    setIsIngestModalOpen,
    setActiveView,
    setSelectedBusinessId,
    setIsAssignTaskModalOpen
  } = useRacerOps();

  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const unresolvedAlerts = alerts.filter(a => !a.isResolved);
  const stalledProjects = projects.filter(p => p.inactivityAlert && p.recommendedAction !== 'archive');

  const filteredPriorities = priorities.filter(p => {
    if (priorityFilter === 'open') return !p.completed;
    if (priorityFilter === 'completed') return p.completed;
    return true;
  });

  const filteredActivities = activities.filter(act => {
    if (activityFilter === 'all') return true;
    return act.type === activityFilter;
  });

  const getSeverityBadge = (sev: PrioritySeverity) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-800 font-semibold';
      case 'high':
        return 'bg-amber-950/80 text-amber-300 border-amber-800 font-semibold';
      case 'medium':
        return 'bg-blue-950/80 text-blue-300 border-blue-800 font-medium';
      case 'low':
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Executive Welcome & Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-black text-slate-100 tracking-tight">
              Command Center
            </h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
              Autonomous Fleet Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Executive oversight across {businesses.length} businesses, {agents.length} AI agents, and {integrations.length} configured integrations.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          {/* Business Health Score Card */}
          <button
            onClick={() => setIsHealthModalOpen(true)}
            className="flex items-center space-x-3 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 transition-all text-left shadow-sm group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold font-mono text-sm group-hover:scale-105 transition-transform">
              {healthBreakdown.overallScore}
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-[11px] font-bold text-slate-200">Business Health</span>
                <span className="text-[10px] text-cyan-400 underline font-mono">Inspect</span>
              </div>
              <p className="text-[10px] text-slate-400">Score: 84/100 • Grade B+</p>
            </div>
          </button>

          <button
            onClick={() => setIsAssignTaskModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Assign Agent Task</span>
          </button>

          <button
            onClick={() => setIsIngestModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 text-xs font-semibold transition-all shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ingest Data / CSV</span>
          </button>

          <button
            onClick={() => setIsDailyBriefOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Daily Brief</span>
          </button>
        </div>
      </div>

      {/* Pending Consequential Approvals Section (Level 3 Safety Gate) */}
      {pendingApprovals.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border border-amber-800/60 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300 font-mono">
                Consequential Action Safety Gate ({pendingApprovals.length} Pending Sign-Off)
              </h2>
            </div>
            <span className="text-[11px] text-amber-400/80 font-mono">
              Human approval required for external and financial actions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pendingApprovals.map((appr) => (
              <div
                key={appr.id}
                className="p-3 rounded-xl bg-slate-950/90 border border-amber-900/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-mono text-amber-400 uppercase font-semibold">
                      {appr.category.replace('_', ' ')}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px]">
                      {appr.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-200 leading-snug">{appr.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal line-clamp-2">
                    {appr.payloadSummary}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono">From: {appr.initiator}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleApproval(appr.id, 'rejected')}
                      className="p-1 rounded bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition-colors"
                      title="Reject action"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleApproval(appr.id, 'deferred')}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium"
                      title="Defer decision"
                    >
                      Defer
                    </button>
                    <button
                      onClick={() => handleApproval(appr.id, 'approved')}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center space-x-1 shadow-sm"
                    >
                      <Check className="w-3 h-3" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Portfolio Summary
          </h2>
          <button
            onClick={() => setActiveView('businesses')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-medium"
          >
            <span>View All Business Details</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {businesses.map((biz) => (
            <div
              key={biz.id}
              onClick={() => {
                setSelectedBusinessId(biz.id);
                setActiveView('businesses');
              }}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-850 cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {biz.category}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      biz.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  ></span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {biz.name}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{biz.tagline}</p>

                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold font-mono text-slate-100">
                      ${biz.revenueMonth.toLocaleString()}
                    </span>
                    <span
                      className={`text-[11px] font-mono font-medium ${
                        biz.revenueChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {biz.revenueChangePct >= 0 ? '+' : ''}
                      {biz.revenueChangePct}%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Month-to-Date</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60">
                <p className="text-[10px] text-cyan-400 font-medium line-clamp-2">
                  <strong className="text-slate-300">Opportunity:</strong> {biz.topOpportunity}
                </p>
              </div>
            </div>
          ))}

          {/* Projects Card */}
          <div
            onClick={() => setActiveView('projects')}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/40 hover:bg-slate-850 cursor-pointer transition-all flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-800">
                  R&D / Inventions
                </span>
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
              </div>

              <h3 className="text-sm font-bold text-slate-100 group-hover:text-orange-300 transition-colors">
                Projects Pipeline
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{projects.filter(p => p.recommendedAction !== 'archive').length} active concepts & prototypes</p>

              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-bold font-mono text-slate-100">
                    {projects.length} Total
                  </span>
                  <span className="text-[11px] font-mono text-orange-400 font-semibold">
                    {stalledProjects.length} Stalled
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Inactivity Radar Active</span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/60">
              <p className="text-[10px] text-orange-400 font-medium line-clamp-2">
                {stalledProjects.length ? `Stalled: ${stalledProjects.map(p => p.name).join(', ')} needs a decision.` : 'No stalled projects.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Snapshot & Today's Priorities (Split Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Priorities (Left Column - 7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Today's Priorities (Ordered by Impact)
              </h2>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px]">
              <button
                onClick={() => setPriorityFilter('all')}
                className={`px-2 py-0.5 rounded ${
                  priorityFilter === 'all' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPriorityFilter('open')}
                className={`px-2 py-0.5 rounded ${
                  priorityFilter === 'open' ? 'bg-slate-800 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Open ({priorities.filter(p => !p.completed).length})
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredPriorities.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-80" />
                <h3 className="text-xs font-bold text-slate-200 uppercase font-mono">No Active Operational Priorities</h3>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  All systems clear. Use "Assign Agent Task" or "Ingest Data / CSV" to populate your live priorities.
                </p>
              </div>
            ) : (
              filteredPriorities.map((pri) => (
              <div
                key={pri.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  pri.completed
                    ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-sm'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => togglePriority(pri.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      pri.completed
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-slate-700 hover:border-cyan-500 bg-slate-950'
                    }`}
                  >
                    {pri.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-mono text-[10px] font-bold text-slate-400">
                        #{pri.rank}
                      </span>
                      <h3
                        className={`text-xs font-bold leading-snug ${
                          pri.completed ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {pri.title}
                      </h3>
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${getSeverityBadge(
                          pri.priority
                        )}`}
                      >
                        {pri.priority}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {pri.estimatedEffort}
                      </span>
                    </div>

                    <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
                      <div>
                        <strong className="text-slate-300 font-medium">Why it matters: </strong>
                        {pri.whyItMatters}
                      </div>
                      <div>
                        <strong className="text-cyan-300 font-medium">Expected impact: </strong>
                        {pri.expectedImpact}
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-medium">
                        <strong className="text-slate-400">Suggested Action: </strong>
                        {pri.suggestedAction}
                      </span>
                      <button
                        onClick={() => {
                          if (pri.businessId !== 'all') {
                            setSelectedBusinessId(pri.businessId as BusinessId);
                            setActiveView('businesses');
                          } else {
                            setActiveView('integrations');
                          }
                        }}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-semibold flex-shrink-0 ml-2"
                      >
                        <span>Take Action</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )))}
          </div>
        </div>

        {/* Financial Snapshot & Live Alerts (Right Column - 5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Financial Snapshot Card */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Financial Snapshot
                </h2>
              </div>
              <button
                onClick={() => setActiveView('finance')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <span>Full Ledger</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-mono">Consolidated Revenue</span>
                <p className="text-lg font-bold font-mono text-slate-100">
                  ${financials.revenueThisMonth.toLocaleString()}
                </p>
                <span className="text-[10px] text-emerald-400 font-mono font-medium">
                  +{financials.revenueChangePct}% vs prior mo
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-mono">Estimated Profit</span>
                <p className="text-lg font-bold font-mono text-emerald-400">
                  ${financials.profitEstimate.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  {financials.profitMarginPct}% net margin
                </span>
              </div>
            </div>

            {/* Revenue by Business Progress Bars */}
            <div className="space-y-2 pt-1 border-t border-slate-800/80">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                Share by Business
              </span>
              {financials.revenueByBusiness.map((b) => (
                <div key={b.businessId} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-medium">{b.name}</span>
                    <span className="font-mono text-slate-400">
                      ${b.revenue.toLocaleString()} ({b.pctOfTotal}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      style={{ width: `${b.pctOfTotal}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Recurring Burn: ${financials.recurringBurn.toLocaleString()}/mo</span>
              <span>Expenses: ${financials.expensesThisMonth.toLocaleString()}</span>
            </div>
          </div>

          {/* Real-time Alerts */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Active Alerts ({unresolvedAlerts.length})
                </h2>
              </div>
            </div>

            <div className="space-y-2">
              {unresolvedAlerts.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-200 uppercase font-mono">0 Active System Alerts</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">All automated monitors and websites reporting healthy status.</p>
                </div>
              ) : (
                unresolvedAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${getSeverityBadge(
                            alt.severity
                          )}`}
                        >
                          {alt.severity}
                        </span>
                        <h3 className="font-bold text-slate-200 leading-none">{alt.title}</h3>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">{alt.description}</p>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {alt.source} • {alt.timestamp}
                      </span>
                    </div>

                    <button
                      onClick={() => resolveAlert(alt.id)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium flex-shrink-0"
                    >
                      Resolve
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Universal Activity Timeline */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Universal Activity Timeline
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 text-[11px]">
            {['all', 'sale', 'lead', 'app', 'automation', 'agent'].map((f) => (
              <button
                key={f}
                onClick={() => setActivityFilter(f)}
                className={`px-2 py-0.5 rounded capitalize ${
                  activityFilter === f
                    ? 'bg-slate-800 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filteredActivities.slice(0, 6).map((act) => (
            <div
              key={act.id}
              className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`w-2 h-2 rounded-full ${
                    act.severity === 'success'
                      ? 'bg-emerald-400'
                      : act.severity === 'warning'
                      ? 'bg-amber-400'
                      : act.severity === 'critical'
                      ? 'bg-rose-400'
                      : 'bg-cyan-400'
                  }`}
                ></span>
                <div>
                  <span className="font-semibold text-slate-200">{act.title}</span>
                  <p className="text-[11px] text-slate-400">{act.description}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 flex-shrink-0 ml-4">
                {act.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
