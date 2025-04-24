const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const { ImportedFile, Purchase, Payroll, Sale, sequelize } = require('../models');

// Sprawdzenie i utworzenie katalogu uploads
const ensureUploadDirExists = () => {
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Utworzono katalog uploads:', uploadDir);
    } catch (err) {
      console.error('Błąd podczas tworzenia katalogu uploads:', err);
      throw new Error(`Nie można utworzyć katalogu uploads: ${err.message}`);
    }
  }
  return uploadDir;
};

// Upewnij się, że katalog uploads istnieje przy starcie
try {
  ensureUploadDirExists();
} catch (err) {
  console.error('Błąd inicjalizacji katalogu uploads:', err);
}

// Konfiguracja multer dla przesyłania plików
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const uploadDir = ensureUploadDirExists();
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    } catch (err) {
      cb(err);
    }
  }
});

// Funkcja do sprawdzania typu pliku
const fileFilter = (req, file, cb) => {
  try {
    console.log('Sprawdzanie typu pliku:', file.originalname, 'mimetype:', file.mimetype);
    
    // Akceptujemy pliki Excel (.xlsx, .xls) oraz CSV
    const filetypes = /xlsx|xls|csv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    // Sprawdzamy mimetype - może być różny w zależności od przeglądarki
    const mimetypes = /application\/vnd.openxmlformats-officedocument.spreadsheetml.sheet|application\/vnd.ms-excel|application\/octet-stream|text\/csv/;
    const mimetype = mimetypes.test(file.mimetype);
    
    if (extname || mimetype) {
      console.log('Plik zaakceptowany:', file.originalname);
      return cb(null, true);
    } else {
      console.log('Plik odrzucony - nieprawidłowy format:', file.originalname, file.mimetype);
      cb(new Error('Dozwolone są tylko pliki Excel (.xlsx, .xls) oraz CSV'));
    }
  } catch (err) {
    console.error('Błąd podczas sprawdzania typu pliku:', err);
    cb(err);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

// Middleware do obsługi błędów multer
const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Błąd Multer:', err);
    return res.status(400).json({ message: `Błąd przesyłania pliku: ${err.message}` });
  } else if (err) {
    console.error('Błąd podczas przesyłania pliku:', err);
    return res.status(500).json({ message: `Błąd serwera: ${err.message}` });
  }
  next();
};

// Funkcja do parsowania pliku Excel/CSV
const parseFile = (filePath) => {
  console.log('Parsowanie pliku:', filePath);
  
  try {
    // Sprawdzenie rozszerzenia pliku
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.csv') {
      // Parsowanie pliku CSV
      const content = fs.readFileSync(filePath, 'utf8');
      const rows = content.split('\n');
      const headers = rows[0].split(',').map(h => h.trim());
      
      const data = [];
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].trim() === '') continue;
        
        const values = rows[i].split(',').map(v => v.trim());
        const row = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        data.push(row);
      }
      
      console.log(`Odczytano ${data.length} wierszy z pliku CSV`);
      return data;
    } else {
      // Parsowanie pliku Excel
      const workbook = xlsx.readFile(filePath, { 
        cellDates: true,  // Konwertuj daty na obiekty Date
        dateNF: 'yyyy-mm-dd', // Format daty
        raw: false // Nie zwracaj surowych wartości
      });
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet, { 
        raw: false, 
        dateNF: 'yyyy-mm-dd',
        defval: '' // Domyślna wartość dla pustych komórek
      });
      
      console.log(`Odczytano ${data.length} wierszy z pliku Excel`);
      return data;
    }
  } catch (err) {
    console.error('Błąd podczas parsowania pliku:', err);
    throw new Error(`Błąd podczas parsowania pliku: ${err.message}`);
  }
};

// Funkcje mapujące nazwy kolumn z plików Excel na pola w bazie danych
const mapPurchaseFields = (row) => {
  console.log('Mapowanie pól zakupu:', JSON.stringify(row));
  return {
    date: row['Data zakupu'] || row['Data'] || new Date(),
    documentNumber: row['Numer dokumentu'] || row['Nr dokumentu'] || `DOC-${Date.now()}`,
    description: row['Opis'] || row['Kategoria'] || '',
    netAmount: parseFloat(row['Netto'] || row['Kwota netto'] || 0),
    vatAmount: parseFloat(row['VAT'] || row['Kwota VAT'] || 0),
    grossAmount: parseFloat(row['Brutto'] || row['Kwota brutto'] || 0),
    departmentId: row['Oddział'] ? String(row['Oddział']).trim() : null,
    groupId: row['Grupa'] ? String(row['Grupa']).trim() : null,
    serviceTypeId: row['Rodzaj usługi'] ? String(row['Rodzaj usługi']).trim() : null,
    contractorId: row['Kontrahent'] || row['Płatnik'] ? String(row['Kontrahent'] || row['Płatnik']).trim() : null,
    costCategoryId: row['Kategoria kosztu'] || row['Kategoria'] ? String(row['Kategoria kosztu'] || row['Kategoria']).trim() : null
  };
};

