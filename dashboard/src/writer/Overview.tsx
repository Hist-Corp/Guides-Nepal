import { useState, useEffect } from "react"
import { getContentPages, getContentBlog, getContentGuides } from "../services/api"

export default function WriterOverview() {
  const [stats, setStats] = useState({ pages: 0, blog: 0, guides: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pages, blog, guides] = await Promise.all([
          getContentPages().catch(() => []),
          getContentBlog().catch(() => []),
          getContentGuides().catch(() => [])
        ])
        setStats({
          pages: Array.isArray(pages) ? pages.length : 0,
          blog: Array.isArray(blog) ? blog.length : 0,
          guides: Array.isArray(guides) ? guides.length : 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-darkBlue">Content Writer Overview</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-4 border">
          <div className="text-sm text-gray-600">Pages</div>
          <div className="text-2xl font-bold text-darkBlue">{loading ? "..." : stats.pages}</div>
        </div>
        <div className="rounded-2xl bg-white p-4 border">
          <div className="text-sm text-gray-600">Blog Articles</div>
          <div className="text-2xl font-bold text-darkBlue">{loading ? "..." : stats.blog}</div>
        </div>
        <div className="rounded-2xl bg-white p-4 border">
          <div className="text-sm text-gray-600">Guides Content</div>
          <div className="text-2xl font-bold text-darkBlue">{loading ? "..." : stats.guides}</div>
        </div>
      </div>
    </div>
  )
}