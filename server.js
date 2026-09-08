import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 3000
const BASE = '/assurance-la-ville-verte'
const DATA_DIR = path.join(__dirname, 'data')
const DATA_PATH = path.join(DATA_DIR, 'agence.json')
const DIST = path.join(__dirname, 'dist')

function emptyData() {
  return {
    company: {
      name: 'Assurance La Ville Verte',
      slogan: 'Votre avenir, notre engagement',
      city: 'Casablanca',
      phone: '05 22 00 00 00',
    },
    users: [{ id: 'u1', name: 'Admin', role: 'Gestionnaire' }],
    clients: [],
    resiliations: [],
    updatedAt: Date.now(),
  }
}

function loadData() {
  try {
    if (!fs.existsSync(DATA_PATH)) return emptyData()
    const parsed = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
    if (!parsed.clients || !parsed.resiliations) return emptyData()
    return parsed
  } catch {
    return emptyData()
  }
}

function saveData(data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8')
}

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
if (!fs.existsSync(DATA_PATH)) saveData(emptyData())

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function send(res, code, body, headers = {}) {
  const payload = typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body)
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', ...headers })
  res.end(payload)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function serveStatic(req, res) {
  const rawUrl = decodeURIComponent((req.url || '/').split('?')[0])
  let urlPath = rawUrl
  if (urlPath.startsWith(BASE + '/') || urlPath === BASE) {
    urlPath = urlPath.slice(BASE.length) || '/'
  } else if (urlPath === '/') {
    res.writeHead(302, { Location: BASE + '/' })
    res.end()
    return
  } else {
    res.writeHead(302, { Location: BASE + urlPath })
    res.end()
    return
  }
  let file = path.join(DIST, urlPath === '/' ? 'index.html' : urlPath)
  if (!file.startsWith(DIST)) {
    send(res, 403, { error: 'interdit' })
    return
  }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(DIST, 'index.html')
  }
  if (!fs.existsSync(file)) {
    send(res, 404, { error: 'Lancez npm run build sur le PC serveur.' })
    return
  }
  const ext = path.extname(file).toLowerCase()
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
}

const server = http.createServer(async (req, res) => {
  const url = (req.url || '/').split('?')[0]

  if (url === '/api/data' && req.method === 'GET') {
    send(res, 200, loadData())
    return
  }

  if (url === '/api/data' && req.method === 'PUT') {
    try {
      const parsed = JSON.parse(await readBody(req))
      if (!parsed.clients || !parsed.resiliations) {
        send(res, 400, { error: 'Données invalides' })
        return
      }
      parsed.updatedAt = Date.now()
      saveData(parsed)
      send(res, 200, parsed)
    } catch {
      send(res, 400, { error: 'JSON invalide' })
    }
    return
  }

  if (url.startsWith('/api/')) {
    send(res, 404, { error: 'API inconnue' })
    return
  }

  serveStatic(req, res)
})

function lanUrls() {
  const nets = os.networkInterfaces()
  const out = []
  for (const list of Object.values(nets)) {
    for (const n of list || []) {
        if ((n.family === 'IPv4' || n.family === 4) && !n.internal) out.push(`http://${n.address}:${PORT}`)
    }
  }
  return out
}

server.listen(PORT, '0.0.0.0', () => {
  console.log('')
  console.log('  Serveur agence — La Ville Verte')
  console.log(`  Sur ce PC :     http://localhost:${PORT}`)
  const urls = lanUrls()
  if (urls.length) {
    console.log('  Autres PCs :')
    urls.forEach((u) => console.log(`                 ${u}`))
  }
  console.log('')
  console.log('  Laissez cette fenêtre ouverte.')
  console.log('')
})
