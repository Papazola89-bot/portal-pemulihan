"use client"

import { useEffect, useState } from "react"

type Murid = { id: string; nama: string; kelas: string; jenisPemulihan: string; tahun: number }
type Kemahiran = { id: string; nama: string; urutan: number }
type Subjek = { id: string; nama: string; kemahiran: Kemahiran[] }
type Tick = { kemahiranId: string; kuasai: boolean; tarikhTick: string | null }
type SaringanTick = { saringanId: string; muridId: string; kuasai: boolean; kuasaiBM: boolean; kuasaiMat: boolean }
type Saringan = { id: string; nama: string; tahun: number; ticks: SaringanTick[] }

export default function PerkembanganPage() {
  const [tahun, setTahun] = useState(new Date().getFullYear().toString())
  const [muridList, setMuridList] = useState<Murid[]>([])
  const [selectedMurid, setSelectedMurid] = useState<string>("")
  const [subjekList, setSubjekList] = useState<Subjek[]>([])
  const [ticks, setTicks] = useState<Tick[]>([])
  const [saringanList, setSaringanList] = useState<Saringan[]>([])
  const [selectedSubjek, setSelectedSubjek] = useState<string>("")

  const tahunOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  async function loadMurid() {
    const res = await fetch(`/api/murid?tahun=${tahun}`)
    const data = await res.json()
    setMuridList(data)
    setSelectedMurid("")
    setTicks([])
  }

  async function loadSubjek() {
    const res = await fetch("/api/subjek")
    const data = await res.json()
    setSubjekList(data)
    if (data.length > 0) setSelectedSubjek(data[0].id)
  }

  async function loadTicks(muridId: string) {
    const res = await fetch(`/api/kemahiran-tick?muridId=${muridId}`)
    setTicks(await res.json())
  }

  async function loadSaringan() {
    const res = await fetch(`/api/saringan?tahun=${tahun}`)
    setSaringanList(await res.json())
  }

  useEffect(() => {
    loadMurid()
    loadSaringan()
  }, [tahun])

  useEffect(() => { loadSubjek() }, [])

  useEffect(() => {
    if (selectedMurid) loadTicks(selectedMurid)
    else setTicks([])
  }, [selectedMurid])

  const murid = muridList.find((m) => m.id === selectedMurid)
  const currentSubjek = subjekList.find((s) => s.id === selectedSubjek)

  function getKuasaiCount(subjek: Subjek) {
    return subjek.kemahiran.filter((k) =>
      ticks.find((t) => t.kemahiranId === k.id && t.kuasai)
    ).length
  }

  // Filter subjek based on jenisPemulihan
  const relevantSubjek = subjekList.filter((s) => {
    if (!murid) return true
    const jp = murid.jenisPemulihan
    if (jp === "Bahasa Melayu") return s.nama.toLowerCase().includes("melayu") || s.nama.toLowerCase().includes("bm")
    if (jp === "Matematik") return s.nama.toLowerCase().includes("matematik") || s.nama.toLowerCase().includes("mat")
    return true
  })

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={tahun}
          onChange={(e) => setTahun(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
        >
          {tahunOptions.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={selectedMurid}
          onChange={(e) => setSelectedMurid(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-black min-w-56"
        >
          <option value="">-- Pilih Murid --</option>
          {muridList.map((m) => (
            <option key={m.id} value={m.id}>{m.nama} ({m.kelas})</option>
          ))}
        </select>
      </div>

      {!selectedMurid && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
          Pilih murid di atas untuk lihat rekod perkembangan.
        </div>
      )}

      {murid && (
        <>
          {/* Kad Murid */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex flex-wrap gap-6 items-start">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Nama</p>
                <p className="font-semibold text-lg mt-0.5" style={{ color: "#35393c" }}>{murid.nama}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Kelas</p>
                <p className="font-medium mt-0.5 text-gray-700">{murid.kelas}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Jenis Pemulihan</p>
                <span className="inline-block mt-0.5 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "#dff0ff", color: "#35393c" }}>
                  {murid.jenisPemulihan}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Tahun</p>
                <p className="font-medium mt-0.5 text-gray-700">{murid.tahun}</p>
              </div>
            </div>
          </div>

          {/* Kemahiran section */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b flex items-center justify-between"
              style={{ backgroundColor: "#dff0ff", borderColor: "#a4d8ff" }}>
              <span className="font-medium" style={{ color: "#35393c" }}>Penguasaan Kemahiran</span>
              {/* Subjek tabs */}
              <div className="flex gap-1">
                {subjekList.map((s) => (
                  <button key={s.id} onClick={() => setSelectedSubjek(s.id)}
                    className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                    style={selectedSubjek === s.id
                      ? { backgroundColor: "#35393c", color: "#ffffff" }
                      : { backgroundColor: "#f3f4f6", color: "#374151" }
                    }>
                    {s.nama}
                  </button>
                ))}
              </div>
            </div>

            {currentSubjek && (() => {
              const kuasai = getKuasaiCount(currentSubjek)
              const total = currentSubjek.kemahiran.length
              const pct = total > 0 ? Math.round((kuasai / total) * 100) : 0
              return (
                <>
                  {/* Progress bar */}
                  <div className="px-5 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-500">{currentSubjek.nama}</span>
                      <span className="text-sm font-bold" style={{ color: "#35393c" }}>
                        {kuasai}/{total} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: "#a4d8ff" }} />
                    </div>
                  </div>

                  {/* Skill list */}
                  <div className="divide-y divide-gray-100">
                    {currentSubjek.kemahiran.map((k, i) => {
                      const tick = ticks.find((t) => t.kemahiranId === k.id)
                      const dikuasai = tick?.kuasai ?? false
                      return (
                        <div key={k.id} className="flex items-center gap-3 px-5 py-2.5">
                          <span className="text-xs text-gray-400 w-6 flex-shrink-0">{i + 1}</span>
                          <div className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
                            style={dikuasai
                              ? { backgroundColor: "#35393c", borderColor: "#35393c", color: "#a4d8ff" }
                              : { borderColor: "#d1d5db" }
                            }>
                            {dikuasai && <span className="text-xs font-bold">✓</span>}
                          </div>
                          <span className={`flex-1 text-sm ${dikuasai ? "font-medium" : "text-gray-600"}`}
                            style={dikuasai ? { color: "#35393c" } : {}}>
                            {k.nama}
                          </span>
                          {tick?.tarikhTick && (
                            <span className="text-xs text-gray-400 flex-shrink-0">
                              {new Date(tick.tarikhTick).toLocaleDateString("ms-MY")}
                            </span>
                          )}
                        </div>
                      )
                    })}
                    {currentSubjek.kemahiran.length === 0 && (
                      <div className="px-5 py-4 text-sm text-gray-400 italic">
                        Tiada kemahiran untuk subjek ini.
                      </div>
                    )}
                  </div>
                </>
              )
            })()}
          </div>

          {/* Saringan section */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b font-medium"
              style={{ backgroundColor: "#f0fdf4", color: "#35393c", borderColor: "#86efac" }}>
              Status Saringan
            </div>
            {saringanList.length === 0 ? (
              <div className="px-5 py-4 text-sm text-gray-400 italic">
                Tiada data saringan untuk tahun {tahun}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3 font-medium text-gray-600">Saringan</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-600">BM</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-600">Matematik</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {saringanList.map((s) => {
                      const tick = s.ticks.find((t) => t.muridId === selectedMurid)
                      return (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-5 py-3 font-medium" style={{ color: "#35393c" }}>{s.nama}</td>
                          <td className="px-4 py-3 text-center">
                            {tick ? (
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${tick.kuasaiBM ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                {tick.kuasaiBM ? "✓" : "✗"}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-lg">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {tick ? (
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${tick.kuasaiMat ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                {tick.kuasaiMat ? "✓" : "✗"}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-lg">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
