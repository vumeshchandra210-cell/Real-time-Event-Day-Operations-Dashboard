import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  MessageSquare, 
  AlertCircle,
  Loader2,
  Trash2,
  ChevronDown
} from 'lucide-react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface BookingRequest {
  id: string;
  customerName: string;
  phoneNumber: string;
  emailAddress: string;
  eventType: string;
  eventDate: string;
  location: string;
  budget: string;
  additionalRequirements?: string;
  status: 'Pending' | 'Contacted' | 'Confirmed';
  createdAt: string;
  eventCreated?: boolean;
}

export default function BookingsView() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Detail view modal / expanded request
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);

  // Real-time sync with Firestore
  useEffect(() => {
    setLoading(true);
    const bookingsCollection = collection(db, 'booking_requests');
    
    const unsubscribe = onSnapshot(bookingsCollection, 
      (snapshot) => {
        const bookingsList: BookingRequest[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            customerName: data.customerName || '',
            phoneNumber: data.phoneNumber || '',
            emailAddress: data.emailAddress || '',
            eventType: data.eventType || 'Other',
            eventDate: data.eventDate || '',
            location: data.location || '',
            budget: data.budget || '',
            additionalRequirements: data.additionalRequirements || '',
            status: data.status || 'Pending',
            createdAt: data.createdAt || new Date().toISOString(),
            eventCreated: data.eventCreated || false
          } as BookingRequest;
        });

        // Sort by createdAt descending (newest first)
        bookingsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setBookings(bookingsList);
        setLoading(false);
        setError(null);
      }, 
      (err) => {
        console.error('Error fetching bookings:', err);
        setError('Failed to sync booking requests from Firestore database.');
        setLoading(false);
        handleFirestoreError(err, OperationType.GET, 'booking_requests');
      }
    );

    return () => unsubscribe();
  }, []);

  // Helper to parse numeric budget from string representation
  const parseBudgetToNumber = (budgetStr: string): number => {
    const cleaned = budgetStr.replace(/[^\d]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Update request status in Firestore
  const handleUpdateStatus = async (id: string, newStatus: 'Pending' | 'Contacted' | 'Confirmed') => {
    const path = `booking_requests/${id}`;
    try {
      const docRef = doc(db, 'booking_requests', id);
      const booking = bookings.find(b => b.id === id);

      if (newStatus === 'Confirmed' && booking && !booking.eventCreated) {
        // Automatically spawn a corresponding active event in the database
        const budgetNumber = parseBudgetToNumber(booking.budget);
        const eventName = `${booking.customerName}'s ${booking.eventType}`;
        
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: eventName,
            clientName: booking.customerName,
            type: booking.eventType,
            date: booking.eventDate,
            venue: booking.location,
            guestCount: 150, // standard default guest estimate
            budget: budgetNumber,
            description: booking.additionalRequirements || '',
            notes: `Auto-generated from Confirmed Booking Request (ID: ${booking.id}). Phone: ${booking.phoneNumber}, Email: ${booking.emailAddress}`
          })
        });

        if (response.ok) {
          await updateDoc(docRef, { 
            status: newStatus,
            eventCreated: true
          });
          
          if (selectedBooking && selectedBooking.id === id) {
            setSelectedBooking(prev => prev ? { ...prev, status: newStatus, eventCreated: true } : null);
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          console.error('Failed to create event on server:', errData);
          alert(`Booking status changed to Confirmed, but server event creation failed: ${errData.error || 'Server error'}`);
          await updateDoc(docRef, { status: newStatus });
        }
      } else {
        await updateDoc(docRef, { status: newStatus });
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update booking status. Please try again.');
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  // Delete request from Firestore
  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this booking request?')) {
      return;
    }
    const path = `booking_requests/${id}`;
    try {
      await deleteDoc(doc(db, 'booking_requests', id));
      setSelectedBooking(null);
    } catch (err) {
      console.error('Error deleting booking:', err);
      alert('Failed to delete booking request. Please try again.');
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Filter bookings based on user input
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phoneNumber.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesType = typeFilter === 'all' || booking.eventType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Unique event types for filter dropdown
  const eventTypes = Array.from(new Set(bookings.map(b => b.eventType)));

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Contacted':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6" id="bookings_dashboard">
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 tracking-tight">Booking Requests</h2>
          <p className="text-xs text-slate-500">Manage client inquiries, contact statuses, and convert them to live event blueprints.</p>
        </div>
        <div className="flex items-center gap-2.5 font-mono text-xs text-slate-500 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm">
          <span>Database Mode:</span>
          <strong className="text-blue-600 font-bold">Cloud Firestore</strong>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Requests</span>
          <span className="text-2xl font-bold text-slate-900 mt-2">{bookings.length}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono text-blue-500">Pending</span>
          <span className="text-2xl font-bold text-blue-600 mt-2">
            {bookings.filter(b => b.status === 'Pending').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono text-amber-500">Contacted</span>
          <span className="text-2xl font-bold text-amber-600 mt-2">
            {bookings.filter(b => b.status === 'Contacted').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono text-emerald-500">Confirmed</span>
          <span className="text-2xl font-bold text-emerald-600 mt-2">
            {bookings.filter(b => b.status === 'Confirmed').length}
          </span>
        </div>
      </div>

      {/* Main Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, email, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 outline-none text-xs text-slate-800 focus:border-blue-600 transition bg-slate-50/50 focus:bg-white"
          />
        </div>

        {/* Filter Selection */}
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white outline-none text-xs font-semibold text-slate-700 focus:border-blue-600 transition"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Contacted">Contacted</option>
              <option value="Confirmed">Confirmed</option>
            </select>
          </div>

          {/* Event Type Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white outline-none text-xs font-semibold text-slate-700 focus:border-blue-600 transition"
            >
              <option value="all">All Types</option>
              {eventTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Listing & Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table/List Container */}
        <div className={`bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden ${
          selectedBooking ? 'lg:col-span-7' : 'lg:col-span-12'
        }`}>
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">Synchronizing with Firestore...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-20 text-center text-slate-400 space-y-2">
              <Clock className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-sm">No booking requests found.</p>
              <p className="text-xs">Adjust search parameters or try submitting the public booking form.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    <th className="px-5 py-3.5">Customer / Contact</th>
                    <th className="px-5 py-3.5">Event Details</th>
                    <th className="px-5 py-3.5">Budget</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((booking) => {
                    const isSelected = selectedBooking?.id === booking.id;
                    return (
                      <tr 
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className={`hover:bg-slate-50/70 transition duration-150 cursor-pointer ${
                          isSelected ? 'bg-blue-50/30 font-medium border-l-2 border-blue-600' : ''
                        }`}
                      >
                        {/* Customer */}
                        <td className="px-5 py-4 space-y-1">
                          <span className="font-semibold text-slate-900 block text-sm">{booking.customerName}</span>
                          <span className="text-slate-500 block font-mono">{booking.phoneNumber}</span>
                          <span className="text-slate-400 block truncate max-w-[180px]">{booking.emailAddress}</span>
                        </td>

                        {/* Event Details */}
                        <td className="px-5 py-4 space-y-1">
                          <span className="font-semibold text-slate-800 block text-sm">{booking.eventType}</span>
                          <span className="text-slate-500 block flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{new Date(booking.eventDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                          </span>
                          <span className="text-slate-400 block truncate max-w-[180px] flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{booking.location}</span>
                          </span>
                        </td>

                        {/* Budget */}
                        <td className="px-5 py-4 text-slate-700 font-mono font-bold">
                          {booking.budget}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadgeColor(booking.status)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{booking.status}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Update dropdown / select shortcut */}
                            <select
                              value={booking.status}
                              onChange={(e) => handleUpdateStatus(booking.id, e.target.value as any)}
                              className="px-2 py-1 rounded border border-slate-200 bg-white text-[10px] font-bold outline-none text-slate-600 focus:border-blue-600"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Confirmed">Confirmed</option>
                            </select>

                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Delete request"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Expanded Details Side Panel */}
        {selectedBooking && (
          <div className="lg:col-span-5 bg-white border border-slate-200 shadow-md rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-right-3 duration-200 sticky top-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">Request Blueprint</h3>
                <span className="text-[10px] text-slate-400 font-mono block">SUBMITTED ON {new Date(selectedBooking.createdAt).toLocaleString()}</span>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold px-2 py-1 hover:bg-slate-50 rounded"
              >
                Close
              </button>
            </div>

            {selectedBooking.eventCreated && (
              <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl border border-emerald-100 text-xs flex items-start gap-2.5 shadow-xs">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-emerald-900">Active Event Synced</p>
                  <p className="text-[11px] text-emerald-700">A corresponding event has been registered and initialized in the Events Lifecycle manager database.</p>
                </div>
              </div>
            )}

            {/* Customer Details block */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Client Contact</span>
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-150 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-slate-400" />
                  <strong className="text-slate-800 text-sm">{selectedBooking.customerName}</strong>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-mono">{selectedBooking.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{selectedBooking.emailAddress}</span>
                </div>
              </div>
            </div>

            {/* Event Specification */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Event Blueprint Specifications</span>
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-150 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Event Type</span>
                  <strong className="text-slate-800 font-semibold">{selectedBooking.eventType}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Budget Allocation</span>
                  <strong className="text-blue-600 font-mono font-bold">{selectedBooking.budget}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Target Date</span>
                  <strong className="text-slate-800 font-semibold">{new Date(selectedBooking.eventDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Location Venue</span>
                  <strong className="text-slate-800 font-semibold truncate block">{selectedBooking.location}</strong>
                </div>
              </div>
            </div>

            {/* Additional Requirements text block */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Special Requirements / Notes</span>
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-150 text-xs text-slate-600 leading-relaxed min-h-[80px]">
                {selectedBooking.additionalRequirements ? (
                  selectedBooking.additionalRequirements
                ) : (
                  <span className="text-slate-400 italic">No additional requirements submitted.</span>
                )}
              </div>
            </div>

            {/* Status Adjustment Controls */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Operational Status Controller</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedBooking.id, 'Pending')}
                  className={`py-2 rounded-xl text-[10px] font-bold tracking-wider uppercase transition cursor-pointer border ${
                    selectedBooking.status === 'Pending' 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedBooking.id, 'Contacted')}
                  className={`py-2 rounded-xl text-[10px] font-bold tracking-wider uppercase transition cursor-pointer border ${
                    selectedBooking.status === 'Contacted' 
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Contacted
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedBooking.id, 'Confirmed')}
                  className={`py-2 rounded-xl text-[10px] font-bold tracking-wider uppercase transition cursor-pointer border ${
                    selectedBooking.status === 'Confirmed' 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Confirmed
                </button>
              </div>
            </div>

            <button
              onClick={() => handleDeleteBooking(selectedBooking.id)}
              className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Permanently</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
