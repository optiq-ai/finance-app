const express = require('express');
const router = express.Router();
const { Purchase, Sale, Payroll, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/dashboard/summary
 * @desc    Pobieranie podsumowania danych dla dashboardu
 * @access  Private
 */
router.get('/summary', async (req, res) => {
  try {
    const { year, month, departmentId } = req.query;
    
    // Budowanie warunków filtrowania
    const whereConditions = {};
    
    if (year && month) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0);
      
      whereConditions.date = {
        [Op.between]: [startDate, endDate]
      };
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31);
      
      whereConditions.date = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    if (departmentId) {
      whereConditions.departmentId = departmentId;
    }
    
    // Pobieranie danych
    const [totalSales, totalPurchases, totalPayroll] = await Promise.all([
      Sale.sum('amount', { where: whereConditions }),
      Purchase.sum('amount', { where: whereConditions }),
      Payroll.sum('amount', { where: whereConditions })
    ]);
    
    // Obliczanie wyniku
    const result = totalSales - totalPurchases - totalPayroll;
    
    res.json({
      totalSales: totalSales || 0,
      totalPurchases: totalPurchases || 0,
      totalPayroll: totalPayroll || 0,
      result: result || 0
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
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
    
    // Budowanie warunków filtrowania
    const whereConditions = {};
    
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);
    
    whereConditions.date = {
      [Op.between]: [startDate, endDate]
    };
    
    if (departmentId) {
      whereConditions.departmentId = departmentId;
    }
    
    // Pobieranie danych miesięcznych
    const monthlySales = await Sale.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('date')), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      where: whereConditions,
      group: [sequelize.fn('MONTH', sequelize.col('date'))],
      order: [[sequelize.fn('MONTH', sequelize.col('date')), 'ASC']]
    });
    
    const monthlyPurchases = await Purchase.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('date')), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      where: whereConditions,
      group: [sequelize.fn('MONTH', sequelize.col('date'))],
      order: [[sequelize.fn('MONTH', sequelize.col('date')), 'ASC']]
    });
    
    const monthlyPayroll = await Payroll.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('date')), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      where: whereConditions,
      group: [sequelize.fn('MONTH', sequelize.col('date'))],
      order: [[sequelize.fn('MONTH', sequelize.col('date')), 'ASC']]
    });
    
    // Przygotowanie danych dla wszystkich miesięcy
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const monthlyData = months.map(month => {
      const salesData = monthlySales.find(item => parseInt(item.dataValues.month) === month);
      const purchasesData = monthlyPurchases.find(item => parseInt(item.dataValues.month) === month);
      const payrollData = monthlyPayroll.find(item => parseInt(item.dataValues.month) === month);
      
      return {
        month,
        sales: salesData ? parseFloat(salesData.dataValues.total) : 0,
        purchases: purchasesData ? parseFloat(purchasesData.dataValues.total) : 0,
        payroll: payrollData ? parseFloat(payrollData.dataValues.total) : 0,
        result: (salesData ? parseFloat(salesData.dataValues.total) : 0) - 
                (purchasesData ? parseFloat(purchasesData.dataValues.total) : 0) - 
                (payrollData ? parseFloat(payrollData.dataValues.total) : 0)
      };
    });
    
    res.json(monthlyData);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

module.exports = router;
