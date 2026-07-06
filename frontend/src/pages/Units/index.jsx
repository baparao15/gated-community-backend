import { Building2, Home, Plus } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';

const units = [
  { block: 'A', total: 320, occupied: 298, vacant: 22 },
  { block: 'B', total: 280, occupied: 260, vacant: 20 },
  { block: 'C', total: 300, occupied: 282, vacant: 18 },
  { block: 'D', total: 350, occupied: 324, vacant: 26 },
];

export default function UnitsPage() {
  return (
    <>
      <PageHeader eyebrow="Admin" title="Units and apartments" description="Manage blocks, apartment numbers, occupancy, and resident assignment." action={<button className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 font-bold text-white"><Plus size={18}/> Add unit</button>} />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total units" value="1,250" icon={Building2} color="blue" />
        <StatCard title="Occupied" value="1,164" icon={Home} color="green" />
        <StatCard title="Vacant" value="86" icon={Building2} color="orange" />
      </div>
      <section className="card mt-6 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400 dark:bg-slate-900">
            <tr><th className="px-5 py-4">Block</th><th>Total</th><th>Occupied</th><th>Vacant</th><th>Occupancy</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {units.map((unit) => (
              <tr key={unit.block}>
                <td className="px-5 py-4 font-bold">Block {unit.block}</td>
                <td>{unit.total}</td>
                <td>{unit.occupied}</td>
                <td>{unit.vacant}</td>
                <td className="font-bold text-emerald-600">{Math.round((unit.occupied / unit.total) * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
