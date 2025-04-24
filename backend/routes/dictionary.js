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
    console.log('Pobieranie wszystkich słowników...');
    
    const [departments, groups, serviceTypes, contractors, costCategories] = await Promise.all([
      Department.findAll({ order: [['name', 'ASC']] }),
      Group.findAll({ 
        order: [['name', 'ASC']],
        include: [{ model: Department, attributes: ['name'] }]
      }),
      ServiceType.findAll({ order: [['name', 'ASC']] }),
      Contractor.findAll({ order: [['name', 'ASC']] }),
      CostCategory.findAll({ order: [['name', 'ASC']] })
    ]);
    
    // Dodanie informacji o departamencie do grup
    const formattedGroups = groups.map(group => {
      const groupData = group.toJSON();
      return {
        ...groupData,
        departmentName: groupData.Department ? groupData.Department.name : null
      };
    });
    
    console.log(`Pobrano słowniki: ${departments.length} departamentów, ${groups.length} grup, ${serviceTypes.length} rodzajów usług, ${contractors.length} kontrahentów, ${costCategories.length} kategorii kosztów`);
    
    res.json({
      departments,
      groups: formattedGroups,
      serviceTypes,
      contractors,
      costCategories
    });
  } catch (err) {
    console.error('Błąd podczas pobierania słowników:', err);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
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
    console.log(`Pobieranie słownika typu: ${type}`);
    
    let items = [];
    
    switch (type) {
      case 'departments':
        items = await Department.findAll({ order: [['name', 'ASC']] });
        break;
      case 'groups':
        items = await Group.findAll({ 
          order: [['name', 'ASC']],
          include: [{ model: Department, attributes: ['name'] }]
        });
        
        // Dodanie informacji o departamencie do grup
        items = items.map(group => {
          const groupData = group.toJSON();
          return {
            ...groupData,
            departmentName: groupData.Department ? groupData.Department.name : null
          };
        });
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
    
    console.log(`Pobrano ${items.length} elementów słownika ${type}`);
    res.json(items);
  } catch (err) {
    console.error(`Błąd podczas pobierania słownika ${req.params.type}:`, err);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
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
    console.log(`Dodawanie nowego elementu do słownika ${type}:`, req.body);
    
    let newItem;
    
    switch (type) {
      case 'departments':
        newItem = await Department.create(req.body);
        break;
      case 'groups':
        newItem = await Group.create(req.body);
        // Pobierz pełne dane z relacją
        if (newItem) {
          newItem = await Group.findByPk(newItem.id, {
            include: [{ model: Department, attributes: ['name'] }]
          });
          
          // Dodaj departmentName
          if (newItem) {
            const groupData = newItem.toJSON();
            newItem = {
              ...groupData,
              departmentName: groupData.Department ? groupData.Department.name : null
            };
          }
        }
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
    
    console.log(`Dodano nowy element do słownika ${type}:`, newItem);
    res.status(201).json(newItem);
  } catch (err) {
    console.error(`Błąd podczas dodawania elementu do słownika ${req.params.type}:`, err);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
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
    console.log(`Aktualizacja elementu słownika ${type} o ID ${id}:`, req.body);
    
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
    
    // Dla grup, pobierz pełne dane z relacją
    if (type === 'groups') {
      item = await Group.findByPk(id, {
        include: [{ model: Department, attributes: ['name'] }]
      });
      
      // Dodaj departmentName
      if (item) {
        const groupData = item.toJSON();
        item = {
          ...groupData,
          departmentName: groupData.Department ? groupData.Department.name : null
        };
      }
    }
    
    console.log(`Zaktualizowano element słownika ${type}:`, item);
    res.json(item);
  } catch (err) {
    console.error(`Błąd podczas aktualizacji elementu słownika ${req.params.type}:`, err);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
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
    console.log(`Usuwanie elementu słownika ${type} o ID ${id}`);
    
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
    console.log(`Usunięto element słownika ${type} o ID ${id}`);
    res.json({ message: 'Element usunięty' });
  } catch (err) {
    console.error(`Błąd podczas usuwania elementu słownika ${req.params.type}:`, err);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
  }
});

module.exports = router;
