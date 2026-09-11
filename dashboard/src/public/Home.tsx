import { Link } from "react-router-dom"
import useCatalog from "./hooks/useCatalog"
import { ExperienceGrid } from "./components/ExperienceCard"
import { CITIES, CATEGORIES } from "./data/catalog"

function categoryPath(category: string) {
  return "/" + category.toLowerCase().replace(/[^a-z0-9]+/g, "-")
}

export default function Home() {
  const { experiences, guides, loading, usingSeed } = useCatalog()
  const featured = [...experiences].sort((a, b) => b.rating - a.rating).slice(0, 6)
  const popular = [...experiences].sort((a, b) => b.reviews - a.reviews).slice(0, 3)

  return (
    <div>
      {/* Hero — rounded gradient panel with blur orbs (reference style) */}
      <section className="relative overflow-hidden rounded-b-[2.5rem] bg-gradient-to-br from-darkBlue via-[#2b4257] to-[#3a5a78] shadow-2xl shadow-darkBlue/20">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand-yellow/20 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            ✦ Experience Nepal with verified locals
          </span>
          <h1 className="mt-5 text-4xl font-black leading-[1.1] tracking-tight text-white md:text-5xl">
            Experience Nepal like a local
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/85">
            Heritage walks, food tours, cooking classes and mountain adventures — hosted by licensed local guides.
          </p>
          <form action="/search" className="mx-auto mt-8 flex max-w-xl gap-2 rounded-full bg-white/10 p-1.5 backdrop-blur">
            <input
              name="q"
              className="flex-1 rounded-full bg-white px-5 py-3 text-sm text-darkBlue focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              placeholder="Search tours, cities, food..."
            />
            <button className="rounded-full bg-brand-yellow px-6 py-3 text-sm font-bold text-darkBlue shadow-btn-yellow transition hover:bg-brand-500">
              Search
            </button>
          </form>
          <div className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-4">
            {[["500+", "Verified locals"], ["1,200+", "Tours listed"], ["4.9★", "Avg rating"]].map(([v, l]) => (
              <div key={l} className="rounded-2xl border border-white/15 bg-white/5 p-3 backdrop-blur">
                <div className="text-xl font-black text-white">{v}</div>
                <div className="mt-0.5 text-[11px] text-white/75">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">
        {/* Categories */}
        <section>
          <h2 className="text-xl font-semibold text-darkBlue mb-5">Browse by category</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((c) => {
              const count = experiences.filter((e) => e.category === c).length
              return (
                <Link key={c} to={categoryPath(c)} className="gn-card rounded-2xl border border-gray-200/70 p-6 transition hover:-translate-y-0.5 hover:shadow-card">
                  <div className="text-3xl">{c === "Food Tours" ? "🍲" : c === "Cultural Tours" ? "🏯" : c === "Outdoor Activities" ? "🏔️" : "🧭"}</div>
                  <div className="font-semibold text-darkBlue mt-3">{c}</div>
                  <div className="text-sm text-gray-500">{count} experiences</div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Featured */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-darkBlue">Featured experiences</h2>
            <Link to="/explore" className="text-sm font-semibold text-darkBlue hover:underline">See all →</Link>
          </div>
          {loading ? (
            <div className="text-gray-500 py-8 text-center">Loading experiences...</div>
          ) : (
            <ExperienceGrid items={featured} />
          )}
        </section>

        {/* Cities */}
        <section>
          <h2 className="text-xl font-semibold text-darkBlue mb-5">Explore cities</h2>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
            {CITIES.map((city) => (
              <Link key={city} to={`/city/${city.toLowerCase()}`} className="gn-card rounded-2xl border border-gray-200/70 p-6 text-center transition hover:-translate-y-0.5 hover:shadow-card">
                <div className="text-3xl">{city === "Kathmandu" ? "🏛️" : city === "Pokhara" ? "🏔️" : city === "Lalitpur" ? "🎨" : city === "Bhaktapur" ? "🧱" : "🌳"}</div>
                <div className="font-semibold text-darkBlue mt-2">{city}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Most popular strip */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-darkBlue">Most popular right now</h2>
            <Link to="/most-popular" className="text-sm font-semibold text-darkBlue hover:underline">See all →</Link>
          </div>
          {!loading && <ExperienceGrid items={popular} />}
        </section>

        {/* Guides */}
        <section>
          <h2 className="text-xl font-semibold text-darkBlue mb-5">Meet some local guides</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.slice(0, 3).map((g) => (
              <Link key={g.id} to={`/local/${g.id}`} className="gn-card rounded-2xl border border-gray-200/70 p-5 flex gap-4 transition hover:-translate-y-0.5 hover:shadow-card">
                <div className="h-14 w-14 rounded-full bg-brand-100 flex items-center justify-center text-2xl">🧭</div>
                <div>
                  <div className="font-semibold text-darkBlue">{g.name}</div>
                  <div className="text-xs text-gray-500">{g.city} · {g.languages.join(", ")}</div>
                  <div className="text-sm text-amber-500 mt-1">★ {g.rating.toFixed(1)} <span className="text-gray-400">({g.reviews} reviews)</span></div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {usingSeed && (
          <p className="text-xs text-center text-gray-400">
            Showing sample catalog (backend API not reachable).
          </p>
        )}
      </div>
    </div>
  )
}
