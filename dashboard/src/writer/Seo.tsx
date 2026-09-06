import { useState, useEffect } from "react"
import Modal from "../components/Modal"
import { getSeo, createSeo, updateSeo, deleteSeo } from "../services/api"
import LivePageEditor from "./LivePageEditor"

export default function WriterSeo() {
  const [seoEntries, setSeoEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [liveEdit, setLiveEdit] = useState<any>(null)
  const [form, setForm] = useState({ page: "", title: "", description: "", keywords: "" })

  useEffect(() => { fetchSeo() }, [])

  const fetchSeo = async () => {
    setLoading(true)
    try {
      const data = await getSeo()
      setSeoEntries(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching SEO:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!form.page.trim() || !form.title.trim()) return
    setActionLoading(-1)
    try {
      await createSeo(form)
      setOpenCreate(false)
      setForm({ page: "", title: "", description: "", keywords: "" })
      fetchSeo()
    } catch (error) {
      console.error("Error creating SEO:", error)
      alert("Failed to create SEO entry")
    } finally {
      setActionLoading(null)
    }
  }

  const handleEdit = async () => {
    if (!form.page.trim() || !form.title.trim() || !openEdit) return
    setActionLoading(openEdit.id)
    try {
      await updateSeo(openEdit.id, form)
      setOpenEdit(null)
      setForm({ page: "", title: "", description: "", keywords: "" })
      fetchSeo()
    } catch (error) {
      console.error("Error updating SEO:", error)
      alert("Failed to update SEO entry")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (seoId: number) => {
    if (!confirm("Are you sure you want to delete this SEO entry?")) return
    setActionLoading(seoId)
    try {
      await deleteSeo(seoId)
      fetchSeo()
    } catch (error) {
      console.error("Error deleting SEO:", error)
      alert("Failed to delete SEO entry")
    } finally {
      setActionLoading(null)
    }
  }

  const openEditModal = (seo: any) => {
    setOpenEdit(seo)
    setForm({ page: seo.page, title: seo.title, description: seo.description, keywords: seo.keywords })
  }

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-darkBlue">SEO Management</div>
      <div className="rounded-2xl bg-white p-4 border">
        <div className="flex justify-between items-center">
          <div className="font-semibold text-darkBlue">SEO Entries</div>
          <button className="rounded-lg px-3 py-2 bg-brand-yellow text-darkBlue font-semibold disabled:opacity-50" onClick={() => { setOpenCreate(true); setForm({ page: "", title: "", description: "", keywords: "" }) }} disabled={actionLoading === -1}>Add SEO Entry</button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
        ) : (
          <ul className="mt-3 space-y-2">
            {seoEntries.length === 0 ? (
              <li className="text-sm text-gray-500 py-4 text-center">No SEO entries found</li>
            ) : (
              seoEntries.map((seo) => (
                <li key={seo.id} className="flex items-center justify-between border-b pb-2">
                  <div><div className="text-sm font-medium">{seo.page}</div><div className="text-xs text-gray-500 truncate max-w-md">{seo.title}</div></div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg px-3 py-1 border disabled:opacity-50" onClick={() => setLiveEdit(seo)} disabled={actionLoading === seo.id}>Edit</button>
                    <button className="rounded-lg px-3 py-1 border text-gray-600 disabled:opacity-50" onClick={() => openEditModal(seo)} disabled={actionLoading === seo.id}>Settings</button>
                    <button className="rounded-lg px-3 py-1 border bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50" onClick={() => handleDelete(seo.id)} disabled={actionLoading === seo.id}>Remove</button>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      <Modal open={openCreate} title="Add SEO Entry" onClose={() => setOpenCreate(false)}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Page</label><input type="text" value={form.page} onChange={(e) => setForm({ ...form, page: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g., Homepage" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="SEO title" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none" placeholder="SEO description" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label><input type="text" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="keyword1, keyword2" /></div>
          <button className="w-full bg-primary text-white py-2 rounded-lg font-semibold disabled:opacity-50" onClick={handleCreate} disabled={!form.page.trim() || !form.title.trim() || actionLoading === -1}>Add Entry</button>
        </div>
      </Modal>
      <Modal open={openEdit !== null} title="Edit SEO Entry" onClose={() => setOpenEdit(null)}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Page</label><input type="text" value={form.page} onChange={(e) => setForm({ ...form, page: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary h-20 resize-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label><input type="text" value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <button className="w-full bg-primary text-white py-2 rounded-lg font-semibold disabled:opacity-50" onClick={handleEdit} disabled={!form.page.trim() || !form.title.trim() || actionLoading === openEdit?.id}>Save Changes</button>
        </div>
      </Modal>
      {liveEdit && (
        <LivePageEditor
          slug={`seo-${liveEdit.id}`}
          title={liveEdit.page}
          initialSections={[
            {
              id: "seo-hero", title: "Search Result Preview", type: "hero",
              content: { heading: liveEdit.title, subtitle: `https://guides-nepal.com - ${liveEdit.page}`, buttonText: "", tagline: "This is how your page appears in Google search results" },
              style: { backgroundColor: "#213448", textColor: "#ffffff", accentColor: "#F4B400", alignment: "left", headingSize: "1.8rem", padding: "2.5rem" },
            },
            {
              id: "seo-desc", title: "Meta Description", type: "text",
              content: { heading: "Meta Description", body: liveEdit.description || "Add your meta description here. Click this section to edit." },
              style: { backgroundColor: "#ffffff", textColor: "#213448", alignment: "left", padding: "2.5rem" },
            },
            {
              id: "seo-keywords", title: "Keywords", type: "categories",
              content: { heading: "Target Keywords", items: (liveEdit.keywords || "").split(",").map((k: string) => k.trim()).filter(Boolean) },
              style: { backgroundColor: "#f8f8f8", textColor: "#213448", headingSize: "1.2rem" },
            },
          ]}
          onSaved={async (sections) => {
            const hero = sections.find((s) => s.id === "seo-hero")
            const desc = sections.find((s) => s.id === "seo-desc")
            const kw = sections.find((s) => s.id === "seo-keywords")
            if (hero?.content?.heading || desc?.content?.body) {
              try {
                await updateSeo(liveEdit.id, {
                  title: hero?.content?.heading || liveEdit.title,
                  description: desc?.content?.body,
                  keywords: Array.isArray(kw?.content?.items) ? kw.content.items.join(", ") : liveEdit.keywords,
                })
              } catch { /* sections already persisted */ }
            }
          }}
          onClose={fetchSeo}
        />
      )}
    </div>
  )
}