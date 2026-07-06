export default function Modal({ open, onClose, title, children, footer, maxWidth = 'max-w-xl' }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-primary/20 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={`bg-surface-container-lowest rounded-3xl w-full ${maxWidth} shadow-soft-xl border border-outline-variant/50 overflow-hidden max-h-[90vh] flex flex-col animate-scale-in`}>
        <div className="p-6 border-b border-outline-variant flex justify-between items-center shrink-0">
          <h3 className="font-headline-md text-headline-md text-on-surface">{title}</h3>
          <button
            className="p-2 -mr-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-full transition-colors duration-200"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">{children}</div>
        {footer && <div className="p-6 bg-surface-container-low border-t border-outline-variant flex justify-end gap-3 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
