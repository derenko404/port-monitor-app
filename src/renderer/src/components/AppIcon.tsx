import { createElement } from 'react'
import { IconType } from 'react-icons'
import {
  SiBun,
  SiDeno,
  SiDocker,
  SiElasticsearch,
  SiGo,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNginx,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiRedis,
  SiRubyonrails,
  SiRust,
  SiVite
} from 'react-icons/si'
import { Terminal } from 'lucide-react'

// [regex, icon, brandHex?] — first match wins. No hex → inherits muted
// (used for black/white brands that vanish on dark, e.g. Next/Deno/Bun/Rust).
const RULES: [RegExp, IconType, string?][] = [
  [/docker|com\.docker/i, SiDocker, '#2496ED'],
  [/next/i, SiNextdotjs],
  [/vite/i, SiVite, '#646CFF'],
  [/deno/i, SiDeno],
  [/bun/i, SiBun],
  [/node/i, SiNodedotjs, '#5FA04E'],
  [/python|gunicorn|uvicorn|flask|django/i, SiPython, '#3776AB'],
  [/postgres/i, SiPostgresql, '#4169E1'],
  [/mysql|mariadb/i, SiMysql, '#4479A1'],
  [/redis/i, SiRedis, '#FF4438'],
  [/mongo/i, SiMongodb, '#47A248'],
  [/elastic/i, SiElasticsearch, '#FEC514'],
  [/nginx/i, SiNginx, '#009639'],
  [/ruby|rails|puma/i, SiRubyonrails, '#D30001'],
  [/\bgo\b|golang/i, SiGo, '#00ADD8'],
  [/rust|cargo/i, SiRust]
]

function iconFor(command: string): [IconType, string?] {
  for (const [re, Icon, hex] of RULES) if (re.test(command)) return [Icon, hex]
  return [Terminal, undefined]
}

interface AppIconProps {
  command: string
  className?: string
}

function AppIcon({ command, className }: AppIconProps): React.JSX.Element {
  const [Icon, hex] = iconFor(command)
  return createElement(Icon, {
    className: className ?? 'size-4',
    style: hex ? { color: hex } : undefined
  })
}

export default AppIcon
