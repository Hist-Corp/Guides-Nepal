import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 text-center"><div className="max-w-lg"><p className="text-6xl font-black text-brand-yellow">404</p><h1 className="mt-3 text-3xl font-bold text-slate-900">This page got lost in the mountains</h1><p className="mt-4 text-gray-600">The page you are looking for may have moved or no longer exists.</p><div className="mt-8 flex justify-center gap-3"><Link to="/" className="rounded-full bg-[#213448] px-5 py-3 text-sm font-semibold text-white">Go home</Link><Link to="/search" className="rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-slate-700">Explore experiences</Link></div></div></div>;
}
