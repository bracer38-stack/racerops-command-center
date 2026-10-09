import React, { useState } from 'react';
import { X, ShoppingBag, DollarSign, Tag, Send } from 'lucide-react';
import { useRacerOps } from '../../context/RacerOpsContext';
import { Marketplace } from '../../types';

export const AddInventoryModal: React.FC = () => {
  const { isAddInventoryModalOpen, setIsAddInventoryModalOpen, addNewKimItem } = useRacerOps();

  const [brand, setBrand] = useState('');
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState(`KC-${Math.floor(1000 + Math.random() * 9000)}`);
  const [category, setCategory] = useState('Handbags & Purses');
  const [cost, setCost] = useState('120');
  const [listingPrice, setListingPrice] = useState('350');
  const [marketplace, setMarketplace] = useState<Marketplace>('poshmark');
  const [notes, setNotes] = useState('');

  if (!isAddInventoryModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim() || !title.trim()) return;

    addNewKimItem({
      sku,
      brand,
      title,
      category,
      cost: parseFloat(cost) || 0,
      listingPrice: parseFloat(listingPrice) || 0,
      status: 'listed',
      marketplace,
      listingDate: new Date().toISOString().split('T')[0],
      daysListed: 0,
      agingBucket: '0-14',
      views: 0,
      likes: 0,
      offers: 0,
      lastRefreshed: 'Today',
      smartRecommendation: 'leave_unchanged',
      notes
    });

    setIsAddInventoryModalOpen(false);
    setBrand('');
    setTitle('');
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Add Inventory Item</h2>
              <p className="text-[11px] text-slate-400">List an item in Kim's Closet Boutique</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddInventoryModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Brand *</label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Chanel, Prada, Lululemon"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Item Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quilted Caviar Leather Flap Bag"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Handbags & Purses">Handbags & Purses</option>
                <option value="Outerwear">Outerwear</option>
                <option value="Shoes & Boots">Shoes & Boots</option>
                <option value="Activewear">Activewear</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Primary Marketplace</label>
              <select
                value={marketplace}
                onChange={(e) => setMarketplace(e.target.value as Marketplace)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 capitalize"
              >
                <option value="poshmark">Poshmark</option>
                <option value="mercari">Mercari</option>
                <option value="depop">Depop</option>
                <option value="whatnot">Whatnot</option>
                <option value="website">Direct Website</option>
                <option value="vestiaire">Vestiaire</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Cost Basis ($)</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Listing Price ($)</label>
              <input
                type="number"
                value={listingPrice}
                onChange={(e) => setListingPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Condition & Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Condition grade, provenance, or notes..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddInventoryModalOpen(false)}
              className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-semibold transition-all shadow-md shadow-pink-600/20"
            >
              Add Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
