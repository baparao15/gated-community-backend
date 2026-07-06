const tones = {
  approved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  resolved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'checked-in': 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  assigned: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  'in-progress': 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  sent: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  overdue: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  denied: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  critical: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  high: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export default function StatusBadge({ value }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${tones[value] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{String(value || 'unknown').replace('-', ' ')}</span>;
}
