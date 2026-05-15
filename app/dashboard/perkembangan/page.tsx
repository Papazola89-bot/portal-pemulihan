"use client"

import { useEffect, useState } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

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

  // Helper: draw one perkembangan page (fit 1 page) with "Disahkan oleh"
  function drawPerkembanganPage(
    doc: jsPDF,
    m: Murid,
    mSubjek: Subjek[],
    mTicks: Tick[],
    mSaringan: Saringan[],
    yr: string
  ) {
    // Count total rows to auto-scale
    const totalRows = mSubjek.reduce((sum, s) => sum + s.kemahiran.length, 0) + mSaringan.length
    const fs = totalRows > 30 ? 6.5 : totalRows > 20 ? 7 : 8
    const cp = totalRows > 30 ? 1 : totalRows > 20 ? 1.5 : 2

    // Header
    doc.setTextColor(0)
    doc.setFontSize(13)
    doc.setFont("helvetica", "bold")
    doc.text("Rekod Perkembangan Murid", 105, 16, { align: "center" })
    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text("Program Pemulihan Khas — SK Semangar", 105, 22, { align: "center" })
    doc.text(`Tahun ${yr}`, 105, 27, { align: "center" })

    // Maklumat murid (compact - 2 columns)
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text(`Murid: ${m.nama}`, 14, 34)
    doc.text(`Jenis Pemulihan: ${m.jenisPemulihan}`, 120, 34)
    doc.setFont("helvetica", "normal")
    doc.text(`Kelas: ${m.kelas}`, 14, 39)

    let yPos = 44

    // Kemahiran per subjek
    mSubjek.forEach((subjek) => {
      const kuasai = subjek.kemahiran.filter((k) =>
        mTicks.find((t) => t.kemahiranId === k.id && t.kuasai)
      ).length
      const total = subjek.kemahiran.length
      const pct = total > 0 ? Math.round((kuasai / total) * 100) : 0

      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(53, 57, 60)
      doc.text(`${subjek.nama} — ${kuasai}/${total} (${pct}%)`, 14, yPos)
      yPos += 1.5

      // Compact progress bar
      doc.setDrawColor(200)
      doc.setFillColor(240, 240, 240)
      doc.roundedRect(14, yPos, 80, 3, 1, 1, "FD")
      if (pct > 0) {
        doc.setFillColor(164, 216, 255)
        doc.roundedRect(14, yPos, (80 * pct) / 100, 3, 1, 1, "F")
      }
      yPos += 5

      autoTable(doc, {
        startY: yPos,
        head: [["Bil", "Kemahiran", "Status", "Tarikh"]],
        body: subjek.kemahiran.map((k, i) => {
          const tick = mTicks.find((t) => t.kemahiranId === k.id)
          const dikuasai = tick?.kuasai ?? false
          const tarikh = tick?.tarikhTick ? new Date(tick.tarikhTick).toLocaleDateString("ms-MY") : "-"
          return [i + 1, k.nama, dikuasai ? "Kuasai" : "Belum", dikuasai ? tarikh : "-"]
        }),
        styles: { fontSize: fs, cellPadding: cp },
        headStyles: { fillColor: [53, 57, 60], textColor: [255, 255, 255], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 248, 255] },
        columnStyles: {
          0: { halign: "center", cellWidth: 10 },
          1: { cellWidth: 85 },
          2: { halign: "center", cellWidth: 25 },
          3: { halign: "center", cellWidth: 30 },
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      yPos = (doc as any).lastAutoTable.finalY + 4
    })

    // Status Saringan
    if (mSaringan.length > 0) {
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(53, 57, 60)
      doc.text("Status Saringan", 14, yPos)
      yPos += 2

      autoTable(doc, {
        startY: yPos,
        head: [["Saringan", "BM", "Matematik"]],
        body: mSaringan.map((s) => {
          const tick = s.ticks.find((t) => t.muridId === m.id)
          return [
            s.nama,
            tick ? (tick.kuasaiBM ? "Lulus" : "Gagal") : "—",
            tick ? (tick.kuasaiMat ? "Lulus" : "Gagal") : "—",
          ]
        }),
        styles: { fontSize: fs, cellPadding: cp },
        headStyles: { fillColor: [34, 120, 60], textColor: [255, 255, 255], fontStyle: "bold" },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { halign: "center", cellWidth: 40 },
          2: { halign: "center", cellWidth: 40 },
        },
        margin: { left: 14, right: 14 },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        didParseCell: (data: any) => {
          if (data.section === "body" && (data.column.index === 1 || data.column.index === 2)) {
            const val = (data.row.raw as string[])[data.column.index]
            if (val === "Lulus") data.cell.styles.textColor = [22, 163, 74]
            else if (val === "Gagal") data.cell.styles.textColor = [220, 38, 38]
            else data.cell.styles.textColor = [156, 163, 175]
          }
        },
      })
    }

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
    if (!murid) return
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    drawPerkembanganPage(doc, murid, relevantSubjek, ticks, saringanList, tahun)
    doc.save(`Perkembangan_${murid.nama.replace(/\s+/g, "_")}_${tahun}.pdf`)
  }

  function exportAllPDF() {
    if (muridList.length === 0) return
    const promises = muridList.map((m) =>
      fetch(`/api/kemahiran-tick?muridId=${m.id}`).then((r) => r.json())
    )
    Promise.all(promises).then((allTicks: Tick[][]) => {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      muridList.forEach((m, idx) => {
        if (idx > 0) doc.addPage()
        const mSubjek = subjekList.filter((s) => {
          const jp = m.jenisPemulihan
          if (jp === "Bahasa Melayu") return s.nama.toLowerCase().includes("melayu") || s.nama.toLowerCase().includes("bm")
          if (jp === "Matematik") return s.nama.toLowerCase().includes("matematik") || s.nama.toLowerCase().includes("mat")
          return true
        })
        drawPerkembanganPage(doc, m, mSubjek, allTicks[idx], saringanList, tahun)
      })
      doc.save(`Perkembangan_Semua_Murid_${tahun}.pdf`)
    })
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="print:hidden flex flex-wrap gap-3 items-center">
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
        <div className="print:hidden flex gap-2">
          {selectedMurid && (
            <button onClick={exportPDF}
              className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#35393c" }}>
              Cetak PDF
            </button>
          )}
          <button onClick={exportAllPDF}
            className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-colors"
            style={{ borderColor: "#35393c", color: "#35393c" }}>
            Cetak Semua Murid
          </button>
        </div>
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
              <div className="print:hidden flex gap-1">
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
