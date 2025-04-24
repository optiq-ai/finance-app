const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ServiceType = sequelize.define('ServiceType', {
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
    tableName: 'service_types',
    timestamps: true
  });

  return ServiceType;
};
