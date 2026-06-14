// single source of truth for IPC channel names — shared by main + preload
export const IPC = {
  ports: {
    list: 'ports:list',
    kill: 'ports:kill',
    alive: 'ports:alive',
    changed: 'ports:changed'
  },
  settings: {
    get: 'settings:get',
    set: 'settings:set'
  },
  app: {
    version: 'app:version',
    open: 'app:open',
    quit: 'app:quit'
  },
  popup: {
    shown: 'popup:shown'
  }
} as const
