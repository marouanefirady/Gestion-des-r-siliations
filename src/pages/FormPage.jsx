import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Receipt, { printReceipt } from '../components/Receipt.jsx'
import { PAY_MODES, PRODUCTS, REASONS, STATUSES, CHEQUE_STATUSES, useStore } from '../store.jsx'

const empty = {
  name: '',
  phone: '',
  policy: '',
  product: 'Auto',
  date: new Date().toISOString().slice(0, 10),
  reason: 'Demande client',
  premium: '',
  amount: '',
  status: 'Payé',
  payMode: 'Espèces',
  payDate: new Date().toISOString().slice(0, 10),
  chequeStatus: 'En attente',
  note: '',
}

export default function FormPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { data, clientById, upsertClient, saveResiliation } = useStore()
  const existing = data.resiliations.find((r) => r.id === id)
  const client = existing ? clientById(existing.clientId) : null

  const [form, setForm] = useState(() =>
    existing
      ? {
          name: client?.name || '',
          phone: client?.phone || '',
          policy: existing.policy,
          product: existing.product,
          date: existing.date,
          reason: existing.reason,
          premium: existing.premium,
          amount: existing.amount,
          status: existing.status,
          payMode: existing.payMode,
          payDate: existing.payDate || existing.date,
          chequeStatus: existing.chequeStatus || 'En attente',
          note: existing.note || '',
        }
      : empty
  )

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.policy.trim()) {
      alert('Le nom du client et le n° de police sont obligatoires.')
      return
    }

    const current = data || { clients: [], resiliations: [] }
    const client = await upsertClient({ name: form.name, phone: form.phone })
    const baseState = {
      ...current,
      clients: current.clients.some((c) => c.id === client.id)
        ? current.clients
        : [client, ...current.clients],
      updatedAt: Date.now(),
    }

    await saveResiliation(
      {
        clientId: client.id,
        clientName: form.name,
        clientPhone: form.phone,
        policy: form.policy,
        product: form.product,
        date: form.date,
        reason: form.reason,
        premium: Number(form.premium) || 0,
        amount: Number(form.amount) || 0,
        status: form.status,
        payMode: form.payMode,
        payDate: form.payDate,
        chequeStatus: form.payMode === 'Chèque' ? form.chequeStatus : '',
        note: form.note,
      },
      existing?.id,
      baseState
    )
    nav('/resiliations')
  }

  const preview = {
    policy: form.policy,
    product: form.product,
    amount: form.amount,
    payMode: form.payMode,
    payDate: form.payDate,
    status: form.status,
    date: form.date,
  }

  return (
    <div className="layout-form">
      <form className="card no-print" onSubmit={submit}>
        <h2>{existing ? 'Modifier le dossier' : 'Nouvelle résiliation'}</h2>
        <div className="form-grid">
          <div className="field">
            <label>Nom du client</label>
            <input
              value={form.name}
              onChange={(e) => {
                const name = e.target.value
                const known = data.clients.find((c) => c.name === name)
                setForm((f) => ({ ...f, name, phone: known ? known.phone : f.phone }))
              }}
              list="clients"
              required
            />
            <datalist id="clients">
              {data.clients.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>
          <div className="field">
            <label>Téléphone</label>
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div className="field">
            <label>N° de police</label>
            <input value={form.policy} onChange={(e) => set('policy', e.target.value)} required />
          </div>
          <div className="field">
            <label>Produit</label>
            <select value={form.product} onChange={(e) => set('product', e.target.value)}>
              {PRODUCTS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Date de résiliation</label>
            <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
          </div>
          <div className="field">
            <label>Motif</label>
            <select value={form.reason} onChange={(e) => set('reason', e.target.value)}>
              {REASONS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Montant résiliation (DH)</label>
            <input type="number" min="0" value={form.premium} onChange={(e) => set('premium', e.target.value)} />
          </div>
          <div className="field">
            <label>Montant à régler (DH)</label>
            <input type="number" min="0" value={form.amount} onChange={(e) => set('amount', e.target.value)} />
          </div>
          <div className="field">
            <label>Statut paiement</label>
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
            >
              {STATUSES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            {form.payMode === 'Espèces' && (
              <p className="hint-cash">Paiement reçu en espèces</p>
            )}
          </div>
          <div className="field">
            <label>Mode de paiement</label>
            <select
              value={form.payMode}
              onChange={(e) => {
                const payMode = e.target.value
                setForm((f) => ({
                  ...f,
                  payMode,
                  status: payMode === 'Espèces' ? 'Payé' : f.status,
                }))
              }}
            >
              {PAY_MODES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Date de paiement</label>
            <input type="date" value={form.payDate} onChange={(e) => set('payDate', e.target.value)} />
          </div>
          {form.payMode === 'Chèque' && (
            <div className="field">
              <label>Statut du chèque</label>
              <select value={form.chequeStatus} onChange={(e) => set('chequeStatus', e.target.value)}>
                {CHEQUE_STATUSES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
          )}
          <div className="field full">
            <label>Observations</label>
            <textarea value={form.note} onChange={(e) => set('note', e.target.value)} />
          </div>
        </div>
        <div className="row" style={{ marginTop: 16 }}>
          <button className="btn primary" type="submit">
            Enregistrer
          </button>
          <button className="btn ghost" type="button" onClick={() => nav(-1)}>
            Annuler
          </button>
        </div>
      </form>
      <div>
        <div className="card no-print" style={{ marginBottom: 12 }}>
          <div className="row space">
            <h2 style={{ margin: 0 }}>Aperçu du reçu</h2>
            <button className="btn ghost" type="button" onClick={printReceipt}>
              Imprimer / PDF
            </button>
          </div>
        </div>
        <Receipt company={data.company} client={{ name: form.name, phone: form.phone }} item={preview} />
      </div>
    </div>
  )
}
