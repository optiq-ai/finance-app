const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Załadowanie zmiennych środowiskowych
dotenv.config();

// Konfiguracja połączenia z bazą danych
const sequelize = new Sequelize(
  process.env.DB_NAME || 'finance_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = {
  sequelize,
  Sequelize
};
