'use strict';

const { addIndexIfNotExists } = require('../utils/migration-helpers');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('inquiries', {
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
      agent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'agents',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Agent assigned to handle this inquiry'
      },
      client_name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      client_email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      client_phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      inquiry_type: {
        type: Sequelize.ENUM(
          'viewing_request',
          'information_request',
          'make_offer',
          'callback_request',
          'general'
        ),
        allowNull: false,
        defaultValue: 'general'
      },
      status: {
        type: Sequelize.ENUM(
          'new',
          'contacted',
          'in_progress',
          'viewing_scheduled',
          'offer_made',
          'completed',
          'cancelled'
        ),
        allowNull: false,
        defaultValue: 'new'
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
      },
      preferred_viewing_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      preferred_viewing_time: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'e.g., "morning", "afternoon", "evening"'
      },
      offer_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        validate: {
          min: 0
        }
      },
      source: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: 'website',
        comment: 'e.g., website, email, phone, social_media, referral'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Internal notes about the inquiry'
      },
      response_sent: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      response_sent_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      followed_up: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      followed_up_at: {
        type: Sequelize.DATE,
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

    // Add indexes
    await addIndexIfNotExists(queryInterface, 'inquiries', ['property_id'], {
      name: 'inquiries_property_id_idx'
    });
    await addIndexIfNotExists(queryInterface, 'inquiries', ['agent_id'], {
      name: 'inquiries_agent_id_idx'
    });
    await addIndexIfNotExists(queryInterface, 'inquiries', ['client_email'], {
      name: 'inquiries_client_email_idx'
    });
    await addIndexIfNotExists(queryInterface, 'inquiries', ['status'], {
      name: 'inquiries_status_idx'
    });
    await addIndexIfNotExists(queryInterface, 'inquiries', ['inquiry_type'], {
      name: 'inquiries_inquiry_type_idx'
    });
    await addIndexIfNotExists(queryInterface, 'inquiries', ['priority'], {
      name: 'inquiries_priority_idx'
    });
    await addIndexIfNotExists(queryInterface, 'inquiries', ['created_at'], {
      name: 'inquiries_created_at_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('inquiries');
  }
};
