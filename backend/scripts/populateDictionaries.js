const { sequelize } = require('../models');
const { Department, Group, ServiceType, Contractor, CostCategory, Purchase, Sale, Payroll } = require('../models');

/**
 * Skrypt do automatycznego wypełniania tabel słownikowych na podstawie istniejących danych w bazie
 */
async function populateDictionaries() {
  try {
    console.log('Rozpoczynam wypełnianie słowników na podstawie danych transakcyjnych...');
    
    // Pobierz unikalne wartości z kolumn description w tabelach transakcyjnych
    console.log('Pobieranie unikalnych wartości z tabeli purchases...');
    
    // Pobierz unikalne nazwy oddziałów z tabeli purchases
    const [purchaseDepartments] = await sequelize.query(
      'SELECT DISTINCT description AS name FROM purchases WHERE description LIKE \'%ODDZIAŁ%\' OR description LIKE \'%ODDZIAL%\''
    );
    
    // Pobierz unikalne nazwy grup z tabeli purchases
    const [purchaseGroups] = await sequelize.query(
      'SELECT DISTINCT description AS name FROM purchases WHERE description NOT LIKE \'%ODDZIAŁ%\' AND description NOT LIKE \'%ODDZIAL%\' AND description NOT LIKE \'%KONTRAHENT%\' AND description NOT LIKE \'%USŁUG%\' AND description NOT LIKE \'%USLUG%\''
    );
    
    // Pobierz unikalne nazwy kontrahentów z tabeli purchases
    const [purchaseContractors] = await sequelize.query(
      'SELECT DISTINCT description AS name FROM purchases WHERE description LIKE \'%KONTRAHENT%\''
    );
    
    // Pobierz unikalne kategorie kosztów z tabeli purchases
    const [purchaseCostCategories] = await sequelize.query(
      'SELECT DISTINCT description AS name FROM purchases WHERE description LIKE \'%KOSZT%\''
    );
    
    console.log('Pobieranie unikalnych wartości z tabeli sales...');
    
    // Pobierz unikalne nazwy oddziałów z tabeli sales
    const [salesDepartments] = await sequelize.query(
      'SELECT DISTINCT description AS name FROM sales WHERE description LIKE \'%ODDZIAŁ%\' OR description LIKE \'%ODDZIAL%\''
    );
    
    // Pobierz unikalne nazwy grup z tabeli sales
    const [salesGroups] = await sequelize.query(
      'SELECT DISTINCT description AS name FROM sales WHERE description NOT LIKE \'%ODDZIAŁ%\' AND description NOT LIKE \'%ODDZIAL%\' AND description NOT LIKE \'%USŁUG%\' AND description NOT LIKE \'%USLUG%\''
    );
    
    // Pobierz unikalne rodzaje usług z tabeli sales
    const [salesServiceTypes] = await sequelize.query(
      'SELECT DISTINCT description AS name FROM sales WHERE description LIKE \'%USŁUG%\' OR description LIKE \'%USLUG%\''
    );
    
    console.log('Pobieranie unikalnych wartości z tabeli payrolls...');
    
    // Pobierz unikalne nazwy oddziałów z tabeli payrolls
    const [payrollDepartments] = await sequelize.query(
      'SELECT DISTINCT description AS name FROM payrolls WHERE description LIKE \'%ODDZIAŁ%\' OR description LIKE \'%ODDZIAL%\''
    );
    
    // Pobierz unikalne nazwy grup z tabeli payrolls
    const [payrollGroups] = await sequelize.query(
      'SELECT DISTINCT description AS name FROM payrolls WHERE description NOT LIKE \'%ODDZIAŁ%\' AND description NOT LIKE \'%ODDZIAL%\''
    );
    
    // Pobierz wszystkie unikalne wartości z kolumn departmentId, groupId, serviceTypeId, contractorId, costCategoryId
    console.log('Pobieranie unikalnych identyfikatorów z tabel transakcyjnych...');
    
    // Pobierz unikalne wartości departmentId
    const [purchaseDeptIds] = await sequelize.query(
      'SELECT DISTINCT "departmentId" FROM purchases WHERE "departmentId" IS NOT NULL'
    );
    
    const [salesDeptIds] = await sequelize.query(
      'SELECT DISTINCT "departmentId" FROM sales WHERE "departmentId" IS NOT NULL'
    );
    
    const [payrollDeptIds] = await sequelize.query(
      'SELECT DISTINCT "departmentId" FROM payrolls WHERE "departmentId" IS NOT NULL'
    );
    
    // Pobierz unikalne wartości groupId
    const [purchaseGroupIds] = await sequelize.query(
      'SELECT DISTINCT "groupId" FROM purchases WHERE "groupId" IS NOT NULL'
    );
    
    const [salesGroupIds] = await sequelize.query(
      'SELECT DISTINCT "groupId" FROM sales WHERE "groupId" IS NOT NULL'
    );
    
    const [payrollGroupIds] = await sequelize.query(
      'SELECT DISTINCT "groupId" FROM payrolls WHERE "groupId" IS NOT NULL'
    );
    
    // Pobierz unikalne wartości serviceTypeId
    const [purchaseServiceTypeIds] = await sequelize.query(
      'SELECT DISTINCT "serviceTypeId" FROM purchases WHERE "serviceTypeId" IS NOT NULL'
    );
    
    const [salesServiceTypeIds] = await sequelize.query(
      'SELECT DISTINCT "serviceTypeId" FROM sales WHERE "serviceTypeId" IS NOT NULL'
    );
    
    // Pobierz unikalne wartości contractorId
    const [purchaseContractorIds] = await sequelize.query(
      'SELECT DISTINCT "contractorId" FROM purchases WHERE "contractorId" IS NOT NULL'
    );
    
    // Pobierz unikalne wartości costCategoryId
    const [purchaseCostCategoryIds] = await sequelize.query(
      'SELECT DISTINCT "costCategoryId" FROM purchases WHERE "costCategoryId" IS NOT NULL'
    );
    
    // Pobierz unikalne wartości z kolumn employeeName i position w tabeli payrolls
    const [payrollEmployees] = await sequelize.query(
      'SELECT DISTINCT "employeeName" AS name, "position" FROM payrolls WHERE "employeeName" IS NOT NULL'
    );
    
    // Tworzenie słowników na podstawie unikalnych wartości
    console.log('Tworzenie słownika oddziałów...');
    
    // Połącz wszystkie unikalne nazwy oddziałów
    const allDepartmentNames = [
      ...purchaseDepartments.map(d => d.name),
      ...salesDepartments.map(d => d.name),
      ...payrollDepartments.map(d => d.name)
    ];
    
    // Usuń duplikaty
    const uniqueDepartmentNames = [...new Set(allDepartmentNames)];
    
    // Utwórz wpisy w słowniku oddziałów
    for (const name of uniqueDepartmentNames) {
      if (name && name.trim() !== '') {
        const cleanName = name.trim().toUpperCase();
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
    
    // Pobierz wszystkie oddziały, aby użyć ich do powiązania z grupami
    const allDepartments = await Department.findAll();
    
    console.log('Tworzenie słownika grup...');
    
    // Połącz wszystkie unikalne nazwy grup
    const allGroupNames = [
      ...purchaseGroups.map(g => g.name),
      ...salesGroups.map(g => g.name),
      ...payrollGroups.map(g => g.name)
    ];
    
    // Usuń duplikaty
    const uniqueGroupNames = [...new Set(allGroupNames)];
    
    // Utwórz wpisy w słowniku grup
    for (const name of uniqueGroupNames) {
      if (name && name.trim() !== '') {
        const cleanName = name.trim().toUpperCase();
        const code = cleanName.substring(0, 10).replace(/[^A-Z0-9]/g, '');
        
        // Przypisz grupę do pierwszego oddziału (jeśli istnieją oddziały)
        const departmentId = allDepartments.length > 0 ? allDepartments[0].id : null;
        
        await Group.findOrCreate({
          where: { name: cleanName },
          defaults: {
            code: code,
            description: `Grupa ${cleanName}`,
            departmentId: departmentId
          }
        });
      }
    }
    
    console.log('Tworzenie słownika kontrahentów...');
    
    // Połącz wszystkie unikalne nazwy kontrahentów
    const allContractorNames = purchaseContractors.map(c => c.name);
    
    // Usuń duplikaty
    const uniqueContractorNames = [...new Set(allContractorNames)];
    
    // Utwórz wpisy w słowniku kontrahentów
    for (const name of uniqueContractorNames) {
      if (name && name.trim() !== '') {
        const cleanName = name.trim().toUpperCase();
        const code = cleanName.substring(0, 10).replace(/[^A-Z0-9]/g, '');
        
        await Contractor.findOrCreate({
          where: { name: cleanName },
          defaults: {
            code: code,
            description: `Kontrahent ${cleanName}`,
            nip: '',
            address: '',
            contactPerson: '',
            email: '',
            phone: ''
          }
        });
      }
    }
    
    console.log('Tworzenie słownika kategorii kosztów...');
    
    // Połącz wszystkie unikalne nazwy kategorii kosztów
    const allCostCategoryNames = purchaseCostCategories.map(c => c.name);
    
    // Usuń duplikaty
    const uniqueCostCategoryNames = [...new Set(allCostCategoryNames)];
    
    // Utwórz wpisy w słowniku kategorii kosztów
    for (const name of uniqueCostCategoryNames) {
      if (name && name.trim() !== '') {
        const cleanName = name.trim().toUpperCase();
        const code = cleanName.substring(0, 10).replace(/[^A-Z0-9]/g, '');
        
        await CostCategory.findOrCreate({
          where: { name: cleanName },
          defaults: {
            code: code,
            description: `Kategoria kosztów ${cleanName}`
          }
        });
      }
    }
    
    console.log('Tworzenie słownika rodzajów usług...');
    
    // Połącz wszystkie unikalne nazwy rodzajów usług
    const allServiceTypeNames = salesServiceTypes.map(s => s.name);
    
    // Usuń duplikaty
    const uniqueServiceTypeNames = [...new Set(allServiceTypeNames)];
    
    // Utwórz wpisy w słowniku rodzajów usług
    for (const name of uniqueServiceTypeNames) {
      if (name && name.trim() !== '') {
        const cleanName = name.trim().toUpperCase();
        const code = cleanName.substring(0, 10).replace(/[^A-Z0-9]/g, '');
        
        await ServiceType.findOrCreate({
          where: { name: cleanName },
          defaults: {
            code: code,
            description: `Rodzaj usługi ${cleanName}`
          }
        });
      }
    }
    
    // Jeśli nie znaleziono żadnych danych w tabelach transakcyjnych, utwórz podstawowe wpisy
    const departmentCount = await Department.count();
    const groupCount = await Group.count();
    const serviceTypeCount = await ServiceType.count();
    const contractorCount = await Contractor.count();
    const costCategoryCount = await CostCategory.count();
    
    if (departmentCount === 0) {
      console.log('Nie znaleziono oddziałów w danych transakcyjnych. Tworzenie podstawowego oddziału...');
      await Department.create({
        name: 'CENTRALA',
        code: 'CENT',
        description: 'Oddział Centrala'
      });
    }
    
    if (groupCount === 0) {
      console.log('Nie znaleziono grup w danych transakcyjnych. Tworzenie podstawowej grupy...');
      await Group.create({
        name: 'OGÓLNA',
        code: 'OG',
        description: 'Grupa Ogólna',
        departmentId: (await Department.findOne()).id
      });
    }
    
    if (serviceTypeCount === 0) {
      console.log('Nie znaleziono rodzajów usług w danych transakcyjnych. Tworzenie podstawowego rodzaju usługi...');
      await ServiceType.create({
        name: 'USŁUGI OGÓLNE',
        code: 'USL-OG',
        description: 'Rodzaj usługi Usługi ogólne'
      });
    }
    
    if (contractorCount === 0) {
      console.log('Nie znaleziono kontrahentów w danych transakcyjnych. Tworzenie podstawowego kontrahenta...');
      await Contractor.create({
        name: 'KONTRAHENT OGÓLNY',
        code: 'KONT-OG',
        description: 'Kontrahent ogólny'
      });
    }
    
    if (costCategoryCount === 0) {
      console.log('Nie znaleziono kategorii kosztów w danych transakcyjnych. Tworzenie podstawowej kategorii kosztów...');
      await CostCategory.create({
        name: 'KOSZTY OGÓLNE',
        code: 'KOSZT-OG',
        description: 'Kategoria kosztów Koszty ogólne'
      });
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
