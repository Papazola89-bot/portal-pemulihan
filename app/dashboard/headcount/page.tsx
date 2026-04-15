"use client"

import { useEffect, useState, useRef } from "react"
import * as XLSX from "xlsx"

type Murid = { id: string; nama: string; kelas: string; jenisPemulihan: string }
type HeadcountEntry = {
  id: string
  muridId: string
  murid: Murid
  tahun: number
  subjek: string
  tov: number
  oti1: number
  ar1: number
  oti2: number
  ar2: number
  oti3: number
  ar3: number
  etr: number
}

type LocalEntry = {
  muridId: string
  nama: string
  kelas: string
  tov: number | string
  oti1: number | string
  ar1: number | string
  oti2: number | string
  ar2: number | string
  oti3: number | string
  ar3: number | string
  etr: number | string
}

const COLS: { key: keyof LocalEntry; label: string }[] = [
  { key: "tov", label: "TOV" },
  { key: "oti1", label: "OTI 1" },
  { key: "ar1", label: "AR 1" },
  { key: "oti2", label: "OTI 2" },
  { key: "ar2", label: "AR 2" },
  { key: "oti3", label: "OTI 3" },
  { key: "ar3", label: "AR 3" },
  { key: "etr", label: "ETR" },
]

export default function HeadcountPage() {
  const [tahun, setTahun] = useState(new Date().getFullYear().toString())
  const [subjek, setSubjek] = useState<"BM" | "Matematik">("BM")
  const [entries, setEntries] = useState<LocalEntry[]>([])
  const [muridList, setMuridList] = useState<Murid[]>([])
  const [saving, setSaving] = useState<string | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const tahunOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  async function loadMurid() {
    const res = await fetch(`/api/murid?tahun=${tahun}`)
    const data: (Murid & { tahun: number })[] = await res.json()
    setMuridList(data)
  }

  async function loadHeadcount() {
    const res = await fetch(`/api/headcount?tahun=${tahun}&subjek=${subjek}`)
    const data: HeadcountEntry[] = await res.json()
    return data
  }

  async function buildEntries() {
    const [muridData, hcData] = await Promise.all([
      fetch(`/api/murid?tahun=${tahun}`).then((r) => r.json() as Promise<(Murid & { tahun: number })[]>),
      fetch(`/api/headcount?tahun=${tahun}&subjek=${subjek}`).then((r) => r.json() as Promise<HeadcountEntry[]>),
    ])

    // Filter murid by jenis pemulihan
    const filtered = muridData.filter((m) => {
      if (subjek === "BM") return m.jenisPemulihan === "Bahasa Melayu" || m.jenisPemulihan === "Bahasa Melayu dan Matematik"
      return m.jenisPemulihan === "Matematik" || m.jenisPemulihan === "Bahasa Melayu dan Matematik"
    })

    const result: LocalEntry[] = filtered.map((m) => {
      const existing = hcData.find((h) => h.muridId === m.id)
      return {
        muridId: m.id,
        nama: m.nama,
        kelas: m.kelas,
        tov: existing?.tov ?? 0,
        oti1: existing?.oti1 ?? 0,
        ar1: existing?.ar1 ?? 0,
        oti2: existing?.oti2 ?? 0,
        ar2: existing?.ar2 ?? 0,
        oti3: existing?.oti3 ?? 0,
        ar3: existing?.ar3 ?? 0,
        etr: existing?.etr ?? 0,
      }
    })

    setEntries(result)
  }

  useEffect(() => { buildEntries() }, [tahun, subjek])

  function handleCellChange(muridId: string, field: keyof LocalEntry, value: string) {
    setEntries((prev) =>
      prev.map((e) => (e.muridId === muridId ? { ...e, [field]: value } : e))
    )
  }

  async function handleCellBlur(muridId: string, field: keyof LocalEntry) {
    const entry = entries.find((e) => e.muridId === muridId)
    if (!entry) return

    setSaving(muridId)
    const payload = {
      muridId,
      tahun,
      subjek,
      tov: Number(entry.tov) || 0,
      oti1: Number(entry.oti1) || 0,
      ar1: Number(entry.ar1) || 0,
      oti2: Number(entry.oti2) || 0,
      ar2: Number(entry.ar2) || 0,
      oti3: Number(entry.oti3) || 0,
      ar3: Number(entry.ar3) || 0,
      etr: Number(entry.etr) || 0,
    }

    await fetch("/api/headcount", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    // Normalize value to number after save
    setEntries((prev) =>
      prev.map((e) =>
        e.muridId === muridId
          ? { ...e, [field]: Number((e as Record<string, unknown>)[field]) || 0 }
          : e
      )
    )
    setSaving(null)
  }

  function exportExcel() {
    const data = entries.map((e, i) => ({
      Bil: i + 1,
      Nama: e.nama,
      Kelas: e.kelas,
      TOV: Number(e.tov) || 0,
      "OTI 1": Number(e.oti1) || 0,
      "AR 1": Number(e.ar1) || 0,
      "OTI 2": Number(e.oti2) || 0,
      "AR 2": Number(e.ar2) || 0,
      "OTI 3": Number(e.oti3) || 0,
      "AR 3": Number(e.ar3) || 0,
      ETR: Number(e.etr) || 0,
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, `Headcount ${subjek} ${tahun}`)
    XLSX.writeFile(wb, `Headcount_${subjek}_${tahun}.xlsx`)
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="print:hidden flex gap-3 items-center">
          <select
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
          >
            {tahunOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {/* Subjek tabs */}
          <div className="flex gap-1">
            {(["BM", "Matematik"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSubjek(s)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={subjek === s
                  ? { backgroundColor: "#35393c", color: "#ffffff" }
                  : { backgroundColor: "#f3f4f6", color: "#374151" }
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="print:hidden flex gap-2">
          <button
            onClick={exportExcel}
            className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#35393c" }}
          >
            📥 Export Excel
          </button>
          <button
            onClick={() => window.print()}
            className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#35393c" }}
          >
            🖨️ Cetak / PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b font-medium flex items-center gap-2"
          style={{ backgroundColor: "#dff0ff", color: "#35393c", borderColor: "#a4d8ff" }}>
          <span>Headcount — {subjek} {tahun}</span>
          <span className="text-xs font-normal text-gray-500">({entries.length} murid)</span>
        </div>

        {entries.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400 italic">
            Tiada murid untuk subjek {subjek} tahun {tahun}.<br />
            Tambah murid di halaman Senarai Murid terlebih dahulu.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-600 w-8">Bil</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 min-w-40">Nama</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 w-24">Kelas</th>
                  {COLS.map((c) => (
                    <th key={c.key} className="text-center px-2 py-3 font-medium text-gray-600 w-16">{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entries.map((entry, i) => (
                  <tr key={entry.muridId} className={`hover:bg-gray-50 ${saving === entry.muridId ? "opacity-70" : ""}`}>
                    <td className="px-4 py-2 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-2 font-medium" style={{ color: "#35393c" }}>{entry.nama}</td>
                    <td className="px-4 py-2 text-gray-600">{entry.kelas}</td>
                    {COLS.map((c) => (
                      <td key={c.key} className="px-1 py-1.5 text-center">
                        <input
                          type="number"
                          min={0}
                          value={(entry as Record<string, unknown>)[c.key] as number | string}
                          onChange={(e) => handleCellChange(entry.muridId, c.key, e.target.value)}
                          onBlur={() => handleCellBlur(entry.muridId, c.key)}
                          className="w-14 text-center border border-gray-200 rounded px-1 py-1 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 italic">
        * Klik pada mana-mana kotak untuk edit. Data disimpan secara automatik apabila klik keluar dari kotak.
      </p>
    </div>
  )
}
