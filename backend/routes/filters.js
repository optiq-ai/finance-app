const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

/**
 * @route   GET /api/filters/common
 * @desc    Pobieranie wspólnych filtrów dla wszystkich modułów
 * @access  Private
 */
router.get('/common', async (req, res) => {
  try {
    // Zwracanie wspólnych filtrów, które mogą być używane w różnych modułach
    const commonFilters = {
      dateRanges: [
        { id: 'today', name: 'Dzisiaj' },
        { id: 'yesterday', name: 'Wczoraj' },
        { id: 'thisWeek', name: 'Bieżący tydzień' },
        { id: 'lastWeek', name: 'Poprzedni tydzień' },
        { id: 'thisMonth', name: 'Bieżący miesiąc' },
        { id: 'lastMonth', name: 'Poprzedni miesiąc' },
        { id: 'thisQuarter', name: 'Bieżący kwartał' },
        { id: 'lastQuarter', name: 'Poprzedni kwartał' },
        { id: 'thisYear', name: 'Bieżący rok' },
        { id: 'lastYear', name: 'Poprzedni rok' },
        { id: 'custom', name: 'Niestandardowy zakres' }
      ],
      sortOptions: [
        { id: 'date_desc', name: 'Data (od najnowszych)' },
        { id: 'date_asc', name: 'Data (od najstarszych)' },
        { id: 'amount_desc', name: 'Kwota (od największych)' },
        { id: 'amount_asc', name: 'Kwota (od najmniejszych)' }
      ]
    };
    
    res.json(commonFilters);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   POST /api/filters/date-range
 * @desc    Konwersja identyfikatora zakresu dat na konkretne daty
 * @access  Private
 */
router.post('/date-range', (req, res) => {
  try {
    const { rangeId, customStart, customEnd } = req.body;
    
    if (rangeId === 'custom') {
      if (!customStart || !customEnd) {
        return res.status(400).json({ message: 'Dla niestandardowego zakresu wymagane są daty początkowa i końcowa' });
      }
      
      return res.json({
        start: customStart,
        end: customEnd
      });
    }
    
    const now = new Date();
    let start, end;
    
    switch (rangeId) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
        
      case 'yesterday':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
        break;
        
      case 'thisWeek':
        // Poniedziałek bieżącego tygodnia
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        start.setHours(0, 0, 0, 0);
        
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
        
      case 'lastWeek':
        // Poniedziałek poprzedniego tygodnia
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay() - 6);
        start.setHours(0, 0, 0, 0);
        
        // Niedziela poprzedniego tygodnia
        end = new Date(now);
        end.setDate(now.getDate() - now.getDay());
        end.setHours(23, 59, 59, 999);
        break;
        
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
        
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
        
      case 'thisQuarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), currentQuarter * 3, 1);
        end = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59, 999);
        break;
        
      case 'lastQuarter':
        const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
        const yearOfLastQuarter = lastQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
        const adjustedLastQuarter = lastQuarter < 0 ? 3 : lastQuarter;
        
        start = new Date(yearOfLastQuarter, adjustedLastQuarter * 3, 1);
        end = new Date(yearOfLastQuarter, (adjustedLastQuarter + 1) * 3, 0, 23, 59, 59, 999);
        break;
        
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
        
      case 'lastYear':
        start = new Date(now.getFullYear() - 1, 0, 1);
        end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        break;
        
      default:
        return res.status(400).json({ message: 'Nieprawidłowy identyfikator zakresu dat' });
    }
    
    res.json({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   POST /api/filters/build-query
 * @desc    Budowanie warunków zapytania na podstawie filtrów
 * @access  Private
 */
router.post('/build-query', (req, res) => {
  try {
    const { filters } = req.body;
    
    if (!filters) {
      return res.status(400).json({ message: 'Filtry są wymagane' });
    }
    
    const queryConditions = {};
    
    // Przetwarzanie filtrów dat
    if (filters.dateFrom && filters.dateTo) {
      queryConditions.date = {
        [Op.between]: [new Date(filters.dateFrom), new Date(filters.dateTo)]
      };
    } else if (filters.dateFrom) {
      queryConditions.date = {
        [Op.gte]: new Date(filters.dateFrom)
      };
    } else if (filters.dateTo) {
      queryConditions.date = {
        [Op.lte]: new Date(filters.dateTo)
      };
    }
    
    // Przetwarzanie innych filtrów
    const simpleFilters = [
      'departmentId', 'groupId', 'serviceTypeId', 'contractorId', 'costCategoryId'
    ];
    
    simpleFilters.forEach(filter => {
      if (filters[filter]) {
        queryConditions[filter] = filters[filter];
      }
    });
    
    // Przetwarzanie filtrów tekstowych
    if (filters.searchText) {
      queryConditions.description = {
        [Op.like]: `%${filters.searchText}%`
      };
    }
    
    // Przetwarzanie filtrów kwotowych
    if (filters.amountFrom && filters.amountTo) {
      queryConditions.amount = {
        [Op.between]: [parseFloat(filters.amountFrom), parseFloat(filters.amountTo)]
      };
    } else if (filters.amountFrom) {
      queryConditions.amount = {
        [Op.gte]: parseFloat(filters.amountFrom)
      };
    } else if (filters.amountTo) {
      queryConditions.amount = {
        [Op.lte]: parseFloat(filters.amountTo)
      };
    }
    
    res.json({
      conditions: queryConditions,
      order: filters.sortBy ? [[filters.sortBy.split('_')[0], filters.sortBy.split('_')[1].toUpperCase()]] : [['date', 'DESC']]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

module.exports = router;
