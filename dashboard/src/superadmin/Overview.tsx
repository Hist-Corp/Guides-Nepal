import { useEffect, useState } from "react"
import { getAdminStats, getHostApplications, getSupportTickets } from "../services/api"
import PageShell from "../components/PageShell"
import SectionCard from "../components/SectionCard"
import HeroGreeting from "../components/HeroGreeting"
import KPICard from "../components/KPICard"
import { GrowthAreaChart, DonutChartCard, WeeklyBarChart, HBarList } from "../components/charts"
import Table from "../components/Table"
import { growthSeries, weeklyBookings, mockSources, mockActivity, bookingsByCity } from "../mock/data"

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
        <div className="lg:col-span-4">
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
                  <span className="font-medium text-darkBlue dark:text-slate-100">{t.subject || t.title || `Ticket #${t.id}`}</span>
                  <span className="text-xs text-gray-600 dark:text-slate-400">{t.priority || "normal"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500 py-2 text-center">No open tickets 🎉</div>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard
          title="Platform growth"
          subtitle="Bookings · users · tours across the last weeks"
          className="lg:col-span-2"
        >
          <GrowthAreaChart
            data={growthSeries}
            series={[
              { key: "bookings", name: "Bookings", color: "#2563eb" },
              { key: "users", name: "New users", color: "#ff8a5c" },
              { key: "tours", name: "Active tours", color: "#34d399" },
            ]}
          />
        </SectionCard>
        <SectionCard title="Traffic sources" subtitle="Where travelers come from">
          <DonutChartCard segments={mockSources} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Top experiences" subtitle="Highest-rated tours on the platform" className="lg:col-span-2">
          <Table
            rows={[
              { id: 1, title: "Bhaktapur Heritage Walk", city: "Bhaktapur", rating: "4.8 ★", bookings: 124 },
              { id: 2, title: "Patan Cultural Circuit", city: "Lalitpur", rating: "4.6 ★", bookings: 98 },
              { id: 3, title: "Kathmandu Food Safari", city: "Kathmandu", rating: "4.9 ★", bookings: 213 },
              { id: 4, title: "Pokhara Lakeside Trek", city: "Pokhara", rating: "4.7 ★", bookings: 176 },
            ]}
            rowKey={(r) => r.id}
            columns={[
              { key: "title", label: "Experience" },
              { key: "city", label: "City" },
              { key: "rating", label: "Rating" },
              { key: "bookings", label: "Bookings", render: (r) => <span className="tabular-nums font-semibold text-main">{r.bookings}</span> },
            ]}
          />
        </SectionCard>
        <SectionCard title="Live activity" subtitle="Latest platform events">
          <ul className="space-y-2">
            {mockActivity.map((a, idx) => (
              <li key={idx} className="flex items-center justify-between text-sm">
                <span className="text-soft">{a.text}</span>
                <span className="text-xs text-soft">{a.time}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard
          title="Booking activity by weekday"
          subtitle="When travelers book across the week"
          className="lg:col-span-2"
        >
          <WeeklyBarChart data={weeklyBookings} height={170} />
        </SectionCard>
        <SectionCard
          title="Top cities by bookings"
          subtitle="Where travelers book most"
        >
          <HBarList data={bookingsByCity} color="#ff8a5c" />
        </SectionCard>
      </div>
    </PageShell>
  )
}