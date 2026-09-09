import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

const KEY = 'assur-resil-v1'
const StoreContext = createContext(null)

export const PRODUCTS = ['Auto', 'Habitation', 'Santé', 'Vie', 'Professionnel']
export const PAY_MODES = ['Espèces', 'Chèque', 'Virement', 'Carte']
export const STATUSES = ['Payé', 'En attente']
export const REASONS = ['Demande client', 'Non-paiement', 'Changement d’assureur', 'Vente du bien', 'Autre']
export const CHEQUE_STATUSES = ['En attente', 'Encaissé', 'Rejeté']

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())
}

function seed() {
  const clients = [
    { id: 'c1', name: 'Karim El Fassi', phone: '06 12 34 56 78', email: 'karim@email.ma' },
    { id: 'c2', name: 'Sara Benali', phone: '06 98 76 54 32', email: 'sara@email.ma' },
    { id: 'c3', name: 'Youssef Amrani', phone: '06 55 44 33 22', email: 'youssef@email.ma' },
    { id: 'c4', name: 'Nadia Cherkaoui', phone: '06 11 22 33 44', email: 'nadia@email.ma' },
    { id: 'c5', name: 'Omar Tazi', phone: '06 77 88 99 00', email: 'omar@email.ma' },
  ]

  const items = [
    { clientId: 'c1', policy: 'AUTO-88421', product: 'Auto', date: '2026-08-12', amount: 2450, premium: 3200, reason: 'Changement d’assureur', status: 'Payé', payMode: 'Espèces', payDate: '2026-08-12', chequeStatus: '', note: '' },
    { clientId: 'c2', policy: 'HAB-10293', product: 'Habitation', date: '2026-07-28', amount: 1800, premium: 2100, reason: 'Vente du bien', status: 'En attente', payMode: 'Chèque', payDate: '2026-07-28', chequeStatus: 'En attente', note: 'Chèque n° 4521' },
    { clientId: 'c3', policy: 'SAN-33011', product: 'Santé', date: '2026-06-15', amount: 3600, premium: 4000, reason: 'Demande client', status: 'Payé', payMode: 'Virement', payDate: '2026-06-16', chequeStatus: '', note: '' },
    { clientId: 'c4', policy: 'AUTO-11902', product: 'Auto', date: '2026-05-03', amount: 1250, premium: 1500, reason: 'Non-paiement', status: 'Payé', payMode: 'Chèque', payDate: '2026-05-10', chequeStatus: 'Encaissé', note: '' },
    { clientId: 'c5', policy: 'PRO-77410', product: 'Professionnel', date: '2026-04-20', amount: 5200, premium: 6100, reason: 'Demande client', status: 'En attente', payMode: 'Virement', payDate: '', chequeStatus: '', note: 'En cours de traitement' },
    { clientId: 'c1', policy: 'VIE-22018', product: 'Vie', date: '2026-03-11', amount: 890, premium: 1200, reason: 'Autre', status: 'Payé', payMode: 'Carte', payDate: '2026-03-11', chequeStatus: '', note: '' },
    { clientId: 'c2', policy: 'AUTO-55100', product: 'Auto', date: '2026-02-08', amount: 2100, premium: 2500, reason: 'Changement d’assureur', status: 'Payé', payMode: 'Espèces', payDate: '2026-02-08', chequeStatus: '', note: '' },
    { clientId: 'c4', policy: 'HAB-88021', product: 'Habitation', date: '2026-01-22', amount: 950, premium: 1100, reason: 'Demande client', status: 'Payé', payMode: 'Espèces', payDate: '2026-01-22', chequeStatus: '', note: '' },
  ].map((r) => ({ id: uid(), createdAt: r.date, ...r }))

  return {
    company: {
      name: 'Assurance La Ville Verte',
      slogan: 'Votre avenir, notre engagement',
      city: 'Casablanca',
      phone: '05 22 00 00 00',
    },
    users: [{ id: 'u1', name: 'Admin', role: 'Gestionnaire' }],
    clients,
    resiliations: items,
  }
}

function localBackup() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data.resiliations || !data.clients) return null
    return data
  } catch {
    return null
  }
}

async function fetchData() {
  const res = await fetch('/api/data')
  if (!res.ok) throw new Error('Serveur indisponible')
  return res.json()
}

