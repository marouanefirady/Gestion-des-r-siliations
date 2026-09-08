import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Empty, ModeBadge, StatusBadge } from '../components/Ui.jsx'
import { PRODUCTS, STATUSES, formatDate, money, useStore } from '../store.jsx'

export default function List() {
  const { data, clientById, removeResiliation } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [product, setProduct] = useState('')

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase()
    return data.resiliations.filter((r) => {
      const c = clientById(r.clientId)
      const text = `${c?.name || ''} ${r.policy} ${r.product}`.toLowerCase()
      return (!s || text.includes(s)) && (!status || r.status === status) && (!product || r.product === product)
    })
  }, [data.resiliations, q, status, product, clientById])

  return (
    <div className="card">
      <div className="row space" style={{ marginBottom: 12 }}>
        <div className="row">
          <input className="search" placeholder="Rechercher un client ou une police…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tous les statuts</option>
            {STATUSES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select value={product} onChange={(e) => setProduct(e.target.value)}>
            <option value="">Tous les produits</option>
            {PRODUCTS.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <Link className="btn primary" to="/nouvelle">
          + Nouvelle résiliation
        </Link>
      </div>
      {rows.length === 0 ? (
        <Empty>Aucun dossier trouvé.</Empty>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Police</th>
              <th>Produit</th>
              <th>Date</th>
              <th>Montant</th>
              <th>Mode</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{clientById(r.clientId)?.name}</td>
                <td>{r.policy}</td>
                <td>{r.product}</td>
                <td>{formatDate(r.date)}</td>
                <td>{money(r.amount)}</td>
                <td>
                  <ModeBadge mode={r.payMode} />
                </td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
                <td>
                  <button className="btn ghost sm" onClick={() => nav(`/resiliations/${r.id}`)}>
                    Ouvrir
                  </button>{' '}
                  <button className="btn danger sm" onClick={() => confirm('Supprimer ce dossier ?') && removeResiliation(r.id)}>
                    Suppr.
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
