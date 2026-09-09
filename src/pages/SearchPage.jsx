import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Empty, StatusBadge } from '../components/Ui.jsx'
import { formatDate, money, useStore } from '../store.jsx'

export default function SearchPage() {
  const { data, clientById } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const s = q.trim().toLowerCase()

  const rows = useMemo(() => {
    if (!s) return []
    return data.resiliations.filter((r) => {
      const c = clientById(r.clientId)
      return `${c?.name || ''} ${c?.phone || ''} ${r.policy} ${r.product} ${r.reason}`.toLowerCase().includes(s)
    })
  }, [s, data.resiliations, clientById])

  return (
    <div className="card">
      <h2>Recherche rapide</h2>
      <input className="search" autoFocus placeholder="Nom, téléphone, n° police, produit…" value={q} onChange={(e) => setQ(e.target.value)} />
      {!s ? (
        <Empty>Tapez un mot pour chercher.</Empty>
      ) : rows.length === 0 ? (
        <Empty>Aucun résultat.</Empty>
      ) : (
        <table style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Client</th>
              <th>Téléphone</th>
              <th>Police</th>
              <th>Date</th>
              <th>Montant</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const c = clientById(r.clientId)
              return (
                <tr key={r.id} className="clickable" onClick={() => nav(`/resiliations/${r.id}`)}>
                  <td>{c?.name || r.clientName || '—'}</td>
                  <td>{c?.phone || r.clientPhone || '—'}</td>
                  <td>{r.policy}</td>
                  <td>{formatDate(r.date)}</td>
                  <td>{money(r.amount)}</td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
