import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: 'home', roles: ['SuperAdmin', 'Admin', 'Resident', 'Guard', 'Staff'] },
  { to: '/visitors', label: 'Visitors', icon: 'person_add', roles: ['SuperAdmin', 'Admin', 'Resident', 'Guard'] },
  { to: '/maintenance', label: 'Maintenance', icon: 'build', roles: ['SuperAdmin', 'Admin', 'Resident', 'Staff'] },
  { to: '/facilities', label: 'Booking', icon: 'calendar_month', roles: ['SuperAdmin', 'Admin', 'Resident'] },
  { to: '/payments', label: 'Payments', icon: 'payments', roles: ['SuperAdmin', 'Admin', 'Resident'] },
  { to: '/community', label: 'Community', icon: 'forum', roles: ['SuperAdmin', 'Admin', 'Resident', 'Guard', 'Staff'] },
  { to: '/security', label: 'Security', icon: 'shield', roles: ['SuperAdmin', 'Admin', 'Resident', 'Guard'] },
  { to: '/admin/users', label: 'Admin', icon: 'admin_panel_settings', roles: ['SuperAdmin', 'Admin'] },
];

export default function Sidebar({ open, onClose, onReportIncident }) {
  const { user } = useAuth();
  const items = NAV_ITEMS.filter((item) => !user?.role || item.roles.includes(user.role));

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar-drawer fixed left-0 top-0 h-full w-[264px] bg-surface-container-lowest/95 border-r border-outline-variant flex flex-col py-6 z-50 shadow-soft-lg lg:shadow-none ${
          open ? 'sidebar-open' : ''
        }`}
      >
        <div className="px-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-soft shrink-0 ring-1 ring-brand-100">
              <span className="material-symbols-outlined text-[21px] filled">apartment</span>
            </div>
            <div>
              <h1 className="font-display text-title-lg font-bold text-brand-600 leading-none">SocietySphere</h1>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Resident Hub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors duration-200"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar" aria-label="Main navigation">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ease-smooth ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-inner-soft'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-primary' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="font-label-md text-label-md">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 mt-auto pt-4 border-t border-outline-variant mx-3">
          <button
            onClick={onReportIncident}
            className="w-full min-h-12 py-2.5 px-4 bg-error-container text-on-error-container font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-error hover:text-on-error transition-all duration-200 ease-smooth active:scale-[0.98] mt-4"
          >
            <span className="material-symbols-outlined text-[20px]">emergency</span>
            <span className="font-label-md text-label-md">Report Incident</span>
          </button>
        </div>
      </aside>
    </>
  );
}
