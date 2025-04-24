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

    // Pobieranie danych z paginacją
    const { count, rows } = await Sale.findAndCountAll({
      where: whereConditions,
      limit: parseInt(pageSize),
      offset: parseInt(page) * parseInt(pageSize),
      order: [['date', 'DESC']]
    });

    console.log(`Znaleziono ${count} rekordów sprzedaży`);

    // Pobieranie unikalnych wartości dla filtrów
    const departments = await Sale.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('departmentId')), 'departmentId']],
      where: { departmentId: { [Op.ne]: null } },
      raw: true
    });

    const groups = await Sale.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('groupId')), 'groupId']],
      where: { groupId: { [Op.ne]: null } },
      raw: true
    });

    const serviceTypes = await Sale.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('serviceTypeId')), 'serviceTypeId']],
      where: { serviceTypeId: { [Op.ne]: null } },
      raw: true
    });

    const customers = await Sale.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('customer')), 'customer']],
      where: { customer: { [Op.ne]: null } },
      raw: true
    });

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

    res.json({
      totalItems: count,
      items: formattedRows,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(count / parseInt(pageSize)),
      filterOptions: {
        departments: departments.map(d => d.departmentId),
        groups: groups.map(g => g.groupId),
        serviceTypes: serviceTypes.map(s => s.serviceTypeId),
        customers: customers.map(c => c.customer)
      }
    });
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
