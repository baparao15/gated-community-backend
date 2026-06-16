const { sendError } = require('../utils/response');

const authorize = (...roles) =>
  (req, res, next) => {
    if (!req.user) return sendError(res, 'Unauthenticated', null, 401);
    if (!roles.includes(req.user.role)) {
      return sendError(res, `Role '${req.user.role}' is not authorized for this action`, null, 403);
    }
    next();
  };

module.exports = { authorize };
