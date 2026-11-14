import { useEffect, useState } from "react"

export default function useFetch<T>(fn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    fn()
      .then((d) => {
        if (active) setData(d)
      })
      .catch(() => {
        if (active) setError("Failed to load data")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [fn])

  return { data, loading, error }
}
