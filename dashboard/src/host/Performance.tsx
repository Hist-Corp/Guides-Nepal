import PageShell from "../components/PageShell"
import SectionCard from "../components/SectionCard"
import KPICard from "../components/KPICard"
import { EarningsLineChart, WeeklyBarChart, RatingHistogram, HBarList } from "../components/charts"
import { mockEarningsHistory, weeklyBookings, ratingHistogram } from "../mock/data"

export default function HostPerformance() {
  return (
    <PageShell
      title="Performance metrics"
      description="How your listings and experiences are performing."
      noCard
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="Rating" value="4.7 ★" sub="Across 126 reviews" delta={{ value: "+0.2", positive: true }} />
        <KPICard title="Completion rate" value="98%" sub="Tours finished as planned" />
        <KPICard title="Response rate" value="94%" sub="Guest messages answered" />
        <KPICard title="Repeat guests" value="31%" sub="Guests who booked twice" delta={{ value: "+5%", positive: true }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Earnings trend" subtitle="Daily net earnings">
          <EarningsLineChart
            data={mockEarningsHistory.map((e) => ({ date: e.date, amount: e.amount }))}
            dataKey="amount"
            name="Net earnings"
            height={240}
          />
        </SectionCard>
        <SectionCard title="Bookings by weekday" subtitle="Weekly booking rhythm">
          <WeeklyBarChart data={weeklyBookings} height={240} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Review distribution" subtitle="How guests rate your experiences">
          <RatingHistogram data={ratingHistogram} />
        </SectionCard>
        <SectionCard title="Performance by experience" subtitle="Completion rate per listing">
          <HBarList
            data={[
              { label: "Bhaktapur Heritage Walk", value: 99, display: "99%" },
              { label: "Patan Cultural Circuit", value: 97, display: "97%" },
              { label: "Pokhara Lakeside Evening", value: 95, display: "95%" },
            ]}
            color="#34d399"
          />
        </SectionCard>
      </div>
    </PageShell>
  )
}
