import { useEffect, useState } from "react"
import { getSupportTickets } from "../services/api"
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
    <div className="space-y-6">
      <div className="text-2xl font-bold text-darkBlue">Customer Support</div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <HeroGreeting />
        </div>
        <KPICard title="Open Tickets" value={loading ? "…" : open} sub="Need a first response" />
        <KPICard title="In Progress" value={loading ? "…" : inProgress} sub="Being worked on" />
        <KPICard title="Resolved" value={loading ? "…" : resolved} sub="Solved queries" />
        <KPICard title="Urgent" value={loading ? "…" : urgent} sub="High-priority open issues" />
      </div>
    </div>
  )
}