import { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/endpoints';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { formatCurrency } from '../../utils/format';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [visitorStats, setVisitorStats] = useState(null);

  useEffect(() => {
    Promise.all([dashboardApi.overview(), dashboardApi.financial(), dashboardApi.visitors()])
      .then(([ov, fin, vis]) => {
        setOverview(ov.data);
        setFinancial(fin.data);
        setVisitorStats(vis.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

  const weeklyByDay = Array(7).fill(0);
  (visitorStats?.byDay || []).slice(0, 7).forEach((d) => {
    const day = new Date(d._id).getDay();
    weeklyByDay[day] = d.count;
  });
  const maxCount = Math.max(...weeklyByDay, 1);

  return (
    <div className="space-y-lg">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-primary">Admin Command Center</h2>
        <p className="text-on-surface-variant font-body-md">Community-wide overview and analytics.</p>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-12 lg:col-span-3">
          <StatCard label="Total Residents" value={overview?.residents?.total ?? 0} icon="group" trend={`${overview?.residents?.active ?? 0} active`} />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <StatCard
            label="Occupancy"
            value={`${overview?.units?.total ? Math.round((overview.units.occupied / overview.units.total) * 100) : 0}%`}
            icon="domain"
            tone="secondary"
            trend={`${overview?.units?.occupied ?? 0} of ${overview?.units?.total ?? 0} units`}
          />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <StatCard
            label="Open Complaints"
            value={overview?.complaints?.open ?? 0}
            icon="build"
            tone="error"
            trend={`${overview?.complaints?.resolved ?? 0} resolved`}
          />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <StatCard label="Overdue Dues" value={formatCurrency(overview?.dues?.overdue)} icon="warning" tone="error" />
        </div>

        <Card className="col-span-12 lg:col-span-8 p-lg h-[380px] flex flex-col" hover>
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-title-lg text-title-lg text-primary">Visitor Analytics (Last 7 Days)</h4>
          </div>
          <div className="flex-1 flex items-end justify-between gap-4 px-2 pb-2">
            {weeklyByDay.map((count, i) => (
              <div key={i} className="flex flex-col items-center flex-1 gap-2">
                <span className="text-label-sm text-on-surface-variant">{count}</span>
                <div
                  className="w-full bg-primary/20 rounded-t-lg transition-all duration-700 hover:bg-primary"
                  style={{ height: `${Math.max((count / maxCount) * 100, 4)}%` }}
                />
                <span className="text-label-sm font-label-sm text-on-surface-variant">{DAY_LABELS[i]}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-4 p-lg h-[380px] flex flex-col" hover>
          <h4 className="font-title-lg text-title-lg text-primary mb-6">Financial Snapshot</h4>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <div>
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Collected</p>
              <p className="font-display-lg text-[32px] font-bold text-success">
                {formatCurrency(financial?.collected?.totalCollected)}
              </p>
              <p className="text-label-sm text-on-surface-variant">{financial?.collected?.count ?? 0} payments</p>
            </div>
            <div className="h-px bg-outline-variant" />
            <div>
              <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Pending</p>
              {(financial?.pending || []).map((p) => (
                <div key={p._id} className="flex justify-between text-body-sm py-1">
                  <span className="capitalize text-on-surface-variant">{p._id}</span>
                  <span className="font-bold text-on-surface">{formatCurrency(p.totalPending)}</span>
                </div>
              ))}
              {!financial?.pending?.length && <p className="text-body-sm text-on-surface-variant">Nothing pending</p>}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
