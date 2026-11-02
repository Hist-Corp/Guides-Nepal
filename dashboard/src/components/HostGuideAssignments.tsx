import { useState } from "react"
import Button from "./Button"
import { assignHostExperienceGuide, reactivateHostGuide, suspendHostGuide, unassignHostExperienceGuide } from "../services/hostGuidesApi"
import { Users, MapPin, Check, X as XIcon, UserPlus, ChevronDown } from "lucide-react"

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
    } catch (e: any) { onError((() => { const _d = e?.response?.data?.detail; return typeof _d === "string" ? _d : (Array.isArray(_d) ? _d.map((x: any) => (typeof x === "string" ? x : x?.msg || JSON.stringify(x))).join(" ") : (_d && typeof _d === "object" ? (_d.msg || JSON.stringify(_d)) : "Unable to update guide status.")); })()) }
  }

  const assign = async (experienceId: number) => {
    const guideId = Number(pick[experienceId])
    if (!guideId) { onError("Select a guide to assign."); return }
    try {
      await assignHostExperienceGuide(experienceId, { guide_id: guideId, is_primary: true })
      setPick((c) => ({ ...c, [experienceId]: "" }))
      await reload()
    } catch (e: any) { onError((() => { const _d = e?.response?.data?.detail; return typeof _d === "string" ? _d : (Array.isArray(_d) ? _d.map((x: any) => (typeof x === "string" ? x : x?.msg || JSON.stringify(x))).join(" ") : (_d && typeof _d === "object" ? (_d.msg || JSON.stringify(_d)) : "Unable to assign guide.")); })()) }
  }

  const unassign = async (experienceId: number, guideId: number) => {
    try { await unassignHostExperienceGuide(experienceId, guideId); await reload() }
    catch (e: any) { onError((() => { const _d = e?.response?.data?.detail; return typeof _d === "string" ? _d : (Array.isArray(_d) ? _d.map((x: any) => (typeof x === "string" ? x : x?.msg || JSON.stringify(x))).join(" ") : (_d && typeof _d === "object" ? (_d.msg || JSON.stringify(_d)) : "Unable to remove assignment.")); })()) }
  }

  return (
    <div className="space-y-8">
      {/* Guides list */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-bold text-main">Your guides</h2>
          <span className="ml-auto rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-soft">{guides.length} total</span>
        </div>
        {guides.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface-2/50 p-8 text-center">
            <UserPlus className="mx-auto h-10 w-10 text-soft/50" />
            <p className="mt-3 text-sm font-medium text-soft">You have not added any guides yet.</p>
            <p className="mt-1 text-xs text-soft/70">Click "Add guide" above to create your first guide account.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {guides.map((guide) => (
              <div key={guide.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 transition-shadow hover:shadow-md">
                <div className="flex items-center gap-4">
                  {guide.image ? (
                    <img src={guide.image} alt={guide.full_name} className="h-12 w-12 rounded-full object-cover ring-2 ring-brand-100" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold">
                      {(guide.full_name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-main">
                      {guide.full_name}
                      <span className={`ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${guide.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${guide.status === "active" ? "bg-green-500" : "bg-yellow-500"}`} />
                        {guide.status}
                      </span>
                    </h3>
                    <p className="text-sm text-soft">{guide.role_title} · {(guide.languages ?? []).join(", ")} · {(guide.cities ?? []).join(", ")}</p>
                    <p className="text-xs text-soft/70">{guide.email} · {guide.phone} · NIN {guide.nin_number}</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => toggle(guide)}>
                  {guide.status === "active" ? "Suspend" : "Reactivate"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Experience assignments */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-bold text-main">Experience assignments</h2>
        </div>
        <p className="mb-4 text-sm text-soft">The primary guide is shown on traveler search cards and the experience detail page.</p>
        <div className="space-y-4">
          {experiences.map((experience) => (
            <div key={experience.id} className="rounded-2xl border border-line bg-surface p-5 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-main">{experience.title}</h3>
                  <p className="text-sm text-soft">{experience.city} · {experience.category}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(assigned[experience.id] ?? []).map((row: any) => (
                  <span key={row.guide_id} className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 ring-1 ring-green-200">
                    <Check className="h-3 w-3" />
                    {row.guide?.name} {row.is_primary && "· primary"}
                    <button className="ml-1 text-red-500 hover:text-red-700" onClick={() => unassign(experience.id, row.guide_id)}>
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
                {(assigned[experience.id] ?? []).length === 0 && (
                  <span className="text-xs text-soft/70 italic">No guide assigned yet.</span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px] flex-1">
                  <select
                    className="w-full appearance-none rounded-lg border border-line bg-surface px-4 py-2 pr-9 text-sm font-medium text-main shadow-sm transition-colors hover:border-brand-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
                    value={pick[experience.id] ?? ""}
                    onChange={(e) => setPick((c) => ({ ...c, [experience.id]: e.target.value }))}
                  >
                  <option value="">Select guide…</option>
                  {active.map((guide: any) => (
                    <option key={guide.guide_id} value={guide.guide_id}>{guide.full_name} — {guide.role_title}</option>
                  ))}
                </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soft" />
                </div>
                <Button size="sm" onClick={() => assign(experience.id)} icon={<UserPlus className="h-3.5 w-3.5" />}>
                  Assign guide
                </Button>
              </div>
            </div>
          ))}
          {experiences.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line bg-surface-2/50 p-6 text-center text-sm text-soft">
              Create an experience first, then assign a guide to it.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
