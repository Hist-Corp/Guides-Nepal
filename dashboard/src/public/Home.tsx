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
      {/* Hero */}
      <section className="bg-gradient-to-br from-darkBlue to-[#3a5a78] text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Experience Nepal like a local</h1>
          <p className="mt-4 text-white/80 max-w-2xl mx-auto">
            Heritage walks, food tours, cooking classes and mountain adventures — hosted by licensed local guides.
          </p>
          <form action="/search" className="mt-8 max-w-xl mx-auto flex gap-2">
            <input
              name="q"
              className="flex-1 rounded-full px-5 py-3 text-darkBlue bg-white focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              placeholder="Search tours, cities, food..."
            />
            <button className="rounded-full px-6 py-3 bg-brand-yellow text-darkBlue font-semibold hover:opacity-90">
              Search
            </button>
          </form>
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
                <Link key={c} to={categoryPath(c)} className="rounded-2xl bg-white border border-gray-200 p-6 hover:shadow-md transition">
                  <div className="text-3xl">{c === "Food Tours" ? "??" : c === "Cultural Tours" ? "???" : c === "Outdoor Activities" ? "??" : "?????"}</div>
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
            <Link to="/explore" className="text-sm text-darkBlue hover:underline">See all ?</Link>
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
              <Link key={city} to={`/city/${city.toLowerCase()}`} className="rounded-2xl bg-white border border-gray-200 p-6 text-center hover:shadow-md transition">
                <div className="text-3xl">{city === "Kathmandu" ? "???" : city === "Pokhara" ? "??" : city === "Lalitpur" ? "??" : city === "Bhaktapur" ? "??" : "??"}</div>
                <div className="font-semibold text-darkBlue mt-2">{city}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Most popular strip */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-darkBlue">Most popular right now</h2>
            <Link to="/most-popular" className="text-sm text-darkBlue hover:underline">See all ?</Link>
          </div>
          {!loading && <ExperienceGrid items={popular} />}
        </section>

        {/* Guides */}
        <section>
          <h2 className="text-xl font-semibold text-darkBlue mb-5">Meet some local guides</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.slice(0, 3).map((g) => (
              <Link key={g.id} to={`/local/${g.id}`} className="rounded-2xl bg-white border border-gray-200 p-5 flex gap-4 hover:shadow-md transition">
                <div className="h-14 w-14 rounded-full bg-lightBlue flex items-center justify-center text-2xl">??</div>
                <div>
                  <div className="font-semibold text-darkBlue">{g.name}</div>
                  <div className="text-xs text-gray-500">{g.city} · {g.languages.join(", ")}</div>
                  <div className="text-sm text-amber-500 mt-1">? {g.rating.toFixed(1)} <span className="text-gray-400">({g.reviews} reviews)</span></div>
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
