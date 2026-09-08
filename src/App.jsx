import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import List from './pages/List.jsx'
import FormPage from './pages/FormPage.jsx'
import Payments from './pages/Payments.jsx'
import Receipts from './pages/Receipts.jsx'
import SearchPage from './pages/SearchPage.jsx'
import Clients from './pages/Clients.jsx'
import Stats from './pages/Stats.jsx'
import ExportPage from './pages/ExportPage.jsx'
import Settings from './pages/Settings.jsx'
import BrandLogo from './components/BrandLogo.jsx'
import { useStore } from './store.jsx'

const NAV = [
  { to: '/', label: 'Tableau de bord', icon: '▣' },
  { to: '/resiliations', label: 'Résiliations', icon: '☰' },
  { to: '/nouvelle', label: 'Nouvelle résiliation', icon: '+' },
  { to: '/paiements', label: 'Paiements', icon: '₫' },
  { to: '/recus', label: 'Reçus espèces', icon: '✉' },
  { to: '/recherche', label: 'Recherche', icon: '⌕' },
  { to: '/clients', label: 'Clients', icon: '☺' },
  { to: '/statistiques', label: 'Statistiques', icon: '▦' },
  { to: '/export', label: 'Export', icon: '⇩' },
  { to: '/parametres', label: 'Paramètres', icon: '⚙' },
]

const TITLES = {
  '/': 'Tableau de bord',
  '/resiliations': 'Résiliations',
  '/nouvelle': 'Nouvelle résiliation',
  '/paiements': 'Paiements',
  '/recus': 'Reçus espèces',
  '/recherche': 'Recherche',
  '/clients': 'Clients',
  '/statistiques': 'Statistiques',
  '/export': 'Export',
  '/parametres': 'Paramètres',
}

function todayLabel() {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function App() {
  const loc = useLocation()
  const { data, status, error, retry } = useStore()
  const title = loc.pathname.startsWith('/resiliations/')
    ? 'Modifier une résiliation'
    : TITLES[loc.pathname] || 'La Ville Verte'

  if (status === 'loading' || !data) {
    return (
      <div className="boot">
        <BrandLogo className="boot-logo" />
        <p>Connexion au serveur de l’agence…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="boot">
        <BrandLogo className="boot-logo" />
        <p>{error}</p>
        <p className="muted">Sur le PC serveur, lancez le fichier demarrer-agence.bat</p>
        <button className="btn primary" onClick={retry}>
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <BrandLogo className="brand-logo" />
          <p className="brand-tag">Gestion des résiliations</p>
        </div>
        <nav>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}>
              <span className="nav-ico">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <div>
            <h1>{title}</h1>
            <p className="muted cap">{todayLabel()}</p>
          </div>
          <div className="top-actions">
            <span className="chip">{data.resiliations.length} dossiers</span>
            <img className="avatar-logo" src="/logo.png" alt="" />
          </div>
        </header>
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/resiliations" element={<List />} />
            <Route path="/resiliations/:id" element={<FormPage />} />
            <Route path="/nouvelle" element={<FormPage />} />
            <Route path="/paiements" element={<Payments />} />
            <Route path="/recus" element={<Receipts />} />
            <Route path="/recherche" element={<SearchPage />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/statistiques" element={<Stats />} />
            <Route path="/export" element={<ExportPage />} />
            <Route path="/parametres" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
