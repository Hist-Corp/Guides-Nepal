import { useState, useEffect } from "react"
import { getSeo, createSeo, updateSeo, deleteSeo } from "../services/api"
import LivePageEditor from "./LivePageEditor"

export default function WriterSeo() {
  const [seo, setSeo] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [liveEdit, setLiveEdit] = useState<any>(null)

  const fetchSeo = async () => {
    try {
      const data = await getSeo()
      setSeo(data.items || data)
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchSeo() }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this SEO entry?")) return
    setActionLoading(id)
    try { await deleteSeo(id); await fetchSeo() }
    catch (e) { console.error(e) }
    finally { setActionLoading(null) }
  }

  if (liveEdit) {
    return (
      <LivePageEditor
        slug={`seo-${liveEdit.id}`}
        title={`SEO: ${liveEdit.page}`}
        initialSections={[
          {
            id: "seo-preview", title: "SEO Preview", type: "hero",
            content: { heading: liveEdit.title, subtitle: liveEdit.description, tagline: liveEdit.keywords },
            style: { backgroundColor: "#213448", textColor: "#ffffff", accentColor: "#F4B400", alignment: "left", headingSize: "2rem", padding: "3rem" },
          },
          {
            id: "seo-meta", title: "Meta Details", type: "text",
            content: { heading: liveEdit.page, body: `Title: ${liveEdit.title}\nDescription: ${liveEdit.description}\nKeywords: ${liveEdit.keywords}` },
            style: { backgroundColor: "#ffffff", textColor: "#213448", alignment: "left" },
          },
        ]}
        onSaved={async (sections) => {
          const preview = sections.find((s) => s.id === "seo-preview")
          if (preview?.content?.heading) {
            try {
              await updateSeo(liveEdit.id, {
                title: preview.content.heading,
                description: preview.content.subtitle,
                keywords: preview.content.tagline,
              })
            } catch { /* sections persisted */ }
          }
        }}
        onClose={fetchSeo}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-darkBlue">SEO Management</div>
      <div className="rounded-2xl bg-white p-4 border">
        <div className="font-semibold text-darkBlue mb-3">SEO Entries</div>
        {loading ? (
          <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>
        ) : (
          <ul className="space-y-2">
            {seo.length === 0 ? (
              <li className="text-sm text-gray-500 py-4 text-center">No SEO entries found</li>
            ) : (
              seo.map((item) => (
                <li key={item.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="text-sm font-medium">{item.page}</div>
                    <div className="text-xs text-gray-500">{item.title}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-lg px-3 py-1 border disabled:opacity-50" onClick={() => setLiveEdit(item)} disabled={actionLoading === item.id}>Edit</button>
                    <button className="rounded-lg px-3 py-1 border bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50" onClick={() => handleDelete(item.id)} disabled={actionLoading === item.id}>Remove</button>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  )
}