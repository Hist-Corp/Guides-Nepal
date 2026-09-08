import { useEffect, useState } from "react"
import { getSupportTickets } from "../services/api"
import PageShell from "../components/PageShell"
import SectionCard from "../components/SectionCard"
import HeroGreeting from "../components/HeroGreeting"
import KPICard from "../components/KPICard"

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

  return (
    <PageShell
      title="Customer Support"
      description="Track, triage, and resolve customer support tickets."
      noCard
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <HeroGreeting />
        </div>
        <KPICard title="Open Tickets" value={loading ? "…" : open} sub="Need a first response" />
        <KPICard title="In Progress" value={loading ? "…" : inProgress} sub="Being worked on" />
        <KPICard title="Resolved" value={loading ? "…" : resolved} sub="Solved queries" />
        <KPICard title="Urgent" value={loading ? "…" : urgent} sub="High-priority open issues" />
      </div>
      <SectionCard
        title="Urgent open tickets"
        subtitle="Handle these first"
        bodyClassName="space-y-2"
      >
        {tickets.filter((t) => t.priority === "urgent" && t.status !== "closed").length > 0 ? (
          tickets.filter((t) => t.priority === "urgent" && t.status !== "closed").slice(0, 5).map((t: any) => (
            <div key={t.id} className="flex items-center justify-between rounded-xl border p-3">
              <span className="text-sm font-medium text-darkBlue">{t.subject || t.title || `Ticket #${t.id}`}</span>
              <span className="text-xs font-semibold text-red-600 uppercase">{t.status}</span>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500 py-2 text-center">Nothing urgent — great work! 🎉</div>
        )}
      </SectionCard>
    </PageShell>
  )
}