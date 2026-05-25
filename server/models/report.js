'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    static associate(models) {
      Report.belongsTo(models.User, { foreignKey: 'userId', as: 'pelapor' });
    }
  }
  Report.init({
    userId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    photo: DataTypes.STRING,
    latitude: DataTypes.DECIMAL(10, 8),
    longitude: DataTypes.DECIMAL(12, 8),
    damageType: DataTypes.STRING,
    damageSeverity: DataTypes.STRING,
    trafficImpact: DataTypes.STRING,
    impactedVehicles: DataTypes.JSON,
    priority: {
      type: DataTypes.ENUM('Rendah', 'Sedang', 'Tinggi', 'Darurat'),
      defaultValue: 'Sedang'
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Proses', 'Selesai'),
      defaultValue: 'Pending'
    }
  }, { sequelize, modelName: 'Report' });
  return Report;
};