const mapPayrollFields = (row) => {
  console.log('Mapowanie pól wypłaty:', JSON.stringify(row));
  return {
    date: row['Data'] || new Date(),
    employeeName: `${row['Nazwisko'] || ''} ${row['Imie'] || ''}`.trim() || 'Nieznany',
    position: row['Tytul_ubezpieczenia'] ? String(row['Tytul_ubezpieczenia']) : '',
    grossAmount: parseFloat(row['Brutto'] || 0),
    taxAmount: parseFloat(row['Zaliczka_podatku'] || 0),
    netAmount: parseFloat(row['Netto'] || 0),
    departmentId: row['Oddział'] ? String(row['Oddział']).trim() : null,
    groupId: row['Grupa'] ? String(row['Grupa']).trim() : null
  };
};

const mapSaleFields = (row) => {
  console.log('Mapowanie pól sprzedaży:', JSON.stringify(row));
  return {
    date: row['Data usługi'] || row['Data wyst.'] || new Date(),
    documentNumber: row['Numer dokumentu'] || `SALE-${Date.now()}`,
    description: row['Rodzaj usługi'] || '',
    netAmount: parseFloat(row['Netto'] || 0),
    vatAmount: 0, // Brak informacji o VAT w pliku sprzedaży
    grossAmount: parseFloat(row['Netto'] || 0), // Brak informacji o kwocie brutto, używamy netto
    departmentId: row['Oddział'] ? String(row['Oddział']).trim() : null,
    groupId: row['Grupa'] ? String(row['Grupa']).trim() : null,
    serviceTypeId: row['Rodzaj usługi'] ? String(row['Rodzaj usługi']).trim() : null,
    customer: row['Kontrahent'] ? String(row['Kontrahent']).trim() : '',
    quantity: parseInt(row['Ilość'] || 1),
    averageValue: parseFloat(row['ŚREDNIA'] || 0)
  };
};

// Implementacja trybu testowego z danymi mock
const MOCK_MODE = false; // Ustaw na true, aby włączyć tryb testowy

/**
 * @route   POST /api/upload
 * @desc    Przesyłanie pliku Excel
 * @access  Private
 */
