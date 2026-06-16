"use client"

import { useEffect, useMemo, useState } from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// ── Definisi baris borang ───────────────────────────────────
type Row = { kemahiran: string; noSoalan: string; bilItem: number; wajaran: string }

const BM_ROWS: Row[] = [
  { kemahiran: "Huruf vokal", noSoalan: "1 (a)", bilItem: 5, wajaran: "5/5" },
  { kemahiran: "Huruf kecil", noSoalan: "1 (b)", bilItem: 5, wajaran: "5/5" },
  { kemahiran: "Huruf besar", noSoalan: "1 (c)", bilItem: 5, wajaran: "5/5" },
  { kemahiran: "Perkataan dan suku kata terbuka", noSoalan: "2 (a)", bilItem: 3, wajaran: "3/3" },
  { kemahiran: "Perkataan dan suku kata terbuka", noSoalan: "2 (b)", bilItem: 3, wajaran: "3/3" },
  { kemahiran: "Perkataan dan suku kata tertutup", noSoalan: "3 (a)", bilItem: 4, wajaran: "4/4" },
  { kemahiran: "Perkataan dan suku kata tertutup", noSoalan: "3 (b)", bilItem: 4, wajaran: "4/4" },
  { kemahiran: "Perkataan yang mengandungi suku kata 'ng'", noSoalan: "4 (a)", bilItem: 2, wajaran: "1/2" },
  { kemahiran: "Perkataan yang mengandungi suku kata 'ng'", noSoalan: "4 (b)", bilItem: 5, wajaran: "4/5" },
  { kemahiran: "Perkataan diftong dan vokal berganding", noSoalan: "5", bilItem: 3, wajaran: "2/3" },
  { kemahiran: "Perkataan digraf dan konsonan bergabung", noSoalan: "6", bilItem: 3, wajaran: "2/3" },
  { kemahiran: "Membaca dan membina ayat mudah", noSoalan: "7 (a)", bilItem: 2, wajaran: "1/2" },
  { kemahiran: "Membaca dan membina ayat mudah", noSoalan: "7 (b)", bilItem: 2, wajaran: "1/2" },
  { kemahiran: "Bacaan dan pemahaman", noSoalan: "8", bilItem: 4, wajaran: "3/4" },
]

