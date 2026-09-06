import { useState, useEffect } from "react"
import Modal from "../components/Modal"
import { getContentBlog, createContentBlog, updateContentBlog, deleteContentBlog } from "../services/api"
import LivePageEditor from "./LivePageEditor"

export default function WriterBlog() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [form, setForm] = useState({ title: "", slug: "" })
  const [liveEdit, setLiveEdit] = useState<any>(null)

  useEffect(() => { fetchBlog() }, [])

  const fetchBlog = async () => {
    setLoading(true)
    try {
      const data = await getContentBlog()
      setPosts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching blog:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!form.title.trim()) return
    setActionLoading(-1)
    try {
      await createContentBlog({ title: form.title, slug: form.slug || form.title.toLowerCase().replace(/ /g, "-") })
      setOpenCreate(false)
      setForm({ title: "", slug: "" })
      fetchBlog()
    } catch (error) {
      console.error("Error creating article:", error)
      alert("Failed to create article")
    } finally {
      setActionLoading(null)
    }
  }

  const handleEdit = async () => {
    if (!form.title.trim() || !openEdit) return
    setActionLoading(openEdit.id)
    try {
      await updateContentBlog(openEdit.id, { title: form.title, slug: form.slug || form.title.toLowerCase().replace(/ /g, "-") })
      setOpenEdit(null)
      setForm({ title: "", slug: "" })
      fetchBlog()
    } catch (error) {
      console.error("Error updating article:", error)
      alert("Failed to update article")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this article?")) return
    setActionLoading(postId)
    try {
      await deleteContentBlog(postId)
      fetchBlog()
    } catch (error) {
      console.error("Error deleting article:", error)
      alert("Failed to delete article")
    } finally {
      setActionLoading(null)
    }
  }

  const openEditModal = (post: any) => {
    setOpenEdit(post)
    setForm({ title: post.title, slug: post.slug })
  }

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-darkBlue">Blog</div>
      <div className="rounded-2xl bg-white p-4 border">
        <div className="flex justify-between items-center">
          <div className="font-semibold text-darkBlue">Articles</div>
          <button className="rounded-lg px-3 py-2 bg-brand-yellow text-darkBlue font-semibold disabled:opacity-50" onClick={() => { setOpenCreate(true); setForm({ title: "", slug: "" }) }} disabled={actionLoading === -1}>Write article</button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
        ) : (
          <ul className="mt-3 space-y-2">
            {posts.length === 0 ? (
              <li className="text-sm text-gray-500 py-4 text-center">No articles found</li>
            ) : (
              posts.map((post) => (
                <li key={post.id} className="flex items-center justify-between">
                  <div><div className="text-sm font-medium">{post.title}</div><div className="text-xs text-gray-500">{post.author} • {post.date} • {post.status}</div></div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg px-3 py-1 border disabled:opacity-50" onClick={() => setLiveEdit(post)} disabled={actionLoading === post.id}>Edit</button>
                    <button className="rounded-lg px-3 py-1 border text-gray-600 disabled:opacity-50" onClick={() => openEditModal(post)} disabled={actionLoading === post.id}>Settings</button>
                    <button className="rounded-lg px-3 py-1 border bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50" onClick={() => handleDelete(post.id)} disabled={actionLoading === post.id}>Remove</button>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      <Modal open={openCreate} title="Write Article" onClose={() => setOpenCreate(false)}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Article Title</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter article title" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug (optional)</label><input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="auto-generated" /></div>
          <button className="w-full bg-primary text-white py-2 rounded-lg font-semibold disabled:opacity-50" onClick={handleCreate} disabled={!form.title.trim() || actionLoading === -1}>Publish Article</button>
        </div>
      </Modal>
      <Modal open={openEdit !== null} title="Edit Article" onClose={() => setOpenEdit(null)}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Article Title</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter article title" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug</label><input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="article-slug" /></div>
          <button className="w-full bg-primary text-white py-2 rounded-lg font-semibold disabled:opacity-50" onClick={handleEdit} disabled={!form.title.trim() || actionLoading === openEdit?.id}>Save Changes</button>
        </div>
      </Modal>
      {liveEdit && (
        <LivePageEditor
          slug={`blog-${liveEdit.id}`}
          title={liveEdit.title}
          initialSections={[
            {
              id: "blog-hero", title: "Article Header", type: "hero",
              content: { heading: liveEdit.title, subtitle: `${liveEdit.author || "Staff"} - ${liveEdit.date || ""}`, buttonText: "", tagline: liveEdit.status || "draft" },
              style: { backgroundColor: "#213448", textColor: "#ffffff", accentColor: "#F4B400", alignment: "left", headingSize: "2.5rem", padding: "3rem" },
            },
            {
              id: "blog-body", title: "Article Body", type: "text",
              content: { heading: "", body: liveEdit.content || "Write the article body here. Click this section in the preview to edit the text." },
              style: { backgroundColor: "#ffffff", textColor: "#213448", alignment: "left", padding: "2.5rem" },
            },
          ]}
          onSaved={async (sections) => {
            const hero = sections.find((s) => s.id === "blog-hero")
            const body = sections.find((s) => s.id === "blog-body")
            if (hero?.content?.heading || body?.content?.body) {
              try {
                await updateContentBlog(liveEdit.id, {
                  title: hero?.content?.heading || liveEdit.title,
                  content: body?.content?.body,
                })
              } catch { /* sections already persisted */ }
            }
          }}
          onClose={fetchBlog}
        />
      )}
    </div>
  )
}