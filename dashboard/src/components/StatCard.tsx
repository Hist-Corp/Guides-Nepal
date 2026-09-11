type Props = {
  label: string
  value: string | number
  icon?: string
  accent?: string
}

export default function StatCard({ label, value, icon, accent = "bg-brand-100" }: Props) {
  return (
    <div className="gn-card rounded-2xl border border-line p-4 transition hover:shadow-card">
      <div className="flex items-center gap-3">
        {icon ? <span className={`grid h-8 w-8 place-items-center rounded-xl text-sm ${accent}`}>{icon}</span> : null}
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-soft uppercase tracking-wide">{label}</div>
          <div className="mt-0.5 text-2xl font-black tabular-nums text-main">{value}</div>
        </div>
      </div>
    </div>
  )
}

