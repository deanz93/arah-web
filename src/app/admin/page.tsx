import { adminDb } from '@/lib/firebase-admin'
import StatsCard from '@/components/admin/StatsCard'
import ReportsChart from '@/components/admin/ReportsChart'

async function getStats() {
  const [activeReports, totalUsers] = await Promise.all([
    adminDb.collection('reports').where('active', '==', true).count().get(),
    adminDb.collection('users').count().get(),
  ])

  const byTypeSnap = await adminDb.collection('reports').where('active', '==', true).select('type').get()
  const byType: Record<string, number> = {}
  byTypeSnap.forEach((doc) => {
    const type = doc.data().type as string
    byType[type] = (byType[type] ?? 0) + 1
  })

  return {
    activeReports: activeReports.data().count,
    totalUsers: totalUsers.data().count,
    byType,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const chartData = Object.entries(stats.byType).map(([name, value]) => ({ name, value }))

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-black">Dashboard Arah</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Laporan Aktif" value={stats.activeReports} icon="⚠️" />
        <StatsCard label="Pengguna Berdaftar" value={stats.totalUsers} icon="👤" />
        <StatsCard label="Laporan Polis" value={stats.byType['police'] ?? 0} icon="🚔" />
        <StatsCard label="Laporan Banjir" value={stats.byType['flood'] ?? 0} icon="🌊" />
      </div>

      <ReportsChart data={chartData} />
    </div>
  )
}
