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
  fetchPurchasesStart,
  fetchPurchasesSuccess,
  fetchPurchasesFailure,
  updateFilters,
  updatePagination
} from '../../redux/slices/purchasesSlice';
import { resetDataRefreshNeeded } from '../../redux/slices/uploadSlice';
import purchasesService from '../../services/purchasesService';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/numberUtils';

const PurchasesPage = () => {
  const dispatch = useDispatch();
  const { purchases, filteredPurchases, loading, error, filters, pagination } = useSelector((state) => state.purchases);
  const { departments = [], groups = [], serviceTypes = [], contractors = [], costCategories = [] } = useSelector((state) => state.dictionary || {});
  const { dataRefreshNeeded, lastUploadType } = useSelector((state) => state.upload);
  const [refreshAlert, setRefreshAlert] = useState(false);
  
  // Pobieranie danych zakupów
  const fetchPurchases = async () => {
    try {
      console.log('Pobieranie danych zakupów z filtrami:', filters);
      dispatch(fetchPurchasesStart());
      const data = await purchasesService.getPurchases(filters, pagination);
      console.log('Otrzymane dane zakupów:', data);
      dispatch(fetchPurchasesSuccess(data));
      
      // Jeśli odświeżenie było spowodowane nowym uploadem, pokazujemy alert
      if (dataRefreshNeeded && (lastUploadType === 'purchase' || lastUploadType === null)) {
        setRefreshAlert(true);
        setTimeout(() => setRefreshAlert(false), 5000); // Ukryj alert po 5 sekundach
      }
    } catch (err) {
      console.error('Błąd podczas pobierania danych zakupów:', err);
      dispatch(fetchPurchasesFailure(err.message));
    }
  };

  // Efekt do pobierania danych przy zmianie filtrów lub paginacji
  useEffect(() => {
    fetchPurchases();
  }, [dispatch, filters, pagination.page, pagination.pageSize]);

  // Efekt do odświeżania danych po uploadzie
  useEffect(() => {
    if (dataRefreshNeeded && (lastUploadType === 'purchase' || lastUploadType === null)) {
      console.log('Odświeżanie danych zakupów po uploadzie...');
      fetchPurchases();
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
    fetchPurchases();
  };

  const handleResetFilters = () => {
    dispatch(updateFilters({
      dateFrom: '',
      dateTo: '',
      department: '',
      group: '',
      serviceType: '',
      contractor: '',
      costCategory: ''
    }));
  };

  if (loading && (!filteredPurchases || filteredPurchases.length === 0)) {
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
  const hasData = filteredPurchases && filteredPurchases.length > 0;
  console.log('Dane do wyświetlenia w tabeli:', { 
    hasData, 
    ilośćDanych: filteredPurchases?.length || 0,
    przykład: hasData ? filteredPurchases[0] : null 
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Zakupy
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
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Kategoria kosztu"
              name="costCategory"
              value={filters?.costCategory || ''}
              onChange={handleFilterChange}
            >
              <MenuItem value="">Wszystkie</MenuItem>
              {Array.isArray(costCategories) && costCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
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
                <TableCell>Kategoria</TableCell>
                <TableCell align="right">Kwota netto</TableCell>
                <TableCell align="right">VAT</TableCell>
                <TableCell align="right">Kwota brutto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hasData ? (
                filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>{formatDate(purchase.date)}</TableCell>
                    <TableCell>{purchase.department || '-'}</TableCell>
                    <TableCell>{purchase.group || '-'}</TableCell>
                    <TableCell>{purchase.serviceType || '-'}</TableCell>
                    <TableCell>{purchase.contractor || '-'}</TableCell>
                    <TableCell>{purchase.costCategory || '-'}</TableCell>
                    <TableCell align="right">{formatCurrency(purchase.netAmount)}</TableCell>
                    <TableCell align="right">{formatCurrency(purchase.vatAmount)}</TableCell>
                    <TableCell align="right">{formatCurrency(purchase.grossAmount)}</TableCell>
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

export default PurchasesPage;
