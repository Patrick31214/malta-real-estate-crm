'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('documents', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      title: { type: Sequelize.STRING(255), allowNull: false },
      category: {
        type: Sequelize.ENUM('contract', 'course', 'team_photo', 'event_photo', 'announcement_attachment', 'other'),
        allowNull: false,
        defaultValue: 'other'
      },
      file_path: { type: Sequelize.STRING(500), allowNull: false },
      file_name: { type: Sequelize.STRING(255), allowNull: false },
      file_type: { type: Sequelize.STRING(100), allowNull: true },
      file_size: { type: Sequelize.INTEGER, allowNull: true },
      uploaded_by: { type: Sequelize.UUID, allowNull: true },
      tags: { type: Sequelize.JSONB, defaultValue: [] },
      property_id: { type: Sequelize.UUID, allowNull: true },
      owner_id: { type: Sequelize.UUID, allowNull: true },
      agent_id: { type: Sequelize.UUID, allowNull: true },
      caption: { type: Sequelize.TEXT, allowNull: true },
      event_date: { type: Sequelize.DATEONLY, allowNull: true },
      location: { type: Sequelize.STRING(255), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('documents');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_documents_category";');
  }
};
