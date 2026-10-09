import React from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Layers,
  Database,
  Plus
} from 'lucide-react';
import { useRacerOps } from '../context/RacerOpsContext';

export const FinanceView: React.FC = () => {
  const { financials, setIsAddRevenueModalOpen } = useRacerOps();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-100 tracking-tight">Financial Command</h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
              Consolidated Ledger
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-business commercial performance, margins, recurring burn, and cash-flow pacing.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAddRevenueModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Revenue</span>
          </button>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ready for External Financial Sync</span>
          </div>
        </div>
      </div>

      {/* KPI Headline Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-mono text-slate-400">Total Revenue MTD</span>
          <p className="text-2xl font-bold font-mono text-slate-100 mt-1">
            ${financials.revenueThisMonth.toLocaleString()}
          </p>
          <div className="flex items-center space-x-1 text-emerald-400 text-xs mt-1 font-mono">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{financials.revenueChangePct}% vs last month</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-mono text-slate-400">Operating Expenses</span>
          <p className="text-2xl font-bold font-mono text-slate-100 mt-1">
            ${financials.expensesThisMonth.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 font-mono block mt-1">
            COGS & platform infrastructure
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-mono text-slate-400">Estimated Net Profit</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            ${financials.profitEstimate.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-400 font-mono font-medium block mt-1">
            {financials.profitMarginPct}% profit margin
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <span className="text-[10px] uppercase font-mono text-slate-400">Recurring Monthly Burn</span>
          <p className="text-2xl font-bold font-mono text-slate-100 mt-1">
            ${financials.recurringBurn.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 font-mono block mt-1">
            Fixed software & cloud subscriptions
          </span>
        </div>
      </div>

      {/* Revenue Breakdown by Business */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-4 flex items-center justify-between">
            <span>Portfolio Revenue Contribution</span>
            <span className="text-emerald-400 font-mono">${financials.revenueThisMonth.toLocaleString()}</span>
          </h2>

          <div className="space-y-4">
            {financials.revenueByBusiness.map((b) => (
              <div key={b.businessId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{b.name}</span>
                  <span className="font-mono text-slate-100 font-bold">
                    ${b.revenue.toLocaleString()}{' '}
                    <span className="text-slate-400 font-normal">({b.pctOfTotal}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                    style={{ width: `${b.pctOfTotal}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5-Month Cash Flow Pacing */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-4">
            5-Month Pacing & Margins
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-mono text-slate-400">
                  <th className="pb-2">Period</th>
                  <th className="pb-2">Gross Revenue</th>
                  <th className="pb-2">Expenses</th>
                  <th className="pb-2">Net Realized</th>
                  <th className="pb-2">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {financials.monthlyCashFlow.map((cf, idx) => {
                  const margin = Math.round((cf.profit / cf.revenue) * 100);
                  return (
                    <tr key={idx} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-2.5 font-medium text-slate-200">{cf.month}</td>
                      <td className="py-2.5 font-mono text-slate-100 font-semibold">
                        ${cf.revenue.toLocaleString()}
                      </td>
                      <td className="py-2.5 font-mono text-slate-400">
                        ${cf.expenses.toLocaleString()}
                      </td>
                      <td className="py-2.5 font-mono text-emerald-400 font-bold">
                        ${cf.profit.toLocaleString()}
                      </td>
                      <td className="py-2.5 font-mono text-slate-300">{margin}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Integration Notice */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>
            <strong>Dedicated Financial Module Ready:</strong> Designed with clean modular interfaces to ingest live bank feeds, Stripe ledgers, and QuickBooks sync.
          </span>
        </div>
      </div>
    </div>
  );
};
