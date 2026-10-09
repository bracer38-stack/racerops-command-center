import React, { useState } from 'react';
import { X, Users, DollarSign, Building2, Send } from 'lucide-react';
import { useRacerOps } from '../../context/RacerOpsContext';
import { BusinessId, LeadStage } from '../../types';

export const AddLeadModal: React.FC = () => {
  const { isAddLeadModalOpen, setIsAddLeadModalOpen, addNewLead, businesses } = useRacerOps();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessId, setBusinessId] = useState<BusinessId>('over50fitlife');
  const [value, setValue] = useState('2400');
  const [source, setSource] = useState('Direct Inbound');
  const [stage, setStage] = useState<LeadStage>('new');
  const [notes, setNotes] = useState('');

  if (!isAddLeadModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addNewLead({
      name,
      email: email || 'contact@client.com',
      phone,
      businessId,
      value: parseFloat(value) || 0,
      source,
      stage,
      notes,
      lastContact: 'Today',
      nextFollowUp: 'Scheduled'
    });

    setIsAddLeadModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Add New CRM Lead</h2>
              <p className="text-[11px] text-slate-400">Record a fresh consultation request or customer</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddLeadModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Contact Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Jennifer Clark"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jennifer@example.com"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Business</label>
              <select
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value as BusinessId)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                {businesses.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Estimated Value ($)</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as LeadStage)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="new">New Lead</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="consultation">Consultation</option>
                <option value="proposal">Proposal</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Lead Source</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. Website Organic"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Program goals, health history, or deal details..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddLeadModalOpen(false)}
              className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all shadow-md shadow-cyan-600/20"
            >
              Save Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
