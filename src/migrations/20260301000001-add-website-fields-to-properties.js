'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('properties').catch(() => null);
    if (!tableDesc) return;

    if (!tableDesc.children_friendly) {
      await queryInterface.addColumn('properties', 'children_friendly', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }
    if (!tableDesc.posted_to_website) {
      await queryInterface.addColumn('properties', 'posted_to_website', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }
    if (!tableDesc.posted_to_facebook) {
      await queryInterface.addColumn('properties', 'posted_to_facebook', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }
    if (!tableDesc.posted_to_instagram) {
      await queryInterface.addColumn('properties', 'posted_to_instagram', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }
    if (!tableDesc.available_from) {
      await queryInterface.addColumn('properties', 'available_from', {
        type: Sequelize.DATEONLY,
        allowNull: true
      });
    }
  },

  async down(queryInterface) {
    const tableDesc = await queryInterface.describeTable('properties').catch(() => null);
    if (!tableDesc) return;

    const cols = ['children_friendly', 'posted_to_website', 'posted_to_facebook', 'posted_to_instagram', 'available_from'];
    for (const col of cols) {
      if (tableDesc[col]) {
        await queryInterface.removeColumn('properties', col);
      }
    }
  }
};
