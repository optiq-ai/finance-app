import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Alert, CircularProgress, Paper, Grid, Divider } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api';

const ApiDiagnosticTool = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  
  const addLog = (message, data = null, isError = false) => {
    const timestamp = new Date().toISOString();
    setLogs(prevLogs => [
      { timestamp, message, data, isError },
      ...prevLogs.slice(0, 49) // Keep only the last 50 logs
    ]);
  };
  
  const testDictionaryEndpoint = async () => {
    setLoading(true);
    setError(null);
    
    try {
      addLog('Testowanie endpointu /api/dictionary...');
      
      const response = await api.get('/dictionary');
      
      const data = response.data || {};
      const departments = Array.isArray(data.departments) ? data.departments : [];
      const groups = Array.isArray(data.groups) ? data.groups : [];
      const serviceTypes = Array.isArray(data.serviceTypes) ? data.serviceTypes : [];
      const contractors = Array.isArray(data.contractors) ? data.contractors : [];
      const costCategories = Array.isArray(data.costCategories) ? data.costCategories : [];
      
      const result = {
        status: response.status,
        departments: departments.length,
        groups: groups.length,
        serviceTypes: serviceTypes.length,
        contractors: contractors.length,
        costCategories: costCategories.length,
        success: departments.length > 0 || groups.length > 0 || serviceTypes.length > 0 || 
                contractors.length > 0 || costCategories.length > 0
      };
      
      setResults(prev => ({ ...prev, dictionary: result }));
      
      addLog(`Test endpointu /api/dictionary zakończony: status ${response.status}`, {
        departments: departments.length,
        groups: groups.length,
        serviceTypes: serviceTypes.length,
        contractors: contractors.length,
        costCategories: costCategories.length
      });
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Nieznany błąd';
      setError(`Błąd podczas testowania endpointu /api/dictionary: ${errorMessage}`);
      
      const result = {
        status: err.response?.status || 500,
        error: errorMessage,
        success: false
      };
      
      setResults(prev => ({ ...prev, dictionary: result }));
      
      addLog(`Błąd podczas testowania endpointu /api/dictionary: ${errorMessage}`, 
        err.response?.data || err, true);
      
      return result;
    } finally {
      setLoading(false);
    }
  };
  
  const testPurchasesEndpoint = async () => {
    setLoading(true);
    setError(null);
    
    try {
      addLog('Testowanie endpointu /api/purchases...');
      
      const response = await api.get('/purchases');
      
      const data = response.data || {};
      const items = Array.isArray(data.items) ? data.items : [];
      
      const result = {
        status: response.status,
        totalItems: data.totalItems || 0,
        items: items.length,
        success: items.length > 0
      };
      
      setResults(prev => ({ ...prev, purchases: result }));
      
      addLog(`Test endpointu /api/purchases zakończony: status ${response.status}`, {
        totalItems: data.totalItems,
        items: items.length
      });
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Nieznany błąd';
      setError(`Błąd podczas testowania endpointu /api/purchases: ${errorMessage}`);
      
      const result = {
        status: err.response?.status || 500,
        error: errorMessage,
        success: false
      };
      
      setResults(prev => ({ ...prev, purchases: result }));
      
      addLog(`Błąd podczas testowania endpointu /api/purchases: ${errorMessage}`, 
        err.response?.data || err, true);
      
      return result;
    } finally {
      setLoading(false);
    }
  };
  
  const testPayrollEndpoint = async () => {
    setLoading(true);
    setError(null);
    
    try {
      addLog('Testowanie endpointu /api/payroll...');
      
      const response = await api.get('/payroll');
      
      const data = response.data || {};
      const items = Array.isArray(data.items) ? data.items : [];
      
      const result = {
        status: response.status,
        totalItems: data.totalItems || 0,
        items: items.length,
        success: items.length > 0
      };
      
      setResults(prev => ({ ...prev, payroll: result }));
      
      addLog(`Test endpointu /api/payroll zakończony: status ${response.status}`, {
        totalItems: data.totalItems,
        items: items.length
      });
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Nieznany błąd';
      setError(`Błąd podczas testowania endpointu /api/payroll: ${errorMessage}`);
      
      const result = {
        status: err.response?.status || 500,
        error: errorMessage,
        success: false
      };
      
      setResults(prev => ({ ...prev, payroll: result }));
      
      addLog(`Błąd podczas testowania endpointu /api/payroll: ${errorMessage}`, 
        err.response?.data || err, true);
      
      return result;
    } finally {
      setLoading(false);
    }
  };
  
  const testSalesEndpoint = async () => {
    setLoading(true);
    setError(null);
    
    try {
      addLog('Testowanie endpointu /api/sales...');
      
      const response = await api.get('/sales');
      
      const data = response.data || {};
      const items = Array.isArray(data.items) ? data.items : [];
      
      const result = {
        status: response.status,
        totalItems: data.totalItems || 0,
        items: items.length,
        success: items.length > 0
      };
      
      setResults(prev => ({ ...prev, sales: result }));
      
      addLog(`Test endpointu /api/sales zakończony: status ${response.status}`, {
        totalItems: data.totalItems,
        items: items.length
      });
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Nieznany błąd';
      setError(`Błąd podczas testowania endpointu /api/sales: ${errorMessage}`);
      
      const result = {
        status: err.response?.status || 500,
        error: errorMessage,
        success: false
      };
      
      setResults(prev => ({ ...prev, sales: result }));
      
      addLog(`Błąd podczas testowania endpointu /api/sales: ${errorMessage}`, 
        err.response?.data || err, true);
      
      return result;
    } finally {
      setLoading(false);
    }
  };
  
  const testAllEndpoints = async () => {
    setLoading(true);
    setError(null);
    
    try {
      addLog('Testowanie wszystkich endpointów API...');
      
      await testDictionaryEndpoint();
      await testPurchasesEndpoint();
      await testPayrollEndpoint();
      await testSalesEndpoint();
      
      addLog('Testy wszystkich endpointów zakończone');
    } catch (err) {
      const errorMessage = err.message || 'Nieznany błąd';
      setError(`Błąd podczas testowania endpointów: ${errorMessage}`);
      
      addLog(`Błąd podczas testowania endpointów: ${errorMessage}`, err, true);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Diagnostyka API
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
          onClick={testAllEndpoints} 
          disabled={loading}
          sx={{ mr: 2 }}
        >
          {loading ? 'Testowanie...' : 'Testuj wszystkie endpointy'}
        </Button>
        
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={testDictionaryEndpoint}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          Testuj słowniki
        </Button>
        
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={testPurchasesEndpoint}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          Testuj zakupy
        </Button>
        
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={testPayrollEndpoint}
          disabled={loading}
          sx={{ mr: 2 }}
        >
          Testuj wypłaty
        </Button>
        
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={testSalesEndpoint}
          disabled={loading}
        >
          Testuj sprzedaż
        </Button>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Słowniki
            </Typography>
            {results.dictionary ? (
              <Box>
                <Typography variant="body2" color={results.dictionary.success ? 'success.main' : 'error.main'}>
                  Status: {results.dictionary.status} ({results.dictionary.success ? 'Sukces' : 'Błąd'})
                </Typography>
                {results.dictionary.success ? (
                  <Box>
                    <Typography variant="body2">
                      Oddziały: {results.dictionary.departments}
                    </Typography>
                    <Typography variant="body2">
                      Grupy: {results.dictionary.groups}
                    </Typography>
                    <Typography variant="body2">
                      Rodzaje usług: {results.dictionary.serviceTypes}
                    </Typography>
                    <Typography variant="body2">
                      Kontrahenci: {results.dictionary.contractors}
                    </Typography>
                    <Typography variant="body2">
                      Kategorie kosztów: {results.dictionary.costCategories}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="error">
                    {results.dictionary.error}
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
              Zakupy
            </Typography>
            {results.purchases ? (
              <Box>
                <Typography variant="body2" color={results.purchases.success ? 'success.main' : 'error.main'}>
                  Status: {results.purchases.status} ({results.purchases.success ? 'Sukces' : 'Błąd'})
                </Typography>
                {results.purchases.success ? (
                  <Box>
                    <Typography variant="body2">
                      Liczba rekordów: {results.purchases.items} / {results.purchases.totalItems}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="error">
                    {results.purchases.error}
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
              Wypłaty
            </Typography>
            {results.payroll ? (
              <Box>
                <Typography variant="body2" color={results.payroll.success ? 'success.main' : 'error.main'}>
                  Status: {results.payroll.status} ({results.payroll.success ? 'Sukces' : 'Błąd'})
                </Typography>
                {results.payroll.success ? (
                  <Box>
                    <Typography variant="body2">
                      Liczba rekordów: {results.payroll.items} / {results.payroll.totalItems}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="error">
                    {results.payroll.error}
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
              Sprzedaż
            </Typography>
            {results.sales ? (
              <Box>
                <Typography variant="body2" color={results.sales.success ? 'success.main' : 'error.main'}>
                  Status: {results.sales.status} ({results.sales.success ? 'Sukces' : 'Błąd'})
                </Typography>
                {results.sales.success ? (
                  <Box>
                    <Typography variant="body2">
                      Liczba rekordów: {results.sales.items} / {results.sales.totalItems}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="error">
                    {results.sales.error}
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

export default ApiDiagnosticTool;
