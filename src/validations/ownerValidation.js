const Joi = require('joi');

const createOwnerSchema = Joi.object({
  firstName: Joi.string().max(100).required(),
  lastName: Joi.string().max(100).required(),
  email: Joi.string().email().max(255).required(),
  phone: Joi.string().max(20).optional().allow(null, ''),
  mobile: Joi.string().max(20).optional().allow(null, ''),
  address: Joi.string().optional().allow(null, ''),
  city: Joi.string().max(100).optional().allow(null, ''),
  country: Joi.string().max(100).default('Malta'),
  companyName: Joi.string().max(255).optional().allow(null, ''),
  taxId: Joi.string().max(50).optional().allow(null, ''),
  notes: Joi.string().optional().allow(null, ''),
  isActive: Joi.boolean().default(true)
});

const updateOwnerSchema = Joi.object({
  firstName: Joi.string().max(100).optional(),
  lastName: Joi.string().max(100).optional(),
  email: Joi.string().email().max(255).optional(),
  phone: Joi.string().max(20).optional().allow(null, ''),
  mobile: Joi.string().max(20).optional().allow(null, ''),
  address: Joi.string().optional().allow(null, ''),
  city: Joi.string().max(100).optional().allow(null, ''),
  country: Joi.string().max(100).optional(),
  companyName: Joi.string().max(255).optional().allow(null, ''),
  taxId: Joi.string().max(50).optional().allow(null, ''),
  notes: Joi.string().optional().allow(null, ''),
  isActive: Joi.boolean().optional()
}).min(1);

module.exports = {
  createOwnerSchema,
  updateOwnerSchema
};
