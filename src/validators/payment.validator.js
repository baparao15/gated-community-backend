const Joi = require('joi');

const generateInvoiceSchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2020).max(2100).required(),
  unitIds: Joi.array().items(Joi.string().hex().length(24)).optional(),
  lineItems: Joi.array().items(
    Joi.object({
      description: Joi.string().required(),
      amount: Joi.number().positive().required(),
      quantity: Joi.number().integer().min(1).optional(),
    })
  ).min(1).required(),
  dueDate: Joi.date().iso().required(),
  tax: Joi.number().min(0).max(100).optional(),
});

const payInvoiceSchema = Joi.object({
  method: Joi.string().valid('cash', 'bank-transfer', 'cheque', 'online', 'upi', 'other').required(),
  reference: Joi.string().max(100).optional(),
  amount: Joi.number().positive().optional(),
  notes: Joi.string().max(500).optional(),
});

module.exports = { generateInvoiceSchema, payInvoiceSchema };
