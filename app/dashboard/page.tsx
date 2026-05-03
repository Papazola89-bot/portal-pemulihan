import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import PrintButton from "./_components/PrintButton"

function StatTile({ label, value, sub, accent = "var(--ink)", delta }: {
  label: string; value: string | number; sub?: string; accent?: string; delta?: string
}) {
  return (
    <div className="bg-white rounded-xl p-[14px_16px] flex flex-col gap-1 relative overflow-hidden" style={{ border: "1px solid var(--line)" }}>
      <div className="flex items-center justify-between">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.8px]" style={{ color: "var(--ink-4)" }}>{label}</div>
        {delta && <div className="text-[10.5px] font-bold" style={{ color: "var(--green)" }}>{delta}</div>}
      </div>
      <div className="flex items-baseline gap-1.5 font-mono tnum">
        <div className="text-[28px] font-bold" style={{ color: accent, letterSpacing: "-0.5px" }}>{value}</div>
        {sub && <div className="text-[11px] tnum font-mono" style={{ color: "var(--ink-4)" }}>{sub}</div>}
      </div>
    </div>
  )
}

function ProgressBar({ value, color, height = 6 }: { value: number; color: string; height?: number }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, background: "var(--paper-3)" }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

function Pill({ children, tone = "ink" }: { children: React.ReactNode; tone?: string }) {
  const tones: Record<string, { bg: string; fg: string }> = {
    ink: { bg: "var(--paper-2)", fg: "var(--ink-3)" },
    bm: { bg: "var(--bm-soft)", fg: "var(--bm)" },
    mt: { bg: "var(--mt-soft)", fg: "var(--mt)" },
    bmmt: { bg: "var(--bmmt-soft)", fg: "var(--bmmt)" },
    green: { bg: "var(--green-soft)", fg: "var(--green)" },
    blue: { bg: "var(--blue-soft)", fg: "var(--blue)" },
    paper: { bg: "var(--paper)", fg: "var(--ink-3)" },
  }
  const t = tones[tone] ?? tones.ink
  return (
    <span
      className="inline-flex items-center px-2.5 py-[4px] text-[11.5px] font-semibold rounded-full"
      style={{ background: t.bg, color: t.fg }}
    >
      {children}
    </span>
  )
}

