export default function GuideProfile() {
  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold text-darkBlue">Profile (limited edit)</div>
      <form className="rounded-lg bg-white p-4 border border-gray-200 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700">First name</label>
            <input className="w-full rounded-lg border px-3 py-2" defaultValue="Ram" />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Last name</label>
            <input className="w-full rounded-lg border px-3 py-2" defaultValue="Bahadur" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-700">Email</label>
          <input className="w-full rounded-lg border px-3 py-2" defaultValue="ram@example.com" disabled />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Languages</label>
          <input className="w-full rounded-lg border px-3 py-2" defaultValue="English, Nepali, Newari" />
        </div>
        <div className="text-xs text-gray-600">Some fields are locked by policy.</div>
        <div className="flex gap-2">
          <button type="button" className="rounded-lg px-3 py-2 bg-brand-yellow text-darkBlue font-semibold">Save</button>
          <button type="button" className="rounded-lg px-3 py-2 border">Cancel</button>
        </div>
      </form>
      <div className="rounded-lg bg-white p-4 border border-gray-200 space-y-2">
        <div className="font-semibold text-darkBlue">Documents</div>
        <ul className="space-y-2">
          <li className="flex items-center justify-between">
            <div className="text-sm">Citizenship Front</div>
            <button className="rounded-lg px-3 py-1 border">Upload</button>
          </li>
          <li className="flex items-center justify-between">
            <div className="text-sm">Citizenship Back</div>
            <button className="rounded-lg px-3 py-1 border">Upload</button>
          </li>
        </ul>
      </div>
    </div>
  )
}
