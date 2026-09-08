import { useState } from 'react'
import { Empty } from '../components/Ui.jsx'
import { money, useStore } from '../store.jsx'

export default function Clients() {
  const { data, saveClient } = useStore()
  const [form, setForm] = useState({ name: '', phone: '', email: '' })

  function add(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    saveClient(form)
    setForm({ name: '', phone: '', email: '' })
  }

  return (
    <div className="grid-2">
      <div className="card">
        <h2>Liste des clients</h2>
        {data.clients.length === 0 ? (
          <Empty>Aucun client.</Empty>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Dossiers</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.clients.map((c) => {
                const items = data.resiliations.filter((r) => r.clientId === c.id)
                const total = items.reduce((s, r) => s + Number(r.amount), 0)
                return (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.phone}</td>
                    <td>{c.email || '—'}</td>
                    <td>{items.length}</td>
                    <td>{money(total)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      <form className="card" onSubmit={add}>
        <h2>Ajouter un client</h2>
        <div className="field" style={{ marginBottom: 10 }}>
          <label>Nom</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="field" style={{ marginBottom: 10 }}>
          <label>Téléphone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Email</label>
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <button className="btn primary">Enregistrer</button>
      </form>
    </div>
  )
}
