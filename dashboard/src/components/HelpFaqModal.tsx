import { useTheme } from '../hooks/useTheme';
import { cn } from '../utils/cn';

/**
 * Help & FAQ dialog — mirrors the reference login's "Help & FAQ" entry.
 * Shared between the sign-in page and the in-dashboard topbar.
 */
export default function HelpFaqModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  if (!open) return null;
  const faqs = [
    { q: 'How do I pick the right console?', a: 'Use the “Sign in as” dropdown — it pre-fills the matching demo credentials for each of the 7 role consoles.' },
    { q: 'Which roles can sign in here?', a: 'Super Admin, Admin, Content Writer, Regional Head, Customer Support, Host and Guide — each gets its own console.' },
    { q: 'Is booking data live?', a: 'The dashboards read from the Guides Nepal API where configured; demo content runs fully in your browser.' },
    { q: 'Need more help?', a: 'Reach the support console from inside any dashboard, or email support@guides-nepal.com.' },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'animate-pop w-full max-w-lg rounded-2xl border p-5 shadow-2xl',
          dark ? 'border-white/15 bg-slate-900' : 'border-slate-200 bg-white',
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className={cn('text-lg font-black tracking-tight', dark ? 'text-white' : 'text-slate-900')}>
              Help &amp; FAQ
            </h3>
            <p className={cn('mt-0.5 text-xs', dark ? 'text-white/60' : 'text-slate-500')}>
              Quick answers about the Guides Nepal console.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close help"
            className={cn(
              'cursor-pointer rounded-full border px-2.5 py-1 text-xs font-semibold transition',
              dark ? 'border-white/20 text-white/70 hover:bg-white/10 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800',
            )}
          >
            ✕
          </button>
        </div>
        <div className="mt-4 space-y-2.5">
          {faqs.map((f) => (
            <div
              key={f.q}
              className={cn(
                'rounded-xl px-3.5 py-2.5 ring-1',
                dark ? 'bg-white/5 ring-white/10' : 'bg-slate-50 ring-slate-200',
              )}
            >
              <div className={cn('text-sm font-bold', dark ? 'text-brand-300' : 'text-brand-700')}>{f.q}</div>
              <div className={cn('mt-0.5 text-xs leading-relaxed', dark ? 'text-slate-300' : 'text-slate-600')}>{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
