"use client"

import { useRouter } from "next/navigation"

export default function YearFilter({ tahun, senaraiTahun }: { tahun: number; senaraiTahun: number[] }) {
  const router = useRouter()

  return (
    <div className="print:hidden flex items-center gap-2">
      <label className="text-[11px] font-semibold uppercase tracking-[0.6px]" style={{ color: "var(--ink-4)" }}>
        Tahun
      </label>
      <select
        value={tahun}
        onChange={(e) => router.push(`/dashboard?tahun=${e.target.value}`)}
        className="text-[13px] font-semibold rounded-lg px-3 py-[7px] cursor-pointer outline-none"
        style={{ border: "1px solid var(--line)", background: "#fff", color: "var(--ink)" }}
      >
        {senaraiTahun.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </div>
  )
}
