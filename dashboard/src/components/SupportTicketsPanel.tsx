import { useEffect, useState } from "react"
import { getSupportTickets, updateSupportTicket } from "../services/api"

const STATUSES = ["open", "in_progress", "resolved", "closed"]

export default function SupportTicketsPanel() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("")
  const [msg, setMsg] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getSupportTickets(filter ? { status: filter } : undefined)
      setTickets(Array.isArray(data) ? data : [])
    } catch {
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [filter])

  const update = async (id: number, status: string) => {
    try {
      await updateSupportTicket(id, { status })
      setMsg(`Ticket #${id} → ${status}`)
      await load()
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || "Action failed")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold text-darkBlue">Support Tickets</div>
        <select
          className="rounded-lg border px-3 py-2 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
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
              <th className="p-3">Subject</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4 text-gray-500" colSpan={5}>Loading…</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td className="p-4 text-gray-500" colSpan={5}>No support tickets found</td></tr>
            ) : (
              tickets.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="p-3 font-medium text-darkBlue">{t.subject}</td>
                  <td className="p-3">
                    {t.customer_name || "—"}
                    <div className="text-xs text-gray-500">{t.customer_email}</div>
                  </td>
                  <td className="p-3 capitalize">{t.priority}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        t.status === "resolved"
                          ? "bg-green-100 text-green-700"
                          : t.status === "closed"
                          ? "bg-gray-100 text-gray-600"
                          : t.status === "in_progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    {STATUSES.filter((s) => s !== t.status).map((s) => (
                      <button
                        key={s}
                        onClick={() => update(t.id, s)}
                        className="rounded-lg bg-darkBlue text-white px-3 py-1.5 text-xs font-semibold hover:opacity-90"
                      >
                        {s.replace("_", " ")}
                      </button>
                    ))}
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