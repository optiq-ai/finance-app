const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

/**
 * @route   POST /api/auth/login
 * @desc    Logowanie użytkownika
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Sprawdzenie czy użytkownik istnieje
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Nieprawidłowa nazwa użytkownika lub hasło' });
    }

    // Sprawdzenie hasła
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Nieprawidłowa nazwa użytkownika lub hasło' });
    }

    // Utworzenie tokenu JWT
    const payload = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role
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
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            preferences: user.preferences
          }
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
 * @desc    Pobranie danych zalogowanego użytkownika
 * @access  Private
 */
router.get('/me', async (req, res) => {
  try {
    // Middleware auth powinien dodać req.user
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Zmiana hasła użytkownika
 * @access  Private
 */
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Pobranie użytkownika
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    // Sprawdzenie aktualnego hasła
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Aktualne hasło jest nieprawidłowe' });
    }

    // Hashowanie nowego hasła
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Hasło zostało zmienione' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

module.exports = router;
