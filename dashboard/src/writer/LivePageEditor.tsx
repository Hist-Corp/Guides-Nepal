import { useState, useEffect, useRef } from "react"
import { getPageSections, updateAllSections } from "../services/api"
import { FRONTEND_URL } from "../config/api"

const FIELD_GROUPS: Record<string, { key: string; label: string; type: string }[]> = {
  hero: [
    { key: "heading", label: "Heading", type: "text" },
    { key: "subtitle", label: "Subtitle", type: "textarea" },
    { key: "buttonText", label: "Button Text", type: "text" },
    { key: "tagline", label: "Tagline", type: "text" },
    { key: "primaryText", label: "Primary Brand Text", type: "text" },
  ],
  featured: [
    { key: "heading", label: "Heading", type: "text" },
    { key: "subtitle", label: "Subtitle", type: "textarea" },
    { key: "buttonText", label: "Button Text", type: "text" },
  ],
  promo: [
    { key: "heading", label: "Heading", type: "text" },
    { key: "subtitle", label: "Subtitle", type: "textarea" },
    { key: "buttonText", label: "Button Text", type: "text" },
  ],
  categories: [
    { key: "heading", label: "Heading", type: "text" },
    { key: "subtitle", label: "Subtitle", type: "textarea" },
  ],
  testimonials: [
    { key: "heading", label: "Heading", type: "text" },
    { key: "subtitle", label: "Subtitle", type: "textarea" },
  ],
  values: [{ key: "heading", label: "Heading", type: "text" }],
  footer: [
    { key: "supportEmail", label: "Support Email", type: "text" },
    { key: "copyright", label: "Copyright Text", type: "text" },
  ],
  text: [
    { key: "heading", label: "Heading", type: "text" },
    { key: "body", label: "Body Text", type: "textarea" },
  ],
  contact: [
    { key: "heading", label: "Heading", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "phone", label: "Phone", type: "text" },
    { key: "address", label: "Address", type: "text" },
  ],
}
const STYLE_FIELDS = [
  { key: "backgroundColor", label: "Background Color", type: "color" },
  { key: "textColor", label: "Text Color", type: "color" },
  { key: "accentColor", label: "Accent Color", type: "color" },
  { key: "alignment", label: "Alignment", type: "select", options: ["left", "center", "right"] },
  { key: "headingSize", label: "Heading Size", type: "text" },
  { key: "padding", label: "Padding", type: "text" },
]

const SECTION_BG: Record<string, string> = {
  hero: "#213448", promo: "#9A2143", footer: "#9A2143",
  featured: "#ffffff", categories: "#ffffff", values: "#ffffff",
  testimonials: "#f8f8f8", text: "#ffffff", contact: "#ffffff",
}

