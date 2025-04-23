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
  Divider
} from '@mui/material';
import {
  fetchPayrollStart,
  fetchPayrollSuccess,
  fetchPayrollFailure,
  updateFilters,
  updatePagination
} from '../../redux/slices/payrollSlice';
import payrollService from '../../services/payrollService';

const PayrollPage = () => {
  const dispatch = useDispatch();
  const { payroll, filteredPayroll, loading, error, filters, pagination } = useSelector((state) => state.payroll);
  const { departments, groups, serviceTypes } = useSelector((state) => state.dictionary);
  
  useEffect(() => {
    const fetchPayrollData = async () => {
      try {
        dispatch(fetchPayrollStart());
        const data = await payrollService.getPayroll(filters, pagination);
        dispatch(fetchPayrollSuccess(data));
      } catch (err) {
        dispatch(fetchPayrollFailure(err.message));
      }
    };

    fetchPayrollData();
  }, [dispatch, filters, pagination.page, pagination.pageSize]);

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

  if (loading && payroll.length === 0) {
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
        Wypłaty
      </Typography>
      
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
              value={filters.dateFrom || ''}
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
              value={filters.dateTo || ''}
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
              value={filters.department || ''}
              onChange={handleFilterChange}
            >
              <MenuItem value="">Wszystkie</MenuItem>
              {departments.map((dept) => (
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
              value={filters.group || ''}
              onChange={handleFilterChange}
            >
              <MenuItem value="">Wszystkie</MenuItem>
              {groups.map((group) => (
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
              value={filters.serviceType || ''}
              onChange={handleFilterChange}
            >
              <MenuItem value="">Wszystkie</MenuItem>
              {serviceTypes.map((type) => (
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
              value={filters.employee || ''}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              select
              label="Kategoria"
              name="category"
              value={filters.category || ''}
              onChange={handleFilterChange}
            >
              <MenuItem value="">Wszystkie</MenuItem>
              <MenuItem value="umowa">Umowa o pracę</MenuItem>
              <MenuItem value="zlecenie">Umowa zlecenie</MenuItem>
              <MenuItem value="dzielo">Umowa o dzieło</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button variant="contained" color="primary" sx={{ mr: 1 }}>
              Filtruj
            </Button>
            <Button variant="outlined">
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
                <TableCell>Pracownik</TableCell>
                <TableCell>Kategoria</TableCell>
                <TableCell align="right">Brutto</TableCell>
                <TableCell align="right">Składki</TableCell>
                <TableCell align="right">Podatek</TableCell>
                <TableCell align="right">Netto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayroll.length > 0 ? (
                filteredPayroll.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell>{item.department}</TableCell>
                    <TableCell>{item.group}</TableCell>
                    <TableCell>{item.serviceType}</TableCell>
                    <TableCell>{item.employee}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell align="right">{item.grossAmount.toLocaleString()} zł</TableCell>
                    <TableCell align="right">{item.contributions.toLocaleString()} zł</TableCell>
                    <TableCell align="right">{item.tax.toLocaleString()} zł</TableCell>
                    <TableCell align="right">{item.netAmount.toLocaleString()} zł</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} align="center">
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
          count={pagination.totalItems}
          rowsPerPage={pagination.pageSize}
          page={pagination.page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Wierszy na stronę:"
        />
      </Paper>
    </Box>
  );
};

export default PayrollPage;
