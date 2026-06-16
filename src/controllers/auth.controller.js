const User = require('../models/User');
const ResidentProfile = require('../models/ResidentProfile');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { generateResetToken, hashToken } = require('../utils/otp');
const { sendSuccess, sendError } = require('../utils/response');

const register = async (req, res) => {
  const { name, email, phone, password, unitId } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return sendError(res, 'Email already registered', null, 409);

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, phone, passwordHash, role: 'Resident', status: 'pending' });

  if (unitId) {
    await ResidentProfile.create({ user: user._id, unit: unitId });
  }

  return sendSuccess(res, 'Registration successful. Awaiting admin approval.', { userId: user._id }, 201);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, isDeleted: false }).select('+passwordHash +refreshToken');
  if (!user) return sendError(res, 'Invalid credentials', null, 401);

  const match = await user.comparePassword(password);
  if (!match) return sendError(res, 'Invalid credentials', null, 401);

  if (user.status === 'pending') return sendError(res, 'Account pending admin approval', null, 403);
  if (user.status === 'suspended') return sendError(res, 'Account suspended', null, 403);
  if (user.status === 'deactivated') return sendError(res, 'Account deactivated', null, 403);

  const payload = { id: user._id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  return sendSuccess(res, 'Login successful', {
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return sendError(res, 'Refresh token required', null, 400);

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    return sendError(res, 'Invalid or expired refresh token', null, 401);
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    return sendError(res, 'Refresh token revoked', null, 401);
  }

  const payload = { id: user._id, role: user.role };
  const newAccessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);

  user.refreshToken = newRefreshToken;
  await user.save();

  return sendSuccess(res, 'Token refreshed', { accessToken: newAccessToken, refreshToken: newRefreshToken });
};

const logout = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
  return sendSuccess(res, 'Logged out successfully');
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email, isDeleted: false });
  // Always respond the same way to avoid email enumeration
  if (!user) return sendSuccess(res, 'If the email exists, a reset link has been generated');

  const rawToken = generateResetToken();
  const hashedToken = hashToken(rawToken);

  await User.findByIdAndUpdate(user._id, {
    passwordResetToken: hashedToken,
    passwordResetExpires: Date.now() + parseInt(process.env.RESET_TOKEN_EXPIRES_IN || 3600000),
  });

  // In production, send via email. For now, return in response (Postman testing).
  return sendSuccess(res, 'Password reset token generated', { resetToken: rawToken });
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
    isDeleted: false,
  }).select('+passwordHash');

  if (!user) return sendError(res, 'Invalid or expired reset token', null, 400);

  user.passwordHash = await User.hashPassword(password);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined;
  await user.save();

  return sendSuccess(res, 'Password reset successful');
};

const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  return sendSuccess(res, 'Profile fetched', user);
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+passwordHash');
  const match = await user.comparePassword(currentPassword);
  if (!match) return sendError(res, 'Current password is incorrect', null, 400);

  user.passwordHash = await User.hashPassword(newPassword);
  user.refreshToken = undefined;
  await user.save();

  return sendSuccess(res, 'Password changed successfully');
};

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword, getMe, changePassword };