async function putData(payload) {
  const res = await fetch('/api/data', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Enregistrement impossible')
  return res.json()
}

function mergeRecords(localList = [], remoteList = []) {
  const byId = new Map()
  ;[...remoteList, ...localList].forEach((item) => {
    if (item?.id) byId.set(item.id, item)
  })
  return [...byId.values()]
}

async function saveStateWithSync(nextState) {
  const remote = await fetchData().catch(() => null)
  const base = remote && (remote.updatedAt || 0) >= (nextState.updatedAt || 0) ? remote : nextState
  const merged = {
    ...base,
    ...nextState,
    company: { ...(base.company || {}), ...(nextState.company || {}) },
    users: nextState.users?.length ? nextState.users : base.users || [],
    clients: mergeRecords(nextState.clients || [], remote?.clients || []),
    resiliations: mergeRecords(nextState.resiliations || [], remote?.resiliations || []),
    updatedAt: Date.now(),
  }
  const saved = await putData(merged)
  return saved
}

export function money(n) {
  const v = Number(n) || 0
  return v.toLocaleString('fr-MA', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' DH'
}

export function formatDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function amountInWords(n) {
  const ones = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize']
  function under100(x) {
    if (x < 17) return ones[x]
    if (x < 20) return 'dix-' + ones[x - 10]
    const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt']
    if (x < 70) {
      const t = Math.floor(x / 10)
      const u = x % 10
      if (!u) return tens[t]
      if (u === 1 && t !== 8) return tens[t] + '-et-un'
      return tens[t] + '-' + ones[u]
    }
    if (x < 80) return 'soixante-' + under100(x - 60)
    if (x === 80) return 'quatre-vingts'
    if (x < 100) return 'quatre-vingt-' + under100(x - 80)
    return String(x)
  }
  function under1000(x) {
    if (x < 100) return under100(x)
    const h = Math.floor(x / 100)
    const r = x % 100
    const head = h === 1 ? 'cent' : ones[h] + ' cent' + (r ? '' : 's')
    return r ? head.replace(/s$/, '') + ' ' + under100(r) : head
  }
  const v = Math.round(Number(n) || 0)
  if (v === 0) return 'zéro dirhams'
  const thousands = Math.floor(v / 1000)
  const rest = v % 1000
  let out = ''
  if (thousands) out += (thousands === 1 ? 'mille' : under1000(thousands) + ' mille')
  if (rest) out += (out ? ' ' : '') + under1000(rest)
  return out.charAt(0).toUpperCase() + out.slice(1) + ' dirhams'
}

export function StoreProvider({ children }) {
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const skipSave = useRef(true)

  useEffect(() => {
    let cancelled = false
    const syncFromServer = async () => {
      try {
        let remote = await fetchData()
        const local = localBackup()
        if ((!remote.resiliations || remote.resiliations.length === 0) && local?.resiliations?.length) {
          remote = await putData({ ...local, updatedAt: Date.now() })
        }
        if (!cancelled) {
          skipSave.current = true
          setData(remote)
          setStatus('ok')
          setError('')
        }
      } catch {
        const local = localBackup()
        const fallback = local || seed()
        if (!cancelled) {
          skipSave.current = true
          setData(fallback)
          setStatus('ok')
          setError('')
        }
      }
    }

    syncFromServer()
    const id = setInterval(syncFromServer, 4000)
    window.addEventListener('focus', syncFromServer)

    return () => {
      cancelled = true
      clearInterval(id)
      window.removeEventListener('focus', syncFromServer)
    }
  }, [])

  async function persistState(nextState) {
    try {
      const saved = await saveStateWithSync(nextState)
      localStorage.setItem(KEY, JSON.stringify(saved))
      setData(saved)
      setError('')
      return saved
    } catch {
      localStorage.setItem(KEY, JSON.stringify(nextState))
      setData(nextState)
      setError('Sauvegarde locale enregistrée. Le serveur est temporairement indisponible.')
      return nextState
    }
  }

  function commit(updater) {
    setData((d) => {
      const next = typeof updater === 'function' ? updater(d) : updater
      return { ...next, updatedAt: Date.now() }
    })
  }

  const api = useMemo(() => {
    const clientById = (id) => data?.clients.find((c) => c.id === id)

    function addClient(payload) {
      const c = { id: uid(), ...payload }
      commit((d) => ({ ...d, clients: [c, ...d.clients] }))
      return c
    }

    async function upsertClient({ name, phone, email }) {
      const current = data || localBackup() || seed()
      const found = current.clients.find(
        (c) => c.name.trim().toLowerCase() === name.trim().toLowerCase() && c.phone.replace(/\s/g, '') === phone.replace(/\s/g, '')
      )
      if (found) return found

      const newClient = { id: uid(), name, phone, email: email || '' }
      const nextData = {
        ...current,
        clients: [newClient, ...current.clients],
        updatedAt: Date.now(),
      }
      await persistState(nextData)
      return newClient
    }

    async function saveResiliation(payload, id, baseState) {
      const current = baseState || data || localBackup() || seed()
      const nextData = id
        ? {
            ...current,
            resiliations: current.resiliations.map((r) => (r.id === id ? { ...r, ...payload } : r)),
            updatedAt: Date.now(),
          }
        : {
            ...current,
            resiliations: [{ id: uid(), createdAt: new Date().toISOString().slice(0, 10), ...payload }, ...current.resiliations],
            updatedAt: Date.now(),
          }

      return persistState(nextData)
    }

    function removeResiliation(id) {
      commit((d) => ({ ...d, resiliations: d.resiliations.filter((r) => r.id !== id) }))
    }

    async function saveClient(payload, id) {
      const base = data || localBackup() || seed()
      const nextData = id
        ? { ...base, clients: base.clients.map((c) => (c.id === id ? { ...c, ...payload } : c)), updatedAt: Date.now() }
        : { ...base, clients: [{ id: uid(), ...payload }, ...base.clients], updatedAt: Date.now() }
      return persistState(nextData)
    }

    async function updateCompany(company) {
      const base = data || localBackup() || seed()
      return persistState({ ...base, company, updatedAt: Date.now() })
    }

    function exportJson() {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `sauvegarde-resiliations-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
    }

    function importJson(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          try {
            const parsed = JSON.parse(reader.result)
            if (!parsed.resiliations || !parsed.clients) throw new Error('Fichier invalide')
            commit(parsed)
            resolve()
          } catch (e) {
            reject(e)
          }
        }
        reader.readAsText(file)
      })
    }

    return {
      data,
      status,
      error,
      retry: () => window.location.reload(),
      clientById,
      addClient,
      upsertClient,
      saveResiliation,
      removeResiliation,
      saveClient,
      updateCompany,
      exportJson,
      importJson,
    }
  }, [data, status, error])

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export function useStore() {
  return useContext(StoreContext)
}
