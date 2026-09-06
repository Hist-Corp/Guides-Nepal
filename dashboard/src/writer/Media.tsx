import { useState, useEffect } from "react"
import { getMedia, uploadMedia, deleteMedia, updateMedia } from "../services/api"
import LivePageEditor from "./LivePageEditor"

export default function WriterMedia() {
  const [media, setMedia] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [liveEdit, setLiveEdit] = useState<any>(null)
  const [uploadForm, setUploadForm] = useState({ name: "", type: "image", url: "" })

  const fetchMedia = async () => {
    setLoading(true)
    try { setMedia(await getMedia()) } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  useEffect(() => { fetchMedia() }, [])

  const handleUpload = async () => {
    if (!uploadForm.name.trim()) return
    setActionLoading(-1)
    try {
      await uploadMedia({ ...uploadForm, size: "1.0 MB", uploaded: new Date().toISOString().slice(0, 10) })
      setUploadForm({ name: "", type: "image", url: "" })
      await fetchMedia()
    } catch (e) { console.error(e); alert("Failed to upload media") } finally { setActionLoading(null) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this media file?")) return
    setActionLoading(id)
    try { await deleteMedia(id); await fetchMedia() } catch (e) { console.error(e); alert("Failed to delete") } finally { setActionLoading(null) }
  }

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-darkBlue">Media Library</div>
      <div className="rounded-2xl bg-white p-4 border">
        <div className="font-semibold text-darkBlue mb-3">Upload Media</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input value={uploadForm.name} onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })} placeholder="File name (e.g. hero.jpg)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <select value={uploadForm.type} onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="image">Image</option><option value="video">Video</option><option value="document">Document</option>
          </select>
          <input value={uploadForm.url} onChange={(e) => setUploadForm({ ...uploadForm, url: e.target.value })} placeholder="URL (optional)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <button className="rounded-lg px-3 py-2 bg-brand-yellow text-darkBlue font-semibold disabled:opacity-50" onClick={handleUpload} disabled={!uploadForm.name.trim() || actionLoading === -1}>{actionLoading === -1 ? "Uploading..." : "Upload"}</button>
        </div>
      </div>
      <div className="rounded-2xl bg-white p-4 border">
        {loading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {media.length === 0 ? (
              <div className="text-sm text-gray-500 py-4 text-center col-span-full">No media files found</div>
            ) : media.map((item) => (
              <div key={item.id} className="border rounded-xl p-3">
                <div className="h-24 bg-gray-100 rounded-lg mb-2 flex items-center justify-center text-gray-400 text-sm">{item.type === "image" ? "🖼" : item.type === "video" ? "🎬" : "📄"} {item.name}</div>
                <div className="text-sm font-medium truncate">{item.name}</div>
                <div className="text-xs text-gray-500 mb-3">{item.type} - {item.size} - {item.uploaded}</div>
                <div className="flex gap-2">
                  <button className="flex-1 rounded-lg px-3 py-1 border text-sm hover:bg-gray-50 disabled:opacity-50" onClick={() => setLiveEdit(item)} disabled={actionLoading === item.id}>Edit</button>
                  <button className="flex-1 rounded-lg px-3 py-1 border bg-red-50 text-red-700 hover:bg-red-100 text-sm disabled:opacity-50" onClick={() => handleDelete(item.id)} disabled={actionLoading === item.id}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {liveEdit && (
        <LivePageEditor
          slug={`media-${liveEdit.id}`}
          title={liveEdit.name}
          initialSections={[{
            id: "media-card", title: "Media Preview", type: "hero",
            content: { heading: liveEdit.name, subtitle: `Type: ${liveEdit.type} - Size: ${liveEdit.size}`, buttonText: "View File", tagline: liveEdit.url || "" },
            style: { backgroundColor: "#213448", textColor: "#ffffff", accentColor: "#F4B400", alignment: "center", headingSize: "2rem", padding: "3rem" },
          }]}
          onSaved={async (sections) => {
            const card = sections.find((s) => s.id === "media-card")
            if (card?.content?.heading) {
              try { await updateMedia(liveEdit.id, { name: card.content.heading }) } catch { /* persisted in sections */ }
            }
          }}
          onClose={fetchMedia}
        />
      )}
    </div>
  )
}
