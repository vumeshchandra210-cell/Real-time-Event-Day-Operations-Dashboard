import React, { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertOctagon, 
  User, 
  ChevronRight, 
  MessageSquare, 
  Plus, 
  ShieldAlert, 
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileText,
  MessageCircle
} from 'lucide-react';
import { Task, Event, UserRole, TaskStatus } from '../types';

interface LiveOpsViewProps {
  activeEvent: Event | null;
  tasks: Task[];
  currentUserRole: UserRole;
  currentUserName: string;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus, percentage: number, notes?: string, issueReport?: string) => Promise<void>;
  onAddTask: (task: { name: string; department: string; priority: 'Low' | 'Medium' | 'High'; owner: string; notes?: string }) => Promise<void>;
}

export default function LiveOpsView({
  activeEvent,
  tasks,
  currentUserRole,
  currentUserName,
  onUpdateTaskStatus,
  onAddTask
}: LiveOpsViewProps) {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [showAddTask, setShowAddTask] = useState<boolean>(false);
  const [newTaskName, setNewTaskName] = useState<string>('');
  const [newTaskDept, setNewTaskDept] = useState<string>('Decoration Team');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [newTaskOwner, setNewTaskOwner] = useState<string>('');
  const [newTaskNotes, setNewTaskNotes] = useState<string>('');

  // Blocker Modal state
  const [blockerTaskId, setBlockerTaskId] = useState<string | null>(null);
  const [blockerReason, setBlockerReason] = useState<string>('');

  // General Status Broadcast Modal states
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [broadcastClientName, setBroadcastClientName] = useState<string>('');
  const [broadcastPhone, setBroadcastPhone] = useState<string>('+919876543210');
  const [broadcastMessage, setBroadcastMessage] = useState<string>('');
  const [broadcastSending, setBroadcastSending] = useState<boolean>(false);
  const [broadcastStatus, setBroadcastStatus] = useState<{ success?: boolean; error?: string; simulated?: boolean } | null>(null);

  const openBroadcastModal = () => {
    if (!activeEvent) return;
    const client = activeEvent.clientName || 'Raj';
    setBroadcastClientName(client);
    setBroadcastPhone('+919876543210');

    // Calculate progress and department statuses
    const totalTasks = tasks.length;
    const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;
    const progress = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

    const getDeptStatusText = (deptKeyword: string) => {
      const deptTasks = tasks.filter(t => t.department.toLowerCase().includes(deptKeyword.toLowerCase()));
      if (deptTasks.length === 0) return 'Not Scheduled';
      const completed = deptTasks.filter(t => t.status === 'Completed').length;
      if (completed === deptTasks.length) return 'Completed';
      const inProgressOrMore = deptTasks.filter(t => t.status === 'In Progress' || t.status === 'Completed').length;
      if (inProgressOrMore > 0) return 'In Progress';
      return 'Pending';
    };

    const decoStatus = getDeptStatusText('decor');
    const soundStatus = getDeptStatusText('sound');
    const cateringStatus = getDeptStatusText('cater');

    let formattedDate = activeEvent.date;
    try {
      const d = new Date(activeEvent.date);
      formattedDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
    } catch (e) {}

    const defaultMsg = `Hello ${client},\n\nYour event "${activeEvent.name}" is scheduled for ${formattedDate}.\n\nCurrent Progress: ${progress}%\nDecoration: ${decoStatus}\nSound Check: ${soundStatus}\nCatering: ${cateringStatus}\n\n- SLV Events`;

    setBroadcastMessage(defaultMsg);
    setBroadcastStatus(null);
    setShowBroadcastModal(true);
  };

  const handleUpdateBroadcastMessage = (newClient: string) => {
    setBroadcastClientName(newClient);
    if (!activeEvent) return;

    const totalTasks = tasks.length;
    const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;
    const progress = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

    const getDeptStatusText = (deptKeyword: string) => {
      const deptTasks = tasks.filter(t => t.department.toLowerCase().includes(deptKeyword.toLowerCase()));
      if (deptTasks.length === 0) return 'Not Scheduled';
      const completed = deptTasks.filter(t => t.status === 'Completed').length;
      if (completed === deptTasks.length) return 'Completed';
      const inProgressOrMore = deptTasks.filter(t => t.status === 'In Progress' || t.status === 'Completed').length;
      if (inProgressOrMore > 0) return 'In Progress';
      return 'Pending';
    };

    const decoStatus = getDeptStatusText('decor');
    const soundStatus = getDeptStatusText('sound');
    const cateringStatus = getDeptStatusText('cater');

    let formattedDate = activeEvent.date;
    try {
      const d = new Date(activeEvent.date);
      formattedDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
    } catch (e) {}

    const defaultMsg = `Hello ${newClient},\n\nYour event "${activeEvent.name}" is scheduled for ${formattedDate}.\n\nCurrent Progress: ${progress}%\nDecoration: ${decoStatus}\nSound Check: ${soundStatus}\nCatering: ${cateringStatus}\n\n- SLV Events`;
    setBroadcastMessage(defaultMsg);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastPhone.trim() || !broadcastMessage.trim()) return;
    setBroadcastSending(true);
    setBroadcastStatus(null);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: broadcastPhone,
          message: broadcastMessage
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBroadcastStatus({ success: true, simulated: !!data.result.simulated });
      } else {
        setBroadcastStatus({ success: false, error: data.error || 'Failed to dispatch broadcast' });
      }
    } catch (err) {
      setBroadcastStatus({ success: false, error: (err as Error).message });
    } finally {
      setBroadcastSending(false);
    }
  };

  // WhatsApp Notification Modal state
  const [whatsAppTask, setWhatsAppTask] = useState<Task | null>(null);
  const [whatsAppPhone, setWhatsAppPhone] = useState<string>('+919876543210');
  const [whatsAppMessage, setWhatsAppMessage] = useState<string>('');
  const [whatsAppSending, setWhatsAppSending] = useState<boolean>(false);
  const [whatsAppStatus, setWhatsAppStatus] = useState<{ success?: boolean; error?: string; simulated?: boolean } | null>(null);

  const openWhatsAppModal = (task: Task) => {
    setWhatsAppTask(task);
    setWhatsAppPhone('+919876543210');
    setWhatsAppMessage(`SLV EVENTS GROUND ALERT 📢\n\nActive Event: ${activeEvent?.name || 'On-ground Event'}\n\nTask: "${task.name}" is now updated to [${task.status}] (${task.completionPercentage}% Complete).\nAssigned Lead: ${task.owner}\n\nTimestamp: ${new Date().toLocaleTimeString()} UTC`);
    setWhatsAppStatus(null);
  };

  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsAppPhone.trim() || !whatsAppMessage.trim()) return;
    setWhatsAppSending(true);
    setWhatsAppStatus(null);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: whatsAppPhone,
          message: whatsAppMessage
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWhatsAppStatus({ success: true, simulated: !!data.result.simulated });
      } else {
        setWhatsAppStatus({ success: false, error: data.error || 'Failed to dispatch alert' });
      }
    } catch (err) {
      setWhatsAppStatus({ success: false, error: (err as Error).message });
    } finally {
      setWhatsAppSending(false);
    }
  };

  // Departments listing
  const departments = [
    'All',
    'Decoration Team',
    'Sound Team',
    'Catering Team',
    'Photography Team',
    'Guest Management Team',
    'Power Backup',
    'Parking'
  ];

  const filteredTasks = selectedDept === 'All' 
    ? tasks 
    : tasks.filter(t => t.department === selectedDept);

  // Group tasks by department to calculate overall progress ratios
  const deptProgressMap = React.useMemo(() => {
    const map: Record<string, { total: number; completed: number; blocked: number; pct: number }> = {};
    
    // Initialize
    departments.forEach(d => {
      if (d !== 'All') map[d] = { total: 0, completed: 0, blocked: 0, pct: 0 };
    });

    tasks.forEach(t => {
      if (map[t.department]) {
        map[t.department].total += 1;
        if (t.status === 'Completed') {
          map[t.department].completed += 1;
        } else if (t.status === 'Blocked') {
          map[t.department].blocked += 1;
        }
      }
    });

    // Calc percentage
    Object.keys(map).forEach(key => {
      const d = map[key];
      d.pct = d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0;
    });

    return map;
  }, [tasks]);

  const handleToggleComplete = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
    const pct = nextStatus === 'Completed' ? 100 : 50;
    await onUpdateTaskStatus(task.id, nextStatus, pct, task.notes);
  };

  const handleEscalateBlocker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockerTaskId || !blockerReason.trim()) return;
    
    await onUpdateTaskStatus(blockerTaskId, 'Blocked', 20, undefined, blockerReason);
    setBlockerTaskId(null);
    setBlockerReason('');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim() || !newTaskOwner.trim()) return;

    await onAddTask({
      name: newTaskName,
      department: newTaskDept,
      priority: newTaskPriority,
      owner: newTaskOwner,
      notes: newTaskNotes
    });

    setNewTaskName('');
    setNewTaskOwner('');
    setNewTaskNotes('');
    setShowAddTask(false);
  };

  if (!activeEvent) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200">
        <Clock className="w-12 h-12 text-slate-300 animate-pulse mb-4" />
        <h3 className="text-lg font-bold text-slate-800">No Selected Event</h3>
        <p className="text-slate-500 text-sm max-w-sm mt-1">Please choose an active event from the top-bar controller to access on-ground checklist task controls.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="live_ops_view">
      {/* Department Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {Object.keys(deptProgressMap).slice(0, 7).map((deptName) => {
          const progress = deptProgressMap[deptName];
          return (
            <button
              key={deptName}
              onClick={() => setSelectedDept(deptName)}
              className={`p-4 rounded-xl border text-left transition duration-200 cursor-pointer ${
                selectedDept === deptName 
                  ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="block text-[10px] font-bold uppercase tracking-wider opacity-60 truncate">{deptName.replace(' Team', '')}</span>
              <span className="block text-2xl font-display font-bold mt-1">{progress.pct}%</span>
              <div className="flex justify-between items-center text-[10px] opacity-75 mt-2">
                <span>{progress.completed}/{progress.total} tasks</span>
                {progress.blocked > 0 && <span className="text-red-500 font-bold">● {progress.blocked} Block</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Control Actions & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Horizontal filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                selectedDept === dept
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/10'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {dept === 'All' ? 'All Departments' : dept}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {currentUserRole !== 'Staff' && (
            <button
              onClick={() => setShowAddTask(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task Blueprint</span>
            </button>
          )}
          <button
            onClick={openBroadcastModal}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition cursor-pointer shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Broadcast Status Summary</span>
          </button>
        </div>
      </div>

      {/* Task List Workspace */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-display font-bold text-slate-800 text-sm">Active Checklists ({filteredTasks.length} items)</h3>
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">Role: {currentUserRole}</span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <CheckCircle className="w-12 h-12 text-slate-200 mx-auto" />
            <p className="font-bold text-slate-800 text-sm">All Clear!</p>
            <p className="text-xs">No pending tasks found for this department filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => {
              const isBlocked = task.status === 'Blocked';
              const isCompleted = task.status === 'Completed';
              return (
                <div key={task.id} className={`p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${isBlocked ? 'bg-red-50/30' : isCompleted ? 'bg-emerald-50/10' : 'hover:bg-slate-50/50'}`}>
                  {/* Task meta */}
                  <div className="flex items-start gap-4 flex-1">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center transition shrink-0 cursor-pointer ${
                        isCompleted 
                          ? 'bg-success border-success text-white' 
                          : 'border-slate-300 hover:border-blue-600'
                      }`}
                    >
                      {isCompleted && <CheckCircle className="w-4 h-4" />}
                    </button>
                    
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`font-semibold text-sm ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{task.name}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{task.department.replace(' Team', '')}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          task.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-500'
                        }`}>{task.priority} Priority</span>
                      </div>
                      
                      {/* Sub notes or blocked alerts */}
                      {task.notes && <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{task.notes}</p>}
                      
                      {isBlocked && (
                        <div className="flex items-start gap-1.5 p-2 rounded-lg bg-red-50 border border-red-100 max-w-xl">
                          <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-red-700 leading-normal"><span className="font-bold">BLOCKER REPORTED:</span> {task.issueReport}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono pt-1">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> Owner: {task.owner}</span>
                        <span>Updated: {new Date(task.updatedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progressive sliders & actions */}
                  <div className="flex items-center gap-4 shrink-0 justify-end self-end sm:self-auto">
                    {!isCompleted && !isBlocked && (
                      currentUserRole === 'Staff' ? (
                        <span className="text-[11px] font-bold font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          Progress: {task.completionPercentage}%
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            value={task.completionPercentage}
                            onChange={(e) => onUpdateTaskStatus(task.id, 'In Progress', Number(e.target.value), task.notes)}
                            className="w-20 accent-blue-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-[10px] font-bold font-mono text-slate-500 w-8">{task.completionPercentage}%</span>
                        </div>
                      )
                    )}

                    <div className="flex gap-2">
                      {/* WhatsApp Quick Dispatch Trigger */}
                      <button
                        onClick={() => openWhatsAppModal(task)}
                        title="Broadcast via WhatsApp"
                        className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition cursor-pointer flex items-center justify-center shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      {isBlocked ? (
                        <span className="px-2.5 py-1 rounded-lg bg-red-500 text-white font-bold text-[10px] tracking-wide uppercase shadow-sm">Blocked</span>
                      ) : isCompleted ? (
                        <>
                          {currentUserRole === 'Staff' && (
                            <button
                              onClick={() => onUpdateTaskStatus(task.id, 'In Progress', 50, task.notes)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-[10px] tracking-wide uppercase transition cursor-pointer"
                            >
                              Re-open
                            </button>
                          )}
                          <span className="px-2.5 py-1 rounded-lg bg-success/10 text-success border border-success/20 font-bold text-[10px] tracking-wide uppercase">Completed</span>
                        </>
                      ) : (
                        <>
                          {currentUserRole !== 'Staff' && (
                            <button
                              onClick={() => setBlockerTaskId(task.id)}
                              className="px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 text-red-600 font-bold text-[10px] tracking-wide uppercase hover:bg-red-100 transition cursor-pointer"
                            >
                              Block
                            </button>
                          )}
                          <button
                            onClick={() => onUpdateTaskStatus(task.id, 'Completed', 100, task.notes)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] tracking-wide uppercase hover:bg-emerald-500 transition cursor-pointer shadow-sm"
                          >
                            Done
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Escalate Blocker Modal */}
      {blockerTaskId && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-600 pb-3 border-b border-slate-100 mb-4">
              <AlertOctagon className="w-6 h-6 shrink-0" />
              <h4 className="font-display font-bold text-lg text-slate-900">Escalate Operational Blocker</h4>
            </div>
            <form onSubmit={handleEscalateBlocker} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Blocked Task Name</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-medium text-sm text-slate-700">
                  {tasks.find(t => t.id === blockerTaskId)?.name}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Incident Blocker Description</label>
                <textarea
                  rows={4}
                  required
                  value={blockerReason}
                  onChange={(e) => setBlockerReason(e.target.value)}
                  placeholder="Describe what is causing the blocker. E.g., Weather delay, missing sub-vendor parts, rigging server offline."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setBlockerTaskId(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
                >
                  Broadcast Blocker Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Blueprint Drawer/Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h4 className="font-display font-bold text-lg text-slate-900">Add Task Blueprint</h4>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Task Name</label>
                <input
                  type="text"
                  required
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="E.g., Rigging mic lines, floral canopy backdrop"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Department Vertical</label>
                  <select
                    value={newTaskDept}
                    onChange={(e) => setNewTaskDept(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  >
                    {departments.filter(d => d !== 'All').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Task Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Responsible Lead</label>
                <input
                  type="text"
                  required
                  value={newTaskOwner}
                  onChange={(e) => setNewTaskOwner(e.target.value)}
                  placeholder="E.g., Vikram Singh, Chef Anand"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Special Directives / Notes</label>
                <textarea
                  rows={3}
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  placeholder="E.g., Import delayed. Work at double tempo once material reaches site."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* WhatsApp Broadcast Modal */}
      {whatsAppTask && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-emerald-600 pb-3 border-b border-slate-100 mb-4">
              <MessageCircle className="w-6 h-6 shrink-0" />
              <h4 className="font-display font-bold text-lg text-slate-900">Send WhatsApp Notification</h4>
            </div>

            <form onSubmit={handleSendWhatsApp} className="space-y-4">
              {whatsAppStatus && (
                <div className={`p-3 rounded-xl text-xs ${
                  whatsAppStatus.success 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {whatsAppStatus.success ? (
                    <div>
                      <span className="font-bold block">✓ Message Sent!</span>
                      <span>{whatsAppStatus.simulated ? 'Simulated ground alert logged successfully.' : 'Dispatched live message via Twilio Gateway.'}</span>
                    </div>
                  ) : (
                    <span><strong>Error:</strong> {whatsAppStatus.error}</span>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Recipient Phone (with country code)</label>
                <input
                  type="text"
                  required
                  value={whatsAppPhone}
                  onChange={(e) => setWhatsAppPhone(e.target.value)}
                  placeholder="E.g., +919876543210"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none font-mono"
                />
                <span className="text-[10px] text-slate-400 block">Include country code with "+" sign.</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Notification Content</label>
                <textarea
                  rows={5}
                  required
                  value={whatsAppMessage}
                  onChange={(e) => setWhatsAppMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 outline-none leading-relaxed font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Live WhatsApp Preview</label>
                <div className="p-4 rounded-2xl bg-[#efeae2] border border-slate-200/60 relative overflow-hidden flex flex-col">
                  <div className="absolute inset-0 bg-[radial-gradient(#d5ebda_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
                  <div className="bg-white text-slate-800 text-xs px-3 py-2.5 rounded-xl rounded-tl-none shadow-sm relative max-w-[85%] self-start border border-slate-100 leading-relaxed font-sans whitespace-pre-wrap">
                    {whatsAppMessage}
                    <span className="text-[9px] text-slate-400 font-mono block text-right mt-1.5">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setWhatsAppTask(null);
                    setWhatsAppStatus(null);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Dismiss
                </button>
                <div className="flex gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?phone=${encodeURIComponent(whatsAppPhone.replace(/\D/g, ''))}&text=${encodeURIComponent(whatsAppMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer flex items-center justify-center text-center"
                  >
                    <span>Send via App/Web</span>
                  </a>
                  <button
                    type="submit"
                    disabled={whatsAppSending}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                  >
                    {whatsAppSending ? 'Sending...' : 'Use Server API'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* General Broadcast Status Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-emerald-600 pb-3 border-b border-slate-100 mb-4">
              <MessageCircle className="w-6 h-6 shrink-0" />
              <h4 className="font-display font-bold text-lg text-slate-900">Broadcast Event Summary</h4>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              {broadcastStatus && (
                <div className={`p-3 rounded-xl text-xs ${
                  broadcastStatus.success 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {broadcastStatus.success ? (
                    <div>
                      <span className="font-bold block">✓ Broadcast Sent!</span>
                      <span>{broadcastStatus.simulated ? 'Simulated client alert logged successfully.' : 'Dispatched live message via Twilio Gateway.'}</span>
                    </div>
                  ) : (
                    <span><strong>Error:</strong> {broadcastStatus.error}</span>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Client Name</label>
                  <input
                    type="text"
                    required
                    value={broadcastClientName}
                    onChange={(e) => handleUpdateBroadcastMessage(e.target.value)}
                    placeholder="E.g., Raj"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Recipient Phone</label>
                  <input
                    type="text"
                    required
                    value={broadcastPhone}
                    onChange={(e) => setBroadcastPhone(e.target.value)}
                    placeholder="E.g., +919876543210"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase font-mono">Notification Content</label>
                <textarea
                  rows={5}
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 outline-none leading-relaxed font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Live WhatsApp Preview</label>
                <div className="p-4 rounded-2xl bg-[#efeae2] border border-slate-200/60 relative overflow-hidden flex flex-col">
                  <div className="absolute inset-0 bg-[radial-gradient(#d5ebda_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
                  <div className="bg-white text-slate-800 text-xs px-3 py-2.5 rounded-xl rounded-tl-none shadow-sm relative max-w-[85%] self-start border border-slate-100 leading-relaxed font-sans whitespace-pre-wrap">
                    {broadcastMessage}
                    <span className="text-[9px] text-slate-400 font-mono block text-right mt-1.5">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowBroadcastModal(false);
                    setBroadcastStatus(null);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Dismiss
                </button>
                <div className="flex gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?phone=${encodeURIComponent(broadcastPhone.replace(/\D/g, ''))}&text=${encodeURIComponent(broadcastMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer flex items-center justify-center text-center font-sans"
                  >
                    <span>Send via App/Web</span>
                  </a>
                  <button
                    type="submit"
                    disabled={broadcastSending}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                  >
                    {broadcastSending ? 'Sending...' : 'Use Server API'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
