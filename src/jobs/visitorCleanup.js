const cron = require('node-cron');
const Visitor = require('../models/Visitor');
const logger = require('../utils/logger');

// Runs every hour
const scheduleVisitorCleanup = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();

      // Auto-expire OTPs
      const expiredOTP = await Visitor.updateMany(
        { status: 'approved', otpExpiresAt: { $lt: now } },
        { status: 'expired' }
      );

      // Auto-checkout visitors who have been inside > 12 hours
      const staleCheckout = new Date(now.getTime() - 12 * 3600000);
      const staleResult = await Visitor.updateMany(
        { status: 'checked-in', checkInAt: { $lt: staleCheckout } },
        { status: 'checked-out', checkOutAt: now }
      );

      if (expiredOTP.modifiedCount || staleResult.modifiedCount) {
        logger.info(`Visitor cleanup: ${expiredOTP.modifiedCount} OTPs expired, ${staleResult.modifiedCount} auto-checked-out`);
      }
    } catch (err) {
      logger.error('Visitor cleanup job failed:', err);
    }
  });
};

module.exports = { scheduleVisitorCleanup };
