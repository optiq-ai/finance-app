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
  fetchPayrollStart,
  fetchPayrollSuccess,
  fetchPayrollFailure,
  updateFilters,
  updatePagination,
  resetFilters
} from '../../redux/slices/payrollSlice';
import { resetDataRefreshNeeded } from '../../redux/slices/uploadSlice';
import payrollService from '../../services/payrollService';
import { formatDate } from '../../utils/dateUtils';
import { formatCurrency } from '../../utils/numberUtils';

const PayrollPage = () => {
  const dispatch = useDispatch();
  const { payroll, filteredPayroll, loading, error, filters, pagination } = useSelector((state) => state.payroll);
  const { departments = [], groups = [], serviceTypes = [] } = useSelector((state) => state.dictionary || {});
  const { dataRefreshNeeded, lastUploadType } = useSelector((state) => state.upload);
  const [refreshAlert, setRefreshAlert] = useState(false);
  
  // Pobieranie danych wypłat
  const fetchPayrollData = async () => {
    try {
      console.log('Pobieranie danych wypłat z filtrami:', filters);
      dispatch(fetchPayrollStart());
      const data = await payrollService.getPayroll(filters, pagination);
      console.log('Otrzymane dane wypłat:', data);
      dispatch(fetchPayrollSuccess(data));
      
      // Jeśli odświeżenie było spowodowane nowym uploadem, pokazujemy alert
      if (dataRefreshNeeded && (lastUploadType === 'payroll' || lastUploadType === null)) {
        setRefreshAlert(true);
        setTimeout(() => setRefreshAlert(false), 5000); // Ukryj alert po 5 sekundach
      }
    } catch (err) {
      console.error('Błąd podczas pobierania danych wypłat:', err);
      dispatch(fetchPayrollFailure(err.message));
    }
  };

  // Efekt do pobierania danych przy zmianie filtrów lub paginacji
  useEffect(() => {
    fetchPayrollData();
  }, [dispatch, filters, pagination.page, pagination.pageSize]);

  // Efekt do odświeżania danych po uploadzie
  useEffect(() => {
    if (dataRefreshNeeded && (lastUploadType === 'payroll' || lastUploadType === null)) {
      console.log('Odświeżanie danych wypłat po uploadzie...');
      fetchPayrollData();
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
    fetchPayrollData();
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  if (loading && (!filteredPayroll || filteredPayroll.length === 0)) {
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
  const hasData = filteredPayroll && filteredPayroll.length > 0;
  console.log('Dane do wyświetlenia w tabeli wypłat:', { 
    hasData, 
    ilośćDanych: filteredPayroll?.length || 0,
    przykład: hasData ? filteredPayroll[0] : null 
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Wypłaty
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
              label="Pracownik"
              name="employee"
              value={filters?.employee || ''}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Kategoria"
              name="category"
              value={filters?.category || ''}
              onChange={handleFilterChange}
            >
              <MenuItem value="">Wszystkie</MenuItem>
              <MenuItem value="umowa">Umowa o pracę</MenuItem>
              <MenuItem value="zlecenie">Umowa zlecenie</MenuItem>
              <MenuItem value="dzielo">Umowa o dzieło</MenuItem>
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
                <TableCell>Pracownik</TableCell>
                <TableCell>Stanowisko</TableCell>
                <TableCell align="right">Brutto</TableCell>
                <TableCell align="right">Podatek</TableCell>
                <TableCell align="right">Netto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hasData ? (
                filteredPayroll.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDate(item.date)}</TableCell>
                    <TableCell>{item.department || '-'}</TableCell>
                    <TableCell>{item.group || '-'}</TableCell>
                    <TableCell>{item.employeeName || '-'}</TableCell>
                    <TableCell>{item.position || '-'}</TableCell>
                    <TableCell align="right">{formatCurrency(item.grossAmount)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.taxAmount)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.netAmount)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
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

export default PayrollPage;
