interface Props {
  label: string
  value: number
  icon: string
  delta?: number
}

export default function StatsCard({ label, value, icon, delta }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        {delta !== undefined && (
          <span className={`text-xs font-bold ${delta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      <p className="text-3xl font-black">{value.toLocaleString()}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}
