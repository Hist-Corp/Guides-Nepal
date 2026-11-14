import { useEffect, useState } from "react"
import PageShell from "../components/PageShell"
import Button from "../components/Button"
import HostGuideForm from "../components/HostGuideForm"
import HostGuideAssignments from "../components/HostGuideAssignments"
import {
  getHostExperienceGuides,
  getHostExperiences,
  getHostGuides,
} from "../services/hostGuidesApi"
import { Users, Plus, UserPlus } from "lucide-react"

export default function HostGuides() {
  const [guides, setGuides] = useState<any[]>([])
  const [experiences, setExperiences] = useState<any[]>([])
  const [assigned, setAssigned] = useState<Record<number, any[]>>({})
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")

  const load = async () => {
    try {
      const [guideRows, experienceRows] = await Promise.all([getHostGuides(), getHostExperiences()])
      setGuides(Array.isArray(guideRows) ? guideRows : [])
      setExperiences(Array.isArray(experienceRows) ? experienceRows : [])
      const map: Record<number, any[]> = {}
      for (const experience of experienceRows ?? []) {
        try {
          map[experience.id] = await getHostExperienceGuides(experience.id)
        } catch {
          map[experience.id] = []
        }
      }
      setAssigned(map)
    } catch {
      setError("Unable to load your guides. Please sign in again.")
    }
  }
  useEffect(() => { load() }, [])

  const activeCount = guides.filter((g) => g.status === "active").length

  return (
    <PageShell
      title="Your guides"
      description="Add guides with the same details as frontend registration, then assign them to your experiences. Assigned guides appear on traveler search and experience pages."
      action={
        <Button onClick={() => setShowForm((v) => !v)} icon={showForm ? undefined : <Plus className="h-4 w-4" />}>
          {showForm ? "Close form" : "Add guide"}
        </Button>
      }
    >
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {/* Stats bar */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center gap-2 text-soft">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Total guides</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-main">{guides.length}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center gap-2 text-soft">
            <UserPlus className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Active</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-center gap-2 text-soft">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Experiences</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-main">{experiences.length}</p>
        </div>
      </div>

      {showForm && <HostGuideForm onCreated={async () => { setShowForm(false); await load() }} onError={setError} />}
      <HostGuideAssignments guides={guides} experiences={experiences} assigned={assigned} reload={load} onError={setError} />
    </PageShell>
  )
}
