import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Box, 
  DollarSign, 
  Activity,
  Plus,
  ArrowRight,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { Event, Task, InventoryItem, StaffMember, ActivityLog } from '../types';

interface DashboardViewProps {
  activeEvent: Event | null;
  tasks: Task[];
  inventory: InventoryItem[];
  staff: StaffMember[];
  activityLogs: ActivityLog[];
  onNavigate: (view: string) => void;
  onAddQuickLog: (type: 'task' | 'finance' | 'issue', payload: any) => Promise<void>;
}

export default function DashboardView({
  activeEvent,
  tasks,
  inventory,
  staff,
  activityLogs,
  onNavigate,
  onAddQuickLog
}: DashboardViewProps) {

  // Today's Hourly Timeline (Static mock timeline for Today's Event display)
  const timelineEvents = [
    { time: '09:00 AM', label: 'Crew Entry & Equipment Unloading', status: 'completed' },
    { time: '10:15 AM', label: '150KVA DG Backup Synchronization Testing', status: 'completed' },
    { time: '11:30 AM', label: 'Carpet Laying & Main Entry Carpentry Done', status: 'completed' },
    { time: '01:00 PM', label: 'Floral Canopy Stage Centerpiece Placements', status: 'active' },
    { time: '03:00 PM', label: 'Sound Rigging & Cordless Microphone Calibration', status: 'pending' },
    { time: '04:30 PM', label: 'Buffet Stations Layout & Chafing Dish Polish', status: 'pending' },
    { time: '06:00 PM', label: 'Guest Registrations & Valet Parking Active', status: 'pending' },
    { time: '07:30 PM', label: 'Event Commences - VIP Reception Gate Open', status: 'pending' }
  ];

  if (!activeEvent) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200">
        <Clock className="w-12 h-12 text-slate-300 animate-pulse mb-4" />
        <h3 className="text-lg font-bold text-slate-800">No Selected Event</h3>
        <p className="text-slate-500 text-sm max-w-sm mt-1">Please select an event from the header menu to load your real-time day operations control room.</p>
      </div>
    );
  }

  // Statistics Computations
  const totalTasksCount = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const delayedTasks = tasks.filter(t => t.status === 'Delayed');
  const blockedTasks = tasks.filter(t => t.status === 'Blocked');
  const openIssues = tasks.filter(t => t.status === 'Blocked');
  
  const completionPercentage = totalTasksCount > 0 
    ? Math.round((completedTasks.length / totalTasksCount) * 100) 
    : 0;

  const staffPresent = staff.filter(s => s.attendanceStatus === 'Present' || s.attendanceStatus === 'Late').length;
  const activeBlockers = blockedTasks.length;

  // Recharts: Department Performance Data
  const deptPerformanceData = React.useMemo(() => {
    const map: Record<string, { total: number; completed: number }> = {};
    tasks.forEach(t => {
      const dept = t.department.replace(' Team', '');
      if (!map[dept]) map[dept] = { total: 0, completed: 0 };
      map[dept].total += 1;
      if (t.status === 'Completed') map[dept].completed += 1;
    });

    return Object.keys(map).map(dept => ({
      name: dept,
      Completion: Math.round((map[dept].completed / map[dept].total) * 100),
      Tasks: map[dept].total
    }));
  }, [tasks]);

  // Recharts: Task Completion Distribution
  const statusDistributionData = React.useMemo(() => {
    const statuses = ['Pending', 'In Progress', 'Completed', 'Delayed', 'Blocked'];
    const counts = statuses.map(status => ({
      name: status,
      value: tasks.filter(t => t.status === status).length
    })).filter(item => item.value > 0);
    return counts;
  }, [tasks]);

  const COLORS = {
    Completed: '#10B981',
    'In Progress': '#2563EB',
    Pending: '#94A3B8',
    Delayed: '#F59E0B',
    Blocked: '#EF4444'
  };

  // Recharts: Finance Area Data
  const financialLedgerData = [
    { name: '06-10', Income: 2500000, Expense: 400000 },
    { name: '06-12', Income: 2500000, Expense: 550000 },
    { name: '06-16', Income: 2500000, Expense: 1550000 },
    { name: '06-18', Income: 2500000, Expense: 2050000 },
    { name: '06-22', Income: 4000000, Expense: 2050000 },
    { name: '06-24', Income: 4000000, Expense: 2130000 }
  ];

  return (
    <div className="space-y-6" id="dashboard_view">
      {/* Top Statistics Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI: Progress */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Operations Completion</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-slate-900">{completionPercentage}%</span>
            <span className="text-xs font-semibold text-emerald-600">On Track</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${completionPercentage}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{completedTasks.length} of {totalTasksCount} milestones finalized</span>
        </div>

        {/* KPI: Staff */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Crew on Ground</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-slate-900">{staffPresent}</span>
            <span className="text-xs font-semibold text-emerald-600">Present</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.round((staffPresent / (staff.length || 1)) * 100)}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{staff.length - staffPresent} staff leads on leave/shift rotation</span>
        </div>

        {/* KPI: Financials */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Financial Milestones</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-slate-900">INR 40.0 L</span>
            <span className="text-xs font-semibold text-slate-400">Received</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.round((activeEvent.expenses / activeEvent.budget) * 100)}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Spent: {(activeEvent.expenses / 100000).toFixed(1)}L / Budget: {(activeEvent.budget / 100000).toFixed(1)}L</span>
        </div>

        {/* KPI: Active Blocker alerts */}
        <div className={`p-6 rounded-2xl border shadow-sm space-y-3 transition ${activeBlockers > 0 ? 'bg-red-50/50 border-red-200' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Active Incidents</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeBlockers > 0 ? 'bg-red-100' : 'bg-slate-50'}`}>
              <AlertTriangle className={`w-4 h-4 ${activeBlockers > 0 ? 'text-red-600 animate-bounce' : 'text-slate-400'}`} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-display font-bold ${activeBlockers > 0 ? 'text-red-600' : 'text-slate-900'}`}>{activeBlockers}</span>
            <span className={`text-xs font-semibold ${activeBlockers > 0 ? 'text-red-600' : 'text-slate-400'}`}>{activeBlockers > 0 ? 'Escalated' : 'None Reported'}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full ${activeBlockers > 0 ? 'bg-red-500' : 'bg-slate-300'}`} style={{ width: activeBlockers > 0 ? '100%' : '0%' }} />
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{activeBlockers > 0 ? 'Requires immediate supervisor feedback' : 'Ground activities running smoothly'}</span>
        </div>
      </div>

      {/* Main Charts Workspace Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Department Progress (BarChart) */}
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-slate-800 text-sm">Department Operations Progress (%)</h4>
            <span className="text-[10px] font-mono text-slate-400">Checked hourly</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} unit="%" />
                <Tooltip cursor={{ fill: 'rgba(241,245,249,0.5)' }} />
                <Bar dataKey="Completion" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Distribution (PieChart) */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="font-display font-bold text-slate-800 text-sm">Task Status Distribution</h4>
          <div className="h-48 flex items-center justify-center">
            {statusDistributionData.length === 0 ? (
              <span className="text-xs text-slate-400">No data available</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#E2E8F0'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono font-semibold">
            {statusDistributionData.map(entry => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[entry.name as keyof typeof COLORS] }} />
                <span className="text-slate-500">{entry.name}:</span>
                <span className="text-slate-800">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Timelines, Ledger & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Today's Hourly Timeline Schedule */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h4 className="font-display font-bold text-slate-800 text-sm">Event-Day Timeline</h4>
          </div>
          <div className="space-y-4 overflow-y-auto max-h-[320px] pr-2">
            {timelineEvents.map((tle, i) => (
              <div key={i} className="flex gap-3 items-start relative">
                {i !== timelineEvents.length - 1 && (
                  <div className="absolute left-2.5 top-6 bottom-[-20px] w-0.5 bg-slate-100" />
                )}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                  tle.status === 'completed' ? 'border-success bg-emerald-50 text-success' : tle.status === 'active' ? 'border-blue-600 bg-blue-50 text-blue-600 animate-pulse' : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${tle.status === 'completed' ? 'bg-success' : tle.status === 'active' ? 'bg-blue-600' : 'bg-slate-300'}`} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold font-mono text-slate-400 block">{tle.time}</span>
                  <p className={`text-xs font-semibold leading-relaxed ${tle.status === 'completed' ? 'text-slate-500 line-through' : tle.status === 'active' ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>{tle.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Live Financial Milestone Ledger (AreaChart) */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h4 className="font-display font-bold text-slate-800 text-sm">Ledger Trajectory</h4>
            </div>
            <button onClick={() => onNavigate('finance')} className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-0.5">Details <ArrowRight className="w-3 h-3" /></button>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialLedgerData}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Income" stroke="#10B981" fillOpacity={1} fill="url(#colorInc)" strokeWidth={2} />
                <Area type="monotone" dataKey="Expense" stroke="#EF4444" fillOpacity={1} fill="url(#colorExp)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-500 text-center font-mono">Gross Income vs Vendor Pay-out trajectory over time (INR)</p>
        </div>

        {/* Column 3: Live Ground Activity Logs */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Activity className="w-4 h-4 text-blue-600" />
            <h4 className="font-display font-bold text-slate-800 text-sm">Real-time Ground Log</h4>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[320px] pr-2">
            {activityLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono font-bold text-slate-400">
                  <span>{log.user} ({log.role})</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1 rounded uppercase font-mono mt-0.5 shrink-0">{log.action}</span>
                  <p className="text-[11px] text-slate-700 font-medium leading-relaxed">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
