import { Donut, MonthBars } from '../components/Charts.jsx'
import { money, useStore } from '../store.jsx'

export default function Stats() {
  const { data } = useStore()
  const list = data.resiliations
  const byProduct = {}
  list.forEach((r) => {
    byProduct[r.product] = (byProduct[r.product] || 0) + Number(r.amount)
  })

  return (
    <>
      <div className="grid-2">
        <div className="card">
          <h2>Évolution mensuelle</h2>
          <MonthBars items={list} />
          <div style={{ height: 18 }} />
        </div>
        <div className="card">
          <h2>Par produit</h2>
          <Donut items={list} keyName="product" />
        </div>
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <h2>Montants par produit</h2>
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(byProduct).map(([k, v]) => (
              <tr key={k}>
                <td>{k}</td>
                <td>{money(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
