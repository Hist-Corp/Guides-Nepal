import { useParams } from "react-router-dom"
import useCatalog from "./hooks/useCatalog"
import { ExperienceGrid } from "./components/ExperienceCard"

const CATEGORY_MAP: Record<string, string> = {
  "most-popular": "most-popular",
  "most-delicious": "most-delicious",
  "real-good-travel": "real-good-travel",
  "food-tours": "Food Tours",
  "cultural-tours": "Cultural Tours",
  "outdoor-activities": "Outdoor Activities",
  "cooking-classes": "Cooking Classes",
}

const TITLES: Record<string, { title: string; blurb: string }> = {
  "most-popular": { title: "Most Popular", blurb: "The experiences travelers book again and again." },
  "most-delicious": { title: "Most Delicious", blurb: "Food tours and cooking classes loved by foodies." },
  "real-good-travel": { title: "Real Good Travel", blurb: "Curated stories and tips for traveling well in Nepal." },
}

export default function CategoryPage({ slugKey }: { slugKey?: string }) {
  const params = useParams()
  const key = slugKey ?? (params as any)["*"] ?? ""
  const { experiences, loading } = useCatalog()
  const mapped = CATEGORY_MAP[key]

  let items = experiences
  if (mapped === "most-popular") items = [...experiences].sort((a, b) => b.reviews - a.reviews)
  else if (mapped === "most-delicious" || mapped === "real-good-travel")
    items = experiences.filter((e) => e.category === "Food Tours" || e.category === "Cooking Classes")
  else if (mapped) items = experiences.filter((e) => e.category === mapped)

  const meta = TITLES[key] ?? { title: mapped ?? "Experiences", blurb: "Browse experiences on Guides Nepal." }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-darkBlue">{meta.title}</h1>
      <p className="text-gray-500 mt-1">{meta.blurb}</p>
      <div className="mt-8">
        {loading ? (
          <div className="text-gray-500 py-8 text-center">Loading...</div>
        ) : (
          <ExperienceGrid items={items} />
        )}
      </div>
    </div>
  )
}
