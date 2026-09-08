import { Link, NavLink, Outlet } from "react-router-dom"
import { CITIES, CATEGORIES } from "../data/catalog"

function categoryPath(category: string) {
  return "/" + category.toLowerCase().replace(/[^a-z0-9]+/g, "-")
}

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-darkBlue">
            <span className="h-8 w-8 rounded-full bg-brand-yellow flex items-center justify-center">🇳🇵</span>
            Guides Nepal
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <NavLink to="/" end className={({ isActive }) => isActive ? "font-semibold text-darkBlue" : "text-gray-600 hover:text-darkBlue"}>Home</NavLink>
            <NavLink to="/explore" className={({ isActive }) => isActive ? "font-semibold text-darkBlue" : "text-gray-600 hover:text-darkBlue"}>Explore</NavLink>
            {CATEGORIES.slice(0, 3).map((c) => (
              <NavLink key={c} to={categoryPath(c)} className={({ isActive }) => isActive ? "font-semibold text-darkBlue" : "text-gray-600 hover:text-darkBlue"}>
                {c.replace(" Activities", "")}
              </NavLink>
            ))}
            <NavLink to="/most-popular" className={({ isActive }) => isActive ? "font-semibold text-darkBlue" : "text-gray-600 hover:text-darkBlue"}>Most Popular</NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/dashboard" className="rounded-lg px-4 py-2 bg-darkBlue text-white text-sm font-semibold hover:opacity-90">
              Sign in
            </Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-2 hidden lg:flex gap-4 text-xs text-gray-500">
          <span className="font-semibold">Cities:</span>
          {CITIES.map((city) => (
            <Link key={city} to={`/city/${city.toLowerCase()}`} className="hover:text-darkBlue">{city}</Link>
          ))}
          <Link to="/food-tours" className="hover:text-darkBlue">Food Tours</Link>
          <Link to="/cooking-classes" className="hover:text-darkBlue">Cooking Classes</Link>
          <Link to="/real-good-travel" className="hover:text-darkBlue">Real Good Travel</Link>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-darkBlue text-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="font-bold text-lg mb-2">Guides Nepal</div>
            <p className="text-white/70">Authentic experiences across Nepal, hosted by local guides.</p>
          </div>
          <div>
            <div className="font-semibold mb-2">Explore</div>
            <ul className="space-y-1 text-white/70">
              <li><Link to="/explore" className="hover:text-white">All experiences</Link></li>
              <li><Link to="/most-popular" className="hover:text-white">Most popular</Link></li>
              <li><Link to="/most-delicious" className="hover:text-white">Most delicious</Link></li>
              <li><Link to="/search" className="hover:text-white">Search</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Categories</div>
            <ul className="space-y-1 text-white/70">
              {CATEGORIES.map((c) => (
                <li key={c}><Link to={categoryPath(c)} className="hover:text-white">{c}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Cities</div>
            <ul className="space-y-1 text-white/70">
              {CITIES.map((city) => (
                <li key={city}><Link to={`/city/${city.toLowerCase()}`} className="hover:text-white">{city}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
          © {new Date().getFullYear()} Guides Nepal. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
