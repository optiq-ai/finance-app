import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  views: [],
  currentView: null,
  loading: false,
  error: null
};

const savedViewsSlice = createSlice({
  name: 'savedViews',
  initialState,
  reducers: {
    fetchViewsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchViewsSuccess: (state, action) => {
      state.views = action.payload;
      state.loading = false;
    },
    fetchViewsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    saveViewStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    saveViewSuccess: (state, action) => {
      state.views = [...state.views, action.payload];
      state.currentView = action.payload;
      state.loading = false;
    },
    saveViewFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateViewStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateViewSuccess: (state, action) => {
      state.views = state.views.map(view => 
        view.id === action.payload.id ? action.payload : view
      );
      state.currentView = action.payload;
      state.loading = false;
    },
    updateViewFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteViewStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteViewSuccess: (state, action) => {
      state.views = state.views.filter(view => view.id !== action.payload);
      state.currentView = null;
      state.loading = false;
    },
    deleteViewFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    }
  }
});

export const {
  fetchViewsStart,
  fetchViewsSuccess,
  fetchViewsFailure,
  saveViewStart,
  saveViewSuccess,
  saveViewFailure,
  updateViewStart,
  updateViewSuccess,
  updateViewFailure,
  deleteViewStart,
  deleteViewSuccess,
  deleteViewFailure,
  setCurrentView
} = savedViewsSlice.actions;

export default savedViewsSlice.reducer;
