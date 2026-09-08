import { useEffect, useState } from "react"
import { getExperiences, getGuides } from "../../services/api"
import {
  seedExperiences,
  seedGuides,
  normalizeExperience,
  normalizeGuide,
  type PublicExperience,
  type PublicGuide,
} from "../data/catalog"

function useCatalog() {
  const [experiences, setExperiences] = useState<PublicExperience[]>([])
  const [guides, setGuides] = useState<PublicGuide[]>([])
  const [loading, setLoading] = useState(true)
  const [usingSeed, setUsingSeed] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [exp, gds] = await Promise.all([
          getExperiences(),
          getGuides().catch(() => null),
        ])
        if (cancelled) return
        const list = Array.isArray(exp) ? exp : (exp as any)?.items ?? (exp as any)?.data ?? []
        setExperiences(list.map(normalizeExperience))
        const gList = Array.isArray(gds) ? gds : (gds as any)?.items ?? (gds as any)?.data ?? []
        setGuides(gList.map(normalizeGuide))
        setUsingSeed(list.length === 0)
      } catch {
        if (cancelled) return
        setExperiences(seedExperiences.map(normalizeExperience))
        setGuides(seedGuides.map(normalizeGuide))
        setUsingSeed(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { experiences, guides, loading, usingSeed }
}

export default useCatalog
