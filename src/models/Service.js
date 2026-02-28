const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Service = sequelize.define('Service', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  category: {
    type: DataTypes.ENUM('boat_tour', 'car_rental', 'bike_rental', 'guided_tour', 'other'),
    allowNull: false,
    defaultValue: 'other'
  },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
  currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'EUR' },
  duration: { type: DataTypes.STRING(100), allowNull: true },
  location: { type: DataTypes.STRING(255), allowNull: true },
  images: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true, defaultValue: [] },
  contactName: { type: DataTypes.STRING(255), allowNull: true, field: 'contact_name' },
  contactPhone: { type: DataTypes.STRING(50), allowNull: true, field: 'contact_phone' },
  contactEmail: { type: DataTypes.STRING(255), allowNull: true, field: 'contact_email' },
  available: { type: DataTypes.BOOLEAN, defaultValue: true },
  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
}, {
  tableName: 'services',
  timestamps: true,
  underscored: true
});

module.exports = Service;
