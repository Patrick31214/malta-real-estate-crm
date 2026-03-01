const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'owner_id'
  },
  agentId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'agent_id'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  propertyType: {
    type: DataTypes.ENUM(
      'apartment',
      'house',
      'villa',
      'townhouse',
      'penthouse',
      'maisonette',
      'farmhouse',
      'bungalow',
      'warehouse',
      'commercial',
      'office',
      'land',
      'garage',
      'other'
    ),
    allowNull: false,
    field: 'property_type'
  },
  listingType: {
    type: DataTypes.ENUM('sale', 'rent', 'lease'),
    allowNull: false,
    defaultValue: 'sale',
    field: 'listing_type'
  },
  status: {
    type: DataTypes.ENUM(
      'available',
      'under_offer',
      'sold',
      'rented',
      'withdrawn',
      'draft'
    ),
    allowNull: false,
    defaultValue: 'draft'
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'EUR'
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0
    }
  },
  squareMeters: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    },
    field: 'square_meters'
  },
  yearBuilt: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1800,
      max: 2100
    },
    field: 'year_built'
  },
  floorNumber: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'floor_number'
  },
  totalFloors: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'total_floors'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  region: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  postalCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'postal_code'
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Malta'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  features: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  videoUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'video_url'
  },
  virtualTourUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'virtual_tour_url'
  },
  energyRating: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D', 'E', 'F', 'G', 'exempt'),
    allowNull: true,
    field: 'energy_rating'
  },
  furnished: {
    type: DataTypes.ENUM('furnished', 'semi-furnished', 'unfurnished'),
    allowNull: true
  },
  parkingSpaces: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'parking_spaces'
  },
  hasGarden: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'has_garden'
  },
  hasPool: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'has_pool'
  },
  hasTerrace: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'has_terrace'
  },
  hasBalcony: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'has_balcony'
  },
  petFriendly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'pet_friendly'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'view_count'
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'published_at'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  approvalStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
    field: 'approval_status'
  },
  rentalType: {
    type: DataTypes.ENUM('short', 'long'),
    allowNull: true,
    field: 'rental_type'
  },
  availableFrom: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'available_from'
  },
  childrenFriendly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'children_friendly'
  },
  postedToWebsite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'posted_to_website'
  },
  postedToFacebook: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'posted_to_facebook'
  },
  postedToInstagram: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'posted_to_instagram'
  },
}, {
  tableName: 'properties',
  timestamps: true,
  underscored: true
});

module.exports = Property;
