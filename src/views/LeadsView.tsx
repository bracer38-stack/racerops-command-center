import React, { useState } from 'react';
import {
  Users,
  Building2,
  DollarSign,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Mail,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useRacerOps } from '../context/RacerOpsContext';
import { LeadStage, BusinessId } from '../types';

export const LeadsView: React.FC = () => {
  const {
    leads,
    updateLeadStage,
    businesses,
    showToast,
    setIsAddLeadModalOpen,
    setIsIngestModalOpen
  } = useRacerOps();
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [businessFilter, setBusinessFilter] = useState<string>('all');

  const filteredLeads = leads.filter(l => {
    if (selectedStageFilter !== 'all' && l.stage !== selectedStageFilter) return false;
    if (businessFilter !== 'all' && l.businessId !== businessFilter) return false;
    return true;
  });

  const totalPipelineValue = leads.reduce((acc, l) => acc + l.value, 0);
  const overdueCount = leads.filter(l => l.isOverdue).length;

  const stages: { id: LeadStage; label: string }[] = [
    { id: 'new', label: 'New Lead' },
    { id: 'contacted', label: 'Contacted' },
    { id: 'qualified', label: 'Qualified' },
    { id: 'consultation', label: 'Consultation' },
    { id: 'proposal', label: 'Proposal / Offer' },
    { id: 'customer', label: 'Converted Customer' },
    { id: 'lost', label: 'Lost' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-100 tracking-tight">Leads & CRM Pipeline</h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
              HubSpot Adapter Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Unified relationship registry across high-ticket coaching, B2B wholesale, and app enterprise leads.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={businessFilter}
            onChange={(e) => setBusinessFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-medium focus:outline-none"
          >
            <option value="all">All Businesses</option>
            {businesses.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <button
            onClick={() => setIsIngestModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Import CSV
          </button>

          <button
            onClick={() => setIsAddLeadModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Pipeline Velocity KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400">Total Active Leads</span>
          <p className="text-2xl font-bold font-mono text-slate-100 mt-1">{leads.length}</p>
          <span className="text-[10px] text-slate-400 font-mono">In current pipeline</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400">Total Pipeline Value</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            ${totalPipelineValue.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-400 font-mono">Weighted forecast</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400">SLA Response Overdue</span>
          <p className="text-2xl font-bold font-mono text-rose-400 mt-1">{overdueCount}</p>
          <span className="text-[10px] text-rose-400/90 font-mono">Action required &gt;48h</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] uppercase font-mono text-slate-400">Avg Lead Cycle</span>
          <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">4.2 Days</p>
          <span className="text-[10px] text-cyan-400/80 font-mono">Inquiry to consultation</span>
        </div>
      </div>

      {/* Interactive Pipeline Board / Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Pipeline Stage Progression
          </h2>

          <div className="flex items-center space-x-1 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedStageFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium ${
                selectedStageFilter === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              All Stages
            </button>
            {stages.map(st => (
              <button
                key={st.id}
                onClick={() => setSelectedStageFilter(st.id)}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-medium whitespace-nowrap ${
                  selectedStageFilter === st.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase font-mono text-slate-400">
                <th className="pb-3">Contact</th>
                <th className="pb-3">Business</th>
                <th className="pb-3">Channel Source</th>
                <th className="pb-3">Pipeline Stage</th>
                <th className="pb-3">Deal Value</th>
                <th className="pb-3">Last Contact</th>
                <th className="pb-3">Next Action / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-slate-300">No active leads in pipeline</p>
                    <p className="text-xs text-slate-500 mt-1">Start by adding a lead manually or importing your contacts via CSV.</p>
                    <div className="flex items-center justify-center space-x-3 mt-4">
                      <button
                        onClick={() => setIsAddLeadModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Lead</span>
                      </button>
                      <button
                        onClick={() => setIsIngestModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        Import CSV
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-850/60 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-200">{lead.name}</span>
                        {lead.isOverdue && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                            SLA &gt;48H
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{lead.email}</p>
                      {lead.phone && <p className="text-[10px] text-slate-400">{lead.phone}</p>}
                    </td>

                    <td className="py-3">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {lead.businessId}
                      </span>
                    </td>

                    <td className="py-3 text-slate-300">{lead.source}</td>

                    <td className="py-3">
                      <select
                        value={lead.stage}
                        onChange={(e) => updateLeadStage(lead.id, e.target.value as LeadStage)}
                        className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-cyan-300 font-medium font-mono focus:outline-none focus:border-cyan-500"
                      >
                        {stages.map(st => (
                          <option key={st.id} value={st.id}>{st.label}</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 font-mono text-emerald-400 font-bold">
                      ${lead.value.toLocaleString()}
                    </td>

                    <td className="py-3 text-slate-400 font-mono text-[11px]">
                      {lead.lastContact}
                    </td>

                    <td className="py-3 max-w-xs text-slate-400 text-[11px] leading-snug">
                      {lead.notes}
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
};
