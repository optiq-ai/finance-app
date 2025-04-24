import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PurchasesPage from './pages/purchases/PurchasesPage';
import PayrollPage from './pages/payroll/PayrollPage';
import SalesPage from './pages/sales/SalesPage';
import UploadPage from './pages/upload/UploadPage';
import DictionariesPage from './pages/dictionaries/DictionariesPage';
import SettingsPage from './pages/settings/SettingsPage';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Komponent do ochrony tras - autoryzacja wyłączona, zawsze przepuszcza
const ProtectedRoute = ({ children }) => {
  // Autoryzacja jest wyłączona, zawsze przepuszczamy użytkownika
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Przekierowanie bezpośrednio do aplikacji (autoryzacja wyłączona) */}
      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/login" element={<Navigate to="/app/dashboard" replace />} />
      
      {/* Trasy aplikacji (autoryzacja wyłączona) */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="payroll" element={<PayrollPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="dictionaries" element={<DictionariesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      {/* Przekierowanie dla nieznanych tras */}
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
