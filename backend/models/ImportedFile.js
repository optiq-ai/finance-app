const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ImportedFile = sequelize.define('ImportedFile', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    originalFilename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileType: {
      type: DataTypes.ENUM('purchase', 'payroll', 'sale'),
      allowNull: false
    },
    importDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    rowsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    importedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'error'),
      allowNull: false,
      defaultValue: 'pending'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'imported_files',
    timestamps: true
  });

  return ImportedFile;
};
