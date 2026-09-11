import PageShell from "../components/PageShell"
import SectionCard from "../components/SectionCard"
import KPICard from "../components/KPICard"
import { EarningsLineChart, WeeklyBarChart } from "../components/charts"
import { mockEarningsHistory, weeklyBookings } from "../mock/data"

export default function GuideEarnings() {
  const total = mockEarningsHistory.reduce((s, x) => s + x.amount, 0)
  const best = mockEarningsHistory.reduce((a, b) => (b.amount > a.amount ? b : a))
  return (
    <PageShell
      title="Earnings"
      description="Your tour income and booking rhythm."
      noCard
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="Total earnings" value={`$${total.toLocaleString()}`} sub="This period" delta={{ value: "+12%", positive: true }} />
        <KPICard title="Best day" value={`$${best.amount}`} sub={best.date} />
        <KPICard title="Avg per tour" value="$92" sub="Net of fees" />
        <KPICard title="Payout status" value="Scheduled" sub="Next run Feb 15" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Earnings trend" subtitle="Daily net earnings">
          <EarningsLineChart
            data={mockEarningsHistory.map((e) => ({ date: e.date, amount: e.amount }))}
            dataKey="amount"
            name="Net earnings"
            height={250}
          />
        </SectionCard>
        <SectionCard title="Bookings by weekday" subtitle="When guests book your tours">
          <WeeklyBarChart data={weeklyBookings} height={250} />
        </SectionCard>
      </div>
    </PageShell>
  )
}
