'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Report, { foreignKey: 'userId', as: 'reports' });
    }
  }
  User.init({
    nama: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    password: DataTypes.STRING,
    role: { type: DataTypes.ENUM('admin', 'warga'), defaultValue: 'warga' }
  }, { sequelize, modelName: 'User' });
  return User;
};