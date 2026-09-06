import { useState, useEffect } from "react"
import { getMedia, uploadMedia, deleteMedia, updateMedia } from "../services/api"
import LivePageEditor from "./LivePageEditor"

export default function WriterMedia() {
  const [media, setMedia] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [liveEdit, setLiveEdit] = useState<any>(null)

  useEffect(() => { fetchMedia() }, [])

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const data = await getMedia()
      setMedia(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching media:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    const name = prompt("Enter file name:")
    if (!name) return
    setActionLoading(-1)
    try {
      await uploadMedia({ name, type: "image", size: "1.0 MB" })
      fetchMedia()
    } catch (error) {
      console.error("Error uploading media:", error)
      alert("Failed to upload media")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (mediaId: number) => {
    if (!confirm("Are you sure you want to delete this media?")) return
    setActionLoading(mediaId)
    try {
      await deleteMedia(mediaId)
      fetchMedia()
    } catch (error) {
      console.error("Error deleting media:", error)
      alert("Failed to delete media")
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-darkBlue">Media Library</div>
      <div className="rounded-2xl bg-white p-4 border">
        <div className="flex justify-between items-center">
          <div className="font-semibold text-darkBlue">Media Files</div>
          <button className="rounded-lg px-3 py-2 bg-brand-yellow text-darkBlue font-semibold disabled:opacity-50" onClick={handleUpload} disabled={actionLoading === -1}>Upload Media</button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {media.length === 0 ? (
              <div className="col-span-3 text-sm text-gray-500 py-8 text-center">No media files found</div>
            ) : (
              media.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium truncate">{item.name}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.type}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-3">{item.size} - {item.uploaded}</div>
                  <div className="flex gap-2">
                    <button className="flex-1 rounded-lg px-3 py-1 border text-sm hover:bg-gray-50 disabled:opacity-50" onClick={() => setLiveEdit(item)} disabled={actionLoading === item.id}>Edit</button>
                    <button className="flex-1 rounded-lg px-3 py-1 border bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 text-sm" onClick={() => handleDelete(item.id)} disabled={actionLoading === item.id}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {liveEdit && (
        <LivePageEditor
          slug={`media-${liveEdit.id}`}
          title={liveEdit.name}
          initialSections={[
            {
              id: "media-hero", title: "Media Preview", type: "hero",
              content: { heading: liveEdit.name, subtitle: `${liveEdit.type} - ${liveEdit.size}`, buttonText: "", tagline: `Uploaded ${liveEdit.uploaded}` },
              style: { backgroundColor: "#213448", textColor: "#ffffff", accentColor: "#F4B400", alignment: "center", headingSize: "2rem", padding: "3rem" },
            },
            {
              id: "media-caption", title: "Caption & Alt Text", type: "text",
              content: { heading: "Caption", body: liveEdit.caption || "Add a caption or alt text for this media. Click this section to edit." },
              style: { backgroundColor: "#ffffff", textColor: "#213448", alignment: "left", padding: "2.5rem" },
            },
          ]}
          onSaved={async (sections) => {
            const hero = sections.find((s) => s.id === "media-hero")
            const caption = sections.find((s) => s.id === "media-caption")
            try {
              await updateMedia(liveEdit.id, {
                name: hero?.content?.heading || liveEdit.name,
                caption: caption?.content?.body,
                altText: caption?.content?.body,
              })
            } catch { /* sections already persisted */ }
          }}
          onClose={fetchMedia}
        />
      )}
    </div>
  )
}