# Installing Port Monitor

Port Monitor is **not code-signed or notarized** — there's no paid Apple Developer
account ($99/yr) behind it. The app is safe; macOS just shows extra warnings for
apps that aren't signed by a registered developer. You bypass them once.

---

## Which file do I download?

From [Releases](https://github.com/derenko404/port-monitor-app/releases), grab the
`.dmg` matching your Mac:

| Mac | File |
|-----|------|
| Apple Silicon (M1/M2/M3/M4) | `port-monitor-<version>-arm64.dmg` |
| Intel | `port-monitor-<version>-x64.dmg` |

Not sure?  → Apple menu →  About This Mac → "Chip" says Apple, or "Processor" says Intel.

---

## Install + first launch

1. Open the `.dmg` and drag **Port Monitor** into **Applications**.
2. Launch it. macOS will say something like
   *"Port Monitor can't be opened because Apple cannot check it for malicious software"*
   or *"…is damaged"*. This is expected for unsigned apps.
3. Bypass it **once**:

   **Option A — right-click open**
   - In Applications, **right-click** (or Control-click) **Port Monitor** → **Open**
   - In the dialog, click **Open** again
   - macOS remembers the choice; normal double-click works from then on

   **Option B — System Settings**
   - Try to open it once (it gets blocked)
   - System Settings → **Privacy & Security** → scroll down → **Open Anyway**

   **Option C — Terminal** (clears the quarantine flag)
   ```bash
   xattr -dr com.apple.quarantine "/Applications/Port Monitor.app"
   ```

After that it launches like any other app — icon appears in the **menubar** (top
right), not the Dock.

---

## Homebrew

```bash
brew tap derenko404/tap
brew install --cask port-monitor
```

Because the app is unsigned, Homebrew may also quarantine it. If the first launch
is blocked, use one of the bypass steps above, or install with:

```bash
brew install --cask --no-quarantine port-monitor
```

Update:

```bash
brew upgrade --cask port-monitor
```

---

## Updating

- **Homebrew:** `brew upgrade --cask port-monitor`
- **Manual:** download the newer `.dmg` and replace the app in Applications

(Automatic in-app updates are not enabled — they require a signed/notarized build.)

---

## Uninstall

- Quit from the menubar (right-click tray icon → **Quit Port Monitor**)
- Delete `/Applications/Port Monitor.app`
- Settings are stored at
  `~/Library/Application Support/port-monitor/settings.json` — remove it to wipe config

---

## Why the warnings?

macOS Gatekeeper trusts apps signed with an Apple Developer certificate and run
through Apple's notarization service. That costs $99/year. This is a free hobby
project, so it ships unsigned. The bypass tells macOS "I trust this app" — you only
do it once per install.
