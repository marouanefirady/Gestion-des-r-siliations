const COLORS = ['#1d5a30', '#2d8a48', '#e8a317', '#3a7bd5', '#c94a4a']

export function MonthBars({ items }) {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  const totals = Array(12).fill(0)
  items.forEach((r) => {
    const m = Number((r.date || '').split('-')[1]) - 1
    if (m >= 0) totals[m] += Number(r.amount) || 0
  })
  const max = Math.max(...totals, 1)
  return (
    <div className="chart">
      {totals.map((v, i) => (
        <div key={i} className="bar" style={{ height: `${Math.max(8, (v / max) * 180)}px` }} title={`${months[i]}: ${v}`}>
          <span>{months[i]}</span>
        </div>
      ))}
    </div>
  )
}

export function Donut({ items, keyName = 'payMode' }) {
  const map = {}
  items.forEach((r) => {
    const k = r[keyName] || 'Autre'
    map[k] = (map[k] || 0) + 1
  })
  const entries = Object.entries(map)
  const total = entries.reduce((s, [, n]) => s + n, 0) || 1
  let acc = 0
  const stops = entries.map(([label, n], i) => {
    const start = acc
    acc += (n / total) * 100
    return { label, n, color: COLORS[i % COLORS.length], start, end: acc }
  })
  const bg = stops.length
    ? `conic-gradient(${stops.map((s) => `${s.color} ${s.start}% ${s.end}%`).join(', ')})`
    : '#e2e8e4'

  return (
    <div className="donut-wrap">
      <div style={{ width: 150, height: 150, borderRadius: '50%', background: bg, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            inset: 34,
            background: '#fff',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 700,
          }}
        >
          {items.length}
        </div>
      </div>
      <div className="legend">
        {stops.map((s) => (
          <div key={s.label}>
            <span className="dot" style={{ background: s.color }} />
            {s.label} — {Math.round((s.n / total) * 100)}%
          </div>
        ))}
      </div>
    </div>
  )
}
