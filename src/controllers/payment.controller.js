const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Unit = require('../models/Unit');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ResidentProfile = require('../models/ResidentProfile');
const { emitToUser } = require('../utils/socket');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

// ── Invoices ───────────────────────────────────────────────────────────────────
const generateInvoices = async (req, res) => {
  const { month, year, unitIds, lineItems, dueDate, tax = 0 } = req.body;

  // If specific units provided, generate for those; otherwise generate for all active occupied units
  let targetUnits = [];
  if (unitIds && unitIds.length > 0) {
    targetUnits = await Unit.find({ _id: { $in: unitIds } }).populate('owner');
  } else {
    targetUnits = await Unit.find({
      occupancyStatus: { $ne: 'vacant' },
      isActive: true,
    }).populate('owner');
  }

  const created = [];
  for (const unit of targetUnits) {
    if (!unit.owner) continue;

    // Check if invoice already exists for this period
    const existing = await Invoice.findOne({ unit: unit._id, 'period.month': month, 'period.year': year });
    if (existing) continue;

    const amount = lineItems.reduce((sum, li) => sum + li.amount * (li.quantity || 1), 0);
    const totalAmount = amount + (amount * tax) / 100;

    const invoice = await Invoice.create({
      resident: unit.owner._id,
      unit: unit._id,
      period: { month, year },
      lineItems,
      amount,
      tax,
      totalAmount,
      dueDate: new Date(dueDate),
      status: 'sent',
    });

    // Notify resident
    try {
      emitToUser(unit.owner._id.toString(), 'notification:new', {
        message: `Invoice for ${month}/${year} generated`,
      });
      await Notification.create({
        recipient: unit.owner._id,
        type: 'invoice_generated',
        title: 'New Invoice',
        message: `Maintenance invoice for ${month}/${year} has been generated`,
        relatedEntity: { model: 'Invoice', id: invoice._id },
      });
    } catch (_) {}

    created.push(invoice);
  }

  return sendSuccess(res, `${created.length} invoices generated`, created, 201);
};

const getMyInvoices = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = { resident: req.user._id };
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [invoices, total] = await Promise.all([
    Invoice.find(filter).populate('unit', 'blockName unitNumber').skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
    Invoice.countDocuments(filter),
  ]);

  return sendPaginated(res, 'Invoices fetched', invoices, {
    total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)),
  });
};

const listInvoices = async (req, res) => {
  const { status, month, year, unitId, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (month) filter['period.month'] = parseInt(month);
  if (year) filter['period.year'] = parseInt(year);
  if (unitId) filter.unit = unitId;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [invoices, total] = await Promise.all([
    Invoice.find(filter)
      .populate('resident', 'name email')
      .populate('unit', 'blockName unitNumber')
      .skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
    Invoice.countDocuments(filter),
  ]);

  return sendPaginated(res, 'Invoices fetched', invoices, {
    total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)),
  });
};

const getInvoiceById = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('resident', 'name email phone')
    .populate('unit', 'blockName unitNumber floor');

  if (!invoice) return sendError(res, 'Invoice not found', null, 404);

  if (req.user.role === 'Resident' && invoice.resident._id.toString() !== req.user._id.toString()) {
    return sendError(res, 'Forbidden', null, 403);
  }

  return sendSuccess(res, 'Invoice fetched', invoice);
};

const payInvoice = async (req, res) => {
  const { method, reference, amount, notes } = req.body;

  const invoice = await Invoice.findById(req.params.id).populate('resident unit');
  if (!invoice) return sendError(res, 'Invoice not found', null, 404);

  if (req.user.role === 'Resident' && invoice.resident._id.toString() !== req.user._id.toString()) {
    return sendError(res, 'Forbidden', null, 403);
  }

  if (invoice.status === 'paid') return sendError(res, 'Invoice already paid', null, 400);
  if (invoice.status === 'cancelled') return sendError(res, 'Invoice is cancelled', null, 400);

  const payAmount = amount || invoice.totalAmount;

  const payment = await Payment.create({
    invoice: invoice._id,
    paidBy: req.user._id,
    unit: invoice.unit._id,
    amount: payAmount,
    method,
    reference,
    notes,
    recordedBy: req.user._id,
    status: 'completed',
  });

  invoice.paidAmount = (invoice.paidAmount || 0) + payAmount;
  invoice.status = invoice.paidAmount >= invoice.totalAmount ? 'paid' : 'partially-paid';
  if (invoice.status === 'paid') invoice.paidAt = new Date();
  await invoice.save();

  try {
    await Notification.create({
      recipient: invoice.resident._id,
      type: 'payment_received',
      title: 'Payment Recorded',
      message: `Payment of ₹${payAmount} recorded for invoice ${invoice.invoiceNumber}`,
      relatedEntity: { model: 'Payment', id: payment._id },
    });
  } catch (_) {}

  return sendSuccess(res, 'Payment recorded', { payment, invoice }, 201);
};

const getMyPayments = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [payments, total] = await Promise.all([
    Payment.find({ paidBy: req.user._id })
      .populate('invoice', 'invoiceNumber period totalAmount')
      .skip(skip).limit(parseInt(limit)).sort({ paidAt: -1 }),
    Payment.countDocuments({ paidBy: req.user._id }),
  ]);

  return sendPaginated(res, 'Payments fetched', payments, {
    total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)),
  });
};

const listPayments = async (req, res) => {
  const { method, status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (method) filter.method = method;
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate('paidBy', 'name email')
      .populate('invoice', 'invoiceNumber period')
      .populate('unit', 'blockName unitNumber')
      .skip(skip).limit(parseInt(limit)).sort({ paidAt: -1 }),
    Payment.countDocuments(filter),
  ]);

  return sendPaginated(res, 'Payments fetched', payments, {
    total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)),
  });
};

const getReceipt = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('resident', 'name email phone')
    .populate('unit', 'blockName unitNumber');

  if (!invoice) return sendError(res, 'Invoice not found', null, 404);
  if (invoice.status !== 'paid') return sendError(res, 'Invoice not yet paid', null, 400);

  if (req.user.role === 'Resident' && invoice.resident._id.toString() !== req.user._id.toString()) {
    return sendError(res, 'Forbidden', null, 403);
  }

  const payment = await Payment.findOne({ invoice: invoice._id, status: 'completed' })
    .sort({ paidAt: -1 });

  return sendSuccess(res, 'Receipt fetched', {
    receiptNumber: payment?.receiptNumber,
    invoice,
    payment,
    generatedAt: new Date(),
  });
};

module.exports = {
  generateInvoices, getMyInvoices, listInvoices, getInvoiceById, payInvoice,
  getMyPayments, listPayments, getReceipt,
};
