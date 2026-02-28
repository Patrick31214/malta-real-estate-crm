'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('properties', 'approval_status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('properties', 'approval_status');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_properties_approval_status";'
    );
  }
};
