const { Department, Group, ServiceType, Contractor, CostCategory } = require('../models');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

async function seedDictionaries() {
  console.log('Rozpoczynam import danych słownikowych z plików Excel...');
  
  try {
    // Sprawdzenie, czy słowniki są już zaimportowane
    const departmentsCount = await Department.count();
    const groupsCount = await Group.count();
    const serviceTypesCount = await ServiceType.count();
    const contractorsCount = await Contractor.count();
    const costCategoriesCount = await CostCategory.count();
    
    console.log(`Aktualna liczba rekordów: Departamenty: ${departmentsCount}, Grupy: ${groupsCount}, Rodzaje usług: ${serviceTypesCount}, Kontrahenci: ${contractorsCount}, Kategorie kosztów: ${costCategoriesCount}`);
    
    if (departmentsCount > 0 && groupsCount > 0 && serviceTypesCount > 0 && contractorsCount > 0 && costCategoriesCount > 0) {
      console.log('Dane słownikowe już istnieją. Pomijam import.');
      return { success: true, message: 'Dane słownikowe już istnieją' };
    }
    
    // Ścieżki do plików Excel
    const zakupPath = path.join('/home/ubuntu/upload', 'Zakup.xlsx');
    const sprzedazPath = path.join('/home/ubuntu/upload', 'Sprzedaz.xlsx');
    const wyplatyPath = path.join('/home/ubuntu/upload', 'wyplaty.xlsx');
    
    // Sprawdzenie, czy pliki istnieją
    if (!fs.existsSync(zakupPath)) {
      throw new Error(`Plik ${zakupPath} nie istnieje`);
    }
    if (!fs.existsSync(sprzedazPath)) {
      throw new Error(`Plik ${sprzedazPath} nie istnieje`);
    }
    if (!fs.existsSync(wyplatyPath)) {
      throw new Error(`Plik ${wyplatyPath} nie istnieje`);
    }
    
    // Wczytanie plików Excel
    const zakupWorkbook = xlsx.readFile(zakupPath);
    const sprzedazWorkbook = xlsx.readFile(sprzedazPath);
    const wyplatyWorkbook = xlsx.readFile(wyplatyPath);
    
    // Konwersja arkuszy na JSON
    const zakupData = xlsx.utils.sheet_to_json(zakupWorkbook.Sheets[zakupWorkbook.SheetNames[0]]);
    const sprzedazData = xlsx.utils.sheet_to_json(sprzedazWorkbook.Sheets[sprzedazWorkbook.SheetNames[0]]);
    const wyplatyData = xlsx.utils.sheet_to_json(wyplatyWorkbook.Sheets[wyplatyWorkbook.SheetNames[0]]);
    
    console.log(`Wczytano dane: ${zakupData.length} rekordów zakupów, ${sprzedazData.length} rekordów sprzedaży, ${wyplatyData.length} rekordów wypłat`);
    
    // Ekstrakcja unikalnych departamentów
    const departmentsSet = new Set();
    zakupData.forEach(row => {
      if (row['Oddział'] && row['Oddział'].trim()) {
        departmentsSet.add(row['Oddział'].trim());
      }
    });
    sprzedazData.forEach(row => {
      if (row['Oddział'] && row['Oddział'].trim()) {
        departmentsSet.add(row['Oddział'].trim());
      }
    });
    wyplatyData.forEach(row => {
      if (row['Oddział'] && row['Oddział'].trim()) {
        departmentsSet.add(row['Oddział'].trim());
      }
    });
    
    const departments = Array.from(departmentsSet).map(name => ({
      name,
      code: name.substring(0, 3),
      description: `Oddział ${name}`
    }));
    
    const createdDepartments = await Department.bulkCreate(departments);
    console.log(`Zaimportowano ${createdDepartments.length} departamentów`);
    
    // Ekstrakcja unikalnych grup
    const groupsSet = new Set();
    zakupData.forEach(row => {
      if (row['Kolumna2'] && row['Kolumna2'].trim()) {
        groupsSet.add(row['Kolumna2'].trim());
      }
    });
    sprzedazData.forEach(row => {
      if (row['Kolumna2'] && row['Kolumna2'].trim()) {
        groupsSet.add(row['Kolumna2'].trim());
      }
    });
    wyplatyData.forEach(row => {
      if (row['Kolumna2'] && row['Kolumna2'].trim()) {
        groupsSet.add(row['Kolumna2'].trim());
      }
    });
    
    // Mapowanie departamentów na ID
    const departmentMap = {};
    createdDepartments.forEach(dept => {
      departmentMap[dept.name] = dept.id;
    });
    
    // Przypisanie grup do departamentów (losowo dla uproszczenia)
    const departmentIds = Object.values(departmentMap);
    const groups = Array.from(groupsSet).map(name => {
      const randomDeptId = departmentIds[Math.floor(Math.random() * departmentIds.length)];
      return {
        name,
        code: name.substring(0, 3),
        description: `Grupa ${name}`,
        departmentId: randomDeptId
      };
    });
    
    const createdGroups = await Group.bulkCreate(groups);
    console.log(`Zaimportowano ${createdGroups.length} grup`);
    
    // Ekstrakcja unikalnych rodzajów usług/kategorii
    const categoriesSet = new Set();
    zakupData.forEach(row => {
      if (row['Kategoria'] && row['Kategoria'].trim()) {
        categoriesSet.add(row['Kategoria'].trim());
      }
    });
    sprzedazData.forEach(row => {
      if (row['Kategoria'] && row['Kategoria'].trim()) {
        categoriesSet.add(row['Kategoria'].trim());
      }
    });
    
    // Tworzenie rodzajów usług
    const serviceTypes = Array.from(categoriesSet).map(name => ({
      name,
      code: name.substring(0, 3),
      description: `Usługa ${name}`
    }));
    
    const createdServiceTypes = await ServiceType.bulkCreate(serviceTypes);
    console.log(`Zaimportowano ${createdServiceTypes.length} rodzajów usług`);
    
    // Ekstrakcja unikalnych kontrahentów
    const contractorsSet = new Set();
    zakupData.forEach(row => {
      if (row['Kontrahent'] && row['Kontrahent'].trim()) {
        contractorsSet.add(row['Kontrahent'].trim());
      }
    });
    sprzedazData.forEach(row => {
      if (row['Kontrahent'] && row['Kontrahent'].trim()) {
        contractorsSet.add(row['Kontrahent'].trim());
      }
    });
    
    // Tworzenie kontrahentów
    const contractors = Array.from(contractorsSet).map(name => {
      // Ekstrakcja NIP jeśli istnieje w danych
      let nip = '';
      const zakupRow = zakupData.find(row => row['Kontrahent'] === name);
      if (zakupRow && zakupRow['Płatnik']) {
        nip = zakupRow['Płatnik'];
      }
      
      return {
        name,
        code: name.substring(0, 3),
        description: `Kontrahent ${name}`,
        nip,
        address: '',
        contactPerson: '',
        email: '',
        phone: ''
      };
    });
    
    const createdContractors = await Contractor.bulkCreate(contractors);
    console.log(`Zaimportowano ${createdContractors.length} kontrahentów`);
    
    // Tworzenie kategorii kosztów (te same co rodzaje usług dla uproszczenia)
    const costCategories = Array.from(categoriesSet).map(name => ({
      name,
      code: name.substring(0, 3),
      description: `Kategoria kosztów ${name}`
    }));
    
    const createdCostCategories = await CostCategory.bulkCreate(costCategories);
    console.log(`Zaimportowano ${createdCostCategories.length} kategorii kosztów`);
    
    console.log('Import danych słownikowych zakończony sukcesem');
    return { 
      success: true, 
      message: 'Dane słownikowe zostały zaimportowane z plików Excel',
      counts: {
        departments: createdDepartments.length,
        groups: createdGroups.length,
        serviceTypes: createdServiceTypes.length,
        contractors: createdContractors.length,
        costCategories: createdCostCategories.length
      }
    };
  } catch (error) {
    console.error('Błąd podczas importu danych słownikowych:', error);
    return { success: false, message: `Błąd podczas importu danych słownikowych: ${error.message}` };
  }
}

module.exports = seedDictionaries;
