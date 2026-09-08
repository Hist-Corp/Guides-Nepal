import { useSearchParams, Link } from "react-router-dom"
import useCatalog from "./hooks/useCatalog"
import { ExperienceGrid } from "./components/ExperienceCard"

export default function Search() {
  const [params] = useSearchParams()
  const q = (params.get("q") ?? "").toLowerCase()
  const { experiences, guides, loading } = useCatalog()

  const matched = experiences.filter(
    (e) =>
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.city.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
  )
  const matchedGuides = guides.filter(
    (g) => !q || g.name.toLowerCase().includes(q) || g.city.toLowerCase().includes(q)
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-darkBlue">Search</h1>
      <form className="mt-4 flex gap-2 max-w-xl">
        <input
          name="q"
          defaultValue={params.get("q") ?? ""}
          className="flex-1 rounded-full border px-5 py-3 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          placeholder="Search experiences, cities, guides..."
        />
        <button className="rounded-full px-6 py-3 bg-brand-yellow text-darkBlue font-semibold hover:opacity-90">Search</button>
      </form>

      {q && (
        <p className="mt-4 text-sm text-gray-500">
          {matched.length} experience(s) and {matchedGuides.length} guide(s) matching "<span className="font-semibold">{q}</span>"
        </p>
      )}

      <div className="mt-8 space-y-10">
        {loading ? (
          <div className="text-gray-500 py-8 text-center">Searching...</div>
        ) : (
          <>
            <section>
              <h2 className="text-xl font-bold text-darkBlue mb-4">Experiences</h2>
              <ExperienceGrid items={matched} />
            </section>
            {matchedGuides.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-darkBlue mb-4">Guides</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {matchedGuides.map((g) => (
                    <Link key={g.id} to={`/local/${g.id}`} className="rounded-2xl bg-white border border-gray-200 p-5 hover:shadow-md transition">
                      <div className="font-semibold text-darkBlue">{g.name}</div>
                      <div className="text-xs text-gray-500">{g.city} · {g.languages.join(", ")}</div>
                      <div className="text-sm text-amber-500 mt-1">★ {g.rating.toFixed(1)}</div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
