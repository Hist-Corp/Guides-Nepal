import { useParams, Link } from "react-router-dom"
import useCatalog from "./hooks/useCatalog"
import { ExperienceGrid } from "./components/ExperienceCard"
import { CITIES } from "./data/catalog"

export default function CityExperiences() {
  const { cityId } = useParams()
  const matched = CITIES.find((c) => c.toLowerCase() === (cityId ?? "").toLowerCase())
  const { experiences, loading } = useCatalog()
  const items = matched ? experiences.filter((e) => e.city === matched) : experiences

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <nav className="text-sm text-gray-500 mb-2">
        <Link to="/" className="hover:text-darkBlue">Home</Link> / <Link to={`/city/${cityId ?? ""}`} className="hover:text-darkBlue">{matched ?? cityId}</Link> / <span className="text-gray-700">Experiences</span>
      </nav>
      <h1 className="text-3xl font-bold text-darkBlue">Experiences in {matched ?? cityId}</h1>
      <p className="text-gray-500 mt-1">{items.length} experience(s) available.</p>
      <div className="mt-8">
        {loading ? (
          <div className="text-gray-500 py-8 text-center">Loading experiences...</div>
        ) : (
          <ExperienceGrid items={items} />
        )}
      </div>
    </div>
  )
}
