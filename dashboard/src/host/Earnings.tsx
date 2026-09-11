import PageShell from "../components/PageShell"
import SectionCard from "../components/SectionCard"
import KPICard from "../components/KPICard"
import Table from "../components/Table"
import { EarningsLineChart, HBarList } from "../components/charts"
import { mockEarningsHistory } from "../mock/data"

export default function HostEarnings() {
  const total = mockEarningsHistory.reduce((s, x) => s + x.amount, 0)
  const best = mockEarningsHistory.reduce((a, b) => (b.amount > a.amount ? b : a))
  const rows = [
    { id: "P-1001", date: "Jan 15", amount: 1200, status: "completed", items: 18 },
    { id: "P-1002", date: "Jan 31", amount: 980, status: "processing", items: 12 },
    { id: "P-1003", date: "Feb 15", amount: 0, status: "scheduled", items: 0 },
  ]
  return (
    <PageShell
      title="Your earnings"
      description="Payout history and how your listings are earning."
      noCard
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard title="Total earnings" value={`$${total.toLocaleString()}`} sub="Across all payouts" delta={{ value: "+18%", positive: true }} />
        <KPICard title="This period" value={`$${mockEarningsHistory[mockEarningsHistory.length - 1].amount}`} sub="Latest entry" />
        <KPICard title="Best day" value={`$${best.amount}`} sub={best.date} />
        <KPICard title="Avg per booking" value="$118" sub="Across completed tours" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Earnings trend" subtitle="Daily net earnings" className="lg:col-span-2">
          <EarningsLineChart
            data={mockEarningsHistory.map((e) => ({ date: e.date, amount: e.amount }))}
            dataKey="amount"
            name="Net earnings"
            height={260}
          />
        </SectionCard>
        <SectionCard title="Earnings by experience" subtitle="Where your income comes from">
          <HBarList
            data={[
              { label: "Bhaktapur Heritage Walk", value: 2130, display: "$2,130" },
              { label: "Patan Cultural Circuit", value: 1480, display: "$1,480" },
              { label: "Pokhara Lakeside Evening", value: 920, display: "$920" },
            ]}
            color="#ff8a5c"
          />
        </SectionCard>
      </div>

      <SectionCard title="Payout history" subtitle="Runs paid to your account">
        <Table
          columns={[
            { key: "id", label: "Run" },
            { key: "date", label: "Date" },
            { key: "amount", label: "Amount", render: (r: any) => `$${r.amount}` },
            { key: "status", label: "Status" },
            { key: "items", label: "Items" },
          ]}
          rows={rows}
        />
      </SectionCard>
    </PageShell>
  )
}
