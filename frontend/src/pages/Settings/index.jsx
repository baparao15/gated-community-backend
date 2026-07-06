import { BellRing, Languages, Moon, ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

const settings = [
  { title: 'Dark mode', description: 'Use the toggle in the top bar to switch themes.', icon: Moon },
  { title: 'Notification preferences', description: 'Maintenance, visitor, emergency, and booking alerts.', icon: BellRing },
  { title: 'Security privacy', description: 'Control profile visibility and visitor approval defaults.', icon: ShieldCheck },
  { title: 'Language', description: 'Prepare labels for English, Hindi, and Telugu.', icon: Languages },
];

export default function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="Preferences" title="Settings" description="Personalize alerts, privacy, language, and interface behavior." />
      <div className="grid gap-4 md:grid-cols-2">
        {settings.map(({ title, description, icon: Icon }) => (
          <section key={title} className="card flex gap-4 p-5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-brand-600"><Icon size={22} /></div>
            <div>
              <h2 className="font-bold">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
              <button className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 dark:border-slate-800 dark:text-slate-300">Configure</button>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
