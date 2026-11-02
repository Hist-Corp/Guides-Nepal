import { useEffect, useState } from "react"
import PageShell from "../components/PageShell"
import SectionCard from "../components/SectionCard"
import KPICard from "../components/KPICard"
import Table from "../components/Table"
import Button from "../components/Button"
import Badge from "../components/Badge"
import Modal from "../components/Modal"
import { EarningsLineChart, HBarList, WeeklyBarChart } from "../components/charts"
import { mockEarningsHistory, weeklyBookings, mockPayouts } from "../mock/data"
import { getHostEarnings, getHostPayouts, requestPayout } from "../services/api"

type EarningsSummary = {
  total_earnings: number
  this_period: number
  best_day: { date: string; amount: number }
  avg_per_booking: number
  by_experience: { label: string; value: number; display: string }[]
}

type Payout = {
  id: string
  date: string
  amount: number
  status: "completed" | "processing" | "scheduled" | "failed"
  items: number
  method: string
}

type EarningsFilters = {
  dateFrom: string
  dateTo: string
  experienceId: string
  status: string
}

const initialFilters: EarningsFilters = { dateFrom: "", dateTo: "", experienceId: "", status: "" }

export default function HostEarnings() {
  const [summary, setSummary] = useState<EarningsSummary | null>(null)
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [payoutsLoading, setPayoutsLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState<EarningsFilters>(initialFilters)
  const [showRequestPayout, setShowRequestPayout] = useState(false)
  const [requestAmount, setRequestAmount] = useState("")
  const [requesting, setRequesting] = useState(false)
  const [viewingPayout, setViewingPayout] = useState<Payout | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [summaryData, payoutsData] = await Promise.all([
        getHostEarnings(),
        getHostPayouts()
      ])
      setSummary(summaryData)
      setPayouts(payoutsData)
    } catch (e) {
      setError("Unable to load earnings data.")
      // Fallback to mock data
      setSummary({
        total_earnings: mockEarningsHistory.reduce((s, x) => s + x.amount, 0),
        this_period: mockEarningsHistory[mockEarningsHistory.length - 1].amount,
        best_day: mockEarningsHistory.reduce((a, b) => (b.amount > a.amount ? b : a)),
        avg_per_booking: 118,
        by_experience: [
          { label: "Bhaktapur Heritage Walk", value: 2130, display: "$2,130" },
          { label: "Patan Cultural Circuit", value: 1480, display: "$1,480" },
          { label: "Pokhara Lakeside Evening", value: 920, display: "$920" },
        ]
      })
      setPayouts(mockPayouts as unknown as Payout[])
    } finally {
      setLoading(false)
      setPayoutsLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const handleRequestPayout = async () => {
    if (!requestAmount || Number(requestAmount) <= 0) return
    setRequesting(true)
    try {
      await requestPayout({ amount: Number(requestAmount) })
      setShowRequestPayout(false)
      setRequestAmount("")
      await load()
    } catch (e) {
      alert("Failed to request payout")
    } finally {
      setRequesting(false)
    }
  }

  const exportData = (format: "csv" | "xlsx") => {
    const headers = ["Run", "Date", "Amount", "Status", "Items", "Method"]
    const rows = payouts.map(p => [p.id, p.date, `$${p.amount}`, p.status, String(p.items), p.method])
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `earnings-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
      completed: "success", processing: "warning", scheduled: "info", failed: "danger"
    }
    return <Badge variant={variants[status] || "default"} text={status} />
  }

  const filteredPayouts = payouts.filter(p => {
    if (filters.dateFrom && p.date < filters.dateFrom) return false
    if (filters.dateTo && p.date > filters.dateTo) return false
    if (filters.status && p.status !== filters.status) return false
    return true
  })

  return (
    <PageShell
      title="Earnings"
      description="Payout history, earnings trends, and performance by experience."
      action={
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => exportData("csv")} size="sm">Export CSV</Button>
          <Button onClick={() => setShowRequestPayout(true)}>Request payout</Button>
        </div>
      }
    >
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPICard title="Total earnings" value={`$${summary.total_earnings.toLocaleString()}`} sub="Across all payouts" delta={{ value: "+18%", positive: true }} />
          <KPICard title="This period" value={`$${summary.this_period}`} sub="Latest entry" />
          <KPICard title="Best day" value={`$${summary.best_day.amount}`} sub={summary.best_day.date} />
          <KPICard title="Avg per booking" value={`$${summary.avg_per_booking}`} sub="Across completed tours" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Earnings trend" subtitle="Daily net earnings" className="lg:col-span-2">
          {summary ? (
            <EarningsLineChart
              data={mockEarningsHistory.map((e) => ({ date: e.date, amount: e.amount }))}
              dataKey="amount"
              name="Net earnings"
              height={260}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-soft">Loading chart…</div>
          )}
        </SectionCard>
        <SectionCard title="Earnings by experience" subtitle="Where your income comes from">
          {summary ? (
            <HBarList data={summary.by_experience} color="#ff8a5c" />
          ) : (
            <div className="h-64 flex items-center justify-center text-soft">Loading…</div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Payout history" subtitle="Runs paid to your account">
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
            className="rounded-xl border border-line bg-surface px-3 py-2 text-sm max-w-xs"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))}
            className="rounded-xl border border-line bg-surface px-3 py-2 text-sm max-w-xs"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
            className="rounded-xl border border-line bg-surface px-3 py-2 text-sm max-w-xs"
          >
            <option value="">All statuses</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="scheduled">Scheduled</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        {payoutsLoading ? (
          <p className="text-soft">Loading payouts…</p>
        ) : filteredPayouts.length === 0 ? (
          <p className="text-soft">No payouts found.</p>
        ) : (
          <Table
            columns={[
              { key: "id", label: "Run" },
              { key: "date", label: "Date" },
              { key: "amount", label: "Amount", render: (r: any) => `$${r.amount}` },
              { key: "status", label: "Status", render: (r: any) => getStatusBadge(r.status) },
              { key: "items", label: "Items" },
              { key: "method", label: "Method" },
              {key: "actions", label: "", render: (r: any) => <Button size="sm" variant="ghost" onClick={() => setViewingPayout(r)}>View</Button> },
            ]}
            rows={filteredPayouts}
          />
        )}
      </SectionCard>

      {showRequestPayout && (
        <Modal open onClose={() => setShowRequestPayout(false)} title="Request payout">
          <h3 className="text-lg font-semibold mb-2">Request payout</h3>
          <p className="text-soft mb-4">Enter the amount you'd like to withdraw. Minimum $50.</p>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Amount (USD)</label>
            <input
              type="number"
              min="50"
              step="0.01"
              value={requestAmount}
              onChange={(e) => setRequestAmount(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm"
              placeholder="100.00"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowRequestPayout(false)}>Cancel</Button>
            <Button onClick={handleRequestPayout} disabled={requesting}>{requesting ? "Requesting…" : "Request payout"}</Button>
          </div>
        </Modal>
      )}

      {viewingPayout && (
        <Modal open onClose={() => setViewingPayout(null)} wide title={`Payout ${viewingPayout.id}`}>
          <h3 className="text-lg font-semibold mb-4">Payout details</h3>
          <div className="space-y-3">
            <DetailRow label="Run ID" value={viewingPayout.id} />
            <DetailRow label="Date" value={viewingPayout.date} />
            <DetailRow label="Amount" value={`$${viewingPayout.amount}`} />
            <DetailRow label="Status" value={<Badge variant={viewingPayout.status === "completed" ? "success" : viewingPayout.status === "processing" ? "warning" : "info"} text={viewingPayout.status} />} />
            <DetailRow label="Items" value={String(viewingPayout.items)} />
            <DetailRow label="Method" value={viewingPayout.method} />
          </div>
          <div className="mt-6 flex justify-end">
            <Button variant="secondary" onClick={() => setViewingPayout(null)}>Close</Button>
          </div>
        </Modal>
      )}
    </PageShell>
  )
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b">
      <span className="text-soft">{label}</span>
      <span className="font-medium text-main">{value}</span>
    </div>
  )
}