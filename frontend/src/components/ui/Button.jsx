const VARIANTS = {
  primary:
    'bg-primary text-on-primary shadow-soft hover:bg-primary-hover hover:shadow-soft-md active:scale-[0.98] active:shadow-inner-soft',
  secondary:
    'bg-secondary text-on-secondary shadow-soft hover:opacity-90 hover:shadow-soft-md active:scale-[0.98] active:shadow-inner-soft',
  outline:
    'border-2 border-secondary bg-surface text-secondary hover:bg-secondary-container hover:text-on-secondary-container active:scale-[0.98]',
  ghost:
    'text-primary hover:bg-primary-container active:scale-[0.98]',
  danger:
    'bg-error text-on-error shadow-soft hover:opacity-90 hover:shadow-soft-md active:scale-[0.98]',
};

const SIZES = {
  sm: 'min-h-10 px-3 py-1.5 text-label-sm rounded-xl',
  md: 'min-h-12 px-5 py-2.5 text-label-md rounded-xl',
  lg: 'min-h-12 px-6 py-3 text-label-md rounded-2xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  className = '',
  children,
  disabled,
  ...rest
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 ease-smooth disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
      ) : icon ? (
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
