"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError("Username atau password salah.")
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  function masukTetamu() {
    // Cookie tetamu — dibaca oleh proxy untuk benarkan lihat dashboard sahaja
    document.cookie = "guest=1; path=/; max-age=86400; SameSite=Lax"
    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2" style={{ background: "var(--paper)" }}>
      {/* Left brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: "var(--sidebar-bg)", color: "#fff" }}
      >
        <div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Piksel Pemulihan"
              className="w-11 h-11 rounded-lg object-contain bg-white p-1"
            />
            <div>
              <div className="text-[13px] font-semibold tracking-[0.4px]">Piksel Pemulihan</div>
              <div className="text-[11px] font-mono" style={{ color: "#8FB7D9" }}>SK SEMANGAR · 2026</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.8px] mb-3.5" style={{ color: "#8FB7D9" }}>
            // Misi Pemulihan
          </div>
          <h1 className="text-[44px] font-bold leading-[1.05] tracking-tight mb-3.5" style={{ letterSpacing: "-1.5px" }}>
            Setiap murid<br />
            <span style={{ color: "var(--yellow)" }}>layak menguasai</span><br />
            kemahiran asas.
          </h1>
          <p className="text-[13px] leading-relaxed max-w-[380px]" style={{ color: "rgba(255,255,255,0.65)" }}>
            Sistem pengurusan kelas Pemulihan Khas — pantau penguasaan kemahiran, jalankan saringan, dan rekod perkembangan murid dengan mudah.
          </p>
        </div>

        <div className="flex gap-6 text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>
          <span>v2.4.0</span>
          <span>·</span>
          <span>Sk. Pemulihan Khas KPM</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-[360px]">
          {/* Logo utama */}
          <div className="flex flex-col items-center text-center mb-7">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Piksel Pemulihan"
              className="w-28 h-28 object-contain"
            />
            <div className="text-[11px] font-mono mt-1" style={{ color: "var(--ink-4)" }}>SK SEMANGAR · 2026</div>
          </div>

          <div className="text-[11px] font-mono uppercase tracking-[0.8px] mb-1.5" style={{ color: "var(--ink-4)" }}>
            Log Masuk
          </div>
          <h2 className="text-[28px] font-bold" style={{ letterSpacing: "-0.5px", color: "var(--ink)" }}>
            Selamat kembali
          </h2>
          <p className="text-[13px] mt-1.5" style={{ color: "var(--ink-4)" }}>
            Masuk untuk teruskan kerja anda.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.4px] mb-1.5" style={{ color: "var(--ink-3)" }}>
                Nama Pengguna
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-[11px] rounded-[10px] text-[13px] outline-none transition-all focus:ring-2 focus:ring-[var(--yellow)]/30"
                style={{ border: "1px solid var(--line)", background: "#fff", fontFamily: "inherit" }}
                placeholder="cikguhazwani"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.4px] mb-1.5" style={{ color: "var(--ink-3)" }}>
                Kata Laluan
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-[11px] rounded-[10px] text-[13px] outline-none transition-all focus:ring-2 focus:ring-[var(--yellow)]/30"
                style={{ border: "1px solid var(--line)", background: "#fff", fontFamily: "inherit" }}
                placeholder="Masukkan password"
                required
              />
            </div>

            {error && (
              <p className="text-[12.5px] font-medium p-3 rounded-lg" style={{ color: "var(--red)", background: "var(--red-soft)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 px-3.5 rounded-[10px] text-[13px] font-bold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: "var(--ink)" }}
            >
              {loading ? "Sedang log masuk..." : "Log Masuk"}
              {!loading && (
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14m-5-5 5 5-5 5"/>
                </svg>
              )}
            </button>
          </form>

          {/* Pemisah */}
          <div className="flex items-center gap-3 mt-6 mb-1">
            <div className="flex-1 h-px" style={{ background: "var(--line)" }} />
            <span className="text-[11px] font-mono uppercase tracking-[0.6px]" style={{ color: "var(--ink-4)" }}>atau</span>
            <div className="flex-1 h-px" style={{ background: "var(--line)" }} />
          </div>

          <button
            type="button"
            onClick={masukTetamu}
            className="w-full py-3 px-3.5 rounded-[10px] text-[13px] font-bold flex items-center justify-center gap-2 transition-colors hover:bg-black/[0.03]"
            style={{ border: "1px solid var(--line)", color: "var(--ink-2)", background: "#fff" }}
          >
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="3.2" /><path d="M5 20c.7-3.5 3.3-5.5 7-5.5s6.3 2 7 5.5" />
            </svg>
            Lihat sebagai Tetamu
          </button>
          <p className="text-[11px] text-center mt-2" style={{ color: "var(--ink-4)" }}>
            Tetamu hanya boleh melihat Dashboard
          </p>
        </div>
      </div>
    </div>
  )
}
