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
import { localhostUrl, portRank } from '../shared/ports'
import { isKnownTech } from '../shared/tech'
import { PortEntry, Settings } from '../shared/types'
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
    height: 600,
    minWidth: 380,
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
  let ports: PortEntry[] = []
  try {
    ports = (await listListeningPorts()).ports
  } catch {
    // ignore — show an empty list rather than failing the menu
  }

  const MAX = 15
  const isPinned = (p: PortEntry): boolean => settings.pinned.includes(p.port)
  // same order as the UI: shared portRank desc, then uptime (newest first)
  const visible = ports
    .filter((p) => isPinned(p) || (p.port >= settings.portMin && p.port <= settings.portMax))
    .sort(
      (a, b) => portRank(b, settings) - portRank(a, settings) || (b.started ?? 0) - (a.started ?? 0)
    )

  const shown = visible.slice(0, MAX)
  const overflow = visible.length - shown.length

  const portItems: Electron.MenuItemConstructorOptions[] = visible.length
    ? shown.map((p) => ({
        label: `${isPinned(p) ? '📌 ' : ''}:${p.port}  —  ${p.command}`,
        submenu: [
          { label: i18n.t('tray.pid', { pid: p.pid }), enabled: false },
          { type: 'separator' },
          ...(isKnownTech(p.command)
            ? ([
                {
                  label: i18n.t('tray.openBrowser'),
                  click: () => {
                    capture('open_browser', { source: 'tray' })
                    shell.openExternal(localhostUrl(p.port))
                  }
                },
                { type: 'separator' }
              ] as Electron.MenuItemConstructorOptions[])
            : []),
          {
            label: i18n.t('tray.kill'),
            click: () => {
              capture('kill', { source: 'tray' })
              killPid(p.pid)
              notifyPortsChanged()
            }
          }
        ]
      }))
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
  ipcMain.handle(IPC.ports.list, () => listListeningPorts())

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
