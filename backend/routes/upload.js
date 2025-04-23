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
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nie przesłano pliku' });
    }
    
    const { type } = req.body;
    if (!type || !['purchases', 'payroll', 'sales'].includes(type)) {
      return res.status(400).json({ message: 'Nieprawidłowy typ danych' });
    }
    
    // Odczyt pliku Excel
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    if (data.length === 0) {
      return res.status(400).json({ message: 'Plik nie zawiera danych' });
    }
    
    // Zapisanie informacji o przesłanym pliku
    const importedFile = await ImportedFile.create({
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      type,
      importedBy: req.user?.id,
      status: 'processing'
    });
    
    // Przetwarzanie danych w zależności od typu
    let processedCount = 0;
    
    switch (type) {
      case 'purchases':
        for (const row of data) {
          await Purchase.create({
            date: new Date(row.data || row.date || row.Data),
            description: row.description || row.opis || row.Opis,
            amount: parseFloat(row.amount || row.kwota || row.Kwota),
            departmentId: row.departmentId || row.oddzialId,
            groupId: row.groupId || row.grupaId,
            serviceTypeId: row.serviceTypeId || row.rodzajUslugiId,
            contractorId: row.contractorId || row.kontrahentId,
            costCategoryId: row.costCategoryId || row.kategoriaKosztuId,
            importedFileId: importedFile.id
          });
          processedCount++;
        }
        break;
        
      case 'payroll':
        for (const row of data) {
          await Payroll.create({
            date: new Date(row.data || row.date || row.Data),
            description: row.description || row.opis || row.Opis,
            amount: parseFloat(row.amount || row.kwota || row.Kwota),
            departmentId: row.departmentId || row.oddzialId,
            groupId: row.groupId || row.grupaId,
            importedFileId: importedFile.id
          });
          processedCount++;
        }
        break;
        
      case 'sales':
        for (const row of data) {
          await Sale.create({
            date: new Date(row.data || row.date || row.Data),
            description: row.description || row.opis || row.Opis,
            amount: parseFloat(row.amount || row.kwota || row.Kwota),
            departmentId: row.departmentId || row.oddzialId,
            groupId: row.groupId || row.grupaId,
            serviceTypeId: row.serviceTypeId || row.rodzajUslugiId,
            importedFileId: importedFile.id
          });
          processedCount++;
        }
        break;
    }
    
    // Aktualizacja statusu importu
    await importedFile.update({
      status: 'completed',
      processedRows: processedCount
    });
    
    res.status(201).json({
      message: 'Plik został pomyślnie przesłany i przetworzony',
      importedFile,
      processedRows: processedCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   GET /api/upload/history
 * @desc    Pobieranie historii przesłanych plików
 * @access  Private
 */
router.get('/history', async (req, res) => {
  try {
    const importedFiles = await ImportedFile.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.json(importedFiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   GET /api/upload/:id
 * @desc    Pobieranie szczegółów przesłanego pliku
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const importedFile = await ImportedFile.findByPk(req.params.id);
    
    if (!importedFile) {
      return res.status(404).json({ message: 'Plik nie znaleziony' });
    }
    
    res.json(importedFile);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

/**
 * @route   DELETE /api/upload/:id
 * @desc    Usuwanie przesłanego pliku i powiązanych danych
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const importedFile = await ImportedFile.findByPk(req.params.id);
    
    if (!importedFile) {
      return res.status(404).json({ message: 'Plik nie znaleziony' });
    }
    
    // Usuwanie powiązanych danych
    switch (importedFile.type) {
      case 'purchases':
        await Purchase.destroy({ where: { importedFileId: importedFile.id } });
        break;
      case 'payroll':
        await Payroll.destroy({ where: { importedFileId: importedFile.id } });
        break;
      case 'sales':
        await Sale.destroy({ where: { importedFileId: importedFile.id } });
        break;
    }
    
    // Usuwanie pliku z dysku
    if (fs.existsSync(importedFile.filePath)) {
      fs.unlinkSync(importedFile.filePath);
    }
    
    // Usuwanie rekordu z bazy
    await importedFile.destroy();
    
    res.json({ message: 'Plik i powiązane dane zostały usunięte' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

module.exports = router;
