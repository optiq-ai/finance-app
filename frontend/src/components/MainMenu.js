import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MoneyIcon from '@mui/icons-material/Money';
import StoreIcon from '@mui/icons-material/Store';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BookIcon from '@mui/icons-material/Book';
import SettingsIcon from '@mui/icons-material/Settings';
import BugReportIcon from '@mui/icons-material/BugReport';
import BuildIcon from '@mui/icons-material/Build';

const MainMenu = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname.includes('/app' + path);
  };
  
  return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
      <List component="nav" aria-label="main menu">
        <ListItem 
          button 
          component={Link} 
          to="/app/dashboard" 
          selected={isActive('/dashboard')}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        
        <ListItem 
          button 
          component={Link} 
          to="/app/purchases" 
          selected={isActive('/purchases')}
        >
          <ListItemIcon>
            <ShoppingCartIcon />
          </ListItemIcon>
          <ListItemText primary="Zakupy" />
        </ListItem>
        
        <ListItem 
          button 
          component={Link} 
          to="/app/payroll" 
          selected={isActive('/payroll')}
        >
          <ListItemIcon>
            <MoneyIcon />
          </ListItemIcon>
          <ListItemText primary="Wypłaty" />
        </ListItem>
        
        <ListItem 
          button 
          component={Link} 
          to="/app/sales" 
          selected={isActive('/sales')}
        >
          <ListItemIcon>
            <StoreIcon />
          </ListItemIcon>
          <ListItemText primary="Sprzedaż" />
        </ListItem>
        
        <ListItem 
          button 
          component={Link} 
          to="/app/upload" 
          selected={isActive('/upload')}
        >
          <ListItemIcon>
            <CloudUploadIcon />
          </ListItemIcon>
          <ListItemText primary="Import" />
        </ListItem>
        
        <ListItem 
          button 
          component={Link} 
          to="/app/dictionaries" 
          selected={isActive('/dictionaries')}
        >
          <ListItemIcon>
            <BookIcon />
          </ListItemIcon>
          <ListItemText primary="Słowniki" />
        </ListItem>
        
        <ListItem 
          button 
          component={Link} 
          to="/app/settings" 
          selected={isActive('/settings')}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Ustawienia" />
        </ListItem>
        
        <Divider />
        
        <ListItem 
          button 
          component={Link} 
          to="/app/diagnostic" 
          selected={isActive('/diagnostic')}
        >
          <ListItemIcon>
            <BugReportIcon />
          </ListItemIcon>
          <ListItemText primary="Diagnostyka" />
        </ListItem>
        
        <ListItem 
          button 
          component={Link} 
          to="/app/maintenance" 
          selected={isActive('/maintenance')}
        >
          <ListItemIcon>
            <BuildIcon />
          </ListItemIcon>
          <ListItemText primary="Konserwacja" />
        </ListItem>
      </List>
    </Box>
  );
};

export default MainMenu;
