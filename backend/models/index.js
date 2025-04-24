const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

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

// Inicjalizacja modeli
const User = require('./User')(sequelize);
const Department = require('./Department')(sequelize);
const Group = require('./Group')(sequelize);
const ServiceType = require('./ServiceType')(sequelize);
const Contractor = require('./Contractor')(sequelize);
const CostCategory = require('./CostCategory')(sequelize);
const ImportedFile = require('./ImportedFile')(sequelize);
const Purchase = require('./Purchase')(sequelize);
const Payroll = require('./Payroll')(sequelize);
const Sale = require('./Sale')(sequelize);
const SavedView = require('./SavedView')(sequelize);
const ApplicationLog = require('./ApplicationLog')(sequelize);

// Definicja relacji między modelami
Department.hasMany(Group, { foreignKey: 'departmentId' });
Group.belongsTo(Department, { foreignKey: 'departmentId' });

Department.hasMany(Purchase, { foreignKey: 'departmentId' });
Purchase.belongsTo(Department, { foreignKey: 'departmentId' });

Department.hasMany(Payroll, { foreignKey: 'departmentId' });
Payroll.belongsTo(Department, { foreignKey: 'departmentId' });

Department.hasMany(Sale, { foreignKey: 'departmentId' });
Sale.belongsTo(Department, { foreignKey: 'departmentId' });

Group.hasMany(Purchase, { foreignKey: 'groupId' });
Purchase.belongsTo(Group, { foreignKey: 'groupId' });

Group.hasMany(Payroll, { foreignKey: 'groupId' });
Payroll.belongsTo(Group, { foreignKey: 'groupId' });

Group.hasMany(Sale, { foreignKey: 'groupId' });
Sale.belongsTo(Group, { foreignKey: 'groupId' });

ServiceType.hasMany(Purchase, { foreignKey: 'serviceTypeId' });
Purchase.belongsTo(ServiceType, { foreignKey: 'serviceTypeId' });

ServiceType.hasMany(Sale, { foreignKey: 'serviceTypeId' });
Sale.belongsTo(ServiceType, { foreignKey: 'serviceTypeId' });

Contractor.hasMany(Purchase, { foreignKey: 'contractorId' });
Purchase.belongsTo(Contractor, { foreignKey: 'contractorId' });

CostCategory.hasMany(Purchase, { foreignKey: 'costCategoryId' });
Purchase.belongsTo(CostCategory, { foreignKey: 'costCategoryId' });

ImportedFile.hasMany(Purchase, { foreignKey: 'importedFileId' });
Purchase.belongsTo(ImportedFile, { foreignKey: 'importedFileId' });

ImportedFile.hasMany(Payroll, { foreignKey: 'importedFileId' });
Payroll.belongsTo(ImportedFile, { foreignKey: 'importedFileId' });

ImportedFile.hasMany(Sale, { foreignKey: 'importedFileId' });
Sale.belongsTo(ImportedFile, { foreignKey: 'importedFileId' });

User.hasMany(SavedView, { foreignKey: 'userId' });
SavedView.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ImportedFile, { foreignKey: 'importedBy' });
ImportedFile.belongsTo(User, { foreignKey: 'importedBy' });

User.hasMany(ApplicationLog, { foreignKey: 'userId' });
ApplicationLog.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Department,
  Group,
  ServiceType,
  Contractor,
  CostCategory,
  Purchase,
  Payroll,
  Sale,
  ImportedFile,
  SavedView,
  ApplicationLog
};
