import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Grid, Paper, Divider } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import dataLogger from '../utils/DataLogger';
import purchasesService from '../services/purchasesService';
import payrollService from '../services/payrollService';
import salesService from '../services/salesService';
import dictionaryService from '../services/dictionaryService';
import { fetchDictionariesSuccess } from '../redux/slices/dictionarySlice';
import { fetchPurchasesSuccess } from '../redux/slices/purchasesSlice';
import { fetchPayrollSuccess } from '../redux/slices/payrollSlice';
import { fetchSalesSuccess } from '../redux/slices/salesSlice';

// Komponent do testowania przepływu danych w aplikacji
const DataFlowTester = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  
  // Pobieranie stanu z Redux
  const dictionaryState = useSelector(state => state.dictionary);
  const purchasesState = useSelector(state => state.purchases);
  const payrollState = useSelector(state => state.payroll);
  const salesState = useSelector(state => state.sales);
  
  // Funkcja do testowania przepływu danych słownikowych
  const testDictionaryFlow = async () => {
    setLoading(true);
    setError(null);
    
    try {
      dataLogger.log('DataFlowTester', 'testDictionaryFlow', 'Rozpoczęcie testu przepływu danych słownikowych');
      
      // 1. Bezpośrednie pobranie danych z API
      const directApiData = await dictionaryService.getDictionaries();
      
      // 2. Aktualizacja stanu Redux
      dispatch(fetchDictionariesSuccess(directApiData));
      
      // 3. Sprawdzenie, czy dane są w Redux
      const reduxData = {
        departments: dictionaryState.departments.length,
        groups: dictionaryState.groups.length,
        serviceTypes: dictionaryState.serviceTypes.length,
        contractors: dictionaryState.contractors.length,
        costCategories: dictionaryState.costCategories.length
      };
      
      setTestResults(prev => ({
        ...prev,
        dictionary: {
          directApiData: {
            departments: directApiData.departments.length,
            groups: directApiData.groups.length,
            serviceTypes: directApiData.serviceTypes.length,
            contractors: directApiData.contractors.length,
            costCategories: directApiData.costCategories.length
          },
          reduxData,
          success: 
            directApiData.departments.length > 0 &&
            directApiData.groups.length > 0 &&
            directApiData.serviceTypes.length > 0 &&
            directApiData.contractors.length > 0 &&
            directApiData.costCategories.length > 0
        }
      }));
      
      dataLogger.log('DataFlowTester', 'testDictionaryFlow', 'Test przepływu danych słownikowych zakończony pomyślnie', {
        directApiData: {
          departments: directApiData.departments.length,
          groups: directApiData.groups.length,
          serviceTypes: directApiData.serviceTypes.length,
          contractors: directApiData.contractors.length,
          costCategories: directApiData.costCategories.length
        },
        reduxData
      });
      
      return directApiData;
    } catch (err) {
      dataLogger.error('DataFlowTester', 'testDictionaryFlow', err);
      setError('Błąd podczas testowania przepływu danych słownikowych: ' + err.message);
      
      setTestResults(prev => ({
        ...prev,
        dictionary: {
          error: err.message,
          success: false
        }
      }));
      
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Funkcja do testowania przepływu danych zakupów
  const testPurchasesFlow = async () => {
    setLoading(true);
    setError(null);
    
    try {
      dataLogger.log('DataFlowTester', 'testPurchasesFlow', 'Rozpoczęcie testu przepływu danych zakupów');
      
      // 1. Bezpośrednie pobranie danych z API
      const directApiData = await purchasesService.getPurchases();
      
      // 2. Aktualizacja stanu Redux
      dispatch(fetchPurchasesSuccess(directApiData));
      
      // 3. Sprawdzenie, czy dane są w Redux
      const reduxData = {
        items: purchasesState.purchases.length,
        totalItems: purchasesState.pagination.totalItems
      };
      
      setTestResults(prev => ({
        ...prev,
        purchases: {
          directApiData: {
            items: directApiData.items.length,
            totalItems: directApiData.totalItems
          },
          reduxData,
          success: directApiData.items.length > 0
        }
      }));
      
      dataLogger.log('DataFlowTester', 'testPurchasesFlow', 'Test przepływu danych zakupów zakończony pomyślnie', {
        directApiData: {
          items: directApiData.items.length,
          totalItems: directApiData.totalItems
        },
        reduxData
      });
      
      return directApiData;
    } catch (err) {
      dataLogger.error('DataFlowTester', 'testPurchasesFlow', err);
      setError('Błąd podczas testowania przepływu danych zakupów: ' + err.message);
      
      setTestResults(prev => ({
        ...prev,
        purchases: {
          error: err.message,
          success: false
        }
      }));
      
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Funkcja do testowania przepływu danych wypłat
  const testPayrollFlow = async () => {
    setLoading(true);
    setError(null);
    
    try {
      dataLogger.log('DataFlowTester', 'testPayrollFlow', 'Rozpoczęcie testu przepływu danych wypłat');
      
      // 1. Bezpośrednie pobranie danych z API
      const directApiData = await payrollService.getPayroll();
      
      // 2. Aktualizacja stanu Redux
      dispatch(fetchPayrollSuccess(directApiData));
      
      // 3. Sprawdzenie, czy dane są w Redux
      const reduxData = {
        items: payrollState.payroll.length,
        totalItems: payrollState.pagination.totalItems
      };
      
      setTestResults(prev => ({
        ...prev,
        payroll: {
          directApiData: {
            items: directApiData.items.length,
            totalItems: directApiData.totalItems
          },
          reduxData,
          success: directApiData.items.length > 0
        }
      }));
      
      dataLogger.log('DataFlowTester', 'testPayrollFlow', 'Test przepływu danych wypłat zakończony pomyślnie', {
        directApiData: {
          items: directApiData.items.length,
          totalItems: directApiData.totalItems
        },
        reduxData
      });
      
      return directApiData;
    } catch (err) {
      dataLogger.error('DataFlowTester', 'testPayrollFlow', err);
      setError('Błąd podczas testowania przepływu danych wypłat: ' + err.message);
      
      setTestResults(prev => ({
        ...prev,
        payroll: {
          error: err.message,
          success: false
        }
      }));
      
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Funkcja do testowania przepływu danych sprzedaży
  const testSalesFlow = async () => {
    setLoading(true);
    setError(null);
    
    try {
      dataLogger.log('DataFlowTester', 'testSalesFlow', 'Rozpoczęcie testu przepływu danych sprzedaży');
      
      // 1. Bezpośrednie pobranie danych z API
      const directApiData = await salesService.getSales();
      
      // 2. Aktualizacja stanu Redux
      dispatch(fetchSalesSuccess(directApiData));
      
      // 3. Sprawdzenie, czy dane są w Redux
      const reduxData = {
        items: salesState.sales.length,
        totalItems: salesState.pagination.totalItems
      };
      
      setTestResults(prev => ({
        ...prev,
        sales: {
          directApiData: {
            items: directApiData.items.length,
            totalItems: directApiData.totalItems
          },
          reduxData,
          success: directApiData.items.length > 0
        }
      }));
      
      dataLogger.log('DataFlowTester', 'testSalesFlow', 'Test przepływu danych sprzedaży zakończony pomyślnie', {
        directApiData: {
          items: directApiData.items.length,
          totalItems: directApiData.totalItems
        },
        reduxData
      });
      
      return directApiData;
    } catch (err) {
      dataLogger.error('DataFlowTester', 'testSalesFlow', err);
      setError('Błąd podczas testowania przepływu danych sprzedaży: ' + err.message);
      
      setTestResults(prev => ({
        ...prev,
        sales: {
          error: err.message,
          success: false
        }
      }));
      
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Funkcja do testowania wszystkich przepływów danych
  const testAllDataFlows = async () => {
    setLoading(true);
    setError(null);
    
    try {
      dataLogger.log('DataFlowTester', 'testAllDataFlows', 'Rozpoczęcie testów wszystkich przepływów danych');
      
      await testDictionaryFlow();
      await testPurchasesFlow();
      await testPayrollFlow();
      await testSalesFlow();
      
      dataLogger.log('DataFlowTester', 'testAllDataFlows', 'Testy wszystkich przepływów danych zakończone');
    } catch (err) {
      dataLogger.error('DataFlowTester', 'testAllDataFlows', err);
      setError('Błąd podczas testowania przepływów danych: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Funkcja do pobierania logów
  const fetchLogs = () => {
    const allLogs = dataLogger.getLogs();
    setLogs(allLogs);
  };
  
  // Efekt do pobierania logów co 2 sekundy
  useEffect(() => {
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Tester przepływu danych
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
          onClick={testAllDataFlows} 
          disabled={loading}
          sx={{ mr: 2 }}
        >
          {loading ? 'Testowanie...' : 'Testuj wszystkie przepływy danych'}
        </Button>
        
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={fetchLogs}
          sx={{ mr: 2 }}
        >
          Odśwież logi
        </Button>
      </Box>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Słowniki
            </Typography>
            <Button 
              variant="contained" 
              size="small" 
              onClick={testDictionaryFlow} 
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Testuj przepływ danych słownikowych
            </Button>
            {testResults.dictionary && (
              <Box>
                <Typography variant="body2" color={testResults.dictionary.success ? 'success.main' : 'error.main'}>
                  Status: {testResults.dictionary.success ? 'Sukces' : 'Błąd'}
                </Typography>
                {testResults.dictionary.success ? (
                  <Box>
                    <Typography variant="body2">
                      API: Oddziały: {testResults.dictionary.directApiData.departments}, 
                      Grupy: {testResults.dictionary.directApiData.groups}, 
                      Rodzaje usług: {testResults.dictionary.directApiData.serviceTypes}
                    </Typography>
                    <Typography variant="body2">
                      Redux: Oddziały: {testResults.dictionary.reduxData.departments}, 
                      Grupy: {testResults.dictionary.reduxData.groups}, 
                      Rodzaje usług: {testResults.dictionary.reduxData.serviceTypes}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="error">
                    {testResults.dictionary.error}
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Zakupy
            </Typography>
            <Button 
              variant="contained" 
              size="small" 
              onClick={testPurchasesFlow} 
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Testuj przepływ danych zakupów
            </Button>
            {testResults.purchases && (
              <Box>
                <Typography variant="body2" color={testResults.purchases.success ? 'success.main' : 'error.main'}>
                  Status: {testResults.purchases.success ? 'Sukces' : 'Błąd'}
                </Typography>
                {testResults.purchases.success ? (
                  <Box>
                    <Typography variant="body2">
                      API: Liczba rekordów: {testResults.purchases.directApiData.items} / {testResults.purchases.directApiData.totalItems}
                    </Typography>
                    <Typography variant="body2">
                      Redux: Liczba rekordów: {testResults.purchases.reduxData.items} / {testResults.purchases.reduxData.totalItems}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="error">
                    {testResults.purchases.error}
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Wypłaty
            </Typography>
            <Button 
              variant="contained" 
              size="small" 
              onClick={testPayrollFlow} 
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Testuj przepływ danych wypłat
            </Button>
            {testResults.payroll && (
              <Box>
                <Typography variant="body2" color={testResults.payroll.success ? 'success.main' : 'error.main'}>
                  Status: {testResults.payroll.success ? 'Sukces' : 'Błąd'}
                </Typography>
                {testResults.payroll.success ? (
                  <Box>
                    <Typography variant="body2">
                      API: Liczba rekordów: {testResults.payroll.directApiData.items} / {testResults.payroll.directApiData.totalItems}
                    </Typography>
                    <Typography variant="body2">
                      Redux: Liczba rekordów: {testResults.payroll.reduxData.items} / {testResults.payroll.reduxData.totalItems}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="error">
                    {testResults.payroll.error}
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sprzedaż
            </Typography>
            <Button 
              variant="contained" 
              size="small" 
              onClick={testSalesFlow} 
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Testuj przepływ danych sprzedaży
            </Button>
            {testResults.sales && (
              <Box>
                <Typography variant="body2" color={testResults.sales.success ? 'success.main' : 'error.main'}>
                  Status: {testResults.sales.success ? 'Sukces' : 'Błąd'}
                </Typography>
                {testResults.sales.success ? (
                  <Box>
                    <Typography variant="body2">
                      API: Liczba rekordów: {testResults.sales.directApiData.items} / {testResults.sales.directApiData.totalItems}
                    </Typography>
                    <Typography variant="body2">
                      Redux: Liczba rekordów: {testResults.sales.reduxData.items} / {testResults.sales.reduxData.totalItems}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="error">
                    {testResults.sales.error}
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Logi ({logs.length})
        </Typography>
        <Paper sx={{ p: 2, maxHeight: '400px', overflow: 'auto' }}>
          {logs.slice(-50).reverse().map((log, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {new Date(log.timestamp).toLocaleTimeString()} - [{log.source}] {log.action} ({log.level})
              </Typography>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(log.data || log.error || {}, null, 2)}
              </pre>
              <Divider sx={{ my: 1 }} />
            </Box>
          ))}
        </Paper>
      </Box>
    </Box>
  );
};

export default DataFlowTester;
