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

const updateInvoiceSchema = Joi.object({
  lineItems: Joi.array().items(
    Joi.object({
      description: Joi.string().required(),
      amount: Joi.number().positive().required(),
      quantity: Joi.number().integer().min(1).optional(),
    })
  ).min(1).optional(),
  tax: Joi.number().min(0).max(100).optional(),
  dueDate: Joi.date().iso().optional(),
  notes: Joi.string().max(500).allow('').optional(),
  status: Joi.string().valid('sent', 'overdue', 'cancelled').optional(),
}).min(1);

const updatePaymentSchema = Joi.object({
  method: Joi.string().valid('cash', 'bank-transfer', 'cheque', 'online', 'upi', 'other').optional(),
  reference: Joi.string().max(100).allow('').optional(),
  amount: Joi.number().positive().optional(),
  notes: Joi.string().max(500).allow('').optional(),
  status: Joi.string().valid('completed', 'failed', 'refunded').optional(),
}).min(1);

module.exports = { generateInvoiceSchema, payInvoiceSchema, updateInvoiceSchema, updatePaymentSchema };
