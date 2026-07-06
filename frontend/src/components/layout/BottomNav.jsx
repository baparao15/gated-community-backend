import { NavLink } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

const ITEMS = [
  { to: '/dashboard', label: 'Home', icon: 'home' },
  { to: '/community', label: 'Bulletin', icon: 'notifications' },
  { to: '/maintenance', label: 'Directory', icon: 'contact_page' },
  { to: '/profile', label: 'Profile', icon: 'person' },
];

export default function BottomNav() {
  const toast = useToast();

  return (
    <>
      <button
        className="voice-fab-bubble fixed bottom-24 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary transition-transform duration-200 active:scale-90 lg:hidden"
        onClick={() => toast.info('SocietySphere voice help is ready. Choose an action from this screen.')}
        aria-label="Voice help"
      >
        <span className="material-symbols-outlined filled text-4xl">mic</span>
      </button>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-surface-container-highest bg-surface/95 px-4 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] backdrop-blur-md lg:hidden">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex min-w-16 flex-col items-center justify-center transition-transform active:scale-95 ${
                isActive ? 'text-primary' : 'p-2 text-on-surface-variant hover:text-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={isActive ? 'mb-1 rounded-full bg-primary/10 px-5 py-1' : 'mb-1'}>
                  <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>{item.icon}</span>
                </div>
                <span className={`font-label-md text-[10px] ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
