const Joi = require('joi');

const schema = Joi.object({
  customer: Joi.string().optional(),
  customerName: Joi.string().required(),
  subject: Joi.string().required(),
  description: Joi.string().required(),
  status: Joi.string().valid('Open', 'InProgress', 'Closed').default('Open'),
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical').default('Medium'),
  resolution: Joi.string().allow('').default(''),
  assignedTo: Joi.string().allow('').default(''),
  tags: Joi.array().items(Joi.string()).default([]),
});

module.exports = schema;