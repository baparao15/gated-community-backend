const Joi = require('joi');

const createComplaintSchema = Joi.object({
  category: Joi.string()
    .valid('plumbing', 'electrical', 'cleaning', 'security', 'elevator', 'parking', 'noise', 'other')
    .required(),
  description: Joi.string().min(10).max(2000).required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
});

const assignSchema = Joi.object({
  staffId: Joi.string().hex().length(24).required(),
});

const statusSchema = Joi.object({
  status: Joi.string().valid('in-progress', 'resolved').required(),
  note: Joi.string().max(500).optional(),
});

const prioritySchema = Joi.object({
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
});

const feedbackSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  feedback: Joi.string().max(1000).optional(),
});

module.exports = { createComplaintSchema, assignSchema, statusSchema, prioritySchema, feedbackSchema };
