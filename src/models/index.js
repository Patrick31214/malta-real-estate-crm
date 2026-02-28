const { sequelize } = require('../config/database');
const User = require('./User');
const Owner = require('./Owner');
const Agent = require('./Agent');
const Property = require('./Property');
const Inquiry = require('./Inquiry');
const PropertyUpdateQueue = require('./PropertyUpdateQueue');
const AutomatedContactLog = require('./AutomatedContactLog');
const AgentActivityLog = require('./AgentActivityLog');
const Service = require('./Service');
const OwnerContactView = require('./OwnerContactView');

// Define relationships

// User - Agent relationship (One-to-One)
User.hasOne(Agent, {
  foreignKey: 'userId',
  as: 'agentProfile',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Agent.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Owner - Property relationship (One-to-Many)
Owner.hasMany(Property, {
  foreignKey: 'ownerId',
  as: 'properties',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
Property.belongsTo(Owner, {
  foreignKey: 'ownerId',
  as: 'owner',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

// Agent - Property relationship (One-to-Many)
Agent.hasMany(Property, {
  foreignKey: 'agentId',
  as: 'properties',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
Property.belongsTo(Agent, {
  foreignKey: 'agentId',
  as: 'agent',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// Property - Inquiry relationship (One-to-Many)
Property.hasMany(Inquiry, {
  foreignKey: 'propertyId',
  as: 'inquiries',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Inquiry.belongsTo(Property, {
  foreignKey: 'propertyId',
  as: 'property',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Agent - Inquiry relationship (One-to-Many)
Agent.hasMany(Inquiry, {
  foreignKey: 'agentId',
  as: 'inquiries',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
Inquiry.belongsTo(Agent, {
  foreignKey: 'agentId',
  as: 'agent',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// Property - PropertyUpdateQueue relationship (One-to-Many)
Property.hasMany(PropertyUpdateQueue, {
  foreignKey: 'propertyId',
  as: 'updateQueue',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
PropertyUpdateQueue.belongsTo(Property, {
  foreignKey: 'propertyId',
  as: 'property',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// User - PropertyUpdateQueue relationship (One-to-Many)
User.hasMany(PropertyUpdateQueue, {
  foreignKey: 'createdBy',
  as: 'propertyUpdates',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
PropertyUpdateQueue.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// Property - AutomatedContactLog relationship (One-to-Many)
Property.hasMany(AutomatedContactLog, {
  foreignKey: 'propertyId',
  as: 'contactLogs',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
AutomatedContactLog.belongsTo(Property, {
  foreignKey: 'propertyId',
  as: 'property',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// Inquiry - AutomatedContactLog relationship (One-to-Many)
Inquiry.hasMany(AutomatedContactLog, {
  foreignKey: 'inquiryId',
  as: 'contactLogs',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
AutomatedContactLog.belongsTo(Inquiry, {
  foreignKey: 'inquiryId',
  as: 'inquiry',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// Agent - AutomatedContactLog relationship (One-to-Many)
Agent.hasMany(AutomatedContactLog, {
  foreignKey: 'agentId',
  as: 'contactLogs',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
AutomatedContactLog.belongsTo(Agent, {
  foreignKey: 'agentId',
  as: 'agent',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// User - AgentActivityLog relationship
User.hasMany(AgentActivityLog, {
  foreignKey: 'agentUserId',
  as: 'activityLogs',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
AgentActivityLog.belongsTo(User, {
  foreignKey: 'agentUserId',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// Agent - OwnerContactView
Agent.hasMany(OwnerContactView, { foreignKey: 'agentId', as: 'ownerContactViews', onDelete: 'CASCADE' });
OwnerContactView.belongsTo(Agent, { foreignKey: 'agentId', as: 'agent' });

// Owner - OwnerContactView
Owner.hasMany(OwnerContactView, { foreignKey: 'ownerId', as: 'contactViews', onDelete: 'CASCADE' });
OwnerContactView.belongsTo(Owner, { foreignKey: 'ownerId', as: 'owner' });

// Property - OwnerContactView
Property.hasMany(OwnerContactView, { foreignKey: 'propertyId', as: 'ownerContactViews', onDelete: 'SET NULL' });
OwnerContactView.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

module.exports = {
  sequelize,
  User,
  Owner,
  Agent,
  Property,
  Inquiry,
  PropertyUpdateQueue,
  AutomatedContactLog,
  AgentActivityLog,
  Service,
  OwnerContactView
};
