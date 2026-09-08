import { useEffect, useState } from "react"
import { getAdminStats, getHostApplications, getSupportTickets } from "../services/api"
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
    <div className="space-y-6">
      <div className="text-2xl font-bold text-darkBlue">Super Admin — Full Access</div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <HeroGreeting />
        </div>
        <KPICard title="Total Users" value={loading ? "…" : stats.total_users || 0} sub="Registered users" />
        <KPICard title="Bookings" value={loading ? "…" : stats.total_bookings || 0} sub="Total bookings" />
        <KPICard title="Host Applications" value={loading ? "…" : apps.length} sub={`${pendingApps} pending approval`} />
        <KPICard title="Support Tickets" value={loading ? "…" : tickets.length} sub={`${openTickets} open`} />
      </div>
    </div>
  )
}