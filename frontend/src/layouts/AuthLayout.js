import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  CssBaseline
} from '@mui/material';

const AuthLayout = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'background.default'
      }}
    >
      <CssBaseline />
      <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 4 }}>
            Aplikacja Finansowa
          </Typography>
          <Outlet />
        </Paper>
      </Container>
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: 'background.paper'
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Aplikacja Finansowa
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default AuthLayout;
