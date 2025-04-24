const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const { ImportedFile, Purchase, Payroll, Sale, Department, Group, ServiceType, Contractor, CostCategory, sequelize } = require('../models');

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
      if (data.length > 0) {
        console.log('Przykładowy wiersz:', JSON.stringify(data[0]));
        console.log('Kolumny w pliku:', Object.keys(data[0]).join(', '));
      }
      return data;
    }
  } catch (err) {
    console.error('Błąd podczas parsowania pliku:', err);
    throw new Error(`Błąd podczas parsowania pliku: ${err.message}`);
  }
};

// Funkcja pomocnicza do konwersji wartości na liczbę całkowitą lub null
const safeToInteger = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  // Próba konwersji na liczbę całkowitą
  const parsed = parseInt(value, 10);
  
  // Jeśli konwersja się nie powiedzie, zwróć null
  if (isNaN(parsed)) {
    console.log(`Wartość "${value}" nie może być przekonwertowana na liczbę całkowitą, zwracam null`);
    return null;
  }
  
  return parsed;
};

// Funkcja pomocnicza do konwersji wartości na liczbę zmiennoprzecinkową lub 0
const safeToFloat = (value) => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  
  // Jeśli wartość jest stringiem, usuń spacje, zamień przecinki na kropki i usuń symbole waluty
  if (typeof value === 'string') {
    value = value.trim()
      .replace(/\s+/g, '')  // Usuń wszystkie spacje
      .replace(/,/g, '.')   // Zamień przecinki na kropki
      .replace(/[^\d.-]/g, ''); // Usuń wszystkie znaki oprócz cyfr, kropek i minusów
  }
  
  // Próba konwersji na liczbę zmiennoprzecinkową
  const parsed = parseFloat(value);
  
  // Jeśli konwersja się nie powiedzie, zwróć 0
  if (isNaN(parsed)) {
    console.log(`Wartość "${value}" nie może być przekonwertowana na liczbę zmiennoprzecinkową, zwracam 0`);
    return 0;
  }
  
  return parsed;
};

// Funkcje do wyszukiwania identyfikatorów na podstawie nazw
const findDepartmentId = async (name) => {
  if (!name) return null;
  
  try {
    const department = await Department.findOne({
      where: { name: name.trim() }
    });
    
    if (department) {
      console.log(`Znaleziono departament: ${name} => ID: ${department.id}`);
      return department.id;
    } else {
      console.log(`Nie znaleziono departamentu o nazwie: ${name}`);
      return null;
    }
  } catch (err) {
    console.error(`Błąd podczas wyszukiwania departamentu ${name}:`, err);
    return null;
  }
};

const findGroupId = async (name) => {
  if (!name) return null;
  
  try {
    const group = await Group.findOne({
      where: { name: name.trim() }
    });
    
    if (group) {
      console.log(`Znaleziono grupę: ${name} => ID: ${group.id}`);
      return group.id;
    } else {
      console.log(`Nie znaleziono grupy o nazwie: ${name}`);
      return null;
    }
  } catch (err) {
    console.error(`Błąd podczas wyszukiwania grupy ${name}:`, err);
    return null;
  }
};

const findServiceTypeId = async (name) => {
  if (!name) return null;
  
  try {
    const serviceType = await ServiceType.findOne({
      where: { name: name.trim() }
    });
    
    if (serviceType) {
      console.log(`Znaleziono rodzaj usługi: ${name} => ID: ${serviceType.id}`);
      return serviceType.id;
    } else {
      console.log(`Nie znaleziono rodzaju usługi o nazwie: ${name}`);
      return null;
    }
  } catch (err) {
    console.error(`Błąd podczas wyszukiwania rodzaju usługi ${name}:`, err);
    return null;
  }
};

const findContractorId = async (name) => {
  if (!name) return null;
  
  try {
    const contractor = await Contractor.findOne({
      where: { name: name.trim() }
    });
    
    if (contractor) {
      console.log(`Znaleziono kontrahenta: ${name} => ID: ${contractor.id}`);
      return contractor.id;
    } else {
      console.log(`Nie znaleziono kontrahenta o nazwie: ${name}`);
      return null;
    }
  } catch (err) {
    console.error(`Błąd podczas wyszukiwania kontrahenta ${name}:`, err);
    return null;
  }
};

