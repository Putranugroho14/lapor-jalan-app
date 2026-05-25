'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Reports', 'damageType', {
            type: Sequelize.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('Reports', 'damageSeverity', {
            type: Sequelize.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('Reports', 'trafficImpact', {
            type: Sequelize.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('Reports', 'impactedVehicles', {
            type: Sequelize.JSON, // Use JSON if supported by DB (TiDB supports it), otherwise TEXT could be a backup but JSON is preferred.
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Reports', 'damageType');
        await queryInterface.removeColumn('Reports', 'damageSeverity');
        await queryInterface.removeColumn('Reports', 'trafficImpact');
        await queryInterface.removeColumn('Reports', 'impactedVehicles');
    }
};
