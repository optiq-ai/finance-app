const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Payroll, sequelize } = require('../models');

/**
 * @route   GET /api/payroll
 * @desc    Pobieranie listy wypłat z filtrowaniem i paginacją
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    console.log('Pobieranie listy wypłat z parametrami:', req.query);
    
    const { 
      page = 0, 
      pageSize = 10, 
      dateFrom, 
      dateTo, 
      department, 
      group,
      employee
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
    if (employee) whereConditions.employeeName = { [Op.like]: `%${employee}%` };

    console.log('Warunki filtrowania:', JSON.stringify(whereConditions));

    // Pobieranie danych z paginacją
    const { count, rows } = await Payroll.findAndCountAll({
      where: whereConditions,
      limit: parseInt(pageSize),
      offset: parseInt(page) * parseInt(pageSize),
      order: [['date', 'DESC']]
    });

    console.log(`Znaleziono ${count} rekordów wypłat`);

    // Pobieranie unikalnych wartości dla filtrów
    const departments = await Payroll.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('departmentId')), 'departmentId']],
      where: { departmentId: { [Op.ne]: null } },
      raw: true
    });

    const groups = await Payroll.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('groupId')), 'groupId']],
      where: { groupId: { [Op.ne]: null } },
      raw: true
    });

    const employees = await Payroll.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('employeeName')), 'employeeName']],
      where: { employeeName: { [Op.ne]: null } },
      raw: true
    });

    // Przygotowanie danych do wyświetlenia w tabeli
    const formattedRows = rows.map(row => {
      const payroll = row.toJSON();
      return {
        ...payroll,
        department: payroll.departmentId,
        group: payroll.groupId,
        employee: payroll.employeeName
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
        employees: employees.map(e => e.employeeName)
      }
    });
  } catch (err) {
    console.error('Błąd podczas pobierania wypłat:', err);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
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
