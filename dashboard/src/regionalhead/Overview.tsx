import { useEffect, useState } from "react"
import { getHostApplications } from "../services/api"
import PageShell from "../components/PageShell"
import SectionCard from "../components/SectionCard"
import HeroGreeting from "../components/HeroGreeting"
import KPICard from "../components/KPICard"
import { WeeklyBarChart, HBarList } from "../components/charts"
import { weeklyBookings } from "../mock/data"

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
        <div className="lg:col-span-4">
          <HeroGreeting />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title="Applications" value={loading ? "…" : apps.length} sub="In your region" />
        <KPICard title="Pending" value={loading ? "…" : pending} sub="Awaiting your review" />
        <KPICard title="Approved Hosts" value={loading ? "…" : approved} sub="Approved applications" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard
          title="Applications by region"
          subtitle="Where current applications come from"
        >
          {regions.length ? (
            <HBarList data={regions.map((r, i) => ({ label: r, value: apps.filter((a) => a.region === r).length }))} color="#ff8a5c" />
          ) : (
            <div className="text-sm text-soft">No regional data yet</div>
          )}
        </SectionCard>
        <SectionCard
          title="Bookings by weekday"
          subtitle="Regional booking rhythm"
        >
          <WeeklyBarChart data={weeklyBookings} height={220} />
        </SectionCard>
      </div>
      <SectionCard
        title="Regions covered"
        subtitle="Areas represented in current applications"
      >
        <div className="flex flex-wrap gap-2">
          {regions.length ? regions.map((r) => (
            <span key={r} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700 font-medium ring-1 ring-inset ring-brand-200">{r}</span>
          )) : (
            <div className="text-sm text-soft">No regional data yet</div>
          )}
        </div>
      </SectionCard>
    </PageShell>
  )
}