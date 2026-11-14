type Props = {
  title: string
  value: string | number
  sub?: string
  delta?: { value: string; positive?: boolean }
  accent?: string
}

export default function KPICard({ title, value, sub, delta, accent = "#F4B400" }: Props) {
  return (
    <div className="gn-card rounded-2xl border border-line p-4 flex flex-col justify-between transition hover:shadow-card">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
        <div className="text-xs font-semibold text-soft uppercase tracking-wide">{title}</div>
        {delta && (
          <span className={`ml-auto text-xs font-bold ${delta.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"}`}>
            {delta.positive ? "▲" : "▼"} {delta.value}
          </span>
        )}
      </div>
      <div className="mt-2">
        <div className="text-3xl font-black tabular-nums text-main">{value}</div>
      </div>
      {sub && <div className="mt-1 text-xs text-soft">{sub}</div>}
    </div>
  )
}

