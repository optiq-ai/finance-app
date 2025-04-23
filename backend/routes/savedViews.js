const express = require('express');
const router = express.Router();
const { SavedView } = require('../models');

/**
 * @route   GET /api/saved-views
 * @desc    Pobieranie zapisanych widoków użytkownika
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const savedViews = await SavedView.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(savedViews);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   GET /api/saved-views/:id
 * @desc    Pobieranie szczegółów zapisanego widoku
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const savedView = await SavedView.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!savedView) {
      return res.status(404).json({ message: 'Zapisany widok nie znaleziony' });
    }
    
    res.json(savedView);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   POST /api/saved-views
 * @desc    Zapisywanie nowego widoku
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const { name, type, filters, columns } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ message: 'Nazwa i typ są wymagane' });
    }
    
    const savedView = await SavedView.create({
      name,
      type,
      filters: filters || {},
      columns: columns || [],
      userId: req.user.id
    });
    
    res.status(201).json(savedView);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   PUT /api/saved-views/:id
 * @desc    Aktualizacja zapisanego widoku
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const savedView = await SavedView.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!savedView) {
      return res.status(404).json({ message: 'Zapisany widok nie znaleziony' });
    }
    
    const { name, filters, columns } = req.body;
    
    await savedView.update({
      name: name || savedView.name,
      filters: filters || savedView.filters,
      columns: columns || savedView.columns
    });
    
    res.json(savedView);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   DELETE /api/saved-views/:id
 * @desc    Usuwanie zapisanego widoku
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const savedView = await SavedView.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!savedView) {
      return res.status(404).json({ message: 'Zapisany widok nie znaleziony' });
    }
    
    await savedView.destroy();
    
    res.json({ message: 'Zapisany widok został usunięty' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

module.exports = router;
