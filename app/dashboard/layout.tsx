"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/dashboard/murid", label: "Senarai Murid", icon: "👨‍🎓" },
  { href: "/dashboard/jadual", label: "Jadual Kelas", icon: "📅" },
  { href: "/dashboard/kemahiran", label: "Laporan Kemahiran", icon: "📊" },
  { href: "/dashboard/saringan", label: "Data Saringan", icon: "✅" },
  { href: "/dashboard/perkembangan", label: "Rekod Perkembangan", icon: "📈" },
  { href: "/dashboard/headcount", label: "Headcount", icon: "📋" },
  { href: "/dashboard/tetapan", label: "Tetapan", icon: "⚙️" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`print:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0`}
        style={{ backgroundColor: "#35393c" }}
      >
        <div className="p-5 border-b border-white/10">
          <div className="text-lg font-bold leading-tight text-white">Portal Pemulihan Khas</div>
          <div className="text-xs mt-1" style={{ color: "#a4d8ff" }}>SK Semangar</div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active ? "text-brand font-semibold" : "text-white/60 hover:text-white hover:bg-white/10"}`}
                style={active ? { backgroundColor: "#a4d8ff", color: "#35393c" } : {}}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <span>🚪</span> Log Keluar
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="print:hidden fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="print:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 md:px-6">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <h1 className="text-base font-semibold" style={{ color: "#35393c" }}>
            {navItems.find((n) =>
              n.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(n.href)
            )?.label ?? "Dashboard"}
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