const MT_ROWS: Row[] = [
  { kemahiran: "Nombor bulat hingga 1000", noSoalan: "1", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Nombor bulat hingga 1000", noSoalan: "2", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Nombor bulat hingga 1000", noSoalan: "3", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Turutan nombor", noSoalan: "4", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Turutan nombor", noSoalan: "5", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Menulis angka", noSoalan: "6", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Nilai nombor", noSoalan: "7", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Nilai nombor", noSoalan: "8", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Operasi tambah dalam lingkungan 18", noSoalan: "9", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Operasi tambah dalam lingkungan 18", noSoalan: "10", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Operasi tambah dalam lingkungan 100 tanpa mengumpul semula", noSoalan: "11", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Operasi tambah dalam lingkungan 100 dengan mengumpul semula", noSoalan: "12", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Operasi tolak dalam lingkungan 18", noSoalan: "13", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Operasi tolak dalam lingkungan 18", noSoalan: "14", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Operasi tolak dalam lingkungan 100 tanpa mengumpul semula", noSoalan: "15", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Operasi tolak dalam lingkungan 100 dengan mengumpul semula", noSoalan: "16", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Operasi darab", noSoalan: "17", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Operasi bahagi", noSoalan: "18", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Nilai wang", noSoalan: "19", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Nilai wang kertas sehingga RM10", noSoalan: "20", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Masa dan waktu", noSoalan: "21", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Masa dan waktu", noSoalan: "22", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Penyelesaian masalah (darab, bahagi, wang, masa dan waktu)", noSoalan: "23", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Penyelesaian masalah (darab, bahagi, wang, masa dan waktu)", noSoalan: "24", bilItem: 1, wajaran: "1/1" },
  { kemahiran: "Penyelesaian masalah (darab, bahagi, wang, masa dan waktu)", noSoalan: "25", bilItem: 1, wajaran: "1/1" },
]

type TafsiranBand = { min: number; max: number; teks: string }
const TAFSIRAN_BM: TafsiranBand[] = [
  { min: 0, max: 29, teks: "Murid belum menguasai kemahiran asas dan perlu mengikuti Program Pemulihan Khas." },
  { min: 30, max: 42, teks: "Murid sedang menguasai kemahiran asas dan perlu meneruskan bimbingan dalam Program Pemulihan Khas." },
  { min: 43, max: 50, teks: "Murid telah menguasai kemahiran asas dan disyorkan kembali ke Aliran Perdana." },
]
const TAFSIRAN_MT: TafsiranBand[] = [
  { min: 0, max: 8, teks: "Murid belum menguasai kemahiran asas dan perlu mengikuti Program Pemulihan Khas." },
  { min: 9, max: 23, teks: "Murid sedang menguasai kemahiran asas dan perlu meneruskan bimbingan dalam Program Pemulihan Khas." },
  { min: 24, max: 25, teks: "Murid telah menguasai kemahiran asas dan disyorkan kembali ke Aliran Perdana." },
]

const INSTRUMEN = ["Pengesanan", "Pelepasan 1", "Pelepasan 2"] as const

type Murid = { id: string; nama: string; kelas: string; jenisPemulihan: string; tahun: number }
type SkorMap = Record<number, { skor: string; tarikh: string }>
type FormState = {
  subjek: "BM" | "MT"
  instrumen: string
  nama: string
  kelas: string
  tahun: string
  disemak: string
  disahkan: string
  skorBM: SkorMap
  skorMT: SkorMap
}

const STORAGE_KEY = "bppi-form-v1"
const emptyForm: FormState = {
  subjek: "BM",
  instrumen: "Pengesanan",
  nama: "",
  kelas: "",
  tahun: new Date().getFullYear().toString(),
  disemak: "",
  disahkan: "",
  skorBM: {},
  skorMT: {},
}

// Kira rowSpan untuk kemahiran yang sama berturut-turut
function groupSpans(rows: Row[]) {
  const span: Record<number, number> = {}
  let i = 0
  while (i < rows.length) {
    let j = i
    while (j + 1 < rows.length && rows[j + 1].kemahiran === rows[i].kemahiran) j++
    span[i] = j - i + 1
    for (let k = i + 1; k <= j; k++) span[k] = 0 // 0 = digabung ke baris atas
    i = j + 1
  }
  return span
}

export default function BppiPage() {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [loaded, setLoaded] = useState(false)
  const [muridList, setMuridList] = useState<Murid[]>([])

  // Muat data tersimpan
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setForm({ ...emptyForm, ...JSON.parse(saved) })
    } catch {}
    setLoaded(true)
  }, [])

  // Simpan auto
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
  }, [form, loaded])

  // Muat senarai murid untuk auto-isi
  useEffect(() => {
    fetch(`/api/murid?tahun=${form.tahun}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setMuridList(Array.isArray(d) ? d : []))
      .catch(() => setMuridList([]))
  }, [form.tahun])

  const rows = form.subjek === "BM" ? BM_ROWS : MT_ROWS
  const spans = useMemo(() => groupSpans(rows), [rows])
  const skorMap = form.subjek === "BM" ? form.skorBM : form.skorMT
  const skorKey = form.subjek === "BM" ? "skorBM" : "skorMT"
  const maxTotal = rows.reduce((s, r) => s + r.bilItem, 0)
  const jumlah = rows.reduce((s, _r, i) => s + (parseInt(skorMap[i]?.skor || "") || 0), 0)
  const bands = form.subjek === "BM" ? TAFSIRAN_BM : TAFSIRAN_MT
  const tafsiranAktif = bands.find((b) => jumlah >= b.min && jumlah <= b.max)
  const subjekLabel = form.subjek === "BM" ? "BAHASA MELAYU" : "MATEMATIK"

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function setSkor(i: number, field: "skor" | "tarikh", val: string) {
    setForm((f) => {
      const map = { ...(f[skorKey] as SkorMap) }
      map[i] = { skor: map[i]?.skor || "", tarikh: map[i]?.tarikh || "", [field]: val }
      return { ...f, [skorKey]: map }
    })
  }

  function pilihMurid(id: string) {
    const m = muridList.find((x) => x.id === id)
    if (!m) return
    const subjek: FormState["subjek"] =
      m.jenisPemulihan === "Matematik" ? "MT" : m.jenisPemulihan === "Bahasa Melayu" ? "BM" : form.subjek
    setForm((f) => ({ ...f, nama: m.nama, kelas: m.kelas, tahun: m.tahun.toString(), subjek }))
  }

  function kosongkan() {
    if (confirm("Kosongkan semua skor & maklumat borang ini?")) setForm(emptyForm)
  }

  function exportPDF() {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    const W = doc.internal.pageSize.getWidth()

    // Tajuk
    doc.setTextColor(0)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("BORANG PELAPORAN PENTAKSIRAN INDIVIDU (BPPI)", W / 2, 15, { align: "center" })
    doc.setFontSize(9.5)
    doc.text(`INSTRUMEN ${form.instrumen.toUpperCase()} ${subjekLabel}`, W / 2, 20.5, { align: "center" })
    doc.text("PROGRAM PEMULIHAN KHAS", W / 2, 25.5, { align: "center" })

    // Maklumat murid
    doc.setFontSize(9.5)
    doc.setFont("helvetica", "normal")
    doc.text(`NAMA : ${form.nama || ""}`, 14, 34)
    doc.text(`KELAS : ${form.kelas || ""}`, 120, 34)
    doc.text(`TAHUN : ${form.tahun || ""}`, 165, 34)

    const kemahiranHead = form.subjek === "BM" ? "KEMAHIRAN ASAS MEMBACA DAN MENULIS" : "KEMAHIRAN ASAS MENGIRA"

    // Jadual
    const body = rows.map((r, i) => {
      const cells: (string | { content: string; rowSpan: number; styles?: object })[] = []
      if (spans[i] > 0) {
        cells.push({ content: r.kemahiran, rowSpan: spans[i], styles: { valign: "middle", halign: "left" } })
      }
      cells.push(r.noSoalan, String(r.bilItem), r.wajaran, skorMap[i]?.skor || "", skorMap[i]?.tarikh || "")
      return cells
    })

    autoTable(doc, {
      startY: 38,
      head: [[kemahiranHead, "NO\nSOALAN", "BIL\nITEM", "WAJARAN\nSKOR", "SKOR\nMURID", "TARIKH\nPELAKSANAAN"]],
      body: body as never,
      foot: [[{ content: "JUMLAH SKOR", colSpan: 1, styles: { halign: "left" } }, "", String(maxTotal), "", String(jumlah), ""]],
      styles: { fontSize: 7.5, cellPadding: 1.4, lineColor: [120, 120, 120], lineWidth: 0.1, textColor: [0, 0, 0] },
      headStyles: { fillColor: [235, 238, 242], textColor: [0, 0, 0], fontStyle: "bold", halign: "center", valign: "middle", lineColor: [120, 120, 120], lineWidth: 0.1 },
      footStyles: { fillColor: [235, 238, 242], textColor: [0, 0, 0], fontStyle: "bold", halign: "center", lineColor: [120, 120, 120], lineWidth: 0.1 },
      columnStyles: {
        0: { cellWidth: 72, halign: "left" },
        1: { cellWidth: 18, halign: "center" },
        2: { cellWidth: 16, halign: "center" },
        3: { cellWidth: 22, halign: "center", fillColor: [235, 235, 235] },
        4: { cellWidth: 20, halign: "center" },
        5: { cellWidth: 34, halign: "center" },
      },
      margin: { left: 14, right: 14 },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let y = (doc as any).lastAutoTable.finalY + 3
    doc.setFontSize(7)
    doc.setFont("helvetica", "italic")
    doc.text("*Murid wajib mematuhi wajaran skor yang telah ditetapkan.", 14, y)
    y += 5

    // Tafsiran skor
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8.5)
    doc.text("TAFSIRAN SKOR :", 14, y)
    y += 1.5
    autoTable(doc, {
      startY: y,
      body: bands.map((b) => [`${b.min} - ${b.max}`, b.teks]),
      styles: { fontSize: 7.5, cellPadding: 1.6, lineColor: [120, 120, 120], lineWidth: 0.1, textColor: [0, 0, 0] },
      columnStyles: { 0: { cellWidth: 22, halign: "center", fontStyle: "bold" }, 1: { cellWidth: 160 } },
      margin: { left: 14, right: 14 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      didParseCell: (data: any) => {
        const band = bands[data.row.index]
        if (tafsiranAktif && band && band.min === tafsiranAktif.min) {
          data.cell.styles.fillColor = [223, 240, 255]
          data.cell.styles.fontStyle = "bold"
        }
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 16
    if (y > 270) y = 270
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text("Disemak oleh:", 14, y)
    doc.text("Disahkan oleh:", 120, y)
    doc.setFont("helvetica", "normal")
    doc.text("(", 14, y + 18)
    doc.text(form.disemak || "", 18, y + 18)
    doc.text(")", 70, y + 18)
    doc.text("(", 120, y + 18)
    doc.text(form.disahkan || "", 124, y + 18)
    doc.text(")", 176, y + 18)

    doc.setFontSize(7)
    doc.setTextColor(150)
    doc.text("Dijana dari Portal Pemulihan Khas SK Semangar", 14, 290)

    const fn = `BPPI_${form.subjek}_${(form.nama || "Murid").replace(/\s+/g, "_")}.pdf`
    doc.save(fn)
  }

  if (!loaded) return null

  return (
    <div className="space-y-4">
      {/* Bar kawalan */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Tab subjek */}
          <div className="inline-flex rounded-lg overflow-hidden border" style={{ borderColor: "#d1d5db" }}>
            {(["BM", "MT"] as const).map((s) => (
              <button key={s} onClick={() => set("subjek", s)}
                className="px-4 py-2 text-sm font-semibold transition-colors"
                style={form.subjek === s
                  ? { background: "#35393c", color: "#fff" }
                  : { background: "#fff", color: "#374151" }}>
                {s === "BM" ? "Bahasa Melayu" : "Matematik"}
              </button>
            ))}
          </div>
          {/* Jenis instrumen */}
          <select value={form.instrumen} onChange={(e) => set("instrumen", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-black">
            {INSTRUMEN.map((x) => <option key={x} value={x}>Instrumen {x}</option>)}
          </select>
          {/* Auto-isi dari senarai murid */}
          <select value="" onChange={(e) => pilihMurid(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-black min-w-48">
            <option value="">— Auto-isi dari senarai murid —</option>
            {muridList.map((m) => <option key={m.id} value={m.id}>{m.nama} ({m.kelas})</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={kosongkan}
            className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition-colors"
            style={{ borderColor: "#9ca3af", color: "#6b7280" }}>
            Kosongkan
          </button>
          <button onClick={exportPDF}
            className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#35393c" }}>
            Cetak PDF
          </button>
        </div>
      </div>

      {/* Maklumat murid */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="text-sm">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Nama</span>
          <input value={form.nama} onChange={(e) => set("nama", e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-black" placeholder="Nama murid" />
        </label>
        <label className="text-sm">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Kelas</span>
          <input value={form.kelas} onChange={(e) => set("kelas", e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-black" placeholder="Cth: 3 Bestari" />
        </label>
        <label className="text-sm">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Tahun</span>
          <input value={form.tahun} onChange={(e) => set("tahun", e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-black" placeholder="Cth: 2026" />
        </label>
      </div>

      {/* Jadual pentaksiran */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b font-medium"
          style={{ backgroundColor: "#dff0ff", color: "#35393c", borderColor: "#a4d8ff" }}>
          {form.subjek === "BM" ? "Kemahiran Asas Membaca dan Menulis" : "Kemahiran Asas Mengira"}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs">
                <th className="text-left px-3 py-2 border-b border-gray-200">Kemahiran</th>
                <th className="px-2 py-2 border-b border-gray-200 text-center">No Soalan</th>
                <th className="px-2 py-2 border-b border-gray-200 text-center">Bil Item</th>
                <th className="px-2 py-2 border-b border-gray-200 text-center">Wajaran Skor</th>
                <th className="px-2 py-2 border-b border-gray-200 text-center">Skor Murid</th>
                <th className="px-2 py-2 border-b border-gray-200 text-center">Tarikh Pelaksanaan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {spans[i] > 0 && (
                    <td rowSpan={spans[i]} className="px-3 py-2 align-middle text-gray-800 border-r border-gray-100">
                      {r.kemahiran}
                    </td>
                  )}
                  <td className="px-2 py-2 text-center text-gray-600">{r.noSoalan}</td>
                  <td className="px-2 py-2 text-center text-gray-600">{r.bilItem}</td>
                  <td className="px-2 py-2 text-center text-gray-600" style={{ background: "#f3f4f6" }}>{r.wajaran}</td>
                  <td className="px-2 py-1.5 text-center">
                    <input type="number" min={0} max={r.bilItem} value={skorMap[i]?.skor ?? ""}
                      onChange={(e) => setSkor(i, "skor", e.target.value)}
                      className="w-16 border border-gray-300 rounded px-2 py-1 text-center text-black" />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <input type="date" value={skorMap[i]?.tarikh ?? ""}
                      onChange={(e) => setSkor(i, "tarikh", e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-black text-xs" />
                  </td>
                </tr>
              ))}
              <tr className="font-bold" style={{ background: "#eef1f5", color: "#35393c" }}>
                <td className="px-3 py-2.5">JUMLAH SKOR</td>
                <td></td>
                <td className="text-center">{maxTotal}</td>
                <td></td>
                <td className="text-center text-base">{jumlah}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tafsiran skor */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b font-medium text-sm"
          style={{ backgroundColor: "#f0fdf4", color: "#35393c", borderColor: "#86efac" }}>
          Tafsiran Skor — Jumlah: {jumlah} / {maxTotal}
        </div>
        <div className="divide-y divide-gray-100">
          {bands.map((b) => {
            const aktif = tafsiranAktif && b.min === tafsiranAktif.min
            return (
              <div key={b.min} className="flex gap-3 px-5 py-2.5 text-sm"
                style={aktif ? { background: "#dff0ff" } : {}}>
                <span className="font-bold w-16 flex-shrink-0" style={{ color: "#35393c" }}>{b.min} - {b.max}</span>
                <span className={aktif ? "font-semibold" : "text-gray-600"} style={aktif ? { color: "#35393c" } : {}}>
                  {b.teks}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tandatangan */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Disemak oleh (nama)</span>
          <input value={form.disemak} onChange={(e) => set("disemak", e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-black" placeholder="Nama guru pemulihan" />
        </label>
        <label className="text-sm">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Disahkan oleh (nama)</span>
          <input value={form.disahkan} onChange={(e) => set("disahkan", e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-black" placeholder="Nama guru besar" />
        </label>
      </div>
    </div>
  )
}
