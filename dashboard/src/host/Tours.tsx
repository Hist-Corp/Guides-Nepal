import { FormEvent, useEffect, useState } from "react"
import PageShell from "../components/PageShell"
import Button from "../components/Button"
import Field from "../components/Field"
import { getHostTours, createHostTour, updateHostTour, deleteHostTour } from "../services/api"

type Form = { title: string; city: string; description: string; itinerary: string; meeting_point: string; duration: string; difficulty: string; max_guests: string; price: string }
const initial: Form = { title: "", city: "", description: "", itinerary: "", meeting_point: "", duration: "", difficulty: "Easy", max_guests: "10", price: "" }

export default function HostTours() {
  const [tours, setTours] = useState<any[]>([])
  const [form, setForm] = useState<Form>(initial)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const load = () => getHostTours().then(setTours).catch(() => setError("Unable to load tours."))
  useEffect(() => { load() }, [])
  const set = (key: keyof Form, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError("")
    try { const payload = { ...form, max_guests: Number(form.max_guests), price: Number(form.price) }; if (editingId) await updateHostTour(editingId, payload); else await createHostTour(payload); setForm(initial); setEditingId(null); setShowForm(false); await load() }
    catch (e: any) { setError(e?.response?.data?.detail || "Please complete all tour details.") }
    finally { setSaving(false) }
  }
  const edit = (tour: any) => { setEditingId(tour.id); setForm({ title: tour.title, city: tour.city, description: tour.description, itinerary: tour.itinerary, meeting_point: tour.meeting_point, duration: tour.duration, difficulty: tour.difficulty, max_guests: String(tour.max_guests), price: String(tour.price) }); setShowForm(true) }
  const remove = async (id: number) => { if (!window.confirm("Remove this tour?")) return; try { await deleteHostTour(id); await load() } catch (e: any) { setError(e?.response?.data?.detail || "Unable to remove tour.") } }
  return <PageShell title="Your tours" description="Create and manage the guided tours you offer separately from your experiences." action={<Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Close form" : "Add tour"}</Button>}>
    {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {showForm && <form onSubmit={submit} className="mb-6 grid gap-4 rounded-2xl border border-brand-200 bg-surface-2 p-4 md:grid-cols-2"><Field label="Tour title *" required value={form.title} onChange={(e: any) => set("title", e.target.value)} placeholder="Annapurna sunrise trek" /><Field label="City / region *" required value={form.city} onChange={(e: any) => set("city", e.target.value)} placeholder="Pokhara" /><Field label="Duration *" required value={form.duration} onChange={(e: any) => set("duration", e.target.value)} placeholder="5 days" /><Field label="Difficulty *" required value={form.difficulty} onChange={(e: any) => set("difficulty", e.target.value)} placeholder="Moderate" /><Field label="Maximum guests *" required type="number" min="1" max="100" value={form.max_guests} onChange={(e: any) => set("max_guests", e.target.value)} /><Field label="Price per guest (USD) *" required type="number" min="1" step="0.01" value={form.price} onChange={(e: any) => set("price", e.target.value)} /><Field label="Meeting point *" required value={form.meeting_point} onChange={(e: any) => set("meeting_point", e.target.value)} placeholder="Pokhara airport terminal" /><Field as="textarea" label="Tour description *" required minLength={30} value={form.description} onChange={(e: any) => set("description", e.target.value)} placeholder="Describe what guests will experience." /><Field as="textarea" className="md:col-span-2" label="Itinerary *" required minLength={10} value={form.itinerary} onChange={(e: any) => set("itinerary", e.target.value)} placeholder="Day 1: …\nDay 2: …" /><div className="md:col-span-2 flex justify-end"><Button type="submit" disabled={saving}>{saving ? "Saving…" : editingId ? "Update tour" : "Save tour"}</Button></div></form>}
    {tours.length === 0 ? <p className="text-soft">You have not added any tours yet.</p> : <div className="space-y-3">{tours.map((tour) => <div key={tour.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4"><div><h3 className="font-semibold text-main">{tour.title}</h3><p className="text-sm text-soft">{tour.city} · {tour.duration} · {tour.difficulty}</p><p className="mt-1 text-sm text-main">${Number(tour.price).toFixed(2)} · up to {tour.max_guests} guests</p></div><div className="flex flex-wrap items-center justify-end gap-2"><Button variant="secondary" size="sm" onClick={() => edit(tour)}>Edit</Button><Button variant="danger" size="sm" onClick={() => remove(tour.id)}>Remove</Button></div></div>)}</div>}
  </PageShell>
}
