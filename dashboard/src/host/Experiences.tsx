import { FormEvent, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import PageShell from "../components/PageShell"
import Button from "../components/Button"
import Field from "../components/Field"
import Badge from "../components/Badge"
import Modal from "../components/Modal"
import { getHostExperiences, createHostExperience, updateHostExperience, deleteHostExperience, publishHostExperience, unpublishHostExperience } from "../services/api"

type Experience = {
  id: number
  title: string
  city: string
  category: string
  description: string
  price: number
  duration: string
  hero_image: string
  is_active: boolean
  status: "draft" | "listed" | "archived"
  created_at: string
  updated_at: string
  bookings_count: number
  rating: number
  review_count: number
}

type FormData = { title: string; city: string; category: string; description: string; price: string; duration: string; hero_image: string }
const initial: FormData = { title: "", city: "", category: "", description: "", price: "", duration: "", hero_image: "" }

const cities = ["Kathmandu", "Pokhara", "Lalitpur", "Bhaktapur", "Bharatpur"]
const categories = ["Heritage & Culture", "Nature & Adventure", "Food & Drink", "Wellness", "Arts & Crafts", "Photography"]

export default function HostExperiences() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [form, setForm] = useState<FormData>(initial)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [viewingExp, setViewingExp] = useState<Experience | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const navigate = useNavigate()

  const load = () => getHostExperiences().then(setExperiences).catch(() => setError("Unable to load experiences."))
  useEffect(() => { load() }, [])

  const setField = (key: keyof FormData, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError("")
    try {
      const payload = { ...form, price: Number(form.price) }
      if (editingId) await updateHostExperience(editingId, payload)
      else await createHostExperience(payload)
      setForm(initial)
      setEditingId(null)
      setShowForm(false)
      await load()
    } catch (e: any) {
      const _d = e?.response?.data?.detail
      const _m = typeof _d === 'string' ? _d : (Array.isArray(_d) ? _d.map((x: any) => (typeof x === 'string' ? x : x?.msg || JSON.stringify(x))).join(' ') : (_d && typeof _d === 'object' ? (_d.msg || JSON.stringify(_d)) : null))
      setError(_m || "Please complete all experience details.")
    } finally { setSaving(false) }
  }

  const edit = (experience: Experience) => {
    setEditingId(experience.id)
    setForm({ title: experience.title, city: experience.city, category: experience.category, description: experience.description, price: String(experience.price), duration: experience.duration, hero_image: experience.hero_image || "" })
    setShowForm(true)
  }

  const viewDetail = (experience: Experience) => setViewingExp(experience)

  const handleDelete = async (id: number) => {
    if (!window.confirm("Remove this experience? This action cannot be undone.")) return
    try { await deleteHostExperience(id); await load() }
    catch (e: any) {
      const _d = e?.response?.data?.detail
      const _m = typeof _d === 'string' ? _d : (Array.isArray(_d) ? _d.map((x: any) => (typeof x === 'string' ? x : x?.msg || JSON.stringify(x))).join(' ') : (_d && typeof _d === 'object' ? (_d.msg || JSON.stringify(_d)) : null))
      setError(_m || "Unable to remove experience.")
    }
  }

  const handlePublish = async (id: number) => {
    try { await publishHostExperience(id); await load() }
    catch (e: any) { setError("Failed to publish experience.") }
  }

  const handleUnpublish = async (id: number) => {
    try { await unpublishHostExperience(id); await load() }
    catch (e: any) { setError("Failed to unpublish experience.") }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "warning" | "danger"> = {
      draft: "warning", listed: "success", archived: "default"
    }
    return <Badge variant={variants[status] || "default"} text={status} />
  }

  return (
    <PageShell
      title="Your experiences"
      description="Create and manage the experiences you offer. Draft, publish, and track performance."
      action={<Button onClick={() => setShowForm((v) => !v)}>{showForm ? "Close form" : "Add experience"}</Button>}
    >
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      
      {showForm && (
        <form onSubmit={submit} className="mb-6 grid gap-4 rounded-2xl border border-brand-200 bg-surface-2 p-4 md:grid-cols-2">
          <Field label="Experience title *" required value={form.title} onChange={(e: any) => setField("title", e.target.value)} />
          <Field label="City *" required as="select" value={form.city} onChange={(e: any) => setField("city", e.target.value)}>
            <option value="">Select city</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </Field>
          <Field label="Category *" required as="select" value={form.category} onChange={(e: any) => setField("category", e.target.value)}>
            <option value="">Select category</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </Field>
          <Field label="Duration *" required value={form.duration} onChange={(e: any) => setField("duration", e.target.value)} placeholder="e.g., 4h, 2h 30m" />
          <Field label="Price per guest (USD) *" required type="number" min="1" step="0.01" value={form.price} onChange={(e: any) => setField("price", e.target.value)} />
          <Field label="Hero image URL (optional)" value={form.hero_image} onChange={(e: any) => setField("hero_image", e.target.value)} placeholder="https://..." />
          <Field as="textarea" className="md:col-span-2" label="Description and details *" required minLength={30} value={form.description} onChange={(e: any) => setField("description", e.target.value)} rows={5} />
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => { setForm(initial); setEditingId(null); setShowForm(false) }}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : editingId ? "Update experience" : "Save experience"}</Button>
          </div>
        </form>
      )}

      {viewingExp && (
        <ExperienceDetailModal
          experience={viewingExp}
          onClose={() => setViewingExp(null)}
          onEdit={() => { edit(viewingExp!); setViewingExp(null) }}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onDelete={() => { setDeleteConfirmId(viewingExp!.id); setViewingExp(null) }}
        />
      )}

      {deleteConfirmId && (
        <Modal open onClose={() => setDeleteConfirmId(null)} title="Delete experience?">
          <h3 className="text-lg font-semibold mb-2">Delete experience?</h3>
          <p className="text-soft mb-4">This will permanently remove the experience and all its data.</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => { handleDelete(deleteConfirmId!); setDeleteConfirmId(null) }}>Delete</Button>
          </div>
        </Modal>
      )}

      {experiences.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-soft mb-4">You have not added any experiences yet.</p>
          <Button onClick={() => setShowForm(true)}>Create your first experience</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {experiences.map((experience) => (
            <div key={experience.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
              <div className="flex items-center gap-4 min-w-0">
                {experience.hero_image && (
                  <img src={experience.hero_image} alt={experience.title} className="h-16 w-16 rounded-xl object-cover flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-main truncate">{experience.title}</h3>
                    {getStatusBadge(experience.status)}
                  </div>
                  <p className="text-sm text-soft truncate">{experience.city} · {experience.category} · {experience.duration}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm">
                    <span className="text-main">${Number(experience.price).toFixed(2)} per guest</span>
                    <span className="text-soft">·</span>
                    <span className="text-soft">{experience.bookings_count} bookings</span>
                    <span className="text-soft">·</span>
                    <span className="flex items-center gap-1 text-soft">{experience.rating > 0 ? `★ ${experience.rating.toFixed(1)}` : "No ratings"} ({experience.review_count})</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => viewDetail(experience)}>View</Button>
                <Button variant="secondary" size="sm" onClick={() => edit(experience)}>Edit</Button>
                {experience.status === "listed" ? (
                  <Button variant="secondary" size="sm" onClick={() => handleUnpublish(experience.id)}>Unpublish</Button>
                ) : (
                  <Button variant="primary" size="sm" onClick={() => handlePublish(experience.id)}>Publish</Button>
                )}
                <Button variant="danger" size="sm" onClick={() => setDeleteConfirmId(experience.id)}>Remove</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}

function ExperienceDetailModal({ experience, onClose, onEdit, onPublish, onUnpublish, onDelete }: { experience: Experience; onClose: () => void; onEdit: () => void; onPublish: (id: number) => void; onUnpublish: (id: number) => void; onDelete: () => void }) {
  return (
    <Modal open onClose={onClose} wide title={experience.title}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {experience.hero_image && (
            <img src={experience.hero_image} alt={experience.title} className="h-48 w-full sm:w-72 rounded-2xl object-cover flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-main">{experience.title}</h2>
                <p className="text-sm text-soft">{experience.city} · {experience.category}</p>
              </div>
              <Badge variant={experience.status === "listed" ? "success" : experience.status === "draft" ? "warning" : "default"} text={experience.status} />
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div><span className="text-soft block">Duration</span><span className="font-medium">{experience.duration}</span></div>
              <div><span className="text-soft block">Price</span><span className="font-medium text-main">${Number(experience.price).toFixed(2)}</span></div>
              <div><span className="text-soft block">Bookings</span><span className="font-medium">{experience.bookings_count}</span></div>
              <div><span className="text-soft block">Rating</span><span className="font-medium">{experience.rating > 0 ? `★ ${experience.rating.toFixed(1)} (${experience.review_count})` : "No ratings"}</span></div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-main mb-2">Description</h3>
          <p className="text-soft whitespace-pre-wrap">{experience.description}</p>
        </div>

        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button variant="secondary" onClick={onEdit}>Edit experience</Button>
          {experience.status === "listed" ? (
            <Button variant="secondary" onClick={() => onUnpublish(experience.id)}>Unpublish</Button>
          ) : (
            <Button onClick={() => onPublish(experience.id)}>Publish</Button>
          )}
          <Button variant="danger" onClick={onDelete}>Delete</Button>
        </div>
      </div>
    </Modal>
  )
}