const express = require('express');
const router = express.Router();
const { Purchase } = require('../models');

/**
 * @route   GET /api/purchases
 * @desc    Pobieranie listy zakupów z filtrowaniem i paginacją
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
      group, 
      serviceType,
      contractor,
      costCategory
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
    if (serviceType) whereConditions.serviceTypeId = serviceType;
    if (contractor) whereConditions.contractorId = contractor;
    if (costCategory) whereConditions.costCategoryId = costCategory;

    // Pobieranie danych z paginacją
    const { count, rows } = await Purchase.findAndCountAll({
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
 * @route   GET /api/purchases/:id
 * @desc    Pobieranie szczegółów zakupu
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({ message: 'Zakup nie znaleziony' });
    }
    
    res.json(purchase);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   POST /api/purchases
 * @desc    Dodawanie nowego zakupu
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const purchase = await Purchase.create(req.body);
    res.status(201).json(purchase);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   PUT /api/purchases/:id
 * @desc    Aktualizacja zakupu
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({ message: 'Zakup nie znaleziony' });
    }
    
    await purchase.update(req.body);
    res.json(purchase);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   DELETE /api/purchases/:id
 * @desc    Usuwanie zakupu
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id);
    
    if (!purchase) {
      return res.status(404).json({ message: 'Zakup nie znaleziony' });
    }
    
    await purchase.destroy();
    res.json({ message: 'Zakup usunięty' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

module.exports = router;
