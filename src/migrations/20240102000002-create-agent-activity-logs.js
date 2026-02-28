'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('agent_activity_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      agent_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'e.g. VIEW_OWNER_NAME, VIEW_OWNER_PHONE, VIEW_PROPERTY, etc.'
      },
      resource_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'owner, property, inquiry'
      },
      resource_id: {
        type: Sequelize.UUID,
        allowNull: true,
        comment: 'ID of the accessed resource'
      },
      resource_label: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Human-readable label (e.g. owner name) for display'
      },
      ip_address: {
        type: Sequelize.STRING(50),
        allowNull: true
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
    });

    await queryInterface.addIndex('agent_activity_logs', ['agent_user_id'], {
      name: 'activity_logs_agent_user_id_idx'
    });
    await queryInterface.addIndex('agent_activity_logs', ['created_at'], {
      name: 'activity_logs_created_at_idx'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('agent_activity_logs');
  }
};
