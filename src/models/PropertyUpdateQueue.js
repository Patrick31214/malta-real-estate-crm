const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PropertyUpdateQueue = sequelize.define('PropertyUpdateQueue', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  propertyId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'property_id'
  },
  updateType: {
    type: DataTypes.ENUM(
      'price_change',
      'status_change',
      'details_update',
      'images_update',
      'new_listing',
      'delisting',
      'featured_update',
      'other'
    ),
    allowNull: false,
    field: 'update_type'
  },
  oldValue: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'old_value'
  },
  newValue: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'new_value'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  scheduledFor: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'scheduled_for'
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'processed_at'
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
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    validate: {
      min: 1,
      max: 10
    }
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'created_by'
  }
}, {
  tableName: 'property_updates_queue',
  timestamps: true,
  underscored: true
});

module.exports = PropertyUpdateQueue;
