import useFetch from "../hooks/useFetch"
import { getExperiences, getBookings } from "../services/api"
import PageShell from "../components/PageShell"
import SectionCard from "../components/SectionCard"
import StatCard from "../components/StatCard"
import KPICard from "../components/KPICard"
import HeroGreeting from "../components/HeroGreeting"
import { WeeklyBarChart } from "../components/charts"
import Badge from "../components/Badge"
import SchedulePanel from "../components/SchedulePanel"
import Table from "../components/Table"
import { mockExperiences, mockBookings as mockB, mockHostTasks, mockHostScheduleItems, weeklyBookings } from "../mock/data"

export default function HostOverview() {
  const { data: exps, loading: expsLoading } = useFetch(getExperiences)
  const { data: bookings, loading: bookingsLoading } = useFetch(getBookings)
  const experiences = Array.isArray(exps) ? exps : []
  const b = Array.isArray(bookings) ? bookings : []
  const earningsTotal = b.reduce((sum: number, x: any) => sum + (x.price ?? 0), 0)
  return (
    <PageShell
      title="Host Overview"
      description="Your listings, bookings, and earnings at a glance."
      noCard
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-4">
          <HeroGreeting />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title="Experiences" value={expsLoading ? "…" : experiences.length} delta={{ value: "+2", positive: true }} />
        <KPICard title="Bookings" value={bookingsLoading ? "…" : b.length} delta={{ value: "+5%", positive: true }} />
        <KPICard title="Earnings" value={bookingsLoading ? "…" : `$${earningsTotal}`} delta={{ value: "-3%", positive: false }} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard
          title="Bookings trend"
          subtitle="Revenue across recent bookings"
          className="lg:col-span-2"
        >
          <WeeklyBarChart data={weeklyBookings} height={240} />
        </SectionCard>
        <SectionCard title="Tasks" subtitle="Your to-do list">
          <ul className="space-y-2">
            {mockHostTasks.map((t) => (
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
          title="Current Experiences"
          subtitle="Your live listings"
          className="lg:col-span-2"
          bodyClassName="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          {mockExperiences.map((e) => (
            <div key={e.id} className="rounded-lg border border-gray-200 p-3 bg-white">
              <div className="font-semibold text-darkBlue">{e.title}</div>
              <div className="text-xs text-gray-600">{e.city}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge text={`$${e.price}`} />
                <Badge text={e.duration} />
                <Badge text={e.status} />
              </div>
            </div>
          ))}
        </SectionCard>
        <SchedulePanel items={mockHostScheduleItems} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard
          title="Booking activity by weekday"
          subtitle="When your guests book across the week"
        >
          <WeeklyBarChart data={weeklyBookings} height={170} />
        </SectionCard>
        <SectionCard title="Top experiences" subtitle="Your best-performing listings">
          <ul className="space-y-2">
            {mockExperiences.slice(0, 5).map((e) => (
              <li key={e.id} className="flex items-center justify-between">
                <div className="text-sm font-medium text-main">{e.title}</div>
                <Badge text={`$${e.price}`} />
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
      <SectionCard
        title="Recent Bookings"
        subtitle="Latest reservations from guests"
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
