import { FormEvent, useState } from "react"
import Button from "./Button"
import Field from "./Field"
import { createHostGuide } from "../services/hostGuidesApi"

type GuideForm = {
  full_name: string; email: string; password: string; phone: string; nin_number: string;
  role_title: string; bio: string; languages: string; cities: string;
  lives_in: string; image: string; city: string; region: string;
}
const initial: GuideForm = {
  full_name: "", email: "", password: "", phone: "", nin_number: "",
  role_title: "", bio: "", languages: "English, Nepali", cities: "",
  lives_in: "", image: "", city: "", region: "",
}
const KINDS = ["citizenshipFront", "citizenshipBack", "liveSelfie", "holdingCitizenship", "certificate"]

export default function HostGuideForm({ onCreated, onError }: { onCreated: () => void; onError: (msg: string) => void }) {
  const [form, setForm] = useState<GuideForm>(initial)
  const [documents, setDocuments] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const set = (key: keyof GuideForm, value: string) => setForm((c) => ({ ...c, [key]: value }))

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); onError("")
    try {
      await createHostGuide({
        ...form,
        languages: form.languages.split(",").map((x) => x.trim()).filter(Boolean),
        cities: form.cities.split(",").map((x) => x.trim()).filter(Boolean),
        gallery: [],
        documents: Object.entries(documents).filter(([, n]) => n).map(([kind, name]) => ({ kind, name })),
      })
      setForm(initial); setDocuments({}); onCreated()
    } catch (e: any) {
      onError(e?.response?.data?.detail || "Please complete every registration field — mirrors BecomeGuidePage.")
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="mb-6 grid gap-4 rounded-2xl border border-brand-200 bg-surface-2 p-4 md:grid-cols-2">
      <div className="md:col-span-2 text-sm font-bold text-main">1 · Personal information (registration)</div>
      <Field label="Full name *" required value={form.full_name} onChange={(e: any) => set("full_name", e.target.value)} />
      <Field label="Email *" required type="email" value={form.email} onChange={(e: any) => set("email", e.target.value)} />
      <Field label="Password (login, 8+ chars) *" required type="password" value={form.password} onChange={(e: any) => set("password", e.target.value)} />
      <Field label="Phone *" required value={form.phone} onChange={(e: any) => set("phone", e.target.value)} />
      <Field label="NIN *" required value={form.nin_number} onChange={(e: any) => set("nin_number", e.target.value)} />
      <Field label="City" value={form.city} onChange={(e: any) => set("city", e.target.value)} />
      <div className="md:col-span-2 text-sm font-bold text-main">2 · Professional details (catalog profile)</div>
      <Field label="Professional title *" required value={form.role_title} onChange={(e: any) => set("role_title", e.target.value)} />
      <Field label="Lives in" value={form.lives_in} onChange={(e: any) => set("lives_in", e.target.value)} />
      <Field label="Languages (comma separated) *" required value={form.languages} onChange={(e: any) => set("languages", e.target.value)} />
      <Field label="Cities (comma separated) *" required value={form.cities} onChange={(e: any) => set("cities", e.target.value)} />
      <Field label="Profile image URL" value={form.image} onChange={(e: any) => set("image", e.target.value)} />
      <Field label="Region" value={form.region} onChange={(e: any) => set("region", e.target.value)} />
      <Field as="textarea" className="md:col-span-2" label="Bio (min 30 chars) *" required minLength={30} value={form.bio} onChange={(e: any) => set("bio", e.target.value)} />
      <div className="md:col-span-2 text-sm font-bold text-main">3 · Verification documents (file names)</div>
      {KINDS.map((kind) => (
        <Field key={kind} label={kind} value={documents[kind] ?? ""} onChange={(e: any) => setDocuments((c) => ({ ...c, [kind]: e.target.value }))} placeholder="uploaded file name" />
      ))}
      <div className="md:col-span-2 flex justify-end"><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Create guide account"}</Button></div>
    </form>
  )
}
