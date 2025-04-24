import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, CircularProgress, Alert, Paper, Grid } from '@mui/material';

// Komponent diagnostyczny do bezpośredniego testowania połączenia z API
const ApiDiagnosticTool = () => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);

  // Lista endpointów do przetestowania
  const endpoints = [
    { name: 'Health Check', url: '/api/health' },
    { name: 'Dashboard', url: '/api/dashboard' },
    { name: 'Purchases', url: '/api/purchases' },
    { name: 'Payroll', url: '/api/payroll' },
    { name: 'Sales', url: '/api/sales' },
    { name: 'Dictionary', url: '/api/dictionary' }
  ];

  // Funkcja do bezpośredniego testowania endpointów API
  const testApiEndpoints = async () => {
    setLoading(true);
    setError(null);
    
    const testResults = {};
    let hasError = false;
    
    // Testowanie bezpośredniego połączenia z backendem
    try {
      const directResponse = await fetch('http://localhost:3001/api/health');
      const directData = await directResponse.json();
      testResults.directConnection = {
        status: 'success',
        data: directData
      };
    } catch (err) {
      testResults.directConnection = {
        status: 'error',
        error: err.message
      };
      hasError = true;
    }
    
    // Testowanie połączenia przez proxy NGINX
    try {
      const proxyResponse = await fetch('/api/health');
      const proxyData = await proxyResponse.json();
      testResults.proxyConnection = {
        status: 'success',
        data: proxyData
      };
    } catch (err) {
      testResults.proxyConnection = {
        status: 'error',
        error: err.message
      };
      hasError = true;
    }
    
    // Testowanie wszystkich endpointów API
    for (const endpoint of endpoints) {
      try {
        console.log(`Testowanie endpointu: ${endpoint.url}`);
        const response = await axios.get(endpoint.url);
        testResults[endpoint.name] = {
          status: 'success',
          statusCode: response.status,
          data: response.data
        };
        console.log(`Odpowiedź z ${endpoint.url}:`, response.data);
      } catch (err) {
        console.error(`Błąd podczas testowania ${endpoint.url}:`, err);
        testResults[endpoint.name] = {
          status: 'error',
          statusCode: err.response?.status,
          error: err.message,
          details: err.response?.data
        };
        hasError = true;
      }
    }
    
    setResults(testResults);
    if (hasError) {
      setError('Niektóre testy zakończyły się niepowodzeniem. Sprawdź szczegóły poniżej.');
    }
    setLoading(false);
  };

  useEffect(() => {
    testApiEndpoints();
  }, []);

  const handleRetry = () => {
    testApiEndpoints();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Testowanie połączenia z API...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Narzędzie diagnostyczne API
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <button onClick={handleRetry}>Uruchom testy ponownie</button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bezpośrednie połączenie z backendem
            </Typography>
            <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: '200px' }}>
              {JSON.stringify(results.directConnection, null, 2)}
            </pre>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Połączenie przez proxy NGINX
            </Typography>
            <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: '200px' }}>
              {JSON.stringify(results.proxyConnection, null, 2)}
            </pre>
          </Paper>
        </Grid>
      </Grid>
      
      {endpoints.map((endpoint) => (
        <Paper key={endpoint.name} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {endpoint.name} ({endpoint.url})
          </Typography>
          <Typography variant="body2" color={results[endpoint.name]?.status === 'success' ? 'success.main' : 'error.main'}>
            Status: {results[endpoint.name]?.status} {results[endpoint.name]?.statusCode && `(${results[endpoint.name]?.statusCode})`}
          </Typography>
          <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto', maxHeight: '300px' }}>
            {results[endpoint.name]?.status === 'success'
              ? JSON.stringify(results[endpoint.name]?.data, null, 2)
              : JSON.stringify(results[endpoint.name], null, 2)}
          </pre>
        </Paper>
      ))}
    </Box>
  );
};

export default ApiDiagnosticTool;
