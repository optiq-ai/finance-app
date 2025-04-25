const { sequelize } = require('../models');
const { Department, Group, ServiceType, Contractor, CostCategory, Purchase, Sale, Payroll } = require('../models');

/**
 * Skrypt do automatycznego wypełniania tabel słownikowych na podstawie istniejących danych w bazie
 */
async function populateDictionaries() {
  try {
    console.log('Rozpoczynam wypełnianie słowników...');
    
    // Pobierz unikalne wartości z tabeli purchases
    const [purchaseDepartments] = await sequelize.query(
      'SELECT DISTINCT "departmentId" FROM purchases WHERE "departmentId" IS NOT NULL'
    );
    
    const [purchaseGroups] = await sequelize.query(
      'SELECT DISTINCT "groupId" FROM purchases WHERE "groupId" IS NOT NULL'
    );
    
    const [purchaseServiceTypes] = await sequelize.query(
      'SELECT DISTINCT "serviceTypeId" FROM purchases WHERE "serviceTypeId" IS NOT NULL'
    );
    
    const [purchaseContractors] = await sequelize.query(
      'SELECT DISTINCT "contractorId" FROM purchases WHERE "contractorId" IS NOT NULL'
    );
    
    const [purchaseCostCategories] = await sequelize.query(
      'SELECT DISTINCT "costCategoryId" FROM purchases WHERE "costCategoryId" IS NOT NULL'
    );
    
    // Pobierz unikalne wartości z tabeli sales
    const [salesDepartments] = await sequelize.query(
      'SELECT DISTINCT "departmentId" FROM sales WHERE "departmentId" IS NOT NULL'
    );
    
    const [salesGroups] = await sequelize.query(
      'SELECT DISTINCT "groupId" FROM sales WHERE "groupId" IS NOT NULL'
    );
    
    const [salesServiceTypes] = await sequelize.query(
      'SELECT DISTINCT "serviceTypeId" FROM sales WHERE "serviceTypeId" IS NOT NULL'
    );
    
    const [salesContractors] = await sequelize.query(
      'SELECT DISTINCT "contractorId" FROM sales WHERE "contractorId" IS NOT NULL'
    );
    
    // Pobierz unikalne wartości z tabeli payrolls
    const [payrollDepartments] = await sequelize.query(
      'SELECT DISTINCT "departmentId" FROM payrolls WHERE "departmentId" IS NOT NULL'
    );
    
    const [payrollGroups] = await sequelize.query(
      'SELECT DISTINCT "groupId" FROM payrolls WHERE "groupId" IS NOT NULL'
    );
    
    // Pobierz unikalne nazwy oddziałów z plików Excel
    const [departmentNames] = await sequelize.query(
      'SELECT DISTINCT "Oddział" as name FROM raw_purchases WHERE "Oddział" IS NOT NULL AND "Oddział" != \'\''
    );
    
    // Pobierz unikalne nazwy grup z plików Excel
    const [groupNames] = await sequelize.query(
      'SELECT DISTINCT "Kolumna2" as name FROM raw_purchases WHERE "Kolumna2" IS NOT NULL AND "Kolumna2" != \'\''
    );
    
    // Pobierz unikalne nazwy kontrahentów z plików Excel
    const [contractorNames] = await sequelize.query(
      'SELECT DISTINCT "Kontrahent" as name FROM raw_purchases WHERE "Kontrahent" IS NOT NULL AND "Kontrahent" != \'\''
    );
    
    // Pobierz unikalne kategorie kosztów z plików Excel
    const [costCategoryNames] = await sequelize.query(
      'SELECT DISTINCT "Kategoria" as name FROM raw_purchases WHERE "Kategoria" IS NOT NULL AND "Kategoria" != \'\''
    );
    
    // Pobierz unikalne rodzaje usług z plików Excel
    const [serviceTypeNames] = await sequelize.query(
      'SELECT DISTINCT "Kategoria" as name FROM raw_sales WHERE "Kategoria" IS NOT NULL AND "Kategoria" != \'\''
    );
    
    // Tworzenie słowników na podstawie unikalnych wartości
    console.log('Tworzenie słownika oddziałów...');
    for (const dept of departmentNames) {
      await Department.findOrCreate({
        where: { name: dept.name },
        defaults: {
          code: dept.name.substring(0, 10).toUpperCase(),
          description: `Oddział ${dept.name}`
        }
      });
    }
    
    console.log('Tworzenie słownika grup...');
    for (const group of groupNames) {
      await Group.findOrCreate({
        where: { name: group.name },
        defaults: {
          code: group.name.substring(0, 10).toUpperCase(),
          description: `Grupa ${group.name}`
        }
      });
    }
    
    console.log('Tworzenie słownika kontrahentów...');
    for (const contractor of contractorNames) {
      await Contractor.findOrCreate({
        where: { name: contractor.name },
        defaults: {
          code: contractor.name.substring(0, 10).toUpperCase(),
          description: `Kontrahent ${contractor.name}`
        }
      });
    }
    
    console.log('Tworzenie słownika kategorii kosztów...');
    for (const category of costCategoryNames) {
      await CostCategory.findOrCreate({
        where: { name: category.name },
        defaults: {
          code: category.name.substring(0, 10).toUpperCase(),
          description: `Kategoria kosztów ${category.name}`
        }
      });
    }
    
    console.log('Tworzenie słownika rodzajów usług...');
    for (const serviceType of serviceTypeNames) {
      await ServiceType.findOrCreate({
        where: { name: serviceType.name },
        defaults: {
          code: serviceType.name.substring(0, 10).toUpperCase(),
          description: `Rodzaj usługi ${serviceType.name}`
        }
      });
    }
    
    console.log('Słowniki zostały pomyślnie wypełnione!');
    
    // Zwróć statystyki
    const departmentCount = await Department.count();
    const groupCount = await Group.count();
    const serviceTypeCount = await ServiceType.count();
    const contractorCount = await Contractor.count();
    const costCategoryCount = await CostCategory.count();
    
    return {
      departments: departmentCount,
      groups: groupCount,
      serviceTypes: serviceTypeCount,
      contractors: contractorCount,
      costCategories: costCategoryCount
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
