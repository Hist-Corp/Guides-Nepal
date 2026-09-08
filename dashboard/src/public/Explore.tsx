import { useState } from "react"
import useCatalog from "./hooks/useCatalog"
import { ExperienceGrid } from "./components/ExperienceCard"
import { CITIES, CATEGORIES } from "./data/catalog"

export default function Explore() {
  const { experiences, loading } = useCatalog()
  const [city, setCity] = useState("All")
  const [category, setCategory] = useState("All")

  const filtered = experiences.filter(
    (e) => (city === "All" || e.city === city) && (category === "All" || e.category === category)
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-darkBlue">Explore experiences</h1>
      <p className="text-gray-500 mt-1">Browse every experience hosted by local guides across Nepal.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {["All", ...CITIES].map((c) => (
          <button
            key={c}
            onClick={() => setCity(c)}
            className={`rounded-full px-4 py-1.5 text-sm border ${city === c ? "bg-darkBlue text-white border-darkBlue" : "bg-white text-gray-600 hover:border-darkBlue"}`}
          >
            {c === "All" ? "All cities" : c}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-4 py-1.5 text-sm border ${category === c ? "bg-brand-yellow text-darkBlue border-brand-yellow font-semibold" : "bg-white text-gray-600 hover:border-brand-yellow"}`}
          >
            {c === "All" ? "All categories" : c}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="text-gray-500 py-8 text-center">Loading experiences...</div>
        ) : (
          <ExperienceGrid items={filtered} />
        )}
      </div>
    </div>
  )
}
