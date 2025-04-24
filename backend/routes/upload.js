const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const { ImportedFile, Purchase, Payroll, Sale } = require('../models');

// Konfiguracja multer dla przesyłania plików
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /xlsx|xls/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Dozwolone są tylko pliki Excel (.xlsx, .xls)'));
    }
  }
});

/**
 * @route   POST /api/upload
 * @desc    Przesyłanie pliku Excel
 * @access  Private
 */
router.post('/', (req, res) => {
  try {
    // Zwracamy przykładową odpowiedź sukcesu bez faktycznego przetwarzania pliku
    res.status(201).json({
      message: 'Plik został pomyślnie przesłany i przetworzony',
      importedFile: {
        id: 1,
        fileName: 'example.xlsx',
        filePath: '/path/to/file',
        fileSize: 1024,
        type: 'purchases',
        status: 'completed',
        processedRows: 10
      },
      processedRows: 10
    });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
  }
});

/**
 * @route   GET /api/upload/history
 * @desc    Pobieranie historii przesłanych plików
 * @access  Private
 */
router.get('/history', async (req, res) => {
  try {
    // Zwracamy przykładowe dane historii
    res.json([
      {
        id: 1,
        fileName: 'example1.xlsx',
        fileSize: 1024,
        type: 'purchases',
        status: 'completed',
        processedRows: 10,
        createdAt: new Date()
      },
      {
        id: 2,
        fileName: 'example2.xlsx',
        fileSize: 2048,
        type: 'sales',
        status: 'completed',
        processedRows: 15,
        createdAt: new Date(Date.now() - 86400000) // wczoraj
      }
    ]);
  } catch (err) {
    console.error('Upload history error:', err.message);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
  }
});

/**
 * @route   GET /api/upload/:id
 * @desc    Pobieranie szczegółów przesłanego pliku
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    // Zwracamy przykładowe dane szczegółowe
    res.json({
      id: req.params.id,
      fileName: 'example.xlsx',
      filePath: '/path/to/file',
      fileSize: 1024,
      type: 'purchases',
      status: 'completed',
      processedRows: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (err) {
    console.error('Upload details error:', err.message);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
  }
});

/**
 * @route   DELETE /api/upload/:id
 * @desc    Usuwanie przesłanego pliku i powiązanych danych
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    // Zwracamy przykładową odpowiedź sukcesu
    res.json({ message: 'Plik i powiązane dane zostały usunięte' });
  } catch (err) {
    console.error('Upload delete error:', err.message);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
  }
});

module.exports = router;
