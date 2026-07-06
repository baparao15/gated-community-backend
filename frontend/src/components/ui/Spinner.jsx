export default function Spinner({ full = false }) {
  const spinner = (
    <span
      className="material-symbols-outlined animate-spin text-primary text-[32px]"
      role="status"
      aria-label="Loading"
    >
      progress_activity
    </span>
  );
  if (full) {
    return <div className="flex items-center justify-center py-24">{spinner}</div>;
  }
  return spinner;
}
