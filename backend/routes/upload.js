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
    console.log('Rozpoczęcie przetwarzania pliku...');
    if (!req.file) {
      console.log('Błąd: Nie przesłano pliku');
      return res.status(400).json({ message: 'Nie przesłano pliku' });
    }

    const { type } = req.body;
    console.log('Typ przesłanego pliku:', type);
    
    if (!type || !['purchases', 'payroll', 'sales'].includes(type)) {
      console.log('Błąd: Nieprawidłowy typ danych:', type);
      return res.status(400).json({ message: 'Nieprawidłowy typ danych' });
    }

    // Zapisanie informacji o pliku w bazie danych
    console.log('Tworzenie rekordu ImportedFile...');
    const importedFile = await ImportedFile.create({
      filename: req.file.filename,
      originalFilename: req.file.originalname,
      fileType: type === 'purchases' ? 'purchase' : type === 'payroll' ? 'payroll' : 'sale',
      status: 'processing',
      importDate: new Date(),
      importedBy: req.user ? req.user.id : null
    });
    console.log('Utworzono rekord ImportedFile:', importedFile.id);

    // Odczytanie pliku Excel
    console.log('Odczytywanie pliku Excel:', req.file.path);
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    console.log('Odczytano wierszy z pliku Excel:', data.length);

    let processedRows = 0;

    // Przetwarzanie danych w zależności od typu
    if (type === 'purchases') {
      console.log('Przetwarzanie danych zakupów...');
      for (const row of data) {
        console.log('Przetwarzanie wiersza zakupu:', JSON.stringify(row));
        await Purchase.create({
          date: row.date ? new Date(row.date) : new Date(),
          documentNumber: row.documentNumber || `DOC-${Date.now()}`,
          description: row.description || '',
          netAmount: parseFloat(row.netAmount) || 0,
          vatAmount: parseFloat(row.vatAmount) || 0,
          grossAmount: parseFloat(row.grossAmount) || 0,
          departmentId: row.departmentId || null,
          groupId: row.groupId || null,
          serviceTypeId: row.serviceTypeId || null,
          contractorId: row.contractorId || null,
          costCategoryId: row.costCategoryId || null,
          importedFileId: importedFile.id
        });
        processedRows++;
      }
    } else if (type === 'payroll') {
      console.log('Przetwarzanie danych wypłat...');
      for (const row of data) {
        console.log('Przetwarzanie wiersza wypłaty:', JSON.stringify(row));
        await Payroll.create({
          date: row.date ? new Date(row.date) : new Date(),
          employee: row.employee || '',
          grossAmount: parseFloat(row.grossAmount) || 0,
          contributions: parseFloat(row.contributions) || 0,
          tax: parseFloat(row.tax) || 0,
          netAmount: parseFloat(row.netAmount) || 0,
          departmentId: row.departmentId || null,
          groupId: row.groupId || null,
          serviceTypeId: row.serviceTypeId || null,
          category: row.category || '',
          importedFileId: importedFile.id
        });
        processedRows++;
      }
    } else if (type === 'sales') {
      console.log('Przetwarzanie danych sprzedaży...');
      for (const row of data) {
        console.log('Przetwarzanie wiersza sprzedaży:', JSON.stringify(row));
        await Sale.create({
          date: row.date ? new Date(row.date) : new Date(),
          customer: row.customer || '',
          quantity: parseInt(row.quantity) || 1,
          netAmount: parseFloat(row.netAmount) || 0,
          averageValue: parseFloat(row.averageValue) || 0,
          departmentId: row.departmentId || null,
          groupId: row.groupId || null,
          serviceTypeId: row.serviceTypeId || null,
          category: row.category || '',
          importedFileId: importedFile.id
        });
        processedRows++;
      }
    }

    // Aktualizacja informacji o pliku
    console.log('Aktualizacja statusu pliku, przetworzono wierszy:', processedRows);
    await importedFile.update({
      status: 'completed',
      rowsCount: processedRows
    });

    console.log('Przetwarzanie pliku zakończone pomyślnie');
    res.status(201).json({
      message: 'Plik został pomyślnie przesłany i przetworzony',
      importedFile: {
        id: importedFile.id,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        type: type,
        status: 'completed',
        processedRows: processedRows
      },
      processedRows: processedRows
    });
  } catch (err) {
    console.error('Upload error:', err);
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
    console.log('Pobieranie historii przesłanych plików...');
    
    // Pobieranie rzeczywistych danych z bazy
    const importedFiles = await ImportedFile.findAll({
      order: [['importDate', 'DESC']]
    });
    
    console.log(`Znaleziono ${importedFiles.length} plików w historii`);
    
    // Mapowanie danych do odpowiedniego formatu
    const history = importedFiles.map(file => ({
      id: file.id,
      fileName: file.originalFilename,
      fileSize: 0, // Brak informacji o rozmiarze w modelu, można dodać później
      type: file.fileType === 'purchase' ? 'purchases' : 
            file.fileType === 'payroll' ? 'payroll' : 'sales',
      status: file.status,
      processedRows: file.rowsCount,
      createdAt: file.importDate,
      date: file.importDate // Dodane dla kompatybilności z formatowaniem dat
    }));
    
    console.log('Historia plików:', JSON.stringify(history));
    res.json(history);
  } catch (err) {
    console.error('Upload history error:', err);
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
    const fileId = req.params.id;
    
    // Pobieranie rzeczywistych danych z bazy
    const importedFile = await ImportedFile.findByPk(fileId);
    
    if (!importedFile) {
      return res.status(404).json({ message: 'Nie znaleziono pliku o podanym ID' });
    }
    
    // Pobieranie danych powiązanych z plikiem
    let importedData = [];
    if (importedFile.fileType === 'purchase') {
      importedData = await Purchase.findAll({
        where: { importedFileId: fileId },
        limit: 100 // Ograniczenie dla wydajności
      });
    } else if (importedFile.fileType === 'payroll') {
      importedData = await Payroll.findAll({
        where: { importedFileId: fileId },
        limit: 100 // Ograniczenie dla wydajności
      });
    } else if (importedFile.fileType === 'sale') {
      importedData = await Sale.findAll({
        where: { importedFileId: fileId },
        limit: 100 // Ograniczenie dla wydajności
      });
    }
    
    res.json({
      id: importedFile.id,
      fileName: importedFile.originalFilename,
      filePath: importedFile.filename, // Ścieżka do pliku na serwerze
      fileSize: 0, // Brak informacji o rozmiarze w modelu
      type: importedFile.fileType === 'purchase' ? 'purchases' : 
            importedFile.fileType === 'payroll' ? 'payroll' : 'sales',
      status: importedFile.status,
      processedRows: importedFile.rowsCount,
      createdAt: importedFile.importDate,
      updatedAt: importedFile.updatedAt,
      sampleData: importedData.slice(0, 10) // Przykładowe dane (pierwsze 10 rekordów)
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
    const fileId = req.params.id;
    
    // Pobieranie informacji o pliku
    const importedFile = await ImportedFile.findByPk(fileId);
    
    if (!importedFile) {
      return res.status(404).json({ message: 'Nie znaleziono pliku o podanym ID' });
    }
    
    // Usuwanie powiązanych danych w zależności od typu pliku
    if (importedFile.fileType === 'purchase') {
      await Purchase.destroy({ where: { importedFileId: fileId } });
    } else if (importedFile.fileType === 'payroll') {
      await Payroll.destroy({ where: { importedFileId: fileId } });
    } else if (importedFile.fileType === 'sale') {
      await Sale.destroy({ where: { importedFileId: fileId } });
    }
    
    // Usuwanie fizycznego pliku z serwera
    const filePath = path.join(__dirname, '../uploads', importedFile.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Usuwanie rekordu z bazy danych
    await importedFile.destroy();
    
    res.json({ message: 'Plik i powiązane dane zostały usunięte' });
  } catch (err) {
    console.error('Upload delete error:', err.message);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
  }
});

module.exports = router;
