import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import LiveOpsView from './components/LiveOpsView';
import EventManagementView from './components/EventManagementView';
import AiAssistantView from './components/AiAssistantView';
import InventoryView from './components/InventoryView';
import StaffView from './components/StaffView';
import VendorsView from './components/VendorsView';
import FinanceView from './components/FinanceView';
import BookingsView from './components/BookingsView';

import { 
  Event, 
  Task, 
  InventoryItem, 
  StaffMember, 
  Vendor, 
  FinanceTransaction, 
  ActivityLog, 
  Notification, 
  UserRole,
  TaskStatus,
  InventoryStatus,
  AttendanceStatus
} from './types';

import { 
  Lock, 
  Sparkles, 
  ArrowRight, 
  Mail, 
  ShieldCheck, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export default function App() {
  // Navigation & Auth Flow
  const [isLandingPage, setIsLandingPage] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Login & Registration state variables
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [registerName, setRegisterName] = useState<string>('');
  const [registerEmail, setRegisterEmail] = useState<string>('');
  const [registerPassword, setRegisterPassword] = useState<string>('');
  const [registerRole, setRegisterRole] = useState<UserRole>('Staff');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState<boolean>(false);

  // Verification state variables
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  const [verifyEmail, setVerifyEmail] = useState<string>('');
  const [verificationCodeInput, setVerificationCodeInput] = useState<string>('');
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<{ success?: boolean; error?: string; loading?: boolean } | null>(null);

  // User profile
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Staff');

  // Application Data States
  const [events, setEvents] = useState<Event[]>([]);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [financeTransactions, setFinanceTransactions] = useState<FinanceTransaction[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Strict Role guard: redirect if active tab is not allowed for the role
  useEffect(() => {
    if (currentUserRole === 'Admin') return;
    
    if (currentUserRole === 'Operations Lead') {
      const allowed = ['dashboard', 'liveops', 'events', 'ai_assistant'];
      if (!allowed.includes(activeTab)) setActiveTab('dashboard');
    } else if (currentUserRole === 'Vendor Coordinator') {
      const allowed = ['vendors', 'liveops'];
      if (!allowed.includes(activeTab)) setActiveTab('liveops');
    } else if (currentUserRole === 'Finance Team') {
      const allowed = ['finance', 'dashboard'];
      if (!allowed.includes(activeTab)) setActiveTab('finance');
    } else if (currentUserRole === 'Team Lead' || currentUserRole === 'Staff') {
      if (activeTab !== 'liveops') setActiveTab('liveops');
    } else if (currentUserRole === 'Client') {
      if (activeTab !== 'dashboard') setActiveTab('dashboard');
    }
  }, [currentUserRole, activeTab]);

  // Fetch initial dataset from Express API
  const fetchData = async () => {
    try {
      // 1. Fetch Events
      const evRes = await fetch('/api/events');
      const evData = await evRes.json();
      setEvents(evData);
      
      // Auto select the first event if none is active
      if (evData.length > 0 && !activeEvent) {
        setActiveEvent(evData[0]);
        await fetchEventDependentData(evData[0].id);
      }
    } catch (err) {
      console.error('Error fetching baseline operational states', err);
    }
  };

  const fetchEventDependentData = async (eventId: string) => {
    try {
      const [tasksRes, invRes, staffRes, venRes, finRes, logsRes, notifRes] = await Promise.all([
        fetch(`/api/tasks?eventId=${eventId}`),
        fetch('/api/inventory'),
        fetch('/api/staff'),
        fetch('/api/vendors'),
        fetch(`/api/finance/transactions?eventId=${eventId}`),
        fetch(`/api/activity-logs?eventId=${eventId}`),
        fetch('/api/notifications')
      ]);

      setTasks(await tasksRes.json());
      setInventory(await invRes.json());
      setStaff(await staffRes.json());
      setVendors(await venRes.json());
      setFinanceTransactions(await finRes.json());
      setActivityLogs(await logsRes.json());
      setNotifications(await notifRes.json());
    } catch (err) {
      console.error('Error loading modular states for active event', err);
    }
  };

  // Run initial fetch on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Update dependent arrays when activeEvent switches
  useEffect(() => {
    if (activeEvent) {
      fetchEventDependentData(activeEvent.id);
    }
  }, [activeEvent]);

  // Handle Select Event
  const handleSelectEvent = (eventId: string) => {
    const ev = events.find(e => e.id === eventId);
    if (ev) {
      setActiveEvent(ev);
    }
  };

  // Event CRUD operations
  const handleAddEvent = async (newEventPayload: Omit<Event, 'id' | 'expenses'>) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEventPayload)
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error creating event blueprint', err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (activeEvent?.id === id) {
          setActiveEvent(null);
        }
        await fetchData();
      }
    } catch (err) {
      console.error('Error deleting event', err);
    }
  };

  // Task checkoff operations
  const handleUpdateTaskStatus = async (
    taskId: string, 
    status: TaskStatus, 
    percentage: number,
    notes?: string,
    issueReport?: string
  ) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          completionPercentage: percentage,
          notes,
          issueReport,
          user: currentUserName,
          role: currentUserRole
        })
      });
      if (res.ok && activeEvent) {
        await fetchEventDependentData(activeEvent.id);
      }
    } catch (err) {
      console.error('Error updating task checklists', err);
    }
  };

  const handleAddTaskBlueprint = async (taskPayload: {
    name: string;
    department: string;
    priority: 'Low' | 'Medium' | 'High';
    owner: string;
    notes?: string;
  }) => {
    if (!activeEvent) return;
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskPayload,
          eventId: activeEvent.id,
          status: 'Pending',
          completionPercentage: 0,
          user: currentUserName,
          role: currentUserRole
        })
      });
      if (res.ok) {
        await fetchEventDependentData(activeEvent.id);
      }
    } catch (err) {
      console.error('Error registering task blueprint', err);
    }
  };

  // Inventory asset updates
  const handleAddInventory = async (itemPayload: Omit<InventoryItem, 'id'>) => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...itemPayload,
          user: currentUserName,
          role: currentUserRole
        })
      });
      if (res.ok && activeEvent) {
        await fetchEventDependentData(activeEvent.id);
      }
    } catch (err) {
      console.error('Error registering logistics item', err);
    }
  };

  const handleUpdateInventory = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          user: currentUserName,
          role: currentUserRole
        })
      });
      if (res.ok && activeEvent) {
        await fetchEventDependentData(activeEvent.id);
      }
    } catch (err) {
      console.error('Error updating asset logs', err);
    }
  };

  // Staff coordination updates
  const handleAddStaff = async (staffPayload: Omit<StaffMember, 'id'>) => {
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...staffPayload,
          user: currentUserName,
          role: currentUserRole
        })
      });
      if (res.ok && activeEvent) {
        await fetchEventDependentData(activeEvent.id);
      }
    } catch (err) {
      console.error('Error adding staff lead', err);
    }
  };

  const handleUpdateStaff = async (id: string, updates: Partial<StaffMember>) => {
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          user: currentUserName,
          role: currentUserRole
        })
      });
      if (res.ok && activeEvent) {
        await fetchEventDependentData(activeEvent.id);
      }
    } catch (err) {
      console.error('Error updating staff roster', err);
    }
  };

  // Vendor updates
  const handleAddVendor = async (vendorPayload: Omit<Vendor, 'id'>) => {
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...vendorPayload,
          user: currentUserName,
          role: currentUserRole
        })
      });
      if (res.ok && activeEvent) {
        await fetchEventDependentData(activeEvent.id);
      }
    } catch (err) {
      console.error('Error registering vendor partner', err);
    }
  };

  const handleUpdateVendor = async (id: string, updates: Partial<Vendor>) => {
    try {
      const res = await fetch(`/api/vendors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          user: currentUserName,
          role: currentUserRole
        })
      });
      if (res.ok && activeEvent) {
        await fetchEventDependentData(activeEvent.id);
      }
    } catch (err) {
      console.error('Error updating sub-vendor profiles', err);
    }
  };

  // Financial accounting ledgers
  const handleAddFinanceTransaction = async (txPayload: Omit<FinanceTransaction, 'id'>) => {
    try {
      const res = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...txPayload,
          user: currentUserName,
          role: currentUserRole
        })
      });
      if (res.ok && activeEvent) {
        await fetchEventDependentData(activeEvent.id);
      }
    } catch (err) {
      console.error('Error committing dual bookkeeping ledger entry', err);
    }
  };

  const handleUpdateFinanceTransaction = async (id: string, updates: Partial<FinanceTransaction>) => {
    try {
      const res = await fetch(`/api/finance/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok && activeEvent) {
        await fetchEventDependentData(activeEvent.id);
      }
    } catch (err) {
      console.error('Error updating bookkeeping ledger entry', err);
    }
  };

  const handleAddQuickLog = async (type: 'task' | 'finance' | 'issue', payload: any) => {
    if (!activeEvent) return;
    if (type === 'finance') {
      await handleAddFinanceTransaction({
        eventId: activeEvent.id,
        type: payload.type,
        category: payload.category,
        amount: payload.amount,
        date: new Date().toISOString().split('T')[0],
        description: payload.description,
        gstAmount: Math.round(payload.amount * 0.18),
        status: 'Paid'
      });
    }
  };

  // Notification clearing
  const handleClearNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      if (res.ok && activeEvent) {
        await fetchEventDependentData(activeEvent.id);
      }
    } catch (err) {
      console.error('Error dismissing operational alert', err);
    }
  };

  // AI reallocation callbacks
  const handleApplyResourceMovement = async (details: string) => {
    if (!activeEvent) return;
    try {
      // Post reallocation directly to central activity feed
      const res = await fetch('/api/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: activeEvent.id,
          action: 'REALLOC',
          details: `Applied Gemini suggested optimization: ${details}`,
          user: currentUserName,
          role: currentUserRole
        })
      });
      if (res.ok) {
        await fetchEventDependentData(activeEvent.id);
      }
    } catch (err) {
      console.error('Error archiving AI resource movement', err);
    }
  };

  const handleSelectPreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('password123');
    setAuthMode('signin');
    setLoginError(null);
    setTimeout(async () => {
      try {
        const response = await fetch('/api/sessions/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: presetEmail, password: 'password123' })
        });
        const contentType = response.headers.get('content-type');
        let data: any = {};
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          console.error('Non-JSON response from /api/sessions/create:', text);
          setLoginError(`Server returned unexpected response. Status: ${response.status}`);
          return;
        }
        if (!response.ok) {
          setLoginError(data.error || 'Invalid credentials');
          return;
        }
        setIsLoggedIn(true);
        setCurrentUserName(data.user.name);
        setCurrentUserRole(data.user.role);
        if (data.user.role === 'Staff') {
          setActiveTab('liveops');
        } else {
          setActiveTab('dashboard');
        }
      } catch (err) {
        console.error('Preset login error:', err);
      }
    }, 50);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError('Credentials cannot be empty');
      return;
    }
    setLoginError(null);
    try {
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const contentType = response.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response from /api/sessions/create:', text);
        setLoginError(`Server returned unexpected response. Status: ${response.status}`);
        return;
      }
      if (!response.ok) {
        if (data.needsVerification) {
          setVerifyEmail(data.email);
          setSimulatedCode(data.simulatedCode || null);
          setShowVerificationModal(true);
          setLoginError('Account requires verification. Please verify your email.');
        } else {
          setLoginError(data.error || 'Invalid credentials');
        }
        return;
      }

      setIsLoggedIn(true);
      setCurrentUserName(data.user.name);
      setCurrentUserRole(data.user.role);
      
      if (data.user.role === 'Staff') {
        setActiveTab('liveops');
      } else {
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('Server network error. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword || !registerRole) {
      setLoginError('Please fill in all registration fields.');
      return;
    }
    setLoginError(null);
    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
          role: registerRole
        })
      });
      const contentType = response.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response from /api/users/create:', text);
        setLoginError(`Server returned unexpected response. Status: ${response.status}`);
        return;
      }
      if (!response.ok) {
        setLoginError(data.error || 'Failed to create account.');
        return;
      }

      setVerifyEmail(registerEmail);
      setSimulatedCode(data.simulatedCode || null);
      setShowVerificationModal(true);
      
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
    } catch (err) {
      console.error('Registration error:', err);
      setLoginError('Server network error during registration.');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCodeInput) {
      setVerificationError('Verification code is required.');
      return;
    }
    setVerificationError(null);
    setVerificationSuccess(null);
    try {
      const response = await fetch('/api/users/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: verifyEmail,
          code: verificationCodeInput
        })
      });
      const contentType = response.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response from /api/users/confirm:', text);
        setVerificationError(`Server returned unexpected response. Status: ${response.status}`);
        return;
      }
      if (!response.ok) {
        setVerificationError(data.error || 'Verification failed');
        return;
      }

      setVerificationSuccess('Verification successful! Logging you in...');
      setTimeout(() => {
        setIsLoggedIn(true);
        setCurrentUserName(data.user.name);
        setCurrentUserRole(data.user.role);
        
        if (data.user.role === 'Staff') {
          setActiveTab('liveops');
        } else {
          setActiveTab('dashboard');
        }
        
        setShowVerificationModal(false);
        setVerificationCodeInput('');
        setVerificationSuccess(null);
        setLoginError(null);
      }, 1500);
    } catch (err) {
      console.error('Verification error:', err);
      setVerificationError('Network error during verification.');
    }
  };

  const handleResendOTP = async () => {
    setResendStatus({ loading: true });
    setVerificationError(null);
    setVerificationSuccess(null);
    try {
      const response = await fetch('/api/users/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail })
      });
      const contentType = response.headers.get('content-type');
      let data: any = {};
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response from /api/users/resend:', text);
        setResendStatus({ success: false, error: `Server error (${response.status})` });
        setVerificationError(`Server returned unexpected response. Status: ${response.status}`);
        return;
      }
      if (!response.ok) {
        setResendStatus({ success: false, error: data.error || 'Failed to resend code' });
        setVerificationError(data.error || 'Failed to resend code');
        return;
      }
      setResendStatus({ success: true });
      if (data.simulatedCode) {
        setSimulatedCode(data.simulatedCode);
      }
      setVerificationSuccess('A fresh verification OTP has been dispatched to your email.');
    } catch (err) {
      console.error('Error resending OTP:', err);
      setResendStatus({ success: false, error: 'Network error occurred while sending OTP' });
      setVerificationError('Network error occurred while sending OTP');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUserName('');
    setCurrentUserRole('Staff');
    setEmail('');
    setPassword('');
    setVerifyEmail('');
    setVerificationCodeInput('');
    setSimulatedCode(null);
    setVerificationError(null);
    setVerificationSuccess(null);
    setResendStatus(null);
    setAuthMode('signin');
    setShowPassword(false);
    setShowRegisterPassword(false);
  };

  // Main navigation tab director
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            activeEvent={activeEvent}
            tasks={tasks}
            inventory={inventory}
            staff={staff}
            activityLogs={activityLogs}
            onNavigate={setActiveTab}
            onAddQuickLog={handleAddQuickLog}
          />
        );
      case 'liveops':
        return (
          <LiveOpsView 
            activeEvent={activeEvent}
            tasks={tasks}
            currentUserRole={currentUserRole}
            currentUserName={currentUserName}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onAddTask={handleAddTaskBlueprint}
          />
        );
      case 'events':
        return (
          <EventManagementView 
            events={events}
            onSelectEvent={handleSelectEvent}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        );
      case 'ai_assistant':
        return (
          <AiAssistantView 
            activeEvent={activeEvent}
            onApplyResourceMovement={handleApplyResourceMovement}
          />
        );
      case 'inventory':
        return (
          <InventoryView 
            inventory={inventory}
            onAddInventory={handleAddInventory}
            onUpdateInventory={handleUpdateInventory}
          />
        );
      case 'staff':
        return (
          <StaffView 
            staff={staff}
            onAddStaff={handleAddStaff}
            onUpdateStaff={handleUpdateStaff}
          />
        );
      case 'vendors':
        return (
          <VendorsView 
            vendors={vendors}
            onAddVendor={handleAddVendor}
            onUpdateVendor={handleUpdateVendor}
            onAddQuickLog={handleAddQuickLog}
          />
        );
      case 'finance':
        return (
          <FinanceView 
            activeEvent={activeEvent}
            financeTransactions={financeTransactions}
            onAddTransaction={handleAddFinanceTransaction}
            onUpdateTransaction={handleUpdateFinanceTransaction}
          />
        );
      case 'bookings':
        return <BookingsView />;
      default:
        return <div>Unknown workspace view.</div>;
    }
  };

  // 1. Landing Page Gate
  if (isLandingPage) {
    return <LandingPage onEnterApp={() => setIsLandingPage(false)} />;
  }

  // 2. Dual Sign In / Registration Screen
  if (!isLoggedIn) {
    const demoPresets = [
      { name: 'Rohan Sharma', email: 'rohan@slvevents.com', role: 'Admin', color: 'border-red-500/30 text-red-400 bg-red-500/5', badge: 'Admin', desc: 'Full core administrative controls' },
      { name: 'Priya Patel', email: 'priya@slvevents.com', role: 'Operations Lead', color: 'border-blue-500/30 text-blue-400 bg-blue-500/5', badge: 'Ops Lead', desc: 'Day-of coordination & activity briefs' },
      { name: 'Amit Kumar', email: 'amit@slvevents.com', role: 'Finance Team', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5', badge: 'Finance', desc: 'GST reports, outlays & cost books' },
      { name: 'Sneha Rao', email: 'sneha@slvevents.com', role: 'Vendor Coordinator', color: 'border-amber-500/30 text-amber-400 bg-amber-500/5', badge: 'Vendors', desc: 'Vendor contracts & layout assets' },
      { name: 'Rajesh Mehta', email: 'rajesh@slvevents.com', role: 'Event Planner', color: 'border-violet-500/30 text-violet-400 bg-violet-500/5', badge: 'Planner', desc: 'Establish blueprinted task models' },
      { name: 'Vikram Singh', email: 'vikram@slvevents.com', role: 'Team Lead', color: 'border-sky-500/30 text-sky-400 bg-sky-500/5', badge: 'Lead Decor', desc: 'Live department milestone tracker' },
      { name: 'Sanjay Kapoor', email: 'client@slvevents.com', role: 'Client', color: 'border-purple-500/30 text-purple-400 bg-purple-500/5', badge: 'Client', desc: 'Read-only progress feedback screen' },
      { name: 'Raju Ground Crew', email: 'staff@slvevents.com', role: 'Staff', color: 'border-rose-500/30 text-rose-400 bg-rose-500/5', badge: 'Staff', desc: 'Exclusive task submission checklists' }
    ];

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 md:p-12 relative overflow-hidden" id="login_page">
        {/* Ambient background particles */}
        <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Polished centered card */}
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-display font-black text-white text-xl mx-auto tracking-tighter shadow-lg shadow-indigo-600/20">
                SLV
              </div>
              <h2 className="text-xl font-display font-bold text-white tracking-tight">SLV Events Ops Hub</h2>
              <p className="text-slate-400 text-xs">Verify your corporate session or register a new ground role.</p>
            </div>

            {/* Tab Selector */}
            <div className="grid grid-cols-2 bg-white/5 p-1.5 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setLoginError(null);
                }}
                className={`py-2 rounded-lg text-xs font-semibold tracking-wide transition cursor-pointer ${
                  authMode === 'signin' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setLoginError(null);
                }}
                className={`py-2 rounded-lg text-xs font-semibold tracking-wide transition cursor-pointer ${
                  authMode === 'register' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {authMode === 'signin' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Operations Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500 transition"
                      placeholder="E.g., name@slvevents.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500 transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 focus:outline-none transition cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/10 transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Establish Control Room Session</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Username</label>
                  <input
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500 transition whitespace-nowrap"
                    placeholder="E.g., Yuvaraj Gundu"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Email ID</label>
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500 transition"
                    placeholder="E.g., yuvaraj@slvevents.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Password</label>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500 transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 focus:outline-none transition cursor-pointer"
                      title={showRegisterPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Their Role</label>
                  <select
                    value={registerRole}
                    onChange={(e) => setRegisterRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-sm outline-none focus:border-indigo-500 transition"
                  >
                    <option value="Admin">Admin (Full Control Room Workspace)</option>
                    <option value="Operations Lead">Operations Lead (Coordination Board)</option>
                    <option value="Vendor Coordinator">Vendor Coordinator (Assets & Vendors)</option>
                    <option value="Finance Team">Finance Team (Ledger, Bills & GST)</option>
                    <option value="Team Lead">Team Lead (Decor Milestone Control)</option>
                    <option value="Client">Client (Progress Feedback Portal)</option>
                    <option value="Staff">Staff (Only task list submission panel)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/10 transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create Ground Account</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Email Verification Modal */}
        {showVerificationModal && (
          <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="max-w-md w-full bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-display font-bold text-white tracking-tight">Verify Your Email</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  We've dispatched a 6-digit validation code to <strong className="text-white">{verifyEmail}</strong>. Enter it below to authorize this session.
                </p>
              </div>

              {simulatedCode && (
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-[11px] text-slate-400 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    <span className="font-bold text-slate-200 uppercase tracking-wide font-mono text-[9px]">Developer Emulation Mode</span>
                  </div>
                  <p className="leading-relaxed">Since custom external SMTP properties are not active, a virtual activation code was generated for your use:</p>
                  <div className="text-center py-2">
                    <span className="inline-block bg-indigo-950 text-indigo-300 font-mono font-bold text-xl px-4 py-1.5 rounded-lg border border-indigo-800/50 tracking-[0.2em]">
                      {simulatedCode}
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                {verificationError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                    {verificationError}
                  </div>
                )}
                {verificationSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold">
                    {verificationSuccess}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block text-center">6-Digit Verification Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={verificationCodeInput}
                    onChange={(e) => setVerificationCodeInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center py-3 rounded-xl bg-white/5 border border-white/10 text-white text-lg font-mono font-bold tracking-widest outline-none focus:border-indigo-500 transition"
                    placeholder="000000"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVerificationModal(false);
                      setVerificationError(null);
                      setVerificationSuccess(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Verify & Login
                  </button>
                </div>

                <div className="text-center pt-2 border-t border-white/5 mt-2">
                  <button
                    type="button"
                    disabled={resendStatus?.loading}
                    onClick={handleResendOTP}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline transition cursor-pointer disabled:opacity-50"
                  >
                    {resendStatus?.loading ? 'Dispatching OTP...' : 'Send OTP to my email again'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Fully Logged-in Enterprise Workspace
  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      currentUserRole={currentUserRole}
      onRoleChange={setCurrentUserRole}
      activeEvent={activeEvent}
      events={events}
      onSelectEvent={handleSelectEvent}
      notifications={notifications}
      onClearNotification={handleClearNotification}
      currentUserName={currentUserName}
      onLogout={handleLogout}
    >
      {renderTabContent()}
    </Layout>
  );
}
