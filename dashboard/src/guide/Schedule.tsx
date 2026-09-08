import { mockSchedule } from "../mock/data"

export default function GuideSchedule() {
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold text-darkBlue">Schedule</div>
      <div className="rounded-lg bg-white p-4 border border-gray-200">
        <ul className="space-y-2">
          {mockSchedule.map((s, idx) => (
            <li key={idx} className="flex items-center justify-between">
              <div className="text-sm">{s.tour}</div>
              <div className="text-xs text-gray-600">{s.date} • {s.time}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
