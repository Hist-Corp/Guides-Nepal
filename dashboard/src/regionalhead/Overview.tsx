import { useEffect, useState } from "react"
import { getHostApplications } from "../services/api"
import PageShell from "../components/PageShell"
import SectionCard from "../components/SectionCard"
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
    <PageShell
      title="Regional Head"
      description="Manage host applications and operations in your region."
      noCard
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <HeroGreeting />
        </div>
        <KPICard title="Applications" value={loading ? "…" : apps.length} sub="In your region" />
        <KPICard title="Pending" value={loading ? "…" : pending} sub="Awaiting your review" />
        <KPICard title="Approved Hosts" value={loading ? "…" : approved} sub="Approved applications" />
      </div>
      <SectionCard
        title="Regions covered"
        subtitle="Areas represented in current applications"
      >
        <div className="flex flex-wrap gap-2">
          {regions.length ? regions.map((r) => (
            <span key={r} className="rounded-full bg-lightBlue/60 px-3 py-1 text-sm text-darkBlue font-medium">{r}</span>
          )) : (
            <div className="text-sm text-gray-600">No regional data yet</div>
          )}
        </div>
      </SectionCard>
    </PageShell>
  )
}