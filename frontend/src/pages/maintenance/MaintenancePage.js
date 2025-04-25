import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Typography, Alert, CircularProgress, Grid } from '@mui/material';
import api from '../../services/api';

const MaintenancePage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSeedDictionaries = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const response = await api.post('/api/maintenance/populate-dictionaries');
      setResult(response.data);
      console.log('Wynik importu słowników:', response.data);
    } catch (err) {
      console.error('Błąd podczas importu słowników:', err);
      setError(err.response?.data?.message || err.message || 'Nieznany błąd');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Konserwacja systemu
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Import danych słownikowych
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Ta operacja zaimportuje dane słownikowe z plików Excel. Operacja jest bezpieczna i nie nadpisze istniejących danych, jeśli słowniki są już wypełnione.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSeedDictionaries}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Importuj dane słownikowe'}
              </Button>
              
              {result && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {result.message}
                  {result.counts && (
                    <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                      Zaimportowano:
                      <ul>
                        <li>Departamenty: {result.counts.departments}</li>
                        <li>Grupy: {result.counts.groups}</li>
                        <li>Rodzaje usług: {result.counts.serviceTypes}</li>
                        <li>Kontrahenci: {result.counts.contractors}</li>
                        <li>Kategorie kosztów: {result.counts.costCategories}</li>
                      </ul>
                    </Typography>
                  )}
                </Alert>
              )}
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Błąd: {error}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MaintenancePage;
