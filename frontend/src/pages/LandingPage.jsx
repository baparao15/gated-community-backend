import { Link } from 'react-router-dom';
import Brand from '../components/Brand';

const features = [
  ['shield_lock', 'Secure gate access', 'Pre-approve visitors, verify QR passes, and keep gate teams aligned.'],
  ['receipt_long', 'Digital dues', 'Raise invoices, collect payments, and issue receipts with less manual follow-up.'],
  ['engineering', 'Maintenance clarity', 'Track complaints from request to resolution with transparent updates.'],
  ['campaign', 'Community bulletin', 'Share notices, events, and emergency alerts with the right people quickly.'],
];

const stats = [
  ['24/7', 'security visibility'],
  ['3x', 'faster visitor entry'],
  ['98%', 'digital collections'],
  ['1 hub', 'for every resident'],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-ink">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-outline-variant/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
          <Brand />
          <nav className="hidden gap-7 text-sm font-semibold text-on-surface-variant md:flex">
            <a className="hover:text-primary" href="#features">Features</a>
            <a className="hover:text-primary" href="#payments">Payments</a>
            <a className="hover:text-primary" href="#contact">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link className="hidden px-4 py-2 font-bold text-primary sm:block" to="/login">Sign in</Link>
            <Link className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-4 py-2.5 font-bold text-on-primary shadow-soft transition hover:bg-primary-hover" to="/register">
              Join hub
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative pb-16 pt-32 sm:pt-36 lg:pb-24">
          <div className="absolute left-[-120px] top-24 h-80 w-80 rounded-full bg-brand-100/60 blur-3xl" />
          <div className="absolute right-[-120px] top-52 h-96 w-96 rounded-full bg-mint-100/70 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-[1.02fr_.98fr]">
            <div>
              <div className="eyebrow mb-5">Warm, grounded community management</div>
              <h1 className="font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl lg:text-6xl">
                SocietySphere brings everyday community life into one calm hub.
              </h1>
              <p className="mt-5 max-w-2xl text-body-lg text-on-surface-variant">
                Bring residents, admins, guards, and maintenance teams into one calm place for visitors, dues,
                facilities, notices, and support.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-on-primary shadow-soft transition hover:bg-primary-hover" to="/login">
                  Open dashboard
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </Link>
                <a className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-secondary px-6 py-3 font-bold text-secondary transition hover:bg-secondary-container" href="#features">
                  See features
                </a>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-outline-variant bg-surface-container-lowest/80 p-4 shadow-card">
                    <div className="font-display text-2xl font-extrabold text-primary">{value}</div>
                    <div className="mt-1 text-label-sm text-on-surface-variant">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-brand-100/70 to-mint-100/70 blur-2xl" />
              <div className="card-pattern relative rounded-3xl border border-outline-variant bg-surface-container-lowest p-4 shadow-soft-xl">
                <div className="rounded-2xl bg-ink p-5 text-inverse-on-surface">
                  <div className="flex items-center justify-between gap-4">
                    <Brand light />
                    <span className="rounded-full bg-mint-100/15 px-3 py-1 text-xs font-bold text-mint-100">Live today</span>
                  </div>
                  <div className="mt-8">
                    <p className="text-sm text-earth-300">Good morning</p>
                    <h2 className="mt-1 font-display text-2xl font-bold">Your community is organized.</h2>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {[
                      ['Rs 2,500', 'Outstanding'],
                      ['02', 'Visitors today'],
                      ['01', 'Open request'],
                      ['03', 'Bookings'],
                    ].map(([value, label], index) => (
                      <div key={label} className={`rounded-2xl p-4 ${index === 0 ? 'bg-primary text-white' : 'bg-white/8'}`}>
                        <div className="font-display text-xl font-extrabold">{value}</div>
                        <div className="mt-1 text-xs text-earth-300">{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-2xl bg-surface p-4 text-ink">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-primary">Verified entry</div>
                        <div className="mt-1 font-bold">Secure visitor pass</div>
                        <div className="text-xs text-on-surface-variant">QR and OTP gate access</div>
                      </div>
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary-container text-secondary">
                        <span className="material-symbols-outlined filled">verified_user</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-5 py-16 lg:py-24">
          <div className="max-w-2xl">
            <div className="eyebrow">Designed for residents</div>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">A calmer way to run shared living.</h2>
            <p className="mt-4 text-on-surface-variant">Large tap targets, readable cards, and practical workflows for mobile and web.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map(([icon, title, text]) => (
              <div key={title} className="card-pattern rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card transition hover:-translate-y-1 hover:shadow-soft-lg">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-container text-primary">
                  <span className="material-symbols-outlined filled">{icon}</span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="payments" className="bg-inverse-surface py-16 text-inverse-on-surface lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <div className="eyebrow !text-brand-300">Payment ready</div>
              <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">Collect dues with UPI, Razorpay, or Stripe patterns.</h2>
              <p className="mt-4 text-earth-300">
                The payments page now supports manual collection and can launch Razorpay Checkout or a Stripe payment
                link when your keys are configured.
              </p>
              <Link className="mt-7 inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-6 py-3 font-bold text-on-primary shadow-soft transition hover:bg-primary-hover" to="/login">
                Go to payments
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {['Invoice raised', 'Gateway checkout', 'Receipt recorded'].map((label, index) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-primary font-bold">{index + 1}</div>
                  <div className="mt-5 font-display text-xl font-bold">{label}</div>
                  <p className="mt-2 text-sm text-earth-300">Optimized for phone screens and admin desktops.</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-outline-variant bg-surface-container-lowest py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 sm:flex-row sm:items-center">
          <Brand />
          <div className="text-sm text-on-surface-variant">2026 SocietySphere | contact@societysphere.local</div>
        </div>
      </footer>
    </div>
  );
}
