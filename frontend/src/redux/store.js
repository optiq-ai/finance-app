import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

import authReducer from './slices/authSlice';
import purchasesReducer from './slices/purchasesSlice';
import payrollReducer from './slices/payrollSlice';
import salesReducer from './slices/salesSlice';
import dashboardReducer from './slices/dashboardSlice';
import dictionaryReducer from './slices/dictionarySlice';
import uploadReducer from './slices/uploadSlice';
import savedViewsReducer from './slices/savedViewsSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'savedViews'] // tylko te reducery będą persystowane
};

const rootReducer = combineReducers({
  auth: authReducer,
  purchases: purchasesReducer,
  payroll: payrollReducer,
  sales: salesReducer,
  dashboard: dashboardReducer,
  dictionary: dictionaryReducer,
  upload: uploadReducer,
  savedViews: savedViewsReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
