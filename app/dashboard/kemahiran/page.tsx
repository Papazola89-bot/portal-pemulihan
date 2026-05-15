"use client"

import { useEffect, useState } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

type Kemahiran = { id: string; nama: string; urutan: number }
type Subjek = { id: string; nama: string; kemahiran: Kemahiran[] }
type Murid = { id: string; nama: string; kelas: string; tahun: number }
type Tick = { id: string; muridId: string; kemahiranId: string; kuasai: boolean; tarikhTick: string | null }

export default function KemahiranPage() {
  const [subjekList, setSubjekList] = useState<Subjek[]>([])
  const [muridList, setMuridList] = useState<Murid[]>([])
  const [selectedSubjek, setSelectedSubjek] = useState<string>("")
  const [selectedMurid, setSelectedMurid] = useState<string>("")
  const [ticks, setTicks] = useState<Tick[]>([])
  const [tahun, setTahun] = useState(new Date().getFullYear().toString())
  const [editKemahiran, setEditKemahiran] = useState<string | null>(null)
  const [editNama, setEditNama] = useState("")
  const [newKemahiran, setNewKemahiran] = useState("")

  async function loadSubjek() {
    const res = await fetch("/api/subjek")
    const data = await res.json()
    setSubjekList(data)
    if (data.length > 0 && !selectedSubjek) setSelectedSubjek(data[0].id)
  }

  async function loadMurid() {
    const res = await fetch(`/api/murid?tahun=${tahun}`)
    setMuridList(await res.json())
  }

  async function loadTicks() {
    if (!selectedMurid) return
    const res = await fetch(`/api/kemahiran-tick?muridId=${selectedMurid}`)
    setTicks(await res.json())
  }

  useEffect(() => { loadSubjek() }, [])
  useEffect(() => { loadMurid() }, [tahun])
  useEffect(() => { loadTicks() }, [selectedMurid])

  async function toggleTick(kemahiranId: string) {
    if (!selectedMurid) return
    const existing = ticks.find((t) => t.kemahiranId === kemahiranId)
    const newVal = existing ? !existing.kuasai : true
    await fetch("/api/kemahiran-tick", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ muridId: selectedMurid, kemahiranId, kuasai: newVal }),
    })
    loadTicks()
  }

  async function handleEditKemahiran(subjekId: string, kemahiranId: string) {
    await fetch(`/api/subjek/${subjekId}/kemahiran/${kemahiranId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama: editNama }),
    })
    setEditKemahiran(null)
    loadSubjek()
  }

  async function handleDeleteKemahiran(subjekId: string, kemahiranId: string) {
    if (!confirm("Padam kemahiran ini?")) return
    await fetch(`/api/subjek/${subjekId}/kemahiran/${kemahiranId}`, { method: "DELETE" })
    loadSubjek()
  }

  async function handleAddKemahiran(subjekId: string) {
    if (!newKemahiran.trim()) return
    await fetch(`/api/subjek/${subjekId}/kemahiran`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama: newKemahiran }),
    })
    setNewKemahiran("")
    loadSubjek()
  }

  // Helper: draw one kemahiran page (fit 1 page) with "Disahkan oleh"
  function drawKemahiranPage(doc: jsPDF, m: { nama: string; kelas: string }, subjek: Subjek, kemahiranTicks: Tick[], yr: string) {
    const rows = subjek.kemahiran.length
    const kCount = subjek.kemahiran.filter((k) => kemahiranTicks.find((t) => t.kemahiranId === k.id && t.kuasai)).length
    const total = rows
    const pct = total > 0 ? Math.round((kCount / total) * 100) : 0

    // Auto-scale: smaller font/padding for more rows
    const fs = rows > 25 ? 7 : rows > 18 ? 8 : 9
    const cp = rows > 25 ? 1.5 : rows > 18 ? 2 : 3

    // Header
    doc.setTextColor(0)
    doc.setFontSize(13)
    doc.setFont("helvetica", "bold")
    doc.text("Rekod Penguasaan Kemahiran", 105, 18, { align: "center" })
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text("Program Pemulihan Khas — SK Semangar", 105, 24, { align: "center" })
    doc.text(`Tahun ${yr}`, 105, 29, { align: "center" })

    // Maklumat murid (compact - 2 columns)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text(`Murid: ${m.nama}`, 14, 37)
    doc.text(`Subjek: ${subjek.nama}`, 120, 37)
    doc.setFont("helvetica", "normal")
    doc.text(`Kelas: ${m.kelas}`, 14, 42)
    doc.text(`Penguasaan: ${kCount}/${total} (${pct}%)`, 120, 42)

    // Progress bar
    doc.setDrawColor(200)
    doc.setFillColor(240, 240, 240)
    doc.roundedRect(14, 45, 100, 4, 1.5, 1.5, "FD")
    if (pct > 0) {
      doc.setFillColor(164, 216, 255)
      doc.roundedRect(14, 45, (100 * pct) / 100, 4, 1.5, 1.5, "F")
    }

    // Table
    autoTable(doc, {
      startY: 53,
      head: [["Bil", "Kemahiran", "Status", "Tarikh Kuasai"]],
      body: subjek.kemahiran.map((k, i) => {
        const tick = kemahiranTicks.find((t) => t.kemahiranId === k.id)
        const kuasai = tick?.kuasai ?? false
        const tarikh = tick?.tarikhTick ? new Date(tick.tarikhTick).toLocaleDateString("ms-MY") : "-"
        return [i + 1, k.nama, kuasai ? "Kuasai" : "Belum", kuasai ? tarikh : "-"]
      }),
      styles: { fontSize: fs, cellPadding: cp },
      headStyles: { fillColor: [53, 57, 60], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { cellWidth: 90 },
        2: { halign: "center", cellWidth: 30 },
        3: { halign: "center", cellWidth: 35 },
      },
      margin: { left: 14, right: 14 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      didParseCell: (data: any) => {
        if (data.section === "body" && data.column.index === 2) {
          const val = (data.row.raw as string[])[2]
          data.cell.styles.textColor = val === "Kuasai" ? [22, 163, 74] : [156, 163, 175]
        }
      },
    })

    // Disahkan oleh — always at bottom of page
    const signY = 252
    doc.setDrawColor(0)
    doc.setTextColor(0)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("Disahkan oleh:", 14, signY)
    doc.setFont("helvetica", "normal")

    // Guru Pemulihan Khas
    doc.text("...............................................", 14, signY + 20)
    doc.setFontSize(8)
    doc.text("(Guru Pemulihan Khas)", 14, signY + 25)

    // Guru Besar
    doc.text("...............................................", 120, signY + 20)
    doc.text("(Guru Besar)", 120, signY + 25)

    // Footer
    doc.setFontSize(7)
    doc.setTextColor(150)
    doc.text("Dijana dari Portal Pemulihan Khas SK Semangar", 14, 290)
  }

  function exportPDF() {
    if (!selectedMurid || !currentSubjek) return
    const murid = muridList.find((m) => m.id === selectedMurid)
    if (!murid) return
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    drawKemahiranPage(doc, murid, currentSubjek, ticks, tahun)
    doc.save(`Kemahiran_${murid.nama.replace(/\s+/g, "_")}_${currentSubjek.nama}_${tahun}.pdf`)
  }

  function exportAllPDF() {
    if (!currentSubjek || muridList.length === 0) return
    const promises = muridList.map((murid) =>
      fetch(`/api/kemahiran-tick?muridId=${murid.id}`).then((r) => r.json())
    )
    Promise.all(promises).then((allTicks: Tick[][]) => {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      muridList.forEach((murid, idx) => {
        if (idx > 0) doc.addPage()
        drawKemahiranPage(doc, murid, currentSubjek, allTicks[idx], tahun)
      })
      doc.save(`Kemahiran_Semua_Murid_${currentSubjek.nama}_${tahun}.pdf`)
    })
  }

  const currentSubjek = subjekList.find((s) => s.id === selectedSubjek)
  const kuasaiCount = currentSubjek?.kemahiran.filter((k) => ticks.find((t) => t.kemahiranId === k.id && t.kuasai)).length ?? 0
  const totalKemahiran = currentSubjek?.kemahiran.length ?? 0
  const peratus = totalKemahiran > 0 ? Math.round((kuasaiCount / totalKemahiran) * 100) : 0

  const tahunOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={tahun} onChange={(e) => setTahun(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-black">
          {tahunOptions.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={selectedMurid} onChange={(e) => setSelectedMurid(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-black min-w-48">
          <option value="">-- Pilih Murid --</option>
          {muridList.map((m) => <option key={m.id} value={m.id}>{m.nama} ({m.kelas})</option>)}
        </select>
        <div className="flex gap-1">
          {subjekList.map((s) => (
            <button key={s.id} onClick={() => setSelectedSubjek(s.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={selectedSubjek === s.id
                ? { backgroundColor: "#35393c", color: "#ffffff" }
                : { backgroundColor: "#f3f4f6", color: "#374151" }
              }
            >
              {s.nama}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          {selectedMurid && currentSubjek && (
            <button onClick={exportPDF}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#35393c" }}>
              Cetak PDF
            </button>
          )}
          {currentSubjek && (
            <button onClick={exportAllPDF}
              className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-colors"
              style={{ borderColor: "#35393c", color: "#35393c" }}>
              Cetak Semua Murid
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {selectedMurid && currentSubjek && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: "#35393c" }}>
              {muridList.find((m) => m.id === selectedMurid)?.nama} — {currentSubjek.nama}
            </span>
            <span className="text-sm font-bold" style={{ color: "#35393c" }}>{kuasaiCount}/{totalKemahiran} ({peratus}%)</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div className="h-3 rounded-full transition-all" style={{ width: `${peratus}%`, backgroundColor: "#a4d8ff" }} />
          </div>
        </div>
      )}

      {/* Kemahiran list */}
      {currentSubjek && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b font-medium" style={{ backgroundColor: "#dff0ff", color: "#35393c", borderColor: "#a4d8ff" }}>
            Kemahiran — {currentSubjek.nama}
          </div>
          <div className="divide-y divide-gray-100">
            {currentSubjek.kemahiran.map((k, i) => {
              const tick = ticks.find((t) => t.kemahiranId === k.id)
              const kuasai = tick?.kuasai ?? false
              return (
                <div key={k.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                  <span className="text-xs text-gray-400 w-6">{i + 1}</span>
                  {selectedMurid ? (
                    <button
                      onClick={() => toggleTick(k.id)}
                      className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                      style={kuasai
                        ? { backgroundColor: "#35393c", borderColor: "#35393c", color: "#a4d8ff" }
                        : { borderColor: "#d1d5db" }
                      }
                    >
                      {kuasai && <span className="text-xs font-bold">✓</span>}
                    </button>
                  ) : (
                    <div className="w-5 h-5 rounded border-2 border-gray-200 flex-shrink-0" />
                  )}
                  {editKemahiran === k.id ? (
                    <div className="flex-1 flex gap-2">
                      <input value={editNama} onChange={(e) => setEditNama(e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm" />
                      <button onClick={() => handleEditKemahiran(currentSubjek.id, k.id)}
                        className="text-xs font-medium" style={{ color: "#35393c" }}>Simpan</button>
                      <button onClick={() => setEditKemahiran(null)}
                        className="text-xs text-gray-500">Batal</button>
                    </div>
                  ) : (
                    <>
                      <span className={`flex-1 text-sm ${kuasai && selectedMurid ? "font-medium" : "text-gray-700"}`}
                        style={kuasai && selectedMurid ? { color: "#35393c" } : {}}>
                        {k.nama}
                      </span>
                      {tick?.tarikhTick && (
                        <span className="text-xs text-gray-400">
                          {new Date(tick.tarikhTick).toLocaleDateString("ms-MY")}
                        </span>
                      )}
                      <button onClick={() => { setEditKemahiran(k.id); setEditNama(k.nama) }}
                        className="text-xs text-gray-400 hover:text-gray-600">✏️</button>
                      <button onClick={() => handleDeleteKemahiran(currentSubjek.id, k.id)}
                        className="text-xs text-gray-400 hover:text-red-600">🗑️</button>
                    </>
                  )}
                </div>
              )
            })}
          </div>
          {/* Add new kemahiran */}
          <div className="px-5 py-3 border-t border-gray-100 flex gap-2">
            <input value={newKemahiran} onChange={(e) => setNewKemahiran(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddKemahiran(currentSubjek.id)}
              placeholder="Tambah kemahiran baru..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <button onClick={() => handleAddKemahiran(currentSubjek.id)}
              className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#35393c" }}>
              + Tambah
            </button>
          </div>
        </div>
      )}

      {!selectedMurid && (
        <p className="text-sm text-gray-400 italic">Pilih murid di atas untuk mula tick kemahiran.</p>
      )}
    </div>
  )
}
