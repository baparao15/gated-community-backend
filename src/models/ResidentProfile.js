const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relation: { type: String },
  age: { type: Number },
  idProof: { type: String },
});

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  leaseStart: { type: Date },
  leaseEnd: { type: Date },
  idProof: { type: String },
});

const residentProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
    familyMembers: [familyMemberSchema],
    tenants: [tenantSchema],
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String },
    },
    moveInDate: { type: Date },
    idProof: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

residentProfileSchema.index({ user: 1 });
residentProfileSchema.index({ unit: 1 });

const ResidentProfile = mongoose.model('ResidentProfile', residentProfileSchema);
module.exports = ResidentProfile;
