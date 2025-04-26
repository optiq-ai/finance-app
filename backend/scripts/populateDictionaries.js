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
    
    // Pobierz unikalne nazwy oddziałów z tabeli departments
    const [departments] = await sequelize.query(
      'SELECT DISTINCT name FROM departments WHERE name IS NOT NULL AND name != \'\''
    );
    
    // Pobierz unikalne nazwy grup z tabeli groups
    const [groups] = await sequelize.query(
      'SELECT DISTINCT name, department_id FROM groups WHERE name IS NOT NULL AND name != \'\''
    );
    
    // Pobierz unikalne nazwy kontrahentów z tabeli contractors
    const [contractors] = await sequelize.query(
      'SELECT DISTINCT name FROM contractors WHERE name IS NOT NULL AND name != \'\''
    );
    
    // Pobierz unikalne kategorie kosztów z tabeli cost_categories
    const [costCategories] = await sequelize.query(
      'SELECT DISTINCT name FROM cost_categories WHERE name IS NOT NULL AND name != \'\''
    );
    
    // Pobierz unikalne rodzaje usług z tabeli service_types
    const [serviceTypes] = await sequelize.query(
      'SELECT DISTINCT name, code FROM service_types WHERE name IS NOT NULL AND name != \'\''
    );
    
    console.log('Pobieranie unikalnych wartości z tabeli payrolls...');
    
    // Pobierz unikalne nazwy pracowników z tabeli payrolls
    const [payrollEmployees] = await sequelize.query(
      'SELECT DISTINCT "employeeName" AS name, "position" FROM payrolls WHERE "employeeName" IS NOT NULL AND "employeeName" != \'\''
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
    
    // Tworzenie słowników na podstawie unikalnych wartości
    console.log('Tworzenie słownika oddziałów...');
    
    // Jeśli nie ma istniejących oddziałów, utwórz podstawowe
    if (departments.length === 0) {
      console.log('Nie znaleziono oddziałów w danych transakcyjnych. Tworzenie podstawowych oddziałów...');
      const defaultDepartments = [
        { name: 'CENTRALA', code: 'CENT', description: 'Oddział Centrala' },
        { name: 'ZAMOŚĆ', code: 'ZAM', description: 'Oddział w Zamościu' },
        { name: 'KALISZ', code: 'KAL', description: 'Oddział w Kaliszu' },
        { name: 'LEGNICA', code: 'LEG', description: 'Oddział w Legnicy' }
      ];
      
      for (const dept of defaultDepartments) {
        await Department.findOrCreate({
          where: { name: dept.name },
          defaults: {
            code: dept.code,
            description: dept.description
          }
        });
      }
    }
    
    // Pobierz wszystkie oddziały, aby użyć ich do powiązania z grupami
    const allDepartments = await Department.findAll();
    
    console.log('Tworzenie słownika grup...');
    
    // Jeśli nie ma istniejących grup, utwórz podstawowe
    if (groups.length === 0) {
      console.log('Nie znaleziono grup w danych transakcyjnych. Tworzenie podstawowych grup...');
      
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
    
    console.log('Tworzenie słownika kontrahentów...');
    
    // Jeśli nie ma istniejących kontrahentów, utwórz podstawowe
    if (contractors.length === 0) {
      console.log('Nie znaleziono kontrahentów w danych transakcyjnych. Tworzenie podstawowych kontrahentów...');
      const defaultContractors = [
        { name: 'KONTRAHENT OGÓLNY', code: 'KONT-OG', description: 'Kontrahent ogólny' },
        { name: 'KLIENT DETALICZNY', code: 'KLIENT-DET', description: 'Klient detaliczny' }
      ];
      
      for (const contractor of defaultContractors) {
        await Contractor.findOrCreate({
          where: { name: contractor.name },
          defaults: {
            code: contractor.code,
            description: contractor.description,
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
    
    // Jeśli nie ma istniejących kategorii kosztów, utwórz podstawowe
    if (costCategories.length === 0) {
      console.log('Nie znaleziono kategorii kosztów w danych transakcyjnych. Tworzenie podstawowych kategorii...');
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
    }
    
    console.log('Tworzenie słownika rodzajów usług...');
    
    // Jeśli nie ma istniejących rodzajów usług, utwórz podstawowe
    if (serviceTypes.length === 0) {
      console.log('Nie znaleziono rodzajów usług w danych transakcyjnych. Tworzenie podstawowych rodzajów...');
      const defaultServiceTypes = [
        { name: 'USŁUGI OGÓLNE', code: 'USL-OG', description: 'Rodzaj usługi Usługi ogólne' },
        { name: 'INSTALACJA', code: 'INST', description: 'Usługi instalacyjne' },
        { name: 'SERWIS', code: 'SERW', description: 'Usługi serwisowe' }
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
