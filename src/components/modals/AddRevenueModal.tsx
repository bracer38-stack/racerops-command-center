import React, { useState } from 'react';
import { X, DollarSign, Building2, Send } from 'lucide-react';
import { useRacerOps } from '../../context/RacerOpsContext';
import { BusinessId } from '../../types';

export const AddRevenueModal: React.FC = () => {
  const { isAddRevenueModalOpen, setIsAddRevenueModalOpen, recordRevenueEntry, businesses } = useRacerOps();

  const [businessId, setBusinessId] = useState<BusinessId>('over50fitlife');
  const [amount, setAmount] = useState('1500');
  const [description, setDescription] = useState('Client Coaching Retainer');
  const [source, setSource] = useState('Stripe Direct');

  if (!isAddRevenueModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount) || 0;
    if (val <= 0) return;

    recordRevenueEntry(businessId, val, description, source);
    setIsAddRevenueModalOpen(false);
    setAmount('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Record Real Revenue Entry</h2>
              <p className="text-[11px] text-slate-400">Post an actual sales inflow to portfolio financials</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddRevenueModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Target Business</label>
            <select
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value as BusinessId)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
            >
              {businesses.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Revenue Inflow Amount ($) *</label>
            <input
              type="number"
              required
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 2400.00"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono font-bold text-base focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Transaction Description</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Q4 Masterclass Coaching Enrollment"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Payment Method / Channel</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Stripe, Wire, App Store, Poshmark"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddRevenueModalOpen(false)}
              className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-md shadow-emerald-600/20"
            >
              Post Revenue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
