import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Arah — Navigasi Malaysia',
  description: 'Tunjuk Arah, Bersama. Navigasi komuniti untuk Malaysia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  )
}