function PreviewSection({ section, selected, onSelect }: any) {
  const st = section.style || {}
  const c = section.content || {}
  const bg = st.backgroundColor || SECTION_BG[section.type] || "#ffffff"
  const color = st.textColor || "#213448"
  const align = st.alignment || "center"
  const hs = st.headingSize || "2rem"
  const rawItems = Array.isArray(c.items) ? c.items : []
  const isObjects = rawItems.length > 0 && typeof rawItems[0] === "object"

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(section) }}
      className={"LiveSection relative border-2 transition-all " + (selected ? "border-brand-yellow ring-2 ring-brand-yellow/40" : "border-transparent hover:border-brand-yellow/60")}
      style={{ background: bg, color, padding: st.padding || "2.5rem", textAlign: align, cursor: "pointer" }}
      title={selected ? "Selected" : "Click to edit this section"}
    >
      {selected && (
        <span className="absolute -top-3 left-3 bg-brand-yellow text-darkBlue text-xs font-bold px-2 py-0.5 rounded shadow">
          Editing: {section.title}
        </span>
      )}
      <div className="max-w-5xl mx-auto space-y-3">
        {c.heading && <h2 style={{ fontSize: hs, fontWeight: 700, color }}>{c.heading}</h2>}
        {c.subtitle && <p style={{ opacity: 0.85, fontSize: "1.1rem" }}>{c.subtitle}</p>}
        {c.body && <p style={{ fontSize: "1.05rem", lineHeight: 1.6 }}>{c.body}</p>}
        {c.buttonText && (
          <span style={{ display: "inline-block", marginTop: "0.75rem", background: st.accentColor || "#F4B400", color: "#213448", padding: "0.6rem 1.5rem", borderRadius: 8, fontWeight: 700 }}>
            {c.buttonText}
          </span>
        )}
        {c.tagline && <p style={{ fontSize: "0.95rem", opacity: 0.8 }}>{c.tagline}</p>}
        {isObjects && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: align === "center" ? "center" : "flex-start" }}>
            {rawItems.map((it: any, i: number) => (
              <div key={i} style={{ background: "rgba(0,0,0,0.06)", padding: "1rem 1.25rem", borderRadius: 12, minWidth: 220 }}>
                <div style={{ fontWeight: 700 }}>{it.name}</div>
                <div style={{ fontSize: "0.9rem", opacity: 0.85 }}>{it.text}</div>
                {it.rating != null && <div style={{ color: "#F4B400", fontWeight: 700 }}>{"*".repeat(Number(it.rating) || 5)}</div>}
              </div>
            ))}
          </div>
        )}
        {rawItems.length > 0 && !isObjects && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: align === "center" ? "center" : "flex-start" }}>
            {rawItems.map((it: any, i: number) => (
              <span key={i} style={{ background: "rgba(0,0,0,0.08)", padding: "0.4rem 1rem", borderRadius: 999, fontSize: "0.9rem" }}>{String(it)}</span>
            ))}
          </div>
        )}
        {c.email && <p style={{ opacity: 0.85 }}>{c.email} | {c.phone}</p>}
        {c.address && <p style={{ opacity: 0.7 }}>{c.address}</p>}
        {Array.isArray(c.topLinks) && (
          <div style={{ display: "flex", gap: "1rem", justifyContent: align === "center" ? "center" : "flex-start", opacity: 0.9 }}>
            {c.topLinks.map((l: string, i: number) => <span key={i} style={{ fontWeight: 600 }}>{l}</span>)}
          </div>
        )}
      </div>
    </div>
  )
}
export default function LivePageEditor({ slug, title, path, initialSections, onSaved, onClose }: {
  slug: string
  title: string
  path?: string
  initialSections?: any[]
  onSaved?: (sections: any[]) => void
  onClose: () => void
}) {
  const [sections, setSections] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [toast, setToast] = useState("")
  const [newType, setNewType] = useState("hero")
  // When the real frontend page path is known, preview the exact real page
  // inside an iframe (click-to-edit); otherwise fall back to the replica.
  const [previewMode, setPreviewMode] = useState<"real" | "replica">(path ? "real" : "replica")
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const previewUrl = `${FRONTEND_URL}${path || "/"}?cms_edit=1&cms_slug=${encodeURIComponent(slug)}`

  useEffect(() => { load() }, [slug])

  // Listen for clicks on sections of the real page inside the preview iframe
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e.data || {}
      if (data.type === "cms-section-click") {
        const match = sections.find((s) => s.id === data.id)
        if (match) {
          setSelected(match)
        } else {
          showToast(`Section "${data.label || data.id}" is not part of this page template yet`)
        }
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [sections])

  // Tell the embedded real page to re-fetch CMS content after a save
  const refreshRealPreview = () => {
    iframeRef.current?.contentWindow?.postMessage({ type: "cms-refresh", slug }, "*")
  }

  const load = async () => {
    setLoading(true)
    try {
      const data = await getPageSections(slug)
      let list: any[] = data.sections || []
      if (list.length === 0 && initialSections && initialSections.length > 0) {
        list = JSON.parse(JSON.stringify(initialSections))
        try { await updateAllSections(slug, list) } catch { /* keep local copy */ }
      }
      setSections(list)
    } catch (e) {
      console.error(e)
      if (initialSections) setSections(JSON.parse(JSON.stringify(initialSections)))
    } finally { setLoading(false) }
  }

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500) }

  const markUpdated = (updated: any) => {
    setSelected(updated)
    setSections(s => s.map(x => x.id === updated.id ? updated : x))
    setDirty(true)
  }

  const updateField = (key: string, value: any) => {
    if (!selected) return
    markUpdated({ ...selected, content: { ...selected.content, [key]: value } })
  }

  const updateStyle = (key: string, value: any) => {
    if (!selected) return
    markUpdated({ ...selected, style: { ...(selected.style || {}), [key]: value } })
  }

  const handleSelect = (section: any) => { setSelected({ ...section, content: { ...section.content }, style: { ...(section.style || {}) } }) }

  const addItem = (field: string) => {
    if (!selected) return
    const cur = selected.content[field] || []
    const items = [...cur]
    items.push(cur.length > 0 && typeof cur[0] === "object" ? { name: "New", text: "Click to edit", rating: 5 } : "New item")
    updateField(field, items)
  }

  const updateItem = (field: string, idx: number, value: string) => {
    if (!selected) return
    const items = [...selected.content[field]]
    items[idx] = value
    updateField(field, items)
  }

  const removeItem = (field: string, idx: number) => {
    if (!selected) return
    const items = [...selected.content[field]]
    items.splice(idx, 1)
    updateField(field, items)
  }

  const save = async () => {
    setSaving(true)
    try {
      await updateAllSections(slug, sections)
      setDirty(false)
      showToast("Changes saved successfully")
      refreshRealPreview()
      onSaved?.(sections)
    } catch (e) {
      console.error(e)
      showToast("Failed to save changes")
    } finally { setSaving(false) }
  }

  const addSection = () => {
    const id = `sec-${Date.now()}`
    const blank: any = {
      id, title: newType.charAt(0).toUpperCase() + newType.slice(1) + " Section", type: newType,
      content: { heading: "New Section Heading" },
      style: { backgroundColor: SECTION_BG[newType] || "#ffffff", textColor: "#213448", alignment: "center" },
    }
    setSections(s => [...s, blank])
    setSelected(blank)
    setDirty(true)
  }

  const removeCurrent = () => {
    if (!selected) return
    if (!confirm("Delete this section from the page?")) return
    const id = selected.id
    setSelected(null)
    setSections(s => s.filter(x => x.id !== id))
    setDirty(true)
  }

  const moveSection = (dir: -1 | 1) => {
    if (!selected) return
    const idx = sections.findIndex(x => x.id === selected.id)
    const target = idx + dir
    if (idx < 0 || target < 0 || target >= sections.length) return
    const next = [...sections]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    setSections(next)
    setDirty(true)
  }

  const fields = selected ? FIELD_GROUPS[selected.type] || [] : []
  return (
    <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col">
      <div className="bg-darkBlue text-white p-3 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-sm border border-white/40 hover:bg-white/20 px-3 py-1.5 rounded-lg font-medium">Back</button>
          <h2 className="font-bold text-lg">Live Editor - {title}</h2>
          {dirty && <span className="text-xs bg-brand-yellow text-darkBlue px-2 py-0.5 rounded font-semibold">Unsaved changes</span>}
        </div>
        <div className="flex items-center gap-2">
          <select value={newType} onChange={(e) => setNewType(e.target.value)} className="text-sm text-darkBlue rounded-lg px-2 py-1.5">
            {Object.keys(FIELD_GROUPS).map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
          <button onClick={addSection} className="text-sm bg-brand-yellow text-darkBlue px-3 py-1.5 rounded-lg font-semibold">+ Add Section</button>
          <button onClick={save} disabled={!dirty || saving} className="text-sm bg-green-500 text-white px-4 py-1.5 rounded-lg font-semibold disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-darkBlue"></div></div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-white flex flex-col">
            <div className="border-b border-gray-200 px-4 py-2 flex items-center justify-between bg-gray-50">
              <span className="text-xs font-semibold text-gray-500">
                {previewMode === "real" ? "LIVE PREVIEW - real page - click any section to edit it" : "REPLICA PREVIEW - click any section to edit it"}
              </span>
              {path && (
                <div className="flex items-center gap-1">
                  <button onClick={() => setPreviewMode("real")} className={"text-xs px-2 py-1 rounded font-semibold " + (previewMode === "real" ? "bg-darkBlue text-white" : "border text-gray-600 hover:bg-gray-100")}>Real page</button>
                  <button onClick={() => setPreviewMode("replica")} className={"text-xs px-2 py-1 rounded font-semibold " + (previewMode === "replica" ? "bg-darkBlue text-white" : "border text-gray-600 hover:bg-gray-100")}>Replica</button>
                </div>
              )}
            </div>
            {previewMode === "real" && path ? (
              <iframe
                ref={iframeRef}
                src={previewUrl}
                title={`Live preview of ${title}`}
                className="flex-1 w-full border-0"
              />
            ) : sections.length === 0 ? (
              <div className="text-center text-gray-400 py-16">No sections yet. Add one with the button above.</div>
            ) : (
              sections.map((s) => (
                <PreviewSection key={s.id} section={s} selected={selected?.id === s.id} onSelect={handleSelect} />
              ))
            )}
          </div>

          {selected ? (
            <div className="w-96 border-l border-gray-200 bg-white flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-darkBlue">{selected.title}</div>
                  <button onClick={removeCurrent} className="text-xs text-red-600 hover:underline">Remove</button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">Type: {selected.type}</span>
                  <button onClick={() => moveSection(-1)} className="text-xs border rounded px-1.5 hover:bg-gray-100" title="Move up">Up</button>
                  <button onClick={() => moveSection(1)} className="text-xs border rounded px-1.5 hover:bg-gray-100" title="Move down">Down</button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <div className="font-semibold text-gray-700 text-sm mb-2">Content</div>
                  {fields.length === 0 && <p className="text-xs text-gray-400">No rich fields for this section type.</p>}
                  {fields.map((f) => (
                    <div key={f.key} className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                      {f.type === "textarea" ? (
                        <textarea value={selected.content[f.key] || ""} onChange={(e) => updateField(f.key, e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none" />
                      ) : (
                        <input value={selected.content[f.key] || ""} onChange={(e) => updateField(f.key, e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                      )}
                    </div>
                  ))}
{(selected.type === "categories" || selected.type === "values") && (
  <SplitItems 
    items={selected.content.items || []} 
    onAdd={() => addItem("items")} 
    onUpdate={(i: number, v: string) => updateItem("items", i, v)} 
    onRemove={(i: number) => removeItem("items", i)} 
  />
)}
{(selected.type === "footer") && (
  <SplitItems 
    items={selected.content.topLinks || []} 
    onAdd={() => addItem("topLinks")} 
    onUpdate={(i: number, v: string) => updateItem("topLinks", i, v)} 
    onRemove={(i: number) => removeItem("topLinks", i)} 
  />
)}
                </div>
                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-700 text-sm mb-2">Customization</div>
                  <div className="grid grid-cols-2 gap-3">
{STYLE_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                {f.type === "color" ? (
                  <input type="color" value={selected.style[f.key] || "#000000"} onChange={(e) => updateStyle(f.key, e.target.value)} className="w-full h-9 border border-gray-300 rounded cursor-pointer" />
                ) : f.type === "select" ? (
                  <select value={selected.style[f.key] || "center"} onChange={(e) => updateStyle(f.key, e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm">
                    {f.options?.map((o) => (<option key={o} value={o}>{o}</option>))
                  </select>
                ) : (
                  <input 
                    value={selected.style[f.key] || ""} 
                    onChange={(e) => updateStyle(f.key, e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm"
                    placeholder={f.key === "headingSize" ? "2rem (e.g., 1.5rem, 2em)" : f.key === "padding" ? "2.5rem (e.g., 1rem 2rem)" : ""}
                  />
                )}
              </div>
            ))}
                  </div>
                </div>
              </div>
              <div className="p-3 border-t bg-gray-50">
                <button onClick={save} disabled={!dirty || saving} className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
              </div>
            </div>
          ) : (
            <div className="w-96 border-l border-gray-200 bg-white flex items-center justify-center text-gray-400 px-6 text-center">Click a section in the live preview to edit its content and customization.</div>
          )}
        </div>
      )}

      {toast && <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-darkBlue text-white px-5 py-2 rounded-lg shadow-lg text-sm">{toast}</div>}
    </div>
  )
}

function SplitItems({ items, onAdd, onUpdate, onRemove }: any) {
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-600">Items</span>
        <button onClick={onAdd} className="text-xs text-primary font-semibold hover:underline">+ Add</button>
      </div>
      {items.map((it: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <input value={typeof it === "object" ? it.name : it} onChange={(e) => onUpdate(i, e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
          <button onClick={() => onRemove(i)} className="text-xs text-red-600 hover:underline">x</button>
        </div>
      ))}
    </div>
  )
}