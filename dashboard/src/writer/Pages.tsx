import { useState, useEffect } from "react"
import Modal from "../components/Modal"
import { getContentPages, createContentPage, updateContentPage, deleteContentPage } from "../services/api"
import LivePageEditor from "./LivePageEditor"

export default function WriterPages() {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [form, setForm] = useState({ title: "", slug: "" })
  const [liveEdit, setLiveEdit] = useState<any>(null)

  useEffect(() => { fetchPages() }, [])

  const fetchPages = async () => {
    setLoading(true)
    try {
      const data = await getContentPages()
      setPages(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching pages:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!form.title.trim()) return
    setActionLoading(-1)
    try {
      await createContentPage({ title: form.title, slug: form.slug || form.title.toLowerCase().replace(/ /g, "-") })
      setOpenCreate(false)
      setForm({ title: "", slug: "" })
      fetchPages()
    } catch (error) {
      console.error("Error creating page:", error)
      alert("Failed to create page")
    } finally {
      setActionLoading(null)
    }
  }

  const handleEdit = async () => {
    if (!form.title.trim() || !openEdit) return
    setActionLoading(openEdit.id)
    try {
      await updateContentPage(openEdit.id, { title: form.title, slug: form.slug || form.title.toLowerCase().replace(/ /g, "-") })
      setOpenEdit(null)
      setForm({ title: "", slug: "" })
      fetchPages()
    } catch (error) {
      console.error("Error updating page:", error)
      alert("Failed to update page")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (pageId: number) => {
    if (!confirm("Are you sure you want to delete this page?")) return
    setActionLoading(pageId)
    try {
      await deleteContentPage(pageId)
      fetchPages()
    } catch (error) {
      console.error("Error deleting page:", error)
      alert("Failed to delete page")
    } finally {
      setActionLoading(null)
    }
  }

  const openEditModal = (page: any) => {
    setOpenEdit(page)
    setForm({ title: page.title, slug: page.slug })
  }

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-darkBlue">Website Pages</div>
      <div className="rounded-2xl bg-white p-4 border">
        <div className="flex justify-between items-center">
          <div className="font-semibold text-darkBlue">Pages</div>
          <button className="rounded-lg px-3 py-2 bg-brand-yellow text-darkBlue font-semibold disabled:opacity-50" onClick={() => { setOpenCreate(true); setForm({ title: "", slug: "" }) }} disabled={actionLoading === -1}>Create page</button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
        ) : (
          <ul className="mt-3 space-y-2">
            {pages.length === 0 ? (
              <li className="text-sm text-gray-500 py-4 text-center">No pages found</li>
            ) : (
              pages.map((page) => (
                <li key={page.id} className="flex items-center justify-between">
                  <div><div className="text-sm font-medium">{page.title}</div><div className="text-xs text-gray-500">/{page.slug} • {page.status}</div></div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg px-3 py-1 border disabled:opacity-50" onClick={() => setLiveEdit(page)} disabled={actionLoading === page.id}>Edit</button>
                    <button className="rounded-lg px-3 py-1 border text-gray-600 disabled:opacity-50" onClick={() => openEditModal(page)} disabled={actionLoading === page.id}>Settings</button>
                    <button className="rounded-lg px-3 py-1 border bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50" onClick={() => handleDelete(page.id)} disabled={actionLoading === page.id}>Remove</button>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      <Modal open={openCreate} title="Create Page" onClose={() => setOpenCreate(false)}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter page title" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug (optional)</label><input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="auto-generated" /></div>
          <button className="w-full bg-primary text-white py-2 rounded-lg font-semibold disabled:opacity-50" onClick={handleCreate} disabled={!form.title.trim() || actionLoading === -1}>Create Page</button>
        </div>
      </Modal>
      <Modal open={openEdit !== null} title="Edit Page" onClose={() => setOpenEdit(null)}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter page title" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug</label><input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="page-slug" /></div>
          <button className="w-full bg-primary text-white py-2 rounded-lg font-semibold disabled:opacity-50" onClick={handleEdit} disabled={!form.title.trim() || actionLoading === openEdit?.id}>Save Changes</button>
        </div>
      </Modal>
      {liveEdit && (
        <LivePageEditor
          slug={liveEdit.slug}
          title={liveEdit.title}
          onClose={() => { setLiveEdit(null); fetchPages() }}
        />
      )}
    </div>
  )
}