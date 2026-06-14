import { is } from '@electron-toolkit/utils'
import * as Sentry from '@sentry/electron/main'
import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Menu,
  nativeImage,
  nativeTheme,
  shell,
  Tray
} from 'electron'
import { join } from 'path'
import appIcon from '../../build/icon-dock.png?asset'
import trayIcon from '../../resources/trayTemplate_black.png?asset'
import { AnalyticsEvent, AnalyticsProps } from '../shared/analytics'
import { IPC } from '../shared/ipc'
import { groupRank, localhostUrl, toRows } from '../shared/ports'
import { isKnownTech } from '../shared/tech'
import { PortEntry, PortGroup, Settings } from '../shared/types'
import { capture, isFreshInstall, shutdownAnalytics } from './analytics'
import i18n from './i18n'
import { isPidAlive, killPid, listListeningPorts } from './ports'
import { applyLoginItem, getSettings, setSettings } from './settings'

// shipped app only — never from dev or local preview. DSN is a public client key.
if (app.isPackaged) {
  Sentry.init({
    dsn: import.meta.env.MAIN_VITE_SENTRY_DSN,
    enableLogs: true,
    integrations: [
      Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
      Sentry.captureConsoleIntegration({ levels: ['error'] }) // console.error → issues
    ]
  })
}

let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null
let isQuitting = false

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 460,
    height: 500,
    minWidth: 460,
    minHeight: 420,
    show: false,
    movable: true,
    fullscreenable: false,
    maximizable: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 12, y: 14 },
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#0b0f19' : '#f1f3f8',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  win.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()
      win.hide()
    }
  })

  if (is.dev) win.webContents.openDevTools({ mode: 'detach' })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

function showWindow(): void {
  if (!mainWindow) mainWindow = createWindow()
  mainWindow.show()
  mainWindow.focus()
  mainWindow.webContents.send(IPC.popup.shown)
}

function toggle(): void {
  if (mainWindow?.isVisible()) mainWindow.hide()
  else showWindow()
}

// tell an open window to re-scan after a port changed from the tray
function notifyPortsChanged(): void {
  mainWindow?.webContents.send(IPC.ports.changed)
}

