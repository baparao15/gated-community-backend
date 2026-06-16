const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const audit = (action, entity) => async (req, res, next) => {
  res.on('finish', async () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        await AuditLog.create({
          actor: req.user?._id,
          actorEmail: req.user?.email,
          action,
          entity,
          entityId: req.params?.id,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        });
      } catch (err) {
        logger.error('Audit log failed:', err);
      }
    }
  });
  next();
};

module.exports = { audit };
