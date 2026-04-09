"use client"

import { useEffect, useState } from "react"

type Jadual = { id: string; hari: string; masa: string; subjek: string; kelas: string }

const HARI = ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat"]
const emptyForm = { hari: "Isnin", masa: "", subjek: "Bahasa Melayu", kelas: "" }

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
          <h3 className="font-semibold mb-4" style={{ color: "#35393c" }}>{editId ? "Edit Slot" : "Tambah Slot Baru"}</h3>
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
              <select value={form.subjek} onChange={(e) => setForm({ ...form, subjek: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black">
                <option value="Bahasa Melayu">Bahasa Melayu</option>
                <option value="Matematik">Matematik</option>
                <option value="Persediaan">Persediaan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Kelas</label>
              <input value={form.kelas} onChange={(e) => setForm({ ...form, kelas: e.target.value })}
                placeholder="cth: 1 Bestari"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black" required />
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

      {/* Weekly grid */}
      <div className="grid md:grid-cols-5 gap-3">
        {HARI.map((hari) => {
          const slots = jadual.filter((j) => j.hari === hari)
          return (
            <div key={hari} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="text-white text-center py-2 text-sm font-semibold" style={{ backgroundColor: "#35393c" }}>
                {hari}
              </div>
              <div className="p-2 space-y-2 min-h-24">
                {slots.length === 0 ? (
                  <div className="text-xs text-gray-300 text-center pt-4">Tiada kelas</div>
                ) : (
                  slots.map((j) => {
                    const warna =
                      j.subjek === "Bahasa Melayu" ? "bg-orange-50 border border-orange-200" :
                      j.subjek === "Matematik" ? "bg-purple-50 border border-purple-200" :
                      "bg-green-50 border border-green-200"
                    const warnaText =
                      j.subjek === "Bahasa Melayu" ? "text-orange-800" :
                      j.subjek === "Matematik" ? "text-purple-800" :
                      "text-green-800"
                    const warnaMasa =
                      j.subjek === "Bahasa Melayu" ? "text-orange-500" :
                      j.subjek === "Matematik" ? "text-purple-500" :
                      "text-green-500"
                    return (
                      <div key={j.id} className={`rounded-lg p-2 ${warna}`}>
                        <div className={`text-xs font-bold ${warnaText}`}>{j.subjek}</div>
                        <div className={`text-xs mt-0.5 font-medium ${warnaMasa}`}>{j.masa}</div>
                        {j.kelas && (
                          <div className="text-xs mt-0.5 text-gray-500 flex items-center gap-1">
                            <span>🏫</span> {j.kelas}
                          </div>
                        )}
                        <div className="flex gap-2 mt-1.5 border-t border-black/5 pt-1">
                          <button onClick={() => handleEdit(j)} className="text-xs text-gray-400 hover:text-gray-700">Edit</button>
                          <button onClick={() => handleDelete(j.id)} className="text-xs text-gray-400 hover:text-red-600">Padam</button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
