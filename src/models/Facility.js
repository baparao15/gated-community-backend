const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['gym', 'pool', 'clubhouse', 'tennis-court', 'playground', 'party-hall', 'conference-room', 'other'],
      required: true,
    },
    description: { type: String },
    capacity: { type: Number, required: true },
    openHours: {
      start: { type: String, default: '06:00' },
      end: { type: String, default: '22:00' },
    },
    bookingRules: {
      maxSlotHours: { type: Number, default: 2 },
      advanceBookingDays: { type: Number, default: 7 },
      cancellationHours: { type: Number, default: 24 },
      requiresApproval: { type: Boolean, default: true },
    },
    images: [{ type: String }],
    amenities: [{ type: String }],
    isActive: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Facility = mongoose.model('Facility', facilitySchema);
module.exports = Facility;
