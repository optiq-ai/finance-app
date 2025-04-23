import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  purchases: [],
  filteredPurchases: [],
  currentPurchase: null,
  loading: false,
  error: null,
  filters: {
    dateFrom: null,
    dateTo: null,
    department: null,
    group: null,
    serviceType: null,
    contractor: null,
    costCategory: null
  },
  pagination: {
    page: 0,
    pageSize: 25,
    totalItems: 0
  }
};

const purchasesSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    fetchPurchasesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPurchasesSuccess: (state, action) => {
      state.purchases = action.payload.purchases;
      state.filteredPurchases = action.payload.purchases;
      state.pagination.totalItems = action.payload.totalItems;
      state.loading = false;
    },
    fetchPurchasesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentPurchase: (state, action) => {
      state.currentPurchase = action.payload;
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
  fetchPurchasesStart,
  fetchPurchasesSuccess,
  fetchPurchasesFailure,
  setCurrentPurchase,
  updateFilters,
  resetFilters,
  updatePagination
} = purchasesSlice.actions;

export default purchasesSlice.reducer;
