import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  uploadStatus: 'idle', // 'idle', 'uploading', 'success', 'error'
  uploadProgress: 0,
  uploadedFiles: [],
  currentFile: null,
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
      state.uploadedFiles = [...state.uploadedFiles, action.payload];
      state.currentFile = action.payload;
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
    }
  }
});

export const {
  uploadStart,
  uploadProgress,
  uploadSuccess,
  uploadFailure,
  resetUploadStatus,
  setCurrentFile
} = uploadSlice.actions;

export default uploadSlice.reducer;
