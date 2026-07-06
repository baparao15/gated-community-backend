export function toTitleCase(value = '') {
  return value.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

export function safeArray(value, fallback = []) {
  return Array.isArray(value) ? value : fallback;
}

export function currencyINR(value = 0) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}
