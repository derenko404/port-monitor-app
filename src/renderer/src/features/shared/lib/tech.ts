import { Terminal } from 'lucide-react'
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
import { TechKey, techKey } from 'src/shared/tech'

export { isKnownTech } from 'src/shared/tech'

// brand icon + color
const ICONS: Record<TechKey, [IconType, string?]> = {
  docker: [SiDocker, '#2496ED'],
  next: [SiNextdotjs],
  vite: [SiVite, '#646CFF'],
  deno: [SiDeno],
  bun: [SiBun],
  node: [SiNodedotjs, '#5FA04E'],
  python: [SiPython, '#3776AB'],
  postgres: [SiPostgresql, '#4169E1'],
  mysql: [SiMysql, '#4479A1'],
  redis: [SiRedis, '#FF4438'],
  mongo: [SiMongodb, '#47A248'],
  elastic: [SiElasticsearch, '#FEC514'],
  nginx: [SiNginx, '#009639'],
  ruby: [SiRubyonrails, '#D30001'],
  go: [SiGo, '#00ADD8'],
  rust: [SiRust]
}

export function iconFor(command: string): [IconType, string?] {
  const key = techKey(command)
  return key ? ICONS[key] : [Terminal, undefined]
}
