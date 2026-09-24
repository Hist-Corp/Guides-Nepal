import { useEffect, useState } from "react"
import PageShell from "../components/PageShell"
import Button from "../components/Button"
import Badge from "../components/Badge"
import { getHostBookings, decideHostBooking } from "../services/api"

export default function HostBookings() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionId, setActionId] = useState<number | null>(null)

  const load = () => {
    setLoading(true)
    getHostBookings().then(setBookings).catch(() => setError("Unable to load bookings.")).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const decide = async (id: number, status: "accepted" | "rejected") => {
    if (!window.confirm(status === "accepted" ? "Accept this booking request?" : "Reject this booking request?")) return
    setActionId(id)
    try {
      await decideHostBooking(id, status)
      await load()
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Unable to update booking.")
    } finally {
      setActionId(null)
    }
  }

  return <PageShell title="Bookings" description="Review guest requests and decide which bookings to accept.">
    {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading ? <p className="text-soft">Loading bookings…</p> : bookings.length === 0 ? <p className="text-soft">No booking requests yet.</p> : <div className="space-y-3">{bookings.map((booking) => <div key={booking.id} className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold text-main">{booking.experience_title}</h3><p className="text-sm text-soft">{booking.guest_name} · {booking.guest_email}</p></div><Badge text={booking.status} /></div>
      <div className="mt-3 grid gap-2 text-sm text-soft sm:grid-cols-3"><span>Date: {new Date(booking.date).toLocaleString()}</span><span>Guests: {booking.guests}</span><span>Total: ${Number(booking.total_price).toFixed(2)}</span></div>
      {booking.notes && <p className="mt-3 rounded-lg bg-surface-2 p-3 text-sm text-main">Guest note: {booking.notes}</p>}
      {booking.status === "upcoming" && <div className="mt-4 flex gap-2"><Button size="sm" onClick={() => decide(booking.id, "accepted")} disabled={actionId === booking.id}>Accept booking</Button><Button size="sm" variant="secondary" onClick={() => decide(booking.id, "rejected")} disabled={actionId === booking.id}>Reject</Button></div>}
    </div>)}</div>}
  </PageShell>
}
