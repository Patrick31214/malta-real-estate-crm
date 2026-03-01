'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('announcements', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      priority: {
        type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'),
        defaultValue: 'normal',
        allowNull: false
      },
      author_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      target_type: {
        type: Sequelize.STRING(50),
        defaultValue: 'all',
        allowNull: false
      },
      target_ids: {
        type: Sequelize.JSONB,
        defaultValue: [],
        allowNull: false
      },
      attachments: {
        type: Sequelize.JSONB,
        defaultValue: [],
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, { ifNotExists: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('announcements');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_announcements_priority";');
  }
};
