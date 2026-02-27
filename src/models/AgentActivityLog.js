const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AgentActivityLog = sequelize.define('AgentActivityLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  agentUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'agent_user_id'
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  resourceType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'resource_type'
  },
  resourceId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'resource_id'
  },
  resourceLabel: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'resource_label'
  },
  ipAddress: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'ip_address'
  }
}, {
  tableName: 'agent_activity_logs',
  timestamps: true,
  underscored: true
});

module.exports = AgentActivityLog;
