const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Agent = sequelize.define('Agent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    field: 'user_id'
  },
  licenseNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    field: 'license_number'
  },
  specialization: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  commissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 100
    },
    field: 'commission_rate'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  mobile: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  officeAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'office_address'
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  profileImageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'profile_image_url'
  },
  languages: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: ['English']
  },
  yearsExperience: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'years_experience'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  branchId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'branch_id'
  }
}, {
  tableName: 'agents',
  timestamps: true,
  underscored: true
});

module.exports = Agent;
