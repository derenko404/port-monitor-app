// Canonical tech detection — shared by main (tray menu) and renderer (icons,
// highlight). Order matters: first match wins. The renderer maps each key to a
// brand icon in src/renderer/src/lib/tech.ts; main only needs the matching.
export const TECH = [
  // container/orchestration runtimes (most specific first)
  { key: 'docker', re: /docker|com\.docker/i },
  { key: 'podman', re: /podman/i },
  { key: 'kubernetes', re: /kube|k8s/i },
  // node-based frameworks — must precede the generic `node` match
  { key: 'next', re: /next/i },
  { key: 'nuxt', re: /nuxt/i },
  { key: 'nest', re: /nest/i },
  { key: 'vite', re: /vite/i },
  { key: 'svelte', re: /svelte/i },
  { key: 'astro', re: /astro/i },
  { key: 'angular', re: /angular/i },
  { key: 'deno', re: /deno/i },
  { key: 'bun', re: /bun/i },
  { key: 'node', re: /node/i },
  // languages / runtimes
  { key: 'python', re: /python|gunicorn|uvicorn|flask|django/i },
  { key: 'ruby', re: /ruby|rails|puma/i },
  { key: 'php', re: /\bphp\b|php-fpm/i },
  { key: 'java', re: /\bjava\b/i },
  { key: 'dotnet', re: /dotnet/i },
  { key: 'go', re: /\bgo\b|golang/i },
  { key: 'rust', re: /rust|cargo/i },
  // datastores
  { key: 'postgres', re: /postgres/i },
  { key: 'mysql', re: /mysql|mariadb/i },
  { key: 'cockroach', re: /cockroach/i },
  { key: 'redis', re: /redis/i },
  { key: 'mongo', re: /mongo/i },
  { key: 'cassandra', re: /cassandra/i },
  { key: 'clickhouse', re: /clickhouse/i },
  { key: 'influx', re: /influx/i },
  { key: 'minio', re: /minio/i },
  { key: 'supabase', re: /supabase/i },
  // search / observability
  { key: 'elastic', re: /elastic/i },
  { key: 'kibana', re: /kibana/i },
  { key: 'grafana', re: /grafana/i },
  { key: 'prometheus', re: /prometheus/i },
  // messaging
  { key: 'rabbitmq', re: /rabbitmq|rabbit/i },
  { key: 'kafka', re: /kafka/i },
  { key: 'nats', re: /\bnats\b/i },
  // web servers / proxies / infra
  { key: 'nginx', re: /nginx/i },
  { key: 'apache', re: /httpd|apache/i },
  { key: 'caddy', re: /caddy/i },
  { key: 'traefik', re: /traefik/i },
  { key: 'kong', re: /\bkong\b/i },
  { key: 'consul', re: /consul/i },
  { key: 'vault', re: /vault/i }
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
