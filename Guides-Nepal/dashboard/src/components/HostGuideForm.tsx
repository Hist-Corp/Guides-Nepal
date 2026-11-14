import { FormEvent, useState } from "react"
import Button from "./Button"
import Field from "./Field"
import { createHostGuide } from "../services/hostGuidesApi"
import { User, Briefcase, FileText, Upload, CheckCircle2, ChevronRight } from "lucide-react"

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

const sectionIcon = (icon: React.ReactNode, title: string, subtitle?: string) => (
  <div className="mb-4 flex items-start gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-bold text-main">{title}</h3>
      {subtitle ? <p className="text-xs text-soft">{subtitle}</p> : null}
    </div>
  </div>
)

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
      (() => { const _d = e?.response?.data?.detail; const _m = typeof _d === 'string' ? _d : (Array.isArray(_d) ? _d.map((x: any) => (typeof x === 'string' ? x : x?.msg || JSON.stringify(x))).join(' ') : (_d && typeof _d === 'object' ? (_d.msg || JSON.stringify(_d)) : null)); onError(_m || "Please complete every registration field — mirrors BecomeGuidePage."); })()
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} className="mb-6 overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      {/* Header */}
      <div className="border-b border-line bg-gradient-to-r from-brand-50 to-surface px-6 py-5 dark:from-brand-900/20">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-main">Add a new guide</h2>
            <p className="text-sm text-soft">Fill in the same details as frontend registration. Assigned guides appear on traveler search and experience pages.</p>
          </div>
        </div>
      </div>

      <div className="space-y-8 p-6">
        {/* Section 1: Personal information */}
        <section>
          {sectionIcon(<User className="h-5 w-5" />, "1 · Personal information", "Registration details for the guide account")}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name *" required value={form.full_name} onChange={(e: any) => set("full_name", e.target.value)} />
            <Field label="Email *" required type="email" value={form.email} onChange={(e: any) => set("email", e.target.value)} />
            <Field label="Password (login, 8+ chars) *" required type="password" value={form.password} onChange={(e: any) => set("password", e.target.value)} />
            <Field label="Phone *" required value={form.phone} onChange={(e: any) => set("phone", e.target.value)} />
            <Field label="NIN *" required value={form.nin_number} onChange={(e: any) => set("nin_number", e.target.value)} />
            <Field label="City" value={form.city} onChange={(e: any) => set("city", e.target.value)} />
          </div>
        </section>

        {/* Section 2: Professional details */}
        <section>
          {sectionIcon(<Briefcase className="h-5 w-5" />, "2 · Professional details", "Catalog profile shown to travelers")}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Professional title *" required value={form.role_title} onChange={(e: any) => set("role_title", e.target.value)} />
            <Field label="Lives in" value={form.lives_in} onChange={(e: any) => set("lives_in", e.target.value)} />
            <Field label="Languages (comma separated) *" required value={form.languages} onChange={(e: any) => set("languages", e.target.value)} />
            <Field label="Cities (comma separated) *" required value={form.cities} onChange={(e: any) => set("cities", e.target.value)} />
            <Field label="Profile image URL" value={form.image} onChange={(e: any) => set("image", e.target.value)} />
            <Field label="Region" value={form.region} onChange={(e: any) => set("region", e.target.value)} />
            <Field as="textarea" className="md:col-span-2" label="Bio (min 30 chars) *" required minLength={30} value={form.bio} onChange={(e: any) => set("bio", e.target.value)} />
          </div>
        </section>

        {/* Section 3: Verification documents */}
        <section>
          {sectionIcon(<FileText className="h-5 w-5" />, "3 · Verification documents", "File names for uploaded documents")}
          <div className="grid gap-4 md:grid-cols-2">
            {KINDS.map((kind) => (
              <Field key={kind} label={kind} value={documents[kind] ?? ""} onChange={(e: any) => setDocuments((c) => ({ ...c, [kind]: e.target.value }))} placeholder="uploaded file name" />
            ))}
          </div>
        </section>

        {/* Submit */}
        <div className="flex items-center justify-between border-t border-line pt-5">
          <p className="text-xs text-soft">All fields marked * are required.</p>
          <Button type="submit" disabled={saving} className="px-6">
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Create guide account
              </span>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
