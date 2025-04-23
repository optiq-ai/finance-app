const { DataTypes } = require('sequelize');
const { sequelize } = require('./index');

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
    type: DataTypes.ENUM('purchases', 'payroll', 'sales'),
    allowNull: false
  },
  filters: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  columns: {
    type: DataTypes.JSONB,
    defaultValue: []
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

module.exports = SavedView;
