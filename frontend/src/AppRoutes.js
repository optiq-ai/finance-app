import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import PurchasesPage from './pages/purchases/PurchasesPage';
import PayrollPage from './pages/payroll/PayrollPage';
import SalesPage from './pages/sales/SalesPage';
import DictionariesPage from './pages/dictionaries/DictionariesPage';
import DiagnosticPage from './pages/diagnostic/DiagnosticPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="payroll" element={<PayrollPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="dictionaries" element={<DictionariesPage />} />
        <Route path="diagnostic" element={<DiagnosticPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
