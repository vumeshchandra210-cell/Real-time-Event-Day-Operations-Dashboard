import React, { useState } from 'react';
import { Search, Plus, Calendar, MapPin, Users, DollarSign, Edit3, Trash2, FolderOpen, Sparkles } from 'lucide-react';
import { Event, EventStatus } from '../types';

interface EventManagementViewProps {
  events: Event[];
  onSelectEvent: (eventId: string) => void;
  onAddEvent: (event: Omit<Event, 'id' | 'expenses'>) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
}

export default function EventManagementView({
  events,
  onSelectEvent,
  onAddEvent,
  onDeleteEvent
}: EventManagementViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Form State
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [type, setType] = useState<'Wedding' | 'Corporate' | 'Birthday' | 'Cultural' | 'Exhibition' | 'Conference'>('Wedding');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [guestCount, setGuestCount] = useState<number>(100);
  const [budget, setBudget] = useState<number>(500000);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const statuses = ['All', 'Upcoming', 'In Progress', 'Completed', 'Cancelled'];

  const filteredEvents = events.filter(ev => {
    const matchesSearch = ev.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ev.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ev.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || ev.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !clientName.trim() || !date || !venue.trim()) return;

    await onAddEvent({
      name,
      clientName,
      type,
      date,
      venue,
      guestCount,
      budget,
      description,
      notes,
      status: 'Upcoming'
    });

    setName('');
    setClientName('');
    setDate('');
    setVenue('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6" id="event_management_view">
      {/* Search and onboarding controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search event name, client, venue..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
          />
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Onboard New Event</span>
        </button>
      </div>

      {/* Horizontal Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
        {statuses.map(st => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedStatus === st
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Grid of Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map((ev) => {
          const isUpcoming = ev.status === 'Upcoming';
          const isInProgress = ev.status === 'In Progress';
          const isCompleted = ev.status === 'Completed';

          return (
            <div key={ev.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:shadow-md transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold font-mono text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase">
                      {ev.type}
                    </span>
                    <h3 className="font-bold text-slate-850 text-base">{ev.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">Client: {ev.clientName}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                    isInProgress ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/15' :
                    isCompleted ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    isUpcoming ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                    'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {ev.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed max-w-md line-clamp-2">{ev.description}</p>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ev.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 truncate" />
                    <span className="truncate">{ev.venue.split(',')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ev.guestCount} Guests</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span>INR {(ev.budget / 100000).toFixed(1)} Lakhs</span>
                  </div>
                </div>
              </div>

              {/* Action operations footer */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-4 shrink-0">
                <button
                  onClick={() => onDeleteEvent(ev.id)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                  title="Archive/Delete Event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onSelectEvent(ev.id)}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer shadow-sm"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Open Console</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Onboard Event Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h4 className="font-display font-bold text-lg text-slate-900">Onboard New Event Day</h4>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Event Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g., The Kapoor Royal Wedding"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Client Name</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="E.g., Sanjay Kapoor"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Event Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Corporate">Corporate Summit</option>
                    <option value="Birthday">Birthday Party</option>
                    <option value="Cultural">Cultural Program</option>
                    <option value="Exhibition">Exhibition</option>
                    <option value="Conference">Conference</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Guest count</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Budget Plan (INR)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Execution Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Venue Address</label>
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="E.g., Palace Grounds, Bangalore"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Short Description</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., A luxury wedding featuring premium floral stage decors and drone cinematography..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
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
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
