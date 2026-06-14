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
import { PortEntry, Settings } from '../shared/types'
import { killPid, listListeningPorts } from './ports'
import { applyLoginItem, getSettings, setSettings } from './settings'

// DSN is a public client key (safe to commit) — only allows sending events
Sentry.init({
  dsn: 'https://d12a2d70cf46dcb3562085398fea5388@o4511563450220544.ingest.de.sentry.io/4511563458019408',
  environment: is.dev ? 'development' : 'production',
  enableLogs: true, // ship console.* as structured logs
  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error'] }),
    Sentry.captureConsoleIntegration({ levels: ['error'] }) // console.error → issues
  ]
})

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
  mainWindow.webContents.send('popup:shown')
}

function toggle(): void {
  if (mainWindow?.isVisible()) mainWindow.hide()
  else showWindow()
}

// tell an open window to re-scan after a port changed from the tray
function notifyPortsChanged(): void {
  mainWindow?.webContents.send('ports:changed')
}

// build the tray menu from the live port list (filtered/sorted like the UI)
async function buildTrayMenu(): Promise<Menu> {
  const settings = getSettings()
  let ports: PortEntry[] = []
  try {
    ports = await listListeningPorts()
  } catch {
    // ignore — show an empty list rather than failing the menu
  }

  const MAX = 15
  const isPinned = (p: PortEntry): boolean => settings.pinned.includes(p.port)
  const visible = ports
    .filter((p) => isPinned(p) || (p.port >= settings.portMin && p.port <= settings.portMax))
    .sort((a, b) => Number(isPinned(b)) - Number(isPinned(a)) || a.port - b.port)

  const shown = visible.slice(0, MAX)
  const overflow = visible.length - shown.length

  const portItems: Electron.MenuItemConstructorOptions[] = visible.length
    ? shown.map((p) => ({
        label: `${isPinned(p) ? '📌 ' : ''}:${p.port}  —  ${p.command}`,
        submenu: [
          { label: `PID ${p.pid}`, enabled: false },
          { type: 'separator' },
          {
            label: '🛑 Kill',
            click: () => {
              killPid(p.pid)
              notifyPortsChanged()
            }
          }
        ]
      }))
    : [{ label: 'No listening ports', enabled: false }]

  if (overflow > 0) {
    portItems.push({ label: `+ ${overflow} more…`, click: toggle })
  }

  return Menu.buildFromTemplate([
    { label: 'Open Port Monitor', click: toggle },
    { type: 'separator' },
    {
      label: visible.length ? `Listening ports (${visible.length})` : 'Listening ports',
      enabled: false
    },
    ...portItems,
    { type: 'separator' },
    {
      label: 'Quit Port Monitor',
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])
}

app.whenReady().then(() => {
  ipcMain.handle('ports:list', () => listListeningPorts())

  ipcMain.handle('ports:kill', (_e, pid: number) => killPid(pid))

  ipcMain.handle('app:version', () => app.getVersion())
  ipcMain.handle('settings:get', () => getSettings())
  ipcMain.handle('settings:set', (_e, patch: Partial<Settings>) => setSettings(patch))
  ipcMain.handle('app:open', (_e, url: string) => shell.openExternal(url))

  // reflect persisted login-item pref on launch
  applyLoginItem(getSettings())

  // 22px @1x + 44px @2x reps used natively — no downscale, stays crisp
  const img = nativeImage.createFromPath(trayIcon)

  if (process.platform === 'darwin') img.setTemplateImage(true)

  tray = new Tray(img)

  tray.setToolTip('Port Monitor')
  tray.on('click', toggle)

  // right-click → live port list + actions
  tray.on('right-click', async () => {
    tray!.popUpContextMenu(await buildTrayMenu())
  })

  app.dock?.setIcon(nativeImage.createFromPath(appIcon))

  globalShortcut.register('CommandOrControl+Shift+9', toggle)
  app.on('will-quit', () => globalShortcut.unregisterAll())

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

ipcMain.on('app:quit', () => {
  isQuitting = true
  app.quit()
})
