import { useEffect, useState } from "react"
import { getAdminStats, getHostApplications, getSupportTickets } from "../services/api"
import PageShell from "../components/PageShell"
import SectionCard from "../components/SectionCard"
import HeroGreeting from "../components/HeroGreeting"
import KPICard from "../components/KPICard"

export default function SuperAdminOverview() {
  const [stats, setStats] = useState<any>({})
  const [apps, setApps] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAdminStats().catch(() => ({})),
      getHostApplications().catch(() => []),
      getSupportTickets().catch(() => [])
    ]).then(([s, a, t]) => {
      setStats(s || {})
      setApps(Array.isArray(a) ? a : [])
      setTickets(Array.isArray(t) ? t : [])
    }).finally(() => setLoading(false))
  }, [])

  const pendingApps = apps.filter((a) => a.status === "pending").length
  const openTickets = tickets.filter((t) => t.status === "open").length

  return (
    <PageShell
      title="Super Admin — Full Access"
      description="Platform-wide control: users, host applications, and support operations."
      noCard
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <HeroGreeting />
        </div>
        <KPICard title="Total Users" value={loading ? "…" : stats.total_users || 0} sub="Registered users" />
        <KPICard title="Bookings" value={loading ? "…" : stats.total_bookings || 0} sub="Total bookings" />
        <KPICard title="Host Applications" value={loading ? "…" : apps.length} sub={`${pendingApps} pending approval`} />
        <KPICard title="Support Tickets" value={loading ? "…" : tickets.length} sub={`${openTickets} open`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard
          title="Pending Host Applications"
          subtitle="Applications awaiting approval"
        >
          {apps.filter((a) => a.status === "pending").length > 0 ? (
            <ul className="space-y-2">
              {apps.filter((a) => a.status === "pending").slice(0, 5).map((a: any) => (
                <li key={a.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-darkBlue">{a.name || a.email || `Application #${a.id}`}</span>
                  <span className="text-xs text-gray-600">{a.region || "—"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500 py-2 text-center">No pending applications 🎉</div>
          )}
        </SectionCard>
        <SectionCard
          title="Open Support Tickets"
          subtitle="Tickets needing a response"
        >
          {tickets.filter((t) => t.status === "open").length > 0 ? (
            <ul className="space-y-2">
              {tickets.filter((t) => t.status === "open").slice(0, 5).map((t: any) => (
                <li key={t.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-darkBlue">{t.subject || t.title || `Ticket #${t.id}`}</span>
                  <span className="text-xs text-gray-600">{t.priority || "normal"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500 py-2 text-center">No open tickets 🎉</div>
          )}
        </SectionCard>
      </div>
    </PageShell>
  )
}