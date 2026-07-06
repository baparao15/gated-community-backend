import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { complaintApi } from '../../api/endpoints';
import Card from '../../components/ui/Card';
import Badge, { statusTone } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { timeAgo } from '../../utils/format';

export default function StaffHome() {
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    complaintApi
      .assignedToMe({ limit: 10 })
      .then((res) => setComplaints(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner full />;

  const open = complaints.filter((c) => c.status !== 'resolved' && c.status !== 'closed');

  return (
    <div className="space-y-lg">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-primary">Welcome back.</h2>
        <p className="text-on-surface-variant font-body-md">Here are the service requests assigned to you.</p>
      </div>

      <div className="grid grid-cols-3 gap-gutter">
        <Card className="p-6">
          <p className="text-label-md text-on-surface-variant mb-2">Assigned to me</p>
          <p className="font-display-lg text-[36px] font-bold text-primary">{complaints.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-label-md text-on-surface-variant mb-2">Open / In-progress</p>
          <p className="font-display-lg text-[36px] font-bold text-error">{open.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-label-md text-on-surface-variant mb-2">Resolved</p>
          <p className="font-display-lg text-[36px] font-bold text-secondary">{complaints.length - open.length}</p>
        </Card>
      </div>

      <Card className="p-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-title-lg text-title-lg text-on-surface">My Tasks</h3>
          <Link to="/maintenance" className="text-primary font-label-md text-label-md hover:underline">
            Open Maintenance Board
          </Link>
        </div>
        {complaints.length === 0 ? (
          <EmptyState icon="task_alt" title="Nothing assigned yet" description="New assignments will show up here." />
        ) : (
          <div className="space-y-3">
            {complaints.map((c) => (
              <div key={c._id} className="flex items-center justify-between p-4 rounded-xl border border-outline-variant">
                <div>
                  <p className="font-label-md text-label-md font-bold text-on-surface capitalize">{c.category}</p>
                  <p className="text-body-sm text-on-surface-variant line-clamp-1">{c.description}</p>
                  <p className="text-label-sm text-outline mt-1">{timeAgo(c.createdAt)}</p>
                </div>
                <Badge tone={statusTone(c.status)}>{c.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
