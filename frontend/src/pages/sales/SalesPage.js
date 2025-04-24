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
  fetchSalesStart,
  fetchSalesSuccess,
  fetchSalesFailure,
  updateFilters,
  updatePagination
} from '../../redux/slices/salesSlice';
import salesService from '../../services/salesService';

const SalesPage = () => {
  const dispatch = useDispatch();
  const { sales, filteredSales, loading, error, filters, pagination } = useSelector((state) => state.sales);
  const { departments = [], groups = [], serviceTypes = [] } = useSelector((state) => state.dictionary || {});
  
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        dispatch(fetchSalesStart());
        const data = await salesService.getSales(filters, pagination);
        dispatch(fetchSalesSuccess(data));
      } catch (err) {
        dispatch(fetchSalesFailure(err.message));
      }
    };

    fetchSalesData();
  }, [dispatch, filters, pagination?.page, pagination?.pageSize]);

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

  if (loading && (!sales || sales.length === 0)) {
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
        Sprzedaż
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
              label="Klient"
              name="customer"
              value={filters?.customer || ''}
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
              <MenuItem value="produkty">Produkty</MenuItem>
              <MenuItem value="uslugi">Usługi</MenuItem>
              <MenuItem value="inne">Inne</MenuItem>
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
                <TableCell>Klient</TableCell>
                <TableCell>Kategoria</TableCell>
                <TableCell align="right">Ilość</TableCell>
                <TableCell align="right">Kwota netto</TableCell>
                <TableCell align="right">Średnia</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSales && filteredSales.length > 0 ? (
                filteredSales.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.date ? new Date(item.date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{item.department || '-'}</TableCell>
                    <TableCell>{item.group || '-'}</TableCell>
                    <TableCell>{item.serviceType || '-'}</TableCell>
                    <TableCell>{item.customer || '-'}</TableCell>
                    <TableCell>{item.category || '-'}</TableCell>
                    <TableCell align="right">{item.quantity || 0}</TableCell>
                    <TableCell align="right">{item.netAmount ? item.netAmount.toLocaleString() : '0'} zł</TableCell>
                    <TableCell align="right">{item.averageValue ? item.averageValue.toLocaleString() : '0'} zł</TableCell>
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
