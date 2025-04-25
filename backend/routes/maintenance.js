const express = require('express');
const router = express.Router();
const populateDictionaries = require('../scripts/populateDictionaries');

// Endpoint do automatycznego wypełniania słowników na podstawie istniejących danych
router.post('/populate-dictionaries', async (req, res) => {
  try {
    const stats = await populateDictionaries();
    res.json({
      success: true,
      message: 'Słowniki zostały pomyślnie wypełnione na podstawie istniejących danych',
      stats
    });
  } catch (error) {
    console.error('Błąd podczas wypełniania słowników:', error);
    res.status(500).json({
      success: false,
      message: 'Wystąpił błąd podczas wypełniania słowników',
      error: error.message
    });
  }
});

// Dodatkowy endpoint z inną nazwą dla kompatybilności
router.post('/seed-dictionaries', async (req, res) => {
  try {
    const stats = await populateDictionaries();
    res.json({
      success: true,
      message: 'Słowniki zostały pomyślnie wypełnione na podstawie istniejących danych',
      stats
    });
  } catch (error) {
    console.error('Błąd podczas wypełniania słowników:', error);
    res.status(500).json({
      success: false,
      message: 'Wystąpił błąd podczas wypełniania słowników',
      error: error.message
    });
  }
});

module.exports = router;
