const TONES = {
  neutral: 'bg-surface-container text-on-surface-variant',
  primary: 'bg-primary-container text-on-primary-container',
  secondary: 'bg-secondary-container text-on-secondary-container',
  success: 'bg-success-container text-on-success-container',
  warning: 'bg-warning-container text-on-warning-container',
  error: 'bg-error-container text-on-error-container',
};

export default function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export const statusTone = (status) => {
  const map = {
    active: 'success', approved: 'success', paid: 'success', resolved: 'success', completed: 'success',
    'checked-in': 'success',
    'checked-out': 'neutral', open: 'primary', assigned: 'primary', 'in-progress': 'primary', sent: 'primary',
    pending: 'warning', 'partially-paid': 'warning',
    overdue: 'error', denied: 'error', rejected: 'error', suspended: 'error', failed: 'error', refunded: 'error',
    cancelled: 'neutral', expired: 'neutral', deactivated: 'neutral', closed: 'neutral', draft: 'neutral',
  };
  return map[status] || 'neutral';
};
