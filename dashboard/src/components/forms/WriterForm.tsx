import { useState } from "react"

export default function WriterForm({
  initial,
  onSubmit
}: {
  initial?: { name?: string; email?: string }
  onSubmit: (v: { name: string; email: string }) => void
}) {
  const [name, setName] = useState(initial?.name ?? "")
  const [email, setEmail] = useState(initial?.email ?? "")
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ name, email })
      }}
    >
      <div>
        <label className="block text-sm text-gray-700">Name</label>
        <input className="w-full rounded-lg border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm text-gray-700">Email</label>
        <input className="w-full rounded-lg border px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="rounded-lg px-3 py-2 bg-brand-yellow text-darkBlue font-semibold">Save</button>
      </div>
    </form>
  )
}
