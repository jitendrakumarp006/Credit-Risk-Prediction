import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  AlertTriangle,
  Info,
  Trash2,
  User,
  Shield,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CURRENT_USER } from '../../data/demoData';

export function Navbar({ onMobileMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    clearNotifications,
    isBackendConnected,
    globalSearchQuery,
    setGlobalSearchQuery,
    activeModel
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const routeMeta = {
    '/': { title: 'Executive Dashboard', subtitle: 'Overview & Portfolio Analytics' },
    '/prediction': { title: 'Credit Risk Prediction', subtitle: 'Interactive Applicant Risk Evaluation' },
    '/applications': { title: 'Applications Ledger', subtitle: 'Search, Filter & Audit Credit Records' },
    '/analytics': { title: 'Model Analytics', subtitle: 'Notebook Accuracy & Target Leakage Evaluation' },
    '/dataset': { title: 'Dataset Explorer', subtitle: 'German Credit Benchmark Data & Statistics' },
    '/about': { title: 'About Project', subtitle: 'Pipeline Workflow, Methodology & Limitations' },
    '/settings': { title: 'System Settings', subtitle: 'Backend URL & Model Configuration' },
  };

  const currentMeta = routeMeta[location.pathname] || {
    title: 'Credit Risk Platform',
    subtitle: 'Machine Learning Credit Risk Assessment'
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (location.pathname !== '/applications' && location.pathname !== '/dataset') {
      navigate('/applications');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-fintech-border px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 rounded-lg text-fintech-muted hover:text-fintech-text hover:bg-slate-100 transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-fintech-muted font-medium">
            <span>Home</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-fintech-primary capitalize">
              {location.pathname === '/' ? 'Dashboard' : location.pathname.replace('/', '')}
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-fintech-text tracking-tight leading-none mt-0.5">
            {currentMeta.title}
          </h1>
        </div>
      </div>

      {/* Center: Search Field */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden md:flex items-center relative max-w-xs lg:max-w-md w-full mx-4"
      >
        <Search className="w-4 h-4 text-fintech-muted absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={globalSearchQuery}
          onChange={(e) => setGlobalSearchQuery(e.target.value)}
          placeholder="Search applications, ID, purpose..."
          className="w-full bg-fintech-bg border border-fintech-border text-xs rounded-xl pl-9 pr-14 py-2 text-fintech-text placeholder:text-fintech-muted focus:outline-none focus:ring-2 focus:ring-fintech-primary/30 focus:border-fintech-primary transition-all"
        />
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-fintech-muted font-mono bg-white border border-fintech-border px-1.5 py-0.5 rounded shadow-2xs">
          Enter
        </kbd>
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Model Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-violet-50/80 border border-violet-100 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-fintech-primary" />
          <span className="text-xs font-semibold text-fintech-primary">
            {activeModel}
          </span>
          <span className="text-[10px] text-slate-400">•</span>
          <span className="text-xs text-amber-700 font-medium">
            {isBackendConnected ? 'API Live' : 'Demo Target'}
          </span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-fintech-muted hover:text-fintech-text hover:bg-slate-100 transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-fintech-primary rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-modal border border-fintech-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-4 py-3 border-b border-fintech-border bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-fintech-text">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-violet-100 text-fintech-primary px-1.5 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-xs text-fintech-muted hover:text-rose-600 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-fintech-borderLight">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-fintech-muted">
                    No notifications at this time
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                        !notif.read ? 'bg-violet-50/30' : ''
                      }`}
                    >
                      <div className="mt-0.5">
                        {notif.type === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Info className="w-4 h-4 text-fintech-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-fintech-text truncate">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-fintech-muted">{notif.time}</span>
                        </div>
                        <p className="text-xs text-fintech-muted mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-fintech-border bg-slate-50/50 text-center">
                <span className="text-[11px] text-fintech-muted">
                  Experimental model notifications & pipeline events
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="User profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fintech-primary to-fintech-accent text-white font-semibold text-xs flex items-center justify-center shadow-xs">
              {CURRENT_USER.avatar}
            </div>
            <div className="hidden xl:block text-left">
              <span className="text-xs font-semibold text-fintech-text block leading-tight">
                {CURRENT_USER.name}
              </span>
              <span className="text-[10px] text-fintech-muted block leading-tight">
                {CURRENT_USER.role}
              </span>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-modal border border-fintech-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 border-b border-fintech-border bg-slate-50/60">
                <p className="text-sm font-semibold text-fintech-text">{CURRENT_USER.name}</p>
                <p className="text-xs text-fintech-muted">{CURRENT_USER.role}</p>
                <p className="text-[11px] text-fintech-subtle mt-1">{CURRENT_USER.department}</p>
              </div>

              <div className="p-2 space-y-1 text-xs">
                <button
                  onClick={() => {
                    navigate('/prediction');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-fintech-text hover:bg-slate-100 flex items-center gap-2.5 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-fintech-primary" />
                  Evaluate Applicant Profile
                </button>
                <button
                  onClick={() => {
                    navigate('/analytics');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-fintech-text hover:bg-slate-100 flex items-center gap-2.5 transition-colors"
                >
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Model Performance & Leakage
                </button>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-fintech-text hover:bg-slate-100 flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-4 h-4 text-fintech-muted" />
                  Connection Settings
                </button>
              </div>

              <div className="p-3 border-t border-fintech-border bg-slate-50/50 flex items-center justify-between text-[11px] text-fintech-muted">
                <span>College Project Edition</span>
                <span className="font-semibold text-fintech-primary">v1.0.0</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
