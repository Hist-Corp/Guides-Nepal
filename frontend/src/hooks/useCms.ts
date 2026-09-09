import { useEffect, useState } from 'react'
import { getPageSections, getCmsSeoEntries, getPlacements, type CmsSection } from '../services/cms'

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
 * Returns the image URL placed into the given slot from the dashboard
 * Media Library ("Place" action), or null when no image is placed there.
 * Components fall back to their hardcoded image when null.
 */
export function useImagePlacement(key: string): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    getPlacements().then((map) => {
      if (alive) setUrl(map[key] || null)
    })
    return () => {
      alive = false
    }
  }, [key])

  return url
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
