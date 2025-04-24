import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import PurchasesPage from './pages/purchases/PurchasesPage';
import PayrollPage from './pages/payroll/PayrollPage';
import SalesPage from './pages/sales/SalesPage';
import UploadPage from './pages/upload/UploadPage';
import DictionariesPage from './pages/dictionaries/DictionariesPage';
import SettingsPage from './pages/settings/SettingsPage';
import DiagnosticPage from './pages/diagnostic/DiagnosticPage';
import MaintenancePage from './pages/maintenance/MaintenancePage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="app">
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="purchases" element={<PurchasesPage />} />
          <Route path="payroll" element={<PayrollPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="dictionaries" element={<DictionariesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="diagnostic" element={<DiagnosticPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
