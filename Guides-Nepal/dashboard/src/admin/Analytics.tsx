import PageShell from "../components/PageShell"
import SectionCard from "../components/SectionCard"
import { GrowthAreaChart, WeeklyBarChart, RatingHistogram } from "../components/charts"
import { growthSeries, weeklyBookings, ratingHistogram } from "../mock/data"

export default function AdminAnalytics() {
  return (
    <PageShell
      title="Analytics"
      description="Bookings, growth, and traveler behavior across the platform."
      noCard
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard
          title="Platform growth"
          subtitle="Bookings · users · tours across the last weeks"
          className="lg:col-span-2"
        >
          <GrowthAreaChart
            data={growthSeries}
            series={[
              { key: "bookings", name: "Bookings", color: "#2563eb" },
              { key: "users", name: "New users", color: "#ff8a5c" },
              { key: "tours", name: "Active tours", color: "#34d399" },
            ]}
          />
        </SectionCard>
        <SectionCard title="Bookings by weekday" subtitle="Weekly booking rhythm">
          <WeeklyBarChart data={weeklyBookings} height={260} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard
          title="Booking activity by weekday"
          subtitle="When travelers book across the week"
          className="lg:col-span-2"
        >
          <WeeklyBarChart data={weeklyBookings} height={260} />
        </SectionCard>
        <SectionCard title="Review distribution" subtitle="How travelers rate their tours">
          <RatingHistogram data={ratingHistogram} />
        </SectionCard>
      </div>
    </PageShell>
  )
}
