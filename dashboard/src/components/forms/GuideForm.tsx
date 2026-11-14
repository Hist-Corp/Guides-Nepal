import { useState } from "react"

export default function GuideForm({
  initial,
  onSubmit
}: {
  initial?: { name?: string; languages?: string; verified?: boolean }
  onSubmit: (v: { name: string; languages: string[]; verified: boolean }) => void
}) {
  const [name, setName] = useState(initial?.name ?? "")
  const [languages, setLanguages] = useState(initial?.languages ?? "English,Nepali")
  const [verified, setVerified] = useState(initial?.verified ?? false)
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ name, languages: languages.split(",").map((x) => x.trim()).filter(Boolean), verified })
      }}
    >
      <div>
        <label className="block text-sm text-gray-700">Name</label>
        <input className="w-full rounded-lg border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm text-gray-700">Languages (comma separated)</label>
        <input className="w-full rounded-lg border px-3 py-2" value={languages} onChange={(e) => setLanguages(e.target.value)} required />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <span className="relative flex items-center justify-center shrink-0">
          <input
            type="checkbox"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
            className="peer sr-only"
          />
          <span
            className="transition-all duration-200 ease-in-out rounded-sm border border-gray-300 bg-gray-50 w-5 h-5 peer-focus:ring-2 peer-focus:ring-[#213448] peer-focus:ring-offset-2 peer-checked:bg-[#213448] peer-checked:border-[#213448]"
          >
            {verified ? (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : null}
          </span>
        </span>
        Verified
      </label>
      <div className="flex gap-2">
        <button type="submit" className="rounded-lg px-3 py-2 bg-brand-yellow text-darkBlue font-semibold">Save</button>
      </div>
    </form>
  )
}
