export default function Card({ className = '', hover = false, children, ...rest }) {
  return (
    <div
      className={`card-pattern bg-surface-container-lowest/95 border border-outline-variant rounded-2xl shadow-card transition-all duration-300 ease-smooth ${
        hover ? 'hover:shadow-soft-lg hover:-translate-y-0.5 hover:border-primary/40' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