router.post('/', upload.single('file'), handleMulterErrors, async (req, res) => {
  // Rozpoczęcie transakcji
  const transaction = await sequelize.transaction();
  
  try {
    console.log('Rozpoczęcie przetwarzania pliku...');
    
    // Tryb testowy z danymi mock
    if (MOCK_MODE) {
      console.log('Używanie trybu testowego z danymi mock');
      const mockFile = {
        id: Date.now(),
        fileName: req.body.type === 'purchases' ? 'zakupy_testowe.xlsx' : 
                 req.body.type === 'payroll' ? 'wyplaty_testowe.xlsx' : 'sprzedaz_testowa.xlsx',
        filePath: '/mock/path',
        fileSize: 1024,
        type: req.body.type,
        status: 'completed',
        processedRows: 10
      };
      
      await transaction.commit();
      return res.status(201).json({
        message: 'Plik został pomyślnie przesłany i przetworzony (tryb testowy)',
        importedFile: mockFile,
        processedRows: mockFile.processedRows
      });
    }
    
    if (!req.file) {
      console.log('Błąd: Nie przesłano pliku');
      await transaction.rollback();
      return res.status(400).json({ message: 'Nie przesłano pliku' });
    }

    console.log('Otrzymano plik:', req.file);
    const { type } = req.body;
    console.log('Typ przesłanego pliku:', type);
    
    if (!type || !['purchases', 'payroll', 'sales'].includes(type)) {
      console.log('Błąd: Nieprawidłowy typ danych:', type);
      await transaction.rollback();
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
    }, { transaction });
    console.log('Utworzono rekord ImportedFile:', importedFile.id);

    // Odczytanie pliku Excel/CSV
    console.log('Odczytywanie pliku:', req.file.path);
    let data;
    try {
      data = parseFile(req.file.path);
    } catch (err) {
      console.error('Błąd podczas odczytu pliku:', err);
      await importedFile.update({
        status: 'error',
        errorMessage: err.message
      }, { transaction });
      await transaction.commit(); // Zapisujemy informację o błędzie
      return res.status(400).json({ message: `Błąd podczas odczytu pliku: ${err.message}` });
    }

    let processedRows = 0;

    // Przetwarzanie danych w zależności od typu
    if (type === 'purchases') {
      console.log('Przetwarzanie danych zakupów...');
      for (const row of data) {
        try {
          const mappedData = mapPurchaseFields(row);
          console.log('Zmapowane dane zakupu:', JSON.stringify(mappedData));
          
          const purchaseData = {
            ...mappedData,
            importedFileId: importedFile.id
          };
          
          await Purchase.create(purchaseData, { transaction });
          processedRows++;
        } catch (err) {
          console.error('Błąd podczas przetwarzania wiersza zakupu:', err);
          // Kontynuujemy przetwarzanie pozostałych wierszy
        }
      }
    } else if (type === 'payroll') {
      console.log('Przetwarzanie danych wypłat...');
      for (const row of data) {
        try {
          const mappedData = mapPayrollFields(row);
          console.log('Zmapowane dane wypłaty:', JSON.stringify(mappedData));
          
          const payrollData = {
            ...mappedData,
            importedFileId: importedFile.id
          };
          
          await Payroll.create(payrollData, { transaction });
          processedRows++;
        } catch (err) {
          console.error('Błąd podczas przetwarzania wiersza wypłaty:', err);
          // Kontynuujemy przetwarzanie pozostałych wierszy
        }
      }
    } else if (type === 'sales') {
      console.log('Przetwarzanie danych sprzedaży...');
      for (const row of data) {
        try {
          const mappedData = mapSaleFields(row);
          console.log('Zmapowane dane sprzedaży:', JSON.stringify(mappedData));
          
          const saleData = {
            ...mappedData,
            importedFileId: importedFile.id
          };
          
          await Sale.create(saleData, { transaction });
          processedRows++;
        } catch (err) {
          console.error('Błąd podczas przetwarzania wiersza sprzedaży:', err);
          // Kontynuujemy przetwarzanie pozostałych wierszy
        }
      }
    }

    // Aktualizacja informacji o pliku
    console.log('Aktualizacja statusu pliku, przetworzono wierszy:', processedRows);
    await importedFile.update({
      status: 'completed',
      rowsCount: processedRows
    }, { transaction });

    // Zatwierdzenie transakcji
    await transaction.commit();

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
    // Wycofanie transakcji w przypadku błędu
    await transaction.rollback();
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
    
    // Tryb testowy z danymi mock
    if (MOCK_MODE) {
      console.log('Używanie trybu testowego z danymi mock dla historii');
      const mockHistory = [
        {
          id: 1,
          fileName: 'zakupy_testowe.xlsx',
          fileSize: 1024,
          type: 'purchases',
          status: 'completed',
          processedRows: 10,
          createdAt: new Date(),
          date: new Date()
        },
        {
          id: 2,
          fileName: 'wyplaty_testowe.xlsx',
          fileSize: 2048,
          type: 'payroll',
          status: 'completed',
          processedRows: 5,
          createdAt: new Date(Date.now() - 86400000), // wczoraj
          date: new Date(Date.now() - 86400000)
        }
      ];
      return res.json(mockHistory);
    }
    
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
    console.log(`Pobieranie szczegółów pliku o ID: ${fileId}`);
    
    // Tryb testowy z danymi mock
    if (MOCK_MODE) {
      console.log('Używanie trybu testowego z danymi mock dla szczegółów pliku');
      const mockDetails = {
        id: fileId,
        fileName: 'zakupy_testowe.xlsx',
        filePath: '/mock/path',
        fileSize: 1024,
        type: 'purchases',
        status: 'completed',
        processedRows: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        sampleData: [
          { date: new Date(), documentNumber: 'DOC-001', description: 'Testowy zakup 1', netAmount: 100, vatAmount: 23, grossAmount: 123 },
          { date: new Date(), documentNumber: 'DOC-002', description: 'Testowy zakup 2', netAmount: 200, vatAmount: 46, grossAmount: 246 }
        ]
      };
      return res.json(mockDetails);
    }
    
    // Pobieranie rzeczywistych danych z bazy
    const importedFile = await ImportedFile.findByPk(fileId);
    
    if (!importedFile) {
      console.log(`Nie znaleziono pliku o ID: ${fileId}`);
      return res.status(404).json({ message: 'Nie znaleziono pliku o podanym ID' });
    }
    
    console.log(`Znaleziono plik: ${importedFile.originalFilename}, typ: ${importedFile.fileType}`);
    
    // Pobieranie danych powiązanych z plikiem
    let importedData = [];
    try {
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
      console.log(`Pobrano ${importedData.length} rekordów powiązanych z plikiem`);
    } catch (err) {
      console.error('Błąd podczas pobierania danych powiązanych z plikiem:', err);
      // Kontynuujemy mimo błędu
    }
    
    res.json({
      id: importedFile.id,
      fileName: importedFile.originalFilename,
      filePath: importedFile.filename,
      fileSize: 0, // Brak informacji o rozmiarze w modelu
      type: importedFile.fileType === 'purchase' ? 'purchases' : 
            importedFile.fileType === 'payroll' ? 'payroll' : 'sales',
      status: importedFile.status,
      processedRows: importedFile.rowsCount,
      createdAt: importedFile.importDate,
      updatedAt: importedFile.updatedAt,
      sampleData: importedData
    });
  } catch (err) {
    console.error('Upload details error:', err);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
  }
});

