const { sequelize } = require('../models');
const { Department, Group, ServiceType, Contractor, CostCategory, Purchase, Sale, Payroll } = require('../models');

/**
 * Skrypt do automatycznego wypełniania tabel słownikowych na podstawie istniejących danych w bazie
 * lub tworzenia przykładowych wpisów, jeśli dane nie istnieją
 */
async function populateDictionaries() {
  try {
    console.log('Rozpoczynam wypełnianie słowników...');
    
    // Tworzenie podstawowych słowników, jeśli nie istnieją
    console.log('Tworzenie słownika oddziałów...');
    const departments = [
      { name: 'WARSZAWA', code: 'WAW', description: 'Oddział Warszawa' },
      { name: 'KRAKÓW', code: 'KRK', description: 'Oddział Kraków' },
      { name: 'POZNAŃ', code: 'POZ', description: 'Oddział Poznań' },
      { name: 'WROCŁAW', code: 'WRO', description: 'Oddział Wrocław' },
      { name: 'GDAŃSK', code: 'GDA', description: 'Oddział Gdańsk' },
      { name: 'KATOWICE', code: 'KAT', description: 'Oddział Katowice' },
      { name: 'ŁÓDŹ', code: 'LDZ', description: 'Oddział Łódź' },
      { name: 'LUBLIN', code: 'LUB', description: 'Oddział Lublin' },
      { name: 'BIAŁYSTOK', code: 'BIA', description: 'Oddział Białystok' },
      { name: 'SZCZECIN', code: 'SZC', description: 'Oddział Szczecin' }
    ];
    
    for (const dept of departments) {
      await Department.findOrCreate({
        where: { name: dept.name },
        defaults: {
          code: dept.code,
          description: dept.description
        }
      });
    }
    
    console.log('Tworzenie słownika grup...');
    const groups = [
      { name: 'ADMINISTRACJA', code: 'ADM', description: 'Grupa Administracja' },
      { name: 'SPRZEDAŻ', code: 'SPR', description: 'Grupa Sprzedaż' },
      { name: 'MARKETING', code: 'MKT', description: 'Grupa Marketing' },
      { name: 'FINANSE', code: 'FIN', description: 'Grupa Finanse' },
      { name: 'IT', code: 'IT', description: 'Grupa IT' },
      { name: 'HR', code: 'HR', description: 'Grupa HR' },
      { name: 'PRODUKCJA', code: 'PRD', description: 'Grupa Produkcja' },
      { name: 'LOGISTYKA', code: 'LOG', description: 'Grupa Logistyka' },
      { name: 'OBSŁUGA KLIENTA', code: 'OBS', description: 'Grupa Obsługa Klienta' },
      { name: 'BADANIA I ROZWÓJ', code: 'R&D', description: 'Grupa Badania i Rozwój' }
    ];
    
    for (const group of groups) {
      await Group.findOrCreate({
        where: { name: group.name },
        defaults: {
          code: group.code,
          description: group.description
        }
      });
    }
    
    console.log('Tworzenie słownika kontrahentów...');
    const contractors = [
      { name: 'FIRMA A SP. Z O.O.', code: 'FIRMA-A', description: 'Kontrahent Firma A' },
      { name: 'PRZEDSIĘBIORSTWO B', code: 'PRZED-B', description: 'Kontrahent Przedsiębiorstwo B' },
      { name: 'ZAKŁAD USŁUGOWY C', code: 'ZAKL-C', description: 'Kontrahent Zakład Usługowy C' },
      { name: 'HURTOWNIA D', code: 'HURT-D', description: 'Kontrahent Hurtownia D' },
      { name: 'SKLEP E', code: 'SKLEP-E', description: 'Kontrahent Sklep E' },
      { name: 'BIURO PODRÓŻY F', code: 'BIURO-F', description: 'Kontrahent Biuro Podróży F' },
      { name: 'RESTAURACJA G', code: 'REST-G', description: 'Kontrahent Restauracja G' },
      { name: 'HOTEL H', code: 'HOTEL-H', description: 'Kontrahent Hotel H' },
      { name: 'KANCELARIA I', code: 'KANC-I', description: 'Kontrahent Kancelaria I' },
      { name: 'CENTRUM MEDYCZNE J', code: 'MED-J', description: 'Kontrahent Centrum Medyczne J' }
    ];
    
    for (const contractor of contractors) {
      await Contractor.findOrCreate({
        where: { name: contractor.name },
        defaults: {
          code: contractor.code,
          description: contractor.description
        }
      });
    }
    
    console.log('Tworzenie słownika kategorii kosztów...');
    const costCategories = [
      { name: 'WYNAGRODZENIA', code: 'WYNAGR', description: 'Kategoria kosztów Wynagrodzenia' },
      { name: 'MATERIAŁY BIUROWE', code: 'MAT-BIUR', description: 'Kategoria kosztów Materiały biurowe' },
      { name: 'USŁUGI OBCE', code: 'USL-OBCE', description: 'Kategoria kosztów Usługi obce' },
      { name: 'TRANSPORT', code: 'TRANSPORT', description: 'Kategoria kosztów Transport' },
      { name: 'ENERGIA', code: 'ENERGIA', description: 'Kategoria kosztów Energia' },
      { name: 'TELEKOMUNIKACJA', code: 'TELEKOM', description: 'Kategoria kosztów Telekomunikacja' },
      { name: 'CZYNSZ', code: 'CZYNSZ', description: 'Kategoria kosztów Czynsz' },
      { name: 'SZKOLENIA', code: 'SZKOLENIA', description: 'Kategoria kosztów Szkolenia' },
      { name: 'REKLAMA', code: 'REKLAMA', description: 'Kategoria kosztów Reklama' },
      { name: 'UBEZPIECZENIA', code: 'UBEZP', description: 'Kategoria kosztów Ubezpieczenia' }
    ];
    
    for (const category of costCategories) {
      await CostCategory.findOrCreate({
        where: { name: category.name },
        defaults: {
          code: category.code,
          description: category.description
        }
      });
    }
    
    console.log('Tworzenie słownika rodzajów usług...');
    const serviceTypes = [
      { name: 'USŁUGI INFORMATYCZNE', code: 'USL-IT', description: 'Rodzaj usługi Usługi informatyczne' },
      { name: 'USŁUGI KSIĘGOWE', code: 'USL-KSIEG', description: 'Rodzaj usługi Usługi księgowe' },
      { name: 'USŁUGI PRAWNE', code: 'USL-PRAW', description: 'Rodzaj usługi Usługi prawne' },
      { name: 'USŁUGI MARKETINGOWE', code: 'USL-MARK', description: 'Rodzaj usługi Usługi marketingowe' },
      { name: 'USŁUGI TRANSPORTOWE', code: 'USL-TRANS', description: 'Rodzaj usługi Usługi transportowe' },
      { name: 'USŁUGI SZKOLENIOWE', code: 'USL-SZKOL', description: 'Rodzaj usługi Usługi szkoleniowe' },
      { name: 'USŁUGI DORADCZE', code: 'USL-DORAD', description: 'Rodzaj usługi Usługi doradcze' },
      { name: 'USŁUGI REMONTOWE', code: 'USL-REMONT', description: 'Rodzaj usługi Usługi remontowe' },
      { name: 'USŁUGI SPRZĄTAJĄCE', code: 'USL-SPRZ', description: 'Rodzaj usługi Usługi sprzątające' },
      { name: 'USŁUGI REKRUTACYJNE', code: 'USL-REKR', description: 'Rodzaj usługi Usługi rekrutacyjne' }
    ];
    
    for (const serviceType of serviceTypes) {
      await ServiceType.findOrCreate({
        where: { name: serviceType.name },
        defaults: {
          code: serviceType.code,
          description: serviceType.description
        }
      });
    }
    
    // Próba pobrania unikalnych wartości z istniejących tabel transakcyjnych
    try {
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
      
      // Pobierz unikalne wartości z tabeli payrolls
      const [payrollDepartments] = await sequelize.query(
        'SELECT DISTINCT "departmentId" FROM payrolls WHERE "departmentId" IS NOT NULL'
      );
      
      const [payrollGroups] = await sequelize.query(
        'SELECT DISTINCT "groupId" FROM payrolls WHERE "groupId" IS NOT NULL'
      );
      
      console.log('Znaleziono unikalne wartości w tabelach transakcyjnych');
    } catch (error) {
      console.warn('Nie udało się pobrać unikalnych wartości z tabel transakcyjnych:', error.message);
      console.log('Kontynuowanie z domyślnymi słownikami...');
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
