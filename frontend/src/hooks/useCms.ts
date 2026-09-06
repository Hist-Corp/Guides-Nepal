import { useEffect, useState } from 'react'
import { getPageSections, getCmsSeoEntries, type CmsSection } from '../services/cms'

/**
 * Returns the CMS section with the given id for the given page slug,
 * or null when no dashboard-edited section exists (component falls back
 * to its hardcoded content).
 */
export function useCmsSection(slug: string, id: string): CmsSection | null {
  const [section, setSection] = useState<CmsSection | null>(null)

  useEffect(() => {
    let alive = true
    getPageSections(slug).then((list) => {
      if (alive) setSection(list.find((s) => s.id === id) || null)
    })
    return () => {
      alive = false
    }
  }, [slug, id])

  return section
}

/**
 * Applies SEO title/description managed in the dashboard (SEO Management)
 * to the document head for the given page name.
 */
export function useSeoMeta(page: string, fallbackTitle: string) {
  useEffect(() => {
    let alive = true
    getCmsSeoEntries().then((entries) => {
      if (!alive) return
      const entry = entries.find(
        (e) => (e.page || '').toLowerCase().replace(/\s+/g, '-') === page.toLowerCase()
      )
      if (entry) {
        if (entry.title) document.title = entry.title
        if (entry.description) {
          let meta = document.querySelector('meta[name="description"]')
          if (!meta) {
            meta = document.createElement('meta')
            meta.setAttribute('name', 'description')
            document.head.appendChild(meta)
          }
          meta.setAttribute('content', entry.description)
        }
      } else {
        document.title = fallbackTitle
      }
    })
    return () => {
      alive = false
    }
  }, [page, fallbackTitle])
}
