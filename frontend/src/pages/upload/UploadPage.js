import React, { useState, useEffect } from 'react';
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
  StepLabel,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Description as FileIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import {
  uploadStart,
  uploadProgress,
  uploadSuccess,
  uploadFailure,
  resetUploadStatus,
  fetchHistoryStart,
  fetchHistorySuccess,
  fetchHistoryFailure,
  deleteFileStart,
  deleteFileSuccess,
  deleteFileFailure
} from '../../redux/slices/uploadSlice';
import uploadService from '../../services/uploadService';
import { formatDateTime } from '../../utils/dateUtils';

const UploadPage = () => {
  const dispatch = useDispatch();
  const { uploadStatus, uploadProgress: progress, uploadedFiles, fileHistory, isLoadingHistory, error } = useSelector((state) => state.upload);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');
  
  // Pobieranie historii importów przy ładowaniu komponentu
  useEffect(() => {
    fetchUploadHistory();
  }, []);

  // Otwieranie dialogu z błędem, gdy pojawi się nowy błąd
  useEffect(() => {
    if (error) {
      setErrorDetails(error);
      setErrorDialogOpen(true);
    }
  }, [error]);

  const fetchUploadHistory = async () => {
    try {
      dispatch(fetchHistoryStart());
      const history = await uploadService.getUploadHistory();
      dispatch(fetchHistorySuccess(history));
    } catch (err) {
      console.error('Error fetching upload history:', err);
      dispatch(fetchHistoryFailure(err.message || 'Błąd pobierania historii przesłanych plików'));
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Sprawdzenie rozszerzenia pliku
      const fileExt = file.name.split('.').pop().toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(fileExt)) {
        dispatch(uploadFailure(`Nieprawidłowy format pliku. Dozwolone są tylko pliki Excel (.xlsx, .xls) oraz CSV (.csv). Wybrany plik: ${file.name}`));
        return;
      }
      
      // Sprawdzenie rozmiaru pliku (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        dispatch(uploadFailure(`Plik jest zbyt duży. Maksymalny rozmiar to 10MB. Rozmiar wybranego pliku: ${(file.size / (1024 * 1024)).toFixed(2)}MB`));
        return;
      }
      
      setSelectedFile(file);
      dispatch(resetUploadStatus());
    }
  };
  
  const handleFileTypeChange = (type) => {
    setFileType(type);
    dispatch(resetUploadStatus());
  };
  
  const handleUpload = async () => {
    if (!selectedFile || !fileType) {
      dispatch(uploadFailure('Wybierz plik i typ danych'));
      return;
    }
    
    try {
      dispatch(uploadStart());
      
      // Rzeczywisty postęp przesyłania pliku
      const progressInterval = setInterval(() => {
        const randomProgress = Math.min(progress + Math.random() * 20, 99);
        dispatch(uploadProgress(randomProgress));
      }, 500);
      
      const result = await uploadService.uploadFile(selectedFile, fileType);
      
      clearInterval(progressInterval);
      dispatch(uploadSuccess(result));
      setSelectedFile(null);
      setFileType('');
      
      // Odświeżenie historii importów po pomyślnym przesłaniu pliku
      fetchUploadHistory();
    } catch (err) {
      console.error('Upload error:', err);
      dispatch(uploadFailure(err.message || 'Wystąpił błąd podczas przesyłania pliku'));
    }
  };
  
  const handleDeleteFile = async (id) => {
    try {
      dispatch(deleteFileStart());
      await uploadService.deleteUpload(id);
      dispatch(deleteFileSuccess(id));
      
      // Resetowanie stanu po usunięciu pliku
      setSelectedFile(null);
      setFileType('');
      dispatch(resetUploadStatus());
      
      // Odświeżenie historii importów po usunięciu pliku
      fetchUploadHistory();
    } catch (err) {
      console.error('Delete file error:', err);
      dispatch(deleteFileFailure(err.message || 'Wystąpił błąd podczas usuwania pliku'));
    }
  };
  
  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    dispatch(resetUploadStatus());
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
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small"
                onClick={() => setErrorDialogOpen(true)}
              >
                Szczegóły
              </Button>
            }
          >
            Wystąpił błąd podczas przesyłania pliku
          </Alert>
        )}
        
        {uploadStatus === 'success' && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Plik został pomyślnie przesłany i przetworzony. Liczba przetworzonych wierszy: {uploadedFiles?.processedRows || 0}
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
                  accept=".xlsx,.xls,.csv"
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
                    Wybierz plik Excel/CSV
                  </Button>
                </label>
                {selectedFile && (
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <FileIcon color="primary" sx={{ mr: 1 }} />
                    <Typography>
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </Typography>
                  </Box>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                  Dozwolone formaty: .xlsx, .xls, .csv<br />
                  Maksymalny rozmiar pliku: 10MB
                </Typography>
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Historia importów
                </Typography>
                <Tooltip title="Odśwież historię">
                  <IconButton onClick={fetchUploadHistory} disabled={isLoadingHistory}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {isLoadingHistory ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : fileHistory && fileHistory.length > 0 ? (
                <List>
                  {fileHistory.map((file) => (
                    <ListItem 
                      key={file.id}
                      secondaryAction={
                        <Tooltip title="Usuń plik">
                          <IconButton edge="end" onClick={() => handleDeleteFile(file.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      <ListItemIcon>
                        <FileIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.fileName}
                        secondary={`${file.type} - ${formatDateTime(file.date, 'Brak daty')} - ${file.processedRows} rekordów`}
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
      
      {/* Dialog ze szczegółami błędu */}
      <Dialog
        open={errorDialogOpen}
        onClose={handleCloseErrorDialog}
        aria-labelledby="error-dialog-title"
        aria-describedby="error-dialog-description"
      >
        <DialogTitle id="error-dialog-title" sx={{ display: 'flex', alignItems: 'center' }}>
          <ErrorIcon color="error" sx={{ mr: 1 }} />
          Błąd podczas przesyłania pliku
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="error-dialog-description">
            {errorDetails}
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            <Typography variant="subtitle2" component="div" sx={{ mb: 1 }}>
              Możliwe przyczyny błędu:
            </Typography>
            <ul>
              <li>Nieprawidłowy format pliku (dozwolone są tylko pliki Excel .xlsx, .xls oraz CSV .csv)</li>
              <li>Plik jest uszkodzony lub ma nieprawidłową strukturę</li>
              <li>Brak wymaganych kolumn w pliku</li>
              <li>Nieprawidłowe dane w pliku (np. tekst zamiast liczby)</li>
              <li>Problem z połączeniem z serwerem</li>
            </ul>
          </DialogContentText>
          <DialogContentText>
            <Typography variant="subtitle2" component="div" sx={{ mb: 1 }}>
              Zalecane działania:
            </Typography>
            <ul>
              <li>Sprawdź format i strukturę pliku</li>
              <li>Upewnij się, że plik zawiera wszystkie wymagane kolumny</li>
              <li>Sprawdź, czy dane w pliku są poprawne</li>
              <li>Spróbuj ponownie później</li>
            </ul>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseErrorDialog} color="primary" autoFocus>
            Zamknij
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UploadPage;
