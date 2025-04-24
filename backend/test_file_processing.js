// Skrypt testowy do uruchomienia w kontenerze Docker
const fs = require('fs');

console.log('=== Test poprawionego przetwarzania plików Excel ===');
console.log('Ten skrypt należy uruchomić w kontenerze Docker, gdzie dostępne są wszystkie zależności.');
console.log('Instrukcja testowania:');
console.log('1. Uruchom aplikację w kontenerach Docker: docker-compose up -d');
console.log('2. Wejdź do kontenera backendu: docker-compose exec backend bash');
console.log('3. Uruchom ten skrypt: node /app/test_file_processing.js');
console.log('\nPoniżej znajduje się kod, który zostanie wykonany:');
console.log(`
const { Department, Group, ServiceType, Contractor, CostCategory } = require('./models');

// Funkcje do wyszukiwania identyfikatorów na podstawie nazw
const findDepartmentId = async (name) => {
  if (!name) return null;
  
  try {
    const department = await Department.findOne({
      where: { name: name.trim() }
    });
    
    if (department) {
      console.log(\`Znaleziono departament: \${name} => ID: \${department.id}\`);
      return department.id;
    } else {
      console.log(\`Nie znaleziono departamentu o nazwie: \${name}\`);
      return null;
    }
  } catch (err) {
    console.error(\`Błąd podczas wyszukiwania departamentu \${name}:\`, err);
    return null;
  }
};

// Funkcja do wyświetlania wszystkich departamentów
async function listAllDepartments() {
  try {
    const departments = await Department.findAll({ order: [['name', 'ASC']] });
    console.log('\\n=== Lista wszystkich departamentów ===');
    departments.forEach(dept => {
      console.log(\`ID: \${dept.id}, Nazwa: \${dept.name}\`);
    });
    console.log(\`Łącznie departamentów: \${departments.length}\`);
  } catch (err) {
    console.error('Błąd podczas pobierania departamentów:', err);
  }
}

// Główna funkcja testowa
async function runTests() {
  try {
    console.log('=== Rozpoczęcie testów wyszukiwania w słownikach ===\\n');
    
    // Wyświetl wszystkie departamenty
    await listAllDepartments();
    
    // Testuj wyszukiwanie wartości z plików Excel
    console.log('\\n=== Testowanie wyszukiwania wartości z plików Excel ===');
    
    // Testuj departamenty
    console.log('\\nTestowanie departamentów:');
    await findDepartmentId('ZAMOŚĆ');
    await findDepartmentId('KALISZ');
    await findDepartmentId('ADMINISTRACJA');
    await findDepartmentId('ROMAN');
    
    console.log('\\n=== Zakończenie testów ===');
    
  } catch (err) {
    console.error('Błąd podczas wykonywania testów:', err);
  }
}

// Uruchom testy
runTests();
`);

// Zapisz instrukcje testowe
console.log('\nZapisano instrukcje testowe do pliku test_file_processing.js');
