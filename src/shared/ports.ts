// typical local dev-server range — floated above other ports and highlighted
export const isDevPort = (port: number): boolean => port >= 3000 && port <= 9999

// float rank for list/tray ordering: pinned +1, dev +1 (higher sorts first)
export const portRank = (port: number, pinned: boolean): number =>
  (pinned ? 1 : 0) + (isDevPort(port) ? 1 : 0)
