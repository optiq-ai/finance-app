const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CostCategory = sequelize.define('CostCategory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'cost_categories',
    timestamps: true
  });

  return CostCategory;
};
