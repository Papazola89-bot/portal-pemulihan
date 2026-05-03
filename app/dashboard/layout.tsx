"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/dashboard/murid", label: "Senarai Murid", icon: "users" },
  { href: "/dashboard/jadual", label: "Jadual Kelas", icon: "calendar" },
  { href: "/dashboard/kemahiran", label: "Laporan Kemahiran", icon: "check" },
  { href: "/dashboard/saringan", label: "Data Saringan", icon: "filter" },
  { href: "/dashboard/perkembangan", label: "Rekod Perkembangan", icon: "chart" },
  { href: "/dashboard/headcount", label: "Headcount", icon: "list" },
  { href: "/dashboard/tetapan", label: "Tetapan", icon: "gear" },
]

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? "#0F1A24" : "rgba(255,255,255,0.6)"
  const props = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  switch (name) {
    case "home": return <svg {...props}><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9h14v-9"/></svg>
    case "users": return <svg {...props}><circle cx="9" cy="9" r="3"/><path d="M3 19c.5-3 3-5 6-5s5.5 2 6 5"/><circle cx="17" cy="8" r="2.5"/><path d="M15.5 14c2.5.3 4.4 2 5 5"/></svg>
    case "calendar": return <svg {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
    case "check": return <svg {...props}><rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8 12 3 3 5-6"/></svg>
    case "filter": return <svg {...props}><path d="M4 5h16l-6 8v6l-4-2v-4z"/></svg>
    case "chart": return <svg {...props}><path d="M4 20V8M10 20V4M16 20v-8M22 20H2"/></svg>
    case "list": return <svg {...props}><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    case "gear": return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a7.97 7.97 0 0 0 0-6l2-1.5-2-3.5-2.4 1a8 8 0 0 0-5.2-3l-.4-2.5h-4l-.4 2.5a8 8 0 0 0-5.2 3l-2.4-1-2 3.5L0 9a7.97 7.97 0 0 0 0 6"/></svg>
    default: return null
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--paper)" }}>
      {/* Sidebar */}
      <aside
        className={`print:hidden fixed inset-y-0 left-0 z-50 w-[232px] flex flex-col transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0`}
        style={{ backgroundColor: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
      >
        {/* Logo */}
        <div className="px-[18px] py-5 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="flex items-center gap-[10px]">
            <div
              className="w-8 h-8 rounded-[6px] flex items-center justify-center font-mono text-sm font-extrabold"
              style={{ backgroundColor: "var(--yellow)", color: "#0F1A24" }}
            >
              P+
            </div>
            <div>
              <div className="text-[13px] font-bold text-white tracking-[0.2px]">Portal Pemulihan</div>
              <div className="text-[10.5px] font-mono" style={{ color: "#8FB7D9" }}>SK SEMANGAR · 2026</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-[10px] py-[10px] flex flex-col gap-[2px] overflow-y-auto">
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
                className="relative flex items-center gap-[10px] px-3 py-[9px] rounded-lg text-[12.5px] transition-colors"
                style={{
                  background: active ? "#fff" : "transparent",
                  color: active ? "#0F1A24" : "rgba(255,255,255,0.72)",
                  fontWeight: active ? 600 : 500,
                }}
              >
                {active && (
                  <span
                    className="absolute -left-[10px] top-[6px] bottom-[6px] w-[3px] rounded-sm"
                    style={{ backgroundColor: "var(--yellow)" }}
                  />
                )}
                <NavIcon name={item.icon} active={active} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="flex items-center gap-[10px] px-2 py-[10px]">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: "var(--yellow)", color: "#0F1A24" }}
            >
              GP
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white">Guru Pemulihan</div>
              <div className="text-[10.5px]" style={{ color: "rgba(255,255,255,0.5)" }}>SK Semangar</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="Log Keluar"
            >
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
            </button>
          </div>
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
        <header
          className="print:hidden flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--line)", background: "var(--paper)" }}
        >
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-black/5"
              onClick={() => setSidebarOpen(true)}
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={1.6} strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <div>
              <div className="text-[10.5px] font-mono uppercase tracking-[1.2px]" style={{ color: "var(--ink-4)" }}>
                {navItems.find((n) =>
                  n.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(n.href)
                )?.label ?? "Halaman"}
              </div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--ink)", letterSpacing: "-0.3px" }}>
                {navItems.find((n) =>
                  n.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(n.href)
                )?.label ?? "Dashboard"}
              </h1>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 thin-scroll">{children}</main>
      </div>
    </div>
  )
}
