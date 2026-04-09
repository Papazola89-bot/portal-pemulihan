import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

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
  const jumlahLain = muridList.length - jumlahBM - jumlahMT - jumlahBMdanMT

  const pelepasan2 = saringanList.find((s) => s.nama.toLowerCase().includes("pelepasan 2"))
  const muridKePerdanaSemua = pelepasan2 ? pelepasan2.ticks.filter((t) => t.kuasai).map((t) => t.muridId) : []

  const kelasUnik = [...new Set(muridList.map((m) => m.kelas))].sort()
  const saringanNama = ["Pengesanan", "Pelepasan 1", "Pelepasan 2"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "#35393c" }}>
          Selamat Datang, {session?.user?.name ?? "Guru"} 👋
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Kelas Pemulihan Khas — SK Semangar — Tahun {tahunSemasa}
        </p>
      </div>

      {/* ── BAHAGIAN 1: Ringkasan Keseluruhan ── */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Ringkasan Keseluruhan
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-1 rounded-xl text-white p-4 flex flex-col justify-between" style={{ backgroundColor: "#35393c" }}>
            <div className="text-xs font-medium opacity-70">Jumlah Murid</div>
            <div className="text-5xl font-bold mt-1">{muridList.length}</div>
            <div className="text-xs opacity-50 mt-1">Tahun {tahunSemasa}</div>
          </div>
          <div className="rounded-xl border bg-orange-50 border-orange-200 p-4">
            <div className="text-xs text-orange-500 font-semibold">Pemulihan BM</div>
            <div className="text-3xl font-bold text-orange-600 mt-1">{jumlahBM}</div>
            <div className="text-xs text-gray-400 mt-1">Bacaan / Tulisan</div>
          </div>
          <div className="rounded-xl border bg-purple-50 border-purple-200 p-4">
            <div className="text-xs text-purple-500 font-semibold">Pemulihan MT</div>
            <div className="text-3xl font-bold text-purple-600 mt-1">{jumlahMT}</div>
            <div className="text-xs text-gray-400 mt-1">Matematik sahaja</div>
          </div>
          <div className="rounded-xl border bg-pink-50 border-pink-200 p-4">
            <div className="text-xs text-pink-500 font-semibold">BM &amp; MT</div>
            <div className="text-3xl font-bold text-pink-600 mt-1">{jumlahBMdanMT}</div>
            <div className="text-xs text-gray-400 mt-1">Dua matapelajaran</div>
          </div>
          <div className="rounded-xl border bg-green-50 border-green-300 p-4">
            <div className="text-xs text-green-600 font-semibold">🎓 Ke Kelas Perdana</div>
            <div className="text-3xl font-bold text-green-600 mt-1">{muridKePerdanaSemua.length}</div>
            <div className="text-xs text-gray-400 mt-1">Lulus Pelepasan 2</div>
          </div>
        </div>

        {/* Bar nisbah jenis pemulihan */}
        {muridList.length > 0 && (
          <div className="mt-3 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-2">
              {jumlahBM > 0 && <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-orange-400 inline-block" />BM: {jumlahBM}</span>}
              {jumlahMT > 0 && <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-purple-400 inline-block" />MT: {jumlahMT}</span>}
              {jumlahBMdanMT > 0 && <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-pink-400 inline-block" />BM & MT: {jumlahBMdanMT}</span>}
              {jumlahLain > 0 && <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gray-300 inline-block" />Lain-lain: {jumlahLain}</span>}
            </div>
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
              {jumlahBM > 0 && <div className="bg-orange-400" style={{ width: `${(jumlahBM / muridList.length) * 100}%` }} />}
              {jumlahMT > 0 && <div className="bg-purple-400" style={{ width: `${(jumlahMT / muridList.length) * 100}%` }} />}
              {jumlahBMdanMT > 0 && <div className="bg-pink-400" style={{ width: `${(jumlahBMdanMT / muridList.length) * 100}%` }} />}
              {jumlahLain > 0 && <div className="bg-gray-300 flex-1" />}
            </div>
          </div>
        )}
      </section>

      {/* ── BAHAGIAN 2: Pecahan Mengikut Kelas ── */}
      {kelasUnik.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Pecahan Mengikut Kelas
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kelasUnik.map((kelas) => {
              const muridKelas = muridList.filter((m) => m.kelas === kelas)
              const bmKelas = muridKelas.filter((m) => m.jenisPemulihan === "Bahasa Melayu").length
              const mtKelas = muridKelas.filter((m) => m.jenisPemulihan === "Matematik").length
              const bmdanmtKelas = muridKelas.filter((m) => m.jenisPemulihan === "Bahasa Melayu dan Matematik").length
              const perdanaKelas = muridKelas.filter((m) => muridKePerdanaSemua.includes(m.id)).length

              return (
                <div key={kelas} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Header kelas */}
                  <div className="text-white px-4 py-3 flex items-center justify-between" style={{ backgroundColor: "#35393c" }}>
                    <span className="font-bold text-base">Kelas {kelas}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#a4d8ff", color: "#35393c" }}>
                      {muridKelas.length} murid
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Jenis pemulihan */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-orange-50 rounded-lg py-2">
                        <div className="text-xl font-bold text-orange-600">{bmKelas}</div>
                        <div className="text-xs text-gray-500">BM</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg py-2">
                        <div className="text-xl font-bold text-purple-600">{mtKelas}</div>
                        <div className="text-xs text-gray-500">MT</div>
                      </div>
                      <div className="bg-pink-50 rounded-lg py-2">
                        <div className="text-xl font-bold text-pink-600">{bmdanmtKelas}</div>
                        <div className="text-xs text-gray-500">BM&MT</div>
                      </div>
                    </div>

                    {/* Saringan progress */}
                    <div className="space-y-1.5">
                      {saringanNama.map((nama) => {
                        const s = saringanList.find((x) => x.nama === nama)
                        const kuasai = s
                          ? s.ticks.filter((t) =>
                              t.kuasai && muridKelas.some((m) => m.id === t.muridId)
                            ).length
                          : 0
                        const total = muridKelas.length
                        const peratus = total > 0 ? Math.round((kuasai / total) * 100) : 0
                        return (
                          <div key={nama}>
                            <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                              <span>{nama}</span>
                              <span className="font-medium">{s ? `${kuasai}/${total}` : "—"}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${nama === "Pelepasan 2" ? "bg-green-500" : ""}`}
                                style={nama !== "Pelepasan 2" ? { width: `${peratus}%`, backgroundColor: "#a4d8ff" } : { width: `${peratus}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Ke kelas perdana */}
                    <div className={`rounded-lg px-3 py-2 flex items-center justify-between
                      ${perdanaKelas > 0 ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-100"}`}>
                      <span className="text-xs text-gray-600">🎓 Ke Kelas Perdana</span>
                      <span className={`text-sm font-bold ${perdanaKelas > 0 ? "text-green-600" : "text-gray-400"}`}>
                        {perdanaKelas} / {muridKelas.length}
                      </span>
                    </div>

                    {/* Senarai nama murid */}
                    <details className="group">
                      <summary className="text-xs cursor-pointer font-medium list-none flex items-center gap-1" style={{ color: "#35393c" }}>
                        <span className="group-open:rotate-90 inline-block transition-transform">▶</span>
                        Lihat senarai murid
                      </summary>
                      <ul className="mt-2 space-y-1">
                        {muridKelas.map((m) => {
                          const lulus = muridKePerdanaSemua.includes(m.id)
                          return (
                            <li key={m.id} className="flex items-center justify-between text-xs">
                              <span className={lulus ? "text-green-700 font-medium" : "text-gray-600"}>
                                {lulus ? "🎓 " : "• "}{m.nama}
                              </span>
                              <span className="text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                                {m.jenisPemulihan}
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    </details>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── BAHAGIAN 3: Ringkasan Saringan Keseluruhan ── */}
      <section>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Ringkasan Saringan {tahunSemasa}
        </h3>
        {saringanList.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-400 text-sm">
            Tiada saringan lagi. Pergi ke <strong>Data Saringan</strong> untuk jana saringan.
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            {saringanNama.map((nama) => {
              const s = saringanList.find((x) => x.nama === nama)
              const kuasai = s ? s.ticks.filter((t) => t.kuasai).length : 0
              const tidakKuasai = s ? s.ticks.filter((t) => !t.kuasai).length : 0
              const total = muridList.length
              const peratus = total > 0 && s ? Math.round((kuasai / total) * 100) : 0
              const isLast = nama === "Pelepasan 2"
              return (
                <div key={nama} className={`rounded-xl border p-4 ${isLast ? "border-green-300 bg-green-50" : "bg-white border-gray-200"}`}>
                  <div className={`text-xs font-semibold mb-2 ${isLast ? "text-green-600" : ""}`}
                    style={!isLast ? { color: "#35393c" } : {}}>
                    {nama}
                  </div>
                  <div className={`text-3xl font-bold ${isLast ? "text-green-600" : ""}`}
                    style={!isLast ? { color: "#35393c" } : {}}>
                    {s ? kuasai : "—"}
                    {s && <span className="text-base font-normal text-gray-400">/{total}</span>}
                  </div>
                  <div className="text-xs text-gray-400 mb-3">murid kuasai</div>
                  {s && (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full ${isLast ? "bg-green-500" : ""}`}
                          style={!isLast ? { width: `${peratus}%`, backgroundColor: "#a4d8ff" } : { width: `${peratus}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>✅ Kuasai: {kuasai}</span>
                        <span>❌ Belum: {tidakKuasai}</span>
                      </div>
                    </>
                  )}
                  {!s && (
                    <p className="text-xs text-gray-400 italic">Belum dicipta</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {muridList.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400">
          <div className="text-4xl mb-3">👨‍🎓</div>
          <p className="text-sm font-medium">Tiada murid untuk tahun {tahunSemasa}.</p>
          <p className="text-xs mt-1">Pergi ke <strong>Senarai Murid</strong> untuk tambah murid.</p>
        </div>
      )}
    </div>
  )
}
