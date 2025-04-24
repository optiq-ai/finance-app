import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  payrolls: [],
  filteredPayrolls: [],
  filterOptions: {
    departments: [],
    groups: [],
    employees: []
  },
  currentPayroll: null,
  loading: false,
  error: null,
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
      state.payrolls = action.payload.items || [];
      state.filteredPayrolls = action.payload.items || [];
      state.pagination.totalItems = action.payload.totalItems || 0;
      state.pagination.totalPages = action.payload.totalPages || 0;
      state.pagination.page = action.payload.page || 0;
      state.pagination.pageSize = action.payload.pageSize || 25;
      
      // Aktualizacja opcji filtrów, jeśli są dostępne
      if (action.payload.filterOptions) {
        state.filterOptions = action.payload.filterOptions;
      }
      
      state.loading = false;
    },
    fetchPayrollFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
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
