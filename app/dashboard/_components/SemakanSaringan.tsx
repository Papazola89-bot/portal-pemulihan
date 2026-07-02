"use client"

import { useState } from "react"

export type MuridRingkas = { id: string; nama: string; kelas: string; jenis: string }
export type SaringanBreakdown = {
  nama: string
  jumlah: number
  menguasai: number
  tidakMenguasai: MuridRingkas[]
}

const jenisTone: Record<string, string> = {
  "Bahasa Melayu": "var(--bm)",
  "Matematik": "var(--mt)",
  "Bahasa Melayu dan Matematik": "var(--bmmt)",
}

function jenisRingkas(jenis: string) {
  if (jenis === "Bahasa Melayu") return "BM"
  if (jenis === "Matematik") return "MT"
  if (jenis === "Bahasa Melayu dan Matematik") return "BM & MT"
  return jenis
}

export default function SemakanSaringan({ data }: { data: SaringanBreakdown[] }) {
  const [pilih, setPilih] = useState(0)
  const semasa = data[pilih]
  const maxJumlah = Math.max(1, ...data.map((d) => d.jumlah))

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid var(--line)" }}>
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--line-soft)" }}>
        <div className="text-[13px] font-bold" style={{ color: "var(--ink)" }}>Semakan Murid Ikut Saringan</div>
        <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-4)" }}>
          Pilih jenis saringan untuk lihat murid yang belum menguasai · bandingkan sepanjang ketiga-tiga saringan
        </div>
      </div>

      {/* Visual perbandingan ketiga-tiga saringan */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: "1px solid var(--line-soft)" }}>
        <div className="text-[11px] font-semibold uppercase tracking-[0.6px] mb-3" style={{ color: "var(--ink-4)" }}>
          Perbandingan Penguasaan
        </div>
        <div className="grid grid-cols-3 gap-3 items-end" style={{ height: 168 }}>
          {data.map((d, i) => {
            const tidak = d.jumlah - d.menguasai
            const tinggiTotal = (d.jumlah / maxJumlah) * 100
            const pctKuasai = d.jumlah > 0 ? (d.menguasai / d.jumlah) * 100 : 0
            return (
              <button
                key={d.nama}
                onClick={() => setPilih(i)}
                className="flex flex-col items-center justify-end h-full gap-2 rounded-lg transition-all p-2"
                style={{
                  background: i === pilih ? "var(--paper)" : "transparent",
                  outline: i === pilih ? "2px solid var(--blue)" : "none",
                }}
              >
                <div className="flex gap-3 text-[10.5px] font-mono tnum">
                  <span style={{ color: "var(--green)" }}>▲{d.menguasai}</span>
                  <span style={{ color: "var(--ink-4)" }}>▼{tidak}</span>
                </div>
                <div className="w-full flex flex-col justify-end rounded-md overflow-hidden" style={{ height: `${tinggiTotal}%`, minHeight: 24, background: "var(--paper-2)" }}>
                  {/* Belum kuasai (atas) */}
                  <div style={{ flex: 100 - pctKuasai, background: "var(--paper-2)" }} />
                  {/* Kuasai (bawah, hijau) */}
                  <div style={{ flex: pctKuasai, background: "var(--green)" }} />
                </div>
                <div className="text-[11px] font-semibold text-center leading-tight" style={{ color: i === pilih ? "var(--ink)" : "var(--ink-3)" }}>
                  {d.nama}
                </div>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-4 justify-center mt-2 text-[10.5px]" style={{ color: "var(--ink-4)" }}>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--green)" }} /> Menguasai</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "var(--paper-2)", border: "1px solid var(--line)" }} /> Belum menguasai</span>
        </div>
      </div>

      {/* Tab penapis jenis saringan */}
      <div className="flex gap-2 flex-wrap px-4 pt-3">
        {data.map((d, i) => (
          <button
            key={d.nama}
            onClick={() => setPilih(i)}
            className="px-3.5 py-2 rounded-lg text-[12.5px] font-semibold transition-colors"
            style={i === pilih
              ? { background: "var(--sidebar-bg)", color: "#fff" }
              : { background: "var(--paper-2)", color: "var(--ink-3)" }
            }
          >
            {d.nama}
          </button>
        ))}
      </div>

      {/* Stat ringkas untuk saringan dipilih */}
      <div className="grid grid-cols-3 gap-3 px-4 pt-3 pb-1">
        <div className="rounded-lg p-3" style={{ background: "var(--paper)", border: "1px solid var(--line-soft)" }}>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.6px]" style={{ color: "var(--ink-4)" }}>Jumlah Murid</div>
          <div className="text-[26px] font-bold font-mono tnum leading-tight" style={{ color: "var(--ink)" }}>{semasa.jumlah}</div>
        </div>
        <div className="rounded-lg p-3" style={{ background: "var(--green-soft)", border: "1px solid var(--line-soft)" }}>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.6px]" style={{ color: "var(--green)" }}>Menguasai</div>
          <div className="text-[26px] font-bold font-mono tnum leading-tight" style={{ color: "var(--green)" }}>{semasa.menguasai}</div>
        </div>
        <div className="rounded-lg p-3" style={{ background: "var(--paper-2)", border: "1px solid var(--line-soft)" }}>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.6px]" style={{ color: "var(--ink-3)" }}>Belum Menguasai</div>
          <div className="text-[26px] font-bold font-mono tnum leading-tight" style={{ color: "var(--ink)" }}>{semasa.tidakMenguasai.length}</div>
        </div>
      </div>

      {/* Senarai murid belum menguasai */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[12px] font-bold" style={{ color: "var(--ink)" }}>
            Murid Belum Menguasai · {semasa.nama}
          </div>
          <span className="text-[11px] font-mono tnum" style={{ color: "var(--ink-4)" }}>{semasa.tidakMenguasai.length} murid</span>
        </div>

        {semasa.tidakMenguasai.length === 0 ? (
          <div className="rounded-lg p-6 text-center" style={{ background: "var(--green-soft)", border: "1px dashed var(--green)" }}>
            <div className="text-[13px] font-semibold" style={{ color: "var(--green)" }}>🎉 Semua murid telah menguasai saringan {semasa.nama}!</div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {semasa.tidakMenguasai.map((m, i) => (
              <div key={m.id} className="flex items-center gap-2.5 rounded-lg px-3 py-2" style={{ background: "var(--paper)", border: "1px solid var(--line-soft)" }}>
                <span className="text-[11px] font-mono tnum w-5 text-right shrink-0" style={{ color: "var(--ink-4)" }}>{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold truncate" style={{ color: "var(--ink)" }}>{m.nama}</div>
                  <div className="text-[10.5px]" style={{ color: "var(--ink-4)" }}>{m.kelas}</div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ background: "var(--paper-2)", color: jenisTone[m.jenis] ?? "var(--ink-3)" }}>
                  {jenisRingkas(m.jenis)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
