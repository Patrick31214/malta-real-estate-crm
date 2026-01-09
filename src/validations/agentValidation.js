const Joi = require('joi');

const createAgentSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  licenseNumber: Joi.string().max(100).optional().allow(null, ''),
  specialization: Joi.string().max(255).optional().allow(null, ''),
  commissionRate: Joi.number().min(0).max(100).default(0),
  phone: Joi.string().max(20).optional().allow(null, ''),
  mobile: Joi.string().max(20).optional().allow(null, ''),
  officeAddress: Joi.string().optional().allow(null, ''),
  bio: Joi.string().optional().allow(null, ''),
  profileImageUrl: Joi.string().max(500).optional().allow(null, ''),
  languages: Joi.array().items(Joi.string()).default(['English']),
  yearsExperience: Joi.number().integer().min(0).default(0),
  isActive: Joi.boolean().default(true)
});

const updateAgentSchema = Joi.object({
  licenseNumber: Joi.string().max(100).optional().allow(null, ''),
  specialization: Joi.string().max(255).optional().allow(null, ''),
  commissionRate: Joi.number().min(0).max(100).optional(),
  phone: Joi.string().max(20).optional().allow(null, ''),
  mobile: Joi.string().max(20).optional().allow(null, ''),
  officeAddress: Joi.string().optional().allow(null, ''),
  bio: Joi.string().optional().allow(null, ''),
  profileImageUrl: Joi.string().max(500).optional().allow(null, ''),
  languages: Joi.array().items(Joi.string()).optional(),
  yearsExperience: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional()
}).min(1);

module.exports = {
  createAgentSchema,
  updateAgentSchema
};
