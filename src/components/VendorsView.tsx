import React, { useState, useEffect } from 'react';
import { Truck, Plus, Star, Search, DollarSign, Mail } from 'lucide-react';
import { Vendor } from '../types';
import { db } from '../firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';

interface VendorsViewProps {
  vendors: Vendor[];
  onAddVendor: (vendor: Omit<Vendor, 'id'>) => Promise<void>;
  onUpdateVendor: (id: string, updates: Partial<Vendor>) => Promise<void>;
  onAddQuickLog: (type: 'task' | 'finance' | 'issue', payload: any) => Promise<void>;
}

interface VendorCardProps {
  key?: string;
  vendorId: string;
  initialVendor: Vendor;
  onUpdateVendor: (id: string, updates: Partial<Vendor>) => Promise<void>;
  setPayoutVendorId: (id: string | null) => void;
  setPayoutAmount: (amount: number) => void;
}

function VendorCard({ vendorId, initialVendor, onUpdateVendor, setPayoutVendorId, setPayoutAmount }: VendorCardProps) {
  const [vendor, setVendor] = useState<Vendor>(initialVendor);

  useEffect(() => {
    const docRef = doc(db, 'vendors', vendorId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        setVendor({
          id: docSnap.id,
          name: d.name || '',
          category: d.category || '',
          contact: d.contact || '',
          email: d.email || '',
          rating: Number(d.rating ?? 5.0),
          contractValue: Number(d.contractValue ?? 0),
          paidAmount: Number(d.paidAmount ?? 0),
          outstandingAmount: Number(d.outstandingAmount ?? 0),
          status: d.status || 'Active',
          documents: d.documents || []
        } as Vendor);
      }
    }, (err) => {
      console.error(`Error loading real-time vendor doc ${vendorId}:`, err);
    });
    return () => unsubscribe();
  }, [vendorId]);

  const isCompleted = vendor.status === 'Completed';

  return (
    <div key={vendor.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:shadow-md transition">
      
      {/* Header and Rating */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[10px] font-bold font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
            {vendor.category}
          </span>
          <h3 className="font-bold text-slate-800 text-sm">{vendor.name}</h3>
        </div>
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded">
          <Star className="w-3 h-3 fill-current" />
          <span>{vendor.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Vendor metadata */}
      <div className="text-xs text-slate-500 space-y-1.5 font-medium">
        <p className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" />
          <span>{vendor.email}</span>
        </p>
        <p className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5" />
          <span>{vendor.contact}</span>
        </p>
      </div>

      {/* Ledger breakdown */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] grid grid-cols-3 gap-2">
        <div>
          <span className="text-slate-400 font-mono text-[9px] uppercase font-bold">Total Contract</span>
          <span className="text-slate-800 font-bold block mt-0.5">INR {(vendor.contractValue / 1000).toFixed(0)}K</span>
        </div>
        <div>
          <span className="text-slate-400 font-mono text-[9px] uppercase font-bold text-emerald-600">Disbursed</span>
          <span className="text-emerald-600 font-bold block mt-0.5">INR {(vendor.paidAmount / 1000).toFixed(0)}K</span>
        </div>
        <div>
          <span className="text-slate-400 font-mono text-[9px] uppercase font-bold text-red-500">Balance</span>
          <span className="text-red-500 font-bold block mt-0.5">
            {vendor.outstandingAmount === 0 ? '0' : `INR ${(vendor.outstandingAmount / 1000).toFixed(0)}K`}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1 mt-1">
        <div className="flex justify-between text-[9px] text-slate-400 font-bold font-mono uppercase">
          <span>Disbursement Progress</span>
          <span>{Math.round((vendor.paidAmount / (vendor.contractValue || 1)) * 100)}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (vendor.paidAmount / (vendor.contractValue || 1)) * 100)}%` }}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-between pt-1 border-t border-slate-100 items-center">
        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
          isCompleted ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
        }`}>
          {vendor.status}
        </span>

        {!isCompleted && (
          <button
            onClick={() => {
              setPayoutVendorId(vendor.id);
              setPayoutAmount(vendor.outstandingAmount);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wide transition shadow-sm cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Reconcile/Pay</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function VendorsView({ vendors, onAddVendor, onUpdateVendor, onAddQuickLog }: VendorsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Local real-time sync with vendors collection to catch all additions/updates/deletions instantly
  const [liveVendors, setLiveVendors] = useState<Vendor[]>(vendors);

  useEffect(() => {
    const colRef = collection(db, 'vendors');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const list: Vendor[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: docSnap.id,
          name: d.name || '',
          category: d.category || '',
          contact: d.contact || '',
          email: d.email || '',
          rating: Number(d.rating ?? 5.0),
          contractValue: Number(d.contractValue ?? 0),
          paidAmount: Number(d.paidAmount ?? 0),
          outstandingAmount: Number(d.outstandingAmount ?? 0),
          status: d.status || 'Active',
          documents: d.documents || []
        } as Vendor);
      });
      // Sort alphabetically for beautiful, predictable layout matching original
      list.sort((a, b) => a.name.localeCompare(b.name));
      setLiveVendors(list);
    }, (error) => {
      console.error("Error listening to vendors collection:", error);
    });
    return () => unsubscribe();
  }, []);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [contractValue, setContractValue] = useState<number>(0);

  // Reconcile/Payout dialog
  const [payoutVendorId, setPayoutVendorId] = useState<string | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);

  const filteredVendors = liveVendors.filter(vendor => {
    return vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           vendor.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category.trim() || !contact.trim()) return;

    await onAddVendor({
      name,
      category,
      contact,
      email: email || 'vendor@slvevents.com',
      contractValue,
      paidAmount: 0,
      outstandingAmount: contractValue,
      status: 'Active',
      rating: 5.0
    });

    setName('');
    setCategory('');
    setContact('');
    setEmail('');
    setContractValue(0);
    setShowAddForm(false);
  };

  const handleProcessPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutVendorId || payoutAmount <= 0) return;

    const vendor = liveVendors.find(v => v.id === payoutVendorId);
    if (!vendor) return;

    const newPaidAmount = vendor.paidAmount + payoutAmount;
    const newOutstanding = Math.max(0, vendor.contractValue - newPaidAmount);

    // Update vendor ledger
    await onUpdateVendor(payoutVendorId, {
      paidAmount: newPaidAmount,
      outstandingAmount: newOutstanding,
      status: newOutstanding === 0 ? 'Completed' : 'Active'
    });

    // Create dual accounting ledger log entries
    await onAddQuickLog('finance', {
      type: 'Expense',
      category: `Vendor Payout - ${vendor.category}`,
      amount: payoutAmount,
      description: `Disbursed contract payout to ${vendor.name} (${vendor.category}).`
    });

    setPayoutVendorId(null);
    setPayoutAmount(0);
  };

  return (
    <div className="space-y-6" id="vendors_view">
      {/* Search and action controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sub-vendors, categories..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
          />
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard Vendor Partner</span>
        </button>
      </div>

      {/* Grid of Partners */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <VendorCard
            key={vendor.id}
            vendorId={vendor.id}
            initialVendor={vendor}
            onUpdateVendor={onUpdateVendor}
            setPayoutVendorId={setPayoutVendorId}
            setPayoutAmount={setPayoutAmount}
          />
        ))}
        {filteredVendors.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm font-medium">
            No vendor partners found matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Onboard Vendor Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <Truck className="w-5 h-5 text-blue-600" />
              <h4 className="font-display font-bold text-lg text-slate-900">Onboard Vendor Partner</h4>
            </div>
            <form onSubmit={handleCreateVendor} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Company / Trade Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., Swastik Florals, Crown Audio Rentals"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Contract Category</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="E.g., Audio rentals, Flowers, Valet security"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Contact Details</label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="E.g., Madan Lal (+91...)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Contract Value (INR)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={contractValue}
                    onChange={(e) => setContractValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Business Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E.g., contact@swastikflorals.com"
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
                  Onboard Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payout dialog modal */}
      {payoutVendorId && (() => {
        const vendor = liveVendors.find(v => v.id === payoutVendorId);
        const remainingBalance = vendor ? (vendor.contractValue - vendor.paidAmount) : 0;
        const isError = payoutAmount > remainingBalance;

        return (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4 text-emerald-600">
                <DollarSign className="w-6 h-6 shrink-0" />
                <h4 className="font-display font-bold text-lg text-slate-900">Reconcile Vendor Payout</h4>
              </div>
              <form onSubmit={handleProcessPayout} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Vendor Name</span>
                  <p className="text-sm font-bold text-slate-800">{vendor?.name}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Disburse Amount (INR)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold outline-none transition ${
                      isError ? 'border-red-500 bg-red-50 text-red-900 focus:border-red-500' : 'border-slate-200 focus:border-blue-500 text-slate-800'
                    }`}
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>Remaining Balance: INR {remainingBalance.toLocaleString()}</span>
                    <span>Total Contract: INR {vendor?.contractValue.toLocaleString()}</span>
                  </div>
                </div>

                {isError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-semibold space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="font-bold">⚠️ Over-Disbursement Blocked</p>
                    <p className="font-normal opacity-90">You cannot enter an amount greater than the remaining balance of INR {remainingBalance.toLocaleString()}.</p>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setPayoutVendorId(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isError || payoutAmount <= 0}
                    className={`px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-md transition ${
                      isError || payoutAmount <= 0
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                        : 'bg-emerald-600 hover:bg-emerald-500 cursor-pointer'
                    }`}
                  >
                    Confirm Payout
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
