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
    
    // Przygotowanie warunków filtrowania
    const whereConditions = {};
    const compareWhereConditions = {};
    
    if (departmentId) {
      whereConditions.departmentId = departmentId;
      compareWhereConditions.departmentId = departmentId;
    }
    
    // Dodanie warunków dat
    whereConditions.date = {
      [Op.between]: [startDate, endDate]
    };
    
    compareWhereConditions.date = {
      [Op.between]: [compareStartDate, compareEndDate]
    };
    
    // Pobieranie danych z bazy
    const [currentSales, currentPurchases, currentPayroll] = await Promise.all([
      Sale.sum('netAmount', { where: whereConditions }),
      Purchase.sum('grossAmount', { where: whereConditions }),
      Payroll.sum('grossAmount', { where: whereConditions })
    ]);
    
    const [previousSales, previousPurchases, previousPayroll] = await Promise.all([
      Sale.sum('netAmount', { where: compareWhereConditions }),
      Purchase.sum('grossAmount', { where: compareWhereConditions }),
      Payroll.sum('grossAmount', { where: compareWhereConditions })
    ]);
    
    // Obliczanie wyników
    const currentSalesValue = currentSales || 0;
    const currentPurchasesValue = currentPurchases || 0;
    const currentPayrollValue = currentPayroll || 0;
    const currentResult = currentSalesValue - currentPurchasesValue - currentPayrollValue;
    
    const previousSalesValue = previousSales || 0;
    const previousPurchasesValue = previousPurchases || 0;
    const previousPayrollValue = previousPayroll || 0;
    const previousResult = previousSalesValue - previousPurchasesValue - previousPayrollValue;
    
    // Obliczanie zmian procentowych
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };
    
    const salesChange = calculateChange(currentSalesValue, previousSalesValue);
    const purchasesChange = calculateChange(currentPurchasesValue, previousPurchasesValue);
    const payrollChange = calculateChange(currentPayrollValue, previousPayrollValue);
    const resultChange = calculateChange(currentResult, previousResult);
    
    res.json({
      currentPeriod: {
        label: periodLabel,
        sales: currentSalesValue,
        purchases: currentPurchasesValue,
        payroll: currentPayrollValue,
        result: currentResult
      },
      previousPeriod: {
        label: comparePeriodLabel,
        sales: previousSalesValue,
        purchases: previousPurchasesValue,
        payroll: previousPayrollValue,
        result: previousResult
      },
      changes: {
        sales: parseFloat(salesChange.toFixed(2)),
        purchases: parseFloat(purchasesChange.toFixed(2)),
        payroll: parseFloat(payrollChange.toFixed(2)),
        result: parseFloat(resultChange.toFixed(2))
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
    
    // Przygotowanie warunków filtrowania
    const whereConditions = {};
    
    if (departmentId) {
      whereConditions.departmentId = departmentId;
    }
    
    // Jeśli podano rok i miesiąc, filtrujemy dane dla tego okresu
    if (year && month) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      
      whereConditions.date = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    // Pobieranie danych z bazy
    const [totalSales, totalPurchases, totalPayroll] = await Promise.all([
      Sale.sum('netAmount', { where: whereConditions }),
      Purchase.sum('grossAmount', { where: whereConditions }),
      Payroll.sum('grossAmount', { where: whereConditions })
    ]);
    
    // Obliczanie wyniku
    const salesValue = totalSales || 0;
    const purchasesValue = totalPurchases || 0;
    const payrollValue = totalPayroll || 0;
    const result = salesValue - purchasesValue - payrollValue;
    
    res.json({
      totalSales: salesValue,
      totalPurchases: purchasesValue,
      totalPayroll: payrollValue,
      result: result
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
    
    // Przygotowanie warunków filtrowania
    const baseWhereConditions = {};
    if (departmentId) {
      baseWhereConditions.departmentId = departmentId;
    }
    
    // Przygotowanie danych dla wszystkich miesięcy
    const monthlyData = [];
    
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0);
      
      const whereConditions = {
        ...baseWhereConditions,
        date: {
          [Op.between]: [startDate, endDate]
        }
      };
      
      // Pobieranie danych z bazy dla danego miesiąca
      const [sales, purchases, payroll] = await Promise.all([
        Sale.sum('netAmount', { where: whereConditions }) || 0,
        Purchase.sum('grossAmount', { where: whereConditions }) || 0,
        Payroll.sum('grossAmount', { where: whereConditions }) || 0
      ]);
      
      const salesValue = sales || 0;
      const purchasesValue = purchases || 0;
      const payrollValue = payroll || 0;
      const result = salesValue - purchasesValue - payrollValue;
      
      monthlyData.push({
        month: month + 1,
        sales: salesValue,
        purchases: purchasesValue,
        payroll: payrollValue,
        result: result
      });
    }
    
    res.json(monthlyData);
  } catch (err) {
    console.error('Dashboard monthly-data error:', err.message);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
  }
});

module.exports = router;
