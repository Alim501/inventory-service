import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const PORT = process.env.PORT || 3000

const MIME = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.map': 'application/json',
}

const { default: app } = await import('./dist/server/server.js')

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)

  if (url.pathname.match(/\.(js|css|png|jpg|svg|ico|woff|woff2|map)$/)) {
    try {
      const filePath = join(__dirname, 'dist/client', url.pathname)
      const data = await readFile(filePath)
      const ext = extname(url.pathname)
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
      res.end(data)
      return
    } catch {
      res.writeHead(404)
      res.end('Not found')
      return
    }
  }

  const headers = {}
  for (const [k, v] of Object.entries(req.headers)) {
    if (v) headers[k] = Array.isArray(v) ? v.join(', ') : v
  }

  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined

  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body: body?.length ? body : undefined,
  })

  try {
    const response = await app.fetch(request)
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()))
    const buf = await response.arrayBuffer()
    res.end(Buffer.from(buf))
  } catch (err) {
    console.error(err)
    res.writeHead(500)
    res.end('Internal Server Error')
  }
})

server.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`)
})
