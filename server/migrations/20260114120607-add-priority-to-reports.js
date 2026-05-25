'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Reports', 'priority', {
      type: Sequelize.ENUM('Rendah', 'Sedang', 'Tinggi', 'Darurat'),
      defaultValue: 'Sedang',
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Reports', 'priority');
  }
};
