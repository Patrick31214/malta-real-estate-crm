'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('owner_contact_views', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      agent_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'agents', key: 'id' }, onDelete: 'CASCADE' },
      owner_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'owners', key: 'id' }, onDelete: 'CASCADE' },
      property_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'properties', key: 'id' }, onDelete: 'SET NULL' },
      viewed_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('owner_contact_views');
  }
};
