const Vehicle = require('../models/Vehicle');
const Visitor = require('../models/Visitor');
const ResidentProfile = require('../models/ResidentProfile');
const AuditLog = require('../models/AuditLog');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

const EMERGENCY_CONTACTS = [
  { name: 'Fire Station', phone: '101', type: 'emergency' },
  { name: 'Police', phone: '100', type: 'emergency' },
  { name: 'Ambulance', phone: '108', type: 'emergency' },
];

// ── Vehicles ───────────────────────────────────────────────────────────────────
const registerVehicle = async (req, res) => {
  const profile = await ResidentProfile.findOne({ user: req.user._id });
  if (!profile) return sendError(res, 'Resident profile not found', null, 404);

  const vehicle = await Vehicle.create({
    ...req.body,
    owner: req.user._id,
    unit: profile.unit,
  });

  await AuditLog.create({
    actor: req.user._id,
    actorEmail: req.user.email,
    action: 'REGISTER_VEHICLE',
    entity: 'Vehicle',
    entityId: vehicle._id,
    ip: req.ip,
  });

  return sendSuccess(res, 'Vehicle registered', vehicle, 201);
};

const getMyVehicles = async (req, res) => {
  const vehicles = await Vehicle.find({ owner: req.user._id, isActive: true });
  return sendSuccess(res, 'Vehicles fetched', vehicles);
};

const searchVehicles = async (req, res) => {
  const { vehicleNumber, page = 1, limit = 20 } = req.query;
  const filter = { isActive: true };
  if (vehicleNumber) filter.vehicleNumber = new RegExp(vehicleNumber, 'i');

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [vehicles, total] = await Promise.all([
    Vehicle.find(filter)
      .populate('owner', 'name phone')
      .populate('unit', 'blockName unitNumber')
      .skip(skip).limit(parseInt(limit)),
    Vehicle.countDocuments(filter),
  ]);

  return sendPaginated(res, 'Vehicles fetched', vehicles, {
    total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)),
  });
};

const deleteVehicle = async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user.role === 'Resident') filter.owner = req.user._id;

  const vehicle = await Vehicle.findOneAndUpdate(filter, { isActive: false }, { new: true });
  if (!vehicle) return sendError(res, 'Vehicle not found', null, 404);

  await AuditLog.create({
    actor: req.user._id,
    actorEmail: req.user.email,
    action: 'REMOVE_VEHICLE',
    entity: 'Vehicle',
    entityId: vehicle._id,
    ip: req.ip,
  });

  return sendSuccess(res, 'Vehicle removed');
};

// ── Security Dashboard ─────────────────────────────────────────────────────────
const getSecurityDashboard = async (req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [activeVisitors, todayCheckIns, todayCheckOuts, pendingApprovals] = await Promise.all([
    Visitor.find({ status: 'checked-in' })
      .populate('host', 'name phone')
      .populate('unit', 'blockName unitNumber')
      .sort({ checkInAt: -1 })
      .limit(50),
    Visitor.countDocuments({ checkInAt: { $gte: todayStart } }),
    Visitor.countDocuments({ checkOutAt: { $gte: todayStart } }),
    Visitor.find({ status: 'pending', entryType: 'walk-in' })
      .populate('host', 'name phone')
      .populate('unit', 'blockName unitNumber')
      .sort({ createdAt: -1 }),
  ]);

  return sendSuccess(res, 'Security dashboard', {
    activeVisitors,
    todayStats: { checkIns: todayCheckIns, checkOuts: todayCheckOuts },
    pendingApprovals,
  });
};

// ── Emergency Contacts ─────────────────────────────────────────────────────────
const listEmergencyContacts = async (req, res) => {
  // In production, store in DB; for now serve static + any future DB records
  return sendSuccess(res, 'Emergency contacts', EMERGENCY_CONTACTS);
};

const addEmergencyContact = async (req, res) => {
  EMERGENCY_CONTACTS.push(req.body);

  await AuditLog.create({
    actor: req.user._id,
    actorEmail: req.user.email,
    action: 'ADD_EMERGENCY_CONTACT',
    entity: 'EmergencyContact',
    ip: req.ip,
  });

  return sendSuccess(res, 'Emergency contact added', req.body, 201);
};

module.exports = {
  registerVehicle, getMyVehicles, searchVehicles, deleteVehicle,
  getSecurityDashboard, listEmergencyContacts, addEmergencyContact,
};
