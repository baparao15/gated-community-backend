const cron = require('node-cron');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

// Runs daily at 09:00
const scheduleOverdueCheck = () => {
  cron.schedule('0 9 * * *', async () => {
    logger.info('Running overdue invoice check job');
    try {
      const now = new Date();

      // Mark overdue
      const overdueResult = await Invoice.updateMany(
        { dueDate: { $lt: now }, status: 'sent' },
        { status: 'overdue' }
      );
      logger.info(`Marked ${overdueResult.modifiedCount} invoices as overdue`);

      // Send reminders for overdue invoices (only if not reminded in last 3 days)
      const threeDaysAgo = new Date(now.getTime() - 3 * 86400000);
      const overdue = await Invoice.find({
        status: 'overdue',
        $or: [{ lastReminderAt: { $lt: threeDaysAgo } }, { lastReminderAt: { $exists: false } }],
      }).limit(200);

      for (const invoice of overdue) {
        await Notification.create({
          recipient: invoice.resident,
          type: 'invoice_overdue',
          title: 'Payment Overdue',
          message: `Your invoice ${invoice.invoiceNumber} of ₹${invoice.totalAmount} is overdue`,
          relatedEntity: { model: 'Invoice', id: invoice._id },
        });

        invoice.remindersSent = (invoice.remindersSent || 0) + 1;
        invoice.lastReminderAt = now;
        await invoice.save();
      }

      logger.info(`Overdue reminders sent: ${overdue.length}`);
    } catch (err) {
      logger.error('Overdue check job failed:', err);
    }
  });
};

module.exports = { scheduleOverdueCheck };
