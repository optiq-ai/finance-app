import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import dictionaryService from '../services/dictionaryService';
import purchasesService from '../services/purchasesService';
import payrollService from '../services/payrollService';
import salesService from '../services/salesService';
import { fetchDictionariesSuccess } from '../redux/slices/dictionarySlice';
import { fetchPurchasesSuccess } from '../redux/slices/purchasesSlice';
import { fetchPayrollSuccess } from '../redux/slices/payrollSlice';
import { fetchSalesSuccess } from '../redux/slices/salesSlice';

const MaintenancePage = () => {
  const dispatch = useDispatch();
  
  const loadAllData = async () => {
    try {
      // Ładowanie słowników
      const dictionaries = await dictionaryService.getDictionaries();
      dispatch(fetchDictionariesSuccess(dictionaries));
      
      // Ładowanie zakupów
      const purchases = await purchasesService.getPurchases();
      dispatch(fetchPurchasesSuccess(purchases));
      
      // Ładowanie wypłat
      const payroll = await payrollService.getPayroll();
      dispatch(fetchPayrollSuccess(payroll));
      
      // Ładowanie sprzedaży
      const sales = await salesService.getSales();
      dispatch(fetchSalesSuccess(sales));
      
      alert('Wszystkie dane zostały załadowane pomyślnie!');
    } catch (error) {
      alert(`Błąd podczas ładowania danych: ${error.message}`);
      console.error('Błąd podczas ładowania danych:', error);
    }
  };
  
  const loadDictionaries = async () => {
    try {
      const dictionaries = await dictionaryService.getDictionaries();
      dispatch(fetchDictionariesSuccess(dictionaries));
      alert(`Słowniki zostały załadowane pomyślnie! Oddziały: ${dictionaries.departments.length}, Grupy: ${dictionaries.groups.length}, Rodzaje usług: ${dictionaries.serviceTypes.length}, Kontrahenci: ${dictionaries.contractors.length}, Kategorie kosztów: ${dictionaries.costCategories.length}`);
    } catch (error) {
      alert(`Błąd podczas ładowania słowników: ${error.message}`);
      console.error('Błąd podczas ładowania słowników:', error);
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Strona konserwacyjna
        </Typography>
        
        <Typography variant="body1" paragraph>
          Ta strona zawiera narzędzia do konserwacji i naprawy aplikacji. Użyj poniższych przycisków, aby rozwiązać problemy z ładowaniem danych.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Szybkie naprawy
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  onClick={loadAllData}
                  sx={{ mb: 2 }}
                >
                  Załaduj wszystkie dane
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="primary" 
                  fullWidth
                  onClick={loadDictionaries}
                >
                  Załaduj tylko słowniki
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Narzędzia diagnostyczne
              </Typography>
              
              <Box>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  fullWidth
                  component={Link}
                  to="/app/diagnostic"
                  sx={{ mb: 2 }}
                >
                  Otwórz narzędzia diagnostyczne
                </Button>
                
                <Typography variant="body2" color="text.secondary">
                  Narzędzia diagnostyczne pozwalają na szczegółowe testowanie API, bezpośrednie ładowanie danych i testowanie przepływu danych.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Instrukcje rozwiązywania problemów
          </Typography>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Problem: Brak danych w aplikacji
            </Typography>
            
            <Typography variant="body1" paragraph>
              Jeśli w aplikacji nie są wyświetlane żadne dane, wykonaj następujące kroki:
            </Typography>
            
            <ol>
              <li>
                <Typography variant="body1" paragraph>
                  Kliknij przycisk "Załaduj wszystkie dane" powyżej. To spróbuje załadować wszystkie dane bezpośrednio do Redux.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  Jeśli to nie pomoże, kliknij przycisk "Załaduj tylko słowniki". Słowniki są niezbędne do poprawnego wyświetlania danych w innych sekcjach.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  Jeśli nadal występują problemy, otwórz narzędzia diagnostyczne i użyj zakładki "Diagnostyka API" aby sprawdzić, czy API działa poprawnie.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  Użyj zakładki "Bezpośrednie ładowanie danych" aby ręcznie załadować dane do Redux.
                </Typography>
              </li>
              <li>
                <Typography variant="body1" paragraph>
                  Użyj zakładki "Tester przepływu danych" aby przetestować cały przepływ danych od API do Redux.
                </Typography>
              </li>
            </ol>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default MaintenancePage;
