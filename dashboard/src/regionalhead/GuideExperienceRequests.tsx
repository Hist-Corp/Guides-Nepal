import { useEffect, useState } from "react"
import {
  getGuideExperienceRequests,
  reviewGuideExperienceRequest,
} from "../services/api"

export default function RegionalGuideExperienceRequests() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("")
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getGuideExperienceRequests(
        filter ? { status_filter: filter } : undefined
      )
      setItems(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setItems([])
      setError(e?.response?.data?.detail || "Unable to load request queue.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [filter])

  const review = async (id: number, status: "approved" | "rejected", notes: string) => {
    try {
      await reviewGuideExperienceRequest(id, status, notes || undefined)
      setMsg(`Request #${id} ${status}`)
      await load()
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || "Action failed")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-darkBlue">
          Guide Experience Requests
        </h2>
        <select
          className="appearance-none rounded-lg border border-line bg-surface px-4 py-2 pr-9 text-sm font-medium text-main shadow-sm cursor-pointer"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      {msg && (
        <div className="rounded-lg bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-sm">
          {msg}
        </div>
      )}
      {error && (
        <div role="alert" className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}
      <div className="rounded-2xl bg-white border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="p-3">Guide</th>
              <th className="p-3">Email</th>
              <th className="p-3">Region</th>
              <th className="p-3">Target</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Submitted</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4 text-gray-500" colSpan={8}>Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="p-4 text-gray-500" colSpan={8}>No guide experience requests found</td></tr>
            ) : (
              items.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="p-3 font-medium text-darkBlue">{r.guide_name || "—"}</td>
                  <td className="p-3">{r.guide_email || "—"}</td>
                  <td className="p-3">{r.guide_region || "—"}</td>
                  <td className="p-3">{r.experience_title || r.booking_title || "—"}</td>
                  <td className="p-3">{r.request_type}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        r.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : r.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="p-3 space-x-2">
                    {r.status === "pending" && (
                      <>
                        <button
                          onClick={() => review(r.id, "approved", "")}
                          className="rounded-lg bg-green-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => review(r.id, "rejected", "")}
                          className="rounded-lg bg-red-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {r.status !== "pending" && r.review_notes && (
                      <span className="text-xs text-gray-500">{r.review_notes}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Approving a request assigns the guide as the “Who you’ll meet” guide on
        the corresponding Traveller-facing experience page.
      </p>
    </div>
  )
