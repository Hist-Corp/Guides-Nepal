import { useEffect, useState } from "react"
import {
  decideChangeRequest,
  decideProposal,
  getChangeRequestQueue,
  getProposalQueue,
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
}: {
  item: any
  kind: "proposal" | "change-request"
  onDecided: (action: DecisionAction, notes: string) => Promise<void>
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
      setError(e?.response?.data?.detail || "Action failed")
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
        </div>
      )}
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold text-darkBlue">Experience Reviews</div>
        <select
          className="rounded-lg border px-3 py-2 text-sm"
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
            />
          ))}
        </div>
      )}
    </div>
  )
}
