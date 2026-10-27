import React, { createContext, useContext, useState, useEffect } from 'react';
import { GERMAN_CREDIT_RECORDS } from '../data/germanCreditData';
import { INITIAL_NOTIFICATIONS } from '../data/demoData';
import { api } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Store live applications in localStorage or fall back to benchmark records
  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('credit_risk_user_applications');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Combine newly added user applications with initial benchmark data
        return [...parsed, ...GERMAN_CREDIT_RECORDS];
      }
    } catch {
      // Fallback
    }
    return GERMAN_CREDIT_RECORDS;
  });

  const [activeModel, setActiveModel] = useState('Random Forest');
  const [backendUrl, setBackendUrl] = useState(() => api.getBaseUrl());
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [artifactLoaded, setArtifactLoaded] = useState(false);
  const [backendMode, setBackendMode] = useState('unavailable');
  const [backendModels, setBackendModels] = useState([]);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [toasts, setToasts] = useState([]);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Toast dispatch
  const addToast = (type = 'info', title, message) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Add a newly analyzed application
  const addApplication = (newApp) => {
    setApplications(prev => [newApp, ...prev]);

    // Save user submissions to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('credit_risk_user_applications') || '[]');
      localStorage.setItem('credit_risk_user_applications', JSON.stringify([newApp, ...existing]));
    } catch {
      // ignore storage error
    }

    addToast(
      newApp.riskClass === 1 ? 'warning' : 'success',
      'Assessment Recorded',
      `Application ${newApp.id} classified as ${newApp.riskLabel}.`
    );
  };

  // Check backend health
  const checkBackendStatus = async (customUrl) => {
    setIsCheckingBackend(true);
    if (customUrl) {
      api.setBaseUrl(customUrl);
      setBackendUrl(customUrl);
    }
    const res = await api.checkHealth();
    const liveReady = res.connected && res.artifactLoaded === true;
    setIsBackendConnected(liveReady);
    setArtifactLoaded(res.artifactLoaded === true);
    setBackendMode(res.isLive ? 'live' : (res.connected ? 'degraded' : 'unavailable'));

    if (res.connected) {
      const modelsData = await api.getModels();
      if (modelsData && modelsData.models && modelsData.models.length > 0) {
        setBackendModels(modelsData.models);
      }
    } else {
      setBackendModels([]);
    }

    setIsCheckingBackend(false);
    return res;
  };

  // Test connection on initial load
  useEffect(() => {
    checkBackendStatus();
  }, []);

  const markNotificationRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const resetToInitialData = () => {
    localStorage.removeItem('credit_risk_user_applications');
    setApplications(GERMAN_CREDIT_RECORDS);
    addToast('info', 'Data Reset', 'All live predictions cleared. Initial benchmark dataset restored.');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        applications,
        addApplication,
        activeModel,
        setActiveModel,
        backendUrl,
        setBackendUrl,
        isBackendConnected,
        artifactLoaded,
        backendMode,
        backendModels,
        isCheckingBackend,
        checkBackendStatus,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        notifications,
        unreadCount,
        markNotificationRead,
        clearNotifications,
        toasts,
        addToast,
        removeToast,
        globalSearchQuery,
        setGlobalSearchQuery,
        resetToInitialData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
