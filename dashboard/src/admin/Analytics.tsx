import BarChart from "../components/BarChart"
import { mockAnalyticsSeries } from "../mock/data"

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold text-darkBlue">Analytics</div>
      <div className="rounded-lg bg-white p-4 border border-gray-200 space-y-4">
        <div className="font-semibold text-darkBlue">Monthly bookings</div>
        <BarChart series={mockAnalyticsSeries} />
      </div>
    </div>
  )
}
