const Joi = require('joi');

const createInquirySchema = Joi.object({
  propertyId: Joi.string().uuid().required(),
  agentId: Joi.string().uuid().optional().allow(null),
  clientName: Joi.string().max(200).required(),
  clientEmail: Joi.string().email().max(255).required(),
  clientPhone: Joi.string().max(20).optional().allow(null, ''),
  message: Joi.string().optional().allow(null, ''),
  inquiryType: Joi.string()
    .valid(
      'viewing_request',
      'information_request',
      'make_offer',
      'callback_request',
      'general'
    )
    .default('general'),
  status: Joi.string()
    .valid(
      'new',
      'contacted',
      'in_progress',
      'viewing_scheduled',
      'offer_made',
      'completed',
      'cancelled'
    )
    .default('new'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  preferredViewingDate: Joi.date().optional().allow(null),
  preferredViewingTime: Joi.string().max(50).optional().allow(null, ''),
  offerAmount: Joi.number().min(0).optional().allow(null),
  source: Joi.string().max(100).default('website'),
  notes: Joi.string().optional().allow(null, ''),
  responseSent: Joi.boolean().default(false),
  responseSentAt: Joi.date().optional().allow(null),
  followedUp: Joi.boolean().default(false),
  followedUpAt: Joi.date().optional().allow(null)
});

const updateInquirySchema = Joi.object({
  agentId: Joi.string().uuid().optional().allow(null),
  clientName: Joi.string().max(200).optional(),
  clientEmail: Joi.string().email().max(255).optional(),
  clientPhone: Joi.string().max(20).optional().allow(null, ''),
  message: Joi.string().optional().allow(null, ''),
  inquiryType: Joi.string()
    .valid(
      'viewing_request',
      'information_request',
      'make_offer',
      'callback_request',
      'general'
    )
    .optional(),
  status: Joi.string()
    .valid(
      'new',
      'contacted',
      'in_progress',
      'viewing_scheduled',
      'offer_made',
      'completed',
      'cancelled'
    )
    .optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  preferredViewingDate: Joi.date().optional().allow(null),
  preferredViewingTime: Joi.string().max(50).optional().allow(null, ''),
  offerAmount: Joi.number().min(0).optional().allow(null),
  source: Joi.string().max(100).optional(),
  notes: Joi.string().optional().allow(null, ''),
  responseSent: Joi.boolean().optional(),
  responseSentAt: Joi.date().optional().allow(null),
  followedUp: Joi.boolean().optional(),
  followedUpAt: Joi.date().optional().allow(null)
}).min(1);

module.exports = {
  createInquirySchema,
  updateInquirySchema
};
