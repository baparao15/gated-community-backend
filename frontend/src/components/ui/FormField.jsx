export function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5">{label}</label>}
      {children}
    </div>
  );
}

const inputClasses =
  'w-full min-h-12 border border-outline-variant rounded-xl px-4 py-3 text-body-md text-on-surface bg-surface-container-lowest transition-all duration-200 ease-smooth placeholder:text-on-surface-variant/60 hover:border-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10';

export function Input({ className = '', ...props }) {
  return <input className={`${inputClasses} ${className}`} {...props} />;
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`${inputClasses} min-h-[100px] resize-y ${className}`} {...props} />;
}

export function Select({ children, className = '', ...props }) {
  return (
    <select className={`${inputClasses} cursor-pointer ${className}`} {...props}>
      {children}
    </select>
  );
}
