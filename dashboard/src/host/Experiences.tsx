import { FormEvent, useEffect, useState } from "react"
import PageShell from "../components/PageShell"
import Button from "../components/Button"
import Field from "../components/Field"
import { getHostExperiences, createHostExperience, updateHostExperience, deleteHostExperience } from "../services/api"

type Form = { title: string; city: string; category: string; description: string; price: string; duration: string; hero_image: string }
const initial: Form = { title: "", city: "", category: "", description: "", price: "", duration: "", hero_image: "" }

export default function HostExperiences() {
  const [experiences, setExperiences] = useState<any[]>([])
  const [form, setForm] = useState<Form>(initial)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const load = () => getHostExperiences().then(setExperiences).catch(() => setError("Unable to load experiences."))
  useEffect(() => { load() }, [])
  const set = (key: keyof Form, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError("")
    try { const payload = { ...form, price: Number(form.price) }; if (editingId) await updateHostExperience(editingId, payload); else await createHostExperience(payload); setForm(initial); setEditingId(null); setShowForm(false); await load() }
    catch (e: any) { setError(e?.response?.data?.detail || "Please complete all experience details.") }
    finally { setSaving(false) }
  }
  const edit = (experience: any) => { setEditingId(experience.id); setForm({ title: experience.title, city: experience.city, category: experience.category, description: experience.description, price: String(experience.price), duration: experience.duration, hero_image: experience.hero_image || "" }); setShowForm(true) }
  const remove = async (id: number) => { if (!window.confirm("Remove this experience?")) return; try { await deleteHostExperience(id); await load() } catch (e: any) { setError(e?.response?.data?.detail || "Unable to remove experience.") } }
  return <PageShell title="Your experiences" description="Create and manage the experiences you offer separately from your tours." action={<Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Close form" : "Add experience"}</Button>}>
    {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {showForm && <form onSubmit={submit} className="mb-6 grid gap-4 rounded-2xl border border-brand-200 bg-surface-2 p-4 md:grid-cols-2"><Field label="Experience title *" required value={form.title} onChange={(e: any) => set("title", e.target.value)} /><Field label="City *" required value={form.city} onChange={(e: any) => set("city", e.target.value)} /><Field label="Category *" required value={form.category} onChange={(e: any) => set("category", e.target.value)} /><Field label="Duration *" required value={form.duration} onChange={(e: any) => set("duration", e.target.value)} /><Field label="Price per guest (USD) *" required type="number" min="1" step="0.01" value={form.price} onChange={(e: any) => set("price", e.target.value)} /><Field label="Hero image URL (optional)" value={form.hero_image} onChange={(e: any) => set("hero_image", e.target.value)} /><Field as="textarea" className="md:col-span-2" label="Description and details *" required minLength={30} value={form.description} onChange={(e: any) => set("description", e.target.value)} /><div className="md:col-span-2 flex justify-end"><Button type="submit" disabled={saving}>{saving ? "Saving…" : editingId ? "Update experience" : "Save experience"}</Button></div></form>}
    {experiences.length === 0 ? <p className="text-soft">You have not added any experiences yet.</p> : <div className="space-y-3">{experiences.map((experience) => <div key={experience.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4"><div><h3 className="font-semibold text-main">{experience.title}</h3><p className="text-sm text-soft">{experience.city} · {experience.category} · {experience.duration}</p><p className="mt-1 text-sm text-main">${Number(experience.price).toFixed(2)} per guest</p></div><div className="flex flex-wrap items-center justify-end gap-2"><Button variant="secondary" size="sm" onClick={() => edit(experience)}>Edit</Button><Button variant="danger" size="sm" onClick={() => remove(experience.id)}>Remove</Button></div></div>)}</div>}
  </PageShell>
}
