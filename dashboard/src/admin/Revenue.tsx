import PageShell from "../components/PageShell"
import SectionCard from "../components/SectionCard"
import KPICard from "../components/KPICard"
import Table from "../components/Table"
import { EarningsLineChart, DonutChartCard, HBarList } from "../components/charts"
import { mockPayouts, mockEarningsHistory, mockSources, bookingsByCity } from "../mock/data"

export default function AdminRevenue() {
  const total = mockEarningsHistory.reduce((s, x) => s + x.amount, 0)
  return (
    <PageShell
      title="Revenue & payouts"
      description="Booking revenue, platform mix, and payout runs."
      noCard
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="Revenue (30d)" value={`$${total.toLocaleString()}`} sub="Sum of recent bookings" delta={{ value: "+14%", positive: true }} />
        <KPICard title="Avg booking value" value="$118" sub="Across all tours" delta={{ value: "+3%", positive: true }} />
        <KPICard title="Payouts this month" value="$2,180" sub="2 runs completed" />
        <KPICard title="Commission" value="12%" sub="Platform fee" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Revenue trend" subtitle="Daily booking revenue over the last period" className="lg:col-span-2">
          <EarningsLineChart
            data={mockEarningsHistory.map((e) => ({ date: e.date, amount: e.amount }))}
            dataKey="amount"
            name="Revenue"
            height={260}
          />
        </SectionCard>
        <SectionCard title="Revenue sources" subtitle="Where revenue comes from">
          <DonutChartCard segments={mockSources} height={210} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Bookings by city" subtitle="Geographic revenue drivers" className="lg:col-span-2">
          <HBarList data={bookingsByCity} />
        </SectionCard>
        <SectionCard title="Payout runs" subtitle="Latest payouts to hosts and guides">
          <Table
            columns={[
              { key: "id", label: "Run" },
              { key: "runDate", label: "Date" },
              { key: "amount", label: "Amount", render: (r: any) => `$${r.amount}` },
              { key: "status", label: "Status" },
            ]}
            rows={mockPayouts}
          />
        </SectionCard>
      </div>
    </PageShell>
  )
}
