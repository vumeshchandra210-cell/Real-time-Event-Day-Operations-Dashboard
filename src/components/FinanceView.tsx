import React, { useState, useEffect } from 'react';
import { FinanceTransaction, Event } from '../types';
import { 
  DollarSign, 
  Plus, 
  Download, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Receipt,
  HelpCircle,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  QrCode,
  X,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface FinanceViewProps {
  activeEvent: Event | null;
  financeTransactions: FinanceTransaction[];
  onAddTransaction: (tx: Omit<FinanceTransaction, 'id'>) => Promise<void>;
  onUpdateTransaction: (id: string, updates: Partial<FinanceTransaction>) => Promise<void>;
}

export default function FinanceView({ activeEvent, financeTransactions, onAddTransaction, onUpdateTransaction }: FinanceViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetailedHistory, setShowDetailedHistory] = useState(true);
  
  // Form State
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [category, setCategory] = useState('Vendor Payout');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [gstRate, setGstRate] = useState<number>(18); // Default standard event GST in India
  
  // Extended state for partial payments and vendor details
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [balanceAmount, setBalanceAmount] = useState<number>(0);
  const [vendorName, setVendorName] = useState('');
  const [transactionTime, setTransactionTime] = useState('');
  const [receiptNo, setReceiptNo] = useState('');

  // QR Payment modal state
  const [selectedTxForQr, setSelectedTxForQr] = useState<FinanceTransaction | null>(null);
  const [qrSimulationSuccess, setQrSimulationSuccess] = useState(false);

  // Document Compilation dialog
  const [exportingDoc, setExportingDoc] = useState<string | null>(null);
  const [exportComplete, setExportComplete] = useState<boolean>(false);

  // Totals calculations
  const totalIncome = financeTransactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = financeTransactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalGst = financeTransactions.reduce((sum, t) => sum + t.gstAmount, 0);

  // Active Event Financial Milestone Summary
  const totalEventContract = financeTransactions.reduce((sum, t) => {
    return sum + (t.totalAmount !== undefined ? t.totalAmount : t.amount);
  }, 0);

  const totalEventPaid = financeTransactions.reduce((sum, t) => {
    return sum + (t.paidAmount !== undefined ? t.paidAmount : (t.status === 'Paid' ? t.amount : 0));
  }, 0);

  const totalEventBalance = financeTransactions.reduce((sum, t) => {
    return sum + (t.balanceAmount !== undefined ? t.balanceAmount : (t.status === 'Paid' ? 0 : t.amount));
  }, 0);

  const paidProgressPercentage = totalEventContract > 0 
    ? Math.round((totalEventPaid / totalEventContract) * 100) 
    : 0;

  // Reset form with unique default values on opening
  useEffect(() => {
    if (showAddForm) {
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const randomId = Math.floor(1000 + Math.random() * 9000);
      setReceiptNo(`REC-${dateStr}-${randomId}`);
      setTransactionTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
      setAmount(0);
      setTotalAmount(0);
      setPaidAmount(0);
      setBalanceAmount(0);
      setVendorName('');
      setIsPartialPayment(false);
    }
  }, [showAddForm]);

  // Compute live outstanding balance
  useEffect(() => {
    if (isPartialPayment) {
      const calculatedBalance = Math.max(0, totalAmount - paidAmount);
      setBalanceAmount(calculatedBalance);
    } else {
      setBalanceAmount(0);
    }
  }, [totalAmount, paidAmount, isPartialPayment]);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = isPartialPayment ? paidAmount : amount;
    if (finalAmount <= 0 || !category.trim() || !description.trim() || !activeEvent) return;

    // Calculate embedded or added GST
    const calculatedGst = gstRate > 0 ? Math.round(finalAmount * (gstRate / (100 + gstRate))) : 0;

    await onAddTransaction({
      eventId: activeEvent.id,
      type,
      category,
      amount: finalAmount,
      date: new Date().toISOString().split('T')[0],
      description,
      gstAmount: calculatedGst,
      status: isPartialPayment && (totalAmount - paidAmount) > 0 ? 'Pending' : 'Paid',
      totalAmount: isPartialPayment ? totalAmount : finalAmount,
      paidAmount: isPartialPayment ? paidAmount : finalAmount,
      balanceAmount: isPartialPayment ? (totalAmount - paidAmount) : 0,
      vendorName: vendorName.trim() || undefined,
      transactionTime: transactionTime || undefined,
      receiptNo: receiptNo || undefined
    });

    setAmount(0);
    setDescription('');
    setShowAddForm(false);
  };

  const handleSimulatePayment = async () => {
    if (!selectedTxForQr) return;
    setQrSimulationSuccess(true);
    
    // Simulate updating transaction to paid in the database
    setTimeout(async () => {
      await onUpdateTransaction(selectedTxForQr.id, {
        paidAmount: selectedTxForQr.totalAmount || selectedTxForQr.amount,
        balanceAmount: 0,
        amount: selectedTxForQr.totalAmount || selectedTxForQr.amount,
        status: 'Paid'
      });
      setSelectedTxForQr(null);
      setQrSimulationSuccess(false);
    }, 1500);
  };

  const triggerExport = (format: 'PDF' | 'Excel' | 'CSV') => {
    setExportingDoc(format);
    setExportComplete(false);
    
    // Compile and trigger real download
    setTimeout(() => {
      setExportComplete(true);
      
      try {
        if (activeEvent) {
          const filenamePrefix = `ledger_${activeEvent.name.toLowerCase().replace(/\s+/g, '_')}`;
          
          if (format === 'CSV' || format === 'Excel') {
            const headers = [
              'Transaction Date', 
              'Transaction Time',
              'Receipt No',
              'Vendor Name',
              'Vertical Category', 
              'Ledger Type', 
              'Narrative Description', 
              'Total Contract Value (INR)',
              'Amount Paid (INR)',
              'Outstanding Balance (INR)',
              'GST Contrib (18% in INR)', 
              'Gross Amount (INR)'
            ];
            const rows = financeTransactions.map(tx => [
              tx.date,
              tx.transactionTime || 'N/A',
              tx.receiptNo || 'N/A',
              tx.vendorName || 'N/A',
              `"${tx.category.replace(/"/g, '""')}"`,
              tx.type,
              `"${tx.description.replace(/"/g, '""')}"`,
              tx.totalAmount !== undefined ? tx.totalAmount : tx.amount,
              tx.paidAmount !== undefined ? tx.paidAmount : tx.amount,
              tx.balanceAmount !== undefined ? tx.balanceAmount : 0,
              tx.gstAmount,
              tx.amount
            ]);
            const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `${filenamePrefix}.${format === 'Excel' ? 'csv' : 'csv'}`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else if (format === 'PDF') {
            // Generate a beautifully formatted HTML report that the user can print/save as PDF
            const htmlContent = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <title>Financial Ledger - ${activeEvent.name}</title>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; }
                  .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
                  .title { font-size: 24px; font-weight: bold; color: #0f172a; margin: 0; }
                  .meta { font-size: 14px; color: #64748b; margin-top: 5px; }
                  .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
                  .card { padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
                  .card-title { font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
                  .card-val { font-size: 18px; font-weight: bold; color: #0f172a; }
                  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                  th { background-color: #f8fafc; border-bottom: 1px solid #cbd5e1; padding: 10px; font-size: 11px; text-transform: uppercase; text-align: left; color: #475569; }
                  td { border-bottom: 1px solid #f1f5f9; padding: 12px 10px; font-size: 12px; }
                  .income { color: #10b981; font-weight: bold; }
                  .expense { color: #ef4444; font-weight: bold; }
                  .text-right { text-align: right; }
                  .receipt-badge { font-family: monospace; font-size: 11px; background-color: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px; display: inline-block; }
                  .balance-badge { color: #d97706; font-weight: bold; }
                  @media print {
                    .no-print { display: none; }
                    body { padding: 0; }
                  }
                </style>
              </head>
              <body>
                <div class="no-print" style="background: #eff6ff; padding: 15px; border-radius: 8px; border: 1px solid #bfdbfe; margin-bottom: 20px; font-size: 14px; color: #1e40af;">
                  <strong>PDF Export Ready:</strong> This is a print-ready document with all transaction receipts, times, payees, total values, paid amounts, and balances. Press <strong>Ctrl+P</strong> (or <strong>Cmd+P</strong> on Mac) and choose <strong>"Save as PDF"</strong> to download this document to your local storage.
                  <button onclick="window.print()" style="margin-left: 20px; padding: 6px 12px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Print / Save as PDF</button>
                </div>
                <div class="header">
                  <div class="title">Financial Ledger & Audit Sheet</div>
                  <div class="meta">Event: <strong>${activeEvent.name}</strong> &bull; Date Compiled: ${new Date().toLocaleDateString()}</div>
                </div>
                <div class="summary-cards">
                  <div class="card" style="background-color: #ecfdf5; border-color: #a7f3d0;">
                    <div class="card-title" style="color: #065f46;">Total Client Income</div>
                    <div class="card-val">INR ${totalIncome.toLocaleString()}</div>
                  </div>
                  <div class="card" style="background-color: #fef2f2; border-color: #fca5a5;">
                    <div class="card-title" style="color: #991b1b;">Total Outlays / Expenses</div>
                    <div class="card-val">INR ${totalExpense.toLocaleString()}</div>
                  </div>
                  <div class="card" style="background-color: #eff6ff; border-color: #bfdbfe;">
                    <div class="card-title" style="color: #1e40af;">Embedded GST Liability (18%)</div>
                    <div class="card-val">INR ${totalGst.toLocaleString()}</div>
                  </div>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Date / Time</th>
                      <th>Receipt No</th>
                      <th>Payee / Vendor</th>
                      <th>Category</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Total Contract</th>
                      <th>Paid Amount</th>
                      <th>Outstanding Bal</th>
                      <th>GST Component</th>
                      <th class="text-right">Ledger Value (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${financeTransactions.map(tx => `
                      <tr>
                        <td>${tx.date}<br><span style="color:#64748b; font-size:10px;">${tx.transactionTime || '00:00'}</span></td>
                        <td><span class="receipt-badge">${tx.receiptNo || 'N/A'}</span></td>
                        <td><strong>${tx.vendorName || 'N/A'}</strong></td>
                        <td>${tx.category}</td>
                        <td><span class="${tx.type === 'Income' ? 'income' : 'expense'}">${tx.type.toUpperCase()}</span></td>
                        <td style="max-width: 150px; font-size: 11px; color: #475569;">${tx.description}</td>
                        <td>INR ${(tx.totalAmount !== undefined ? tx.totalAmount : tx.amount).toLocaleString()}</td>
                        <td class="income">INR ${(tx.paidAmount !== undefined ? tx.paidAmount : tx.amount).toLocaleString()}</td>
                        <td><span class="${tx.balanceAmount && tx.balanceAmount > 0 ? 'balance-badge' : ''}">INR ${(tx.balanceAmount !== undefined ? tx.balanceAmount : 0).toLocaleString()}</span></td>
                        <td>INR ${tx.gstAmount.toLocaleString()}</td>
                        <td class="text-right ${tx.type === 'Income' ? 'income' : ''}" style="font-weight: bold;">
                          ${tx.type === 'Income' ? '+' : '-'} INR ${tx.amount.toLocaleString()}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                <div style="margin-top: 40px; font-size: 11px; text-align: center; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                  Generated by SLV Events Control Suite. Confidential Audit Voucher.
                </div>
              </body>
              </html>
            `;
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `${filenamePrefix}_report.html`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        }
      } catch (error) {
        console.error('Failed to trigger file download:', error);
      }
      
      setTimeout(() => {
        setExportingDoc(null);
        setExportComplete(false);
      }, 1500);
    }, 2000);
  };

  if (!activeEvent) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200">
        <DollarSign className="w-12 h-12 text-slate-300 animate-pulse mb-4" />
        <h3 className="text-lg font-bold text-slate-800">No Selected Event</h3>
        <p className="text-slate-500 text-sm max-w-sm mt-1">Select an active event from the control header to monitor the operational budget and transaction sheets.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="finance_view">
      {/* Top Ledger Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Income Card */}
        <div className="p-6 bg-emerald-50/50 border border-emerald-200 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-800 font-bold font-mono text-[10px] uppercase">
            <span>Cumulative Client Income</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-3xl font-display font-bold text-slate-900 block">INR {(totalIncome / 100000).toFixed(2)} Lakhs</span>
          <p className="text-[10px] text-slate-400 font-mono">Gross income realized on booking installments</p>
        </div>

        {/* Expenses Card */}
        <div className="p-6 bg-red-50/50 border border-red-200 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-red-800 font-bold font-mono text-[10px] uppercase">
            <span>Disbursed Expenditures</span>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-3xl font-display font-bold text-slate-900 block">INR {(totalExpense / 100000).toFixed(2)} Lakhs</span>
          <p className="text-[10px] text-slate-400 font-mono">Disbursed to floral, AV, power, and logistics partners</p>
        </div>

        {/* GST Card */}
        <div className="p-6 bg-blue-50/50 border border-blue-200 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-blue-800 font-bold font-mono text-[10px] uppercase">
            <span>Embedded GST Liability (18%)</span>
            <Receipt className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-3xl font-display font-bold text-slate-900 block">INR {totalGst.toLocaleString()}</span>
          <p className="text-[10px] text-slate-400 font-mono">Calculated on standard double-entry logs</p>
        </div>
      </div>

      {/* Event Financial Progress & Settled Status Card */}
      <div className="bg-gradient-to-r from-slate-950 to-slate-850 text-white rounded-2xl p-6 border border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-blue-400 font-mono uppercase tracking-wider bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900">Event Settlement Hub</span>
              <span className="text-[10px] font-medium text-slate-400">| Live tracking of all ledger balances</span>
            </div>
            <h4 className="font-display font-bold text-base">Settlement Milestone Progress - {activeEvent.name}</h4>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-2xl font-bold font-mono text-emerald-400">{paidProgressPercentage}% Paid</span>
            <p className="text-[10px] text-slate-400 font-mono">Of overall contract book value</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden border border-slate-700/50">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${paidProgressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500 font-bold">
            <span>0% Unsettled</span>
            <span>50% Mid-point</span>
            <span>100% Fully Paid</span>
          </div>
        </div>

        {/* Total, Paid, Balance Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total contract / budget</span>
            <span className="text-base font-bold text-slate-100 font-mono block">INR {totalEventContract.toLocaleString()}</span>
          </div>
          <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/30 rounded-xl space-y-1">
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider font-mono">Settled amount (Paid)</span>
            <span className="text-base font-bold text-emerald-400 font-mono block">INR {totalEventPaid.toLocaleString()}</span>
          </div>
          <div className="p-3.5 bg-amber-950/20 border border-amber-900/30 rounded-xl space-y-1">
            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider font-mono">Outstanding balance</span>
            <span className="text-base font-bold text-amber-400 font-mono block">INR {totalEventBalance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Control Buttons row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Data Export Console</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => triggerExport('PDF')}
            className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <FileText className="w-4 h-4 text-red-500" />
            <span>Export Receipts & Ledger PDF</span>
          </button>
          <button 
            onClick={() => triggerExport('Excel')}
            className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Generate Excel Ledger</span>
          </button>
          <button 
            onClick={() => triggerExport('CSV')}
            className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Download raw CSV</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Transaction</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <h3 className="font-display font-bold text-slate-800 text-sm">Financial Transaction Registry ({financeTransactions.length} entries)</h3>
            <span className="text-[10px] font-mono text-slate-400">Contains Receipts, Times, Payees, and Outstanding Balances</span>
          </div>
          <button
            onClick={() => setShowDetailedHistory(!showDetailedHistory)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            {showDetailedHistory ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
            <span>{showDetailedHistory ? 'Hide Transactions' : 'Show Transactions'}</span>
          </button>
        </div>
        {showDetailedHistory ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Receipt / Class</th>
                  <th className="px-6 py-4">Payee / Vendor</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Contract / Paid / Balance</th>
                  <th className="px-6 py-4">GST Contrib</th>
                  <th className="px-6 py-4 text-right">Ledger Value (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {financeTransactions.map((tx) => {
                  const isIncome = tx.type === 'Income';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition font-medium">
                      <td className="px-6 py-4 font-mono text-slate-400">
                        <div>{tx.date}</div>
                        {tx.transactionTime && <div className="text-[10px] text-slate-400 font-semibold">{tx.transactionTime}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{tx.category}</div>
                        {tx.receiptNo && (
                          <div className="mt-1 font-mono text-[9px] text-blue-600 bg-blue-50/50 border border-blue-100 px-1.5 py-0.5 rounded w-max">
                            {tx.receiptNo}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {tx.vendorName ? (
                          <span className="font-bold text-slate-800">{tx.vendorName}</span>
                        ) : (
                          <span className="text-slate-400 italic">No Vendor Assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold uppercase tracking-wider text-[9px] px-2 py-0.5 rounded-full ${
                          isIncome ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{tx.description}</td>
                      <td className="px-6 py-4">
                        {tx.totalAmount !== undefined ? (
                          <div className="space-y-0.5 text-xs font-mono">
                            <div className="text-slate-400 text-[10px]">Total: <span className="font-bold text-slate-700">INR {tx.totalAmount.toLocaleString()}</span></div>
                            <div className="text-emerald-600 text-[10px]">Paid: <span className="font-bold">INR {tx.paidAmount?.toLocaleString()}</span></div>
                            {tx.balanceAmount !== undefined && tx.balanceAmount > 0 ? (
                              <div className="text-amber-600 text-[10px]">Bal: <span className="font-bold bg-amber-50 px-1 py-0.5 rounded border border-amber-100">INR {tx.balanceAmount.toLocaleString()}</span></div>
                            ) : (
                              <div className="text-emerald-600 text-[10px] italic">Fully Settled</div>
                            )}
                          </div>
                        ) : (
                          <div className="font-mono text-slate-600">
                            Total: INR {tx.amount.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500">INR {tx.gstAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-bold">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`text-sm ${isIncome ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {isIncome ? '+' : '-'} INR {tx.amount.toLocaleString()}
                          </span>
                          {!isIncome && tx.balanceAmount !== undefined && tx.balanceAmount > 0 && (
                            <button
                              onClick={() => {
                                setSelectedTxForQr(tx);
                                setQrSimulationSuccess(false);
                              }}
                              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition ml-2 flex items-center justify-center cursor-pointer"
                              title="Open UPI QR Code Payment"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center bg-slate-50/50 text-slate-500 space-y-3">
            <EyeOff className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-semibold text-slate-800 text-sm">Detailed Transaction History is Collapsed</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">The itemized transaction sheet has been collapsed to save vertical space. You can expand it anytime to view payment receipts, payee audits, transaction times, and outstanding balance tracking.</p>
            <button
              onClick={() => setShowDetailedHistory(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition cursor-pointer"
            >
              Expand Registry Table
            </button>
          </div>
        )}
      </div>

      {/* Log transaction form modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 text-slate-900">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <h4 className="font-display font-bold text-lg text-slate-900">Log Financial Entry</h4>
              </div>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTransaction} className="space-y-4">
              
              {/* Receipt and Time details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Receipt Number</span>
                  <input
                    type="text"
                    required
                    value={receiptNo}
                    onChange={(e) => setReceiptNo(e.target.value)}
                    className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Time of Transaction</span>
                  <input
                    type="text"
                    required
                    value={transactionTime}
                    onChange={(e) => setTransactionTime(e.target.value)}
                    placeholder="e.g. 14:35"
                    className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Ledger Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  >
                    <option value="Expense">Disbursed Outlay (Expense)</option>
                    <option value="Income">Client Milestone In (Income)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Vertical Classification</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="E.g., Floral Rentals, Sound Wages"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Vendor & Payee Details */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Payee / Vendor Name</label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="E.g., Sri Lakshmi Venkateswara Flowers, DJ Naveen, or Guest Party"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
                />
              </div>

              {/* Partial Payment Toggle */}
              {!isPartialPayment && type === 'Expense' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsPartialPayment(true);
                    setTotalAmount(amount || 20000);
                    setPaidAmount(amount || 15000);
                  }}
                  className="w-full text-left py-2 px-3 border border-dashed border-blue-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Enable detailed Partial Payment / Balance tracking for this outlay</span>
                </button>
              )}

              {/* Form Input Block depends on isPartialPayment */}
              {isPartialPayment ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">Partial Payment breakdown</span>
                    <button
                      type="button"
                      onClick={() => setIsPartialPayment(false)}
                      className="text-xs text-red-500 font-semibold hover:underline"
                    >
                      Disable
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Total Contract</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Amount Paid Now</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-emerald-600 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Remaining Balance</label>
                      <input
                        type="number"
                        disabled
                        value={balanceAmount}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-slate-100 text-amber-600 font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Transaction Value (INR)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Standard GST rate (%)</label>
                    <select
                      value={gstRate}
                      onChange={(e) => setGstRate(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                    >
                      <option value="18">18% standard</option>
                      <option value="5">5% concession</option>
                      <option value="0">0% exempt</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Detailed Narrative</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide reference logs, payee details, and bank transfer credentials..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
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
                  Commit Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR payment modal */}
      {selectedTxForQr && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">Settlement Assistant</span>
              <button 
                onClick={() => setSelectedTxForQr(null)} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {qrSimulationSuccess ? (
              <div className="space-y-4 py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-900">Payment Complete!</h4>
                  <p className="text-slate-500 text-xs mt-1">Outstanding balance settled. PDF receipts updated automatically.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-slate-900 text-sm">UPI Instant Scan & Settle</h4>
                  <p className="text-[11px] text-slate-500">Scan code below via PhonePe, GPay, or Paytm to pay the balance.</p>
                </div>

                {/* Live Dynamic QR Code via QRServer API */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 w-max mx-auto shadow-inner">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=slvevents@upi&pn=SLV%20Events&am=${selectedTxForQr.balanceAmount || selectedTxForQr.amount}&cu=INR&tn=${encodeURIComponent(`Bal pay for ${selectedTxForQr.category}`)}`)}`}
                    alt="UPI Payment QR Code"
                    className="w-[150px] h-[150px] mx-auto bg-white p-1"
                  />
                  <div className="mt-2 font-mono text-[10px] font-bold text-slate-600 bg-slate-200/50 rounded px-2 py-0.5">
                    slvevents@upi
                  </div>
                </div>

                {/* Ledger Details summary */}
                <div className="bg-slate-50 p-3 rounded-xl text-left border border-slate-100 text-[11px] space-y-1.5 font-medium">
                  <div className="flex justify-between text-slate-500">
                    <span>Vendor:</span>
                    <span className="font-bold text-slate-800">{selectedTxForQr.vendorName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Receipt No:</span>
                    <span className="font-mono text-slate-800 font-bold">{selectedTxForQr.receiptNo || 'N/A'}</span>
                  </div>
                  <hr className="border-slate-200" />
                  <div className="flex justify-between text-slate-500">
                    <span>Total Contract:</span>
                    <span className="font-mono text-slate-800">INR {(selectedTxForQr.totalAmount || selectedTxForQr.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Amount Paid:</span>
                    <span className="font-mono text-emerald-600 font-bold">INR {(selectedTxForQr.paidAmount || selectedTxForQr.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-800 bg-amber-50 p-1.5 rounded border border-amber-100 font-bold">
                    <span>Outstanding Balance:</span>
                    <span className="font-mono text-amber-600">INR {(selectedTxForQr.balanceAmount || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTxForQr(null)}
                    className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSimulatePayment}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    Simulate Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export progress overlay */}
      {exportingDoc && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-sm-sm w-full shadow-2xl text-center space-y-4 animate-in fade-in zoom-in duration-200">
            {exportComplete ? (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-slate-900">Download Ready</h4>
                  <p className="text-slate-500 text-xs">High-fidelity ledger and transaction receipt statement compiled. Triggering file download.</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto animate-spin">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-slate-900">Compiling ledger sheet</h4>
                  <p className="text-slate-500 text-xs">Assembling transaction logs, times, receipts, payee audits, and outstanding balance statements in {exportingDoc} format.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
