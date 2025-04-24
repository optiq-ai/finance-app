const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * @route   POST /api/auth/login
 * @desc    Automatyczne logowanie użytkownika (autoryzacja wyłączona)
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    // Utworzenie domyślnego użytkownika (autoryzacja wyłączona)
    const defaultUser = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      preferences: {
        darkMode: false,
        notifications: true,
        language: 'pl'
      }
    };

    // Utworzenie tokenu JWT
    const payload = {
      user: {
        id: defaultUser.id,
        username: defaultUser.username,
        role: defaultUser.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: defaultUser
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Pobranie danych zalogowanego użytkownika (autoryzacja wyłączona)
 * @access  Public
 */
router.get('/me', async (req, res) => {
  try {
    // Zwracanie domyślnego użytkownika (autoryzacja wyłączona)
    const defaultUser = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      preferences: {
        darkMode: false,
        notifications: true,
        language: 'pl'
      }
    };

    res.json(defaultUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Zmiana hasła użytkownika (autoryzacja wyłączona)
 * @access  Public
 */
router.post('/change-password', async (req, res) => {
  try {
    // Symulacja zmiany hasła (autoryzacja wyłączona)
    res.json({ message: 'Hasło zostało zmienione' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

module.exports = router;
