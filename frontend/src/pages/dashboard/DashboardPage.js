import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  fetchDashboardDataStart,
  fetchDashboardDataSuccess,
  fetchDashboardDataFailure,
  updateDashboardFilters
} from '../../redux/slices/dashboardSlice';
import { resetDataRefreshNeeded } from '../../redux/slices/uploadSlice';
import dashboardService from '../../services/dashboardService';
import { formatCurrency, formatPercentage } from '../../utils/numberUtils';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { kpis, charts, comparisons, loading, error, filters } = useSelector((state) => state.dashboard || {});
  const { departments = [] } = useSelector((state) => state.dictionary || {});
  const { dataRefreshNeeded } = useSelector((state) => state.upload);
  const [refreshAlert, setRefreshAlert] = useState(false);

  // Funkcja do pobierania danych dashboardu
  const fetchDashboardData = async () => {
    try {
      dispatch(fetchDashboardDataStart());
      console.log('Pobieranie danych dashboardu z filtrami:', filters);
      const data = await dashboardService.getDashboardData(filters);
      console.log('Otrzymane dane dashboardu:', data);
      dispatch(fetchDashboardDataSuccess(data));
      
      // Jeśli odświeżenie było spowodowane nowym uploadem, pokazujemy alert
      if (dataRefreshNeeded) {
        setRefreshAlert(true);
        setTimeout(() => setRefreshAlert(false), 5000); // Ukryj alert po 5 sekundach
      }
    } catch (err) {
      console.error('Błąd podczas pobierania danych dashboardu:', err);
      dispatch(fetchDashboardDataFailure(err?.message || 'Wystąpił błąd podczas pobierania danych'));
    }
  };

  // Efekt do pobierania danych przy zmianie filtrów
  useEffect(() => {
    fetchDashboardData();
  }, [dispatch, filters]);

  // Efekt do odświeżania danych po uploadzie
  useEffect(() => {
    if (dataRefreshNeeded) {
      console.log('Odświeżanie danych dashboardu po uploadzie...');
      fetchDashboardData();
      dispatch(resetDataRefreshNeeded());
    }
  }, [dataRefreshNeeded, dispatch]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateDashboardFilters({ [name]: value }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error" variant="h6">
          Wystąpił błąd: {error}
        </Typography>
      </Box>
    );
  }

  // Bezpieczne wartości domyślne dla KPI
  const totalRevenue = kpis?.totalRevenue || 0;
  const averageRevenue = kpis?.averageRevenue || 0;
  const totalCosts = kpis?.totalCosts || 0;
  const averageCost = kpis?.averageCost || 0;
  const totalProfit = kpis?.totalProfit || 0;
  const profitMargin = kpis?.profitMargin || 0;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {refreshAlert && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setRefreshAlert(false)}>
          Dane zostały zaktualizowane po przesłaniu nowego pliku.
        </Alert>
      )}
      
      {/* Filtry */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="department-label">Oddział</InputLabel>
              <Select
                labelId="department-label"
                name="department"
                value={filters?.department || ''}
                label="Oddział"
                onChange={handleFilterChange}
              >
                <MenuItem value="">Wszystkie</MenuItem>
                {Array.isArray(departments) && departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="comparison-period-label">Okres porównawczy</InputLabel>
              <Select
                labelId="comparison-period-label"
                name="comparisonPeriod"
                value={filters?.comparisonPeriod || 'month'}
                label="Okres porównawczy"
                onChange={handleFilterChange}
              >
                <MenuItem value="month">Miesiąc</MenuItem>
                <MenuItem value="quarter">Kwartał</MenuItem>
                <MenuItem value="year">Rok</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardHeader title="Przychody" />
            <CardContent>
              <Typography variant="h4">{formatCurrency(totalRevenue)}</Typography>
              <Typography variant="body2" color="text.secondary">
                Średnio: {formatCurrency(averageRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardHeader title="Koszty" />
            <CardContent>
              <Typography variant="h4">{formatCurrency(totalCosts)}</Typography>
              <Typography variant="body2" color="text.secondary">
                Średnio: {formatCurrency(averageCost)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardHeader title="Zysk" />
            <CardContent>
              <Typography variant="h4">{formatCurrency(totalProfit)}</Typography>
              <Typography variant="body2" color="text.secondary">
                Marża: {formatPercentage(profitMargin)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Comparison Cards */}
      <Typography variant="h5" gutterBottom>
        Porównanie okresów
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardHeader title={`Bieżący okres: ${comparisons?.currentPeriod?.label || '-'}`} />
            <CardContent>
              <Typography variant="body1">
                Przychody: {formatCurrency(comparisons?.currentPeriod?.sales || 0)}
              </Typography>
              <Typography variant="body1">
                Koszty: {formatCurrency(comparisons?.currentPeriod?.purchases || 0)}
              </Typography>
              <Typography variant="body1">
                Wypłaty: {formatCurrency(comparisons?.currentPeriod?.payroll || 0)}
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                Wynik: {formatCurrency(comparisons?.currentPeriod?.result || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardHeader title={`Poprzedni okres: ${comparisons?.previousPeriod?.label || '-'}`} />
            <CardContent>
              <Typography variant="body1">
                Przychody: {formatCurrency(comparisons?.previousPeriod?.sales || 0)}
              </Typography>
              <Typography variant="body1">
                Koszty: {formatCurrency(comparisons?.previousPeriod?.purchases || 0)}
              </Typography>
              <Typography variant="body1">
                Wypłaty: {formatCurrency(comparisons?.previousPeriod?.payroll || 0)}
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                Wynik: {formatCurrency(comparisons?.previousPeriod?.result || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Typography variant="h5" gutterBottom>
        Wykresy
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Przychody i koszty miesięcznie
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {charts?.revenueByMonth?.length > 0 ? (
                <Typography>
                  Dane dostępne: {charts.revenueByMonth.length} miesięcy
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Wykres zostanie wygenerowany po załadowaniu danych
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Zysk według oddziałów
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {charts?.profitByDepartment?.length > 0 ? (
                <Typography>
                  Dane dostępne: {charts.profitByDepartment.length} oddziałów
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Wykres zostanie wygenerowany po załadowaniu danych
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
