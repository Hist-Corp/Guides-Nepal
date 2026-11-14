import { useState } from "react"
import ExperienceReviewPanel from "../components/ExperienceReviewPanel"
import GuideApplicationsPanel from "../components/GuideApplicationsPanel"

/**
 * Regional review workspace for guide applications and experience proposals.
 */
export default function RegionalExperienceReview() {
  const [view, setView] = useState<"guides" | "experiences">("guides")

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setView("guides")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            view === "guides" ? "bg-darkBlue text-white" : "border bg-white text-gray-600"
          }`}
        >
          Guide Applications
        </button>
        <button
          type="button"
          onClick={() => setView("experiences")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            view === "experiences" ? "bg-darkBlue text-white" : "border bg-white text-gray-600"
          }`}
        >
          Experience Reviews
        </button>
      </div>
      {view === "guides" ? (
        <GuideApplicationsPanel />
      ) : (
        <ExperienceReviewPanel scope="both" />
      )}
    </div>
  )
}
