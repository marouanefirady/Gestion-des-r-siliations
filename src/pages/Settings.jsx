import { useState } from 'react'
import { useStore } from '../store.jsx'

export default function Settings() {
  const { data, updateCompany, exportJson, importJson, resetDemo } = useStore()
  const [company, setCompany] = useState(data.company)
  const [msg, setMsg] = useState('')

  return (
    <>
      <div className="grid-2">
        <form
          className="card"
          onSubmit={(e) => {
            e.preventDefault()
            updateCompany(company)
            setMsg('Agence enregistrée.')
          }}
        >
          <h2>Agence</h2>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>Nom</label>
            <input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
          </div>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>Slogan</label>
            <input value={company.slogan || ''} onChange={(e) => setCompany({ ...company, slogan: e.target.value })} />
          </div>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>Ville</label>
            <input value={company.city} onChange={(e) => setCompany({ ...company, city: e.target.value })} />
          </div>
          <div className="field" style={{ marginBottom: 18 }}>
            <label>Téléphone</label>
            <input value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} />
          </div>
          <div className="row space">
            <button className="btn primary">Enregistrer</button>
            {msg && <p className="muted">{msg}</p>}
          </div>
        </form>

        <div className="card">
          <h2>Sauvegarde</h2>
          <p className="muted" style={{ marginTop: 0 }}>
            Les dossiers sont partagés : ils sont enregistrés sur le PC serveur de l’agence. Tous les postes voient les mêmes données.
          </p>
          <div className="row" style={{ marginTop: 18 }}>
            <button className="btn primary" onClick={exportJson}>
              Télécharger la sauvegarde
            </button>
            <label className="btn ghost">
              Restaurer un fichier
              <input
                type="file"
                accept="application/json"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  try {
                    await importJson(f)
                    setMsg('Sauvegarde restaurée.')
                  } catch {
                    alert('Fichier invalide.')
                  }
                }}
              />
            </label>
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <button
              className="btn danger"
              onClick={() => confirm('Remettre les données de démonstration ?') && resetDemo()}
            >
              Données démo
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h2>Utilisateur</h2>
        <div className="row space">
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>{data.users[0].name}</p>
            <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>
              {data.users[0].role}
            </p>
          </div>
          <span className="badge mode">Connecté</span>
        </div>
      </div>
    </>
  )
}
