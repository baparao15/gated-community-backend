import { Sparkles } from 'lucide-react';

export default function EmptyState({ title = 'Nothing here yet', text = 'New activity will appear here.' }) {
  return (
    <div className="grid min-h-44 place-items-center rounded-3xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-700">
      <div>
        <Sparkles className="mx-auto mb-3 text-brand-500" />
        <div className="font-bold">{title}</div>
        <div className="mt-1 text-sm text-slate-500">{text}</div>
      </div>
    </div>
  );
}
