const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
});

const invoiceSchema = new mongoose.Schema(
  {
    resident: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
    invoiceNumber: { type: String, unique: true },
    period: {
      month: { type: Number, required: true, min: 1, max: 12 },
      year: { type: Number, required: true },
    },
    lineItems: [lineItemSchema],
    amount: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'partially-paid'],
      default: 'sent',
    },
    paidAt: { type: Date },
    paidAmount: { type: Number, default: 0 },
    notes: { type: String },
    remindersSent: { type: Number, default: 0 },
    lastReminderAt: { type: Date },
  },
  { timestamps: true }
);

invoiceSchema.pre('save', function (next) {
  if (!this.invoiceNumber) {
    const d = new Date();
    this.invoiceNumber = `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-${Date.now().toString().slice(-6)}`;
  }
  next();
});

invoiceSchema.index({ resident: 1, status: 1 });
invoiceSchema.index({ unit: 1 });
invoiceSchema.index({ dueDate: 1, status: 1 });
invoiceSchema.index({ 'period.year': 1, 'period.month': 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
