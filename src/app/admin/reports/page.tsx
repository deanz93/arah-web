import { adminDb } from '@/lib/firebase-admin'

async function getReports() {
  const snap = await adminDb
    .collection('reports')
    .where('active', '==', true)
    .orderBy('created_at', 'desc')
    .limit(50)
    .get()

  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

const TYPE_LABEL: Record<string, string> = {
  police: '🚔 Polis', accident: '💥 Kemalangan', flood: '🌊 Banjir',
  pothole: '🕳️ Lubang', roadblock: '🚧 Sekatan', hazard: '⚠️ Bahaya',
}

export default async function ReportsPage() {
  const reports = await getReports()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black mb-6">Laporan Aktif</h1>
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              {['Jenis', 'Koordinat', 'Upvotes', 'Downvotes', 'Tamat', 'Tindakan'].map((h) => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reports.map((r: Record<string, unknown>) => (
              <tr key={r.id as string} className="hover:bg-gray-50">
                <td className="px-4 py-3">{TYPE_LABEL[r.type as string] ?? r.type as string}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {(r.lat as number).toFixed(4)}, {(r.lng as number).toFixed(4)}
                </td>
                <td className="px-4 py-3 text-green-600 font-bold">{r.upvotes as number}</td>
                <td className="px-4 py-3 text-red-500 font-bold">{r.downvotes as number}</td>
                <td className="px-4 py-3 text-gray-400">
                  {(r.expires_at as { toDate: () => Date }).toDate().toLocaleString('ms-MY')}
                </td>
                <td className="px-4 py-3">
                  <button className="text-red-500 text-xs hover:underline">Padam</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
