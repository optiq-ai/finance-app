const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Sale, sequelize } = require('../models');

/**
 * @route   GET /api/sales
 * @desc    Pobieranie listy sprzedaży z filtrowaniem i paginacją
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    console.log('Pobieranie listy sprzedaży z parametrami:', req.query);
    
    const { 
      page = 0, 
      pageSize = 10, 
      dateFrom, 
      dateTo, 
      department, 
      group, 
      serviceType,
      customer
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
    if (customer) whereConditions.customer = { [Op.like]: `%${customer}%` };

    console.log('Warunki filtrowania:', JSON.stringify(whereConditions));

    try {
      // Pobieranie danych z paginacją
      const { count, rows } = await Sale.findAndCountAll({
        where: whereConditions,
        limit: parseInt(pageSize),
        offset: parseInt(page) * parseInt(pageSize),
        order: [['date', 'DESC']]
      });

      console.log(`Znaleziono ${count} rekordów sprzedaży`);

      // Przygotowanie danych do wyświetlenia w tabeli
      const formattedRows = rows.map(row => {
        const sale = row.toJSON();
        return {
          ...sale,
          department: sale.departmentId,
          group: sale.groupId,
          serviceType: sale.serviceTypeId
        };
      });

      // Zwracamy dane w formacie zgodnym z oczekiwaniami frontendu
      return res.json({
        totalItems: count,
        items: formattedRows,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: Math.ceil(count / parseInt(pageSize))
      });
    } catch (err) {
      console.error('Błąd podczas pobierania sprzedaży:', err);
      // Zwracamy puste dane, aby uniknąć błędu 500
      return res.json({
        totalItems: 0,
        items: [],
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        totalPages: 0
      });
    }
  } catch (err) {
    console.error('Błąd podczas pobierania sprzedaży:', err);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
  }
});

/**
 * @route   GET /api/sales/:id
 * @desc    Pobieranie szczegółów sprzedaży
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    
    if (!sale) {
      return res.status(404).json({ message: 'Sprzedaż nie znaleziona' });
    }
    
    res.json(sale);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   POST /api/sales
 * @desc    Dodawanie nowej sprzedaży
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const sale = await Sale.create(req.body);
    res.status(201).json(sale);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   PUT /api/sales/:id
 * @desc    Aktualizacja sprzedaży
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    
    if (!sale) {
      return res.status(404).json({ message: 'Sprzedaż nie znaleziona' });
    }
    
    await sale.update(req.body);
    res.json(sale);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   DELETE /api/sales/:id
 * @desc    Usuwanie sprzedaży
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id);
    
    if (!sale) {
      return res.status(404).json({ message: 'Sprzedaż nie znaleziona' });
    }
    
    await sale.destroy();
    res.json({ message: 'Sprzedaż usunięta' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

module.exports = router;
