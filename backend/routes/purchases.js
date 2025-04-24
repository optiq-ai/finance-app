const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Purchase, Department, Group, ServiceType, Contractor, CostCategory, sequelize } = require('../models');

/**
 * @route   GET /api/purchases
 * @desc    Pobieranie listy zakupów z filtrowaniem i paginacją
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    console.log('Pobieranie listy zakupów z parametrami:', req.query);
    
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

    console.log('Warunki filtrowania:', JSON.stringify(whereConditions));

    try {
      // Pobieranie danych z paginacją i relacjami
      const { count, rows } = await Purchase.findAndCountAll({
        where: whereConditions,
        include: [
          { model: Department, attributes: ['name'] },
          { model: Group, attributes: ['name'] },
          { model: ServiceType, attributes: ['name'] },
          { model: Contractor, attributes: ['name'] },
          { model: CostCategory, attributes: ['name'] }
        ],
        limit: parseInt(pageSize),
        offset: parseInt(page) * parseInt(pageSize),
        order: [['date', 'DESC']]
      });

      console.log(`Znaleziono ${count} rekordów zakupów`);
      
      // Przygotowanie danych do wyświetlenia w tabeli z nazwami zamiast ID
      const formattedRows = rows.map(row => {
        const purchase = row.toJSON();
        return {
          ...purchase,
          department: purchase.Department ? purchase.Department.name : '-',
          group: purchase.Group ? purchase.Group.name : '-',
          serviceType: purchase.ServiceType ? purchase.ServiceType.name : '-',
          contractor: purchase.Contractor ? purchase.Contractor.name : '-',
          costCategory: purchase.CostCategory ? purchase.CostCategory.name : '-'
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
      console.error('Błąd podczas pobierania zakupów:', err);
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
    console.error('Błąd podczas pobierania zakupów:', err);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
  }
});

/**
 * @route   GET /api/purchases/:id
 * @desc    Pobieranie szczegółów zakupu
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findByPk(req.params.id, {
      include: [
        { model: Department, attributes: ['name'] },
        { model: Group, attributes: ['name'] },
        { model: ServiceType, attributes: ['name'] },
        { model: Contractor, attributes: ['name'] },
        { model: CostCategory, attributes: ['name'] }
      ]
    });
    
    if (!purchase) {
      return res.status(404).json({ message: 'Zakup nie znaleziony' });
    }
    
    // Formatowanie danych z nazwami zamiast ID
    const formattedPurchase = purchase.toJSON();
    formattedPurchase.department = formattedPurchase.Department ? formattedPurchase.Department.name : '-';
    formattedPurchase.group = formattedPurchase.Group ? formattedPurchase.Group.name : '-';
    formattedPurchase.serviceType = formattedPurchase.ServiceType ? formattedPurchase.ServiceType.name : '-';
    formattedPurchase.contractor = formattedPurchase.Contractor ? formattedPurchase.Contractor.name : '-';
    formattedPurchase.costCategory = formattedPurchase.CostCategory ? formattedPurchase.CostCategory.name : '-';
    
    res.json(formattedPurchase);
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
