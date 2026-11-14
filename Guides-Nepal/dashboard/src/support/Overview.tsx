import { useEffect, useState } from "react"
import { getSupportTickets } from "../services/api"
import PageShell from "../components/PageShell"
import SectionCard from "../components/SectionCard"
import HeroGreeting from "../components/HeroGreeting"
import KPICard from "../components/KPICard"
import { DonutChartCard, WeeklyBarChart, HBarList } from "../components/charts"
import { weeklyBookings, ticketsByPriority } from "../mock/data"

export default function SupportOverview() {
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSupportTickets()
      .then((d) => setTickets(Array.isArray(d) ? d : []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false))
  }, [])

  const open = tickets.filter((t) => t.status === "open").length
  const inProgress = tickets.filter((t) => t.status === "in_progress").length
  const resolved = tickets.filter((t) => t.status === "resolved").length
  const urgent = tickets.filter((t) => t.priority === "urgent" && t.status !== "closed").length

  // Real ticket mix when data exists, otherwise the demo distribution.
  const liveMix = tickets.length > 3 && tickets[0]?.priority ? ticketsByPriority.map((seg) => ({
    ...seg,
    value: tickets.filter((t) => (t.priority ?? "normal").toLowerCase() === seg.label.toLowerCase()).length || seg.value,
  })) : ticketsByPriority

  return (
    <PageShell
      title="Customer Support"
      description="Track, triage, and resolve customer support tickets."
      noCard
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-4">
          <HeroGreeting />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard title="Open Tickets" value={loading ? "…" : open} sub="Need a first response" />
        <KPICard title="In Progress" value={loading ? "…" : inProgress} sub="Being worked on" />
        <KPICard title="Resolved" value={loading ? "…" : resolved} sub="Solved queries" />
        <KPICard title="Urgent" value={loading ? "…" : urgent} sub="High-priority open issues" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard
          title="Ticket mix by priority"
          subtitle="Volume across urgency levels"
        >
          <DonutChartCard segments={liveMix} height={210} />
        </SectionCard>
        <SectionCard
          title="Tickets by weekday"
          subtitle="When travelers reach support"
          className="lg:col-span-2"
        >
          <WeeklyBarChart data={weeklyBookings} height={220} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard
          title="Urgent open tickets"
          subtitle="Handle these first"
          bodyClassName="space-y-2"
          className="lg:col-span-2"
        >
          {tickets.filter((t) => t.priority === "urgent" && t.status !== "closed").length > 0 ? (
            tickets.filter((t) => t.priority === "urgent" && t.status !== "closed").slice(0, 5).map((t: any) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl border border-line p-3">
                <span className="text-sm font-medium text-main">{t.subject || t.title || `Ticket #${t.id}`}</span>
                <span className="text-xs font-semibold text-red-600 uppercase">{t.status}</span>
              </div>
            ))
          ) : (
            <div className="text-sm text-soft py-2 text-center">Nothing urgent — great work! 🎉</div>
          )}
        </SectionCard>
        <SectionCard title="Resolution focus" subtitle="Where effort concentrates">
          <HBarList
            data={[
              { label: "Bookings & refunds", value: 82, display: "82%" },
              { label: "Guide queries", value: 64, display: "64%" },
              { label: "Account help", value: 47, display: "47%" },
              { label: "Other", value: 22, display: "22%" },
            ]}
            color="#ff8a5c"
          />
        </SectionCard>
      </div>
    </PageShell>
  )
}