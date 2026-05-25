'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reports', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      userId: { type: Sequelize.INTEGER, references: { model: 'Users', key: 'id' } },
      title: { type: Sequelize.STRING },
      description: { type: Sequelize.TEXT },
      photo: { type: Sequelize.STRING },
      latitude: { type: Sequelize.DECIMAL(10, 8) },
      longitude: { type: Sequelize.DECIMAL(11, 8) },
      status: { type: Sequelize.ENUM('Pending', 'Proses', 'Selesai'), defaultValue: 'Pending' },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('Reports'); }
};