export default async function DashboardPage() {
  const session = await auth()
  const tahunSemasa = new Date().getFullYear()

  const [muridList, saringanList] = await Promise.all([
    prisma.murid.findMany({ where: { tahun: tahunSemasa }, orderBy: { kelas: "asc" } }),
    prisma.saringan.findMany({
      where: { tahun: tahunSemasa },
      include: { ticks: true },
    }),
  ])

  const jumlahBM = muridList.filter((m) => m.jenisPemulihan === "Bahasa Melayu").length
  const jumlahMT = muridList.filter((m) => m.jenisPemulihan === "Matematik").length
  const jumlahBMdanMT = muridList.filter((m) => m.jenisPemulihan === "Bahasa Melayu dan Matematik").length

  const muridKePerdanaSemua = [...new Set(
    saringanList.flatMap((s) => s.ticks.filter((t) => t.kuasai).map((t) => t.muridId))
  )]

  const kelasUnik = [...new Set(muridList.map((m) => m.kelas))].sort()
  const saringanNama = ["Pengesanan", "Pelepasan 1", "Pelepasan 2"]

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10.5px] font-mono uppercase tracking-[1.2px] mb-[2px]" style={{ color: "var(--ink-4)" }}>
            Dashboard · Tahun {tahunSemasa}
          </div>
          <h2 className="text-xl font-bold" style={{ color: "var(--ink)", letterSpacing: "-0.3px" }}>
            Selamat Datang, {session?.user?.name ?? "Guru"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <PrintButton />
        </div>
      </div>

      {/* Stat tiles row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Hero tile */}
        <div
          className="lg:col-span-1 rounded-xl p-[16px_18px] flex flex-col justify-between text-white"
          style={{ backgroundColor: "var(--sidebar-bg)" }}
        >
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.8px]" style={{ color: "rgba(255,255,255,0.6)" }}>Jumlah Murid</div>
          <div className="text-[56px] font-bold font-mono tnum leading-none" style={{ letterSpacing: "-2px" }}>{muridList.length}</div>
          <div className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>Tahun {tahunSemasa} · {kelasUnik.length} kelas</div>
        </div>

        <StatTile label="Pemulihan BM" value={jumlahBM} sub="orang" accent="var(--bm)" />
        <StatTile label="Pemulihan MT" value={jumlahMT} sub="orang" accent="var(--mt)" />
        <StatTile label="BM & MT" value={jumlahBMdanMT} sub="orang" accent="var(--bmmt)" />
        <StatTile label="Ke Kelas Perdana" value={muridKePerdanaSemua.length} sub={`/ ${muridList.length}`} accent="var(--green)" delta={muridKePerdanaSemua.length > 0 ? `+${muridKePerdanaSemua.length}` : undefined} />
      </div>

      {/* Pecahan Mengikut Kelas */}
      {kelasUnik.length > 0 && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid var(--line)" }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--line-soft)" }}>
            <div>
              <div className="text-[13px] font-bold" style={{ color: "var(--ink)" }}>Pecahan Mengikut Kelas</div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-4)" }}>Klik kelas untuk lihat senarai murid</div>
            </div>
            <Pill tone="paper">{kelasUnik.length} kelas aktif</Pill>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3">
            {kelasUnik.map((kelas, i) => {
              const muridKelas = muridList.filter((m) => m.kelas === kelas)
              const bmKelas = muridKelas.filter((m) => m.jenisPemulihan === "Bahasa Melayu").length
              const mtKelas = muridKelas.filter((m) => m.jenisPemulihan === "Matematik").length
              const bmdanmtKelas = muridKelas.filter((m) => m.jenisPemulihan === "Bahasa Melayu dan Matematik").length
              const perdanaKelas = muridKelas.filter((m) => muridKePerdanaSemua.includes(m.id)).length

              return (
                <div key={kelas} className="p-4" style={{
                  borderRight: (i % 3 !== 2) ? "1px solid var(--line-soft)" : "none",
                  borderBottom: "1px solid var(--line-soft)",
                }}>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="text-[13px] font-bold" style={{ color: "var(--ink)" }}>Kelas {kelas}</div>
                    <span className="text-[11px] font-mono tnum" style={{ color: "var(--ink-4)" }}>{muridKelas.length} murid</span>
                  </div>

                  {/* Stacked bar */}
                  <div className="flex h-2 rounded-full overflow-hidden gap-0.5" style={{ background: "var(--paper-2)" }}>
                    {bmKelas > 0 && <div style={{ flex: bmKelas, background: "var(--bm)" }} />}
                    {mtKelas > 0 && <div style={{ flex: mtKelas, background: "var(--mt)" }} />}
                    {bmdanmtKelas > 0 && <div style={{ flex: bmdanmtKelas, background: "var(--bmmt)" }} />}
                  </div>

                  <div className="flex gap-3 mt-2 text-[10.5px]" style={{ color: "var(--ink-4)" }}>
                    <span><b style={{ color: "var(--bm)" }}>{bmKelas}</b> BM</span>
                    <span><b style={{ color: "var(--mt)" }}>{mtKelas}</b> MT</span>
                    <span><b style={{ color: "var(--bmmt)" }}>{bmdanmtKelas}</b> BM&MT</span>
                  </div>

                  <div
                    className="mt-2.5 px-2.5 py-1.5 rounded-md flex justify-between text-[11px] font-semibold"
                    style={{
                      background: perdanaKelas > 0 ? "var(--green-soft)" : "var(--paper-2)",
                      color: perdanaKelas > 0 ? "var(--green)" : "var(--ink-4)",
                    }}
                  >
                    <span>Ke Kelas Perdana</span>
                    <span className="tnum font-mono">{perdanaKelas} / {muridKelas.length}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Ringkasan Saringan */}
      <div className="grid sm:grid-cols-3 gap-3">
        {saringanNama.map((nama) => {
          const s = saringanList.find((x) => x.nama === nama)
          const kuasai = s ? s.ticks.filter((t) => t.kuasai).length : 0
          const total = muridList.length
          const peratus = total > 0 && s ? Math.round((kuasai / total) * 100) : 0
          const isLast = nama === "Pelepasan 2"
          const accent = isLast ? "var(--green)" : "var(--blue)"

          return (
            <div key={nama} className="bg-white rounded-xl p-4" style={{ border: "1px solid var(--line)" }}>
              <div className="flex justify-between items-start mb-2.5">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.6px]" style={{ color: "var(--ink-4)" }}>Saringan</div>
                  <div className="text-base font-bold mt-0.5" style={{ color: "var(--ink)" }}>{nama}</div>
                </div>
                {s && <Pill tone={isLast ? "green" : "blue"}>{peratus}%</Pill>}
              </div>
              <div className="flex items-baseline gap-1.5 font-mono mb-2">
                <div className="text-[32px] font-bold tnum" style={{ color: accent, letterSpacing: "-1px" }}>{s ? kuasai : "—"}</div>
                <div className="text-[13px] tnum" style={{ color: "var(--ink-4)" }}>/ {total} murid kuasai</div>
              </div>
              {s && <ProgressBar value={kuasai / total} color={accent} height={6} />}
              {!s && (
                <p className="text-xs italic" style={{ color: "var(--ink-4)" }}>Belum dicipta</p>
              )}
            </div>
          )
        })}
      </div>

      {muridList.length === 0 && (
        <div className="bg-white rounded-xl p-10 text-center" style={{ border: "1px dashed var(--line)" }}>
          <div className="text-4xl mb-3">👨‍🎓</div>
          <p className="text-sm font-medium" style={{ color: "var(--ink-3)" }}>Tiada murid untuk tahun {tahunSemasa}.</p>
          <p className="text-xs mt-1" style={{ color: "var(--ink-4)" }}>Pergi ke <strong>Senarai Murid</strong> untuk tambah murid.</p>
        </div>
      )}
    </div>
  )
}
