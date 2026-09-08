import { useEffect, useState } from "react"
import { getHostApplications, reviewHostApplication } from "../services/api"

export default function HostApplicationsPanel() {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("")
  const [msg, setMsg] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getHostApplications(filter ? { status: filter } : undefined)
      setApps(Array.isArray(data) ? data : [])
    } catch {
      setApps([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [filter])

  const review = async (id: number, status: "approved" | "rejected") => {
    try {
      await reviewHostApplication(id, status)
      setMsg(`Application #${id} ${status}`)
      await load()
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || "Action failed")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold text-darkBlue">Host Applications</div>
        <select
          className="rounded-lg border px-3 py-2 text-sm"
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
      <div className="rounded-2xl bg-white border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="p-3">Host</th>
              <th className="p-3">Email</th>
              <th className="p-3">City</th>
              <th className="p-3">Region</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4 text-gray-500" colSpan={6}>Loading…</td></tr>
            ) : apps.length === 0 ? (
              <tr><td className="p-4 text-gray-500" colSpan={6}>No host applications found</td></tr>
            ) : (
              apps.map((a) => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="p-3 font-medium text-darkBlue">{a.host_name}</td>
                  <td className="p-3">{a.email}</td>
                  <td className="p-3">{a.city || "—"}</td>
                  <td className="p-3">{a.region || "—"}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        a.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : a.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => review(a.id, "approved")}
                      disabled={a.status === "approved"}
                      className="rounded-lg bg-green-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-green-700 disabled:opacity-40"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => review(a.id, "rejected")}
                      disabled={a.status === "rejected"}
                      className="rounded-lg bg-red-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-red-700 disabled:opacity-40"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}