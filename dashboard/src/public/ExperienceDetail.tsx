import { useParams, Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import useCatalog from "./hooks/useCatalog"
import { ExperienceGrid } from "./components/ExperienceCard"
import { createBooking } from "../services/api"
import { useAuthStore } from "../state/authStore"

export default function ExperienceDetail() {
  const { id, slug } = useParams()
  const { experiences, loading } = useCatalog()
  const { token } = useAuthStore()
  const navigate = useNavigate()
  const [date, setDate] = useState("")
  const [guests, setGuests] = useState(2)
  const [message, setMessage] = useState<string | null>(null)
  const [booking, setBooking] = useState(false)

  const exp = experiences.find(
    (e) => (id && String(e.id) === id) || (slug && e.slug === slug)
  )

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-500">Loading experience...</div>

  if (!exp) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl">??</div>
        <h1 className="text-xl font-semibold text-darkBlue mt-4">Experience not found</h1>
        <p className="text-gray-500 mt-2">It may have been removed, or the link is incorrect.</p>
        <Link to="/explore" className="inline-block mt-6 rounded-lg px-5 py-2 bg-darkBlue text-white font-semibold">Browse all experiences</Link>
      </div>
    )
  }

  const related = experiences.filter((e) => e.id !== exp.id && (e.city === exp.city || e.category === exp.category)).slice(0, 3)

  async function handleBook() {
    if (!token) {
      navigate("/dashboard/login", { state: { from: `/experience/${exp!.id}` } })
      return
    }
    if (!date) {
      setMessage("Please pick a date first.")
      return
    }
    setBooking(true)
    setMessage(null)
    try {
      await createBooking({ experience_id: exp!.id, date, guests })
      setMessage(`Booked "${exp!.title}" for ${guests} guest(s) on ${date}. Check your dashboard for details.`)
    } catch (err: any) {
      setMessage(err?.response?.data?.detail ?? "Booking failed. Please try again.")
    } finally {
      setBooking(false)
    }
  }

  return (
    <div>
      <div className="bg-gradient-to-br from-lightBlue/60 to-peach/40">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <div className="text-7xl">{exp.image}</div>
          <div className="mt-3 text-xs uppercase tracking-wide text-gray-600">{exp.category} · {exp.city}</div>
          <h1 className="text-3xl md:text-4xl font-bold text-darkBlue mt-1">{exp.title}</h1>
          <div className="mt-2 text-sm text-gray-600">
            <span className="text-amber-500">? {exp.rating.toFixed(1)}</span> ({exp.reviews} reviews) · {exp.duration} · from <span className="font-bold text-darkBlue">${exp.price}</span> / person
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-darkBlue mb-2">About this experience</h2>
            <p className="text-gray-600 leading-relaxed">{exp.description}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-darkBlue mb-2">Highlights</h2>
            <ul className="space-y-2">
              {exp.highlights.map((h) => (
                <li key={h} className="flex gap-2 text-gray-600"><span className="text-brand-yellow">?</span>{h}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-bold text-darkBlue mb-2">Good to know</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="rounded-xl bg-white border border-gray-200 p-4">?? Meeting point: {exp.city} city center</div>
              <div className="rounded-xl bg-white border border-gray-200 p-4">?? Duration: {exp.duration}</div>
              <div className="rounded-xl bg-white border border-gray-200 p-4">??? Languages: English, Nepali</div>
              <div className="rounded-xl bg-white border border-gray-200 p-4">?? Free cancellation up to 24h</div>
            </div>
          </section>
        </div>

        {/* Booking card */}
        <aside>
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6 sticky top-24">
            <div className="text-xl font-semibold text-darkBlue">${exp.price} <span className="text-sm font-normal text-gray-500">/ person</span></div>
            <label className="block text-sm text-gray-700 mt-4">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border px-3 py-2 mt-1" />
            <label className="block text-sm text-gray-700 mt-3">Guests</label>
            <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 mt-1">
              {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <div className="flex justify-between text-sm text-gray-600 mt-4 border-t pt-4">
              <span>${exp.price} × {guests} guests</span>
              <span className="font-bold text-darkBlue">${exp.price * guests}</span>
            </div>
            <button
              onClick={handleBook}
              disabled={booking}
              className="w-full mt-4 rounded-xl py-3 bg-brand-yellow text-darkBlue font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {booking ? "Booking..." : token ? "Book now" : "Sign in to book"}
            </button>
            {message && <p className="mt-3 text-sm text-center text-darkBlue bg-lightBlue/50 rounded-lg px-3 py-2">{message}</p>}
            <p className="text-xs text-gray-400 text-center mt-3">You won't be charged yet — the host confirms availability.</p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pb-12">
          <h2 className="text-xl font-bold text-darkBlue mb-4">You might also like</h2>
          <ExperienceGrid items={related} />
        </div>
      )}

    </div>
  )
}
