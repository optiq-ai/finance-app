import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import DashboardPage from '../src/pages/dashboard/DashboardPage';
import PurchasesPage from '../src/pages/purchases/PurchasesPage';
import PayrollPage from '../src/pages/payroll/PayrollPage';
import SalesPage from '../src/pages/sales/SalesPage';
import DictionariesPage from '../src/pages/dictionaries/DictionariesPage';

// Konfiguracja mock store
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Dane testowe
const initialState = {
  dashboard: {
    kpis: {
      totalRevenue: 100000,
      totalCosts: 70000,
      totalProfit: 30000,
      profitMargin: 30,
      averageRevenue: 8333.33,
      averageCost: 5833.33
    },
    charts: {
      revenueByMonth: Array(12).fill().map((_, i) => ({ month: i + 1, value: 8000 + i * 100 })),
      costsByMonth: Array(12).fill().map((_, i) => ({ month: i + 1, value: 6000 + i * 50 })),
      profitByMonth: Array(12).fill().map((_, i) => ({ month: i + 1, value: 2000 + i * 50 })),
    },
    comparisons: {
      currentPeriod: {
        label: 'Kwiecień 2025',
        sales: 100000,
        purchases: 50000,
        payroll: 20000,
        result: 30000
      },
      previousPeriod: {
        label: 'Marzec 2025',
        sales: 90000,
        purchases: 45000,
        payroll: 19000,
        result: 26000
      },
      percentageChange: {
        sales: 11.11,
        purchases: 11.11,
        payroll: 5.26,
        result: 15.38
      }
    },
    loading: false,
    error: null,
    filters: {
      comparisonPeriod: 'month',
      department: ''
    }
  },
  purchases: {
    purchases: Array(10).fill().map((_, i) => ({
      id: i + 1,
      date: `2025-04-${i + 1}`,
      department: 'Oddział testowy',
      group: 'Grupa testowa',
      serviceType: 'Usługa testowa',
      contractor: 'Kontrahent testowy',
      costCategory: 'Kategoria testowa',
      netAmount: 1000 + i * 100,
      vatAmount: 230 + i * 23,
      grossAmount: 1230 + i * 123,
      documentNumber: `FV/2025/04/${i + 1}`
    })),
    filteredPurchases: Array(10).fill().map((_, i) => ({
      id: i + 1,
      date: `2025-04-${i + 1}`,
      department: 'Oddział testowy',
      group: 'Grupa testowa',
      serviceType: 'Usługa testowa',
      contractor: 'Kontrahent testowy',
      costCategory: 'Kategoria testowa',
      netAmount: 1000 + i * 100,
      vatAmount: 230 + i * 23,
      grossAmount: 1230 + i * 123,
      documentNumber: `FV/2025/04/${i + 1}`
    })),
    loading: false,
    error: null,
    filters: {
      dateFrom: '',
      dateTo: '',
      department: '',
      group: '',
      serviceType: '',
      contractor: '',
      costCategory: ''
    },
    pagination: {
      page: 0,
      pageSize: 10,
      totalItems: 100,
      totalPages: 10
    }
  },
  payroll: {
    payroll: Array(10).fill().map((_, i) => ({
      id: i + 1,
      date: `2025-04-${i + 1}`,
      department: 'Oddział testowy',
      group: 'Grupa testowa',
      employeeName: `Pracownik Testowy ${i + 1}`,
      position: 'Stanowisko testowe',
      grossAmount: 5000 + i * 100,
      taxAmount: 850 + i * 17,
      netAmount: 4150 + i * 83
    })),
    filteredPayroll: Array(10).fill().map((_, i) => ({
      id: i + 1,
      date: `2025-04-${i + 1}`,
      department: 'Oddział testowy',
      group: 'Grupa testowa',
      employeeName: `Pracownik Testowy ${i + 1}`,
      position: 'Stanowisko testowe',
      grossAmount: 5000 + i * 100,
      taxAmount: 850 + i * 17,
      netAmount: 4150 + i * 83
    })),
    loading: false,
    error: null,
    filters: {
      dateFrom: '',
      dateTo: '',
      department: '',
      group: '',
      employee: '',
      category: ''
    },
    pagination: {
      page: 0,
      pageSize: 10,
      totalItems: 100,
      totalPages: 10
    }
  },
  sales: {
    sales: Array(10).fill().map((_, i) => ({
      id: i + 1,
      date: `2025-04-${i + 1}`,
      department: 'Oddział testowy',
      group: 'Grupa testowa',
      serviceType: 'Usługa testowa',
      contractor: 'Kontrahent testowy',
      quantity: 10 + i,
      netAmount: 2000 + i * 200,
      vatAmount: 460 + i * 46,
      grossAmount: 2460 + i * 246,
      documentNumber: `FV/S/2025/04/${i + 1}`
    })),
    filteredSales: Array(10).fill().map((_, i) => ({
      id: i + 1,
      date: `2025-04-${i + 1}`,
      department: 'Oddział testowy',
      group: 'Grupa testowa',
      serviceType: 'Usługa testowa',
      contractor: 'Kontrahent testowy',
      quantity: 10 + i,
      netAmount: 2000 + i * 200,
      vatAmount: 460 + i * 46,
      grossAmount: 2460 + i * 246,
      documentNumber: `FV/S/2025/04/${i + 1}`
    })),
    loading: false,
    error: null,
    filters: {
      dateFrom: '',
      dateTo: '',
      department: '',
      group: '',
      serviceType: '',
      contractor: ''
    },
    pagination: {
      page: 0,
      pageSize: 10,
      totalItems: 100,
      totalPages: 10
    }
  },
  dictionary: {
    departments: Array(5).fill().map((_, i) => ({
      id: i + 1,
      name: `Oddział ${i + 1}`,
      code: `O${i + 1}`,
      description: `Opis oddziału ${i + 1}`
    })),
    groups: Array(5).fill().map((_, i) => ({
      id: i + 1,
      name: `Grupa ${i + 1}`,
      departmentId: i % 5 + 1,
      departmentName: `Oddział ${i % 5 + 1}`,
      description: `Opis grupy ${i + 1}`
    })),
    serviceTypes: Array(5).fill().map((_, i) => ({
      id: i + 1,
      name: `Usługa ${i + 1}`,
      groupId: i % 5 + 1,
      groupName: `Grupa ${i % 5 + 1}`,
      description: `Opis usługi ${i + 1}`
    })),
    contractors: Array(5).fill().map((_, i) => ({
      id: i + 1,
      name: `Kontrahent ${i + 1}`,
      nip: `123456789${i}`,
      address: `Adres kontrahenta ${i + 1}`,
      description: `Opis kontrahenta ${i + 1}`
    })),
    costCategories: Array(5).fill().map((_, i) => ({
      id: i + 1,
      name: `Kategoria ${i + 1}`,
      code: `K${i + 1}`,
      description: `Opis kategorii ${i + 1}`
    })),
    loading: false,
    error: null
  },
  upload: {
    dataRefreshNeeded: false,
    lastUploadType: null,
    loading: false,
    error: null
  }
};

