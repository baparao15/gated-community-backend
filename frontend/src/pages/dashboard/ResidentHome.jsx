import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { paymentApi, announcementApi, visitorApi, facilityApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge, { statusTone } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatCurrency, formatDateTime, timeAgo } from '../../utils/format';

const actionCards = [
  {
    icon: 'person_add',
    title: 'Visitor Pass',
    subtitle: 'Invite guests',
    to: '/visitors',
    accent: 'primary',
    iconClass: 'bg-primary-fixed-dim/25 text-primary',
    bar: 'bg-primary',
  },
  {
    icon: 'report_problem',
    title: 'Log Complaint',
    subtitle: 'Raise service issue',
    to: '/maintenance',
    accent: 'error',
    iconClass: 'bg-error-container/45 text-error',
    bar: 'bg-error',
  },
  {
    icon: 'engineering',
    title: 'Service Directory',
    subtitle: 'Track requests',
    to: '/maintenance',
    accent: 'secondary',
    iconClass: 'bg-secondary-container/60 text-secondary',
    bar: 'bg-secondary',
  },
  {
    icon: 'calendar_month',
    title: 'Book Facility',
    subtitle: 'Shared spaces',
    to: '/facilities',
    accent: 'tertiary',
    iconClass: 'bg-tertiary-fixed/45 text-tertiary',
    bar: 'bg-tertiary',
  },
];

export default function ResidentHome() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    Promise.all([
      paymentApi.myInvoices({ limit: 5 }),
      announcementApi.list({ limit: 3 }),
      visitorApi.my({ limit: 5 }),
      facilityApi.myBookings({ limit: 3 }),
    ])
      .then(([inv, ann, vis, book]) => {
        setInvoices(inv.data);
        setAnnouncements(ann.data);
        setVisitors(vis.data);
        setBookings(book.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

  const firstName = user?.name?.split(' ')[0] || 'Resident';
  const outstanding = invoices
    .filter((i) => ['sent', 'overdue', 'partially-paid'].includes(i.status))
    .reduce((sum, i) => sum + (i.totalAmount - (i.paidAmount || 0)), 0);
  const nextDue = invoices.find((i) => ['sent', 'overdue', 'partially-paid'].includes(i.status));

  return (
    <div className="mx-auto max-w-lg space-y-stack-lg lg:max-w-none">
      <section className="animate-fade-up">
        <h2 className="font-display text-3xl font-bold leading-tight text-on-surface sm:text-4xl">
          Welcome, <span className="italic text-primary">{firstName}</span>
        </h2>
        <div className="mt-3 flex w-fit items-center gap-1.5 rounded-full border border-outline-variant/40 bg-surface-container-low px-3 py-1">
          <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
          <span className="font-label-md text-xs text-on-surface-variant">Verified SocietySphere resident</span>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        {actionCards.map((action) => (
          <Link
            key={action.title}
            to={action.to}
            className="card-pattern group relative flex min-h-[150px] flex-col items-start overflow-hidden rounded-2xl border border-outline-variant/40 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md active:scale-[0.97]"
          >
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${action.iconClass}`}>
              <span className="material-symbols-outlined filled text-3xl">{action.icon}</span>
            </div>
            <span className="font-display text-base font-bold leading-tight text-on-surface">{action.title}</span>
            <span className="mt-1 text-xs font-semibold text-on-surface-variant">{action.subtitle}</span>
            <div className={`absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 transform transition-transform group-hover:scale-x-100 ${action.bar}`} />
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-on-surface">Community Bulletin</h3>
          <Link to="/community" className="flex items-center gap-1 font-label-md text-sm text-primary transition-all hover:gap-2">
            View All
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {announcements.length === 0 ? (
          <Card className="p-lg">
            <EmptyState icon="notifications" title="No notices yet" />
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.slice(0, 2).map((item, index) => (
              <Link
                key={item._id}
                to="/community"
                className="block overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm transition-shadow hover:shadow-md"
              >
                <div className={`h-28 p-3 ${index % 2 === 0 ? 'bg-gradient-to-br from-primary to-secondary' : 'bg-gradient-to-br from-tertiary to-primary'}`}>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                    {item.type || 'Notice'}
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="mb-1 font-display text-lg font-bold text-on-surface transition-colors hover:text-primary">
                    {item.title}
                  </h4>
                  <p className="line-clamp-2 text-sm text-on-surface-variant">{item.body}</p>
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold uppercase text-outline">
                    <span className="material-symbols-outlined text-xs">calendar_today</span>
                    {formatDateTime(item.createdAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
        <Card className="p-lg">
          <div className="mb-6 flex items-start justify-between">
            <h3 className="font-display text-xl font-bold text-on-surface">Current Dues</h3>
            <Badge tone={outstanding > 0 ? 'warning' : 'success'}>{outstanding > 0 ? 'Pending' : 'Clear'}</Badge>
          </div>
          <div className="text-center">
            <p className="mb-2 text-label-sm uppercase tracking-wider text-on-surface-variant">Total outstanding</p>
            <h4 className="font-display text-[42px] font-bold text-primary">{formatCurrency(outstanding)}</h4>
            {nextDue && <p className="mt-2 text-body-sm text-error">Due {formatDateTime(nextDue.dueDate)}</p>}
          </div>
          <Link to="/payments">
            <Button className="mt-6 w-full">Pay Now</Button>
          </Link>
        </Card>

        <Card className="p-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-on-surface">Visitor Log</h3>
            <Link to="/visitors" className="text-sm font-bold text-primary">Open</Link>
          </div>
          {visitors.length === 0 ? (
            <EmptyState icon="group" title="No visitors yet" description="Pre-approve a guest to see it here." />
          ) : (
            <div className="space-y-4">
              {visitors.slice(0, 3).map((v) => (
                <div key={v._id} className="rounded-2xl bg-surface-container-low p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-display text-lg font-bold text-on-surface">{v.name}</p>
                      <p className="text-label-sm text-on-surface-variant">{timeAgo(v.createdAt)}</p>
                    </div>
                    <Badge tone={statusTone(v.status)}>{v.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      {bookings.length > 0 && (
        <Card className="p-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-on-surface">Upcoming Bookings</h3>
            <Link to="/facilities" className="text-sm font-bold text-primary">View All</Link>
          </div>
          <div className="space-y-3">
            {bookings.slice(0, 3).map((b) => (
              <div key={b._id} className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold text-on-surface">{b.facility?.name}</p>
                    <p className="text-sm text-on-surface-variant">{formatDateTime(b.slotStart)}</p>
                  </div>
                  <Badge tone={statusTone(b.status)}>{b.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
