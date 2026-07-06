const sendSuccess = (res, message, data = null, statusCode = 200) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
};

const sendError = (res, message, error = null, statusCode = 500) => {
  const payload = { success: false, message };
  if (error && process.env.NODE_ENV !== 'production') payload.error = error;
  return res.status(statusCode).json(payload);
};

const sendPaginated = (res, message, data, pagination) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

module.exports = { sendSuccess, sendError, sendPaginated };