// Mock dla funkcji formatujących
jest.mock('../src/utils/dateUtils', () => ({
  formatDate: jest.fn(date => date)
}));

jest.mock('../src/utils/numberUtils', () => ({
  formatCurrency: jest.fn(value => `${value} zł`),
  formatPercentage: jest.fn(value => `${value}%`),
  formatNumber: jest.fn(value => value.toString())
}));

describe('Testy komponentów frontendowych', () => {
  let store;

  beforeEach(() => {
    store = mockStore(initialState);
  });

  test('DashboardPage wyświetla poprawnie dane', async () => {
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('100000 zł')).toBeInTheDocument(); // Przychody
      expect(screen.getByText('70000 zł')).toBeInTheDocument(); // Koszty
      expect(screen.getByText('30000 zł')).toBeInTheDocument(); // Zysk
    });
  });

  test('PurchasesPage wyświetla poprawnie dane', async () => {
    render(
      <Provider store={store}>
        <PurchasesPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Zakupy')).toBeInTheDocument();
      expect(screen.getByText('Oddział testowy')).toBeInTheDocument();
      expect(screen.getByText('Grupa testowa')).toBeInTheDocument();
      expect(screen.getByText('Kontrahent testowy')).toBeInTheDocument();
    });
  });

  test('PayrollPage wyświetla poprawnie dane', async () => {
    render(
      <Provider store={store}>
        <PayrollPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Wypłaty')).toBeInTheDocument();
      expect(screen.getByText('Pracownik Testowy 1')).toBeInTheDocument();
      expect(screen.getByText('Stanowisko testowe')).toBeInTheDocument();
      expect(screen.getByText('5000 zł')).toBeInTheDocument(); // Brutto
    });
  });

  test('SalesPage wyświetla poprawnie dane', async () => {
    render(
      <Provider store={store}>
        <SalesPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Sprzedaż')).toBeInTheDocument();
      expect(screen.getByText('Oddział testowy')).toBeInTheDocument();
      expect(screen.getByText('Grupa testowa')).toBeInTheDocument();
      expect(screen.getByText('Kontrahent testowy')).toBeInTheDocument();
    });
  });

  test('DictionariesPage wyświetla poprawnie dane', async () => {
    render(
      <Provider store={store}>
        <DictionariesPage />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Słowniki')).toBeInTheDocument();
      expect(screen.getByText('Oddział 1')).toBeInTheDocument();
      expect(screen.getByText('O1')).toBeInTheDocument();
      expect(screen.getByText('Opis oddziału 1')).toBeInTheDocument();
    });
  });
});
