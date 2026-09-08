type Props = {
  label: string
  value: string | number
}

export default function StatCard({ label, value }: Props) {
  return (
    <div className="bg-white p-4 border border-gray-200">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-darkBlue">{value}</div>
    </div>
  )
}

