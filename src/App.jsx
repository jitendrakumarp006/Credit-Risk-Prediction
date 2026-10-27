import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Prediction } from './pages/Prediction';
import { Applications } from './pages/Applications';
import { ModelAnalytics } from './pages/ModelAnalytics';
import { DatasetExplorer } from './pages/DatasetExplorer';
import { AboutProject } from './pages/AboutProject';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="prediction" element={<Prediction />} />
            <Route path="applications" element={<Applications />} />
            <Route path="analytics" element={<ModelAnalytics />} />
            <Route path="dataset" element={<DatasetExplorer />} />
            <Route path="about" element={<AboutProject />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
