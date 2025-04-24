const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
    employeeName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true
    },
    grossAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    netAmount: {
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

  return Payroll;
};
