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
  const { status, month, year, unitId, residentId, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (month) filter['period.month'] = parseInt(month);
  if (year) filter['period.year'] = parseInt(year);
  if (unitId) filter.unit = unitId;
  if (residentId) filter.resident = residentId;

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

// Admin: edit an invoice (line items, due date, notes, or cancel it).
// Amount/line-item changes are blocked once an invoice is fully paid, to avoid
// silently rewriting a settled financial record.
const updateInvoice = async (req, res) => {
  const { lineItems, dueDate, tax, notes, status } = req.body;

  const invoice = await Invoice.findById(req.params.id).populate('resident', 'name email').populate('unit', 'blockName unitNumber');
  if (!invoice) return sendError(res, 'Invoice not found', null, 404);

  if (invoice.status === 'paid' && (lineItems || tax !== undefined)) {
    return sendError(res, 'Cannot change the amount on a fully paid invoice', null, 400);
  }

  if (lineItems) {
    invoice.lineItems = lineItems;
    invoice.amount = lineItems.reduce((sum, li) => sum + li.amount * (li.quantity || 1), 0);
  }
  if (tax !== undefined) invoice.tax = tax;
  if (lineItems || tax !== undefined) {
    invoice.totalAmount = invoice.amount + (invoice.amount * invoice.tax) / 100;
  }
  if (dueDate) invoice.dueDate = new Date(dueDate);
  if (notes !== undefined) invoice.notes = notes;
  if (status) {
    const allowed = ['sent', 'overdue', 'cancelled'];
    if (!allowed.includes(status)) return sendError(res, 'Invalid status value', null, 400);
    invoice.status = status;
  }

  await invoice.save();
  return sendSuccess(res, 'Invoice updated', invoice);
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
    // Always attribute the payment to the invoice's resident — an admin collecting
    // cash on someone's behalf shouldn't show up as having paid their own dues.
    paidBy: invoice.resident._id,
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

// Admin: correct a payment record (wrong amount/method entered, or void/refund it).
// Reconciles the linked invoice's paidAmount/status so the two stay consistent.
const updatePayment = async (req, res) => {
  const { method, reference, amount, notes, status } = req.body;

  const payment = await Payment.findById(req.params.id);
  if (!payment) return sendError(res, 'Payment not found', null, 404);

  const invoice = await Invoice.findById(payment.invoice);
  if (!invoice) return sendError(res, 'Linked invoice not found', null, 404);

  if (status) {
    const allowed = ['completed', 'failed', 'refunded'];
    if (!allowed.includes(status)) return sendError(res, 'Invalid status value', null, 400);
  }

  const wasCompleted = payment.status === 'completed';
  const willBeCompleted = (status || payment.status) === 'completed';
  const oldAmount = payment.amount;
  const newAmount = amount !== undefined ? amount : payment.amount;

  // Back out the old contribution, then apply the new one, so edits and
  // status flips (e.g. completed -> refunded) both land on the right total.
  let paidAmount = invoice.paidAmount || 0;
  if (wasCompleted) paidAmount = Math.max(0, paidAmount - oldAmount);
  if (willBeCompleted) paidAmount += newAmount;
  invoice.paidAmount = paidAmount;

  if (invoice.paidAmount <= 0) {
    invoice.paidAmount = 0;
    invoice.status = invoice.dueDate < new Date() ? 'overdue' : 'sent';
    invoice.paidAt = undefined;
  } else if (invoice.paidAmount >= invoice.totalAmount) {
    invoice.status = 'paid';
    invoice.paidAt = invoice.paidAt || new Date();
  } else {
    invoice.status = 'partially-paid';
    invoice.paidAt = undefined;
  }

  if (method) payment.method = method;
  if (reference !== undefined) payment.reference = reference;
  if (amount !== undefined) payment.amount = amount;
  if (notes !== undefined) payment.notes = notes;
  if (status) payment.status = status;

  await payment.save();
  await invoice.save();

  return sendSuccess(res, 'Payment updated', { payment, invoice });
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
  generateInvoices, getMyInvoices, listInvoices, getInvoiceById, updateInvoice, payInvoice,
  getMyPayments, listPayments, updatePayment, getReceipt,
};
