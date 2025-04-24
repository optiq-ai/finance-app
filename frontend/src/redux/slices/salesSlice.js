import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sales: [],
  filteredSales: [],
  filterOptions: {
    departments: [],
    groups: [],
    serviceTypes: [],
    customers: []
  },
  currentSale: null,
  loading: false,
  error: null,
  filters: {
    dateFrom: '',
    dateTo: '',
    department: '',
    group: '',
    serviceType: '',
    customer: ''
  },
  pagination: {
    page: 0,
    pageSize: 25,
    totalItems: 0,
    totalPages: 0
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
      console.log('Otrzymane dane sprzedaży:', action.payload);
      
      // Zapewnienie, że mamy tablicę elementów, nawet jeśli API zwróci null lub undefined
      const items = Array.isArray(action.payload.items) ? action.payload.items : [];
      
      // Dodanie domyślnych wartości dla pustych pól
      const formattedItems = items.map(item => ({
        id: item.id || 0,
        date: item.date || new Date().toISOString(),
        department: item.department || '-',
        group: item.group || '-',
        serviceType: item.serviceType || '-',
        customer: item.customer || '-',
        documentNumber: item.documentNumber || '-',
        netAmount: item.netAmount || 0,
        vatAmount: item.vatAmount || 0,
        grossAmount: item.grossAmount || 0,
        ...item
      }));
      
      state.sales = formattedItems;
      state.filteredSales = formattedItems;
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
    fetchSalesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      // W przypadku błędu, zachowujemy poprzednie dane
      console.error('Błąd pobierania danych sprzedaży:', action.payload);
    },
    setCurrentSale: (state, action) => {
      state.currentSale = action.payload;
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
  fetchSalesStart,
  fetchSalesSuccess,
  fetchSalesFailure,
  setCurrentSale,
  updateFilters,
  resetFilters,
  updatePagination
} = salesSlice.actions;

export default salesSlice.reducer;
