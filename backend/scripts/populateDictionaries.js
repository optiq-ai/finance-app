const { sequelize } = require('../models');
const { Department, Group, ServiceType, Contractor, CostCategory, Purchase, Sale, Payroll } = require('../models');

/**
 * Skrypt do wypełniania tabel słownikowych na podstawie istniejących danych w bazie
 */
async function populateDictionaries() {
  try {
    console.log('Rozpoczynam wypełnianie słowników na podstawie danych transakcyjnych...');
    
    // Pobierz unikalne wartości z tabel transakcyjnych
    console.log('Pobieranie unikalnych wartości z tabeli purchases...');
    
    // Pobierz unikalne numery dokumentów z tabeli purchases
    const [purchaseDocNumbers] = await sequelize.query(
      'SELECT DISTINCT "documentNumber" AS name FROM purchases WHERE "documentNumber" IS NOT NULL AND "documentNumber" != \'\''
    );
    
    // Pobierz unikalne nazwy kontrahentów z tabeli purchases
    const [purchaseContractors] = await sequelize.query(
      'SELECT DISTINCT "description" AS name FROM purchases WHERE "description" IS NOT NULL AND "description" != \'\''
    );
    
    // Pobierz unikalne numery dokumentów z tabeli sales
    const [salesDocNumbers] = await sequelize.query(
      'SELECT DISTINCT "documentNumber" AS name FROM sales WHERE "documentNumber" IS NOT NULL AND "documentNumber" != \'\''
    );
    
    console.log('Pobieranie unikalnych wartości z tabeli payrolls...');
    
    // Pobierz unikalne nazwy pracowników z tabeli payrolls
    const [payrollEmployees] = await sequelize.query(
      'SELECT DISTINCT "employeeName" AS name, "position" FROM payrolls WHERE "employeeName" IS NOT NULL AND "employeeName" != \'\''
    );
    
    // Sprawdź, czy istnieją już jakieś oddziały
    const existingDepartmentsCount = await Department.count();
    
    if (existingDepartmentsCount === 0) {
      console.log('Nie znaleziono oddziałów w bazie danych. Tworzenie oddziałów na podstawie numerów dokumentów...');
      
      // Połącz wszystkie unikalne numery dokumentów
      const allDocumentNumbers = [
        ...purchaseDocNumbers.map(d => d.name),
        ...salesDocNumbers.map(d => d.name)
      ];
      
      // Usuń duplikaty
      const uniqueDocumentNumbers = [...new Set(allDocumentNumbers)];
      
      // Utwórz oddziały na podstawie numerów dokumentów
      for (const docNumber of uniqueDocumentNumbers) {
        if (docNumber && docNumber.trim() !== '') {
          const cleanName = docNumber.trim();
          // Tworzymy kod na podstawie numeru dokumentu (pierwsze 10 znaków bez znaków specjalnych)
          const code = cleanName.substring(0, 10).replace(/[^A-Z0-9]/g, '');
          
          await Department.findOrCreate({
            where: { name: cleanName },
            defaults: {
              code: code,
              description: `Oddział ${cleanName}`
            }
          });
        }
      }
      
      // Jeśli nadal nie ma oddziałów, utwórz domyślny
      const departmentsAfterCreation = await Department.count();
      if (departmentsAfterCreation === 0) {
        console.log('Nie udało się utworzyć oddziałów na podstawie numerów dokumentów. Tworzenie domyślnego oddziału...');
        await Department.create({
          name: '#DEFAULT/2023',
          code: 'DEFAULT',
          description: 'Oddział Domyślny'
        });
      }
    } else {
      console.log(`Znaleziono ${existingDepartmentsCount} istniejących oddziałów w bazie danych. Pomijam tworzenie nowych.`);
    }
    
    // Pobierz wszystkie oddziały, aby użyć ich do powiązania z grupami
    const allDepartments = await Department.findAll();
    
    console.log('Tworzenie słownika grup...');
    
    // Sprawdź, czy istnieją już jakieś grupy
    const existingGroupsCount = await Group.count();
    
    // Jeśli nie ma istniejących grup, utwórz podstawowe
    if (existingGroupsCount === 0) {
      console.log('Nie znaleziono grup w bazie danych. Tworzenie podstawowych grup...');
      
      // Pobierz unikalne wartości z kolumny "position" z tabeli payrolls
      const positions = payrollEmployees
        .filter(e => e.position)
        .map(e => e.position);
      
      // Usuń duplikaty
      const uniquePositions = [...new Set(positions)];
      
      // Utwórz grupy na podstawie stanowisk
      for (const position of uniquePositions) {
        if (position && position.trim() !== '') {
          const cleanName = position.trim().toUpperCase();
          
          // Przypisz grupę do pierwszego oddziału (jeśli istnieją oddziały)
          const departmentId = allDepartments.length > 0 ? allDepartments[0].id : null;
          
          await Group.findOrCreate({
            where: { name: cleanName },
            defaults: {
              description: `Grupa ${cleanName}`,
              departmentId: departmentId
            }
          });
        }
      }
      
      // Jeśli nadal nie ma grup, utwórz domyślne dla każdego oddziału
      const groupsAfterCreation = await Group.count();
      if (groupsAfterCreation === 0) {
        console.log('Nie udało się utworzyć grup na podstawie stanowisk. Tworzenie domyślnych grup...');
        
        // Dla każdego oddziału utwórz podstawową grupę
        for (const dept of allDepartments) {
          await Group.findOrCreate({
            where: { 
              name: `GRUPA ${dept.name}`,
              departmentId: dept.id
            },
            defaults: {
              description: `Podstawowa grupa dla oddziału ${dept.name}`
            }
          });
        }
      }
    } else {
      console.log(`Znaleziono ${existingGroupsCount} istniejących grup w bazie danych. Pomijam tworzenie nowych.`);
    }
    
    console.log('Tworzenie słownika kontrahentów...');
    
    // Sprawdź, czy istnieją już jacyś kontrahenci
    const existingContractorsCount = await Contractor.count();
    
    // Jeśli nie ma istniejących kontrahentów, utwórz na podstawie danych z purchases
    if (existingContractorsCount === 0) {
      console.log('Nie znaleziono kontrahentów w bazie danych. Tworzenie kontrahentów na podstawie danych z zakupów...');
      
      // Usuń duplikaty
      const uniqueContractorNames = [...new Set(purchaseContractors.map(c => c.name))];
      
      // Utwórz kontrahentów na podstawie opisów z zakupów
      for (const name of uniqueContractorNames) {
        if (name && name.trim() !== '') {
          const cleanName = name.trim().substring(0, 100); // Ograniczenie długości nazwy
          const code = cleanName.substring(0, 10).replace(/[^A-Z0-9]/g, '');
          
          await Contractor.findOrCreate({
            where: { name: cleanName },
            defaults: {
              code: code,
              description: cleanName,
              nip: '',
              address: '',
              contactPerson: '',
              email: '',
              phone: ''
            }
          });
        }
      }
      
      // Jeśli nadal nie ma kontrahentów, utwórz domyślnego
      const contractorsAfterCreation = await Contractor.count();
      if (contractorsAfterCreation === 0) {
        console.log('Nie udało się utworzyć kontrahentów na podstawie danych. Tworzenie domyślnego kontrahenta...');
        await Contractor.create({
          name: 'KONTRAHENT OGÓLNY',
          code: 'KONT-OG',
          description: 'Kontrahent ogólny',
          nip: '',
          address: '',
          contactPerson: '',
          email: '',
          phone: ''
        });
      }
    } else {
      console.log(`Znaleziono ${existingContractorsCount} istniejących kontrahentów w bazie danych. Pomijam tworzenie nowych.`);
    }
    
    console.log('Tworzenie słownika kategorii kosztów...');
    
    // Sprawdź, czy istnieją już jakieś kategorie kosztów
    const existingCostCategoriesCount = await CostCategory.count();
    
    // Jeśli nie ma istniejących kategorii kosztów, utwórz podstawowe
    if (existingCostCategoriesCount === 0) {
      console.log('Nie znaleziono kategorii kosztów w bazie danych. Tworzenie podstawowych kategorii...');
      const defaultCostCategories = [
        { name: 'KOSZTY OGÓLNE', code: 'KOSZT-OG', description: 'Kategoria kosztów Koszty ogólne' },
        { name: 'WYNAGRODZENIA', code: 'WYNAGR', description: 'Koszty wynagrodzeń pracowników' },
        { name: 'MATERIAŁY', code: 'MATER', description: 'Koszty materiałów' }
      ];
      
      for (const category of defaultCostCategories) {
        await CostCategory.findOrCreate({
          where: { name: category.name },
          defaults: {
            code: category.code,
            description: category.description
          }
        });
      }
    } else {
      console.log(`Znaleziono ${existingCostCategoriesCount} istniejących kategorii kosztów w bazie danych. Pomijam tworzenie nowych.`);
    }
    
    console.log('Tworzenie słownika rodzajów usług...');
    
    // Sprawdź, czy istnieją już jakieś rodzaje usług
    const existingServiceTypesCount = await ServiceType.count();
    
    // Jeśli nie ma istniejących rodzajów usług, utwórz podstawowe
    if (existingServiceTypesCount === 0) {
      console.log('Nie znaleziono rodzajów usług w bazie danych. Tworzenie podstawowych rodzajów...');
      const defaultServiceTypes = [
        { name: 'USŁUGI OGÓLNE', code: 'USL-OG', description: 'Rodzaj usługi Usługi ogólne' },
        { name: 'INSTALACJA', code: 'INST', description: 'Usługi instalacyjne' },
        { name: 'SERWIS', code: 'SERW', description: 'Usługi serwisowe' },
        { name: 'DROP', code: 'DROP', description: 'Usługi typu DROP' }
      ];
      
      for (const serviceType of defaultServiceTypes) {
        await ServiceType.findOrCreate({
          where: { name: serviceType.name },
          defaults: {
            code: serviceType.code,
            description: serviceType.description
          }
        });
      }
    } else {
      console.log(`Znaleziono ${existingServiceTypesCount} istniejących rodzajów usług w bazie danych. Pomijam tworzenie nowych.`);
    }
    
    // Aktualizacja powiązań między tabelami
    console.log('Aktualizacja powiązań między tabelami...');
    
    // Pobierz wszystkie grupy
    const allGroups = await Group.findAll();
    
    // Dla każdej grupy, która nie ma przypisanego oddziału, przypisz pierwszy dostępny
    for (const group of allGroups) {
      if (!group.departmentId && allDepartments.length > 0) {
        group.departmentId = allDepartments[0].id;
        await group.save();
      }
    }
    
    console.log('Słowniki zostały pomyślnie wypełnione na podstawie danych transakcyjnych!');
    
    // Zwróć zaktualizowane statystyki
    const updatedDepartmentCount = await Department.count();
    const updatedGroupCount = await Group.count();
    const updatedServiceTypeCount = await ServiceType.count();
    const updatedContractorCount = await Contractor.count();
    const updatedCostCategoryCount = await CostCategory.count();
    
    return {
      departments: updatedDepartmentCount,
      groups: updatedGroupCount,
      serviceTypes: updatedServiceTypeCount,
      contractors: updatedContractorCount,
      costCategories: updatedCostCategoryCount
    };
    
  } catch (error) {
    console.error('Błąd podczas wypełniania słowników:', error);
    throw error;
  }
}

// Eksportuj funkcję, aby można było ją wywołać z innych plików
module.exports = populateDictionaries;

// Jeśli skrypt jest uruchamiany bezpośrednio, wykonaj funkcję
if (require.main === module) {
  populateDictionaries()
    .then(stats => {
      console.log('Statystyki słowników:', stats);
      process.exit(0);
    })
    .catch(error => {
      console.error('Błąd:', error);
      process.exit(1);
    });
}
