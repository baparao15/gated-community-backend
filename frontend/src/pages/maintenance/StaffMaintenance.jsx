import { useEffect, useState } from 'react';
import { complaintApi, userApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Badge, { statusTone } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { Select } from '../../components/ui/FormField';
import { formatDateTime } from '../../utils/format';

const statusOptions = ['open', 'assigned', 'in-progress', 'resolved', 'closed'];

export default function StaffMaintenance() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = ['Admin', 'SuperAdmin'].includes(user?.role);
  const [tab, setTab] = useState(user?.role === 'Staff' ? 'mine' : 'all');
  const [complaints, setComplaints] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const load = () => {
    setLoading(true);
    const params = { limit: 40, ...(statusFilter && { status: statusFilter }) };
    const req = tab === 'mine' ? complaintApi.assignedToMe(params) : complaintApi.list(params);
    req.then((res) => setComplaints(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, [tab, statusFilter]);
  useEffect(() => {
    if (isAdmin) userApi.list({ role: 'Staff', limit: 100 }).then((res) => setStaffUsers(res.data)).catch(() => {});
  }, [isAdmin]);

  const assign = async (id, staffId) => {
    if (!staffId) return;
    await complaintApi.assign(id, staffId);
    toast.success('Complaint assigned');
    load();
  };

  const updateStatus = async (id, status) => {
    await complaintApi.updateStatus(id, { status });
    toast.success('Status updated');
    load();
  };

  const updatePriority = async (id, priority) => {
    await complaintApi.updatePriority(id, priority);
    toast.success('Priority updated');
    load();
  };

  return (
    <div className="space-y-lg">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Maintenance board</p>
          <h2 className="page-title mt-2">Service work, sorted into clear cards.</h2>
          <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
            Assign owners, update priority, and move each request forward without squeezing a table onto mobile.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {user?.role === 'Staff' && (
            <div className="flex rounded-full bg-surface-container-low p-1">
              {[
                { key: 'mine', label: 'Mine' },
                { key: 'all', label: 'All' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`min-h-10 rounded-full px-5 text-label-md transition-colors ${
                    tab === t.key ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
          <Select className="sm:!w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </Select>
        </div>
      </section>

      <Card className="p-5 sm:p-6">
        {loading ? (
          <Spinner full />
        ) : complaints.length === 0 ? (
          <EmptyState icon="build" title="No requests found" />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {complaints.map((c) => (
              <div key={c._id} className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="eyebrow">{c.priority} priority</p>
                    <h3 className="mt-2 truncate font-display text-2xl font-bold capitalize text-on-surface">{c.category}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-on-surface-variant">{c.description}</p>
                  </div>
                  <Badge tone={statusTone(c.status)}>{c.status}</Badge>
                </div>

                <div className="mt-4 grid gap-2 rounded-2xl bg-surface-container-low p-4 text-sm text-on-surface-variant">
                  <p>Raised by <span className="font-semibold text-on-surface">{c.raisedBy?.name || 'Resident'}</span></p>
                  <p>Created <span className="font-semibold text-on-surface">{formatDateTime(c.createdAt)}</span></p>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {isAdmin ? (
                    <Select value={c.priority} onChange={(e) => updatePriority(c._id, e.target.value)}>
                      {['low', 'medium', 'high', 'critical'].map((p) => <option key={p} value={p}>{p}</option>)}
                    </Select>
                  ) : (
                    <Badge tone={statusTone(c.priority === 'critical' || c.priority === 'high' ? 'overdue' : 'neutral')}>{c.priority}</Badge>
                  )}

                  {isAdmin && (
                    <Select value={c.assignedTo?._id || ''} onChange={(e) => assign(c._id, e.target.value)}>
                      <option value="">Unassigned</option>
                      {staffUsers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </Select>
                  )}

                  {['assigned', 'in-progress'].includes(c.status) && (
                    <Select
                      className={isAdmin ? 'sm:col-span-2' : ''}
                      value=""
                      onChange={(e) => e.target.value && updateStatus(c._id, e.target.value)}
                    >
                      <option value="">Set next status...</option>
                      {c.status === 'assigned' && <option value="in-progress">In Progress</option>}
                      <option value="resolved">Resolved</option>
                    </Select>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
