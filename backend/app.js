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

// Konfiguracja CORS - zezwalanie na określone źródła
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost', 'http://frontend', 'http://localhost:80'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dodanie nagłówków CORS do każdej odpowiedzi
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:3000', 'http://localhost', 'http://frontend', 'http://localhost:80'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Obsługa żądań OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

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
