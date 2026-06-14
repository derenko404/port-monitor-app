// Canonical tech detection — shared by main (tray menu) and renderer (icons,
// highlight). Order matters: first match wins. The renderer maps each key to a
// brand icon in src/renderer/src/lib/tech.ts; main only needs the matching.
export const TECH = [
  { key: 'docker', re: /docker|com\.docker/i },
  { key: 'next', re: /next/i },
  { key: 'vite', re: /vite/i },
  { key: 'deno', re: /deno/i },
  { key: 'bun', re: /bun/i },
  { key: 'node', re: /node/i },
  { key: 'python', re: /python|gunicorn|uvicorn|flask|django/i },
  { key: 'postgres', re: /postgres/i },
  { key: 'mysql', re: /mysql|mariadb/i },
  { key: 'redis', re: /redis/i },
  { key: 'mongo', re: /mongo/i },
  { key: 'elastic', re: /elastic/i },
  { key: 'nginx', re: /nginx/i },
  { key: 'ruby', re: /ruby|rails|puma/i },
  { key: 'go', re: /\bgo\b|golang/i },
  { key: 'rust', re: /rust|cargo/i }
] as const

// union of every known key — used to force the renderer to define an icon for each
export type TechKey = (typeof TECH)[number]['key']

export function techKey(command: string): TechKey | null {
  return TECH.find((t) => t.re.test(command))?.key ?? null
}

// true when the command maps to a recognised technology (has a brand icon)
export function isKnownTech(command: string): boolean {
  return TECH.some((t) => t.re.test(command))
}
