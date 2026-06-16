const { sendError } = require('../utils/response');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: false });
  if (error) {
    const details = error.details.map((d) => d.message).join('; ');
    return sendError(res, details, null, 422);
  }
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, { abortEarly: false, allowUnknown: true });
  if (error) {
    const details = error.details.map((d) => d.message).join('; ');
    return sendError(res, details, null, 422);
  }
  req.query = value;
  next();
};

module.exports = { validate, validateQuery };
