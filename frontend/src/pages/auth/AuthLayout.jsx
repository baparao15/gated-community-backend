import { Link } from 'react-router-dom';
import Brand from '../../components/Brand';

export default function AuthLayout({ children }) {
  const highlights = [
    ['verified_user', 'Role-based access for residents, guards, staff, and admins'],
    ['qr_code_2', 'Visitor QR and OTP flows for faster gate verification'],
    ['payments', 'Maintenance dues with manual, UPI, and gateway-ready payments'],
  ];

  return (
    <div className="min-h-screen bg-background text-on-background">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_.95fr]">
        <aside className="relative hidden overflow-hidden border-r border-outline-variant bg-inverse-surface lg:flex">
          <div className="absolute left-[-110px] top-10 h-80 w-80 rounded-full bg-brand-600/30 blur-3xl" />
          <div className="absolute bottom-[-130px] right-[-80px] h-96 w-96 rounded-full bg-secondary/35 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '26px 26px',
            }}
          />
          <div className="relative z-10 flex w-full flex-col justify-between p-12 text-inverse-on-surface">
            <Link to="/" aria-label="Go to landing page">
              <Brand light />
            </Link>

            <div className="max-w-md">
              <div className="eyebrow !text-brand-300">Community first</div>
              <h1 className="mt-4 font-display text-[42px] font-extrabold leading-tight">
                A secure digital courtyard for your whole community.
              </h1>
              <p className="mt-5 text-body-lg text-earth-300">
                Manage residents, payments, visitors, maintenance, and notices in one calm portal built for phones and desks.
              </p>
              <div className="mt-8 space-y-4">
                {highlights.map(([icon, text]) => (
                  <div key={text} className="flex items-center gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/10 text-brand-100">
                      <span className="material-symbols-outlined filled text-[22px]">{icon}</span>
                    </div>
                    <p className="text-body-sm text-earth-100">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-label-sm text-earth-300">2026 SocietySphere. Built for shared living.</p>
          </div>
        </aside>

        <main className="flex min-h-screen items-center justify-center p-5 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link to="/" aria-label="Go to landing page">
                <Brand />
              </Link>
            </div>
            <div className="card-pattern rounded-3xl border border-outline-variant bg-surface-container-lowest/95 p-6 shadow-soft-lg sm:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
