import React, { useState } from 'react';
import { Box, Plus, Search, HelpCircle, Package, ShieldCheck, Settings } from 'lucide-react';
import { InventoryItem, InventoryStatus } from '../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onAddInventory: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  onUpdateInventory: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
}

export default function InventoryView({ inventory, onAddInventory, onUpdateInventory }: InventoryViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // New item form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Flowers' | 'Lights' | 'Audio/Visual' | 'Furniture' | 'Power/Generator' | 'Camera/Equipment' | 'Other'>('Flowers');
  const [quantity, setQuantity] = useState<number>(1);
  const [status, setStatus] = useState<InventoryStatus>('Available');
  const [location, setLocation] = useState('');

  const categories = ['All', 'Flowers', 'Lights', 'Audio/Visual', 'Furniture', 'Power/Generator', 'Camera/Equipment', 'Other'];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await onAddInventory({
      name,
      category,
      quantity,
      status,
      location: location || 'Central Warehouse'
    });

    setName('');
    setQuantity(1);
    setLocation('');
    setShowAddForm(false);
  };

  const handleUpdateStatus = async (itemId: string, nextStatus: InventoryStatus) => {
    await onUpdateInventory(itemId, { status: nextStatus });
  };

  return (
    <div className="space-y-6" id="inventory_view">
      {/* Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search equipment, florals, location..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Register Asset</span>
          </button>
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of logistics items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInventory.map((item) => {
          const isAvailable = item.status === 'Available';
          const isAssigned = item.status === 'Assigned' || item.status === 'Reserved';
          const isDamaged = item.status === 'Damaged' || item.status === 'Lost';
          const isMaintenance = item.status === 'Maintenance';

          return (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                    {item.category}
                  </span>
                  <h3 className="font-semibold text-slate-800 text-sm">{item.name}</h3>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                  isAvailable ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                  isAssigned ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                  isMaintenance ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                  'bg-red-50 text-red-600 border border-red-100'
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block font-mono text-[9px] uppercase font-bold">In-Stock Quota</span>
                  <span className="text-sm font-bold text-slate-800">{item.quantity} units</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-mono text-[9px] uppercase font-bold">Venue Placement</span>
                  <span className="text-sm font-semibold text-slate-700 truncate block">{item.location || 'Warehouse'}</span>
                </div>
              </div>

              {/* Asset Action controls */}
              <div className="flex gap-2 justify-between pt-1 border-t border-slate-100">
                <select
                  value={item.status}
                  onChange={(e) => handleUpdateStatus(item.id, e.target.value as InventoryStatus)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 outline-none"
                >
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Lost">Lost</option>
                  <option value="Maintenance">Maintenance</option>
                </select>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => onUpdateInventory(item.id, { quantity: item.quantity + 1 })}
                    className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold hover:bg-slate-200"
                  >
                    +
                  </button>
                  <button
                    onClick={() => onUpdateInventory(item.id, { quantity: Math.max(0, item.quantity - 1) })}
                    className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold hover:bg-slate-200"
                  >
                    -
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Asset register modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <Package className="w-5 h-5 text-blue-600" />
              <h4 className="font-display font-bold text-lg text-slate-900">Register Logistical Asset</h4>
            </div>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Item / Asset Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., JBL VTX Monitor Speaker, LED P3 Screen"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Logistics Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">In-Stock Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Operational Location / Hall</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="E.g., Hall B storage, central locker"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition cursor-pointer"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
