import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  kpis: {
    totalRevenue: 0,
    totalCosts: 0,
    totalProfit: 0,
    profitMargin: 0,
    averageRevenue: 0,
    averageCost: 0
  },
  charts: {
    revenueByMonth: [],
    costsByMonth: [],
    profitByMonth: [],
    revenueByDepartment: [],
    costsByDepartment: [],
    profitByDepartment: []
  },
  comparisons: {
    currentPeriod: {},
    previousPeriod: {},
    percentageChange: {}
  },
  loading: false,
  error: null,
  filters: {
    dateFrom: null,
    dateTo: null,
    department: null,
    group: null,
    serviceType: null,
    comparisonPeriod: 'month' // 'month', 'quarter', 'year'
  }
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    fetchDashboardDataStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDashboardDataSuccess: (state, action) => {
      state.kpis = action.payload.kpis;
      state.charts = action.payload.charts;
      state.comparisons = action.payload.comparisons;
      state.loading = false;
    },
    fetchDashboardDataFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateDashboardFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetDashboardFilters: (state) => {
      state.filters = initialState.filters;
    }
  }
});

export const {
  fetchDashboardDataStart,
  fetchDashboardDataSuccess,
  fetchDashboardDataFailure,
  updateDashboardFilters,
  resetDashboardFilters
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
