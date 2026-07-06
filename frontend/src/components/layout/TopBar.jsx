import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import { initials } from '../../utils/format';

export default function TopBar({ title, subtitle, onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      className={`fixed top-0 left-0 lg:left-[264px] right-0 h-16 flex justify-between items-center px-5 sm:px-8 z-30 transition-all duration-300 ease-smooth ${
        scrolled ? 'glass-nav border-b border-outline-variant shadow-soft' : 'bg-background border-b border-transparent'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors duration-200 shrink-0"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="min-w-0">
          <h2 className="font-display text-title-lg font-bold text-on-surface leading-none truncate">{title}</h2>
          {subtitle && <p className="text-label-sm text-on-surface-variant mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <div className="h-6 w-px bg-outline-variant mx-1" />
        <div className="relative" ref={ref}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex min-h-12 items-center gap-3 group rounded-full pr-1 hover:bg-surface-container transition-colors duration-200 py-1"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <div className="text-right hidden sm:block pl-2">
              <p className="font-label-md text-label-md font-semibold text-on-surface leading-none">{user?.name}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-on-primary font-bold text-label-sm shrink-0 shadow-soft">
              {initials(user?.name)}
            </div>
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-52 bg-surface border border-outline-variant rounded-2xl shadow-soft-lg overflow-hidden animate-scale-in z-50 origin-top-right"
            >
              <button
                role="menuitem"
                onClick={() => { setMenuOpen(false); navigate('/profile'); }}
              className="w-full text-left px-4 py-3 hover:bg-surface-container flex items-center gap-3 text-label-md text-on-surface transition-colors duration-150"
              >
                <span className="material-symbols-outlined text-[20px]">person</span> Profile
              </button>
              <button
                role="menuitem"
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 hover:bg-error-container flex items-center gap-3 text-label-md text-error transition-colors duration-150"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
