'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('property_updates_queue', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      property_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'properties',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      update_type: {
        type: Sequelize.ENUM(
          'price_change',
          'status_change',
          'details_update',
          'images_update',
          'new_listing',
          'delisting',
          'featured_update',
          'other'
        ),
        allowNull: false
      },
      old_value: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Previous value(s) before update'
      },
      new_value: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'New value(s) after update'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Description of the update'
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      scheduled_for: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When to process this update'
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Error message if processing failed'
      },
      retry_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      max_retries: {
        type: Sequelize.INTEGER,
        defaultValue: 3,
        validate: {
          min: 0
        }
      },
      priority: {
        type: Sequelize.INTEGER,
        defaultValue: 5,
        validate: {
          min: 1,
          max: 10
        },
        comment: '1 = highest priority, 10 = lowest priority'
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: 'Additional metadata for the update'
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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

    // Add indexes
    await queryInterface.addIndex('property_updates_queue', ['property_id'], {
      name: 'property_updates_queue_property_id_idx'
    });
    await queryInterface.addIndex('property_updates_queue', ['status'], {
      name: 'property_updates_queue_status_idx'
    });
    await queryInterface.addIndex('property_updates_queue', ['update_type'], {
      name: 'property_updates_queue_update_type_idx'
    });
    await queryInterface.addIndex('property_updates_queue', ['scheduled_for'], {
      name: 'property_updates_queue_scheduled_for_idx'
    });
    await queryInterface.addIndex('property_updates_queue', ['priority'], {
      name: 'property_updates_queue_priority_idx'
    });
    await queryInterface.addIndex('property_updates_queue', ['created_at'], {
      name: 'property_updates_queue_created_at_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('property_updates_queue');
  }
};
