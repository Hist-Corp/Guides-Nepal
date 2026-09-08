import { useParams, Link } from "react-router-dom"
import useCatalog from "./hooks/useCatalog"
import { ExperienceGrid } from "./components/ExperienceCard"
import { CITIES } from "./data/catalog"

const CITY_META: Record<string, { tagline: string; emoji: string; about: string }> = {
  Kathmandu: { tagline: "Temples, stupas & street food", emoji: "🏛️", about: "Nepal's capital is a living museum of medieval palaces, beating bazaars and Himalayan panoramas." },
  Pokhara: { tagline: "Lakes, mountains & adventure", emoji: "🚤", about: "Nestled beneath the Annapurnas on Phewa Lake, Pokhara is the launchpad for treks and lazy lakeside evenings." },
  Lalitpur: { tagline: "Artisan quarters & Newar culture", emoji: "🏯", about: "Patan, as locals call it, is famed for its Durbar Square, golden temples and metalworking artisans." },
  Bhaktapur: { tagline: "Medieval city of devotees", emoji: "🛕", about: "A preserved medieval city of brick lanes, pottery squares and the best juju dhau (king curd) in Nepal." },
  Bharatpur: { tagline: "Gateway to Chitwan", emoji: "🐘", about: "Riverside city near Chitwan National Park, home to Tharu culture and jungle safaris." },
}

export default function CityPage() {
  const { cityId } = useParams()
  const name = (cityId ?? "").toLowerCase()
  const matched = CITIES.find((c) => c.toLowerCase() === name)
  const { experiences, loading } = useCatalog()
  const cityExp = matched ? experiences.filter((e) => e.city === matched) : []
  const meta = matched ? CITY_META[matched] : undefined

  if (matched && !meta) {
    // City recognized but no metadata — fall through to generic render below
  }

  return (
    <div>
      <div className="bg-gradient-to-br from-lightBlue/60 to-peach/40">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <div className="text-6xl">{meta?.emoji ?? "🗺️"}</div>
          <h1 className="text-3xl md:text-4xl font-bold text-darkBlue mt-2">
            Discover {matched ?? (cityId || "Nepal")}
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            {meta?.about ?? "Explore experiences, guides and hidden gems in this region of Nepal."}
          </p>
          {matched && (
            <Link
              to={`/city/${matched.toLowerCase()}/experiences`}
              className="inline-block mt-5 rounded-xl px-5 py-2.5 bg-darkBlue text-white font-semibold hover:opacity-90"
            >
              See all {matched} experiences ({cityExp.length})
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          <div className="text-gray-500 py-8 text-center">Loading experiences...</div>
        ) : (
          <ExperienceGrid items={cityExp} />
        )}
        {!matched && (
          <div className="mt-8 flex flex-wrap gap-3">
            {CITIES.map((c) => (
              <Link key={c} to={`/city/${c.toLowerCase()}`} className="rounded-full border bg-white px-4 py-1.5 text-sm text-gray-600 hover:border-darkBlue">
                {CITY_META[c]?.emoji} {c}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
