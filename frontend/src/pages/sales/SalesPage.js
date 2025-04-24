import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Divider,
  Alert
} from '@mui/material';
import {
  fetchSalesStart,
  fetchSalesSuccess,
  fetchSalesFailure,
  updateFilters,
  updatePagination,
  resetFilters
} from '../../redux/slices/salesSlice';
import { resetDataRefreshNeeded } from '../../redux/slices/uploadSlice';
import salesService from '../../services/salesService';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency, formatNumber } from '../../utils/numberUtils';

const SalesPage = () => {
  const dispatch = useDispatch();
  const { sales, filteredSales, loading, error, filters, pagination } = useSelector((state) => state.sales);
  const { departments = [], groups = [], serviceTypes = [], contractors = [] } = useSelector((state) => state.dictionary || {});
  const { dataRefreshNeeded, lastUploadType } = useSelector((state) => state.upload);
  const [refreshAlert, setRefreshAlert] = useState(false);
  
  // Pobieranie danych sprzedaży
  const fetchSalesData = async () => {
    try {
      console.log('Pobieranie danych sprzedaży z filtrami:', filters);
      dispatch(fetchSalesStart());
      const data = await salesService.getSales(filters, pagination);
      console.log('Otrzymane dane sprzedaży:', data);
      dispatch(fetchSalesSuccess(data));
      
      // Jeśli odświeżenie było spowodowane nowym uploadem, pokazujemy alert
      if (dataRefreshNeeded && (lastUploadType === 'sale' || lastUploadType === null)) {
        setRefreshAlert(true);
        setTimeout(() => setRefreshAlert(false), 5000); // Ukryj alert po 5 sekundach
      }
    } catch (err) {
      console.error('Błąd podczas pobierania danych sprzedaży:', err);
      dispatch(fetchSalesFailure(err.message));
    }
  };

  // Efekt do pobierania danych przy zmianie filtrów lub paginacji
  useEffect(() => {
    fetchSalesData();
  }, [dispatch, filters, pagination.page, pagination.pageSize]);

  // Efekt do odświeżania danych po uploadzie
  useEffect(() => {
    if (dataRefreshNeeded && (lastUploadType === 'sale' || lastUploadType === null)) {
      console.log('Odświeżanie danych sprzedaży po uploadzie...');
      fetchSalesData();
      dispatch(resetDataRefreshNeeded());
    }
  }, [dataRefreshNeeded, lastUploadType, dispatch]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateFilters({ [name]: value }));
  };

  const handlePageChange = (event, newPage) => {
    dispatch(updatePagination({ page: newPage }));
  };

  const handleRowsPerPageChange = (event) => {
    dispatch(updatePagination({ pageSize: parseInt(event.target.value, 10), page: 0 }));
  };

  const handleRefresh = () => {
    fetchSalesData();
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  if (loading && (!filteredSales || filteredSales.length === 0)) {
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

  // Sprawdź, czy mamy dane do wyświetlenia
  const hasData = filteredSales && filteredSales.length > 0;
  console.log('Dane do wyświetlenia w tabeli sprzedaży:', { 
    hasData, 
    ilośćDanych: filteredSales?.length || 0,
    przykład: hasData ? filteredSales[0] : null 
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Sprzedaż
      </Typography>
      
      {refreshAlert && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setRefreshAlert(false)}>
          Dane zostały zaktualizowane po przesłaniu nowego pliku.
        </Alert>
      )}
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtry
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Data od"
              type="date"
              name="dateFrom"
              value={filters?.dateFrom || ''}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Data do"
              type="date"
              name="dateTo"
              value={filters?.dateTo || ''}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Oddział"
              name="department"
              value={filters?.department || ''}
              onChange={handleFilterChange}
            >
              <MenuItem value="">Wszystkie</MenuItem>
              {Array.isArray(departments) && departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Grupa"
              name="group"
              value={filters?.group || ''}
              onChange={handleFilterChange}
            >
              <MenuItem value="">Wszystkie</MenuItem>
              {Array.isArray(groups) && groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Rodzaj usługi"
              name="serviceType"
              value={filters?.serviceType || ''}
              onChange={handleFilterChange}
            >
              <MenuItem value="">Wszystkie</MenuItem>
              {Array.isArray(serviceTypes) && serviceTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Kontrahent"
              name="contractor"
              value={filters?.contractor || ''}
              onChange={handleFilterChange}
            >
              <MenuItem value="">Wszyscy</MenuItem>
              {Array.isArray(contractors) && contractors.map((contractor) => (
                <MenuItem key={contractor.id} value={contractor.id}>
                  {contractor.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button variant="contained" color="primary" onClick={handleRefresh} sx={{ mr: 1 }}>
              Filtruj
            </Button>
            <Button variant="outlined" onClick={handleResetFilters}>
              Resetuj
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Data Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Oddział</TableCell>
                <TableCell>Grupa</TableCell>
                <TableCell>Rodzaj usługi</TableCell>
                <TableCell>Kontrahent</TableCell>
                <TableCell align="right">Ilość</TableCell>
                <TableCell align="right">Kwota netto</TableCell>
                <TableCell align="right">VAT</TableCell>
                <TableCell align="right">Kwota brutto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hasData ? (
                filteredSales.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDate(item.date)}</TableCell>
                    <TableCell>{item.department || '-'}</TableCell>
                    <TableCell>{item.group || '-'}</TableCell>
                    <TableCell>{item.serviceType || '-'}</TableCell>
                    <TableCell>{item.contractor || '-'}</TableCell>
                    <TableCell align="right">{formatNumber(item.quantity, 0, '0')}</TableCell>
                    <TableCell align="right">{formatCurrency(item.netAmount)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.vatAmount)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.grossAmount)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Brak danych do wyświetlenia
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={pagination?.totalItems || 0}
          rowsPerPage={pagination?.pageSize || 10}
          page={pagination?.page || 0}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Wierszy na stronę:"
        />
      </Paper>
    </Box>
  );
};

export default SalesPage;
