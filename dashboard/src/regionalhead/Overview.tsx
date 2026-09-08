import { useEffect, useState } from "react"
import { getHostApplications } from "../services/api"
import HeroGreeting from "../components/HeroGreeting"
import KPICard from "../components/KPICard"

export default function RegionalHeadOverview() {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHostApplications()
      .then((d) => setApps(Array.isArray(d) ? d : []))
      .catch(() => setApps([]))
      .finally(() => setLoading(false))
  }, [])

  const pending = apps.filter((a) => a.status === "pending").length
  const approved = apps.filter((a) => a.status === "approved").length
  const regions = [...new Set(apps.map((a) => a.region).filter(Boolean))]

  return (
    <div className="space-y-6">
      <div className="text-2xl font-bold text-darkBlue">Regional Head</div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <HeroGreeting />
        </div>
        <KPICard title="Applications" value={loading ? "…" : apps.length} sub="In your region" />
        <KPICard title="Pending" value={loading ? "…" : pending} sub="Awaiting your review" />
        <KPICard title="Approved Hosts" value={loading ? "…" : approved} sub="Approved applications" />
      </div>
      <div className="rounded-2xl bg-white p-4 border">
        <div className="font-semibold text-darkBlue mb-2">Regions covered</div>
        <div className="text-sm text-gray-600">
          {regions.length ? regions.join(", ") : "No regional data yet"}
        </div>
      </div>
    </div>
  )
}