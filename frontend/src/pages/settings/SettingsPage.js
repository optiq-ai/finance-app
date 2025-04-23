import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Divider,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { updateUserSettings } from '../../redux/slices/authSlice';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [settings, setSettings] = useState({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    darkMode: user?.preferences?.darkMode || false,
    notifications: user?.preferences?.notifications || true,
    language: user?.preferences?.language || 'pl'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setSettings({
      ...settings,
      [name]: name === 'darkMode' || name === 'notifications' ? checked : value
    });
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSaveSettings = () => {
    // Walidacja
    if (settings.newPassword && settings.newPassword !== settings.confirmPassword) {
      setNotification({
        open: true,
        message: 'Hasła nie są identyczne',
        severity: 'error'
      });
      return;
    }
    
    // Symulacja zapisu ustawień
    dispatch(updateUserSettings({
      email: settings.email,
      preferences: {
        darkMode: settings.darkMode,
        notifications: settings.notifications,
        language: settings.language
      }
    }));
    
    setNotification({
      open: true,
      message: 'Ustawienia zostały zapisane',
      severity: 'success'
    });
  };
  
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Ustawienia
      </Typography>
      
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
      
      <Grid container spacing={3}>
        {/* Ustawienia konta */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Ustawienia konta</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <TextField
              fullWidth
              label="Adres email"
              name="email"
              value={settings.email}
              onChange={handleChange}
              margin="normal"
            />
            
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Aktualne hasło"
              name="currentPassword"
              value={settings.currentPassword}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <Button 
                    onClick={handleTogglePasswordVisibility}
                    sx={{ minWidth: 'auto' }}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </Button>
                )
              }}
            />
            
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Nowe hasło"
              name="newPassword"
              value={settings.newPassword}
              onChange={handleChange}
              margin="normal"
            />
            
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Potwierdź nowe hasło"
              name="confirmPassword"
              value={settings.confirmPassword}
              onChange={handleChange}
              margin="normal"
            />
          </Paper>
        </Grid>
        
        {/* Preferencje */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Preferencje</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.darkMode}
                  onChange={handleChange}
                  name="darkMode"
                  color="primary"
                />
              }
              label="Tryb ciemny"
              sx={{ mb: 2, display: 'block' }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications}
                  onChange={handleChange}
                  name="notifications"
                  color="primary"
                />
              }
              label="Powiadomienia"
              sx={{ mb: 2, display: 'block' }}
            />
            
            <TextField
              select
              fullWidth
              label="Język"
              name="language"
              value={settings.language}
              onChange={handleChange}
              margin="normal"
              SelectProps={{
                native: true
              }}
            >
              <option value="pl">Polski</option>
              <option value="en">English</option>
            </TextField>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
        >
          Zapisz ustawienia
        </Button>
      </Box>
    </Box>
  );
};

export default SettingsPage;
