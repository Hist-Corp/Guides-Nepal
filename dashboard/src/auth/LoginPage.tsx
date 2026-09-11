import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Compass, Eye, EyeOff, Moon, Sun } from 'lucide-react';
import { cn } from '../utils/cn';
import { login } from '../services/api';
import { normalizeRole } from '../utils/roles';
import { useAuthStore } from '../state/authStore';
import { useTheme } from '../hooks/useTheme';
import ForgotPasswordModal from './ForgotPasswordModal';
import HelpFaqModal from '../components/HelpFaqModal';
import nepalHero from '../assets/nepal-hero.jpg';

// Role identity shown in the sign-in dropdown — roles only, never real names.
const ROLE_EMOJIS: Record<string, string> = {
  'super-admin': '🛡️',
  admin: '⚙️',
  'content-writer': '✍️',
  'regional-head': '🗺️',
  'customer-support': '🎧',
  host: '🏠',
  guide: '🧭',
};

// Dev seed credentials per role (backend/seed_*.py). Picking a role in the
// dropdown pre-fills these so you can sign straight in — the list shows only
// the role you are logging in as.
const ROLE_ACCOUNTS: { value: string; label: string; email: string; password: string; scope: string }[] = [
  { value: 'super-admin', label: 'Super Admin', email: 'superadmin@guides-nepal.com', password: 'SuperAdmin@2024', scope: 'Full system access' },
  { value: 'admin', label: 'Admin', email: 'admin@guides-nepal.com', password: 'Admin@12345', scope: 'Full system access' },
  { value: 'content-writer', label: 'Content Writer', email: 'content@guides-nepal.com', password: 'Content@2024', scope: 'Pages · Blog · Media · SEO' },
  { value: 'regional-head', label: 'Regional Head', email: 'regional@guides-nepal.com', password: 'Regional@2024', scope: 'Kathmandu Valley' },
  { value: 'customer-support', label: 'Customer Support', email: 'support@guides-nepal.com', password: 'Support@2024', scope: 'Tickets · FAQ' },
  { value: 'host', label: 'Host', email: 'host@guides-nepal.com', password: 'Host@2024', scope: 'Tours · Bookings · Earnings' },
  { value: 'guide', label: 'Guide', email: 'guide@guides-nepal.com', password: 'Guide@2024', scope: 'Schedule · Tours · Payouts' },
];

/**
 * Full-bleed Nepal photo backdrop with layered legibility veils
 * (dawn-gradient scrim left for the headline, subtle dark vignette)
 * — copied from the reference design.
 */
