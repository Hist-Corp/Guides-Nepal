import useFetch from "../hooks/useFetch"
import { getHostExperiences, getHostTours, getHostBookings } from "../services/api"
import PageShell from "../components/PageShell"
import SectionCard from "../components/SectionCard"
import StatCard from "../components/StatCard"
import KPICard from "../components/KPICard"
import HeroGreeting from "../components/HeroGreeting"
import { WeeklyBarChart } from "../components/charts"
import Badge from "../components/Badge"
import SchedulePanel from "../components/SchedulePanel"
import Table from "../components/Table"
import { mockHostTasks, mockHostScheduleItems, weeklyBookings } from "../mock/data"

export default function HostOverview() {
  const { data: exps, loading: expsLoading } = useFetch(getHostExperiences)
  const { data: tours, loading: toursLoading } = useFetch(getHostTours)
  const { data: bookings, loading: bookingsLoading } = useFetch(getHostBookings)
  const experiences = Array.isArray(exps) ? exps : []
  const b = Array.isArray(bookings) ? bookings : []
  const earningsTotal = b.filter((x: any) => x.status === "accepted" || x.status === "completed").reduce((sum: number, x: any) => sum + Number(x.total_price || 0), 0)
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
        <KPICard title="Tours" value={toursLoading ? "…" : Array.isArray(tours) ? tours.length : 0} delta={{ value: "Live", positive: true }} />
        <KPICard title="Experiences" value={expsLoading ? "…" : experiences.length} delta={{ value: "Live", positive: true }} />
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
          {experiences.map((e) => (
            <div key={e.id} className="rounded-lg border border-gray-200 p-3 bg-white">
              <div className="font-semibold text-darkBlue">{e.title}</div>
              <div className="text-xs text-gray-600">{e.city}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge text={`$${e.price}`} />
                <Badge text={e.duration} />
                <Badge text={e.is_active ? "active" : "inactive"} />
              </div>
            </div>
          ))}
          {!experiences.length && <p className="text-sm text-soft">No experiences yet. Add one from the Experiences page.</p>}
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
            {b.map((booking: any) => (
              <li key={booking.id} className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-main">{booking.experience_title}</div>
                <Badge text={booking.status} />
              </li>
            ))}
            {!b.length && <li className="text-sm text-soft">No bookings yet.</li>}
          </ul>
        </SectionCard>
      </div>
      <SectionCard
        title="Recent Bookings"
        subtitle="Latest reservations from guests"
      >
        <Table
          columns={[
            { key: "experience_title", label: "Experience" },
            { key: "date", label: "Date" },
            { key: "guests", label: "Guests" },
            { key: "status", label: "Status" },
            { key: "total_price", label: "Price", render: (r: any) => `$${r.total_price}` }
          ]}
          rows={b}
        />
      </SectionCard>
    </PageShell>
  )
}
