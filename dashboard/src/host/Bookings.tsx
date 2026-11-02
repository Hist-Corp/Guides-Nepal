import { useEffect, useState } from "react"
import PageShell from "../components/PageShell"
import Button from "../components/Button"
import Badge from "../components/Badge"
import Modal from "../components/Modal"
import { getHostBookings, decideHostBooking, getHostBookingDetail, messageGuest } from "../services/api"

type Booking = {
  id: number
  experience_id: number
  experience_title: string
  experience_city: string
  guest_id: number
  guest_name: string
  guest_email: string
  guest_phone?: string
  date: string
  guests: number
  total_price: number
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled" | "upcoming"
  notes?: string
  created_at: string
  updated_at: string
  timeline: TimelineEvent[]
}

type TimelineEvent = {
  id: number
  booking_id: number
  event_type: "created" | "accepted" | "rejected" | "cancelled" | "completed" | "message" | "reminder"
  description: string
  created_at: string
  actor: "guest" | "host" | "system"
}

const getStatusVariant = (status: string): "default" | "success" | "warning" | "danger" | "info" => {
  const variants: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
    pending: "warning", accepted: "success", rejected: "danger", completed: "default", cancelled: "danger", upcoming: "info"
  }
  return variants[status] || "default"
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: "Pending", accepted: "Accepted", rejected: "Rejected", completed: "Completed", cancelled: "Cancelled", upcoming: "Upcoming"
  }
  return labels[status] || status
}

export default function HostBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionId, setActionId] = useState<number | null>(null)
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null)
  const [bookingDetailLoading, setBookingDetailLoading] = useState(false)

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
      const _d = e?.response?.data?.detail
      const _m = typeof _d === 'string' ? _d : (Array.isArray(_d) ? _d.map((x: any) => (typeof x === 'string' ? x : x?.msg || JSON.stringify(x))).join(' ') : (_d && typeof _d === 'object' ? (_d.msg || JSON.stringify(_d)) : null))
      setError(_m || "Unable to update booking.")
    } finally {
      setActionId(null)
    }
  }

  const viewDetail = async (booking: Booking) => {
    setViewingBooking(booking)
    if (!booking.timeline?.length) {
      setBookingDetailLoading(true)
      try {
        const detail = await getHostBookingDetail(booking.id)
        setViewingBooking(detail)
      } catch (e) {
        console.error("Failed to load booking detail", e)
      } finally {
        setBookingDetailLoading(false)
      }
    }
  }

  const handleMessageGuest = async (bookingId: number, message: string) => {
    try {
      await messageGuest(bookingId, message)
      const detail = await getHostBookingDetail(bookingId)
      setViewingBooking(detail)
    } catch (e) {
      alert("Failed to send message")
    }
  }

  const getStatusVariant = (status: string) => {
    const variants: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
      pending: "warning", accepted: "success", rejected: "danger", completed: "default", cancelled: "danger", upcoming: "info"
    }
    return variants[status] || "default"
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pending", accepted: "Accepted", rejected: "Rejected", completed: "Completed", cancelled: "Cancelled", upcoming: "Upcoming"
    }
    return labels[status] || status
  }

  return (
    <PageShell title="Bookings" description="Review guest requests and manage your bookings.">
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading ? (
        <p className="text-soft">Loading bookings…</p>
      ) : bookings.length === 0 ? (
        <p className="text-soft">No booking requests yet.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-main">{booking.experience_title}</h3>
                  <p className="text-sm text-soft">{booking.guest_name} · {booking.guest_email}</p>
                </div>
                <Badge variant={getStatusVariant(booking.status)} text={getStatusLabel(booking.status)} />
              </div>
              <div className="mt-3 grid gap-2 text-sm text-soft sm:grid-cols-3">
                <span>Date: {new Date(booking.date).toLocaleString()}</span>
                <span>Guests: {booking.guests}</span>
                <span>Total: ${Number(booking.total_price).toFixed(2)}</span>
              </div>
              {booking.notes && <p className="mt-3 rounded-lg bg-surface-2 p-3 text-sm text-main">Guest note: {booking.notes}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {booking.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => decide(booking.id, "accepted")} disabled={actionId === booking.id}>Accept</Button>
                    <Button size="sm" variant="secondary" onClick={() => decide(booking.id, "rejected")} disabled={actionId === booking.id}>Reject</Button>
                  </>
                )}
                {booking.status === "accepted" && (
                  <Button size="sm" variant="secondary" onClick={() => decide(booking.id, "rejected")} disabled={actionId === booking.id}>Cancel booking</Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => viewDetail(booking)}>View details</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewingBooking && (
        <BookingDetailModal
          booking={viewingBooking}
          onClose={() => setViewingBooking(null)}
          onMessage={handleMessageGuest}
          loading={bookingDetailLoading}
        />
      )}
    </PageShell>
  )
}

