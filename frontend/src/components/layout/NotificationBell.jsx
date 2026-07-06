import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '../../api/endpoints';
import { timeAgo } from '../../utils/format';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await dashboardApi.notifications({ limit: 8 });
      setNotifications(res.data);
      setUnreadCount(res.pagination?.unreadCount || 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id) => {
    await dashboardApi.markNotificationRead(id);
    load();
  };

  const markAllRead = async () => {
    await dashboardApi.markAllRead();
    load();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface-variant relative transition-colors duration-200"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error rounded-full text-on-error text-[9px] font-bold flex items-center justify-center ring-2 ring-surface">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-surface border border-outline-variant rounded-2xl shadow-soft-xl overflow-hidden animate-scale-in origin-top-right z-50">
          <div className="flex justify-between items-center px-5 py-4 border-b border-outline-variant">
            <h4 className="font-title-lg text-title-lg text-on-surface">Notifications</h4>
            <button onClick={markAllRead} className="text-primary text-label-sm font-label-sm hover:underline">
              Mark all read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 && (
              <p className="text-center py-10 text-on-surface-variant text-body-sm">No notifications yet</p>
            )}
            {notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => markRead(n._id)}
                className={`w-full text-left px-5 py-4 border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors duration-150 flex gap-3 ${
                  !n.isRead ? 'bg-primary-container/40' : ''
                }`}
              >
                <span className={`w-2 h-2 mt-2 rounded-full shrink-0 ${!n.isRead ? 'bg-primary' : 'bg-outline-variant'}`} />
                <div className="flex-1">
                  <p className="font-label-md text-label-md font-bold text-on-surface">{n.title}</p>
                  <p className="text-body-sm text-on-surface-variant">{n.message}</p>
                  <p className="text-label-sm text-on-surface-variant/70 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => { setOpen(false); navigate('/notifications'); }}
            className="w-full py-3 text-primary font-bold text-label-md hover:bg-surface-container-low transition-colors duration-150"
          >
            View All
          </button>
        </div>
      )}
    </div>
  );
}
