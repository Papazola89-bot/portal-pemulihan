"use client"

import { useEffect, useState } from "react"

type Fail = {
  id: string
  tajuk: string
  url: string
  keterangan: string
}

const KOSONG = { tajuk: "", url: "", keterangan: "" }

export default function FailPage() {
  const [senarai, setSenarai] = useState<Fail[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(KOSONG)
  const [simpan, setSimpan] = useState(false)
  const [ralat, setRalat] = useState<string | null>(null)

  async function muat() {
    setLoading(true)
    const res = await fetch("/api/fail")
    if (res.ok) setSenarai(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    muat()
  }, [])

  function bukaTambah() {
    setEditId(null)
    setForm(KOSONG)
    setRalat(null)
    setModal(true)
  }

  function bukaEdit(f: Fail) {
    setEditId(f.id)
    setForm({ tajuk: f.tajuk, url: f.url, keterangan: f.keterangan })
    setRalat(null)
    setModal(true)
  }

  async function hantar(e: React.FormEvent) {
    e.preventDefault()
    setRalat(null)
    if (!form.tajuk.trim() || !form.url.trim()) {
      setRalat("Tajuk dan pautan wajib diisi")
      return
    }
    setSimpan(true)
    const res = await fetch(editId ? `/api/fail/${editId}` : "/api/fail", {
      method: editId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSimpan(false)
    if (res.ok) {
      setModal(false)
      muat()
    } else {
      const data = await res.json().catch(() => ({}))
      setRalat(data.error ?? "Ralat berlaku")
    }
  }

  async function padam(id: string) {
    if (!confirm("Padam pautan ini?")) return
    const res = await fetch(`/api/fail/${id}`, { method: "DELETE" })
    if (res.ok) muat()
  }

  return (
    <div>
      {/* Header aksi */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm" style={{ color: "var(--ink-3)" }}>
          Simpan pautan folder / fail Google Drive kelas pemulihan di sini.
        </p>
        <button
          onClick={bukaTambah}
          className="flex items-center gap-2 text-sm font-medium text-white px-4 py-2 rounded-lg"
          style={{ background: "var(--ink)" }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Tambah Pautan
        </button>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "var(--ink-4)" }}>Memuatkan…</p>
      ) : senarai.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: "var(--yellow-soft)" }}>
            <FolderIcon />
          </div>
          <p className="font-semibold" style={{ color: "var(--ink-2)" }}>Belum ada pautan</p>
          <p className="text-sm mt-1" style={{ color: "var(--ink-4)" }}>Klik “Tambah Pautan” untuk mula.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {senarai.map((f) => (
            <div
              key={f.id}
              className="group bg-white rounded-xl border border-gray-200 p-5 flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: "var(--yellow-soft)" }}>
                  <FolderIcon />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => bukaEdit(f)} title="Edit" className="p-1.5 rounded hover:bg-gray-100">
                    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                    </svg>
                  </button>
                  <button onClick={() => padam(f.id)} title="Padam" className="p-1.5 rounded hover:bg-red-50">
                    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                    </svg>
                  </button>
                </div>
              </div>

              <h3 className="font-semibold leading-snug" style={{ color: "var(--ink)" }}>{f.tajuk}</h3>
              {f.keterangan && (
                <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--ink-3)" }}>{f.keterangan}</p>
              )}

              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-lg border transition-colors hover:bg-gray-50"
                style={{ borderColor: "var(--line)", color: "var(--ink-2)" }}
              >
                Buka Fail
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17 17 7M8 7h9v9" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-semibold mb-5" style={{ color: "var(--ink)" }}>
              {editId ? "Edit Pautan" : "Tambah Pautan"}
            </h2>

            {ralat && (
              <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">{ralat}</div>
            )}

            <form onSubmit={hantar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Tajuk</label>
                <input
                  value={form.tajuk}
                  onChange={(e) => setForm({ ...form, tajuk: e.target.value })}
                  placeholder="cth: Fail Rekod Murid 2026"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Pautan Google Drive</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://drive.google.com/…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Keterangan <span className="text-gray-400 font-normal">(pilihan)</span></label>
                <textarea
                  value={form.keterangan}
                  onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={simpan}
                  className="flex-1 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: "var(--ink)" }}
                >
                  {simpan ? "Menyimpan…" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function FolderIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--yellow)" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  )
}
