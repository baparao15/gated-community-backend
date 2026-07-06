import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';
import { BadgeCheck, Bell, CalendarCheck, CircleDollarSign, ClipboardCheck, IndianRupee, Plus, ShieldCheck, TrendingUp, UserCheck, UsersRound, Wrench } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import useApiData from '../hooks/useApiData';
import { asList, currency, unitLabel } from '../utils/apiData';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } },
  scales: { x: { grid: { display: false } }, y: { grid: { color: '#e2e8f055' }, border: { display: false } } },
};

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DashboardPage() {
  const role = useSelector((s) => s.auth.user?.role);
  if (role === 'Admin' || role === 'SuperAdmin') return <AdminDashboard />;
  if (role === 'Guard') return <SecurityDashboard />;
  if (role === 'Staff') return <StaffDashboard />;
  return <ResidentDashboard />;
}

function ResidentDashboard() {
  const user = useSelector((s) => s.auth.user);
  const { data: noticesData } = useApiData('/announcements?limit=3', []);
  const { data: visitorsData } = useApiData('/visitors/my?limit=50', []);
  const { data: complaintsData } = useApiData('/complaints/my?limit=50', []);
  const { data: bookingsData } = useApiData('/bookings/my?limit=50', []);
  const { data: invoicesData } = useApiData('/invoices/my?limit=50', []);

  const notices = asList(noticesData);
  const visitors = asList(visitorsData);
  const complaints = asList(complaintsData);
  const bookings = asList(bookingsData);
  const invoices = asList(invoicesData);
  const today = new Date().toDateString();
  const outstanding = invoices.filter((i) => !['paid', 'cancelled'].includes(i.status)).reduce((sum, i) => sum + ((i.totalAmount || 0) - (i.paidAmount || 0)), 0);
  const todaysVisitors = visitors.filter((v) => new Date(v.validFrom || v.createdAt || Date.now()).toDateString() === today);
  const activeComplaints = complaints.filter((c) => !['resolved', 'closed'].includes(c.status));
  const upcomingBookings = bookings.filter((b) => new Date(b.slotStart || 0) > new Date() && !['cancelled', 'rejected'].includes(b.status));
  const nextBooking = upcomingBookings[0];
  const quick = [
    ['Pre-approve visitor', UsersRound, '/app/visitors', 'blue'],
    ['Raise complaint', Wrench, '/app/complaints', 'orange'],
    ['Book a facility', CalendarCheck, '/app/bookings', 'green'],
    ['Pay maintenance', CircleDollarSign, '/app/payments', 'violet'],
  ];

  return <>
    <PageHeader eyebrow="Resident home" title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`} description="A quick look at what needs your attention today." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Outstanding due" value={currency(outstanding)} icon={IndianRupee} color="blue" hint={outstanding ? 'Payment pending' : 'All clear'} />
      <StatCard title="Visitors today" value={todaysVisitors.length} icon={UserCheck} color="green" hint={`${visitors.filter((v) => v.status === 'checked-in').length} currently inside`} />
      <StatCard title="Open complaints" value={activeComplaints.length} icon={Wrench} color="orange" hint={activeComplaints[0] ? `${activeComplaints[0].category} - ${activeComplaints[0].status}` : 'No active requests'} />
      <StatCard title="Upcoming bookings" value={upcomingBookings.length} icon={CalendarCheck} color="violet" hint={nextBooking ? `Next: ${nextBooking.facility?.name || 'Facility'}` : 'No upcoming slots'} />
    </div>

    <div className="mt-7">
      <section className="card p-6">
        <div className="flex items-center justify-between"><h2 className="section-title">Quick actions</h2><span className="text-xs text-slate-400">Things you do most</span></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {quick.map(([label, Icon, to, color]) => <Link key={label} to={to} className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md dark:border-slate-800"><div className={`grid h-11 w-11 place-items-center rounded-2xl ${color === 'blue' ? 'bg-blue-50 text-blue-600' : color === 'green' ? 'bg-emerald-50 text-emerald-600' : color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-violet-50 text-violet-600'}`}><Icon size={20} /></div><span className="font-bold">{label}</span></Link>)}
        </div>
      </section>
    </div>

    <div className="mt-7 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
      <section className="card p-6">
        <div className="flex justify-between"><h2 className="section-title">Recent notices</h2><Link to="/app/notices" className="text-sm font-bold text-brand-600">View all</Link></div>
        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {notices.map((n) => <div key={n._id} className="flex gap-4 py-4"><div className={`mt-1 h-10 w-1 rounded-full ${n.type === 'emergency' ? 'bg-red-500' : n.type === 'event' ? 'bg-emerald-500' : 'bg-brand-500'}`} /><div><div className="font-bold">{n.title}</div><div className="mt-1 line-clamp-2 text-sm text-slate-500">{n.body || n.message}</div></div></div>)}
        </div>
      </section>
      <section className="card p-6">
        <h2 className="section-title">Upcoming bookings</h2>
        <div className="mt-5 space-y-4">
          {upcomingBookings.slice(0, 3).map((b) => <div key={b._id} className="flex gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-brand-600"><CalendarCheck size={20} /></div><div><div className="text-xs font-bold text-brand-600">{new Date(b.slotStart).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div><div className="font-bold">{b.facility?.name || 'Facility booking'}</div><div className="text-xs text-slate-400">{b.purpose || b.status}</div></div></div>)}
          {!upcomingBookings.length && <div className="text-sm text-slate-500">No upcoming bookings yet.</div>}
        </div>
      </section>
    </div>
  </>;
}

function AdminDashboard() {
  const user = useSelector((s) => s.auth.user);
  const year = new Date().getFullYear();
  const { data: overview } = useApiData('/dashboard/overview', {});
  const { data: financial } = useApiData(`/dashboard/financial?year=${year}`, {});
  const { data: visitorStats } = useApiData('/dashboard/visitors', { byDay: [] });
  const { data: maintenance } = useApiData('/dashboard/maintenance', { byStatus: [] });
  const monthly = Array.isArray(financial.monthlyCollection) ? financial.monthlyCollection : [];
  const monthlyValues = monthNames.map((_, i) => monthly.find((m) => m._id?.month === i + 1)?.total || 0);
  const statusRows = Array.isArray(maintenance.byStatus) ? maintenance.byStatus : [];
  const statusLabels = statusRows.length ? statusRows.map((x) => x._id || 'Unknown') : ['Open', 'In progress', 'Resolved'];
  const statusValues = statusRows.length ? statusRows.map((x) => x.count) : [0, 0, 0];
  const visitorRows = Array.isArray(visitorStats.byDay) ? [...visitorStats.byDay].reverse().slice(-7) : [];
  const attention = [
    [`${overview.residents?.pending || 0} resident approvals`, 'New registrations awaiting review', 'Review'],
    [`${overview.complaints?.open || 0} open complaints`, 'Current service queue', 'Assign'],
    [`${currency(overview.dues?.overdue || 0)} overdue`, 'Outstanding community dues', 'Remind'],
  ];

  return <>
    <PageHeader eyebrow="Management overview" title={`Good morning, ${user?.name?.split(' ')[0] || 'Admin'}`} description="Live community health, collections and operational load from the backend." action={<button className="btn-primary"><Plus size={18} /> Quick create</button>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Total residents" value={overview.residents?.total || 0} icon={UsersRound} color="blue" hint={`${overview.residents?.active || 0} active`} />
      <StatCard title="Visitors today" value={visitorStats.totalToday || 0} icon={ShieldCheck} color="green" />
      <StatCard title="Open complaints" value={overview.complaints?.open || 0} icon={Wrench} color="orange" hint={`${overview.complaints?.resolved || 0} resolved`} />
      <StatCard title="Collected" value={currency(financial.collected?.totalCollected || 0)} icon={TrendingUp} color="violet" hint={`${financial.collected?.count || 0} payments`} />
    </div>
    <div className="mt-7 grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
      <section className="card p-6"><div className="flex justify-between"><div><h2 className="section-title">Maintenance collection</h2><p className="text-sm text-slate-400">Monthly collected amount</p></div><select className="rounded-xl border border-slate-200 px-3 text-sm dark:bg-slate-800"><option>{year}</option></select></div><div className="mt-5 h-72"><Bar options={chartOptions} data={{ labels: monthNames, datasets: [{ label: 'Collected', data: monthlyValues, backgroundColor: '#2563EB', borderRadius: 8 }] }} /></div></section>
      <section className="card p-6"><h2 className="section-title">Complaint health</h2><p className="text-sm text-slate-400">Current distribution</p><div className="mx-auto mt-4 h-60 max-w-xs"><Doughnut options={{ ...chartOptions, scales: undefined, cutout: '70%' }} data={{ labels: statusLabels, datasets: [{ data: statusValues, backgroundColor: ['#F97316', '#2563EB', '#10B981', '#64748B'], borderWidth: 0 }] }} /></div></section>
    </div>
    <div className="mt-7 grid gap-6 xl:grid-cols-2">
      <section className="card p-6"><h2 className="section-title">Daily visitor flow</h2><div className="mt-4 h-64"><Line options={chartOptions} data={{ labels: visitorRows.map((v) => v._id), datasets: [{ label: 'Visitors', data: visitorRows.map((v) => v.count), borderColor: '#10B981', backgroundColor: '#10B98118', fill: true, tension: .4 }] }} /></div></section>
      <section className="card p-6"><div className="flex justify-between"><h2 className="section-title">Needs attention</h2><span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">{attention.length} items</span></div><div className="mt-4 space-y-3">{attention.map(([a, b, c]) => <div key={a} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 dark:border-slate-800"><div><div className="font-bold">{a}</div><div className="text-xs text-slate-400">{b}</div></div><button className="text-sm font-bold text-brand-600">{c}</button></div>)}</div></section>
    </div>
  </>;
}

function SecurityDashboard() {
  const { data } = useApiData('/security/dashboard', { activeVisitors: [], todayStats: {}, pendingApprovals: [] });
  const liveVisitors = [...(data.activeVisitors || []), ...(data.pendingApprovals || [])];

  return <>
    <PageHeader eyebrow="Gate operations" title="Security command center" description="Verify, check in and monitor everyone currently inside the community." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Currently inside" value={data.activeVisitors?.length || 0} icon={UsersRound} color="blue" />
      <StatCard title="Check-ins today" value={data.todayStats?.checkIns || 0} icon={UserCheck} color="green" />
      <StatCard title="Checked out" value={data.todayStats?.checkOuts || 0} icon={ClipboardCheck} color="violet" />
      <StatCard title="Awaiting approval" value={data.pendingApprovals?.length || 0} icon={Bell} color="orange" />
    </div>
    <div className="mt-7 grid gap-6 xl:grid-cols-[.75fr_1.25fr]">
      <section className="rounded-3xl bg-slate-950 p-6 text-white"><ShieldCheck className="text-emerald-400" size={32} /><h2 className="mt-5 font-display text-2xl font-extrabold">Fast gate verification</h2><p className="mt-2 text-sm text-slate-400">Scan a visitor QR or enter the six-digit OTP.</p><Link to="/app/visitors" className="mt-7 inline-flex rounded-2xl bg-brand-600 px-5 py-3 font-bold">Open scanner</Link><div className="mt-8 border-t border-white/10 pt-5"><div className="text-xs uppercase tracking-wider text-slate-500">Emergency desk</div><div className="mt-2 font-bold">Security desk</div><div className="text-sm text-slate-400">Use emergency contacts for current numbers</div></div></section>
      <section className="card p-6"><div className="flex justify-between"><h2 className="section-title">Live visitors</h2><Link className="text-sm font-bold text-brand-600" to="/app/visitors">View gate log</Link></div><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-slate-400"><tr><th className="pb-3">Visitor</th><th>Resident</th><th>Unit</th><th>Status</th></tr></thead><tbody>{liveVisitors.map((v) => <tr key={v._id} className="border-t border-slate-100 dark:border-slate-800"><td className="py-4 font-bold">{v.name}<div className="text-xs font-normal text-slate-400">{v.purpose}</div></td><td>{v.host?.name}</td><td>{unitLabel(v.unit)}</td><td><StatusBadge value={v.status} /></td></tr>)}</tbody></table></div></section>
    </div>
  </>;
}

function StaffDashboard() {
  const { data } = useApiData('/complaints/assigned/me', []);
  const tasks = asList(data);

  return <>
    <PageHeader eyebrow="Maintenance workspace" title="Your assigned work" description="Live task queue from assigned service requests." />
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard title="Assigned" value={tasks.length} icon={ClipboardCheck} color="blue" />
      <StatCard title="In progress" value={tasks.filter((t) => t.status === 'in-progress').length} icon={Wrench} color="orange" />
      <StatCard title="Completed" value={tasks.filter((t) => ['resolved', 'closed'].includes(t.status)).length} icon={BadgeCheck} color="green" />
    </div>
    <section className="card mt-7 p-6"><h2 className="section-title">Task queue</h2><div className="mt-5 grid gap-4 lg:grid-cols-2">{tasks.map((t) => <div key={t._id} className="rounded-2xl border border-slate-100 p-5 dark:border-slate-800"><div className="flex justify-end"><StatusBadge value={t.status} /></div><h3 className="mt-4 font-display text-lg font-bold capitalize">{t.category} request</h3><p className="mt-1 text-sm text-slate-500">{t.description}</p><div className="mt-4 text-xs text-slate-400">{t.raisedBy?.name || 'Resident'} - {unitLabel(t.unit)}</div><Link to="/app/complaints" className="mt-5 inline-flex text-sm font-bold text-brand-600">Update progress</Link></div>)}</div></section>
  </>;
}
