const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OwnerContactView = sequelize.define('OwnerContactView', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  agentId: { type: DataTypes.UUID, allowNull: false, field: 'agent_id' },
  ownerId: { type: DataTypes.UUID, allowNull: false, field: 'owner_id' },
  propertyId: { type: DataTypes.UUID, allowNull: true, field: 'property_id' },
  viewedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'viewed_at' },
}, {
  tableName: 'owner_contact_views',
  timestamps: false
});

module.exports = OwnerContactView;
