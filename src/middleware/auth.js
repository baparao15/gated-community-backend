const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'No token provided', null, 401);
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return sendError(res, msg, null, 401);
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.isDeleted) return sendError(res, 'User not found', null, 401);
  if (user.status === 'suspended') return sendError(res, 'Account suspended', null, 403);
  if (user.status === 'deactivated') return sendError(res, 'Account deactivated', null, 403);
  if (user.status === 'pending') return sendError(res, 'Account pending approval', null, 403);

  req.user = user;
  next();
};

module.exports = { protect };