const findCostCategoryId = async (name) => {
  if (!name) return null;
  
  try {
    const costCategory = await CostCategory.findOne({
      where: { name: name.trim() }
    });
    
    if (costCategory) {
      console.log(`Znaleziono kategorię kosztów: ${name} => ID: ${costCategory.id}`);
      return costCategory.id;
    } else {
      console.log(`Nie znaleziono kategorii kosztów o nazwie: ${name}`);
      return null;
    }
  } catch (err) {
    console.error(`Błąd podczas wyszukiwania kategorii kosztów ${name}:`, err);
    return null;
  }
};

// Funkcje mapujące nazwy kolumn z plików Excel na pola w bazie danych
// Zaktualizowane na podstawie analizy rzeczywistych plików i z konwersją typów
const mapPurchaseFields = async (row) => {
  console.log('Mapowanie pól zakupu:', JSON.stringify(row));
  
  // Pobierz wartości z pliku Excel
  const date = row['Data zakupu'] || row['Data wpływu'] || new Date();
  const documentNumber = row['Numer dokumentu'] || `DOC-${Date.now()}`;
  const description = row['Opis'] || row['Kategoria'] || '';
  const netAmount = safeToFloat(row['Netto']);
  const vatAmount = safeToFloat(row['VAT']);
  const grossAmount = safeToFloat(row['Brutto']);
  
  // Wyszukiwanie identyfikatorów na podstawie nazw
  const departmentId = await findDepartmentId(row['Oddział']);
  const groupId = await findGroupId(row['Kolumna2'] || row['Grupa']);
  const serviceTypeId = await findServiceTypeId(row['Kolumna3'] || row['Rodzaj usługi']);
  const contractorId = await findContractorId(row['Kontrahent'] || row['Płatnik']);
  const costCategoryId = await findCostCategoryId(row['Kategoria']);
  
  const result = {
    date,
    documentNumber,
    description,
    netAmount,
    vatAmount,
    grossAmount,
    departmentId,
    groupId,
    serviceTypeId,
    contractorId,
    costCategoryId
  };
  
  console.log('Zmapowane dane zakupu po konwersji typów:', JSON.stringify(result));
  return result;
};

const mapPayrollFields = async (row) => {
  console.log('Mapowanie pól wypłaty:', JSON.stringify(row));
  
  // Pobierz wartości z pliku Excel
  const date = row['Data'] || new Date();
  const employeeName = `${row['Nazwisko'] || ''} ${row['Imie'] || ''}`.trim() || 'Nieznany';
  const position = row['Tytul_ubezpieczenia'] ? String(row['Tytul_ubezpieczenia']) : '';
  const grossAmount = safeToFloat(row['Brutto']);
  const taxAmount = safeToFloat(row['Zaliczka_podatku']);
  const netAmount = safeToFloat(row['Netto']);
  
  // Wyszukiwanie identyfikatorów na podstawie nazw
  const departmentId = await findDepartmentId(row['Oddział']);
  const groupId = await findGroupId(row['Grupa']);
  
  const result = {
    date,
    employeeName,
    position,
    grossAmount,
    taxAmount,
    netAmount,
    departmentId,
    groupId
  };
  
  console.log('Zmapowane dane wypłaty po konwersji typów:', JSON.stringify(result));
  return result;
};

const mapSaleFields = async (row) => {
  console.log('Mapowanie pól sprzedaży:', JSON.stringify(row));
  
  // Pobierz wartości z pliku Excel
  const date = row['Data usługi'] || row['Data wyst.'] || new Date();
  const documentNumber = row['Numer dokumentu'] || `SALE-${Date.now()}`;
  const description = row['Rodzaj usługi'] || '';
  
  // Konwersja wartości liczbowych
  const netAmount = safeToFloat(row['Netto']);
  const vatAmount = 0; // Brak kolumny VAT w pliku Sprzedaz.xlsx, ustawiamy na 0
  const grossAmount = safeToFloat(row['Netto']); // Brak kolumny Brutto, używamy Netto
  const quantity = safeToInteger(row['Ilość']) || 1;
  const averageValue = safeToFloat(row['ŚREDNIA']);
  
  // Wyszukiwanie identyfikatorów na podstawie nazw
  const departmentId = await findDepartmentId(row['Oddział']);
  const groupId = await findGroupId(row['Grupa']);
  const serviceTypeId = await findServiceTypeId(row['Rodzaj usługi']);
  
  const customer = row['Kontrahent'] ? String(row['Kontrahent']).trim() : '';
  
  const result = {
    date,
    documentNumber,
    description,
    netAmount,
    vatAmount,
    grossAmount,
    departmentId,
    groupId,
    serviceTypeId,
    customer,
    quantity,
    averageValue
  };
  
  console.log('Zmapowane dane sprzedaży po konwersji typów:', JSON.stringify(result));
  return result;
};

