import BarChart from "../components/BarChart"
import { mockEarningsHistory } from "../mock/data"

export default function HostEarnings() {
  const series = mockEarningsHistory.map((e) => ({ label: e.date, value: e.amount }))
  const total = mockEarningsHistory.reduce((s, x) => s + x.amount, 0)
  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold text-darkBlue">Your earnings</div>
      <div className="rounded-lg bg-white p-4 border border-gray-200 space-y-2">
        <div className="font-semibold text-darkBlue">Last payouts</div>
        <BarChart series={series} />
        <div className="text-sm text-gray-600">Total: ${total}</div>
      </div>
    </div>
  )
}
