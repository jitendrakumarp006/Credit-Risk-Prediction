import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  FileSpreadsheet,
  LineChart,
  Database,
  Info,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Sidebar({ mobileOpen = false, setMobileOpen = () => {} }) {
  const { isSidebarCollapsed, setIsSidebarCollapsed, isBackendConnected } = useApp();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Credit Risk Prediction', path: '/prediction', icon: Sparkles, highlight: true },
    { name: 'Applications', path: '/applications', icon: FileSpreadsheet },
    { name: 'Model Analytics', path: '/analytics', icon: LineChart },
    { name: 'Dataset Explorer', path: '/dataset', icon: Database },
    { name: 'About Project', path: '/about', icon: Info },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-fintech-border flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-fintech-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fintech-deep to-fintech-primary flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <span className="font-bold text-base tracking-tight text-fintech-text block truncate">
                  CreditRisk<span className="text-fintech-primary">.AI</span>
                </span>
                <span className="text-[10px] font-semibold text-fintech-muted uppercase tracking-wider block">
                  ML Risk Underwriting
                </span>
              </div>
            )}
          </div>

          {/* Collapse Toggle (Desktop only) */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-fintech-muted hover:text-fintech-text hover:bg-slate-100 transition-colors"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                    isActive
                      ? 'bg-violet-50 text-fintech-primary font-semibold shadow-xs'
                      : 'text-fintech-muted hover:text-fintech-text hover:bg-slate-50'
                  } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`
                }
                title={isSidebarCollapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 transition-colors ${
                        isActive
                          ? 'text-fintech-primary'
                          : 'text-fintech-muted group-hover:text-fintech-text'
                      }`}
                    />
                    {!isSidebarCollapsed && (
                      <span className="truncate">{item.name}</span>
                    )}
                    {!isSidebarCollapsed && item.highlight && (
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-violet-100 text-fintech-primary px-1.5 py-0.5 rounded-md">
                        AI
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Model Engine Status Card in Footer */}
        <div className="p-3 border-t border-fintech-border">
          {!isSidebarCollapsed ? (
            <div className="p-3 rounded-xl bg-fintech-bg border border-fintech-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-fintech-muted">
                  ML Pipeline
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded ${
                    isBackendConnected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isBackendConnected ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  {isBackendConnected ? 'API Connected' : 'Demo Mode'}
                </span>
              </div>
              <p className="text-xs font-medium text-fintech-text truncate">
                German Credit Dataset
              </p>
              <div className="flex items-center gap-1 text-[11px] text-amber-600">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Experimental Median Target</span>
              </div>
            </div>
          ) : (
            <div
              className="flex justify-center p-2 rounded-xl bg-fintech-bg text-amber-600"
              title="Experimental Demo Model (Colab Pipeline)"
            >
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
