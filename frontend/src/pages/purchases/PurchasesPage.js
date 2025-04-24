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
  fetchPurchasesStart,
  fetchPurchasesSuccess,
  fetchPurchasesFailure,
  updateFilters,
  updatePagination
} from '../../redux/slices/purchasesSlice';
import purchasesService from '../../services/purchasesService';

const PurchasesPage = () => {
  const dispatch = useDispatch();
  const { purchases, filteredPurchases, loading, error, filters, pagination } = useSelector((state) => state.purchases);
  const { departments = [], groups = [], serviceTypes = [], contractors = [], costCategories = [] } = useSelector((state) => state.dictionary || {});
  
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        dispatch(fetchPurchasesStart());
        const data = await purchasesService.getPurchases(filters, pagination);
        dispatch(fetchPurchasesSuccess(data));
      } catch (err) {
        dispatch(fetchPurchasesFailure(err.message));
      }
    };

    fetchPurchases();
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

  if (loading && (!purchases || purchases.length === 0)) {
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
        Zakupy
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
                <TableCell>Kontrahent</TableCell>
                <TableCell>Kategoria</TableCell>
                <TableCell align="right">Kwota netto</TableCell>
                <TableCell align="right">VAT</TableCell>
                <TableCell align="right">Kwota brutto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPurchases && filteredPurchases.length > 0 ? (
                filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>{purchase.date ? new Date(purchase.date).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{purchase.department || '-'}</TableCell>
                    <TableCell>{purchase.group || '-'}</TableCell>
                    <TableCell>{purchase.serviceType || '-'}</TableCell>
                    <TableCell>{purchase.contractor || '-'}</TableCell>
                    <TableCell>{purchase.costCategory || '-'}</TableCell>
                    <TableCell align="right">{purchase.netAmount ? purchase.netAmount.toLocaleString() : '0'} zł</TableCell>
                    <TableCell align="right">{purchase.vatAmount ? purchase.vatAmount.toLocaleString() : '0'} zł</TableCell>
                    <TableCell align="right">{purchase.grossAmount ? purchase.grossAmount.toLocaleString() : '0'} zł</TableCell>
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
