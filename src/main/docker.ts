import { request } from 'node:http'

// macOS Docker Desktop symlinks /var/run/docker.sock to the user socket; both work.
const SOCKET = '/var/run/docker.sock'
const RETRIES = 3
const TIMEOUT_MS = 1500

export interface DockerService {
  id: string // container id — used to stop it
  image: string
  name: string // container name, leading slash stripped
}

interface ContainerPort {
  PublicPort?: number
  PrivatePort?: number
  Type?: string
}

interface Container {
  Id?: string
  Names?: string[]
  Image?: string
  Ports?: ContainerPort[]
}

// GET /containers/json over the unix socket. Rejects on any transport/parse error.
function fetchContainers(): Promise<Container[]> {
  return new Promise((resolve, reject) => {
    const req = request(
      { socketPath: SOCKET, path: '/containers/json', method: 'GET', timeout: TIMEOUT_MS },
      (res) => {
        let body = ''
        res.setEncoding('utf8')
        res.on('data', (chunk) => (body += chunk))
        res.on('end', () => {
          if (res.statusCode !== 200) {
            reject(new Error(`docker socket status ${res.statusCode}`))
            return
          }
          try {
            resolve(JSON.parse(body) as Container[])
          } catch (err) {
            reject(err as Error)
          }
        })
      }
    )
    req.on('timeout', () => req.destroy(new Error('docker socket timeout')))
    req.on('error', reject)
    req.end()
  })
}

// POST /containers/{id}/stop — graceful stop (SIGTERM, then SIGKILL after `t`s).
// 204 = stopped, 304 = already stopped (both fine).
export function stopContainer(
  id: string,
  timeoutSec = 5
): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    const req = request(
      {
        socketPath: SOCKET,
        path: `/containers/${encodeURIComponent(id)}/stop?t=${timeoutSec}`,
        method: 'POST',
        timeout: (timeoutSec + 5) * 1000
      },
      (res) => {
        res.resume() // drain
        res.on('end', () => {
          const code = res.statusCode ?? 0
          if (code === 204 || code === 304) resolve({ ok: true })
          else resolve({ ok: false, error: `docker stop status ${code}` })
        })
      }
    )
    req.on('timeout', () => req.destroy(new Error('docker stop timeout')))
    req.on('error', (err) => resolve({ ok: false, error: err.message }))
    req.end()
  })
}

// Map every published host port to the container behind it. Returns an empty map
// when Docker isn't running or the socket is unreachable — callers treat that as
// "no docker info", never an error. Retries up to RETRIES times on failure.
export async function dockerServicesByPort(): Promise<Map<number, DockerService>> {
  const map = new Map<number, DockerService>()

  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const containers = await fetchContainers()
      for (const c of containers) {
        const id = c.Id ?? ''
        const image = c.Image ?? ''
        const name = (c.Names?.[0] ?? '').replace(/^\//, '')
        for (const p of c.Ports ?? []) {
          if (p.PublicPort) map.set(p.PublicPort, { id, image, name })
        }
      }
      return map
    } catch (err) {
      // last attempt failed → give up quietly; Docker may simply be down
      if (attempt === RETRIES) {
        console.error('docker socket query failed:', (err as Error).message)
        return map
      }
    }
  }

  return map
}
