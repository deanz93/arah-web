import Link from 'next/link'

const NAV = [
  { href: '/admin', label: '📊 Dashboard' },
  { href: '/admin/reports', label: '⚠️ Laporan' },
  { href: '/admin/users', label: '👤 Pengguna' },
  { href: '/admin/analytics', label: '📈 Analitik' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <span className="text-xl font-black">🧭 Arah Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-800 transition text-sm font-medium"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 text-xs text-blue-400 border-t border-blue-800">
          Arah Admin v0.1
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
