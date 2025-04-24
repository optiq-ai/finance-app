import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Button, Grid, Paper } from '@mui/material';
import api from '../services/api';
import ApiDiagnosticTool from '../components/ApiDiagnosticTool';
import { useDispatch } from 'react-redux';
import { fetchDictionariesSuccess } from '../redux/slices/dictionarySlice';
import { fetchPurchasesSuccess } from '../redux/slices/purchasesSlice';
import { fetchPayrollSuccess } from '../redux/slices/payrollSlice';
import { fetchSalesSuccess } from '../redux/slices/salesSlice';

// Komponent do bezpośredniego ładowania danych z pominięciem standardowych serwisów
const DirectDataLoader = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [error, setError] = useState(null);

  // Funkcja do bezpośredniego ładowania danych słownikowych
  const loadDictionaries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Bezpośrednie ładowanie danych słownikowych...');
      const response = await api.get('/dictionary');
      console.log('Otrzymane dane słownikowe:', response.data);
      
      // Sprawdzenie, czy dane są w oczekiwanym formacie
      const data = response.data || {};
      
      // Przygotuj domyślne wartości dla każdego słownika
      const departments = Array.isArray(data.departments) ? data.departments : [];
      const groups = Array.isArray(data.groups) ? data.groups : [];
      const serviceTypes = Array.isArray(data.serviceTypes) ? data.serviceTypes : [];
      const contractors = Array.isArray(data.contractors) ? data.contractors : [];
      const costCategories = Array.isArray(data.costCategories) ? data.costCategories : [];
      
      // Formatowanie danych
      const formattedData = {
        departments,
        groups,
        serviceTypes,
        contractors,
        costCategories
      };
      
      // Aktualizacja stanu Redux
      dispatch(fetchDictionariesSuccess(formattedData));
      
      setResults(prev => ({
        ...prev,
        dictionaries: {
          status: 'success',
          data: formattedData
        }
      }));
      
      return formattedData;
    } catch (err) {
      console.error('Błąd podczas ładowania danych słownikowych:', err);
      setError('Błąd podczas ładowania danych słownikowych: ' + err.message);
      
      setResults(prev => ({
        ...prev,
        dictionaries: {
          status: 'error',
          error: err.message
        }
      }));
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do bezpośredniego ładowania danych zakupów
  const loadPurchases = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Bezpośrednie ładowanie danych zakupów...');
      const response = await api.get('/purchases');
      console.log('Otrzymane dane zakupów:', response.data);
      
      // Sprawdzenie, czy dane są w oczekiwanym formacie
      const data = response.data || {};
      const items = Array.isArray(data.items) ? data.items : [];
      
      // Formatowanie danych
      const formattedData = {
        items,
        totalItems: data.totalItems || 0,
        page: data.page || 0,
        pageSize: data.pageSize || 10,
        totalPages: data.totalPages || 0
      };
      
      // Aktualizacja stanu Redux
      dispatch(fetchPurchasesSuccess(formattedData));
      
      setResults(prev => ({
        ...prev,
        purchases: {
          status: 'success',
          data: formattedData
        }
      }));
      
      return formattedData;
    } catch (err) {
      console.error('Błąd podczas ładowania danych zakupów:', err);
      setError('Błąd podczas ładowania danych zakupów: ' + err.message);
      
      setResults(prev => ({
        ...prev,
        purchases: {
          status: 'error',
          error: err.message
        }
      }));
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do bezpośredniego ładowania danych wypłat
  const loadPayroll = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Bezpośrednie ładowanie danych wypłat...');
      const response = await api.get('/payroll');
      console.log('Otrzymane dane wypłat:', response.data);
      
      // Sprawdzenie, czy dane są w oczekiwanym formacie
      const data = response.data || {};
      const items = Array.isArray(data.items) ? data.items : [];
      
      // Formatowanie danych
      const formattedData = {
        items,
        totalItems: data.totalItems || 0,
        page: data.page || 0,
        pageSize: data.pageSize || 10,
        totalPages: data.totalPages || 0
      };
      
      // Aktualizacja stanu Redux
      dispatch(fetchPayrollSuccess(formattedData));
      
      setResults(prev => ({
        ...prev,
        payroll: {
          status: 'success',
          data: formattedData
        }
      }));
      
      return formattedData;
    } catch (err) {
      console.error('Błąd podczas ładowania danych wypłat:', err);
      setError('Błąd podczas ładowania danych wypłat: ' + err.message);
      
      setResults(prev => ({
        ...prev,
        payroll: {
          status: 'error',
          error: err.message
        }
      }));
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do bezpośredniego ładowania danych sprzedaży
  const loadSales = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Bezpośrednie ładowanie danych sprzedaży...');
      const response = await api.get('/sales');
      console.log('Otrzymane dane sprzedaży:', response.data);
      
      // Sprawdzenie, czy dane są w oczekiwanym formacie
      const data = response.data || {};
      const items = Array.isArray(data.items) ? data.items : [];
      
      // Formatowanie danych
      const formattedData = {
        items,
        totalItems: data.totalItems || 0,
        page: data.page || 0,
        pageSize: data.pageSize || 10,
        totalPages: data.totalPages || 0
      };
      
      // Aktualizacja stanu Redux
      dispatch(fetchSalesSuccess(formattedData));
      
      setResults(prev => ({
        ...prev,
        sales: {
          status: 'success',
          data: formattedData
        }
      }));
      
      return formattedData;
    } catch (err) {
      console.error('Błąd podczas ładowania danych sprzedaży:', err);
      setError('Błąd podczas ładowania danych sprzedaży: ' + err.message);
      
      setResults(prev => ({
        ...prev,
        sales: {
          status: 'error',
          error: err.message
        }
      }));
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do ładowania wszystkich danych
  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await loadDictionaries();
      await loadPurchases();
      await loadPayroll();
      await loadSales();
      
      console.log('Wszystkie dane zostały załadowane pomyślnie.');
    } catch (err) {
      console.error('Błąd podczas ładowania danych:', err);
      setError('Błąd podczas ładowania danych: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

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
          onClick={loadAllData} 
          disabled={loading}
          sx={{ mr: 2 }}
        >
          {loading ? 'Ładowanie...' : 'Załaduj wszystkie dane'}
        </Button>
        
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => setShowDiagnostic(!showDiagnostic)}
          sx={{ mr: 2 }}
        >
          {showDiagnostic ? 'Ukryj narzędzie diagnostyczne' : 'Pokaż narzędzie diagnostyczne'}
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
              onClick={loadDictionaries} 
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Załaduj słowniki
            </Button>
            {results.dictionaries && (
              <Box>
                <Typography variant="body2" color={results.dictionaries.status === 'success' ? 'success.main' : 'error.main'}>
                  Status: {results.dictionaries.status}
                </Typography>
                {results.dictionaries.status === 'success' && (
                  <Box>
                    <Typography variant="body2">
                      Oddziały: {results.dictionaries.data.departments.length}
                    </Typography>
                    <Typography variant="body2">
                      Grupy: {results.dictionaries.data.groups.length}
                    </Typography>
                    <Typography variant="body2">
                      Rodzaje usług: {results.dictionaries.data.serviceTypes.length}
                    </Typography>
                    <Typography variant="body2">
                      Kontrahenci: {results.dictionaries.data.contractors.length}
                    </Typography>
                    <Typography variant="body2">
                      Kategorie kosztów: {results.dictionaries.data.costCategories.length}
                    </Typography>
                  </Box>
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
              onClick={loadPurchases} 
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Załaduj zakupy
            </Button>
            {results.purchases && (
              <Box>
                <Typography variant="body2" color={results.purchases.status === 'success' ? 'success.main' : 'error.main'}>
                  Status: {results.purchases.status}
                </Typography>
                {results.purchases.status === 'success' && (
                  <Typography variant="body2">
                    Liczba rekordów: {results.purchases.data.items.length} / {results.purchases.data.totalItems}
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
              onClick={loadPayroll} 
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Załaduj wypłaty
            </Button>
            {results.payroll && (
              <Box>
                <Typography variant="body2" color={results.payroll.status === 'success' ? 'success.main' : 'error.main'}>
                  Status: {results.payroll.status}
                </Typography>
                {results.payroll.status === 'success' && (
                  <Typography variant="body2">
                    Liczba rekordów: {results.payroll.data.items.length} / {results.payroll.data.totalItems}
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
              onClick={loadSales} 
              disabled={loading}
              sx={{ mb: 2 }}
            >
              Załaduj sprzedaż
            </Button>
            {results.sales && (
              <Box>
                <Typography variant="body2" color={results.sales.status === 'success' ? 'success.main' : 'error.main'}>
                  Status: {results.sales.status}
                </Typography>
                {results.sales.status === 'success' && (
                  <Typography variant="body2">
                    Liczba rekordów: {results.sales.data.items.length} / {results.sales.data.totalItems}
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {showDiagnostic && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Narzędzie diagnostyczne API
          </Typography>
          <ApiDiagnosticTool />
        </Box>
      )}
    </Box>
  );
};

export default DirectDataLoader;
