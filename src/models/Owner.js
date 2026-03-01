const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Owner = sequelize.define('Owner', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'last_name'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  mobile: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(100),
    defaultValue: 'Malta'
  },
  companyName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'company_name'
  },
  taxId: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'tax_id'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  title: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  whatsapp: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  idCardNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'id_card_number'
  },
  passportNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'passport_number'
  },
  nationality: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'date_of_birth'
  },
  preferredLanguage: {
    type: DataTypes.STRING(30),
    allowNull: true,
    field: 'preferred_language'
  },
  preferredContactMethod: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'preferred_contact_method'
  },
  companyReg: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'company_reg'
  },
  companyEmail: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'company_email'
  },
  companyPhone: {
    type: DataTypes.STRING(30),
    allowNull: true,
    field: 'company_phone'
  },
  companyAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'company_address'
  },
  vatNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'vat_number'
  },
  relatedContacts: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'related_contacts'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'owners',
  timestamps: true,
  underscored: true
});

module.exports = Owner;
