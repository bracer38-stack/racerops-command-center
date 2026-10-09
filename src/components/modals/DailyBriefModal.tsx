import React from 'react';
import {
  X,
  Sparkles,
  DollarSign,
  Users,
  Smartphone,
  ShoppingBag,
  Cpu,
  Bot,
  Copy,
  Share2,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { useRacerOps } from '../../context/RacerOpsContext';

export const DailyBriefModal: React.FC = () => {
  const {
    isDailyBriefOpen,
    setIsDailyBriefOpen,
    financials,
    leads,
    kimItems,
    nutriPlanStats,
    priorities,
    approvals,
    tasks,
    automationRuns,
    automations,
    showToast
  } = useRacerOps();

  if (!isDailyBriefOpen) return null;

  const pendingApprovalsCount = approvals.filter(a => a.status === 'pending').length;
  const recentKimSale = kimItems.find(i => i.status === 'sold');
  const openPriorities = priorities.filter(p => !p.completed).slice(0, 3);
  const activeLeads = leads.filter(l => l.stage !== 'customer' && l.stage !== 'lost');
  const pipelineValue = activeLeads.reduce((sum, lead) => sum + lead.value, 0);
  const soldCount = kimItems.filter(item => item.status === 'sold').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const failedRuns = automationRuns.filter(run => run.status === 'failed').length;
  const degradedAutomations = automations.filter(a => a.status === 'degraded' || a.status === 'error').length;

  const handleCopyMarkdown = () => {
    const briefText = `**RacerOps Executive Daily Brief**
Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}

• Revenue this month: $${financials.revenueThisMonth.toLocaleString()} (+${financials.revenueChangePct}% MoM)
• Active leads: ${activeLeads.length} ($${pipelineValue.toLocaleString()} pipeline)
• NutriPlanPro subscribers: +${nutriPlanStats.subscriptions.newMonth} this month (${nutriPlanStats.subscriptions.conversionRate}% conv)
• Kim's Closet: ${soldCount} sold${recentKimSale ? `; ${recentKimSale.brand} ${recentKimSale.title}` : ''}
• Automation status: ${degradedAutomations} degraded or error in saved configuration

Top Priorities:
${openPriorities.map((priority, index) => `${index + 1}. ${priority.title}: ${priority.suggestedAction}`).join('\n') || 'No open priorities.'}

AI Activity:
• ${completedTasks} tasks completed on record
• ${pendingApprovalsCount} awaiting approval
• ${failedRuns} failed automation runs on record`;

    navigator.clipboard.writeText(briefText);
    showToast('Daily brief copied to clipboard in Markdown format');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-850 to-cyan-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>RacerOps Executive Daily Brief</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Ready
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDailyBriefOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Greeting */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-sm font-semibold text-slate-200">
              Good morning, Brace.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Consolidated revenue this month is <span className="text-cyan-300 font-medium">${financials.revenueThisMonth.toLocaleString()}</span>. {pendingApprovalsCount} approvals are waiting for your signature.
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
              Business Snapshot
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Revenue MTD</span>
                </div>
                <p className="text-base font-bold text-slate-100 font-mono">
                  ${financials.revenueThisMonth.toLocaleString()}
                </p>
                <p className="text-[10px] text-emerald-400 mt-0.5">+{financials.revenueChangePct}% MoM</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Active Leads</span>
                </div>
                <p className="text-base font-bold text-slate-100 font-mono">{activeLeads.length}</p>
                <p className="text-[10px] text-amber-400 mt-0.5">{activeLeads.filter(l => l.isOverdue).length} SLA overdue</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                  <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                  <span>NutriPlan Users</span>
                </div>
                <p className="text-base font-bold text-slate-100 font-mono">{nutriPlanStats.users.total.toLocaleString()}</p>
                <p className="text-[10px] text-purple-400 mt-0.5">{nutriPlanStats.users.premium.toLocaleString()} Premium</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-pink-400" />
                  <span>Kim's Closet</span>
                </div>
                <p className="text-base font-bold text-slate-100 font-mono">{soldCount} Sold</p>
                <p className="text-[10px] text-emerald-400 mt-0.5">{recentKimSale ? `${recentKimSale.brand} ${recentKimSale.title}` : 'No sales recorded'}</p>
              </div>
            </div>
          </div>

          {/* Top Priorities */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
              Top Priorities for Today
            </h3>
            <div className="space-y-2">
              {openPriorities.map((pri, idx) => (
                <div
                  key={pri.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start space-x-3"
                >
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-200">{pri.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{pri.suggestedAction}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {pri.estimatedEffort}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Activity Summary */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center space-x-2">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>Recorded Task & Automation Activity</span>
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                <span className="text-emerald-400 font-bold font-mono text-sm block">{completedTasks}</span>
                <span className="text-slate-400 text-[11px]">Tasks Completed</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                <span className="text-amber-400 font-bold font-mono text-sm block">{pendingApprovalsCount}</span>
                <span className="text-slate-400 text-[11px]">Awaiting Approval</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                <span className="text-slate-400 font-bold font-mono text-sm block">{failedRuns}</span>
                <span className="text-slate-400 text-[11px]">Failed Runs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Markdown</span>
            </button>
            <button
              onClick={() => showToast('WhatsApp integration adapter configured (Live webhook awaiting credentials)')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 hover:bg-emerald-900/60 text-xs font-medium transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Send to WhatsApp (Preview)</span>
            </button>
          </div>
          <button
            onClick={() => setIsDailyBriefOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
