"use client"

type Slice = { label: string; value: number; color: string }

/* ── Donut chart (pecahan kategori) ───────────────────────────── */
export function DonutChart({ data, total }: { data: Slice[]; total: number }) {
  const sum = data.reduce((a, s) => a + s.value, 0)
  const r = 52
  const sw = 22
  const circ = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: 140, height: 140 }}>
        <svg viewBox="0 0 140 140" width={140} height={140} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={70} cy={70} r={r} fill="none" stroke="var(--paper-2)" strokeWidth={sw} />
          {sum > 0 &&
            data.map((s) => {
              const len = (s.value / sum) * circ
              const seg = (
                <circle
                  key={s.label}
                  cx={70}
                  cy={70}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={sw}
                  strokeDasharray={`${len} ${circ - len}`}
                  strokeDashoffset={-offset}
                />
              )
              offset += len
              return seg
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[26px] font-bold font-mono tnum leading-none" style={{ color: "var(--ink)" }}>{total}</div>
          <div className="text-[9.5px] font-semibold uppercase tracking-[0.6px]" style={{ color: "var(--ink-4)" }}>murid</div>
        </div>
      </div>
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        {data.map((s) => {
          const pct = sum > 0 ? Math.round((s.value / sum) * 100) : 0
          return (
            <div key={s.label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
              <span className="text-[12px] flex-1 truncate" style={{ color: "var(--ink-3)" }}>{s.label}</span>
              <span className="text-[12px] font-bold font-mono tnum" style={{ color: "var(--ink)" }}>{s.value}</span>
              <span className="text-[10.5px] font-mono tnum w-9 text-right" style={{ color: "var(--ink-4)" }}>{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Bar chart vertikal (murid ikut kelas) ────────────────────── */
export function BarChart({ data, color = "var(--blue)" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="flex items-end gap-2 h-[150px] pt-2">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0 h-full">
          <span className="text-[11px] font-bold font-mono tnum" style={{ color: "var(--ink)" }}>{d.value}</span>
          <div
            className="w-full rounded-t-[4px] transition-all"
            style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 4 : 0, background: color }}
          />
          <span className="text-[10.5px] font-semibold truncate w-full text-center" style={{ color: "var(--ink-4)" }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Funnel penguasaan saringan ───────────────────────────────── */
export function SaringanFunnel({
  data,
  total,
}: {
  data: { label: string; value: number; color: string }[]
  total: number
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {data.map((d) => {
        const pct = total > 0 ? Math.round((d.value / total) * 100) : 0
        return (
          <div key={d.label}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-[11.5px] font-semibold" style={{ color: "var(--ink-2)" }}>{d.label}</span>
              <span className="text-[11px] font-mono tnum" style={{ color: "var(--ink-4)" }}>
                <b style={{ color: d.color }}>{d.value}</b> / {total} · {pct}%
              </span>
            </div>
            <div className="w-full rounded-full overflow-hidden" style={{ height: 9, background: "var(--paper-2)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: d.color }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
