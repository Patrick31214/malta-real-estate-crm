'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('automated_contact_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      property_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'properties',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Related property if applicable'
      },
      inquiry_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'inquiries',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Related inquiry if applicable'
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
        comment: 'Agent associated with this contact'
      },
      contact_type: {
        type: Sequelize.ENUM(
          'email',
          'sms',
          'push_notification',
          'webhook',
          'system_notification'
        ),
        allowNull: false
      },
      recipient_email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      recipient_phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      recipient_name: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      subject: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Subject line for emails'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      template_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Name of the template used'
      },
      template_variables: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: 'Variables used in the template'
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'sent',
          'delivered',
          'failed',
          'bounced',
          'opened',
          'clicked'
        ),
        allowNull: false,
        defaultValue: 'pending'
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      delivered_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      opened_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      clicked_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true
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
      automation_trigger: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'What triggered this automated contact (e.g., "new_inquiry", "price_drop")'
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: 'Additional metadata'
      },
      external_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'ID from external service (e.g., email service provider)'
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
    await queryInterface.addIndex('automated_contact_logs', ['property_id'], {
      name: 'automated_contact_logs_property_id_idx'
    });
    await queryInterface.addIndex('automated_contact_logs', ['inquiry_id'], {
      name: 'automated_contact_logs_inquiry_id_idx'
    });
    await queryInterface.addIndex('automated_contact_logs', ['agent_id'], {
      name: 'automated_contact_logs_agent_id_idx'
    });
    await queryInterface.addIndex('automated_contact_logs', ['contact_type'], {
      name: 'automated_contact_logs_contact_type_idx'
    });
    await queryInterface.addIndex('automated_contact_logs', ['status'], {
      name: 'automated_contact_logs_status_idx'
    });
    await queryInterface.addIndex('automated_contact_logs', ['recipient_email'], {
      name: 'automated_contact_logs_recipient_email_idx'
    });
    await queryInterface.addIndex('automated_contact_logs', ['automation_trigger'], {
      name: 'automated_contact_logs_automation_trigger_idx'
    });
    await queryInterface.addIndex('automated_contact_logs', ['created_at'], {
      name: 'automated_contact_logs_created_at_idx'
    });
    await queryInterface.addIndex('automated_contact_logs', ['sent_at'], {
      name: 'automated_contact_logs_sent_at_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('automated_contact_logs');
  }
};
