'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      nama: { type: Sequelize.STRING },
      email: { type: Sequelize.STRING, unique: true },
      password: { type: Sequelize.STRING },
      role: { type: Sequelize.ENUM('admin', 'warga'), defaultValue: 'warga' },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('Users'); }
};