// Implementacja trybu testowego z danymi mock
const MOCK_MODE = false; // Ustaw na true, aby włączyć tryb testowy

/**
 * @route   POST /api/upload
 * @desc    Przesyłanie pliku Excel
 * @access  Private
 */
router.post('/', upload.single('file'), handleMulterErrors, async (req, res) => {
  let importedFile = null;
  
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
      
      return res.status(201).json({
        message: 'Plik został pomyślnie przesłany i przetworzony (tryb testowy)',
        importedFile: mockFile,
        processedRows: mockFile.processedRows
      });
    }
    
    if (!req.file) {
      console.log('Błąd: Nie przesłano pliku');
      return res.status(400).json({ message: 'Nie przesłano pliku' });
    }

    console.log('Otrzymano plik:', req.file);
    const { type } = req.body;
    console.log('Typ przesłanego pliku:', type);
    
    if (!type || !['purchases', 'payroll', 'sales'].includes(type)) {
      console.log('Błąd: Nieprawidłowy typ danych:', type);
      return res.status(400).json({ message: 'Nieprawidłowy typ danych' });
    }

    // Odczytanie pliku Excel/CSV
    console.log('Odczytywanie pliku:', req.file.path);
    let data;
    try {
      data = parseFile(req.file.path);
      console.log(`Odczytano ${data.length} wierszy z pliku`);
      if (data.length === 0) {
        return res.status(400).json({ message: 'Plik nie zawiera danych' });
      }
    } catch (err) {
      console.error('Błąd podczas odczytu pliku:', err);
      return res.status(400).json({ message: `Błąd podczas odczytu pliku: ${err.message}` });
    }

    // Zapisanie informacji o pliku w bazie danych - BEZ TRANSAKCJI
    console.log('Tworzenie rekordu ImportedFile...');
    importedFile = await ImportedFile.create({
      filename: req.file.filename,
      originalFilename: req.file.originalname,
      fileType: type === 'purchases' ? 'purchase' : type === 'payroll' ? 'payroll' : 'sale',
      status: 'processing',
      importDate: new Date(),
      importedBy: req.user ? req.user.id : null
    });
    console.log('Utworzono rekord ImportedFile:', importedFile.id);

    let processedRows = 0;
    let errorRows = 0;
    
    // Przetwarzanie danych w małych partiach
    const BATCH_SIZE = 50;
    
    // Przetwarzanie danych w zależności od typu - BEZ TRANSAKCJI
    if (type === 'purchases') {
      console.log('Przetwarzanie danych zakupów...');
      for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE);
        
        for (const row of batch) {
          try {
            const mappedData = await mapPurchaseFields(row);
            console.log('Zmapowane dane zakupu:', JSON.stringify(mappedData));
            
            const purchaseData = {
              ...mappedData,
              importedFileId: importedFile.id
            };
            
            await Purchase.create(purchaseData);
            processedRows++;
          } catch (err) {
            console.error('Błąd podczas przetwarzania wiersza zakupu:', err);
            console.error('Szczegóły błędu:', JSON.stringify(err, null, 2));
            errorRows++;
            // Kontynuujemy przetwarzanie pozostałych wierszy
          }
        }
        
        // Aktualizacja statusu co każdą partię
        try {
          await ImportedFile.update(
            {
              status: 'processing',
              rowsCount: processedRows
            },
            { where: { id: importedFile.id } }
          );
          console.log(`Zaktualizowano status pliku po przetworzeniu ${processedRows} wierszy`);
        } catch (updateErr) {
          console.error('Błąd podczas aktualizacji statusu pliku:', updateErr);
          // Kontynuujemy mimo błędu aktualizacji
        }
      }
    } else if (type === 'payroll') {
      console.log('Przetwarzanie danych wypłat...');
      for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE);
        
        for (const row of batch) {
          try {
            const mappedData = await mapPayrollFields(row);
            console.log('Zmapowane dane wypłaty:', JSON.stringify(mappedData));
            
            const payrollData = {
              ...mappedData,
              importedFileId: importedFile.id
            };
            
            await Payroll.create(payrollData);
            processedRows++;
          } catch (err) {
            console.error('Błąd podczas przetwarzania wiersza wypłaty:', err);
            console.error('Szczegóły błędu:', JSON.stringify(err, null, 2));
            errorRows++;
            // Kontynuujemy przetwarzanie pozostałych wierszy
          }
        }
        
        // Aktualizacja statusu co każdą partię
        try {
          await ImportedFile.update(
            {
              status: 'processing',
              rowsCount: processedRows
            },
            { where: { id: importedFile.id } }
          );
          console.log(`Zaktualizowano status pliku po przetworzeniu ${processedRows} wierszy`);
        } catch (updateErr) {
          console.error('Błąd podczas aktualizacji statusu pliku:', updateErr);
          // Kontynuujemy mimo błędu aktualizacji
        }
      }
    } else if (type === 'sales') {
      console.log('Przetwarzanie danych sprzedaży...');
      for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE);
        
        for (const row of batch) {
          try {
            const mappedData = await mapSaleFields(row);
            console.log('Zmapowane dane sprzedaży:', JSON.stringify(mappedData));
            
            const saleData = {
              ...mappedData,
              importedFileId: importedFile.id
            };
            
            await Sale.create(saleData);
            processedRows++;
          } catch (err) {
            console.error('Błąd podczas przetwarzania wiersza sprzedaży:', err);
            console.error('Szczegóły błędu:', JSON.stringify(err, null, 2));
            errorRows++;
            // Kontynuujemy przetwarzanie pozostałych wierszy
          }
        }
        
        // Aktualizacja statusu co każdą partię
        try {
          await ImportedFile.update(
            {
              status: 'processing',
              rowsCount: processedRows
            },
            { where: { id: importedFile.id } }
          );
          console.log(`Zaktualizowano status pliku po przetworzeniu ${processedRows} wierszy`);
        } catch (updateErr) {
          console.error('Błąd podczas aktualizacji statusu pliku:', updateErr);
          // Kontynuujemy mimo błędu aktualizacji
        }
      }
    }
    
    // Finalna aktualizacja statusu pliku
    console.log('Finalna aktualizacja statusu pliku, przetworzono wierszy:', processedRows);
    try {
      await ImportedFile.update(
        {
          status: 'completed',
          rowsCount: processedRows
        },
        { where: { id: importedFile.id } }
      );
    } catch (updateErr) {
      console.error('Błąd podczas finalnej aktualizacji statusu pliku:', updateErr);
      // Kontynuujemy mimo błędu aktualizacji
    }
    
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
        processedRows: processedRows,
        errorRows: errorRows
      }
    });
  } catch (err) {
    console.error('Upload error:', err);
    
    if (importedFile) {
      try {
        await ImportedFile.update(
          {
            status: 'error',
            errorMessage: err.message
          },
          { where: { id: importedFile.id } }
        );
      } catch (updateErr) {
        console.error('Błąd podczas aktualizacji statusu pliku na error:', updateErr);
      }
    }
    
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
    const files = await ImportedFile.findAll({
      order: [['importDate', 'DESC']]
    });
    
    console.log(`Znaleziono ${files.length} plików w historii`);
    
    const formattedFiles = files.map(file => ({
      id: file.id,
      fileName: file.originalFilename,
      fileSize: file.fileSize,
      type: file.fileType === 'purchase' ? 'purchases' : file.fileType === 'payroll' ? 'payroll' : 'sales',
      status: file.status,
      processedRows: file.rowsCount,
      importDate: file.importDate,
      errorMessage: file.errorMessage
    }));
    
    console.log('Historia plików:', JSON.stringify(formattedFiles.slice(0, 2)));
    
    res.json(formattedFiles);
  } catch (err) {
    console.error('Błąd podczas pobierania historii plików:', err);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
  }
});

/**
 * @route   DELETE /api/upload/:id
 * @desc    Usuwanie przesłanego pliku
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const importedFile = await ImportedFile.findByPk(id);
    
    if (!importedFile) {
      return res.status(404).json({ message: 'Plik nie znaleziony' });
    }
    
    // Usuwanie powiązanych danych
    if (importedFile.fileType === 'purchase') {
      await Purchase.destroy({ where: { importedFileId: id } });
    } else if (importedFile.fileType === 'payroll') {
      await Payroll.destroy({ where: { importedFileId: id } });
    } else if (importedFile.fileType === 'sale') {
      await Sale.destroy({ where: { importedFileId: id } });
    }
    
    // Usuwanie pliku fizycznego
    const filePath = path.join(__dirname, '../uploads', importedFile.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Usuwanie rekordu z bazy danych
    await importedFile.destroy();
    
    res.json({ message: 'Plik został pomyślnie usunięty' });
  } catch (err) {
    console.error('Błąd podczas usuwania pliku:', err);
    res.status(500).json({ message: 'Błąd serwera', error: err.message });
  }
});

module.exports = router;
