import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCookieConsent, saveCookieConsent } from '../../utils/analytics';

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  useEffect(() => { if (!getCookieConsent()) setOpen(true); }, []);
  if (!open) return null;
  const save = () => { saveCookieConsent({ analytics, marketing }); setOpen(false); };
  return <aside role="dialog" aria-label="Cookie preferences" className="fixed z-[100] inset-x-0 bottom-0 p-4 sm:p-6 bg-slate-950 text-white shadow-2xl"><div className="mx-auto max-w-5xl flex flex-col gap-4 lg:flex-row lg:items-center"><div className="flex-1 text-sm"><strong className="block text-base">Your privacy choices</strong><p className="mt-1 text-slate-300">We use necessary cookies to run the site. With permission, analytics and marketing cookies help us improve Guides Nepal. <Link to="/privacy" className="underline">Privacy Policy</Link></p></div><div className="flex flex-wrap items-center gap-3 text-sm"><label className="inline-flex items-center gap-2"><input type="checkbox" checked onChange={() => undefined} disabled /> Necessary</label><label className="inline-flex items-center gap-2"><input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} /> Analytics</label><label className="inline-flex items-center gap-2"><input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} /> Marketing</label><button onClick={save} className="rounded-full bg-brand-yellow px-4 py-2 font-semibold text-slate-950">Save choices</button><Link to="/consent" className="underline">Manage</Link></div></div></aside>;
}
