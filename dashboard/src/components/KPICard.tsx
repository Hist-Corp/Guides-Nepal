type Props = {
  title: string
  value: string | number
  sub?: string
  delta?: { value: string; positive?: boolean }
}

export default function KPICard({ title, value, sub, delta }: Props) {
  return (
    <div className="bg-white p-4 border border-gray-200 flex flex-col justify-between">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-semibold tabular-nums text-darkBlue">{value}</div>
        {delta && (
          <span className={`text-xs font-medium ${delta.positive ? "text-green-700" : "text-red-600"}`}>
            {delta.value}
          </span>
        )}
      </div>
      {sub && <div className="mt-0.5 text-xs text-gray-500">{sub}</div>}
    </div>
  )
}

