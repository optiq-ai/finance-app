import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Description as FileIcon
} from '@mui/icons-material';
import {
  uploadStart,
  uploadProgress,
  uploadSuccess,
  uploadFailure,
  resetUploadStatus
} from '../../redux/slices/uploadSlice';
import uploadService from '../../services/uploadService';
import { formatDateTime } from '../../utils/dateUtils';

const UploadPage = () => {
  const dispatch = useDispatch();
  const { uploadStatus, uploadProgress: progress, uploadedFiles, error } = useSelector((state) => state.upload);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('');
  
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };
  
  const handleFileTypeChange = (type) => {
    setFileType(type);
  };
  
  const handleUpload = async () => {
    if (!selectedFile || !fileType) {
      dispatch(uploadFailure('Wybierz plik i typ danych'));
      return;
    }
    
    try {
      dispatch(uploadStart());
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        const randomProgress = Math.min(progress + Math.random() * 20, 99);
        dispatch(uploadProgress(randomProgress));
      }, 500);
      
      const result = await uploadService.uploadFile(selectedFile, fileType);
      
      clearInterval(progressInterval);
      dispatch(uploadSuccess(result));
      setSelectedFile(null);
      setFileType('');
    } catch (err) {
      dispatch(uploadFailure(err.message));
    }
  };
  
  const steps = ['Wybierz plik', 'Określ typ danych', 'Prześlij plik', 'Weryfikacja'];
  const activeStep = !selectedFile ? 0 : !fileType ? 1 : uploadStatus === 'idle' ? 2 : 3;
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Import danych
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {uploadStatus === 'success' && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Plik został pomyślnie przesłany i przetworzony.
          </Alert>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                1. Wybierz plik do importu
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                <input
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  disabled={uploadStatus === 'uploading'}
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<UploadIcon />}
                    disabled={uploadStatus === 'uploading'}
                  >
                    Wybierz plik Excel
                  </Button>
                </label>
                {selectedFile && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <FileIcon color="primary" sx={{ mr: 1 }} />
                    <Typography>{selectedFile.name}</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                2. Określ typ importowanych danych
              </Typography>
              <List>
                <ListItem button onClick={() => handleFileTypeChange('purchases')} selected={fileType === 'purchases'}>
                  <ListItemIcon>
                    {fileType === 'purchases' ? <CheckIcon color="primary" /> : <FileIcon />}
                  </ListItemIcon>
                  <ListItemText primary="Zakupy" secondary="Import danych o zakupach i kosztach" />
                </ListItem>
                <Divider />
                <ListItem button onClick={() => handleFileTypeChange('payroll')} selected={fileType === 'payroll'}>
                  <ListItemIcon>
                    {fileType === 'payroll' ? <CheckIcon color="primary" /> : <FileIcon />}
                  </ListItemIcon>
                  <ListItemText primary="Wypłaty" secondary="Import danych o wynagrodzeniach" />
                </ListItem>
                <Divider />
                <ListItem button onClick={() => handleFileTypeChange('sales')} selected={fileType === 'sales'}>
                  <ListItemIcon>
                    {fileType === 'sales' ? <CheckIcon color="primary" /> : <FileIcon />}
                  </ListItemIcon>
                  <ListItemText primary="Sprzedaż" secondary="Import danych o sprzedaży i przychodach" />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                3. Prześlij plik
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpload}
                  disabled={!selectedFile || !fileType || uploadStatus === 'uploading'}
                  sx={{ mb: 2 }}
                >
                  {uploadStatus === 'uploading' ? (
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                  ) : (
                    <UploadIcon sx={{ mr: 1 }} />
                  )}
                  {uploadStatus === 'uploading' ? 'Przesyłanie...' : 'Prześlij plik'}
                </Button>
                
                {uploadStatus === 'uploading' && (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <Typography variant="body2" align="center" gutterBottom>
                      Postęp: {Math.round(progress)}%
                    </Typography>
                    <Box
                      sx={{
                        height: 10,
                        width: '100%',
                        bgcolor: 'grey.200',
                        borderRadius: 5,
                        position: 'relative'
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: `${progress}%`,
                          bgcolor: 'primary.main',
                          borderRadius: 5,
                          transition: 'width 0.3s'
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Historia importów
              </Typography>
              {uploadedFiles.length > 0 ? (
                <List>
                  {uploadedFiles.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <FileIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.fileName}
                        secondary={`${file.type} - ${formatDateTime(file.date, 'Brak daty')}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  Brak historii importów
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default UploadPage;
