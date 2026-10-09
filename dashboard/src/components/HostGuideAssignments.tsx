import { useState } from "react"
import Button from "./Button"
import {
  assignHostExperienceGuide,
  reactivateHostGuide,
  suspendHostGuide,
  unassignHostExperienceGuide,
} from "../services/hostGuidesApi"

export default function HostGuideAssignments({ guides, experiences, assigned, reload, onError }: {
  guides: any[]; experiences: any[]; assigned: Record<number, any[]>; reload: () => void; onError: (msg: string) => void;
}) {
  const [pick, setPick] = useState<Record<number, string>>({})
  const active = guides.filter((g) => g.status === "active")

  const toggle = async (guide: any) => {
    try {
      if (guide.status === "active") await suspendHostGuide(guide.id)
      else await reactivateHostGuide(guide.id)
      await reload()
    } catch (e: any) { onError(e?.response?.data?.detail || "Unable to update guide status.") }
  }

  const assign = async (experienceId: number) => {
    const guideId = Number(pick[experienceId])
    if (!guideId) { onError("Select a guide to assign."); return }
    try {
      await assignHostExperienceGuide(experienceId, { guide_id: guideId, is_primary: true })
      setPick((c) => ({ ...c, [experienceId]: "" }))
      await reload()
    } catch (e: any) { onError(e?.response?.data?.detail || "Unable to assign guide.") }
  }

  const unassign = async (experienceId: number, guideId: number) => {
    try { await unassignHostExperienceGuide(experienceId, guideId); await reload() }
    catch (e: any) { onError(e?.response?.data?.detail || "Unable to remove assignment.") }
  }

  return (
    <>
      {guides.length === 0 ? (
        <p className="text-soft">You have not added any guides yet.</p>
      ) : (
        <div className="mb-8 space-y-3">
          {guides.map((guide) => (
            <div key={guide.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
              <div className="flex items-center gap-3">
                {guide.image && <img src={guide.image} alt={guide.full_name} className="h-10 w-10 rounded-full object-cover" />}
                <div>
                  <h3 className="font-semibold text-main">{guide.full_name}
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${guide.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{guide.status}</span>
                  </h3>
                  <p className="text-sm text-soft">{guide.role_title} · {(guide.languages ?? []).join(", ")} · {(guide.cities ?? []).join(", ")}</p>
                  <p className="text-xs text-soft">{guide.email} · {guide.phone} · NIN {guide.nin_number}</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => toggle(guide)}>{guide.status === "active" ? "Suspend" : "Reactivate"}</Button>
            </div>
          ))}
        </div>
      )}
      <div className="text-lg font-semibold text-darkBlue">Experience assignments</div>
      <p className="mb-3 text-sm text-soft">The primary guide is shown on traveler search cards and the experience detail page.</p>
      <div className="space-y-3">
        {experiences.map((experience) => (
          <div key={experience.id} className="rounded-2xl border border-line bg-surface p-4">
            <h3 className="font-semibold text-main">{experience.title}</h3>
            <p className="text-sm text-soft">{experience.city} · {experience.category}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(assigned[experience.id] ?? []).map((row: any) => (
                <span key={row.guide_id} className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  {row.guide?.name} {row.is_primary && "· primary"}
                  <button className="text-red-600" onClick={() => unassign(experience.id, row.guide_id)}>✕</button>
                </span>
              ))}
              {(assigned[experience.id] ?? []).length === 0 && <span className="text-xs text-soft">No guide assigned yet.</span>}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select className="rounded-lg border px-3 py-2 text-sm" value={pick[experience.id] ?? ""} onChange={(e) => setPick((c) => ({ ...c, [experience.id]: e.target.value }))}>
                <option value="">Select guide…</option>
                {active.map((guide: any) => (
                  <option key={guide.guide_id} value={guide.guide_id}>{guide.full_name} — {guide.role_title}</option>
                ))}
              </select>
              <Button size="sm" onClick={() => assign(experience.id)}>Assign guide</Button>
            </div>
          </div>
        ))}
        {experiences.length === 0 && <p className="text-sm text-soft">Create an experience first, then assign a guide to it.</p>}
      </div>
    </>
  )
}
