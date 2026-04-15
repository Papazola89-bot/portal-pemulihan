"use client"

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
      style={{ backgroundColor: "#35393c" }}
    >
      🖨️ Cetak / PDF
    </button>
  )
}
