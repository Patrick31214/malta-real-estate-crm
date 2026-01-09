const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AutomatedContactLog = sequelize.define('AutomatedContactLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  propertyId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'property_id'
  },
  inquiryId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'inquiry_id'
  },
  agentId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'agent_id'
  },
  contactType: {
    type: DataTypes.ENUM(
      'email',
      'sms',
      'push_notification',
      'webhook',
      'system_notification'
    ),
    allowNull: false,
    field: 'contact_type'
  },
  recipientEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'recipient_email'
  },
  recipientPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'recipient_phone'
  },
  recipientName: {
    type: DataTypes.STRING(200),
    allowNull: true,
    field: 'recipient_name'
  },
  subject: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  templateName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'template_name'
  },
  templateVariables: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    field: 'template_variables'
  },
  status: {
    type: DataTypes.ENUM(
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
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'sent_at'
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'delivered_at'
  },
  openedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'opened_at'
  },
  clickedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'clicked_at'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'error_message'
  },
  retryCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    },
    field: 'retry_count'
  },
  maxRetries: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
    validate: {
      min: 0
    },
    field: 'max_retries'
  },
  automationTrigger: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'automation_trigger'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  externalId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'external_id'
  }
}, {
  tableName: 'automated_contact_logs',
  timestamps: true,
  underscored: true
});

module.exports = AutomatedContactLog;
