const cron = require('node-cron');
const Invoice = require('../models/Invoice');
const Unit = require('../models/Unit');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

// Runs on the 1st of every month at 08:00
const scheduleMonthlyInvoices = () => {
  cron.schedule('0 8 1 * *', async () => {
    logger.info('Running monthly invoice generation job');
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const dueDate = new Date(year, month, 5); // 5th of next month

      const units = await Unit.find({
        occupancyStatus: { $ne: 'vacant' },
        isActive: true,
      }).populate('owner');

      let created = 0;
      for (const unit of units) {
        if (!unit.owner) continue;

        const existing = await Invoice.findOne({ unit: unit._id, 'period.month': month, 'period.year': year });
        if (existing) continue;

        const invoice = await Invoice.create({
          resident: unit.owner._id,
          unit: unit._id,
          period: { month, year },
          lineItems: [{ description: 'Maintenance Charge', amount: 3000 }],
          amount: 3000,
          tax: 18,
          totalAmount: 3540,
          dueDate,
          status: 'sent',
        });

        await Notification.create({
          recipient: unit.owner._id,
          type: 'invoice_generated',
          title: 'Monthly Invoice',
          message: `Your maintenance invoice for ${month}/${year} is ready`,
          relatedEntity: { model: 'Invoice', id: invoice._id },
        });

        created++;
      }

      logger.info(`Monthly invoice job: ${created} invoices created`);
    } catch (err) {
      logger.error('Monthly invoice job failed:', err);
    }
  });
};

module.exports = { scheduleMonthlyInvoices };
