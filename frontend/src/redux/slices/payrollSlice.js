import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  payroll: [],
  filteredPayroll: [],
  currentPayroll: null,
  loading: false,
  error: null,
  filters: {
    dateFrom: null,
    dateTo: null,
    department: null,
    group: null,
    serviceType: null,
    employee: null,
    category: null
  },
  pagination: {
    page: 0,
    pageSize: 25,
    totalItems: 0
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
      state.payroll = action.payload.payroll;
      state.filteredPayroll = action.payload.payroll;
      state.pagination.totalItems = action.payload.totalItems;
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
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
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
