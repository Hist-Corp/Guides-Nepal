import { useState, useEffect } from "react"
import { getAdminStats, getAdminExperiences, getAdminGuides, getAdminBookings } from "../services/api"
import PageShell from "../components/PageShell"
import SectionCard from "../components/SectionCard"
import StatCard from "../components/StatCard"
import KPICard from "../components/KPICard"
import HeroGreeting from "../components/HeroGreeting"
import BarChart from "../components/BarChart"
import DonutChart from "../components/DonutChart"
import Table from "../components/Table"
import Badge from "../components/Badge"
import SchedulePanel from "../components/SchedulePanel"
import { mockAnalyticsSeries, mockTasks, mockActivity, mockEmployees, mockSources, mockScheduleItems } from "../mock/data"

export default function AdminOverview() {
  const [stats, setStats] = useState<any>({})
  const [experiences, setExperiences] = useState<any[]>([])
  const [guides, setGuides] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, expData, guideData, bookingData] = await Promise.all([
          getAdminStats().catch(() => ({})),
          getAdminExperiences().catch(() => []),
          getAdminGuides().catch(() => []),
          getAdminBookings().catch(() => [])
        ])
        setStats(statsData || {})
        setExperiences(Array.isArray(expData) ? expData : [])
        setGuides(Array.isArray(guideData) ? guideData : [])
        setBookings(Array.isArray(bookingData) ? bookingData : [])
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <PageShell
      title="Dashboard"
      description="Platform health at a glance — people, bookings, and content."
      noCard
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <HeroGreeting />
        </div>
        <KPICard title="Total Users" value={loading ? "…" : (stats.total_users || 0)} sub="Registered users" />
        <KPICard title="Total Guides" value={loading ? "…" : (stats.total_guides || 0)} sub={`${stats.verified_guides || 0} verified`} />
        <KPICard title="Bookings" value={loading ? "…" : (stats.total_bookings || 0)} sub="Total bookings" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard
          title="Average KPIs"
          subtitle="Performance trends across the platform"
          className="lg:col-span-2"
        >
          <BarChart series={mockAnalyticsSeries} />
        </SectionCard>
        <SectionCard title="Tasks" subtitle="Items needing attention">
          <ul className="space-y-2">
            {mockTasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between">
                <div className="text-sm">{t.title}</div>
                <div className="text-xs text-gray-600">{t.due} • {t.status}</div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard
          title="Employees"
          subtitle="Team members and their roles"
          className="lg:col-span-2"
        >
          <Table
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "department", label: "Department" },
              { key: "role", label: "Role" },
              { key: "status", label: "Status" }
            ]}
            rows={mockEmployees}
          />
        </SectionCard>
        <SectionCard title="Recent Activity" subtitle="Latest platform events">
          <ul className="space-y-2">
            {mockActivity.map((a, idx) => (
              <li key={idx} className="flex items-center justify-between">
                <div className="text-sm">{a.text}</div>
                <div className="text-xs text-gray-600">{a.time}</div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Application Resources" subtitle="Where signups come from">
          <DonutChart segments={mockSources} />
        </SectionCard>
        <SectionCard
          title="Current Experiences"
          subtitle="Latest listings on the platform"
          className="lg:col-span-2"
          bodyClassName="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          {experiences.length > 0 ? experiences.slice(0, 6).map((e: any) => (
            <div key={e.id} className="rounded-lg border border-gray-200 p-3 bg-white">
              <div className="font-semibold text-darkBlue">{e.title}</div>
              <div className="text-xs text-gray-600">{e.city || e.host?.name}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge text={`$${e.price || 0}`} />
                <Badge text={e.duration || "N/A"} />
                <Badge text={e.status || "active"} />
              </div>
            </div>
          )) : (
            <div className="col-span-3 text-center text-gray-500 py-4">No experiences found</div>
          )}
        </SectionCard>
      </div>

      <SchedulePanel items={mockScheduleItems} />
    </PageShell>
  )
}
