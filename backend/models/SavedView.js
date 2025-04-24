const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SavedView = sequelize.define('SavedView', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('purchase', 'payroll', 'sale'),
      allowNull: false
    },
    filters: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {}
    },
    columns: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    sortBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sortDirection: {
      type: DataTypes.ENUM('asc', 'desc'),
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'saved_views',
    timestamps: true
  });

  return SavedView;
};
