'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#1565c0', '#e53e3e', '#1976d2', '#43a047', '#f57c00', '#6d4c41']

interface Props {
  data: { name: string; value: number }[]
}

const LABEL_MAP: Record<string, string> = {
  police: 'Polis', accident: 'Kemalangan', flood: 'Banjir',
  pothole: 'Lubang', roadblock: 'Sekatan', hazard: 'Bahaya',
}

export default function ReportsChart({ data }: Props) {
  const labelled = data.map((d) => ({ ...d, name: LABEL_MAP[d.name] ?? d.name }))

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-bold mb-4">Laporan Aktif Mengikut Jenis</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={labelled} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
            {labelled.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
