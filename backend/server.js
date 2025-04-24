const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3001;

// Synchronizacja modeli z bazą danych
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Połączenie z bazą danych nawiązane pomyślnie.');
    
    // Zawsze używamy alter: true, aby zapewnić aktualizację schematu bazy danych
    await sequelize.sync({ alter: true });
    console.log('Modele zsynchronizowane z bazą danych.');
  } catch (error) {
    console.error('Nie udało się połączyć z bazą danych:', error);
  }
};

// Uruchomienie serwera
const startServer = async () => {
  try {
    await syncDatabase();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Serwer uruchomiony na porcie ${PORT}`);
      console.log(`Środowisko: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Błąd podczas uruchamiania serwera:', error);
    process.exit(1);
  }
};

startServer();
