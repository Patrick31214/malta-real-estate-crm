'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('services', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      title: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      category: { type: Sequelize.ENUM('boat_tour', 'car_rental', 'bike_rental', 'guided_tour', 'other'), allowNull: false, defaultValue: 'other' },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      currency: { type: Sequelize.STRING(3), defaultValue: 'EUR' },
      duration: { type: Sequelize.STRING(100), allowNull: true },
      location: { type: Sequelize.STRING(255), allowNull: true },
      images: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      contact_name: { type: Sequelize.STRING(255), allowNull: true },
      contact_phone: { type: Sequelize.STRING(50), allowNull: true },
      contact_email: { type: Sequelize.STRING(255), allowNull: true },
      available: { type: Sequelize.BOOLEAN, defaultValue: true },
      featured: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('services');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_services_category";');
  }
};