/**
 * @route   DELETE /api/upload/:id
 * @desc    Usuwanie przesłanego pliku i powiązanych danych
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  // Rozpoczęcie transakcji
  const transaction = await sequelize.transaction();
  
  try {
    const fileId = req.params.id;
    console.log(`Usuwanie pliku o ID: ${fileId}`);
    
    // Tryb testowy z danymi mock
    if (MOCK_MODE) {
      console.log('Używanie trybu testowego z danymi mock dla usuwania pliku');
      return res.json({ message: 'Plik i powiązane dane zostały usunięte (tryb testowy)' });
    }
    
    // Pobieranie informacji o pliku
    const importedFile = await ImportedFile.findByPk(fileId);
    
    if (!importedFile) {
      console.log(`Nie znaleziono pliku o ID: ${fileId}`);
      await transaction.rollback();
      return res.status(404).json({ message: 'Nie znaleziono pliku o podanym ID' });
    }
    
    console.log(`Znaleziono plik: ${importedFile.originalFilename}, typ: ${importedFile.fileType}`);
    
    // Usuwanie powiązanych danych w zależności od typu pliku
    try {
      if (importedFile.fileType === 'purchase') {
        const deleted = await Purchase.destroy({ 
          where: { importedFileId: fileId },
          transaction
        });
        console.log(`Usunięto ${deleted} rekordów zakupów`);
      } else if (importedFile.fileType === 'payroll') {
        const deleted = await Payroll.destroy({ 
          where: { importedFileId: fileId },
          transaction
        });
        console.log(`Usunięto ${deleted} rekordów wypłat`);
      } else if (importedFile.fileType === 'sale') {
        const deleted = await Sale.destroy({ 
          where: { importedFileId: fileId },
          transaction
        });
        console.log(`Usunięto ${deleted} rekordów sprzedaży`);
      }
    } catch (err) {
      console.error('Błąd podczas usuwania powiązanych danych:', err);
      await transaction.rollback();
      return res.status(500).json({ message: `Błąd podczas usuwania powiązanych danych: ${err.message}` });
    }
    
    // Usuwanie fizycznego pliku z serwera
    try {
      const filePath = path.join(__dirname, '../uploads', importedFile.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Usunięto plik fizyczny: ${filePath}`);
      } else {
        console.log(`Plik fizyczny nie istnieje: ${filePath}`);
      }
    } catch (err) {
      console.error('Błąd podczas usuwania pliku fizycznego:', err);
      // Kontynuujemy mimo błędu usuwania pliku fizycznego
    }
    
    // Usuwanie rekordu z bazy danych
    await importedFile.destroy({ transaction });
    console.log(`Usunięto rekord ImportedFile o ID: ${fileId}`);
    
    // Zatwierdzenie transakcji
    await transaction.commit();
    
    res.json({ message: 'Plik i powiązane dane zostały usunięte' });
  } catch (err) {
    // Wycofanie transakcji w przypadku błędu
    await transaction.rollback();
    console.error('Upload delete error:', err);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
  }
});

module.exports = router;
