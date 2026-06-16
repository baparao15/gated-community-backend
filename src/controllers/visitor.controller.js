const Visitor = require('../models/Visitor');
const Notification = require('../models/Notification');
const ResidentProfile = require('../models/ResidentProfile');
const { generateOTP } = require('../utils/otp');
const { generateQR } = require('../utils/qrcode');
const { emitToUser } = require('../utils/socket');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

// Resident pre-approves a visitor
const preApprove = async (req, res) => {
  const { name, phone, purpose, validFrom, validUntil, vehicleNumber, notes } = req.body;

  // Find resident's unit
  const profile = await ResidentProfile.findOne({ user: req.user._id });
  if (!profile) return sendError(res, 'Resident profile not found', null, 404);

  const otp = generateOTP(6);
  const otpExpiresAt = validUntil
    ? new Date(validUntil)
    : new Date(Date.now() + 24 * 60 * 60 * 1000);

  const visitor = await Visitor.create({
    name,
    phone,
    purpose,
    host: req.user._id,
    unit: profile.unit,
    status: 'approved',
    entryType: 'pre-approved',
    otp,
    otpExpiresAt,
    validFrom: validFrom || new Date(),
    validUntil: otpExpiresAt,
    vehicleNumber,
    notes,
  });

  const qrCode = await generateQR({ visitorId: visitor._id, otp });
  visitor.qrCode = qrCode;
  await visitor.save();

  const result = visitor.toObject();
  result.otp = otp; // Return OTP in response for Postman testing

  return sendSuccess(res, 'Visitor pre-approved', result, 201);
};

// Resident lists their visitors
const getMyVisitors = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = { host: req.user._id };
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [visitors, total] = await Promise.all([
    Visitor.find(filter).populate('unit', 'blockName unitNumber').skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
    Visitor.countDocuments(filter),
  ]);

  return sendPaginated(res, 'Visitors fetched', visitors, {
    total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)),
  });
};

// Guard/Admin list all visitors
const listAllVisitors = async (req, res) => {
  const { status, date, purpose, page = 1, limit = 30 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (purpose) filter.purpose = new RegExp(purpose, 'i');
  if (date) {
    const d = new Date(date);
    filter.createdAt = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [visitors, total] = await Promise.all([
    Visitor.find(filter)
      .populate('host', 'name phone')
      .populate('unit', 'blockName unitNumber')
      .skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
    Visitor.countDocuments(filter),
  ]);

  return sendPaginated(res, 'Visitors fetched', visitors, {
    total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)),
  });
};

// Guard verifies visitor by OTP or QR
const verifyVisitor = async (req, res) => {
  const { otp, visitorId } = req.body;
  if (!otp && !visitorId) return sendError(res, 'OTP or visitorId required', null, 400);

  const query = { status: 'approved' };
  if (visitorId) query._id = visitorId;
  if (otp) query.$or = [{ otp }]; // OTP stored in select: false field, so select it

  const visitor = await Visitor.findOne(query)
    .select('+otp')
    .populate('host', 'name phone')
    .populate('unit', 'blockName unitNumber');

  if (!visitor) return sendError(res, 'Visitor not found or already used', null, 404);

  if (otp && visitor.otp !== otp) return sendError(res, 'Invalid OTP', null, 400);
  if (visitor.otpExpiresAt && visitor.otpExpiresAt < new Date()) {
    visitor.status = 'expired';
    await visitor.save();
    return sendError(res, 'OTP has expired', null, 400);
  }

  return sendSuccess(res, 'Visitor verified', visitor);
};

// Guard check-in
const checkIn = async (req, res) => {
  const visitor = await Visitor.findOneAndUpdate(
    { _id: req.params.id, status: 'approved' },
    { status: 'checked-in', checkInAt: new Date(), approvedBy: req.user._id,
      ...(req.file && { checkInPhoto: req.file.path }) },
    { new: true }
  ).populate('host unit');

  if (!visitor) return sendError(res, 'Visitor not found or not approved', null, 404);

  try {
    emitToUser(visitor.host._id.toString(), 'visitor:arrived', {
      message: `${visitor.name} has checked in at your unit`,
      visitor: { id: visitor._id, name: visitor.name, checkInAt: visitor.checkInAt },
    });
  } catch (_) {}

  return sendSuccess(res, 'Visitor checked in', visitor);
};

// Guard check-out
const checkOut = async (req, res) => {
  const visitor = await Visitor.findOneAndUpdate(
    { _id: req.params.id, status: 'checked-in' },
    { status: 'checked-out', checkOutAt: new Date() },
    { new: true }
  );
  if (!visitor) return sendError(res, 'Visitor not found or not checked in', null, 404);
  return sendSuccess(res, 'Visitor checked out', visitor);
};

// Guard logs a walk-in
const logWalkIn = async (req, res) => {
  const { name, phone, purpose, unitId, vehicleNumber, notes } = req.body;

  const visitor = await Visitor.create({
    name, phone, purpose,
    host: req.body.hostId,
    unit: unitId,
    status: 'pending',
    entryType: 'walk-in',
    vehicleNumber, notes,
  });

  try {
    emitToUser(req.body.hostId, 'visitor:arrived', {
      message: `${name} is at the gate requesting entry. Please approve or deny.`,
      visitor: { id: visitor._id, name, phone, purpose },
    });

    await Notification.create({
      recipient: req.body.hostId,
      type: 'visitor_arrived',
      title: 'Walk-in Visitor',
      message: `${name} is at the gate requesting entry`,
      relatedEntity: { model: 'Visitor', id: visitor._id },
    });
  } catch (_) {}

  return sendSuccess(res, 'Walk-in logged, awaiting host approval', visitor, 201);
};

// Resident approves/denies walk-in
const approveWalkIn = async (req, res) => {
  const { action, reason } = req.body;
  if (!['approve', 'deny'].includes(action)) return sendError(res, 'Action must be approve or deny', null, 400);

  const visitor = await Visitor.findOne({ _id: req.params.id, host: req.user._id, status: 'pending' });
  if (!visitor) return sendError(res, 'Walk-in request not found', null, 404);

  visitor.status = action === 'approve' ? 'approved' : 'denied';
  if (action === 'deny') visitor.deniedReason = reason;
  visitor.approvedBy = req.user._id;
  await visitor.save();

  return sendSuccess(res, `Walk-in ${action}d`, visitor);
};

const getVisitorById = async (req, res) => {
  const visitor = await Visitor.findById(req.params.id)
    .populate('host', 'name phone')
    .populate('unit', 'blockName unitNumber')
    .populate('approvedBy', 'name');

  if (!visitor) return sendError(res, 'Visitor not found', null, 404);

  // Guard/Admin always allowed; host can see their own
  if (!['Guard', 'Admin', 'SuperAdmin'].includes(req.user.role)) {
    if (visitor.host._id.toString() !== req.user._id.toString()) {
      return sendError(res, 'Forbidden', null, 403);
    }
  }

  return sendSuccess(res, 'Visitor fetched', visitor);
};

module.exports = {
  preApprove, getMyVisitors, listAllVisitors, verifyVisitor,
  checkIn, checkOut, logWalkIn, approveWalkIn, getVisitorById,
};
