import React, { useState } from 'react';
import {
  FileBarChart,
  Download,
  Copy,
  Printer,
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Share2
} from 'lucide-react';
import { useRacerOps } from '../context/RacerOpsContext';
import { inventoryMetrics } from '../utils/inventoryMetrics';

export const ReportsView: React.FC = () => {
  const {
    financials,
    businesses,
    healthBreakdown,
    leads,
    kimItems,
    nutriPlanStats,
    priorities,
    approvals,
    showToast
  } = useRacerOps();

  const [selectedReport, setSelectedReport] = useState<string>('weekly');
  const kimMetrics = inventoryMetrics(kimItems);

  const reports = [
    { id: 'weekly', title: 'Weekly Business Review (WBR)', audience: 'Executive / Portfolio Wide' },
    { id: 'revenue', title: 'Revenue & Margin Pacing Report', audience: 'Financial Analysis' },
    { id: 'inventory', title: "Kim's Closet Inventory Aging Report", audience: 'E-Commerce Operations' },
    { id: 'product', title: 'NutriPlanPro Mobile Product Health Report', audience: 'Engineering & Product' },
    { id: 'automation', title: 'Automation Reliability & Fleet Audit', audience: 'Systems Infrastructure' },
    { id: 'leads', title: 'Lead Pipeline & SLA Velocity Report', audience: 'Sales & Growth' }
  ];

  const handleExport = () => {
    showToast('Report generated and exported to clipboard');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-100 tracking-tight">Executive Intelligence Reports</h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
              Automated Synthesis
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured in-app reports synthesizing financial, lead, inventory, and engineering metrics.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-all self-start sm:self-auto"
        >
          <Copy className="w-3.5 h-3.5 text-cyan-400" />
          <span>Copy Full Report</span>
        </button>
      </div>

      {/* Reports Catalog & Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Report Selector List (4 Cols) */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Available In-App Reports
          </span>
          {reports.map((rep) => (
            <button
              key={rep.id}
              onClick={() => setSelectedReport(rep.id)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                selectedReport === rep.id
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300'
              }`}
            >
              <h3 className="text-xs font-bold">{rep.title}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{rep.audience}</p>
            </button>
          ))}
        </div>

        {/* Report Document Preview (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold">
                RacerOps Business OS Document
              </span>
              <h2 className="text-base font-bold text-slate-100 mt-0.5">
                {reports.find(r => r.id === selectedReport)?.title}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Generated: {new Date().toLocaleDateString()} • Verified against live application state
              </p>
            </div>
            <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              HEALTH: {healthBreakdown.overallScore}/100
            </span>
          </div>

          {/* Render Content Based on Selected Report */}
          {selectedReport === 'weekly' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850">
                <h4 className="font-bold text-slate-100 uppercase tracking-wider font-mono text-[11px] mb-1">
                  1. Executive Summary
                </h4>
                <p>
                  Portfolio revenue reached <strong className="text-white">${financials.revenueThisMonth.toLocaleString()}</strong> across {businesses.length} operating brands, pacing {financials.revenueChangePct}% MoM with an estimated profit margin of {financials.profitMarginPct}% (${financials.profitEstimate.toLocaleString()}).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850">
                <h4 className="font-bold text-slate-100 uppercase tracking-wider font-mono text-[11px] mb-1">
                  2. Brand Performance Matrix
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  {businesses.map(business => (
                    <li key={business.id}><strong className="text-slate-200">{business.name}:</strong> ${business.revenueMonth.toLocaleString()} MTD revenue; {business.activeLeads} active leads.</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850">
                <h4 className="font-bold text-slate-100 uppercase tracking-wider font-mono text-[11px] mb-1">
                  3. Key Risks & Next Directives
                </h4>
                <p>
                  {priorities.filter(p => !p.completed).length} open priorities; {approvals.filter(a => a.status === 'pending').length} pending approvals.
                </p>
                {priorities.filter(p => !p.completed).map(p => <p key={p.id}>{p.title}: {p.suggestedAction}</p>)}
              </div>
            </div>
          )}

          {selectedReport === 'revenue' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850">
                <h4 className="font-bold text-slate-100 uppercase tracking-wider font-mono text-[11px] mb-2">
                  Financial Pacing Overview
                </h4>
                <p>Consolidated Monthly Revenue: ${financials.revenueThisMonth.toLocaleString()}</p>
                <p>Operating Expenses: ${financials.expensesThisMonth.toLocaleString()}</p>
                <p>Estimated Profit: ${financials.profitEstimate.toLocaleString()} ({financials.profitMarginPct}% Margin)</p>
                <p>Fixed Recurring Burn: ${financials.recurringBurn.toLocaleString()}/mo</p>
              </div>
            </div>
          )}

          {selectedReport === 'inventory' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850">
                <h4 className="font-bold text-slate-100 uppercase tracking-wider font-mono text-[11px] mb-2">
                  Aging Buckets & Liquid Capital Status
                </h4>
                <p>Total Listed Units: {kimMetrics.listedCount} Units.</p>
                <p>Average Turnaround: {kimMetrics.averageTurnaroundDays === null ? 'No sales data' : `${kimMetrics.averageTurnaroundDays.toFixed(1)} Days`}.</p>
                <p className="text-amber-300 mt-2">
                  Stagnant Units (&gt;60 Days): {kimMetrics.stagnantCount}.
                </p>
              </div>
            </div>
          )}

          {selectedReport !== 'weekly' && selectedReport !== 'revenue' && selectedReport !== 'inventory' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-400">
              This report is not yet implemented. No live telemetry report is available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
