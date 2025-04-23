import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sales: [],
  filteredSales: [],
  currentSale: null,
  loading: false,
  error: null,
  filters: {
    dateFrom: null,
    dateTo: null,
    department: null,
    group: null,
    serviceType: null,
    customer: null,
    category: null
  },
  pagination: {
    page: 0,
    pageSize: 25,
    totalItems: 0
  }
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    fetchSalesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSalesSuccess: (state, action) => {
      state.sales = action.payload.sales;
      state.filteredSales = action.payload.sales;
      state.pagination.totalItems = action.payload.totalItems;
      state.loading = false;
    },
    fetchSalesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentSale: (state, action) => {
      state.currentSale = action.payload;
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
  fetchSalesStart,
  fetchSalesSuccess,
  fetchSalesFailure,
  setCurrentSale,
  updateFilters,
  resetFilters,
  updatePagination
} = salesSlice.actions;

export default salesSlice.reducer;
