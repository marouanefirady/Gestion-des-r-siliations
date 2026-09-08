import { Link, useNavigate } from 'react-router-dom'
import { Donut, MonthBars } from '../components/Charts.jsx'
import { ModeBadge, StatusBadge } from '../components/Ui.jsx'
import { formatDate, money, useStore } from '../store.jsx'

export default function Dashboard() {
  const nav = useNavigate()
  const { data, clientById } = useStore()
  const list = data.resiliations
  const total = list.reduce((s, r) => s + Number(r.amount), 0)
  const paid = list.filter((r) => r.status === 'Payé').reduce((s, r) => s + Number(r.amount), 0)
  const pending = total - paid
  const pct = total ? Math.round((paid / total) * 100) : 0
  const cash = list.filter((r) => r.payMode === 'Espèces').reduce((s, r) => s + Number(r.amount), 0)
  const cheques = list.filter((r) => r.payMode === 'Chèque')
  const waitingCheques = cheques.filter((r) => r.chequeStatus === 'En attente').length

  const kpis = [
    { title: 'Résiliations', value: list.length, sub: 'dossiers enregistrés', bg: '#e8f4ec', ico: '▣' },
    { title: 'Montant total', value: money(total), sub: 'toutes résiliations', bg: '#eaf1ff', ico: '₫' },
    { title: 'Déjà payé', value: money(paid), sub: `${pct}% encaissé`, bg: '#fff4dd', ico: '✓' },
    { title: 'En attente', value: money(pending), sub: `${waitingCheques} chèque(s) en cours`, bg: '#fdecec', ico: '…' },
  ]

  return (
    <>
      <div className="kpis">
        {kpis.map((k) => (
          <div className="kpi" key={k.title}>
            <div className="ico" style={{ background: k.bg }}>
              {k.ico}
            </div>
            <div>
              <h3>{k.title}</h3>
              <b>{k.value}</b>
              <span>{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Montant des résiliations par mois (DH)</h2>
          <MonthBars items={list} />
          <div style={{ height: 18 }} />
        </div>
        <div className="card">
          <h2>Répartition par mode de paiement</h2>
          <Donut items={list} />
          <p className="muted" style={{ marginTop: 14, fontSize: 13 }}>
            Espèces : {money(cash)}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="row space">
          <h2>Dernières résiliations</h2>
          <Link className="btn primary" to="/nouvelle">
            + Nouvelle
          </Link>
        </div>
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Police</th>
              <th>Produit</th>
              <th>Date</th>
              <th>Montant</th>
              <th>Paiement</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {list.slice(0, 6).map((r) => (
              <tr key={r.id} className="clickable" onClick={() => nav(`/resiliations/${r.id}`)}>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
