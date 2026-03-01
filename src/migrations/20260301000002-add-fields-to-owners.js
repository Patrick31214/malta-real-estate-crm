'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('owners').catch(() => null);
    if (!tableDesc) return;

    const columnsToAdd = [
      { name: 'title',                    spec: { type: Sequelize.STRING(20),  allowNull: true } },
      { name: 'whatsapp',                 spec: { type: Sequelize.STRING(30),  allowNull: true } },
      { name: 'id_card_number',           spec: { type: Sequelize.STRING(50),  allowNull: true } },
      { name: 'passport_number',          spec: { type: Sequelize.STRING(50),  allowNull: true } },
      { name: 'nationality',              spec: { type: Sequelize.STRING(50),  allowNull: true } },
      { name: 'date_of_birth',            spec: { type: Sequelize.DATEONLY,    allowNull: true } },
      { name: 'preferred_language',       spec: { type: Sequelize.STRING(30),  allowNull: true } },
      { name: 'preferred_contact_method', spec: { type: Sequelize.STRING(20),  allowNull: true } },
      { name: 'notes',                    spec: { type: Sequelize.TEXT,        allowNull: true } },
      { name: 'company_reg',              spec: { type: Sequelize.STRING(100), allowNull: true } },
      { name: 'company_email',            spec: { type: Sequelize.STRING(100), allowNull: true } },
      { name: 'company_phone',            spec: { type: Sequelize.STRING(30),  allowNull: true } },
      { name: 'company_address',          spec: { type: Sequelize.TEXT,        allowNull: true } },
      { name: 'vat_number',               spec: { type: Sequelize.STRING(50),  allowNull: true } },
      { name: 'related_contacts',         spec: { type: Sequelize.JSONB,       allowNull: false, defaultValue: [] } }
    ];

    for (const { name, spec } of columnsToAdd) {
      if (!tableDesc[name]) {
        await queryInterface.addColumn('owners', name, spec);
      }
    }
  },

  async down(queryInterface) {
    const tableDesc = await queryInterface.describeTable('owners').catch(() => null);
    if (!tableDesc) return;

    const cols = [
      'title', 'whatsapp', 'id_card_number', 'passport_number', 'nationality',
      'date_of_birth', 'preferred_language', 'preferred_contact_method', 'notes',
      'company_reg', 'company_email', 'company_phone', 'company_address',
      'vat_number', 'related_contacts'
    ];

    for (const col of cols) {
      if (tableDesc[col]) {
        await queryInterface.removeColumn('owners', col);
      }
    }
  }
};
