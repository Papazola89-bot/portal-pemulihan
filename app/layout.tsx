import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Portal Pemulihan Khas SK Semangar",
  description: "Sistem pengurusan kelas pemulihan khas",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms" className="h-full">
      <body className="h-full" style={{ background: "var(--paper)", color: "var(--ink)" }}>{children}</body>
    </html>
  )
}
