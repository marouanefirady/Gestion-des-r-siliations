export function StatusBadge({ status }) {
  const cls = status === 'Payé' ? 'ok' : status === 'Rejeté' ? 'bad' : 'wait'
  return <span className={`badge ${cls}`}>{status}</span>
}

export function ModeBadge({ mode }) {
  return <span className="badge mode">{mode || '—'}</span>
}

export function Empty({ children }) {
  return <div className="empty">{children}</div>
}
