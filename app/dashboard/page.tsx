import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import PrintButton from "./_components/PrintButton"
import YearFilter from "./_components/YearFilter"
import { DonutChart, BarChart, SaringanFunnel } from "./_components/Charts"
import SemakanSaringan, { type SaringanBreakdown } from "./_components/SemakanSaringan"

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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string }>
}) {
  const session = await auth()
  const c = await cookies()
  const isGuest = !session && c.get("guest")?.value === "1"
  const namaPengguna = isGuest ? "Tetamu" : (session?.user?.name ?? "Guru")
  const tahunKini = new Date().getFullYear()

  // Senarai tahun yang ada data murid (+ tahun semasa sentiasa tersedia)
  const tahunMurid = await prisma.murid.findMany({
    distinct: ["tahun"],
    select: { tahun: true },
    orderBy: { tahun: "desc" },
  })
  const senaraiTahun = [...new Set([tahunKini, ...tahunMurid.map((m) => m.tahun)])].sort((a, b) => b - a)

  const sp = await searchParams
  const dipilih = Number(sp.tahun)
  const tahunSemasa = senaraiTahun.includes(dipilih) ? dipilih : tahunKini

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

  // Seorang murid "menguasai" sesuatu saringan jika subjek pemulihan dia dikuasai
  // (BM → kuasaiBM, MT → kuasaiMat, BM & MT → kedua-duanya)
  const muridKuasaiSaringan = (
    m: (typeof muridList)[number],
    s: (typeof saringanList)[number]
  ) => {
    const tick = s.ticks.find((t) => t.muridId === m.id)
    if (!tick) return false
    if (m.jenisPemulihan === "Matematik") return tick.kuasaiMat
    if (m.jenisPemulihan === "Bahasa Melayu dan Matematik") return tick.kuasaiBM && tick.kuasaiMat
    return tick.kuasaiBM
  }

  const muridKePerdanaSemua = muridList
    .filter((m) => saringanList.some((s) => muridKuasaiSaringan(m, s)))
    .map((m) => m.id)

  const kelasUnik = [...new Set(muridList.map((m) => m.kelas))].sort()
  const saringanNama = ["Pengesanan", "Pelepasan 1", "Pelepasan 2"]

  // Data carta
  const donutData = [
    { label: "Pemulihan BM", value: jumlahBM, color: "var(--bm)" },
    { label: "Pemulihan MT", value: jumlahMT, color: "var(--mt)" },
    { label: "BM & MT", value: jumlahBMdanMT, color: "var(--bmmt)" },
  ]
  const barData = kelasUnik.map((kelas) => ({
    label: kelas,
    value: muridList.filter((m) => m.kelas === kelas).length,
  }))
  const funnelData = saringanNama.map((nama, i) => {
    const s = saringanList.find((x) => x.nama === nama)
    return {
      label: nama,
      value: s ? muridList.filter((m) => muridKuasaiSaringan(m, s)).length : 0,
      color: i === 2 ? "var(--green)" : "var(--blue)",
    }
  })

  // Perbandingan saringan: murid yang kuasai keluar ke kelas perdana,
  // baki dibawa ke saringan seterusnya (Pengesanan → Pelepasan 1 → Pelepasan 2)
  let bakiSemasa = muridList
  const perbandinganSaringan = saringanNama.map((nama) => {
    const s = saringanList.find((x) => x.nama === nama)
    const masuk = bakiSemasa.length
    const kuasaiIds = s ? new Set(bakiSemasa.filter((m) => muridKuasaiSaringan(m, s)).map((m) => m.id)) : new Set<string>()
    bakiSemasa = bakiSemasa.filter((m) => !kuasaiIds.has(m.id))
    return { nama, masuk, kuasai: kuasaiIds.size, baki: bakiSemasa.length, wujud: !!s }
  })

  // Jumlah murid semasa ikut tahun (darjah) — angka pertama nama kelas, cth. "3 SOLARIS" → Tahun 3
  const darjahMurid = (m: (typeof muridList)[number]) => parseInt(m.kelas)
  const senaraiDarjah = [...new Set(muridList.map(darjahMurid))]
    .filter((d) => !isNaN(d))
    .sort((a, b) => a - b)

  // Pecahan setiap saringan: siapa menguasai vs belum (untuk penapis interaktif)
  const semakanSaringan: SaringanBreakdown[] = saringanNama.map((nama) => {
    const s = saringanList.find((x) => x.nama === nama)
    const menguasai = s ? muridList.filter((m) => muridKuasaiSaringan(m, s)) : []
    const menguasaiIds = new Set(menguasai.map((m) => m.id))
    const tidakMenguasai = muridList
      .filter((m) => !menguasaiIds.has(m.id))
      .map((m) => ({ id: m.id, nama: m.nama, kelas: m.kelas, jenis: m.jenisPemulihan }))
    return { nama, jumlah: muridList.length, menguasai: menguasai.length, tidakMenguasai }
  })

  const tarikhCetak = new Date().toLocaleDateString("ms-MY", { day: "numeric", month: "long", year: "numeric" })

  return (
    <div className="dashboard-print flex flex-col gap-[18px]">
      {/* Tajuk laporan — hanya untuk cetakan */}
      <div className="print-only" style={{ display: "none", borderBottom: "2px solid var(--ink)", paddingBottom: 8, marginBottom: 4 }}>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[18px] font-bold" style={{ color: "var(--ink)" }}>Laporan Dashboard Pemulihan Khas</div>
            <div className="text-[12px]" style={{ color: "var(--ink-3)" }}>SK Semangar · Tahun {tahunSemasa}</div>
          </div>
          <div className="text-[11px] text-right" style={{ color: "var(--ink-3)" }}>Dicetak: {tarikhCetak}</div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10.5px] font-mono uppercase tracking-[1.2px] mb-[2px]" style={{ color: "var(--ink-4)" }}>
            Dashboard · Tahun {tahunSemasa}
          </div>
          <h2 className="text-xl font-bold" style={{ color: "var(--ink)", letterSpacing: "-0.3px" }}>
            Selamat Datang, {namaPengguna}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <YearFilter tahun={tahunSemasa} senaraiTahun={senaraiTahun} />
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

      {/* Jumlah murid semasa ikut tahun (darjah) */}
      {senaraiDarjah.length > 0 && (
        <div className="bg-white rounded-xl p-4" style={{ border: "1px solid var(--line)" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[13px] font-bold" style={{ color: "var(--ink)" }}>Murid Semasa Ikut Tahun</div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-4)" }}>Bilangan murid pemulihan mengikut darjah · Sesi {tahunSemasa}</div>
            </div>
            <Pill tone="paper">{muridList.length} murid</Pill>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {senaraiDarjah.map((d) => {
              const muridDarjah = muridList.filter((m) => darjahMurid(m) === d)
              const kelasDarjah = [...new Set(muridDarjah.map((m) => m.kelas))].sort()
              return (
                <div key={d} className="rounded-lg p-3 flex flex-col gap-0.5" style={{ background: "var(--paper)", border: "1px solid var(--line-soft)" }}>
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.8px]" style={{ color: "var(--ink-4)" }}>Tahun {d}</div>
                  <div className="flex items-baseline gap-1.5 font-mono tnum">
                    <div className="text-[26px] font-bold" style={{ color: "var(--ink)", letterSpacing: "-0.5px" }}>{muridDarjah.length}</div>
                    <div className="text-[11px]" style={{ color: "var(--ink-4)" }}>murid</div>
                  </div>
                  <div className="text-[10.5px] truncate" style={{ color: "var(--ink-4)" }}>{kelasDarjah.join(", ")}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Baris Carta: Donut · Bar · Funnel */}
      {muridList.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 chart-row">
          {/* Donut — pecahan jenis pemulihan */}
          <div className="bg-white rounded-xl p-4 chart-card" style={{ border: "1px solid var(--line)" }}>
            <div className="text-[13px] font-bold mb-0.5" style={{ color: "var(--ink)" }}>Pecahan Jenis Pemulihan</div>
            <div className="text-[11px] mb-3" style={{ color: "var(--ink-4)" }}>Agihan murid mengikut subjek</div>
            <DonutChart data={donutData} total={muridList.length} />
          </div>

          {/* Bar — murid ikut kelas */}
          <div className="bg-white rounded-xl p-4 chart-card" style={{ border: "1px solid var(--line)" }}>
            <div className="text-[13px] font-bold mb-0.5" style={{ color: "var(--ink)" }}>Bilangan Murid Mengikut Kelas</div>
            <div className="text-[11px] mb-1" style={{ color: "var(--ink-4)" }}>{kelasUnik.length} kelas aktif</div>
            <BarChart data={barData} />
          </div>

          {/* Funnel — penguasaan saringan */}
          <div className="bg-white rounded-xl p-4 chart-card" style={{ border: "1px solid var(--line)" }}>
            <div className="text-[13px] font-bold mb-0.5" style={{ color: "var(--ink)" }}>Penguasaan Saringan</div>
            <div className="text-[11px] mb-3" style={{ color: "var(--ink-4)" }}>Bilangan murid kuasai setiap saringan</div>
            <SaringanFunnel data={funnelData} total={muridList.length} />
          </div>
        </div>
      )}

      {/* Perbandingan Saringan: Pengesanan → Pelepasan 2 */}
      {muridList.length > 0 && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid var(--line)" }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--line-soft)" }}>
            <div>
              <div className="text-[13px] font-bold" style={{ color: "var(--ink)" }}>Perbandingan Saringan</div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-4)" }}>Aliran jumlah murid dari Pengesanan hingga Pelepasan 2 — murid kuasai keluar ke kelas perdana</div>
            </div>
            <Pill tone="paper">Sesi {tahunSemasa}</Pill>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3">
            {perbandinganSaringan.map((p, i) => {
              const pctBaki = p.masuk > 0 ? Math.round((p.baki / p.masuk) * 100) : 0
              return (
                <div key={p.nama} className="p-4 relative" style={{
                  borderRight: i < 2 ? "1px solid var(--line-soft)" : "none",
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[12px] font-bold" style={{ color: "var(--ink)" }}>
                      <span className="font-mono mr-1.5" style={{ color: "var(--ink-4)" }}>{i + 1}</span>{p.nama}
                    </div>
                    {i > 0 && perbandinganSaringan[i - 1].kuasai > 0 && (
                      <span className="text-[10.5px] font-bold font-mono tnum" style={{ color: "var(--green)" }}>
                        −{perbandinganSaringan[i - 1].kuasai} murid
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1.5 font-mono tnum mb-2.5">
                    <div className="text-[34px] font-bold leading-none" style={{ color: "var(--ink)", letterSpacing: "-1px" }}>{p.masuk}</div>
                    <div className="text-[11px]" style={{ color: "var(--ink-4)" }}>murid dalam pemulihan</div>
                  </div>

                  {/* Bar perbandingan relatif kepada jumlah asal */}
                  <div className="w-full rounded-full overflow-hidden mb-2.5" style={{ height: 8, background: "var(--paper-2)" }}>
                    <div className="h-full rounded-full" style={{
                      width: `${muridList.length > 0 ? (p.masuk / muridList.length) * 100 : 0}%`,
                      background: i === 2 ? "var(--green)" : "var(--blue)",
                    }} />
                  </div>

                  {!p.wujud ? (
                    <div className="text-[11px] px-2.5 py-1.5 rounded-md" style={{ background: "var(--paper-2)", color: "var(--ink-4)" }}>
                      Belum ada rekod saringan ini
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 text-[11px]">
                      <div className="flex justify-between px-2.5 py-1.5 rounded-md font-semibold" style={{
                        background: p.kuasai > 0 ? "var(--green-soft)" : "var(--paper-2)",
                        color: p.kuasai > 0 ? "var(--green)" : "var(--ink-4)",
                      }}>
                        <span>Kuasai · ke kelas perdana</span>
                        <span className="font-mono tnum">{p.kuasai}</span>
                      </div>
                      <div className="flex justify-between px-2.5 py-1.5 rounded-md font-semibold" style={{ background: "var(--paper-2)", color: "var(--ink-3)" }}>
                        <span>Kekal pemulihan ({pctBaki}%)</span>
                        <span className="font-mono tnum">{p.baki}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Rumusan akhir */}
          <div className="flex items-center justify-between px-4 py-2.5 text-[11.5px]" style={{ borderTop: "1px solid var(--line-soft)", background: "var(--paper)" }}>
            <span style={{ color: "var(--ink-3)" }}>
              Selepas Pelepasan 2: <b style={{ color: "var(--green)" }}>{muridKePerdanaSemua.length}</b> murid ke kelas perdana ·{" "}
              <b style={{ color: "var(--ink)" }}>{perbandinganSaringan[2].baki}</b> murid masih dalam pemulihan
            </span>
            <span className="font-mono tnum" style={{ color: "var(--ink-4)" }}>
              {muridList.length > 0 ? Math.round((muridKePerdanaSemua.length / muridList.length) * 100) : 0}% pulih
            </span>
          </div>
        </div>
      )}

      {/* Semakan interaktif murid ikut saringan */}
      {muridList.length > 0 && <SemakanSaringan data={semakanSaringan} />}

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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 kelas-grid">
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
