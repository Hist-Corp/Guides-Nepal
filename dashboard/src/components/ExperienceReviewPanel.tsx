import { useEffect, useState } from "react"
import { ChevronDown, X } from "lucide-react"
import {
  decideChangeRequest,
  decideProposal,
  getChangeRequestQueue,
  getProposalQueue,
  updateProposal,
} from "../services/api"

type DecisionAction = "approve" | "request_changes" | "reject"

function badge(status: string) {
  const styles: Record<string, string> = {
    submitted: "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-700",
    changes_requested: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
    published: "bg-emerald-100 text-emerald-800",
    applied: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-gray-200 text-gray-500",
  }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status.replace("_", " ")}
    </span>
  )
}

function fmtDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString() : "—"
}

/** One reviewable row: details, notes editor and the gate decision buttons. */
function ReviewCard({
  item,
  kind,
  onDecided,
  isEditing,
  onEdit,
}: {
  item: any
  kind: "proposal" | "change-request"
  onDecided: (action: DecisionAction, notes: string) => Promise<void>
  isEditing: boolean
  onEdit: () => void
}) {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const decide = async (action: DecisionAction) => {
    if ((action === "request_changes" || action === "reject") && !notes.trim()) {
      setError("Please add a note — it is required for this decision.")
      return
    }
    setBusy(true)
    setError(null)
    try {
      await onDecided(action, notes.trim())
      setOpen(false)
      setNotes("")
    } catch (e: any) {
      (() => { const _d = e?.response?.data?.detail; const _m = typeof _d === 'string' ? _d : (Array.isArray(_d) ? _d.map((x: any) => (typeof x === 'string' ? x : x?.msg || JSON.stringify(x))).join(' ') : (_d && typeof _d === 'object' ? (_d.msg || JSON.stringify(_d)) : null)); setError(_m || "Action failed"); })()
    } finally {
      setBusy(false)
    }
  }

  const title = kind === "proposal" ? item.title : item.listing_title ?? `Listing #${item.listing_id}`
  const submitter = item.guide_name || item.guide_email || "—"

  return (
    <div className="rounded-2xl bg-white border">
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase text-gray-500">
              {kind === "proposal"
                ? `${item.category} · ${item.city}${item.area ? ` · ${item.area}` : ""}`
                : `${item.change_class} change · ${(item.changes ?? []).length} field(s)`}
            </div>
            <div className="mt-1 font-semibold text-darkBlue">{title}</div>
            <div className="mt-1 text-xs text-gray-500">
              From {submitter} · Submitted {fmtDate(item.submitted_at)}
            </div>
          </div>
          {badge(item.status)}
        </div>
      </button>


      {open && (
        <div className="border-t px-4 py-3 space-y-3 text-sm">
          {kind === "proposal" ? (
            <div className="space-y-2 text-gray-700">
              <p><span className="font-semibold">Duration:</span> {item.duration} · <span className="font-semibold">Difficulty:</span> {item.difficulty}</p>
              <p><span className="font-semibold">Price:</span> ${item.price} · <span className="font-semibold">Max guests:</span> {item.max_guests}</p>
              {item.meeting_point && <p><span className="font-semibold">Meeting point:</span> {item.meeting_point}</p>}
              <p><span className="font-semibold">Description:</span> {item.description}</p>
              {item.itinerary && <p className="whitespace-pre-line"><span className="font-semibold">Itinerary:</span> {item.itinerary}</p>}
              {(item.documents ?? []).length > 0 && (
                <ul className="list-disc list-inside">
                  {(item.documents ?? []).map((d: any, i: number) => (
                    <li key={`${d.url}-${i}`}>
                      <a href={d.url} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
                        {d.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="space-y-2 text-gray-700">
              <p><span className="font-semibold">Reason:</span> {item.reason}</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-1">Field</th>
                    <th className="py-1">Current</th>
                    <th className="py-1">Proposed</th>
                  </tr>
                </thead>
                <tbody>
                  {(item.changes ?? []).map((c: any) => (
                    <tr key={c.field} className="border-b last:border-0">
                      <td className="py-1 font-semibold capitalize">{c.field.replace("_", " ")}</td>
                      <td className="py-1 text-gray-500">{String(c.current ?? "—")}</td>
                      <td className="py-1 font-semibold">{String(c.proposed ?? "—")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {item.decision_notes && (
            <p className="rounded-lg bg-gray-50 p-2 text-gray-700">
              <span className="font-semibold">Previous decision:</span> {item.decision_notes}
              {item.decided_by_role ? ` (by ${item.decided_by_role})` : ""}
            </p>
          )}
          {item.status === "submitted" && (
            <div className="space-y-2">
              <textarea
                className="w-full rounded-lg border px-3 py-2 text-sm"
                rows={2}
                placeholder="Decision notes (required for request-changes / reject)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              {error && <div className="text-sm text-red-600">{error}</div>}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => decide("approve")}
                  disabled={busy}
                  className="rounded-lg bg-green-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-green-700 disabled:opacity-40"
                >
                  Approve
                </button>
                <button
                  onClick={() => decide("request_changes")}
                  disabled={busy}
                  className="rounded-lg bg-amber-500 text-white px-3 py-1.5 text-xs font-semibold hover:bg-amber-600 disabled:opacity-40"
                >
                  Request changes
                </button>
                <button
                  onClick={() => decide("reject")}
                  disabled={busy}
                  className="rounded-lg bg-red-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-red-700 disabled:opacity-40"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
          {kind === "proposal" && item.status !== "published" && (
            <button
              onClick={onEdit}
              disabled={isEditing}
              className="rounded-lg bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-blue-700 disabled:opacity-40"
            >
              {isEditing ? "Editing…" : "Edit details"}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Content Manager edit form: lets a manager revise the details of any
 * non-published proposal before approving it.
 */
function ProposalEditForm({
  item,
  onSave,
  onClose,
}: {
  item: any
  onSave: (payload: Record<string, unknown>) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState({
    title: item.title ?? "",
    category: item.category ?? "tour",
    city: item.city ?? "",
    area: item.area ?? "",
    description: item.description ?? "",
    itinerary: item.itinerary ?? "",
    meeting_point: item.meeting_point ?? "",
    duration: item.duration ?? "",
    difficulty: item.difficulty ?? "",
    price: String(item.price ?? ""),
    max_guests: String(item.max_guests ?? ""),
  })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const save = async () => {
    if (!form.title.trim()) { setError("Title is required"); return }
    if (!form.city.trim()) { setError("City is required"); return }
    if (!form.description.trim()) { setError("Description is required"); return }
    const price = Number(form.price)
    const guests = Number(form.max_guests)
    if (Number.isNaN(price) || price < 0) { setError("Price must be a non-negative number"); return }
    if (!Number.isInteger(guests) || guests < 1 || guests > 100) {
      setError("Max guests must be a whole number between 1 and 100")
      return
    }
    setError(null)
    setSaving(true)
    try {
      await onSave({
        title: form.title.trim(),
        category: form.category,
        city: form.city.trim(),
        area: form.area.trim() || undefined,
        description: form.description.trim(),
        itinerary: form.itinerary.trim() || undefined,
        meeting_point: form.meeting_point.trim() || undefined,
        duration: form.duration.trim(),
        difficulty: form.difficulty.trim(),
        price,
        max_guests: guests,
      })
      onClose()
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Unable to save changes.")
    } finally {
      setSaving(false)
    }
  }

  const input =
    "w-full rounded-xl border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Edit proposal details</h3>
        <button onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      {error && (
        <p className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
          <input className={input} value={form.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
          <select className={input} value={form.category} onChange={(e) => set("category", e.target.value)}>
            <option value="tour">Tour</option>
            <option value="trekking">Trekking</option>
            <option value="specialized">Specialized</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">City *</label>
          <input className={input} value={form.city} onChange={(e) => set("city", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Finer area</label>
          <input className={input} value={form.area} onChange={(e) => set("area", e.target.value)} />
        </div>
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
        <textarea className={`${input} min-h-32`} value={form.description} onChange={(e) => set("description", e.target.value)} />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-1">Itinerary</label>
        <textarea className={`${input} min-h-24`} value={form.itinerary} onChange={(e) => set("itinerary", e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Meeting point</label>
          <input className={input} value={form.meeting_point} onChange={(e) => set("meeting_point", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Duration *</label>
          <input className={input} value={form.duration} onChange={(e) => set("duration", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Difficulty *</label>
          <input className={input} value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Price per guest (USD) *</label>
          <input className={input} type="number" min={0} value={form.price} onChange={(e) => set("price", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Max guests (1-100) *</label>
          <input className={input} type="number" min={1} max={100} value={form.max_guests} onChange={(e) => set("max_guests", e.target.value)} />
        </div>
      </div>
      <div className="flex flex-wrap gap-3 pt-4">
        <button onClick={onClose} disabled={saving} className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-100 disabled:opacity-60">
          Cancel
        </button>
        <button onClick={save} disabled={saving} className="rounded-full bg-[#213448] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1a2a3a] disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  )
}

/**
 * SOP-GN-EXP-001 (new-experience proposals) & SOP-GN-EXP-002 (change-request)
 * review queues. `scope` matches the approver's gate: the Regional Manager
 * sees both queues, the Content Writer sees proposals only.
 */
export default function ExperienceReviewPanel({ scope }: { scope: "both" | "proposals" }) {
  const [tab, setTab] = useState<"proposals" | "changes">(scope === "proposals" ? "proposals" : "proposals")
  const [filter, setFilter] = useState("submitted")
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  const load = async (kind: "proposals" | "changes", status: string) => {
    setLoading(true)
    try {
      const data =
        kind === "proposals" ? await getProposalQueue(status) : await getChangeRequestQueue(status)
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(tab, filter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, filter])

  const onDecided = async (id: number, action: DecisionAction, notes: string) => {
    if (tab === "proposals") await decideProposal(id, action, notes || undefined)
    else await decideChangeRequest(id, action, notes || undefined)
    setMsg(`#${id} ${action.replace("_", " ")}`)
    await load(tab, filter)
  }

  const handleEditSave = async (payload: Record<string, unknown>) => {
    if (!editingId) return
    try {
      await updateProposal(editingId, payload)
      setMsg(`#${editingId} details updated`)
      await load(tab, filter)
      setEditingId(null)
    } catch (e: any) {
      setEditError(e?.response?.data?.detail || "Unable to save changes.")
    }
  }

  const editItem = items.find((i) => i.id === editingId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold text-darkBlue">Experience Reviews</div>
        <div className="relative">
          <select
            className="appearance-none rounded-lg border border-line bg-surface px-4 py-2 pr-9 text-sm font-medium text-main shadow-sm transition-colors hover:border-brand-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="changes_requested">Changes requested</option>
          <option value="rejected">Rejected</option>
          <option value="published">Published</option>
          <option value="applied">Applied</option>
          <option value="all">All</option>
        </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soft" />
        </div>
      </div>
      {msg && (
        <div className="rounded-lg bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-sm">
          {msg}
        </div>
      )}
      {scope === "both" && (
        <div className="flex rounded-lg border bg-white p-1 text-sm font-semibold w-fit">
          <button
            onClick={() => setTab("proposals")}
            className={`rounded-md px-3 py-1.5 ${tab === "proposals" ? "bg-darkBlue text-white" : "text-gray-600"}`}
          >
            New experiences
          </button>
          <button
            onClick={() => setTab("changes")}
            className={`rounded-md px-3 py-1.5 ${tab === "changes" ? "bg-darkBlue text-white" : "text-gray-600"}`}
          >
            Change requests
          </button>
        </div>
      )}
      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-white border p-6 text-sm text-gray-500">
          Nothing here — the queue is clear.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ReviewCard
              key={item.id}
              item={item}
              kind={tab === "proposals" ? "proposal" : "change-request"}
              onDecided={(action, notes) => onDecided(item.id, action, notes)}
              isEditing={editingId === item.id}
              onEdit={() => setEditingId(item.id)}
            />
          ))}
        </div>
      )}
      {editingId !== null && editItem && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
          <ProposalEditForm
            item={editItem}
            onSave={handleEditSave}
            onClose={() => setEditingId(null)}
          />
        </div>
      )}
      {editError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {editError}
        </div>
      )}
    </div>
  )
}
