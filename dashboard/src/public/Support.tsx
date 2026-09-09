import { useState } from "react"
import { Send, AlertCircle, CheckCircle, Loader2, HelpCircle } from "lucide-react"
import PageShell from "../components/PageShell"
import SectionCard from "../components/SectionCard"
import Field from "../components/Field"
import Button from "../components/Button"
import { createSupportTicket } from "../services/api"

const PRIORITIES = ["low", "medium", "high", "urgent"] as const
type Priority = (typeof PRIORITIES)[number]

export default function SupportPage() {
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string; ticketId?: number } | null>(null)

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
      setFeedback({
        ok: true,
        msg: data?.id
          ? `Ticket #${data.id} raised — we'll be in touch shortly.`
          : "Ticket raised successfully.",
        ticketId: data?.id,
      })
      if (data?.id) {
        setSubject("")
        setDescription("")
        setName("")
        setEmail("")
        setPriority("medium")
      }
    } catch (err: any) {
      setFeedback({ ok: false, msg: err?.response?.data?.detail || "Couldn't raise ticket. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  const hasEmail = email.trim().includes("@")

  return (
    <PageShell
      title="Get Support"
      noCard
    >
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="rounded-2xl bg-white border p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <svg className="h-7 w-7 text-darkBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            <h1 className="text-2xl font-bold text-darkBlue">Get support</h1>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            Have a question, a booking issue, or something else? Fill in the form and our customer support team will get back to you.
          </p>

          {feedback && (
            <div
              className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
                feedback.ok
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {feedback.ok ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
              <span>{feedback.msg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="What's this about?"
              placeholder="e.g. Booking didn't go through, Guide no-show, Refund request"
              value={subject}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
            />
            <Field
              label="Details (optional)"
              as="textarea"
              rows={4}
              placeholder="Add any extra context — booking reference, dates, screenshots described in words..."
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Your name"
                placeholder="Radha Sharma"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              />
              <Field
                label="Email address"
                type="email"
                placeholder="radha@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Priority</label>
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize border transition ${
                      priority === p
                        ? p === "urgent"
                          ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
                          : p === "high"
                          ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
                          : "bg-brand-yellow text-darkBlue border-brand-yellow hover:bg-yellow-100"
                        : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" variant="primary" className="w-full" disabled={submitting || !subject.trim()}>
              {submitting ? (
                <><Loader2 size={16} className="animate-spin mr-2" />Sending...</>
              ) : (
                <><Send size={16} className="mr-2" />Raise Ticket</>
              )}
            </Button>
          </form>
        </div>

        <SectionCard
          title="Before you send"
          subtitle="Help us help you faster"
          bodyClassName="space-y-3 text-sm text-gray-600"
        >
          <p>Include your email so we can follow up — tickets without an email can't be replied to.</p>
          <p>If you have a booking reference or guide name, mention it in the details.</p>
          <p>Urgent issues (e.g. a guide who didn't show up on a booked day) should be marked urgent so the team sees them first.</p>
          <p className="text-gray-400">You'll get a ticket number once it's raised — keep it handy in case you need to follow up.</p>
        </SectionCard>
      </div>
    </PageShell>
  )
}