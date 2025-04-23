import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  departments: [],
  groups: [],
  serviceTypes: [],
  contractors: [],
  costCategories: [],
  loading: false,
  error: null
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
      state.departments = action.payload.departments || state.departments;
      state.groups = action.payload.groups || state.groups;
      state.serviceTypes = action.payload.serviceTypes || state.serviceTypes;
      state.contractors = action.payload.contractors || state.contractors;
      state.costCategories = action.payload.costCategories || state.costCategories;
      state.loading = false;
    },
    fetchDictionariesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addDictionaryItem: (state, action) => {
      const { type, item } = action.payload;
      state[type] = [...state[type], item];
    },
    updateDictionaryItem: (state, action) => {
      const { type, item } = action.payload;
      state[type] = state[type].map(i => i.id === item.id ? item : i);
    },
    deleteDictionaryItem: (state, action) => {
      const { type, id } = action.payload;
      state[type] = state[type].filter(i => i.id !== id);
    }
  }
});

export const {
  fetchDictionariesStart,
  fetchDictionariesSuccess,
  fetchDictionariesFailure,
  addDictionaryItem,
  updateDictionaryItem,
  deleteDictionaryItem
} = dictionarySlice.actions;

export default dictionarySlice.reducer;
