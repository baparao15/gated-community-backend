export default function EmptyState({ icon = 'inbox', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-primary text-[32px]">{icon}</span>
      </div>
      <h4 className="font-title-lg text-title-lg text-on-surface mb-1">{title}</h4>
      {description && <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
