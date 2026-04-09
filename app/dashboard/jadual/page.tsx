"use client"

import { useEffect, useState } from "react"

type Jadual = { id: string; hari: string; masa: string; subjek: string; kelas: string }

const HARI = ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat"]
const HARI_ORDER: Record<string, number> = { Isnin: 1, Selasa: 2, Rabu: 3, Khamis: 4, Jumaat: 5 }
const emptyForm = { hari: "Isnin", masa: "", subjek: "Bahasa Melayu", kelas: "" }

function parseMasaKeMinit(masa: string): number {
  const match = masa.match(/(\d+):(\d+)\s*-\s*(\d+):(\d+)/)
  if (!match) return 0
  const mula = parseInt(match[1]) * 60 + parseInt(match[2])
  const tamat = parseInt(match[3]) * 60 + parseInt(match[4])
  return Math.max(0, tamat - mula)
}

function formatJamMinit(jumlahMinit: number): string {
  const jam = Math.floor(jumlahMinit / 60)
  const minit = jumlahMinit % 60
  if (jam === 0) return `${minit} minit`
  if (minit === 0) return `${jam} jam`
  return `${jam} jam ${minit} minit`
}

const WARNA_SUBJEK: Record<string, { bg: string; text: string; border: string }> = {
  "Bahasa Melayu": { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
  "Matematik":     { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" },
  "Persediaan":    { bg: "#dff0ff", text: "#35393c", border: "#a4d8ff" },
}

export default function JadualPage() {
  const [jadual, setJadual] = useState<Jadual[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function load() {
    const res = await fetch("/api/jadual")
    setJadual(await res.json())
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    if (editId) {
      await fetch(`/api/jadual/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    } else {
      await fetch("/api/jadual", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    }
    setForm(emptyForm)
    setEditId(null)
    setShowForm(false)
    setLoading(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Padam slot jadual ini?")) return
    await fetch(`/api/jadual/${id}`, { method: "DELETE" })
    load()
  }

  function handleEdit(j: Jadual) {
    setForm({ hari: j.hari, masa: j.masa, subjek: j.subjek, kelas: j.kelas ?? "" })
    setEditId(j.id)
    setShowForm(true)
  }

  // Susun mengikut hari dan masa
  const jadualSusun = [...jadual].sort((a, b) => {
    const hariDiff = (HARI_ORDER[a.hari] ?? 0) - (HARI_ORDER[b.hari] ?? 0)
    if (hariDiff !== 0) return hariDiff
    return a.masa.localeCompare(b.masa)
  })

  // Kira rumusan
  const jumlahSubjek: Record<string, number> = {}
  let jumlahKeseluruhan = 0
  for (const j of jadual) {
    const minit = parseMasaKeMinit(j.masa)
    jumlahSubjek[j.subjek] = (jumlahSubjek[j.subjek] ?? 0) + minit
    jumlahKeseluruhan += minit
  }

  const isPersediaan = form.subjek === "Persediaan"

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true) }}
          className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#35393c" }}
        >
          + Tambah Slot
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold mb-4" style={{ color: "#35393c" }}>
            {editId ? "Edit Slot" : "Tambah Slot Baru"}
          </h3>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Hari</label>
              <select value={form.hari} onChange={(e) => setForm({ ...form, hari: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black">
                {HARI.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Masa</label>
              <input value={form.masa} onChange={(e) => setForm({ ...form, masa: e.target.value })}
                placeholder="cth: 8:00 - 9:00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Subjek</label>
              <select value={form.subjek} onChange={(e) => setForm({ ...form, subjek: e.target.value, kelas: "" })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black">
                <option value="Bahasa Melayu">Bahasa Melayu</option>
                <option value="Matematik">Matematik</option>
                <option value="Persediaan">Persediaan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Kelas {isPersediaan && <span className="text-gray-400 font-normal">(tidak perlu)</span>}
              </label>
              <input value={form.kelas} onChange={(e) => setForm({ ...form, kelas: e.target.value })}
                placeholder={isPersediaan ? "—" : "cth: 1 Bestari"}
                disabled={isPersediaan}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black disabled:bg-gray-50 disabled:text-gray-400" />
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex gap-2">
              <button type="submit" disabled={loading}
                className="text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: "#35393c" }}>
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Jadual dalam bentuk table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b font-medium" style={{ backgroundColor: "#dff0ff", color: "#35393c", borderColor: "#a4d8ff" }}>
          Jadual Kelas Minggu
        </div>
        {jadualSusun.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Tiada slot jadual lagi. Klik "+ Tambah Slot" untuk mula.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#dff0ff" }}>
                  <th className="text-left px-4 py-3 font-medium w-10" style={{ color: "#35393c" }}>Bil</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "#35393c" }}>Hari</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "#35393c" }}>Masa</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "#35393c" }}>Subjek</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "#35393c" }}>Kelas</th>
                  <th className="text-right px-4 py-3 font-medium" style={{ color: "#35393c" }}>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {jadualSusun.map((j, i) => {
                  const warna = WARNA_SUBJEK[j.subjek] ?? { bg: "#f9fafb", text: "#374151", border: "#e5e7eb" }
                  return (
                    <tr key={j.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-4 py-3 font-medium" style={{ color: "#35393c" }}>{j.hari}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{j.masa}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium border"
                          style={{ backgroundColor: warna.bg, color: warna.text, borderColor: warna.border }}>
                          {j.subjek}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {j.kelas || <span className="text-gray-300 italic text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right space-x-3">
                        <button onClick={() => handleEdit(j)} className="text-xs font-medium hover:opacity-70" style={{ color: "#35393c" }}>Edit</button>
                        <button onClick={() => handleDelete(j.id)} className="text-xs text-red-400 hover:text-red-600 font-medium">Padam</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rumusan Jadual */}
      {jadual.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b font-medium" style={{ backgroundColor: "#35393c", color: "#ffffff" }}>
            Rumusan Jadual Kelas
          </div>
          <div className="p-5 space-y-4">
            {/* Jumlah keseluruhan */}
            <div className="rounded-xl p-4 flex items-center justify-between"
              style={{ backgroundColor: "#dff0ff", border: "1px solid #a4d8ff" }}>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Jumlah Keseluruhan Mengajar</div>
                <div className="text-2xl font-bold" style={{ color: "#35393c" }}>
                  {formatJamMinit(jumlahKeseluruhan)}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{jumlahKeseluruhan} minit • {jadual.length} slot</div>
              </div>
              <div className="text-4xl opacity-20">📅</div>
            </div>

            {/* Pecahan mengikut subjek */}
            <div className="grid sm:grid-cols-3 gap-3">
              {Object.entries(jumlahSubjek).map(([subjek, minit]) => {
                const warna = WARNA_SUBJEK[subjek] ?? { bg: "#f9fafb", text: "#374151", border: "#e5e7eb" }
                const peratus = jumlahKeseluruhan > 0 ? Math.round((minit / jumlahKeseluruhan) * 100) : 0
                const bilSlot = jadual.filter((j) => j.subjek === subjek).length
                return (
                  <div key={subjek} className="rounded-xl border p-4"
                    style={{ backgroundColor: warna.bg, borderColor: warna.border }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: warna.text }}>{subjek}</div>
                    <div className="text-xl font-bold" style={{ color: warna.text }}>
                      {formatJamMinit(minit)}
                    </div>
                    <div className="text-xs mt-1" style={{ color: warna.text, opacity: 0.7 }}>
                      {minit} minit • {bilSlot} slot
                    </div>
                    <div className="mt-2 w-full bg-white/60 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${peratus}%`, backgroundColor: warna.text, opacity: 0.4 }} />
                    </div>
                    <div className="text-xs mt-1 font-medium" style={{ color: warna.text, opacity: 0.6 }}>
                      {peratus}% daripada jumlah
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
