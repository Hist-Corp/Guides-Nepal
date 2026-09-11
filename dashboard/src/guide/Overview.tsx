import useFetch from "../hooks/useFetch"
import { getBookings } from "../services/api"
import PageShell from "../components/PageShell"
import SectionCard from "../components/SectionCard"
import StatCard from "../components/StatCard"
import KPICard from "../components/KPICard"
import HeroGreeting from "../components/HeroGreeting"
import { WeeklyBarChart } from "../components/charts"
import Badge from "../components/Badge"
import SchedulePanel from "../components/SchedulePanel"
import Table from "../components/Table"
import { mockExperiences, mockBookings as mockB, mockGuideTasks, mockGuideScheduleItems, weeklyBookings } from "../mock/data"

export default function GuideOverview() {
  const { data, loading } = useFetch(getBookings)
  const bookings = Array.isArray(data) ? data : []
  const upcoming = bookings.filter((x: any) => x.status === "upcoming").length
  const earningsTotal = bookings.reduce((sum: number, x: any) => sum + (x.price ?? 0), 0)
  return (
    <PageShell
      title="Guide Overview"
      description="Your tours, bookings, schedule, and earnings."
      noCard
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-4">
          <HeroGreeting />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title="Upcoming" value={loading ? "…" : upcoming} delta={{ value: "+1", positive: true }} />
        <KPICard title="Total bookings" value={loading ? "…" : bookings.length} delta={{ value: "+3%", positive: true }} />
        <KPICard title="Earnings" value={loading ? "…" : `$${earningsTotal}`} delta={{ value: "+1%", positive: true }} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard
          title="Bookings trend"
          subtitle="Earnings across recent bookings"
          className="lg:col-span-2"
        >
          <WeeklyBarChart data={weeklyBookings} height={240} />
        </SectionCard>
        <SectionCard title="Tasks" subtitle="Your to-do list">
          <ul className="space-y-2">
            {mockGuideTasks.map((t) => (
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
          title="Assigned Experiences"
          subtitle="Tours you are guiding"
          className="lg:col-span-2"
          bodyClassName="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          {mockExperiences.map((e) => (
            <div key={e.id} className="rounded-lg border border-gray-200 p-3 bg-white">
              <div className="font-semibold text-darkBlue">{e.title}</div>
              <div className="text-xs text-gray-600">{e.city}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge text={e.duration} />
                <Badge text={e.status} />
              </div>
            </div>
          ))}
        </SectionCard>
        <SchedulePanel items={mockGuideScheduleItems} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard
          title="Booking activity by weekday"
          subtitle="When your guests book across the week"
        >
          <WeeklyBarChart data={weeklyBookings} height={170} />
        </SectionCard>
        <SectionCard title="Top experiences" subtitle="Your best-performing tours">
          <ul className="space-y-2">
            {mockExperiences.slice(0, 5).map((e) => (
              <li key={e.id} className="flex items-center justify-between">
                <div className="text-sm font-medium text-main">{e.title}</div>
                <Badge text={e.duration} />
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
      <SectionCard
        title="Recent Bookings"
        subtitle="Your latest guest reservations"
      >
        <Table
          columns={[
            { key: "experienceTitle", label: "Experience" },
            { key: "date", label: "Date" },
            { key: "guests", label: "Guests" },
            { key: "status", label: "Status" },
            { key: "price", label: "Price", render: (r: any) => `$${r.price}` }
          ]}
          rows={mockB}
        />
      </SectionCard>
    </PageShell>
  )
}
