import { useState, useEffect } from "react"
import Modal from "../components/Modal"
import { getContentGuides, createContentGuide, updateContentGuide, deleteContentGuide } from "../services/api"
import LivePageEditor from "./LivePageEditor"

export default function WriterGuidesContent() {
  const [contents, setContents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [form, setForm] = useState({ title: "", type: "description" })
  const [liveEdit, setLiveEdit] = useState<any>(null)

  useEffect(() => { fetchContent() }, [])

  const fetchContent = async () => {
    setLoading(true)
    try {
      const data = await getContentGuides()
      setContents(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching guides content:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!form.title.trim()) return
    setActionLoading(-1)
    try {
      await createContentGuide({ title: form.title, type: form.type })
      setOpenCreate(false)
      setForm({ title: "", type: "description" })
      fetchContent()
    } catch (error) {
      console.error("Error creating content:", error)
      alert("Failed to create content")
    } finally {
      setActionLoading(null)
    }
  }

  const handleEdit = async () => {
    if (!form.title.trim() || !openEdit) return
    setActionLoading(openEdit.id)
    try {
      await updateContentGuide(openEdit.id, { title: form.title, type: form.type })
      setOpenEdit(null)
      setForm({ title: "", type: "description" })
      fetchContent()
    } catch (error) {
      console.error("Error updating content:", error)
      alert("Failed to update content")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (contentId: number) => {
    if (!confirm("Are you sure you want to delete this content?")) return
    setActionLoading(contentId)
    try {
      await deleteContentGuide(contentId)
      fetchContent()
    } catch (error) {
      console.error("Error deleting content:", error)
      alert("Failed to delete content")
    } finally {
      setActionLoading(null)
    }
  }

  const openEditModal = (content: any) => {
    setOpenEdit(content)
    setForm({ title: content.title, type: content.type })
  }

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-darkBlue">Guides Content</div>
      <div className="rounded-2xl bg-white p-4 border">
        <div className="flex justify-between items-center">
          <div className="font-semibold text-darkBlue">Experience Descriptions</div>
          <button className="rounded-lg px-3 py-2 bg-brand-yellow text-darkBlue font-semibold disabled:opacity-50" onClick={() => { setOpenCreate(true); setForm({ title: "", type: "description" }) }} disabled={actionLoading === -1}>Add content</button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
        ) : (
          <ul className="mt-3 space-y-2">
            {contents.length === 0 ? (
              <li className="text-sm text-gray-500 py-4 text-center">No content found</li>
            ) : (
              contents.map((content) => (
                <li key={content.id} className="flex items-center justify-between">
                  <div><div className="text-sm font-medium">{content.title}</div><div className="text-xs text-gray-500">{content.type} • {content.status}</div></div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg px-3 py-1 border disabled:opacity-50" onClick={() => setLiveEdit(content)} disabled={actionLoading === content.id}>Edit</button>
                    <button className="rounded-lg px-3 py-1 border text-gray-600 disabled:opacity-50" onClick={() => openEditModal(content)} disabled={actionLoading === content.id}>Settings</button>
                    <button className="rounded-lg px-3 py-1 border bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50" onClick={() => handleDelete(content.id)} disabled={actionLoading === content.id}>Remove</button>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      <Modal open={openCreate} title="Add Content" onClose={() => setOpenCreate(false)}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter title" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"><option value="description">Description</option><option value="itinerary">Itinerary</option><option value="faq">FAQ</option></select></div>
          <button className="w-full bg-primary text-white py-2 rounded-lg font-semibold disabled:opacity-50" onClick={handleCreate} disabled={!form.title.trim() || actionLoading === -1}>Add Content</button>
        </div>
      </Modal>
      <Modal open={openEdit !== null} title="Edit Content" onClose={() => setOpenEdit(null)}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter title" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"><option value="description">Description</option><option value="itinerary">Itinerary</option><option value="faq">FAQ</option></select></div>
          <button className="w-full bg-primary text-white py-2 rounded-lg font-semibold disabled:opacity-50" onClick={handleEdit} disabled={!form.title.trim() || actionLoading === openEdit?.id}>Save Changes</button>
        </div>
      </Modal>
      {liveEdit && (
        <LivePageEditor
          slug={`guides-${liveEdit.id}`}
          title={liveEdit.title}
          initialSections={[
            {
              id: "gc-hero", title: "Content Header", type: "hero",
              content: { heading: liveEdit.title, subtitle: `Type: ${liveEdit.type} - Status: ${liveEdit.status || "draft"}`, buttonText: "" },
              style: { backgroundColor: "#213448", textColor: "#ffffff", accentColor: "#F4B400", alignment: "left", headingSize: "2.2rem", padding: "3rem" },
            },
            {
              id: "gc-body", title: "Content Body", type: "text",
              content: { heading: "", body: liveEdit.body || "Write the content here. Click this section in the preview to edit the text." },
              style: { backgroundColor: "#ffffff", textColor: "#213448", alignment: "left", padding: "2.5rem" },
            },
            {
              id: "gc-highlights", title: "Highlights", type: "values",
              content: { heading: "Highlights", items: liveEdit.highlights || ["Highlight one", "Highlight two"] },
              style: { backgroundColor: "#f8f8f8", textColor: "#213448", alignment: "center" },
            },
          ]}
          onSaved={async (sections) => {
            const hero = sections.find((s) => s.id === "gc-hero")
            const body = sections.find((s) => s.id === "gc-body")
            const highlights = sections.find((s) => s.id === "gc-highlights")
            if (hero?.content?.heading || body?.content?.body) {
              try {
                await updateContentGuide(liveEdit.id, {
                  title: hero?.content?.heading || liveEdit.title,
                  body: body?.content?.body,
                  highlights: highlights?.content?.items,
                })
              } catch { /* sections already persisted */ }
            }
          }}
          onClose={fetchContent}
        />
      )}
    </div>
  )
}