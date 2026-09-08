import { useState } from "react"
import { HelpCircle, X, Send, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { createSupportTicket } from "../../services/api"

interface SupportWidgetProps {
  onClose?: () => void
}

const PRIORITIES = ["low", "medium", "high", "urgent"] as const
type Priority = (typeof PRIORITIES)[number]

export default function SupportWidget({ onClose }: SupportWidgetProps) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim()) return
    setSubmitting(true)
    setFeedback(null)
    try {
      const data = await createSupportTicket({
        subject: subject.trim(),
        description: description.trim() || undefined,
        customer_name: name.trim() || undefined,
        customer_email: email.trim() || undefined,
        priority: priority,
      })
      setFeedback(data?.id
        ? `Ticket #${data.id} raised — thanks! We'll be in touch at ${email || "the email you provided"}.`
        : "Ticket raised. We'll get back to you soon.")
      setOpen(false)
      setSubject("")
      setDescription("")
      setName("")
      setEmail("")
      setPriority("medium")
      setTimeout(() => setFeedback(null), 4000)
    } catch (err: any) {
      setFeedback(err?.response?.data?.detail || "Couldn't raise ticket. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-darkBlue text-white px-4 py-3 shadow-lg hover:opacity-90 transition flex items-center gap-2 text-sm font-semibold"
      >
        <HelpCircle size={18} />
        Need help?
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] rounded-2xl bg-white border shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-darkBlue/5">
        <span className="font-semibold text-darkBlue flex items-center gap-2">
          <HelpCircle size={16} />
          Get support
        </span>
        <button
          type="button"
          onClick={() => { setOpen(false); onClose?.() }}
          className="text-gray-500 hover:text-gray-800 rounded p-0.5"
        >
          <X size={16} />
        </button>
      </div>
      <div className="p-4 space-y-3">
        {feedback && (
          <div className="rounded-lg bg-green-50 border border-green-200 text-green-800 text-xs px-3 py-2">
            {feedback}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="What's this about?"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/40"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
          <textarea
            placeholder="Some details (optional)..."
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/40 resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Your name"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/40"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/40"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p} priority</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting || !subject.trim()}
            className="w-full rounded-lg bg-darkBlue text-white py-2 text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 size={14} className="animate-spin" />Sending...</> : <><Send size={14} />Raise Ticket</>}
          </button>
        </form>
        <p className="text-xs text-gray-400 text-center">
          Prefer the full form?
          <button
            type="button"
            onClick={() => { setOpen(false); navigate("/support"); onClose?.() }}
            className="text-darkBlue hover:underline font-medium ml-1"
          >
            Open support page
          </button>
        </p>
      </div>
    </div>
  )
}