import { useState } from 'react'
import Receipt, { printReceipt } from '../components/Receipt.jsx'
import { Empty } from '../components/Ui.jsx'
import { formatDate, money, useStore } from '../store.jsx'

export default function Receipts() {
  const { data, clientById } = useStore()
  const cash = data.resiliations.filter((r) => r.payMode === 'Espèces')
  const [id, setId] = useState(cash[0]?.id || '')
  const item = cash.find((r) => r.id === id)

  return (
    <div className="layout-form">
      <div className="card no-print">
        <h2>Reçus espèces</h2>
        {cash.length === 0 ? (
          <Empty>Aucun paiement en espèces.</Empty>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Police</th>
                <th>Date</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              {cash.map((r) => (
                <tr key={r.id} className="clickable" onClick={() => setId(r.id)} style={{ background: id === r.id ? '#e8f4ec' : undefined }}>
                  <td>{clientById(r.clientId)?.name || r.clientName || '—'}</td>
                  <td>{r.policy}</td>
                  <td>{formatDate(r.payDate || r.date)}</td>
                  <td>{money(r.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div>
        {item ? (
          <>
            <div className="card no-print" style={{ marginBottom: 12 }}>
              <button className="btn primary" onClick={printReceipt}>
                Imprimer / PDF
              </button>
            </div>
            <Receipt company={data.company} client={clientById(item.clientId)} item={item} />
          </>
        ) : (
          <div className="card">
            <Empty>Sélectionnez un reçu.</Empty>
          </div>
        )}
      </div>
    </div>
  )
}
