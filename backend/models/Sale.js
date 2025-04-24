const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Sale = sequelize.define('Sale', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    documentNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    netAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    vatAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    grossAmount: {
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
    serviceTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'service_types',
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
    tableName: 'sales',
    timestamps: true
  });

  return Sale;
};
