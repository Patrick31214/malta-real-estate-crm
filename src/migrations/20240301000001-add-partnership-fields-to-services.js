'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('services', 'partnership_type', {
      type: Sequelize.ENUM('company', 'individual', 'none'),
      allowNull: false,
      defaultValue: 'none'
    });
    await queryInterface.addColumn('services', 'partner_company_name', { type: Sequelize.STRING(255), allowNull: true });
    await queryInterface.addColumn('services', 'partner_company_reg', { type: Sequelize.STRING(100), allowNull: true });
    await queryInterface.addColumn('services', 'partner_contact_name', { type: Sequelize.STRING(255), allowNull: true });
    await queryInterface.addColumn('services', 'partner_contact_phone', { type: Sequelize.STRING(50), allowNull: true });
    await queryInterface.addColumn('services', 'partner_contact_email', { type: Sequelize.STRING(255), allowNull: true });
    await queryInterface.addColumn('services', 'commission_details', { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('services', 'contract_file', { type: Sequelize.STRING(500), allowNull: true });
    await queryInterface.addColumn('services', 'listed_by', { type: Sequelize.UUID, allowNull: true });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('services', 'partnership_type');
    await queryInterface.removeColumn('services', 'partner_company_name');
    await queryInterface.removeColumn('services', 'partner_company_reg');
    await queryInterface.removeColumn('services', 'partner_contact_name');
    await queryInterface.removeColumn('services', 'partner_contact_phone');
    await queryInterface.removeColumn('services', 'partner_contact_email');
    await queryInterface.removeColumn('services', 'commission_details');
    await queryInterface.removeColumn('services', 'contract_file');
    await queryInterface.removeColumn('services', 'listed_by');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_services_partnership_type";');
  }
};
