import React, { useState } from 'react';
import {
  Building2,
  Users,
  Smartphone,
  ShoppingBag,
  Package,
  TrendingUp,
  Globe,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Percent,
  Bug,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useRacerOps } from '../context/RacerOpsContext';
import { BusinessId, AgingBucket, LeadStage } from '../types';

export const BusinessesView: React.FC = () => {
  const {
    businesses,
    selectedBusinessId,
    setSelectedBusinessId,
    leads,
    updateLeadStage,
    customers,
    over50Stats,
    nutriPlanStats,
    kimItems,
    updateKimItemRecommendation,
    teamRhinoStats,
    setIsAddLeadModalOpen,
    setIsAddInventoryModalOpen,
    setIsAddRevenueModalOpen,
    setIsIngestModalOpen
  } = useRacerOps();

  // Internal tab for Kim's Closet aging filter
  const [agingFilter, setAgingFilter] = useState<AgingBucket | 'all'>('all');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'leads' | 'content' | 'bugs' | 'roadmap' | 'inventory'>('overview');

  const currentBusiness = businesses.find(b => b.id === selectedBusinessId) || businesses[0];

  const filteredKimItems = kimItems.filter(item => {
    if (agingFilter === 'all') return true;
    return item.agingBucket === agingFilter;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Business Selector Pill Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-slate-100 tracking-tight flex items-center space-x-2">
            <span>Business Portfolio Command</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Dedicated operational dashboards for each brand and asset in your fleet
          </p>
        </div>

        {/* Business Selector Pills */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
          {businesses.map((biz) => (
            <button
              key={biz.id}
              onClick={() => {
                setSelectedBusinessId(biz.id);
                setActiveSubTab('overview');
              }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedBusinessId === biz.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>{biz.name}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                ${biz.revenueMonth.toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-lg font-bold text-slate-100">{currentBusiness.name}</h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
              {currentBusiness.category}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
              Health: {currentBusiness.healthScore}/100
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{currentBusiness.tagline}</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {selectedBusinessId === 'over50fitlife' && (
              <>
                <button
                  onClick={() => setIsAddLeadModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Lead</span>
                </button>
                <button
                  onClick={() => setIsAddRevenueModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                >
                  Record Revenue
                </button>
              </>
            )}
            {selectedBusinessId === 'kims-closet' && (
              <>
                <button
                  onClick={() => setIsAddInventoryModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
                <button
                  onClick={() => setIsIngestModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                >
                  Upload CSV
                </button>
              </>
            )}
            {selectedBusinessId === 'nutriplanpro' && (
              <button
                onClick={() => setIsAddRevenueModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Subscriptions</span>
              </button>
            )}
            {selectedBusinessId === 'team-rhino' && (
              <button
                onClick={() => setIsAddRevenueModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Sale</span>
              </button>
            )}
          </div>

          <div className="text-right border-l border-slate-800 pl-4">
            <span className="text-xs text-slate-400 font-mono block">MTD Revenue</span>
            <span className="text-lg font-bold text-slate-100 font-mono">
              ${currentBusiness.revenueMonth.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono block">
              +{currentBusiness.revenueChangePct}% vs last month
            </span>
          </div>
        </div>
      </div>

      {/* -------------------- 1. OVER50FITLIFE MODULE -------------------- */}
      {selectedBusinessId === 'over50fitlife' && (
        <div className="space-y-6">
          {/* Revenue Split & Web Funnel Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Revenue By Service Stream */}
            <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3 flex items-center justify-between">
                <span>Revenue by Offering</span>
                <span className="text-emerald-400 font-mono">$14,280 Total</span>
              </h3>

              <div className="space-y-2.5">
                {[
                  { label: 'VIP 1-on-1 Personal Training', val: over50Stats.revenueSplit.personalTraining, pct: 47.6 },
                  { label: 'Longevity Coaching Packages', val: over50Stats.revenueSplit.coachingPackages, pct: 27.3 },
                  { label: 'Digital Workout Programs & Guides', val: over50Stats.revenueSplit.digitalProducts, pct: 13.0 },
                  { label: 'Custom Nutrition Plans', val: over50Stats.revenueSplit.nutritionPlans, pct: 7.7 },
                  { label: 'Affiliate & Supplements', val: over50Stats.revenueSplit.affiliate, pct: 3.4 },
                  { label: 'Other Digital Revenue', val: over50Stats.revenueSplit.other, pct: 1.0 }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{item.label}</span>
                      <span className="font-mono text-slate-300">
                        ${item.val.toLocaleString()} ({item.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-cyan-500"
                        style={{ width: `${item.pct}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Website Behavioral Analytics */}
            <div className="lg:col-span-7 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Website & Acquisition Traffic</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Status: {over50Stats.website.websiteStatus.toUpperCase()} (0 broken links)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 mb-3 text-center">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">Sessions (30d)</span>
                  <p className="text-base font-bold font-mono text-slate-100">
                    {over50Stats.website.sessions.toLocaleString()}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">CTA Clicks</span>
                  <p className="text-base font-bold font-mono text-cyan-400">
                    {over50Stats.website.ctaClicks.toLocaleString()}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">Conversion Rate</span>
                  <p className="text-base font-bold font-mono text-emerald-400">
                    {over50Stats.website.conversionRate}%
                  </p>
                </div>
              </div>

              {/* Top Pages */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Top Content Pages</span>
                {over50Stats.website.topPages.map((pg, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <span className="font-mono text-cyan-300 truncate max-w-xs">{pg.path}</span>
                    <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
                      <span>{pg.views.toLocaleString()} views</span>
                      <span>{pg.bounceRate} bounce</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content Topic Performance Matrix */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3 flex items-center justify-between">
              <span>Content Topic Performance Intelligence</span>
              <span className="text-[11px] text-cyan-400 font-normal">
                Strength content outperforming mobility by 62%
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {over50Stats.contentTopics.map((top) => (
                <div
                  key={top.topic}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400">
                      {top.itemsCount} Published
                    </span>
                    <h4 className="text-xs font-bold text-slate-200 mt-1">{top.label}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      <strong className="text-slate-300">Top Post:</strong> {top.topPerformer}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">Avg Engagement</span>
                    <span className="font-bold font-mono text-emerald-400">
                      {top.avgEngagementRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leads & Consultation Requests Table */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center space-x-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Over50FitLife Leads & Consult Pipeline</span>
              </h3>
              <span className="text-xs text-amber-400 font-mono">
                2 inquiries overdue for contact (&gt;48h SLA)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-mono text-slate-400">
                    <th className="pb-2">Lead Name</th>
                    <th className="pb-2">Channel Source</th>
                    <th className="pb-2">Pipeline Stage</th>
                    <th className="pb-2">Est. Value</th>
                    <th className="pb-2">Last Contact</th>
                    <th className="pb-2">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leads.filter(l => l.businessId === 'over50fitlife').length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center">
                        <Users className="w-6 h-6 text-slate-600 mx-auto mb-1.5 opacity-50" />
                        <p className="text-xs font-semibold text-slate-300">No leads recorded yet for Over50FitLife</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Add coaching prospects or connect HubSpot / webhooks.</p>
                        <div className="flex items-center justify-center space-x-2 mt-3">
                          <button
                            onClick={() => setIsAddLeadModalOpen(true)}
                            className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                          >
                            + Add First Lead
                          </button>
                          <button
                            onClick={() => setIsIngestModalOpen(true)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                          >
                            Import CSV
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    leads
                      .filter(l => l.businessId === 'over50fitlife')
                      .map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-850/60 transition-colors">
                          <td className="py-2.5">
                            <p className="font-semibold text-slate-200 flex items-center space-x-1.5">
                              <span>{lead.name}</span>
                              {lead.isOverdue && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                                  OVERDUE SLA
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400">{lead.email}</p>
                          </td>
                          <td className="py-2.5 text-slate-400">{lead.source}</td>
                          <td className="py-2.5">
                            <select
                              value={lead.stage}
                              onChange={(e) => updateLeadStage(lead.id, e.target.value as LeadStage)}
                              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-cyan-300 font-mono font-medium"
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="qualified">Qualified</option>
                              <option value="consultation">Consultation</option>
                              <option value="proposal">Proposal</option>
                              <option value="customer">Customer</option>
                              <option value="lost">Lost</option>
                            </select>
                          </td>
                          <td className="py-2.5 font-mono font-semibold text-emerald-400">
                            ${lead.value.toLocaleString()}
                          </td>
                          <td className="py-2.5 text-slate-400 font-mono text-[11px]">
                            {lead.lastContact}
                          </td>
                          <td className="py-2.5">
                            <button
                              onClick={() => updateLeadStage(lead.id, 'contacted')}
                              className="px-2.5 py-1 rounded bg-cyan-600/80 hover:bg-cyan-500 text-white text-[11px] font-semibold transition-colors"
                            >
                              Mark Contacted
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 2. NUTRIPLANPRO MODULE -------------------- */}
      {selectedBusinessId === 'nutriplanpro' && (
        <div className="space-y-6">
          {/* User & Subscription Performance Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Total User Base</span>
              <p className="text-xl font-bold font-mono text-slate-100 mt-0.5">
                {nutriPlanStats.users.total.toLocaleString()}
              </p>
              <span className="text-[10px] text-emerald-400 font-mono">
                +{nutriPlanStats.users.newMonth} this month
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Active Subscribers</span>
              <p className="text-xl font-bold font-mono text-purple-400 mt-0.5">
                {nutriPlanStats.users.premium.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400 font-mono">
                {nutriPlanStats.subscriptions.monthly} mo / {nutriPlanStats.subscriptions.annual} yr
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Recurring MRR</span>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                ${nutriPlanStats.subscriptions.mrr.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400 font-mono">
                ARR: ${nutriPlanStats.subscriptions.arr.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Trial Conversion Rate</span>
              <p className="text-xl font-bold font-mono text-amber-400 mt-0.5">
                {nutriPlanStats.subscriptions.conversionRate}%
              </p>
              <span className="text-[10px] text-amber-400/80 font-mono">
                -1.8% dip vs Q2 target
              </span>
            </div>
          </div>

          {/* Platform Separation: iOS vs Android Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* iOS Status Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                    Apple App Store (iOS)
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  {nutriPlanStats.platforms.ios.storeStatus.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <p><strong className="text-slate-400">Current Version:</strong> v{nutriPlanStats.platforms.ios.version} (Build {nutriPlanStats.platforms.ios.build})</p>
                <p><strong className="text-slate-400">Store Status:</strong> {nutriPlanStats.platforms.ios.reviewStatus}</p>
                <p><strong className="text-slate-400">Downloads (30d):</strong> {nutriPlanStats.platforms.ios.installsMonth.toLocaleString()} installs</p>
              </div>
            </div>

            {/* Android Status Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                    Google Play Store (Android)
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                  {nutriPlanStats.platforms.android.storeStatus.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <p><strong className="text-slate-400">Current Version:</strong> v{nutriPlanStats.platforms.android.version} (Build {nutriPlanStats.platforms.android.build})</p>
                <p><strong className="text-slate-400">Store Status:</strong> {nutriPlanStats.platforms.android.reviewStatus}</p>
                <p><strong className="text-slate-400">Downloads (30d):</strong> {nutriPlanStats.platforms.android.installsMonth.toLocaleString()} installs</p>
              </div>
            </div>
          </div>

          {/* Development Bug Tracker & Roadmap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bug Tracker */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3 flex items-center space-x-2">
                <Bug className="w-4 h-4 text-rose-400" />
                <span>Development Bug Backlog</span>
              </h3>

              <div className="space-y-2.5">
                {nutriPlanStats.bugs.map((bug) => (
                  <div
                    key={bug.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{bug.title}</span>
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                          bug.severity === 'high'
                            ? 'bg-rose-950 text-rose-300 border-rose-800'
                            : bug.severity === 'medium'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {bug.severity}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
                      <span>Platform: {bug.platform.toUpperCase()}</span>
                      <span>Assigned: {bug.assignedAgent}</span>
                      <span className="text-cyan-400">Status: {bug.status}</span>
                    </div>
                    {bug.resolution && (
                      <p className="text-[11px] text-emerald-400/90 pt-1 font-mono">
                        Fix in review: {bug.resolution}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Product Roadmap */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>Product Roadmap Priorities</span>
              </h3>

              <div className="space-y-2.5">
                {nutriPlanStats.roadmap.map((feat) => (
                  <div
                    key={feat.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{feat.feature}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-medium">
                        {feat.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">{feat.description}</p>
                    <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono pt-1">
                      <span>Impact: {feat.expectedImpact}</span>
                      <span>Complexity: {feat.complexity}</span>
                      <span>Priority: {feat.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- 3. KIM'S CLOSET BOUTIQUE MODULE -------------------- */}
      {selectedBusinessId === 'kims-closet' && (
        <div className="space-y-6">
          {/* Aging Buckets Selector & Inventory Health Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Inventory Aging Buckets & Recommendations
                </h3>
                <p className="text-[11px] text-slate-400">
                  Filter inventory to target items eligible for price drops, relisting, or cross-posting
                </p>
              </div>

              {/* Bucket Filter Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto">
                {(['all', '0-14', '15-30', '31-60', '61-90', '90+'] as (AgingBucket | 'all')[]).map((b) => (
                  <button
                    key={b}
                    onClick={() => setAgingFilter(b)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                      agingFilter === b
                        ? 'bg-pink-600 text-white font-bold shadow-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {b === 'all' ? 'All Items' : `${b} Days`}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">Active Listed Items</span>
                <p className="text-base font-bold font-mono text-slate-100">148 Units</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">Avg Turnaround</span>
                <p className="text-base font-bold font-mono text-cyan-400">24.3 Days</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">Realized Gross Margin</span>
                <p className="text-base font-bold font-mono text-emerald-400">55.8%</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">Aging &gt;60 Days</span>
                <p className="text-base font-bold font-mono text-amber-400">3 Items Stagnant</p>
              </div>
            </div>
          </div>

          {/* Inventory Items Intelligence Matrix */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
              Inventory Matrix & Smart Action Triggers
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-mono text-slate-400">
                    <th className="pb-2">SKU / Item</th>
                    <th className="pb-2">Channel</th>
                    <th className="pb-2">Cost / List</th>
                    <th className="pb-2">Days Listed</th>
                    <th className="pb-2">Engagement</th>
                    <th className="pb-2">Smart Recommendation</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredKimItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center">
                        <ShoppingBag className="w-6 h-6 text-slate-600 mx-auto mb-1.5 opacity-50" />
                        <p className="text-xs font-semibold text-slate-300">No inventory items in this filter</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Add items or upload CSV from Poshmark, Mercari, or eBay.</p>
                        <div className="flex items-center justify-center space-x-2 mt-3">
                          <button
                            onClick={() => setIsAddInventoryModalOpen(true)}
                            className="px-2.5 py-1 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold"
                          >
                            + Add Item
                          </button>
                          <button
                            onClick={() => setIsIngestModalOpen(true)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                          >
                            Upload CSV
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredKimItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-2.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-slate-400">{item.sku}</span>
                          <span className="font-bold text-slate-200">{item.brand}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{item.title}</p>
                      </td>
                      <td className="py-2.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 capitalize">
                          {item.marketplace}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono">
                        <span className="text-slate-400">${item.cost} / </span>
                        <span className="text-slate-100 font-bold">${item.listingPrice}</span>
                      </td>
                      <td className="py-2.5 font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] ${
                            item.daysListed > 60
                              ? 'bg-rose-950 text-rose-300 font-bold'
                              : item.daysListed > 30
                              ? 'bg-amber-950 text-amber-300'
                              : 'text-slate-300'
                          }`}
                        >
                          {item.daysListed} days
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-slate-400 text-[11px]">
                        {item.views}v • {item.likes}♥ • {item.offers} offers
                      </td>
                      <td className="py-2.5">
                        <span className="text-[11px] font-semibold text-cyan-300 capitalize">
                          {item.smartRecommendation.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5">
                        {item.smartRecommendation === 'reduce_price' ? (
                          <button
                            onClick={() => updateKimItemRecommendation(item.id, 'markdown')}
                            className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-semibold transition-colors"
                          >
                            Apply -15%
                          </button>
                        ) : item.smartRecommendation === 'relist' ? (
                          <button
                            onClick={() => updateKimItemRecommendation(item.id, 'relist')}
                            className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold transition-colors"
                          >
                            Relist Fresh
                          </button>
                        ) : item.smartRecommendation === 'cross_list' ? (
                          <button
                            onClick={() => updateKimItemRecommendation(item.id, 'cross_list')}
                            className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold transition-colors"
                          >
                            Cross-List
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">Healthy</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

    {/* -------------------- 4. TEAM RHINO MODULE -------------------- */}
    {selectedBusinessId === 'team-rhino' && (() => {
      const rhinoUnitsSold = teamRhinoStats.products.reduce((acc, p) => acc + p.unitsSold, 0);
      const rhinoGrossRevenue = teamRhinoStats.products.reduce((acc, p) => acc + p.revenue, 0);
      const rhinoRealizedProfit = teamRhinoStats.products.reduce((acc, p) => acc + p.profit, 0);
      const rhinoInventoryStock = teamRhinoStats.products.reduce((acc, p) => acc + p.inventoryStock, 0);

      return (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Monthly Units Sold</span>
              <p className="text-xl font-bold font-mono text-slate-100 mt-0.5">
                {rhinoUnitsSold} Units
              </p>
              <span className="text-[10px] text-emerald-400 font-mono">Realized volume</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Gross Revenue</span>
              <p className="text-xl font-bold font-mono text-slate-100 mt-0.5">
                ${rhinoGrossRevenue.toLocaleString()}
              </p>
              <span className="text-[10px] text-emerald-400 font-mono">Wholesale & DTC</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Realized Profit</span>
              <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                ${rhinoRealizedProfit.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400 font-mono">Net margin</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Inventory Stock</span>
              <p className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
                {rhinoInventoryStock} Units
              </p>
              <span className="text-[10px] text-slate-400 font-mono">Available warehouse</span>
            </div>
          </div>

        {/* Product Catalog & Unit Economics */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
            SKU Performance & Unit Economics
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-mono text-slate-400">
                  <th className="pb-2">Product Name</th>
                  <th className="pb-2">SKU</th>
                  <th className="pb-2">Cost / Retail</th>
                  <th className="pb-2">Units Sold (30d)</th>
                  <th className="pb-2">Stock On Hand</th>
                  <th className="pb-2">Revenue</th>
                  <th className="pb-2">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {teamRhinoStats.products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <Package className="w-6 h-6 text-slate-600 mx-auto mb-1.5 opacity-50" />
                      <p className="text-xs font-semibold text-slate-300">No products recorded yet for Team Rhino</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Record wholesale orders or customer purchases.</p>
                      <div className="flex items-center justify-center space-x-2 mt-3">
                        <button
                          onClick={() => setIsAddRevenueModalOpen(true)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                        >
                          + Record Sale / Revenue
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  teamRhinoStats.products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-200">{prod.name}</td>
                      <td className="py-2.5 font-mono text-slate-400 text-[11px]">{prod.sku}</td>
                      <td className="py-2.5 font-mono text-slate-300">
                        ${prod.unitCost} / ${prod.unitPrice}
                      </td>
                      <td className="py-2.5 font-mono text-slate-200 font-semibold">{prod.unitsSold}</td>
                      <td className="py-2.5 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          prod.inventoryStock < 60 ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {prod.inventoryStock} units
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-slate-100 font-bold">
                        ${prod.revenue.toLocaleString()}
                      </td>
                      <td className="py-2.5 font-mono text-emerald-400 font-bold">
                        ${prod.profit.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  })()}
    </div>
  );
};
