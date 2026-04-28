"use client"

import { useEffect, useState, useRef } from "react"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

type Murid = { id: string; nama: string; kelas: string; jenisPemulihan: string; tahun: number }

const emptyForm = { nama: "", kelas: "", jenisPemulihan: "Bahasa Melayu", tahun: new Date().getFullYear().toString() }

export default function MuridPage() {
  const [murid, setMurid] = useState<Murid[]>([])
  const [tahun, setTahun] = useState(new Date().getFullYear().toString())
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    const res = await fetch(`/api/murid?tahun=${tahun}`)
    setMurid(await res.json())
  }

  useEffect(() => { load() }, [tahun])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    if (editId) {
      await fetch(`/api/murid/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    } else {
      await fetch("/api/murid", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    }
    setForm(emptyForm)
    setEditId(null)
    setShowForm(false)
    setLoading(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Padam murid ini?")) return
    await fetch(`/api/murid/${id}`, { method: "DELETE" })
    load()
  }

  function handleEdit(m: Murid) {
    setForm({ nama: m.nama, kelas: m.kelas, jenisPemulihan: m.jenisPemulihan, tahun: m.tahun.toString() })
    setEditId(m.id)
    setShowForm(true)
  }

  async function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const lines = text.trim().split("\n").slice(1)
    const rows = lines.map((line) => {
      const [nama, kelas, jenisPemulihan, tahun] = line.split(",").map((s) => s.trim().replace(/"/g, ""))
      return { nama, kelas, jenisPemulihan, tahun }
    }).filter((r) => r.nama)
    await fetch("/api/murid/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows }) })
    load()
    if (fileRef.current) fileRef.current.value = ""
  }

  const tahunOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  function exportExcel() {
    const data = murid.map((m, i) => ({
      "Bil": i + 1,
      "Nama Murid": m.nama,
      "Kelas": m.kelas,
      "Jenis Pemulihan": m.jenisPemulihan,
      "Tahun": m.tahun,
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Senarai Murid")
    XLSX.writeFile(wb, `Senarai_Murid_${tahun}.xlsx`)
  }

  function exportPDF() {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

    // Header
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Senarai Murid Pemulihan Khas", 105, 20, { align: "center" })
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("SK Semangar", 105, 27, { align: "center" })
    doc.text(`Tahun ${tahun}`, 105, 33, { align: "center" })

    // Ringkasan
    const jumlahBM = murid.filter((m) => m.jenisPemulihan === "Bahasa Melayu").length
    const jumlahMT = murid.filter((m) => m.jenisPemulihan === "Matematik").length
    const jumlahBMdanMT = murid.filter((m) => m.jenisPemulihan === "Bahasa Melayu dan Matematik").length

    doc.setFontSize(9)
    doc.text(`Jumlah Murid: ${murid.length}   |   BM: ${jumlahBM}   |   MT: ${jumlahMT}   |   BM & MT: ${jumlahBMdanMT}`, 105, 40, { align: "center" })

    // Jadual
    autoTable(doc, {
      startY: 46,
      head: [["Bil", "Nama Murid", "Kelas", "Jenis Pemulihan"]],
      body: murid.map((m, i) => [
        i + 1,
        m.nama,
        m.kelas,
        m.jenisPemulihan,
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [53, 57, 60], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { cellWidth: 70 },
        2: { cellWidth: 35 },
        3: { cellWidth: 55 },
      },
      margin: { left: 14, right: 14 },
    })

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(`Dijana dari Portal Pemulihan Khas SK Semangar`, 14, 287)
      doc.text(`Halaman ${i} / ${pageCount}`, 196, 287, { align: "right" })
    }

    doc.save(`Senarai_Murid_${tahun}.pdf`)
  }

  function downloadTemplate() {
    const tahunSemasa = new Date().getFullYear()
    const header = "nama,kelas,jenisPemulihan,tahun"
    const contoh = [
      `Ahmad Bin Ali,1 Bestari,Bahasa Melayu,${tahunSemasa}`,
      `Siti Binti Abu,1 Bestari,Matematik,${tahunSemasa}`,
      `Haziq Bin Omar,2 Cerdas,Bahasa Melayu dan Matematik,${tahunSemasa}`,
    ]
    const csvContent = [header, ...contoh].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `template_senarai_murid_${tahunSemasa}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={tahun}
          onChange={(e) => setTahun(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
        >
          {tahunOptions.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button
          onClick={() => { setForm({ ...emptyForm, tahun }); setEditId(null); setShowForm(true) }}
          className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#35393c" }}
        >
          + Tambah Murid
        </button>
        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">
          📂 Upload CSV
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
        </label>
        <button
          onClick={downloadTemplate}
          className="border px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#dff0ff", borderColor: "#a4d8ff", color: "#35393c" }}
        >
          ⬇️ Muat Turun Template
        </button>
        {murid.length > 0 && (
          <>
            <button
              onClick={exportPDF}
              className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#35393c" }}
            >
              📄 Export PDF
            </button>
            <button
              onClick={exportExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              📊 Export Excel
            </button>
          </>
        )}
      </div>

      {/* Panduan format CSV */}
      <div className="rounded-xl p-4 text-sm border" style={{ backgroundColor: "#dff0ff", borderColor: "#a4d8ff" }}>
        <p className="font-semibold mb-2" style={{ color: "#35393c" }}>📋 Panduan Upload CSV</p>
        <ol className="list-decimal list-inside space-y-1 text-xs" style={{ color: "#35393c" }}>
          <li>Klik <strong>Muat Turun Template</strong> untuk dapatkan fail CSV contoh</li>
          <li>Buka fail dengan <strong>Microsoft Excel</strong> atau <strong>Google Sheets</strong></li>
          <li>Isi maklumat murid mengikut kolum yang disediakan</li>
          <li>Simpan semula sebagai format <strong>.csv</strong></li>
          <li>Klik <strong>Upload CSV</strong> dan pilih fail yang dah diisi</li>
        </ol>
        <div className="mt-3 bg-white rounded-lg p-3 border border-white/60">
          <p className="text-xs font-semibold text-gray-600 mb-1">Format kolum yang wajib diisi:</p>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="bg-gray-50 rounded p-1.5 text-center">
              <div className="font-mono font-bold text-gray-700">nama</div>
              <div className="text-gray-400 mt-0.5">Nama penuh murid</div>
            </div>
            <div className="bg-gray-50 rounded p-1.5 text-center">
              <div className="font-mono font-bold text-gray-700">kelas</div>
              <div className="text-gray-400 mt-0.5">cth: 1 Bestari</div>
            </div>
            <div className="bg-gray-50 rounded p-1.5 text-center">
              <div className="font-mono font-bold text-gray-700">jenisPemulihan</div>
              <div className="text-gray-400 mt-0.5">BM / MT / BM&MT</div>
            </div>
            <div className="bg-gray-50 rounded p-1.5 text-center">
              <div className="font-mono font-bold text-gray-700">tahun</div>
              <div className="text-gray-400 mt-0.5">cth: {new Date().getFullYear()}</div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Nilai jenisPemulihan yang diterima: <span className="font-medium text-gray-600">Bahasa Melayu</span>, <span className="font-medium text-gray-600">Matematik</span>, atau <span className="font-medium text-gray-600">Bahasa Melayu dan Matematik</span>
          </p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold mb-4" style={{ color: "#35393c" }}>{editId ? "Edit Murid" : "Tambah Murid Baru"}</h3>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nama</label>
              <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Kelas</label>
              <input value={form.kelas} onChange={(e) => setForm({ ...form, kelas: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Jenis Pemulihan</label>
              <select value={form.jenisPemulihan} onChange={(e) => setForm({ ...form, jenisPemulihan: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black">
                <option value="Bahasa Melayu">Bahasa Melayu</option>
                <option value="Matematik">Matematik</option>
                <option value="Bahasa Melayu dan Matematik">Bahasa Melayu dan Matematik</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tahun</label>
              <select value={form.tahun} onChange={(e) => setForm({ ...form, tahun: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black">
                {tahunOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-2">
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between" style={{ backgroundColor: "#f8fbff" }}>
          <span className="font-medium" style={{ color: "#35393c" }}>Senarai Murid — Tahun {tahun}</span>
          <span className="text-sm text-gray-500">{murid.length} murid</span>
        </div>
        {murid.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Tiada murid untuk tahun ini.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#dff0ff" }}>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "#35393c" }}>Bil</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "#35393c" }}>Nama</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "#35393c" }}>Kelas</th>
                  <th className="text-left px-4 py-3 font-medium" style={{ color: "#35393c" }}>Jenis Pemulihan</th>
                  <th className="text-right px-4 py-3 font-medium" style={{ color: "#35393c" }}>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {murid.map((m, i) => (
                  <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: "#35393c" }}>{m.nama}</td>
                    <td className="px-4 py-3 text-gray-600">{m.kelas}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: "#a4d8ff", color: "#35393c" }}>
                        {m.jenisPemulihan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => handleEdit(m)} className="text-xs font-medium hover:opacity-70" style={{ color: "#35393c" }}>Edit</button>
                      <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Padam</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