// build the tray menu from the live port list (filtered/sorted like the UI)
async function buildTrayMenu(): Promise<Menu> {
  const settings = getSettings()
  let groups: PortGroup[] = []
  try {
    const result = await listListeningPorts(settings.resolveContainersNames)
    groups = result.groups
  } catch {
    // ignore — show an empty list rather than failing the menu
  }

  const MAX = 15
  const isPinned = (p: PortEntry): boolean => settings.pinned.includes(p.port)

  const inRange = (p: PortEntry): boolean =>
    isPinned(p) || (p.port >= settings.portMin && p.port <= settings.portMax)

  // keep each group's in-range ports; drop empty groups (mirrors the UI)
  const visible = groups
    .map((g) => {
      const kept = g.ports.filter(inRange)
      return kept.length ? { ...g, ports: kept } : null
    })
    .filter((g): g is PortGroup => g !== null)

  // same rank order as the UI, then uptime (newest first)
  const rows = toRows(visible, settings.grouping).sort(
    (a, b) => groupRank(b, settings) - groupRank(a, settings) || (b.started ?? 0) - (a.started ?? 0)
  )

  // `name` labels the port with its service (e.g. a docker container) when it
  // differs from the row's command; omitted otherwise.
  const openItem = (p: PortEntry, name?: string): Electron.MenuItemConstructorOptions => ({
    label: name
      ? i18n.t('tray.openNamedPort', { name, port: p.port })
      : i18n.t('tray.openPort', { port: p.port }),
    click: () => {
      capture('open_browser', { source: 'tray' })
      shell.openExternal(localhostUrl(p.port))
    }
  })

  const killItem = (pid: number): Electron.MenuItemConstructorOptions => ({
    label: i18n.t('tray.kill'),
    click: () => {
      capture('kill', { source: 'tray' })
      killPid(pid)
      notifyPortsChanged()
    }
  })

  const rowItem = (g: PortGroup): Electron.MenuItemConstructorOptions => {
    const { ports } = g
    const single = ports.length === 1
    const pin = ports.some(isPinned) ? '📌 ' : ''
    const known = isKnownTech(g.command)
    // known → one open action per port; unknown multi-port → list ports (disabled);
    // unknown single-port → nothing (the port already shows in the label)
    const named = settings.resolveContainersNames
    const portRows: Electron.MenuItemConstructorOptions[] = known
      ? ports.map((p) => openItem(p, named && p.command !== g.command ? p.command : undefined))
      : single
        ? []
        : ports.map((p) => ({ label: `:${p.port}`, enabled: false }))
    return {
      label: single ? `${pin}:${ports[0].port}  —  ${g.command}` : `${pin}${g.command}`,
      submenu: [
        { label: i18n.t('tray.pid', { pid: g.pid }), enabled: false },
        { type: 'separator' },
        ...(portRows.length ? [...portRows, { type: 'separator' as const }] : []),
        killItem(g.pid)
      ]
    }
  }

  const shown = rows.slice(0, MAX)
  const overflow = rows.length - shown.length

  const portItems: Electron.MenuItemConstructorOptions[] = rows.length
    ? shown.map(rowItem)
    : [{ label: i18n.t('tray.noPorts'), enabled: false }]

  if (overflow > 0) {
    portItems.push({ label: i18n.t('tray.more', { count: overflow }), click: toggle })
  }

  return Menu.buildFromTemplate([
    { label: i18n.t('tray.open'), click: toggle },
    { type: 'separator' },
    {
      label: visible.length
        ? i18n.t('tray.listeningPortsCount', { count: visible.length })
        : i18n.t('tray.listeningPorts'),
      enabled: false
    },
    ...portItems,
    { type: 'separator' },
    {
      label: i18n.t('tray.quit'),
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])
}

// install (first launch only) + open; PostHog derives retention from app_open
function trackLaunch(): void {
  if (isFreshInstall()) capture('app_install')
  capture('app_open')
}

app.whenReady().then(() => {
  ipcMain.handle(IPC.ports.list, () => listListeningPorts(getSettings().resolveContainersNames))

  ipcMain.handle(IPC.ports.kill, (_e, pid: number, signal?: NodeJS.Signals) => killPid(pid, signal))
  ipcMain.handle(IPC.ports.alive, (_e, pid: number) => isPidAlive(pid))

  ipcMain.handle(IPC.app.version, () => app.getVersion())
  ipcMain.handle(IPC.settings.get, () => getSettings())
  ipcMain.handle(IPC.settings.set, (_e, patch: Partial<Settings>) => setSettings(patch))
  ipcMain.handle(IPC.app.open, (_e, url: string) => shell.openExternal(url))

  // renderer-side events (search, pin, kill from list, settings, …)
  ipcMain.on(IPC.analytics.capture, (_e, event: AnalyticsEvent, props?: AnalyticsProps) =>
    capture(event, props)
  )

  trackLaunch()

  // reflect persisted login-item pref on launch
  applyLoginItem(getSettings())

  // 22px @1x + 44px @2x reps used natively — no downscale, stays crisp
  const img = nativeImage.createFromPath(trayIcon)

  if (process.platform === 'darwin') img.setTemplateImage(true)

  tray = new Tray(img)

  tray.setToolTip(i18n.t('tray.tooltip'))
  tray.on('click', toggle)

  // right-click → live port list + actions
  tray.on('right-click', async () => {
    tray!.popUpContextMenu(await buildTrayMenu())
  })

  app.dock?.setIcon(nativeImage.createFromPath(appIcon))

  globalShortcut.register('CommandOrControl+Shift+9', toggle)
  app.on('will-quit', () => {
    globalShortcut.unregisterAll()
    shutdownAnalytics() // best-effort flush of any buffered events
  })

  // pre-create the popup hidden so it's already rendered before the first open (no white flash)
  mainWindow = createWindow()
  showWindow()

  app.on('activate', showWindow)
  app.on('before-quit', () => {
    isQuitting = true
  })

  app.on('window-all-closed', () => {
    // intentionally empty: app lives in the tray
  })
})

ipcMain.on(IPC.app.quit, () => {
  isQuitting = true
  app.quit()
})
