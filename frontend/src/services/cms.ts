import axios from 'axios'
import { API_BASE_URL } from '../config/api'

export interface CmsSection {
  id: string
  title: string
  type: string
  content: Record<string, any>
  style?: Record<string, any>
}

export interface CmsBlogPost {
  id: number
  title: string
  slug: string
  author?: string
  date?: string
  status?: string
  content?: string
}

export interface CmsSeoEntry {
  id: number
  page: string
  title: string
  description: string
  keywords?: string
}

// Module-level cache so multiple components on a page share one request
const sectionsCache: Record<string, CmsSection[]> = {}
const pending: Record<string, Promise<CmsSection[]>> = {}

export async function getPageSections(slug: string): Promise<CmsSection[]> {
  if (sectionsCache[slug]) return sectionsCache[slug]
  if (!pending[slug]) {
    pending[slug] = axios
      .get(`${API_BASE_URL}/content/pages/${slug}/sections`)
      .then((r) => {
        sectionsCache[slug] = r.data?.sections || []
        return sectionsCache[slug]
      })
      .catch(() => {
        sectionsCache[slug] = []
        return []
      })
      .finally(() => {
        delete pending[slug]
      })
  }
  return pending[slug]
}

export async function getCmsBlogPosts(): Promise<CmsBlogPost[]> {
  try {
    const res = await axios.get(`${API_BASE_URL}/content/blog`)
    return Array.isArray(res.data) ? res.data : []
  } catch {
    return []
  }
}

export async function getCmsSeoEntries(): Promise<CmsSeoEntry[]> {
  try {
    const res = await axios.get(`${API_BASE_URL}/content/seo`)
    return Array.isArray(res.data) ? res.data : []
  } catch {
    return []
  }
}

export interface CmsPlacement {
  slots: { key: string; label: string }[]
  placements: Record<string, string>
}

// Placements cache — refreshed on each page load of useImagePlacement
let placementsCache: Record<string, string> | null = null

export async function getPlacements(): Promise<Record<string, string>> {
  if (placementsCache) return placementsCache
  try {
    const res = await axios.get<CmsPlacement>(`${API_BASE_URL}/content/placements`)
    placementsCache = res.data?.placements || {}
    return placementsCache
  } catch {
    placementsCache = {}
    return {}
  }
}

/** Clears the placements cache (e.g. after the dashboard saves changes). */
export function clearPlacementsCache() {
  placementsCache = null
}

/**
 * Clears the cached sections (optionally for one slug) so the next
 * getPageSections call re-fetches fresh data from the CMS. Used by the
 * live-preview edit mode when the dashboard saves changes.
 */
export function clearCmsSectionsCache(slug?: string) {
  if (slug) delete sectionsCache[slug]
  else Object.keys(sectionsCache).forEach((k) => delete sectionsCache[k])
}
