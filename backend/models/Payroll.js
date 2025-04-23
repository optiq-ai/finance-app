const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

const Payroll = sequelize.define('Payroll', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'groups',
      key: 'id'
    }
  },
  importedFileId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'imported_files',
      key: 'id'
    }
  }
}, {
  tableName: 'payrolls',
  timestamps: true
});

module.exports = Payroll;
