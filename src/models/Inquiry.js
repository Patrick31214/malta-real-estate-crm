const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Inquiry = sequelize.define('Inquiry', {
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
  agentId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'agent_id'
  },
  clientName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'client_name'
  },
  clientEmail: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    },
    field: 'client_email'
  },
  clientPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'client_phone'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  inquiryType: {
    type: DataTypes.ENUM(
      'viewing_request',
      'information_request',
      'make_offer',
      'callback_request',
      'general',
      'property',
      'affiliate',
      'partnership'
    ),
    allowNull: false,
    defaultValue: 'general',
    field: 'inquiry_type'
  },
  status: {
    type: DataTypes.ENUM(
      'new',
      'assigned',
      'contacted',
      'in_progress',
      'viewing_scheduled',
      'matched',
      'offer_made',
      'completed',
      'resolved',
      'cancelled',
      'on_hold'
    ),
    allowNull: false,
    defaultValue: 'new'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'medium'
  },
  preferredViewingDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'preferred_viewing_date'
  },
  preferredViewingTime: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'preferred_viewing_time'
  },
  offerAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    validate: {
      min: 0
    },
    field: 'offer_amount'
  },
  source: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'website'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  responseSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'response_sent'
  },
  responseSentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'response_sent_at'
  },
  followedUp: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'followed_up'
  },
  followedUpAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'followed_up_at'
  },
  numberOfPeople: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'number_of_people'
  },
  hasPets: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    field: 'has_pets'
  },
  numberOfAdults: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'number_of_adults'
  },
  numberOfChildren: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'number_of_children'
  }
}, {
  tableName: 'inquiries',
  timestamps: true,
  underscored: true
});

module.exports = Inquiry;