function BookingDetailModal({ booking, onClose, onMessage, loading }: { booking: Booking; onClose: () => void; onMessage: (bookingId: number, message: string) => void; loading: boolean }) {
  const [messageText, setMessageText] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim()) return
    onMessage(booking.id, messageText)
    setMessageText("")
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString()

  return (
    <Modal open onClose={onClose} wide title={booking.experience_title}>
      {loading && <div className="flex justify-center py-8"><p className="text-soft">Loading details…</p></div>}
      {!loading && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-main">{booking.experience_title}</h2>
              <p className="text-sm text-soft">{booking.experience_city}</p>
            </div>
            <Badge variant={getStatusVariant(booking.status)} text={getStatusLabel(booking.status)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DetailField label="Guest" value={booking.guest_name} />
            <DetailField label="Email" value={booking.guest_email} />
            <DetailField label="Phone" value={booking.guest_phone || "—"} />
            <DetailField label="Booking date" value={formatDate(booking.date)} />
            <DetailField label="Guests" value={String(booking.guests)} />
            <DetailField label="Total price" value={`$${Number(booking.total_price).toFixed(2)}`} />
            <DetailField label="Booking ID" value={String(booking.id)} />
            <DetailField label="Created" value={formatDate(booking.created_at)} />
          </div>

          {booking.notes && (
            <div className="rounded-lg bg-surface-2 p-4">
              <h3 className="font-semibold text-main mb-2">Guest notes</h3>
              <p className="text-soft whitespace-pre-wrap">{booking.notes}</p>
            </div>
          )}

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-main">Timeline</h3>
              <form onSubmit={handleSendMessage} className="flex gap-2 w-full max-w-md">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Message guest…"
                  className="flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm"
                />
                <Button type="submit" size="sm">Send</Button>
              </form>
            </div>
            <div className="space-y-3">
              {booking.timeline?.length === 0 ? (
                <p className="text-soft text-center py-4">No timeline events yet.</p>
              ) : (
                booking.timeline.map((event) => (
                  <TimelineItem key={event.id} event={event} />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-soft block mb-1">{label}</span>
      <span className="font-medium text-main">{value}</span>
    </div>
  )
}

function TimelineItem({ event }: { event: TimelineEvent }) {
  const actorIcons: Record<string, string> = { guest: "👤", host: "🏠", system: "⚙️" }
  const actorLabels: Record<string, string> = { guest: "Guest", host: "You", system: "System" }
  const typeColors: Record<string, string> = {
    created: "text-blue-600", accepted: "text-green-600", rejected: "text-red-600",
    cancelled: "text-red-600", completed: "text-gray-600", message: "text-purple-600", reminder: "text-amber-600"
  }

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-sm">{actorIcons[event.actor] || "⚙️"}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-main">{actorLabels[event.actor] || event.actor}</span>
          <span className="text-xs text-soft">{new Date(event.created_at).toLocaleString()}</span>
        </div>
        <p className={`text-sm ${typeColors[event.event_type] || ""}`}>{event.description}</p>
      </div>
    </div>
  )
}