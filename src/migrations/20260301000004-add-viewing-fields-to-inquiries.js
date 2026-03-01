'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('inquiries').catch(() => null);
    if (!tableDesc) return;

    const columnsToAdd = [
      { name: 'preferred_viewing_date', spec: { type: Sequelize.DATEONLY, allowNull: true } },
      { name: 'preferred_viewing_time', spec: { type: Sequelize.STRING(20), allowNull: true } },
      { name: 'number_of_people',       spec: { type: Sequelize.INTEGER,  allowNull: true } },
      { name: 'has_pets',               spec: { type: Sequelize.BOOLEAN,  allowNull: true } },
      { name: 'number_of_adults',       spec: { type: Sequelize.INTEGER,  allowNull: true } },
      { name: 'number_of_children',     spec: { type: Sequelize.INTEGER,  allowNull: true } }
    ];

    for (const { name, spec } of columnsToAdd) {
      if (!tableDesc[name]) {
        await queryInterface.addColumn('inquiries', name, spec);
      }
    }
  },

  async down(queryInterface) {
    const tableDesc = await queryInterface.describeTable('inquiries').catch(() => null);
    if (!tableDesc) return;

    const cols = [
      'preferred_viewing_date', 'preferred_viewing_time',
      'number_of_people', 'has_pets', 'number_of_adults', 'number_of_children'
    ];

    for (const col of cols) {
      if (tableDesc[col]) {
        await queryInterface.removeColumn('inquiries', col);
      }
    }
  }
};
