import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { PortEntry } from '../shared/types'

const execFileAsync = promisify(execFile)

export async function listListeningPorts(): Promise<PortEntry[]> {
  // -F machine format: one field per line, prefixed by type char.
  // c=command, p=pid, n=name. p/c apply to all following n lines.
  const { stdout } = await execFileAsync('lsof', ['-nP', '-iTCP', '-sTCP:LISTEN', '-FcnpP'])

  const entries: PortEntry[] = []
  let command = ''
  let pid = 0
  let protocol = ''

  for (const line of stdout.split('\n')) {
    const tag = line[0]
    const val = line.slice(1)
    if (tag === 'p') {
      pid = Number(val)
    } else if (tag === 'c') {
      command = val
    } else if (tag === 'P') {
      protocol = val // TCP / UDP
    } else if (tag === 'n') {
      // val like "*:3000", "127.0.0.1:8080", "[::1]:5000"
      const m = val.match(/:(\d+)$/)
      if (m) {
        entries.push({
          command,
          pid,
          port: Number(m[1]),
          address: val.replace(/:(\d+)$/, ''),
          protocol,
          started: null
        })
      }
    }
  }

  const seen = new Set<string>()
  const deduped = entries.filter((e) => {
    const key = `${e.pid}:${e.port}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  await attachStartTimes(deduped)
  return deduped
}

// Enrich entries with process start time via `ps`. lsof can't give this.
async function attachStartTimes(entries: PortEntry[]): Promise<void> {
  const pids = [...new Set(entries.map((e) => e.pid))]
  if (!pids.length) return

  // lstart = full start datetime, e.g. "Sat Jun 14 00:31:53 2026"
  const { stdout } = await execFileAsync('ps', ['-o', 'pid=,lstart=', '-p', pids.join(',')])

  const startByPid = new Map<number, number>()
  for (const line of stdout.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const sp = trimmed.indexOf(' ')
    const pid = Number(trimmed.slice(0, sp))
    const ms = Date.parse(trimmed.slice(sp + 1).trim())
    if (!Number.isNaN(pid) && !Number.isNaN(ms)) startByPid.set(pid, ms)
  }

  for (const e of entries) e.started = startByPid.get(e.pid) ?? null
}

export function killPid(
  pid: number,
  signal: NodeJS.Signals = 'SIGTERM'
): { ok: boolean; error?: string } {
  try {
    process.kill(pid, signal)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

// signal 0 probes without killing: ESRCH = gone, EPERM = alive (no perms)
export function isPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (err) {
    return (err as NodeJS.ErrnoException).code === 'EPERM'
  }
}
