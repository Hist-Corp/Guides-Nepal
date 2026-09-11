import PageShell from "../components/PageShell";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import {
  GrowthAreaChart,
  DonutChartCard,
  BookingHeatmap,
  RatingHistogram,
  HBarList,
} from "../components/charts";
import {
  growthSeries,
  bookingHeatmap,
  mockSources,
  mockActivity,
  ratingHistogram,
  cityRatings,
} from "../mock/data";

export default function Intelligence() {
  return (
    <PageShell
      title="Intelligence"
      description="Growth signals across the platform — bookings, engagement, and sentiment."
      noCard
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Bookings this month" value="2,480" icon="📈" accent="bg-brand-100" />
        <StatCard label="Travelers reached" value="18.2k" icon="🎒" accent="bg-sky-100" />
        <StatCard label="Conversion rate" value="6.4%" icon="🎯" accent="bg-emerald-50" />
        <StatCard label="Avg rating" value="4.8 ★" icon="⭐" accent="bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Bookings trend" subtitle="Growth across the last weeks" className="lg:col-span-2">
          <GrowthAreaChart
            data={growthSeries}
            series={[
              { key: "bookings", name: "Bookings", color: "#2563eb" },
              { key: "users", name: "New users", color: "#ff8a5c" },
            ]}
            height={240}
          />
        </SectionCard>
        <SectionCard title="Traffic sources" subtitle="Where travelers come from">
          <DonutChartCard segments={mockSources} height={210} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Booking activity heatmap" subtitle="When travelers book across the week" className="lg:col-span-2">
          <BookingHeatmap matrix={bookingHeatmap.matrix} slots={bookingHeatmap.slots} />
        </SectionCard>
        <SectionCard title="Review distribution" subtitle="Review-score histogram">
          <RatingHistogram data={ratingHistogram} height={200} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="City ratings" subtitle="Average review score by city" className="lg:col-span-2">
          <HBarList
            data={cityRatings.map((c) => ({ label: c.label, value: c.value, display: `${c.value} ★` }))}
            color="#34d399"
          />
        </SectionCard>
        <SectionCard title="Live activity" subtitle="Latest platform events">
          <ul className="space-y-2">
            {mockActivity.map((a, idx) => (
              <li key={idx} className="flex items-center justify-between text-sm">
                <span className="text-soft">{a.text}</span>
                <span className="text-xs text-soft">{a.time}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </PageShell>
  );
}