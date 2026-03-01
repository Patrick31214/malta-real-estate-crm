const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Announcement = sequelize.define('Announcement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  body: { type: DataTypes.TEXT },
  priority: { type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'), defaultValue: 'normal' },
  authorId: { type: DataTypes.UUID, allowNull: true, field: 'author_id' },
  targetType: { type: DataTypes.STRING(50), defaultValue: 'all', field: 'target_type' },
  targetIds: { type: DataTypes.JSONB, defaultValue: [], field: 'target_ids' },
  attachments: { type: DataTypes.JSONB, defaultValue: [] },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' }
}, {
  tableName: 'announcements',
  timestamps: true,
  underscored: true
});

module.exports = Announcement;
