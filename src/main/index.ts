import { is } from '@electron-toolkit/utils'
import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Menu,
  nativeImage,
  nativeTheme,
  screen,
  shell,
  Tray
} from 'electron'
import { join } from 'path'
import trayIcon from '../../resources/trayTemplate_black.png?asset'
import { Settings } from '../shared/types'
import { killPort, listListeningPorts } from './ports'
import { applyLoginItem, getSettings, setSettings } from './settings'

let tray: Tray | null = null
let popup: BrowserWindow | null = null

function createPopup(): BrowserWindow {
  const win = new BrowserWindow({
    width: 420,
    height: 400,
    show: false,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    // paint the window in the theme bg so there's no white flash before React mounts
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#0b0f19' : '#f1f3f8',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (!is.dev) {
    win.on('blur', () => {
      if (!win.webContents.isDevToolsOpened()) win.hide()
    })
  } else {
    win.webContents.openDevTools({ mode: 'detach' })
  }

  // hide on Escape
  win.webContents.on('before-input-event', (_e, input) => {
    if (input.type === 'keyDown' && input.key === 'Escape') win.hide()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

function positionPopup(win: BrowserWindow, b: Electron.Rectangle): void {
  const { width, height } = win.getBounds()
  const wa = screen.getDisplayNearestPoint({ x: b.x, y: b.y }).workArea

  let x = Math.round(b.x + b.width / 2 - width / 2)
  const y = process.platform === 'darwin' ? b.y + b.height + 4 : b.y - height - 4

  x = Math.max(wa.x, Math.min(x, wa.x + wa.width - width))
  win.setPosition(x, Math.round(y), false)
}

function toggle(): void {
  if (!popup) popup = createPopup()
  if (popup.isVisible()) {
    popup.hide()
    return
  }
  positionPopup(popup, tray!.getBounds())
  popup.show()
  popup.focus()
  popup.webContents.send('popup:shown')
}

app.whenReady().then(() => {
  ipcMain.handle('ports:list', () => listListeningPorts())

  ipcMain.handle('ports:kill', killPort)

  ipcMain.handle('app:version', () => app.getVersion())
  ipcMain.handle('settings:get', () => getSettings())
  ipcMain.handle('settings:set', (_e, patch: Partial<Settings>) => setSettings(patch))
  ipcMain.handle('app:open', (_e, url: string) => shell.openExternal(url))

  // reflect persisted login-item pref on launch
  applyLoginItem(getSettings())

  if (process.platform === 'darwin') app.dock?.hide()

  // 22px @1x + 44px @2x reps used natively — no downscale, stays crisp
  const img = nativeImage.createFromPath(trayIcon)

  if (process.platform === 'darwin') img.setTemplateImage(true)

  tray = new Tray(img)

  tray.setToolTip('Port Monitor')
  tray.on('click', toggle)

  // right-click → context menu with Quit
  tray.on('right-click', () => {
    tray!.popUpContextMenu(
      Menu.buildFromTemplate([
        { label: 'Open', click: toggle },
        { type: 'separator' },
        { label: 'Quit Port Monitor', click: () => app.quit() }
      ])
    )
  })

  globalShortcut.register('CommandOrControl+Shift+9', toggle)
  app.on('will-quit', () => globalShortcut.unregisterAll())

  // pre-create the popup hidden so it's already rendered before the first open (no white flash)
  popup = createPopup()
})

ipcMain.on('app:quit', () => app.quit())
