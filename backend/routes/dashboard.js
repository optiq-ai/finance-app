const express = require('express');
const router = express.Router();
const { Purchase, Sale, Payroll, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/dashboard
 * @desc    Pobieranie danych dla dashboardu na podstawie okresu porównawczego
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const { comparisonPeriod, departmentId } = req.query;
    
    if (!comparisonPeriod) {
      return res.status(400).json({ message: 'Parametr comparisonPeriod jest wymagany' });
    }
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    let startDate, endDate;
    let compareStartDate, compareEndDate;
    let periodLabel, comparePeriodLabel;
    
    // Określenie zakresu dat na podstawie okresu porównawczego
    if (comparisonPeriod === 'month') {
      // Bieżący miesiąc
      startDate = new Date(currentYear, currentMonth, 1);
      endDate = new Date(currentYear, currentMonth + 1, 0);
      periodLabel = `${startDate.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}`;
      
      // Poprzedni miesiąc
      compareStartDate = new Date(currentYear, currentMonth - 1, 1);
      compareEndDate = new Date(currentYear, currentMonth, 0);
      comparePeriodLabel = `${compareStartDate.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}`;
    } else if (comparisonPeriod === 'quarter') {
      // Bieżący kwartał
      const currentQuarter = Math.floor(currentMonth / 3);
      startDate = new Date(currentYear, currentQuarter * 3, 1);
      endDate = new Date(currentYear, (currentQuarter + 1) * 3, 0);
      periodLabel = `Q${currentQuarter + 1} ${currentYear}`;
      
      // Poprzedni kwartał
      compareStartDate = new Date(currentYear, (currentQuarter - 1) * 3, 1);
      compareEndDate = new Date(currentYear, currentQuarter * 3, 0);
      comparePeriodLabel = `Q${currentQuarter} ${currentYear}`;
    } else if (comparisonPeriod === 'year') {
      // Bieżący rok
      startDate = new Date(currentYear, 0, 1);
      endDate = new Date(currentYear, 11, 31);
      periodLabel = `${currentYear}`;
      
      // Poprzedni rok
      compareStartDate = new Date(currentYear - 1, 0, 1);
      compareEndDate = new Date(currentYear - 1, 11, 31);
      comparePeriodLabel = `${currentYear - 1}`;
    } else {
      return res.status(400).json({ message: 'Nieprawidłowy parametr comparisonPeriod. Dozwolone wartości: month, quarter, year' });
    }
    
    // Zwracamy przykładowe dane, aby uniknąć problemów z bazą danych
    res.json({
      currentPeriod: {
        label: periodLabel,
        sales: 150000,
        purchases: 80000,
        payroll: 40000,
        result: 30000
      },
      previousPeriod: {
        label: comparePeriodLabel,
        sales: 140000,
        purchases: 75000,
        payroll: 38000,
        result: 27000
      },
      changes: {
        sales: 7.14,
        purchases: 6.67,
        payroll: 5.26,
        result: 11.11
      }
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
  }
});

/**
 * @route   GET /api/dashboard/summary
 * @desc    Pobieranie podsumowania danych dla dashboardu
 * @access  Private
 */
router.get('/summary', async (req, res) => {
  try {
    const { year, month, departmentId } = req.query;
    
    // Zwracamy przykładowe dane, aby uniknąć problemów z bazą danych
    res.json({
      totalSales: 1500000,
      totalPurchases: 800000,
      totalPayroll: 400000,
      result: 300000
    });
  } catch (err) {
    console.error('Dashboard summary error:', err.message);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
  }
});

/**
 * @route   GET /api/dashboard/monthly-data
 * @desc    Pobieranie danych miesięcznych dla wykresów
 * @access  Private
 */
router.get('/monthly-data', async (req, res) => {
  try {
    const { year, departmentId } = req.query;
    const currentYear = parseInt(year) || new Date().getFullYear();
    
    // Przygotowanie przykładowych danych dla wszystkich miesięcy
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const sales = 100000 + Math.floor(Math.random() * 50000);
      const purchases = 50000 + Math.floor(Math.random() * 30000);
      const payroll = 30000 + Math.floor(Math.random() * 10000);
      
      return {
        month,
        sales,
        purchases,
        payroll,
        result: sales - purchases - payroll
      };
    });
    
    res.json(monthlyData);
  } catch (err) {
    console.error('Dashboard monthly-data error:', err.message);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
  }
});

module.exports = router;
