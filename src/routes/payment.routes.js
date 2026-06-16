const router = require('express').Router();
const ctrl = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { generateInvoiceSchema, payInvoiceSchema } = require('../validators/payment.validator');

// Invoices
router.post('/invoices/generate', protect, authorize('Admin', 'SuperAdmin'), validate(generateInvoiceSchema), ctrl.generateInvoices);
router.get('/invoices/my', protect, authorize('Resident'), ctrl.getMyInvoices);
router.get('/invoices', protect, authorize('Admin', 'SuperAdmin'), ctrl.listInvoices);
router.get('/invoices/:id', protect, ctrl.getInvoiceById);
router.post('/invoices/:id/pay', protect, authorize('Resident', 'Admin', 'SuperAdmin'), validate(payInvoiceSchema), ctrl.payInvoice);
router.get('/invoices/:id/receipt', protect, ctrl.getReceipt);

// Payments
router.get('/payments/my', protect, authorize('Resident'), ctrl.getMyPayments);
router.get('/payments', protect, authorize('Admin', 'SuperAdmin'), ctrl.listPayments);

module.exports = router;
