export default function SchedulePanel({
  items
}: {
  items: { time: string; title: string; tag?: string }[]
}) {
  return (
    <div className="rounded-lg bg-white p-4 border border-gray-200 space-y-2">
      <div className="font-semibold text-darkBlue">Schedule</div>
      <ul className="space-y-2">
        {items.map((it, idx) => (
          <li key={idx} className="flex items-center justify-between">
            <div className="text-xs text-gray-600">{it.time}</div>
            <div className="flex-1 text-sm px-3">{it.title}</div>
            {it.tag && <span className="text-xs px-2 py-1 rounded-full bg-lightBlue/60">{it.tag}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
