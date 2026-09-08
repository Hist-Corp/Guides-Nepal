import BarChart from "../components/BarChart"
import { mockAnalyticsSeries } from "../mock/data"

export default function HostPerformance() {
  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold text-darkBlue">Performance metrics</div>
      <div className="rounded-lg bg-white p-4 border border-gray-200 space-y-2">
        <div className="font-semibold text-darkBlue">Bookings trend</div>
        <BarChart series={mockAnalyticsSeries} />
        <div className="text-sm text-gray-600">Ratings: 4.7 • Completion rate: 98%</div>
      </div>
    </div>
  )
}
