import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Alert, CircularProgress, Paper, Grid, Divider } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import dictionaryService from '../services/dictionaryService';
import { fetchDictionariesSuccess } from '../redux/slices/dictionarySlice';

const DirectDataLoader = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  
  // Pobieranie stanu z Redux
  const dictionaryState = useSelector(state => state.dictionary);
  
  const addLog = (message, data = null, isError = false) => {
    const timestamp = new Date().toISOString();
    setLogs(prevLogs => [
      { timestamp, message, data, isError },
      ...prevLogs.slice(0, 49) // Keep only the last 50 logs
    ]);
  };
  
  const loadDictionaries = async () => {
    setLoading(true);
    setError(null);
    
    try {
      addLog('Bezpośrednie ładowanie słowników...');
      
      // Bezpośrednie pobranie danych z API
      const data = await dictionaryService.getDictionaries();
      
      // Aktualizacja stanu Redux
      dispatch(fetchDictionariesSuccess(data));
      
      const result = {
        departments: data.departments.length,
        groups: data.groups.length,
        serviceTypes: data.serviceTypes.length,
        contractors: data.contractors.length,
        costCategories: data.costCategories.length,
        success: data.departments.length > 0 || data.groups.length > 0 || 
                data.serviceTypes.length > 0 || data.contractors.length > 0 || 
                data.costCategories.length > 0
      };
      
      setResults(prev => ({ ...prev, dictionaries: result }));
      
      addLog('Słowniki załadowane bezpośrednio i zaktualizowane w Redux', result);
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Nieznany błąd';
      setError(`Błąd podczas ładowania słowników: ${errorMessage}`);
      
      const result = {
        error: errorMessage,
        success: false
      };
      
      setResults(prev => ({ ...prev, dictionaries: result }));
      
      addLog(`Błąd podczas ładowania słowników: ${errorMessage}`, err, true);
      
      return result;
    } finally {
      setLoading(false);
    }
  };
  
  const checkReduxState = () => {
    try {
      addLog('Sprawdzanie stanu Redux...');
      
      const result = {
        departments: dictionaryState.departments.length,
        groups: dictionaryState.groups.length,
        serviceTypes: dictionaryState.serviceTypes.length,
        contractors: dictionaryState.contractors.length,
        costCategories: dictionaryState.costCategories.length,
        lastUpdated: dictionaryState.lastUpdated,
        success: dictionaryState.departments.length > 0 || dictionaryState.groups.length > 0 || 
                dictionaryState.serviceTypes.length > 0 || dictionaryState.contractors.length > 0 || 
                dictionaryState.costCategories.length > 0
      };
      
      setResults(prev => ({ ...prev, reduxState: result }));
      
      addLog('Stan Redux sprawdzony', result);
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Nieznany błąd';
      setError(`Błąd podczas sprawdzania stanu Redux: ${errorMessage}`);
      
      const result = {
        error: errorMessage,
        success: false
      };
      
      setResults(prev => ({ ...prev, reduxState: result }));
      
      addLog(`Błąd podczas sprawdzania stanu Redux: ${errorMessage}`, err, true);
      
      return result;
    }
  };
  
  // Sprawdzenie stanu Redux przy pierwszym renderowaniu
  useEffect(() => {
    checkReduxState();
  }, []);
  
  // Sprawdzenie stanu Redux po każdej zmianie dictionaryState
  useEffect(() => {
    if (results.reduxState) {
      checkReduxState();
    }
  }, [dictionaryState]);
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Bezpośrednie ładowanie danych
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={loadDictionaries} 
          disabled={loading}
          sx={{ mr: 2 }}
        >
          {loading ? 'Ładowanie...' : 'Załaduj słowniki bezpośrednio'}
        </Button>
        
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={checkReduxState}
          sx={{ mr: 2 }}
        >
          Sprawdź stan Redux
        </Button>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Bezpośrednio załadowane dane
            </Typography>
            {results.dictionaries ? (
              <Box>
                <Typography variant="body2" color={results.dictionaries.success ? 'success.main' : 'error.main'}>
                  Status: {results.dictionaries.success ? 'Sukces' : 'Błąd'}
                </Typography>
                {results.dictionaries.success ? (
                  <Box>
                    <Typography variant="body2">
                      Oddziały: {results.dictionaries.departments}
                    </Typography>
                    <Typography variant="body2">
                      Grupy: {results.dictionaries.groups}
                    </Typography>
                    <Typography variant="body2">
                      Rodzaje usług: {results.dictionaries.serviceTypes}
                    </Typography>
                    <Typography variant="body2">
                      Kontrahenci: {results.dictionaries.contractors}
                    </Typography>
                    <Typography variant="body2">
                      Kategorie kosztów: {results.dictionaries.costCategories}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="error">
                    {results.dictionaries.error}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Brak wyników
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Stan Redux
            </Typography>
            {results.reduxState ? (
              <Box>
                <Typography variant="body2" color={results.reduxState.success ? 'success.main' : 'error.main'}>
                  Status: {results.reduxState.success ? 'Sukces' : 'Błąd'}
                </Typography>
                {results.reduxState.success ? (
                  <Box>
                    <Typography variant="body2">
                      Oddziały: {results.reduxState.departments}
                    </Typography>
                    <Typography variant="body2">
                      Grupy: {results.reduxState.groups}
                    </Typography>
                    <Typography variant="body2">
                      Rodzaje usług: {results.reduxState.serviceTypes}
                    </Typography>
                    <Typography variant="body2">
                      Kontrahenci: {results.reduxState.contractors}
                    </Typography>
                    <Typography variant="body2">
                      Kategorie kosztów: {results.reduxState.costCategories}
                    </Typography>
                    <Typography variant="body2">
                      Ostatnia aktualizacja: {results.reduxState.lastUpdated ? new Date(results.reduxState.lastUpdated).toLocaleString() : 'Brak'}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="error">
                    {results.reduxState.error}
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Brak wyników
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Logi ({logs.length})
        </Typography>
        <Paper sx={{ p: 2, maxHeight: '400px', overflow: 'auto' }}>
          {logs.map((log, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="caption" color={log.isError ? 'error.main' : 'text.secondary'}>
                {new Date(log.timestamp).toLocaleTimeString()} - {log.message}
              </Typography>
              {log.data && (
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
              <Divider sx={{ my: 1 }} />
            </Box>
          ))}
        </Paper>
      </Box>
    </Box>
  );
};

export default DirectDataLoader;
