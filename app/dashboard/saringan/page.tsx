"use client"

import { useEffect, useState } from "react"
import * as XLSX from "xlsx"

type Murid = { id: string; nama: string; kelas: string }
type SaringanTick = { id: string; muridId: string; kuasai: boolean; kuasaiBM: boolean; kuasaiMat: boolean }
type Saringan = { id: string; nama: string; tahun: number; ticks: SaringanTick[] }

const SARINGAN_NAMA = ["Pengesanan", "Pelepasan 1", "Pelepasan 2"]

export default function SaringanPage() {
  const [saringanList, setSaringanList] = useState<Saringan[]>([])
  const [muridList, setMuridList] = useState<Murid[]>([])
  const [tahun, setTahun] = useState(new Date().getFullYear().toString())
  const [selected, setSelected] = useState<string>("")
  const [loading, setLoading] = useState(false)

  async function loadSaringan() {
    const res = await fetch(`/api/saringan?tahun=${tahun}`)
    setSaringanList(await res.json())
  }

  async function loadMurid() {
    const res = await fetch(`/api/murid?tahun=${tahun}`)
    setMuridList(await res.json())
  }

  useEffect(() => { loadSaringan(); loadMurid() }, [tahun])
  useEffect(() => { if (saringanList.length > 0 && !selected) setSelected(saringanList[0].id) }, [saringanList])

  async function ensureSaringan() {
    setLoading(true)
    for (const nama of SARINGAN_NAMA) {
      const exists = saringanList.find((s) => s.nama === nama)
      if (!exists) {
        await fetch("/api/saringan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nama, tahun }),
        })
      }
    }
    setLoading(false)
    loadSaringan()
  }

  async function toggleTick(saringanId: string, muridId: string, field: "kuasaiBM" | "kuasaiMat", current: boolean) {
    await fetch(`/api/saringan/${saringanId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ muridId, [field]: !current }),
    })
    loadSaringan()
  }

  function exportExcel() {
    if (!currentSaringan) return
    const data = muridList.map((m, i) => {
      const tick = currentSaringan.ticks.find((t) => t.muridId === m.id)
      return {
        "Bil": i + 1,
        "Nama Murid": m.nama,
        "Kelas": m.kelas,
        "BM": tick?.kuasaiBM ? "Kuasai" : "Belum Kuasai",
        "Matematik": tick?.kuasaiMat ? "Kuasai" : "Belum Kuasai",
      }
    })
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, currentSaringan.nama)
    XLSX.writeFile(wb, `Saringan_${currentSaringan.nama}_${tahun}.xlsx`)
  }

  async function handleDeleteSaringan(id: string) {
    if (!confirm("Padam saringan ini?")) return
    await fetch(`/api/saringan/${id}`, { method: "DELETE" })
    setSelected("")
    loadSaringan()
  }

  const currentSaringan = saringanList.find((s) => s.id === selected)
  const kuasaiBMCount = currentSaringan?.ticks.filter((t) => t.kuasaiBM).length ?? 0
  const kuasaiMatCount = currentSaringan?.ticks.filter((t) => t.kuasaiMat).length ?? 0
  const totalCount = muridList.length
  const tahunOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <select value={tahun} onChange={(e) => { setTahun(e.target.value); setSelected("") }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-black">
          {tahunOptions.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        {saringanList.length < 3 && (
          <button onClick={ensureSaringan} disabled={loading}
            className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: "#35393c" }}>
            {loading ? "Mencipta..." : "Jana Saringan Tahun " + tahun}
          </button>
        )}
      </div>

      {/* Saringan tabs */}
      {saringanList.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {saringanList.map((s) => {
            const kBM = s.ticks.filter((t) => t.kuasaiBM).length
            const kMat = s.ticks.filter((t) => t.kuasaiMat).length
            const isActive = selected === s.id
            return (
              <button key={s.id} onClick={() => setSelected(s.id)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={isActive
                  ? { backgroundColor: "#35393c", color: "#ffffff" }
                  : { backgroundColor: "#f3f4f6", color: "#374151" }
                }>
                {s.nama}
                <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                  style={isActive
                    ? { backgroundColor: "#a4d8ff", color: "#35393c" }
                    : { backgroundColor: "#e5e7eb", color: "#6b7280" }
                  }>
                  BM:{kBM} Mat:{kMat}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Summary bar */}
      {currentSaringan && muridList.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <span className="text-sm font-medium" style={{ color: "#35393c" }}>{currentSaringan.nama} — Tahun {tahun}</span>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium" style={{ color: "#35393c" }}>Bahasa Melayu</span>
              <span className="text-xs font-bold" style={{ color: "#35393c" }}>{kuasaiBMCount}/{totalCount} ({totalCount > 0 ? Math.round((kuasaiBMCount / totalCount) * 100) : 0}%)</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className="h-2.5 rounded-full transition-all" style={{ width: `${totalCount > 0 ? (kuasaiBMCount / totalCount) * 100 : 0}%`, backgroundColor: "#a4d8ff" }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-green-700 font-medium">Matematik</span>
              <span className="text-xs font-bold text-green-600">{kuasaiMatCount}/{totalCount} ({totalCount > 0 ? Math.round((kuasaiMatCount / totalCount) * 100) : 0}%)</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className="bg-green-500 h-2.5 rounded-full transition-all"
                style={{ width: `${totalCount > 0 ? (kuasaiMatCount / totalCount) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Murid tick list */}
      {currentSaringan && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between" style={{ backgroundColor: "#dff0ff" }}>
            <span className="font-medium" style={{ color: "#35393c" }}>{currentSaringan.nama}</span>
            <div className="flex items-center gap-3">
              <button onClick={exportExcel}
                className="text-xs text-white px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#35393c" }}>
                📊 Export Excel
              </button>
              <button onClick={() => handleDeleteSaringan(currentSaringan.id)}
                className="text-xs text-red-400 hover:text-red-600">Padam Saringan</button>
            </div>
          </div>
          {muridList.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Tiada murid untuk tahun {tahun}. Tambah murid dahulu.</div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_100px_100px] px-5 py-2 text-xs font-semibold border-b border-gray-100" style={{ backgroundColor: "#f8fbff" }}>
                <span className="text-gray-500">Nama Murid</span>
                <span className="text-center font-bold" style={{ color: "#35393c" }}>BM</span>
                <span className="text-center text-green-600 font-bold">Matematik</span>
              </div>
              <div className="divide-y divide-gray-100">
                {muridList.map((m) => {
                  const tick = currentSaringan.ticks.find((t) => t.muridId === m.id)
                  const kuasaiBM = tick?.kuasaiBM ?? false
                  const kuasaiMat = tick?.kuasaiMat ?? false
                  return (
                    <div key={m.id} className="grid grid-cols-[1fr_100px_100px] items-center px-5 py-3 hover:bg-gray-50">
                      <div>
                        <div className="text-sm font-medium" style={{ color: "#35393c" }}>{m.nama}</div>
                        <div className="text-xs text-gray-400">{m.kelas}</div>
                      </div>
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleTick(currentSaringan.id, m.id, "kuasaiBM", kuasaiBM)}
                          className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors text-xs font-bold"
                          style={kuasaiBM
                            ? { backgroundColor: "#a4d8ff", borderColor: "#a4d8ff", color: "#35393c" }
                            : { borderColor: "#d1d5db" }
                          }
                        >
                          {kuasaiBM && "✓"}
                        </button>
                      </div>
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleTick(currentSaringan.id, m.id, "kuasaiMat", kuasaiMat)}
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors text-xs font-bold
                            ${kuasaiMat ? "bg-green-500 border-green-500 text-white" : "border-gray-300 hover:border-green-400"}`}
                        >
                          {kuasaiMat && "✓"}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {saringanList.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm">Tiada saringan untuk tahun {tahun}.</p>
          <p className="text-xs mt-1">Klik "Jana Saringan" untuk mencipta Pengesanan, Pelepasan 1 & Pelepasan 2.</p>
        </div>
      )}
    </div>
  )
}
