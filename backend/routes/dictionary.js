const express = require('express');
const router = express.Router();
const { Department, Group, ServiceType, Contractor, CostCategory } = require('../models');

/**
 * @route   GET /api/dictionary
 * @desc    Pobieranie wszystkich słowników
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const [departments, groups, serviceTypes, contractors, costCategories] = await Promise.all([
      Department.findAll({ order: [['name', 'ASC']] }),
      Group.findAll({ order: [['name', 'ASC']] }),
      ServiceType.findAll({ order: [['name', 'ASC']] }),
      Contractor.findAll({ order: [['name', 'ASC']] }),
      CostCategory.findAll({ order: [['name', 'ASC']] })
    ]);
    
    res.json({
      departments,
      groups,
      serviceTypes,
      contractors,
      costCategories
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   GET /api/dictionary/:type
 * @desc    Pobieranie elementów konkretnego słownika
 * @access  Private
 */
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    let items = [];
    
    switch (type) {
      case 'departments':
        items = await Department.findAll({ order: [['name', 'ASC']] });
        break;
      case 'groups':
        items = await Group.findAll({ order: [['name', 'ASC']] });
        break;
      case 'serviceTypes':
        items = await ServiceType.findAll({ order: [['name', 'ASC']] });
        break;
      case 'contractors':
        items = await Contractor.findAll({ order: [['name', 'ASC']] });
        break;
      case 'costCategories':
        items = await CostCategory.findAll({ order: [['name', 'ASC']] });
        break;
      default:
        return res.status(400).json({ message: 'Nieprawidłowy typ słownika' });
    }
    
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   POST /api/dictionary/:type
 * @desc    Dodawanie nowego elementu do słownika
 * @access  Private
 */
router.post('/:type', async (req, res) => {
  try {
    const { type } = req.params;
    let newItem;
    
    switch (type) {
      case 'departments':
        newItem = await Department.create(req.body);
        break;
      case 'groups':
        newItem = await Group.create(req.body);
        break;
      case 'serviceTypes':
        newItem = await ServiceType.create(req.body);
        break;
      case 'contractors':
        newItem = await Contractor.create(req.body);
        break;
      case 'costCategories':
        newItem = await CostCategory.create(req.body);
        break;
      default:
        return res.status(400).json({ message: 'Nieprawidłowy typ słownika' });
    }
    
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   PUT /api/dictionary/:type/:id
 * @desc    Aktualizacja elementu słownika
 * @access  Private
 */
router.put('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    let item;
    
    switch (type) {
      case 'departments':
        item = await Department.findByPk(id);
        break;
      case 'groups':
        item = await Group.findByPk(id);
        break;
      case 'serviceTypes':
        item = await ServiceType.findByPk(id);
        break;
      case 'contractors':
        item = await Contractor.findByPk(id);
        break;
      case 'costCategories':
        item = await CostCategory.findByPk(id);
        break;
      default:
        return res.status(400).json({ message: 'Nieprawidłowy typ słownika' });
    }
    
    if (!item) {
      return res.status(404).json({ message: 'Element nie znaleziony' });
    }
    
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   DELETE /api/dictionary/:type/:id
 * @desc    Usuwanie elementu słownika
 * @access  Private
 */
router.delete('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    let item;
    
    switch (type) {
      case 'departments':
        item = await Department.findByPk(id);
        break;
      case 'groups':
        item = await Group.findByPk(id);
        break;
      case 'serviceTypes':
        item = await ServiceType.findByPk(id);
        break;
      case 'contractors':
        item = await Contractor.findByPk(id);
        break;
      case 'costCategories':
        item = await CostCategory.findByPk(id);
        break;
      default:
        return res.status(400).json({ message: 'Nieprawidłowy typ słownika' });
    }
    
    if (!item) {
      return res.status(404).json({ message: 'Element nie znaleziony' });
    }
    
    await item.destroy();
    res.json({ message: 'Element usunięty' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

module.exports = router;
