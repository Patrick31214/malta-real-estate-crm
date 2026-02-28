'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('properties', 'rental_type', {
      type: Sequelize.ENUM('short', 'long'),
      allowNull: true
    });
    await queryInterface.addColumn('properties', 'available_from', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('properties', 'available_from');
    await queryInterface.removeColumn('properties', 'rental_type');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_properties_rental_type";');
  }
};
