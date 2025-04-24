const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Payroll } = require('../models');

/**
 * @route   GET /api/payroll
 * @desc    Pobieranie listy wypłat z filtrowaniem i paginacją
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const { 
      page = 0, 
      pageSize = 10, 
      dateFrom, 
      dateTo, 
      department, 
      group
    } = req.query;

    // Budowanie warunków filtrowania
    const whereConditions = {};
    
    if (dateFrom && dateTo) {
      whereConditions.date = {
        [Op.between]: [new Date(dateFrom), new Date(dateTo)]
      };
    } else if (dateFrom) {
      whereConditions.date = {
        [Op.gte]: new Date(dateFrom)
      };
    } else if (dateTo) {
      whereConditions.date = {
        [Op.lte]: new Date(dateTo)
      };
    }
    
    if (department) whereConditions.departmentId = department;
    if (group) whereConditions.groupId = group;

    // Pobieranie danych z paginacją
    const { count, rows } = await Payroll.findAndCountAll({
      where: whereConditions,
      limit: parseInt(pageSize),
      offset: parseInt(page) * parseInt(pageSize),
      order: [['date', 'DESC']]
    });

    res.json({
      totalItems: count,
      items: rows,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(count / parseInt(pageSize))
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   GET /api/payroll/:id
 * @desc    Pobieranie szczegółów wypłaty
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({ message: 'Wypłata nie znaleziona' });
    }
    
    res.json(payroll);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   POST /api/payroll
 * @desc    Dodawanie nowej wypłaty
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const payroll = await Payroll.create(req.body);
    res.status(201).json(payroll);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   PUT /api/payroll/:id
 * @desc    Aktualizacja wypłaty
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({ message: 'Wypłata nie znaleziona' });
    }
    
    await payroll.update(req.body);
    res.json(payroll);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   DELETE /api/payroll/:id
 * @desc    Usuwanie wypłaty
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const payroll = await Payroll.findByPk(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({ message: 'Wypłata nie znaleziona' });
    }
    
    await payroll.destroy();
    res.json({ message: 'Wypłata usunięta' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

module.exports = router;
