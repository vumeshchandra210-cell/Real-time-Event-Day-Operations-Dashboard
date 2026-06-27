import React, { useState } from 'react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Calendar, User, Phone, Mail, MapPin, DollarSign, FileText, CheckCircle2, Loader2 } from 'lucide-react';

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

export default function BookingForm() {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [eventType, setEventType] = useState('Wedding');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventTypes = [
    'Wedding',
    'Corporate Summit',
    'Birthday Party',
    'Concert/Live Show',
    'Sangeet / Mehendi',
    'Anniversary',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (!customerName.trim()) {
      setError('Customer name is required.');
      setLoading(false);
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Phone number is required.');
      setLoading(false);
      return;
    }
    if (!emailAddress.trim() || !emailAddress.includes('@')) {
      setError('A valid email address is required.');
      setLoading(false);
      return;
    }
    if (!eventDate) {
      setError('Event date is required.');
      setLoading(false);
      return;
    }
    if (!location.trim()) {
      setError('Location is required.');
      setLoading(false);
      return;
    }
    if (!budget.trim()) {
      setError('Budget estimate is required.');
      setLoading(false);
      return;
    }

    try {
      // Save submission securely in Firebase Firestore
      await addDoc(collection(db, 'booking_requests'), {
        customerName: customerName.trim(),
        phoneNumber: phoneNumber.trim(),
        emailAddress: emailAddress.trim(),
        eventType,
        eventDate,
        location: location.trim(),
        budget: budget.trim(),
        additionalRequirements: additionalRequirements.trim(),
        status: 'Pending',
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
      // Reset form
      setCustomerName('');
      setPhoneNumber('');
      setEmailAddress('');
      setEventType('Wedding');
      setEventDate('');
      setLocation('');
      setBudget('');
      setAdditionalRequirements('');
    } catch (err: any) {
      console.error('Error saving booking request:', err);
      setError('Failed to submit booking request. Please check your network and try again.');
      handleFirestoreError(err, OperationType.CREATE, 'booking_requests');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-xl text-center max-w-xl mx-auto space-y-6"
        id="booking_form_success"
      >
        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="font-display font-bold text-2xl text-slate-900">Request Submitted Successfully!</h3>
          <p className="text-slate-600 text-sm">
            Thank you for choosing <strong>SLV Events</strong>. Our lead coordination team will review your requirements and reach out to you within 24 hours.
          </p>
        </div>
        <button
          onClick={() => setSuccess(false)}
          className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-blue-600 transition text-xs shadow-md"
        >
          Submit Another Request
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-xl max-w-2xl mx-auto"
      id="booking_form"
    >
      <div className="mb-6 text-center space-y-2">
        <h3 className="font-display font-bold text-2xl text-slate-900">Book Your Event</h3>
        <p className="text-slate-500 text-xs">Fill out the operational blueprint request below. Our coordinators will contact you.</p>
      </div>

      {error && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Customer Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Customer Name *</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              placeholder="e.g., Yuvaraj Gundu"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Phone Number *</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              placeholder="e.g., +91 98765 43210"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email Address *</span>
            </label>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              required
              placeholder="e.g., yuvaraj@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          {/* Event Type */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Event Type *</span>
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm outline-none focus:border-blue-600 focus:bg-white transition"
            >
              {eventTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Event Date */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Event Date *</span>
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Location *</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="e.g., Palace Grounds, Bangalore"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            <span>Budget Estimate *</span>
          </label>
          <input
            type="text"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
            placeholder="e.g., INR 5,00,000"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm outline-none focus:border-blue-600 focus:bg-white transition"
          />
        </div>

        {/* Additional Requirements */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Additional Requirements / Notes</span>
          </label>
          <textarea
            value={additionalRequirements}
            onChange={(e) => setAdditionalRequirements(e.target.value)}
            placeholder="Tell us about decor preferences, guest count, power or catering details..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm outline-none focus:border-blue-600 focus:bg-white transition resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/10 hover:shadow-blue-600/25 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Blueprint Request...</span>
            </>
          ) : (
            <span>Submit Booking Blueprint Request</span>
          )}
        </button>
      </form>
    </motion.div>
  );
}
