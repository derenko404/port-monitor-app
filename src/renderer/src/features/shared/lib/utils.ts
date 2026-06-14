import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function sleep(duration: number): Promise<void> {
  return new Promise((r) => setTimeout(r, duration))
}

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  wait: number
): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout> | undefined
  return (...args: Args): void => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
}

export function fmtInterval(s: number): string {
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return rem ? `${m}m ${rem}s` : `${m}m`
}

export function fmtTimeAgo(started: number | null): string {
  if (!started) return '—'
  const s = Math.max(0, Math.floor((Date.now() - started) / 1000))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}
