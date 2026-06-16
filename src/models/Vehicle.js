const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
    vehicleNumber: { type: String, required: true, uppercase: true, trim: true },
    type: {
      type: String,
      enum: ['car', 'motorcycle', 'bicycle', 'truck', 'scooter', 'other'],
      required: true,
    },
    make: { type: String },
    model: { type: String },
    color: { type: String },
    parkingSlot: { type: String },
    rcDocument: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

vehicleSchema.index({ vehicleNumber: 1 }, { unique: true });
vehicleSchema.index({ owner: 1 });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
module.exports = Vehicle;
