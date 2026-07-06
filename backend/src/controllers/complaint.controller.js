const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const ResidentProfile = require('../models/ResidentProfile');
const { emitToUser, emitToRole } = require('../utils/socket');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

const createComplaint = async (req, res) => {
  const { category, description, priority } = req.body;

  const profile = await ResidentProfile.findOne({ user: req.user._id });
  const images = req.files ? req.files.map((f) => f.path) : [];

  const complaint = await Complaint.create({
    raisedBy: req.user._id,
    unit: profile?.unit,
    category,
    description,
    priority: priority || 'medium',
    images,
    statusHistory: [{ status: 'open', changedBy: req.user._id }],
  });

  // Notify admin
  try {
    emitToRole('Admin', 'complaint:updated', { message: 'New complaint raised', complaintId: complaint._id });
  } catch (_) {}

  return sendSuccess(res, 'Complaint raised', complaint, 201);
};

const getMyComplaints = async (req, res) => {
  const { status, category, page = 1, limit = 20 } = req.query;
  const filter = { raisedBy: req.user._id };
  if (status) filter.status = status;
  if (category) filter.category = category;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [complaints, total] = await Promise.all([
    Complaint.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 })
      .populate('assignedTo', 'name'),
    Complaint.countDocuments(filter),
  ]);

  return sendPaginated(res, 'Complaints fetched', complaints, {
    total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)),
  });
};

const listComplaints = async (req, res) => {
  const { status, category, priority, assignedTo, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [complaints, total] = await Promise.all([
    Complaint.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 })
      .populate('raisedBy', 'name email')
      .populate('assignedTo', 'name')
      .populate('unit', 'blockName unitNumber'),
    Complaint.countDocuments(filter),
  ]);

  return sendPaginated(res, 'Complaints fetched', complaints, {
    total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)),
  });
};

const getComplaintById = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('raisedBy', 'name email phone')
    .populate('assignedTo', 'name email')
    .populate('unit', 'blockName unitNumber')
    .populate('statusHistory.changedBy', 'name');

  if (!complaint) return sendError(res, 'Complaint not found', null, 404);

  // Ownership check for residents
  if (req.user.role === 'Resident' && complaint.raisedBy._id.toString() !== req.user._id.toString()) {
    return sendError(res, 'Forbidden', null, 403);
  }

  return sendSuccess(res, 'Complaint fetched', complaint);
};

const assignComplaint = async (req, res) => {
  const { staffId } = req.body;
  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    {
      assignedTo: staffId,
      status: 'assigned',
      assignedAt: new Date(),
      $push: { statusHistory: { status: 'assigned', changedBy: req.user._id } },
    },
    { new: true }
  ).populate('assignedTo', 'name email').populate('raisedBy', 'name');

  if (!complaint) return sendError(res, 'Complaint not found', null, 404);

  try {
    emitToUser(staffId, 'complaint:updated', { message: 'Complaint assigned to you', complaintId: complaint._id });
    await Notification.create({
      recipient: staffId,
      type: 'complaint_assigned',
      title: 'Complaint Assigned',
      message: `Complaint #${complaint._id} has been assigned to you`,
      relatedEntity: { model: 'Complaint', id: complaint._id },
    });
  } catch (_) {}

  return sendSuccess(res, 'Complaint assigned', complaint);
};

const updateComplaintStatus = async (req, res) => {
  const { status, note } = req.body;
  const allowed = ['in-progress', 'resolved'];
  if (!allowed.includes(status)) return sendError(res, 'Invalid status transition', null, 400);

  const update = {
    status,
    $push: { statusHistory: { status, changedBy: req.user._id, note } },
  };
  if (status === 'resolved') update.resolvedAt = new Date();

  const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true })
    .populate('raisedBy', 'name');

  if (!complaint) return sendError(res, 'Complaint not found', null, 404);

  try {
    emitToUser(complaint.raisedBy._id.toString(), 'complaint:updated', {
      message: `Your complaint status updated to ${status}`,
      complaintId: complaint._id,
    });
    await Notification.create({
      recipient: complaint.raisedBy._id,
      type: 'complaint_updated',
      title: 'Complaint Updated',
      message: `Your complaint has been updated to "${status}"`,
      relatedEntity: { model: 'Complaint', id: complaint._id },
    });
  } catch (_) {}

  return sendSuccess(res, 'Status updated', complaint);
};

const updatePriority = async (req, res) => {
  const { priority } = req.body;
  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    { priority },
    { new: true, runValidators: true }
  );
  if (!complaint) return sendError(res, 'Complaint not found', null, 404);
  return sendSuccess(res, 'Priority updated', complaint);
};

const submitFeedback = async (req, res) => {
  const { rating, feedback } = req.body;
  const complaint = await Complaint.findOne({ _id: req.params.id, raisedBy: req.user._id, status: 'resolved' });
  if (!complaint) return sendError(res, 'Complaint not found or not yet resolved', null, 404);

  complaint.rating = rating;
  complaint.feedback = feedback;
  complaint.status = 'closed';
  complaint.closedAt = new Date();
  complaint.statusHistory.push({ status: 'closed', changedBy: req.user._id });
  await complaint.save();

  return sendSuccess(res, 'Feedback submitted', complaint);
};

const getAssignedToMe = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = { assignedTo: req.user._id };
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [complaints, total] = await Promise.all([
    Complaint.find(filter).skip(skip).limit(parseInt(limit)).sort({ priority: -1, createdAt: -1 })
      .populate('raisedBy', 'name phone')
      .populate('unit', 'blockName unitNumber'),
    Complaint.countDocuments(filter),
  ]);

  return sendPaginated(res, 'Assigned complaints', complaints, {
    total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)),
  });
};

module.exports = {
  createComplaint, getMyComplaints, listComplaints, getComplaintById,
  assignComplaint, updateComplaintStatus, updatePriority, submitFeedback, getAssignedToMe,
};
