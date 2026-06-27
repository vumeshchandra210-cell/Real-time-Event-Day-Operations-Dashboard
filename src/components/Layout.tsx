import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Clock, 
  Activity, 
  Users, 
  Box, 
  Truck, 
  DollarSign, 
  Cpu, 
  Menu, 
  X, 
  ChevronDown, 
  Bell, 
  ShieldAlert,
  HelpCircle,
  FolderOpen,
  LogOut,
  Calendar
} from 'lucide-react';
import { Event, UserRole, Notification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentUserRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeEvent: Event | null;
  events: Event[];
  onSelectEvent: (eventId: string) => void;
  notifications: Notification[];
  onClearNotification: (id: string) => void;
  currentUserName: string;
  onLogout?: () => void;
}

export default function Layout({
  children,
  activeTab,
  onTabChange,
  currentUserRole,
  onRoleChange,
  activeEvent,
  events,
  onSelectEvent,
  notifications,
  onClearNotification,
  currentUserName,
  onLogout
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showEventMenu, setShowEventMenu] = useState(false);
  
  // Real-time UTC clock
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString() + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', name: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'liveops', name: 'Live Day Operations', icon: Activity },
    { id: 'events', name: 'Events Lifecycle', icon: FolderOpen },
    { id: 'ai_assistant', name: 'Gemini AI Assistant', icon: Cpu },
    { id: 'inventory', name: 'Inventory & Assets', icon: Box },
    { id: 'staff', name: 'Staff & Crew Roster', icon: Users },
    { id: 'vendors', name: 'Vendors Contracts', icon: Truck },
    { id: 'finance', name: 'Financial Ledger', icon: DollarSign },
    { id: 'bookings', name: 'Booking Requests', icon: Calendar }
  ].filter(item => {
    // Role-based access rules
    if (currentUserRole === 'Admin') return true;
    if (item.id === 'bookings') return false; // Bookings is strictly Admin-only
    if (currentUserRole === 'Operations Lead') {
      return ['dashboard', 'liveops', 'events', 'ai_assistant'].includes(item.id);
    }
    if (currentUserRole === 'Vendor Coordinator') {
      return ['vendors', 'liveops'].includes(item.id);
    }
    if (currentUserRole === 'Finance Team') {
      return ['finance', 'dashboard'].includes(item.id);
    }
    if (currentUserRole === 'Team Lead' || currentUserRole === 'Staff') {
      return ['liveops'].includes(item.id);
    }
    if (currentUserRole === 'Client') {
      return ['dashboard'].includes(item.id);
    }
    return true;
  });

  const rolesList: UserRole[] = [
    'Admin',
    'Operations Lead',
    'Vendor Coordinator',
    'Finance Team',
    'Team Lead',
    'Client',
    'Staff'
  ];

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="min-h-screen bg-slate-50 flex" id="main_layout">
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed lg:static top-0 bottom-0 left-0 w-64 bg-white text-slate-700 z-50 transition-transform lg:translate-x-0 flex flex-col justify-between border-r border-slate-200 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="space-y-6">
          {/* Logo and Brand */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-display font-black text-white text-base tracking-tighter shadow-sm">
                SLV
              </div>
              <div>
                <span className="font-display font-bold text-slate-800 text-sm block leading-none tracking-wide">SLV EVENTS</span>
                <span className="text-[10px] text-slate-400 font-mono font-bold tracking-widest block uppercase">Live-Ops Hub</span>
              </div>
            </div>
            <button className="lg:hidden text-slate-400 hover:text-slate-600" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide uppercase font-sans transition-all duration-150 cursor-pointer ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/5 border-l-2 border-blue-600 rounded-l-none' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Brand Credit & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-3">
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold text-xs transition cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Log Out</span>
            </button>
          )}
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-mono">Enterprise SLA Grade</p>
            <span className="text-[9px] text-slate-500 block mt-0.5">SLV Events Day Operations v2.0</span>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Main Header bar */}
        <header className="h-16 bg-white border-b border-slate-200 shrink-0 flex items-center justify-between px-6 relative z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-600 hover:text-slate-900"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Event Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowEventMenu(!showEventMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 transition font-semibold text-xs cursor-pointer border border-slate-100"
              >
                <span>Active Event: <strong className="text-slate-900">{activeEvent ? activeEvent.name : 'Select Event'}</strong></span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showEventMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowEventMenu(false)} />
                  <div className="absolute left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-xs">
                    <span className="px-3 py-1.5 text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Active Operations</span>
                    <div className="max-h-60 overflow-y-auto">
                      {events.map((ev) => (
                        <button
                          key={ev.id}
                          onClick={() => {
                            onSelectEvent(ev.id);
                            setShowEventMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between gap-2 cursor-pointer ${
                            activeEvent?.id === ev.id ? 'font-bold text-blue-600 bg-blue-50/40' : 'text-slate-700'
                          }`}
                        >
                          <span className="truncate">{ev.name}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">{ev.status}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions, Role simulation, Notifications and Clock */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            {/* Real-time UTC Clock */}
            <div className="hidden md:flex items-center gap-1.5 text-slate-500 font-mono bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200/50">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{timeStr}</span>
            </div>

            {/* Simulative Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-700 transition cursor-pointer"
              >
                <span>Role: <strong className="font-bold">{currentUserRole}</strong></span>
                <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
              </button>

              {showRoleMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowRoleMenu(false)} />
                  <div className="absolute right-0 mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-xs text-slate-700">
                    <span className="px-3 py-1.5 text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Simulate Role View</span>
                    {rolesList.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          onRoleChange(r);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-slate-50 block cursor-pointer ${
                          currentUserRole === r ? 'font-bold text-blue-600 bg-blue-50/20' : ''
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Dynamic Notification Tray */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-red-500 text-white font-mono font-bold text-[9px] rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-1.5 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-bold text-slate-800">Operational Alerts</span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">{unreadNotifications.length} unread</span>
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-slate-400">All quiet on the operations grid.</p>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className={`p-3 flex gap-2.5 items-start transition ${notif.read ? 'opacity-60' : 'bg-slate-50'}`}>
                            <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                            <div className="space-y-0.5 flex-1">
                              <p className="text-slate-700 font-medium leading-relaxed">{notif.message}</p>
                              <span className="text-[10px] text-slate-400 font-mono">{notif.timestamp}</span>
                            </div>
                            <button 
                              onClick={() => onClearNotification(notif.id)}
                              className="text-[10px] text-blue-600 hover:underline uppercase tracking-wider font-bold"
                            >
                              Dismiss
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-slate-800 block">{currentUserName}</span>
                <span className="text-[10px] text-slate-400 block font-mono uppercase leading-none">{currentUserRole}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                {currentUserName.split(' ').map(n => n[0]).join('')}
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Log Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content Body Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
