import { useEffect, useMemo } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bell, BookOpen, Building, CalendarDays, Car, CircleDollarSign, ClipboardList, Home,
  LogOut, Menu, MessageSquareText, Mic, Moon, ShieldCheck, Siren, Sun, UserRound, UsersRound, Wrench, X,
} from 'lucide-react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Brand from './Brand';
import { clearToast, setSidebar, showToast, toggleDark } from '../store/uiSlice';
import { logout } from '../store/authSlice';
import useApiData from '../hooks/useApiData';
import { asList } from '../utils/apiData';

const shared = [
  { to: '/app/dashboard', label: 'Dashboard', icon: Home },
  { to: '/app/notifications', label: 'Notifications', icon: Bell },
];
const resident = [
  { to: '/app/visitors', label: 'Visitors', icon: UsersRound },
  { to: '/app/complaints', label: 'Complaints', icon: ClipboardList },
  { to: '/app/payments', label: 'Payments', icon: CircleDollarSign },
  { to: '/app/bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/app/notices', label: 'Notices', icon: BookOpen },
  { to: '/app/vehicles', label: 'Vehicles', icon: Car },
  { to: '/app/forum', label: 'Community Forum', icon: MessageSquareText },
  { to: '/app/profile', label: 'My Profile', icon: UserRound },
  { to: '/app/settings', label: 'Settings', icon: Wrench },
];
const admin = [
  { to: '/app/residents', label: 'Residents', icon: Building },
  { to: '/app/units', label: 'Units', icon: Home },
  { to: '/app/complaints', label: 'Complaints', icon: ClipboardList },
  { to: '/app/visitors', label: 'Visitors', icon: UsersRound },
  { to: '/app/facilities', label: 'Facilities', icon: CalendarDays },
  { to: '/app/bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/app/payments', label: 'Revenue', icon: CircleDollarSign },
  { to: '/app/notices', label: 'Announcements', icon: BookOpen },
  { to: '/app/reports', label: 'Reports', icon: Wrench },
  { to: '/app/settings', label: 'Settings', icon: Wrench },
];
const guard = [
  { to: '/app/visitors', label: 'Visitor Gate', icon: ShieldCheck },
  { to: '/app/vehicles', label: 'Vehicle Lookup', icon: Car },
  { to: '/app/emergency', label: 'Emergency', icon: Siren },
];
const staff = [
  { to: '/app/complaints', label: 'Assigned Tasks', icon: Wrench },
  { to: '/app/profile', label: 'My Profile', icon: UserRound },
];

const mobileByRole = {
  Resident: [
    ['/app/dashboard', Home, 'Home'],
    ['/app/visitors', UsersRound, 'Visitors'],
    ['/app/complaints', ClipboardList, 'Issues'],
    ['/app/payments', CircleDollarSign, 'Payments'],
    ['/app/profile', UserRound, 'Profile'],
  ],
  Guard: [
    ['/app/dashboard', Home, 'Home'],
    ['/app/visitors', ShieldCheck, 'Gate'],
    ['/app/vehicles', Car, 'Vehicles'],
    ['/app/emergency', Siren, 'SOS'],
    ['/app/profile', UserRound, 'Profile'],
  ],
  Staff: [
    ['/app/dashboard', Home, 'Home'],
    ['/app/complaints', Wrench, 'Tasks'],
    ['/app/settings', Wrench, 'Settings'],
    ['/app/profile', UserRound, 'Profile'],
  ],
  Admin: [
    ['/app/dashboard', Home, 'Home'],
    ['/app/residents', Building, 'People'],
    ['/app/complaints', ClipboardList, 'Issues'],
    ['/app/reports', Wrench, 'Reports'],
    ['/app/settings', Wrench, 'Settings'],
  ],
  SuperAdmin: [
    ['/app/dashboard', Home, 'Home'],
    ['/app/residents', Building, 'People'],
    ['/app/complaints', ClipboardList, 'Issues'],
    ['/app/reports', Wrench, 'Reports'],
    ['/app/settings', Wrench, 'Settings'],
  ],
};

