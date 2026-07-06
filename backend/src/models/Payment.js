const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ['cash', 'bank-transfer', 'cheque', 'online', 'upi', 'other'],
      required: true,
    },
    reference: { type: String },
    receiptNumber: { type: String, unique: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed',
    },
    paidAt: { type: Date, default: Date.now },
    notes: { type: String },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

paymentSchema.pre('save', function (next) {
  if (!this.receiptNumber) {
    this.receiptNumber = `RCP-${Date.now().toString().slice(-8)}`;
  }
  next();
});

paymentSchema.index({ invoice: 1 });
paymentSchema.index({ paidBy: 1 });
paymentSchema.index({ paidAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
