export default function HomePage() {
  return (
    <main className="min-h-screen bg-blue-900 text-white flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5">
        <span className="text-2xl font-black tracking-widest">🧭 ARAH</span>
        <a href="/admin" className="text-sm text-blue-200 hover:text-white transition">
          Admin →
        </a>
      </nav>

      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-6">
        <h1 className="text-6xl font-black">Tunjuk Arah,<br />Bersama.</h1>
        <p className="text-xl text-blue-200 max-w-md">
          Navigasi komuniti dibina untuk Malaysia. Data terbuka, berdaulat, dan bebas.
        </p>
        <div className="flex gap-4 mt-4">
          <a
            href="#"
            className="bg-white text-blue-900 px-8 py-3 rounded-xl font-bold text-lg hover:bg-blue-50 transition"
          >
            Muat turun Android
          </a>
          <a
            href="#"
            className="border border-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-white/10 transition"
          >
            Muat turun iOS
          </a>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 pb-20 max-w-5xl mx-auto w-full">
        {[
          { icon: '🛡️', title: 'Berdaulat', desc: 'Data disimpan di Malaysia. Tiada pihak asing.' },
          { icon: '🌊', title: 'Amaran Banjir', desc: 'Laporan banjir masa nyata dari komuniti.' },
          { icon: '💰', title: 'Kos Tol', desc: 'Anggaran kos Touch \'n Go sebelum berlepas.' },
        ].map((f) => (
          <div key={f.title} className="bg-blue-800/50 rounded-2xl p-6 gap-3 flex flex-col">
            <span className="text-4xl">{f.icon}</span>
            <h3 className="text-xl font-bold">{f.title}</h3>
            <p className="text-blue-200">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="text-center text-blue-400 py-6 text-sm">
        © 2026 Arah Malaysia · Dibina dengan ❤️ di Malaysia
      </footer>
    </main>
  )
}
