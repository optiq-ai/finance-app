const express = require('express');
const router = express.Router();
const seedDictionaries = require('../seeders/dictionarySeeder');

/**
 * @route   POST /api/maintenance/seed-dictionaries
 * @desc    Importuje podstawowe dane słownikowe
 * @access  Private
 */
router.post('/seed-dictionaries', async (req, res) => {
  try {
    console.log('Uruchamianie importu danych słownikowych...');
    const result = await seedDictionaries();
    
    if (result.success) {
      console.log('Import danych słownikowych zakończony sukcesem');
      res.json(result);
    } else {
      console.error('Błąd podczas importu danych słownikowych:', result.message);
      res.status(500).json(result);
    }
  } catch (err) {
    console.error('Nieoczekiwany błąd podczas importu danych słownikowych:', err);
    res.status(500).json({ success: false, message: `Nieoczekiwany błąd: ${err.message}` });
  }
});

module.exports = router;
