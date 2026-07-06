export default function StatCard({ label, value, icon, trend, tone = 'primary' }) {
  const toneClasses = {
    primary: 'bg-primary-container text-primary',
    secondary: 'bg-secondary-container text-secondary',
    success: 'bg-success-container text-on-success-container',
    error: 'bg-error-container text-error',
  };
  return (
    <div className="bg-surface border border-outline-variant p-6 rounded-2xl flex flex-col justify-between shadow-soft hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-300 ease-smooth">
      <div className="flex items-center justify-between mb-3">
        <p className="text-on-surface-variant font-label-md text-label-md">{label}</p>
        {icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${toneClasses[tone]}`}>
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </div>
        )}
      </div>
      <h3 className="font-display-lg text-[32px] leading-tight font-bold text-on-surface tracking-tight">{value}</h3>
      {trend && <p className="text-label-sm text-on-surface-variant mt-2">{trend}</p>}
    </div>
  );
}
