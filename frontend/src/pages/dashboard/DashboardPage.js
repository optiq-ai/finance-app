import React, { useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import {
  fetchDashboardDataStart,
  fetchDashboardDataSuccess,
  fetchDashboardDataFailure
} from '../../redux/slices/dashboardSlice';
import dashboardService from '../../services/dashboardService';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { kpis, charts, loading, error, filters } = useSelector((state) => state.dashboard);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        dispatch(fetchDashboardDataStart());
        const data = await dashboardService.getDashboardData(filters);
        dispatch(fetchDashboardDataSuccess(data));
      } catch (err) {
        dispatch(fetchDashboardDataFailure(err.message));
      }
    };

    fetchDashboardData();
  }, [dispatch, filters]);

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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardHeader title="Przychody" />
            <CardContent>
              <Typography variant="h4">{kpis.totalRevenue.toLocaleString()} zł</Typography>
              <Typography variant="body2" color="text.secondary">
                Średnio: {kpis.averageRevenue.toLocaleString()} zł
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardHeader title="Koszty" />
            <CardContent>
              <Typography variant="h4">{kpis.totalCosts.toLocaleString()} zł</Typography>
              <Typography variant="body2" color="text.secondary">
                Średnio: {kpis.averageCost.toLocaleString()} zł
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardHeader title="Zysk" />
            <CardContent>
              <Typography variant="h4">{kpis.totalProfit.toLocaleString()} zł</Typography>
              <Typography variant="body2" color="text.secondary">
                Marża: {kpis.profitMargin.toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Przychody i koszty miesięcznie
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Wykres zostanie wygenerowany po załadowaniu danych
              </Typography>
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
              <Typography variant="body2" color="text.secondary">
                Wykres zostanie wygenerowany po załadowaniu danych
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
