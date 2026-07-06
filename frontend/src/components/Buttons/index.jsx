export function PrimaryButton({ children, className = '', ...props }) {
  return <button className={`rounded-2xl bg-brand-600 px-5 py-3 font-bold text-white shadow-lg shadow-brand-600/20 ${className}`} {...props}>{children}</button>;
}
