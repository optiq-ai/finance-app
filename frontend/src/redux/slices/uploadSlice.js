import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  uploadStatus: 'idle', // 'idle', 'uploading', 'success', 'error'
  uploadProgress: 0,
  uploadedFiles: [],
  currentFile: null,
  fileHistory: [],
  isLoadingHistory: false,
  error: null
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    uploadStart: (state) => {
      state.uploadStatus = 'uploading';
      state.uploadProgress = 0;
      state.error = null;
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
    },
    uploadFailure: (state, action) => {
      state.uploadStatus = 'error';
      state.error = action.payload;
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
    },
    deleteFileFailure: (state, action) => {
      state.error = action.payload;
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
  deleteFileFailure
} = uploadSlice.actions;

export default uploadSlice.reducer;