function FullScenic() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <img
        src={nepalHero}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      {/* dawn-to-blue tint + legibility scrims */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b1c3f]/80 via-[#12306b]/25 to-[#0b1c3f]/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#071230]/60 via-transparent to-[#0b1c3f]/30" />
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [selectRole, setSelectRole] = useState<
    'super-admin' | 'admin' | 'content-writer' | 'regional-head' | 'customer-support' | 'host' | 'guide'
  >('admin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { token, role, setToken, setRole, setUser, setError, setLoading, error } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const dark = theme === 'dark';

  useEffect(() => {
    if (token && role) {
      navigate(`/dashboard/${role}`, { replace: true });
    }
  }, [token, role, navigate]);

  // Close the role dropdown on outside click / Escape, like the reference.
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const selectedAccount = ROLE_ACCOUNTS.find((a) => a.value === selectRole) ?? ROLE_ACCOUNTS[1];

  const pickRole = (value: string) => {
    const acc = ROLE_ACCOUNTS.find((a) => a.value === value);
    if (!acc) return;
    setSelectRole(value as any);
    setEmail(acc.email);
    setPassword(acc.password);
    setMenuOpen(false);
    setError(null);
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (import.meta.env.VITE_DEV_FAKE_LOGIN === '1') {
        const me = {
          id: 1,
          email: 'huhehaha.prakaz@gmail.com',
          firstName: 'Admin',
          lastName: 'User',
          role: selectRole,
        };
        setToken('dev-token');
        setRole(selectRole);
        setUser(me);
        navigate(`/dashboard/${me.role}`, { replace: true });
        if (remember) {
          try {
            localStorage.setItem('gn_token', 'dev-token');
            localStorage.setItem('gn_role', me.role);
            localStorage.setItem('gn_user', JSON.stringify(me));
          } catch {}
        }
        return;
      }
      const res = await login({ email, password });
      setToken(res.access_token ?? null);
      const me = res.user;
      const normalized = normalizeRole(me.role);
      if (!normalized) {
        setError('Your account does not have dashboard access');
        return;
      }
      setRole(normalized);
      setUser({ ...me, role: normalized });
      navigate(`/dashboard/${normalized}`, { replace: true });
      if (remember) {
        try {
          localStorage.setItem('gn_token', res.access_token ?? '');
          localStorage.setItem('gn_role', normalized);
          localStorage.setItem('gn_user', JSON.stringify({ ...me, role: normalized }));
        } catch {}
      }
    } catch (err: any) {
      // Show the actual error from the API when available
      const detail = err?.response?.data?.detail;
      setError(detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen">
      <FullScenic />

      {/* ---------- Top bar ---------- */}
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 font-black text-white ring-1 ring-white/30 backdrop-blur">
            ग
          </div>
          <div className="text-sm font-black uppercase tracking-[0.22em] text-white drop-shadow">
            Guides<span className="font-light"> Nepal</span>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className="hidden rounded-full px-3 py-1.5 text-xs font-semibold text-white/85 backdrop-blur transition hover:bg-white/15 hover:text-white md:block"
        >
          Help &amp; FAQ
        </button>
      </header>

      {/* ---------- Content ---------- */}
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 pb-14 pt-24 sm:px-8 lg:grid-cols-[1.15fr_1fr]">
        {/* Left: brand statement — copied verbatim from the reference */}
        <div className="animate-fade-up text-white drop-shadow-lg">
          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-white/85">
            <Compass size={14} /> Travel · Nepal
          </div>
          <h1 className="text-5xl font-black uppercase leading-[0.98] tracking-tight sm:text-6xl xl:text-7xl">
            Explore<br />
            <span className="text-accent-300">Nepal</span>
          </h1>
          <p className="mt-5 max-w-sm text-base font-semibold leading-snug text-white/95">
            Where your journey becomes a story — book the person, not just the place.
          </p>
          <p className="mt-3 max-w-sm text-xs leading-relaxed text-white/70">
            Dashboard &amp; CMS demo · 7 role consoles · runs fully in your browser, no backend connected.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {['🏔️ 5 cities', '🧭 Verified guides', '⭐ 4.8 rating'].map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-white/12 px-3 py-1.5 text-[11px] font-semibold text-white ring-1 ring-white/25 backdrop-blur"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        {/* Right: frosted glass sign-in card — copied from the reference */}
        <div className="animate-fade-up">
          <div
            className={cn(
              'relative mx-auto w-full max-w-md rounded-3xl p-6 shadow-2xl backdrop-blur-2xl sm:p-8',
              dark ? 'border border-white/15 bg-[#1b1730]/75' : 'border border-white/60 bg-white/85',
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className={cn('text-xl font-black tracking-tight', dark ? 'text-white' : 'text-slate-900')}>
                  Sign in
                </h2>
                <p className={cn('mt-1 text-xs', dark ? 'text-white/60' : 'text-slate-500')}>
                  Choose your role, then enter credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className={cn(
                  'cursor-pointer rounded-full border p-2 transition',
                  dark ? 'border-white/25 text-white hover:bg-white/10' : 'border-slate-200 text-slate-500 hover:border-brand-400 hover:text-brand-600',
                )}
                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {dark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>

            {error && (
              <div
                className={cn(
                  'mt-5 rounded-xl px-3 py-2 text-xs ring-1',
                  dark ? 'bg-rose-500/15 text-rose-200 ring-rose-400/30' : 'bg-rose-50 text-rose-600 ring-rose-200',
                )}
              >
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {/* Role dropdown */}
              <div ref={menuRef} className="relative">
                <span className={cn('mb-1.5 block text-xs font-semibold', dark ? 'text-white/80' : 'text-slate-600')}>
                  Sign in as
                </span>
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={menuOpen}
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-left text-sm outline-none transition',
                    dark
                      ? 'border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/40'
                      : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25',
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="text-base leading-none">{ROLE_EMOJIS[selectRole]}</span>
                    <span className="truncate text-sm font-bold">{selectedAccount.label}</span>
                  </span>
                  <ChevronDown size={15} className={cn('shrink-0 opacity-60 transition-transform', menuOpen && 'rotate-180')} />
                </button>

                {menuOpen && (
                  <div
                    role="listbox"
                    className={cn(
                      'absolute left-0 right-0 top-full z-20 mt-2 max-h-72 space-y-1 overflow-y-auto rounded-2xl border p-1.5 shadow-2xl',
                      dark ? 'border-white/15 bg-slate-900' : 'border-slate-200 bg-white',
                    )}
                  >
                    {ROLE_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.value}
                        type="button"
                        role="option"
                        aria-selected={acc.value === selectRole}
                        onClick={() => pickRole(acc.value)}
                        className={cn(
                          'flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
                          acc.value === selectRole
                            ? dark
                              ? 'bg-brand-600/20 ring-1 ring-brand-500/40'
                              : 'bg-brand-50 ring-1 ring-brand-200'
                            : dark
                              ? 'hover:bg-white/5'
                              : 'hover:bg-slate-50',
                        )}
                      >
                        <span className="text-lg leading-none">{ROLE_EMOJIS[acc.value]}</span>
                        <span className="min-w-0 flex-1">
                          <span className={cn('block truncate text-sm font-semibold', dark ? 'text-white' : 'text-slate-900')}>{acc.label}</span>
                          <span className={cn('block truncate text-xs', dark ? 'text-slate-400' : 'text-slate-500')}>{acc.scope}</span>
                        </span>
                        {acc.value === selectRole && <span className="text-sm font-bold text-brand-600">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Email */}
              <div>
                <label htmlFor="login-email" className={cn('mb-1.5 block text-xs font-semibold', dark ? 'text-white/80' : 'text-slate-600')}>
                  Email
                </label>
                <input
                  id="login-email"
                  className={cn(
                    'w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition',
                    dark
                      ? 'border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/40'
                      : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25',
                  )}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="username"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className={cn('mb-1.5 block text-xs font-semibold', dark ? 'text-white/80' : 'text-slate-600')}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className={cn('mb-1.5 cursor-pointer text-xs font-semibold', dark ? 'text-brand-300 hover:text-brand-200' : 'text-brand-600 hover:underline')}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    className={cn(
                      'w-full rounded-xl border px-4 py-2.5 pr-11 text-sm outline-none transition',
                      dark
                        ? 'border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/40'
                        : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25',
                    )}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    className={cn(
                      'absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 transition',
                      dark ? 'text-white/60 hover:text-white' : 'text-slate-400 hover:text-brand-600',
                    )}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label className={cn('flex cursor-pointer select-none items-center gap-2.5 text-xs', dark ? 'text-white/75' : 'text-slate-600')}>
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer accent-brand-600"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me &amp; keep me signed in
              </label>

              {hint && (
                <div
                  className={cn(
                    'rounded-xl px-3 py-2 text-xs ring-1',
                    dark ? 'bg-brand-500/15 text-brand-100 ring-brand-400/30' : 'bg-brand-50 text-brand-700 ring-brand-200',
                  )}
                >
                  {hint}
                </div>
              )}

              <button
                type="submit"
                className="w-full cursor-pointer rounded-xl bg-brand-600 py-3 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-brand-600/35 transition hover:bg-brand-700 active:scale-[0.99]"
              >
                Sign in
              </button>

              {/* or divider */}
              <div className={cn('flex items-center gap-3 text-[11px] font-semibold uppercase tracking-widest', dark ? 'text-white/40' : 'text-slate-400')}>
                <span className={cn('h-px flex-1', dark ? 'bg-white/15' : 'bg-slate-200')} />
                or
                <span className={cn('h-px flex-1', dark ? 'bg-white/15' : 'bg-slate-200')} />
              </div>

              {/* Demo access */}
              <button
                type="button"
                onClick={() => {
                  setHint('This is a demo — picking a role above pre-fills the right password automatically.');
                  setMenuOpen(true);
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border py-2.5 text-xs font-bold transition',
                  dark
                    ? 'border-white/20 bg-white/5 text-white hover:bg-white/10'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-brand-400 hover:text-brand-700',
                )}
              >
                <span aria-hidden>🎓</span> Use a demo account
              </button>
            </form>

            <div className={cn('mt-5 border-t pt-4 text-center text-[11px]', dark ? 'border-white/10 text-white/50' : 'border-slate-200 text-slate-500')}>
              Are you new?{' '}
              <Link to="/" className={cn('font-bold', dark ? 'text-brand-300 hover:text-brand-200' : 'text-brand-600 hover:underline')}>
                Explore the platform
              </Link>
              {' · '}
              <button
                type="button"
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="cursor-pointer hover:underline"
              >
                ↺ Reset demo
              </button>
            </div>
          </div>

          <p className="mx-auto mt-4 max-w-md text-center text-[11px] text-white/70 drop-shadow">
            Tip: the role dropdown pre-fills credentials — the eye icon reveals the password.
          </p>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSwitchToLogin={() => setShowForgotPassword(false)}
      />
      <HelpFaqModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
