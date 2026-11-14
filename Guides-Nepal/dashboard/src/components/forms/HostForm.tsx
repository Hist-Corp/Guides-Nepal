import { useState } from "react"
import { ChevronDown } from "lucide-react"

export default function HostForm({
  initial,
  onSubmit
}: {
  initial?: { name?: string; city?: string; status?: string }
  onSubmit: (v: { name: string; city: string; status: string }) => void
}) {
  const [name, setName] = useState(initial?.name ?? "")
  const [city, setCity] = useState(initial?.city ?? "")
  const [status, setStatus] = useState(initial?.status ?? "active")
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ name, city, status })
      }}
    >
      <div>
        <label className="block text-sm text-gray-700">Name</label>
        <input className="w-full rounded-lg border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm text-gray-700">City</label>
        <input className="w-full rounded-lg border px-3 py-2" value={city} onChange={(e) => setCity(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm text-gray-700">Status</label>
        <div className="relative">
        <select className="w-full appearance-none rounded-lg border border-line bg-surface px-4 py-2 pr-9 text-sm font-medium text-main shadow-sm transition-colors hover:border-brand-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">active</option>
          <option value="suspended">suspended</option>
        </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soft" />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="rounded-lg px-3 py-2 bg-brand-yellow text-darkBlue font-semibold">Save</button>
      </div>
    </form>
  )
}
