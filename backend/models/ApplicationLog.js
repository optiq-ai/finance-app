const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ApplicationLog = sequelize.define('ApplicationLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    details: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    level: {
      type: DataTypes.ENUM('info', 'warning', 'error'),
      allowNull: false,
      defaultValue: 'info'
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'application_logs',
    timestamps: true
  });

  return ApplicationLog;
};
