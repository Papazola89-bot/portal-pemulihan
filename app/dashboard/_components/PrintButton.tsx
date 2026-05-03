"use client"

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12.5px] font-semibold hover:opacity-90 transition-opacity"
      style={{ backgroundColor: "var(--paper)", color: "var(--ink)", border: "1px solid var(--line)" }}
    >
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 9V3h10v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 17h10v4H7z"/>
      </svg>
      Cetak
    </button>
  )
}
