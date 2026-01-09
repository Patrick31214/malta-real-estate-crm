const Joi = require('joi');

const createPropertySchema = Joi.object({
  ownerId: Joi.string().uuid().required(),
  agentId: Joi.string().uuid().optional().allow(null),
  title: Joi.string().max(255).required(),
  description: Joi.string().optional().allow(null, ''),
  propertyType: Joi.string()
    .valid(
      'apartment',
      'house',
      'villa',
      'townhouse',
      'penthouse',
      'maisonette',
      'farmhouse',
      'commercial',
      'office',
      'land',
      'garage',
      'other'
    )
    .required(),
  listingType: Joi.string().valid('sale', 'rent', 'lease').default('sale'),
  status: Joi.string()
    .valid('available', 'under_offer', 'sold', 'rented', 'withdrawn', 'draft')
    .default('draft'),
  price: Joi.number().min(0).required(),
  currency: Joi.string().length(3).default('EUR'),
  bedrooms: Joi.number().integer().min(0).optional().allow(null),
  bathrooms: Joi.number().integer().min(0).optional().allow(null),
  squareMeters: Joi.number().min(0).optional().allow(null),
  yearBuilt: Joi.number().integer().min(1800).max(2100).optional().allow(null),
  floorNumber: Joi.number().integer().optional().allow(null),
  totalFloors: Joi.number().integer().optional().allow(null),
  address: Joi.string().required(),
  city: Joi.string().max(100).required(),
  region: Joi.string().max(100).optional().allow(null, ''),
  postalCode: Joi.string().max(20).optional().allow(null, ''),
  country: Joi.string().max(100).default('Malta'),
  latitude: Joi.number().min(-90).max(90).optional().allow(null),
  longitude: Joi.number().min(-180).max(180).optional().allow(null),
  features: Joi.array().items(Joi.string()).optional().default([]),
  images: Joi.array().items(Joi.string()).optional().default([]),
  videoUrl: Joi.string().max(500).optional().allow(null, ''),
  virtualTourUrl: Joi.string().max(500).optional().allow(null, ''),
  energyRating: Joi.string()
    .valid('A', 'B', 'C', 'D', 'E', 'F', 'G', 'exempt')
    .optional()
    .allow(null),
  furnished: Joi.string()
    .valid('furnished', 'semi-furnished', 'unfurnished')
    .optional()
    .allow(null),
  parkingSpaces: Joi.number().integer().min(0).default(0),
  hasGarden: Joi.boolean().default(false),
  hasPool: Joi.boolean().default(false),
  hasTerrace: Joi.boolean().default(false),
  hasBalcony: Joi.boolean().default(false),
  petFriendly: Joi.boolean().default(false),
  featured: Joi.boolean().default(false),
  publishedAt: Joi.date().optional().allow(null),
  expiresAt: Joi.date().optional().allow(null),
  isActive: Joi.boolean().default(true)
});

const updatePropertySchema = Joi.object({
  ownerId: Joi.string().uuid().optional(),
  agentId: Joi.string().uuid().optional().allow(null),
  title: Joi.string().max(255).optional(),
  description: Joi.string().optional().allow(null, ''),
  propertyType: Joi.string()
    .valid(
      'apartment',
      'house',
      'villa',
      'townhouse',
      'penthouse',
      'maisonette',
      'farmhouse',
      'commercial',
      'office',
      'land',
      'garage',
      'other'
    )
    .optional(),
  listingType: Joi.string().valid('sale', 'rent', 'lease').optional(),
  status: Joi.string()
    .valid('available', 'under_offer', 'sold', 'rented', 'withdrawn', 'draft')
    .optional(),
  price: Joi.number().min(0).optional(),
  currency: Joi.string().length(3).optional(),
  bedrooms: Joi.number().integer().min(0).optional().allow(null),
  bathrooms: Joi.number().integer().min(0).optional().allow(null),
  squareMeters: Joi.number().min(0).optional().allow(null),
  yearBuilt: Joi.number().integer().min(1800).max(2100).optional().allow(null),
  floorNumber: Joi.number().integer().optional().allow(null),
  totalFloors: Joi.number().integer().optional().allow(null),
  address: Joi.string().optional(),
  city: Joi.string().max(100).optional(),
  region: Joi.string().max(100).optional().allow(null, ''),
  postalCode: Joi.string().max(20).optional().allow(null, ''),
  country: Joi.string().max(100).optional(),
  latitude: Joi.number().min(-90).max(90).optional().allow(null),
  longitude: Joi.number().min(-180).max(180).optional().allow(null),
  features: Joi.array().items(Joi.string()).optional(),
  images: Joi.array().items(Joi.string()).optional(),
  videoUrl: Joi.string().max(500).optional().allow(null, ''),
  virtualTourUrl: Joi.string().max(500).optional().allow(null, ''),
  energyRating: Joi.string()
    .valid('A', 'B', 'C', 'D', 'E', 'F', 'G', 'exempt')
    .optional()
    .allow(null),
  furnished: Joi.string()
    .valid('furnished', 'semi-furnished', 'unfurnished')
    .optional()
    .allow(null),
  parkingSpaces: Joi.number().integer().min(0).optional(),
  hasGarden: Joi.boolean().optional(),
  hasPool: Joi.boolean().optional(),
  hasTerrace: Joi.boolean().optional(),
  hasBalcony: Joi.boolean().optional(),
  petFriendly: Joi.boolean().optional(),
  featured: Joi.boolean().optional(),
  publishedAt: Joi.date().optional().allow(null),
  expiresAt: Joi.date().optional().allow(null),
  isActive: Joi.boolean().optional()
}).min(1);

module.exports = {
  createPropertySchema,
  updatePropertySchema
};
