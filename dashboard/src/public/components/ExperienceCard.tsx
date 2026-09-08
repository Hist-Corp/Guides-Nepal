import { Link } from "react-router-dom"
import type { PublicExperience } from "../data/catalog"

function expPath(e: PublicExperience) {
  return `/city/${e.city.toLowerCase()}/experience/${e.slug}`
}

export function ExperienceCard({ exp }: { exp: PublicExperience }) {
  return (
    <Link
      to={expPath(exp)}
      className="group rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition"
    >
      <div className="h-36 flex items-center justify-center text-5xl bg-gradient-to-br from-lightBlue/60 to-peach/40">
        {exp.image}
      </div>
      <div className="p-4">
        <div className="text-xs text-gray-500 uppercase tracking-wide">{exp.category} · {exp.city}</div>
        <div className="font-semibold text-darkBlue mt-1 group-hover:underline">{exp.title}</div>
        <div className="flex items-center justify-between mt-2 text-sm">
          <span className="text-amber-500">★ {exp.rating.toFixed(1)} <span className="text-gray-400">({exp.reviews})</span></span>
          <span className="font-bold text-darkBlue">${exp.price} <span className="text-xs text-gray-400 font-normal">/ person · {exp.duration}</span></span>
        </div>
      </div>
    </Link>
  )
}

export function ExperienceGrid({ items }: { items: PublicExperience[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
        No experiences found. Try a different filter or search.
      </div>
    )
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((e) => <ExperienceCard key={`${e.id}-${e.slug}`} exp={e} />)}
    </div>
  )
}

export default ExperienceCard
