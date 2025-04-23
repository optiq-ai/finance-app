const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const purchasesRoutes = require('./routes/purchases');
const payrollRoutes = require('./routes/payroll');
const salesRoutes = require('./routes/sales');
const dashboardRoutes = require('./routes/dashboard');
const dictionaryRoutes = require('./routes/dictionary');
const uploadRoutes = require('./routes/upload');
const savedViewsRoutes = require('./routes/savedViews');
const filtersRoutes = require('./routes/filters');

// Załadowanie zmiennych środowiskowych
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Podstawowy endpoint zdrowia
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API działa poprawnie' });
});

// Routing API
app.use('/api/auth', authRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dictionary', dictionaryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/saved-views', savedViewsRoutes);
app.use('/api/filters', filtersRoutes);

// Obsługa błędów
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Wystąpił błąd serwera',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
