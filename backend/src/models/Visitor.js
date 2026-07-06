const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    purpose: { type: String, required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied', 'checked-in', 'checked-out', 'expired'],
      default: 'pending',
    },
    entryType: { type: String, enum: ['pre-approved', 'walk-in'], default: 'pre-approved' },
    otp: { type: String, select: false },
    qrCode: { type: String },
    otpExpiresAt: { type: Date },
    validFrom: { type: Date },
    validUntil: { type: Date },
    checkInAt: { type: Date },
    checkOutAt: { type: Date },
    checkInPhoto: { type: String },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deniedReason: { type: String },
    vehicleNumber: { type: String },
    idProof: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

visitorSchema.index({ host: 1, status: 1 });
visitorSchema.index({ unit: 1 });
visitorSchema.index({ otp: 1 });
visitorSchema.index({ checkInAt: 1 });

const Visitor = mongoose.model('Visitor', visitorSchema);
module.exports = Visitor;
