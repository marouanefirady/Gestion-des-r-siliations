import BrandLogo from './BrandLogo.jsx'
import { amountInWords, formatDate, money } from '../store.jsx'

export function printReceipt() {
  const done = () => document.body.classList.remove('print-invoice')
  window.addEventListener('afterprint', done, { once: true })
  document.body.classList.add('print-invoice')
  window.print()
}

export default function Receipt({ company, client, item }) {
  return (
    <div className="receipt" id="receipt">
      <div className="head">
        <BrandLogo className="r-logo-img" />
        <div style={{ textAlign: 'right' }}>
          <strong>{company.name}</strong>
          <div className="muted">{company.slogan}</div>
          <div className="muted">{company.city}</div>
          <div className="muted">{company.phone}</div>
        </div>
      </div>
      <h3>Reçu de paiement</h3>
      <dl>
        <dt>Client</dt>
        <dd>{client?.name || '—'}</dd>
        <dt>Téléphone</dt>
        <dd>{client?.phone || '—'}</dd>
        <dt>N° police</dt>
        <dd>{item?.policy || '—'}</dd>
        <dt>Produit</dt>
        <dd>{item?.product || '—'}</dd>
        <dt>Montant</dt>
        <dd>
          <strong>{money(item?.amount || 0)}</strong>
        </dd>
        <dt>Mode</dt>
        <dd>{item?.payMode || '—'}</dd>
        <dt>Date</dt>
        <dd>{formatDate(item?.payDate || item?.date)}</dd>
        <dt>Statut</dt>
        <dd>{item?.status || '—'}</dd>
      </dl>
      <p className="words">
        {item?.payMode === 'Espèces'
          ? 'Paiement reçu en espèces'
          : `Arrêté le présent reçu à la somme de : ${amountInWords(item?.amount || 0)}.`}
      </p>
      <div className="stamp">
        {client?.name?.trim() || 'Client'}
        <br />
        ________________
      </div>
    </div>
  )
}
