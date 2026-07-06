export const validators = {
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value) => /^[6-9]\d{9}$/.test(String(value).replace(/\D/g, '')),
  required: (value) => value !== undefined && value !== null && String(value).trim().length > 0,
};
