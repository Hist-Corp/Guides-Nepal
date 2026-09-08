import { useParams, Link } from "react-router-dom"
import useCatalog from "./hooks/useCatalog"
import { ExperienceGrid } from "./components/ExperienceCard"

export default function LocalProfile() {
  const { id } = useParams()
  const { guides, experiences, loading } = useCatalog()
  const guide = guides.find((g) => String(g.id) === id)
  const theirExperiences = guide ? experiences.filter((e) => e.city === guide.city).slice(0, 3) : []

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-500">Loading guide profile...</div>

  if (!guide) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl">👤</div>
        <h1 className="text-xl font-semibold text-darkBlue mt-4">Guide not found</h1>
        <p className="text-gray-500 mt-2">This local guide may no longer be active.</p>
        <Link to="/explore" className="inline-block mt-6 rounded-lg px-5 py-2 bg-darkBlue text-white font-semibold">Browse experiences</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="rounded-2xl bg-white border border-gray-200 p-8 flex flex-col sm:flex-row gap-6">
        <div className="h-24 w-24 rounded-full bg-lightBlue flex items-center justify-center text-5xl shrink-0">👤</div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-darkBlue">{guide.name}</h1>
          <div className="text-gray-500 text-sm mt-1">📍 {guide.city} · 🗣️ {guide.languages.join(", ")} · 🗓️ {guide.yearsExperience} years of experience</div>
          <div className="text-amber-500 mt-2">★ {guide.rating.toFixed(1)} <span className="text-gray-400">({guide.reviews} reviews)</span></div>
          <p className="text-gray-600 mt-4 leading-relaxed">{guide.bio}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-darkBlue mt-10 mb-4">Experiences in {guide.city}</h2>
      <ExperienceGrid items={theirExperiences} />
    </div>
  )
}
