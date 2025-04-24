import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  uploadStatus: 'idle', // 'idle', 'uploading', 'success', 'error'
  uploadProgress: 0,
  uploadedFiles: [],
  currentFile: null,
  fileHistory: [],
  isLoadingHistory: false,
  error: null,
  dataRefreshNeeded: false, // Nowe pole do sygnalizowania potrzeby odświeżenia danych
  lastUploadType: null // Typ ostatnio przesłanego pliku
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    uploadStart: (state) => {
      state.uploadStatus = 'uploading';
      state.uploadProgress = 0;
      state.error = null;
      state.dataRefreshNeeded = false;
    },
    uploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    uploadSuccess: (state, action) => {
      state.uploadStatus = 'success';
      state.uploadProgress = 100;
      state.uploadedFiles = [...state.uploadedFiles, action.payload.importedFile];
      state.currentFile = action.payload.importedFile;
      state.error = null;
      state.dataRefreshNeeded = true; // Ustawiamy flagę, że dane wymagają odświeżenia
      state.lastUploadType = action.payload.importedFile?.fileType || null; // Zapisujemy typ przesłanego pliku
    },
    uploadFailure: (state, action) => {
      state.uploadStatus = 'error';
      state.error = action.payload;
      state.dataRefreshNeeded = false;
    },
    resetUploadStatus: (state) => {
      state.uploadStatus = 'idle';
      state.uploadProgress = 0;
      state.error = null;
    },
    setCurrentFile: (state, action) => {
      state.currentFile = action.payload;
    },
    fetchHistoryStart: (state) => {
      state.isLoadingHistory = true;
      state.error = null;
    },
    fetchHistorySuccess: (state, action) => {
      state.isLoadingHistory = false;
      state.fileHistory = action.payload;
      state.error = null;
    },
    fetchHistoryFailure: (state, action) => {
      state.isLoadingHistory = false;
      state.error = action.payload;
    },
    deleteFileStart: (state) => {
      state.error = null;
    },
    deleteFileSuccess: (state, action) => {
      state.fileHistory = state.fileHistory.filter(file => file.id !== action.payload);
      state.uploadedFiles = state.uploadedFiles.filter(file => file.id !== action.payload);
      if (state.currentFile && state.currentFile.id === action.payload) {
        state.currentFile = null;
      }
      state.dataRefreshNeeded = true; // Ustawiamy flagę, że dane wymagają odświeżenia po usunięciu pliku
    },
    deleteFileFailure: (state, action) => {
      state.error = action.payload;
    },
    // Nowa akcja do resetowania flagi odświeżania danych
    resetDataRefreshNeeded: (state) => {
      state.dataRefreshNeeded = false;
    }
  }
});

export const {
  uploadStart,
  uploadProgress,
  uploadSuccess,
  uploadFailure,
  resetUploadStatus,
  setCurrentFile,
  fetchHistoryStart,
  fetchHistorySuccess,
  fetchHistoryFailure,
  deleteFileStart,
  deleteFileSuccess,
  deleteFileFailure,
  resetDataRefreshNeeded
} = uploadSlice.actions;

export default uploadSlice.reducer;