export default function AppShell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useSelector((s) => s.auth);
  const { dark, sidebarOpen, toast } = useSelector((s) => s.ui);
  const items = useMemo(() => [...shared, ...(user?.role === 'Resident' ? resident : user?.role === 'Guard' ? guard : user?.role === 'Staff' ? staff : admin)], [user?.role]);
  const { data: unreadData, reload: reloadUnread } = useApiData(token ? '/notifications?isRead=false&limit=1' : null, []);
  const hasUnreadNotifications = asList(unreadData).length > 0;

  useEffect(() => { dispatch(setSidebar(false)); }, [location.pathname]);
  useEffect(() => { if (!token) navigate('/login', { replace: true }); }, [token]);
  useEffect(() => {
    if (token) reloadUnread();
  }, [location.pathname, token, reloadUnread]);
  useEffect(() => {
    const refresh = () => reloadUnread();
    window.addEventListener('notifications:changed', refresh);
    return () => window.removeEventListener('notifications:changed', refresh);
  }, [reloadUnread]);

  const leave = () => { dispatch(logout()); navigate('/'); };
  const roleLabel = { Guard: 'Security', Staff: 'Maintenance', Resident: 'Resident', Admin: 'Admin', SuperAdmin: 'Admin' }[user?.role];
  const mobileItems = mobileByRole[user?.role] || mobileByRole.Resident;

  return (
    <div className="min-h-screen bg-canvas dark:bg-earth-900">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-earth-300/70 bg-canvas/95 p-5 transition-transform dark:border-earth-700 dark:bg-earth-900 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="shrink-0 flex items-center justify-between px-2">
          <Brand />
          <button className="lg:hidden" onClick={() => dispatch(setSidebar(false))}><X /></button>
        </div>
        <div className="mt-8 shrink-0 rounded-2xl bg-white/80 p-4 text-earth-900 shadow-card ring-1 ring-earth-300/70 dark:bg-earth-800 dark:text-earth-50">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-100 font-display font-bold text-brand-600 ring-2 ring-white">{user?.name?.split(' ').map((x) => x[0]).slice(0,2).join('')}</div>
            <div className="min-w-0">
              <div className="truncate font-bold">{user?.name}</div>
              <div className="text-xs text-earth-500">{roleLabel} workspace</div>
            </div>
          </div>
          <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-mint-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-mint-600">
            <ShieldCheck size={14} /> Verified Resident
          </div>
        </div>
        <nav className="mt-6 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {items.map(({ to, label, icon: Icon }, index) => (
            <NavLink key={`${to}-${index}`} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-100' : 'text-earth-700 hover:bg-earth-100 hover:text-brand-600 dark:text-earth-200 dark:hover:bg-earth-800 dark:hover:text-white'}`}>
              <Icon size={19} /> {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={leave} className="mt-4 shrink-0 flex items-center justify-center gap-3 rounded-xl bg-earth-200 px-4 py-4 text-sm font-bold text-brand-700 hover:bg-brand-100 dark:bg-earth-800 dark:text-brand-100"><LogOut size={19} /> Logout</button>
      </aside>

      {sidebarOpen && <button aria-label="Close menu" onClick={() => dispatch(setSidebar(false))} className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" />}

      <div className="lg:pl-72">
        <header className="glass sticky top-0 z-30 flex h-20 items-center justify-between border-b border-earth-300/60 px-4 dark:border-earth-700 md:px-8">
          <button className="grid h-10 w-10 place-items-center rounded-xl border border-earth-300 bg-white text-brand-600 dark:border-earth-700 dark:bg-earth-900 lg:hidden" onClick={() => dispatch(setSidebar(true))}><Menu size={20} /></button>
          <div className="hidden text-sm text-earth-700 lg:block"><span className="status-dot mr-2 bg-mint-500" />Community services online</div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => dispatch(toggleDark())} className="grid h-10 w-10 place-items-center rounded-xl border border-earth-300 bg-white text-earth-700 dark:border-earth-700 dark:bg-earth-900">{dark ? <Sun size={19} /> : <Moon size={19} />}</button>
            <NavLink to="/app/notifications" className="relative grid h-10 w-10 place-items-center rounded-xl border border-earth-300 bg-white text-earth-700 dark:border-earth-700 dark:bg-earth-900">
              <Bell size={19} />{hasUnreadNotifications && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />}
            </NavLink>
            <div className="ml-2 hidden text-right sm:block"><div className="text-sm font-bold text-earth-900 dark:text-earth-50">{user?.name}</div><div className="text-xs text-earth-500">{roleLabel}</div></div>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] p-4 pb-28 md:p-8 lg:pb-8"><Outlet /></main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 rounded-t-2xl border-t border-earth-300 bg-canvas/95 px-2 py-2 shadow-soft backdrop-blur lg:hidden dark:border-earth-700 dark:bg-earth-900/95">
        {mobileItems.map(([to, Icon, label]) => <NavLink key={to} to={to} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-full py-1 text-[10px] font-bold ${isActive ? 'bg-brand-100 px-3 text-brand-700' : 'text-earth-700 dark:text-earth-200'}`}><Icon size={20} />{label}</NavLink>)}
      </nav>
      <button onClick={() => dispatch(showToast({ message: 'Voice help is ready. Please enter the action you need on the current page.' }))} className="voice-fab"><Mic size={30} /></button>
      {user?.role === 'Resident' && <button onClick={() => dispatch(showToast({ message: 'SOS activated. Security desk has been notified.', severity: 'error' }))} className="fixed bottom-44 right-5 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-red-700 text-white shadow-xl shadow-red-700/30 md:bottom-28"><Siren size={21} /></button>}
      <Snackbar open={!!toast} autoHideDuration={3500} onClose={() => dispatch(clearToast())}><Alert variant="filled" severity={toast?.severity || 'success'}>{toast?.message}</Alert></Snackbar>
    </div>
  );
}
