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
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
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
import dictionaryService from '../../services/dictionaryService';

const DictionariesPage = () => {
  const dispatch = useDispatch();
  const { departments, groups, serviceTypes, contractors, costCategories, loading, error } = useSelector((state) => state.dictionary);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });
  
  useEffect(() => {
    const fetchDictionaries = async () => {
      try {
        dispatch(fetchDictionariesStart());
        const data = await dictionaryService.getDictionaries();
        dispatch(fetchDictionariesSuccess(data));
      } catch (err) {
        dispatch(fetchDictionariesFailure(err.message));
      }
    };

    fetchDictionaries();
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditMode(true);
      setCurrentItem(item);
      setFormData({
        name: item.name,
        code: item.code || '',
        description: item.description || ''
      });
    } else {
      setEditMode(false);
      setCurrentItem(null);
      setFormData({
        name: '',
        code: '',
        description: ''
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
        dispatch(updateItemStart());
        const updatedItem = await dictionaryService.updateDictionaryItem(
          dictionaryType,
          currentItem.id,
          formData
        );
        dispatch(updateItemSuccess({ type: dictionaryType, item: updatedItem }));
        handleCloseDialog();
      } catch (err) {
        dispatch(updateItemFailure(err.message));
      }
    } else {
      try {
        dispatch(addItemStart());
        const newItem = await dictionaryService.addDictionaryItem(dictionaryType, formData);
        dispatch(addItemSuccess({ type: dictionaryType, item: newItem }));
        handleCloseDialog();
      } catch (err) {
        dispatch(addItemFailure(err.message));
      }
    }
  };
  
  const handleDelete = async (item) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten element?')) {
      const dictionaryType = getDictionaryTypeByTabValue();
      
      try {
        dispatch(deleteItemStart());
        await dictionaryService.deleteDictionaryItem(dictionaryType, item.id);
        dispatch(deleteItemSuccess({ type: dictionaryType, id: item.id }));
      } catch (err) {
        dispatch(deleteItemFailure(err.message));
      }
    }
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
        return departments;
      case 1:
        return groups;
      case 2:
        return serviceTypes;
      case 3:
        return contractors;
      case 4:
        return costCategories;
      default:
        return [];
    }
  };
  
  if (loading && departments.length === 0) {
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
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Dodaj
          </Button>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nazwa</TableCell>
                <TableCell>Kod</TableCell>
                <TableCell>Opis</TableCell>
                <TableCell align="right">Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getCurrentDictionaryData().length > 0 ? (
                getCurrentDictionaryData().map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
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
                  <TableCell colSpan={4} align="center">
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
          />
          <TextField
            margin="dense"
            name="code"
            label="Kod"
            type="text"
            fullWidth
            value={formData.code}
            onChange={handleInputChange}
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
