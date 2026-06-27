import React, { useState } from 'react';
import { Users, Plus, Search, Check, X, AlertCircle, Phone, Award } from 'lucide-react';
import { StaffMember, AttendanceStatus } from '../types';

interface StaffViewProps {
  staff: StaffMember[];
  onAddStaff: (member: Omit<StaffMember, 'id'>) => Promise<void>;
  onUpdateStaff: (id: string, updates: Partial<StaffMember>) => Promise<void>;
}

export default function StaffView({ staff, onAddStaff, onUpdateStaff }: StaffViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Decoration Team');
  const [shift, setShift] = useState<'Day' | 'Night' | 'Full'>('Day');
  const [phone, setPhone] = useState('');

  const departments = [
    'All',
    'Decoration Team',
    'Sound Team',
    'Catering Team',
    'Photography Team',
    'Guest Management Team',
    'Power Backup',
    'Lighting'
  ];

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || member.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !role.trim() || !phone.trim()) return;

    await onAddStaff({
      name,
      email,
      role,
      department,
      shift,
      attendanceStatus: 'Present',
      performanceRating: 5.0,
      availability: true,
      phone
    });

    setName('');
    setEmail('');
    setRole('');
    setPhone('');
    setShowAddForm(false);
  };

  const handleUpdateAttendance = async (staffId: string, nextStatus: AttendanceStatus) => {
    const isAvailable = nextStatus === 'Present' || nextStatus === 'Late';
    await onUpdateStaff(staffId, { attendanceStatus: nextStatus, availability: isAvailable });
  };

  return (
    <div className="space-y-6" id="staff_view">
      {/* Search and control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search staff leads, roles..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
          />
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Lead</span>
        </button>
      </div>

      {/* Departments Horizontal filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
        {departments.map(dept => (
          <button
            key={dept}
            onClick={() => setSelectedDept(dept)}
            className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedDept === dept
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {dept === 'All' ? 'All Departments' : dept}
          </button>
        ))}
      </div>

      {/* Staff lists card table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                <th className="px-6 py-4">Lead Name & Role</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Shift Details</th>
                <th className="px-6 py-4">Live Attendance Status</th>
                <th className="px-6 py-4">Roster Ratings</th>
                <th className="px-6 py-4 text-right">Direct Dial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredStaff.map((member) => {
                const isPresent = member.attendanceStatus === 'Present';
                const isLate = member.attendanceStatus === 'Late';
                const isAbsent = member.attendanceStatus === 'Absent';
                const isOnLeave = member.attendanceStatus === 'On Leave';

                return (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200 text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 block leading-none">{member.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono block">{member.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                        {member.department.replace(' Team', '')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-xs">{member.shift} Shift</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* Custom Select Attendance */}
                        <select
                          value={member.attendanceStatus}
                          onChange={(e) => handleUpdateAttendance(member.id, e.target.value as AttendanceStatus)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border outline-none ${
                            isPresent ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            isLate ? 'bg-amber-50 text-amber-600 border-amber-200' :
                            isAbsent ? 'bg-red-50 text-red-600 border-red-200' :
                            'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          <option value="Present">Present</option>
                          <option value="Late">Late</option>
                          <option value="Absent">Absent</option>
                          <option value="On Leave">On Leave</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="font-bold font-mono text-xs">{member.performanceRating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs">
                      <a href={`tel:${member.phone}`} className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{member.phone}</span>
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add staff modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h4 className="font-display font-bold text-lg text-slate-900">Add Staff Lead</h4>
            </div>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Lead Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., Vikram Singh, Sneha Rao"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Operations Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E.g., vikram@slvevents.com"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Roster Role / Designation</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="E.g., Acoustic Specialist"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Shift Period</label>
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                  >
                    <option value="Day">Day</option>
                    <option value="Night">Night</option>
                    <option value="Full">Full Day</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"
                  >
                    {departments.filter(d => d !== 'All').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Mobile Contact</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="E.g., +91 98860 12345"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
                  />
                </div>
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
                  Add Staff Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
