import { money, useStore } from '../store.jsx'

function csvEscape(v) {
  const s = String(v ?? '')
  if (/[",;\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export default function ExportPage() {
  const { data, clientById } = useStore()

  function downloadCsv() {
    const header = ['Client', 'Telephone', 'Police', 'Produit', 'Date', 'Montant', 'Mode', 'Statut', 'Motif']
    const lines = data.resiliations.map((r) => {
      const c = clientById(r.clientId)
      return [c?.name, c?.phone, r.policy, r.product, r.date, r.amount, r.payMode, r.status, r.reason].map(csvEscape).join(';')
    })
    const blob = new Blob(['\uFEFF' + [header.join(';'), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'resiliations.csv'
    a.click()
  }

  const total = data.resiliations.reduce((s, r) => s + Number(r.amount), 0)

  return (
    <div className="card">
      <h2>Exporter les données</h2>
      <p className="muted">
        {data.resiliations.length} dossiers — total {money(total)}
      </p>
      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn primary" onClick={downloadCsv}>
          Télécharger Excel (CSV)
        </button>
        <button className="btn ghost" onClick={() => window.print()}>
          Imprimer / PDF la page
        </button>
      </div>
      <table style={{ marginTop: 18 }}>
        <thead>
          <tr>
            <th>Client</th>
            <th>Police</th>
            <th>Produit</th>
            <th>Montant</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {data.resiliations.map((r) => (
            <tr key={r.id}>
              <td>{clientById(r.clientId)?.name}</td>
              <td>{r.policy}</td>
              <td>{r.product}</td>
              <td>{money(r.amount)}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
