import { useState } from 'react'
import { Empty, ModeBadge, StatusBadge } from '../components/Ui.jsx'
import { formatDate, money, useStore } from '../store.jsx'

export default function Payments() {
  const { data, clientById, saveResiliation } = useStore()
  const [filter, setFilter] = useState('')
  const rows = data.resiliations.filter((r) => !filter || r.payMode === filter || r.status === filter || r.chequeStatus === filter)

  function markPaid(r) {
    saveResiliation({ ...r, status: 'Payé', payDate: r.payDate || new Date().toISOString().slice(0, 10) }, r.id)
  }

  return (
    <div className="card">
      <div className="row space" style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Suivi des paiements</h2>
        <div className="row">
          {['', 'En attente', 'Payé', 'Espèces', 'Chèque', 'Virement'].map((f) => (
            <button key={f || 'all'} className={`btn sm ${filter === f ? 'primary' : 'ghost'}`} onClick={() => setFilter(f)}>
              {f || 'Tous'}
            </button>
          ))}
        </div>
      </div>
      {rows.length === 0 ? (
        <Empty>Aucun paiement.</Empty>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Police</th>
              <th>Montant</th>
              <th>Mode</th>
              <th>Date paiement</th>
              <th>Chèque</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{clientById(r.clientId)?.name}</td>
                <td>{r.policy}</td>
                <td>{money(r.amount)}</td>
                <td>
                  <ModeBadge mode={r.payMode} />
                </td>
                <td>{formatDate(r.payDate)}</td>
                <td>{r.payMode === 'Chèque' ? r.chequeStatus || '—' : '—'}</td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
                <td>
                  {r.status !== 'Payé' && (
                    <button className="btn primary sm" onClick={() => markPaid(r)}>
                      Marquer payé
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
