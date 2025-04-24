import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  fetchDictionariesStart,
  fetchDictionariesSuccess,
  fetchDictionariesFailure,
  addItemStart,
  addItemSuccess,
  addItemFailure,
  updateItemStart,
  updateItemSuccess,
  updateItemFailure,
  deleteItemStart,
  deleteItemSuccess,
  deleteItemFailure
} from '../../redux/slices/dictionarySlice';
import { resetDataRefreshNeeded } from '../../redux/slices/uploadSlice';
import dictionaryService from '../../services/dictionaryService';

const DictionariesPage = () => {
  const dispatch = useDispatch();
  const { departments, groups, serviceTypes, contractors, costCategories, loading, error } = useSelector((state) => state.dictionary);
  const { dataRefreshNeeded } = useSelector((state) => state.upload);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    departmentId: '',
    groupId: ''
  });
  const [refreshAlert, setRefreshAlert] = useState(false);
  
  const fetchDictionaries = async () => {
    try {
      console.log('Pobieranie danych słowników');
      dispatch(fetchDictionariesStart());
      const data = await dictionaryService.getDictionaries();
      console.log('Otrzymane dane słowników:', data);
      dispatch(fetchDictionariesSuccess(data));
      
      // Jeśli odświeżenie było spowodowane nowym uploadem, pokazujemy alert
      if (dataRefreshNeeded) {
        setRefreshAlert(true);
        setTimeout(() => setRefreshAlert(false), 5000); // Ukryj alert po 5 sekundach
      }
    } catch (err) {
      console.error('Błąd podczas pobierania danych słowników:', err);
      dispatch(fetchDictionariesFailure(err.message));
    }
  };

  useEffect(() => {
    fetchDictionaries();
  }, [dispatch]);

  // Efekt do odświeżania danych po uploadzie
  useEffect(() => {
    if (dataRefreshNeeded) {
      console.log('Odświeżanie danych słowników po uploadzie...');
      fetchDictionaries();
      dispatch(resetDataRefreshNeeded());
    }
  }, [dataRefreshNeeded, dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditMode(true);
      setCurrentItem(item);
      setFormData({
        name: item.name || '',
        code: item.code || '',
        description: item.description || '',
        departmentId: item.departmentId || '',
        groupId: item.groupId || ''
      });
    } else {
      setEditMode(false);
      setCurrentItem(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        departmentId: '',
        groupId: ''
      });
    }
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async () => {
    const dictionaryType = getDictionaryTypeByTabValue();
    
    if (editMode) {
      try {
        console.log(`Aktualizacja elementu słownika ${dictionaryType}:`, formData);
        dispatch(updateItemStart());
        const updatedItem = await dictionaryService.updateDictionaryItem(
          dictionaryType,
          currentItem.id,
          formData
        );
        console.log(`Zaktualizowany element słownika ${dictionaryType}:`, updatedItem);
        dispatch(updateItemSuccess({ type: dictionaryType, item: updatedItem }));
        handleCloseDialog();
      } catch (err) {
        console.error(`Błąd aktualizacji elementu słownika ${dictionaryType}:`, err);
        dispatch(updateItemFailure(err.message));
      }
    } else {
      try {
        console.log(`Dodawanie nowego elementu do słownika ${dictionaryType}:`, formData);
        dispatch(addItemStart());
        const newItem = await dictionaryService.addDictionaryItem(dictionaryType, formData);
        console.log(`Dodany element do słownika ${dictionaryType}:`, newItem);
        dispatch(addItemSuccess({ type: dictionaryType, item: newItem }));
        handleCloseDialog();
      } catch (err) {
        console.error(`Błąd dodawania elementu do słownika ${dictionaryType}:`, err);
        dispatch(addItemFailure(err.message));
      }
    }
  };
  
  const handleDelete = async (item) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten element?')) {
      const dictionaryType = getDictionaryTypeByTabValue();
      
      try {
        console.log(`Usuwanie elementu słownika ${dictionaryType} o ID ${item.id}`);
        dispatch(deleteItemStart());
        await dictionaryService.deleteDictionaryItem(dictionaryType, item.id);
        console.log(`Usunięto element słownika ${dictionaryType} o ID ${item.id}`);
        dispatch(deleteItemSuccess({ type: dictionaryType, id: item.id }));
      } catch (err) {
        console.error(`Błąd usuwania elementu słownika ${dictionaryType} o ID ${item.id}:`, err);
        dispatch(deleteItemFailure(err.message));
      }
    }
  };
  
  const handleRefresh = () => {
    fetchDictionaries();
  };
  
  const getDictionaryTypeByTabValue = () => {
    switch (tabValue) {
      case 0:
        return 'departments';
      case 1:
        return 'groups';
      case 2:
        return 'serviceTypes';
      case 3:
        return 'contractors';
      case 4:
        return 'costCategories';
      default:
        return 'departments';
    }
  };
  
  const getCurrentDictionaryData = () => {
    switch (tabValue) {
      case 0:
        return Array.isArray(departments) ? departments : [];
      case 1:
        return Array.isArray(groups) ? groups : [];
      case 2:
        return Array.isArray(serviceTypes) ? serviceTypes : [];
      case 3:
        return Array.isArray(contractors) ? contractors : [];
      case 4:
        return Array.isArray(costCategories) ? costCategories : [];
      default:
        return [];
    }
  };
  
  // Sprawdź, czy mamy dane do wyświetlenia
  const currentData = getCurrentDictionaryData();
  const hasData = currentData && currentData.length > 0;
  console.log('Dane do wyświetlenia w tabeli słowników:', { 
    typ: getDictionaryTypeByTabValue(),
    hasData, 
    ilośćDanych: currentData?.length || 0,
    przykład: hasData ? currentData[0] : null 
  });
  
  if (loading && (!departments || departments.length === 0)) {
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
        Słowniki
      </Typography>
      
      {refreshAlert && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setRefreshAlert(false)}>
          Dane zostały zaktualizowane po przesłaniu nowego pliku.
        </Alert>
      )}
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Oddziały" />
          <Tab label="Grupy" />
          <Tab label="Rodzaje usług" />
          <Tab label="Kontrahenci" />
          <Tab label="Kategorie kosztów" />
        </Tabs>
      </Paper>
      
      <Paper>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {tabValue === 0 && 'Lista oddziałów'}
            {tabValue === 1 && 'Lista grup'}
            {tabValue === 2 && 'Lista rodzajów usług'}
            {tabValue === 3 && 'Lista kontrahentów'}
            {tabValue === 4 && 'Lista kategorii kosztów'}
          </Typography>
          <Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ mr: 1 }}
            >
              Odśwież
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Dodaj
            </Button>
          </Box>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nazwa</TableCell>
                {tabValue === 1 && <TableCell>Oddział</TableCell>}
                {tabValue === 2 && <TableCell>Grupa</TableCell>}
                {tabValue === 3 && <TableCell>NIP</TableCell>}
                <TableCell>Kod</TableCell>
                <TableCell>Opis</TableCell>
                <TableCell align="right">Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hasData ? (
                currentData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name || '-'}</TableCell>
                    {tabValue === 1 && <TableCell>{item.departmentName || '-'}</TableCell>}
                    {tabValue === 2 && <TableCell>{item.groupName || '-'}</TableCell>}
                    {tabValue === 3 && <TableCell>{item.nip || '-'}</TableCell>}
                    <TableCell>{item.code || '-'}</TableCell>
                    <TableCell>{item.description || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenDialog(item)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(item)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={tabValue === 1 || tabValue === 2 || tabValue === 3 ? 5 : 4} align="center">
                    Brak danych do wyświetlenia
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {editMode ? 'Edytuj element' : 'Dodaj nowy element'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nazwa"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleInputChange}
            required
            sx={{ mb: 2 }}
          />
          
          {tabValue === 1 && (
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel id="department-label">Oddział</InputLabel>
              <Select
                labelId="department-label"
                name="departmentId"
                value={formData.departmentId}
                label="Oddział"
                onChange={handleInputChange}
              >
                <MenuItem value="">Wybierz oddział</MenuItem>
                {Array.isArray(departments) && departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          {tabValue === 2 && (
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel id="group-label">Grupa</InputLabel>
              <Select
                labelId="group-label"
                name="groupId"
                value={formData.groupId}
                label="Grupa"
                onChange={handleInputChange}
              >
                <MenuItem value="">Wybierz grupę</MenuItem>
                {Array.isArray(groups) && groups.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          {tabValue === 3 && (
            <TextField
              margin="dense"
              name="nip"
              label="NIP"
              type="text"
              fullWidth
              value={formData.nip || ''}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
          )}
          
          <TextField
            margin="dense"
            name="code"
            label="Kod"
            type="text"
            fullWidth
            value={formData.code}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            name="description"
            label="Opis"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button onClick={handleSubmit} color="primary" disabled={!formData.name}>
            {editMode ? 'Zapisz zmiany' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DictionariesPage;
