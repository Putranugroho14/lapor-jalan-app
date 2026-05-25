'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Check if user exists first to avoid duplicate error
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM Users WHERE email = 'admin@example.com';`
    );

    if (users[0].length === 0) {
      await queryInterface.bulkInsert('Users', [{
        nama: 'Admin Lokal',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'admin@example.com' }, {});
  }
};
