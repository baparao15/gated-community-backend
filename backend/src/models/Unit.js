const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema(
  {
    blockName: { type: String, required: true, trim: true },
    unitNumber: { type: String, required: true, trim: true },
    floor: { type: Number },
    type: { type: String, enum: ['apartment', 'villa', 'flat', 'studio'], default: 'apartment' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    occupancyStatus: {
      type: String,
      enum: ['vacant', 'owner-occupied', 'tenant-occupied'],
      default: 'vacant',
    },
    area: { type: Number },
    bedrooms: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

unitSchema.index({ blockName: 1, unitNumber: 1 }, { unique: true });

const Unit = mongoose.model('Unit', unitSchema);
module.exports = Unit;
