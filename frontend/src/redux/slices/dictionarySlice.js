import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  departments: [],
  groups: [],
  serviceTypes: [],
  contractors: [],
  costCategories: [],
  loading: false,
  error: null,
  lastUpdated: null
};

const dictionarySlice = createSlice({
  name: 'dictionary',
  initialState,
  reducers: {
    fetchDictionariesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDictionariesSuccess: (state, action) => {
      console.log('Aktualizacja słowników w Redux:', action.payload);
      
      // Zapewnienie, że mamy tablice, nawet jeśli API zwróci null lub undefined
      state.departments = Array.isArray(action.payload.departments) ? action.payload.departments : [];
      state.groups = Array.isArray(action.payload.groups) ? action.payload.groups : [];
      state.serviceTypes = Array.isArray(action.payload.serviceTypes) ? action.payload.serviceTypes : [];
      state.contractors = Array.isArray(action.payload.contractors) ? action.payload.contractors : [];
      state.costCategories = Array.isArray(action.payload.costCategories) ? action.payload.costCategories : [];
      
      state.loading = false;
      state.error = null;
      state.lastUpdated = new Date().toISOString();
      
      console.log('Stan słowników po aktualizacji:', {
        departments: state.departments.length,
        groups: state.groups.length,
        serviceTypes: state.serviceTypes.length,
        contractors: state.contractors.length,
        costCategories: state.costCategories.length
      });
    },
    fetchDictionariesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      console.error('Błąd pobierania słowników:', action.payload);
    },
    addItemStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addItemSuccess: (state, action) => {
      const { type, item } = action.payload;
      
      switch (type) {
        case 'departments':
          state.departments.push(item);
          break;
        case 'groups':
          state.groups.push(item);
          break;
        case 'serviceTypes':
          state.serviceTypes.push(item);
          break;
        case 'contractors':
          state.contractors.push(item);
          break;
        case 'costCategories':
          state.costCategories.push(item);
          break;
        default:
          break;
      }
      
      state.loading = false;
      state.lastUpdated = new Date().toISOString();
    },
    addItemFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateItemStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateItemSuccess: (state, action) => {
      const { type, item } = action.payload;
      
      switch (type) {
        case 'departments':
          state.departments = state.departments.map(dept => 
            dept.id === item.id ? item : dept
          );
          break;
        case 'groups':
          state.groups = state.groups.map(group => 
            group.id === item.id ? item : group
          );
          break;
        case 'serviceTypes':
          state.serviceTypes = state.serviceTypes.map(type => 
            type.id === item.id ? item : type
          );
          break;
        case 'contractors':
          state.contractors = state.contractors.map(contractor => 
            contractor.id === item.id ? item : contractor
          );
          break;
        case 'costCategories':
          state.costCategories = state.costCategories.map(category => 
            category.id === item.id ? item : category
          );
          break;
        default:
          break;
      }
      
      state.loading = false;
      state.lastUpdated = new Date().toISOString();
    },
    updateItemFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteItemStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteItemSuccess: (state, action) => {
      const { type, id } = action.payload;
      
      switch (type) {
        case 'departments':
          state.departments = state.departments.filter(dept => dept.id !== id);
          break;
        case 'groups':
          state.groups = state.groups.filter(group => group.id !== id);
          break;
        case 'serviceTypes':
          state.serviceTypes = state.serviceTypes.filter(type => type.id !== id);
          break;
        case 'contractors':
          state.contractors = state.contractors.filter(contractor => contractor.id !== id);
          break;
        case 'costCategories':
          state.costCategories = state.costCategories.filter(category => category.id !== id);
          break;
        default:
          break;
      }
      
      state.loading = false;
      state.lastUpdated = new Date().toISOString();
    },
    deleteItemFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  fetchDictionariesStart,
  fetchDictionariesSuccess,
  fetchDictionariesFailure,
  addItemStart,
  addItemSuccess,
  addItemFailure,
  updateItemStart,
  updateItemSuccess,
  updateItemFailure,
  deleteItemStart,
  deleteItemSuccess,
  deleteItemFailure
} = dictionarySlice.actions;

export default dictionarySlice.reducer;
