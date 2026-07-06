import { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDateTime } from '../../utils/format';

const TYPE_ICON = {
  visitor_arrived: 'person_add', visitor_approved: 'check_circle', visitor_denied: 'block',
  complaint_updated: 'build', complaint_assigned: 'assignment_ind', complaint_resolved: 'task_alt',
  announcement: 'campaign', emergency: 'emergency', booking_status: 'event',
  invoice_generated: 'receipt_long', invoice_overdue: 'warning', payment_received: 'payments', general: 'notifications',
};

export default function Notifications() {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    dashboardApi
      .notifications({ limit: 50 })
      .then((res) => setNotifications(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const markRead = async (id) => {
    await dashboardApi.markNotificationRead(id);
    load();
  };

  const markAllRead = async () => {
    await dashboardApi.markAllRead();
    toast.success('All notifications marked as read');
    load();
  };

  return (
    <div className="space-y-lg max-w-3xl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Notifications</h2>
          <p className="text-on-surface-variant font-body-md">Stay up to date with community activity.</p>
        </div>
        <Button variant="outline" icon="done_all" onClick={markAllRead}>Mark all read</Button>
      </div>

      {loading ? (
        <Spinner full />
      ) : notifications.length === 0 ? (
        <Card className="p-lg"><EmptyState icon="notifications_off" title="No notifications" /></Card>
      ) : (
        <Card className="divide-y divide-outline-variant">
          {notifications.map((n) => (
            <button
              key={n._id}
              onClick={() => !n.isRead && markRead(n._id)}
              className={`w-full text-left px-6 py-5 flex gap-4 hover:bg-surface-container-low transition-colors ${!n.isRead ? 'bg-primary-fixed/10' : ''}`}
            >
              <div className="w-11 h-11 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">{TYPE_ICON[n.type] || 'notifications'}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="font-label-md text-label-md font-bold text-on-surface">{n.title}</p>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
                </div>
                <p className="text-body-sm text-on-surface-variant">{n.message}</p>
                <p className="text-label-sm text-outline mt-1">{formatDateTime(n.createdAt)}</p>
              </div>
            </button>
          ))}
        </Card>
      )}
    </div>
  );
}
