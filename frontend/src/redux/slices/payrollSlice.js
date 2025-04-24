import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  payroll: [],
  filteredPayroll: [],
  filterOptions: {
    departments: [],
    groups: [],
    employees: []
  },
  currentPayroll: null,
  loading: false,
  error: null,
  lastUpdated: null,
  filters: {
    dateFrom: '',
    dateTo: '',
    department: '',
    group: '',
    employee: ''
  },
  pagination: {
    page: 0,
    pageSize: 25,
    totalItems: 0,
    totalPages: 0
  }
};

const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    fetchPayrollStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPayrollSuccess: (state, action) => {
      console.log('Aktualizacja wypłat w Redux:', action.payload);
      
      // Zapewnienie, że mamy tablicę elementów, nawet jeśli API zwróci null lub undefined
      const items = Array.isArray(action.payload.items) ? action.payload.items : [];
      
      // Dodanie domyślnych wartości dla pustych pól
      const formattedItems = items.map(item => ({
        id: item.id || 0,
        date: item.date || new Date().toISOString(),
        department: item.department || '-',
        group: item.group || '-',
        employeeName: item.employeeName || '-',
        position: item.position || '-',
        grossAmount: item.grossAmount || 0,
        netAmount: item.netAmount || 0,
        taxAmount: item.taxAmount || 0,
        ...item
      }));
      
      state.payroll = formattedItems;
      state.filteredPayroll = formattedItems;
      state.pagination.totalItems = action.payload.totalItems || 0;
      state.pagination.totalPages = action.payload.totalPages || 0;
      state.pagination.page = action.payload.page || 0;
      state.pagination.pageSize = action.payload.pageSize || 25;
      
      // Aktualizacja opcji filtrów, jeśli są dostępne
      if (action.payload.filterOptions) {
        state.filterOptions = action.payload.filterOptions;
      }
      
      state.loading = false;
      state.lastUpdated = new Date().toISOString();
      
      console.log('Stan wypłat po aktualizacji:', {
        ilość: formattedItems.length,
        totalItems: state.pagination.totalItems,
        przykład: formattedItems.length > 0 ? formattedItems[0] : null
      });
    },
    fetchPayrollFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      // W przypadku błędu, zachowujemy poprzednie dane
      console.error('Błąd pobierania danych wypłat:', action.payload);
    },
    setCurrentPayroll: (state, action) => {
      state.currentPayroll = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Resetowanie strony przy zmianie filtrów
      state.pagination.page = 0;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      // Resetowanie strony przy resetowaniu filtrów
      state.pagination.page = 0;
    },
    updatePagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    }
  }
});

export const {
  fetchPayrollStart,
  fetchPayrollSuccess,
  fetchPayrollFailure,
  setCurrentPayroll,
  updateFilters,
  resetFilters,
  updatePagination
} = payrollSlice.actions;

export default payrollSlice.reducer;
